begin;

-- Enable pgvector extension for semantic Practitioner Knowledge Base retrieval
create extension if not exists vector;

-- 1. Curated Practitioner Playbook Sources (SEO, Marketing, Conversion, Visual Design)
create table if not exists public.agency_knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (
    source_type in (
      'seo_playbook',
      'case_study',
      'video_distillation',
      'design_reference',
      'conversion_framework'
    )
  ),
  specialist_role text not null default 'unified' check (
    specialist_role in (
      'unified',
      'keywords',
      'writer',
      'visual',
      'qa',
      'technical',
      'refresh',
      'pr',
      'social',
      'copilot'
    )
  ),
  industry_tags text[] not null default '{}',
  maturity_tags text[] not null default '{}',
  parent_summary text not null,
  -- Optional Supabase Storage path (e.g. agency-practitioner-refs/saas-hero-01.webp)
  -- Keeps Visual Designer reference images out of the Cloudflare Worker bundle (< 64 MiB).
  storage_object_path text,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Focused Tactic Card Chunks + 768-dim Gemini Vector Embeddings
create table if not exists public.agency_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.agency_knowledge_sources(id) on delete cascade,
  chunk_index integer not null,
  tactic_title text not null,
  tactic_body text not null,
  specialist_role text not null default 'unified',
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists agency_knowledge_sources_role_active_idx
  on public.agency_knowledge_sources (specialist_role, active);

create index if not exists agency_knowledge_chunks_source_idx
  on public.agency_knowledge_chunks (source_id, chunk_index);

create index if not exists agency_knowledge_chunks_embedding_hnsw_idx
  on public.agency_knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

-- Strict RLS: Practitioner Brain is a proprietary Pro-tier moat; only service_role reads/writes directly.
alter table public.agency_knowledge_sources enable row level security;
alter table public.agency_knowledge_chunks enable row level security;

revoke all on public.agency_knowledge_sources from public, anon, authenticated;
revoke all on public.agency_knowledge_chunks from public, anon, authenticated;
grant all on public.agency_knowledge_sources to service_role;
grant all on public.agency_knowledge_chunks to service_role;

-- 3. Semantic RAG Retrieval RPC (returns top-K Tactic Cards + parent summary + storage reference hook)
create or replace function public.match_agency_practitioner_chunks(
  query_embedding vector(768),
  target_specialist text default 'unified',
  match_count integer default 4,
  min_similarity double precision default 0.35
)
returns table (
  chunk_id uuid,
  source_id uuid,
  source_title text,
  source_type text,
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
      target_specialist = 'unified'
      or c.specialist_role = 'unified'
      or c.specialist_role = target_specialist
    )
    and (1 - (c.embedding <=> query_embedding)) >= min_similarity
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 8));
$$;

revoke all on function public.match_agency_practitioner_chunks(vector(768), text, integer, double precision)
  from public, anon, authenticated;
grant execute on function public.match_agency_practitioner_chunks(vector(768), text, integer, double precision)
  to service_role;

commit;

-- Optional Supabase Storage setup (run once in Supabase Dashboard -> Storage):
-- Create a private bucket named `agency-practitioner-refs` for Visual Designer reference images.
