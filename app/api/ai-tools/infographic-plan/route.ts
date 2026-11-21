/**
 * LLM Semantic Visual Planner API Route
 * File: app/api/ai-tools/infographic-plan/route.ts
 *
 * Transforms extracted `ArticleSourceSection[]` into source-grounded,
 * editorial-grade `BlogInfographicConfig[]` using the free-tier LLM waterfall
 * (`runAutomationJsonPrompt`: Gemini 2.5 Flash -> Groq Llama 3.3 70B ->
 * Cerebras -> OpenRouter -> Mistral -> deterministic fallback).
 *
 * Enforces:
 *  1. Stratified heading-aware block sampling across the ENTIRE section (so multi-phase
 *     sections never cut off after Phase 1).
 *  2. Every synthesized node cites valid `sourceBlockIds[]` from the section.
 *  3. `reviewCardPercentages` verifies that no percentage is invented or stripped of qualifiers.
 *  4. Each section receives a reframed thesis headline, complete story arc across all pillars,
 *     genuine actionable takeaway (never repeating the H2 subtitle), and website brand theme.
 */

import { NextResponse } from "next/server";
import type {
  ArticleSourceBlock,
  ArticleSourceSection,
} from "@/lib/blog-infographic-studio/article-source";
import {
  buildAllArticleSectionVisuals,
  buildSectionConceptAlternatives,
  withPrismLayout,
  type PrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import type { WebsiteBrandHint } from "@/lib/blog-infographic-studio/brand-source";
import { PRISM_LAYOUTS } from "@/lib/blog-infographic-studio/layout-registry";
import { reviewCardPercentages } from "@/lib/blog-infographic-studio/percentage-review";
import { assignDistinctSectionIcons } from "@/lib/blog-infographic-studio/skills/semantic-iconography";
import { runInfographicQaCritic } from "@/lib/blog-infographic-studio/skills/visual-qa-critic";
import { extractHeadlineHighlightPhrases } from "@/lib/blog-infographic-studio/appearance";
import { resolveSectionVisualStock } from "@/lib/visual-stock/stock-resolver";
import { VECTOR_SCENE_CATALOG } from "@/lib/visual-stock/vector-scenes";
import { runAutomationJsonPrompt } from "@/lib/autonomous-agents/automation-ai-router";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";

interface PlannedNodePayload {
  badge?: string;
  title?: string;
  detail?: string;
  sourceBlockIds?: string[];
}

interface PlannedSectionPayload {
  sectionId?: string;
  headline?: string;
  subheadline?: string;
  eyebrowLabel?: string;
  prismLayout?: string;
  sceneIllustration?: string;
  comparisonLabels?: [string, string];
  calloutBadge?: string;
  calloutText?: string;
  nodes?: PlannedNodePayload[];
}

interface LlmVisualPlanResponse {
  sections?: PlannedSectionPayload[];
}

const VALID_LAYOUTS = new Set<PrismLayout>(
  PRISM_LAYOUTS.map((l) => l.id),
);

const ALL_LAYOUT_IDS_STR = PRISM_LAYOUTS.map((l) => `"${l.id}"`).join(", ");
const ALL_SCENE_IDS_STR = VECTOR_SCENE_CATALOG.map((s) => `"${s.id}"`).join(", ");

// Bounded in-memory TTL cache (40 entries, 15-min TTL) to prevent redundant LLM token spend
const PLAN_CACHE_TTL_MS = 15 * 60 * 1000;
const PLAN_CACHE_MAX_ENTRIES = 40;
const planResponseCache = new Map<
  string,
  {
    expiresAt: number;
    visuals: BlogInfographicConfig[];
    providerUsed: string;
  }
>();

function hashCacheKey(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `plan-${(hash >>> 0).toString(16)}-${input.length}`;
}

function getCachedPlan(key: string) {
  const entry = planResponseCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    planResponseCache.delete(key);
    return undefined;
  }
  // Refresh LRU order
  planResponseCache.delete(key);
  planResponseCache.set(key, entry);
  return entry;
}

function setCachedPlan(
  key: string,
  visuals: BlogInfographicConfig[],
  providerUsed: string,
) {
  if (planResponseCache.size >= PLAN_CACHE_MAX_ENTRIES) {
    const oldestKey = planResponseCache.keys().next().value;
    if (oldestKey) planResponseCache.delete(oldestKey);
  }
  planResponseCache.set(key, {
    expiresAt: Date.now() + PLAN_CACHE_TTL_MS,
    visuals,
    providerUsed,
  });
}

/**
 * Stratified heading-aware sampler so the LLM sees the ENTIRE section arc
 * (every H3/H4 phase, category, or FAQ question) instead of only the first 10 blocks.
 */
function sampleBlocksAcrossSection(
  blocks: ArticleSourceBlock[],
  maxBlocks = 18,
): Array<{ id: string; kind: string; heading?: string; text: string }> {
  const nonHeading = blocks.filter((b) => b.kind !== "heading");
  if (nonHeading.length <= maxBlocks) {
    return nonHeading.map((b) => ({
      id: b.id,
      kind: b.kind,
      heading: b.heading,
      text: b.text.slice(0, 320),
    }));
  }
  const byHeading = new Map<string, ArticleSourceBlock[]>();
  for (const b of nonHeading) {
    const key = b.heading || "__root__";
    const list = byHeading.get(key) || [];
    list.push(b);
    byHeading.set(key, list);
  }
  const picked: ArticleSourceBlock[] = [];
  const groups = Array.from(byHeading.values());
  let round = 0;
  while (picked.length < maxBlocks) {
    let added = false;
    for (const grp of groups) {
      if (round < grp.length && picked.length < maxBlocks) {
        picked.push(grp[round]);
        added = true;
      }
    }
    if (!added) break;
    round++;
  }
  return picked.map((b) => ({
    id: b.id,
    kind: b.kind,
    heading: b.heading,
    text: b.text.slice(0, 300),
  }));
}

export async function POST(request: Request) {
  let body: {
    sections?: ArticleSourceSection[];
    sectionIds?: string[];
    bypassCache?: boolean;
    articleTitle?: string;
    sourceUrl?: string;
    domain?: string;
    baseConfig?: BlogInfographicConfig;
    brandTheme?: WebsiteBrandHint;
    providerKeys?: Record<string, string>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON request body." },
      { status: 400 },
    );
  }

  const rawSections = Array.isArray(body.sections) ? body.sections.slice(0, 12) : [];
  if (!rawSections.length) {
    return NextResponse.json(
      { error: "Provide at least one extracted article section." },
      { status: 400 },
    );
  }

  const targetSectionIds = Array.isArray(body.sectionIds)
    ? body.sectionIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [];
  const targetSet = targetSectionIds.length > 0 ? new Set(targetSectionIds) : null;
  const sections = targetSet
    ? rawSections.filter((s) => targetSet.has(s.id))
    : rawSections;

  if (!sections.length) {
    return NextResponse.json(
      { error: "None of the requested sectionIds matched the supplied sections." },
      { status: 400 },
    );
  }

  // Build deterministic baseline preserving brand theme across every section.
  const deterministicVisuals = buildAllArticleSectionVisuals(sections, {
    sourceUrl: body.sourceUrl,
    domain: body.domain,
    articleTitle: body.articleTitle,
    baseConfig: body.baseConfig,
    brandTheme: body.brandTheme,
    includeUniversalOverview: false,
  }).map((card, index) => {
    const resolved = resolveSectionVisualStock({
      tenant: body.domain || "shared",
      destination: "blog",
      headline: card.headline,
      text: card.nodes.map((n) => `${n.title} ${n.detail}`).join(" "),
      prismLayout: card.prismLayout,
      sectionIndex: index,
      preferredSceneId: card.sceneIllustration,
    });
    return {
      ...card,
      sceneIllustration: card.sceneIllustration || resolved.scene.id,
    };
  });

  // Prepare stratified section digest covering the entire arc of targeted sections
  const compactSections = sections
    .filter((s) => (targetSet ? true : s.role === "content") && s.blocks.length > 0)
    .slice(0, 10)
    .map((sec) => ({
      sectionId: sec.id,
      rawHeading: sec.title,
      blocks: sampleBlocksAcrossSection(sec.blocks, targetSet ? 22 : 16),
    }));

  if (!compactSections.length) {
    return NextResponse.json({
      visuals: deterministicVisuals,
      providerUsed: "deterministic-baseline",
      cached: false,
      ...(targetSectionIds.length ? { targetedSectionIds: targetSectionIds } : {}),
    });
  }

  // Check bounded TTL cache before spending any LLM tokens
  const cacheKey = hashCacheKey(
    JSON.stringify({
      domain: body.domain || "",
      articleTitle: body.articleTitle || "",
      accent: body.brandTheme?.accent || "",
      targetSectionIds,
      compactSections,
    }),
  );
  if (!body.bypassCache) {
    const cached = getCachedPlan(cacheKey);
    if (cached) {
      return NextResponse.json({
        visuals: cached.visuals,
        providerUsed: cached.providerUsed,
        cached: true,
        ...(targetSectionIds.length ? { targetedSectionIds: targetSectionIds } : {}),
      });
    }
  }

  const systemPrompt = `You are a Principal Editorial Visual Director & Infographic Architect.
Transform each extracted article section into a standalone, social-shareable visual infographic plan so a reader on Facebook, LinkedIn, or Pinterest understands the COMPLETE topic without reading the article.

Strict Editorial & Storytelling Rules:
1. COMPLETE SECTION ARC: Cover EVERY major subheading/phase/category in the section (e.g., if a timeline has 4 phases from Keyword Era to AI Search, cover all 4 phases in order—never stop at Phase 1).
2. STANDALONE HEADLINE & SUBHEADLINE: Never copy bare questions like "What Is X?" or context-dependent headings like "Common Mistakes When Implementing These Strategies" or "FAQs". Always replace demonstratives ("these strategies", "them", "this") with the explicit article subject so the headline makes 100% standalone sense on social media (4–8 words, max 52 chars) and write a clear 1-sentence subheadline (max 92 chars).
3. STANDALONE NODES (2 to 6 nodes per section):
   - "badge": Sequential "01", "02", "03"... (or "Q1", "Q2"... for FAQs, or "PART 1"/"PART 2" for split equations). NEVER skip numbers.
   - "title": Crisp 2–5 word Concept Kernel (or complete FAQ question ending in "?"). Never leave pronouns like "them" or "these" without naming the subject.
   - "detail": Self-contained 1–2 sentence explanation (70–155 chars) that makes complete sense on its own, NEVER starts with a period, NEVER repeats the title, and NEVER leaves out Yes/No polarity on FAQ answers.
   - For tool/resource directory categories, name the actual top 3–4 tools from that category and explain what they do together (do NOT pick 1 random bullet).
   - "sourceBlockIds": 1–3 exact block "id" strings from that section's "blocks" that prove the claim.
4. GENUINE CALLOUT ("calloutText"): Write 1 concise actionable takeaway sentence (40–78 chars) ONLY when it adds a real concluding insight. NEVER copy the subheadline or join card titles with middots.
5. ZERO HALLUCINATIONS: Never invent statistics or percentages. Preserve qualifiers ("up to", "about", "nearly") if present in source blocks.
6. DIVERSE DIAGRAM LAYOUTS & VECTOR SCENES (never repeat the same layout twice in a row):
   - "prismLayout": choose the best visual diagram genre from: ${ALL_LAYOUT_IDS_STR}.
     * Quantitative / ranked benchmarks -> "stat-bars" or "kpi-bento" or "donut-breakdown"
     * Processes / stages / decisions -> "funnel-stages", "pipeline-flow", "zigzag-flowchart", "timeline"
     * Hierarchies / layers / loops -> "hierarchy-tree", "pyramid-tiers", "cycle-wheel"
     * Contrasts / shifts / definitions -> "before-after", "comparison", "split-equation", "quadrant-matrix"
     * Lists / FAQs / playbooks -> "checklist", "editorial", "constellation", "ribbon"
   - "sceneIllustration": one of ${ALL_SCENE_IDS_STR}.

Return strict JSON: { "sections": [ { "sectionId": "...", "headline": "...", "subheadline": "...", "eyebrowLabel": "...", "prismLayout": "...", "sceneIllustration": "...", "comparisonLabels": ["Left", "Right"], "calloutText": "...", "nodes": [ { "badge": "01", "title": "...", "detail": "...", "sourceBlockIds": ["..."] } ] } ] }`;

  const userPrompt = JSON.stringify({
    articleTitle: body.articleTitle || "",
    sourceUrl: body.sourceUrl || "",
    domain: body.domain || "",
    sections: compactSections,
  });

  const aiResult = await runAutomationJsonPrompt<LlmVisualPlanResponse>({
    systemPrompt,
    userPrompt,
    keyOverrides: body.providerKeys,
    temperature: 0.25,
    maxOutputTokens: compactSections.length <= 2 ? 1400 : 4200,
    deterministicFallback: () => ({ sections: [] }),
  });

  const plannedBySectionId = new Map<string, PlannedSectionPayload>();
  for (const item of aiResult.data?.sections || []) {
    if (item && typeof item.sectionId === "string") {
      plannedBySectionId.set(item.sectionId, item);
    }
  }

  if (plannedBySectionId.size === 0) {
    return NextResponse.json({
      visuals: deterministicVisuals,
      providerUsed: aiResult.providerUsed,
      cached: false,
      ...(targetSectionIds.length ? { targetedSectionIds: targetSectionIds } : {}),
    });
  }

  const upgradedVisuals = deterministicVisuals.map((card, idx) => {
    const plan = plannedBySectionId.get(card.sectionId);
    if (!plan || !Array.isArray(plan.nodes) || plan.nodes.length < 2) {
      return card;
    }

    const sectionBlocks = card.visualBrief?.sourceBlocks || [];
    const blockById = new Map(sectionBlocks.map((b) => [b.id, b]));
    const isFaqSection =
      /faq|frequently asked/i.test(card.headline) ||
      card.nodes.every((n) => n.title.trim().endsWith("?"));

    const verifiedNodes: BlogInfographicNodeItem[] = [];
    for (let ni = 0; ni < Math.min(6, plan.nodes.length); ni++) {
      const rawNode = plan.nodes[ni];
      const title = String(rawNode?.title || "").trim();
      const detail = String(rawNode?.detail || "").trim();
      if (!title || !detail || title.length > 90 || detail.length > 260) {
        continue;
      }

      const validBlockIds = (rawNode?.sourceBlockIds || []).filter((id) =>
        blockById.has(id),
      );
      const fallbackBlockId =
        card.nodes[ni]?.sourceBlockIds?.[0] || sectionBlocks[0]?.id;
      const finalBlockIds = validBlockIds.length
        ? validBlockIds
        : fallbackBlockId
          ? [fallbackBlockId]
          : [];
      if (!finalBlockIds.length) continue;

      const citedTexts = finalBlockIds
        .map((id) => blockById.get(id)?.text || "")
        .filter(Boolean);

      const pctCheck = reviewCardPercentages(`${title}. ${detail}`, citedTexts);
      if (!pctCheck.valid) {
        const fallbackNode = card.nodes[ni];
        if (fallbackNode) verifiedNodes.push(fallbackNode);
        continue;
      }

      verifiedNodes.push({
        id: `ai-node-${card.sectionId}-${verifiedNodes.length + 1}`,
        badge: isFaqSection
          ? `Q${verifiedNodes.length + 1}`
          : String(rawNode?.badge || "").trim().slice(0, 6) ||
            String(verifiedNodes.length + 1).padStart(2, "0"),
        title,
        detail,
        metricValue: "",
        sourceBlockIds: finalBlockIds,
      });
    }

    if (verifiedNodes.length < 2) {
      return card;
    }

    // Enforce strictly sequential numbering when numeric badges are used
    const reindexedNodes = verifiedNodes.map((n, ni) => ({
      ...n,
      badge: isFaqSection
        ? `Q${ni + 1}`
        : /^\d+$/.test(n.badge)
          ? String(ni + 1).padStart(2, "0")
          : n.badge,
    }));

    const headline =
      typeof plan.headline === "string" &&
      plan.headline.trim().length >= 6 &&
      plan.headline.trim().length <= 68
        ? plan.headline.trim()
        : card.headline;

    const subheadline =
      typeof plan.subheadline === "string" &&
      plan.subheadline.trim().length <= 130
        ? plan.subheadline.trim()
        : card.subheadline;

    const requestedLayout = plan.prismLayout as PrismLayout | undefined;
    const isTall916 =
      requestedLayout === "checklist" ||
      requestedLayout === "ribbon" ||
      requestedLayout === "constellation" ||
      requestedLayout === "zigzag-flowchart" ||
      requestedLayout === "timeline";
    const layout: PrismLayout =
      requestedLayout &&
      VALID_LAYOUTS.has(requestedLayout) &&
      (requestedLayout !== "comparison" || reindexedNodes.length % 2 === 0) &&
      !(reindexedNodes.length <= 2 && isTall916)
        ? requestedLayout
        : card.prismLayout || "editorial";

    const nodesWithIcons = assignDistinctSectionIcons(reindexedNodes, headline);
    const resolvedStock = resolveSectionVisualStock({
      tenant: body.domain || "shared",
      destination: "blog",
      headline,
      text: nodesWithIcons.map((n) => `${n.title} ${n.detail}`).join(" "),
      prismLayout: layout,
      sectionIndex: idx,
      preferredSceneId: plan.sceneIllustration || card.sceneIllustration,
    });

    const aiCallout =
      typeof plan.calloutText === "string" &&
      plan.calloutText.trim().length >= 18 &&
      plan.calloutText.trim().length <= 140 &&
      plan.calloutText.trim().toLowerCase() !== subheadline.trim().toLowerCase()
        ? plan.calloutText.trim()
        : undefined;

    const criticized = runInfographicQaCritic(
      withPrismLayout(
        {
          ...card,
          headline,
          subheadline,
          highlightWords: extractHeadlineHighlightPhrases(headline).join(", "),
          eyebrowLabel:
            typeof plan.eyebrowLabel === "string" && plan.eyebrowLabel.trim()
              ? plan.eyebrowLabel.trim().slice(0, 64)
              : card.eyebrowLabel,
          calloutText: aiCallout,
          sceneIllustration: resolvedStock.scene.id,
          comparisonLabels:
            (layout === "comparison" || layout === "before-after") &&
            Array.isArray(plan.comparisonLabels) &&
            plan.comparisonLabels.length === 2
              ? [
                  String(plan.comparisonLabels[0]).slice(0, 36),
                  String(plan.comparisonLabels[1]).slice(0, 36),
                ]
              : card.comparisonLabels,
          nodes: nodesWithIcons,
        },
        layout,
      ),
      body.articleTitle,
    );
    const concepts = buildSectionConceptAlternatives(
      criticized,
      body.articleTitle,
    );
    return {
      ...criticized,
      conceptAlternatives: concepts,
      activeConceptId: concepts[0]?.id,
    };
  });

  setCachedPlan(cacheKey, upgradedVisuals, aiResult.providerUsed);

  return NextResponse.json({
    visuals: upgradedVisuals,
    providerUsed: aiResult.providerUsed,
    cached: false,
    ...(targetSectionIds.length ? { targetedSectionIds: targetSectionIds } : {}),
  });
}
