import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import { scoreHeadlineHighlightPhrases } from "./skills/standalone-copywriter";

export type DepthPreset = "flat" | "soft" | "raised" | "layered";
export interface InfographicDepth {
  preset: DepthPreset;
  strength?: number;
  softness?: number;
  distance?: number;
  opacity?: number;
  direction?: "down" | "left" | "right";
}
export interface InfographicSignature {
  name?: string;
  visible?: boolean;
  showLogo?: boolean;
  placement?: "header" | "footer";
  align?: "left" | "right";
  padding?: number;
}
export type BackgroundPattern =
  | "dots-glow"
  | "svg-waves"
  | "mesh-grid"
  | "concentric-rings"
  | "clean-gradient";

export type InfographicCardStyle =
  | "glass-editorial"
  | "playbook-contrast"
  | "bordered-bento"
  | "minimal-stripe";

export type InfographicFontFamily =
  | "inter-jakarta"
  | "space-grotesk"
  | "editorial-serif"
  | "system-arial";

export const BACKGROUND_PATTERNS: {
  id: BackgroundPattern;
  label: string;
  description: string;
}[] = [
  {
    id: "dots-glow",
    label: "Dot Matrix & Dual Glow",
    description: "28px dot grid with primary and gold radial spotlights.",
  },
  {
    id: "svg-waves",
    label: "Flowing SVG Waves",
    description: "Multi-layered harmonic bezier ribbons and corner glow.",
  },
  {
    id: "mesh-grid",
    label: "Architectural Grid",
    description: "Precision technical grid lines with subtle vignette.",
  },
  {
    id: "concentric-rings",
    label: "Orbital Rings",
    description: "Concentric geometric arcs with soft spotlight depth.",
  },
  {
    id: "clean-gradient",
    label: "Minimal Gradient",
    description: "Restrained editorial gradient with quiet framing.",
  },
];

export const CARD_STYLES: {
  id: InfographicCardStyle;
  label: string;
}[] = [
  { id: "glass-editorial", label: "Editorial Glass" },
  { id: "playbook-contrast", label: "Playbook Contrast" },
  { id: "bordered-bento", label: "Bordered Bento" },
  { id: "minimal-stripe", label: "Minimal Stripe" },
];

export const FONT_FAMILIES: {
  id: InfographicFontFamily;
  label: string;
  stack: string;
}[] = [
  {
    id: "system-arial",
    label: "Classic Clean (Arial)",
    stack: "Arial, sans-serif",
  },
  {
    id: "inter-jakarta",
    label: "Modern Sans (Inter / Jakarta)",
    stack: "Inter, 'Plus Jakarta Sans', Arial, sans-serif",
  },
  {
    id: "space-grotesk",
    label: "Tech Geometric (Space Grotesk)",
    stack: "'Space Grotesk', Inter, Arial, sans-serif",
  },
  {
    id: "editorial-serif",
    label: "Executive Serif (Georgia)",
    stack: "Georgia, 'Times New Roman', serif",
  },
];

export function resolveFontStack(fontFamily?: InfographicFontFamily): string {
  const found = FONT_FAMILIES.find((f) => f.id === fontFamily);
  return found ? found.stack : "Arial, sans-serif";
}

export const DEPTH_PRESETS: DepthPreset[] = [
  "flat",
  "soft",
  "raised",
  "layered",
];
export const isHex = (v: unknown): v is string =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
export function mixColor(a: string, b: string, weight: number) {
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - weight) +
            parseInt(b.slice(i, i + 2), 16) * weight,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
export const contrast = (a: string, b: string) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);
export function readableAccent(accent: string, surface: string) {
  const target = luminance(surface) > 0.4 ? "#101827" : "#FFFFFF";
  let result = accent;
  for (let i = 0; i < 12 && contrast(result, surface) < 4.5; i++)
    result = mixColor(result, target, 0.15);
  return result;
}
export function brandColors(accent: string, dark = false) {
  const safe = isHex(accent) ? accent : "#5271FF";
  return {
    bgStart: mixColor(safe, dark ? "#06101E" : "#FFFFFF", dark ? 0.82 : 0.88),
    surface: mixColor(safe, dark ? "#111827" : "#FFFFFF", dark ? 0.88 : 0.97),
    accent: safe,
    textMain: dark ? "#F8FAFC" : "#111B32",
  };
}
export function brandBackgroundColors(
  accent: string,
  mode: "brand-vibrant" | "brand-dark" | "brand-soft",
) {
  const safe = isHex(accent) ? accent : "#4A6CF7";
  if (mode === "brand-vibrant") {
    return {
      bgStart: mixColor("#0B1020", safe, 0.28),
      surface: mixColor("#11182E", safe, 0.22),
      accent: readableAccent(safe, "#11182E"),
      textMain: "#FFFFFF",
    };
  }
  if (mode === "brand-dark") {
    return brandColors(safe, true);
  }
  return brandColors(safe, false);
}
/**
 * Generates 6 cohesive, WCAG-AA brand-locked theme variants for multi-section
 * article suites so EVERY section unmistakably carries the extracted website's
 * brand accent while preserving visual contrast and background diversity.
 */
export function brandSectionVariantColors(
  accent: string,
  secondaryAccent: string | undefined,
  sectionIndex: number,
  preferDark = true,
) {
  const safe = isHex(accent) ? accent : "#4A6CF7";
  const sec = isHex(secondaryAccent) ? secondaryAccent : safe;
  const variant = ((sectionIndex % 6) + 6) % 6;
  switch (variant) {
    case 0:
      return brandColors(safe, preferDark);
    case 1:
      return brandBackgroundColors(safe, "brand-vibrant");
    case 2:
      return {
        bgStart: mixColor(safe, "#F8FAFC", 0.91),
        surface: "#FFFFFF",
        accent: safe,
        textMain: "#0F172A",
      };
    case 3:
      return {
        bgStart: mixColor(safe, "#070C18", 0.88),
        surface: mixColor(safe, "#0F172A", 0.9),
        accent: safe,
        textMain: "#F8FAFC",
      };
    case 4:
      return {
        bgStart: mixColor(sec, "#FFFBEB", 0.9),
        surface: mixColor(sec, "#FFFFFF", 0.96),
        accent: safe,
        textMain: "#111827",
      };
    default:
      return {
        bgStart: mixColor(sec, "#0C1322", 0.85),
        surface: mixColor(sec, "#162033", 0.87),
        accent: safe,
        textMain: "#F1F5F9",
      };
  }
}
export function infographicColors(config: BlogInfographicConfig) {
  const p =
    BLOG_INFOGRAPHIC_PALETTES[config.paletteId] ||
    BLOG_INFOGRAPHIC_PALETTES["blue-trust"];
  const mode = config.styleOverrides?.brandBackgroundMode;
  const brandAccent =
    config.extractedBrand?.accent || config.brand?.customColors?.accent;
  const modeColors =
    mode && mode !== "theme-default" && isHex(brandAccent)
      ? brandBackgroundColors(brandAccent, mode)
      : undefined;
  const c = modeColors || config.brand?.customColors;
  const bg = isHex(c?.bgStart) ? c.bgStart : p.bgStart;
  const surface = isHex(c?.surface) ? c.surface : p.surface;
  const ink = isHex(c?.textMain) ? c.textMain : p.textMain;
  const light = luminance(surface) > 0.4;
  const accent = readableAccent(
    isHex(c?.accent) ? c.accent : p.accent,
    surface,
  );
  const secondaryRaw = isHex(config.secondaryAccent)
    ? config.secondaryAccent
    : isHex(config.extractedBrand?.secondaryAccent)
      ? config.extractedBrand!.secondaryAccent!
      : p.accentSecondary;
  const muted = mixColor(ink, surface, 0.2);
  return {
    bg,
    bgEnd: c?.bgStart ? mixColor(bg, accent, 0.12) : p.bgEnd,
    surface,
    ink,
    muted,
    accent,
    light,
    colors: [
      accent,
      readableAccent(secondaryRaw, surface),
      readableAccent(light ? "#8648BA" : "#D8B4FE", surface),
      readableAccent(light ? "#A75A0A" : "#FBB040", surface),
    ],
  };
}
const bounded = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.min(max, v))
    : fallback;
export function normalizeDepth(
  raw?: Partial<InfographicDepth>,
): Required<InfographicDepth> {
  const preset = DEPTH_PRESETS.includes(raw?.preset as DepthPreset)
    ? raw!.preset!
    : "soft";
  const base = {
    flat: [0, 0, 0],
    soft: [8, 5, 0.14],
    raised: [12, 10, 0.2],
    layered: [10, 8, 0.18],
  }[preset];
  return {
    preset,
    strength: bounded(raw?.strength, 0, 100, 65),
    softness: bounded(raw?.softness, 0, 18, base[0]),
    distance: bounded(raw?.distance, 0, 18, base[1]),
    opacity: bounded(raw?.opacity, 0, 0.35, base[2]),
    direction: ["left", "right"].includes(raw?.direction || "")
      ? raw!.direction!
      : "down",
  };
}
export function normalizeSignature(
  raw?: InfographicSignature,
): InfographicSignature {
  return {
    name: typeof raw?.name === "string" ? raw.name.slice(0, 64) : "",
    visible: raw?.visible !== false,
    showLogo: raw?.showLogo !== false,
    placement: raw?.placement === "header" ? "header" : "footer",
    align: raw?.align === "left" ? "left" : "right",
    padding: bounded(raw?.padding, 8, 24, 12),
  };
}

/**
 * Automatically identifies 1–2 high-signal phrases from a section headline
 * so the 2-tone headline renderer can highlight key concepts in primary/gold accents.
 */
export function extractHeadlineHighlightPhrases(
  headline: string,
  customHighlightWords?: string,
): string[] {
  return scoreHeadlineHighlightPhrases(headline, customHighlightWords);
}
