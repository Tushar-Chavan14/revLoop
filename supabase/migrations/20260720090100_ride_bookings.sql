-- Paid reservations for Organized Rides. Confirmed only by the Razorpay
-- webhook handler (service role) — no update policy is granted to
-- authenticated/anon so a client can never mark its own booking "paid".

create table public.ride_bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  rider_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(10, 2) not null,
  platform_fee_amount numeric(10, 2) not null,
  organizer_amount numeric(10, 2) not null,
  currency text not null default 'INR',
  razorpay_order_id text not null,
  razorpay_payment_id text,
  status public.booking_status not null default 'created',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

comment on table public.ride_bookings is 'Paid reservations for Organized Rides, confirmed by the Razorpay webhook.';

create index ride_bookings_ride_id_idx on public.ride_bookings (ride_id);
create index ride_bookings_rider_id_idx on public.ride_bookings (rider_id);
create unique index ride_bookings_razorpay_order_id_idx on public.ride_bookings (razorpay_order_id);

-- One active (created or paid) booking per rider per ride; a failed/cancelled
-- attempt doesn't block retrying.
create unique index ride_bookings_active_unique_idx
  on public.ride_bookings (ride_id, rider_id)
  where status in ('created', 'paid');

alter table public.ride_bookings enable row level security;

create policy "Rider or organizer can view a booking"
  on public.ride_bookings for select
  to authenticated
  using (
    (select auth.uid()) = rider_id
    or (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
  );

create policy "Riders can create their own booking"
  on public.ride_bookings for insert
  to authenticated
  with check (
    (select auth.uid()) = rider_id
    and (select auth.uid()) <> (select organizer_id from public.rides where id = ride_id)
  );

-- When a booking is marked paid, seat the rider as a ride member atomically —
-- mirrors handle_ride_request_accepted's capacity guard for Community Rides,
-- so seats_available on rides_with_stats stays correct for both ride types.
create or replace function public.handle_ride_booking_paid()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_max_riders smallint;
  v_member_count bigint;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    select max_riders into v_max_riders from public.rides where id = new.ride_id;
    select count(*) into v_member_count from public.ride_members where ride_id = new.ride_id;

    if v_member_count >= v_max_riders then
      raise exception 'Ride is already full';
    end if;

    insert into public.ride_members (ride_id, user_id, role)
    values (new.ride_id, new.rider_id, 'participant')
    on conflict (ride_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger ride_bookings_after_paid
  after update on public.ride_bookings
  for each row
  execute function public.handle_ride_booking_paid();
