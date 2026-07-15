-- Public bucket for ride cover images, uploaded by the organizer at ride
-- creation/edit time. Public buckets bypass access control for reads, so
-- only insert/update/delete need policies, scoped to the uploader's own
-- folder ({user_id}/...), matching the avatars bucket pattern.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ride-covers', 'ride-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Users can view their own ride cover objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'ride-covers'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own ride covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ride-covers'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own ride covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'ride-covers'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'ride-covers'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own ride covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ride-covers'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
