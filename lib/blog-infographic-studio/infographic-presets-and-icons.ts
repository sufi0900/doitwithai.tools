/**
 * Venngage / Canva-Grade Infographic Presets, AI Art Plate Loader & Vector Icon Primitives
 * File: lib/blog-infographic-studio/infographic-presets-and-icons.ts
 *
 * Provides:
 *  - 20 crisp geometric Canvas & SVG vector icons (Rocket, Gear, Chart, Target, Shield, etc.)
 *  - Preloader & cache for the 5 high-resolution AI-generated text-free Infographic Art Plates
 *  - Distinct, domain-realistic Curated Showcase Data for all 25 Infographic Templates
 *  - 6 Quick-Start Scenario Presets for 1-click studio testing
 */

import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicBackdropStyle,
  InfographicIconId,
} from "@/lib/blog-writer/canonical-state";

export interface InfographicArtPlateSpec {
  id: string;
  label: string;
  src: string;
  isLight: boolean;
  recommendedPalettes: BlogInfographicConfig["paletteId"][];
}

export const INFOGRAPHIC_ART_PLATES: Record<string, InfographicArtPlateSpec> = {
  "obsidian-glass-orbs": {
    id: "obsidian-glass-orbs",
    label: "3D Glassmorphic Data Orbs (Dark)",
    src: "/images/infographics/obsidian-glass-orbs.jpg",
    isLight: false,
    recommendedPalettes: ["cyan-tech", "amber-executive"],
  },
  "royal-indigo-isometric": {
    id: "royal-indigo-isometric",
    label: "Royal Indigo Isometric Circuit (Dark)",
    src: "/images/infographics/royal-indigo-isometric.jpg",
    isLight: false,
    recommendedPalettes: ["indigo-cyber", "violet-saas"],
  },
  "editorial-warm-paper": {
    id: "editorial-warm-paper",
    label: "Editorial Paper Arches & Botanicals (Light)",
    src: "/images/infographics/editorial-warm-paper.jpg",
    isLight: true,
    recommendedPalettes: ["rose-editorial", "slate-minimal", "blue-trust"],
  },
  "emerald-data-waves": {
    id: "emerald-data-waves",
    label: "Emerald & Gold 3D Data Waves (Dark)",
    src: "/images/infographics/emerald-data-waves.jpg",
    isLight: false,
    recommendedPalettes: ["emerald-growth"],
  },
  "paper-sculpture": {
    id: "paper-sculpture",
    label: "Architectural Paper Sculpture (Light)",
    src: "/visual-studio/paper-sculpture.webp",
    isLight: true,
    recommendedPalettes: ["slate-minimal", "blue-trust"],
  },
};

const plateImageCache: Record<string, HTMLImageElement> = {};
const plateLoadListeners = new Set<() => void>();
let platesPreloadStarted = false;

export function preloadInfographicArtPlates(
  onPlateLoaded?: () => void
): Record<string, HTMLImageElement> {
  if (typeof window === "undefined") return plateImageCache;
  if (onPlateLoaded) {
    plateLoadListeners.add(onPlateLoaded);
  }
  if (!platesPreloadStarted) {
    platesPreloadStarted = true;
    Object.values(INFOGRAPHIC_ART_PLATES).forEach((spec) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        plateImageCache[spec.id] = img;
        plateLoadListeners.forEach((cb) => {
          try {
            cb();
          } catch {
            // ignore listener error
          }
        });
      };
      img.src = spec.src;
    });
  }
  return plateImageCache;
}

export function getArtPlateForPalette(
  paletteId: BlogInfographicConfig["paletteId"],
  templateId?: number
): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  if (Object.keys(plateImageCache).length === 0) {
    preloadInfographicArtPlates();
  }
  if (paletteId === "emerald-growth") {
    return plateImageCache["emerald-data-waves"] || null;
  }
  if (paletteId === "cyan-tech" || paletteId === "amber-executive" || templateId === 11) {
    return plateImageCache["obsidian-glass-orbs"] || null;
  }
  if (paletteId === "rose-editorial") {
    return plateImageCache["editorial-warm-paper"] || null;
  }
  if (paletteId === "slate-minimal" || paletteId === "blue-trust") {
    return (
      plateImageCache[
        templateId && templateId % 2 === 0
          ? "paper-sculpture"
          : "editorial-warm-paper"
      ] || null
    );
  }
  return plateImageCache["royal-indigo-isometric"] || null;
}

export const INFOGRAPHIC_ICON_OPTIONS: {
  id: InfographicIconId;
  label: string;
}[] = [
  { id: "auto", label: "✨ Auto Icon" },
  { id: "rocket", label: "🚀 Rocket / Launch" },
  { id: "gear", label: "⚙️ Gear / System" },
  { id: "chart", label: "📊 Bar Chart / KPI" },
  { id: "target", label: "🎯 Target / Goal" },
  { id: "shield", label: "🛡️ Shield / Trust" },
  { id: "bolt", label: "⚡ Bolt / Speed" },
  { id: "trophy", label: "🏆 Trophy / Winner" },
  { id: "layers", label: "📚 Layers / Stack" },
  { id: "database", label: "🗄️ Data / Storage" },
  { id: "users", label: "👥 Users / Team" },
  { id: "globe", label: "🌐 Globe / Scale" },
  { id: "sparkles", label: "✨ AI Sparkles" },
  { id: "check", label: "✅ Verified Check" },
  { id: "scale", label: "⚖️ Versus / Balance" },
  { id: "clock", label: "⏱️ Timeline / Clock" },
  { id: "lightbulb", label: "💡 Idea / Strategy" },
  { id: "cpu", label: "🧠 AI Chip / Engine" },
  { id: "funnel", label: "🔻 Funnel / Filter" },
  { id: "code", label: "💻 Code / Schema" },
  { id: "trending", label: "📈 Growth Trend" },
];

const DEFAULT_ICON_ROTATION: Exclude<InfographicIconId, "auto">[] = [
  "target",
  "gear",
  "chart",
  "rocket",
  "shield",
  "bolt",
  "trophy",
  "layers",
  "lightbulb",
  "trending",
  "cpu",
  "globe",
];

export function resolveNodeIconId(
  node: BlogInfographicNodeItem,
  index: number,
  templateId = 1
): Exclude<InfographicIconId, "auto"> {
  if (node.iconId && node.iconId !== "auto") {
    return node.iconId;
  }
  const text = `${node.badge || ""} ${node.title || ""} ${node.detail || ""}`.toLowerCase();
  if (/gear|mindset|system|autom|engine|process/.test(text)) return "gear";
  if (/launch|rocket|ship|deploy|start|fast/.test(text)) return "rocket";
  if (/chart|kpi|stat|revenue|roi|metric|bench|score|\$|%/.test(text)) return "chart";
  if (/target|goal|intent|focus|objective|aeo/.test(text)) return "target";
  if (/shield|sec|trust|eeat|safe|audit|verify/.test(text)) return "shield";
  if (/speed|cwv|lcp|bolt|instant|ms|quick/.test(text)) return "bolt";
  if (/win|best|trophy|rank|top|#1|award/.test(text)) return "trophy";
  if (/layer|cluster|stack|tier|pyramid|pillar/.test(text)) return "layers";
  if (/data|db|storage|index|source|cite/.test(text)) return "database";
  if (/user|customer|buyer|team|client|audience/.test(text)) return "users";
  if (/web|globe|domain|url|serp|global/.test(text)) return "globe";
  if (/ai|llm|gpt|gemini|claude|prompt|spark/.test(text)) return "sparkles";
  if (/check|do|pass|done|ready|true|fact/.test(text)) return "check";
  if (/vs|versus|compare|balance|cost|price/.test(text)) return "scale";
  if (/time|year|ce|bce|history|phase|step|hour/.test(text)) return "clock";
  if (/idea|tip|strategy|insight|must|learn/.test(text)) return "lightbulb";
  if (/code|json|schema|html|svg|tag|script/.test(text)) return "code";
  if (/grow|trend|scale|lift|conversion| traffic/.test(text)) return "trending";
  if (templateId === 3) {
    const gearCycle: Exclude<InfographicIconId, "auto">[] = [
      "gear",
      "sparkles",
      "shield",
      "target",
      "trophy",
    ];
    return gearCycle[index % gearCycle.length];
  }
  return DEFAULT_ICON_ROTATION[(index + templateId) % DEFAULT_ICON_ROTATION.length];
}

/**
 * Draws a crisp vector icon centered at (cx, cy) on an HTML5 Canvas.
 */
export function drawCanvasVectorIcon(
  ctx: CanvasRenderingContext2D,
  iconId: Exclude<InfographicIconId, "auto">,
  cx: number,
  cy: number,
  size: number,
  color = "#FFFFFF"
): void {
  const r = size * 0.46;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.095);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (iconId) {
    case "gear": {
      const teeth = 8;
      const outerR = r * 0.95;
      const baseR = r * 0.68;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        ctx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
        ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "chart": {
      const bw = r * 0.34;
      const gap = r * 0.16;
      const startX = cx - bw * 1.5 - gap;
      const baseY = cy + r * 0.72;
      const heights = [r * 0.65, r * 1.05, r * 1.42];
      heights.forEach((h, i) => {
        const bx = startX + i * (bw + gap);
        ctx.fillRect(bx, baseY - h, bw, h);
      });
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.85, baseY);
      ctx.lineTo(cx + r * 0.85, baseY);
      ctx.stroke();
      break;
    }
    case "target": {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "shield": {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.92);
      ctx.lineTo(cx + r * 0.78, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.68, cy + r * 0.22);
      ctx.quadraticCurveTo(cx, cy + r * 0.95, cx, cy + r * 0.95);
      ctx.quadraticCurveTo(cx, cy + r * 0.95, cx - r * 0.68, cy + r * 0.22);
      ctx.lineTo(cx - r * 0.78, cy - r * 0.55);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.28, cy + r * 0.02);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.26);
      ctx.lineTo(cx + r * 0.34, cy - r * 0.18);
      ctx.stroke();
      break;
    }
    case "bolt": {
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.12, cy - r * 0.95);
      ctx.lineTo(cx - r * 0.58, cy + r * 0.08);
      ctx.lineTo(cx - r * 0.04, cy + r * 0.08);
      ctx.lineTo(cx - r * 0.18, cy + r * 0.95);
      ctx.lineTo(cx + r * 0.62, cy - r * 0.12);
      ctx.lineTo(cx + r * 0.06, cy - r * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "trophy": {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.78);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.78);
      ctx.lineTo(cx + r * 0.42, cy - r * 0.05);
      ctx.quadraticCurveTo(cx, cy + r * 0.35, cx - r * 0.42, cy - r * 0.05);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.22);
      ctx.lineTo(cx, cy + r * 0.75);
      ctx.moveTo(cx - r * 0.45, cy + r * 0.75);
      ctx.lineTo(cx + r * 0.45, cy + r * 0.75);
      ctx.stroke();
      break;
    }
    case "layers": {
      const drawDiamond = (offY: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + offY - r * 0.38);
        ctx.lineTo(cx + r * 0.82, cy + offY);
        ctx.lineTo(cx, cy + offY + r * 0.38);
        ctx.lineTo(cx - r * 0.82, cy + offY);
        ctx.closePath();
        ctx.stroke();
      };
      drawDiamond(-r * 0.36);
      drawDiamond(0);
      drawDiamond(r * 0.36);
      break;
    }
    case "check": {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.38, cy + r * 0.02);
      ctx.lineTo(cx - r * 0.08, cy + r * 0.34);
      ctx.lineTo(cx + r * 0.44, cy - r * 0.26);
      ctx.stroke();
      break;
    }
    case "trending": {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.82, cy + r * 0.52);
      ctx.lineTo(cx - r * 0.22, cy - r * 0.08);
      ctx.lineTo(cx + r * 0.14, cy + r * 0.22);
      ctx.lineTo(cx + r * 0.78, cy - r * 0.48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.32, cy - r * 0.48);
      ctx.lineTo(cx + r * 0.78, cy - r * 0.48);
      ctx.lineTo(cx + r * 0.78, cy - r * 0.02);
      ctx.stroke();
      break;
    }
    case "clock": {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.48);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + r * 0.38, cy + r * 0.22);
      ctx.stroke();
      break;
    }
    case "lightbulb": {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.18, r * 0.56, Math.PI * 0.8, Math.PI * 0.2, false);
      ctx.lineTo(cx + r * 0.25, cy + r * 0.48);
      ctx.lineTo(cx - r * 0.25, cy + r * 0.48);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.22, cy + r * 0.72);
      ctx.lineTo(cx + r * 0.22, cy + r * 0.72);
      ctx.stroke();
      break;
    }
    case "sparkles": {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.92);
      ctx.quadraticCurveTo(cx, cy, cx + r * 0.92, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r * 0.92);
      ctx.quadraticCurveTo(cx, cy, cx - r * 0.92, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r * 0.92);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "rocket":
    default: {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.92);
      ctx.quadraticCurveTo(cx + r * 0.65, cy - r * 0.2, cx + r * 0.42, cy + r * 0.55);
      ctx.lineTo(cx - r * 0.42, cy + r * 0.55);
      ctx.quadraticCurveTo(cx - r * 0.65, cy - r * 0.2, cx, cy - r * 0.92);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.12, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.42, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.75, cy + r * 0.72);
      ctx.moveTo(cx + r * 0.42, cy + r * 0.35);
      ctx.lineTo(cx + r * 0.75, cy + r * 0.72);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

/**
 * Generates clean SVG vector icon markup centered at (cx, cy).
 */
export function svgVectorIconMarkup(
  iconId: Exclude<InfographicIconId, "auto">,
  cx: number,
  cy: number,
  size: number,
  color = "#FFFFFF"
): string {
  const r = Math.round(size * 0.44);
  const sw = Math.max(2, Math.round(size * 0.095));
  switch (iconId) {
    case "chart":
      return `<g fill="${color}"><rect x="${cx - r * 0.7}" y="${cy - r * 0.1}" width="${r * 0.36}" height="${r * 0.8}" rx="2"/><rect x="${cx - r * 0.18}" y="${cy - r * 0.45}" width="${r * 0.36}" height="${r * 1.15}" rx="2"/><rect x="${cx + r * 0.34}" y="${cy - r * 0.75}" width="${r * 0.36}" height="${r * 1.45}" rx="2"/></g>`;
    case "target":
      return `<g stroke="${color}" stroke-width="${sw}" fill="none"><circle cx="${cx}" cy="${cy}" r="${r * 0.88}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.48}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="${color}"/></g>`;
    case "check":
      return `<g stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="${cx}" cy="${cy}" r="${r * 0.88}"/><polyline points="${cx - r * 0.36},${cy} ${cx - r * 0.08},${cy + r * 0.32} ${cx + r * 0.42},${cy - r * 0.26}"/></g>`;
    case "gear":
      return `<g stroke="${color}" stroke-width="${sw}" fill="none"><circle cx="${cx}" cy="${cy}" r="${r * 0.68}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="${color}"/><line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy - r * 0.68}"/><line x1="${cx}" y1="${cy + r * 0.68}" x2="${cx}" y2="${cy + r}"/><line x1="${cx - r}" y1="${cy}" x2="${cx - r * 0.68}" y2="${cy}"/><line x1="${cx + r * 0.68}" y1="${cy}" x2="${cx + r}" y2="${cy}"/></g>`;
    default:
      return `<g stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${r * 0.78}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.25}" fill="${color}"/></g>`;
  }
}

export interface CuratedTemplateShowcaseEntry {
  paletteId: BlogInfographicConfig["paletteId"];
  backdropStyle: InfographicBackdropStyle;
  headline: string;
  subheadline: string;
  nodes: BlogInfographicNodeItem[];
}

export const TEMPLATE_CURATED_SHOWCASE_DATA: Record<
  number,
  CuratedTemplateShowcaseEntry
> = {
  1: {
    paletteId: "blue-trust",
    backdropStyle: "ai-art-plate",
    headline: "Five Essential Strategies for Achieving Organic SEO Growth",
    subheadline: "Chevron process pipeline · 5 sequential execution pillars with KPI benchmarks",
    nodes: [
      { id: "t1-1", badge: "01", title: "Intent & Entity Mapping", detail: "Cluster primary search queries with semantic LSI entities before drafting.", metricValue: "<10ms", iconId: "target" },
      { id: "t1-2", badge: "02", title: "<580px Pixel-Safe Meta", detail: "Verify desktop & mobile SERP title width to prevent truncation.", metricValue: "512px", iconId: "shield" },
      { id: "t1-3", badge: "03", title: "Visual H2 Infographics", detail: "Embed structured diagrams under every H2 to double reader dwell time.", metricValue: "2.4x Dwell", iconId: "chart" },
      { id: "t1-4", badge: "04", title: "JSON-LD @graph Schema", detail: "Compile BlogPosting, HowTo, and FAQPage structured data automatically.", metricValue: "100 CWV", iconId: "code" },
      { id: "t1-5", badge: "05", title: "Omnichannel Distribution", detail: "Repurpose H2 visuals into LinkedIn carousels, pins, and newsletter cards.", metricValue: "+64% CTR", iconId: "rocket" },
    ],
  },
  2: {
    paletteId: "rose-editorial",
    backdropStyle: "ai-art-plate",
    headline: "Evolution of Search: From Keyword Stuffing to AI Citation Engines",
    subheadline: "Vertical milestone timeline · Alternating era callouts & icon medallions",
    nodes: [
      { id: "t2-1", badge: "2015 ERA", title: "Exact-Match Keyword Density", detail: "Early algorithms rewarded repetitive exact-match strings and thin directory links.", metricValue: "Legacy", iconId: "clock" },
      { id: "t2-2", badge: "2019 ERA", title: "BERT & Topical Authority Clusters", detail: "Natural language transformers shifted rankings toward pillar-and-cluster hubs.", metricValue: "Semantic", iconId: "layers" },
      { id: "t2-3", badge: "2023 ERA", title: "Helpful Content & E-E-A-T Proof", detail: "First-hand benchmarks, original charts, and verified citations became mandatory.", metricValue: "E-E-A-T", iconId: "shield" },
      { id: "t2-4", badge: "2026 ERA", title: "AI Overviews (AEO) & Visual Citations", detail: "50-word answer boxes + structured H2 infographics win LLM & SERP citations.", metricValue: "+38% AEO", iconId: "sparkles" },
    ],
  },
  3: {
    paletteId: "slate-minimal",
    backdropStyle: "ai-art-plate",
    headline: "How to Build a Compounding Content & Visual SEO Flywheel",
    subheadline: "Interlocking gears diagram · Connected mechanical system with top/bottom callouts",
    nodes: [
      { id: "t3-1", badge: "GEAR 01", title: "Intent Research", detail: "Uncover high-converting buyer questions and low-KD topic gaps.", metricValue: "Discovery", iconId: "target" },
      { id: "t3-2", badge: "GEAR 02", title: "Humanized Draft", detail: "Enforce sentence burstiness (σ ≥ 6.0) and original benchmark tables.", metricValue: "σ = 7.4", iconId: "sparkles" },
      { id: "t3-3", badge: "GEAR 03", title: "H2 Infographics", detail: "Convert complex paragraphs into crisp, shareable visual diagrams.", metricValue: "25 Layouts", iconId: "gear" },
      { id: "t3-4", badge: "GEAR 04", title: "Earned Backlinks", detail: "Other blogs embed your SVG/WebP diagrams with attribution links.", metricValue: "3.1x Links", iconId: "trophy" },
      { id: "t3-5", badge: "GEAR 05", title: "AI Citations", detail: "Google AI Overviews & Perplexity cite your structured answers.", metricValue: "#1 Rank", iconId: "trending" },
    ],
  },
  4: {
    paletteId: "slate-minimal",
    backdropStyle: "ai-art-plate",
    headline: "5 Brand & Visual Content Strategy Must-Haves for 2026",
    subheadline: "Winding S-curve roadmap · Numbered milestone medallions & illustrated badges",
    nodes: [
      { id: "t4-1", badge: "STEP 1", title: "Clear Entity & Brand Voice", detail: "Define your core topical authority entities and consistent visual identity.", metricValue: "Foundation", iconId: "lightbulb" },
      { id: "t4-2", badge: "STEP 2", title: "50-Word AEO Direct Answers", detail: "Place a concise, bolded answer block immediately beneath every primary H2.", metricValue: "Snippet Win", iconId: "bolt" },
      { id: "t4-3", badge: "STEP 3", title: "Custom Section Infographics", detail: "Replace generic stock photos with purpose-built charts and comparisons.", metricValue: "+64% Time", iconId: "chart" },
      { id: "t4-4", badge: "STEP 4", title: "Zero-CLS WebP & Vector SVG", detail: "Include explicit width/height attributes for 100/100 Core Web Vitals.", metricValue: "0.000 CLS", iconId: "shield" },
    ],
  },
  5: {
    paletteId: "emerald-growth",
    backdropStyle: "ai-art-plate",
    headline: "Full-Funnel B2B Organic Conversion & Visual Attribution Architecture",
    subheadline: "3D tapered conversion funnel · Stage-by-stage traffic & pipeline conversion rates",
    nodes: [
      { id: "t5-1", badge: "TOFU", title: "1. AI Overview & SERP Discovery", detail: "Capture broad informational queries with 50-word AEO blocks & H2 diagrams.", metricValue: "100% Reach", iconId: "globe" },
      { id: "t5-2", badge: "MOFU", title: "2. Interactive Tool & Visual Engagement", detail: "Keep readers on-page 2.4x longer with comparison matrices & calculators.", metricValue: "48% Engaged", iconId: "layers" },
      { id: "t5-3", badge: "BOFU", title: "3. High-Intent Versus & ROI Proof", detail: "Resolve buyer objections using head-to-head battle cards & cost breakdowns.", metricValue: "19% Demos", iconId: "chart" },
      { id: "t5-4", badge: "WON", title: "4. Closed-Won Customer Advocacy", detail: "Turn verified customer KPIs into reusable social & blog proof assets.", metricValue: "8.4% Close", iconId: "trophy" },
    ],
  },
  6: {
    paletteId: "indigo-cyber",
    backdropStyle: "ai-art-plate",
    headline: "Visual Production Comparison: DoItWithAI Studio vs. Manual Design",
    subheadline: "Central-spine head-to-head comparison · Criteria medallions & dual wing callouts",
    nodes: [
      { id: "t6-1", badge: "SPEED", title: "25 Instant H2 Layouts in <5 Seconds", detail: "Auto-maps any H2 heading or URL to editable diagrams immediately.", metricValue: "<5 Secs", iconId: "bolt" },
      { id: "t6-2", badge: "MANUAL", title: "45+ Minutes Per Graphic in Design Apps", detail: "Requires manual box alignment, font sizing, and export resizing.", metricValue: "45 Mins", iconId: "clock" },
      { id: "t6-3", badge: "TEXT", title: "100% Crisp Editable Canvas & SVG Text", detail: "Zero diffusion spelling errors; edit every label, badge, and metric live.", metricValue: "0 Typos", iconId: "check" },
      { id: "t6-4", badge: "DIFFUSION", title: "Garbled AI Words & Flat Raster Pixels", detail: "Prompt-only image generators misspell flowchart labels and lock text.", metricValue: "Uneditable", iconId: "scale" },
      { id: "t6-5", badge: "COST", title: "$0 Free In-Browser Engine + CWV HTML", detail: "Unlimited PNG, SVG, WebP, PDF, and .ZIP exports with zero API token burn.", metricValue: "$0 / Free", iconId: "shield" },
      { id: "t6-6", badge: "SAAS", title: "$29–$49/mo Paid Seat Subscriptions", detail: "Locks vector SVG and high-DPI exports behind monthly paywalls.", metricValue: "$348/yr", iconId: "database" },
    ],
  },
  7: {
    paletteId: "violet-saas",
    backdropStyle: "ai-art-plate",
    headline: "2026 Blog Visual & Infographic Workflow Comparison Matrix",
    subheadline: "3-option feature matrix · Studio vs. Diffusion AI vs. Manual Templates",
    nodes: [
      { id: "t7-1", badge: "STUDIO", title: "100% Typo-Free Editable Typography", detail: "Live DOM/Canvas/SVG text editing", metricValue: "✓ Included", iconId: "check" },
      { id: "t7-2", badge: "AI ART", title: "Auto H2-to-Template Intent Matching", detail: "Deterministic section classification", metricValue: "✓ Included", iconId: "sparkles" },
      { id: "t7-3", badge: "MANUAL", title: "Vector .SVG + Core Web Vitals .WebP", detail: "Zero-CLS responsive <figure> code", metricValue: "✓ Included", iconId: "code" },
      { id: "t7-4", badge: "EXPORT", title: "1-Click Multi-Section Article .ZIP Pack", detail: "Batch export all H2 visuals at once", metricValue: "✓ Included", iconId: "rocket" },
    ],
  },
  8: {
    paletteId: "emerald-growth",
    backdropStyle: "ai-art-plate",
    headline: "Before vs. After: Upgrading Walls of Text with H2 Infographics",
    subheadline: "Transformation split board · Verified Search Console & dwell-time delta",
    nodes: [
      { id: "t8-1", badge: "BEFORE", title: "Unbroken 2,500-Word Wall of Grey Text", detail: "78% mobile bounce rate; readers skim past key takeaways without converting.", metricValue: "1:12 Dwell", iconId: "clock" },
      { id: "t8-2", badge: "AFTER", title: "Visual H2 Diagrams Every 350 Words", detail: "Scannable process flows and KPI callouts keep executives engaged to the CTA.", metricValue: "3:48 Dwell", iconId: "trending" },
      { id: "t8-3", badge: "BEFORE", title: "Zero Image Search or AI Overview Clicks", detail: "Generic stock photos provide zero semantic entity value to search crawlers.", metricValue: "0 Citations", iconId: "scale" },
      { id: "t8-4", badge: "AFTER", title: "Indexed SVG/WebP + Descriptive Alt Schema", detail: "Wins Google Image packs, AI Overview citations, and organic backlinks.", metricValue: "+142% Clicks", iconId: "trophy" },
    ],
  },
  9: {
    paletteId: "slate-minimal",
    backdropStyle: "ai-art-plate",
    headline: "Executive Trade-Off Analysis: Client-Side SVG/Canvas vs. Cloud Rendering",
    subheadline: "Pros & Cons dual evaluation board · Performance, privacy & scalability score",
    nodes: [
      { id: "t9-1", badge: "PRO #1", title: "Zero Latency (<16ms Real-Time Redraw)", detail: "Every keystroke, color change, and template switch renders instantaneously.", metricValue: "60 FPS", iconId: "bolt" },
      { id: "t9-2", badge: "CONSIDER", title: "Browser Font & Canvas Memory Limits", detail: "Ultra-high 4K batch exports use offscreen canvas pooling for stability.", metricValue: "Handled", iconId: "cpu" },
      { id: "t9-3", badge: "PRO #2", title: "100% Data Privacy & $0 Token Cost", detail: "Drafts, brand logos, and proprietary KPIs never leave the user's browser.", metricValue: "100% Private", iconId: "shield" },
      { id: "t9-4", badge: "CONSIDER", title: "Custom Illustration Uploads Optional", detail: "Includes 5 built-in AI art plates plus support for custom brand logos.", metricValue: "5 Art Plates", iconId: "sparkles" },
    ],
  },
  10: {
    paletteId: "blue-trust",
    backdropStyle: "ai-art-plate",
    headline: "Visual SEO Best Practices: Do's vs. Don'ts for Blog Infographics",
    subheadline: "Editorial compliance board · Core Web Vitals & accessibility rules",
    nodes: [
      { id: "t10-1", badge: "DO THIS", title: "Compress Each H2 Into 3–6 Scannable Nodes", detail: "Pair a short 4-word title with a bold metric pill and 1-sentence proof.", metricValue: "✓ Best Practice", iconId: "check" },
      { id: "t10-2", badge: "AVOID", title: "Never Cram 300+ Words Into One Image", detail: "Dense paragraphs inside images become unreadable on mobile viewports.", metricValue: "✕ Hurts UX", iconId: "scale" },
      { id: "t10-3", badge: "DO THIS", title: "Always Set Explicit Width, Height & Alt Text", detail: "Prevents Cumulative Layout Shift (CLS = 0.000) and boosts image SEO.", metricValue: "✓ 100 CWV", iconId: "shield" },
      { id: "t10-4", badge: "AVOID", title: "Never Publish Unedited Diffusion Text", detail: "Misspelled AI labels destroy brand credibility with B2B decision-makers.", metricValue: "✕ Low Trust", iconId: "clock" },
    ],
  },
  11: {
    paletteId: "amber-executive",
    backdropStyle: "ai-art-plate",
    headline: "Q3 Business & Organic Content Performance Analysis",
    subheadline: "Glassmorphic KPI orbs · Revenue growth, retention, CAC & operating margin",
    nodes: [
      { id: "t11-1", badge: "REVENUE", title: "Organic Pipeline Revenue", detail: "Multi-product content hubs drove 38% of new enterprise pipeline.", metricValue: "$5.4M", iconId: "trending" },
      { id: "t11-2", badge: "RETENTION", title: "Annual Net Retention Rate", detail: "Interactive tools and onboarding guides lifted 12-month retention +4 pts.", metricValue: "91.4%", iconId: "users" },
      { id: "t11-3", badge: "ACQUISITION", title: "Blended Organic CAC", detail: "Zero-token SEO tools reduced paid acquisition dependency by 46%.", metricValue: "$420 CAC", iconId: "target" },
      { id: "t11-4", badge: "MARGIN", title: "Content Operating Margin", detail: "Automated H2 visuals and schema compilation saved 14 hrs per article.", metricValue: "68.6%", iconId: "chart" },
    ],
  },
  12: {
    paletteId: "cyan-tech",
    backdropStyle: "ai-art-plate",
    headline: "What B2B Content Readers Really Want (2026 Survey Benchmark)",
    subheadline: "2×2 stat cards + vertical multi-bar chart · Verified reader retention drivers",
    nodes: [
      { id: "t12-1", badge: "VISUALS", title: "Prefer Visual H2 Summaries", detail: "Choose articles with scannable diagrams over plain text.", metricValue: "78%", iconId: "chart" },
      { id: "t12-2", badge: "SPEED", title: "Expect Instant Page Load", detail: "Abandon pages that shift layout or take >2.5s to render.", metricValue: "72%", iconId: "bolt" },
      { id: "t12-3", badge: "PROOF", title: "Demand Real Benchmarks", detail: "Look for quantified ROI metrics and source citations.", metricValue: "65%", iconId: "shield" },
      { id: "t12-4", badge: "TEMPLATES", title: "Download Actionable Assets", detail: "Bookmark posts that include checklists or interactive tools.", metricValue: "58%", iconId: "trophy" },
    ],
  },
  13: {
    paletteId: "indigo-cyber",
    backdropStyle: "ai-art-plate",
    headline: "Organic CTR & Dwell-Time Lift by Article Visual Format",
    subheadline: "Horizontal benchmark bar chart + trend curve · 1,200 B2B articles analyzed",
    nodes: [
      { id: "t13-1", badge: "RANK #1", title: "Interactive Tool + Custom H2 Infographics", detail: "Highest dwell time, backlink velocity, and AI Overview citation rate.", metricValue: "96%", iconId: "trophy" },
      { id: "t13-2", badge: "RANK #2", title: "Comparison Matrix + Data Callout Cards", detail: "Strong commercial-intent conversion for BOFU software pages.", metricValue: "84%", iconId: "chart" },
      { id: "t13-3", badge: "RANK #3", title: "50-Word AEO Box + Numbered Process Flow", detail: "Wins featured snippets and voice/AI search summaries.", metricValue: "71%", iconId: "bolt" },
      { id: "t13-4", badge: "BASELINE", title: "Plain Text + Generic Stock Photography", detail: "High bounce rate and minimal organic social sharing.", metricValue: "29%", iconId: "clock" },
    ],
  },
  14: {
    paletteId: "emerald-growth",
    backdropStyle: "ai-art-plate",
    headline: "Content Production Cost vs. Net ROI Savings Breakdown",
    subheadline: "Financial waterfall & ROI ledger · Agency outsourcing vs. In-house AI Studio",
    nodes: [
      { id: "t14-1", badge: "BASELINE", title: "Traditional Agency + Freelance Designer", detail: "$650 per article + $180 for 4 custom infographics (5-day turnaround).", metricValue: "$8,300/mo", iconId: "scale" },
      { id: "t14-2", badge: "OPTIMIZED", title: "DoItWithAI Content + 25-Template Studio", detail: "2-pass LLM drafting + zero-token HTML5/SVG section diagrams in 15 mins.", metricValue: "$420/mo", iconId: "bolt" },
      { id: "t14-3", badge: "SAVINGS", title: "Net Monthly Production Savings", detail: "Reinvest $7,880/mo into digital PR and product engineering.", metricValue: "+94% Saved", iconId: "trending" },
      { id: "t14-4", badge: "PAYBACK", title: "Time Saved Per 10-Article Sprint", detail: "Eliminates back-and-forth design revisions and schema debugging.", metricValue: "62 Hours", iconId: "clock" },
    ],
  },
  15: {
    paletteId: "cyan-tech",
    backdropStyle: "ai-art-plate",
    headline: "5-Pillar Technical SEO, AEO & Visual Readiness Scorecard",
    subheadline: "Concentric radial gauge + 5 scored audit bars · Pre-publish verification",
    nodes: [
      { id: "t15-1", badge: "OVERALL", title: "Composite Article Quality Score", detail: "Passes all 47 deterministic on-page, pixel, and schema checks.", metricValue: "97/100", iconId: "trophy" },
      { id: "t15-2", badge: "PIXEL SERP", title: "Title (<580px) & Meta (<920px) Fit", detail: "Zero ellipsis truncation on desktop or mobile SERPs.", metricValue: "99%", iconId: "check" },
      { id: "t15-3", badge: "VISUALS", title: "H2 Section Infographic Coverage", detail: "Every primary H2 includes a zero-CLS SVG/WebP diagram.", metricValue: "100%", iconId: "chart" },
      { id: "t15-4", badge: "HUMANITY", title: "Burstiness (σ ≥ 6.0) & Zero AI Clichés", detail: "Natural cadence with varied sentence lengths and concrete proof.", metricValue: "94%", iconId: "sparkles" },
      { id: "t15-5", badge: "SCHEMA", title: "JSON-LD @graph & E-E-A-T Citations", detail: "Validated BlogPosting, FAQPage, and ImageObject entities.", metricValue: "96%", iconId: "shield" },
    ],
  },
  16: {
    paletteId: "indigo-cyber",
    backdropStyle: "ai-art-plate",
    headline: "2×2 SEO Impact vs. Engineering Effort Priority Matrix",
    subheadline: "Strategic quadrant plot · Where to focus content & visual engineering sprints",
    nodes: [
      { id: "t16-1", badge: "QUICK WINS", title: "Add 50w AEO Answers & H2 Infographics to Top 20 Posts", detail: "High ranking lift in 14 days with zero backend code changes.", metricValue: "High Impact · Low Effort", iconId: "bolt" },
      { id: "t16-2", badge: "BIG BETS", title: "Build Interactive Free AI Tools & Calculators", detail: "Earns passive editorial backlinks and direct brand traffic.", metricValue: "High Impact · High Effort", iconId: "rocket" },
      { id: "t16-3", badge: "FILL-INS", title: "Refresh Legacy Meta Titles & Alt Attributes", detail: "Batch-fix pixel truncation and missing image alt strings.", metricValue: "Med Impact · Low Effort", iconId: "check" },
      { id: "t16-4", badge: "DEFER", title: "Unvalidated Generic AI Mass-Publishing", detail: "High risk of crawl budget waste without human E-E-A-T review.", metricValue: "Low Impact · High Risk", iconId: "scale" },
    ],
  },
  17: {
    paletteId: "amber-executive",
    backdropStyle: "ai-art-plate",
    headline: "The 4-Tier Topical Authority & Visual Moat Pyramid",
    subheadline: "Layered triangular hierarchy + right-hand architectural callouts",
    nodes: [
      { id: "t17-1", badge: "TIER 1 · APEX", title: "Original Research, Benchmarks & Interactive Tools", detail: "Proprietary datasets and free studios that competitors cannot copy.", metricValue: "Link Magnet", iconId: "trophy" },
      { id: "t17-2", badge: "TIER 2 · VISUAL", title: "Custom H2 Infographics & Comparison Matrices", detail: "25 deterministic diagram layouts that maximize reader retention.", metricValue: "2.4x Dwell", iconId: "chart" },
      { id: "t17-3", badge: "TIER 3 · AEO", title: "50-Word Direct Answers & E-E-A-T Citations", detail: "Structured blocks engineered for Google AI Overviews & Perplexity.", metricValue: "AI Citations", iconId: "sparkles" },
      { id: "t17-4", badge: "TIER 4 · BASE", title: "Semantic Keyword Clusters & JSON-LD @graph", detail: "Clean URL hierarchy, internal link mesh, and zero-CLS WebP speed.", metricValue: "100 CWV", iconId: "layers" },
    ],
  },
  18: {
    paletteId: "violet-saas",
    backdropStyle: "ai-art-plate",
    headline: "The 3-Pillar AI Search & Conversion Synergy Venn Diagram",
    subheadline: "Intersecting Venn circles + connected corner callout cards",
    nodes: [
      { id: "t18-1", badge: "PILLAR 1", title: "Semantic SEO & Entity Depth", detail: "Complete coverage of primary keywords, LSI entities, and search intent.", metricValue: "Discoverability", iconId: "globe" },
      { id: "t18-2", badge: "PILLAR 2", title: "Visual Infographics & UX Speed", detail: "Scannable H2 diagrams, comparison tables, and sub-1.8s LCP.", metricValue: "Retention", iconId: "chart" },
      { id: "t18-3", badge: "PILLAR 3", title: "First-Hand E-E-A-T Proof", detail: "Verified benchmarks, executable code/prompts, and author credentials.", metricValue: "Authority", iconId: "shield" },
      { id: "t18-4", badge: "SWEET SPOT", title: "#1 Ranking + AI Overview Citation", detail: "Where semantic completeness, visual clarity, and trust converge.", metricValue: " Compounding ROI", iconId: "trophy" },
    ],
  },
  19: {
    paletteId: "cyan-tech",
    backdropStyle: "ai-art-plate",
    headline: "Hub-and-Spoke Pillar Content & Visual Internal Linking Map",
    subheadline: "Central pillar core + 4 radial cluster spokes with bi-directional link equity",
    nodes: [
      { id: "t19-1", badge: "SPOKE 01", title: "How-To Tutorial & Step Pipeline", detail: "Targets long-tail implementation queries and links back to the pillar hub.", metricValue: "Process Flow", iconId: "gear" },
      { id: "t19-2", badge: "SPOKE 02", title: "Tool A vs. Tool B Comparison Page", detail: "Captures high-intent buyer comparisons with head-to-head battle cards.", metricValue: "Versus Card", iconId: "scale" },
      { id: "t19-3", badge: "SPOKE 03", title: "Industry Statistics & KPI Report", detail: "Earns passive backlinks from journalists using bento KPI infographics.", metricValue: "Data Hub", iconId: "chart" },
      { id: "t19-4", badge: "SPOKE 04", title: "Free Interactive Calculator / Studio", detail: "Converts organic readers into active product users at $0 CAC.", metricValue: "Interactive", iconId: "rocket" },
    ],
  },
  20: {
    paletteId: "emerald-growth",
    backdropStyle: "ai-art-plate",
    headline: "6-Point Pre-Publish SEO & Visual Quality Launch Checklist",
    subheadline: "2-column verification board + 100% readiness progress bar",
    nodes: [
      { id: "t20-1", badge: "CHECK 01", title: "Title <580px & Meta Description <920px", detail: "Verified pixel width across desktop and mobile SERP simulators.", metricValue: "CRITICAL", iconId: "check" },
      { id: "t20-2", badge: "CHECK 02", title: "50-Word AEO Direct Answer After H1", detail: "Bolded key entities ready for Google AI Overviews & Featured Snippets.", metricValue: "HIGH", iconId: "bolt" },
      { id: "t20-3", badge: "CHECK 03", title: "Editable Infographic Under Every Primary H2", detail: "Exported with explicit width/height and keyword-rich alt attributes.", metricValue: "CRITICAL", iconId: "chart" },
      { id: "t20-4", badge: "CHECK 04", title: "Sentence Burstiness σ ≥ 6.0 & Zero AI Clichés", detail: "Purged robotic transitions ('delve', 'testament', 'tapestry').", metricValue: "HIGH", iconId: "sparkles" },
      { id: "t20-5", badge: "CHECK 05", title: "3+ Internal Links & 2+ External E-E-A-T Citations", detail: "Connected to relevant tools, pillar guides, and primary research.", metricValue: "CORE", iconId: "shield" },
      { id: "t20-6", badge: "CHECK 06", title: "Validated JSON-LD @graph Schema Markup", detail: "BlogPosting + FAQPage + ImageObject compiled with zero warnings.", metricValue: "CORE", iconId: "code" },
    ],
  },
  21: {
    paletteId: "blue-trust",
    backdropStyle: "ai-art-plate",
    headline: "Executive TL;DR: 4 Key Takeaways From Our 2026 AI SEO Study",
    subheadline: "Top-of-article summary board · Numbered ribbon badges & KPI highlights",
    nodes: [
      { id: "t21-1", badge: "TAKEAWAY 1", title: "Visual H2 Diagrams Lift Dwell Time by 2.4x", detail: "Articles pairing every H2 with a structured diagram cut bounce rates by 41%.", metricValue: "2.4x Dwell", iconId: "chart" },
      { id: "t21-2", badge: "TAKEAWAY 2", title: "50-Word Answer Blocks Win 38% More AI Citations", detail: "Direct, entity-rich definitions right below H2s get quoted by AI Overviews.", metricValue: "+38% AEO", iconId: "sparkles" },
      { id: "t21-3", badge: "TAKEAWAY 3", title: "Deterministic Canvas/SVG Beats Diffusion Images", detail: "Crisp vector typography eliminates garbled words and loads in <15ms.", metricValue: "0 Typos", iconId: "check" },
      { id: "t21-4", badge: "TAKEAWAY 4", title: "Unified Root Platforms Outrank Fragmented Tools", detail: "Consolidating overlapping URLs eliminates cannibalization and compounds authority.", metricValue: "#1 Authority", iconId: "trophy" },
    ],
  },
  22: {
    paletteId: "indigo-cyber",
    backdropStyle: "ai-art-plate",
    headline: "Anatomy of a High-Converting #1 Ranking SEO Article",
    subheadline: "Annotated page wireframe teardown · 6 numbered structural callout pointers",
    nodes: [
      { id: "t22-1", badge: "ZONE 01", title: "<580px H1 + Trust Breadcrumb Bar", detail: "Establishes immediate topical relevance and E-E-A-T author attribution.", metricValue: "Above Fold", iconId: "target" },
      { id: "t22-2", badge: "ZONE 02", title: "50-Word AEO Quick Answer Callout", detail: "Captures Featured Snippets and AI Overview citations immediately.", metricValue: "Snippet Box", iconId: "bolt" },
      { id: "t22-3", badge: "ZONE 03", title: "Interactive Widget or Embedded Studio", detail: "Lets readers solve their problem live on the page (3x engagement).", metricValue: "Interactive", iconId: "cpu" },
      { id: "t22-4", badge: "ZONE 04", title: "H2 Section + Custom SVG/WebP Infographic", detail: "Visualizes processes, comparisons, and KPIs with zero layout shift.", metricValue: "0.000 CLS", iconId: "chart" },
      { id: "t22-5", badge: "ZONE 05", title: "Competitor Comparison Matrix Table", detail: "Answers commercial evaluation intent with checkmarks and benchmarks.", metricValue: "High CTR", iconId: "layers" },
      { id: "t22-6", badge: "ZONE 06", title: "FAQPage Schema + Omnichannel Download Pack", detail: "Wins long-tail people-also-ask queries and captures leads.", metricValue: "JSON-LD", iconId: "code" },
    ],
  },
  23: {
    paletteId: "rose-editorial",
    backdropStyle: "ai-art-plate",
    headline: "3 Common AI Content Myths vs. Proven 2026 Search Reality",
    subheadline: "Myth vs. Reality debunking board · Side-by-side evidence & KPI proof",
    nodes: [
      { id: "t23-1", badge: "MYTH #1", title: "Google Penalizes All AI-Assisted Articles", detail: "False: Google rewards helpful, original content regardless of how it is drafted.", metricValue: "✕ Debunked", iconId: "scale" },
      { id: "t23-2", badge: "REALITY #1", title: "Humanized Prose + Original Visuals Rank #1", detail: "Combining burstiness (σ ≥ 6.0), verified citations, and H2 diagrams wins Page 1.", metricValue: "✓ Proven", iconId: "check" },
      { id: "t23-3", badge: "MYTH #2", title: "Diffusion Prompts Can Generate Good Infographics", detail: "False: Raster image models garble flowchart text and cannot be edited later.", metricValue: "✕ Debunked", iconId: "clock" },
      { id: "t23-4", badge: "REALITY #2", title: "Hybrid AI Art Plates + Vector SVG Typography Wins", detail: "Rich visual backdrops paired with live-editable Canvas/SVG text give 100% clarity.", metricValue: "✓ Crisp HD", iconId: "sparkles" },
    ],
  },
  24: {
    paletteId: "violet-saas",
    backdropStyle: "ai-art-plate",
    headline: "6-Box Technical SEO & Visual Engineering Quick Cheat Sheet",
    subheadline: "Command & formula reference grid · Copy-ready thresholds for 2026 rankings",
    nodes: [
      { id: "t24-1", badge: "SERP TITLE", title: "Desktop Pixel Limit", detail: "Keep meta titles under 580px (~55–60 chars) in 20px Arial.", metricValue: "width <= 580px", iconId: "code" },
      { id: "t24-2", badge: "META DESC", title: "Single-Sentence CTR Rule", detail: "Write 1 natural sentence between 145–160 chars (<920px).", metricValue: "145..160 chars", iconId: "target" },
      { id: "t24-3", badge: "BURSTINESS", title: "Human Cadence Standard", detail: "Vary sentence lengths (6w to 28w) so std deviation σ ≥ 6.0.", metricValue: "sigma >= 6.0", iconId: "sparkles" },
      { id: "t24-4", badge: "AEO ANSWER", title: "Direct Snippet Window", detail: "Place a 42–58 word bolded summary directly after H1/H2.", metricValue: "45..55 words", iconId: "bolt" },
      { id: "t24-5", badge: "CWV IMAGE", title: "Zero Layout Shift Markup", detail: "Always include explicit width, height, and loading attributes.", metricValue: "CLS == 0.000", iconId: "shield" },
      { id: "t24-6", badge: "SCHEMA", title: "Unified Entity @graph", detail: "Nest BlogPosting, HowTo, ImageObject & FAQPage in one script.", metricValue: "@graph JSON-LD", iconId: "layers" },
    ],
  },
  25: {
    paletteId: "indigo-cyber",
    backdropStyle: "ai-art-plate",
    headline: "The 2026 Enterprise Guide to Autonomous SEO & Visual Content Studios",
    subheadline: "Widescreen 16:9 Featured Blog Hero & 1200×630 OpenGraph Social Banner",
    nodes: [
      { id: "t25-1", badge: "ORCHESTRATED", title: "62 Integrated SEO & Visual Tools", detail: "47 deterministic zero-token analyzers + 25 infographic layouts.", metricValue: "62 Tools", iconId: "cpu" },
      { id: "t25-2", badge: "VISUAL STUDIO", title: "25 Editable H2 Infographic Layouts", detail: "Export crisp PNG, vector SVG, WebP, PDF & CWV HTML.", metricValue: "25 Templates", iconId: "chart" },
      { id: "t25-3", badge: "PERFORMANCE", title: "100/100 Core Web Vitals Ready", detail: "Zero layout shift with responsive vector & WebP assets.", metricValue: "0.000 CLS", iconId: "bolt" },
      { id: "t25-4", badge: "EFFICIENCY", title: "Zero API Cost for Visual Rendering", detail: "100% in-browser composite art plates & vector geometry.", metricValue: "$0 Token Burn", iconId: "shield" },
    ],
  },
};

export interface QuickInfographicScenarioPreset {
  id: string;
  label: string;
  badge: string;
  templateId: number;
}

export const QUICK_SCENARIO_PRESETS: QuickInfographicScenarioPreset[] = [
  { id: "sc-chevron", label: "5-Step Strategy Pipeline", badge: "Chevron #1", templateId: 1 },
  { id: "sc-versus", label: "Head-to-Head VS Battle", badge: "Comparison #6", templateId: 6 },
  { id: "sc-orbs", label: "Q3 KPI Glass Orbs", badge: "Data Orbs #11", templateId: 11 },
  { id: "sc-gears", label: "Interlocking Growth Gears", badge: "Gears #3", templateId: 3 },
  { id: "sc-survey", label: "Customer Survey + Bar Chart", badge: "Stats #12", templateId: 12 },
  { id: "sc-roadmap", label: "5-Step S-Curve Roadmap", badge: "Roadmap #4", templateId: 4 },
];
