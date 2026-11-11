import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_PALETTES } from "./palettes";

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
export function infographicColors(config: BlogInfographicConfig) {
  const p =
    BLOG_INFOGRAPHIC_PALETTES[config.paletteId] ||
    BLOG_INFOGRAPHIC_PALETTES["blue-trust"];
  const c = config.brand?.customColors;
  const bg = isHex(c?.bgStart) ? c.bgStart : p.bgStart;
  const surface = isHex(c?.surface) ? c.surface : p.surface;
  const ink = isHex(c?.textMain) ? c.textMain : p.textMain;
  const light = luminance(surface) > 0.4;
  const accent = readableAccent(
    isHex(c?.accent) ? c.accent : p.accent,
    surface,
  );
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
      readableAccent(p.accentSecondary, surface),
      readableAccent(light ? "#8648BA" : "#D8B4FE", surface),
      readableAccent(light ? "#A75A0A" : "#FBBF24", surface),
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
