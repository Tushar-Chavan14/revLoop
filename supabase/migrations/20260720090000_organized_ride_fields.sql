-- Adds the Organized Ride pricing model alongside the existing free Community Ride flow.

create type public.pricing_model as enum (
  'community',
  'organized'
);

create type public.booking_status as enum (
  'created',
  'paid',
  'failed',
  'cancelled'
);

create type public.payout_kyc_status as enum (
  'not_started',
  'pending',
  'activated',
  'rejected'
);

alter table public.rides
  add column pricing_model public.pricing_model not null default 'community',
  add column ride_fee numeric(10, 2) check (ride_fee is null or ride_fee > 0),
  add column currency text not null default 'INR',
  add column booking_deadline timestamptz,
  add column minimum_riders smallint check (minimum_riders is null or minimum_riders > 0),
  add column ride_inclusions text[] not null default '{}',
  add column ride_exclusions text[] not null default '{}',
  add column ride_itinerary jsonb not null default '[]',
  add column cancellation_policy text,
  add constraint rides_organized_requires_fee
    check (pricing_model = 'community' or ride_fee is not null);

create index rides_pricing_model_idx on public.rides (pricing_model);

alter table public.profiles
  add column razorpay_account_id text,
  add column payout_kyc_status public.payout_kyc_status not null default 'not_started';
