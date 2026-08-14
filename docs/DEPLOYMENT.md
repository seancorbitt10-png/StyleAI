# Deployment

## Purpose

How StyleAI reaches web, iOS, and Android. Nothing in this repository submits to an app store automatically.

## Web

Expo Router with `expo.web.output = "server"` so API routes deploy with the site.

Local:

```sh
pnpm --filter @styleai/app start     # Metro + API routes
pnpm --filter @styleai/app export:web
```

Production path (Phase 7): [EAS Hosting](https://docs.expo.dev/eas/hosting/get-started/).

```sh
eas deploy          # preview
eas deploy --prod   # production alias
```

Free EAS Hosting includes 100,000 requests/month. Custom domains require a paid EAS plan. See [COST_AND_APPROVALS.md](./COST_AND_APPROVALS.md).

Native apps must set the Expo Router config plugin `origin` to the hosted URL so `/api/*` is reachable from iOS and Android.

## Mobile

EAS Build configuration will live in `apps/app/eas.json`:

| Profile | Use |
| --- | --- |
| `development` | Dev client |
| `preview` | Internal distribution |
| `production` | Store-signed binaries |

Commands (Phase 7, after Expo account exists):

```sh
cd apps/app
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

Do not run `eas submit` unless the owner explicitly asks after Apple/Google accounts exist.

## App identity (placeholders until Phase 7)

| Key | Planned value |
| --- | --- |
| Name | StyleAI |
| Slug | styleai |
| iOS bundle ID | `com.styleai.app` (confirm with owner) |
| Android applicationId | `com.styleai.app` |
| Scheme | `styleai` |

Icons, splash, and store screenshots are Phase 7 assets. Privacy Policy and Terms URLs must be live web routes before store review.

## CI

GitHub Actions on every PR:

1. Install with pnpm
2. Typecheck
3. Lint
4. Unit tests
5. `expo export --platform web` (no secrets required for a smoke export)

Integration tests that need Supabase use GitHub secrets or are skipped when secrets are absent — never use production data.

## Environments

| | Web | API | Database |
| --- | --- | --- | --- |
| Development | localhost | Metro server | Dev Supabase |
| Staging | EAS preview | same deploy | Staging Supabase |
| Production | EAS prod alias | same | Prod Supabase (Pro recommended) |

## Failure modes

- Missing EAS token in CI: build job fails, does not skip into a fake deploy.
- Store credentials missing: `eas submit` must not be part of default CI.
- Hosting misconfig: API 503, client shows unavailable.

## Replacement

`expo-server` has adapters for Node, Cloudflare, Vercel, Netlify. Domain logic does not depend on EAS. Switching hosts is a deploy-adapter change.
