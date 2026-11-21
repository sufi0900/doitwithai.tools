import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import { meteredAgencyCall } from '@/lib/ai-agency/billing.server';
import {
  compilePrompt,
  promptVersion,
  selectRelevantSitePages,
} from '@/lib/ai-agency/prompt-compiler';
import { specialists } from '@/lib/ai-agency/specialists';
import type {
  PageDiagnostics,
  PageFields,
  PageImageAudit,
} from '@/lib/ai-agency/refresh.server';

export const dynamic = 'force-dynamic';

function stripJsonFence(raw: string): string {
  return raw.trim().replace(/^`{3}(?:json)?\s*|\s*`{3}$/gi, '').trim();
}

export interface DeepPageOptimizationResult {
  heading: string;
  title: string;
  description: string;
  keywordGaps: string[];
  competitorAngle: string;
  internalLinkSuggestions: Array<{
    anchorText: string;
    targetUrl: string;
    reason: string;
  }>;
  contentSectionDiffs: Array<{
    sectionHeading: string;
    action: 'add' | 'expand' | 'tighten';
    recommendation: string;
  }>;
  altSuggestions: Array<{ src: string; suggestedAlt: string }>;
  schemaJsonLd: string;
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.url !== 'string' || !body.url.trim()) {
    return NextResponse.json({ error: 'Select a page URL to optimize.' }, { status: 400 });
  }

  const targetUrl = body.url.trim();
  const { data: brand, error } = await ws.db
    .from('tenant_brand_dna')
    .select('domain, revision, profile, approved_at')
    .eq('workspace_id', ws.id)
    .maybeSingle();

  if (error || !brand?.approved_at) {
    return NextResponse.json(
      { error: 'Approve the website knowledge base first.' },
      { status: 409 },
    );
  }

  const currentFields = (body.currentFields || {
    heading: '',
    title: '',
    description: '',
  }) as PageFields;
  const pageKind = typeof body.pageKind === 'string' ? body.pageKind : 'page';
  const diagnostics = (body.diagnostics || null) as PageDiagnostics | null;
  const images = Array.isArray(body.images)
    ? (body.images as PageImageAudit[]).slice(0, 8)
    : [];
  const findings = Array.isArray(body.findings)
    ? (body.findings as string[]).slice(0, 12)
    : [];

  const relevantSitemapUrls = selectRelevantSitePages(
    brand.profile?.pages,
    `${targetUrl} ${currentFields.title} ${currentFields.heading}`,
    15,
  ).filter((p) => p.url !== targetUrl);

  const prompt = compilePrompt(
    specialists.find((s) => s.id === 'refresh'),
    false,
    brand.profile || {},
    [],
    [],
    JSON.stringify({
      url: targetUrl,
      pageKind,
      currentFields,
      diagnostics,
      findings,
      imagesMissingAlt: images.filter((i) => i.missingAlt).map((i) => i.src),
      candidateInternalLinks: relevantSitemapUrls,
    }),
  );

  prompt.systemPrompt = [
    'You are the Multi-Agent Existing Page & Article Optimization Lead (combining Keyword Strategist, On-Page SEO, Internal Linking, Technical Schema, and Senior Editorial Writer).',
    'Rules: (1) Never truncate titles or descriptions mid-word — write crisp, complete, high-CTR copy (Title 45-60 chars, Meta Description 130-155 chars, H1 20-75 chars).',
    '(2) Only recommend internal links whose targetUrl appears verbatim in candidateInternalLinks.',
    '(3) Preserve strong existing sections and the current URL slug; focus on concrete missing subtopics, long-tail keyword gaps, competitor differentiation, and structured JSON-LD.',
    'Return valid JSON ONLY with keys: { "heading": string, "title": string, "description": string, "keywordGaps": string[], "competitorAngle": string, "internalLinkSuggestions": [{ "anchorText": string, "targetUrl": string, "reason": string }], "contentSectionDiffs": [{ "sectionHeading": string, "action": "add"|"expand"|"tighten", "recommendation": string }], "altSuggestions": [{ "src": string, "suggestedAlt": string }], "schemaJsonLd": string }.',
  ].join('\n');

  const call = await meteredAgencyCall(ws.id, 'refresh', {
    ...prompt,
    maxOutputTokens: 1600,
    temperature: 0.4,
  });

  if (!call.ok) {
    return NextResponse.json({ error: call.apiErrorDetail }, { status: call.status });
  }

  const allowedUrlSet = new Set(relevantSitemapUrls.map((p) => p.url));
  const fallback: DeepPageOptimizationResult = {
    heading: currentFields.heading || currentFields.title || targetUrl,
    title: currentFields.title || currentFields.heading || targetUrl,
    description: currentFields.description || '',
    keywordGaps: [],
    competitorAngle: '',
    internalLinkSuggestions: [],
    contentSectionDiffs: [],
    altSuggestions: images
      .filter((i) => i.missingAlt)
      .map((i) => ({
        src: i.src,
        suggestedAlt: `${currentFields.heading || brand.profile?.name || 'Page'} visual`,
      })),
    schemaJsonLd: '',
  };

  let optimized = fallback;
  try {
    const parsed = JSON.parse(stripJsonFence(call.outputText)) as Partial<DeepPageOptimizationResult>;
    optimized = {
      heading:
        typeof parsed.heading === 'string' && parsed.heading.trim()
          ? parsed.heading.trim().slice(0, 120)
          : fallback.heading,
      title:
        typeof parsed.title === 'string' && parsed.title.trim()
          ? parsed.title.trim().slice(0, 70)
          : fallback.title,
      description:
        typeof parsed.description === 'string' && parsed.description.trim()
          ? parsed.description.trim().slice(0, 170)
          : fallback.description,
      keywordGaps: Array.isArray(parsed.keywordGaps)
        ? parsed.keywordGaps.map((k) => String(k).trim()).filter(Boolean).slice(0, 8)
        : [],
      competitorAngle:
        typeof parsed.competitorAngle === 'string' ? parsed.competitorAngle.trim() : '',
      internalLinkSuggestions: Array.isArray(parsed.internalLinkSuggestions)
        ? parsed.internalLinkSuggestions
            .filter(
              (item) =>
                typeof item?.anchorText === 'string' &&
                typeof item?.targetUrl === 'string' &&
                allowedUrlSet.has(item.targetUrl.trim()),
            )
            .slice(0, 6)
            .map((item) => ({
              anchorText: item.anchorText.trim(),
              targetUrl: item.targetUrl.trim(),
              reason: typeof item.reason === 'string' ? item.reason.trim() : '',
            }))
        : [],
      contentSectionDiffs: Array.isArray(parsed.contentSectionDiffs)
        ? parsed.contentSectionDiffs
            .filter(
              (d) =>
                typeof d?.sectionHeading === 'string' &&
                typeof d?.recommendation === 'string',
            )
            .slice(0, 6)
            .map((d) => ({
              sectionHeading: d.sectionHeading.trim(),
              action:
                d.action === 'expand' || d.action === 'tighten' ? d.action : 'add',
              recommendation: d.recommendation.trim(),
            }))
        : [],
      altSuggestions: Array.isArray(parsed.altSuggestions)
        ? parsed.altSuggestions
            .filter(
              (a) =>
                typeof a?.src === 'string' && typeof a?.suggestedAlt === 'string',
            )
            .slice(0, 8)
        : fallback.altSuggestions,
      schemaJsonLd:
        typeof parsed.schemaJsonLd === 'string' ? parsed.schemaJsonLd.trim() : '',
    };
  } catch {
    // Keep safe fallback if provider returned non-JSON
  }

  const admin = createSupabaseServiceClient();
  if (admin) {
    await admin.from('agency_specialist_work').insert({
      workspace_id: ws.id,
      specialist: 'refresh',
      prompt_version: promptVersion,
      strategy_version: Number(brand.profile?.strategy_bus_version ?? 1) || 1,
      task: `Deep Multi-Agent Optimization · ${targetUrl}`,
      result: JSON.stringify(optimized, null, 2),
    });
  }

  return NextResponse.json({
    ok: true,
    optimized,
    tokenUsage: {
      modelId: call.modelId,
      totalTokens: call.totalTokens,
      shadowPaidCostUsd: call.shadowPaidCostUsd,
    },
  });
}
