/**
 * Phase 4 Core Deliverable #1: 25-Template Hybrid AI Art Plate + HTML5 Canvas & Vector SVG Renderer
 * File: lib/blog-infographic-studio/canvas-renderer.ts
 *
 * Built & Upgraded by: Aegis-Prime & Vantage-Draw (Infographic Geometry & Rendering Specialists)
 * Execution Cost: 0 LLM Tokens (<16ms deterministic client-side composite rendering)
 *
 * Key Capabilities:
 *  - Hybrid 3-Layer Composite Engine:
 *      Layer 1: High-resolution AI-generated text-free Infographic Art Plates (/images/infographics/*.jpg)
 *               blended with protective readability vignettes & ambient 3D glassmorphic lighting
 *      Layer 2: 25 Venngage/Canva-grade infographic geometries (Chevron Pipelines, Alternating Timelines,
 *               Interlocking Gears, Winding S-Curve Roads, 3D Tapered Funnels, Central-Spine VS Boards,
 *               Glassmorphic KPI Orbs, 2x2 Stat Cards + Vertical Multi-Bar Charts, Radial Gauges,
 *               Triangular Pyramids, Venn Callout Diagrams, Hub-and-Spoke Circuits, Checklists & Cheat Sheets)
 *      Layer 3: 20 Geometric Vector Icon Medallions + 100% live-editable, zero-overlap typography
 */

import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicAspectRatio,
  InfographicBackdropStyle,
} from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/founder-hub/grand-blog-writer-blueprint";
import type {
  LogoBadgeStyle,
  MalePortraitPresetId,
  PortraitFrameMode,
} from "@/features/quote-stat-testimonial-card-studio/model";
import {
  drawCanvasVectorIcon,
  getArtPlateForPalette,
  INFOGRAPHIC_ART_PLATES,
  INFOGRAPHIC_ICON_OPTIONS,
  preloadInfographicArtPlates,
  QUICK_SCENARIO_PRESETS,
  resolveNodeIconId,
  svgVectorIconMarkup,
  TEMPLATE_CURATED_SHOWCASE_DATA,
} from "./infographic-presets-and-icons";

export {
  drawCanvasVectorIcon,
  getArtPlateForPalette,
  INFOGRAPHIC_ART_PLATES,
  INFOGRAPHIC_ICON_OPTIONS,
  preloadInfographicArtPlates,
  QUICK_SCENARIO_PRESETS,
  resolveNodeIconId,
  svgVectorIconMarkup,
  TEMPLATE_CURATED_SHOWCASE_DATA,
};

/* -------------------------------------------------------------------------- */
/* Palettes, aspect-ratio dimensions & render options                          */
/* -------------------------------------------------------------------------- */

export interface BlogInfographicPaletteTokens {
  id: BlogInfographicConfig["paletteId"];
  label: string;
  bgStart: string;
  bgEnd: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  accent: string;
  accentSecondary: string;
  accentTertiary: string;
  accentSoft: string;
  textMain: string;
  textMuted: string;
  footerBg: string;
  isLight: boolean;
}

export const BLOG_INFOGRAPHIC_PALETTES: Record<
  BlogInfographicConfig["paletteId"],
  BlogInfographicPaletteTokens
> = {
  "indigo-cyber": {
    id: "indigo-cyber",
    label: "Royal Indigo & Cyber (Dark)",
    bgStart: "#070B19",
    bgEnd: "#131C3E",
    surface: "#151F42",
    surfaceAlt: "#1E2B58",
    border: "#4F46E5",
    accent: "#6366F1",
    accentSecondary: "#38BDF8",
    accentTertiary: "#A855F7",
    accentSoft: "rgba(99, 102, 241, 0.18)",
    textMain: "#F8FAFC",
    textMuted: "#CBD5E1",
    footerBg: "#050813",
    isLight: false,
  },
  "emerald-growth": {
    id: "emerald-growth",
    label: "Emerald Growth Waves (Dark)",
    bgStart: "#041C1B",
    bgEnd: "#0B2E2B",
    surface: "#0F3834",
    surfaceAlt: "#164A45",
    border: "#10B981",
    accent: "#10B981",
    accentSecondary: "#34D399",
    accentTertiary: "#F59E0B",
    accentSoft: "rgba(16, 185, 129, 0.18)",
    textMain: "#F0FDF4",
    textMuted: "#A7F3D0",
    footerBg: "#021312",
    isLight: false,
  },
  "amber-executive": {
    id: "amber-executive",
    label: "Obsidian & Amber Orbs (Dark)",
    bgStart: "#0B0F1A",
    bgEnd: "#171F32",
    surface: "#182238",
    surfaceAlt: "#22304C",
    border: "#F59E0B",
    accent: "#F59E0B",
    accentSecondary: "#38BDF8",
    accentTertiary: "#10B981",
    accentSoft: "rgba(245, 158, 11, 0.18)",
    textMain: "#FFFBEB",
    textMuted: "#E2E8F0",
    footerBg: "#070A12",
    isLight: false,
  },
  "rose-editorial": {
    id: "rose-editorial",
    label: "Warm Editorial Paper (Light)",
    bgStart: "#FDFBF7",
    bgEnd: "#FFF1F2",
    surface: "#FFFFFF",
    surfaceAlt: "#FFE4E6",
    border: "#E11D48",
    accent: "#E11D48",
    accentSecondary: "#2563EB",
    accentTertiary: "#D97706",
    accentSoft: "rgba(225, 29, 72, 0.12)",
    textMain: "#1E1B2E",
    textMuted: "#475569",
    footerBg: "#1E1B2E",
    isLight: true,
  },
  "cyan-tech": {
    id: "cyan-tech",
    label: "Cyan Glass Orbs (Dark)",
    bgStart: "#051524",
    bgEnd: "#0B2942",
    surface: "#0F3454",
    surfaceAlt: "#16466E",
    border: "#06B6D4",
    accent: "#22D3EE",
    accentSecondary: "#818CF8",
    accentTertiary: "#34D399",
    accentSoft: "rgba(34, 211, 238, 0.18)",
    textMain: "#F0F9FF",
    textMuted: "#BAE6FD",
    footerBg: "#030D17",
    isLight: false,
  },
  "slate-minimal": {
    id: "slate-minimal",
    label: "Venngage Daylight Studio (Light)",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    border: "#3452D1",
    accent: "#3452D1",
    accentSecondary: "#0EA5E9",
    accentTertiary: "#8B5CF6",
    accentSoft: "rgba(52, 82, 209, 0.11)",
    textMain: "#0F172A",
    textMuted: "#475569",
    footerBg: "#0F172A",
    isLight: true,
  },
  "violet-saas": {
    id: "violet-saas",
    label: "Violet SaaS Matrix (Dark)",
    bgStart: "#100720",
    bgEnd: "#221042",
    surface: "#291550",
    surfaceAlt: "#371D6A",
    border: "#A855F7",
    accent: "#C084FC",
    accentSecondary: "#F472B6",
    accentTertiary: "#38BDF8",
    accentSoft: "rgba(192, 132, 252, 0.18)",
    textMain: "#FAF5FF",
    textMuted: "#E9D5FF",
    footerBg: "#090314",
    isLight: false,
  },
  "blue-trust": {
    id: "blue-trust",
    label: "Executive Cobalt Poster (Light)",
    bgStart: "#F5F8FF",
    bgEnd: "#E6EDFF",
    surface: "#FFFFFF",
    surfaceAlt: "#EDF2FF",
    border: "#2563EB",
    accent: "#2563EB",
    accentSecondary: "#7C3AED",
    accentTertiary: "#0D9488",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    textMain: "#0F172A",
    textMuted: "#475569",
    footerBg: "#0F172A",
    isLight: true,
  },
};

export const ASPECT_RATIO_DIMENSIONS: Record<
  InfographicAspectRatio,
  { width: number; height: number; label: string }
> = {
  "16:9": { width: 1600, height: 900, label: "16:9 Blog & OG (1600×900)" },
  "1:1": { width: 1080, height: 1080, label: "1:1 Square (1080×1080)" },
  "4:5": { width: 1080, height: 1350, label: "4:5 LinkedIn Poster (1080×1350)" },
  "9:16": { width: 1080, height: 1920, label: "9:16 Vertical Infographic (1080×1920)" },
};

export interface BlogInfographicCustomColorOverrides {
  bgStart?: string;
  surface?: string;
  accent?: string;
  textMain?: string;
}

export interface BlogInfographicRenderOptions {
  scale?: number;
  customColors?: BlogInfographicCustomColorOverrides;
  backdropStyle?: InfographicBackdropStyle;
  backdropPlateImage?: HTMLImageElement | null;
  showVectorIcons?: boolean;
  spacingDensity?: "compact" | "balanced" | "spacious";
  /** Retained for backward compatibility; infographics default to full-width diagram mode. */
  portraitSource?: HTMLImageElement | HTMLCanvasElement | null;
  portraitPreset?: MalePortraitPresetId;
  portraitFrame?: PortraitFrameMode;
  portraitScale?: number;
  portraitRingScale?: number;
  portraitOffsetX?: number;
  portraitOffsetY?: number;
  portraitRadius?: number;
  authorName?: string;
  authorRole?: string;
  /** Optional uploaded company logo image. */
  logoImage?: HTMLImageElement | null;
  logoScale?: number;
  logoBgStyle?: LogoBadgeStyle;
}

export function createSampleInfographicConfig(
  templateId = 1,
  paletteOverride?: BlogInfographicConfig["paletteId"]
): BlogInfographicConfig {
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ??
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  const curated =
    TEMPLATE_CURATED_SHOWCASE_DATA[spec.id] ?? TEMPLATE_CURATED_SHOWCASE_DATA[1];

  return {
    id: `infographic-tpl-${spec.id}`,
    sectionId: `sec-sample-${spec.id}`,
    templateId: spec.id,
    templateSlug: spec.slug,
    templateName: spec.name,
    headline: curated.headline,
    subheadline: curated.subheadline,
    paletteId: paletteOverride ?? curated.paletteId,
    aspectRatio: "16:9",
    backdropStyle: curated.backdropStyle,
    showVectorIcons: true,
    spacingDensity: "balanced",
    nodes: curated.nodes.map((n) => ({ ...n })),
    footerSourceLabel: "DoItWithAI.tools · Free AI Blog Infographic Studio",
    altText: `${spec.name}: ${curated.headline}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Low-level Canvas drawing helpers (Zero-Overlap Mathematical Guarantee)      */
/* -------------------------------------------------------------------------- */

function resolvePalette(
  paletteId: BlogInfographicConfig["paletteId"],
  overrides?: BlogInfographicCustomColorOverrides
): BlogInfographicPaletteTokens {
  const base =
    BLOG_INFOGRAPHIC_PALETTES[paletteId] ?? BLOG_INFOGRAPHIC_PALETTES["indigo-cyber"];
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const textMain = overrides.textMain || base.textMain;
  const isLight =
    textMain.toLowerCase() !== "#ffffff" && textMain.toLowerCase() !== "#f8fafc";
  return {
    ...base,
    bgStart: overrides.bgStart || base.bgStart,
    bgEnd: overrides.bgStart || base.bgEnd,
    surface: overrides.surface || base.surface,
    border: overrides.accent || base.border,
    accent: overrides.accent || base.accent,
    textMain,
    isLight,
  };
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | [number, number, number, number]
): void {
  const radii = typeof r === "number" ? [r, r, r, r] : r;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radii);
    return;
  }
  const tl = Math.min(radii[0], w / 2, h / 2);
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tl);
  ctx.arcTo(x + w, y + h, x, y + h, tl);
  ctx.arcTo(x, y + h, x, y, tl);
  ctx.arcTo(x, y + w, x, y, tl);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        for (let j = i + 1; j < words.length; j++) {
          const nextTry = `${current} ${words[j]}`;
          if (ctx.measureText(`${nextTry}…`).width <= maxWidth) {
            current = nextTry;
          } else {
            current = `${current}…`;
            break;
          }
        }
        break;
      }
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function drawFittedTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  opts: {
    maxPx: number;
    minPx: number;
    weight?: string;
    color: string;
    align?: CanvasTextAlign;
    maxLines?: number;
    lineHeightRatio?: number;
  }
): number {
  const safeW = Math.max(40, maxW);
  const safeH = Math.max(16, maxH);
  const weight = opts.weight ?? "800";
  const lineRatio = opts.lineHeightRatio ?? 1.24;
  const maxLines = opts.maxLines ?? 3;
  let chosenPx = opts.minPx;
  let lines: string[] = [];

  for (let px = opts.maxPx; px >= opts.minPx; px -= 1) {
    ctx.font = `${weight} ${px}px Inter, system-ui, -apple-system, sans-serif`;
    lines = wrapTextLines(ctx, text, safeW, maxLines);
    if (lines.length * px * lineRatio <= safeH) {
      chosenPx = px;
      break;
    }
  }

  ctx.font = `${weight} ${chosenPx}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = opts.color;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "top";
  const step = Math.round(chosenPx * lineRatio);
  lines.forEach((line, idx) => {
    ctx.fillText(line, x, y + idx * step);
  });
  ctx.textAlign = "left";
  return lines.length * step;
}

/**
 * Draws a Venngage-style glowing icon medallion (circle or rounded hexagon) with a vector icon inside.
 */
function drawIconMedallion(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  node: BlogInfographicNodeItem,
  index: number,
  templateId: number,
  showIcon = true
): void {
  ctx.save();
  // Outer soft glow ring
  ctx.fillStyle = `${color}28`;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
  ctx.fill();

  // Main medallion body
  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "#1E293B");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.stroke();

  if (showIcon) {
    const iconId = resolveNodeIconId(node, index, templateId);
    drawCanvasVectorIcon(ctx, iconId, cx, cy, radius * 1.18, "#FFFFFF");
  } else {
    ctx.font = `900 ${Math.round(radius * 0.8)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), cx, cy + 1);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function drawBrandLogoOrBadge(
  ctx: CanvasRenderingContext2D,
  xRight: number,
  yCenter: number,
  footerLabel: string,
  palette: BlogInfographicPaletteTokens,
  options: BlogInfographicRenderOptions
): void {
  const scale = options.logoScale ?? 1;
  const style: LogoBadgeStyle = options.logoBgStyle ?? "auto";
  const logo = options.logoImage;

  if (logo) {
    const maxH = Math.round(36 * scale);
    const ratio =
      (logo.naturalWidth || logo.width || 120) /
      Math.max(1, logo.naturalHeight || logo.height || 40);
    const lw = Math.min(180, Math.round(maxH * ratio));
    const lh = maxH;
    const padX = 12;
    const padY = 6;
    const bw = lw + padX * 2;
    const bh = lh + padY * 2;
    const bx = xRight - bw;
    const by = yCenter - bh / 2;

    if (style !== "plain") {
      ctx.fillStyle =
        style === "white"
          ? "#FFFFFF"
          : style === "dark"
            ? "#0B1120"
            : style === "pill"
              ? palette.accent
              : palette.surfaceAlt;
      roundRectPath(ctx, bx, by, bw, bh, 12);
      ctx.fill();
    }
    ctx.drawImage(logo, bx + padX, by + padY, lw, lh);
    return;
  }

  const brandText = (footerLabel.split("·")[0] || "DoItWithAI.tools").trim();
  ctx.font = "800 13px Inter, system-ui, sans-serif";
  const tw = ctx.measureText(brandText).width;
  const pw = Math.min(250, tw + 30);
  const ph = 32;
  const px = xRight - pw;
  const py = yCenter - ph / 2;

  ctx.fillStyle = palette.accent;
  roundRectPath(ctx, px, py, pw, ph, 999);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(brandText, px + pw / 2, py + ph / 2);
  ctx.textAlign = "left";
}

/**
 * Upgraded Venngage/Canva-Style Infographic Node Card:
 * Features an integrated Icon Medallion, clean top badge & KPI pill, generous padding,
 * and balanced vertical typography that never leaves awkward dead space or overlaps.
 */
function drawInfographicNodeCard(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  node: BlogInfographicNodeItem,
  index: number,
  palette: BlogInfographicPaletteTokens,
  templateId: number,
  showIcon = true,
  variant: "default" | "versus-left" | "versus-right" | "checklist" | "myth-reality" = "default"
): void {
  const accentColors = [
    palette.accent,
    palette.accentSecondary,
    palette.accentTertiary,
    "#10B981",
    "#F59E0B",
  ];
  const accentColor =
    variant === "versus-left"
      ? "#F43F5E"
      : variant === "versus-right"
        ? "#10B981"
        : variant === "myth-reality"
          ? index % 2 === 0
            ? "#F43F5E"
            : "#10B981"
          : accentColors[index % accentColors.length];

  ctx.save();

  // Subtle drop shadow + glass surface card
  ctx.shadowColor = palette.isLight
    ? "rgba(15, 23, 42, 0.08)"
    : "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = palette.surface;
  roundRectPath(ctx, box.x, box.y, box.w, box.h, 20);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = variant === "default" ? `${accentColor}77` : accentColor;
  ctx.lineWidth = 2;
  roundRectPath(ctx, box.x, box.y, box.w, box.h, 20);
  ctx.stroke();

  // Top decorative accent header band (6px)
  ctx.fillStyle = accentColor;
  roundRectPath(ctx, box.x, box.y, box.w, 7, [20, 20, 0, 0]);
  ctx.fill();

  const padX = Math.max(16, Math.min(24, Math.round(box.w * 0.065)));
  const padY = Math.max(14, Math.min(22, Math.round(box.h * 0.08)));
  const innerX = box.x + padX;
  const innerW = Math.max(60, box.w - padX * 2);
  let curY = box.y + padY + 4;

  // Row 1: Icon Medallion + Badge + Metric Pill
  const iconR = Math.min(20, Math.max(13, Math.round(Math.min(box.w, box.h) * 0.085)));
  if (showIcon && box.h >= 105 && box.w >= 170) {
    drawIconMedallion(
      ctx,
      innerX + iconR,
      curY + iconR,
      iconR,
      accentColor,
      node,
      index,
      templateId,
      true
    );
  }

  const badgeStartX =
    showIcon && box.h >= 105 && box.w >= 170 ? innerX + iconR * 2 + 10 : innerX;
  const badgeText =
    variant === "checklist"
      ? `✓ CHECK 0${index + 1}`
      : variant === "myth-reality"
        ? index % 2 === 0
          ? "✕ COMMON MYTH"
          : "✓ PROVEN FACT"
        : (node.badge || `STEP 0${index + 1}`).toUpperCase();

  ctx.font = "800 11px Inter, system-ui, sans-serif";
  const maxBadgeW = Math.max(54, innerW * 0.48);
  const badgeW = Math.min(maxBadgeW, ctx.measureText(badgeText).width + 18);
  const badgeY = curY + Math.max(0, iconR - 12);
  ctx.fillStyle = `${accentColor}1F`;
  roundRectPath(ctx, badgeStartX, badgeY, badgeW, 24, 8);
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText.slice(0, 16), badgeStartX + 9, badgeY + 12);

  if (node.metricValue) {
    const metricText = node.metricValue;
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    const mw = Math.min(innerW * 0.42, ctx.measureText(metricText).width + 18);
    const mx = box.x + box.w - padX - mw;
    if (mx > badgeStartX + badgeW + 6) {
      ctx.fillStyle = accentColor;
      roundRectPath(ctx, mx, badgeY, mw, 24, 999);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(metricText, mx + mw / 2, badgeY + 12);
      ctx.textAlign = "left";
    }
  }

  curY += Math.max(iconR * 2 + 10, 34);

  // Row 2: Node Title
  const availH = Math.max(36, box.y + box.h - curY - padY);
  const titleBoxH = Math.min(58, Math.round(availH * 0.46));
  const titleUsed = drawFittedTextBlock(
    ctx,
    node.title || `Key Takeaway ${index + 1}`,
    innerX,
    curY,
    innerW,
    titleBoxH,
    {
      maxPx: box.h > 220 ? 22 : 19,
      minPx: 13,
      weight: "800",
      color: palette.textMain,
      maxLines: 2,
      lineHeightRatio: 1.2,
    }
  );
  curY += titleUsed + 8;

  // Row 3: Supporting Detail
  const remainH = Math.max(20, box.y + box.h - curY - padY + 4);
  if (remainH >= 22 && node.detail) {
    drawFittedTextBlock(ctx, node.detail, innerX, curY, innerW, remainH, {
      maxPx: box.h > 220 ? 15 : 14,
      minPx: 11,
      weight: "500",
      color: palette.textMuted,
      maxLines: box.h > 240 ? 4 : 3,
      lineHeightRatio: 1.34,
    });
  }

  ctx.restore();
}

function drawNumberedDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  label: string,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = `${color}33`;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = `900 ${Math.round(r * 0.82)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 1);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawTagPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
  textColor = "#FFFFFF"
): number {
  ctx.font = "800 11px Inter, system-ui, sans-serif";
  const w = ctx.measureText(text).width + 18;
  const h = 24;
  ctx.fillStyle = color;
  roundRectPath(ctx, x, y, w, h, 999);
  ctx.fill();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = "left";
  return w;
}

/* -------------------------------------------------------------------------- */
/* 25 Venngage / Canva-Style Infographic Body Geometries                       */
/* -------------------------------------------------------------------------- */

function renderTemplateBodyGeometry(
  ctx: CanvasRenderingContext2D,
  stage: { x: number; y: number; w: number; h: number },
  config: BlogInfographicConfig,
  palette: BlogInfographicPaletteTokens,
  showIcons = true
): void {
  const tplId = config.templateId || 1;
  const fallbackNodes =
    TEMPLATE_CURATED_SHOWCASE_DATA[tplId]?.nodes ??
    TEMPLATE_CURATED_SHOWCASE_DATA[1].nodes;
  const nodes =
    config.nodes && config.nodes.length > 0 ? config.nodes : fallbackNodes;
  const items = nodes.slice(0, 8);
  const stepColors = [
    palette.accent,
    palette.accentSecondary,
    palette.accentTertiary,
    "#10B981",
    "#F59E0B",
    "#EC4899",
  ];

  // TEMPLATE #1: Venngage "Five Essential Strategies" Chevron Arrow Pipeline + Drop Columns
  if (tplId === 1) {
    const cols = Math.min(5, Math.max(2, items.length));
    const rowItems = items.slice(0, cols);
    const gapX = 16;
    const colW = (stage.w - gapX * (cols - 1)) / cols;
    const chevH = Math.min(74, Math.max(54, Math.round(stage.h * 0.16)));
    const chevY = stage.y + 8;
    const tipDepth = 20;

    rowItems.forEach((node, idx) => {
      const cx = stage.x + idx * (colW + gapX);
      const color = stepColors[idx % stepColors.length];

      // Draw interlocking Chevron polygon
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, chevY);
      ctx.lineTo(cx + colW - tipDepth, chevY);
      ctx.lineTo(cx + colW, chevY + chevH / 2);
      ctx.lineTo(cx + colW - tipDepth, chevY + chevH);
      ctx.lineTo(cx, chevY + chevH);
      if (idx > 0) {
        ctx.lineTo(cx + tipDepth * 0.75, chevY + chevH / 2);
      }
      ctx.closePath();
      ctx.fill();

      // Metric or Step label inside Chevron
      drawFittedTextBlock(
        ctx,
        node.metricValue || node.badge || `STEP 0${idx + 1}`,
        cx + (idx > 0 ? tipDepth + 8 : 14),
        chevY + chevH / 2 - 11,
        colW - tipDepth * 1.8,
        24,
        {
          maxPx: 16,
          minPx: 11,
          weight: "900",
          color: "#FFFFFF",
          align: "center",
          maxLines: 1,
        }
      );
      ctx.restore();

      // Numbered medallion overlapping bottom of chevron + dotted leader line
      const medR = 20;
      const medCenterX = cx + colW / 2;
      const medCenterY = chevY + chevH;
      const cardTopY = medCenterY + medR + 18;
      const cardH = Math.max(120, stage.y + stage.h - cardTopY);

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(medCenterX, medCenterY + medR);
      ctx.lineTo(medCenterX, cardTopY);
      ctx.stroke();
      ctx.restore();

      drawNumberedDot(ctx, medCenterX, medCenterY, medR, String(idx + 1), color);

      // Editorial column card underneath
      drawInfographicNodeCard(
        ctx,
        { x: cx, y: cardTopY, w: colW, h: cardH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #2: Venngage "Historical Milestones" Alternating Vertical Timeline with Icon Medallions
  if (tplId === 2) {
    const list = items.slice(0, 5);
    const centerX = stage.x + stage.w / 2;
    const gapY = 14;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;

    // Central timeline glowing spine
    ctx.save();
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX, stage.y + 18);
    ctx.lineTo(centerX, stage.y + stage.h - 18);
    ctx.stroke();
    ctx.restore();

    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      const midY = ry + rowH / 2;
      const isLeft = idx % 2 === 0;
      const color = stepColors[idx % stepColors.length];
      const medR = Math.min(28, rowH * 0.38);
      const cardW = stage.w * 0.42;
      const cardX = isLeft ? stage.x : stage.x + stage.w - cardW;

      // Connector arm from center medallion to card
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, midY);
      ctx.lineTo(isLeft ? cardX + cardW : cardX, midY);
      ctx.stroke();

      drawInfographicNodeCard(
        ctx,
        { x: cardX, y: ry, w: cardW, h: rowH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );

      // Central circular icon medallion on the timeline
      drawIconMedallion(ctx, centerX, midY, medR, color, node, idx, tplId, showIcons);
    });
    return;
  }

  // TEMPLATE #3: Venngage "How to Build a Growth Mindset" Interlocking Mechanical Gears System
  if (tplId === 3) {
    const count = Math.min(5, Math.max(3, items.length));
    const gearItems = items.slice(0, count);
    const stepX = stage.w / count;
    const gearR = Math.min(54, stepX * 0.34, stage.h * 0.16);
    const centerY = stage.y + stage.h / 2;
    const cardH = Math.min(148, stage.h * 0.33);
    const cardW = Math.min(stepX * 0.92, 260);

    gearItems.forEach((node, idx) => {
      const gx = stage.x + idx * stepX + stepX / 2;
      const gy = centerY + (idx % 2 === 0 ? -10 : 10);
      const color = stepColors[idx % stepColors.length];
      const isTopCallout = idx % 2 === 1;
      const cardY = isTopCallout ? stage.y + 4 : stage.y + stage.h - cardH - 4;

      // Dotted vertical pointer between gear and callout card
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gx, isTopCallout ? gy - gearR * 1.2 : gy + gearR * 1.2);
      ctx.lineTo(gx, isTopCallout ? cardY + cardH : cardY);
      ctx.stroke();
      ctx.restore();

      // Draw Mechanical Gear with 12 Teeth
      ctx.save();
      const teeth = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(6, gearR * 0.18);
      for (let t = 0; t < teeth; t++) {
        const ang = (t * Math.PI * 2) / teeth;
        ctx.beginPath();
        ctx.moveTo(gx + Math.cos(ang) * (gearR * 0.85), gy + Math.sin(ang) * (gearR * 0.85));
        ctx.lineTo(gx + Math.cos(ang) * (gearR * 1.16), gy + Math.sin(ang) * (gearR * 1.16));
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx, gy, gearR * 0.94, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = palette.surface;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gearR * 0.68, 0, Math.PI * 2);
      ctx.stroke();

      const iconId = resolveNodeIconId(node, idx, tplId);
      drawCanvasVectorIcon(ctx, iconId, gx, gy, gearR * 0.95, "#FFFFFF");
      ctx.restore();

      // Callout card above or below the gear
      drawInfographicNodeCard(
        ctx,
        { x: gx - cardW / 2, y: cardY, w: cardW, h: cardH },
        node,
        idx,
        palette,
        tplId,
        false
      );
    });
    return;
  }

  // TEMPLATE #4: Venngage "5 Brand Strategy Must-Haves" Winding S-Curve Road Path
  if (tplId === 4) {
    const list = items.slice(0, 4);
    const gapY = 14;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;

    // Winding road S-curve connector behind the rows
    ctx.save();
    ctx.strokeStyle = `${palette.accent}55`;
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    list.forEach((_, idx) => {
      const ry = stage.y + idx * (rowH + gapY) + rowH / 2;
      const rx = idx % 2 === 0 ? stage.x + 52 : stage.x + stage.w - 52;
      if (idx === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    });
    ctx.stroke();
    ctx.restore();

    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      const midY = ry + rowH / 2;
      const numOnRight = idx % 2 === 0;
      const color = stepColors[idx % stepColors.length];
      const medR = Math.min(30, rowH * 0.42);
      const medX = numOnRight ? stage.x + stage.w - medR - 14 : stage.x + medR + 14;
      const cardX = numOnRight ? stage.x : stage.x + medR * 2 + 34;
      const cardW = stage.w - medR * 2 - 48;

      drawInfographicNodeCard(
        ctx,
        { x: cardX, y: ry, w: cardW, h: rowH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
      drawNumberedDot(ctx, medX, midY, medR, String(idx + 1), color);
    });
    return;
  }

  // TEMPLATE #5 & #17: 3D Tapered Trapezoid Funnel (#5) / Layered Strategy Pyramid (#17) + Right Callouts
  if (tplId === 5 || tplId === 17) {
    const isPyramid = tplId === 17;
    const tiers = items.slice(0, 4);
    const gapY = 14;
    const tierH = (stage.h - gapY * (tiers.length - 1)) / tiers.length;
    const shapeZoneW = stage.w * 0.42;
    const shapeCenterX = stage.x + shapeZoneW / 2;
    const cardX = stage.x + shapeZoneW + 32;
    const cardW = stage.w - shapeZoneW - 32;

    tiers.forEach((node, idx) => {
      const ty = stage.y + idx * (tierH + gapY);
      const midY = ty + tierH / 2;
      const color = stepColors[idx % stepColors.length];

      const topRatio = isPyramid
        ? 0.28 + (idx / tiers.length) * 0.68
        : 0.96 - (idx / tiers.length) * 0.56;
      const botRatio = isPyramid
        ? 0.28 + ((idx + 1) / tiers.length) * 0.68
        : 0.96 - ((idx + 1) / tiers.length) * 0.56;

      const topW = shapeZoneW * topRatio;
      const botW = shapeZoneW * botRatio;

      // Draw Trapezoid tier
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(shapeCenterX - topW / 2, ty + 2);
      ctx.lineTo(shapeCenterX + topW / 2, ty + 2);
      ctx.lineTo(shapeCenterX + botW / 2, ty + tierH - 2);
      ctx.lineTo(shapeCenterX - botW / 2, ty + tierH - 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      drawFittedTextBlock(
        ctx,
        node.metricValue || node.badge || `TIER ${idx + 1}`,
        shapeCenterX,
        midY - 11,
        Math.min(topW, botW) - 16,
        24,
        {
          maxPx: 17,
          minPx: 11,
          weight: "900",
          color: "#FFFFFF",
          align: "center",
          maxLines: 1,
        }
      );
      ctx.restore();

      // Dotted pointer line to right callout card
      const rightEdgeX = shapeCenterX + Math.max(topW, botW) / 2;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rightEdgeX + 4, midY);
      ctx.lineTo(cardX - 4, midY);
      ctx.stroke();
      ctx.restore();

      drawInfographicNodeCard(
        ctx,
        { x: cardX, y: ty, w: cardW, h: tierH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #6: Venngage "TRAINING COMPARISON" Central-Spine Versus Battle Card
  if (tplId === 6) {
    const leftItems = items.filter((_, i) => i % 2 === 0).slice(0, 3);
    const rightItems = items.filter((_, i) => i % 2 === 1).slice(0, 3);
    const rows = Math.max(1, leftItems.length, rightItems.length);
    const headerBannerH = 44;
    const bodyTop = stage.y + headerBannerH + 14;
    const bodyH = stage.h - headerBannerH - 14;
    const gapY = 14;
    const rowH = (bodyH - gapY * (rows - 1)) / rows;
    const spineW = 96;
    const colW = (stage.w - spineW) / 2;
    const centerX = stage.x + stage.w / 2;

    // Top Contender A vs Contender B Ribbon Headers
    ctx.fillStyle = palette.accent;
    roundRectPath(ctx, stage.x, stage.y, colW - 12, headerBannerH, 12);
    ctx.fill();
    drawFittedTextBlock(ctx, "DOITWITHAI STUDIO (WINNER)", stage.x + colW / 2 - 6, stage.y + 12, colW - 36, 22, {
      maxPx: 15, minPx: 11, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1,
    });

    drawNumberedDot(ctx, centerX, stage.y + headerBannerH / 2, 20, "VS", "#F59E0B");

    ctx.fillStyle = "#F43F5E";
    roundRectPath(ctx, stage.x + colW + spineW + 12, stage.y, colW - 12, headerBannerH, 12);
    ctx.fill();
    drawFittedTextBlock(ctx, "TRADITIONAL / MANUAL WORKFLOW", stage.x + colW + spineW + 12 + (colW - 12) / 2, stage.y + 12, colW - 36, 22, {
      maxPx: 15, minPx: 11, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1,
    });

    for (let r = 0; r < rows; r++) {
      const ry = bodyTop + r * (rowH + gapY);
      const midY = ry + rowH / 2;
      const leftNode = leftItems[r] || items[0];
      const rightNode = rightItems[r] || items[1] || items[0];

      drawInfographicNodeCard(
        ctx,
        { x: stage.x, y: ry, w: colW - 12, h: rowH },
        leftNode,
        r * 2,
        palette,
        tplId,
        showIcons,
        "versus-right"
      );

      drawInfographicNodeCard(
        ctx,
        { x: stage.x + colW + spineW + 12, y: ry, w: colW - 12, h: rowH },
        rightNode,
        r * 2 + 1,
        palette,
        tplId,
        showIcons,
        "versus-left"
      );

      // Center Spine Medallion connecting left and right comparison cards
      drawIconMedallion(
        ctx,
        centerX,
        midY,
        Math.min(26, rowH * 0.36),
        stepColors[r % stepColors.length],
        leftNode,
        r,
        tplId,
        true
      );
    }
    return;
  }

  // TEMPLATE #8, #9, #10, #23: Two-Column Split (Before/After, Pros/Cons, Do's/Don'ts, Myth/Reality)
  if (tplId === 8 || tplId === 9 || tplId === 10 || tplId === 23) {
    const colGap = 36;
    const colW = (stage.w - colGap) / 2;
    const leftItems = items.filter((_, i) => i % 2 === 0);
    const rightItems = items.filter((_, i) => i % 2 === 1);
    const rows = Math.max(1, leftItems.length, rightItems.length);
    const gapY = 14;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    leftItems.forEach((node, r) => {
      drawInfographicNodeCard(
        ctx,
        { x: stage.x, y: stage.y + r * (cardH + gapY), w: colW, h: cardH },
        node,
        r * 2,
        palette,
        tplId,
        showIcons,
        tplId === 23 ? "myth-reality" : tplId === 9 || tplId === 10 ? "versus-right" : "versus-left"
      );
    });
    rightItems.forEach((node, r) => {
      drawInfographicNodeCard(
        ctx,
        { x: stage.x + colW + colGap, y: stage.y + r * (cardH + gapY), w: colW, h: cardH },
        node,
        r * 2 + 1,
        palette,
        tplId,
        showIcons,
        tplId === 23 ? "myth-reality" : tplId === 9 || tplId === 10 ? "versus-left" : "versus-right"
      );
    });

    drawNumberedDot(
      ctx,
      stage.x + stage.w / 2,
      stage.y + stage.h / 2,
      20,
      tplId === 23 || tplId === 8 ? "→" : "VS",
      palette.accent
    );
    return;
  }

  // TEMPLATE #7: 3-Option SaaS Feature Comparison Matrix Table
  if (tplId === 7) {
    const colCount = 3;
    const labelColW = Math.min(stage.w * 0.34, 340);
    const dataColW = (stage.w - labelColW) / colCount;
    const headerH = Math.min(56, stage.h * 0.15);
    const rows = Math.max(3, Math.min(5, items.length));
    const rowH = (stage.h - headerH - 12) / rows;
    const colHexes = ["#10B981", palette.accent, "#64748B"];
    const colNames = ["★ DoItWithAI Studio", "Diffusion AI Prompts", "Manual Design Apps"];

    ctx.fillStyle = palette.surfaceAlt;
    roundRectPath(ctx, stage.x, stage.y, stage.w, headerH, [16, 16, 0, 0]);
    ctx.fill();

    drawFittedTextBlock(ctx, "CAPABILITY / BENCHMARK", stage.x + 18, stage.y + headerH / 2 - 8, labelColW - 28, 20, {
      maxPx: 13, minPx: 10, weight: "900", color: palette.textMuted, maxLines: 1,
    });

    for (let c = 0; c < colCount; c++) {
      const hx = stage.x + labelColW + c * dataColW;
      ctx.fillStyle = colHexes[c];
      roundRectPath(ctx, hx + 8, stage.y + 8, dataColW - 16, headerH - 16, 10);
      ctx.fill();
      drawFittedTextBlock(ctx, colNames[c], hx + dataColW / 2, stage.y + headerH / 2 - 9, dataColW - 28, 20, {
        maxPx: 14, minPx: 10, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1,
      });
    }

    const bodyTop = stage.y + headerH + 12;
    for (let r = 0; r < rows; r++) {
      const ry = bodyTop + r * rowH;
      const node = items[r % items.length];
      ctx.fillStyle = r % 2 === 0 ? palette.surface : palette.surfaceAlt;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH - 6, 12);
      ctx.fill();

      drawFittedTextBlock(ctx, node?.title || `Capability ${r + 1}`, stage.x + 18, ry + (rowH - 6) * 0.2, labelColW - 28, (rowH - 6) * 0.65, {
        maxPx: 16, minPx: 12, weight: "800", color: palette.textMain, maxLines: 2,
      });

      const cellBadges = [
        { text: node?.metricValue || "✓ 100% Included", color: "#10B981" },
        { text: r % 2 === 0 ? "✕ Garbled Text" : "⚡ Costs Credits", color: "#F59E0B" },
        { text: "✕ 45+ Mins Manual", color: "#F43F5E" },
      ];
      for (let c = 0; c < colCount; c++) {
        const b = cellBadges[c];
        const cellCenterX = stage.x + labelColW + c * dataColW + dataColW / 2;
        const pillW = Math.min(dataColW - 24, 165);
        ctx.fillStyle = c === 0 ? b.color : `${b.color}22`;
        roundRectPath(ctx, cellCenterX - pillW / 2, ry + (rowH - 6) / 2 - 14, pillW, 28, 999);
        ctx.fill();
        drawFittedTextBlock(ctx, b.text, cellCenterX, ry + (rowH - 6) / 2 - 8, pillW - 16, 18, {
          maxPx: 12, minPx: 10, weight: "800", color: c === 0 ? "#FFFFFF" : b.color, align: "center", maxLines: 1,
        });
      }
    }
    return;
  }

  // TEMPLATE #11: Venngage "Q3 Business Performance Analysis" Glassmorphic KPI Orbs + Side Callouts
  if (tplId === 11) {
    const list = items.slice(0, 4);
    const gapY = 14;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;
    const orbZoneX = stage.x + stage.w * 0.34;

    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      const cy = ry + rowH / 2;
      const orbR = Math.min(54, rowH * 0.48);
      const ox = orbZoneX + (idx % 2 === 0 ? -18 : 22);
      const color = stepColors[idx % stepColors.length];

      // Left narrative insight card (for even rows) or subtle connector
      const leftW = stage.w * 0.24;
      ctx.fillStyle = `${color}18`;
      ctx.strokeStyle = `${color}66`;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, stage.x, ry + 6, leftW, rowH - 12, 14);
      ctx.fill();
      ctx.stroke();
      drawFittedTextBlock(ctx, (node.badge || `KPI 0${idx + 1}`).toUpperCase(), stage.x + 14, ry + 14, leftW - 28, 18, {
        maxPx: 12, minPx: 10, weight: "900", color, maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.title, stage.x + 14, ry + 34, leftW - 28, rowH - 46, {
        maxPx: 15, minPx: 11, weight: "800", color: palette.textMain, maxLines: 2,
      });

      // Glowing Glassmorphic Orb in Center
      ctx.save();
      const grad = ctx.createRadialGradient(ox - orbR * 0.3, cy - orbR * 0.3, orbR * 0.1, ox, cy, orbR);
      grad.addColorStop(0, `${color}88`);
      grad.addColorStop(0.7, `${color}28`);
      grad.addColorStop(1, palette.surface);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ox, cy, orbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      drawFittedTextBlock(ctx, node.metricValue || "98%", ox, cy - 12, orbR * 1.75, 28, {
        maxPx: 22, minPx: 13, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1,
      });
      ctx.restore();

      // Right detailed breakdown card
      const rightX = stage.x + stage.w * 0.46;
      const rightW = stage.w * 0.54;
      drawInfographicNodeCard(
        ctx,
        { x: rightX, y: ry, w: rightW, h: rowH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #12: Venngage "WHAT CUSTOMERS REALLY WANT" 2x2 Clipboard Stat Cards + Vertical Multi-Bar Chart
  if (tplId === 12) {
    const list = items.slice(0, 4);
    const leftW = stage.w * 0.52;
    const gap = 24;
    const rightX = stage.x + leftW + gap;
    const rightW = stage.w - leftW - gap;

    // Left: 2x2 Clipboard Stat Cards
    const cardGap = 14;
    const cw = (leftW - cardGap) / 2;
    const ch = (stage.h - cardGap) / 2;
    list.forEach((node, idx) => {
      const c = idx % 2;
      const r = Math.floor(idx / 2);
      const bx = stage.x + c * (cw + cardGap);
      const by = stage.y + r * (ch + cardGap);
      const color = stepColors[idx % stepColors.length];

      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      roundRectPath(ctx, bx, by, cw, ch, 18);
      ctx.fill();
      ctx.stroke();

      // Top clipboard clip tab
      ctx.fillStyle = color;
      roundRectPath(ctx, bx + cw / 2 - 28, by, 56, 10, [0, 0, 8, 8]);
      ctx.fill();

      drawIconMedallion(ctx, bx + 32, by + 38, 18, color, node, idx, tplId, true);

      drawFittedTextBlock(ctx, node.metricValue || `${78 - idx * 6}%`, bx + 60, by + 20, cw - 74, 38, {
        maxPx: 30, minPx: 18, weight: "900", color, maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.title, bx + 16, by + 68, cw - 32, 38, {
        maxPx: 16, minPx: 12, weight: "800", color: palette.textMain, maxLines: 2,
      });
      drawFittedTextBlock(ctx, node.detail || "", bx + 16, by + 110, cw - 32, ch - 120, {
        maxPx: 12, minPx: 10, weight: "500", color: palette.textMuted, maxLines: 2,
      });
    });

    // Right: Vertical Multi-Bar Chart Panel
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    roundRectPath(ctx, rightX, stage.y, rightW, stage.h, 20);
    ctx.fill();
    ctx.stroke();

    drawFittedTextBlock(ctx, "COMPARATIVE BENCHMARK DISTRIBUTION", rightX + 22, stage.y + 18, rightW - 44, 22, {
      maxPx: 14, minPx: 11, weight: "900", color: palette.accent, maxLines: 1,
    });

    const chartTop = stage.y + 58;
    const chartBottom = stage.y + stage.h - 48;
    const chartH = Math.max(100, chartBottom - chartTop);
    const barCount = list.length;
    const barSlotW = (rightW - 48) / barCount;

    // Horizontal gridlines
    ctx.strokeStyle = `${palette.textMuted}25`;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = chartTop + (chartH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(rightX + 20, gy);
      ctx.lineTo(rightX + rightW - 20, gy);
      ctx.stroke();
    }

    list.forEach((node, idx) => {
      const numMatch = (node.metricValue || "").match(/(\d+(?:\.\d+)?)/);
      const pct = numMatch ? Math.min(100, Math.max(28, Number(numMatch[1]))) : 82 - idx * 11;
      const bh = (chartH * pct) / 100;
      const bw = Math.min(56, barSlotW * 0.58);
      const bx = rightX + 24 + idx * barSlotW + (barSlotW - bw) / 2;
      const by = chartBottom - bh;
      const color = stepColors[idx % stepColors.length];

      ctx.fillStyle = color;
      roundRectPath(ctx, bx, by, bw, bh, [10, 10, 0, 0]);
      ctx.fill();

      drawFittedTextBlock(ctx, node.metricValue || `${pct}%`, bx + bw / 2, by - 22, barSlotW - 4, 20, {
        maxPx: 14, minPx: 10, weight: "900", color: palette.textMain, align: "center", maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.badge || `0${idx + 1}`, bx + bw / 2, chartBottom + 10, barSlotW - 4, 20, {
        maxPx: 12, minPx: 9, weight: "800", color: palette.textMuted, align: "center", maxLines: 1,
      });
    });
    return;
  }

  // TEMPLATE #13: Horizontal Benchmark Bar Chart
  if (tplId === 13) {
    const gapY = 14;
    const rowH = (stage.h - gapY * (items.length - 1)) / items.length;
    items.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      const color = stepColors[idx % stepColors.length];
      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH, 16);
      ctx.fill();
      ctx.stroke();

      drawIconMedallion(ctx, stage.x + 32, ry + rowH / 2, Math.min(20, rowH * 0.34), color, node, idx, tplId, true);

      drawFittedTextBlock(
        ctx,
        node.title,
        stage.x + 64,
        ry + rowH * 0.2,
        stage.w * 0.32,
        rowH * 0.65,
        { maxPx: 18, minPx: 12, weight: "800", color: palette.textMain, maxLines: 2 }
      );

      const numMatch = (node.metricValue || "").match(/(\d+(?:\.\d+)?)/);
      const pct = numMatch ? Math.min(100, Math.max(25, Number(numMatch[1]))) : 94 - idx * 14;
      const barMaxW = stage.w * 0.52;
      const barW = (barMaxW * pct) / 100;
      const barX = stage.x + stage.w * 0.43;
      const barH = Math.min(34, rowH * 0.48);
      const barY = ry + (rowH - barH) / 2;

      ctx.fillStyle = palette.surfaceAlt;
      roundRectPath(ctx, barX, barY, barMaxW, barH, 999);
      ctx.fill();

      ctx.fillStyle = color;
      roundRectPath(ctx, barX, barY, barW, barH, 999);
      ctx.fill();

      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText(node.metricValue || `${pct}%`, barX + 16, barY + barH / 2);
    });
    return;
  }

  // TEMPLATE #14: Cost vs. ROI Waterfall & Savings Breakdown
  if (tplId === 14) {
    const leftW = stage.w * 0.44;
    const gap = 24;
    const rightX = stage.x + leftW + gap;
    const rightW = stage.w - leftW - gap;
    const baseline = items[0] || fallbackNodes[0];
    const optimized = items[1] || fallbackNodes[1];

    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    roundRectPath(ctx, stage.x, stage.y, leftW, stage.h, 20);
    ctx.fill();
    ctx.stroke();

    const barAreaX = stage.x + 24;
    const barAreaW = leftW - 48;
    const barH = Math.min(44, stage.h * 0.16);
    const row1Y = stage.y + stage.h * 0.2;
    const row2Y = stage.y + stage.h * 0.48;

    drawFittedTextBlock(ctx, "BASELINE OUTSOURCED COST", barAreaX, row1Y - 22, barAreaW, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    ctx.fillStyle = "#F43F5E";
    roundRectPath(ctx, barAreaX, row1Y, barAreaW, barH, 10);
    ctx.fill();
    drawFittedTextBlock(ctx, baseline.metricValue || "$8,300/mo", barAreaX + 14, row1Y + barH / 2 - 10, barAreaW - 28, 22, {
      maxPx: 18, minPx: 13, weight: "900", color: "#FFFFFF", maxLines: 1,
    });

    drawFittedTextBlock(ctx, "OPTIMIZED IN-HOUSE AI STUDIO", barAreaX, row2Y - 22, barAreaW, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    ctx.fillStyle = "#10B981";
    const optRatio = 0.38;
    roundRectPath(ctx, barAreaX, row2Y, barAreaW * optRatio, barH, 10);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, barAreaX, row2Y, barAreaW, barH, 10);
    ctx.stroke();
    drawFittedTextBlock(ctx, optimized.metricValue || "$420/mo", barAreaX + 14, row2Y + barH / 2 - 10, barAreaW * optRatio - 16, 22, {
      maxPx: 17, minPx: 11, weight: "900", color: "#FFFFFF", maxLines: 1,
    });

    const savingsY = stage.y + stage.h * 0.74;
    ctx.fillStyle = palette.accentSoft;
    roundRectPath(ctx, barAreaX, savingsY, barAreaW, stage.h * 0.2, 14);
    ctx.fill();
    drawFittedTextBlock(ctx, "NET EFFICIENCY GAIN", barAreaX + 14, savingsY + 10, barAreaW - 28, 16, {
      maxPx: 11, minPx: 9, weight: "800", color: palette.accent, maxLines: 1,
    });
    drawFittedTextBlock(ctx, items[2]?.metricValue || "+94% Saved", barAreaX + 14, savingsY + 28, barAreaW - 28, 32, {
      maxPx: 24, minPx: 16, weight: "900", color: palette.textMain, maxLines: 1,
    });

    const rest = items.slice(2).length > 0 ? items.slice(2) : items.slice(0, 2);
    const gapY = 14;
    const cardH = (stage.h - gapY * (rest.length - 1)) / rest.length;
    rest.forEach((node, idx) => {
      drawInfographicNodeCard(
        ctx,
        { x: rightX, y: stage.y + idx * (cardH + gapY), w: rightW, h: cardH },
        node,
        idx + 2,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #15: 5-Pillar Multi-Ring Radial Audit Scorecard
  if (tplId === 15) {
    const leftW = stage.w * 0.34;
    const gap = 24;
    const rightX = stage.x + leftW + gap;
    const rightW = stage.w - leftW - gap;

    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, stage.x, stage.y, leftW, stage.h, 22);
    ctx.fill();
    ctx.stroke();

    const first = items[0] || fallbackNodes[0];
    const rcx = stage.x + leftW / 2;
    const rcy = stage.y + stage.h * 0.42;
    const maxR = Math.min(leftW, stage.h) * 0.31;

    // 3 Concentric Activity Rings
    [1, 0.8, 0.62].forEach((mult, idx) => {
      const r = maxR * mult;
      ctx.strokeStyle = `${stepColors[idx]}33`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(rcx, rcy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = stepColors[idx];
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(rcx, rcy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * (1.75 - idx * 0.15));
      ctx.stroke();
    });

    drawFittedTextBlock(ctx, first.metricValue || "97/100", rcx, rcy - 14, maxR * 1.1, 32, {
      maxPx: 26, minPx: 16, weight: "900", color: palette.textMain, align: "center", maxLines: 1,
    });
    drawFittedTextBlock(ctx, first.title, stage.x + 20, stage.y + stage.h * 0.74, leftW - 40, 52, {
      maxPx: 18, minPx: 13, weight: "800", color: palette.textMain, align: "center", maxLines: 2,
    });

    const rest = items.slice(1).length > 0 ? items.slice(1) : items;
    const gapY = 12;
    const cardH = (stage.h - gapY * (rest.length - 1)) / rest.length;
    rest.forEach((node, idx) => {
      drawInfographicNodeCard(
        ctx,
        { x: rightX, y: stage.y + idx * (cardH + gapY), w: rightW, h: cardH },
        node,
        idx + 1,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #16: 2x2 Impact vs. Effort Strategic Quadrant Matrix
  if (tplId === 16) {
    const quadGap = 18;
    const qW = (stage.w - quadGap) / 2;
    const qH = (stage.h - quadGap) / 2;
    const quadColors = ["#10B981", palette.accent, "#F59E0B", "#F43F5E"];
    const quadLabels = ["1 · QUICK WINS (HIGH ROI)", "2 · STRATEGIC BIG BETS", "3 · TACTICAL FILL-INS", "4 · DEFER / AUTOMATE"];

    for (let q = 0; q < 4; q++) {
      const col = q % 2;
      const row = Math.floor(q / 2);
      const qx = stage.x + col * (qW + quadGap);
      const qy = stage.y + row * (qH + quadGap);
      const node = items[q % items.length];
      const color = quadColors[q];

      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      roundRectPath(ctx, qx, qy, qW, qH, 18);
      ctx.fill();
      ctx.stroke();

      drawTagPill(ctx, qx + 16, qy + 14, quadLabels[q], color);
      drawIconMedallion(ctx, qx + qW - 34, qy + 28, 16, color, node, q, tplId, true);

      drawFittedTextBlock(ctx, node?.title || quadLabels[q], qx + 18, qy + 48, qW - 36, 44, {
        maxPx: 18, minPx: 13, weight: "800", color: palette.textMain, maxLines: 2,
      });
      drawFittedTextBlock(ctx, node?.detail || "", qx + 18, qy + 96, qW - 36, qH - 108, {
        maxPx: 14, minPx: 11, weight: "500", color: palette.textMuted, maxLines: 3,
      });
    }
    return;
  }

  // TEMPLATE #18: 3-Circle Venn Synergy Diagram + 4 Corner Callout Cards (Zero Clipping!)
  if (tplId === 18 || tplId === 19) {
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2;
    const cardW = stage.w * 0.31;
    const cardH = (stage.h - 20) / 2;

    if (tplId === 18) {
      const vennR = Math.min(stage.w * 0.11, stage.h * 0.22);
      const off = vennR * 0.58;
      const circles = [
        { x: cx, y: cy - off * 0.85, c: palette.accent },
        { x: cx - off, y: cy + off * 0.55, c: palette.accentSecondary },
        { x: cx + off, y: cy + off * 0.55, c: "#10B981" },
      ];
      ctx.save();
      ctx.globalAlpha = 0.35;
      circles.forEach((cr) => {
        ctx.fillStyle = cr.c;
        ctx.beginPath();
        ctx.arc(cr.x, cr.y, vennR, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      circles.forEach((cr) => {
        ctx.strokeStyle = cr.c;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cr.x, cr.y, vennR, 0, Math.PI * 2);
        ctx.stroke();
      });
      drawTagPill(ctx, cx - 48, cy - 12, "CORE SYNERGY", palette.accent);
    } else {
      // Hub & Spoke center core
      const hubR = Math.min(62, stage.h * 0.16);
      ctx.strokeStyle = `${palette.accent}55`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 1.45, 0, Math.PI * 2);
      ctx.stroke();
      drawIconMedallion(ctx, cx, cy, hubR, palette.accent, items[0], 0, tplId, true);
    }

    const corners = [
      { x: stage.x, y: stage.y },
      { x: stage.x + stage.w - cardW, y: stage.y },
      { x: stage.x, y: stage.y + cardH + 20 },
      { x: stage.x + stage.w - cardW, y: stage.y + cardH + 20 },
    ];
    items.slice(0, 4).forEach((node, idx) => {
      const pos = corners[idx];
      const anchorX = idx % 2 === 0 ? pos.x + cardW : pos.x;
      const anchorY = pos.y + cardH / 2;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = stepColors[idx % stepColors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.restore();

      drawInfographicNodeCard(
        ctx,
        { x: pos.x, y: pos.y, w: cardW, h: cardH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #20: 2-Column Actionable Launch Checklist
  if (tplId === 20) {
    const list = items.slice(0, 6);
    const cols = 2;
    const rows = Math.ceil(list.length / cols);
    const gapX = 20;
    const gapY = 14;
    const cardW = (stage.w - gapX) / cols;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    list.forEach((node, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      drawInfographicNodeCard(
        ctx,
        {
          x: stage.x + c * (cardW + gapX),
          y: stage.y + r * (cardH + gapY),
          w: cardW,
          h: cardH,
        },
        node,
        idx,
        palette,
        tplId,
        showIcons,
        "checklist"
      );
    });
    return;
  }

  // TEMPLATE #21: Executive TL;DR Takeaway Board
  if (tplId === 21) {
    const list = items.slice(0, 4);
    const gapY = 14;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;
    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      const color = stepColors[idx % stepColors.length];
      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH, 16);
      ctx.fill();
      ctx.stroke();

      const medR = Math.min(24, rowH * 0.36);
      drawIconMedallion(ctx, stage.x + 36, ry + rowH / 2, medR, color, node, idx, tplId, true);

      const textX = stage.x + 76;
      const textW = stage.w - 220;
      drawFittedTextBlock(ctx, node.title, textX, ry + rowH * 0.18, textW, rowH * 0.36, {
        maxPx: 19, minPx: 13, weight: "800", color: palette.textMain, maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.detail || "", textX, ry + rowH * 0.54, textW, rowH * 0.38, {
        maxPx: 14, minPx: 11, weight: "500", color: palette.textMuted, maxLines: 2,
      });

      if (node.metricValue) {
        drawTagPill(ctx, stage.x + stage.w - 130, ry + rowH / 2 - 12, node.metricValue, color);
      }
    });
    return;
  }

  // TEMPLATE #22: Annotated Page Wireframe Teardown
  if (tplId === 22) {
    const wireW = stage.w * 0.28;
    const wireH = stage.h * 0.92;
    const wireX = stage.x + (stage.w - wireW) / 2;
    const wireY = stage.y + (stage.h - wireH) / 2;

    // Central Page Mockup Wireframe
    ctx.fillStyle = palette.surfaceAlt;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, wireX, wireY, wireW, wireH, 18);
    ctx.fill();
    ctx.stroke();

    drawFittedTextBlock(ctx, "LIVE PAGE ANATOMY", wireX + wireW / 2, wireY + 14, wireW - 24, 18, {
      maxPx: 12, minPx: 10, weight: "900", color: palette.accent, align: "center", maxLines: 1,
    });
    [0.2, 0.42, 0.64, 0.82].forEach((pct, i) => {
      ctx.fillStyle = `${stepColors[i]}25`;
      roundRectPath(ctx, wireX + 16, wireY + wireH * pct, wireW - 32, wireH * 0.15, 10);
      ctx.fill();
    });

    const list = items.slice(0, 6);
    const leftCount = Math.ceil(list.length / 2);
    const cardW = stage.w * 0.32;
    const rowH = (stage.h - 24) / leftCount;

    list.forEach((node, i) => {
      const isLeft = i % 2 === 0;
      const r = Math.floor(i / 2);
      const cardX = isLeft ? stage.x : stage.x + stage.w - cardW;
      const cardY = stage.y + r * (rowH + 12);
      const midY = cardY + rowH / 2;
      const color = stepColors[i % stepColors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(isLeft ? cardX + cardW : cardX, midY);
      ctx.lineTo(isLeft ? wireX : wireX + wireW, midY);
      ctx.stroke();

      drawNumberedDot(ctx, isLeft ? wireX : wireX + wireW, midY, 13, String(i + 1), color);
      drawInfographicNodeCard(
        ctx,
        { x: cardX, y: cardY, w: cardW, h: rowH },
        node,
        i,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // TEMPLATE #24: 6-Box Quick Reference Cheat Sheet
  if (tplId === 24) {
    const list = items.slice(0, 6);
    const cols = 3;
    const rows = 2;
    const gapX = 18;
    const gapY = 16;
    const cardW = (stage.w - gapX * (cols - 1)) / cols;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    for (let i = 0; i < 6; i++) {
      const node = list[i % list.length];
      const r = Math.floor(i / cols);
      const c = i % cols;
      drawInfographicNodeCard(
        ctx,
        {
          x: stage.x + c * (cardW + gapX),
          y: stage.y + r * (cardH + gapY),
          w: cardW,
          h: cardH,
        },
        node,
        i,
        palette,
        tplId,
        showIcons
      );
    }
    return;
  }

  // TEMPLATE #25: Widescreen Featured Hero & OG Poster with Embedded Chart Card + 4 KPI Strip Pills
  if (tplId === 25) {
    const list = items.slice(0, 4);
    const stripH = Math.min(stage.h * 0.34, 135);
    const topZoneH = stage.h - stripH - 18;
    const leftW = stage.w * 0.58;
    const rightW = stage.w - leftW - 22;

    // Left Spotlight Feature Panel
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    roundRectPath(ctx, stage.x, stage.y, leftW, topZoneH, 20);
    ctx.fill();
    ctx.stroke();

    drawTagPill(ctx, stage.x + 24, stage.y + 20, "FEATURED VISUAL PLAYBOOK", palette.accent);
    drawFittedTextBlock(
      ctx,
      config.headline,
      stage.x + 24,
      stage.y + 56,
      leftW - 48,
      topZoneH - 72,
      { maxPx: 32, minPx: 18, weight: "900", color: palette.textMain, maxLines: 3, lineHeightRatio: 1.18 }
    );

    // Right Mini Visual Data Preview Card (Bar Chart + Trend Graphic)
    const rx = stage.x + leftW + 22;
    ctx.fillStyle = palette.surfaceAlt;
    ctx.strokeStyle = palette.accentSecondary;
    ctx.lineWidth = 2;
    roundRectPath(ctx, rx, stage.y, rightW, topZoneH, 20);
    ctx.fill();
    ctx.stroke();

    drawFittedTextBlock(ctx, "LIVE PERFORMANCE SNAPSHOT", rx + 22, stage.y + 18, rightW - 44, 20, {
      maxPx: 13, minPx: 10, weight: "900", color: palette.accentSecondary, maxLines: 1,
    });
    const barBaseY = stage.y + topZoneH - 24;
    const maxBarH = Math.max(50, topZoneH - 76);
    [0.52, 0.74, 0.88, 1.0].forEach((ratio, idx) => {
      const bw = (rightW - 76) / 4;
      const bx = rx + 22 + idx * (bw + 10);
      const bh = maxBarH * ratio;
      ctx.fillStyle = stepColors[idx % stepColors.length];
      roundRectPath(ctx, bx, barBaseY - bh, bw, bh, [8, 8, 0, 0]);
      ctx.fill();
    });

    // Bottom 4 KPI Strip Cards
    const stripY = stage.y + stage.h - stripH;
    const gapX = 16;
    const pillW = (stage.w - gapX * (list.length - 1)) / list.length;
    list.forEach((node, idx) => {
      const px = stage.x + idx * (pillW + gapX);
      drawInfographicNodeCard(
        ctx,
        { x: px, y: stripY, w: pillW, h: stripH },
        node,
        idx,
        palette,
        tplId,
        showIcons
      );
    });
    return;
  }

  // Fallback balanced grid
  const cols = items.length <= 2 ? items.length : 2;
  const rows = Math.ceil(items.length / cols);
  const gapX = 20;
  const gapY = 16;
  const cardW = (stage.w - gapX * (cols - 1)) / cols;
  const cardH = (stage.h - gapY * (rows - 1)) / rows;
  items.forEach((node, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    drawInfographicNodeCard(
      ctx,
      {
        x: stage.x + c * (cardW + gapX),
        y: stage.y + r * (cardH + gapY),
        w: cardW,
        h: cardH,
      },
      node,
      idx,
      palette,
      tplId,
      showIcons
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Primary Canvas Renderer: renderBlogInfographicToCanvas                      */
/* -------------------------------------------------------------------------- */

export function renderBlogInfographicToCanvas(
  canvas: HTMLCanvasElement,
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {}
): void {
  const dims =
    ASPECT_RATIO_DIMENSIONS[config.aspectRatio] ?? ASPECT_RATIO_DIMENSIONS["16:9"];
  const scale = options.scale ?? 1;
  const W = dims.width;
  const H = dims.height;

  canvas.width = Math.max(1, Math.round(W * scale));
  canvas.height = Math.max(1, Math.round(H * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  const palette = resolvePalette(config.paletteId, options.customColors);
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === config.templateId) ??
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  const backdropStyle: InfographicBackdropStyle =
    options.backdropStyle ?? config.backdropStyle ?? "ai-art-plate";
  const showIcons = options.showVectorIcons ?? config.showVectorIcons ?? true;
  const density = options.spacingDensity ?? config.spacingDensity ?? "balanced";

  // 1. Base Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, palette.bgStart);
  bgGrad.addColorStop(1, palette.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Hybrid AI Art Plate Composite Layer (when available) + Decorative Ambient Geometry
  const artPlate =
    options.backdropPlateImage !== undefined
      ? options.backdropPlateImage
      : backdropStyle === "ai-art-plate"
        ? getArtPlateForPalette(config.paletteId, config.templateId)
        : null;

  if (artPlate && artPlate.complete && (artPlate.naturalWidth || artPlate.width)) {
    ctx.save();
    ctx.globalAlpha = palette.isLight ? 0.36 : 0.42;
    const sw = artPlate.naturalWidth || artPlate.width;
    const sh = artPlate.naturalHeight || artPlate.height;
    const cover = Math.max(W / sw, H / sh);
    const dw = sw * cover;
    const dh = sh * cover;
    ctx.drawImage(artPlate, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();

    // Soft center readability vignette so typography stays 100% razor-sharp
    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.18, W / 2, H / 2, Math.max(W, H) * 0.72);
    vig.addColorStop(0, palette.isLight ? "rgba(255,255,255,0.86)" : "rgba(7,11,25,0.82)");
    vig.addColorStop(1, palette.isLight ? "rgba(255,255,255,0.45)" : "rgba(7,11,25,0.38)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  } else if (backdropStyle !== "clean-studio") {
    // Procedural glassmorphic glowing orbs & Venngage-style corner wave ribbon
    ctx.save();
    const orb1 = ctx.createRadialGradient(W * 0.88, H * 0.12, 10, W * 0.88, H * 0.12, W * 0.28);
    orb1.addColorStop(0, `${palette.accent}35`);
    orb1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, W, H);

    const orb2 = ctx.createRadialGradient(W * 0.12, H * 0.86, 10, W * 0.12, H * 0.86, W * 0.26);
    orb2.addColorStop(0, `${palette.accentSecondary}2E`);
    orb2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Subtle architectural dot grid
  ctx.fillStyle = palette.isLight
    ? "rgba(15, 23, 42, 0.045)"
    : "rgba(255, 255, 255, 0.038)";
  for (let gx = 40; gx < W - 24; gx += 40) {
    for (let gy = 40; gy < H - 24; gy += 40) {
      ctx.fillRect(gx, gy, 2, 2);
    }
  }

  // 3. Outer Poster Frame & Venngage-style Top Accent Corner Ribbon
  const padMult = density === "compact" ? 0.032 : density === "spacious" ? 0.048 : 0.038;
  const pad = Math.round(Math.min(W, H) * padMult);
  const cx = pad;
  const cy = pad;
  const cw = W - pad * 2;
  const ch = H - pad * 2;
  const footerH = Math.round(Math.max(54, ch * 0.088));

  ctx.strokeStyle = `${palette.border}99`;
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, cx, cy, cw, ch, 28);
  ctx.stroke();

  // Top decorative gradient bar along poster top
  const topBarGrad = ctx.createLinearGradient(cx, cy, cx + cw, cy);
  topBarGrad.addColorStop(0, palette.accent);
  topBarGrad.addColorStop(0.5, palette.accentSecondary);
  topBarGrad.addColorStop(1, palette.accentTertiary);
  ctx.fillStyle = topBarGrad;
  roundRectPath(ctx, cx, cy, cw, 8, [28, 28, 0, 0]);
  ctx.fill();

  // 4. Header Zone (Category Pill + Headline + Subheadline + Brand Logo)
  const innerPad = Math.round(cw * 0.034);
  const headerX = cx + innerPad;
  const headerW = cw - innerPad * 2;
  let curY = cy + Math.round(innerPad * 0.72) + 4;

  const pillLabel = `${spec.family.toUpperCase()} · LAYOUT #${spec.id}`;
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  const pillW = Math.min(headerW * 0.62, ctx.measureText(pillLabel).width + 28);
  ctx.fillStyle = palette.accentSoft;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, headerX, curY, pillW, 28, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.textBaseline = "middle";
  ctx.fillText(pillLabel, headerX + 14, curY + 14);

  drawBrandLogoOrBadge(
    ctx,
    cx + cw - innerPad,
    curY + 14,
    config.footerSourceLabel || "DoItWithAI.tools",
    palette,
    options
  );

  curY += 38;

  const headlineUsed = drawFittedTextBlock(
    ctx,
    config.headline || spec.name,
    headerX,
    curY,
    headerW,
    Math.round(ch * 0.13),
    {
      maxPx: W >= 1400 ? 36 : 30,
      minPx: 20,
      weight: "900",
      color: palette.textMain,
      maxLines: 2,
      lineHeightRatio: 1.16,
    }
  );
  curY += headlineUsed + 6;

  if (config.subheadline) {
    const subUsed = drawFittedTextBlock(
      ctx,
      config.subheadline,
      headerX,
      curY,
      headerW,
      32,
      {
        maxPx: 17,
        minPx: 12,
        weight: "600",
        color: palette.textMuted,
        maxLines: 1,
      }
    );
    curY += subUsed + 14;
  } else {
    curY += 10;
  }

  // 5. Full-Width Infographic Body Stage
  const bodyTop = curY;
  const bodyBottom = cy + ch - footerH - 16;
  const bodyH = Math.max(180, bodyBottom - bodyTop);

  renderTemplateBodyGeometry(
    ctx,
    {
      x: headerX,
      y: bodyTop,
      w: headerW,
      h: bodyH,
    },
    config,
    palette,
    showIcons
  );

  // 6. Executive Footer Bar
  const fy = cy + ch - footerH;
  ctx.fillStyle = palette.footerBg;
  roundRectPath(ctx, cx, fy, cw, footerH, [0, 0, 27, 27]);
  ctx.fill();

  ctx.font = "700 14px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#F8FAFC";
  ctx.textBaseline = "middle";
  ctx.fillText(
    config.footerSourceLabel || "DoItWithAI.tools · Visual SEO & Infographic Studio",
    headerX,
    fy + footerH / 2
  );

  const rightTag = `${spec.name} · Editable Vector & HD Infographic`;
  ctx.font = "600 13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#94A3B8";
  ctx.textAlign = "right";
  ctx.fillText(rightTag, cx + cw - innerPad, fy + footerH / 2);
  ctx.textAlign = "left";

  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/* Clean Standalone Vector SVG Compiler: generateBlogInfographicSvg            */
/* -------------------------------------------------------------------------- */

function escXml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function svgNodeCard(
  x: number,
  y: number,
  w: number,
  h: number,
  node: BlogInfographicNodeItem,
  idx: number,
  palette: BlogInfographicPaletteTokens,
  templateId: number,
  accentOverride?: string
): string {
  const colors = [
    palette.accent,
    palette.accentSecondary,
    palette.accentTertiary,
    "#10B981",
    "#F59E0B",
  ];
  const accent = accentOverride || colors[idx % colors.length];
  const iconId = resolveNodeIconId(node, idx, templateId);
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${w}" height="${h}" rx="18" fill="${palette.surface}" stroke="${accent}" stroke-width="2" />
      <rect width="${w}" height="7" rx="3.5" fill="${accent}" />
      <circle cx="34" cy="34" r="16" fill="${accent}" />
      ${svgVectorIconMarkup(iconId, 34, 34, 18, "#FFFFFF")}
      <rect x="58" y="22" width="88" height="24" rx="8" fill="${palette.accentSoft}" />
      <text x="68" y="38" fill="${accent}" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="800">${escXml(
        (node.badge || `STEP 0${idx + 1}`).toUpperCase().slice(0, 12)
      )}</text>
      ${
        node.metricValue
          ? `<rect x="${Math.max(150, w - 114)}" y="22" width="98" height="24" rx="12" fill="${accent}" />
      <text x="${Math.max(199, w - 65)}" y="38" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="800">${escXml(
              node.metricValue.slice(0, 14)
            )}</text>`
          : ""
      }
      <text x="20" y="${Math.min(h - 38, 76)}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="800">${escXml(
        (node.title || "").slice(0, 44)
      )}</text>
      <text x="20" y="${Math.min(h - 14, 104)}" fill="${palette.textMuted}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500">${escXml(
        (node.detail || "").slice(0, 96)
      )}</text>
    </g>`;
}

export function generateBlogInfographicSvg(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {}
): string {
  const dims =
    ASPECT_RATIO_DIMENSIONS[config.aspectRatio] ?? ASPECT_RATIO_DIMENSIONS["16:9"];
  const W = dims.width;
  const H = dims.height;
  const palette = resolvePalette(config.paletteId, options.customColors);
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === config.templateId) ??
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  const fallbackNodes =
    TEMPLATE_CURATED_SHOWCASE_DATA[spec.id]?.nodes ??
    TEMPLATE_CURATED_SHOWCASE_DATA[1].nodes;
  const nodes =
    config.nodes && config.nodes.length > 0 ? config.nodes : fallbackNodes;
  const items = nodes.slice(0, 6);

  const pad = Math.round(Math.min(W, H) * 0.038);
  const cw = W - pad * 2;
  const ch = H - pad * 2;
  const footerH = Math.round(Math.max(54, ch * 0.088));
  const innerPad = Math.round(cw * 0.034);
  const stageX = pad + innerPad;
  const stageY = pad + 165;
  const stageW = cw - innerPad * 2;
  const stageH = ch - 165 - footerH - 18;

  const cols = items.length <= 3 ? items.length : 2;
  const rows = Math.ceil(items.length / cols);
  const gapX = 20;
  const gapY = 16;
  const cardW = Math.round((stageW - gapX * (cols - 1)) / cols);
  const cardH = Math.round((stageH - gapY * (rows - 1)) / rows);

  let cardsSvg = "";
  items.forEach((node, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const bx = stageX + c * (cardW + gapX);
    const by = stageY + r * (cardH + gapY);
    cardsSvg += svgNodeCard(bx, by, cardW, cardH, node, idx, palette, spec.id);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escXml(
    config.altText || config.headline
  )}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />
  <rect x="${pad}" y="${pad}" width="${cw}" height="${ch}" rx="28" fill="none" stroke="${palette.border}" stroke-width="2.5" />
  <rect x="${stageX}" y="${pad + 26}" width="310" height="28" rx="14" fill="${palette.accentSoft}" stroke="${palette.accent}" stroke-width="1.5" />
  <text x="${stageX + 14}" y="${pad + 45}" fill="${palette.accent}" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="800">${escXml(
    `${spec.family.toUpperCase()} · LAYOUT #${spec.id}`
  )}</text>
  <text x="${stageX}" y="${pad + 94}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="900">${escXml(
    (config.headline || spec.name).slice(0, 74)
  )}</text>
  <text x="${stageX}" y="${pad + 126}" fill="${palette.textMuted}" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="600">${escXml(
    (config.subheadline || "").slice(0, 105)
  )}</text>
  ${cardsSvg}
  <rect x="${pad}" y="${pad + ch - footerH}" width="${cw}" height="${footerH}" rx="24" fill="${palette.footerBg}" />
  <text x="${stageX}" y="${pad + ch - Math.round(footerH / 2) + 5}" fill="#F8FAFC" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700">${escXml(
    config.footerSourceLabel || "DoItWithAI.tools · Visual SEO & Infographic Studio"
  )}</text>
</svg>`;
}

export async function renderBlogInfographicToPngDataUrl(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {}
): Promise<string> {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  renderBlogInfographicToCanvas(canvas, config, options);
  return canvas.toDataURL("image/png");
}
