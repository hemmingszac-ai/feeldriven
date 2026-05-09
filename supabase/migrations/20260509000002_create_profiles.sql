create schema if not exists dbo;

create table if not exists dbo.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  skills_to_develop text[] not null default '{}',
  enjoyable_work text[] not null default '{}',
  stretch_projects text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table dbo.profiles enable row level security;

create policy "Users can read their own profile"
  on dbo.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on dbo.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on dbo.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant usage on schema dbo to authenticated;
grant select, insert, update on table dbo.profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on dbo.profiles;

create trigger set_profiles_updated_at
  before update on dbo.profiles
  for each row
  execute function public.set_updated_at();
