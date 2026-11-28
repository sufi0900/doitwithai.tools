/**
 * Content-Aware Visual Fit & Archetype Compatibility Engine
 * File: lib/blog-infographic-studio/visual-fit.ts
 *
 * Ensures infographic templates are NEVER blindly forced onto incompatible sections
 * (e.g., never putting FAQs inside a Conversion Funnel, Pyramid, or Pie Chart).
 * Computes the exact editorial content intent of any section or config and returns
 * only the genuinely compatible diagram archetypes ranked by fit.
 */

import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import type { PrismLayout } from "./layout-registry";
import { isFaqHeadingOrSection } from "./skills/topic-intelligence";

export type VisualContentIntent =
  | "faq"
  | "data-stats"
  | "comparison"
  | "process-roadmap"
  | "hierarchy-framework"
  | "listing-playbook";

export interface SectionVisualFitProfile {
  intent: VisualContentIntent;
  intentLabel: string;
  reason: string;
  compatibleLayouts: PrismLayout[];
}

export function classifyVisualContentIntent(input: {
  title: string;
  subheadline?: string;
  nodeTitles?: string[];
  nodeDetails?: string[];
  nodeBadges?: string[];
  nodeMetrics?: string[];
  isFaqHint?: boolean;
  relationship?: "concepts" | "sequence";
  hasBothComparisonSides?: boolean;
  archetype?: string;
}): VisualContentIntent {
  const title = (input.title || "").trim();
  const nodeTitles = input.nodeTitles || [];
  const nodeDetails = input.nodeDetails || [];
  const nodeBadges = input.nodeBadges || [];
  const nodeMetrics = input.nodeMetrics || [];
  const combined = `${title} ${input.subheadline || ""} ${nodeTitles.join(" ")} ${nodeDetails.join(" ")}`;

  // 1. Strict FAQ detection first (FAQs should NEVER leak into funnels, pyramids, or pie charts)
  const questionTitleCount = nodeTitles.filter((t) =>
    t.trim().endsWith("?"),
  ).length;
  const qBadgeCount = nodeBadges.filter((b) => /^Q\d+$/i.test(b.trim())).length;
  if (
    input.isFaqHint ||
    isFaqHeadingOrSection(title) ||
    questionTitleCount >= 2 ||
    qBadgeCount >= 2
  ) {
    return "faq";
  }

  // 2. Quantitative / statistical data detection (real percentages, ratios, multipliers, explicit metrics)
  const hasRealNumbers =
    nodeMetrics.some((m) => /\d/.test(m || "")) ||
    (combined.match(/\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\b\d+\s+of\s+\d+\b|\$\d+/gi) || [])
      .length >= 2;
  const isStatsHeading =
    /\b(statistics|stats|benchmarks?|metrics?|kpis?|roi|market share|breakdown|distribution|allocation|survey|study findings|ranking factors|growth rate|traffic share|data)\b/i.test(
      title,
    );
  if (hasRealNumbers || isStatsHeading) {
    return "data-stats";
  }

  // 3. Explicit comparison / before-after / versus / two meanings
  const isComparisonHeading =
    input.hasBothComparisonSides ||
    input.archetype === "comparison" ||
    /\b(vs\.?|versus|compare|comparison|difference|differences|trade-?off|before\s*(?:and|&|vs\.?)\s*after|legacy|old\s+way|two\s+meanings|two\s+sides|two\s+worlds|pros\s+and\s+cons)\b/i.test(
      title,
    );
  if (isComparisonHeading) {
    return "comparison";
  }

  // 4. Process / Roadmap / Workflow / Step-by-step / Funnel / Cycle / Timeline
  const isProcessHeading =
    input.relationship === "sequence" ||
    input.archetype === "process" ||
    /\b(roadmap|timeline|workflow|process|how\s+to|getting\s+started|step[- ]by[- ]step|steps?\s+to|phases?|stages?|funnel|pipeline|journey|cycle|flywheel|loop|evolution|history|quarterly|implementation\s+plan)\b/i.test(
      title,
    ) ||
    nodeTitles.filter((t) => /^(?:step|phase|stage|month|quarter|q[1-4])\s*\d/i.test(t.trim()))
      .length >= 2;
  if (isProcessHeading) {
    return "process-roadmap";
  }

  // 5. Hierarchy / Pyramid / System Architecture / Ecosystem / Core Pillars
  const isHierarchyHeading =
    /\b(pyramid|tiers?|levels?|maturity|foundation|architecture|hierarchy|ecosystem|taxonomy|anatomy|stack|layers?|framework|pillars?|components?|structure|core\s+elements)\b/i.test(
      title,
    );
  if (isHierarchyHeading) {
    return "hierarchy-framework";
  }

  // 6. Default: Listing / Playbook / Mistakes / Checklist / Tool Directory / General Explainers
  return "listing-playbook";
}

function filterLayoutsByCapacity(
  layouts: PrismLayout[],
  nodeCount: number,
): PrismLayout[] {
  return layouts.filter((layout) => {
    if (layout === "split-equation") return nodeCount === 2;
    if (layout === "comparison") return nodeCount >= 2 && nodeCount % 2 === 0;
    if (layout === "before-after") return nodeCount >= 2 && nodeCount <= 6;
    if (layout === "pipeline-flow") return nodeCount >= 2 && nodeCount <= 4;
    if (layout === "quadrant-matrix") return nodeCount >= 3 && nodeCount <= 6;
    if (layout === "kpi-bento") return nodeCount >= 2 && nodeCount <= 5;
    if (layout === "pie-chart" || layout === "donut-breakdown") {
      return nodeCount >= 3 && nodeCount <= 6;
    }
    if (layout === "vertical-bars") return nodeCount >= 3 && nodeCount <= 6;
    if (layout === "winding-roadmap") return nodeCount >= 3 && nodeCount <= 6;
    if (layout === "hierarchy-tree") return nodeCount >= 2 && nodeCount <= 6;
    if (layout === "pyramid-tiers" || layout === "funnel-stages") {
      return nodeCount >= 3 && nodeCount <= 6;
    }
    if (layout === "cycle-wheel") return nodeCount >= 3 && nodeCount <= 6;
    if (
      (layout === "checklist" ||
        layout === "ribbon" ||
        layout === "constellation" ||
        layout === "timeline" ||
        layout === "zigzag-flowchart") &&
      nodeCount <= 2
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Returns the strictly compatible diagram layouts for a section, ordered by best
 * visual/editorial match, so incompatible templates are never blindly suggested.
 */
export function getSectionVisualFitProfile(input: {
  title: string;
  subheadline?: string;
  nodeTitles?: string[];
  nodeDetails?: string[];
  nodeBadges?: string[];
  nodeMetrics?: string[];
  nodeCount: number;
  isFaqHint?: boolean;
  relationship?: "concepts" | "sequence";
  hasBothComparisonSides?: boolean;
  archetype?: string;
}): SectionVisualFitProfile {
  const intent = classifyVisualContentIntent(input);
  const title = input.title || "";
  const count = Math.max(2, input.nodeCount || 2);

  let rawCandidates: PrismLayout[];
  let intentLabel: string;
  let reason: string;

  switch (intent) {
    case "faq":
      intentLabel = "FAQ & Q&A";
      reason =
        "Q&A pairs read best in clean card grids, checklists, and editorial layouts — never forced into funnels, pyramids, or pie charts.";
      rawCandidates =
        count <= 2
          ? ["editorial", "split-equation", "kpi-bento"]
          : ["editorial", "checklist", "quadrant-matrix", "ribbon"];
      break;

    case "data-stats":
      intentLabel = "Data & Metrics";
      reason =
        "Quantified signals and benchmarks are paired with authentic charts (pie, vertical columns, horizontal bars, donut, and KPI scorecards).";
      rawCandidates = /\b(share|mix|distribution|allocation|composition|breakdown|split)\b/i.test(
        title,
      )
        ? [
            "pie-chart",
            "donut-breakdown",
            "vertical-bars",
            "stat-bars",
            "kpi-bento",
            "editorial",
            "split-equation",
          ]
        : [
            "vertical-bars",
            "stat-bars",
            "pie-chart",
            "kpi-bento",
            "donut-breakdown",
            "editorial",
            "split-equation",
          ];
      break;

    case "comparison":
      intentLabel = "Comparison & Split";
      reason =
        "Contrasting perspectives and before/after shifts belong in side-by-side splits, transformation arrows, and 2-part formulas.";
      rawCandidates = /\b(before|after|legacy|old\s+way|transform|shift|evolution)\b/i.test(
        title,
      )
        ? [
            "before-after",
            "comparison",
            "split-equation",
            "quadrant-matrix",
            "editorial",
          ]
        : [
            "comparison",
            "split-equation",
            "before-after",
            "quadrant-matrix",
            "editorial",
          ];
      break;

    case "process-roadmap":
      intentLabel = "Process & Roadmap";
      reason =
        "Sequential steps, workflows, and growth loops map naturally to roadmaps, pipelines, funnels, flowcharts, and flywheels.";
      rawCandidates = /\b(evolution|history|chronology|timeline|eras?|decades?)\b/i.test(
        title,
      )
        ? [
            "winding-roadmap",
            "timeline",
            "pipeline-flow",
            "zigzag-flowchart",
            "before-after",
            "editorial",
          ]
        : /\b(cycle|flywheel|loop|continuous|iterative|recurring)\b/i.test(
            title,
          )
          ? [
              "cycle-wheel",
              "winding-roadmap",
              "zigzag-flowchart",
              "pipeline-flow",
              "timeline",
              "before-after",
              "editorial",
            ]
          : /\b(funnel|conversion|lead|stage|stages|qualify)\b/i.test(title)
            ? [
                "funnel-stages",
                "winding-roadmap",
                "pipeline-flow",
                "zigzag-flowchart",
                "timeline",
                "before-after",
                "editorial",
              ]
            : [
                "winding-roadmap",
                "pipeline-flow",
                "zigzag-flowchart",
                "funnel-stages",
                "timeline",
                "cycle-wheel",
                "checklist",
                "before-after",
                "editorial",
              ];
      break;

    case "hierarchy-framework":
      intentLabel = "Hierarchy & Framework";
      reason =
        "Layered frameworks, architectures, and priority tiers fit pyramids, node trees, connected hubs, and strategic matrices.";
      rawCandidates = /\b(pyramid|tier|tiers|level|levels|foundation|maturity|priority)\b/i.test(
        title,
      )
        ? [
            "pyramid-tiers",
            "hierarchy-tree",
            "quadrant-matrix",
            "constellation",
            "editorial",
            "kpi-bento",
            "split-equation",
          ]
        : [
            "hierarchy-tree",
            "pyramid-tiers",
            "constellation",
            "quadrant-matrix",
            "donut-breakdown",
            "editorial",
            "kpi-bento",
            "split-equation",
          ];
      break;

    default:
      intentLabel = "Playbook & Listing";
      reason =
        "Action lists, checks, mistakes, and tool playbooks stay crisp in checklists, editorial grids, bento scorecards, and illustrated bands.";
      rawCandidates = /\b(check|checklist|audit|verify|mistake|mistakes|myth|myths|rules|tips)\b/i.test(
        title,
      )
        ? [
            "checklist",
            "editorial",
            "quadrant-matrix",
            "ribbon",
            "kpi-bento",
            "constellation",
            "before-after",
            "split-equation",
          ]
        : [
            "editorial",
            "kpi-bento",
            "quadrant-matrix",
            "constellation",
            "checklist",
            "ribbon",
            "hierarchy-tree",
            "split-equation",
            "before-after",
          ];
      break;
  }

  const compatible = filterLayoutsByCapacity(rawCandidates, count);
  return {
    intent,
    intentLabel,
    reason,
    compatibleLayouts: compatible.length > 0 ? compatible : ["editorial"],
  };
}

/**
 * Convenience wrapper for any compiled BlogInfographicConfig (used by the Studio UI
 * gallery filter and concept generator).
 */
export function getRecommendedLayoutsForConfig(
  config: BlogInfographicConfig,
): SectionVisualFitProfile {
  return getSectionVisualFitProfile({
    title: config.headline,
    subheadline: config.subheadline,
    nodeTitles: config.nodes.map((n) => n.title),
    nodeDetails: config.nodes.map((n) => n.detail),
    nodeBadges: config.nodes.map((n) => n.badge),
    nodeMetrics: config.nodes.map((n) => n.metricValue || ""),
    nodeCount: config.nodes.length,
    relationship: config.visualBrief?.relationship,
    hasBothComparisonSides: Boolean(config.comparisonLabels?.length === 2),
  });
}
