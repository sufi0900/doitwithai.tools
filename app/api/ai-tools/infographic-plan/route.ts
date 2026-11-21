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

  const sections = Array.isArray(body.sections) ? body.sections.slice(0, 12) : [];
  if (!sections.length) {
    return NextResponse.json(
      { error: "Provide at least one extracted article section." },
      { status: 400 },
    );
  }

  // Build deterministic baseline preserving brand theme (no synthetic double-colon overview card).
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

  // Prepare stratified section digest covering the entire arc of up to 10 content sections
  const compactSections = sections
    .filter((s) => s.role === "content" && s.blocks.length > 0)
    .slice(0, 10)
    .map((sec) => ({
      sectionId: sec.id,
      rawHeading: sec.title,
      blocks: sampleBlocksAcrossSection(sec.blocks, 18),
    }));

  if (!compactSections.length) {
    return NextResponse.json({
      visuals: deterministicVisuals,
      providerUsed: "deterministic-baseline",
    });
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
6. LAYOUTS & SCENES:
   - "prismLayout": one of "editorial", "timeline", "comparison", "ribbon", "constellation", "checklist", "pipeline-flow", "split-equation", "funnel-stages", "quadrant-matrix". (Use "comparison" or "split-equation" when contrasting 2 sides/meanings; use "pipeline-flow" or "funnel-stages" for 3-stage processes; use "quadrant-matrix" for 4 pillars.)
   - "sceneIllustration": one of "ai-search-intelligence", "editorial-workflow-pipeline", "side-by-side-comparison-scale", "analytics-benchmark-telemetry", "verification-trust-shield", "knowledge-hub-architecture", "autonomous-agent-orchestrator", "conversion-funnel-velocity", "editorial-publishing-studio", "social-carousel-distribution", "lifestyle-home-companion", "technical-code-schema", "quadrant-priority-matrix", "executive-roadmap-milestone", "audience-persona-collaboration", "roi-value-calculator".

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
    maxOutputTokens: 4200,
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
      requestedLayout === "constellation";
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
            layout === "comparison" &&
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

  return NextResponse.json({
    visuals: upgradedVisuals,
    providerUsed: aiResult.providerUsed,
  });
}
