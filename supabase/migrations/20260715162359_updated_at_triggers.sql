-- Keep updated_at current on mutable rows.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger rides_set_updated_at
  before update on public.rides
  for each row
  execute function public.set_updated_at();
