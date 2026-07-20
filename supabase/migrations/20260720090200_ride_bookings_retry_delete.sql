-- Riders need to retry after an interrupted payment. Rather than allowing any
-- update to ride_bookings (which would need careful trigger-gating to stop a
-- client ever setting status='paid' themselves), we allow deleting only their
-- own still-"created" (never paid) attempt, then a fresh row is inserted for
-- the retry using the existing insert policy.

create policy "Rider can delete their own unpaid booking attempt"
  on public.ride_bookings for delete
  to authenticated
  using ((select auth.uid()) = rider_id and status = 'created');
