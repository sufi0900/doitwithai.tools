-- V5 Phase 7: Dual-Quota Commercial Metering for Existing Page Optimization
-- Tracks `existing_page_optimization` alongside `article`, `social`, `image`, and `audit`
-- inside the existing monthly USD & token ceilings (Starter: 10, Growth: 30, Agency Scale: 100).

begin;

create or replace function public.agency_asset_usage(owner uuid)
returns table(kind text, month_count bigint, day_count bigint, month_limit integer)
language sql stable set search_path='' set timezone='UTC' as $$
  with b as (select * from public.agency_budget(owner)),
  articles as (
    select started_at as stamp from public.agency_production_runs where workspace_id=owner and started_at>=date_trunc('month',now())
    union all select w.created_at from public.agency_specialist_work w where w.workspace_id=owner and w.specialist='writer'
      and w.created_at>=date_trunc('month',now()) and not exists(select from public.agency_production_runs r where r.id=w.id)
  )
  select 'article', count(*), count(*) filter(where stamp>=current_date), (select article_limit from b) from articles
  union all select 'existing_page_optimization', count(*), count(*) filter(where created_at>=current_date),
    (select case tier when 'starter' then 10 when 'growth' then 30 else 100 end from b)
    from public.agency_specialist_work where workspace_id=owner and specialist='refresh' and created_at>=date_trunc('month',now())
  union all select 'social', count(*), count(*) filter(where created_at>=current_date), (select social_limit from b)
    from public.social_ledger where workspace_id=owner and created_at>=date_trunc('month',now())
  union all select 'image', count(*), count(*) filter(where created_at>=current_date),
    (select case tier when 'starter' then 0 when 'growth' then 30 else 100 end from b)
    from public.agency_image_requests where workspace_id=owner and created_at>=date_trunc('month',now())
  union all select 'audit', count(*), count(*) filter(where cycle=current_date), (select audit_limit from b)
    from public.agency_site_scans where workspace_id=owner and cycle>=date_trunc('month',now())::date
$$;

revoke all on function public.agency_asset_usage(uuid) from public, anon, authenticated;
grant execute on function public.agency_asset_usage(uuid) to service_role;

create or replace function public.agency_enforce_asset_limit() returns trigger
language plpgsql security definer set search_path='' set timezone='UTC' as $$
declare used integer; today integer; ceiling integer; daily_ceiling integer; asset_kind text;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.workspace_id::text, 8));
  if tg_table_name = 'agency_specialist_work' then
    if new.specialist = 'writer' and exists(select from public.agency_production_runs where id = new.id) then
      return null;
    end if;
    asset_kind := case new.specialist when 'refresh' then 'existing_page_optimization' else 'article' end;
  else
    asset_kind := case tg_table_name
      when 'social_ledger' then 'social'
      when 'agency_site_scans' then 'audit'
      else 'article'
    end;
  end if;

  select a.month_count, a.day_count, a.month_limit into strict used, today, ceiling
    from public.agency_asset_usage(new.workspace_id) a where a.kind = asset_kind;
  daily_ceiling := ceil(ceiling / 10.0);
  if used > ceiling or today > daily_ceiling then
    raise exception 'Workspace asset allowance reached';
  end if;
  return null;
end $$;

drop trigger if exists agency_refresh_limit on public.agency_specialist_work;
create trigger agency_refresh_limit
  after insert on public.agency_specialist_work
  for each row when (new.specialist = 'refresh')
  execute function public.agency_enforce_asset_limit();

commit;
