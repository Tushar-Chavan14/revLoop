-- The onboarding flow needs to set a brand-new account's role to 'organizer'
-- (the trigger only ever inserts 'user'). Scoped tightly: only from 'user'
-- to 'organizer', only your own row, one-directional — never lets a client
-- touch 'admin' or move away from 'organizer' once set (permanent choice).
create policy "Users can set their own role to organizer once"
  on public.user_roles for update
  to authenticated
  using ((select auth.uid()) = user_id and role = 'user')
  with check ((select auth.uid()) = user_id and role = 'organizer');
