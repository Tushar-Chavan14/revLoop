-- Superseded by the Dashboard-managed Database Webhook ("notification email
-- webhook" on public.notifications, type "Supabase Edge Functions"), which
-- sends a valid service_role JWT and passes Edge Functions' JWT
-- verification on its own. This hand-written trigger had no auth header and
-- was failing with 401 (missing authorization header) once JWT
-- verification was confirmed to still be on for the deployed function.
drop trigger if exists notifications_after_insert_send_email on public.notifications;
drop function if exists public.notify_email_on_notification();
