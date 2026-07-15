-- Confirmed participants (including the organizer) for a ride.

create table public.ride_members (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'participant',
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  unique (ride_id, user_id)
);

comment on table public.ride_members is 'Confirmed participants (including the organizer) for a ride. last_read_at drives chat "seen" status.';

create index ride_members_ride_id_idx on public.ride_members (ride_id);
create index ride_members_user_id_idx on public.ride_members (user_id);

alter table public.ride_members enable row level security;

create policy "Ride members are viewable by everyone"
  on public.ride_members for select
  to anon, authenticated
  using (true);

create policy "Organizer or self can add a ride member"
  on public.ride_members for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    or (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
  );

create policy "Members can update their own membership"
  on public.ride_members for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Member or organizer can remove a membership"
  on public.ride_members for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
  );

-- Automatically seat the organizer as a ride member when a ride is created.
create or replace function public.handle_new_ride()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.ride_members (ride_id, user_id, role)
  values (new.id, new.organizer_id, 'organizer');
  return new;
end;
$$;

create trigger rides_after_insert_add_organizer
  after insert on public.rides
  for each row
  execute function public.handle_new_ride();

-- Convenience view for the Explore page: participant count and seats left.
-- security_invoker ensures the view is subject to the querying user's RLS,
-- not the view owner's privileges.
create or replace view public.rides_with_stats
with (security_invoker = true) as
select
  rides.*,
  count(ride_members.id) as member_count,
  greatest(rides.max_riders - count(ride_members.id), 0) as seats_available
from public.rides
left join public.ride_members on ride_members.ride_id = rides.id
group by rides.id;
