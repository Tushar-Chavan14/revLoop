-- In-app notifications delivered to a single recipient. Rows are only ever
-- inserted by the SECURITY DEFINER trigger functions in the next migration —
-- there's no direct insert policy, so a user can never write a notification
-- into someone else's feed.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  ride_id uuid references public.rides (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'In-app notifications delivered to a single recipient.';

create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);
create index notifications_user_id_unread_idx on public.notifications (user_id) where read_at is null;
create index notifications_ride_id_idx on public.notifications (ride_id);

alter table public.notifications enable row level security;
alter publication supabase_realtime add table public.notifications;

create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can mark their notifications as read"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
