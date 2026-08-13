-- Defense-in-depth alongside the server-action checks: enforce at the
-- database level that (a) a ride's pricing_model matches its creator's
-- account_type, (b) an admin can never create an Organized Ride regardless
-- of their own account_type, and (c) only rider accounts can insert a join
-- request or a booking — an organizer account can never join/book any ride.

drop policy "Organizers can create rides" on public.rides;

create policy "Organizers can create rides"
  on public.rides for insert
  to authenticated
  with check (
    (select auth.uid()) = organizer_id
    and (
      (
        pricing_model = 'organized'
        and (select account_type from public.profiles where id = (select auth.uid())) = 'organizer'
        and not public.is_admin((select auth.uid()))
      )
      or (
        pricing_model = 'community'
        and (select account_type from public.profiles where id = (select auth.uid())) = 'rider'
      )
    )
  );

drop policy "Riders can request to join a ride" on public.ride_requests;

create policy "Riders can request to join a ride"
  on public.ride_requests for insert
  to authenticated
  with check (
    (select auth.uid()) = requester_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
    and (select account_type from public.profiles where id = (select auth.uid())) = 'rider'
  );

drop policy "Riders can create their own booking" on public.ride_bookings;

create policy "Riders can create their own booking"
  on public.ride_bookings for insert
  to authenticated
  with check (
    (select auth.uid()) = rider_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
    and (select account_type from public.profiles where id = (select auth.uid())) = 'rider'
  );
