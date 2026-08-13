-- Public-facing business bio for organizer accounts — separate from
-- organizer_payout_details (financial info, owner/admin-only). Business
-- name/destination/events-count/Instagram are meant to be publicly visible
-- (same posture as profiles itself); business email/phone live in this same
-- row but the per-ride reveal is a UI-layer decision, not an RLS one.

create table public.organizer_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  business_name text not null,
  events_organised_count integer not null default 0 check (events_organised_count >= 0),
  primary_destination text not null,
  business_email text not null,
  business_phone text not null,
  instagram_handle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizer_details is 'Public business bio for organizer accounts. Contact fields are shown per-ride, gated in application code, not RLS.';

alter table public.organizer_details enable row level security;

create policy "Organizer details are viewable by everyone"
  on public.organizer_details for select
  to anon, authenticated
  using (true);

create policy "Organizer manages their own business details"
  on public.organizer_details for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Organizer updates their own business details"
  on public.organizer_details for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
