import type {
  BlogInfographicConfig,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import { ASPECT_RATIO_DIMENSIONS } from "./palettes";

export type PrismLayoutCategory =
  | "Statistical & Data"
  | "Funnel & Pyramid"
  | "Process & Flowchart"
  | "Hierarchy & Cycle"
  | "Comparison & Split"
  | "Editorial & Lists";

export const PRISM_LAYOUT_CATEGORIES: PrismLayoutCategory[] = [
  "Statistical & Data",
  "Funnel & Pyramid",
  "Process & Flowchart",
  "Hierarchy & Cycle",
  "Comparison & Split",
  "Editorial & Lists",
];

/** Geometry is a template contract. Appearance changes never resize the artwork. */
export const PRISM_LAYOUTS = [
  {
    id: "editorial",
    name: "Editorial atlas",
    ratio: "4:5",
    purpose: "concepts",
    category: "Editorial & Lists" as PrismLayoutCategory,
    description:
      "Large pictograms and clear explanations on a compact editorial poster.",
  },
  {
    id: "constellation",
    name: "Connected concepts",
    ratio: "9:16",
    purpose: "concepts",
    category: "Hierarchy & Cycle" as PrismLayoutCategory,
    description:
      "A visual hub connects related ideas to their full explanations.",
  },
  {
    id: "ribbon",
    name: "Illustrated bands",
    ratio: "9:16",
    purpose: "concepts",
    category: "Editorial & Lists" as PrismLayoutCategory,
    description:
      "Alternating illustrations and generous color bands create a visual summary.",
  },
  {
    id: "timeline",
    name: "Milestone journey",
    ratio: "9:16",
    purpose: "sequence",
    category: "Process & Flowchart" as PrismLayoutCategory,
    description:
      "An alternating left-to-right winding roadmap gives ordered steps clear direction.",
  },
  {
    id: "comparison",
    name: "Perspective comparison",
    ratio: "16:9",
    purpose: "comparison",
    category: "Comparison & Split" as PrismLayoutCategory,
    description:
      "Two labeled perspectives with aligned, alternating pairs of explained points.",
  },
  {
    id: "checklist",
    name: "Illustrated field guide",
    ratio: "9:16",
    purpose: "checklist",
    category: "Editorial & Lists" as PrismLayoutCategory,
    description:
      "A practical checklist or Q&A guide with large illustrations and readable action notes.",
  },
  {
    id: "pipeline-flow",
    name: "3-Stage pipeline flow",
    ratio: "16:9",
    purpose: "sequence",
    category: "Process & Flowchart" as PrismLayoutCategory,
    description:
      "Connected left-to-right flow diagram with stage headers, directional arrows, and punchline bar.",
  },
  {
    id: "split-equation",
    name: "Two-part formula split",
    ratio: "16:9",
    purpose: "concepts",
    category: "Comparison & Split" as PrismLayoutCategory,
    description:
      "Dual pillar cards linked by a central '+' equation hub and a gold definition formula bar.",
  },
  {
    id: "funnel-stages",
    name: "Tapered conversion funnel",
    ratio: "4:5",
    purpose: "sequence",
    category: "Funnel & Pyramid" as PrismLayoutCategory,
    description:
      "Progressively narrowing trapezoid funnel tiers showing how broad inputs refine into high-value outcomes.",
  },
  {
    id: "quadrant-matrix",
    name: "2×2 strategic matrix",
    ratio: "1:1",
    purpose: "comparison",
    category: "Comparison & Split" as PrismLayoutCategory,
    description:
      "Four balanced quadrant cards arranged on a 2×2 grid for multi-discipline or priority comparisons.",
  },
  {
    id: "stat-bars",
    name: "Statistical bar chart",
    ratio: "4:5",
    purpose: "data",
    category: "Statistical & Data" as PrismLayoutCategory,
    description:
      "Horizontal bar chart with axis gridlines, scaled visual bars, and source-backed quantitative insights.",
  },
  {
    id: "donut-breakdown",
    name: "Radial donut breakdown",
    ratio: "1:1",
    purpose: "data",
    category: "Statistical & Data" as PrismLayoutCategory,
    description:
      "Multi-segment radial ring chart with center summary hub and color-coded legend breakdown cards.",
  },
  {
    id: "hierarchy-tree",
    name: "Hierarchical node tree",
    ratio: "16:9",
    purpose: "hierarchy",
    category: "Hierarchy & Cycle" as PrismLayoutCategory,
    description:
      "Top-down org/taxonomy node graph linking a central root topic via orthogonal branches to child pillars.",
  },
  {
    id: "pyramid-tiers",
    name: "Strategic pyramid tiers",
    ratio: "4:5",
    purpose: "hierarchy",
    category: "Funnel & Pyramid" as PrismLayoutCategory,
    description:
      "Geometric stacked pyramid widening from the apex goal down to its foundational base tiers.",
  },
  {
    id: "cycle-wheel",
    name: "Flywheel cycle loop",
    ratio: "1:1",
    purpose: "sequence",
    category: "Hierarchy & Cycle" as PrismLayoutCategory,
    description:
      "Continuous circular flywheel with directional loop arrows paired with concise step cards.",
  },
  {
    id: "before-after",
    name: "Before vs. After split",
    ratio: "16:9",
    purpose: "comparison",
    category: "Comparison & Split" as PrismLayoutCategory,
    description:
      "High-contrast transformation diagram contrasting legacy state on the left with optimized results on the right.",
  },
  {
    id: "zigzag-flowchart",
    name: "Decision flowchart",
    ratio: "9:16",
    purpose: "sequence",
    category: "Process & Flowchart" as PrismLayoutCategory,
    description:
      "True start-to-outcome process flowchart with elbow connectors and diamond decision checkpoints.",
  },
  {
    id: "kpi-bento",
    name: "Executive KPI bento",
    ratio: "16:9",
    purpose: "data",
    category: "Statistical & Data" as PrismLayoutCategory,
    description:
      "Asymmetric magazine scorecard featuring a hero spotlight tile with trend sparkline alongside supporting insights.",
  },
  {
    id: "pie-chart",
    name: "Segmented pie chart",
    ratio: "16:9",
    purpose: "data",
    category: "Statistical & Data" as PrismLayoutCategory,
    description:
      "Vibrant multi-slice pie chart paired with color-matched legend callouts for share, mix, and breakdown stories.",
  },
  {
    id: "vertical-bars",
    name: "Vertical column chart",
    ratio: "16:9",
    purpose: "data",
    category: "Statistical & Data" as PrismLayoutCategory,
    description:
      "Vertical bar columns with horizontal gridlines, top callout badges, trend line, and aligned category takeaways.",
  },
  {
    id: "winding-roadmap",
    name: "Winding S-curve roadmap",
    ratio: "16:9",
    purpose: "sequence",
    category: "Process & Flowchart" as PrismLayoutCategory,
    description:
      "Curved milestone road with dashed center stripe, teardrop map pins, and alternating phase cards.",
  },
] as const;
export type PrismLayout = (typeof PRISM_LAYOUTS)[number]["id"];

export function prismLayoutSpec(id?: PrismLayout) {
  return PRISM_LAYOUTS.find((l) => l.id === id) || PRISM_LAYOUTS[0];
}
export function fixedInfographicRatio(
  config?: Partial<BlogInfographicConfig>,
): InfographicAspectRatio {
  if (config?.visualEngine === "prism-antv")
    return prismLayoutSpec(config.prismLayout).ratio;
  const id = config?.templateId || 1;
  if ([1, 6, 7, 8, 9, 10, 23, 24, 25].includes(id)) return "16:9";
  if ([2, 4, 5, 17, 18, 19, 20, 21, 22].includes(id)) return "9:16";
  return "4:5";
}
export function getInfographicDimensions(
  config?: Partial<BlogInfographicConfig>,
) {
  return ASPECT_RATIO_DIMENSIONS[fixedInfographicRatio(config)];
}
export function lockInfographicGeometry(
  config: BlogInfographicConfig,
): BlogInfographicConfig {
  return { ...config, aspectRatio: fixedInfographicRatio(config) };
}
