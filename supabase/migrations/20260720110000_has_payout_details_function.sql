-- organizer_payout_details' RLS correctly restricts SELECT to the owner (or
-- an admin) — bank/UPI details shouldn't be visible to random riders. But
-- riders and the booking action both need to answer "has this organizer set
-- up payouts at all?" without seeing the actual details. A SECURITY DEFINER
-- boolean function (mirrors is_admin()) answers that without ever exposing
-- the row itself.
create or replace function public.has_payout_details(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organizer_payout_details where user_id = uid
  );
$$;

grant execute on function public.has_payout_details(uuid) to authenticated;
