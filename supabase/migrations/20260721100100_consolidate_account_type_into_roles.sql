-- Backfill: organizer accounts (that aren't already admin) become role =
-- 'organizer'. Admins keep 'admin' — the tradeoff accepted is that an
-- admin's prior rider/organizer distinction isn't preserved, since admin is
-- a manually-managed, redirected-away-from-the-normal-app role.
update public.user_roles ur
set role = 'organizer', updated_at = now()
from public.profiles p
where p.id = ur.user_id
  and p.account_type = 'organizer'
  and ur.role = 'user';

-- role is now the single source of truth for rider ('user') vs organizer vs
-- admin, so it needs to be readable for ANY profile (e.g. the public
-- profile page deciding whether to show rider or organizer content for
-- someone else's account) — same "viewable by everyone" posture profiles
-- itself already has.
drop policy "Users can view their own role" on public.user_roles;

create policy "User roles are viewable by everyone"
  on public.user_roles for select
  to anon, authenticated
  using (true);

-- rides: pricing_model must match the creator's role, and admins can never
-- create an Organized Ride regardless of their own role.
drop policy "Organizers can create rides" on public.rides;

create policy "Organizers can create rides"
  on public.rides for insert
  to authenticated
  with check (
    (select auth.uid()) = organizer_id
    and (
      (
        pricing_model = 'organized'
        and (select role from public.user_roles where user_id = (select auth.uid())) = 'organizer'
      )
      or (
        pricing_model = 'community'
        and (select role from public.user_roles where user_id = (select auth.uid())) = 'user'
      )
    )
  );

-- ride_requests / ride_bookings: only 'user' (rider) role may insert.
drop policy "Riders can request to join a ride" on public.ride_requests;

create policy "Riders can request to join a ride"
  on public.ride_requests for insert
  to authenticated
  with check (
    (select auth.uid()) = requester_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
    and (select role from public.user_roles where user_id = (select auth.uid())) = 'user'
  );

drop policy "Riders can create their own booking" on public.ride_bookings;

create policy "Riders can create their own booking"
  on public.ride_bookings for insert
  to authenticated
  with check (
    (select auth.uid()) = rider_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
    and (select role from public.user_roles where user_id = (select auth.uid())) = 'user'
  );

alter table public.profiles drop column account_type;
drop type public.account_type;
