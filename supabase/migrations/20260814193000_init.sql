-- StyleAI Phase 1 schema
-- Apply in the Supabase SQL editor of a Free project.
-- RLS is enabled on every user-owned table before data is stored.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Plans (configuration, not UI-hardcoded prices)
-- ---------------------------------------------------------------------------
create table public.plan_catalog (
  id text primary key,
  display_name text not null,
  is_public boolean not null default true,
  price_cents integer,
  currency text,
  limits jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plan_catalog enable row level security;

create policy "Authenticated users can read plans"
  on public.plan_catalog for select
  to authenticated
  using (is_public = true);

insert into public.plan_catalog (id, display_name, price_cents, currency, limits)
values
  (
    'free',
    'Free',
    null,
    null,
    '{"maxWardrobeItems":40,"maxOutfitGenerationsPerMonth":8,"maxSavedOutfits":10,"maxProductSearchesPerMonth":20}'::jsonb
  ),
  (
    'pro',
    'Pro',
    null,
    null,
    '{"maxWardrobeItems":250,"maxOutfitGenerationsPerMonth":80,"maxSavedOutfits":100,"maxProductSearchesPerMonth":200}'::jsonb
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Profiles (NOT publicly readable)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  profile_photo_id uuid,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can select own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  preferred_styles text[] not null default '{}',
  disliked_styles text[] not null default '{}',
  preferred_colors text[] not null default '{}',
  disliked_colors text[] not null default '{}',
  preferred_brands text[] not null default '{}',
  disliked_brands text[] not null default '{}',
  typical_budget numeric,
  size_info jsonb not null default '{}'::jsonb,
  fit_preferences text[] not null default '{}',
  style_goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users own preferences"
  on public.user_preferences for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null default 'media',
  path text not null,
  mime_type text not null,
  byte_size integer not null,
  purpose text not null check (purpose in ('profile', 'wardrobe_item', 'closet')),
  created_at timestamptz not null default now()
);

create index media_assets_user_id_idx on public.media_assets (user_id);

alter table public.media_assets enable row level security;

create policy "Users own media metadata"
  on public.media_assets for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter table public.profiles
  add constraint profiles_photo_fk
  foreign key (profile_photo_id) references public.media_assets (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Wardrobe / outfits
-- ---------------------------------------------------------------------------
create table public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_id uuid references public.media_assets (id) on delete set null,
  category text not null,
  subcategory text,
  color text,
  secondary_colors text[] not null default '{}',
  pattern text,
  material text,
  fit text,
  formality text,
  seasonality text[] not null default '{}',
  weather_suitability text[] not null default '{}',
  style_tags text[] not null default '{}',
  brand text,
  estimated_price numeric,
  user_notes text,
  ai_confidence numeric,
  user_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wardrobe_items_user_id_idx on public.wardrobe_items (user_id);

alter table public.wardrobe_items enable row level security;

create policy "Users own wardrobe"
  on public.wardrobe_items for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  occasion text,
  constraints jsonb not null default '{}'::jsonb,
  reasoning text,
  score numeric,
  saved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index outfits_user_id_idx on public.outfits (user_id);

alter table public.outfits enable row level security;

create policy "Users own outfits"
  on public.outfits for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  wardrobe_item_id uuid references public.wardrobe_items (id) on delete set null,
  product_id uuid,
  role text not null check (role in ('owned', 'recommended')),
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.outfit_items enable row level security;

create policy "Users own outfit items via outfit"
  on public.outfit_items for all
  to authenticated
  using (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.outfits o
      where o.id = outfit_id and o.user_id = (select auth.uid())
    )
  );

create table public.outfit_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

alter table public.outfit_feedback enable row level security;

create policy "Users own feedback"
  on public.outfit_feedback for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Products (normalized cache — no retailer-specific domain columns)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_product_id text not null,
  title text not null,
  brand text,
  category text not null,
  subcategory text,
  description text,
  price numeric,
  currency text,
  original_price numeric,
  image_url text,
  product_url text not null,
  affiliate_url text,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  material text,
  attributes jsonb not null default '{}'::jsonb,
  availability text not null default 'unknown',
  retailer text,
  condition text,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (provider, provider_product_id)
);

alter table public.products enable row level security;

create policy "Authenticated users can read cached products"
  on public.products for select
  to authenticated
  using (true);

-- writes: service role only (no insert/update/delete policies for authenticated)

alter table public.outfit_items
  add constraint outfit_items_product_fk
  foreign key (product_id) references public.products (id) on delete set null;

create table public.product_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  intent jsonb not null,
  result_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.product_searches enable row level security;

create policy "Users own product searches"
  on public.product_searches for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Entitlements, usage, AI ledger, analytics
-- ---------------------------------------------------------------------------
create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null references public.plan_catalog (id),
  status text not null default 'active',
  source text not null default 'internal',
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "Users can read own entitlement"
  on public.entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- inserts/updates via trigger or service role

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  operation text not null,
  provider text,
  status text not null,
  estimated_cost_usd numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index usage_events_user_op_idx on public.usage_events (user_id, operation, created_at);

alter table public.usage_events enable row level security;

create policy "Users can read own usage"
  on public.usage_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task text not null,
  provider text not null,
  model text not null,
  prompt_version integer not null default 1,
  image_count integer not null default 0,
  input_tokens integer,
  output_tokens integer,
  duration_ms integer,
  status text not null,
  error_class text,
  estimated_cost_usd numeric,
  created_at timestamptz not null default now()
);

alter table public.ai_requests enable row level security;

create policy "Users can read own ai requests"
  on public.ai_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_idx on public.analytics_events (name, created_at);

alter table public.analytics_events enable row level security;

create policy "Users can read own analytics"
  on public.analytics_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own analytics"
  on public.analytics_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Anonymous landing events"
  on public.analytics_events for insert
  to anon
  with check (user_id is null and name = 'landing_session');

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  url_kind text not null check (url_kind in ('product', 'affiliate')),
  created_at timestamptz not null default now()
);

alter table public.affiliate_clicks enable row level security;

create policy "Users own affiliate clicks"
  on public.affiliate_clicks for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_events enable row level security;

-- no client policies: service role only

-- ---------------------------------------------------------------------------
-- Signup bootstrap
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into public.user_preferences (user_id) values (new.id);

  insert into public.entitlements (user_id, plan_id, status, source)
  values (new.id, 'free', 'active', 'internal');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Private storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do update set public = false;

create policy "Users can upload own media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can read own media"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant usage on schema public to anon, authenticated;
grant select on public.plan_catalog to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.wardrobe_items to authenticated;
grant select, insert, update, delete on public.outfits to authenticated;
grant select, insert, update, delete on public.outfit_items to authenticated;
grant select, insert, update, delete on public.outfit_feedback to authenticated;
grant select on public.products to authenticated;
grant select, insert, update, delete on public.product_searches to authenticated;
grant select on public.entitlements to authenticated;
grant select on public.usage_events to authenticated;
grant select on public.ai_requests to authenticated;
grant select, insert on public.analytics_events to anon, authenticated;
grant select, insert, update, delete on public.affiliate_clicks to authenticated;
