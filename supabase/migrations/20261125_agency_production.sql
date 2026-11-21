begin;
create table public.agency_production_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  plan_id uuid not null references public.agency_calendar_quotas,
  item_id uuid not null references public.content_items,
  invocation text not null unique,
  target_slug text not null,
  cycle_date date not null,
  revision integer not null,
  qa_calls integer not null default 0 check (qa_calls between 0 and 2),
  calls integer not null default 0 check (calls between 0 and 6),
  status text not null default 'drafting',
  started_at timestamptz not null default now(),
  unique(workspace_id,target_slug,cycle_date)
);
alter table public.agency_production_runs enable row level security;
revoke all on public.agency_production_runs from public,anon,authenticated;
grant select on public.agency_production_runs to authenticated;
grant all on public.agency_production_runs to service_role;
create policy own_runs on public.agency_production_runs for select to authenticated using(workspace_id=(select auth.uid()));
create index on public.agency_production_runs(workspace_id,started_at desc);

create function public.agency_claim_production(plan uuid, daily_limit integer, run_key text)
returns uuid language plpgsql set search_path='' as $$
declare p public.agency_calendar_quotas; item public.content_items; rid uuid; rev integer; slug text;
  today date := (now() at time zone 'UTC')::date;
begin
  select * into strict p from public.agency_calendar_quotas where id=plan for update;
  select id into rid from public.agency_production_runs where invocation=run_key and plan_id=plan;
  if found then return rid; end if;
  if today not between p.start_date and p.end_date or daily_limit<1 then return null; end if;
  if (select count(*) from public.agency_production_runs where workspace_id=p.workspace_id and cycle_date=today)>=daily_limit
    or exists(select from public.agency_production_runs where workspace_id=p.workspace_id and started_at>now()-make_interval(mins=>p.cooldown_minutes))
    then return null; end if;
  select revision into rev from public.tenant_brand_dna where workspace_id=p.workspace_id and approved_at is not null for share;
  if not found then return null; end if;
  select * into item from public.content_items c where c.workspace_id=p.workspace_id and c.status='queued'
    and c.content->>'kind'='create' and c.content->>'brandRevision'=rev::text
    order by c.content->>'priority_at' desc nulls last,c.id limit 1 for update skip locked;
  if not found then return null; end if;
  slug := trim(both '-' from regexp_replace(lower(item.content->>'topic'),'[^a-z0-9]+','-','g'));
  if slug='' then slug:=item.id::text; end if;
  insert into public.agency_production_runs(workspace_id,plan_id,item_id,invocation,target_slug,cycle_date,revision)
    values(p.workspace_id,plan,item.id,run_key,slug,today,rev) on conflict do nothing returning id into rid;
  update public.content_items set status=case when rid is null then 'paused' else 'drafting' end where id=item.id;
  return rid;
end $$;

create function public.agency_reserve_model_call(run uuid, specialist text default '') returns boolean language sql set search_path='' as $$
  update public.agency_production_runs r set calls=calls+1,qa_calls=qa_calls+case when specialist='qa' then 1 else 0 end where r.id=run and calls<6 and (specialist<>'qa' or qa_calls<2) and status='drafting'
    and exists(select from public.tenant_brand_dna b where b.workspace_id=r.workspace_id and b.revision=r.revision and b.approved_at is not null)
    returning true
$$;
revoke all on function public.agency_claim_production(uuid,integer,text), public.agency_reserve_model_call(uuid,text) from public,anon,authenticated;
grant execute on function public.agency_claim_production(uuid,integer,text), public.agency_reserve_model_call(uuid,text) to service_role;
create function public.agency_record_pipeline_review(run uuid,attempt_no integer,article jsonb,card jsonb)
returns void language plpgsql set search_path='' as $$
declare r public.agency_production_runs; strategy integer; outcome text:=card->>'disposition';
begin
  select * into strict r from public.agency_production_runs where id=run for update;
  if exists(select from public.qa_audit_logs where workspace_id=r.workspace_id and payload->>'workId'=run::text and payload->>'attempt'=attempt_no::text) then return; end if;
  if r.status<>'drafting' then raise exception 'Run is closed'; end if;
  select coalesce((profile->>'strategy_bus_version')::integer,1) into strict strategy from public.tenant_brand_dna
    where workspace_id=r.workspace_id and revision=r.revision and approved_at is not null for share;
  insert into public.agency_specialist_work(id,workspace_id,specialist,prompt_version,strategy_version,task,result)
    values(run,r.workspace_id,'writer','commercial-1',strategy,article->>'title',article->>'compiledMarkdownBody')
    on conflict (id) do update set result=excluded.result;
  insert into public.qa_audit_logs(workspace_id,payload) values(r.workspace_id,
    card || jsonb_build_object('workId',run,'revision',r.revision,'attempt',attempt_no,'article',article));
  if outcome<>'revision' then
    update public.agency_production_runs set status=outcome where id=run;
    update public.content_items set status=case when outcome='approved' then 'ready' else outcome end where id=r.item_id;
  end if;
end $$;
revoke all on function public.agency_record_pipeline_review(uuid,integer,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.agency_record_pipeline_review(uuid,integer,jsonb,jsonb) to service_role;

create table public.agency_deliveries (
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  slug text not null, cycle_date date not null, review_id uuid not null references public.qa_audit_logs,
  status text not null default 'sending', receipt jsonb, confirmed_at timestamptz,
  primary key (workspace_id,slug,cycle_date), unique(workspace_id,review_id)
);
alter table public.agency_deliveries enable row level security;
revoke all on public.agency_deliveries from public,anon,authenticated;
grant select on public.agency_deliveries to authenticated;
grant all on public.agency_deliveries to service_role;
create policy own_delivery on public.agency_deliveries for select to authenticated using(workspace_id=(select auth.uid()));

create function public.agency_confirm_delivery(owner uuid, review uuid, result jsonb)
returns void language plpgsql set search_path='' as $$
declare work text;
begin
  update public.agency_deliveries set status=result->>'postStatus',confirmed_at=now(),receipt=result
    where workspace_id=owner and review_id=review and status='sending';
  if not found then raise exception 'Delivery reservation unavailable'; end if;
  select payload->>'workId' into work from public.qa_audit_logs where id=review and workspace_id=owner;
  update public.content_items c set status=result->>'postStatus' from public.agency_production_runs r
    where r.workspace_id=owner and r.id::text=work and r.item_id=c.id;
  update public.agency_production_runs set status=result->>'postStatus' where workspace_id=owner and id::text=work;
end $$;
revoke all on function public.agency_confirm_delivery(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.agency_confirm_delivery(uuid,uuid,jsonb) to service_role;
create unique index agency_pin_source_variant on public.social_ledger
  (workspace_id,(payload->>'review'),(payload->>'variant')) where payload->>'channel'='pinterest';
create function public.agency_queue_calendar_pins(plan uuid, daily_limit integer)
returns integer language plpgsql set search_path='' as $$
declare p public.agency_calendar_quotas; today date:=(now() at time zone 'UTC')::date; used integer; added integer;
begin
  select * into strict p from public.agency_calendar_quotas where id=plan for update;
  if today not between p.start_date and p.end_date then return 0; end if;
  select count(*) into used from public.social_ledger where workspace_id=p.workspace_id and payload->>'plan'=plan::text and payload->>'day'=today::text;
  insert into public.social_ledger(workspace_id,payload)
    select p.workspace_id,jsonb_build_object('channel','pinterest','status','draft','plan',plan,'day',today,'review',q.id,'variant',v,
      'title',q.payload->'article'->>'title','description',case when v='summary' then q.payload->'article'->>'metaDescription'
      else left(q.payload->'article'->>'compiledMarkdownBody',480) end,'target_url',d.receipt->>'publishedOrStagedUrl')
    from public.agency_deliveries d join public.qa_audit_logs q on q.id=d.review_id and q.workspace_id=d.workspace_id
    join public.tenant_brand_dna b on b.workspace_id=d.workspace_id and b.approved_at is not null and b.revision::text=q.payload->>'revision'
    cross join unnest(array['summary','excerpt']) v
    where d.workspace_id=p.workspace_id and d.status='published' and d.receipt->>'publishedOrStagedUrl' ~ '^https?://'
    and not exists(select from public.social_ledger s where s.workspace_id=p.workspace_id and s.payload->>'channel'='pinterest'
      and s.payload->>'review'=q.id::text and s.payload->>'variant'=v)
    order by d.confirmed_at desc,q.id,v limit greatest(0,least(daily_limit,p.pins)-used) on conflict do nothing;
  get diagnostics added=row_count;
  return added;
end $$;
revoke all on function public.agency_queue_calendar_pins(uuid,integer) from public,anon,authenticated;
grant execute on function public.agency_queue_calendar_pins(uuid,integer) to service_role;

create function public.agency_progress(days integer)
returns table(day date,started bigint,published bigint) language sql stable security invoker set search_path='' as $$
  with dates as (
    select (now() at time zone 'UTC')::date - n as d from generate_series(0,case when days in (7,30,90) then days-1 else 6 end) n
  ), starts as (
    select cycle_date d,count(*) n from public.agency_production_runs where workspace_id=auth.uid() and cycle_date>=(select min(d) from dates) group by 1
  ), deliveries as (
    select (confirmed_at at time zone 'UTC')::date d,count(*) n from public.agency_deliveries where workspace_id=auth.uid() and status='published'
      and confirmed_at>=((select min(d) from dates)::timestamp at time zone 'UTC') group by 1
  )
  select dates.d,coalesce(starts.n,0),coalesce(deliveries.n,0) from dates left join starts using(d) left join deliveries using(d) order by dates.d
$$;
revoke all on function public.agency_progress(integer) from public,anon;
grant execute on function public.agency_progress(integer) to authenticated;
commit;
