-- Rider profiles, extending auth.users with the fields riders fill in during
-- onboarding. One row per authenticated user, created explicitly by the app
-- (not auto-provisioned) since profile completion is a deliberate step before
-- a rider can create or join a ride.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  name text not null,
  bio text,
  city text,
  country text,
  profile_image_url text,
  bike_brand text,
  bike_model text,
  experience_level public.rider_level,
  years_riding smallint,
  instagram_handle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_.]{3,30}$'),
  constraint profiles_years_riding_range check (years_riding is null or years_riding between 0 and 100)
);

comment on table public.profiles is 'Rider profiles extending auth.users. One row per authenticated user.';

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
