# Product data

## Purpose

When an outfit is missing a necessary piece, StyleAI searches **real inventory**, normalizes it, and shows a real URL. It must never invent a product, price, or link.

## Inputs / outputs

`ProductProvider.search(intent) → Product[]`  
`ProductProvider.getProduct(provider, providerProductId) → Product | stale | null`

Normalized `Product`:

- identity: `id`, `provider`, `provider_product_id`
- merchandising: `title`, `brand`, `category`, `subcategory`, `description`, `colors`, `sizes`, `material`, `attributes`
- commerce: `price`, `currency`, `original_price`, `availability`, `retailer`
- media: `image_url` (provider CDN, not user media)
- links: `product_url` (canonical), `affiliate_url` (nullable, separate)
- freshness: `fetched_at`, `expires_at`

Provider payloads are stored (JSONB `raw` or equivalent) so we can debug without destroying source data.

## Registry

```
ProductProviderRegistry
  → ProductProvider          // interface only
      → EbayProductProvider  // first adapter (V1 validation)
      → future retailers / affiliate networks
```

The outfit engine, ranking engine, product UI, and domain `Product` type **must not** import or branch on eBay. Ranking does not take affiliate commission as a signal.

**eBay is not the long-term retailer strategy.** It is the first official, terms-compliant source used to prove real URLs, prices, and images. Broad retailer coverage is the product requirement; new sources are additional `ProductProvider` implementations.

## V1 first adapter: eBay Browse API

eBay-specific category IDs, OAuth client-credentials, and Browse payload mapping belong **only** in the eBay adapter module.

| | |
| --- | --- |
| What it provides | Keyword/category search, price, image, item web URL, condition, seller/retailer |
| Why | Official API, real listings, clothing categories, free developer account |
| Limits | Default ~5,000 calls/day; raise via Application Growth Check |
| Cost | $0 to register |
| Caveat | Marketplace mix of new and used. UI must show condition and retailer. This is not Nordstrom. |
| Terms | Use the official Buy APIs. Do not scrape eBay. |

Sandbox vs production: `EBAY_ENV`. Production app + sandbox catalog is a bug.

## Providers considered and not used in V1

| Provider | Why not now |
| --- | --- |
| Amazon Creators API | Replaces PA-API 5; needs Associates account and sales thresholds |
| Google Merchant API | Manages *your* Merchant Center, not the public web |
| SerpAPI / shopping SERP | Paid; scrapes Google; ToS risk |
| Fake Store / DummyJSON | Fake data — forbidden on the production path |
| Direct retailer scrapers | Fragile and often prohibited |

## Freshness

Default TTL: 24 hours (`PRODUCT_CACHE_TTL_HOURS`).

If `expires_at` is past:

1. Re-fetch `getProduct` when the user opens product detail or an outfit that includes it.
2. If refresh fails, mark `availability = unknown` / `stale = true` and do not present a confident price.
3. Do not recommend stale products in new generations.

Search result pages are not a permanent catalog. Persist products that were actually attached to an outfit.

## Affiliate architecture

- Always store `product_url`.
- Store `affiliate_url` only when a real affiliate program wraps the link.
- UI: if `affiliate_url` is used, show a short disclosure ("We may earn a commission").
- Clicks logged to `affiliate_clicks` with `url_kind`.
- Ranking must not boost higher-commission items. Affiliate fields must not be inputs to the domain ranker.

V1 eBay links are typically `product_url` only unless the owner later joins eBay Partner Network (separate approval).

## Failure modes

| Error | User | Behavior |
| --- | --- | --- |
| Provider timeout/5xx | "We couldn't find products right now." | Outfit still shows owned items |
| Empty search | "No matching products found." | Gap remains visible, no placeholders |
| Missing keys | Same as unavailable | Fail closed |
| Stale cache | Price shown as may be outdated | Refresh in background |

## Security

- Client never calls eBay with client secrets.
- Open outbound URLs with `https` (or `http`) only; reject `javascript:` and app-scheme smuggling.
- Do not log full affiliate tokens if they appear in query strings.

## Replacement

Add a class that implements `ProductProvider` and register it. No outfit-engine, ranking, or product-UI changes that name the new retailer.
