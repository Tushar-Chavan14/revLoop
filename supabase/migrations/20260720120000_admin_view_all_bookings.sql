-- The settlement dashboard needs to see every paid booking across every
-- ride/organizer, but ride_bookings' select policy only covers the rider
-- themselves or that specific ride's organizer. Missed adding the admin
-- counterpart to the admin UPDATE policy added alongside settled_at.
create policy "Admins can view all bookings"
  on public.ride_bookings for select
  to authenticated
  using (public.is_admin((select auth.uid())));
