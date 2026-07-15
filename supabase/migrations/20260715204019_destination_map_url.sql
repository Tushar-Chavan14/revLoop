-- Optional organizer-provided Google Maps link for the destination, shown
-- as a convenience link on the ride detail page alongside our own map.
-- Purely supplementary — not used for any coordinates/geocoding.

alter table public.rides
  add column if not exists destination_map_url text;
