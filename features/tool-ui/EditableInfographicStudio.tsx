"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InfographicArtwork,
  InfographicBackgroundDecor,
  EDITORIAL_LAYOUTS,
  TemplateThumbnail,
  type InfographicBgWaveStyle,
} from "./InfographicArtwork";
import { wrapVisualText, percentageMetric } from "./visualText";
import { prepareVisualSvg, visualSvgCanvas, saveVisualBlob } from "./svgExport";
import styles from "./visual-studio.module.css";
import { inferNodeIcon } from "./infographicIcons";
export { inferNodeIcon } from "./infographicIcons";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Edit3,
  Layers,
  Maximize2,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type InfographicTemplateId =
  | "winding-s-roadmap"
  | "step-roadmap"
  | "step-staircase-ascension"
  | "circular-flywheel-cycle"
  | "alternating-spine-timeline"
  | "timeline-journey"
  | "horizontal-timeline-gantt"
  | "before-after-transformation"
  | "isometric-3d-pyramid"
  | "pyramid-funnel"
  | "conversion-funnel-stages"
  | "pillar-temple-architecture"
  | "iceberg-hidden-layers"
  | "side-image-editorial-split"
  | "side-image-right-spotlight"
  | "side-image-horizontal-board"
  | "stat-donut-kpi-dashboard"
  | "stat-bento-grid"
  | "editorial-newspaper-digest"
  | "versus-battle-comparison"
  | "comparison-versus"
  | "dos-and-donts-matrix"
  | "dos-and-donts"
  | "quadrant-2x2-strategy"
  | "radial-hub-and-spoke"
  | "hub-anatomy"
  | "honeycomb-hex-cluster"
  | "anatomy-x-ray-breakdown"
  | "numbered-ribbon-banners"
  | "numbered-checklist"
  | "horizontal-landscape-flow"
  | "checklist-audit-scorecard";

export type InfographicTemplateCategory =
  | "all"
  | "roadmap"
  | "timeline"
  | "hierarchy"
  | "side-image"
  | "statistical"
  | "comparison"
  | "mindmap"
  | "viral-list";

export type InfographicAspectRatio =
  | "vertical-poster" // 1080 x 1920
  | "pinterest-tall" // 1000 x 1500
  | "portrait-social" // 1080 x 1350
  | "horizontal-landscape" // 1600 x 1000
  | "square-card"; // 1200 x 1200

export type InfographicColorPaletteId =
  | "royal-indigo"
  | "navy-orange"
  | "canva-editorial-light"
  | "emerald-slate"
  | "venngage-teal-coral"
  | "terracotta-cream"
  | "cyber-violet"
  | "mckinsey-executive"
  | "rose-charcoal"
  | "forest-gold"
  | "arctic-sky-light"
  | "custom-brand";

export type InfographicIconId =
  | "rocket"
  | "target"
  | "sparkles"
  | "chart"
  | "shield"
  | "globe"
  | "brain"
  | "layers"
  | "zap"
  | "trophy"
  | "check"
  | "users"
  | "magnet"
  | "gear"
  | "compass"
  | "database"
  | "megaphone"
  | "clock"
  | "lightbulb"
  | "award";

export interface InfographicNodeItem {
  id: string;
  badge: string;
  title: string;
  body: string;
  metricValue?: string;
  compareRight?: string;
  icon?: InfographicIconId;
  customImageUrl?: string;
  accentColor?: string;
}

export interface InfographicColorPalette {
  id: InfographicColorPaletteId;
  name: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  accentSoft: string;
  badgeText: string;
}

/**
 * WCAG 2.1 Relative Luminance & Contrast Ratio Helpers
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = String(hex || "")
    .trim()
    .replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Samples dominant brand colors from an uploaded logo or article image in the browser
 */
function extractBrandPaletteFromImageUrl(
  imgSrc: string,
): Promise<{
  bgStart: string;
  cardBg: string;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
} | null> {
  if (typeof window === "undefined" || !imgSrc) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        canvas.width = 48;
        canvas.height = 48;
        ctx.drawImage(img, 0, 0, 48, 48);
        const data = ctx.getImageData(0, 0, 48, 48).data;
        const vibrant: Array<{ r: number; g: number; b: number; sat: number }> =
          [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          if (sat > 0.25 && max > 45 && min < 235) {
            vibrant.push({ r, g, b, sat });
          }
        }
        if (vibrant.length === 0) {
          resolve(null);
          return;
        }
        vibrant.sort((a, b) => b.sat - a.sat);
        const primary = vibrant[0];
        const secondary =
          vibrant[
            Math.min(vibrant.length - 1, Math.floor(vibrant.length / 2))
          ] || primary;
        const toHex = (c: { r: number; g: number; b: number }) =>
          `#${[c.r, c.g, c.b]
            .map((v) =>
              Math.max(0, Math.min(255, Math.round(v)))
                .toString(16)
                .padStart(2, "0"),
            )
            .join("")}`;
        const accentHex = toHex(primary);
        const secHex = toHex(secondary);
        resolve({
          bgStart: "#0B132B",
          cardBg: "#152244",
          accent: accentHex,
          accentSecondary: secHex,
          textPrimary: "#FFFFFF",
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgSrc;
  });
}

export const INFOGRAPHIC_PALETTES: InfographicColorPalette[] = [
  {
    id: "royal-indigo",
    name: "DoItWithAI Royal Blue & Paper (Official Brand)",
    bgStart: "#F4F6FF",
    bgEnd: "#E8EDFF",
    cardBg: "#FFFFFF",
    cardBorder: "#B8C7FF",
    textPrimary: "#111C38",
    textSecondary: "#334155",
    accent: "#4058D0",
    accentSecondary: "#5271FF",
    accentSoft: "rgba(64, 88, 208, 0.14)",
    badgeText: "#FFFFFF",
  },
  {
    id: "navy-orange",
    name: "DoItWithAI Midnight & Electric Cobalt",
    bgStart: "#0B1120",
    bgEnd: "#172554",
    cardBg: "#152238",
    cardBorder: "#5271FF",
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    accent: "#5271FF",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(82, 113, 255, 0.2)",
    badgeText: "#FFFFFF",
  },
  {
    id: "canva-editorial-light",
    name: "Canva Studio Light & Indigo",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardBg: "#FFFFFF",
    cardBorder: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    accent: "#4F46E5",
    accentSecondary: "#0284C7",
    accentSoft: "#E0E7FF",
    badgeText: "#FFFFFF",
  },
  {
    id: "venngage-teal-coral",
    name: "Executive Teal & Sky",
    bgStart: "#042F2E",
    bgEnd: "#134E4A",
    cardBg: "#0F3D3B",
    cardBorder: "#2DD4BF",
    textPrimary: "#F0FDFA",
    textSecondary: "#CCFBF1",
    accent: "#2DD4BF",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(45, 212, 191, 0.2)",
    badgeText: "#042F2E",
  },
  {
    id: "emerald-slate",
    name: "Executive Emerald & Carbon",
    bgStart: "#052E24",
    bgEnd: "#0F172A",
    cardBg: "#112233",
    cardBorder: "#10B981",
    textPrimary: "#F8FAFC",
    textSecondary: "#D1FAE5",
    accent: "#10B981",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(16, 185, 129, 0.2)",
    badgeText: "#052E24",
  },
  {
    id: "terracotta-cream",
    name: "Warm Editorial Cream & Sapphire",
    bgStart: "#FFFBEB",
    bgEnd: "#FEF3C7",
    cardBg: "#FFFFFF",
    cardBorder: "#4058D0",
    textPrimary: "#1C1917",
    textSecondary: "#44403C",
    accent: "#4058D0",
    accentSecondary: "#0D9488",
    accentSoft: "#E0E7FF",
    badgeText: "#FFFFFF",
  },
  {
    id: "cyber-violet",
    name: "AI SaaS Violet & Electric Blue",
    bgStart: "#130924",
    bgEnd: "#2E1065",
    cardBg: "#1F123B",
    cardBorder: "#A855F7",
    textPrimary: "#FFFFFF",
    textSecondary: "#E9D5FF",
    accent: "#C084FC",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(192, 132, 252, 0.22)",
    badgeText: "#130924",
  },
  {
    id: "mckinsey-executive",
    name: "McKinsey Boardroom White & Navy",
    bgStart: "#FFFFFF",
    bgEnd: "#F1F5F9",
    cardBg: "#F8FAFC",
    cardBorder: "#94A3B8",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    accent: "#0284C7",
    accentSecondary: "#4058D0",
    accentSoft: "#E0F2FE",
    badgeText: "#FFFFFF",
  },
  {
    id: "rose-charcoal",
    name: "Obsidian & Royal Crimson",
    bgStart: "#18181B",
    bgEnd: "#27272A",
    cardBg: "#232329",
    cardBorder: "#F43F5E",
    textPrimary: "#FAFAFA",
    textSecondary: "#E4E4E7",
    accent: "#F43F5E",
    accentSecondary: "#8094FF",
    accentSoft: "rgba(244, 63, 94, 0.2)",
    badgeText: "#FFFFFF",
  },
  {
    id: "forest-gold",
    name: "Deep Forest & Luxury Gold",
    bgStart: "#0C1F17",
    bgEnd: "#143326",
    cardBg: "#193D2E",
    cardBorder: "#FBBF24",
    textPrimary: "#FEFCE8",
    textSecondary: "#ECFCCB",
    accent: "#FBBF24",
    accentSecondary: "#34D399",
    accentSoft: "rgba(251, 191, 36, 0.2)",
    badgeText: "#0C1F17",
  },
  {
    id: "arctic-sky-light",
    name: "Arctic Mint & Sky Daylight",
    bgStart: "#F0FDF4",
    bgEnd: "#E0F2FE",
    cardBg: "#FFFFFF",
    cardBorder: "#38BDF8",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    accent: "#0284C7",
    accentSecondary: "#059669",
    accentSoft: "#BAE6FD",
    badgeText: "#FFFFFF",
  },
];

export interface InfographicTemplateMeta {
  id: InfographicTemplateId;
  label: string;
  category: InfographicTemplateCategory;
  desc: string;
  recommendedAspect?: InfographicAspectRatio;
  badge: string;
  minNodes: number;
  maxNodes: number;
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplateMeta[] = [
  // Category 1: Roadmaps & Process Flows
  {
    id: "winding-s-roadmap",
    label: "1. S-Curve Winding Roadmap",
    category: "roadmap",
    desc: "Connected S-curve highway with 3D milestone pins & vector icons",
    badge: "POPULAR",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "step-roadmap",
    label: "2. Vertical Process Flow",
    category: "roadmap",
    desc: "Numbered process cards connected with directional flow arrows",
    badge: "PROCESS",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "step-staircase-ascension",
    label: "3. 3D Ascending Staircase",
    category: "roadmap",
    desc: "Rising diagonal steps from foundation to pinnacle trophy goal",
    badge: "GROWTH",
    minNodes: 3,
    maxNodes: 7,
  },
  {
    id: "circular-flywheel-cycle",
    label: "4. 360° Growth Flywheel",
    category: "roadmap",
    desc: "Central core engine orb surrounded by a continuous circular loop",
    badge: "CYCLE",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "horizontal-landscape-flow",
    label: "5. Horizontal Process Board (16:9)",
    category: "roadmap",
    desc: "Widescreen chevron pipeline ideal for blogs, decks & LinkedIn",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 WIDE",
    minNodes: 3,
    maxNodes: 6,
  },

  // Category 2: Timelines & Journeys
  {
    id: "alternating-spine-timeline",
    label: "6. Alternating Spine Timeline",
    category: "timeline",
    desc: "Central glowing axis with alternating left & right milestone cards",
    badge: "TIMELINE",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "horizontal-timeline-gantt",
    label: "7. Horizontal Milestone Track (16:9)",
    category: "timeline",
    desc: "Landscape timeline axis with top/bottom phase cards & progress bars",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 WIDE",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "before-after-transformation",
    label: "8. Before → Bridge → After",
    category: "timeline",
    desc: "Visual transformation from Old Problem to New Measurable Outcome",
    badge: "STORY",
    minNodes: 3,
    maxNodes: 4,
  },

  // Category 3: Pyramids, Funnels & Hierarchies
  {
    id: "isometric-3d-pyramid",
    label: "9. 3D Layered Pyramid",
    category: "hierarchy",
    desc: "Isometric 3D hierarchy pyramid with side pointer callout cards",
    badge: "3D PYRAMID",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "conversion-funnel-stages",
    label: "10. 3D Conversion Funnel",
    category: "hierarchy",
    desc: "Tapering funnel layers with stage metrics & conversion callouts",
    badge: "FUNNEL",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "pillar-temple-architecture",
    label: "11. Strategic Pillar Architecture",
    category: "hierarchy",
    desc: "Roof vision supported by vertical strategic columns & base",
    badge: "FRAMEWORK",
    minNodes: 3,
    maxNodes: 5,
  },
  {
    id: "iceberg-hidden-layers",
    label: "12. Above vs. Below Iceberg",
    category: "hierarchy",
    desc: "Waterline split showing surface tactics vs. deep hidden drivers",
    badge: "ICEBERG",
    minNodes: 3,
    maxNodes: 6,
  },

  // Category 4: Side-Image & Magazine Editorial (Supports 1 to 6 points!)
  {
    id: "side-image-editorial-split",
    label: "13. Left Visual + Editorial Guide",
    category: "side-image",
    desc: "Left framed visual + definition card, Right flowing narrative spine",
    badge: "EDITORIAL",
    minNodes: 1,
    maxNodes: 6,
  },
  {
    id: "side-image-right-spotlight",
    label: "14. Right Visual + Definition Guide",
    category: "side-image",
    desc: "Left flowing narrative breakdown + Right framed visual spotlight",
    badge: "EDITORIAL",
    minNodes: 1,
    maxNodes: 6,
  },
  {
    id: "side-image-horizontal-board",
    label: "15. Widescreen Editorial Split (16:9)",
    category: "side-image",
    desc: "Landscape magazine spread with visual showcase & narrative guide",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 IMAGE",
    minNodes: 1,
    maxNodes: 5,
  },

  // Category 5: Statistical, Charts & Data
  {
    id: "stat-donut-kpi-dashboard",
    label: "16. Radial Donut & KPI Rings",
    category: "statistical",
    desc: "Vector circular percentage gauges & bold data callout cards",
    badge: "DATA RINGS",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "stat-bento-grid",
    label: "17. Bento Data & Bar Mosaic",
    category: "statistical",
    desc: "Modern Bento grid with oversized KPIs & horizontal benchmark bars",
    badge: "BENTO",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "editorial-newspaper-digest",
    label: "18. Executive Chart & Research Brief",
    category: "statistical",
    desc: "Comparative horizontal bar chart header + structured evidence cards",
    badge: "RESEARCH",
    minNodes: 3,
    maxNodes: 6,
  },

  // Category 6: Comparisons, Battles & Matrices
  {
    id: "versus-battle-comparison",
    label: "19. Head-to-Head 'VS' Battle",
    category: "comparison",
    desc: "Central VS lightning emblem comparing Old Way vs. High-Leverage Way",
    badge: "VERSUS",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "dos-and-donts-matrix",
    label: "20. Do's & Don'ts Playbook",
    category: "comparison",
    desc: "Red mistake cards paired with green best-practice solution cards",
    badge: "DO vs DON'T",
    minNodes: 3,
    maxNodes: 6,
  },
  {
    id: "quadrant-2x2-strategy",
    label: "21. 2×2 Impact vs. Effort Matrix",
    category: "comparison",
    desc: "Four-quadrant strategic grid: Quick Wins, Big Bets, Fill-Ins, Avoid",
    badge: "2×2 MATRIX",
    minNodes: 4,
    maxNodes: 4,
  },

  // Category 7: Mind-Maps, Clusters & Anatomy
  {
    id: "radial-hub-and-spoke",
    label: "22. Radial Hub & Spoke Mind-Map",
    category: "mindmap",
    desc: "Central core thesis orb connected via Bezier curves to spoke cards",
    badge: "MIND-MAP",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "honeycomb-hex-cluster",
    label: "23. Hexagonal Honeycomb Cluster",
    category: "mindmap",
    desc: "Interlocking geometric hexagon cells with 3D icons & metric pills",
    badge: "HEXAGON",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "anatomy-x-ray-breakdown",
    label: "24. Visual Anatomy Blueprint",
    category: "mindmap",
    desc: "Central schematic diagram with numbered pointer lines to each node",
    badge: "ANATOMY",
    minNodes: 3,
    maxNodes: 8,
  },

  // Category 8: Viral Lists & Scorecards
  {
    id: "numbered-ribbon-banners",
    label: "25. 3D Folded Ribbon Banner List",
    category: "viral-list",
    desc: "High-save Pinterest/Canva style with 3D folded ribbons & icons",
    badge: "RIBBONS",
    minNodes: 3,
    maxNodes: 8,
  },
  {
    id: "checklist-audit-scorecard",
    label: "26. Interactive Audit Scorecard",
    category: "viral-list",
    desc: "Verified checkmark rows with priority severity bars & KPI targets",
    badge: "SCORECARD",
    minNodes: 3,
    maxNodes: 8,
  },
];

const TEMPLATE_CATEGORIES: {
  id: InfographicTemplateCategory;
  label: string;
}[] = [
  { id: "all", label: "All 26 Templates" },
  { id: "roadmap", label: "Roadmaps & Flows (5)" },
  { id: "timeline", label: "Timelines (3)" },
  { id: "hierarchy", label: "Pyramids & Funnels (4)" },
  { id: "side-image", label: "Editorial + Image (3)" },
  { id: "statistical", label: "Charts & Stats (3)" },
  { id: "comparison", label: "VS & Matrices (3)" },
  { id: "mindmap", label: "Mind-Maps & Hex (3)" },
  { id: "viral-list", label: "Ribbons & Lists (2)" },
];

export const ICON_OPTIONS: { id: InfographicIconId; label: string }[] = [
  { id: "rocket", label: "Rocket / Launch" },
  { id: "target", label: "Target / Goal" },
  { id: "sparkles", label: "AI / Sparkles" },
  { id: "chart", label: "Growth Chart" },
  { id: "shield", label: "Security / Trust" },
  { id: "globe", label: "Web / Global SEO" },
  { id: "brain", label: "Intelligence / Strategy" },
  { id: "layers", label: "Stack / Architecture" },
  { id: "zap", label: "Speed / Automation" },
  { id: "trophy", label: "Winner / ROI" },
  { id: "check", label: "Verified / Audit" },
  { id: "users", label: "Audience / Community" },
  { id: "magnet", label: "Lead Gen / Funnel" },
  { id: "gear", label: "System / Workflow" },
  { id: "compass", label: "Roadmap / Direction" },
  { id: "database", label: "Data / Research" },
  { id: "megaphone", label: "PR / Distribution" },
  { id: "clock", label: "Time / Efficiency" },
  { id: "lightbulb", label: "Idea / Insight" },
  { id: "award", label: "Authority / Quality" },
];

function renderSvgIcon(
  icon: InfographicIconId,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  const half = size / 2;
  const s = size / 24;
  return (
    <g
      transform={`translate(${cx - half}, ${cy - half}) scale(${s})`}
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {icon === "rocket" && (
        <>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </>
      )}
      {icon === "target" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </>
      )}
      {icon === "sparkles" && (
        <>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
        </>
      )}
      {icon === "chart" && (
        <>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
          <circle cx="19" cy="9" r="2" fill={color} />
        </>
      )}
      {icon === "shield" && (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {icon === "globe" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
      )}
      {icon === "brain" && (
        <>
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
        </>
      )}
      {icon === "layers" && (
        <>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </>
      )}
      {icon === "zap" && (
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      )}
      {icon === "trophy" && (
        <>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </>
      )}
      {icon === "check" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {icon === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {icon === "magnet" && (
        <>
          <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" />
          <path d="m5 8 4 4" />
          <path d="m12 15 4 4" />
        </>
      )}
      {icon === "gear" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </>
      )}
      {icon === "compass" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </>
      )}
      {icon === "database" && (
        <>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </>
      )}
      {icon === "megaphone" && (
        <>
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </>
      )}
      {icon === "clock" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      )}
      {icon === "lightbulb" && (
        <>
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </>
      )}
      {icon === "award" && (
        <>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </>
      )}
    </g>
  );
}

/**
 * Renders either the user's custom uploaded node image/icon OR the vector SVG icon.
 */
function renderNodeIconOrImage(
  node: InfographicNodeItem,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  if (node.customImageUrl) {
    const r = size * 0.68;
    const clipId = `node-img-clip-${node.id.replace(/[^a-zA-Z0-9_-]/g, "")}-${Math.round(cx)}-${Math.round(cy)}`;
    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        <image
          href={node.customImageUrl}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      </g>
    );
  }
  const iconId = node.icon || inferNodeIcon(node.title, 0);
  return renderSvgIcon(iconId, cx, cy, size, color);
}

const wrapSvgLines = wrapVisualText;
function parsePercentage(metric: string | undefined, idx: number): number {
  return percentageMetric(metric) ?? Math.min(96, 62 + ((idx * 11) % 34));
}

function normalizeTemplateId(
  raw: InfographicTemplateId,
): InfographicTemplateId {
  if (raw === "timeline-journey") return "alternating-spine-timeline";
  if (raw === "pyramid-funnel") return "isometric-3d-pyramid";
  if (raw === "comparison-versus") return "versus-battle-comparison";
  if (raw === "dos-and-donts") return "dos-and-donts-matrix";
  if (raw === "hub-anatomy") return "radial-hub-and-spoke";
  if (raw === "numbered-checklist") return "numbered-ribbon-banners";
  return raw;
}

export interface EditableInfographicStudioProps {
  initialTitle: string;
  initialSubtitle: string;
  initialKicker?: string;
  initialFooterBrand?: string;
  initialSourceUrl?: string;
  initialTemplate?: InfographicTemplateId;
  initialAspect?: InfographicAspectRatio;
  initialPalette?: InfographicColorPaletteId;
  initialNodes: InfographicNodeItem[];
  initialSideImageUrl?: string;
  extractedImages?: string[];
}

export function EditableInfographicStudio({
  initialTitle,
  initialSubtitle,
  initialKicker = "VISUAL INFOGRAPHIC PLAYBOOK",
  initialFooterBrand = "doitwithai.tools",
  initialSourceUrl = "https://doitwithai.tools",
  initialTemplate = "winding-s-roadmap",
  initialAspect = "vertical-poster",
  initialPalette = "royal-indigo",
  initialNodes,
  initialSideImageUrl = "",
  extractedImages = [],
}: EditableInfographicStudioProps) {
  const [template, setTemplate] = useState<InfographicTemplateId>(
    normalizeTemplateId(initialTemplate),
  );
  const [categoryFilter, setCategoryFilter] =
    useState<InfographicTemplateCategory>("all");
  const [aspect, setAspect] = useState<InfographicAspectRatio>(initialAspect);
  const [paletteId, setPaletteId] =
    useState<InfographicColorPaletteId>(initialPalette);
  const [bgWaveStyle, setBgWaveStyle] =
    useState<InfographicBgWaveStyle>("waves");
  const [customColors, setCustomColors] = useState({
    bgStart: "#0B1120",
    bgEnd: "#172554",
    cardBg: "#152238",
    accent: "#4058D0",
    accentSecondary: "#38BDF8",
    textPrimary: "#FFFFFF",
  });
  const [kicker, setKicker] = useState(initialKicker);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [footerBrand, setFooterBrand] = useState(initialFooterBrand);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [sideImageUrl, setSideImageUrl] = useState(initialSideImageUrl);
  const [nodes, setNodes] = useState<InfographicNodeItem[]>(() =>
    initialNodes.map((n, i) => ({
      ...n,
      icon: n.icon || inferNodeIcon(`${n.title} ${n.body}`, i),
    })),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // Direct In-Canvas Keyboard Editing Target ("header" | "footer" | "node" | null)
  const [canvasEditMode, setCanvasEditMode] = useState<
    "header" | "footer" | "node" | null
  >(null);
  // Interactive Canvas Zoom (0 = Fit to Screen, or 75 / 100 / 125 / 150 / 200)
  const [zoomPercent, setZoomPercent] = useState<number>(0);

  const [toast, setToast] = useState("");
  const [sectionLimitNotice, setSectionLimitNotice] = useState("");
  const [copiedImg, setCopiedImg] = useState(false);
  const [editorTab, setEditorTab] = useState<"content" | "design" | "brand">(
    "content",
  );
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageAlertRef = useRef<HTMLDivElement | null>(null);
  const inCanvasInputRef = useRef<HTMLInputElement | null>(null);
  const headlineInputRef = useRef<HTMLInputElement | null>(null);
  const sectionTitleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setSubtitle(initialSubtitle);
    if (initialKicker) setKicker(initialKicker);
    if (initialSourceUrl) setSourceUrl(initialSourceUrl);
    if (initialTemplate) setTemplate(normalizeTemplateId(initialTemplate));
    if (initialSideImageUrl !== undefined) setSideImageUrl(initialSideImageUrl);
    if (initialNodes?.length) {
      setNodes(
        initialNodes.map((n, i) => ({
          ...n,
          icon: n.icon || inferNodeIcon(`${n.title} ${n.body}`, i),
        })),
      );
    }
  }, [
    initialTitle,
    initialSubtitle,
    initialKicker,
    initialSourceUrl,
    initialTemplate,
    initialSideImageUrl,
    initialNodes,
  ]);

  // Automatically sample brand colors when an article image or brand logo is loaded
  const [detectedArticleColors, setDetectedArticleColors] = useState<{
    bgStart: string;
    cardBg: string;
    accent: string;
    accentSecondary: string;
    textPrimary: string;
  } | null>(null);

  useEffect(() => {
    const candidateImg = brandLogoUrl || sideImageUrl || extractedImages[0];
    if (!candidateImg) return;
    let cancelled = false;
    extractBrandPaletteFromImageUrl(candidateImg).then((res) => {
      if (!cancelled && res) {
        setDetectedArticleColors(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [brandLogoUrl, sideImageUrl, extractedImages]);

  const palette: InfographicColorPalette = useMemo(() => {
    if (paletteId === "custom-brand") {
      const cardLum = getRelativeLuminance(customColors.cardBg);
      const bgLum = getRelativeLuminance(customColors.bgStart);
      const avgLum = (cardLum + bgLum) / 2;
      const autoSecondary = avgLum < 0.38 ? "#E2E8F0" : "#334155";
      const accentLum = getRelativeLuminance(customColors.accent);
      return {
        id: "custom-brand",
        name: "Custom Brand Palette",
        bgStart: customColors.bgStart,
        bgEnd: customColors.bgEnd || customColors.bgStart,
        cardBg: customColors.cardBg,
        cardBorder: customColors.accent,
        textPrimary: customColors.textPrimary,
        textSecondary: autoSecondary,
        accent: customColors.accent,
        accentSecondary: customColors.accentSecondary,
        accentSoft: `${customColors.accent}26`,
        badgeText: accentLum > 0.55 ? "#0F172A" : "#FFFFFF",
      };
    }
    return (
      INFOGRAPHIC_PALETTES.find((p) => p.id === paletteId) ||
      INFOGRAPHIC_PALETTES[0]
    );
  }, [paletteId, customColors]);

  // WCAG Contrast & Text Visibility Check
  const contrastReport = useMemo(() => {
    const bgContrast = getContrastRatio(palette.bgStart, palette.textPrimary);
    const cardContrast = getContrastRatio(palette.cardBg, palette.textPrimary);
    const minContrast = Math.min(bgContrast, cardContrast);
    return {
      bgContrast,
      cardContrast,
      minContrast,
      isLowVisibility: minContrast < 4.2,
    };
  }, [palette]);

  function autoFixContrast() {
    const cardLum = getRelativeLuminance(customColors.cardBg);
    const bgLum = getRelativeLuminance(customColors.bgStart);
    const isDarkSurface = (cardLum + bgLum) / 2 < 0.42;
    setCustomColors((prev) => ({
      ...prev,
      textPrimary: isDarkSurface ? "#FFFFFF" : "#0F172A",
      cardBg: isDarkSurface
        ? prev.cardBg === prev.bgStart
          ? "#1E293B"
          : prev.cardBg
        : "#FFFFFF",
    }));
    setPaletteId("custom-brand");
    notify("Auto-adjusted text and surface contrast for crisp readability!");
  }

  const dimensions = {
    "vertical-poster": {
      w: 1080,
      h: 1920,
      label: "Vertical Infographic Poster (1080×1920)",
    },
    "pinterest-tall": {
      w: 1000,
      h: 1500,
      label: "Pinterest 2:3 Tall Pin (1000×1500)",
    },
    "portrait-social": {
      w: 1080,
      h: 1350,
      label: "LinkedIn / IG 4:5 Portrait (1080×1350)",
    },
    "horizontal-landscape": {
      w: 1600,
      h: 1000,
      label: "Horizontal Widescreen (1600×1000)",
    },
    "square-card": {
      w: 1200,
      h: 1200,
      label: "Universal 1:1 Square (1200×1200)",
    },
  }[aspect];

  const activeTemplate = useMemo(
    () =>
      INFOGRAPHIC_TEMPLATES.find(
        (t) => t.id === normalizeTemplateId(template),
      ) || INFOGRAPHIC_TEMPLATES[0],
    [template],
  );

  const minNodesForTemplate = activeTemplate.minNodes;
  const maxNodesForTemplate = activeTemplate.maxNodes;
  const canAddNode = nodes.length < maxNodesForTemplate;
  const canRemoveNode = nodes.length > minNodesForTemplate;

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === "all") return INFOGRAPHIC_TEMPLATES;
    return INFOGRAPHIC_TEMPLATES.filter((t) => t.category === categoryFilter);
  }, [categoryFilter]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3600);
  }

  function showLimitNotice(msg: string) {
    setSectionLimitNotice(msg);
    setToast(msg);
    setTimeout(() => {
      setSectionLimitNotice("");
      setToast("");
    }, 4200);
  }

  function handleSelectTemplate(tpl: InfographicTemplateMeta) {
    setTemplate(tpl.id);
    if (tpl.recommendedAspect) {
      setAspect(tpl.recommendedAspect);
    } else if (aspect === "horizontal-landscape" && !tpl.recommendedAspect) {
      setAspect("vertical-poster");
    }
    if (nodes.length > tpl.maxNodes) {
      showLimitNotice(
        `"${tpl.label.replace(/^\d+\. /, "")}" displays up to ${tpl.maxNodes} sections for a clean layout.`,
      );
    } else if (nodes.length < tpl.minNodes) {
      // Automatically pad nodes if current count is below template minimum
      setNodes((prev) => {
        const copy = [...prev];
        while (copy.length < tpl.minNodes) {
          const nextNum = copy.length + 1;
          copy.push({
            id: `node-${Date.now()}-${nextNum}`,
            badge: `0${nextNum}`,
            title: `Key Takeaway #${nextNum}`,
            body: "Summarize one clear, actionable point with concrete proof so this card fills ~80% of its space.",
            metricValue: "",
            compareRight: "",
            icon: inferNodeIcon(`step ${nextNum}`, nextNum),
          });
        }
        return copy;
      });
    }
  }

  function updateNode(
    id: string,
    field: keyof InfographicNodeItem,
    value: string,
  ) {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    );
  }

  function addNode() {
    if (!canAddNode) {
      showLimitNotice(
        `Maximum ${maxNodesForTemplate} sections allowed for "${activeTemplate.label.replace(/^\d+\. /, "")}" so cards never overflow.`,
      );
      return;
    }
    const nextNum = nodes.length + 1;
    const newId = `node-${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        id: newId,
        badge: `0${nextNum}`,
        title: `Key Takeaway #${nextNum}`,
        body: "Summarize one clear, actionable point with concrete proof so this card fills ~80% of its space.",
        metricValue: "",
        compareRight: "",
        icon: inferNodeIcon(`step ${nextNum}`, nextNum),
      },
    ]);
    setSelectedNodeId(newId);
    setCanvasEditMode("node");
    notify(`Added Section #${nextNum} (${nextNum}/${maxNodesForTemplate}).`);
  }

  function removeNode(id: string) {
    if (!canRemoveNode) {
      showLimitNotice(
        `Minimum ${minNodesForTemplate} section${minNodesForTemplate === 1 ? "" : "s"} required for "${activeTemplate.label.replace(/^\d+\. /, "")}".`,
      );
      return;
    }
    setNodes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      return filtered.map((n, idx) => ({
        ...n,
        badge: /^0?\d+$/.test(n.badge) ? `0${idx + 1}` : n.badge,
      }));
    });
    notify("Removed section and re-balanced infographic layout.");
  }

  // Zoom Helpers
  const ZOOM_STEPS = [75, 100, 125, 150, 200];
  function handleZoomIn() {
    setZoomPercent((prev) => {
      if (prev === 0) return 100;
      const next = ZOOM_STEPS.find((s) => s > prev);
      return next || 200;
    });
  }
  function handleZoomOut() {
    setZoomPercent((prev) => {
      if (prev === 0) return 75;
      const rev = [...ZOOM_STEPS].reverse().find((s) => s < prev);
      return rev || 0;
    });
  }

  async function renderSvgToCanvas(
    scale = 2,
  ): Promise<HTMLCanvasElement | null> {
    if (!svgRef.current) return null;
    return visualSvgCanvas(svgRef.current, dimensions.w, dimensions.h, scale);
  }

  async function downloadHighResPng() {
    const canvas = await renderSvgToCanvas(2);
    if (!canvas) {
      notify("Could not rasterize PNG—downloading Vector SVG instead.");
      await downloadVectorSvg();
      return;
    }
    const a = document.createElement("a");
    a.download = `infographic-${template}-${aspect}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded High-Resolution 2x Retina Infographic (.PNG)!");
  }

  async function downloadVectorSvg() {
    if (!svgRef.current) return;
    const source = await prepareVisualSvg(
      svgRef.current,
      dimensions.w,
      dimensions.h,
    );
    saveVisualBlob(
      new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
      `infographic-${template}.svg`,
    );
    notify("Downloaded Editable Vector Infographic (.SVG)!");
  }

  async function printPdfPoster() {
    const canvas = await renderSvgToCanvas(2);
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: dimensions.w > dimensions.h ? "landscape" : "portrait",
      unit: "px",
      format: [dimensions.w, dimensions.h],
    });
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      dimensions.w,
      dimensions.h,
    );
    pdf.save(`infographic-${template}.pdf`);
    notify("Downloaded Print-Ready Infographic Poster (.PDF)!");
  }

  async function runExport(action: () => void | Promise<void>) {
    setExporting(true);
    setExportError("");
    try {
      await action();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Download failed. Please try again.";
      setExportError(msg);
      setTimeout(() => {
        stageAlertRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    } finally {
      setExporting(false);
    }
  }

  async function copyInfographicImage() {
    try {
      const canvas = await renderSvgToCanvas(2);
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImg(true);
        notify("Copied High-Res Infographic Image to Clipboard!");
        setTimeout(() => setCopiedImg(false), 2200);
      });
    } catch {
      void downloadHighResPng();
    }
  }

  const W = dimensions.w;
  const H = dimensions.h;
  const padX = W >= 1400 ? 64 : 52;
  const activeNodes = nodes.slice(0, maxNodesForTemplate);
  const count = Math.max(1, activeNodes.length);

  // =========================================================================
  // STRICT OVERFLOW-SAFE HEADER & MULTI-LINE DYNAMIC INTRODUCTION GEOMETRY
  // =========================================================================
  const isHorizontal = aspect === "horizontal-landscape";
  const isSquare = aspect === "square-card";
  const isCompactCanvas = isHorizontal || isSquare;
  const logoReserveW = brandLogoUrl ? 108 : 0;
  const availHeaderW = W - padX * 2 - logoReserveW;

  // Dynamic font-size scaling so long headlines NEVER overflow the right margin
  const titleLen = (title || "").trim().length;
  const titleFontSize =
    titleLen > 68
      ? isCompactCanvas
        ? 32
        : 35
      : titleLen > 45
        ? isCompactCanvas
          ? 37
          : 41
        : isCompactCanvas
          ? 41
          : H >= 1500
            ? 47
            : 43;

  const maxTitleCharsPerLine = Math.max(
    18,
    Math.floor(availHeaderW / (titleFontSize * 0.59)),
  );
  const titleLines = wrapSvgLines(
    title,
    maxTitleCharsPerLine,
    isCompactCanvas ? 2 : 3,
  );

  // Dynamic multi-line Introduction wrapping (expands up to 5 lines on tall posters when long intro text is entered!)
  const subtitleLen = (subtitle || "").trim().length;
  const subtitleFontSize =
    subtitleLen > 240
      ? isCompactCanvas
        ? 16.5
        : 18
      : isCompactCanvas
        ? 18.5
        : 20.5;
  const maxSubtitleCharsPerLine = Math.max(
    34,
    Math.floor(availHeaderW / (subtitleFontSize * 0.52)),
  );
  const maxSubtitleLinesAllowed = isCompactCanvas
    ? subtitleLen > 140
      ? 3
      : 2
    : subtitleLen > 320
      ? 5
      : subtitleLen > 180
        ? 4
        : subtitleLen > 95
          ? 3
          : 2;
  const subtitleLines = wrapSvgLines(
    subtitle,
    maxSubtitleCharsPerLine,
    maxSubtitleLinesAllowed,
  );

  const headerH = Math.max(
    isCompactCanvas ? 194 : 236,
    118 +
      titleLines.length * (titleFontSize + 9) +
      subtitleLines.length * (subtitleFontSize + 7) +
      20,
  );
  const footerH = isCompactCanvas ? 66 : 78;
  const bodyTop = headerH;
  const bodyBottom = H - footerH - 16;
  const availH = Math.max(280, bodyBottom - bodyTop);
  const availW = W - padX * 2;

  const nodeColor = (idx: number) =>
    idx % 2 === 0 ? palette.accent : palette.accentSecondary;

  function focusHeaderInEditor() {
    setCanvasEditMode("header");
    setEditorTab("content");
    setTimeout(() => {
      inCanvasInputRef.current?.focus();
    }, 40);
  }

  function focusFooterInEditor() {
    setCanvasEditMode("footer");
    setEditorTab("brand");
    setTimeout(() => {
      inCanvasInputRef.current?.focus();
    }, 40);
  }

  function focusNodeInEditor(nodeId: string) {
    setSelectedNodeId(nodeId);
    setCanvasEditMode("node");
    setEditorTab("content");
    setTimeout(() => {
      inCanvasInputRef.current?.focus();
    }, 40);
  }

  // Render the active template inside the SVG body region
  // Every single template strictly bounds its rows inside `availH` so cards NEVER touch or overlap the footer!
  function renderInfographicBody() {
    const activeTpl = normalizeTemplateId(template);

    // Side-image editorial layouts use InfographicArtwork's non-boxed magazine spread
    if (EDITORIAL_LAYOUTS.has(activeTpl)) {
      return (
        <InfographicArtwork
          template={activeTpl}
          nodes={activeNodes}
          palette={palette}
          width={W}
          top={bodyTop}
          height={availH}
          artwork={sideImageUrl || extractedImages[0] || ""}
          selectedNodeId={
            canvasEditMode === "node" ? selectedNodeId : undefined
          }
          onSelect={(id) => focusNodeInEditor(id)}
          icon={(node, x, y, size, color) =>
            renderNodeIconOrImage(node, x, y, size, color)
          }
        />
      );
    }

    // 1. S-CURVE WINDING SNAKE ROADMAP (Auto-switches to 2-column grid if Square/Landscape with >= 6 items so it never overflows footer!)
    if (
      activeTpl === "winding-s-roadmap" &&
      !(isCompactCanvas && count >= 6)
    ) {
      const rowGap = Math.max(10, Math.min(20, Math.floor(availH * 0.018)));
      const rowH = Math.floor((availH - rowGap * (count - 1)) / count);
      const cardW = Math.floor(availW * 0.83);
      const textAvailW = cardW - 132;
      const cardTitleSize = Math.min(
        23,
        Math.max(15.5, Math.floor(rowH * 0.18)),
      );
      const cardBodySize = Math.min(
        16.5,
        Math.max(12.5, Math.floor(rowH * 0.135)),
      );
      const maxTitleChars = Math.max(
        20,
        Math.floor(
          (textAvailW - (activeNodes[0]?.metricValue ? 130 : 0)) /
            (cardTitleSize * 0.56),
        ),
      );
      const maxBodyChars = Math.max(
        30,
        Math.floor(textAvailW / (cardBodySize * 0.53)),
      );
      const titleYOffset = Math.min(
        62,
        Math.max(38, Math.floor(rowH * 0.44)),
      );
      const bodyStartYOffset = titleYOffset + Math.floor(cardTitleSize * 1.15);
      const maxBodyLines = Math.max(
        1,
        Math.min(
          3,
          Math.floor(
            (rowH - bodyStartYOffset - 8) / (cardBodySize * 1.32),
          ),
        ),
      );

      const points = activeNodes.map((_, i) => {
        const isLeft = i % 2 === 0;
        const x = isLeft ? padX + 46 : W - padX - 46;
        const y = bodyTop + i * (rowH + rowGap) + rowH / 2;
        return { x, y, isLeft };
      });

      let pathD = "";
      points.forEach((pt, i) => {
        if (i === 0) {
          pathD += `M ${pt.x} ${pt.y}`;
        } else {
          const prev = points[i - 1];
          const midY = (prev.y + pt.y) / 2;
          pathD += ` C ${prev.x} ${midY}, ${pt.x} ${midY}, ${pt.x} ${pt.y}`;
        }
      });

      return (
        <g>
          <path
            d={pathD}
            fill="none"
            stroke={palette.accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeOpacity={0.2}
          />
          <path
            d={pathD}
            fill="none"
            stroke="url(#accentGrad)"
            strokeWidth={5}
            strokeDasharray="12 8"
            strokeLinecap="round"
          />

          {activeNodes.map((node, i) => {
            const isLeft = i % 2 === 0;
            const y = bodyTop + i * (rowH + rowGap);
            const x = isLeft ? padX : W - padX - cardW;
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const tLines = wrapSvgLines(node.title, maxTitleChars, 1);
            const bLines = wrapSvgLines(node.body, maxBodyChars, maxBodyLines);
            const iconR = Math.min(32, Math.max(22, Math.floor(rowH * 0.28)));

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={rowH}
                  rx={Math.min(24, Math.floor(rowH * 0.22))}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2.2}
                  filter="url(#card3dShadow)"
                />
                {isSelected && (
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width={cardW + 8}
                    height={rowH + 8}
                    rx={Math.min(26, Math.floor(rowH * 0.24))}
                    fill="none"
                    stroke="#5271ff"
                    strokeWidth={2.5}
                    strokeDasharray="8 5"
                  />
                )}
                <rect
                  x={isLeft ? x : x + cardW - 12}
                  y={y}
                  width={12}
                  height={rowH}
                  rx={6}
                  fill={col}
                />

                {/* 3D Medallion Icon or Custom Uploaded Image */}
                <circle
                  cx={x + 56}
                  cy={y + rowH / 2}
                  r={iconR}
                  fill={`${col}20`}
                  stroke={col}
                  strokeWidth={2.2}
                />
                {renderNodeIconOrImage(
                  node,
                  x + 56,
                  y + rowH / 2,
                  Math.floor(iconR * 0.88),
                  col,
                )}

                {/* Step Number Pill */}
                {rowH >= 96 && (
                  <>
                    <rect
                      x={x + 104}
                      y={y + 10}
                      width={76}
                      height={22}
                      rx={11}
                      fill={col}
                    />
                    <text
                      x={x + 142}
                      y={y + 25}
                      textAnchor="middle"
                      fill={palette.badgeText}
                      fontSize={12}
                      fontWeight={900}
                    >
                      STEP {node.badge || `0${i + 1}`}
                    </text>
                  </>
                )}

                {node.metricValue && (
                  <g>
                    <rect
                      x={x + cardW - 144}
                      y={y + 10}
                      width={122}
                      height={24}
                      rx={12}
                      fill={palette.accentSoft}
                      stroke={col}
                      strokeWidth={1.5}
                    />
                    <text
                      x={x + cardW - 83}
                      y={y + 26}
                      textAnchor="middle"
                      fill={col}
                      fontSize={12.5}
                      fontWeight={800}
                    >
                      {node.metricValue.slice(0, 12)}
                    </text>
                  </g>
                )}

                <text
                  x={x + 104}
                  y={y + titleYOffset}
                  fill={palette.textPrimary}
                  fontSize={cardTitleSize}
                  fontWeight={800}
                >
                  {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={x + 104}
                    y={y + bodyStartYOffset + li * (cardBodySize * 1.3)}
                    fill={palette.textSecondary}
                    fontSize={cardBodySize}
                    fontWeight={500}
                  >
                    {line}
                  </text>
                ))}

                {/* Opposite Side Milestone Pin */}
                <circle
                  cx={isLeft ? W - padX - 46 : padX + 46}
                  cy={y + rowH / 2}
                  r={Math.min(24, Math.floor(rowH * 0.24))}
                  fill={col}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={isLeft ? W - padX - 46 : padX + 46}
                  y={y + rowH / 2 + 6}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={16}
                  fontWeight={900}
                >
                  {node.badge || `0${i + 1}`}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // 2. ISOMETRIC 3D LAYERED PYRAMID
    if (activeTpl === "isometric-3d-pyramid") {
      const pyrCenterX = Math.floor(W * 0.34);
      const pyrTopY = bodyTop + 10;
      const pyrBottomY = bodyBottom - 10;
      const pyrH = pyrBottomY - pyrTopY;
      const tierGap = 8;
      const tierH = Math.floor((pyrH - tierGap * (count - 1)) / count);
      const maxHalfW = Math.floor(availW * 0.27);
      const cardX = Math.floor(W * 0.6);
      const cardW = W - padX - cardX;
      const titleFont = Math.min(19, Math.max(15, Math.floor(tierH * 0.2)));
      const bodyFont = Math.min(15, Math.max(12.5, Math.floor(tierH * 0.14)));
      const titleChars = Math.max(18, Math.floor((cardW - 76) / 10.5));
      const bodyChars = Math.max(24, Math.floor((cardW - 36) / 8.2));
      const maxLines = Math.max(
        1,
        Math.min(3, Math.floor((tierH - 50) / (bodyFont * 1.32))),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const y1 = pyrTopY + i * (tierH + tierGap);
            const y2 = y1 + tierH;
            const r1 = (i + 0.35) / count;
            const r2 = (i + 1) / count;
            const w1 = Math.max(36, Math.floor(maxHalfW * r1));
            const w2 = Math.max(64, Math.floor(maxHalfW * r2));
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const tLines = wrapSvgLines(node.title, titleChars, 1);
            const bLines = wrapSvgLines(node.body, bodyChars, maxLines);

            const leftPoly = `${pyrCenterX},${y1} ${pyrCenterX - w1},${y1 + 10} ${pyrCenterX - w2},${y2} ${pyrCenterX},${y2 + 10}`;
            const rightPoly = `${pyrCenterX},${y1} ${pyrCenterX + w1},${y1 + 10} ${pyrCenterX + w2},${y2} ${pyrCenterX},${y2 + 10}`;

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <polygon
                  points={leftPoly}
                  fill={col}
                  fillOpacity={0.92}
                  stroke={palette.bgStart}
                  strokeWidth={2}
                  filter="url(#card3dShadow)"
                />
                <polygon
                  points={rightPoly}
                  fill={col}
                  fillOpacity={0.68}
                  stroke={palette.bgStart}
                  strokeWidth={2}
                />
                <text
                  x={pyrCenterX}
                  y={(y1 + y2) / 2 + 8}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={19}
                  fontWeight={900}
                >
                  {node.badge || `0${i + 1}`}
                </text>

                <line
                  x1={pyrCenterX + (w1 + w2) / 2 - 6}
                  y1={(y1 + y2) / 2}
                  x2={cardX}
                  y2={(y1 + y2) / 2}
                  stroke={col}
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                />
                <circle cx={cardX} cy={(y1 + y2) / 2} r={6} fill={col} />

                <rect
                  x={cardX}
                  y={y1}
                  width={cardW}
                  height={tierH}
                  rx={16}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2}
                  filter="url(#card3dShadow)"
                />
                <circle
                  cx={cardX + 30}
                  cy={y1 + 30}
                  r={18}
                  fill={`${col}25`}
                />
                {renderNodeIconOrImage(node, cardX + 30, y1 + 30, 18, col)}

                <text
                  x={cardX + 56}
                  y={y1 + 35}
                  fill={palette.textPrimary}
                  fontSize={titleFont}
                  fontWeight={800}
                >
                  {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 20}
                    y={y1 + 60 + li * (bodyFont * 1.3)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 3. CONVERSION FUNNEL STAGES
    if (activeTpl === "conversion-funnel-stages") {
      const rowGap = 12;
      const tierH = Math.floor((availH - rowGap * (count - 1)) / count);
      const funnelCenterX = Math.floor(W * 0.34);
      const maxTopW = Math.floor(availW * 0.54);
      const minBotW = Math.floor(availW * 0.22);
      const cardX = Math.floor(W * 0.61);
      const cardW = W - padX - cardX;
      const bodyFont = Math.min(15, Math.max(12.5, Math.floor(tierH * 0.145)));
      const bChars = Math.max(24, Math.floor((cardW - 36) / 8.5));
      const bMaxLines = Math.max(
        1,
        Math.min(3, Math.floor((tierH - 44) / (bodyFont * 1.32))),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const y1 = bodyTop + i * (tierH + rowGap);
            const y2 = y1 + tierH;
            const wTop = maxTopW - ((maxTopW - minBotW) * i) / count;
            const wBot = maxTopW - ((maxTopW - minBotW) * (i + 0.85)) / count;
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const poly = `${funnelCenterX - wTop / 2},${y1} ${funnelCenterX + wTop / 2},${y1} ${funnelCenterX + wBot / 2},${y2} ${funnelCenterX - wBot / 2},${y2}`;
            const tLines = wrapSvgLines(node.title, 20, 1);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <polygon
                  points={poly}
                  fill={col}
                  fillOpacity={0.9 - i * 0.05}
                  stroke={palette.textPrimary}
                  strokeOpacity={0.3}
                  strokeWidth={2}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={funnelCenterX}
                  y={(y1 + y2) / 2 - 2}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={18}
                  fontWeight={900}
                >
                  {tLines[0]}
                </text>
                <text
                  x={funnelCenterX}
                  y={(y1 + y2) / 2 + 19}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={14}
                  fontWeight={700}
                >
                  {node.metricValue || `Stage 0${i + 1}`}
                </text>

                <line
                  x1={funnelCenterX + wTop / 2}
                  y1={(y1 + y2) / 2}
                  x2={cardX}
                  y2={(y1 + y2) / 2}
                  stroke={col}
                  strokeWidth={2.5}
                />
                <rect
                  x={cardX}
                  y={y1}
                  width={cardW}
                  height={tierH}
                  rx={16}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={cardX + 20}
                  y={y1 + 28}
                  fill={col}
                  fontSize={13.5}
                  fontWeight={900}
                >
                  STAGE 0{i + 1} · {node.title.slice(0, 26)}
                </text>
                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 20}
                    y={y1 + 50 + li * (bodyFont * 1.32)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 4. ALTERNATING SPINE TIMELINE
    if (activeTpl === "alternating-spine-timeline") {
      const centerX = Math.floor(W / 2);
      const rowGap = Math.max(10, Math.min(16, Math.floor(availH * 0.018)));
      const rowH = Math.floor((availH - rowGap * (count - 1)) / count);
      const cardW = Math.floor(availW / 2 - 46);
      const titleFont = Math.min(19, Math.max(15, Math.floor(rowH * 0.2)));
      const bodyFont = Math.min(15, Math.max(12.5, Math.floor(rowH * 0.145)));
      const tChars = Math.max(20, Math.floor((cardW - 84) / (titleFont * 0.56)));
      const bChars = Math.max(26, Math.floor((cardW - 40) / (bodyFont * 0.54)));
      const bMaxLines = Math.max(
        1,
        Math.min(3, Math.floor((rowH - 50) / (bodyFont * 1.32))),
      );

      return (
        <g>
          <line
            x1={centerX}
            y1={bodyTop + 16}
            x2={centerX}
            y2={bodyBottom - 16}
            stroke={palette.accent}
            strokeWidth={6}
            strokeLinecap="round"
          />

          {activeNodes.map((node, i) => {
            const isLeft = i % 2 === 0;
            const y = bodyTop + i * (rowH + rowGap);
            const cy = y + rowH / 2;
            const cardX = isLeft ? padX : centerX + 46;
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const tLines = wrapSvgLines(node.title, tChars, 1);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <line
                  x1={centerX}
                  y1={cy}
                  x2={isLeft ? cardX + cardW : cardX}
                  y2={cy}
                  stroke={col}
                  strokeWidth={3}
                />
                <circle
                  cx={centerX}
                  cy={cy}
                  r={Math.min(22, Math.floor(rowH * 0.24))}
                  fill={col}
                  stroke={palette.bgStart}
                  strokeWidth={4}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={centerX}
                  y={cy + 5}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={14}
                  fontWeight={900}
                >
                  {node.badge || `0${i + 1}`}
                </text>

                <rect
                  x={cardX}
                  y={y}
                  width={cardW}
                  height={rowH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2.2}
                  filter="url(#card3dShadow)"
                />
                <circle cx={cardX + 30} cy={y + 30} r={18} fill={`${col}22`} />
                {renderNodeIconOrImage(node, cardX + 30, y + 30, 18, col)}

                <text
                  x={cardX + 58}
                  y={y + 35}
                  fill={palette.textPrimary}
                  fontSize={titleFont}
                  fontWeight={800}
                >
                  {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 22}
                    y={y + 58 + li * (bodyFont * 1.32)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 5. RADIAL DONUT GAUGE & KPI DASHBOARD (Strictly bounded inside availH!)
    if (activeTpl === "stat-donut-kpi-dashboard") {
      const cols = isHorizontal ? 3 : 2;
      const rows = Math.ceil(count / cols);
      const gap = 20;
      const cardW = Math.floor((availW - gap * (cols - 1)) / cols);
      const cardH = Math.floor((availH - gap * (rows - 1)) / rows);
      const radius = Math.min(42, Math.max(28, Math.floor(cardH * 0.2)));
      const circum = 2 * Math.PI * radius;
      const titleFont = Math.min(20, Math.max(16, Math.floor(cardH * 0.1)));
      const bodyFont = Math.min(15.5, Math.max(13, Math.floor(cardH * 0.08)));
      const tChars = Math.max(16, Math.floor((cardW - 140) / (titleFont * 0.56)));
      const bChars = Math.max(26, Math.floor((cardW - 48) / (bodyFont * 0.54)));
      const bodyTopOffset = Math.min(132, Math.max(94, radius * 2 + 34));
      const bMaxLines = Math.max(
        1,
        Math.min(
          4,
          Math.floor((cardH - bodyTopOffset - 14) / (bodyFont * 1.35)),
        ),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const colIdx = i % cols;
            const rowIdx = Math.floor(i / cols);
            const x = padX + colIdx * (cardW + gap);
            const y = bodyTop + rowIdx * (cardH + gap);
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const pct = parsePercentage(node.metricValue, i);
            const dash = (pct / 100) * circum;
            const tLines = wrapSvgLines(node.title, tChars, 2);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={22}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2.2}
                  filter="url(#card3dShadow)"
                />
                <g transform={`translate(${x + 22 + radius}, ${y + 22 + radius})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    fill="none"
                    stroke={palette.textSecondary}
                    strokeOpacity={0.2}
                    strokeWidth={9}
                  />
                  <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    fill="none"
                    stroke={col}
                    strokeWidth={9}
                    strokeDasharray={`${dash} ${circum}`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                  />
                  <text
                    x={0}
                    y={6}
                    textAnchor="middle"
                    fill={palette.textPrimary}
                    fontSize={Math.max(14, Math.floor(radius * 0.42))}
                    fontWeight={900}
                  >
                    {node.metricValue
                      ? node.metricValue.slice(0, 6)
                      : `${pct}%`}
                  </text>
                </g>

                {tLines.map((line, ti) => (
                  <text
                    key={ti}
                    x={x + radius * 2 + 40}
                    y={y + 44 + ti * (titleFont * 1.22)}
                    fill={palette.textPrimary}
                    fontSize={titleFont}
                    fontWeight={800}
                  >
                    {line}
                  </text>
                ))}

                {bLines.map((line, bi) => (
                  <text
                    key={bi}
                    x={x + 24}
                    y={y + bodyTopOffset + bi * (bodyFont * 1.35)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 6. RADIAL HUB & SPOKE MIND-MAP / CIRCULAR FLYWHEEL (Zero Empty Vertical Gap!)
    if (
      activeTpl === "radial-hub-and-spoke" ||
      activeTpl === "circular-flywheel-cycle"
    ) {
      const centerX = Math.floor(W / 2);
      const centerY = Math.floor(bodyTop + availH / 2);

      const leftNodes = activeNodes.filter((_, idx) => idx % 2 === 0);
      const rightNodes = activeNodes.filter((_, idx) => idx % 2 === 1);
      const cardW = Math.floor(availW * (isHorizontal ? 0.35 : 0.37));
      const maxColCount = Math.max(leftNodes.length, rightNodes.length, 1);
      const cardGap = 22;
      // Fill the available height proportionally instead of capping at 210px!
      const rawCardH = Math.floor(
        (availH - 16 - cardGap * (maxColCount - 1)) / maxColCount,
      );
      const cardH = Math.min(360, Math.max(110, rawCardH));
      const hubR = isHorizontal ? 84 : 76;

      const titleFont = Math.min(22, Math.max(16.5, Math.floor(cardH * 0.085)));
      const bodyFont = Math.min(16.5, Math.max(13.5, Math.floor(cardH * 0.068)));
      const tChars = Math.max(18, Math.floor((cardW - 76) / (titleFont * 0.56)));
      const bChars = Math.max(24, Math.floor((cardW - 40) / (bodyFont * 0.53)));
      const bMaxLines = Math.max(
        2,
        Math.min(
          6,
          Math.floor((cardH - 68 - titleFont * 1.8) / (bodyFont * 1.38)),
        ),
      );

      const renderColumnNode = (
        node: InfographicNodeItem,
        globalIdx: number,
        colIdx: number,
        totalInCol: number,
        isLeft: boolean,
      ) => {
        const colTotalH = totalInCol * cardH + (totalInCol - 1) * cardGap;
        // Start right below the header (small 12px top padding) so there is NO dead empty gap under the Introduction!
        const startY =
          bodyTop + Math.min(28, Math.max(8, Math.floor((availH - colTotalH) / 2)));
        const x = isLeft ? padX : W - padX - cardW;
        const y = startY + colIdx * (cardH + cardGap);
        const anchorX = isLeft ? x + cardW : x;
        const anchorY = y + cardH / 2;
        const col = nodeColor(globalIdx);
        const tLines = wrapSvgLines(node.title, tChars, 2);
        const bLines = wrapSvgLines(node.body, bChars, bMaxLines);
        const isSelected =
          canvasEditMode === "node" && selectedNodeId === node.id;

        const hubEdgeX = isLeft ? centerX - hubR + 8 : centerX + hubR - 8;
        const midX = (hubEdgeX + anchorX) / 2;
        const bezierD = `M ${hubEdgeX} ${centerY} C ${midX} ${centerY}, ${midX} ${anchorY}, ${anchorX} ${anchorY}`;

        return (
          <g
            key={node.id}
            onClick={() => focusNodeInEditor(node.id)}
            style={{ cursor: "pointer" }}
          >
            <path
              d={bezierD}
              fill="none"
              stroke={col}
              strokeWidth={3.5}
              strokeOpacity={0.75}
            />
            <circle cx={anchorX} cy={anchorY} r={6} fill={col} />
            <rect
              x={x}
              y={y}
              width={cardW}
              height={cardH}
              rx={22}
              fill={palette.cardBg}
              stroke={isSelected ? "#5271ff" : col}
              strokeWidth={isSelected ? 4 : 2.4}
              filter="url(#card3dShadow)"
            />
            {isSelected && (
              <rect
                x={x - 4}
                y={y - 4}
                width={cardW + 8}
                height={cardH + 8}
                rx={25}
                fill="none"
                stroke="#5271ff"
                strokeWidth={2.5}
                strokeDasharray="8 5"
              />
            )}
            <circle cx={x + 34} cy={y + 36} r={21} fill={col} />
            {renderNodeIconOrImage(
              node,
              x + 34,
              y + 36,
              20,
              palette.badgeText,
            )}
            {tLines.map((tl, ti) => (
              <text
                key={ti}
                x={x + 64}
                y={y + 34 + ti * (titleFont * 1.2)}
                fill={palette.textPrimary}
                fontSize={titleFont}
                fontWeight={800}
              >
                {tl}
              </text>
            ))}
            {bLines.map((line, bi) => (
              <text
                key={bi}
                x={x + 22}
                y={
                  y +
                  52 +
                  tLines.length * (titleFont * 1.2) +
                  bi * (bodyFont * 1.38)
                }
                fill={palette.textSecondary}
                fontSize={bodyFont}
                fontWeight={500}
              >
                {line}
              </text>
            ))}
          </g>
        );
      };

      return (
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={hubR + 28}
            fill="none"
            stroke={palette.accent}
            strokeOpacity={0.22}
            strokeWidth={3}
            strokeDasharray="8 6"
          />

          {leftNodes.map((n, idx) =>
            renderColumnNode(n, idx * 2, idx, leftNodes.length, true),
          )}
          {rightNodes.map((n, idx) =>
            renderColumnNode(n, idx * 2 + 1, idx, rightNodes.length, false),
          )}

          <circle
            cx={centerX}
            cy={centerY}
            r={hubR}
            fill={palette.cardBg}
            stroke={palette.accent}
            strokeWidth={5}
            filter="url(#card3dShadow)"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={hubR - 12}
            fill="url(#accentGrad)"
            fillOpacity={0.22}
          />
          {renderSvgIcon("layers", centerX, centerY - 22, 32, palette.accent)}
          <text
            x={centerX}
            y={centerY + 14}
            textAnchor="middle"
            fill={palette.textPrimary}
            fontSize={16}
            fontWeight={900}
          >
            CORE SYSTEM
          </text>
          <text
            x={centerX}
            y={centerY + 35}
            textAnchor="middle"
            fill={palette.accent}
            fontSize={13.5}
            fontWeight={800}
          >
            {count} Connected Pillars
          </text>
        </g>
      );
    }

    // 7. VERSUS BATTLE COMPARISON OR DO'S & DON'TS PLAYBOOK
    if (
      activeTpl === "versus-battle-comparison" ||
      activeTpl === "dos-and-donts-matrix"
    ) {
      const isDos = activeTpl === "dos-and-donts-matrix";
      const gap = 36;
      const colW = Math.floor((availW - gap) / 2);
      const rowsTop = bodyTop + 60;
      const rowGap = 14;
      const rowH = Math.floor(
        (availH - 60 - rowGap * (count - 1)) / count,
      );
      const titleFont = Math.min(17.5, Math.max(14, Math.floor(rowH * 0.18)));
      const bodyFont = Math.min(14.5, Math.max(12, Math.floor(rowH * 0.14)));
      const bChars = Math.max(24, Math.floor((colW - 40) / (bodyFont * 0.55)));
      const bMaxLines = Math.max(
        1,
        Math.min(3, Math.floor((rowH - 46) / (bodyFont * 1.32))),
      );

      return (
        <g>
          <rect
            x={padX}
            y={bodyTop}
            width={colW}
            height={46}
            rx={14}
            fill="rgba(244, 63, 94, 0.18)"
            stroke="#F43F5E"
            strokeWidth={2}
          />
          <text
            x={padX + colW / 2}
            y={bodyTop + 29}
            textAnchor="middle"
            fill="#F43F5E"
            fontSize={17}
            fontWeight={900}
          >
            {isDos ? "✗ COMMON MISTAKES TO AVOID" : "◀ LEGACY / OLD WORKFLOW"}
          </text>

          <rect
            x={padX + colW + gap}
            y={bodyTop}
            width={colW}
            height={46}
            rx={14}
            fill="rgba(16, 185, 129, 0.18)"
            stroke="#10B981"
            strokeWidth={2}
          />
          <text
            x={padX + colW + gap + colW / 2}
            y={bodyTop + 29}
            textAnchor="middle"
            fill="#10B981"
            fontSize={17}
            fontWeight={900}
          >
            {isDos
              ? "✓ HIGH-IMPACT BEST PRACTICES"
              : "▶ AI-FIRST HIGH-LEVERAGE WAY"}
          </text>

          {activeNodes.map((node, i) => {
            const y = rowsTop + i * (rowH + rowGap);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const leftLines = wrapSvgLines(node.body, bChars, bMaxLines);
            const rightText =
              node.compareRight ||
              `Apply ${node.title.toLowerCase()} with verified benchmarks and structured execution.`;
            const rightLines = wrapSvgLines(rightText, bChars, bMaxLines);

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={padX}
                  y={y}
                  width={colW}
                  height={rowH}
                  rx={16}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : "#F43F5E"}
                  strokeOpacity={isSelected ? 1 : 0.65}
                  strokeWidth={isSelected ? 3.5 : 2}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={padX + 20}
                  y={y + 30}
                  fill="#F43F5E"
                  fontSize={titleFont}
                  fontWeight={800}
                >
                  ✗ {node.title.slice(0, 32)}
                </text>
                {leftLines.map((l, li) => (
                  <text
                    key={li}
                    x={padX + 20}
                    y={y + 52 + li * (bodyFont * 1.32)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {l}
                  </text>
                ))}

                <circle
                  cx={W / 2}
                  cy={y + rowH / 2}
                  r={17}
                  fill={palette.accent}
                />
                <text
                  x={W / 2}
                  y={y + rowH / 2 + 5}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={12}
                  fontWeight={900}
                >
                  {isDos ? "→" : "VS"}
                </text>

                <rect
                  x={padX + colW + gap}
                  y={y}
                  width={colW}
                  height={rowH}
                  rx={16}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : "#10B981"}
                  strokeWidth={isSelected ? 3.5 : 2.5}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={padX + colW + gap + 20}
                  y={y + 30}
                  fill="#10B981"
                  fontSize={titleFont}
                  fontWeight={800}
                >
                  ✓ Winning Play #{i + 1}{" "}
                  {node.metricValue ? `(${node.metricValue})` : ""}
                </text>
                {rightLines.map((l, li) => (
                  <text
                    key={li}
                    x={padX + colW + gap + 20}
                    y={y + 52 + li * (bodyFont * 1.32)}
                    fill={palette.textPrimary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {l}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 8. 3D ASCENDING GROWTH STAIRCASE
    if (activeTpl === "step-staircase-ascension") {
      const stepW = Math.floor(availW * 0.72);
      const maxOffset = availW - stepW;
      const rowGap = 12;
      const stepH = Math.floor((availH - rowGap * (count - 1)) / count);
      const titleFont = Math.min(20, Math.max(15.5, Math.floor(stepH * 0.2)));
      const bodyFont = Math.min(15.5, Math.max(12.5, Math.floor(stepH * 0.145)));
      const tChars = Math.max(22, Math.floor((stepW - 116) / (titleFont * 0.56)));
      const bChars = Math.max(30, Math.floor((stepW - 116) / (bodyFont * 0.54)));
      const bMaxLines = Math.max(
        1,
        Math.min(3, Math.floor((stepH - 48) / (bodyFont * 1.32))),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const x =
              padX + Math.floor((maxOffset * i) / Math.max(1, count - 1));
            const y = bodyTop + i * (stepH + rowGap);
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const tLines = wrapSvgLines(node.title, tChars, 1);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x + 8}
                  y={y + 8}
                  width={stepW}
                  height={stepH}
                  rx={18}
                  fill={col}
                  fillOpacity={0.25}
                />
                <rect
                  x={x}
                  y={y}
                  width={stepW}
                  height={stepH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2.5}
                  filter="url(#card3dShadow)"
                />
                <rect
                  x={x + 16}
                  y={y + 14}
                  width={60}
                  height={Math.max(40, stepH - 28)}
                  rx={13}
                  fill={col}
                />
                {renderNodeIconOrImage(
                  node,
                  x + 46,
                  y + stepH / 2 - 8,
                  20,
                  palette.badgeText,
                )}
                <text
                  x={x + 46}
                  y={y + stepH / 2 + 18}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={14}
                  fontWeight={900}
                >
                  0{i + 1}
                </text>

                <text
                  x={x + 94}
                  y={y + 34}
                  fill={palette.textPrimary}
                  fontSize={titleFont}
                  fontWeight={800}
                >
                  {tLines[0]}
                </text>
                {bLines.map((l, li) => (
                  <text
                    key={li}
                    x={x + 94}
                    y={y + 56 + li * (bodyFont * 1.32)}
                    fill={palette.textSecondary}
                    fontSize={bodyFont}
                    fontWeight={500}
                  >
                    {l}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 9. EDITORIAL NEWSPAPER / HORIZONTAL BAR CHART BRIEF
    if (activeTpl === "editorial-newspaper-digest") {
      const chartH = Math.floor(availH * 0.34);
      const gridTop = bodyTop + chartH + 20;
      const gridAvailH = availH - chartH - 20;
      const cols = 2;
      const rows = Math.ceil(count / cols);
      const gap = 16;
      const cardW = Math.floor((availW - gap) / cols);
      const cardH = Math.floor((gridAvailH - gap * (rows - 1)) / rows);
      const tChars = Math.max(20, Math.floor((cardW - 44) / 10.5));
      const bChars = Math.max(26, Math.floor((cardW - 44) / 8.2));
      const bMaxLines = Math.max(
        1,
        Math.min(3, Math.floor((cardH - 48) / 19)),
      );

      return (
        <g>
          <rect
            x={padX}
            y={bodyTop}
            width={availW}
            height={chartH}
            rx={22}
            fill={palette.cardBg}
            stroke={palette.accent}
            strokeWidth={2}
            filter="url(#card3dShadow)"
          />
          <text
            x={padX + 28}
            y={bodyTop + 34}
            fill={palette.accent}
            fontSize={15}
            fontWeight={900}
          >
            COMPARATIVE IMPACT &amp; BENCHMARK DISTRIBUTION
          </text>

          {activeNodes.slice(0, 5).map((node, i) => {
            const by = bodyTop + 50 + i * Math.floor((chartH - 60) / 5);
            const pct = parsePercentage(node.metricValue, i);
            const maxBarW = availW - 360;
            const barW = Math.floor((maxBarW * pct) / 100);
            const col = nodeColor(i);
            return (
              <g
                key={`bar-${node.id}`}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <text
                  x={padX + 28}
                  y={by + 16}
                  fill={palette.textPrimary}
                  fontSize={14.5}
                  fontWeight={700}
                >
                  {node.title.slice(0, 26)}
                </text>
                <rect
                  x={padX + 260}
                  y={by}
                  width={maxBarW}
                  height={18}
                  rx={9}
                  fill={palette.bgStart}
                />
                <rect
                  x={padX + 260}
                  y={by}
                  width={barW}
                  height={18}
                  rx={9}
                  fill={col}
                />
                <text
                  x={padX + 272 + barW}
                  y={by + 14}
                  fill={palette.textPrimary}
                  fontSize={13}
                  fontWeight={800}
                >
                  {node.metricValue || `${pct}%`}
                </text>
              </g>
            );
          })}

          {activeNodes.map((node, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = padX + c * (cardW + gap);
            const y = gridTop + r * (cardH + gap);
            const col = nodeColor(i);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;
            const tLines = wrapSvgLines(node.title, tChars, 1);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);
            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={16}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2}
                  filter="url(#card3dShadow)"
                />
                <text
                  x={x + 20}
                  y={y + 30}
                  fill={col}
                  fontSize={17}
                  fontWeight={800}
                >
                  {node.badge || `0${i + 1}`}. {tLines[0]}
                </text>
                {bLines.map((l, li) => (
                  <text
                    key={li}
                    x={x + 20}
                    y={y + 54 + li * 19}
                    fill={palette.textSecondary}
                    fontSize={14}
                    fontWeight={500}
                  >
                    {l}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      );
    }

    // 10. BENTO MOSAIC, HEXAGON CLUSTER, 2x2 QUADRANT, PILLAR TEMPLE, HORIZONTAL BOARD, OR COMPACT S-ROADMAP
    if (
      activeTpl === "stat-bento-grid" ||
      activeTpl === "honeycomb-hex-cluster" ||
      activeTpl === "quadrant-2x2-strategy" ||
      activeTpl === "pillar-temple-architecture" ||
      activeTpl === "horizontal-landscape-flow" ||
      activeTpl === "horizontal-timeline-gantt" ||
      (activeTpl === "winding-s-roadmap" && isCompactCanvas && count >= 6)
    ) {
      const cols =
        activeTpl === "quadrant-2x2-strategy"
          ? 2
          : isHorizontal && count >= 6
            ? 3
            : 2;
      const rows = Math.ceil(count / cols);
      const gap = 20;
      const cardW = Math.floor((availW - gap * (cols - 1)) / cols);
      // Strictly bound cardH inside availH so the bottom row NEVER touches the footer!
      const cardH = Math.floor((availH - gap * (rows - 1)) / rows);

      const titleSize = Math.min(23, Math.max(16.5, Math.floor(cardH * 0.095)));
      const bodySize = Math.min(17, Math.max(13, Math.floor(cardH * 0.072)));
      const tChars = Math.max(
        18,
        Math.floor((cardW - 48) / (titleSize * 0.56)),
      );
      const bChars = Math.max(
        24,
        Math.floor((cardW - 48) / (bodySize * 0.53)),
      );
      const titleStartY = Math.min(88, Math.max(66, Math.floor(cardH * 0.34)));
      const bodyStartY =
        titleStartY + Math.floor(titleSize * 1.25) + 4;
      const bMaxLines = Math.max(
        1,
        Math.min(
          5,
          Math.floor((cardH - bodyStartY - 26) / (bodySize * 1.35)),
        ),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = padX + c * (cardW + gap);
            const y = bodyTop + r * (cardH + gap);
            const col = nodeColor(i);
            const pct = parsePercentage(node.metricValue, i);
            const tLines = wrapSvgLines(node.title, tChars, 2);
            const bLines = wrapSvgLines(node.body, bChars, bMaxLines);
            const isSelected =
              canvasEditMode === "node" && selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                onClick={() => focusNodeInEditor(node.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={activeTpl === "honeycomb-hex-cluster" ? 32 : 22}
                  fill={palette.cardBg}
                  stroke={isSelected ? "#5271ff" : col}
                  strokeWidth={isSelected ? 4 : 2.4}
                  filter="url(#card3dShadow)"
                />
                {isSelected && (
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width={cardW + 8}
                    height={cardH + 8}
                    rx={26}
                    fill="none"
                    stroke="#5271ff"
                    strokeWidth={2.5}
                    strokeDasharray="8 5"
                  />
                )}

                <circle
                  cx={x + 38}
                  cy={y + 36}
                  r={22}
                  fill={`${col}24`}
                  stroke={col}
                  strokeWidth={2}
                />
                {renderNodeIconOrImage(node, x + 38, y + 36, 20, col)}

                <text
                  x={x + cardW - 22}
                  y={y + 42}
                  textAnchor="end"
                  fill={col}
                  fontSize={Math.min(22, Math.max(16, titleSize))}
                  fontWeight={900}
                >
                  {node.metricValue || node.badge || `0${i + 1}`}
                </text>

                {tLines.map((l, ti) => (
                  <text
                    key={ti}
                    x={x + 24}
                    y={y + titleStartY + ti * (titleSize * 1.22)}
                    fill={palette.textPrimary}
                    fontSize={titleSize}
                    fontWeight={800}
                  >
                    {l}
                  </text>
                ))}

                {bLines.map((l, bi) => (
                  <text
                    key={bi}
                    x={x + 24}
                    y={
                      y +
                      titleStartY +
                      tLines.length * (titleSize * 1.22) +
                      4 +
                      bi * (bodySize * 1.35)
                    }
                    fill={palette.textSecondary}
                    fontSize={bodySize}
                    fontWeight={500}
                  >
                    {l}
                  </text>
                ))}

                <rect
                  x={x + 24}
                  y={y + cardH - 18}
                  width={cardW - 48}
                  height={7}
                  rx={3.5}
                  fill={palette.bgStart}
                  fillOpacity={0.5}
                />
                <rect
                  x={x + 24}
                  y={y + cardH - 18}
                  width={Math.floor(((cardW - 48) * pct) / 100)}
                  height={7}
                  rx={3.5}
                  fill={col}
                />
              </g>
            );
          })}
        </g>
      );
    }

    // 11. DEFAULT & RIBBON BANNERS / STEP ROADMAP / ICEBERG / ANATOMY / SCORECARD
    // Automatically uses a 2-column balanced layout on Square (1200x1200) or Landscape (1600x1000) when >= 5 items
    // so the bottom cards NEVER overflow into the footer!
    const useTwoColGrid =
      (isCompactCanvas && count >= 5) || availH / count < 112;
    const cols = useTwoColGrid ? 2 : 1;
    const rows = Math.ceil(count / cols);
    const colGap = 22;
    const rowGap = useTwoColGrid ? 18 : Math.max(12, Math.min(18, Math.floor(availH * 0.018)));
    const cardW = Math.floor((availW - colGap * (cols - 1)) / cols);
    const rowH = Math.floor((availH - rowGap * (rows - 1)) / rows);

    const isRibbon = activeTpl === "numbered-ribbon-banners";
    const textAvailW = cardW - 128;
    const titleSize = Math.min(22, Math.max(16, Math.floor(rowH * 0.175)));
    const bodySize = Math.min(16, Math.max(13, Math.floor(rowH * 0.13)));
    const tChars = Math.max(
      18,
      Math.floor(
        (textAvailW - (activeNodes[0]?.metricValue ? 120 : 0)) /
          (titleSize * 0.56),
      ),
    );
    const bChars = Math.max(24, Math.floor(textAvailW / (bodySize * 0.53)));
    const titleBaselineOffset = Math.min(
      40,
      Math.max(28, Math.floor(rowH * 0.32)),
    );
    const bodyBaselineOffset =
      titleBaselineOffset + Math.floor(titleSize * 1.25);
    const bMaxLines = Math.max(
      1,
      Math.min(
        3,
        Math.floor((rowH - bodyBaselineOffset - 10) / (bodySize * 1.34)),
      ),
    );

    return (
      <g>
        {activeNodes.map((node, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x = padX + c * (cardW + colGap);
          const y = bodyTop + r * (rowH + rowGap);
          const col = nodeColor(i);
          const tLines = wrapSvgLines(node.title, tChars, 1);
          const bLines = wrapSvgLines(node.body, bChars, bMaxLines);
          const isSelected =
            canvasEditMode === "node" && selectedNodeId === node.id;
          const boxIconSize = Math.min(60, Math.max(44, Math.floor(rowH * 0.52)));

          return (
            <g
              key={node.id}
              onClick={() => focusNodeInEditor(node.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={cardW}
                height={rowH}
                rx={20}
                fill={palette.cardBg}
                stroke={isSelected ? "#5271ff" : col}
                strokeWidth={isSelected ? 4 : 2.2}
                filter="url(#card3dShadow)"
              />
              {isSelected && (
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={cardW + 8}
                  height={rowH + 8}
                  rx={24}
                  fill="none"
                  stroke="#5271ff"
                  strokeWidth={2.5}
                  strokeDasharray="8 5"
                />
              )}

              {isRibbon ? (
                <g>
                  <polygon
                    points={`${x - 8},${y + 16} ${x + 80},${y + 16} ${x + 94},${y + Math.min(44, rowH / 2)} ${x + 80},${y + Math.min(72, rowH - 14)} ${x - 8},${y + Math.min(72, rowH - 14)}`}
                    fill={col}
                    filter="url(#card3dShadow)"
                  />
                  <text
                    x={x + 36}
                    y={y + Math.min(50, rowH / 2 + 6)}
                    textAnchor="middle"
                    fill={palette.badgeText}
                    fontSize={20}
                    fontWeight={900}
                  >
                    #{node.badge || `0${i + 1}`}
                  </text>
                </g>
              ) : (
                <g>
                  <rect
                    x={x + 20}
                    y={y + (rowH - boxIconSize) / 2}
                    width={boxIconSize}
                    height={boxIconSize}
                    rx={16}
                    fill={`${col}22`}
                    stroke={col}
                    strokeWidth={2}
                  />
                  {renderNodeIconOrImage(
                    node,
                    x + 20 + boxIconSize / 2,
                    y + rowH / 2,
                    Math.floor(boxIconSize * 0.46),
                    col,
                  )}
                </g>
              )}

              <text
                x={x + 104}
                y={y + titleBaselineOffset}
                fill={palette.textPrimary}
                fontSize={titleSize}
                fontWeight={800}
              >
                {tLines[0]}
              </text>

              {node.metricValue && (
                <g>
                  <rect
                    x={x + cardW - 140}
                    y={y + 14}
                    width={120}
                    height={28}
                    rx={14}
                    fill={palette.accentSoft}
                    stroke={col}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + cardW - 80}
                    y={y + 33}
                    textAnchor="middle"
                    fill={col}
                    fontSize={13}
                    fontWeight={800}
                  >
                    {node.metricValue.slice(0, 12)}
                  </text>
                </g>
              )}

              {bLines.map((l, bi) => (
                <text
                  key={bi}
                  x={x + 104}
                  y={y + bodyBaselineOffset + bi * (bodySize * 1.34)}
                  fill={palette.textSecondary}
                  fontSize={bodySize}
                  fontWeight={500}
                >
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </g>
    );
  }

  const currentNode =
    nodes.find((n) => n.id === selectedNodeId) || activeNodes[0] || nodes[0];
  const currentNodeIndex = Math.max(
    0,
    nodes.findIndex((n) => n.id === currentNode?.id),
  );

  // Content Length & 80% Box Fill Guidance Helper
  function getContentFillStatus(
    text: string,
    minChars: number,
    idealMaxChars: number,
  ): { label: string; colorClass: string } {
    const len = (text || "").trim().length;
    if (len === 0) {
      return {
        label: "Empty — add text to populate this section",
        colorClass: "text-amber-500",
      };
    }
    if (len < minChars) {
      return {
        label: `${len} chars · Short (add ${minChars - len}+ chars for balanced 80% card fill)`,
        colorClass: "text-[#5271ff]",
      };
    }
    if (len > idealMaxChars) {
      return {
        label: `${len} chars · Long (shorten by ~${len - idealMaxChars} chars to avoid truncation)`,
        colorClass: "text-amber-500",
      };
    }
    return {
      label: `${len} chars · Optimal (~80% balanced card fill)`,
      colorClass: "text-emerald-500",
    };
  }

  const headlineStatus = getContentFillStatus(title, 18, 68);
  const introStatus = getContentFillStatus(subtitle, 35, 320);
  const nodeTitleStatus = getContentFillStatus(
    currentNode?.title || "",
    10,
    42,
  );
  const nodeBodyStatus = getContentFillStatus(
    currentNode?.body || "",
    45,
    155,
  );

  // Only real extracted article images or user-uploaded artwork (NO generic 3D paper sculpture!)
  const allAvailableImages = useMemo(() => {
    const list: Array<{ src: string; label: string }> = [
      {
        src: "",
        label: "No Image (Vector)",
      },
    ];
    extractedImages.forEach((src, i) => {
      if (src && !list.some((item) => item.src === src)) {
        list.push({ src, label: `Article #${i + 1}` });
      }
    });
    if (sideImageUrl && !list.some((item) => item.src === sideImageUrl)) {
      list.push({ src: sideImageUrl, label: "Uploaded Art" });
    }
    return list;
  }, [extractedImages, sideImageUrl]);

  return (
    <div className={`${styles.studio} space-y-5`}>
      {/* PROMINENT CHANGE TEMPLATE BANNER */}
      <details className={styles.templateBanner}>
        <summary className="flex flex-wrap items-center justify-between gap-3 font-bold">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#4058d0] text-white shadow-sm">
              <Layers size={18} />
            </span>
            <div>
              <span className="block text-sm font-extrabold">
                Change Infographic Template ({INFOGRAPHIC_TEMPLATES.length}{" "}
                Layouts)
              </span>
              <span className="block text-xs opacity-80">
                Active:{" "}
                <strong>{activeTemplate.label.replace(/^\d+\. /, "")}</strong> ·{" "}
                {activeTemplate.minNodes === activeTemplate.maxNodes
                  ? `Fixed ${activeTemplate.maxNodes} sections`
                  : `${activeTemplate.minNodes}–${activeTemplate.maxNodes} sections`}{" "}
                · {activeTemplate.desc}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs">
            Browse 26 Templates ▾
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <div className={styles.tabs}>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className={styles.gallery}>
            {filteredTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={normalizeTemplateId(template) === tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
              >
                <TemplateThumbnail id={tpl.id} category={tpl.category} />
                <strong>{tpl.label.replace(/^\d+\. /, "")}</strong>
                <span className="mt-0.5 block text-[10px] font-extrabold text-[#4058d0] dark:text-[#8094ff]">
                  {tpl.minNodes === tpl.maxNodes
                    ? `${tpl.maxNodes} Sections`
                    : `${tpl.minNodes}–${tpl.maxNodes} Sections`}
                </span>
                <span className={styles.hint}>{tpl.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </details>

      <div className={styles.workspace}>
        {/* LEFT CONTROL PANEL (CONTENT | DESIGN | BRAND) */}
        <div className={styles.panel}>
          <div className={styles.tabs}>
            {(["content", "design", "brand"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={editorTab === tab}
                onClick={() => setEditorTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB 1: CONTENT */}
          {editorTab === "content" && (
            <>
              <label>
                <div className="flex items-center justify-between gap-2">
                  <span>Headline</span>
                  <span
                    className={`text-[11px] font-bold ${headlineStatus.colorClass}`}
                  >
                    {headlineStatus.label}
                  </span>
                </div>
                <input
                  ref={headlineInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setCanvasEditMode("header")}
                  placeholder="Enter infographic headline..."
                />
              </label>

              <label>
                <div className="flex items-center justify-between gap-2">
                  <span>Introduction</span>
                  <span
                    className={`text-[11px] font-bold ${introStatus.colorClass}`}
                  >
                    {introStatus.label}
                  </span>
                </div>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  onFocus={() => setCanvasEditMode("header")}
                  placeholder="1–3 sentence overview under the headline..."
                />
              </label>

              <div className="mt-4 flex items-center justify-between">
                <h4 className="font-bold">
                  Edit a section ({activeNodes.length}/{maxNodesForTemplate}{" "}
                  sections)
                </h4>
                <span className="text-[11px] opacity-75">
                  Click any card on canvas to edit directly
                </span>
              </div>
              <div className={`${styles.nodeNav} mt-2`}>
                {activeNodes.map((node, i) => (
                  <button
                    key={node.id}
                    type="button"
                    aria-label={`Edit section ${i + 1}`}
                    aria-pressed={currentNode?.id === node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setCanvasEditMode("node");
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentNode && (
                <>
                  <label>
                    <div className="flex items-center justify-between gap-2">
                      <span>Section #{currentNodeIndex + 1} title</span>
                      <span
                        className={`text-[11px] font-bold ${nodeTitleStatus.colorClass}`}
                      >
                        {nodeTitleStatus.label}
                      </span>
                    </div>
                    <input
                      ref={sectionTitleInputRef}
                      value={currentNode.title}
                      onFocus={() => {
                        setSelectedNodeId(currentNode.id);
                        setCanvasEditMode("node");
                      }}
                      onChange={(e) =>
                        updateNode(currentNode.id, "title", e.target.value)
                      }
                    />
                  </label>

                  <label>
                    <div className="flex items-center justify-between gap-2">
                      <span>Takeaway</span>
                      <span
                        className={`text-[11px] font-bold ${nodeBodyStatus.colorClass}`}
                      >
                        {nodeBodyStatus.label}
                      </span>
                    </div>
                    <textarea
                      value={currentNode.body}
                      onFocus={() => {
                        setSelectedNodeId(currentNode.id);
                        setCanvasEditMode("node");
                      }}
                      onChange={(e) =>
                        updateNode(currentNode.id, "body", e.target.value)
                      }
                    />
                  </label>

                  <details className="mt-2 rounded-xl border border-slate-400/25 p-3">
                    <summary className="font-semibold">
                      Icon, custom section image &amp; details
                    </summary>
                    <div className="mt-3 space-y-3">
                      <label>
                        Number or label
                        <input
                          value={currentNode.badge}
                          onChange={(e) =>
                            updateNode(currentNode.id, "badge", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Statistic from your source (optional)
                        <input
                          value={currentNode.metricValue || ""}
                          placeholder="e.g. +42%, 3.2x, 90 Tools"
                          onChange={(e) =>
                            updateNode(
                              currentNode.id,
                              "metricValue",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        Comparison text (for VS / Do &amp; Don&apos;t layouts)
                        <input
                          value={currentNode.compareRight || ""}
                          onChange={(e) =>
                            updateNode(
                              currentNode.id,
                              "compareRight",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      {/* Custom Image Upload for this specific section icon */}
                      <div className="rounded-xl border border-slate-400/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">
                            Custom Icon / Image for Section #
                            {currentNodeIndex + 1}
                          </span>
                          {currentNode.customImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                updateNode(currentNode.id, "customImageUrl", "")
                              }
                              className="text-[11px] font-bold text-rose-500 hover:underline"
                            >
                              Reset to Vector Icon
                            </button>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="mt-2 text-xs"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              updateNode(
                                currentNode.id,
                                "customImageUrl",
                                String(reader.result),
                              );
                              notify(
                                "Applied custom uploaded image to this section!",
                              );
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>

                      <div
                        className="grid grid-cols-4 gap-2"
                        aria-label="Choose a section icon"
                      >
                        {ICON_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            title={option.label}
                            aria-label={option.label}
                            aria-pressed={
                              !currentNode.customImageUrl &&
                              currentNode.icon === option.id
                            }
                            className="flex flex-col items-center rounded-lg border border-slate-400/30 p-2 text-[10px]"
                            onClick={() => {
                              updateNode(currentNode.id, "customImageUrl", "");
                              updateNode(currentNode.id, "icon", option.id);
                            }}
                          >
                            <svg
                              viewBox="0 0 48 48"
                              width="30"
                              height="30"
                              aria-hidden="true"
                            >
                              {renderSvgIcon(option.id, 24, 24, 28, "#5271ff")}
                            </svg>
                            <span className="mt-1 truncate">
                              {option.label.split(" / ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>

                  {/* Template-Aware Add & Red Remove Section Buttons with Blocked Cursor */}
                  <div className={`${styles.toolbar} mt-5`}>
                    <button
                      type="button"
                      aria-disabled={!canAddNode}
                      title={
                        canAddNode
                          ? `Add a new section (up to ${maxNodesForTemplate} for this template)`
                          : `Maximum ${maxNodesForTemplate} sections reached for ${activeTemplate.label.replace(/^\d+\. /, "")}`
                      }
                      className={!canAddNode ? styles.blockedBtn : undefined}
                      onClick={addNode}
                    >
                      <Plus size={16} className="mr-1 inline" />
                      Add section ({activeNodes.length}/{maxNodesForTemplate})
                    </button>

                    <button
                      type="button"
                      aria-disabled={!canRemoveNode}
                      title={
                        canRemoveNode
                          ? "Remove currently selected section"
                          : `Minimum ${minNodesForTemplate} sections required for ${activeTemplate.label.replace(/^\d+\. /, "")}`
                      }
                      className={`${styles.dangerBtn} ${
                        !canRemoveNode ? styles.blockedBtn : ""
                      }`}
                      onClick={() => removeNode(currentNode.id)}
                    >
                      <Trash2 size={16} className="mr-1 inline" />
                      Remove section
                    </button>
                  </div>

                  {/* Contextual In-View Section Limit Notice right beside Add/Remove */}
                  {sectionLimitNotice && (
                    <div
                      role="status"
                      className="mb-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-300"
                    >
                      {sectionLimitNotice}
                    </div>
                  )}
                </>
              )}
              <p className={styles.hint}>
                Template rule:{" "}
                <strong>{activeTemplate.label.replace(/^\d+\. /, "")}</strong>{" "}
                supports{" "}
                {minNodesForTemplate === maxNodesForTemplate
                  ? `exactly ${maxNodesForTemplate} sections`
                  : `${minNodesForTemplate} to ${maxNodesForTemplate} sections`}{" "}
                so cards stay ~80% filled and never overlap the footer.
              </p>
            </>
          )}

          {/* TAB 2: DESIGN */}
          {editorTab === "design" && (
            <>
              <label>
                Size &amp; Aspect Ratio
                <select
                  value={aspect}
                  onChange={(e) =>
                    setAspect(e.target.value as InfographicAspectRatio)
                  }
                >
                  {Object.entries({
                    "vertical-poster": "Tall poster · 1080 × 1920",
                    "pinterest-tall": "Pinterest · 1000 × 1500",
                    "portrait-social": "Portrait · 1080 × 1350",
                    "horizontal-landscape": "Landscape · 1600 × 1000",
                    "square-card": "Square · 1200 × 1200",
                  }).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Background SVG Wave &amp; Mesh Style
                <select
                  value={bgWaveStyle}
                  onChange={(e) =>
                    setBgWaveStyle(e.target.value as InfographicBgWaveStyle)
                  }
                >
                  <option value="waves">Layered 3D Silk Waves (Default)</option>
                  <option value="aurora">Editorial Aurora Ribbons</option>
                  <option value="rings">Concentric Orbital Rings</option>
                  <option value="grid">Architectural Blueprint Grid</option>
                  <option value="minimal">Clean Minimal Gradient</option>
                </select>
              </label>

              <label>
                Color theme
                <select
                  value={paletteId}
                  onChange={(e) =>
                    setPaletteId(e.target.value as InfographicColorPaletteId)
                  }
                >
                  {INFOGRAPHIC_PALETTES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="custom-brand">Custom brand colors</option>
                </select>
              </label>

              {detectedArticleColors && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors({
                      ...detectedArticleColors,
                      bgEnd: detectedArticleColors.bgStart,
                    });
                    setPaletteId("custom-brand");
                    notify(
                      "Applied brand color palette detected from your article/logo!",
                    );
                  }}
                  className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#5271ff]/40 bg-[#5271ff]/10 px-3 py-2 text-xs font-extrabold text-[#4058d0] dark:text-[#9aabff]"
                >
                  <Wand2 size={14} />
                  Apply Detected Article / Logo Brand Colors
                </button>
              )}

              {/* Standard Color Swatch Box + Hex Input */}
              <div className="mt-3 rounded-xl border border-slate-400/25 p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold">
                    <Palette size={14} className="text-[#5271ff]" />
                    Custom Color Swatches
                  </span>
                  <span className="text-[11px] opacity-75">
                    Click any swatch or edit #HEX
                  </span>
                </div>

                <div className={styles.colorSwatchGrid}>
                  {(
                    [
                      ["Background", "bgStart"],
                      ["Card Surface", "cardBg"],
                      ["Primary Accent", "accent"],
                      ["Second Accent", "accentSecondary"],
                      ["Text Color", "textPrimary"],
                    ] as const
                  ).map(([label, key]) => {
                    const currentVal =
                      paletteId === "custom-brand"
                        ? customColors[key]
                        : key === "bgStart"
                          ? palette.bgStart
                          : key === "cardBg"
                            ? palette.cardBg.startsWith("#")
                              ? palette.cardBg
                              : "#ffffff"
                            : key === "accent"
                              ? palette.accent
                              : key === "accentSecondary"
                                ? palette.accentSecondary
                                : palette.textPrimary;

                    const applyColorVal = (val: string) => {
                      const next = {
                        ...(paletteId === "custom-brand"
                          ? customColors
                          : {
                              bgStart: palette.bgStart,
                              bgEnd: palette.bgEnd,
                              cardBg: palette.cardBg.startsWith("#")
                                ? palette.cardBg
                                : "#ffffff",
                              accent: palette.accent,
                              accentSecondary: palette.accentSecondary,
                              textPrimary: palette.textPrimary,
                            }),
                        [key]: val,
                      };
                      if (key === "bgStart") next.bgEnd = val;
                      setCustomColors(next);
                      setPaletteId("custom-brand");
                    };

                    return (
                      <div key={key} className={styles.colorSwatchCard}>
                        <input
                          type="color"
                          aria-label={label}
                          className={styles.colorSwatchInput}
                          value={
                            /^#[0-9a-fA-F]{6}$/.test(currentVal)
                              ? currentVal
                              : "#4058d0"
                          }
                          onChange={(e) => applyColorVal(e.target.value)}
                        />
                        <div className={styles.colorSwatchMeta}>
                          <span className={styles.colorSwatchLabel}>
                            {label}
                          </span>
                          <input
                            type="text"
                            value={currentVal}
                            aria-label={`${label} hex code`}
                            className={styles.colorHexInput}
                            onChange={(e) => applyColorVal(e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live WCAG Contrast & Visibility Alert */}
                {contrastReport.isLowVisibility && (
                  <div role="alert" className={styles.contrastAlert}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 shrink-0 text-amber-500"
                      />
                      <div className="flex-1">
                        <strong className="block font-bold">
                          Low Text Visibility Detected (Contrast{" "}
                          {contrastReport.minContrast.toFixed(1)}:1)
                        </strong>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          Your selected text color and background/card surface
                          have low contrast, which makes headings or takeaways
                          hard to read.
                        </p>
                        <button
                          type="button"
                          onClick={autoFixContrast}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-3 py-1 text-[11px] font-extrabold text-white"
                        >
                          <Sparkles size={12} /> Auto-Fix Text Visibility
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VISUAL THUMBNAIL PREVIEW PICKER FOR ARTICLE & UPLOADED IMAGES */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">
                    Artwork for Editorial Split Layouts (
                    {Math.max(0, allAvailableImages.length - 1)} article/custom
                    images)
                  </span>
                  <span className="text-[11px] opacity-75">
                    Click thumbnail to apply
                  </span>
                </div>

                <div className={styles.imageThumbGrid}>
                  {allAvailableImages.map((item, idx) => {
                    const isSelected = sideImageUrl === item.src;
                    return (
                      <button
                        key={`${item.src || "none"}-${idx}`}
                        type="button"
                        aria-pressed={isSelected}
                        className={styles.imageThumbBtn}
                        onClick={() => {
                          setSideImageUrl(item.src);
                          if (item.src && !template.startsWith("side-image")) {
                            setTemplate("side-image-editorial-split");
                          }
                          notify(
                            item.src
                              ? `Applied "${item.label}" to Editorial Split layout!`
                              : "Switched to clean vector illustration!",
                          );
                        }}
                      >
                        {item.src ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.src}
                            alt={item.label}
                            className={styles.imageThumbPreview}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-[56px] w-full items-center justify-center rounded-[7px] bg-slate-800/80 text-[11px] font-extrabold text-[#8094ff]">
                            Vector Only
                          </div>
                        )}
                        <span className={styles.imageThumbCaption}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label>
                Upload Custom Hero Artwork
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      notify("Choose an image smaller than 10 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      setSideImageUrl(String(reader.result));
                      if (!template.startsWith("side-image")) {
                        setTemplate("side-image-editorial-split");
                      }
                      notify("Uploaded custom artwork and applied to layout!");
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </>
          )}

          {/* TAB 3: BRAND */}
          {editorTab === "brand" && (
            <>
              <label>
                Top Kicker Label
                <input
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                />
              </label>
              <label>
                Brand Name (Footer)
                <input
                  value={footerBrand}
                  onChange={(e) => setFooterBrand(e.target.value)}
                />
              </label>
              <label>
                Source URL
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </label>

              {/* Brand Logo Upload + Auto Brand Color Extraction */}
              <div className="mt-4 rounded-xl border border-slate-400/30 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold">
                    <Upload size={14} className="text-[#5271ff]" />
                    Brand Logo (Header &amp; Footer)
                  </span>
                  {brandLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setBrandLogoUrl("")}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const dataUrl = String(reader.result);
                      setBrandLogoUrl(dataUrl);
                      const detected =
                        await extractBrandPaletteFromImageUrl(dataUrl);
                      if (detected) {
                        setCustomColors({
                          ...detected,
                          bgEnd: detected.bgStart,
                        });
                        setPaletteId("custom-brand");
                        notify(
                          "Uploaded brand logo and automatically applied your logo's brand colors!",
                        );
                      } else {
                        notify("Added brand logo to infographic!");
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {brandLogoUrl && (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-900/40 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brandLogoUrl}
                      alt="Brand logo preview"
                      className="h-9 w-9 rounded object-contain bg-white p-1"
                    />
                    <span className="text-[11px] font-semibold opacity-85">
                      Logo active on infographic header &amp; footer
                    </span>
                  </div>
                )}
              </div>

              <p className={styles.hint}>
                Uploading your logo or extracting an article URL automatically
                detects brand colors so your infographic matches your site.
              </p>
            </>
          )}
        </div>

        {/* RIGHT INTERACTIVE SVG PREVIEW CONTAINER WITH ZOOM, IN-CANVAS KEYBOARD EDITOR & DOWNLOAD BAR */}
        <div className={styles.preview}>
          <div className={styles.stage}>
            {/* Top-Right In-Container Zoom + Download Bar */}
            <div className={styles.stageTopBar}>
              {/* Interactive Canvas Zoom Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={styles.zoomControlGroup}
                  role="group"
                  aria-label="Zoom infographic preview"
                >
                  <button
                    type="button"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className={styles.zoomBadge}>
                    {zoomPercent === 0 ? "Fit" : `${zoomPercent}%`}
                  </span>
                  <button
                    type="button"
                    title="Zoom In"
                    aria-label="Zoom In"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    type="button"
                    title="Reset Zoom to Fit Screen"
                    onClick={() => setZoomPercent(0)}
                  >
                    <Maximize2 size={13} />
                    <span>Fit</span>
                  </button>
                  <button
                    type="button"
                    title="Zoom to 125% for close-up inspection"
                    onClick={() =>
                      setZoomPercent((z) => (z === 125 ? 0 : 125))
                    }
                  >
                    125%
                  </button>
                </div>

                <span className="hidden text-[11px] font-semibold text-slate-300 xl:inline">
                  Click any text or card below to type directly
                </span>
              </div>

              {/* Download & Copy Buttons */}
              <div className={styles.stageTopActions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={exporting}
                  onClick={() => void runExport(downloadHighResPng)}
                >
                  <Download size={14} />
                  {exporting ? "Exporting…" : "Download PNG"}
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void runExport(downloadVectorSvg)}
                >
                  SVG
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void runExport(printPdfPoster)}
                >
                  PDF
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void copyInfographicImage()}
                >
                  <Copy size={13} />
                  {copiedImg ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* CONTEXTUAL IN-VIEW ERROR OR STATUS BANNER (Right inside the preview stage!) */}
            <div ref={stageAlertRef}>
              {exportError && (
                <div
                  role="alert"
                  className={`${styles.stageAlert} ${styles.stageAlertError}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-extrabold">
                        Download Notice
                      </span>
                      <span>{exportError}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExportError("")}
                    className="rounded-lg px-2 py-1 text-xs font-extrabold hover:bg-black/10"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {toast && !exportError && (
                <div
                  role="status"
                  className={`${styles.stageAlert} ${styles.stageAlertInfo}`}
                >
                  <div className="flex items-center gap-2">
                    <Check size={15} className="shrink-0" />
                    <span>{toast}</span>
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT IN-CANVAS FLOATING KEYBOARD EDITOR BAR (Opens when user clicks any element on the SVG!) */}
            {canvasEditMode && (
              <div
                className={styles.inCanvasEditorBar}
                role="region"
                aria-label="Direct In-Canvas Keyboard Text Editor"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#9aabff]">
                    <Edit3 size={14} />
                    {canvasEditMode === "header"
                      ? "Direct Canvas Editor · Editing Header & Introduction"
                      : canvasEditMode === "footer"
                        ? "Direct Canvas Editor · Editing Footer Brand & Source"
                        : `Direct Canvas Editor · Editing Section #${currentNodeIndex + 1} (${currentNode?.title.slice(0, 28) || ""})`}
                  </span>
                  <div className="flex items-center gap-2">
                    {canvasEditMode === "node" && (
                      <span className="text-[11px] text-slate-300">
                        Use left panel for icons/images
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCanvasEditMode(null)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
                    >
                      <X size={12} /> Done
                    </button>
                  </div>
                </div>

                {canvasEditMode === "header" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Headline (Type with keyboard)
                      </span>
                      <input
                        ref={inCanvasInputRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Headline..."
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Top Kicker Badge
                      </span>
                      <input
                        value={kicker}
                        onChange={(e) => setKicker(e.target.value)}
                        placeholder="Kicker label..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Introduction Subtitle
                      </span>
                      <textarea
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Introduction text..."
                      />
                    </div>
                  </div>
                )}

                {canvasEditMode === "node" && currentNode && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Section #{currentNodeIndex + 1} Title (Type directly)
                      </span>
                      <input
                        ref={inCanvasInputRef}
                        value={currentNode.title}
                        onChange={(e) =>
                          updateNode(currentNode.id, "title", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Statistic / Metric Pill
                      </span>
                      <input
                        value={currentNode.metricValue || ""}
                        placeholder="e.g. +42%, 3.2x"
                        onChange={(e) =>
                          updateNode(
                            currentNode.id,
                            "metricValue",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Section #{currentNodeIndex + 1} Takeaway Body
                      </span>
                      <textarea
                        value={currentNode.body}
                        onChange={(e) =>
                          updateNode(currentNode.id, "body", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {canvasEditMode === "footer" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Footer Brand Name
                      </span>
                      <input
                        ref={inCanvasInputRef}
                        value={footerBrand}
                        onChange={(e) => setFooterBrand(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-bold text-slate-300">
                        Source URL
                      </span>
                      <input
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ZOOMABLE 2D SCROLLABLE SVG VIEWPORT */}
            <div className={styles.stageCanvasViewport}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={title}
                fontFamily="Inter, system-ui, -apple-system, Arial, sans-serif"
                style={
                  zoomPercent === 0
                    ? {
                        width: "100%",
                        maxHeight: "80vh",
                        height: "auto",
                      }
                    : {
                        width: `${zoomPercent}%`,
                        maxWidth: "none",
                        maxHeight: "none",
                        height: "auto",
                      }
                }
              >
                <defs>
                  <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={palette.bgStart} />
                    <stop offset="100%" stopColor={palette.bgEnd} />
                  </linearGradient>
                  <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={palette.accent} />
                    <stop offset="100%" stopColor={palette.accentSecondary} />
                  </linearGradient>
                  <filter
                    id="dropShadow"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="130%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="8"
                      stdDeviation="12"
                      floodOpacity=".14"
                    />
                  </filter>
                  <filter
                    id="card3dShadow"
                    x="-12%"
                    y="-10%"
                    width="124%"
                    height="132%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="12"
                      stdDeviation="14"
                      floodColor="#020617"
                      floodOpacity="0.22"
                    />
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="4"
                      floodColor={palette.accent}
                      floodOpacity="0.12"
                    />
                  </filter>
                  <pattern
                    id="dotGrid"
                    width="36"
                    height="36"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="2"
                      cy="2"
                      r="1.3"
                      fill={palette.textSecondary}
                      fillOpacity=".1"
                    />
                  </pattern>
                </defs>

                {/* Base Background Gradient */}
                <rect width={W} height={H} fill="url(#bgGrad)" />

                {/* Decorative 3D SVG Background Waves / Aurora / Rings / Grid */}
                <InfographicBackgroundDecor
                  width={W}
                  height={H}
                  palette={palette}
                  style={bgWaveStyle}
                />

                {/* Top Brand Accent Bar */}
                <rect width={W} height="14" fill="url(#accentGrad)" />

                {/* Clickable Header Region (Kicker, Brand Logo, Overflow-Safe Headline & Dynamic Multi-Line Introduction) */}
                <g
                  onClick={focusHeaderInEditor}
                  style={{ cursor: "pointer" }}
                >
                  {canvasEditMode === "header" && (
                    <rect
                      x={padX - 16}
                      y={24}
                      width={W - (padX - 16) * 2}
                      height={headerH - 32}
                      rx={20}
                      fill="#5271ff"
                      fillOpacity={0.08}
                      stroke="#5271ff"
                      strokeWidth={2.5}
                      strokeDasharray="8 5"
                    />
                  )}

                  <text
                    x={padX}
                    y="62"
                    fontSize="17"
                    fontWeight="800"
                    letterSpacing="2.2"
                    fill={palette.accent}
                  >
                    {kicker.slice(0, 44).toUpperCase()}
                  </text>

                  {brandLogoUrl && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorTab("brand");
                      }}
                    >
                      <rect
                        x={W - padX - 84}
                        y={34}
                        width={84}
                        height={84}
                        rx={18}
                        fill={palette.cardBg}
                        stroke={palette.cardBorder}
                        strokeWidth={2}
                        filter="url(#card3dShadow)"
                      />
                      <image
                        href={brandLogoUrl}
                        x={W - padX - 74}
                        y={44}
                        width={64}
                        height={64}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )}

                  {titleLines.map((line, i) => {
                    const estimatedW = line.length * titleFontSize * 0.58;
                    return (
                      <text
                        key={i}
                        x={padX}
                        y={114 + i * (titleFontSize + 9)}
                        fill={palette.textPrimary}
                        fontSize={titleFontSize}
                        fontWeight="800"
                        textLength={
                          estimatedW > availHeaderW ? availHeaderW : undefined
                        }
                        lengthAdjust={
                          estimatedW > availHeaderW
                            ? "spacingAndGlyphs"
                            : undefined
                        }
                      >
                        {line}
                      </text>
                    );
                  })}

                  {subtitleLines.map((line, i) => {
                    const estimatedSubW =
                      line.length * subtitleFontSize * 0.53;
                    return (
                      <text
                        key={i}
                        x={padX}
                        y={
                          122 +
                          titleLines.length * (titleFontSize + 9) +
                          i * (subtitleFontSize + 7)
                        }
                        fill={palette.textSecondary}
                        fontSize={subtitleFontSize}
                        fontWeight="500"
                        textLength={
                          estimatedSubW > availHeaderW
                            ? availHeaderW
                            : undefined
                        }
                        lengthAdjust={
                          estimatedSubW > availHeaderW
                            ? "spacingAndGlyphs"
                            : undefined
                        }
                      >
                        {line}
                      </text>
                    );
                  })}
                </g>

                {/* Main Infographic Body */}
                {renderInfographicBody()}

                {/* Clickable Footer Region */}
                <g
                  onClick={focusFooterInEditor}
                  style={{ cursor: "pointer" }}
                >
                  {canvasEditMode === "footer" && (
                    <rect
                      x={padX - 14}
                      y={H - 62}
                      width={W - (padX - 14) * 2}
                      height={50}
                      rx={14}
                      fill="#5271ff"
                      fillOpacity={0.08}
                      stroke="#5271ff"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                    />
                  )}
                  <line
                    x1={padX}
                    x2={W - padX}
                    y1={H - 64}
                    y2={H - 64}
                    stroke={palette.textSecondary}
                    strokeOpacity=".22"
                  />
                  {brandLogoUrl && (
                    <image
                      href={brandLogoUrl}
                      x={padX}
                      y={H - 52}
                      width={32}
                      height={32}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                  <text
                    x={padX + (brandLogoUrl ? 42 : 0)}
                    y={H - 28}
                    fontSize="19"
                    fontWeight="800"
                    fill={palette.textPrimary}
                  >
                    {footerBrand.slice(0, 55)}
                  </text>
                  <text
                    x={W - padX}
                    y={H - 28}
                    textAnchor="end"
                    fontSize="15.5"
                    fontWeight="600"
                    fill={palette.textSecondary}
                  >
                    {sourceUrl
                      ? "Source: " +
                        sourceUrl.replace(/^https?:\/\//, "").slice(0, 38)
                      : "Verified Visual Summary"}
                  </text>
                </g>
              </svg>
            </div>
          </div>
          <p className={`${styles.hint} mt-3`}>
            {dimensions.label} · Zoom ({zoomPercent === 0 ? "Fit" : `${zoomPercent}%`}) · Click any text or card on the infographic to edit directly with your keyboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EditableInfographicStudio;
