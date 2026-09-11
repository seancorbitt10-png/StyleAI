# Analytics

## Purpose

Measure activation, engagement, retention, commerce, and monetization without a third-party tracker in V1 and without collecting unnecessary personal data.

## Allowlisted events

Defined in `@styleai/core` as `ANALYTICS_EVENTS`. Unknown names are rejected.

| Event | When | Typical properties |
| --- | --- | --- |
| `landing_session` | Public landing viewed / session started | `platform`, `path` |
| `sign_up` | Account created | `method` (`email` \| `google`) |
| `onboarding_started` | First onboarding screen | |
| `onboarding_completed` | Onboarding finished | |
| `profile_photo_added` | Profile photo stored | |
| `wardrobe_item_added` | Item persisted | `source` (`single` \| `closet`) |
| `wardrobe_item_verified` | User confirms/edits AI attributes | |
| `first_outfit_generated` | User's first successful generation | `outfit_id` |
| `outfit_generated` | Any successful generation | `outfit_id`, `had_gaps` |
| `outfit_saved` | Save | `outfit_id` |
| `outfit_liked` | Feedback like | `outfit_id` |
| `outfit_disliked` | Feedback dislike | `outfit_id` |
| `product_viewed` | Product detail | `product_id` (internal) |
| `product_clicked` | Outbound URL opened | `product_id`, `url_kind` |
| `subscription_started` | Entitlement becomes pro | `plan_id`, `source` |
| `subscription_cancelled` | Cancellation recorded | `plan_id`, `source` |

`landing/session` in the product spec maps to `landing_session`.

## Inputs / outputs

`AnalyticsService.track({ name, userId, sessionId, properties })`

- Validates name against the allowlist.
- Strips unknown properties.
- Forbids raw emails, names, photo URLs, and token-like keys in `properties`.
- Persists to `analytics_events`.

## Funnel questions

| Question | Events |
| --- | --- |
| Activation | `sign_up` → `onboarding_completed` → `wardrobe_item_verified` → `first_outfit_generated` |
| Engagement | `outfit_generated`, `outfit_saved`, wardrobe adds |
| Retention | repeat `outfit_generated` / `landing_session` by user over time |
| Commerce | `product_viewed`, `product_clicked` |
| Monetization | `subscription_started`, `subscription_cancelled` |

## Privacy

- No extra analytics SaaS in V1.
- Do not send clothing images or full prompt text.
- `user_id` is an opaque UUID. Anonymous `landing_session` uses `session_id` only.
- RLS: users cannot read other users' events. Inserts go through the application service (HTTP adapter), not ad-hoc client writes of arbitrary payloads.

## Replacement

The allowlist and `AnalyticsService` stay. A future vendor is another sink behind the same interface.
