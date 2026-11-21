begin;

-- Add explicit Knowledge Category taxonomy to Practitioner Knowledge Base
alter table public.agency_knowledge_sources
  add column if not exists knowledge_category text not null default 'on_page_seo';

alter table public.agency_knowledge_sources
  drop constraint if exists agency_knowledge_sources_category_check;

alter table public.agency_knowledge_sources
  add constraint agency_knowledge_sources_category_check
  check (
    knowledge_category in (
      'on_page_seo',
      'off_page_seo',
      'technical_seo',
      'content_writing',
      'keyword_research',
      'visual_design'
    )
  );

alter table public.agency_knowledge_chunks
  add column if not exists knowledge_category text not null default 'on_page_seo';

create index if not exists agency_knowledge_chunks_category_role_idx
  on public.agency_knowledge_chunks (knowledge_category, specialist_role);

-- Upgrade semantic retrieval RPC to support explicit category filtering
drop function if exists public.match_agency_practitioner_chunks(vector(768), text, integer, double precision);

create or replace function public.match_agency_practitioner_chunks(
  query_embedding vector(768),
  target_specialist text default 'unified',
  match_count integer default 4,
  min_similarity double precision default 0.35,
  target_category text default null
)
returns table (
  chunk_id uuid,
  source_id uuid,
  source_title text,
  source_type text,
  knowledge_category text,
  parent_summary text,
  storage_object_path text,
  tactic_title text,
  tactic_body text,
  specialist_role text,
  similarity double precision
)
language sql
stable
set search_path = public
as $$
  select
    c.id as chunk_id,
    s.id as source_id,
    s.title as source_title,
    s.source_type,
    s.knowledge_category,
    s.parent_summary,
    s.storage_object_path,
    c.tactic_title,
    c.tactic_body,
    c.specialist_role,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.agency_knowledge_chunks c
  join public.agency_knowledge_sources s on s.id = c.source_id
  where s.active = true
    and c.embedding is not null
    and (
      target_category is null
      or target_category = ''
      or c.knowledge_category = target_category
    )
    and (
      target_specialist = 'unified'
      or c.specialist_role = 'unified'
      or c.specialist_role = target_specialist
    )
    and (1 - (c.embedding <=> query_embedding)) >= min_similarity
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 8));
$$;

revoke all on function public.match_agency_practitioner_chunks(vector(768), text, integer, double precision, text)
  from public, anon, authenticated;
grant execute on function public.match_agency_practitioner_chunks(vector(768), text, integer, double precision, text)
  to service_role;

commit;
