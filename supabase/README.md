# Supabase

Phase 1 uses **Supabase Free**. Do not upgrade to Pro unless the owner explicitly approves.

## Apply migrations

1. Create a project at https://supabase.com (Free plan).
2. Open SQL editor.
3. Run `migrations/20260814193000_init.sql`.
4. Auth → Providers: enable Email. Optionally enable Google after creating OAuth clients (free).
5. Auth → URL configuration: add `styleai://` and your web origin (e.g. `http://localhost:8081`).
6. Copy Project URL and anon key into `.env` as `EXPO_PUBLIC_*`. Keep the service-role key server-only.

Idle projects on Free may pause after a week. That is acceptable during development.
