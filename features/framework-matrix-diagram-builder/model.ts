export type DiagramTemplateId =
  | "matrix-2x2"
  | "swot-4-quadrant"
  | "circular-flywheel"
  | "three-pillar-house"
  | "hub-and-spoke"
  | "horizontal-workflow"
  | "layered-pyramid"
  | "iceberg-model"
  | "venn-overlap-3"
  | "staircase-maturity"
  | "honeycomb-cluster"
  | "bow-tie-funnel";

export interface DiagramNodeItem {
  id: string;
  tag: string;
  title: string;
  detail: string;
}

export interface FrameworkDiagramInput {
  diagramTitle: string;
  diagramSubtitle: string;
  centerOrCoreThesis: string;
  xAxisLabel: string;
  yAxisLabel: string;
  sourceNotes: string;
  brandFooter: string;
  template: DiagramTemplateId;
}

export interface FrameworkDiagramPack {
  diagramTitle: string;
  diagramSubtitle: string;
  centerOrCoreThesis: string;
  xAxisLabel: string;
  yAxisLabel: string;
  nodes: DiagramNodeItem[];
  socialPostText: string;
}

export const DEFAULT_FRAMEWORK_DIAGRAM_INPUT: FrameworkDiagramInput = {
  diagramTitle: "Content Growth & SEO Prioritization Matrix",
  diagramSubtitle:
    "How high-leverage teams prioritize content formats by implementation effort vs. compounding traffic impact.",
  centerOrCoreThesis: "Compounding Organic Growth Engine",
  xAxisLabel: "Low Effort  ←  IMPLEMENTATION EFFORT  →  High Effort",
  yAxisLabel: "Low Impact  ←  TRAFFIC & BACKLINK IMPACT  →  High Impact",
  sourceNotes:
    "Quick Wins (High Impact, Low Effort): Repurpose top blog posts into infographics, carousels, and First-Comment social posts.\nStrategic Moats (High Impact, High Effort): Publish original benchmark data studies and interactive free tools that earn backlinks.\nAutomated Maintenance (Low Impact, Low Effort): Refresh meta titles, internal links, and FAQ schema on existing pages.\nTime Traps (Low Impact, High Effort): Writing unedited generic articles on ultra-competitive keywords without original proof.",
  brandFooter: "doitwithai.tools",
  template: "matrix-2x2",
};

export function buildDeterministicFrameworkDiagram(
  input: FrameworkDiagramInput,
): FrameworkDiagramPack {
  const cleanTitle = (input.diagramTitle || "Strategic Framework Diagram")
    .replace(/\s*\|\s*[^|]+$/g, "")
    .trim();

  const lines = String(input.sourceNotes || "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 10);

  const defaultLines = DEFAULT_FRAMEWORK_DIAGRAM_INPUT.sourceNotes.split("\n");
  const selected = (lines.length >= 3 ? lines : defaultLines).slice(0, 6);

  const defaultTagsByTemplate: Record<DiagramTemplateId, string[]> = {
    "matrix-2x2": [
      "Q1 · QUICK WINS",
      "Q2 · STRATEGIC MOATS",
      "Q3 · AUTOMATE / BATCH",
      "Q4 · AVOID / DELEGATE",
      "PHASE 5",
      "PHASE 6",
    ],
    "swot-4-quadrant": [
      "S · STRENGTHS",
      "W · WEAKNESSES",
      "O · OPPORTUNITIES",
      "T · THREATS",
      "ACTION 5",
      "ACTION 6",
    ],
    "circular-flywheel": [
      "STAGE 01",
      "STAGE 02",
      "STAGE 03",
      "STAGE 04",
      "STAGE 05",
      "STAGE 06",
    ],
    "three-pillar-house": [
      "PILLAR 01",
      "PILLAR 02",
      "PILLAR 03",
      "FOUNDATION",
      "ROOF GOAL",
      "SUPPORT",
    ],
    "hub-and-spoke": [
      "SPOKE 01",
      "SPOKE 02",
      "SPOKE 03",
      "SPOKE 04",
      "SPOKE 05",
      "SPOKE 06",
    ],
    "horizontal-workflow": [
      "STEP 01",
      "STEP 02",
      "STEP 03",
      "STEP 04",
      "STEP 05",
      "STEP 06",
    ],
    "layered-pyramid": [
      "TIER 1 · APEX",
      "TIER 2 · STRATEGY",
      "TIER 3 · SYSTEMS",
      "TIER 4 · FOUNDATION",
      "TIER 5",
      "TIER 6",
    ],
    "iceberg-model": [
      "VISIBLE · SURFACE",
      "HIDDEN · ARCHITECTURE",
      "HIDDEN · DATA PROOF",
      "DEEP · AUTHORITY",
      "LAYER 5",
      "LAYER 6",
    ],
    "venn-overlap-3": [
      "CIRCLE 1 · INTENT",
      "CIRCLE 2 · PROOF",
      "CIRCLE 3 · DISTRIBUTION",
      "SWEET SPOT",
      "NODE 5",
      "NODE 6",
    ],
    "staircase-maturity": [
      "LEVEL 1 · BASELINE",
      "LEVEL 2 · SYSTEMIZED",
      "LEVEL 3 · AUTOMATED",
      "LEVEL 4 · COMPOUNDING",
      "LEVEL 5",
      "LEVEL 6",
    ],
    "honeycomb-cluster": [
      "CELL 01",
      "CELL 02",
      "CELL 03",
      "CELL 04",
      "CELL 05",
      "CELL 06",
    ],
    "bow-tie-funnel": [
      "AWARENESS",
      "ACTIVATION",
      "CONVERSION",
      "EXPANSION",
      "ADVOCACY",
      "RETENTION",
    ],
  };

  const tags =
    defaultTagsByTemplate[input.template] ||
    defaultTagsByTemplate["matrix-2x2"];

  const nodes: DiagramNodeItem[] = selected.map((line, idx) => {
    const stripped = line.replace(/^\d+[\).\s-]+|^[•✅📌-]\s*/, "").trim();
    const parts = stripped.split(":");
    const title =
      parts.length >= 2 && parts[0].length <= 45
        ? parts[0].trim()
        : stripped.split(/\s+/).slice(0, 4).join(" ");
    const detail =
      parts.length >= 2 ? parts.slice(1).join(":").trim() : stripped;

    return {
      id: `diag-node-${idx + 1}`,
      tag: tags[idx] || `NODE 0${idx + 1}`,
      title: title.slice(0, 44),
      detail: detail.slice(0, 125),
    };
  });

  while (nodes.length < 4) {
    const idx = nodes.length;
    nodes.push({
      id: `diag-node-${idx + 1}`,
      tag: tags[idx] || `NODE 0${idx + 1}`,
      title: `Strategic Pillar #${idx + 1}`,
      detail: "Actionable operational lever that compounds organic results.",
    });
  }

  return {
    diagramTitle: cleanTitle.slice(0, 72),
    diagramSubtitle:
      input.diagramSubtitle ||
      "Visual mental model and strategic execution framework.",
    centerOrCoreThesis:
      input.centerOrCoreThesis || cleanTitle.slice(0, 38),
    xAxisLabel:
      input.xAxisLabel ||
      "Low Effort  ←  IMPLEMENTATION EFFORT  →  High Effort",
    yAxisLabel:
      input.yAxisLabel || "Low Impact  ←  STRATEGIC IMPACT  →  High Impact",
    nodes,
    socialPostText: `🧠 Strategic Framework: ${cleanTitle}\n\n${nodes.map((n) => `▪ ${n.tag} (${n.title}): ${n.detail}`).join("\n")}\n\nSave this mental model for your next planning session! 👇\n🌐 ${input.brandFooter || "doitwithai.tools"}`,
  };
}
