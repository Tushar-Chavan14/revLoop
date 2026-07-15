-- Enum types shared across the RevLoop schema.

create type public.ride_type as enum (
  'breakfast_ride',
  'weekend_ride',
  'night_ride',
  'touring',
  'adventure',
  'off_road',
  'city_ride',
  'mountain_ride'
);

create type public.speed_level as enum (
  'relaxed',
  'cruising',
  'fast'
);

-- Shared by rides.difficulty (how hard the ride is) and profiles.experience_level
-- (how experienced the rider is) — same three tiers, same meaning either way.
create type public.rider_level as enum (
  'beginner',
  'intermediate',
  'experienced'
);

create type public.ride_status as enum (
  'upcoming',
  'completed',
  'cancelled'
);

create type public.member_role as enum (
  'organizer',
  'participant'
);

create type public.request_status as enum (
  'pending',
  'accepted',
  'rejected',
  'cancelled'
);

create type public.notification_type as enum (
  'ride_join_request',
  'ride_request_accepted',
  'ride_request_rejected',
  'ride_cancelled',
  'ride_reminder'
);
