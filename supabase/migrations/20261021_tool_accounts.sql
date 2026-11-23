-- Run once in the Supabase SQL Editor. Existing tool pages do not depend on these tables.
begin;
create schema if not exists tool_private;
revoke all on schema tool_private from public, anon, authenticated;
create table if not exists public.tool_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null check (tool_id ~ '^[a-z0-9-]{1,100}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);
create table if not exists public.tool_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null check (tool_id ~ '^[a-z0-9-]{1,100}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);
create table if not exists public.tool_stats (
  tool_id text primary key,
  like_count bigint not null default 0 check (like_count >= 0)
);
create table if not exists tool_private.action_windows (
 user_id uuid primary key references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(), actions integer not null default 0
);
-- Future billing records are separate from editable profile information.
create table if not exists public.tool_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 provider text, customer_id text unique, subscription_id text unique,
 plan text not null default 'free', status text not null default 'free',
 current_period_end timestamptz, updated_at timestamptz not null default now()
);
alter table public.tool_bookmarks enable row level security;
alter table public.tool_likes enable row level security;
alter table public.tool_stats enable row level security;
alter table public.tool_subscriptions enable row level security;
revoke all on public.tool_bookmarks, public.tool_likes, public.tool_stats, public.tool_subscriptions from anon, authenticated;
grant select on public.tool_bookmarks, public.tool_likes, public.tool_subscriptions to authenticated;
grant select on public.tool_stats to anon, authenticated;
grant all on public.tool_bookmarks, public.tool_likes, public.tool_stats, public.tool_subscriptions to service_role;
drop policy if exists bookmarks_owner on public.tool_bookmarks;
create policy bookmarks_owner on public.tool_bookmarks for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists likes_owner on public.tool_likes;
create policy likes_owner on public.tool_likes for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists subscriptions_owner on public.tool_subscriptions;
create policy subscriptions_owner on public.tool_subscriptions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists public_counts on public.tool_stats;
create policy public_counts on public.tool_stats for select to anon, authenticated using (true);

create or replace function tool_private.update_like_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if TG_OP = 'INSERT' then
   insert into public.tool_stats(tool_id,like_count) values(new.tool_id,1)
   on conflict(tool_id) do update set like_count=public.tool_stats.like_count+1;
   return new;
 else
   update public.tool_stats set like_count=greatest(0,like_count-1) where tool_id=old.tool_id;
   return old;
 end if;
end $$;
drop trigger if exists update_tool_like_count on public.tool_likes;
create trigger update_tool_like_count after insert or delete on public.tool_likes for each row execute function tool_private.update_like_count();

create or replace function public.set_tool_action(p_user_id uuid,p_tool_id text,p_kind text,p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare action_count integer;
begin
 if p_user_id is null or p_tool_id is null or p_kind is null or p_active is null or p_tool_id !~ '^[a-z0-9-]{1,100}$' or p_kind not in ('bookmark','like') then raise exception 'INVALID_ACTION'; end if;
 insert into tool_private.action_windows as w(user_id,started_at,actions) values(p_user_id,now(),1)
 on conflict(user_id) do update set
  started_at=case when w.started_at < now()-interval '1 minute' then now() else w.started_at end,
  actions=case when w.started_at < now()-interval '1 minute' then 1 else w.actions+1 end
 returning actions into action_count;
 if action_count>60 then raise exception 'ACTION_LIMIT'; end if;
 if p_kind='bookmark' then
  if p_active then insert into public.tool_bookmarks(user_id,tool_id) values(p_user_id,p_tool_id) on conflict do nothing;
  else delete from public.tool_bookmarks where user_id=p_user_id and tool_id=p_tool_id; end if;
 else
  if p_active then insert into public.tool_likes(user_id,tool_id) values(p_user_id,p_tool_id) on conflict do nothing;
  else delete from public.tool_likes where user_id=p_user_id and tool_id=p_tool_id; end if;
 end if;
end $$;
revoke all on function public.set_tool_action(uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function public.set_tool_action(uuid,text,text,boolean) to service_role;
-- Only aggregate counts are broadcast. Personal bookmark and like rows stay private.
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='tool_stats') then
  alter publication supabase_realtime add table public.tool_stats;
 end if;
end $$;
commit;
