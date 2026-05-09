create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  skills_to_develop text[] not null default '{}',
  enjoyable_work text[] not null default '{}',
  stretch_projects text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (
  id,
  first_name,
  last_name,
  skills_to_develop,
  enjoyable_work,
  stretch_projects,
  created_at,
  updated_at
)
select
  id,
  first_name,
  last_name,
  skills_to_develop,
  enjoyable_work,
  stretch_projects,
  created_at,
  updated_at
from dbo.profiles
on conflict (id) do update
set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  skills_to_develop = excluded.skills_to_develop,
  enjoyable_work = excluded.enjoyable_work,
  stretch_projects = excluded.stretch_projects,
  updated_at = excluded.updated_at;

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop table if exists dbo.profiles;
drop function if exists dbo.set_updated_at();
drop schema if exists dbo;
