begin;

create table public.agency_calendar_quotas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  start_date date not null,
  end_date date not null,
  articles integer not null check (articles between 0 and 10000),
  pins integer not null check (pins between 0 and 20000),
  cooldown_minutes integer not null check (cooldown_minutes between 10 and 1440),
  ramp_start date,
  created_at timestamptz not null default now(),
  check (end_date between start_date and start_date + 365),
  check (articles + pins > 0)
);

alter table public.agency_calendar_quotas enable row level security;
revoke all on public.agency_calendar_quotas from public,anon,authenticated;
grant select on public.agency_calendar_quotas to authenticated;
grant all on public.agency_calendar_quotas to service_role;
create policy read_own_calendar on public.agency_calendar_quotas for select
  to authenticated using (workspace_id = (select auth.uid()));
create index on public.agency_calendar_quotas(workspace_id,start_date);

create function public.agency_plan_calendar(first_day date,last_day date,article_goal integer,pin_goal integer,cooldown integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare owner uuid := auth.uid(); saved uuid; ramp date; capacity integer;
begin
  if owner is null or first_day < (now() at time zone 'UTC')::date then
    raise exception 'Choose a current or future UTC start date';
  end if;
  perform 1 from public.agency_workspaces where id=owner for update;
  if not found then raise exception 'Workspace unavailable'; end if;
  perform 1 from public.tenant_brand_dna where workspace_id=owner and approved_at is not null for share;
  if not found then raise exception 'Approve website knowledge first'; end if;
  if exists(select from public.tenant_brand_dna where workspace_id=owner and coalesce(profile->>'domain_maturity','') <> 'established_site') then
    select coalesce(min(ramp_start),first_day) into ramp from public.agency_calendar_quotas where workspace_id=owner;
    ramp := least(ramp,first_day);
  end if;
  select sum(case when ramp is not null and first_day+d < ramp+7 then 1
                  when ramp is not null and first_day+d < ramp+14 then least(2,1440/cooldown)
                  else 1440/cooldown end) into capacity
    from generate_series(0,least(last_day-first_day,365)) d;
  if article_goal > capacity then raise exception 'Article target exceeds pacing capacity for these dates'; end if;
  select id into saved from public.agency_calendar_quotas where workspace_id=owner
    and start_date=first_day and end_date=last_day and articles=article_goal and pins=pin_goal and cooldown_minutes=cooldown;
  if found then return saved; end if;
  if exists(select from public.agency_calendar_quotas where workspace_id=owner and start_date<=last_day and end_date>=first_day) then
    raise exception 'These dates overlap an existing plan';
  end if;
  insert into public.agency_calendar_quotas(workspace_id,start_date,end_date,articles,pins,cooldown_minutes,ramp_start)
    values(owner,first_day,last_day,article_goal,pin_goal,cooldown,ramp) returning id into saved;
  return saved;
end $$;
revoke all on function public.agency_plan_calendar(date,date,integer,integer,integer) from public,anon;
grant execute on function public.agency_plan_calendar(date,date,integer,integer,integer) to authenticated;

create function public.agency_prioritize_topic(item_id uuid) returns void
language plpgsql security definer set search_path='' as $
begin
  update public.content_items set content=content || jsonb_build_object('priority_at',now())
    where id=item_id and workspace_id=auth.uid() and status='queued';
  if not found then raise exception 'Queued topic unavailable'; end if;
end $;
revoke all on function public.agency_prioritize_topic(uuid) from public,anon;
grant execute on function public.agency_prioritize_topic(uuid) to authenticated;

commit;
