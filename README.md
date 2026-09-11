# StyleAI

StyleAI is a consumer AI styling and shopping assistant.

Upload yourself and your wardrobe. Tell StyleAI what you are dressing for. StyleAI builds outfits from what you already own, identifies missing pieces only when useful, finds real products that complete the outfit, and gives you actual purchase links.

This repository is the production V1 foundation. It is not a demo, a mock SaaS, or a UI-only prototype.

## Current status: Phase 0 (plan only)

**Substantial application code has not been written yet.**

The product specification requires an implementation plan and explicit approval before building. That plan is in this pull request.

| Document | Purpose |
| --- | --- |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Master V1 plan — start here |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Repository, runtime, and module decisions |
| [docs/COST_AND_APPROVALS.md](docs/COST_AND_APPROVALS.md) | External services, money, and required approvals |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variables |
| [docs/AI_SYSTEM.md](docs/AI_SYSTEM.md) | AI pipeline, providers, prompts, cost tracking |
| [docs/PRODUCT_DATA.md](docs/PRODUCT_DATA.md) | Real product search and affiliate architecture |
| [docs/BILLING.md](docs/BILLING.md) | Plans, entitlements, IAP/web billing |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, RLS, uploads, secrets, deletion |
| [docs/TESTING.md](docs/TESTING.md) | Unit, integration, and E2E strategy |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Web, iOS, Android, EAS |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Original V1 master specification |

## What this product must do

A real user must be able to:

1. Create an account and sign in (email/password or Google).
2. Complete onboarding and upload a photo of themselves.
3. Upload clothing photos, have them analyzed by a real AI provider, correct the result, and save items.
4. Request an outfit for an occasion with optional constraints.
5. Receive an outfit that prioritizes existing wardrobe items.
6. See real product recommendations with real external URLs when something is genuinely missing.
7. Save the outfit and retrieve it later.
8. Manage profile, wardrobe, subscription entitlements, and account deletion.

If an external provider is down, the app shows an error and retry state. It does not invent products, prices, URLs, or AI classifications.

## What will not be in V1

- Virtual try-on (interface only; not a product dependency)
- Scraping retailers
- Fake demo mode
- Client-side privileged API keys
- Hardcoded subscription access
- Separate iOS / Android / web codebases

## Setup (after Phase 1 exists)

Phase 1 has not started. After it lands, expected local setup will be:

```sh
pnpm install
cp .env.example .env
# fill in development values — see docs/ENVIRONMENT.md
pnpm --filter @styleai/app start
```

Do not create paid accounts or spend money while following this README. Cost-bearing steps are listed in [docs/COST_AND_APPROVALS.md](docs/COST_AND_APPROVALS.md) and require explicit owner approval.

## License

Private. Source-code ownership remains with the repository owner.
