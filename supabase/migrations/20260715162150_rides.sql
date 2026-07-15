-- Group rides created by organizers.

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  ride_date date not null,
  departure_time time not null,
  meeting_point text not null,
  meeting_lat double precision not null check (meeting_lat between -90 and 90),
  meeting_lng double precision not null check (meeting_lng between -180 and 180),
  destination text not null,
  destination_lat double precision not null check (destination_lat between -90 and 90),
  destination_lng double precision not null check (destination_lng between -180 and 180),
  city text not null,
  max_riders smallint not null check (max_riders > 0),
  ride_type public.ride_type not null,
  speed public.speed_level not null,
  difficulty public.rider_level not null,
  breakfast_stop boolean not null default false,
  fuel_stop boolean not null default false,
  helmet_required boolean not null default true,
  pillion_allowed boolean not null default true,
  estimated_distance_km numeric(6, 2) check (estimated_distance_km is null or estimated_distance_km >= 0),
  estimated_duration_minutes integer check (estimated_duration_minutes is null or estimated_duration_minutes >= 0),
  cover_image_url text,
  status public.ride_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rides is 'Group rides created by organizers.';

create index rides_organizer_id_idx on public.rides (organizer_id);
create index rides_ride_date_idx on public.rides (ride_date);
create index rides_city_idx on public.rides (city);
create index rides_ride_type_idx on public.rides (ride_type);
create index rides_upcoming_idx on public.rides (ride_date) where status = 'upcoming';

alter table public.rides enable row level security;

create policy "Rides are viewable by everyone"
  on public.rides for select
  to anon, authenticated
  using (true);

create policy "Organizers can create rides"
  on public.rides for insert
  to authenticated
  with check ((select auth.uid()) = organizer_id);

create policy "Organizers can update their rides"
  on public.rides for update
  to authenticated
  using ((select auth.uid()) = organizer_id)
  with check ((select auth.uid()) = organizer_id);

create policy "Organizers can delete their rides"
  on public.rides for delete
  to authenticated
  using ((select auth.uid()) = organizer_id);
