# Security

## Purpose

StyleAI stores personal photos and wardrobe data. Security is a release requirement, not a later pass.

## Threats in scope for V1

- User A reads User B profile, photos, wardrobe, outfits, preferences, usage, or billing metadata
- Client extracts service-role or AI keys
- Unlimited expensive AI calls
- Malicious uploads
- Open-redirect / javascript URLs on product links
- Fake admin via a client flag

## AuthN / AuthZ

1. Supabase Auth issues JWTs.
2. Client uses the anon key + user JWT. RLS applies.
3. API routes validate the JWT and pass the user id into services.
4. Services filter by `user_id`. Do not trust ids in the body without matching the session.
5. Service role is used only for: webhooks, product cache upsert, admin metrics, deletion jobs.

There is no skip-auth path.

## RLS

Enable RLS on every user-owned table before it holds data.

Pattern:

```sql
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

`profiles`: `id = auth.uid()`.  
`products` / `plan_catalog`: authenticated read; no client writes.  
Storage `media`: first path segment = `auth.uid()::text`.

Test with two users. A policy that is untested is unfinished.

## Uploads

- Allow `image/jpeg`, `image/png`, `image/webp` only
- Max size well under Supabase Free 50 MB (target 8 MB pre-compress; compress to ~1–2 MB)
- Verify magic bytes, not just extension
- Strip EXIF if practical before AI send
- Private bucket; signed URLs with short TTL for display
- Virus/malware: rely on type/size constraints in V1; revisit if abuse appears

## Secrets

| Secret | Location |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Server env |
| `OPENAI_API_KEY` | Server env |
| `EBAY_CLIENT_SECRET` | Server env |
| Stripe/RevenueCat webhook secrets | Server env |
| Anon key | Public by design |

CI must scan that `EXPO_PUBLIC_` does not include `SERVICE_ROLE` or `API_KEY` names except documented publishable Stripe/RevenueCat keys.

## Rate limiting

Configurable via env. Apply per user id when authenticated, else per IP:

- signup, login, password reset
- AI analysis and outfit generation
- product search

Exceeding quota is 429 with a clear message. Entitlement limits are separate from abuse limits.

## Logging

Include: `request_id`, `user_id`, `operation`, `provider`, `model`, `duration_ms`, `status`, `error_class`.

Never include: raw images, full prompts that embed images, API keys, JWTs, passwords, full card data (we should never see cards).

## Admin

`ADMIN_USER_IDS` checked on the server. V1 admin is a protected `/api/admin/metrics` route plus a minimal screen only if `getSession()` id is in that list. No `?admin=true`.

## Account deletion

User-initiated. Deletes: profile, preferences, media objects, wardrobe, outfits, feedback, product_searches, affiliate_clicks, analytics tied to the user.

Retain: legally required billing/audit with minimization.

Deletion is a server routine (service role) after re-auth or recent login check.

## Privacy

- Photos are not public
- No selling user data
- No training consent toggle in V1 — we will not opt in to OpenAI training
- Do not infer sensitive attributes from images
- Privacy Policy and Terms are real routes, not lorem ipsum

## External URLs

Parse with a URL library. Protocol must be `http:` or `https:`. Use the affiliate URL only when present and disclosed.

## Replacement

RLS and ownership checks stay even if Auth or Storage vendors change.
