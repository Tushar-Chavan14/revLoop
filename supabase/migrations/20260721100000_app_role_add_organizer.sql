-- Consolidating account_type into user_roles: 'user' now doubles as "rider"
-- (the existing default), 'admin' unchanged, and 'organizer' joins as a third
-- mutually-exclusive value. A new enum value must be committed in its own
-- transaction before it can be referenced elsewhere (next migration).
alter type public.app_role add value 'organizer';
