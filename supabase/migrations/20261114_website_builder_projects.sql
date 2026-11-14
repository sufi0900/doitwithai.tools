-- Consolidated & Idempotent Migration for DoItWithAI Flagship Website Builder & Ecosystem Bridge
-- Combines Voxfolio v1-v27 schema & RLS/RPC governance under isolated `website_*` tables & `website-media` storage.

begin;

create extension if not exists pgcrypto;

-- 1. Core Website Projects & Revisions
create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  creation_mode text not null check (creation_mode in ('guided', 'template')),
  template_id text,
  document jsonb not null,
  revision integer not null default 0,
  variant_of_project_id uuid references public.website_projects(id) on delete set null,
  source_revision integer,
  opportunity_status text not null default 'canonical'
    check (opportunity_status in ('canonical', 'draft', 'review', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_projects_owner_variant_idx
  on public.website_projects(owner_id, variant_of_project_id, updated_at desc);

create table if not exists public.website_revisions (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.website_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  revision integer not null,
  document jsonb not null,
  source text not null default 'autosave',
  created_at timestamptz not null default now(),
  unique(project_id, revision)
);

alter table public.website_projects enable row level security;
alter table public.website_revisions enable row level security;

drop policy if exists "owners manage website projects" on public.website_projects;
create policy "owners manage website projects" on public.website_projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "owners read website revisions" on public.website_revisions;
create policy "owners read website revisions" on public.website_revisions
  for select using (auth.uid() = owner_id);

drop policy if exists "owners add website revisions" on public.website_revisions;
create policy "owners add website revisions" on public.website_revisions
  for insert with check (auth.uid() = owner_id);

create or replace function public.save_website_project(
  p_project_id uuid,
  p_document jsonb,
  p_expected_revision integer,
  p_source text default 'autosave'
) returns integer
language plpgsql security invoker set search_path = public as $$
declare next_revision integer;
begin
  update public.website_projects set
    document = p_document,
    revision = revision + 1,
    updated_at = now(),
    opportunity_status = coalesce(p_document #>> '{opportunity,status}', opportunity_status)
  where id = p_project_id and owner_id = auth.uid() and revision = p_expected_revision
  returning revision into next_revision;

  if next_revision is null then raise exception 'revision_conflict'; end if;

  insert into public.website_revisions(project_id, owner_id, revision, document, source)
  values (p_project_id, auth.uid(), next_revision, p_document, p_source);

  return next_revision;
end; $$;

create or replace function public.restore_website_revision(
  p_project_id uuid,
  p_target_revision integer,
  p_expected_revision integer
) returns integer
language plpgsql security invoker set search_path = public as $$
declare
  current_project public.website_projects%rowtype;
  target_document jsonb;
  restored_document jsonb;
  next_revision integer;
begin
  select * into current_project from public.website_projects
  where id = p_project_id and owner_id = auth.uid() for update;
  if current_project.id is null then raise exception 'project_not_found'; end if;
  if current_project.revision <> p_expected_revision then raise exception 'revision_conflict'; end if;

  select document into target_document from public.website_revisions
  where project_id = p_project_id and owner_id = auth.uid() and revision = p_target_revision;
  if target_document is null then raise exception 'revision_not_found'; end if;

  next_revision := current_project.revision + 1;
  restored_document := jsonb_set(
    jsonb_set(target_document, '{revision}', to_jsonb(next_revision), true),
    '{updatedAt}', to_jsonb(now()::text), true
  );

  update public.website_projects
  set document = restored_document, revision = next_revision, updated_at = now()
  where id = p_project_id and owner_id = auth.uid();

  insert into public.website_revisions(project_id, owner_id, revision, document, source)
  values (p_project_id, auth.uid(), next_revision, restored_document, 'restore:' || p_target_revision::text);

  return next_revision;
end; $$;

-- 2. Immutable Public Snapshots
create table if not exists public.website_publications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 64),
  revision integer not null check (revision >= 0),
  document jsonb not null,
  published_at timestamptz not null default now(),
  superseded_at timestamptz
);

create unique index if not exists website_publications_live_project_idx
  on public.website_publications(project_id) where superseded_at is null;
create unique index if not exists website_publications_live_slug_idx
  on public.website_publications(slug) where superseded_at is null;

alter table public.website_publications enable row level security;

drop policy if exists "owners manage website publications" on public.website_publications;
create policy "owners manage website publications" on public.website_publications
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "visitors read live public website publications" on public.website_publications;
create policy "visitors read live public website publications" on public.website_publications
  for select using (
    superseded_at is null and (
      coalesce(document #>> '{opportunity,status}', 'canonical') = 'canonical'
      or document #>> '{opportunity,visibility}' = 'public'
    )
  );

create or replace function public.publish_website_snapshot(
  p_project_id uuid,
  p_slug text,
  p_expected_revision integer,
  p_snapshot jsonb,
  p_expected_publication_id uuid
) returns table(slug text, revision integer, published_at timestamptz)
language plpgsql security invoker set search_path = public as $$
declare selected_project public.website_projects%rowtype;
begin
  select * into selected_project from public.website_projects
  where id = p_project_id and owner_id = auth.uid() for update;
  if selected_project.id is null then raise exception 'project_not_found'; end if;
  if selected_project.revision <> p_expected_revision then raise exception 'revision_conflict'; end if;
  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or char_length(p_slug) not between 3 and 64 then raise exception 'invalid_slug'; end if;
  if p_snapshot->>'projectId' <> p_project_id::text then raise exception 'project_mismatch'; end if;
  if p_snapshot->'opportunity' is distinct from selected_project.document->'opportunity' then raise exception 'opportunity_mismatch'; end if;
  if coalesce(selected_project.document#>>'{opportunity,status}', 'canonical') <> 'canonical'
     and selected_project.document#>>'{opportunity,visibility}' = 'private' then
    raise exception 'private_variant';
  end if;
  if (select id from public.website_publications where project_id = p_project_id and superseded_at is null) is distinct from p_expected_publication_id then
    raise exception 'publication_conflict';
  end if;

  update public.website_publications set superseded_at = now()
  where project_id = p_project_id and superseded_at is null;

  insert into public.website_publications(project_id, owner_id, slug, revision, document)
  values (p_project_id, auth.uid(), p_slug, selected_project.revision, p_snapshot)
  returning website_publications.slug, website_publications.revision, website_publications.published_at
  into slug, revision, published_at;
  return next;
end; $$;
revoke all on function public.publish_website_snapshot(uuid, text, integer, jsonb, uuid) from public, anon;
grant execute on function public.publish_website_snapshot(uuid, text, integer, jsonb, uuid) to authenticated;

create or replace function public.unpublish_website(p_project_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  update public.website_publications set superseded_at = now()
  where project_id = p_project_id and owner_id = auth.uid() and superseded_at is null;
  if not found then raise exception 'publication_not_found'; end if;
end; $$;

-- 3. Website Media Storage Bucket & Policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-media', 'website-media', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = 3145728,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "owners read website media" on storage.objects;
create policy "owners read website media"
on storage.objects for select to authenticated
using (
  bucket_id = 'website-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "owners upload website media" on storage.objects;
create policy "owners upload website media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'website-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "owners update website media" on storage.objects;
create policy "owners update website media"
on storage.objects for update to authenticated
using (
  bucket_id = 'website-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
)
with check (
  bucket_id = 'website-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "owners delete website media" on storage.objects;
create policy "owners delete website media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'website-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

-- 4. Opportunity Variants & Selective Source Review
create or replace function public.create_website_opportunity_variant(
  p_canonical_project_id uuid,
  p_variant_id uuid,
  p_name text,
  p_document jsonb
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare source_project public.website_projects%rowtype;
begin
  select * into source_project from public.website_projects
  where id = p_canonical_project_id and owner_id = auth.uid() for share;
  if source_project.id is null then raise exception 'canonical_project_not_found'; end if;
  if source_project.variant_of_project_id is not null then raise exception 'variants_cannot_be_nested'; end if;
  if char_length(trim(p_name)) not between 1 and 80 then raise exception 'invalid_name'; end if;
  if p_document->>'projectId' <> p_variant_id::text or coalesce((p_document->>'revision')::integer, -1) <> 0 then
    raise exception 'invalid_variant_document';
  end if;

  insert into public.website_projects (
    id, owner_id, name, creation_mode, template_id, document, revision,
    variant_of_project_id, source_revision, opportunity_status
  ) values (
    p_variant_id, auth.uid(), trim(p_name), 'guided', source_project.template_id,
    p_document, 0, source_project.id, source_project.revision, 'draft'
  );
  insert into public.website_revisions(project_id, owner_id, revision, document, source)
  values (p_variant_id, auth.uid(), 0, p_document, 'opportunity_variant_created');
  return p_variant_id;
end; $$;

create or replace function public.apply_website_source_review(
  p_variant_id uuid,
  p_source_id uuid,
  p_source_revision integer,
  p_expected_revision integer,
  p_document jsonb
) returns integer
language plpgsql security invoker set search_path = public as $$
declare current_source integer;
declare next_revision integer;
begin
  select revision into current_source from public.website_projects
  where id = p_source_id and owner_id = auth.uid() and variant_of_project_id is null for share;
  if current_source is null then raise exception 'source_not_found'; end if;
  if current_source <> p_source_revision then raise exception 'source_revision_conflict'; end if;
  if p_document->>'projectId' is distinct from p_variant_id::text
    or (p_document->>'revision')::integer is distinct from p_expected_revision + 1
    or p_document #>> '{opportunity,canonicalProjectId}' is distinct from p_source_id::text
    or (p_document #>> '{opportunity,sourceRevision}')::integer is distinct from p_source_revision
    then raise exception 'invalid_refresh_document'; end if;

  update public.website_projects set
    document = p_document,
    revision = revision + 1,
    source_revision = p_source_revision,
    updated_at = now()
  where id = p_variant_id and owner_id = auth.uid()
    and variant_of_project_id = p_source_id and revision = p_expected_revision
  returning revision into next_revision;
  if next_revision is null then raise exception 'variant_revision_conflict'; end if;

  insert into public.website_revisions(project_id, owner_id, revision, document, source)
  values (p_variant_id, auth.uid(), next_revision, p_document, 'manual');
  return next_revision;
end; $$;

-- 5. Opportunity Share Tokens, Coarse Opens & Recipient Feedback
create table if not exists public.website_opportunity_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects(id) on delete cascade,
  publication_id uuid not null references public.website_publications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists website_opportunity_shares_project_idx
  on public.website_opportunity_shares(project_id);
alter table public.website_opportunity_shares enable row level security;

drop policy if exists "owners manage website opportunity shares" on public.website_opportunity_shares;
create policy "owners manage website opportunity shares" on public.website_opportunity_shares
  for all using (owner_id = auth.uid()) with check (
    owner_id = auth.uid()
    and exists (select 1 from public.website_projects p where p.id = project_id and p.owner_id = auth.uid())
    and exists (select 1 from public.website_publications pub where pub.id = publication_id
      and pub.project_id = project_id and pub.owner_id = auth.uid())
  );

create table if not exists public.website_share_opens (
  share_id uuid not null references public.website_opportunity_shares(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opened_bucket timestamptz not null,
  primary key (share_id, opened_bucket)
);
alter table public.website_share_opens enable row level security;

drop policy if exists "owners view website share opens" on public.website_share_opens;
create policy "owners view website share opens" on public.website_share_opens
  for select using (owner_id = auth.uid());

create or replace function public.read_website_opportunity_share(p_hash text)
returns table(document jsonb, revision integer)
language plpgsql security definer set search_path = '' as $$
declare selected_share public.website_opportunity_shares%rowtype;
declare selected_publication public.website_publications%rowtype;
begin
  select * into selected_share from public.website_opportunity_shares
  where token_hash = p_hash and revoked_at is null and expires_at > now();
  if selected_share.id is null then return; end if;

  select * into selected_publication from public.website_publications pub
  where pub.id = selected_share.publication_id
    and pub.project_id = selected_share.project_id
    and pub.owner_id = selected_share.owner_id
    and pub.superseded_at is null
    and pub.document #>> '{opportunity,visibility}' = 'shared';
  if selected_publication.id is null then return; end if;

  insert into public.website_share_opens(share_id, owner_id, opened_bucket)
  values (selected_share.id, selected_share.owner_id, date_trunc('hour', now() at time zone 'utc') at time zone 'utc')
  on conflict do nothing;

  return query select selected_publication.document, selected_publication.revision;
end; $$;
revoke all on function public.read_website_opportunity_share(text) from public;
grant execute on function public.read_website_opportunity_share(text) to anon, authenticated;

create table if not exists public.website_share_feedback (
  id uuid primary key default gen_random_uuid(),
  share_id uuid not null references public.website_opportunity_shares(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  clarity integer not null check (clarity between 1 and 5),
  relevance integer not null check (relevance between 1 and 5),
  presentation integer not null check (presentation between 1 and 5),
  comment text,
  submitted_at timestamptz not null default now()
);
create index if not exists website_share_feedback_share_idx
  on public.website_share_feedback(share_id);
alter table public.website_share_feedback enable row level security;

drop policy if exists "anon submit feedback on active website share" on public.website_share_feedback;
create policy "anon submit feedback on active website share" on public.website_share_feedback
  for insert with check (
    exists (
      select 1 from public.website_opportunity_shares s
      where s.id = website_share_feedback.share_id
        and s.revoked_at is null
        and s.expires_at > now()
    )
  );

drop policy if exists "owners view feedback on own website shares" on public.website_share_feedback;
create policy "owners view feedback on own website shares" on public.website_share_feedback
  for select using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.website_opportunity_shares s
      where s.id = website_share_feedback.share_id
        and s.owner_id = auth.uid()
    )
  );

-- 6. Professional Memory & Agent Activity Controls
create table if not exists public.website_professional_memory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  canonical_project_id uuid not null references public.website_projects(id) on delete cascade,
  fact text not null check (char_length(btrim(fact)) between 3 and 500),
  source_note text not null check (char_length(btrim(source_note)) between 3 and 200),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists website_professional_memory_owner_project_idx
  on public.website_professional_memory(owner_id, canonical_project_id);
alter table public.website_professional_memory enable row level security;

drop policy if exists "owner reads website professional memory" on public.website_professional_memory;
create policy "owner reads website professional memory" on public.website_professional_memory
  for select using (owner_id = auth.uid());

drop policy if exists "owner adds website professional memory" on public.website_professional_memory;
create policy "owner adds website professional memory" on public.website_professional_memory
  for insert with check (owner_id = auth.uid() and exists (
    select 1 from public.website_projects p where p.id = canonical_project_id
      and p.owner_id = auth.uid() and p.variant_of_project_id is null
  ));

drop policy if exists "owner revokes website professional memory" on public.website_professional_memory;
create policy "owner revokes website professional memory" on public.website_professional_memory
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.website_agent_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.website_projects(id) on delete cascade,
  operation text not null check (operation in ('chat', 'opportunity_plan')),
  outcome text not null check (outcome in ('ok', 'local_fallback', 'provider_unavailable')),
  provider text check (provider in ('nebius', 'openrouter', 'gemini', 'openai')),
  attempts integer not null default 0 check (attempts between 0 and 4),
  created_at timestamptz not null default now()
);
create index if not exists website_agent_events_owner_project_idx
  on public.website_agent_events(owner_id, project_id, created_at desc);
alter table public.website_agent_events enable row level security;

drop policy if exists "owner views website agent events" on public.website_agent_events;
create policy "owner views website agent events" on public.website_agent_events
  for select using (owner_id = auth.uid());

drop policy if exists "owner records website agent events" on public.website_agent_events;
create policy "owner records website agent events" on public.website_agent_events
  for insert with check (owner_id = auth.uid() and exists (
    select 1 from public.website_projects p where p.id = project_id and p.owner_id = auth.uid()
  ));

drop policy if exists "owner clears website agent events" on public.website_agent_events;
create policy "owner clears website agent events" on public.website_agent_events
  for delete using (owner_id = auth.uid());

create table if not exists public.website_agent_settings (
  canonical_project_id uuid primary key references public.website_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.website_agent_settings enable row level security;

drop policy if exists "owner reads website agent settings" on public.website_agent_settings;
create policy "owner reads website agent settings" on public.website_agent_settings
  for select using (owner_id = auth.uid());

drop policy if exists "owner creates website agent settings" on public.website_agent_settings;
create policy "owner creates website agent settings" on public.website_agent_settings
  for insert with check (owner_id = auth.uid() and exists (
    select 1 from public.website_projects p where p.id = canonical_project_id
      and p.owner_id = auth.uid() and p.variant_of_project_id is null
  ));

drop policy if exists "owner updates website agent settings" on public.website_agent_settings;
create policy "owner updates website agent settings" on public.website_agent_settings
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid() and exists (
    select 1 from public.website_projects p where p.id = canonical_project_id
      and p.owner_id = auth.uid() and p.variant_of_project_id is null
  ));

-- 7. Public Visitor Agent Rate Limiting & Grounding Documents
create table if not exists public.website_visitor_agent_meter (
  slug text not null,
  visitor_hash text not null,
  usage_day date not null,
  kind text not null check (kind in ('voice', 'text')),
  uses integer not null default 0,
  primary key (slug, visitor_hash, usage_day, kind)
);
alter table public.website_visitor_agent_meter enable row level security;

create or replace function public.claim_website_visitor_use(p_slug text, p_hash text, p_kind text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count integer; v_total integer; v_limit integer;
begin
  if p_kind not in ('voice', 'text') or p_hash !~ '^[0-9a-f]{64}$' or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    return false;
  end if;
  if not exists (
    select 1 from public.website_publications
    where slug = p_slug and superseded_at is null
      and document #>> '{visitor,enabled}' = 'true'
      and (coalesce(document #>> '{opportunity,status}', 'canonical') = 'canonical' or document #>> '{opportunity,visibility}' = 'public')
  ) then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_slug || current_date::text || p_kind, 0));
  v_limit := case when p_kind = 'voice' then 4 else 25 end;
  select uses into v_count from public.website_visitor_agent_meter
  where slug = p_slug and visitor_hash = p_hash and usage_day = current_date and kind = p_kind;
  if coalesce(v_count, 0) >= v_limit then return false; end if;

  select coalesce(sum(uses), 0) into v_total from public.website_visitor_agent_meter
  where slug = p_slug and usage_day = current_date and kind = p_kind;
  if v_total >= (case when p_kind = 'voice' then 60 else 600 end) then return false; end if;

  insert into public.website_visitor_agent_meter(slug, visitor_hash, usage_day, kind, uses)
  values (p_slug, p_hash, current_date, p_kind, 1)
  on conflict (slug, visitor_hash, usage_day, kind) do update set uses = website_visitor_agent_meter.uses + 1;
  return true;
end; $$;
revoke all on function public.claim_website_visitor_use(text, text, text) from public;
grant execute on function public.claim_website_visitor_use(text, text, text) to service_role;

create table if not exists public.website_visitor_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 1 and 180),
  body text not null check (char_length(body) between 10 and 200000),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists website_visitor_documents_project_public
  on public.website_visitor_documents(project_id, published);
alter table public.website_visitor_documents enable row level security;

drop policy if exists "owners read website visitor documents" on public.website_visitor_documents;
create policy "owners read website visitor documents" on public.website_visitor_documents
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists "owners add website visitor documents" on public.website_visitor_documents;
create policy "owners add website visitor documents" on public.website_visitor_documents
  for insert to authenticated with check (
    owner_id = auth.uid() and exists (
      select 1 from public.website_projects p where p.id = project_id and p.owner_id = auth.uid() and p.variant_of_project_id is null
    )
  );

drop policy if exists "owners remove website visitor documents" on public.website_visitor_documents;
create policy "owners remove website visitor documents" on public.website_visitor_documents
  for delete to authenticated using (owner_id = auth.uid());

grant select, insert, delete on public.website_visitor_documents to authenticated;
grant select on public.website_visitor_documents to service_role;

create or replace function public.guard_website_visitor_document_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.website_projects p
  where p.id = new.project_id and p.owner_id = auth.uid() and p.variant_of_project_id is null for update;
  if not found then raise exception 'portfolio_not_found'; end if;
  if (select count(*) from public.website_visitor_documents where project_id = new.project_id) >= 10 then
    raise exception 'document_limit';
  end if;
  new.created_at := clock_timestamp();
  new.published := false;
  return new;
end; $$;
drop trigger if exists guard_website_visitor_document_insert on public.website_visitor_documents;
create trigger guard_website_visitor_document_insert
  before insert on public.website_visitor_documents
  for each row execute function public.guard_website_visitor_document_insert();

create or replace function public.publish_website_visitor_documents(p_project_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_publication timestamptz;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  select pub.published_at into v_publication
  from public.website_publications pub
  join public.website_projects p on p.id = pub.project_id
  where pub.project_id = p_project_id and p.owner_id = auth.uid()
    and p.variant_of_project_id is null and pub.superseded_at is null
    and pub.document #>> '{visitor,enabled}' = 'true';
  if v_publication is null then raise exception 'publish_enabled_portfolio_first'; end if;
  update public.website_visitor_documents set published = true
  where project_id = p_project_id and owner_id = auth.uid() and created_at <= v_publication and published = false;
end; $$;
revoke all on function public.publish_website_visitor_documents(uuid) from public, anon;
grant execute on function public.publish_website_visitor_documents(uuid) to authenticated;

-- 8. External GPT Action Connections & Voice Interview Metering
create table if not exists public.website_content_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.website_projects(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists website_content_connections_owner
  on public.website_content_connections(owner_id, project_id);
alter table public.website_content_connections enable row level security;

drop policy if exists "owners read website content connections" on public.website_content_connections;
create policy "owners read website content connections" on public.website_content_connections
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists "owners create website content connections" on public.website_content_connections;
create policy "owners create website content connections" on public.website_content_connections
  for insert to authenticated with check (
    owner_id = auth.uid() and exists (
      select 1 from public.website_projects where id = project_id and owner_id = auth.uid()
    )
  );

drop policy if exists "owners revoke website content connections" on public.website_content_connections;
create policy "owners revoke website content connections" on public.website_content_connections
  for delete to authenticated using (owner_id = auth.uid());

create or replace function public.external_website_connection_project(p_hash text)
returns table(project_id uuid, document jsonb, revision integer)
language sql security definer set search_path = public as $$
  select p.id, p.document, p.revision
  from public.website_content_connections c
  join public.website_projects p on p.id = c.project_id and p.owner_id = c.owner_id
  where c.key_hash = p_hash and c.revoked_at is null and p_hash ~ '^[0-9a-f]{64}$'
  limit 1;
$$;
revoke all on function public.external_website_connection_project(text) from public, anon, authenticated;
grant execute on function public.external_website_connection_project(text) to service_role;

create or replace function public.save_external_website_connection_project(
  p_hash text,
  p_document jsonb,
  p_expected_revision integer
) returns integer
language plpgsql security definer set search_path = public as $$
declare v_project uuid; v_owner uuid; v_revision integer;
begin
  select c.project_id, c.owner_id into v_project, v_owner
  from public.website_content_connections c
  where c.key_hash = p_hash and c.revoked_at is null and p_hash ~ '^[0-9a-f]{64}$';
  if v_project is null or p_document->>'projectId' <> v_project::text then
    raise exception 'invalid_connection';
  end if;

  update public.website_projects set
    document = p_document,
    revision = revision + 1,
    updated_at = now(),
    opportunity_status = coalesce(p_document #>> '{opportunity,status}', opportunity_status)
  where id = v_project and owner_id = v_owner and revision = p_expected_revision
  returning revision into v_revision;
  if v_revision is null then raise exception 'revision_conflict'; end if;

  insert into public.website_revisions(project_id, owner_id, revision, document, source)
  values (v_project, v_owner, v_revision, p_document, 'external_action');
  return v_revision;
end; $$;
revoke all on function public.save_external_website_connection_project(text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.save_external_website_connection_project(text, jsonb, integer) to service_role;

create table if not exists public.website_external_connection_meter (
  key_hash text not null,
  usage_day date not null,
  uses integer not null default 0,
  primary key (key_hash, usage_day)
);
alter table public.website_external_connection_meter enable row level security;

create or replace function public.claim_external_website_connection_use(p_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uses integer;
begin
  if not exists (select 1 from public.website_content_connections where key_hash = p_hash and revoked_at is null) then
    return false;
  end if;
  insert into public.website_external_connection_meter(key_hash, usage_day, uses)
  values (p_hash, current_date, 1)
  on conflict (key_hash, usage_day) do update
    set uses = public.website_external_connection_meter.uses + 1
    where public.website_external_connection_meter.uses < 100
  returning uses into v_uses;
  return v_uses is not null;
end; $$;
revoke all on function public.claim_external_website_connection_use(text) from public, anon, authenticated;
grant execute on function public.claim_external_website_connection_use(text) to service_role;

create table if not exists public.website_interview_meter (
  owner_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  uses integer not null default 0,
  primary key (owner_id, usage_day)
);
alter table public.website_interview_meter enable row level security;

create or replace function public.claim_website_interview_use()
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uses integer;
begin
  if auth.uid() is null then return false; end if;
  insert into public.website_interview_meter(owner_id, usage_day, uses)
  values (auth.uid(), current_date, 1)
  on conflict (owner_id, usage_day) do update
    set uses = public.website_interview_meter.uses + 1
    where public.website_interview_meter.uses < 20
  returning uses into v_uses;
  return v_uses is not null;
end; $$;
revoke all on function public.claim_website_interview_use() from public, anon;
grant execute on function public.claim_website_interview_use() to authenticated;

commit;
