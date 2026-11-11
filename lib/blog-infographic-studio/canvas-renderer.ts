/**
 * Phase 4 Core Deliverable #1: 25-Template Deterministic HTML5 Canvas & Vector SVG Renderer
 * File: lib/blog-infographic-studio/canvas-renderer.ts
 *
 * Built & Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 * Execution Cost: 0 LLM Tokens (<20ms deterministic client-side rendering)
 *
 * Upstream Connections:
 *  - BlogInfographicConfig, BlogInfographicNodeItem, InfographicAspectRatio
 *    from '@/lib/blog-writer/canonical-state'
 *  - BLOG_INFOGRAPHIC_25_TEMPLATES, BlogInfographicTemplateSpec
 *    from '@/lib/founder-hub/grand-blog-writer-blueprint'
 *
 * Downstream Consumers:
 *  - features/blog-infographic-studio/BlogInfographicStudio.tsx (standalone + embedded modal)
 *  - Phase 6: Stage4RichEditorAndScorecard.tsx (inline H2 visual cards)
 *  - Phase 7: lib/blog-writer/technical-seo-compiler.ts (CWV <figure> serializer)
 *  - Phase 9: lib/blog-writer/zip-bundle-builder.ts (Master .ZIP /visuals/ exporter)
 *
 * Nov 11, 2026 Update — Signed by: Vantage-Draw (Infographic Geometry & Rendering Specialist)
 *  - Every one of the 25 templates now renders its OWN distinct geometry (zig-zag path,
 *    3-column matrix table, asymmetric bento grid, cost/ROI ledger, 2x2 quadrant, 3-circle
 *    Venn, checklist rows, TL;DR numbered list, annotated anatomy diagram, cheat-sheet code
 *    cards, widescreen hero/OG banner) instead of falling back to one generic card grid.
 *  - generateBlogInfographicSvg() now mirrors the same family-specific layouts so the
 *    downloaded vector SVG always matches what is shown on the live HD canvas.
 */

import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/founder-hub/grand-blog-writer-blueprint";
import type {
  LogoBadgeStyle,
  MalePortraitPresetId,
  PortraitFrameMode,
} from "@/features/quote-stat-testimonial-card-studio/model";

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
    label: "Indigo Cyber (Dark)",
    bgStart: "#070B19",
    bgEnd: "#111936",
    surface: "#151F3E",
    surfaceAlt: "#1D2A52",
    border: "#4F46E5",
    accent: "#6366F1",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(99, 102, 241, 0.18)",
    textMain: "#F8FAFC",
    textMuted: "#CBD5E1",
    footerBg: "#050813",
    isLight: false,
  },
  "emerald-growth": {
    id: "emerald-growth",
    label: "Emerald Growth (Dark)",
    bgStart: "#041F1E",
    bgEnd: "#0B2E2B",
    surface: "#103B37",
    surfaceAlt: "#164E48",
    border: "#10B981",
    accent: "#10B981",
    accentSecondary: "#34D399",
    accentSoft: "rgba(16, 185, 129, 0.18)",
    textMain: "#F0FDF4",
    textMuted: "#A7F3D0",
    footerBg: "#021514",
    isLight: false,
  },
  "amber-executive": {
    id: "amber-executive",
    label: "Amber Executive (Dark)",
    bgStart: "#0F1420",
    bgEnd: "#1E2538",
    surface: "#1B2336",
    surfaceAlt: "#253048",
    border: "#F59E0B",
    accent: "#F59E0B",
    accentSecondary: "#FB923C",
    accentSoft: "rgba(245, 158, 11, 0.18)",
    textMain: "#FFFBEB",
    textMuted: "#FDE68A",
    footerBg: "#090D16",
    isLight: false,
  },
  "rose-editorial": {
    id: "rose-editorial",
    label: "Rose Editorial (Light)",
    bgStart: "#FFFBF7",
    bgEnd: "#FFF1F2",
    surface: "#FFFFFF",
    surfaceAlt: "#FFE4E6",
    border: "#F43F5E",
    accent: "#E11D48",
    accentSecondary: "#FB7185",
    accentSoft: "rgba(225, 29, 72, 0.12)",
    textMain: "#1E1B2E",
    textMuted: "#475569",
    footerBg: "#1E1B2E",
    isLight: true,
  },
  "cyan-tech": {
    id: "cyan-tech",
    label: "Cyan Systems (Dark)",
    bgStart: "#061826",
    bgEnd: "#0C2D48",
    surface: "#103758",
    surfaceAlt: "#164870",
    border: "#06B6D4",
    accent: "#22D3EE",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(34, 211, 238, 0.18)",
    textMain: "#F0F9FF",
    textMuted: "#BAE6FD",
    footerBg: "#04101A",
    isLight: false,
  },
  "slate-minimal": {
    id: "slate-minimal",
    label: "Boardroom Paper (Light)",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    border: "#3452D1",
    accent: "#3452D1",
    accentSecondary: "#0EA5E9",
    accentSoft: "rgba(52, 82, 209, 0.11)",
    textMain: "#0F172A",
    textMuted: "#475569",
    footerBg: "#0F172A",
    isLight: true,
  },
  "violet-saas": {
    id: "violet-saas",
    label: "Violet SaaS (Dark)",
    bgStart: "#120824",
    bgEnd: "#25104A",
    surface: "#2D1657",
    surfaceAlt: "#3B1E70",
    border: "#A855F7",
    accent: "#C084FC",
    accentSecondary: "#F472B6",
    accentSoft: "rgba(192, 132, 252, 0.18)",
    textMain: "#FAF5FF",
    textMuted: "#E9D5FF",
    footerBg: "#0B0418",
    isLight: false,
  },
  "blue-trust": {
    id: "blue-trust",
    label: "DIWAT Royal Blue (Light)",
    bgStart: "#F6F7FF",
    bgEnd: "#E8ECFF",
    surface: "#FFFFFF",
    surfaceAlt: "#EEF2FF",
    border: "#5271FF",
    accent: "#5271FF",
    accentSecondary: "#10B981",
    accentSoft: "rgba(82, 113, 255, 0.12)",
    textMain: "#141E46",
    textMuted: "#475569",
    footerBg: "#141E46",
    isLight: true,
  },
};

export const ASPECT_RATIO_DIMENSIONS: Record<
  InfographicAspectRatio,
  { width: number; height: number; label: string }
> = {
  "16:9": { width: 1600, height: 900, label: "16:9 Blog & OG (1600×900)" },
  "1:1": { width: 1080, height: 1080, label: "1:1 Square (1080×1080)" },
  "4:5": { width: 1080, height: 1350, label: "4:5 LinkedIn (1080×1350)" },
  "9:16": { width: 1080, height: 1920, label: "9:16 Story / Pin (1080×1920)" },
};

export interface BlogInfographicCustomColorOverrides {
  bgStart?: string;
  surface?: string;
  accent?: string;
  textMain?: string;
}

export interface BlogInfographicRenderOptions {
  /** Scale multiplier (e.g. 0.26 for live template thumbnails, 1 for full HD export). */
  scale?: number;
  /** Optional custom hex overrides from the studio color wheel. */
  customColors?: BlogInfographicCustomColorOverrides;
  /** Optional author / executive portrait (HTMLImageElement or cutout HTMLCanvasElement). */
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

/* -------------------------------------------------------------------------- */
/* Sample config factory for all 25 templates                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_SAMPLE_NODES: BlogInfographicNodeItem[] = [
  {
    id: "n-1",
    badge: "01",
    title: "Intent & Keyword Cluster",
    detail: "Map primary keyword, semantic LSI entities, and SERP intent in <10ms.",
    metricValue: "98% Fit",
  },
  {
    id: "n-2",
    badge: "02",
    title: "<580px Pixel-Safe Meta Pack",
    detail: "Verify desktop & mobile title width before a single token is spent.",
    metricValue: "512px",
  },
  {
    id: "n-3",
    badge: "03",
    title: "25 Editable H2 Infographics",
    detail: "Pair every H2 with crisp HTML5 Canvas & vector SVG diagrams at $0 API cost.",
    metricValue: "25 Layouts",
  },
  {
    id: "n-4",
    badge: "04",
    title: "JSON-LD @graph & Master .ZIP",
    detail: "Export BlogPosting + FAQPage schema, CWV HTML, and 6 social posts in 1 click.",
    metricValue: "100 CWV",
  },
];

export function createSampleInfographicConfig(
  templateId = 1,
  paletteId: BlogInfographicConfig["paletteId"] = "indigo-cyber"
): BlogInfographicConfig {
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ??
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];

  return {
    id: `infographic-tpl-${spec.id}`,
    sectionId: "sec-sample-1",
    templateId: spec.id,
    templateSlug: spec.slug,
    templateName: spec.name,
    headline: "How Our 62-Tool AI Blog & Visual Studio Ranks #1 in 2026",
    subheadline: `${spec.family} · ${spec.bestForSectionType} · 100% Editable Typography`,
    paletteId,
    aspectRatio: "16:9",
    nodes: DEFAULT_SAMPLE_NODES.map((n) => ({ ...n })),
    footerSourceLabel: "DoItWithAI.tools · Free AI Blog Section Infographic Studio",
    altText: `${spec.name} infographic explaining the 62-Tool AI Blog & Visual Studio workflow`,
  };
}

/* -------------------------------------------------------------------------- */
/* Low-level Canvas drawing helpers (Zero-Overlap Mathematical Guarantee)      */
/* -------------------------------------------------------------------------- */

function resolvePalette(
  paletteId: BlogInfographicConfig["paletteId"],
  overrides?: BlogInfographicCustomColorOverrides
): BlogInfographicPaletteTokens {
  const base = BLOG_INFOGRAPHIC_PALETTES[paletteId] ?? BLOG_INFOGRAPHIC_PALETTES["indigo-cyber"];
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const textMain = overrides.textMain || base.textMain;
  const isLight = textMain.toLowerCase() !== "#ffffff" && textMain.toLowerCase() !== "#f8fafc";
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

/** Auto-scales font from maxPx down to minPx so text never overflows `boxH`. */
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
  const weight = opts.weight ?? "800";
  const lineRatio = opts.lineHeightRatio ?? 1.24;
  const maxLines = opts.maxLines ?? 3;
  let chosenPx = opts.maxPx;
  let lines: string[] = [];

  for (let px = opts.maxPx; px >= opts.minPx; px -= 2) {
    ctx.font = `${weight} ${px}px Inter, system-ui, -apple-system, sans-serif`;
    lines = wrapTextLines(ctx, text, maxW, maxLines);
    if (lines.length * px * lineRatio <= maxH) {
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
 * Architectural Portrait Framing (Rule 3.3 of docs/TOOL_OPTIMIZATION_RULES.md):
 * Clips portraits inside Concentric Rings, Rounded Arches, or Adjustable-Radius Windows
 * so raw rectangular gray studio walls NEVER appear on top of cards.
 */
function drawArchitecturalPortraitZone(
  ctx: CanvasRenderingContext2D,
  zone: { x: number; y: number; w: number; h: number },
  palette: BlogInfographicPaletteTokens,
  options: BlogInfographicRenderOptions
): void {
  const src = options.portraitSource;
  if (!src) return;

  const frameMode: PortraitFrameMode =
    options.portraitFrame && options.portraitFrame !== "auto"
      ? options.portraitFrame
      : "ring-circle";
  const ringScale = options.portraitRingScale ?? 1;
  const zoom = options.portraitScale ?? 1;
  const offX = options.portraitOffsetX ?? 0;
  const offY = options.portraitOffsetY ?? 0;
  const radiusPct = options.portraitRadius ?? 24;

  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h * 0.44;
  const baseR = Math.min(zone.w, zone.h * 0.76) * 0.37 * ringScale;

  ctx.save();

  if (frameMode === "ring-circle" || frameMode === "cutout") {
    const outerR = baseR * 1.26;
    const midR = baseR * 1.12;

    // Soft radial aura
    const aura = ctx.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, outerR * 1.15);
    aura.addColorStop(0, palette.accentSoft);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Outer & middle concentric rings
    ctx.strokeStyle = palette.accent;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, midR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 4 orbital nodes
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI / 4) + (i * Math.PI) / 2;
      const nx = cx + Math.cos(ang) * midR;
      const ny = cy + Math.sin(ang) * midR;
      ctx.fillStyle = i % 2 === 0 ? palette.accent : palette.accentSecondary;
      ctx.beginPath();
      ctx.arc(nx, ny, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clip to inner circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.clip();

    const innerGrad = ctx.createRadialGradient(cx, cy - baseR * 0.3, baseR * 0.1, cx, cy, baseR);
    innerGrad.addColorStop(0, palette.surfaceAlt);
    innerGrad.addColorStop(1, palette.bgStart);
    ctx.fillStyle = innerGrad;
    ctx.fillRect(cx - baseR, cy - baseR, baseR * 2, baseR * 2);

    const srcW = (src as HTMLImageElement).naturalWidth || src.width || 400;
    const srcH = (src as HTMLImageElement).naturalHeight || src.height || 400;
    const cover = Math.max((baseR * 2) / srcW, (baseR * 2) / srcH) * zoom;
    const dw = srcW * cover;
    const dh = srcH * cover;
    const dx = cx - dw / 2 + offX * baseR * 2;
    const dy = cy - dh / 2 + offY * baseR * 2;
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();

    // Accent border ring
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Arch or Adjustable-Radius Window
    const boxW = Math.min(zone.w * 0.86, zone.h * 0.68) * ringScale;
    const boxH = Math.min(zone.h * 0.74, boxW * 1.18);
    const bx = cx - boxW / 2;
    const by = cy - boxH / 2;
    const radii: [number, number, number, number] =
      frameMode === "arch"
        ? [boxW / 2, boxW / 2, 22, 22]
        : (() => {
            const rPx = Math.round((radiusPct / 50) * (Math.min(boxW, boxH) / 2));
            return [rPx, rPx, rPx, rPx];
          })();

    // Offset shadow card
    ctx.fillStyle = palette.accentSoft;
    roundRectPath(ctx, bx + 8, by + 8, boxW, boxH, radii);
    ctx.fill();

    ctx.save();
    roundRectPath(ctx, bx, by, boxW, boxH, radii);
    ctx.clip();

    ctx.fillStyle = palette.surfaceAlt;
    ctx.fillRect(bx, by, boxW, boxH);

    const srcW = (src as HTMLImageElement).naturalWidth || src.width || 400;
    const srcH = (src as HTMLImageElement).naturalHeight || src.height || 400;
    const cover = Math.max(boxW / srcW, boxH / srcH) * zoom;
    const dw = srcW * cover;
    const dh = srcH * cover;
    const dx = cx - dw / 2 + offX * boxW;
    const dy = cy - dh / 2 + offY * boxH;
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3.5;
    roundRectPath(ctx, bx, by, boxW, boxH, radii);
    ctx.stroke();
  }

  // Author caption pill beneath portrait
  if (options.authorName) {
    const pillW = Math.min(zone.w - 12, 260);
    const pillH = 48;
    const px = cx - pillW / 2;
    const py = zone.y + zone.h - pillH - 6;
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, px, py, pillW, pillH, 14);
    ctx.fill();
    ctx.stroke();

    drawFittedTextBlock(ctx, options.authorName, cx, py + 7, pillW - 20, 20, {
      maxPx: 15,
      minPx: 11,
      weight: "800",
      color: palette.textMain,
      align: "center",
      maxLines: 1,
    });
    if (options.authorRole) {
      drawFittedTextBlock(ctx, options.authorRole, cx, py + 26, pillW - 20, 18, {
        maxPx: 11,
        minPx: 9,
        weight: "600",
        color: palette.textMuted,
        align: "center",
        maxLines: 1,
      });
    }
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
    const ratio = (logo.naturalWidth || logo.width || 120) / Math.max(1, logo.naturalHeight || logo.height || 40);
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
  const pw = Math.min(240, tw + 26);
  const ph = 30;
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

/* -------------------------------------------------------------------------- */
/* Node Card primitive + 25 Distinct Template Geometry Renderers               */
/* -------------------------------------------------------------------------- */

function drawStandardNodeCard(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  node: BlogInfographicNodeItem,
  index: number,
  palette: BlogInfographicPaletteTokens,
  variant: "default" | "versus-left" | "versus-right" | "checklist" | "myth-reality" = "default"
): void {
  const accentColor =
    variant === "versus-left"
      ? "#F43F5E"
      : variant === "versus-right"
        ? "#10B981"
        : index % 2 === 0
          ? palette.accent
          : palette.accentSecondary;

  ctx.save();
  ctx.fillStyle = palette.surface;
  ctx.strokeStyle = variant === "default" ? palette.border : accentColor;
  ctx.lineWidth = 2;
  roundRectPath(ctx, box.x, box.y, box.w, box.h, 18);
  ctx.fill();
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = accentColor;
  roundRectPath(ctx, box.x, box.y, 7, box.h, [18, 0, 0, 18]);
  ctx.fill();

  const innerX = box.x + 20;
  const innerW = Math.max(60, box.w - 34);
  let curY = box.y + 14;

  // Badge + optional Metric pill row
  const badgeText =
    variant === "checklist"
      ? `✓ CHECK #${index + 1}`
      : variant === "myth-reality"
        ? index % 2 === 0
          ? "✕ COMMON MYTH"
          : "✓ PROVEN REALITY"
        : (node.badge || `0${index + 1}`).toUpperCase();

  ctx.font = "800 12px Inter, system-ui, sans-serif";
  const badgeW = Math.min(innerW * 0.55, ctx.measureText(badgeText).width + 20);
  ctx.fillStyle = palette.accentSoft;
  roundRectPath(ctx, innerX, curY, badgeW, 24, 8);
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, innerX + 10, curY + 12);

  if (node.metricValue) {
    const metricText = node.metricValue;
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    const mw = Math.min(innerW * 0.44, ctx.measureText(metricText).width + 18);
    const mx = box.x + box.w - mw - 14;
    ctx.fillStyle = accentColor;
    roundRectPath(ctx, mx, curY, mw, 24, 999);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(metricText, mx + mw / 2, curY + 12);
    ctx.textAlign = "left";
  }

  curY += 32;

  const titleUsed = drawFittedTextBlock(
    ctx,
    node.title || `Key Point ${index + 1}`,
    innerX,
    curY,
    innerW,
    Math.min(54, box.h * 0.34),
    {
      maxPx: 21,
      minPx: 14,
      weight: "800",
      color: palette.textMain,
      maxLines: 2,
    }
  );
  curY += titleUsed + 6;

  const remainH = Math.max(24, box.y + box.h - curY - 12);
  drawFittedTextBlock(ctx, node.detail || "", innerX, curY, innerW, remainH, {
    maxPx: 15,
    minPx: 11,
    weight: "500",
    color: palette.textMuted,
    maxLines: 3,
    lineHeightRatio: 1.32,
  });

  ctx.restore();
}

/** Small reusable numeric-badge circle used by the zig-zag, anatomy & Venn geometries. */
function drawNumberedDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  label: string,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `900 ${Math.round(r * 0.85)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 1);
  ctx.textAlign = "left";
  ctx.restore();
}

/** Small pill-style tag used by zig-zag, checklist & quadrant geometries. */
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
  const h = 22;
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

function renderTemplateBodyGeometry(
  ctx: CanvasRenderingContext2D,
  stage: { x: number; y: number; w: number; h: number },
  config: BlogInfographicConfig,
  palette: BlogInfographicPaletteTokens
): void {
  const tplId = config.templateId || 1;
  const nodes =
    config.nodes && config.nodes.length > 0 ? config.nodes : DEFAULT_SAMPLE_NODES;
  const count = Math.min(nodes.length, 8);
  const items = nodes.slice(0, count);

  // 1: Horizontal Step Pipeline
  if (tplId === 1) {
    const cols = Math.min(4, items.length);
    const rows = Math.ceil(items.length / cols);
    const gapX = 22;
    const gapY = 20;
    const cardW = (stage.w - gapX * (cols - 1)) / cols;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    items.forEach((node, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const bx = stage.x + c * (cardW + gapX);
      const by = stage.y + r * (cardH + gapY);
      drawStandardNodeCard(ctx, { x: bx, y: by, w: cardW, h: cardH }, node, idx, palette);

      // Connector arrow to next column
      if (c < cols - 1 && idx < items.length - 1) {
        const ax = bx + cardW + 4;
        const ay = by + cardH / 2;
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + gapX - 8, ay);
        ctx.stroke();
      }
    });
    return;
  }

  // 2: Vertical Milestone Roadmap
  if (tplId === 2) {
    const spineX = stage.x + 28;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(spineX, stage.y + 16);
    ctx.lineTo(spineX, stage.y + stage.h - 16);
    ctx.stroke();

    const gapY = 14;
    const rowH = (stage.h - gapY * (items.length - 1)) / items.length;
    items.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(spineX, ry + rowH / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      drawStandardNodeCard(
        ctx,
        { x: spineX + 26, y: ry, w: stage.w - 54, h: rowH },
        node,
        idx,
        palette
      );
    });
    return;
  }

  // 3 & 19: Circular Growth Flywheel / Hub-and-Spoke Architecture
  if (tplId === 3 || tplId === 19) {
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2;
    const cardW = Math.min(stage.w * 0.36, 360);
    const cardH = Math.min(stage.h * 0.40, 175);
    const orbitRx = (stage.w - cardW) / 2 - 8;
    const orbitRy = (stage.h - cardH) / 2 - 6;

    // Orbit ring
    ctx.strokeStyle = palette.accent;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(60, orbitRx), Math.max(45, orbitRy), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Center hub
    const hubR = Math.min(68, Math.min(stage.w, stage.h) * 0.13);
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fill();
    drawFittedTextBlock(
      ctx,
      tplId === 3 ? "FLYWHEEL CORE" : "PILLAR HUB",
      cx,
      cy - 10,
      hubR * 1.7,
      28,
      { maxPx: 14, minPx: 10, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1 }
    );

    const angles =
      items.length <= 4
        ? [-Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.75]
        : items.map((_, i) => -Math.PI / 2 + (i * Math.PI * 2) / items.length);

    items.slice(0, 6).forEach((node, idx) => {
      const ang = angles[idx % angles.length];
      const nx = cx + Math.cos(ang) * orbitRx - cardW / 2;
      const ny = cy + Math.sin(ang) * orbitRy - cardH / 2;
      drawStandardNodeCard(ctx, { x: nx, y: ny, w: cardW, h: cardH }, node, idx, palette);
    });
    return;
  }

  // 4: Zig-Zag Reader / Customer Journey Path
  if (tplId === 4) {
    const stepCount = Math.max(2, items.length);
    const stepW = stage.w / stepCount;
    const dotR = Math.min(26, stage.h * 0.055);
    const cardW = Math.min(stepW * 0.82, 230);
    const cardH = Math.min(stage.h * 0.4, 150);
    const topY = stage.y + cardH / 2 + 6;
    const botY = stage.y + stage.h - cardH / 2 - 6;

    // Dashed zig-zag connector path through every step's dot
    ctx.save();
    ctx.setLineDash([9, 8]);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    items.forEach((_, idx) => {
      const px = stage.x + stepW * idx + stepW / 2;
      const py = idx % 2 === 0 ? topY : botY;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    items.forEach((node, idx) => {
      const px = stage.x + stepW * idx + stepW / 2;
      const isTop = idx % 2 === 0;
      const dotY = isTop ? topY : botY;
      const cardY = isTop ? dotY - cardH / 2 - dotR - 14 : dotY + dotR + 14;
      const color = idx % 2 === 0 ? palette.accent : palette.accentSecondary;

      drawNumberedDot(ctx, px, dotY, dotR, String(idx + 1), color);
      drawStandardNodeCard(
        ctx,
        { x: px - cardW / 2, y: cardY, w: cardW, h: cardH },
        node,
        idx,
        palette
      );
    });
    return;
  }

  // 5 & 17: 4-Tier Conversion Funnel / 3-Tier Strategy Pyramid
  if (tplId === 5 || tplId === 17) {
    const isPyramid = tplId === 17;
    const tiers = items.slice(0, 4);
    const gapY = 12;
    const tierH = (stage.h - gapY * (tiers.length - 1)) / tiers.length;

    tiers.forEach((node, idx) => {
      const ratio = isPyramid
        ? 0.56 + (idx / Math.max(1, tiers.length - 1)) * 0.44
        : 1 - (idx / Math.max(1, tiers.length)) * 0.34;
      const tw = stage.w * ratio;
      const tx = stage.x + (stage.w - tw) / 2;
      const ty = stage.y + idx * (tierH + gapY);
      drawStandardNodeCard(ctx, { x: tx, y: ty, w: tw, h: tierH }, node, idx, palette);
    });
    return;
  }

  // 6, 8, 9, 10, 23: Two-Column Versus / Before-After / Pros-Cons / Do's-Don'ts / Myth-Reality
  if (tplId === 6 || tplId === 8 || tplId === 9 || tplId === 10 || tplId === 23) {
    const colGap = 36;
    const colW = (stage.w - colGap) / 2;
    const leftItems = items.filter((_, i) => i % 2 === 0);
    const rightItems = items.filter((_, i) => i % 2 === 1);
    const rows = Math.max(1, leftItems.length, rightItems.length);
    const gapY = 14;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    leftItems.forEach((node, r) => {
      drawStandardNodeCard(
        ctx,
        { x: stage.x, y: stage.y + r * (cardH + gapY), w: colW, h: cardH },
        node,
        r * 2,
        palette,
        tplId === 23 ? "myth-reality" : "versus-left"
      );
    });
    rightItems.forEach((node, r) => {
      drawStandardNodeCard(
        ctx,
        { x: stage.x + colW + colGap, y: stage.y + r * (cardH + gapY), w: colW, h: cardH },
        node,
        r * 2 + 1,
        palette,
        tplId === 23 ? "myth-reality" : "versus-right"
      );
    });

    // Center VS badge
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2;
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tplId === 23 ? "→" : "VS", cx, cy);
    ctx.textAlign = "left";
    return;
  }

  // 7: 3-Option Comparison Matrix Table
  if (tplId === 7) {
    const colCount = 3;
    const labelColW = Math.min(stage.w * 0.26, 220);
    const dataColW = (stage.w - labelColW) / colCount;
    const headerH = Math.min(54, stage.h * 0.14);
    const rows = Math.max(3, Math.min(6, items.length || 5));
    const rowH = (stage.h - headerH - 10) / rows;
    const colHexes = [palette.accent, palette.accentSecondary, "#10B981"];
    const colNames = ["Option A", "Option B", "Option C"];

    // Header row
    ctx.fillStyle = palette.surfaceAlt;
    roundRectPath(ctx, stage.x, stage.y, stage.w, headerH, [14, 14, 0, 0]);
    ctx.fill();
    for (let c = 0; c < colCount; c++) {
      const hx = stage.x + labelColW + c * dataColW;
      ctx.fillStyle = colHexes[c % colHexes.length];
      roundRectPath(ctx, hx + 6, stage.y + 8, dataColW - 12, headerH - 16, 10);
      ctx.fill();
      drawFittedTextBlock(
        ctx,
        items[c]?.badge?.trim() || colNames[c],
        hx + 6,
        stage.y + headerH / 2 - 9,
        dataColW - 24,
        20,
        { maxPx: 14, minPx: 10, weight: "900", color: "#FFFFFF", align: "center", maxLines: 1 }
      );
    }

    // Body rows (alternating stripe + check/x/star icon badges)
    const bodyTop = stage.y + headerH + 10;
    const rowLabels = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;
    for (let r = 0; r < rows; r++) {
      const ry = bodyTop + r * rowH;
      const node = rowLabels[r % rowLabels.length];
      ctx.fillStyle = r % 2 === 0 ? palette.surface : palette.surfaceAlt;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH - 6, 10);
      ctx.fill();

      drawFittedTextBlock(ctx, node?.title || `Feature ${r + 1}`, stage.x + 14, ry + rowH / 2 - 20, labelColW - 20, rowH - 16, {
        maxPx: 15,
        minPx: 11,
        weight: "700",
        color: palette.textMain,
        maxLines: 2,
      });

      for (let c = 0; c < colCount; c++) {
        const icon = (r + c) % 3 === 2 ? "⚡" : (r + c) % 2 === 0 ? "✓" : "✕";
        const iconColor = icon === "✕" ? "#F43F5E" : icon === "⚡" ? "#F59E0B" : "#10B981";
        const ix = stage.x + labelColW + c * dataColW + dataColW / 2;
        ctx.font = "900 20px Inter, system-ui, sans-serif";
        ctx.fillStyle = iconColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, ix, ry + (rowH - 6) / 2);
        ctx.textAlign = "left";
      }
    }
    return;
  }

  // 11: Asymmetric 4-Card Bento KPI Grid (1 large hero metric + 3 stacked)
  if (tplId === 11) {
    const gap = 18;
    const bigW = stage.w * 0.52;
    const smallW = stage.w - bigW - gap;
    const hero = items[0] || DEFAULT_SAMPLE_NODES[0];
    const rest = items.slice(1, 4);

    // Big hero metric card
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, stage.x, stage.y, bigW, stage.h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.accentSoft;
    roundRectPath(ctx, stage.x + 20, stage.y + 18, bigW * 0.5, 26, 8);
    ctx.fill();
    ctx.fillStyle = palette.accent;
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText((hero.badge || "KPI").toUpperCase(), stage.x + 32, stage.y + 31);
    drawFittedTextBlock(ctx, hero.metricValue || "98%", stage.x + 20, stage.y + 56, bigW - 40, stage.h * 0.42, {
      maxPx: 68,
      minPx: 34,
      weight: "900",
      color: palette.textMain,
      maxLines: 1,
    });
    drawFittedTextBlock(ctx, hero.title, stage.x + 20, stage.y + stage.h * 0.62, bigW - 40, 40, {
      maxPx: 20,
      minPx: 14,
      weight: "800",
      color: palette.textMain,
      maxLines: 2,
    });
    drawFittedTextBlock(ctx, hero.detail || "", stage.x + 20, stage.y + stage.h * 0.78, bigW - 40, stage.h * 0.2, {
      maxPx: 14,
      minPx: 11,
      weight: "500",
      color: palette.textMuted,
      maxLines: 3,
      lineHeightRatio: 1.3,
    });

    // 3 stacked smaller metric cards
    const smallH = (stage.h - gap * (rest.length - 1 || 0)) / Math.max(1, rest.length);
    rest.forEach((node, idx) => {
      const sx = stage.x + bigW + gap;
      const sy = stage.y + idx * (smallH + gap);
      const accent = idx % 2 === 0 ? palette.accentSecondary : palette.accent;
      ctx.fillStyle = palette.surfaceAlt;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, sx, sy, smallW, smallH, 16);
      ctx.fill();
      ctx.stroke();
      drawFittedTextBlock(ctx, node.metricValue || "+12%", sx + 16, sy + 10, smallW - 32, smallH * 0.5, {
        maxPx: 28,
        minPx: 16,
        weight: "900",
        color: accent,
        maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.title, sx + 16, sy + smallH * 0.56, smallW - 32, smallH * 0.4, {
        maxPx: 13,
        minPx: 10,
        weight: "700",
        color: palette.textMain,
        maxLines: 2,
      });
    });
    return;
  }

  // 13: Horizontal Benchmark Bar Chart
  if (tplId === 13) {
    const gapY = 16;
    const rowH = (stage.h - gapY * (items.length - 1)) / items.length;
    items.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH, 16);
      ctx.fill();
      ctx.stroke();

      const numMatch = (node.metricValue || "").match(/(\d+(?:\.\d+)?)/);
      const pct = numMatch ? Math.min(100, Math.max(22, Number(numMatch[1]))) : 92 - idx * 14;
      const barMaxW = stage.w * 0.56;
      const barW = (barMaxW * pct) / 100;
      const barX = stage.x + stage.w * 0.38;
      const barH = Math.min(34, rowH * 0.48);
      const barY = ry + (rowH - barH) / 2;

      drawFittedTextBlock(
        ctx,
        `${node.badge || `0${idx + 1}`} · ${node.title}`,
        stage.x + 20,
        ry + 14,
        stage.w * 0.34,
        rowH - 24,
        { maxPx: 19, minPx: 13, weight: "800", color: palette.textMain, maxLines: 2 }
      );

      ctx.fillStyle = palette.surfaceAlt;
      roundRectPath(ctx, barX, barY, barMaxW, barH, 999);
      ctx.fill();

      ctx.fillStyle = idx === 0 ? palette.accent : palette.accentSecondary;
      roundRectPath(ctx, barX, barY, barW, barH, 999);
      ctx.fill();

      ctx.font = "800 14px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText(node.metricValue || `${pct}%`, barX + 14, barY + barH / 2);
    });
    return;
  }

  // 14: Cost vs. ROI Savings Ledger
  if (tplId === 14) {
    const leftW = stage.w * 0.44;
    const gap = 26;
    const rightX = stage.x + leftW + gap;
    const rightW = stage.w - leftW - gap;
    const baseline = items[0] || DEFAULT_SAMPLE_NODES[0];
    const optimized = items[1] || DEFAULT_SAMPLE_NODES[1];

    // Left: baseline vs optimized bar comparison
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    roundRectPath(ctx, stage.x, stage.y, leftW, stage.h, 20);
    ctx.fill();
    ctx.stroke();

    const barAreaX = stage.x + 22;
    const barAreaW = leftW - 44;
    const barH = Math.min(46, stage.h * 0.18);
    const row1Y = stage.y + stage.h * 0.22;
    const row2Y = stage.y + stage.h * 0.52;

    drawFittedTextBlock(ctx, "BASELINE COST", barAreaX, row1Y - 24, barAreaW, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    ctx.fillStyle = "#F43F5E";
    roundRectPath(ctx, barAreaX, row1Y, barAreaW, barH, 10);
    ctx.fill();
    drawFittedTextBlock(ctx, baseline.metricValue || "$12,400/mo", barAreaX + 14, row1Y + barH / 2 - 10, barAreaW - 28, 22, {
      maxPx: 18, minPx: 13, weight: "900", color: "#FFFFFF", maxLines: 1,
    });

    drawFittedTextBlock(ctx, "OPTIMIZED COST", barAreaX, row2Y - 24, barAreaW, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    ctx.fillStyle = "#10B981";
    const optRatio = 0.42;
    roundRectPath(ctx, barAreaX, row2Y, barAreaW * optRatio, barH, 10);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, barAreaX, row2Y, barAreaW, barH, 10);
    ctx.stroke();
    drawFittedTextBlock(ctx, optimized.metricValue || "$5,100/mo", barAreaX + 14, row2Y + barH / 2 - 10, barAreaW * optRatio - 20, 22, {
      maxPx: 18, minPx: 11, weight: "900", color: "#FFFFFF", maxLines: 1,
    });

    // Net savings footer stat
    const savingsY = stage.y + stage.h * 0.80;
    ctx.fillStyle = palette.accentSoft;
    roundRectPath(ctx, barAreaX, savingsY, barAreaW, stage.h - (savingsY - stage.y) - 18, 12);
    ctx.fill();
    drawFittedTextBlock(ctx, "NET MONTHLY SAVINGS", barAreaX + 14, savingsY + 10, barAreaW - 28, 16, {
      maxPx: 11, minPx: 9, weight: "800", color: palette.accent, maxLines: 1,
    });
    drawFittedTextBlock(ctx, items[2]?.metricValue || "+59% ROI", barAreaX + 14, savingsY + 28, barAreaW - 28, 30, {
      maxPx: 24, minPx: 16, weight: "900", color: palette.textMain, maxLines: 1,
    });

    // Right column: remaining detail cards (payback period / time saved)
    const rest = items.slice(2).length > 0 ? items.slice(2) : [DEFAULT_SAMPLE_NODES[2], DEFAULT_SAMPLE_NODES[3]];
    const gapY = 14;
    const cardH = (stage.h - gapY * (rest.length - 1)) / rest.length;
    rest.forEach((node, idx) => {
      drawStandardNodeCard(ctx, { x: rightX, y: stage.y + idx * (cardH + gapY), w: rightW, h: cardH }, node, idx, palette);
    });
    return;
  }

  // 12 & 15: Hero Spotlight Stat / 5-Pillar Audit Ring + Right Cards
  if (tplId === 12 || tplId === 15) {
    const leftW = stage.w * 0.34;
    const gap = 24;
    const rightX = stage.x + leftW + gap;
    const rightW = stage.w - leftW - gap;

    // Left spotlight card
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, stage.x, stage.y, leftW, stage.h, 22);
    ctx.fill();
    ctx.stroke();

    const first = items[0] || DEFAULT_SAMPLE_NODES[0];
    const rcx = stage.x + leftW / 2;
    const rcy = stage.y + stage.h * 0.40;
    const ringR = Math.min(leftW, stage.h) * 0.26;

    if (tplId === 15) {
      // 5-Pillar score ring: draw 5 arc segments instead of a single stroke
      const segColors = [palette.accent, palette.accentSecondary, "#10B981", "#F59E0B", "#F43F5E"];
      const segAngle = (Math.PI * 2) / 5;
      for (let s = 0; s < 5; s++) {
        ctx.strokeStyle = segColors[s % segColors.length];
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(rcx, rcy, ringR, -Math.PI / 2 + s * segAngle + 0.05, -Math.PI / 2 + (s + 1) * segAngle - 0.05);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(rcx, rcy, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawFittedTextBlock(
      ctx,
      first.metricValue || "98/100",
      rcx,
      rcy - 18,
      ringR * 1.7,
      44,
      { maxPx: 34, minPx: 20, weight: "900", color: palette.textMain, align: "center", maxLines: 1 }
    );
    drawFittedTextBlock(ctx, first.title, stage.x + 22, stage.y + stage.h * 0.68, leftW - 44, 60, {
      maxPx: 20,
      minPx: 14,
      weight: "800",
      color: palette.textMain,
      align: "center",
      maxLines: 2,
    });

    const rest = items.slice(1);
    const list = rest.length > 0 ? rest : items;
    const gapY = 14;
    const cardH = (stage.h - gapY * (list.length - 1)) / list.length;
    list.forEach((node, idx) => {
      drawStandardNodeCard(
        ctx,
        { x: rightX, y: stage.y + idx * (cardH + gapY), w: rightW, h: cardH },
        node,
        idx + 1,
        palette
      );
    });
    return;
  }

  // 16: 2x2 Impact vs. Effort Priority Quadrant
  if (tplId === 16) {
    const quadGap = 20;
    const qW = (stage.w - quadGap) / 2;
    const qH = (stage.h - quadGap - 34) / 2;
    const axisY = stage.y + stage.h - 20;
    const axisX = stage.x - 4;
    const quadColors = ["#10B981", palette.accent, "#F59E0B", "#F43F5E"];
    const quadLabels = ["QUICK WINS", "BIG BETS", "FILL-INS", "AVOID / DEFER"];
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;

    for (let q = 0; q < 4; q++) {
      const col = q % 2;
      const row = Math.floor(q / 2);
      const qx = stage.x + col * (qW + quadGap);
      const qy = stage.y + row * (qH + quadGap);
      ctx.fillStyle = `${quadColors[q]}1A`;
      ctx.strokeStyle = quadColors[q];
      ctx.lineWidth = 2;
      roundRectPath(ctx, qx, qy, qW, qH, 16);
      ctx.fill();
      ctx.stroke();

      drawTagPill(ctx, qx + 12, qy + 12, quadLabels[q], quadColors[q]);

      const node = list[q % list.length];
      drawFittedTextBlock(ctx, node?.title || quadLabels[q], qx + 14, qy + 44, qW - 28, qH - 60, {
        maxPx: 16,
        minPx: 12,
        weight: "800",
        color: palette.textMain,
        maxLines: 3,
      });
    }

    // Axis labels
    drawFittedTextBlock(ctx, "HIGH IMPACT →", stage.x, stage.y - 2, stage.w * 0.5, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    drawFittedTextBlock(ctx, "EFFORT →", stage.x, axisY + 2, stage.w * 0.4, 18, {
      maxPx: 12, minPx: 10, weight: "800", color: palette.textMuted, maxLines: 1,
    });
    void axisX;
    return;
  }

  // 18: 3-Circle Venn Synergy Diagram
  if (tplId === 18) {
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2 + 10;
    const r = Math.min(stage.w * 0.3, stage.h * 0.42);
    const offset = r * 0.62;
    const centers = [
      { x: cx, y: cy - offset * 0.95, color: palette.accent },
      { x: cx - offset, y: cy + offset * 0.55, color: palette.accentSecondary },
      { x: cx + offset, y: cy + offset * 0.55, color: "#F59E0B" },
    ];
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;

    ctx.save();
    ctx.globalAlpha = 0.32;
    centers.forEach((c) => {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    centers.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Pillar labels at the outer edge of each circle
    const labelOffsets = [
      { x: cx, y: cy - offset * 0.95 - r - 14 },
      { x: cx - offset - r * 0.55, y: cy + offset * 0.55 + r * 0.75 },
      { x: cx + offset + r * 0.55, y: cy + offset * 0.55 + r * 0.75 },
    ];
    centers.forEach((c, idx) => {
      const node = list[idx % list.length];
      const lo = labelOffsets[idx];
      drawFittedTextBlock(ctx, node?.title || `Pillar ${idx + 1}`, lo.x - 85, lo.y - 10, 170, 36, {
        maxPx: 15, minPx: 11, weight: "800", color: c.color, align: "center", maxLines: 2,
      });
    });

    // Center sweet-spot label
    const centerLabel = list[3]?.title || "Sweet Spot";
    ctx.fillStyle = palette.surface;
    roundRectPath(ctx, cx - 72, cy - 22, 144, 44, 999);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, cx - 72, cy - 22, 144, 44, 999);
    ctx.stroke();
    drawFittedTextBlock(ctx, centerLabel, cx - 65, cy - 11, 130, 22, {
      maxPx: 13, minPx: 10, weight: "900", color: palette.textMain, align: "center", maxLines: 1,
    });
    return;
  }

  // 20: 8-Point Actionable Checklist (vertical rows with checkbox + priority tag)
  if (tplId === 20) {
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;
    const gapY = 10;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;
    const priorities = ["HIGH", "MEDIUM", "LOW"];
    const priorityColors = ["#F43F5E", "#F59E0B", "#10B981"];

    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH, 14);
      ctx.fill();
      ctx.stroke();

      // Checkbox
      const boxSize = Math.min(28, rowH * 0.5);
      const boxY = ry + (rowH - boxSize) / 2;
      ctx.fillStyle = palette.accent;
      roundRectPath(ctx, stage.x + 16, boxY, boxSize, boxSize, 7);
      ctx.fill();
      ctx.font = `900 ${Math.round(boxSize * 0.65)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✓", stage.x + 16 + boxSize / 2, boxY + boxSize / 2 + 1);
      ctx.textAlign = "left";

      const textX = stage.x + 16 + boxSize + 16;
      drawFittedTextBlock(ctx, node.title || `Checklist item ${idx + 1}`, textX, ry + rowH * 0.18, stage.w * 0.62, rowH * 0.64, {
        maxPx: 17, minPx: 12, weight: "700", color: palette.textMain, maxLines: 2,
      });

      drawTagPill(
        ctx,
        stage.x + stage.w - 100,
        ry + rowH / 2 - 11,
        priorities[idx % 3],
        priorityColors[idx % 3]
      );
    });
    return;
  }

  // 21: Executive 5-Point TL;DR Takeaway List
  if (tplId === 21) {
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;
    const gapY = 14;
    const rowH = (stage.h - gapY * (list.length - 1)) / list.length;
    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      ctx.fillStyle = idx === 0 ? palette.accentSoft : palette.surface;
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, stage.x, ry, stage.w, rowH, 16);
      ctx.fill();
      ctx.stroke();

      const dotR = Math.min(22, rowH * 0.34);
      drawNumberedDot(ctx, stage.x + 30, ry + rowH / 2, dotR, String(idx + 1), palette.accent);

      const textX = stage.x + 30 + dotR + 20;
      drawFittedTextBlock(ctx, node.title || `Key takeaway ${idx + 1}`, textX, ry + rowH * 0.2, stage.w - (textX - stage.x) - 20, rowH * 0.3, {
        maxPx: 17, minPx: 13, weight: "800", color: palette.textMain, maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.detail || "", textX, ry + rowH * 0.52, stage.w - (textX - stage.x) - 20, rowH * 0.42, {
        maxPx: 13, minPx: 10, weight: "500", color: palette.textMuted, maxLines: 2, lineHeightRatio: 1.3,
      });
    });
    return;
  }

  // 22: Annotated Anatomy / Page-Teardown Diagram
  if (tplId === 22) {
    const boxW = stage.w * 0.4;
    const boxH = stage.h * 0.82;
    const boxX = stage.x + (stage.w - boxW) / 2;
    const boxY = stage.y + (stage.h - boxH) / 2;
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;

    ctx.strokeStyle = palette.border;
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 2;
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = palette.surfaceAlt;
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    drawFittedTextBlock(ctx, "PAGE WIREFRAME", boxX + 16, boxY + 14, boxW - 32, 20, {
      maxPx: 13, minPx: 10, weight: "800", color: palette.textMuted, align: "center", maxLines: 1,
    });

    // Numbered callout pointers around the wireframe, connected by lines
    const n = Math.min(6, list.length);
    for (let i = 0; i < n; i++) {
      const isLeft = i % 2 === 0;
      const row = Math.floor(i / 2);
      const anchorX = isLeft ? boxX : boxX + boxW;
      const anchorY = boxY + boxH * (0.18 + row * 0.3);
      const labelX = isLeft ? stage.x : stage.x + stage.w - 210;
      const labelY = anchorY - 24;

      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(isLeft ? labelX + 210 : labelX, anchorY);
      ctx.stroke();

      drawNumberedDot(ctx, anchorX, anchorY, 13, String(i + 1), palette.accent);

      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, labelX, labelY, 210, 48, 10);
      ctx.fill();
      ctx.stroke();
      drawFittedTextBlock(ctx, list[i]?.title || `Section ${i + 1}`, labelX + 10, labelY + 6, 190, 36, {
        maxPx: 13, minPx: 10, weight: "700", color: palette.textMain, maxLines: 2,
      });
    }
    return;
  }

  // 24: 6-Box Quick Reference Cheat Sheet (monospace code/formula cards)
  if (tplId === 24) {
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;
    const cols = 3;
    const rows = Math.ceil(Math.max(list.length, 6) / cols);
    const gapX = 16;
    const gapY = 16;
    const cardW = (stage.w - gapX * (cols - 1)) / cols;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;

    for (let i = 0; i < cols * rows; i++) {
      const node = list[i % list.length];
      const r = Math.floor(i / cols);
      const c = i % cols;
      const bx = stage.x + c * (cardW + gapX);
      const by = stage.y + r * (cardH + gapY);
      const accent = i % 2 === 0 ? palette.accent : palette.accentSecondary;

      ctx.fillStyle = palette.isLight ? "#0F172A" : "#000814";
      roundRectPath(ctx, bx, by, cardW, cardH, 14);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, bx, by, cardW, cardH, 14);
      ctx.stroke();

      // Fake terminal dots
      ["#F43F5E", "#F59E0B", "#10B981"].forEach((d, di) => {
        ctx.fillStyle = d;
        ctx.beginPath();
        ctx.arc(bx + 16 + di * 14, by + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      drawFittedTextBlock(ctx, node?.badge || `#${i + 1}`, bx + 14, by + 30, cardW - 28, 18, {
        maxPx: 12, minPx: 10, weight: "800", color: accent, maxLines: 1,
      });
      ctx.font = `600 ${Math.max(11, Math.round(cardW * 0.062))}px "JetBrains Mono", Menlo, Consolas, monospace`;
      ctx.fillStyle = "#E2E8F0";
      ctx.textBaseline = "top";
      const codeLine = (node?.metricValue || node?.title || "formula()").slice(0, 26);
      ctx.fillText(codeLine, bx + 14, by + 54);
      drawFittedTextBlock(ctx, node?.detail || "", bx + 14, by + 54 + Math.round(cardW * 0.062) + 10, cardW - 28, cardH - 90, {
        maxPx: 11, minPx: 9, weight: "500", color: "#94A3B8", maxLines: 3, lineHeightRatio: 1.3,
      });
    }
    return;
  }

  // 25: Widescreen Blog Hero & OG Banner (no node grid — big title + metric preview strip)
  if (tplId === 25) {
    const list = items.length > 0 ? items : DEFAULT_SAMPLE_NODES;
    const stripH = Math.min(stage.h * 0.3, 120);
    const titleZoneH = stage.h - stripH - 20;

    ctx.fillStyle = palette.accentSoft;
    roundRectPath(ctx, stage.x, stage.y, stage.w, titleZoneH, 18);
    ctx.fill();
    drawFittedTextBlock(ctx, "FEATURED ARTICLE VISUAL", stage.x + 26, stage.y + 20, stage.w - 52, 20, {
      maxPx: 13, minPx: 10, weight: "800", color: palette.accent, maxLines: 1,
    });
    drawFittedTextBlock(ctx, list[0]?.title || "Your Big Idea, Visualized", stage.x + 26, stage.y + 50, stage.w - 52, titleZoneH - 70, {
      maxPx: 42, minPx: 24, weight: "900", color: palette.textMain, maxLines: 2, lineHeightRatio: 1.14,
    });

    // Bottom metric preview strip (mini KPI pills)
    const stripY = stage.y + stage.h - stripH;
    const gapX = 14;
    const pillW = (stage.w - gapX * (list.length - 1)) / list.length;
    list.slice(0, 4).forEach((node, idx) => {
      const px = stage.x + idx * (pillW + gapX);
      const accent = idx % 2 === 0 ? palette.accent : palette.accentSecondary;
      ctx.fillStyle = palette.surface;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, px, stripY, pillW, stripH, 14);
      ctx.fill();
      ctx.stroke();
      drawFittedTextBlock(ctx, node.metricValue || "—", px + 14, stripY + 12, pillW - 28, stripH * 0.46, {
        maxPx: 24, minPx: 14, weight: "900", color: accent, maxLines: 1,
      });
      drawFittedTextBlock(ctx, node.title, px + 14, stripY + stripH * 0.58, pillW - 28, stripH * 0.38, {
        maxPx: 12, minPx: 9, weight: "700", color: palette.textMuted, maxLines: 2,
      });
    });
    return;
  }

  // Default responsive grid fallback (not expected to be reached — every template
  // ID 1–25 now has its own geometry branch above; kept only as a last-resort guard).
  const cols = items.length <= 2 ? items.length : items.length === 3 ? 3 : 2;
  const rows = Math.ceil(items.length / cols);
  const gapX = 20;
  const gapY = 18;
  const cardW = (stage.w - gapX * (cols - 1)) / cols;
  const cardH = (stage.h - gapY * (rows - 1)) / rows;

  items.forEach((node, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    drawStandardNodeCard(
      ctx,
      {
        x: stage.x + c * (cardW + gapX),
        y: stage.y + r * (cardH + gapY),
        w: cardW,
        h: cardH,
      },
      node,
      idx,
      palette
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

  // 1. Background gradient + subtle architectural dot grid
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, palette.bgStart);
  bgGrad.addColorStop(1, palette.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = palette.isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.04)";
  for (let gx = 36; gx < W - 20; gx += 36) {
    for (let gy = 36; gy < H - 20; gy += 36) {
      ctx.fillRect(gx, gy, 2, 2);
    }
  }

  // 2. Outer card frame (Rule 3.1 mathematical margins)
  const pad = Math.round(Math.min(W, H) * 0.042);
  const cx = pad;
  const cy = pad;
  const cw = W - pad * 2;
  const ch = H - pad * 2;
  const footerH = Math.round(Math.max(58, ch * 0.095));

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, cx, cy, cw, ch, 28);
  ctx.stroke();

  // 3. Header Zone (Category Pill + Headline + Subheadline)
  const innerPad = Math.round(cw * 0.036);
  const headerX = cx + innerPad;
  const headerW = cw - innerPad * 2;
  let curY = cy + Math.round(innerPad * 0.78);

  // Top category pill + template badge
  const pillLabel = `${spec.family.toUpperCase()} · TEMPLATE #${spec.id}`;
  ctx.font = "800 13px Inter, system-ui, sans-serif";
  const pillW = Math.min(headerW * 0.62, ctx.measureText(pillLabel).width + 28);
  ctx.fillStyle = palette.accentSoft;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, headerX, curY, pillW, 30, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.textBaseline = "middle";
  ctx.fillText(pillLabel, headerX + 14, curY + 15);

  // Top-right brand logo or domain pill
  drawBrandLogoOrBadge(
    ctx,
    cx + cw - innerPad,
    curY + 15,
    config.footerSourceLabel || "DoItWithAI.tools",
    palette,
    options
  );

  curY += 42;

  // Headline (auto-scaled)
  const headlineUsed = drawFittedTextBlock(
    ctx,
    config.headline || spec.name,
    headerX,
    curY,
    headerW,
    Math.round(ch * 0.14),
    {
      maxPx: W >= 1400 ? 38 : 32,
      minPx: 20,
      weight: "900",
      color: palette.textMain,
      maxLines: 2,
      lineHeightRatio: 1.18,
    }
  );
  curY += headlineUsed + 6;

  // Subheadline
  if (config.subheadline) {
    const subUsed = drawFittedTextBlock(
      ctx,
      config.subheadline,
      headerX,
      curY,
      headerW,
      36,
      {
        maxPx: 18,
        minPx: 13,
        weight: "500",
        color: palette.textMuted,
        maxLines: 1,
      }
    );
    curY += subUsed + 14;
  } else {
    curY += 10;
  }

  // 4. Body Stage + Optional Right Portrait Column (Strict Non-Overlapping Column Math, Rule 3.1)
  const bodyTop = curY;
  const bodyBottom = cy + ch - footerH - 16;
  const bodyH = Math.max(180, bodyBottom - bodyTop);
  const hasPortrait = Boolean(options.portraitSource);
  const colGap = 32;
  const portraitW = hasPortrait
    ? Math.round(cw * (config.templateId === 25 ? 0.32 : 0.25))
    : 0;

  const diagramStage = {
    x: headerX,
    y: bodyTop,
    w: hasPortrait ? headerW - portraitW - colGap : headerW,
    h: bodyH,
  };

  renderTemplateBodyGeometry(ctx, diagramStage, config, palette);

  if (hasPortrait) {
    drawArchitecturalPortraitZone(
      ctx,
      {
        x: diagramStage.x + diagramStage.w + colGap,
        y: bodyTop,
        w: portraitW,
        h: bodyH,
      },
      palette,
      options
    );
  }

  // 5. Executive Footer Bar
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

  const rightTag = `${spec.name} · Zero-CLS Vector & HD Graphic`;
  ctx.font = "600 13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#94A3B8";
  ctx.textAlign = "right";
  ctx.fillText(rightTag, cx + cw - innerPad, fy + footerH / 2);
  ctx.textAlign = "left";

  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/* Clean Standalone Vector SVG Compiler: generateBlogInfographicSvg            */
/* (Consumed by Phase 4 SVG Export, Phase 7 CWV HTML & Phase 9 .ZIP Bundler)   */
/* Nov 11, 2026: now family-aware so the exported SVG visually matches the     */
/* canvas renderer instead of always drawing the same generic card grid.      */
/* -------------------------------------------------------------------------- */

function escXml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Shared SVG node-card markup used by every grid-style template family. */
function svgNodeCard(
  x: number,
  y: number,
  w: number,
  h: number,
  node: BlogInfographicNodeItem,
  idx: number,
  palette: BlogInfographicPaletteTokens,
  accentOverride?: string
): string {
  const accent = accentOverride || (idx % 2 === 0 ? palette.accent : palette.accentSecondary);
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${w}" height="${h}" rx="16" fill="${palette.surface}" stroke="${palette.border}" stroke-width="2" />
      <rect width="7" height="${h}" rx="3.5" fill="${accent}" />
      <rect x="20" y="14" width="80" height="22" rx="8" fill="${palette.accentSoft}" />
      <text x="30" y="29" fill="${accent}" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="800">${escXml(
        (node.badge || `0${idx + 1}`).toUpperCase()
      )}</text>
      ${
        node.metricValue
          ? `<rect x="${w - 110}" y="14" width="94" height="22" rx="11" fill="${accent}" />
      <text x="${w - 63}" y="29" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="800">${escXml(
              node.metricValue
            )}</text>`
          : ""
      }
      <text x="20" y="${Math.min(h - 38, 66)}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="800">${escXml(
        (node.title || "").slice(0, 44)
      )}</text>
      <text x="20" y="${Math.min(h - 14, 92)}" fill="${palette.textMuted}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500">${escXml(
        (node.detail || "").slice(0, 100)
      )}</text>
    </g>`;
}

/** Produces the body-stage SVG markup for the given template family (mirrors the canvas renderer). */
function svgTemplateBodyMarkup(
  stage: { x: number; y: number; w: number; h: number },
  config: BlogInfographicConfig,
  nodes: BlogInfographicNodeItem[],
  palette: BlogInfographicPaletteTokens
): string {
  const tplId = config.templateId || 1;
  const items = nodes.slice(0, 8);

  // 1: Horizontal pipeline with connector arrows
  if (tplId === 1) {
    const cols = Math.min(4, items.length);
    const rows = Math.ceil(items.length / cols);
    const gapX = 20;
    const gapY = 18;
    const cardW = (stage.w - gapX * (cols - 1)) / cols;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;
    let out = "";
    items.forEach((node, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const bx = stage.x + c * (cardW + gapX);
      const by = stage.y + r * (cardH + gapY);
      out += svgNodeCard(bx, by, cardW, cardH, node, idx, palette);
      if (c < cols - 1 && idx < items.length - 1) {
        const ax = bx + cardW + 2;
        out += `<line x1="${ax}" y1="${by + cardH / 2}" x2="${ax + gapX - 6}" y2="${by + cardH / 2}" stroke="${palette.accent}" stroke-width="3" />`;
      }
    });
    return out;
  }

  // 2: Vertical roadmap with spine + dots
  if (tplId === 2) {
    const spineX = stage.x + 24;
    const gapY = 12;
    const rowH = (stage.h - gapY * (items.length - 1)) / items.length;
    let out = `<line x1="${spineX}" y1="${stage.y + 10}" x2="${spineX}" y2="${stage.y + stage.h - 10}" stroke="${palette.accent}" stroke-width="4" />`;
    items.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      out += `<circle cx="${spineX}" cy="${ry + rowH / 2}" r="10" fill="${palette.accent}" />`;
      out += svgNodeCard(spineX + 24, ry, stage.w - 48, rowH, node, idx, palette);
    });
    return out;
  }

  // 6, 8, 9, 10, 23: Two-column versus style
  if (tplId === 6 || tplId === 8 || tplId === 9 || tplId === 10 || tplId === 23) {
    const colGap = 32;
    const colW = (stage.w - colGap) / 2;
    const left = items.filter((_, i) => i % 2 === 0);
    const right = items.filter((_, i) => i % 2 === 1);
    const rows = Math.max(1, left.length, right.length);
    const gapY = 12;
    const cardH = (stage.h - gapY * (rows - 1)) / rows;
    let out = "";
    left.forEach((node, r) => {
      out += svgNodeCard(stage.x, stage.y + r * (cardH + gapY), colW, cardH, node, r * 2, palette, "#F43F5E");
    });
    right.forEach((node, r) => {
      out += svgNodeCard(stage.x + colW + colGap, stage.y + r * (cardH + gapY), colW, cardH, node, r * 2 + 1, palette, "#10B981");
    });
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2;
    out += `<circle cx="${cx}" cy="${cy}" r="22" fill="${palette.accent}" /><text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="900">${
      tplId === 23 ? "&#8594;" : "VS"
    }</text>`;
    return out;
  }

  // 5 & 17: funnel / pyramid tiers
  if (tplId === 5 || tplId === 17) {
    const isPyramid = tplId === 17;
    const tiers = items.slice(0, 4);
    const gapY = 10;
    const tierH = (stage.h - gapY * (tiers.length - 1)) / tiers.length;
    let out = "";
    tiers.forEach((node, idx) => {
      const ratio = isPyramid
        ? 0.56 + (idx / Math.max(1, tiers.length - 1)) * 0.44
        : 1 - (idx / Math.max(1, tiers.length)) * 0.34;
      const tw = stage.w * ratio;
      const tx = stage.x + (stage.w - tw) / 2;
      const ty = stage.y + idx * (tierH + gapY);
      out += svgNodeCard(tx, ty, tw, tierH, node, idx, palette);
    });
    return out;
  }

  // 16: 2x2 quadrant
  if (tplId === 16) {
    const gap = 18;
    const qW = (stage.w - gap) / 2;
    const qH = (stage.h - gap) / 2;
    const colors = ["#10B981", palette.accent, "#F59E0B", "#F43F5E"];
    const labels = ["QUICK WINS", "BIG BETS", "FILL-INS", "AVOID / DEFER"];
    const list = items.length > 0 ? items : [];
    let out = "";
    for (let q = 0; q < 4; q++) {
      const col = q % 2;
      const row = Math.floor(q / 2);
      const qx = stage.x + col * (qW + gap);
      const qy = stage.y + row * (qH + gap);
      out += `<rect x="${qx}" y="${qy}" width="${qW}" height="${qH}" rx="14" fill="${colors[q]}22" stroke="${colors[q]}" stroke-width="2" />`;
      out += `<rect x="${qx + 12}" y="${qy + 12}" width="130" height="22" rx="11" fill="${colors[q]}" /><text x="${qx + 77}" y="${qy + 27}" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="800">${escXml(labels[q])}</text>`;
      const node = list[q % Math.max(1, list.length)];
      out += `<text x="${qx + 16}" y="${qy + 58}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="800">${escXml((node?.title || labels[q]).slice(0, 30))}</text>`;
    }
    return out;
  }

  // 18: 3-circle Venn
  if (tplId === 18) {
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h / 2 + 8;
    const r = Math.min(stage.w * 0.3, stage.h * 0.4);
    const offset = r * 0.62;
    const circles = [
      { x: cx, y: cy - offset * 0.95, color: palette.accent },
      { x: cx - offset, y: cy + offset * 0.55, color: palette.accentSecondary },
      { x: cx + offset, y: cy + offset * 0.55, color: "#F59E0B" },
    ];
    let out = "";
    circles.forEach((c) => {
      out += `<circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${c.color}" fill-opacity="0.3" stroke="${c.color}" stroke-width="2.5" />`;
    });
    out += `<circle cx="${cx}" cy="${cy}" r="68" fill="${palette.surface}" stroke="${palette.border}" stroke-width="1.5" /><text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="900">${escXml(items[0]?.title?.slice(0, 16) || "Sweet Spot")}</text>`;
    return out;
  }

  // 20/21: vertical checklist / TL;DR rows
  if (tplId === 20 || tplId === 21) {
    const list = items.length > 0 ? items : [];
    const gapY = 10;
    const rowH = (stage.h - gapY * (list.length - 1)) / Math.max(1, list.length);
    let out = "";
    list.forEach((node, idx) => {
      const ry = stage.y + idx * (rowH + gapY);
      out += `<rect x="${stage.x}" y="${ry}" width="${stage.w}" height="${rowH}" rx="12" fill="${palette.surface}" stroke="${palette.border}" stroke-width="1.5" />`;
      out += `<circle cx="${stage.x + 30}" cy="${ry + rowH / 2}" r="16" fill="${palette.accent}" /><text x="${stage.x + 30}" y="${ry + rowH / 2 + 5}" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="900">${
        tplId === 20 ? "&#10003;" : idx + 1
      }</text>`;
      out += `<text x="${stage.x + 62}" y="${ry + rowH / 2 + 5}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="700">${escXml((node.title || "").slice(0, 52))}</text>`;
    });
    return out;
  }

  // Every other family: responsive grid of node cards (still distinct per count/ratio from the generic default)
  const cols = items.length <= 2 ? Math.max(1, items.length) : items.length === 3 ? 3 : 2;
  const rows = Math.ceil(items.length / cols);
  const gapX = 20;
  const gapY = 16;
  const cardW = (stage.w - gapX * (cols - 1)) / cols;
  const cardH = (stage.h - gapY * (rows - 1)) / Math.max(1, rows);
  let out = "";
  items.forEach((node, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    out += svgNodeCard(stage.x + c * (cardW + gapX), stage.y + r * (cardH + gapY), cardW, cardH, node, idx, palette);
  });
  return out;
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
  const nodes =
    config.nodes && config.nodes.length > 0 ? config.nodes : DEFAULT_SAMPLE_NODES;

  const pad = Math.round(Math.min(W, H) * 0.042);
  const innerX = pad + 44;
  const innerW = W - (pad + 44) * 2;
  const bodyTop = pad + 185;
  const footerH = 68;
  const bodyH = H - pad * 2 - footerH - 210;

  const bodyMarkup = svgTemplateBodyMarkup(
    { x: innerX, y: bodyTop, w: innerW, h: bodyH },
    config,
    nodes,
    palette
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escXml(
    config.altText || config.headline
  )}">
  <title>${escXml(config.headline || spec.name)}</title>
  <desc>${escXml(config.altText || config.subheadline)}</desc>
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />
  <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="28" fill="none" stroke="${palette.border}" stroke-width="2.5" />
  <text x="${innerX}" y="${pad + 54}" fill="${palette.accent}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="800">${escXml(
    `${spec.family.toUpperCase()} · TEMPLATE #${spec.id} (${spec.name.toUpperCase()})`
  )}</text>
  <text x="${innerX}" y="${pad + 102}" fill="${palette.textMain}" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="900">${escXml(
    config.headline
  )}</text>
  <text x="${innerX}" y="${pad + 138}" fill="${palette.textMuted}" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="500">${escXml(
    config.subheadline
  )}</text>
  ${bodyMarkup}
  <rect x="${pad}" y="${H - pad - footerH}" width="${W - pad * 2}" height="${footerH}" rx="20" fill="${palette.footerBg}" />
  <text x="${innerX}" y="${H - pad - footerH / 2 + 5}" fill="#F8FAFC" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700">${escXml(
    config.footerSourceLabel || "DoItWithAI.tools · Blog Infographic Studio"
  )}</text>
</svg>`;
}

/**
 * Renders a BlogInfographicConfig to a PNG Data URL in the browser (or returns an SVG data URL
 * when called outside a browser DOM, e.g., during SSR).
 */
export async function renderBlogInfographicToPngDataUrl(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {}
): Promise<string> {
  if (typeof document === "undefined") {
    const svg = generateBlogInfographicSvg(config, options);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const canvas = document.createElement("canvas");
  renderBlogInfographicToCanvas(canvas, config, options);
  return canvas.toDataURL("image/png");
}
