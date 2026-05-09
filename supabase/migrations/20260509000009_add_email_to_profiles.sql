alter table public.profiles
  add column if not exists email text;

update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

create or replace function public.set_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    select auth_user.email
    into new.email
    from auth.users auth_user
    where auth_user.id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists set_profile_email_from_auth on public.profiles;
create trigger set_profile_email_from_auth
  before insert or update of id, email on public.profiles
  for each row
  execute function public.set_profile_email_from_auth();

create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id
    and email is distinct from new.email;

  return new;
end;
$$;

drop trigger if exists sync_profile_email_from_auth on auth.users;
create trigger sync_profile_email_from_auth
  after update of email on auth.users
  for each row
  execute function public.sync_profile_email_from_auth();
