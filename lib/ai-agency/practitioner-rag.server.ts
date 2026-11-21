import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import {
  inferKnowledgeCategoryFromQuery,
  type KnowledgeCategory,
} from './default-specialist-prompts';

export type KnowledgeSourceType =
  | 'seo_playbook'
  | 'case_study'
  | 'video_distillation'
  | 'design_reference'
  | 'conversion_framework';

export type KnowledgeSpecialistRole =
  | 'unified'
  | 'keywords'
  | 'writer'
  | 'visual'
  | 'qa'
  | 'technical'
  | 'refresh'
  | 'pr'
  | 'social'
  | 'copilot';

export interface TacticCardChunk {
  chunkIndex: number;
  tacticTitle: string;
  tacticBody: string;
}

export interface RetrievedPractitionerTactic {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  knowledgeCategory?: KnowledgeCategory;
  parentSummary: string;
  storageObjectPath: string | null;
  tacticTitle: string;
  tacticBody: string;
  specialistRole: string;
  similarity: number;
}

export interface PractitionerBrainAccess {
  enabled: boolean;
  tier: string;
  brandName: string;
  upgradeRequired: boolean;
}

export const PRO_STRATEGIST_BRAND_NAME = 'DoItWithAI Strategist Pro';

function getIsolatedAgencyGeminiKey(): string | null {
  const candidates = [
    process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY,
    process.env.AGENCY_GEMINI_API_KEY,
    process.env.GEMINI_AUTOMATION_API_KEY,
    process.env.AUTONOMOUS_AUTOMATION_API_KEY,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 8) {
      return candidate.trim();
    }
  }
  return null;
}

export function chunkPlaybookIntoTacticCards(
  rawPlaybook: string,
  fallbackTitle: string,
  maxChars = 900,
): TacticCardChunk[] {
  const cleaned = rawPlaybook.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const sections = cleaned
    .split(/\n(?=#{1,3}\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);

  const cards: TacticCardChunk[] = [];
  let idx = 0;

  for (const section of sections) {
    const lines = section.split('\n');
    const firstLine = lines[0] || '';
    const headingMatch = /^#{1,3}\s+(.+)$/.exec(firstLine);
    const baseTitle = headingMatch ? headingMatch[1].trim() : fallbackTitle.trim();
    const bodyText = (headingMatch ? lines.slice(1).join('\n') : section).trim();
    if (!bodyText) continue;

    if (bodyText.length <= maxChars) {
      cards.push({
        chunkIndex: idx++,
        tacticTitle: baseTitle.slice(0, 140),
        tacticBody: bodyText,
      });
      continue;
    }

    const paragraphs = bodyText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    let buffer = '';
    let part = 1;

    for (const para of paragraphs) {
      if (buffer && buffer.length + para.length + 2 > maxChars) {
        cards.push({
          chunkIndex: idx++,
          tacticTitle: `${baseTitle.slice(0, 125)} (Part ${part++})`,
          tacticBody: buffer,
        });
        buffer = para.slice(0, maxChars);
      } else {
        buffer = buffer ? `${buffer}\n\n${para}` : para.slice(0, maxChars);
      }
    }
    if (buffer) {
      cards.push({
        chunkIndex: idx++,
        tacticTitle: part > 1 ? `${baseTitle.slice(0, 125)} (Part ${part})` : baseTitle.slice(0, 140),
        tacticBody: buffer,
      });
    }
  }

  return cards.slice(0, 40);
}

export async function embedAgencyText(text: string): Promise<number[] | null> {
  const apiKey = getIsolatedAgencyGeminiKey();
  if (!apiKey) return null;

  const trimmed = text.trim().slice(0, 4000);
  if (!trimmed) return null;

  const models = ['gemini-embedding-001', 'text-embedding-004'];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: trimmed }] },
          outputDimensionality: 768,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { embedding?: { values?: unknown } };
      const values = data.embedding?.values;
      if (Array.isArray(values) && values.length === 768) {
        return values.map((v) => Number(v));
      }
    } catch {
      // Try next evergreen embedding model
    }
  }
  return null;
}

export async function hasPractitionerBrainAccess(
  workspaceId: string,
): Promise<PractitionerBrainAccess> {
  const globalTesting = (process.env.AGENCY_UNLIMITED_TESTING || '').trim().toLowerCase();
  if (globalTesting === 'true' || globalTesting === '1') {
    return {
      enabled: true,
      tier: 'founder-testing',
      brandName: PRO_STRATEGIST_BRAND_NAME,
      upgradeRequired: false,
    };
  }

  const db = createSupabaseServiceClient();
  if (!db) {
    return {
      enabled: false,
      tier: 'starter',
      brandName: PRO_STRATEGIST_BRAND_NAME,
      upgradeRequired: true,
    };
  }
  const { data } = await db
    .from('agency_entitlements')
    .select('tier')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const tier = typeof data?.tier === 'string' ? data.tier : 'starter';
  const enabled = tier === 'growth' || tier === 'agency-scale';
  return {
    enabled,
    tier,
    brandName: PRO_STRATEGIST_BRAND_NAME,
    upgradeRequired: !enabled,
  };
}

export async function ingestPractitionerPlaybook(input: {
  title: string;
  sourceType: KnowledgeSourceType;
  knowledgeCategory: KnowledgeCategory;
  specialistRole: KnowledgeSpecialistRole;
  industryTags: string[];
  maturityTags: string[];
  parentSummary: string;
  rawPlaybook: string;
  storageObjectPath?: string | null;
  createdBy?: string | null;
}): Promise<{
  ok: boolean;
  sourceId?: string;
  chunksCreated?: number;
  embeddedChunks?: number;
  error?: string;
}> {
  const db = createSupabaseServiceClient();
  if (!db) return { ok: false, error: 'Database service unavailable.' };

  const cards = chunkPlaybookIntoTacticCards(input.rawPlaybook, input.title);
  if (cards.length === 0) {
    return { ok: false, error: 'Playbook body is empty after normalization.' };
  }

  const { data: source, error: sourceErr } = await db
    .from('agency_knowledge_sources')
    .insert({
      title: input.title.trim().slice(0, 180),
      source_type: input.sourceType,
      knowledge_category: input.knowledgeCategory,
      specialist_role: input.specialistRole,
      industry_tags: input.industryTags.slice(0, 12),
      maturity_tags: input.maturityTags.slice(0, 4),
      parent_summary: input.parentSummary.trim().slice(0, 800),
      storage_object_path: input.storageObjectPath?.trim() || null,
      created_by: input.createdBy || null,
    })
    .select('id')
    .single();

  if (sourceErr || !source?.id) {
    return {
      ok: false,
      error:
        sourceErr?.message ||
        'Unable to store playbook source. Ensure migrations 20261130 & 20261201 are applied.',
    };
  }

  let embeddedChunks = 0;
  const rows = [];
  for (const card of cards) {
    const embedding = await embedAgencyText(
      `[${input.knowledgeCategory}] ${input.title}\n${input.parentSummary}\n${card.tacticTitle}\n${card.tacticBody}`,
    );
    if (embedding) embeddedChunks += 1;
    rows.push({
      source_id: source.id,
      chunk_index: card.chunkIndex,
      tactic_title: card.tacticTitle,
      tactic_body: card.tacticBody,
      specialist_role: input.specialistRole,
      knowledge_category: input.knowledgeCategory,
      embedding: embedding ? `[${embedding.join(',')}]` : null,
    });
  }

  const { error: chunkErr } = await db.from('agency_knowledge_chunks').insert(rows);
  if (chunkErr) {
    return { ok: false, error: chunkErr.message };
  }

  return {
    ok: true,
    sourceId: String(source.id),
    chunksCreated: rows.length,
    embeddedChunks,
  };
}

export async function retrievePractitionerTactics(input: {
  workspaceId: string;
  specialistRole: KnowledgeSpecialistRole;
  queryText: string;
  knowledgeCategory?: KnowledgeCategory | null;
  limit?: number;
  bypassTierGate?: boolean;
}): Promise<{
  access: PractitionerBrainAccess;
  resolvedCategory: KnowledgeCategory;
  tactics: RetrievedPractitionerTactic[];
}> {
  const resolvedCategory =
    input.knowledgeCategory ||
    inferKnowledgeCategoryFromQuery(input.queryText, input.specialistRole);

  const access = input.bypassTierGate
    ? {
        enabled: true,
        tier: 'admin-preview',
        brandName: PRO_STRATEGIST_BRAND_NAME,
        upgradeRequired: false,
      }
    : await hasPractitionerBrainAccess(input.workspaceId);

  if (!access.enabled) {
    return { access, resolvedCategory, tactics: [] };
  }

  const db = createSupabaseServiceClient();
  if (!db) return { access, resolvedCategory, tactics: [] };

  const matchCount = Math.max(1, Math.min(input.limit ?? 4, 6));
  const queryEmbedding = await embedAgencyText(input.queryText);

  if (queryEmbedding) {
    const { data, error } = await db.rpc('match_agency_practitioner_chunks', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      target_specialist: input.specialistRole,
      match_count: matchCount,
      min_similarity: 0.35,
      target_category: input.knowledgeCategory || null,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      const tactics: RetrievedPractitionerTactic[] = data.map((row) => ({
        chunkId: String(row.chunk_id),
        sourceId: String(row.source_id),
        sourceTitle: String(row.source_title),
        sourceType: String(row.source_type),
        knowledgeCategory: (row.knowledge_category || resolvedCategory) as KnowledgeCategory,
        parentSummary: String(row.parent_summary || ''),
        storageObjectPath: row.storage_object_path ? String(row.storage_object_path) : null,
        tacticTitle: String(row.tactic_title),
        tacticBody: String(row.tactic_body),
        specialistRole: String(row.specialist_role),
        similarity: Number(row.similarity || 0),
      }));
      return { access, resolvedCategory, tactics };
    }
  }

  // Deterministic lexical fallback scoped by category & specialist
  const terms = input.queryText
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3)
    .slice(0, 8);

  const { data: fallbackRows } = await db
    .from('agency_knowledge_chunks')
    .select(
      'id, source_id, tactic_title, tactic_body, specialist_role, knowledge_category, agency_knowledge_sources!inner(title, source_type, knowledge_category, parent_summary, storage_object_path, active)',
    )
    .in('specialist_role', ['unified', input.specialistRole])
    .limit(30);

  if (!Array.isArray(fallbackRows)) {
    return { access, resolvedCategory, tactics: [] };
  }

  const scored: RetrievedPractitionerTactic[] = [];
  for (const row of fallbackRows) {
    const src = row.agency_knowledge_sources as unknown as {
      title?: string;
      source_type?: string;
      knowledge_category?: KnowledgeCategory;
      parent_summary?: string;
      storage_object_path?: string | null;
      active?: boolean;
    };
    if (!src?.active) continue;
    const rowCat = (src.knowledge_category || row.knowledge_category || 'on_page_seo') as KnowledgeCategory;
    if (input.knowledgeCategory && rowCat !== input.knowledgeCategory) continue;

    const hay = `${row.tactic_title} ${row.tactic_body} ${src.title || ''}`.toLowerCase();
    const hits = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    if (terms.length > 0 && hits === 0) continue;
    const categoryBoost = rowCat === resolvedCategory ? 0.15 : 0;
    scored.push({
      chunkId: String(row.id),
      sourceId: String(row.source_id),
      sourceTitle: String(src.title || 'Practitioner Playbook'),
      sourceType: String(src.source_type || 'seo_playbook'),
      knowledgeCategory: rowCat,
      parentSummary: String(src.parent_summary || ''),
      storageObjectPath: src.storage_object_path ? String(src.storage_object_path) : null,
      tacticTitle: String(row.tactic_title),
      tacticBody: String(row.tactic_body),
      specialistRole: String(row.specialist_role),
      similarity: Number(
        Math.min(1, (terms.length > 0 ? hits / terms.length : 0.5) + categoryBoost).toFixed(2),
      ),
    });
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return { access, resolvedCategory, tactics: scored.slice(0, matchCount) };
}

export function formatPractitionerRagBlock(
  tactics: RetrievedPractitionerTactic[],
): string {
  if (!tactics.length) return '';
  const lines = [
    `[${PRO_STRATEGIST_BRAND_NAME} — Curated Practitioner Playbooks]`,
    'Apply these field-tested tactics alongside the tenant live site audit where directly relevant:',
  ];
  for (const t of tactics) {
    lines.push(
      `- [${t.knowledgeCategory || 'on_page_seo'}] ${t.tacticTitle} (${t.sourceTitle}): ${t.tacticBody.slice(0, 420)}`,
    );
    if (t.storageObjectPath) {
      lines.push(`  Reference asset: ${t.storageObjectPath}`);
    }
  }
  return lines.join('\n');
}
