begin;
create function public.agency_change_strategy(expected integer, directive text, retiring text)
returns integer language plpgsql security definer set search_path='' as $$
declare current_profile jsonb; next_version integer; affected integer;
begin
  if auth.uid() is null or length(trim(directive)) not between 3 and 1000 then raise exception 'Invalid strategy'; end if;
  select profile into strict current_profile from public.tenant_brand_dna where workspace_id=auth.uid() and revision=expected and approved_at is not null for update;
  next_version := coalesce((current_profile->>'strategy_bus_version')::integer,1)+1;
  update public.tenant_brand_dna set profile=profile || jsonb_build_object('strategy_bus_version',next_version,'strategy_directive',directive)
    where workspace_id=auth.uid();
  if length(trim(retiring))>1 then
    update public.content_items set status='paused', content=content || jsonb_build_object('pause_reason','strategy_change','strategy_version',next_version)
    where workspace_id=auth.uid() and status='queued' and strpos(lower(content::text),lower(trim(retiring)))>0;
  end if;
  get diagnostics affected = row_count;
  if coalesce(length(trim(retiring)),0)<=1 then affected:=0; end if;
  insert into public.strategy_bus_events(workspace_id,payload) values(auth.uid(),jsonb_build_object('version',next_version,'directive',directive,'retired',retiring,'paused',affected));
  return affected;
end $$;
revoke all on function public.agency_change_strategy(integer,text,text) from public,anon;
grant execute on function public.agency_change_strategy(integer,text,text) to authenticated;
create table public.agency_specialist_work (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  specialist text not null, prompt_version text not null, strategy_version integer not null,
  task text not null, result text not null, created_at timestamptz not null default now()
);
create index on public.agency_specialist_work(workspace_id,specialist,created_at desc);
alter table public.agency_specialist_work enable row level security;
revoke all on public.agency_specialist_work from public,anon,authenticated;
grant select on public.agency_specialist_work to authenticated;
grant all on public.agency_specialist_work to service_role;
create policy read_own on public.agency_specialist_work for select to authenticated using(workspace_id=(select auth.uid()));
create function public.agency_save_specialist_work(owner uuid, expected integer, role_id text, prompt_id text, task_text text, result_text text)
returns void language plpgsql set search_path='' as $$
declare strategy integer;
begin
  select coalesce((profile->>'strategy_bus_version')::integer,1) into strict strategy from public.tenant_brand_dna
    where workspace_id=owner and revision=expected and approved_at is not null for share;
  insert into public.agency_specialist_work(workspace_id,specialist,prompt_version,strategy_version,task,result)
    values(owner,role_id,prompt_id,strategy,task_text,result_text);
end $$;
revoke all on function public.agency_save_specialist_work(uuid,integer,text,text,text,text) from public,anon,authenticated;
grant execute on function public.agency_save_specialist_work(uuid,integer,text,text,text,text) to service_role;
commit;
