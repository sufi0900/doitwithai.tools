create table if not exists public.writer_assistant_threads (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null check (char_length(project_id) between 1 and 180),
  thread_id text not null check (char_length(thread_id) between 1 and 180),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 4000000),
  saved_at bigint not null,
  primary key (user_id, project_id, thread_id)
);

create index if not exists writer_assistant_threads_recent
  on public.writer_assistant_threads (user_id, project_id, saved_at desc);

alter table public.writer_assistant_threads enable row level security;
revoke all on public.writer_assistant_threads from anon;
grant select, insert, update on public.writer_assistant_threads to authenticated;

drop policy if exists writer_assistant_owner_read on public.writer_assistant_threads;
create policy writer_assistant_owner_read on public.writer_assistant_threads
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists writer_assistant_owner_insert on public.writer_assistant_threads;
create policy writer_assistant_owner_insert on public.writer_assistant_threads
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists writer_assistant_owner_update on public.writer_assistant_threads;
create policy writer_assistant_owner_update on public.writer_assistant_threads
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
