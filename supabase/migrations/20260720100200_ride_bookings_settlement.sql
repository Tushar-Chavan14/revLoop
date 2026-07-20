-- Tracks manual settlement (platform pays the organizer their 3%-fee-minus
-- share outside the app) per paid booking, plus the admin access needed to
-- manage it.

alter table public.ride_bookings
  add column settled_at timestamptz;

create policy "Admins can update bookings to record settlement"
  on public.ride_bookings for update
  to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

create policy "Admins can view all payout details"
  on public.organizer_payout_details for select
  to authenticated
  using (public.is_admin((select auth.uid())));
