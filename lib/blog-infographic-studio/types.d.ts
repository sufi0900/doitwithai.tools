/** Prism Forge: public, optional feature fields. The shared model and its project data remain unchanged. */
import type { InfographicDepth, InfographicSignature } from "./appearance";
import type { PrismLayout, VisualBrief } from "./visual-brief";

export type InfographicTopicIcon =
  | "answer"
  | "evidence"
  | "workflow"
  | "search"
  | "target"
  | "chart"
  | "check"
  | "idea";

declare module "@/lib/blog-writer/canonical-state" {
  interface BlogInfographicNodeItem {
    /** Stable references into the selected section's source blocks. */
    sourceBlockIds?: string[];
    icon?: InfographicTopicIcon;
  }
  interface BlogInfographicConfig {
    /** Optional fields keep existing 25-layout projects compatible. */
    visualEngine?: "prism-antv";
    prismLayout?: PrismLayout;
    visualBrief?: VisualBrief;
    depth?: InfographicDepth;
    signature?: InfographicSignature;
    extractedBrand?: {
      accent?: string;
      siteName: string;
      source: "theme-color" | "css-variable" | "site-name";
    };
  }
}
