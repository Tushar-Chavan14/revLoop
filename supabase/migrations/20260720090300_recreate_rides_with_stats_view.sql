-- Postgres expands `select rides.*` at CREATE VIEW time, so rides_with_stats
-- never picked up the Organized Ride columns added in
-- 20260720090000_organized_ride_fields.sql even though the view definition
-- still literally says `rides.*`. Recreating it forces a fresh expansion.

-- CREATE OR REPLACE can only append columns at the end matching existing
-- positions by name; since the new rides.* columns land in the middle of the
-- expansion (before member_count/seats_available), a plain replace fails
-- with "cannot change name of view column" — drop and recreate instead.
drop view public.rides_with_stats;

create view public.rides_with_stats
with (security_invoker = true) as
select
  rides.*,
  count(ride_members.id) as member_count,
  greatest(rides.max_riders - count(ride_members.id), 0) as seats_available
from public.rides
left join public.ride_members on ride_members.ride_id = rides.id
group by rides.id;
