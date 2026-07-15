-- Join requests submitted by riders wanting to join a ride.

create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  status public.request_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (ride_id, requester_id)
);

comment on table public.ride_requests is 'Join requests submitted by riders wanting to join a ride.';

create index ride_requests_ride_id_idx on public.ride_requests (ride_id);
create index ride_requests_requester_id_idx on public.ride_requests (requester_id);
create index ride_requests_pending_idx on public.ride_requests (ride_id) where status = 'pending';

alter table public.ride_requests enable row level security;

create policy "Requester or organizer can view a request"
  on public.ride_requests for select
  to authenticated
  using (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
  );

create policy "Riders can request to join a ride"
  on public.ride_requests for insert
  to authenticated
  with check (
    (select auth.uid()) = requester_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
  );

create policy "Organizer responds, requester cancels"
  on public.ride_requests for update
  to authenticated
  using (
    (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
    or (select auth.uid()) = requester_id
  )
  with check (
    (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
    or (select auth.uid()) = requester_id
  );

-- RLS lets both the organizer and the requester update a request row (so the
-- requester can cancel their own), but only the organizer may accept/reject,
-- and only from 'pending'. This trigger enforces that transition precisely,
-- since it's an explicit product rule ("Only organizer accepts requests").
create or replace function public.enforce_ride_request_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if (select auth.uid()) = (select organizer_id from public.rides where id = old.ride_id) then
    if old.status <> 'pending' or new.status not in ('accepted', 'rejected') then
      raise exception 'Organizers may only accept or reject a pending request';
    end if;
  elsif (select auth.uid()) = old.requester_id then
    if old.status <> 'pending' or new.status <> 'cancelled' then
      raise exception 'Riders may only cancel their own pending request';
    end if;
  else
    raise exception 'Not authorized to update this request';
  end if;

  new.responded_at = case when new.status in ('accepted', 'rejected') then now() else old.responded_at end;
  return new;
end;
$$;

create trigger ride_requests_enforce_transition
  before update on public.ride_requests
  for each row
  execute function public.enforce_ride_request_transition();

-- When a request is accepted, seat the requester as a ride member atomically.
create or replace function public.handle_ride_request_accepted()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_max_riders smallint;
  v_member_count bigint;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select max_riders into v_max_riders from public.rides where id = new.ride_id;
    select count(*) into v_member_count from public.ride_members where ride_id = new.ride_id;

    if v_member_count >= v_max_riders then
      raise exception 'Ride is already full';
    end if;

    insert into public.ride_members (ride_id, user_id, role)
    values (new.ride_id, new.requester_id, 'participant')
    on conflict (ride_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger ride_requests_after_accept
  after update on public.ride_requests
  for each row
  execute function public.handle_ride_request_accepted();
