drop trigger if exists set_profiles_updated_at on dbo.profiles;
drop function if exists public.set_updated_at();

create or replace function dbo.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on dbo.profiles
  for each row
  execute function dbo.set_updated_at();
