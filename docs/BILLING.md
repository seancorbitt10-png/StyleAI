# Billing

## Purpose

StyleAI is a SaaS. Free users get limited usage. Pro users get higher limits. Access is decided on the server.

## Inputs / outputs

`EntitlementService.get(userId) → { planId, status, periodEnd, source }`  
`UsageMeter.record(...)` / `UsageMeter.assertWithinQuota(userId, operation)`

Operations metered in V1:

- `wardrobe_analysis`
- `outfit_generation`
- `product_search`

`image_generation` and `profile_analysis` are reserved names, unused.

## Plan catalog

Plans live in `plan_catalog` (and mirrored env defaults). **Do not hardcode prices in UI components.** Display whatever the catalog and billing provider return.

Conservative V1 shape (limits are starting points, not a pricing promise):

| | Free | Pro |
| --- | --- | --- |
| Wardrobe items | 40 | 250 |
| Outfit generations / month | 8 | 80 |
| Saved outfits | 10 | 100 |
| Product searches / month | 20 | 200 |
| Advanced constraints | basic | yes |

Exact dollar prices are **not finalized**. Economics depend on measured `ai_requests.estimated_cost_usd`. Do not publish a $X/month number until that data exists.

## Sources of truth

Entitlement is StyleAI's record. Purchase rails are adapters:

```
Mobile IAP  → RevenueCat → EntitlementService
Web pay     → Stripe     → EntitlementService
```

`appUserID` = Supabase `user.id` on every platform.

Client `isPro` booleans are display-only. HTTP adapters call `EntitlementService`.

RevenueCat and Stripe must not be imported from domain code. **Do not activate live payments without explicit approval.**

## Foundation vs live money

Phase 1 implements plan catalog, usage metering, and `EntitlementService`.

Later: subscription screen, webhook handlers, restore flow — still behind `BillingProvider`.

Live purchases need A8–A11 in [COST_AND_APPROVALS.md](./COST_AND_APPROVALS.md) **and explicit approval**. Until then, Pro can only appear if a **server-side** entitlement row is written (e.g. founder grant). That is not a client cheat code.

## Lifecycle

Support in the abstraction (wire as providers allow):

- subscribe, cancel, expire, restore
- billing failure
- grace period when the store provides it
- account deletion (see retention)

## Retention

After account deletion:

- Stop access immediately.
- Delete wardrobe, media, outfits, preferences, feedback.
- Keep the minimum billing/audit records required for taxes and dispute (user id hashed or truncated where possible, period, amount, provider transaction id).
- Document this in Privacy Policy.

## Failure modes

| Error | User |
| --- | --- |
| Webhook delay | "Purchases can take a minute to appear. Restore purchases if you already paid." |
| Quota exceeded | "You've reached this month's free generations. Upgrade to Pro." |
| Billing provider down | "We can't verify subscriptions right now." — do not grant Pro |

## Replacement

Swap `BillingProvider`. Keep `entitlements` and `usage_events`.
