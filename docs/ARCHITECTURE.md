# Architecture

## Purpose

Describe how StyleAI is structured so another engineer can extend it without reverse-engineering tribal knowledge.

## Owner-approved corrections (2026-08-14)

These override earlier Phase 0 wording where they conflict:

1. **eBay is the first product adapter, not the retailer strategy.** Domain models, outfit engine, ranking, and product UI depend only on normalized `Product` / `ProductProvider`. Broad retailer coverage remains the long-term requirement.
2. **Domain and application services are host-agnostic.** Expo API Routes are the initial HTTP adapter. Moving the API host must not require rewriting domain logic.
3. **OpenAI is the initial AI adapter.** `gpt-4.1-mini` is the first candidate model, not a permanent commitment. Costs are measured in the AI/usage ledger, not assumed.
4. **Supabase Free for development.** Do not auto-upgrade. Idle pause is not a reason to upgrade during development.
5. **Entitlements ship in foundation.** Live RevenueCat/Stripe payments stay off until explicit approval.
6. **First-party analytics from day one.** Funnel events are defined in `@styleai/core`.
7. **Use what the user already owns.** Product search fills genuine required-category gaps. Affiliate payout is never a ranking signal.

## Decision: one universal app

Expo Router is a file-based router for Android, iOS, and web from one tree.

**Chosen:** `apps/app` as the only application (Expo SDK 57).

**Rejected:** `apps/mobile` + `apps/web`. That would duplicate routes, design, and product flows.

Platform-specific code is limited to camera vs file input, StoreKit / Play Billing vs web checkout, safe area / keyboard, and share / linking.

## Decision: modular monolith, host-agnostic core

V1 is one product with two runtimes:

- Universal Expo client
- An application API (initially Expo Router API routes)

Postgres, Auth, and Storage are Supabase. There are no microservices, extra databases, or event buses.

**The HTTP server is an adapter.** Business rules live in `@styleai/core` and must be importable from Node tests without Expo.

```
Client (Expo UI)
  → Application API          HTTP adapter (Expo API Routes today; Node/other later)
    → Application services   entitlements, usage, analytics, outfit orchestration
      → Domain               scoring, filtering, gap detection, ranking
      → Provider interfaces  Vision, Reasoning, Product, Billing, Auth
        → Providers          OpenAI, eBay, future retailers, RevenueCat, Stripe, …
```

```
packages/core               domain + application services + provider interfaces
packages/ui                 design tokens and reusable UI
apps/app/src/server         composition root (wires adapters); API routes only
apps/app/src/adapters       host-agnostic provider implementations used by the composition root
apps/app/app/api            thin HTTP handlers: parse, authn, call a service, respond
```

UI must not contain prompts, ranking, RLS, entitlements, or price math.

`packages/core` must not import React Native, Expo, OpenAI, or eBay SDKs.

`apps/app/src/server` must not be imported from UI routes. ESLint `no-restricted-imports` enforces this.

## Repository layout

```
/
  apps/app/                     # Expo SDK 57 + Expo Router
    src/app/                    # file-based routes + HTTP adapters under src/app/api
    src/
      client/                   # supabase browser/native client, session
      features/                 # screen composition only
      adapters/                 # OpenAI/eBay/etc. implementations (later phases)
      server/                   # composition root for API routes
  packages/
    core/                       # types, zod, domain, application, interfaces
    ui/                         # tokens + primitives
  supabase/
    migrations/
  docs/
  .github/workflows/ci.yml
```

## Provider interfaces (`packages/core`)

```ts
VisionProvider              // clothing / closet vision — OpenAI is the first impl
ReasoningProvider           // structured JSON reasoning — OpenAI is the first impl
ProductProvider             // search/get/normalize — eBay is the first impl
ProductProviderRegistry     // fans out to N providers; engine never names a retailer
BillingProvider             // purchase/restore/webhook — RevenueCat/Stripe later
AuthProvider                // sign-up/in/out/reset/OAuth — Supabase is the first impl
VirtualTryOnProvider        // unimplemented; must not be required for V1
```

Application services (not providers): `EntitlementService`, `UsageMeter`, `AnalyticsService`.

Configuration for models, timeouts, and prompt versions lives in one module. Model IDs are env/config, not hardcoded into domain functions.

### Product boundary (hard requirement)

Allowed in domain / outfit engine / ranking / product UI:

- `Product`
- `ProductSearchIntent`
- `ProductProvider`
- `ProductProviderRegistry`

Not allowed:

- eBay item IDs as a first-class domain type
- `if (provider === 'ebay')` in scoring, gap detection, ranking, or screens
- Marketplace-only fields leaking into `Outfit`

Adapter-specific mapping (eBay category IDs, OAuth client-credentials, raw Browse payloads) lives only inside the eBay adapter. Raw provider payloads may be stored on the cache row for debugging; the engine never reads them.

The long-term product requirement is **broad retailer coverage**. Additional `ProductProvider` implementations are added by registration, not by rewriting outfit generation.

### AI boundary

`VisionProvider` and `ReasoningProvider` take task + input + schema. The first adapter is OpenAI. The first candidate model is `gpt-4.1-mini`. Both are replaceable.

Do not treat estimated per-operation cost as a guarantee. Persist token counts and estimated USD on `ai_requests` / `usage_events` and measure.

Development spend cap: **$20**. Stop and ask before exceeding it.

## Core product principle: use what the user already owns

Gap detection is a domain function:

- Recommend a purchase only when a **required category for the occasion is missing** from the wardrobe.
- Do not recommend a purchase because it might make a complete outfit slightly better.
- Prefer utilizing owned items even if a bought item would score higher in isolation.
- Affiliate economics must never override relevance.

## Data flow: generate outfit

1. HTTP adapter authenticates JWT and calls `OutfitGenerationService`.
2. Service checks entitlement, rate limit, and usage quota.
3. `ReasoningProvider` parses constraints → Zod `OutfitRequestSchema`.
4. Load wardrobe for that user only; domain filter.
5. Build candidates from owned items; score.
6. `identifyRequiredGaps` — only missing required categories.
7. If gaps exist, `ProductProviderRegistry.search` with a normalized intent.
8. Domain rank (no affiliate signal) → persist outfit, items, usage, AI log, analytics.

Failure of step 7 does not invent products. The response includes owned items and a product-search error.

## Analytics

First-party `analytics_events`. No extra analytics vendor in V1. Event names are an allowlist in `@styleai/core`. See [ANALYTICS.md](./ANALYTICS.md).

## Billing / entitlements (foundation)

`plan_catalog` + `entitlements` + `usage_events` ship in Phase 1.

```
Mobile IAP  → RevenueCat → EntitlementService
Web pay     → Stripe     → EntitlementService
```

RevenueCat and Stripe are future `BillingProvider` implementations. They are not imported by domain code. Live payments are **off** until explicit approval.

Pro access requires a server-side `entitlements` row. The client cannot grant Pro.

## Environments

| Name | Data | AI / products |
| --- | --- | --- |
| `development` | Owner's **Supabase Free** project | Real keys if provided; otherwise fail closed |
| `test` | Fixtures | Injected fakes **only in test runners** |
| `staging` | Separate Supabase project | Real providers, non-prod keys |
| `production` | Supabase (Free until owner approves Pro) | Real providers; fail if secrets missing |

There is no `DEMO_MODE` flag.

Supabase Free may pause after a week of inactivity. That is acceptable during development. Do not treat pause as a reason to upgrade.

## Replacement strategy

| If we replace | Change |
| --- | --- |
| OpenAI → another model vendor | New `VisionProvider` / `ReasoningProvider` adapter; config model IDs |
| `gpt-4.1-mini` → another model | Config only, after quality/cost measurement |
| eBay → additional/other retailers | New `ProductProvider`, register it |
| Expo API Routes → Node/Fly/other | New HTTP adapter; `@styleai/core` unchanged |
| Supabase Auth → other | New `AuthProvider` |
| Future RevenueCat/Stripe | New `BillingProvider`; `entitlements` table stays |

## Failure modes

| Failure | User sees | Operator sees |
| --- | --- | --- |
| Missing env in production | App/API 503 "misconfigured" | Log: which **name** is missing, not the value |
| AI timeout / invalid JSON | Recoverable error + retry | `ai_requests`, error class, duration |
| Product provider down | Outfit from wardrobe + error | Provider id, status |
| No product provider configured | Same — no fake products | `provider_not_configured` |
| RLS / unauthorized | 401/403 | user id, route, request id |

## Security

See [SECURITY.md](./SECURITY.md). Client never receives service-role or AI keys. RLS is not the only check. HTTP adapters re-validate ownership.

## Why SDK 57

`create-expo-app@latest` currently scaffolds **SDK 57** (`expo-template-default@sdk-57`). Phase 1 follows that official default. Routes live under `apps/app/src/app` (Expo Router `src` directory). Bumping SDKs later is not a rewrite.
