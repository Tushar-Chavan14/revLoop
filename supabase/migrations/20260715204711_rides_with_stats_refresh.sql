-- rides_with_stats was defined with `rides.*`, which Postgres expands and
-- freezes at CREATE VIEW time — it does not pick up columns added later via
-- ALTER TABLE (like destination_map_url). CREATE OR REPLACE VIEW can only
-- append brand new columns at the very end of its output; since
-- destination_map_url lands before the computed member_count/seats_available
-- columns, that counts as a mid-list insert and Postgres rejects it. Drop and
-- recreate instead — nothing else depends on this view.

drop view if exists public.rides_with_stats;

create view public.rides_with_stats
with (security_invoker = true) as
select
  rides.*,
  count(ride_members.id) as member_count,
  greatest(rides.max_riders - count(ride_members.id), 0) as seats_available
from public.rides
left join public.ride_members on ride_members.ride_id = rides.id
group by rides.id;
