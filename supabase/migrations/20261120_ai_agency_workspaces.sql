begin;
-- Phase 1 provisions one personal workspace per authenticated owner.
create table public.agency_workspaces (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.agency_workspaces enable row level security;
revoke all on public.agency_workspaces from public, anon, authenticated;
grant select, insert on public.agency_workspaces to authenticated;
create policy own_workspace on public.agency_workspaces to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create table public.tenant_brand_dna (
  workspace_id uuid primary key references public.agency_workspaces on delete cascade,
  domain text not null, profile jsonb not null default '{}', approved_at timestamptz
);
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  status text not null default 'queued', content jsonb not null default '{}'
);
create table public.token_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  created_at timestamptz not null default now(), operation text not null,
  provider text not null, model text not null, prompt_tokens integer,
  completion_tokens integer, thinking_tokens integer, total_tokens integer, calculated_usd numeric
);
do $migration$
declare tbl text;
begin
  foreach tbl in array array['strategy_bus_events','qa_audit_logs','social_ledger'] loop
    execute format('create table public.%I (id uuid primary key default gen_random_uuid(),
      workspace_id uuid not null references public.agency_workspaces on delete cascade,
      created_at timestamptz not null default now(), payload jsonb not null)', tbl);
  end loop;
  foreach tbl in array array['tenant_brand_dna','content_items','strategy_bus_events','qa_audit_logs','social_ledger','token_usage_ledger'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('revoke all on public.%I from public, anon, authenticated', tbl);
    execute format('grant select on public.%I to authenticated', tbl);
    execute format('grant all on public.%I to service_role', tbl);
    execute format('create policy read_own on public.%I for select to authenticated using (workspace_id = (select auth.uid()))', tbl);
    if tbl <> 'tenant_brand_dna' then
      execute format('create index on public.%I (workspace_id)', tbl);
    end if;
  end loop;
end $migration$;
create function public.agency_register_website(site text, goal text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or length(site) > 2048 or site !~ '^https?://' then
    raise exception 'Invalid registration';
  end if;
  insert into public.tenant_brand_dna(workspace_id,domain,profile)
  values(auth.uid(),site,jsonb_build_object('goal',left(goal,500)))
  on conflict (workspace_id) do update set profile = excluded.profile
    where public.tenant_brand_dna.approved_at is null and public.tenant_brand_dna.domain = excluded.domain;
  if not found then raise exception 'Existing website requires review'; end if;
end $$;
revoke all on function public.agency_register_website(text,text) from public,anon;
grant execute on function public.agency_register_website(text,text) to authenticated;
commit;
