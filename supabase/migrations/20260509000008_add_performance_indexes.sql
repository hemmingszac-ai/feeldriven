create index if not exists profiles_name_idx
  on public.profiles (first_name, last_name);

create index if not exists shout_outs_created_at_idx
  on public.shout_outs (created_at desc);

create index if not exists shout_outs_sender_id_idx
  on public.shout_outs (sender_id);

create index if not exists shout_outs_recipient_id_idx
  on public.shout_outs (recipient_id);
