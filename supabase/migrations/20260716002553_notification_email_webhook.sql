create or replace function public.notify_email_on_notification()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform net.http_post(
    url := 'https://jctlkfnwosphtqhojqyt.supabase.co/functions/v1/notification-email',
    body := jsonb_build_object('id', new.id)
  );
  return new;
end;
$function$;

create trigger notifications_after_insert_send_email
after insert on public.notifications
for each row execute function public.notify_email_on_notification();
