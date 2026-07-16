-- Attendance should be markable as soon as the ride's departure time has
-- passed, not only the day after — a weekend ride starting at 6am shouldn't
-- make the organizer wait until midnight to mark attendance.
create or replace function public.enforce_ride_member_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  is_self boolean;
  is_organizer boolean;
  ride_has_started boolean;
begin
  is_self := (select auth.uid()) = old.user_id;
  select
    (select auth.uid()) = organizer_id,
    (ride_date + departure_time) < (now() at time zone 'utc')
    into is_organizer, ride_has_started
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
    if new.attendance_status is distinct from old.attendance_status and not ride_has_started then
      raise exception 'Attendance can only be marked after the ride has started';
    end if;
  else
    raise exception 'Not authorized to update this membership';
  end if;

  return new;
end;
$function$;
