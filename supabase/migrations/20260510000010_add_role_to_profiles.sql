alter table public.profiles
  add column if not exists role text;

update public.profiles profile
set role = nullif(trim(auth_user.raw_user_meta_data ->> 'role'), '')
from auth.users auth_user
where profile.id = auth_user.id
  and profile.role is null
  and nullif(trim(auth_user.raw_user_meta_data ->> 'role'), '') is not null
  and auth_user.raw_user_meta_data ->> 'role' not in ('Team Manager', 'Team Member');
