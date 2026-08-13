-- Rider vs Organizer account type, chosen once at onboarding and permanent.
-- Orthogonal to user_roles (admin/user) — that stays untouched.

create type public.account_type as enum ('rider', 'organizer');

alter table public.profiles
  add column account_type public.account_type not null default 'rider';
