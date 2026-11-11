import type {
  BlogInfographicConfig,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import { ASPECT_RATIO_DIMENSIONS } from "./palettes";

/** Geometry is a template contract. Appearance changes never resize the artwork. */
export const PRISM_LAYOUTS = [
  {
    id: "editorial",
    name: "Editorial atlas",
    ratio: "4:5",
    purpose: "concepts",
    description:
      "Large pictograms and clear explanations on a compact editorial poster.",
  },
  {
    id: "constellation",
    name: "Connected concepts",
    ratio: "9:16",
    purpose: "concepts",
    description:
      "A visual hub connects related ideas to their full explanations.",
  },
  {
    id: "ribbon",
    name: "Illustrated bands",
    ratio: "9:16",
    purpose: "concepts",
    description:
      "Alternating illustrations and generous color bands create a visual summary.",
  },
  {
    id: "timeline",
    name: "Milestone journey",
    ratio: "9:16",
    purpose: "sequence",
    description:
      "A continuous vertical route gives ordered steps a clear direction.",
  },
  {
    id: "comparison",
    name: "Perspective comparison",
    ratio: "16:9",
    purpose: "comparison",
    description:
      "Two labeled perspectives with aligned, alternating pairs of explained points.",
  },
  {
    id: "checklist",
    name: "Illustrated field guide",
    ratio: "9:16",
    purpose: "checklist",
    description:
      "A practical checklist with large illustrations and readable action notes.",
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
