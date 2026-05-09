create table if not exists public.shout_outs (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (
    length(trim(message)) > 0
    and length(trim(message)) <= 600
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shout_outs_no_self_recognition check (sender_id <> recipient_id)
);

alter table public.shout_outs enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read shout outs" on public.shout_outs;
create policy "Authenticated users can read shout outs"
  on public.shout_outs
  for select
  to authenticated
  using (true);

drop policy if exists "Users can create shout outs as themselves" on public.shout_outs;
create policy "Users can create shout outs as themselves"
  on public.shout_outs
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop trigger if exists set_shout_outs_updated_at on public.shout_outs;
create trigger set_shout_outs_updated_at
  before update on public.shout_outs
  for each row
  execute function public.set_updated_at();
