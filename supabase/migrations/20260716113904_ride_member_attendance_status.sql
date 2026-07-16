-- Attendance tracking: did a confirmed member actually show up for the ride?
-- Powers the organizer-facing "mark attendance" UI and rider reliability
-- stats (rides completed / no-shows) surfaced on public profiles.
create type public.attendance_status as enum (
  'pending',
  'attended',
  'no_show'
);

alter table public.ride_members
  add column attendance_status public.attendance_status not null default 'pending';

comment on column public.ride_members.attendance_status is
  'Set by the ride organizer after the ride date has passed. Pending until then.';

-- The existing "Members can update their own membership" policy only lets a
-- rider touch their own row (e.g. last_read_at) — organizers had no UPDATE
-- grant at all. This adds one scoped to their own ride's members; the
-- trigger below then restricts exactly which columns each actor may change.
create policy "Organizer can update attendance"
  on public.ride_members for update
  to authenticated
  using ((select organizer_id from public.rides where id = ride_id) = (select auth.uid()))
  with check ((select organizer_id from public.rides where id = ride_id) = (select auth.uid()));

create or replace function public.enforce_ride_member_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  is_self boolean;
  is_organizer boolean;
  ride_has_passed boolean;
begin
  is_self := (select auth.uid()) = old.user_id;
  select (select auth.uid()) = organizer_id, ride_date < current_date
    into is_organizer, ride_has_passed
  from public.rides
  where id = old.ride_id;

  if is_self then
    if new.role is distinct from old.role
      or new.user_id is distinct from old.user_id
      or new.ride_id is distinct from old.ride_id
      or new.joined_at is distinct from old.joined_at
      or new.attendance_status is distinct from old.attendance_status
    then
      raise exception 'You can only update your own read receipt';
    end if;
  elsif is_organizer then
    if new.role is distinct from old.role
      or new.user_id is distinct from old.user_id
      or new.ride_id is distinct from old.ride_id
      or new.joined_at is distinct from old.joined_at
      or new.last_read_at is distinct from old.last_read_at
    then
      raise exception 'Organizers can only update attendance status';
    end if;
    if new.attendance_status is distinct from old.attendance_status and not ride_has_passed then
      raise exception 'Attendance can only be marked after the ride date';
    end if;
  else
    raise exception 'Not authorized to update this membership';
  end if;

  return new;
end;
$function$;

create trigger ride_members_before_update_guard
  before update on public.ride_members
  for each row
  execute function public.enforce_ride_member_update();
