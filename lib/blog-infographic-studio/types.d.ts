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
import type { BlogInfographicNodeItem } from "@/lib/blog-writer/canonical-state";

export type { InfographicTopicIcon } from "./skills/semantic-iconography";

export interface InfographicStyleOverrides {
  /** Scale multiplier for main headline font size (0.75..1.35) */
  headlineScale?: number;
  /** Scale multiplier for card title font size (0.75..1.35) */
  cardTitleScale?: number;
  /** Scale multiplier for card body detail font size (0.75..1.35) */
  bodyScale?: number;
  /** Extra internal vertical padding inside cards (-12..40 px) */
  cardPaddingY?: number;
  /** Extra vertical gap between cards (-12..48 px) */
  cardGap?: number;
  /** Card corner radius (8..36 px) */
  cardRadius?: number;
  /** Left accent stripe width on cards (0..14 px) */
  accentBarWidth?: number;
  /** Bottom callout banner style & expansion */
  calloutStyle?: "default" | "full-banner" | "accent-pill" | "gold-pill" | "hidden";
  /** Bottom footer & brand logo bar style */
  footerBarStyle?: "minimal" | "pill-banner" | "dark-dock" | "light-dock";
  /** Lock extracted website brand color across background canvas */
  brandBackgroundMode?: "theme-default" | "brand-vibrant" | "brand-dark" | "brand-soft";
}

export interface InfographicConceptAlternative {
  id: string;
  label: string;
  archetypeLabel: string;
  prismLayout: PrismLayout;
  headline: string;
  subheadline: string;
  eyebrowLabel?: string;
  calloutBadge?: string;
  calloutText?: string;
  comparisonLabels?: [string, string];
  centerLabel?: string;
  sceneIllustration?: string;
  nodes: BlogInfographicNodeItem[];
}

declare module "@/lib/blog-writer/canonical-state" {
  interface BlogInfographicNodeItem {
    /** Stable references into the selected section's source blocks. */
    sourceBlockIds?: string[];
    icon?: InfographicTopicIcon;
    /** Optional user-uploaded custom icon/logo/object data URL (PNG/JPG/WebP) */
    customIconDataUrl?: string;
    /** Optional accent hex override for this specific card */
    accentHex?: string;
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
    /** Optional user-uploaded custom illustration/object data URL (PNG/JPG/WebP) replacing the header scene illustration */
    customSceneImageUrl?: string;
    /** Canva-style fine-grained typography, padding, margin, bar & footer overrides */
    styleOverrides?: InfographicStyleOverrides;
    /** Multi-concept AI ideas for this section (each with distinct layout + tailored copy) */
    conceptAlternatives?: InfographicConceptAlternative[];
    activeConceptId?: string;
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
