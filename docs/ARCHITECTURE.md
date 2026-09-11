# Architecture

## Purpose

Describe how StyleAI is structured so another engineer can extend it without reverse-engineering tribal knowledge.

## Decision: one universal app

Expo Router is a file-based router for Android, iOS, and web from one tree. Official docs recommend `create-expo-app` with Expo Router rather than a separate navigation library or separate web app.

**Chosen:** `apps/app` as the only application.

**Rejected:** `apps/mobile` + `apps/web`. That would duplicate routes, design, and product flows. The specification allows a single universal app when it is the cleaner long-term DX. It is.

Platform-specific code is limited to:

- Camera vs file input
- StoreKit / Play Billing vs web checkout
- Safe area / keyboard
- Share sheet / linking

## Decision: modular monolith, not microservices

V1 is one deployable Expo server (API routes + static/SSR web) plus Supabase (Postgres, Auth, Storage). No Kubernetes, no event bus, no extra databases.

## Repository layout (target after Phase 1)

```
/
  apps/app/                     # Expo SDK 54 + Expo Router
    app/                        # routes (file-based)
      (public)/                 # landing, auth, legal, pricing
      (app)/                    # authenticated tabs/stacks
      api/                      # server routes (secrets OK here)
    src/
      features/                 # screen composition only
      server/                   # privileged adapters (do not import from UI)
      lib/                      # client supabase, navigation helpers
    app.json / eas.json
  packages/
    core/                       # types, zod, domain, provider interfaces
    ui/                         # tokens + primitives
  supabase/
    migrations/
    seed/                       # test-only, never production fake catalog
  docs/
  scripts/
  .github/workflows/ci.yml
```

`packages/core` must not import React Native. Domain tests run in Node.

`apps/app/src/server` must not be imported from files under `app/` except `app/api/**`. ESLint `no-restricted-imports` will enforce this after Phase 1.

## Dependency direction

```
UI screens → packages/ui, packages/core (types/schemas), api-client
API routes → packages/core, src/server adapters
Adapters   → provider SDKs, env
Domain     → nothing (pure functions)
```

UI must not contain: prompts, ranking, RLS, entitlements, price math.

## Provider interfaces (packages/core)

```ts
VisionProvider
ReasoningProvider
ProductProvider
ProductProviderRegistry
BillingProvider
AuthProvider          // thin; Supabase is the first impl
UsageMeter
EntitlementService
VirtualTryOnProvider  // unimplemented; must not be required
```

Configuration for models, timeouts, and prompt versions lives in one module (`packages/core` + server env), not scattered through screens.

## Data flow: generate outfit

1. Client POST `/api/outfits/generate` with JWT + constraints text/fields.
2. Server validates input, checks entitlement + rate limit + usage.
3. Parse constraints (AI → Zod `OutfitRequestSchema`).
4. Load wardrobe rows for `auth.uid()` only; filter in SQL then in domain.
5. Build candidates; score; pick top N.
6. If a required category is empty, build a search intent.
7. Registry search → normalize → upsert cache → rank.
8. Persist outfit, items, usage, ai_requests.
9. Return structured outfit DTO.

Failure of step 7 does not invent products. The response includes wardrobe items and `productSearchError`.

## Environments

| Name | Data | AI/products |
| --- | --- | --- |
| `development` | Owner's free Supabase project or local | Real keys if owner provided; otherwise fail closed |
| `test` | Fixtures / local DB | Injected fake providers **only in test runners** |
| `staging` | Separate Supabase project | Real providers, non-prod keys |
| `production` | Pro Supabase (recommended) | Real providers, fail if secrets missing |

There is no `DEMO_MODE` flag.

## Replacement strategy

| If we replace | Change |
| --- | --- |
| OpenAI → Anthropic/Gemini paid | New adapter implementing `VisionProvider` / `ReasoningProvider` |
| eBay → another retailer API | New `ProductProvider`, register it |
| Supabase Auth → other | New `AuthProvider`; JWT verification in API routes |
| RevenueCat → other | New `BillingProvider`; entitlements table stays |
| EAS Hosting → Node host | `expo-server` adapter; domain code unchanged |

## Failure modes

| Failure | User sees | Operator sees |
| --- | --- | --- |
| Missing env in production | App refuses to start / API 503 "misconfigured" | Log: which key name is missing (not the value) |
| AI timeout / invalid JSON | Recoverable error + retry | `ai_requests.status`, error class, duration |
| Product provider down | Outfit without purchases + error banner | Provider, status code |
| RLS / unauthorized | 401/403 | user id, route, request id |

## Security considerations

See [SECURITY.md](./SECURITY.md). Summary: client never receives service-role or AI keys; RLS is not the only check; API routes re-validate ownership.

## Why SDK 54 instead of 57

Expo's current docs: during the SDK 57 transition, `create-expo-app@latest` without a template still produces SDK 54, and Expo Go on physical devices tracks SDK 54. StyleAI development benefits from camera and image picker on a real phone via Expo Go before a development build exists.

If the owner prefers SDK 57 (latest template, development builds from day one), that is a one-line decision change in Phase 1. It is not a rewrite.
