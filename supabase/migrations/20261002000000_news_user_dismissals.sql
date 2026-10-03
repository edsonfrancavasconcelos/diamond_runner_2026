revoke insert, update, delete
  on table public.news
  from public, anon, authenticated;

create table if not exists public.news_user_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  news_id text not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, news_id)
);

alter table public.news_user_dismissals enable row level security;

revoke all on table public.news_user_dismissals from public, anon, authenticated;
grant select, insert on table public.news_user_dismissals to authenticated;

drop policy if exists "Users can view their own news dismissals"
  on public.news_user_dismissals;
create policy "Users can view their own news dismissals"
  on public.news_user_dismissals
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can dismiss news for themselves"
  on public.news_user_dismissals;
create policy "Users can dismiss news for themselves"
  on public.news_user_dismissals
  for insert
  to authenticated
  with check (auth.uid() = user_id);
