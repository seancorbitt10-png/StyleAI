# Testing

## Purpose

A feature is done when the workflow works, not when a screen renders. Tests protect domain logic and authorization. They use fixtures, never production users.

## Layers

### Unit (mandatory, fast)

Vitest in `packages/core` and server domain modules:

- Outfit scoring
- Constraint parsing (including Zod rejection of extra fields)
- Budget logic
- Wardrobe filtering (season, formality, weather, exclusions)
- Product normalization from a recorded eBay fixture JSON
- Product ranking (affiliate payout must not change order; no retailer-specific branches)
- Required-category gap detection (“use what the user already owns”)
- Plan quota arithmetic
- Analytics event allowlist
- Env schema fail-closed behavior

### Integration

- JWT + ownership helpers
- Outfit pipeline with injected `VisionProvider`, `ReasoningProvider`, `ProductProvider`
- Entitlement denial when over quota
- Usage event written on success and on provider failure
- Image validation (reject `.txt` renamed to `.jpg`)

If a local Supabase is available in CI, run RLS tests: seed user A and B, prove B's select on A's wardrobe is empty.

### End-to-end (web, Playwright)

Happy path against a test project or mocked server in CI:

1. Sign up
2. Onboarding
3. Upload clothing fixture
4. Analysis (test double if no OpenAI secret in CI)
5. Verify/correct attributes
6. Create outfit
7. Receive structured result
8. If product provider configured: real or sandbox search; else assert error state, not fake cards
9. Save outfit
10. Reload, still saved
11. Logout / login, still saved

Mobile E2E (Maestro on EAS) is optional and **paid per job** on EAS — do not enable until approved.

## Dependency injection

```ts
createOutfitService({ vision, reasoning, products, db, meter })
```

Production composition root wires real adapters. Test composition root wires fakes. There is no `if (DEMO_MODE)`.

## CI

On pull request:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- web export smoke

Fail the job on test failure. Do not skip assertions to go green.

## Fixtures

`tests/fixtures/images/` — garment photos with licenses that allow tests.  
`tests/fixtures/providers/ebay-search.json` — recorded sandbox responses.  
Never commit live customer photos.

## What "pass" means for V1 complete

The specification checklist in `PRODUCT_SPEC.md` §64. Unit + integration + E2E green is necessary and not sufficient. Live OpenAI and live eBay must be exercised in a non-production project before calling the core loop done.
