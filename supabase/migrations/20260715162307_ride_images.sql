-- Photo gallery attached to a ride, uploaded via Supabase Storage.

create table public.ride_images (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

comment on table public.ride_images is 'Photo gallery attached to a ride, uploaded via Supabase Storage.';

create index ride_images_ride_id_idx on public.ride_images (ride_id);
create index ride_images_uploader_id_idx on public.ride_images (uploader_id);

alter table public.ride_images enable row level security;

create policy "Ride images are viewable by everyone"
  on public.ride_images for select
  to anon, authenticated
  using (true);

create policy "Participants can add ride images"
  on public.ride_images for insert
  to authenticated
  with check (
    (select auth.uid()) = uploader_id
    and exists (
      select 1 from public.ride_members
      where ride_members.ride_id = ride_images.ride_id
        and ride_members.user_id = (select auth.uid())
    )
  );

create policy "Uploader or organizer can remove a ride image"
  on public.ride_images for delete
  to authenticated
  using (
    (select auth.uid()) = uploader_id
    or (select auth.uid()) = (select organizer_id from public.rides where id = ride_id)
  );
