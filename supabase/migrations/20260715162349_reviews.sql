-- Post-ride ratings riders leave for each other.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_no_self_review check (reviewer_id <> reviewee_id),
  unique (ride_id, reviewer_id, reviewee_id)
);

comment on table public.reviews is 'Post-ride ratings riders leave for each other.';

create index reviews_ride_id_idx on public.reviews (ride_id);
create index reviews_reviewer_id_idx on public.reviews (reviewer_id);
create index reviews_reviewee_id_idx on public.reviews (reviewee_id);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Ride members can review fellow members after the ride"
  on public.reviews for insert
  to authenticated
  with check (
    (select auth.uid()) = reviewer_id
    and exists (
      select 1 from public.rides
      where rides.id = ride_id and rides.status = 'completed'
    )
    and exists (
      select 1 from public.ride_members
      where ride_members.ride_id = reviews.ride_id and ride_members.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.ride_members
      where ride_members.ride_id = reviews.ride_id and ride_members.user_id = reviewee_id
    )
  );

create policy "Reviewers can update their own review"
  on public.reviews for update
  to authenticated
  using ((select auth.uid()) = reviewer_id)
  with check ((select auth.uid()) = reviewer_id);

create policy "Reviewers can delete their own review"
  on public.reviews for delete
  to authenticated
  using ((select auth.uid()) = reviewer_id);
