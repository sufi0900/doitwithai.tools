/** Prism Forge: public, optional feature fields. The shared model and its project data remain unchanged. */
import type {
  BackgroundPattern,
  InfographicCardStyle,
  InfographicDepth,
  InfographicFontFamily,
  InfographicSignature,
} from "./appearance";
import type { PrismLayout, VisualBrief } from "./visual-brief";
import type { InfographicTopicIcon } from "./skills/semantic-iconography";

export type { InfographicTopicIcon } from "./skills/semantic-iconography";

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
    backgroundPattern?: BackgroundPattern;
    cardStyle?: InfographicCardStyle;
    fontFamily?: InfographicFontFamily;
    secondaryAccent?: string;
    highlightWords?: string;
    eyebrowLabel?: string;
    slideCounter?: string;
    calloutBadge?: string;
    calloutText?: string;
    /** Optional commercial-safe vector scene illustration ID from `lib/visual-stock/vector-scenes.ts` (or `"none"`). */
    sceneIllustration?: string;
    extractedBrand?: {
      accent?: string;
      secondaryAccent?: string;
      isDark?: boolean;
      logoUrl?: string;
      logoDataUrl?: string;
      siteName: string;
      source: "theme-color" | "css-variable" | "site-name";
    };
  }
}
