-- Route (marketplace split payments) isn't enabled on the merchant's
-- Razorpay account and requires per-organizer linked-account KYC we're no
-- longer doing. Switch to: all payments land in the platform's single
-- Razorpay account, and the platform settles each organizer manually
-- (tracked in ride_bookings.settled_at, added in a later migration).

alter table public.profiles
  drop column razorpay_account_id,
  drop column payout_kyc_status;

drop type public.payout_kyc_status;

create type public.payout_method as enum (
  'upi',
  'bank'
);

-- One row per organizer with the bank/UPI details the platform pays out to
-- manually — purely a reference record for the settlement dashboard, no
-- Razorpay API involvement.
create table public.organizer_payout_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  payout_method public.payout_method not null,
  upi_id text,
  bank_account_number text,
  bank_ifsc text,
  bank_account_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizer_payout_details_method_fields check (
    (payout_method = 'upi' and upi_id is not null)
    or (
      payout_method = 'bank'
      and bank_account_number is not null
      and bank_ifsc is not null
      and bank_account_name is not null
    )
  )
);

comment on table public.organizer_payout_details is 'Bank/UPI details an organizer provides so the platform can settle their Organized Ride earnings manually.';

alter table public.organizer_payout_details enable row level security;

create policy "Organizer manages their own payout details"
  on public.organizer_payout_details for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
