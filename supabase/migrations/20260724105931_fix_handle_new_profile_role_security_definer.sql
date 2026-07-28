-- handle_new_profile_role() inserts into user_roles on every new profile,
-- but user_roles has no INSERT policy for regular users (only a SELECT
-- policy for viewing your own row) — so the trigger was failing RLS on
-- every single profile completion, rolling back the whole insert. Making
-- it SECURITY DEFINER lets it bypass RLS for this one narrowly-scoped
-- insert (always just new.id, the profile being created), the same way
-- other system-maintained trigger functions in this schema already do.
alter function public.handle_new_profile_role() security definer;
