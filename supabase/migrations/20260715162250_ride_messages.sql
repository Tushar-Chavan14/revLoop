-- Realtime chat messages scoped to a ride, participants only.

create table public.ride_messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  image_url text,
  created_at timestamptz not null default now(),
  constraint ride_messages_has_content check (body is not null or image_url is not null)
);

comment on table public.ride_messages is 'Realtime chat messages scoped to a ride, participants only.';

create index ride_messages_ride_id_created_at_idx on public.ride_messages (ride_id, created_at);
create index ride_messages_sender_id_idx on public.ride_messages (sender_id);

alter table public.ride_messages enable row level security;
alter publication supabase_realtime add table public.ride_messages;

create policy "Participants can view ride chat"
  on public.ride_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.ride_members
      where ride_members.ride_id = ride_messages.ride_id
        and ride_members.user_id = (select auth.uid())
    )
  );

create policy "Participants can send ride chat messages"
  on public.ride_messages for insert
  to authenticated
  with check (
    (select auth.uid()) = sender_id
    and exists (
      select 1 from public.ride_members
      where ride_members.ride_id = ride_messages.ride_id
        and ride_members.user_id = (select auth.uid())
    )
  );
