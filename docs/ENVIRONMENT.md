# Environment

## Purpose

Every secret and public config value used by StyleAI, where it lives, and what happens when it is missing.

## Rules

1. Never commit `.env` or real keys.
2. `.env.example` lists names only.
3. `EXPO_PUBLIC_*` is embedded in client bundles. Treat as public.
4. AI, product, service-role, webhook, and JWT secrets are server-only.
5. Production must **fail on boot** (or return 503 from API) if a required secret is empty. Do not substitute dummy products or dummy AI.

## Files

| File | Git | Use |
| --- | --- | --- |
| `.env.example` | yes | Template |
| `.env` | no | Local development |
| EAS Secrets / GitHub Actions secrets | no | CI and deploys |
| Supabase dashboard secrets | no | Edge/db if used |

## Variable catalog

### App

| Name | Client? | Required | Notes |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_APP_ENV` | yes | yes | `development` \| `staging` \| `production` |
| `EXPO_PUBLIC_APP_URL` | yes | yes | Canonical web origin |
| `EXPO_PUBLIC_API_URL` | yes | yes | Native `origin` for API routes |

### Supabase

| Name | Client? | Required | Notes |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | yes | yes | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | yes | yes | Publishable; RLS must make this safe |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | server | Bypasses RLS. API routes only. |
| `SUPABASE_JWT_SECRET` | **no** | server | Verify user JWTs if not using Supabase helper |
| `DATABASE_URL` | **no** | migrations | Used by Supabase CLI / CI migrate job |

### Auth

| Name | Client? | Required | Notes |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | yes | for Google | OAuth web client |
| `GOOGLE_IOS_CLIENT_ID` | native config | for Google iOS | Not a secret in the usual sense; still not an API key |
| `GOOGLE_ANDROID_CLIENT_ID` | native config | for Google Android | |

Email auth needs no extra keys beyond Supabase. Enable email confirmations in the Supabase project if desired.

### AI (server)

| Name | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | production AI | Fail closed if missing in production |
| `OPENAI_VISION_MODEL` | default `gpt-4.1-mini` | Pin a snapshot in production when possible |
| `OPENAI_REASONING_MODEL` | default `gpt-4.1-mini` | |
| `AI_REQUEST_TIMEOUT_MS` | default 30000 | |
| `AI_MAX_RETRIES` | default 1 | Validation failure retry |
| `AI_DEV_SPEND_CAP_USD` | default 20 | Stop and request approval before exceeding |

### Products (server)

| Name | Required | Notes |
| --- | --- | --- |
| `EBAY_CLIENT_ID` | production search | |
| `EBAY_CLIENT_SECRET` | production search | |
| `EBAY_ENV` | `sandbox` \| `production` | Never point production app at sandbox silently |
| `PRODUCT_CACHE_TTL_HOURS` | default 24 | |

### Plans

Integer limits. Not prices. Prices belong in `plan_catalog` / billing provider dashboards.

See `.env.example` for `FREE_*` and `PRO_*` names.

### Rate limits and admin

See `.env.example`. `ADMIN_USER_IDS` is a comma-separated list of profile UUIDs checked on the server.

### Billing (Phase 5+)

All `REVENUECAT_*` and `STRIPE_*` keys. Public SDK keys may be `EXPO_PUBLIC_*`. Webhook secrets and Stripe secret key must not.

## Validation

`packages/core` will export `envSchema` (Zod). Server boot parses `process.env`. Client parses only `EXPO_PUBLIC_*`.

Production `OPENAI_API_KEY` empty → AI routes 503 with public message "Styling analysis is temporarily unavailable." Log: `missing_env OPENAI_API_KEY`.

## Local setup (after Phase 1)

```sh
cp .env.example .env
# create a free Supabase project
# paste URL, anon key, service role
pnpm --filter @styleai/app start
```

Do not put production service-role keys on a developer laptop longer than needed. Prefer a development Supabase project.
