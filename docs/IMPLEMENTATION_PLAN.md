# StyleAI V1 Implementation Plan

**Phase:** 1 — Foundation (in progress)  
**Status:** Phase 0 approved 2026-08-14 with corrections. See [ARCHITECTURE.md](./ARCHITECTURE.md) owner-approved corrections.  
**Date:** 2026-08-14  
**Repository state:** Greenfield at Phase 0; Phase 1 adds the universal app, auth, schema, RLS, interfaces, analytics, entitlements, CI.

This document is the concrete plan required before writing application code. It is not a promise that V1 is complete. V1 is complete only when the acceptance criteria in [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) have been tested against real services.

---

## 1. Repository inspection

| Finding | Detail |
| --- | --- |
| Repo | `github.com/seancorbitt10-png/StyleAI` |
| Branch inspected | `main` at `d89406c` |
| Existing code | None |
| Existing docs | One file: the V1 master specification (moved to `docs/PRODUCT_SPEC.md`) |
| Linked cloud environment | None |
| Secrets present | None (correct) |
| Git | Already initialized; `.gitignore` added in this phase |

This is a new company foundation, not a refactor of an existing app.

---

## 2. Architecture (decision)

**One universal Expo application**, not separate iOS, Android, and web apps.

```
apps/app          Expo Router (iOS + Android + web)
packages/ui       Design tokens and reusable UI
packages/core     Types, Zod schemas, domain logic, provider interfaces
supabase/         SQL migrations, RLS, storage policies
docs/
scripts/
.github/workflows
```

### Why not `/apps/mobile` + `/apps/web`

Expo Router is the official framework for universal React Native apps. File-based routes become screens on native and URLs on web. Duplicate apps would split the same product into two implementations and violate the "do not duplicate business logic" rule.

Platform-specific files (`.native.tsx` / `.web.tsx`) are used only when the platform API actually differs: camera, IAP, safe areas, file picker.

### Why not 12 tiny packages

The specification lists many package names. Creating all of them on day one adds tooling without adding product capability. V1 extracts only what must be shared or must stay off the client:

| Package | Lives there because |
| --- | --- |
| `packages/core` | Domain, application services, Zod schemas, provider **interfaces**. No Expo, OpenAI, or retailer SDKs. Independently testable. |
| `packages/ui` | Tokens and components reusable across screens |
| `apps/app/app/api` | Thin HTTP adapters (Expo API Routes today; replaceable) |
| `apps/app/src/server` | Composition root that wires adapters into core services |
| `apps/app/src/adapters` | Provider implementations (eBay, OpenAI, …) — never imported by domain |

### Runtime split

```
Client (Expo)
  → Application API (HTTP adapter)
    → Application services (entitlements, usage, analytics, outfit)
      → Domain (filter, score, required-category gaps, rank)
      → Provider interfaces
        → Providers (OpenAI, eBay, future retailers, billing)

Never holds secret keys on the client.
HTTP host can change without rewriting domain logic.
```

Supabase is Postgres, Auth, Storage, and RLS — not the application server. Native production builds set Expo Router `origin` to the API host.

---

## 3. Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| App | Expo SDK **57**, Expo Router, TypeScript strict | Current official `create-expo-app` default. API routes via `web.output = server`. |
| Language | TypeScript `strict: true` | Required |
| Validation | Zod | Runtime schemas for AI output, API input, env vars |
| UI | React Native + React Native Web | One component model |
| Design tokens | `packages/ui/tokens` | Spacing, type, radius, elevation, motion — no scattered magic numbers |
| Database | PostgreSQL via Supabase | Auth + RLS + Storage in one product |
| Auth | Supabase Auth (email/password + Google) | Real accounts; abstraction so the provider can change |
| Files | Supabase Storage, private buckets, signed URLs | User photos are sensitive |
| Server | Host-agnostic `@styleai/core` + HTTP adapter (Expo API Routes first) | Domain stays portable |
| AI | `VisionProvider` + `ReasoningProvider`; OpenAI first adapter; `gpt-4.1-mini` first **candidate** | Replaceable models; measure cost in ledger |
| Products | `ProductProvider` + registry; eBay **first adapter only** | Official real listings; not the long-term retailer strategy |
| Billing | `EntitlementService` in foundation; RevenueCat/Stripe later behind `BillingProvider` | No live payments until approved |
| Analytics | First-party `analytics_events` + allowlist | Funnel from day one |
| Tests | Vitest (unit/integration), Playwright (web E2E) | Fast domain tests; one real user-journey E2E |
| Lint/format | ESLint flat config (`eslint-config-expo`) + Prettier | Official Expo tooling |
| CI | GitHub Actions | typecheck, lint, unit tests, web build |
| Web deploy | EAS Hosting (config only until approved) | Native pairing with API routes |
| Mobile deploy | EAS Build (`eas.json`) | Production-capable; no store submission |

Package manager: **pnpm workspaces**, `nodeLinker: hoisted` if isolated installs break a native library. Expo documents first-class monorepo support.

---

## 4. Database architecture

Normalized enough for ownership and RLS. Not every table from the specification.

### V1 tables

| Table | Owner | Purpose |
| --- | --- | --- |
| `profiles` | `id` = `auth.uid()` | Display name, photo, onboarding flag |
| `user_preferences` | `user_id` | Styles, colors, brands, budget, sizes, goals |
| `media_assets` | `user_id` | Storage path, mime, size, purpose, checksum |
| `wardrobe_items` | `user_id` | Structured garment record |
| `outfits` | `user_id` | Saved/generated outfits, constraints, score, reasoning |
| `outfit_items` | via outfit | Wardrobe item or recommended product, role, locked flag |
| `products` | system cache | Normalized catalog rows with freshness timestamps |
| `product_searches` | `user_id` | Query, provider, result ids, created_at |
| `outfit_feedback` | `user_id` | Like / dislike / too expensive / wrong item / etc. |
| `entitlements` | `user_id` | Plan, source, period, server-verified |
| `usage_events` | `user_id` | Metered operations and estimated cost |
| `ai_requests` | `user_id` | Provider, model, tokens, duration, status, prompt version |
| `affiliate_clicks` | `user_id` | Outbound product clicks; affiliate vs direct URL |
| `analytics_events` | `user_id` nullable | Product analytics (no extra vendor in V1) |
| `audit_events` | `user_id` nullable | Account deletion, admin actions |
| `plan_catalog` | system | Central plan configuration (not hardcoded in UI) |

Auth users live in `auth.users` (Supabase). `profiles.id` references `auth.users.id`.

### Explicitly deferred

`product_sources` as a separate table (provider is a column on `products`). `subscriptions` as a mirror of the billing provider — V1 stores `entitlements` and webhook-derived state, not a second billing system of record. `saved_outfits` is a flag/query on `outfits`, not a duplicate table.

### RLS rule

Every user-owned table enables RLS. Policies: a user may select/insert/update/delete only rows where `user_id = auth.uid()` (or `id = auth.uid()` for `profiles`). Cached `products` are readable by authenticated users; writes are service-role only. `plan_catalog` is readable by authenticated users; writes are service-role only.

Storage: private bucket `media`. Object path `{user_id}/{asset_id}`. Signed URLs only. No public image URLs.

Migrations live in `supabase/migrations/` and are the only way schema changes reach any environment.

---

## 5. AI architecture

Do not put the whole product in one prompt.

```
Request
  → parse constraints (ReasoningProvider, schema OutfitRequest)
  → filter wardrobe (deterministic)
  → build requirements (deterministic + light reasoning)
  → generate candidates (deterministic combinations + reasoning to pick)
  → score (deterministic rules + optional reasoning critique)
  → detect gaps (rules: only if a required category is missing)
  → search products (ProductProvider)
  → rank products (deterministic)
  → persist outfit + usage + ai_requests
```

Every AI call:

1. Has a named task, prompt version, model, timeout, retry-once.
2. Returns JSON that is parsed and validated with Zod.
3. Is rejected (user-visible error) if validation fails after retry.
4. Never writes unvalidated model output to the database.

Initial adapter: **OpenAI**. Initial candidate model: `gpt-4.1-mini` (not a permanent commitment). Domain code never hardcodes a model ID. Costs are measured via `ai_requests` / `usage_events`. Development spend cap: **$20** — stop and request approval before exceeding it.

**Gemini Free is rejected for user photos.** Google's free Gemini tier uses content to improve Google's products. StyleAI processes personal photographs. Paid Gemini remains a future adapter, not the V1 default.

Virtual try-on: `VirtualTryOnProvider` interface only. No V1 UI entry point.

Full detail: [AI_SYSTEM.md](./AI_SYSTEM.md).

---

## 6. Product-search architecture

```
Outfit gap
  → ProductSearchIntent (category, color, budget, query)
  → ProductProviderRegistry.search()
  → normalize → cache in products (fetched_at, expires_at)
  → rank (compatibility, preference, price — not affiliate payout)
  → return Product { product_url, affiliate_url? }
```

The outfit engine, ranking engine, product UI, and database **domain** models never know the retailer. They receive normalized `Product` objects. eBay-specific mapping stays inside `EbayProductProvider`.

**Long-term requirement: broad retailer coverage.** eBay Browse API is the first real adapter used to validate the pipeline (official item URLs, price, image, category filters, free developer keys, default ~5,000 calls/day). It is not the retailer strategy.

Not used in V1 production:

- Scrapers / SerpAPI / Bright Data (ToS and cost)
- Amazon Creators API (requires Associates account and sales history)
- Fake store APIs
- LLM-invented products

If the provider fails, the outfit still returns wardrobe items and a recoverable "product search unavailable" state. Missing-item slots are not filled with placeholders.

Full detail: [PRODUCT_DATA.md](./PRODUCT_DATA.md).

---

## 7. Billing architecture

Entitlement and plan architecture ships in **foundation (Phase 1)**. Live payments stay off.

```
Mobile IAP  → RevenueCat  → EntitlementService
Web pay     → Stripe      → EntitlementService
```

RevenueCat and Stripe are `BillingProvider` implementations. Domain code depends on `EntitlementService` + `plan_catalog` + `usage_events` only.

- Free plan limits from catalog
- Server rejects over-limit operations
- Pro is granted only from server-side entitlement records
- No paid billing service is activated without explicit approval

Full detail: [BILLING.md](./BILLING.md).

---

## 8. Authentication architecture

Interface: `AuthProvider` with sign up, sign in, sign out, reset password, get session, OAuth start.

Implementation: Supabase Auth.

- Email/password with verification when the Supabase project has email confirmations enabled
- Google OAuth (web client ID + iOS/Android IDs)
- Session persistence via official Supabase + Expo auth helpers
- No skip-auth, no demo user, no production bypass

Google sign-in needs a Google Cloud OAuth client (free). That is an owner action, not something this agent will create.

---

## 9. Deployment architecture

| Surface | Path | Money |
| --- | --- | --- |
| Local web/native | `pnpm --filter @styleai/app start` | Free |
| CI | GitHub Actions | Free for this private/public repo's standard minutes |
| Web + API | EAS Hosting (`eas deploy`) | Free tier exists; production traffic and custom domain may require Starter ($19/mo) |
| iOS/Android binaries | EAS Build | Free: 15 iOS + 15 Android builds/month |
| App Store | Not submitted | Apple Developer Program **$99/year** — approval required |
| Play Store | Not submitted | Play Console **$25 once** — approval required |

`eas.json` and app config (icons, splash, bundle IDs, privacy URLs) are created in Phase 7. Nothing is submitted automatically.

Full detail: [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 10. Security model

- Secrets only in server env; `EXPO_PUBLIC_*` is treated as public
- RLS on every user-owned table; policies tested
- API routes verify the Supabase JWT and re-check ownership
- Image upload: mime allowlist, size cap, magic-byte check, private bucket
- Rate limits on auth, AI, product search, signup
- External URLs opened only after allowlisting `http:`/`https:` and showing affiliate disclosure when `affiliate_url` is used
- Account deletion cascade for user-owned data; billing records retained as required
- Admin = server-checked UUID list, not a hidden password
- Logs: request id, user id, operation, provider, duration, error class — no image bytes, no tokens, no secrets

Full detail: [SECURITY.md](./SECURITY.md).

---

## 11. Testing strategy

| Layer | Tool | What |
| --- | --- | --- |
| Unit | Vitest | Scoring, constraint parse, ranking, budget, wardrobe filter, Zod schemas, product normalize |
| Integration | Vitest + mocked providers / local Supabase when available | Authz helpers, outfit pipeline, entitlement checks, usage metering |
| RLS | SQL tests against a local or ephemeral Postgres | User A cannot read user B |
| E2E | Playwright against web | Sign up → onboard → upload fixture → analyze (test double injected) → outfit → save → reload |
| CI | GitHub Actions | `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter @styleai/app export:web` |

Production path never uses fake AI or fake products. Tests inject providers explicitly.

Full detail: [TESTING.md](./TESTING.md).

---

## 12. Development phases

Work stops at any **COST CHECK** that needs owner money or a paid account.

### Phase 0 — Discovery (complete)

Inspect repo, research current docs, publish plan, list costs.

### Phase 1 — Foundation (this PR)

Monorepo, Expo app, tokens, **real auth**, schema + **RLS**, private storage, env validation, logging, CI, tests, **provider interfaces**, **entitlement/plan architecture**, **analytics funnel**. Live verify against a user-created **Supabase Free** project when keys exist; otherwise fail closed. No fake production behavior.

### Phase 2 — Profile + wardrobe

Onboarding, profile, image pipeline, clothing analysis (OpenAI adapter; **$20 cap** — stop if it would be exceeded), correction UI, wardrobe CRUD, multi-item review.

### Phase 3 — Outfit engine

Constraint parse, retrieval, candidates, scoring, **required-category gaps only**, save/regenerate/feedback. Prefer owned items. Product stage is a typed result via `ProductProvider`; no retailer-specific logic.

### Phase 4 — Product engine

First `ProductProvider` implementation (eBay adapter), normalize, cache, freshness, ranking (no affiliate signal), product UI. Additional retailers are later registrations. Blocked on eBay app keys (free).

### Phase 5 — Monetization UI + billing adapters

Billing UI, webhook handlers. Live IAP/Stripe **not** activated without approval. Entitlements already exist from Phase 1.

### Phase 6 — Hardening

Security, RLS, a11y, performance, dependency audit, coverage gaps.

### Phase 7 — Deployment config

EAS, icons, splash, privacy/terms routes, store metadata placeholders. No store submission.

---

## 13. Core screens (V1)

**Public:** Landing, Sign up, Login, Forgot password, Privacy, Terms, Pricing.

**Authenticated:** Home, Onboarding, My Style, Wardrobe, Add Clothing, Item detail/edit, Create Outfit, Outfit results, Saved outfits, Product detail, Profile, Settings, Subscription, Account deletion.

**Not in navigation:** Virtual try-on, style history, notifications. No fake buttons.

---

## 14. Conflicts and constraints

1. **Real E2E AI/product vs no spending.** The app can be built, tested with injected providers, and deployed as config. Live clothing analysis and live product search cannot run until the owner supplies approved API keys. That is not demo mode; missing keys fail closed.
2. **Supabase Free vs production uptime.** Free projects pause after 1 week idle and have no backups. Fine for development. Production should use Pro ($25/mo) — owner approval required.
3. **EAS Hosting Free CPU/subrequest limits.** Thin JSON routes should fit. If AI proxying is squeezed, options are EAS Starter ($19/mo) or moving long calls to a small Node host. Decision deferred until Phase 7 load is known.
4. **eBay vs fashion retail quality.** eBay is a marketplace (new and used). It is the only official, free, terms-compliant catalog with clothing, prices, and item URLs identified for V1. Better fashion catalogs are paid or affiliation-gated. The UI must label retailer and condition honestly.
5. **App Store IAP vs web SaaS.** Mobile must use IAP. Web uses Stripe via RevenueCat Billing. Same `appUserID` = Supabase user id.

---

## 15. Blockers (need the owner)

These are not things the agent can invent:

| Blocker | Needed for | Cost |
| --- | --- | --- |
| Approval of this plan | Phase 1 | $0 |
| Supabase project (owner creates) | Auth, DB, storage | $0 to start |
| Google OAuth client IDs | Google login | $0 |
| OpenAI API key | Clothing analysis + outfit parsing | Usage-based **paid** |
| eBay developer keys | Real product search | $0 |
| Expo account | EAS builds/hosting | $0 to start |
| Apple Developer Program | Ship iOS / IAP | **$99/year** |
| Google Play Console | Ship Android / Play Billing | **$25 once** |
| Stripe + RevenueCat | Collect money | Free to create; processing fees later |

Until OpenAI is approved, Phase 2 analysis endpoints will be implemented against the `VisionProvider` interface and **fail clearly** without a key. Tests will use a fixture provider. Production will not ship fake classifications.

---

## 16. What happens after approval

When the owner approves this plan (and which cost items, if any):

1. Implement Phase 1 on a feature branch.
2. Stop again before adding any paid provider key to a live environment.
3. Do not mark the product production-ready until the checklist in the specification has been tested.

Do not start Phase 1 from this PR.
