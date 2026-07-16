create or replace function public.enforce_ride_request_transition()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status = old.status then
    return new;
  end if;

  if (select auth.uid()) = (select organizer_id from public.rides where id = old.ride_id) then
    if old.status = 'pending' and new.status in ('accepted', 'rejected') then
      -- organizer responds to a pending request
    elsif old.status = 'accepted' and new.status = 'cancelled' then
      -- organizer removes an existing member
    else
      raise exception 'Organizers may only accept/reject a pending request or remove an accepted member';
    end if;
  elsif (select auth.uid()) = old.requester_id then
    if old.status = 'pending' and new.status = 'cancelled' then
      -- rider cancels their own pending request
    elsif old.status = 'accepted' and new.status = 'cancelled' then
      -- rider leaves the ride themselves
    elsif old.status in ('rejected', 'cancelled') and new.status = 'pending' then
      -- rider requests again after being declined, cancelled, or removed
    else
      raise exception 'Riders may only cancel a pending/accepted request or re-request after it was declined or cancelled';
    end if;
  else
    raise exception 'Not authorized to update this request';
  end if;

  new.responded_at = case
    when new.status in ('accepted', 'rejected') then now()
    when new.status = 'pending' then null
    else old.responded_at
  end;
  return new;
end;
$function$;
