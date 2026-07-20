-- Minimal RBAC: every profile gets exactly one role, default 'user'. Promoting
-- someone to 'admin' is a manual SQL operation (update this table directly) —
-- there is no in-app "make admin" action.

create type public.app_role as enum (
  'user',
  'admin'
);

create table public.user_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.app_role not null default 'user',
  updated_at timestamptz not null default now()
);

comment on table public.user_roles is 'One role per user. Admin promotion is manual (direct SQL), not exposed in the app.';

alter table public.user_roles enable row level security;

create policy "Users can view their own role"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Seed a 'user' row for every profile that predates this migration.
insert into public.user_roles (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function public.handle_new_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id) values (new.id);
  return new;
end;
$$;

create trigger profiles_after_insert_add_role
  after insert on public.profiles
  for each row
  execute function public.handle_new_profile_role();

-- Reusable in RLS policies elsewhere (SECURITY DEFINER so it can read
-- user_roles regardless of the calling user's own RLS visibility into it).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles where user_id = uid and role = 'admin'
  );
$$;
