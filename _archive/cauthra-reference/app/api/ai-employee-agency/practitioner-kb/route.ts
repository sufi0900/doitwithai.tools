import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import {
  formatPractitionerRagBlock,
  hasPractitionerBrainAccess,
  ingestPractitionerPlaybook,
  retrievePractitionerTactics,
  type KnowledgeSourceType,
  type KnowledgeSpecialistRole,
} from '@/lib/ai-agency/practitioner-rag.server';
import type { KnowledgeCategory } from '@/lib/ai-agency/default-specialist-prompts';

export const dynamic = 'force-dynamic';

const VALID_SOURCE_TYPES = new Set<KnowledgeSourceType>([
  'seo_playbook',
  'case_study',
  'video_distillation',
  'design_reference',
  'conversion_framework',
]);

const VALID_CATEGORIES = new Set<KnowledgeCategory>([
  'on_page_seo',
  'off_page_seo',
  'technical_seo',
  'content_writing',
  'keyword_research',
  'visual_design',
]);

const VALID_ROLES = new Set<KnowledgeSpecialistRole>([
  'unified',
  'keywords',
  'writer',
  'visual',
  'qa',
  'technical',
  'refresh',
  'pr',
  'social',
  'copilot',
]);

function isAdminWorkspace(workspaceId: string): boolean {
  const allowIds = (process.env.AGENCY_ADMIN_USER_IDS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (allowIds.length === 0) return true;
  return allowIds.includes(workspaceId);
}

export async function GET(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;

  const access = await hasPractitionerBrainAccess(workspace.id);
  const db = createSupabaseServiceClient();
  if (!db) {
    return NextResponse.json(
      { error: 'Practitioner Knowledge Base service unavailable.' },
      { status: 503 },
    );
  }

  const { data: sources, error } = await db
    .from('agency_knowledge_sources')
    .select(
      'id, title, source_type, knowledge_category, specialist_role, industry_tags, maturity_tags, parent_summary, storage_object_path, active, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      {
        access,
        sources: [],
        migrationPending: true,
        error:
          'Apply migrations 20261130_agency_practitioner_pgvector_kb.sql and 20261201_agency_kb_categories.sql to enable the category-indexed Practitioner Brain.',
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      access,
      isAdmin: isAdminWorkspace(workspace.id),
      sources: sources || [],
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'preview_rag') {
    const queryText = typeof body.queryText === 'string' ? body.queryText.trim() : '';
    const roleRaw = typeof body.specialistRole === 'string' ? body.specialistRole : 'unified';
    const catRaw = typeof body.knowledgeCategory === 'string' ? body.knowledgeCategory : '';
    const specialistRole: KnowledgeSpecialistRole = VALID_ROLES.has(
      roleRaw as KnowledgeSpecialistRole,
    )
      ? (roleRaw as KnowledgeSpecialistRole)
      : 'unified';
    const knowledgeCategory = VALID_CATEGORIES.has(catRaw as KnowledgeCategory)
      ? (catRaw as KnowledgeCategory)
      : null;

    if (!queryText) {
      return NextResponse.json({ error: 'Enter a query to preview RAG retrieval.' }, { status: 400 });
    }

    const result = await retrievePractitionerTactics({
      workspaceId: workspace.id,
      specialistRole,
      queryText,
      knowledgeCategory,
      limit: 4,
      bypassTierGate: isAdminWorkspace(workspace.id),
    });

    return NextResponse.json({
      ok: true,
      access: result.access,
      resolvedCategory: result.resolvedCategory,
      tactics: result.tactics,
      promptPreview: formatPractitionerRagBlock(result.tactics),
    });
  }

  if (!isAdminWorkspace(workspace.id)) {
    return NextResponse.json(
      { error: 'Only authorized Founder Hub administrators can modify Practitioner Playbooks.' },
      { status: 403 },
    );
  }

  if (action === 'ingest') {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const parentSummary = typeof body.parentSummary === 'string' ? body.parentSummary.trim() : '';
    const rawPlaybook = typeof body.rawPlaybook === 'string' ? body.rawPlaybook.trim() : '';
    const sourceTypeRaw = typeof body.sourceType === 'string' ? body.sourceType : 'seo_playbook';
    const roleRaw = typeof body.specialistRole === 'string' ? body.specialistRole : 'unified';
    const catRaw = typeof body.knowledgeCategory === 'string' ? body.knowledgeCategory : 'on_page_seo';

    if (!title || !rawPlaybook) {
      return NextResponse.json(
        { error: 'Title and playbook content are required.' },
        { status: 400 },
      );
    }

    const sourceType: KnowledgeSourceType = VALID_SOURCE_TYPES.has(
      sourceTypeRaw as KnowledgeSourceType,
    )
      ? (sourceTypeRaw as KnowledgeSourceType)
      : 'seo_playbook';
    const specialistRole: KnowledgeSpecialistRole = VALID_ROLES.has(
      roleRaw as KnowledgeSpecialistRole,
    )
      ? (roleRaw as KnowledgeSpecialistRole)
      : 'unified';
    const knowledgeCategory: KnowledgeCategory = VALID_CATEGORIES.has(catRaw as KnowledgeCategory)
      ? (catRaw as KnowledgeCategory)
      : 'on_page_seo';

    const industryTags = Array.isArray(body.industryTags)
      ? body.industryTags.map((v) => String(v).trim()).filter(Boolean)
      : [];
    const maturityTags = Array.isArray(body.maturityTags)
      ? body.maturityTags.map((v) => String(v).trim()).filter(Boolean)
      : [];
    const storageObjectPath =
      typeof body.storageObjectPath === 'string' ? body.storageObjectPath.trim() : null;

    const ingested = await ingestPractitionerPlaybook({
      title,
      sourceType,
      knowledgeCategory,
      specialistRole,
      industryTags,
      maturityTags,
      parentSummary: parentSummary || title,
      rawPlaybook,
      storageObjectPath,
      createdBy: workspace.id,
    });

    if (!ingested.ok) {
      return NextResponse.json({ error: ingested.error || 'Ingestion failed.' }, { status: 503 });
    }
    return NextResponse.json(ingested, { status: 201 });
  }

  const db = createSupabaseServiceClient();
  if (!db) {
    return NextResponse.json({ error: 'Database service unavailable.' }, { status: 503 });
  }

  const sourceId = typeof body.sourceId === 'string' ? body.sourceId.trim() : '';
  if (!sourceId) {
    return NextResponse.json({ error: 'Missing sourceId.' }, { status: 400 });
  }

  if (action === 'toggle_active') {
    const active = Boolean(body.active);
    const { error } = await db
      .from('agency_knowledge_sources')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', sourceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { error } = await db.from('agency_knowledge_sources').delete().eq('id', sourceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
