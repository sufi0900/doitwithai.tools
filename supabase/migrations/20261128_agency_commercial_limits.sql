begin;

create table public.agency_entitlements (
  workspace_id uuid primary key references public.agency_workspaces on delete cascade,
  tier text not null check (tier in ('starter','growth','agency-scale')),
  byok boolean not null default false check (not byok or tier='agency-scale'),
  daily_tokens integer check (daily_tokens > 0),
  daily_usd numeric check (daily_usd > 0),
  monthly_usd numeric check (monthly_usd > 0)
);
alter table public.agency_entitlements enable row level security;
revoke all on public.agency_entitlements from public,anon,authenticated;
grant select on public.agency_entitlements to authenticated;
grant all on public.agency_entitlements to service_role;
create policy own_entitlement on public.agency_entitlements for select to authenticated using (workspace_id=(select auth.uid()));

alter table public.token_usage_ledger add column held_tokens integer not null default 0,
  add column held_usd numeric not null default 0;
create index agency_meter_window on public.token_usage_ledger(workspace_id,created_at);
create index agency_social_window on public.social_ledger(workspace_id,created_at);

-- UTC billing periods. A missing entitlement gets the bounded Starter allowance.
create function public.agency_budget(owner uuid)
returns table(tier text, byok boolean, month_tokens bigint, day_tokens bigint, month_usd numeric, day_usd numeric,
  month_token_limit integer, day_token_limit integer, month_usd_limit numeric, day_usd_limit numeric,
  article_limit integer,social_limit integer,audit_limit integer)
language sql stable set search_path='' set timezone='UTC' as $$
  with plan as (
    select coalesce(e.tier,'starter') as tier, coalesce(e.byok,false) as byok,
      e.daily_tokens,e.daily_usd,e.monthly_usd from (select owner as id) w left join public.agency_entitlements e on e.workspace_id=w.id
  ), limits as (
    select p.*,v.tokens,v.usd,v.articles,v.social,v.audits from plan p join
      (values ('starter',500000,1.10,20,60,4),('growth',1800000,3.80,60,240,12),('agency-scale',6000000,12.50,200,800,31))
      v(tier,tokens,usd,articles,social,audits) using(tier)
  ), usage as (
    select coalesce(sum(coalesce(total_tokens,held_tokens)),0)::bigint mt,
      coalesce(sum(coalesce(total_tokens,held_tokens)) filter(where created_at>=current_date),0)::bigint dt,
      coalesce(sum(coalesce(calculated_usd,held_usd)),0) mu,
      coalesce(sum(coalesce(calculated_usd,held_usd)) filter(where created_at>=current_date),0) du
    from public.token_usage_ledger where workspace_id=owner and created_at>=date_trunc('month',now())
  )
  select l.tier,l.byok,u.mt,u.dt,u.mu,u.du,l.tokens,coalesce(l.daily_tokens,ceil(l.tokens/10.0)::int),
    coalesce(l.monthly_usd,l.usd),coalesce(l.daily_usd,l.usd/10),l.articles,l.social,l.audits from limits l cross join usage u
$$;

create table public.agency_image_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.agency_image_requests enable row level security;
revoke all on public.agency_image_requests from public,anon,authenticated;
create index agency_image_window on public.agency_image_requests(workspace_id,created_at);

create function public.agency_asset_usage(owner uuid)
returns table(kind text,month_count bigint,day_count bigint,month_limit integer)
language sql stable set search_path='' set timezone='UTC' as $$
  with b as (select * from public.agency_budget(owner)),
  articles as (
    select started_at as stamp from public.agency_production_runs where workspace_id=owner and started_at>=date_trunc('month',now())
    union all select w.created_at from public.agency_specialist_work w where w.workspace_id=owner and w.specialist='writer'
      and w.created_at>=date_trunc('month',now()) and not exists(select from public.agency_production_runs r where r.id=w.id)
  )
  select 'article',count(*),count(*) filter(where stamp>=current_date),(select article_limit from b) from articles
  union all select 'social',count(*),count(*) filter(where created_at>=current_date),(select social_limit from b)
    from public.social_ledger where workspace_id=owner and created_at>=date_trunc('month',now())
  union all select 'image',count(*),count(*) filter(where created_at>=current_date),
    (select case tier when 'starter' then 0 when 'growth' then 30 else 100 end from b)
    from public.agency_image_requests where workspace_id=owner and created_at>=date_trunc('month',now())
  union all select 'audit',count(*),count(*) filter(where cycle=current_date),(select audit_limit from b)
    from public.agency_site_scans where workspace_id=owner and cycle>=date_trunc('month',now())::date
$$;
revoke all on function public.agency_asset_usage(uuid) from public,anon,authenticated;
grant execute on function public.agency_asset_usage(uuid) to service_role;

create function public.agency_reserve_image() returns boolean language plpgsql security definer set search_path='' as $$
declare owner uuid:=auth.uid(); a record;
begin
  if owner is null then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text,8));
  select * into strict a from public.agency_asset_usage(owner) where kind='image';
  if a.month_count>=a.month_limit or a.day_count>=ceil(a.month_limit/10.0) then return false; end if;
  insert into public.agency_image_requests(workspace_id) values(owner);
  return true;
end $$;
revoke all on function public.agency_reserve_image() from public,anon;
grant execute on function public.agency_reserve_image() to authenticated;

create table public.agency_quota_pauses (
  workspace_id uuid primary key references public.agency_workspaces on delete cascade,
  until_at timestamptz not null
);
alter table public.agency_quota_pauses enable row level security;
revoke all on public.agency_quota_pauses from public,anon,authenticated;
grant all on public.agency_quota_pauses to service_role;

create function public.agency_reserve_usage(owner uuid, specialist text, model_id text, provider_id text, tokens integer, usd numeric, use_byok boolean, asset text default null)
returns uuid language plpgsql set search_path='' set timezone='UTC' as $$
declare budget record; reservation uuid; resume_at timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner::text,8));
  select * into budget from public.agency_budget(owner);
  if tokens<=0 or usd<0 or budget.byok<>use_byok then raise exception 'Invalid quota reservation'; end if;
  if exists(select from public.agency_asset_usage(owner) a where a.kind=asset
    and (a.month_count>=a.month_limit or a.day_count>=ceil(a.month_limit/10.0))) then return null; end if;
  if budget.month_tokens+tokens>budget.month_token_limit or budget.day_tokens+tokens>budget.day_token_limit
    or budget.month_usd+usd>budget.month_usd_limit or budget.day_usd+usd>budget.day_usd_limit then
    resume_at:=case when budget.month_tokens>=budget.month_token_limit or budget.month_usd>=budget.month_usd_limit
      then date_trunc('month',now())+interval '1 month' else current_date+interval '1 day' end;
    insert into public.agency_quota_pauses values(owner,resume_at) on conflict(workspace_id) do update set until_at=greatest(agency_quota_pauses.until_at,excluded.until_at);
    return null;
  end if;
  insert into public.token_usage_ledger(workspace_id,operation,model,provider,held_tokens,held_usd)
    values(owner,specialist,model_id,provider_id,tokens,usd) returning id into reservation;
  return reservation;
end $$;

create function public.agency_usage_summary() returns jsonb language sql stable security definer set search_path='' set timezone='UTC' as $$
  select to_jsonb(b) || jsonb_build_object('assets',(select jsonb_agg(to_jsonb(a)) from public.agency_asset_usage(auth.uid()) a),'specialists',coalesce((
    select jsonb_agg(to_jsonb(rows) order by rows.tokens desc) from (
      select operation,coalesce(sum(total_tokens),0) tokens,coalesce(sum(calculated_usd),0) usd,
        count(*) filter (where held_tokens>0 and total_tokens is null) as pending
      from public.token_usage_ledger where workspace_id=auth.uid() and created_at>=date_trunc('month',now()) group by operation
    ) rows),'[]'::jsonb)) from public.agency_budget(auth.uid()) b where auth.uid() is not null
$$;
revoke all on function public.agency_budget(uuid), public.agency_reserve_usage(uuid,text,text,text,integer,numeric,boolean,text),public.agency_usage_summary() from public,anon,authenticated;
grant execute on function public.agency_budget(uuid),public.agency_reserve_usage(uuid,text,text,text,integer,numeric,boolean,text) to service_role;
grant execute on function public.agency_usage_summary() to authenticated;

-- Count durable assets inside their creation transaction, including records predating billing.
create function public.agency_enforce_asset_limit() returns trigger language plpgsql security definer set search_path='' set timezone='UTC' as $$
declare used integer; today integer; ceiling integer; daily_ceiling integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.workspace_id::text,8));
  if tg_table_name='agency_specialist_work' then
    if exists(select from public.agency_production_runs where id=new.id) then return null; end if;
  end if;
  select a.month_count,a.day_count,a.month_limit into strict used,today,ceiling
    from public.agency_asset_usage(new.workspace_id) a where a.kind=case tg_table_name
    when 'social_ledger' then 'social' when 'agency_site_scans' then 'audit' else 'article' end;
  daily_ceiling:=ceil(ceiling/10.0);
  if used>ceiling or today>daily_ceiling then raise exception 'Workspace asset allowance reached'; end if;
  return null;
end $$;
create trigger agency_article_limit after insert on public.agency_production_runs for each row execute function public.agency_enforce_asset_limit();
create trigger agency_writer_limit after insert on public.agency_specialist_work for each row when (new.specialist='writer') execute function public.agency_enforce_asset_limit();
create trigger agency_social_limit after insert on public.social_ledger for each row execute function public.agency_enforce_asset_limit();
create trigger agency_audit_limit after insert on public.agency_site_scans for each row execute function public.agency_enforce_asset_limit();
commit;
