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
 *  1. Every synthesized node cites valid `sourceBlockIds[]` from the section.
 *  2. `reviewCardPercentages` verifies that no percentage is invented or stripped of qualifiers.
 *  3. Each section receives a reframed thesis headline, non-overlapping 2-5 word Concept Kernels,
 *     a matched commercial-safe vector scene (`sceneIllustration`), and varied Prism layouts.
 */

import { NextResponse } from "next/server";
import type { ArticleSourceSection } from "@/lib/blog-infographic-studio/article-source";
import {
  buildAllArticleSectionVisuals,
  withPrismLayout,
  type PrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
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

export async function POST(request: Request) {
  let body: {
    sections?: ArticleSourceSection[];
    sourceUrl?: string;
    domain?: string;
    baseConfig?: BlogInfographicConfig;
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

  // Always build the deterministic baseline first so every section is guaranteed valid.
  const deterministicVisuals = buildAllArticleSectionVisuals(sections, {
    sourceUrl: body.sourceUrl,
    domain: body.domain,
    baseConfig: body.baseConfig,
    includeUniversalOverview: true,
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

  // Prepare compact section digest for the LLM visual planner
  const compactSections = sections
    .filter((s) => s.role === "content" && s.blocks.length > 0)
    .slice(0, 8)
    .map((sec) => ({
      sectionId: sec.id,
      rawHeading: sec.title,
      blocks: sec.blocks.slice(0, 10).map((b) => ({
        id: b.id,
        kind: b.kind,
        heading: b.heading,
        text: b.text.slice(0, 340),
      })),
    }));

  if (!compactSections.length) {
    return NextResponse.json({
      visuals: deterministicVisuals,
      providerUsed: "deterministic-baseline",
    });
  }

  const systemPrompt = `You are a Principal Editorial Visual Director & Infographic Architect.
Transform each extracted article section into a standalone, high-impact visual infographic plan.
Rules:
1. NEVER copy generic question headings like "What Is X?" verbatim as the headline. Reframe into an authoritative thesis headline (4-8 words, max 54 chars) + a 1-sentence explanatory subheadline (max 95 chars).
2. Distill 2 to 5 standalone nodes per section:
   - "title": Crisp 2-5 word Concept Kernel (e.g. "Answer Engine Citations", NOT a truncated sentence).
   - "detail": 1 concise, self-contained explanation sentence (55-150 chars) that does NOT repeat the title verbatim.
   - "sourceBlockIds": Array of 1-2 exact block "id" strings from that section's "blocks" that prove the claim.
3. NEVER invent statistics or percentages. If you include a percentage from a source block, preserve any qualifier ("up to", "about", "nearly").
4. Choose the best "prismLayout" for each section from: "editorial", "timeline", "comparison", "ribbon", "constellation", "checklist", "process-flow", "bento-grid", "hub-spoke", "funnel", "kpi-metrics", "quadrant", "anatomy-diagram", "quote-spotlight". Vary layouts across sections.
5. Choose "sceneIllustration" from: "ai-search-intelligence", "editorial-workflow-pipeline", "side-by-side-comparison-scale", "analytics-benchmark-telemetry", "verification-trust-shield", "knowledge-hub-architecture", "autonomous-agent-orchestrator", "conversion-funnel-velocity", "editorial-publishing-studio", "social-carousel-distribution", "lifestyle-home-companion", "technical-code-schema", "quadrant-priority-matrix", "executive-roadmap-milestone", "audience-persona-collaboration", "roi-value-calculator".
Return strict JSON: { "sections": [ { "sectionId": "...", "headline": "...", "subheadline": "...", "eyebrowLabel": "...", "prismLayout": "...", "sceneIllustration": "...", "comparisonLabels": ["Left", "Right"], "nodes": [ { "badge": "01", "title": "...", "detail": "...", "sourceBlockIds": ["..."] } ] } ] }`;

  const userPrompt = JSON.stringify({
    sourceUrl: body.sourceUrl || "",
    domain: body.domain || "",
    sections: compactSections,
  });

  const aiResult = await runAutomationJsonPrompt<LlmVisualPlanResponse>({
    systemPrompt,
    userPrompt,
    keyOverrides: body.providerKeys,
    temperature: 0.25,
    maxOutputTokens: 3200,
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

  // Merge verified AI plans into the deterministic visuals while strictly enforcing
  // sourceBlockIds and percentage qualifier verification.
  const upgradedVisuals = deterministicVisuals.map((card, idx) => {
    const plan = plannedBySectionId.get(card.sectionId);
    if (!plan || !Array.isArray(plan.nodes) || plan.nodes.length < 2) {
      return card;
    }

    const sectionBlocks = card.visualBrief?.sourceBlocks || [];
    const blockById = new Map(sectionBlocks.map((b) => [b.id, b]));

    const verifiedNodes: BlogInfographicNodeItem[] = [];
    for (let ni = 0; ni < Math.min(6, plan.nodes.length); ni++) {
      const rawNode = plan.nodes[ni];
      const title = String(rawNode?.title || "").trim();
      const detail = String(rawNode?.detail || "").trim();
      if (!title || !detail || title.length > 90 || detail.length > 280) {
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
        // Reject hallucinated or stripped-qualifier percentage nodes; fall back to deterministic node
        const fallbackNode = card.nodes[ni];
        if (fallbackNode) verifiedNodes.push(fallbackNode);
        continue;
      }

      verifiedNodes.push({
        id: `ai-node-${card.sectionId}-${ni + 1}`,
        badge:
          String(rawNode?.badge || "").trim().slice(0, 6) ||
          String(ni + 1).padStart(2, "0"),
        title,
        detail,
        metricValue: "",
        sourceBlockIds: finalBlockIds,
      });
    }

    if (verifiedNodes.length < 2) {
      return card;
    }

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
    const layout: PrismLayout =
      requestedLayout &&
      VALID_LAYOUTS.has(requestedLayout) &&
      (requestedLayout !== "comparison" || verifiedNodes.length % 2 === 0)
        ? requestedLayout
        : card.prismLayout || "editorial";

    const nodesWithIcons = assignDistinctSectionIcons(verifiedNodes, headline);
    const resolvedStock = resolveSectionVisualStock({
      tenant: body.domain || "shared",
      destination: "blog",
      headline,
      text: nodesWithIcons.map((n) => `${n.title} ${n.detail}`).join(" "),
      prismLayout: layout,
      sectionIndex: idx,
      preferredSceneId: plan.sceneIllustration || card.sceneIllustration,
    });

    return runInfographicQaCritic(
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
    );
  });

  return NextResponse.json({
    visuals: upgradedVisuals,
    providerUsed: aiResult.providerUsed,
  });
}
