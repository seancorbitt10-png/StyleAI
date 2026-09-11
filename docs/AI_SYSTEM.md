# AI system

## Purpose

StyleAI uses models for **structured** work: classify garments, parse outfit requests, and optionally critique candidate outfits. Models do not own the database, entitlements, or product catalog.

## Inputs / outputs

| Task | Input | Output schema | Provider role |
| --- | --- | --- | --- |
| `clothing.analyze` | Compressed image + optional user note | `ClothingAnalysisSchema` | Vision |
| `closet.detect_items` | Multi-garment image | `ClosetDetectionSchema` | Vision |
| `outfit.parse_request` | Natural language + structured fields | `OutfitRequestSchema` | Reasoning |
| `outfit.critique` | Candidate ids + attributes + constraints | `OutfitCritiqueSchema` | Reasoning |
| `product.search_intent` | Gap + constraints | `ProductSearchIntentSchema` | Reasoning or deterministic |

Image generation and virtual try-on are **out of V1**. `VirtualTryOnProvider` exists as a type only.

## Contract

```
AI → parse JSON → Zod validate → business rules → persist
```

Never: `AI → database`.

On validation failure: retry once with the validator error summary. Then return a recoverable error. Do not store malformed attributes as canonical.

## Prompt management

Each task has:

- `id` (stable)
- `version` (integer, stored on `ai_requests`)
- system instructions
- input schema
- output schema
- model id
- timeout
- retry policy

Prompts live in `apps/app/src/server/ai/prompts/`. UI files must not contain prompt strings.

## Provider selection

Evaluated 2026-08-14 against official docs:

| Criterion | OpenAI | Gemini paid | Gemini free | Claude |
| --- | --- | --- | --- | --- |
| Vision | Strong | Strong | Strong | Strong |
| Strict JSON schema | Best (Structured Outputs) | Schema support | Schema support | Tool-use JSON |
| Photo privacy | API not trained by default | Paid: not used to improve products | **Used to improve Google products** | API not trained by default (confirm at contract time) |
| Cost | Low-mid (`gpt-4.1-mini`) | Often lower | $0 | Higher |
| SDK | Official Node SDK | Official | Official | Official |

**V1 default: OpenAI `gpt-4.1-mini`** for both vision and reasoning.

Gemini Free is incompatible with "treat uploaded images as sensitive" plus "no use of user photos for model training unless consented."

Replacement: implement `VisionProvider` / `ReasoningProvider`. The outfit pipeline depends on interfaces.

## Cost tracking

Every `ai_requests` row stores:

- provider, model, task, prompt version
- image count
- input/output token counts when the API returns them
- duration_ms, status, error_class
- estimated_cost_usd (from a small price table in config)

This answers "how much does one outfit generation cost?" without logging image bytes or raw prompts that contain PII beyond what is required for debugging. Prefer storing hashes / truncated error strings.

## Cost control

- Analyze a garment **once** on upload; reuse stored attributes.
- Do not call AI on wardrobe list render.
- Filter wardrobe in SQL before sending a subset to critique.
- Deterministic candidate generation first; AI critique is optional if candidates already score cleanly.
- Timeout and per-user rate limits.

## Failure modes

| Error | User | Log |
| --- | --- | --- |
| Timeout | "Analysis took too long. Try again." | `ai_timeout` |
| Invalid JSON after retry | "We couldn't read that item. Try a clearer photo." | `ai_schema_invalid` |
| Rate limit (provider) | "High demand. Try again in a minute." | `ai_provider_rate_limit` |
| Missing API key | "Styling analysis is unavailable." | `missing_env` |
| Refusal / policy | "This photo can't be analyzed." | `ai_refused` |

## Security

- Keys server-only
- Do not infer sensitive personal characteristics from photos (age, health, ethnicity as identity, etc.). Prompts must forbid it.
- Images sent to the provider are still third-party processing — disclose in Privacy Policy.

## Testing

Unit tests cover Zod schemas and prompt version export. Integration tests inject a `FakeVisionProvider` **only** via DI in `NODE_ENV=test`. That fake is not wired in development or production entrypoints.
