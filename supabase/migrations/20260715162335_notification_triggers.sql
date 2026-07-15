-- System-generated notifications. Each function is SECURITY DEFINER so it can
-- write into another user's notifications row (which the table's own RLS
-- policies deliberately don't allow directly), and EXECUTE is revoked from
-- client-facing roles so these can only run via their triggers, never be
-- called directly by a user.

create or replace function public.notify_ride_join_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organizer_id uuid;
  v_ride_title text;
  v_requester_name text;
begin
  select organizer_id, title into v_organizer_id, v_ride_title
  from public.rides where id = new.ride_id;

  select name into v_requester_name
  from public.profiles where id = new.requester_id;

  insert into public.notifications (user_id, type, ride_id, actor_id, message)
  values (
    v_organizer_id,
    'ride_join_request',
    new.ride_id,
    new.requester_id,
    coalesce(v_requester_name, 'A rider') || ' wants to join ' || coalesce(v_ride_title, 'your ride')
  );

  return new;
end;
$$;

create trigger ride_requests_notify_organizer
  after insert on public.ride_requests
  for each row
  execute function public.notify_ride_join_request();

revoke execute on function public.notify_ride_join_request() from public, anon, authenticated;

create or replace function public.notify_ride_request_response()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ride_title text;
begin
  if new.status = old.status or new.status not in ('accepted', 'rejected') then
    return new;
  end if;

  select title into v_ride_title from public.rides where id = new.ride_id;

  insert into public.notifications (user_id, type, ride_id, actor_id, message)
  values (
    new.requester_id,
    case when new.status = 'accepted' then 'ride_request_accepted' else 'ride_request_rejected' end,
    new.ride_id,
    (select organizer_id from public.rides where id = new.ride_id),
    case
      when new.status = 'accepted'
        then 'Your request to join ' || coalesce(v_ride_title, 'the ride') || ' was accepted'
      else 'Your request to join ' || coalesce(v_ride_title, 'the ride') || ' was declined'
    end
  );

  return new;
end;
$$;

create trigger ride_requests_notify_requester
  after update on public.ride_requests
  for each row
  execute function public.notify_ride_request_response();

revoke execute on function public.notify_ride_request_response() from public, anon, authenticated;

create or replace function public.notify_ride_cancelled()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into public.notifications (user_id, type, ride_id, actor_id, message)
    select
      ride_members.user_id,
      'ride_cancelled',
      new.id,
      new.organizer_id,
      coalesce(new.title, 'A ride') || ' has been cancelled'
    from public.ride_members
    where ride_members.ride_id = new.id
      and ride_members.user_id <> new.organizer_id;
  end if;

  return new;
end;
$$;

create trigger rides_notify_cancelled
  after update on public.rides
  for each row
  execute function public.notify_ride_cancelled();

revoke execute on function public.notify_ride_cancelled() from public, anon, authenticated;
