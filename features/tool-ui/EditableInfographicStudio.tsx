"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Palette,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Wand2,
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
  | "vertical-poster" // 1000 x 1920
  | "pinterest-tall" // 1000 x 1500
  | "portrait-social" // 1080 x 1350
  | "horizontal-landscape" // 1600 x 1000
  | "square-card"; // 1200 x 1200

export type InfographicColorPaletteId =
  | "navy-orange"
  | "canva-editorial-light"
  | "emerald-slate"
  | "venngage-teal-coral"
  | "royal-indigo"
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

export const INFOGRAPHIC_PALETTES: InfographicColorPalette[] = [
  {
    id: "navy-orange",
    name: "Midnight & Electric Orange",
    bgStart: "#0B1120",
    bgEnd: "#172554",
    cardBg: "#1E293B",
    cardBorder: "#334155",
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    accent: "#FF6B35",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(255, 107, 53, 0.18)",
    badgeText: "#FFFFFF",
  },
  {
    id: "canva-editorial-light",
    name: "Canva Studio Light & Cobalt",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardBg: "#FFFFFF",
    cardBorder: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    accent: "#4F46E5",
    accentSecondary: "#EC4899",
    accentSoft: "#E0E7FF",
    badgeText: "#FFFFFF",
  },
  {
    id: "venngage-teal-coral",
    name: "Venngage Teal & Warm Coral",
    bgStart: "#042F2E",
    bgEnd: "#134E4A",
    cardBg: "#0F3D3B",
    cardBorder: "#2DD4BF",
    textPrimary: "#F0FDFA",
    textSecondary: "#99F6E4",
    accent: "#FB7185",
    accentSecondary: "#2DD4BF",
    accentSoft: "rgba(251, 113, 133, 0.2)",
    badgeText: "#FFFFFF",
  },
  {
    id: "emerald-slate",
    name: "Executive Emerald & Carbon",
    bgStart: "#052E24",
    bgEnd: "#0F172A",
    cardBg: "#112233",
    cardBorder: "#10B981",
    textPrimary: "#F8FAFC",
    textSecondary: "#A7F3D0",
    accent: "#10B981",
    accentSecondary: "#F59E0B",
    accentSoft: "rgba(16, 185, 129, 0.2)",
    badgeText: "#052E24",
  },
  {
    id: "royal-indigo",
    name: "Royal Sapphire & Cyan Glow",
    bgStart: "#090D16",
    bgEnd: "#1E3A8A",
    cardBg: "#152347",
    cardBorder: "#38BDF8",
    textPrimary: "#FFFFFF",
    textSecondary: "#DBEAFE",
    accent: "#38BDF8",
    accentSecondary: "#818CF8",
    accentSoft: "rgba(56, 189, 248, 0.2)",
    badgeText: "#090D16",
  },
  {
    id: "terracotta-cream",
    name: "Warm Editorial Cream & Terracotta",
    bgStart: "#FFFBEB",
    bgEnd: "#FEF3C7",
    cardBg: "#FFFFFF",
    cardBorder: "#F59E0B",
    textPrimary: "#1C1917",
    textSecondary: "#57534E",
    accent: "#EA580C",
    accentSecondary: "#0D9488",
    accentSoft: "#FFEDD5",
    badgeText: "#FFFFFF",
  },
  {
    id: "cyber-violet",
    name: "AI SaaS Violet & Neon Pink",
    bgStart: "#130924",
    bgEnd: "#2E1065",
    cardBg: "#1F123B",
    cardBorder: "#A855F7",
    textPrimary: "#FFFFFF",
    textSecondary: "#E9D5FF",
    accent: "#E879F9",
    accentSecondary: "#38BDF8",
    accentSoft: "rgba(232, 121, 249, 0.22)",
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
    accentSecondary: "#0F172A",
    accentSoft: "#E0F2FE",
    badgeText: "#FFFFFF",
  },
  {
    id: "rose-charcoal",
    name: "Obsidian & Crimson Rose",
    bgStart: "#18181B",
    bgEnd: "#27272A",
    cardBg: "#232329",
    cardBorder: "#F43F5E",
    textPrimary: "#FAFAFA",
    textSecondary: "#D4D4D8",
    accent: "#F43F5E",
    accentSecondary: "#FBBF24",
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
    textSecondary: "#D9F99D",
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
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplateMeta[] = [
  // Category 1: Roadmaps & Process Flows
  {
    id: "winding-s-roadmap",
    label: "1. S-Curve Winding Roadmap",
    category: "roadmap",
    desc: "Connected S-curve highway with 3D milestone pins & vector icons",
    badge: "POPULAR",
  },
  {
    id: "step-roadmap",
    label: "2. Vertical Process Flow",
    category: "roadmap",
    desc: "Numbered process cards connected with directional flow arrows",
    badge: "PROCESS",
  },
  {
    id: "step-staircase-ascension",
    label: "3. 3D Ascending Staircase",
    category: "roadmap",
    desc: "Rising diagonal steps from foundation to pinnacle trophy goal",
    badge: "GROWTH",
  },
  {
    id: "circular-flywheel-cycle",
    label: "4. 360° Growth Flywheel",
    category: "roadmap",
    desc: "Central core engine orb surrounded by a continuous circular loop",
    badge: "CYCLE",
  },
  {
    id: "horizontal-landscape-flow",
    label: "5. Horizontal Process Board (16:9)",
    category: "roadmap",
    desc: "Widescreen chevron pipeline ideal for blogs, decks & LinkedIn",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 WIDE",
  },

  // Category 2: Timelines & Journeys
  {
    id: "alternating-spine-timeline",
    label: "6. Alternating Spine Timeline",
    category: "timeline",
    desc: "Central glowing axis with alternating left & right milestone cards",
    badge: "TIMELINE",
  },
  {
    id: "horizontal-timeline-gantt",
    label: "7. Horizontal Milestone Track (16:9)",
    category: "timeline",
    desc: "Landscape timeline axis with top/bottom phase cards & progress bars",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 WIDE",
  },
  {
    id: "before-after-transformation",
    label: "8. Before → Bridge → After",
    category: "timeline",
    desc: "Visual transformation from Old Problem to New Measurable Outcome",
    badge: "STORY",
  },

  // Category 3: Pyramids, Funnels & Hierarchies
  {
    id: "isometric-3d-pyramid",
    label: "9. 3D Layered Pyramid",
    category: "hierarchy",
    desc: "Isometric 3D hierarchy pyramid with side pointer callout cards",
    badge: "3D PYRAMID",
  },
  {
    id: "conversion-funnel-stages",
    label: "10. 3D Conversion Funnel",
    category: "hierarchy",
    desc: "Tapering funnel layers with stage metrics & conversion callouts",
    badge: "FUNNEL",
  },
  {
    id: "pillar-temple-architecture",
    label: "11. Strategic Pillar Architecture",
    category: "hierarchy",
    desc: "Roof vision supported by vertical strategic columns & base",
    badge: "FRAMEWORK",
  },
  {
    id: "iceberg-hidden-layers",
    label: "12. Above vs. Below Iceberg",
    category: "hierarchy",
    desc: "Waterline split showing surface tactics vs. deep hidden drivers",
    badge: "ICEBERG",
  },

  // Category 4: Side-Image & Magazine Editorial
  {
    id: "side-image-editorial-split",
    label: "13. Left Side-Image Magazine Split",
    category: "side-image",
    desc: "Left visual hero image/illustration + Right structured steps",
    badge: "SIDE IMAGE",
  },
  {
    id: "side-image-right-spotlight",
    label: "14. Right Side-Image Spotlight",
    category: "side-image",
    desc: "Left numbered breakdown + Right visual poster & stat spotlight",
    badge: "SIDE IMAGE",
  },
  {
    id: "side-image-horizontal-board",
    label: "15. Widescreen Split Hero + Grid (16:9)",
    category: "side-image",
    desc: "Landscape left visual cover showcase + 2×3 right insight grid",
    recommendedAspect: "horizontal-landscape",
    badge: "16:9 IMAGE",
  },

  // Category 5: Statistical, Charts & Data
  {
    id: "stat-donut-kpi-dashboard",
    label: "16. Radial Donut & KPI Rings",
    category: "statistical",
    desc: "Vector circular percentage gauges & bold data callout cards",
    badge: "DATA RINGS",
  },
  {
    id: "stat-bento-grid",
    label: "17. Bento Data & Bar Mosaic",
    category: "statistical",
    desc: "Modern Bento grid with oversized KPIs & horizontal benchmark bars",
    badge: "BENTO",
  },
  {
    id: "editorial-newspaper-digest",
    label: "18. Executive Chart & Research Brief",
    category: "statistical",
    desc: "Comparative horizontal bar chart header + structured evidence cards",
    badge: "RESEARCH",
  },

  // Category 6: Comparisons, Battles & Matrices
  {
    id: "versus-battle-comparison",
    label: "19. Head-to-Head 'VS' Battle",
    category: "comparison",
    desc: "Central VS lightning emblem comparing Old Way vs. High-Leverage Way",
    badge: "VERSUS",
  },
  {
    id: "dos-and-donts-matrix",
    label: "20. Do's & Don'ts Playbook",
    category: "comparison",
    desc: "Red mistake cards paired with green best-practice solution cards",
    badge: "DO vs DON'T",
  },
  {
    id: "quadrant-2x2-strategy",
    label: "21. 2×2 Impact vs. Effort Matrix",
    category: "comparison",
    desc: "Four-quadrant strategic grid: Quick Wins, Big Bets, Fill-Ins, Avoid",
    badge: "2×2 MATRIX",
  },

  // Category 7: Mind-Maps, Clusters & Anatomy
  {
    id: "radial-hub-and-spoke",
    label: "22. Radial Hub & Spoke Mind-Map",
    category: "mindmap",
    desc: "Central core thesis orb connected via Bezier curves to spoke cards",
    badge: "MIND-MAP",
  },
  {
    id: "honeycomb-hex-cluster",
    label: "23. Hexagonal Honeycomb Cluster",
    category: "mindmap",
    desc: "Interlocking geometric hexagon cells with 3D icons & metric pills",
    badge: "HEXAGON",
  },
  {
    id: "anatomy-x-ray-breakdown",
    label: "24. Visual Anatomy Blueprint",
    category: "mindmap",
    desc: "Central schematic diagram with numbered pointer lines to each node",
    badge: "ANATOMY",
  },

  // Category 8: Viral Lists & Scorecards
  {
    id: "numbered-ribbon-banners",
    label: "25. 3D Folded Ribbon Banner List",
    category: "viral-list",
    desc: "High-save Pinterest/Canva style with 3D folded ribbons & icons",
    badge: "RIBBONS",
  },
  {
    id: "checklist-audit-scorecard",
    label: "26. Interactive Audit Scorecard",
    category: "viral-list",
    desc: "Verified checkmark rows with priority severity bars & KPI targets",
    badge: "SCORECARD",
  },
];

const TEMPLATE_CATEGORIES: { id: InfographicTemplateCategory; label: string }[] = [
  { id: "all", label: "All 26 Templates" },
  { id: "roadmap", label: "Roadmaps & Flows (5)" },
  { id: "timeline", label: "Timelines (3)" },
  { id: "hierarchy", label: "Pyramids & Funnels (4)" },
  { id: "side-image", label: "Side-Image Split (3)" },
  { id: "statistical", label: "Charts & Stats (3)" },
  { id: "comparison", label: "VS & Matrices (3)" },
  { id: "mindmap", label: "Mind-Maps & Hex (3)" },
  { id: "viral-list", label: "Ribbons & Lists (2)" },
];

export const ICON_OPTIONS: { id: InfographicIconId; label: string }[] = [
  { id: "rocket", label: "🚀 Rocket / Launch" },
  { id: "target", label: "🎯 Target / Goal" },
  { id: "sparkles", label: "✨ AI / Sparkles" },
  { id: "chart", label: "📈 Growth Chart" },
  { id: "shield", label: "🛡️ Security / Trust" },
  { id: "globe", label: "🌐 Web / Global SEO" },
  { id: "brain", label: "🧠 Intelligence / Strategy" },
  { id: "layers", label: "📚 Stack / Architecture" },
  { id: "zap", label: "⚡ Speed / Automation" },
  { id: "trophy", label: "🏆 Winner / ROI" },
  { id: "check", label: "✅ Verified / Audit" },
  { id: "users", label: "👥 Audience / Community" },
  { id: "magnet", label: "🧲 Lead Gen / Funnel" },
  { id: "gear", label: "⚙️ System / Workflow" },
  { id: "compass", label: "🧭 Roadmap / Direction" },
  { id: "database", label: "🗄️ Data / Research" },
  { id: "megaphone", label: "📣 PR / Distribution" },
  { id: "clock", label: "⏱️ Time / Efficiency" },
  { id: "lightbulb", label: "💡 Idea / Insight" },
  { id: "award", label: "🥇 Authority / Quality" },
];

export function inferNodeIcon(text: string, idx: number): InfographicIconId {
  const lower = text.toLowerCase();
  if (/launch|scale|fast|boost|deploy|start|publish/.test(lower)) return "rocket";
  if (/target|intent|keyword|focus|goal|niche/.test(lower)) return "target";
  if (/ai|llm|gpt|prompt|automat|generat/.test(lower)) return "sparkles";
  if (/stat|metric|roi|traffic|growth|revenue|chart|rank/.test(lower)) return "chart";
  if (/audit|trust|safe|protect|compliance|verify|eeat/.test(lower)) return "shield";
  if (/seo|search|web|domain|url|global|link/.test(lower)) return "globe";
  if (/plan|think|strateg|research|analy|framework/.test(lower)) return "brain";
  if (/cluster|pillar|structure|schema|hub|layer/.test(lower)) return "layers";
  if (/speed|instant|quick|hook|viral|short/.test(lower)) return "zap";
  if (/win|top|best|leader|authority|award/.test(lower)) return "trophy";
  if (/check|list|step|test|review|fix/.test(lower)) return "check";
  if (/user|audience|customer|client|team|community/.test(lower)) return "users";
  if (/lead|convert|funnel|cta|click|subscribe/.test(lower)) return "magnet";
  if (/workflow|process|system|tool|build|pipeline/.test(lower)) return "gear";
  if (/pr|outreach|share|social|distribute|repurpose/.test(lower)) return "megaphone";
  if (/data|benchmark|evidence|fact|study|source/.test(lower)) return "database";
  const fallbackPool: InfographicIconId[] = [
    "rocket",
    "target",
    "brain",
    "chart",
    "layers",
    "zap",
    "megaphone",
    "trophy",
  ];
  return fallbackPool[idx % fallbackPool.length];
}

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

function wrapSvgLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) {
    if (current.length > maxCharsPerLine + 6) {
      lines.push(`${current.slice(0, maxCharsPerLine)}…`);
    } else {
      lines.push(current);
    }
  }
  return lines;
}

function parsePercentage(metric: string | undefined, idx: number): number {
  if (metric) {
    const m = metric.match(/(\d+(?:\.\d+)?)/);
    if (m) {
      const val = parseFloat(m[1]);
      if (val >= 5 && val <= 100) return Math.round(val);
      if (val > 0 && val < 5) return Math.min(96, Math.round(val * 28));
    }
  }
  const defaults = [88, 76, 92, 68, 84, 95, 79, 91];
  return defaults[idx % defaults.length];
}

function normalizeTemplateId(raw: InfographicTemplateId): InfographicTemplateId {
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
  initialPalette = "navy-orange",
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
  const [customColors, setCustomColors] = useState({
    bgStart: "#0B1120",
    bgEnd: "#1E293B",
    cardBg: "#1E293B",
    accent: "#FF6B35",
    accentSecondary: "#38BDF8",
    textPrimary: "#FFFFFF",
  });
  const [kicker, setKicker] = useState(initialKicker);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [footerBrand, setFooterBrand] = useState(initialFooterBrand);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [sideImageUrl, setSideImageUrl] = useState(initialSideImageUrl);
  const [nodes, setNodes] = useState<InfographicNodeItem[]>(() =>
    initialNodes.map((n, i) => ({
      ...n,
      icon: n.icon || inferNodeIcon(`${n.title} ${n.body}`, i),
    })),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState("");
  const [copiedImg, setCopiedImg] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
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

  const palette: InfographicColorPalette = useMemo(() => {
    if (paletteId === "custom-brand") {
      return {
        id: "custom-brand",
        name: "Custom Brand Palette",
        bgStart: customColors.bgStart,
        bgEnd: customColors.bgEnd,
        cardBg: customColors.cardBg,
        cardBorder: customColors.accent,
        textPrimary: customColors.textPrimary,
        textSecondary:
          customColors.textPrimary.toLowerCase() === "#ffffff"
            ? "#CBD5E1"
            : "#475569",
        accent: customColors.accent,
        accentSecondary: customColors.accentSecondary,
        accentSoft: `${customColors.accent}28`,
        badgeText: "#FFFFFF",
      };
    }
    return (
      INFOGRAPHIC_PALETTES.find((p) => p.id === paletteId) ||
      INFOGRAPHIC_PALETTES[0]
    );
  }, [paletteId, customColors]);

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

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === "all") return INFOGRAPHIC_TEMPLATES;
    return INFOGRAPHIC_TEMPLATES.filter((t) => t.category === categoryFilter);
  }, [categoryFilter]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function handleSelectTemplate(tpl: InfographicTemplateMeta) {
    setTemplate(tpl.id);
    if (tpl.recommendedAspect) {
      setAspect(tpl.recommendedAspect);
    } else if (
      aspect === "horizontal-landscape" &&
      !tpl.recommendedAspect
    ) {
      setAspect("vertical-poster");
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
    if (nodes.length >= 8) {
      notify("Maximum 8 visual nodes per infographic for crisp readability.");
      return;
    }
    const nextNum = nodes.length + 1;
    setNodes((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        badge: `0${nextNum}`,
        title: `Strategic Pillar #${nextNum}`,
        body: "Add a concise 10–16 word actionable insight or benchmark for this node.",
        metricValue: `${Math.min(98, 55 + nextNum * 6)}%`,
        compareRight: "Automated AI workflow outcome with verified lift.",
        icon: inferNodeIcon(`step ${nextNum}`, nextNum),
      },
    ]);
  }

  function removeNode(id: string) {
    if (nodes.length <= 3) {
      notify("Keep at least 3 nodes on the infographic.");
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }

  function serializeSvg(): string {
    const svgEl = svgRef.current;
    if (!svgEl) return "";
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(dimensions.w));
    clone.setAttribute("height", String(dimensions.h));
    return new XMLSerializer().serializeToString(clone);
  }

  async function renderSvgToCanvas(scale = 2): Promise<HTMLCanvasElement | null> {
    const svgStr = serializeSvg();
    if (!svgStr) return null;
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.w * scale;
    canvas.height = dimensions.h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const svgBlob = new Blob([svgStr], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function downloadHighResPng() {
    const canvas = await renderSvgToCanvas(2);
    if (!canvas) {
      notify("Could not rasterize PNG—downloading Vector SVG instead.");
      downloadVectorSvg();
      return;
    }
    const a = document.createElement("a");
    a.download = `infographic-${template}-${aspect}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded High-Resolution 2x Retina Infographic (.PNG)!");
  }

  function downloadVectorSvg() {
    const svgStr = serializeSvg();
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infographic-${template}-${aspect}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Pure Editable Vector Infographic (.SVG)!");
  }

  async function printPdfPoster() {
    const canvas = await renderSvgToCanvas(2);
    const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
    const svgStr = serializeSvg();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<!doctype html><html><head><title>${title} - Infographic PDF</title><style>@page{margin:8mm}body{margin:0;display:flex;justify-content:center;align-items:center;background:#0f172a;min-height:100vh}@media print{body{background:#fff}}img,svg{max-width:100%;max-height:96vh;height:auto;width:auto}</style></head><body>${
        dataUrl ? `<img src="${dataUrl}" alt="${title}"/>` : svgStr
      }<script>window.onload=()=>{setTimeout(()=>window.print(),350)}</script></body></html>`,
    );
    win.document.close();
    notify("Opened Print-Ready PDF Poster Dialog!");
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
      downloadHighResPng();
    }
  }

  const W = dimensions.w;
  const H = dimensions.h;
  const padX = W >= 1400 ? 68 : 56;
  const activeNodes = nodes.slice(0, 8);
  const count = Math.max(1, activeNodes.length);

  // Header layout calculations
  const isHorizontal = aspect === "horizontal-landscape";
  const headerH = isHorizontal ? 195 : H >= 1500 ? 290 : 245;
  const footerH = isHorizontal ? 68 : 84;
  const bodyTop = headerH;
  const bodyBottom = H - footerH - 18;
  const availH = Math.max(320, bodyBottom - bodyTop);
  const availW = W - padX * 2;

  const titleLines = wrapSvgLines(title, isHorizontal ? 58 : 34, isHorizontal ? 2 : 3);
  const subtitleLines = wrapSvgLines(subtitle, isHorizontal ? 88 : 56, 2);
  const titleFontSize = isHorizontal ? 38 : H >= 1500 ? 44 : 36;

  // Alternate node accent colors for rich visual variety
  const nodeColor = (idx: number) =>
    idx % 2 === 0 ? palette.accent : palette.accentSecondary;

  // Render the active template inside the SVG body region
  function renderInfographicBody() {
    const activeTpl = normalizeTemplateId(template);

    // 1. S-CURVE WINDING SNAKE ROADMAP
    if (activeTpl === "winding-s-roadmap") {
      const rowGap = 20;
      const rowH = Math.max(115, Math.floor((availH - rowGap * (count - 1)) / count));
      const cardW = Math.floor(availW * 0.82);

      // Build S-curve connecting path between alternating node centers
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
          {/* Glowing S-Curve Road Spine */}
          <path
            d={pathD}
            fill="none"
            stroke={palette.accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeOpacity={0.22}
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
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 34, 1);
            const bLines = wrapSvgLines(node.body, 52, 2);

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Main Card */}
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={rowH}
                  rx={24}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.5}
                  filter="url(#dropShadow)"
                />
                {/* Top-left or Top-right glowing accent bar */}
                <rect
                  x={isLeft ? x : x + cardW - 12}
                  y={y}
                  width={12}
                  height={rowH}
                  rx={6}
                  fill={col}
                />

                {/* 3D Medallion Icon Circle */}
                <circle
                  cx={x + 56}
                  cy={y + rowH / 2}
                  r={34}
                  fill={`${col}22`}
                  stroke={col}
                  strokeWidth={2.5}
                />
                {renderSvgIcon(iconId, x + 56, y + rowH / 2, 28, col)}

                {/* Step Number Ribbon Pill */}
                <rect
                  x={x + 106}
                  y={y + 18}
                  width={82}
                  height={28}
                  rx={14}
                  fill={col}
                />
                <text
                  x={x + 147}
                  y={y + 37}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={14}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  STEP {node.badge || `0${i + 1}`}
                </text>

                {/* Metric Callout Badge */}
                {node.metricValue && (
                  <g>
                    <rect
                      x={x + cardW - 148}
                      y={y + 16}
                      width={126}
                      height={32}
                      rx={16}
                      fill={palette.accentSoft}
                      stroke={col}
                      strokeWidth={1.5}
                    />
                    <text
                      x={x + cardW - 85}
                      y={y + 37}
                      textAnchor="middle"
                      fill={col}
                      fontSize={15}
                      fontWeight={800}
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {node.metricValue.slice(0, 12)}
                    </text>
                  </g>
                )}

                {/* Title */}
                <text
                  x={x + 106}
                  y={y + 72}
                  fill={palette.textPrimary}
                  fontSize={23}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>

                {/* Body */}
                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={x + 106}
                    y={y + 100 + li * 23}
                    fill={palette.textSecondary}
                    fontSize={17}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {line}
                  </text>
                ))}

                {/* Opposite Side Milestone Pin on the S-Curve */}
                <circle
                  cx={isLeft ? W - padX - 46 : padX + 46}
                  cy={y + rowH / 2}
                  r={24}
                  fill={col}
                  filter="url(#dropShadow)"
                />
                <text
                  x={isLeft ? W - padX - 46 : padX + 46}
                  y={y + rowH / 2 + 7}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={18}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
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
      const pyrCenterX = Math.floor(W * 0.36);
      const pyrTopY = bodyTop + 26;
      const pyrBottomY = bodyBottom - 26;
      const pyrH = pyrBottomY - pyrTopY;
      const tierGap = 8;
      const tierH = Math.floor((pyrH - tierGap * (count - 1)) / count);
      const maxHalfW = Math.floor(availW * 0.28);
      const cardX = Math.floor(W * 0.62);
      const cardW = W - padX - cardX;

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
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 24, 1);
            const bLines = wrapSvgLines(node.body, 34, 2);

            // 3D Pyramid Left Face (Brighter) & Right Face (Shaded)
            const leftPoly = `${pyrCenterX},${y1} ${pyrCenterX - w1},${y1 + 10} ${pyrCenterX - w2},${y2} ${pyrCenterX},${y2 + 12}`;
            const rightPoly = `${pyrCenterX},${y1} ${pyrCenterX + w1},${y1 + 10} ${pyrCenterX + w2},${y2} ${pyrCenterX},${y2 + 12}`;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ cursor: "pointer" }}
              >
                <polygon
                  points={leftPoly}
                  fill={col}
                  fillOpacity={0.92}
                  stroke={palette.bgStart}
                  strokeWidth={2}
                  filter="url(#dropShadow)"
                />
                <polygon
                  points={rightPoly}
                  fill={col}
                  fillOpacity={0.68}
                  stroke={palette.bgStart}
                  strokeWidth={2}
                />

                {/* Tier Badge on Pyramid Center */}
                <text
                  x={pyrCenterX}
                  y={(y1 + y2) / 2 + 10}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={22}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.badge || `0${i + 1}`}
                </text>

                {/* Dotted Callout Pointer from Pyramid to Right Detail Card */}
                <line
                  x1={pyrCenterX + (w1 + w2) / 2 - 6}
                  y1={(y1 + y2) / 2 + 6}
                  x2={cardX}
                  y2={(y1 + y2) / 2 + 6}
                  stroke={col}
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                />
                <circle
                  cx={cardX}
                  cy={(y1 + y2) / 2 + 6}
                  r={6}
                  fill={col}
                />

                {/* Right Detail Card */}
                <rect
                  x={cardX}
                  y={y1}
                  width={cardW}
                  height={tierH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2}
                  filter="url(#dropShadow)"
                />
                <circle
                  cx={cardX + 34}
                  cy={y1 + 36}
                  r={20}
                  fill={`${col}25`}
                />
                {renderSvgIcon(iconId, cardX + 34, y1 + 36, 20, col)}

                <text
                  x={cardX + 64}
                  y={y1 + 42}
                  fill={palette.textPrimary}
                  fontSize={20}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 22}
                    y={y1 + 74 + li * 21}
                    fill={palette.textSecondary}
                    fontSize={15.5}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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
      const rowGap = 14;
      const tierH = Math.max(96, Math.floor((availH - rowGap * (count - 1)) / count));
      const funnelCenterX = Math.floor(W * 0.34);
      const maxTopW = Math.floor(availW * 0.56);
      const minBotW = Math.floor(availW * 0.22);
      const cardX = Math.floor(W * 0.62);
      const cardW = W - padX - cardX;

      return (
        <g>
          {activeNodes.map((node, i) => {
            const y1 = bodyTop + i * (tierH + rowGap);
            const y2 = y1 + tierH;
            const wTop = maxTopW - ((maxTopW - minBotW) * i) / count;
            const wBot = maxTopW - ((maxTopW - minBotW) * (i + 0.85)) / count;
            const col = nodeColor(i);
            const pct = parsePercentage(node.metricValue, i);
            const poly = `${funnelCenterX - wTop / 2},${y1} ${funnelCenterX + wTop / 2},${y1} ${funnelCenterX + wBot / 2},${y2} ${funnelCenterX - wBot / 2},${y2}`;
            const tLines = wrapSvgLines(node.title, 22, 1);
            const bLines = wrapSvgLines(node.body, 34, 2);

            return (
              <g key={node.id}>
                <polygon
                  points={poly}
                  fill={col}
                  fillOpacity={0.88 - i * 0.06}
                  stroke={palette.textPrimary}
                  strokeOpacity={0.3}
                  strokeWidth={2}
                  filter="url(#dropShadow)"
                />
                <text
                  x={funnelCenterX}
                  y={(y1 + y2) / 2 - 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={20}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>
                <text
                  x={funnelCenterX}
                  y={(y1 + y2) / 2 + 22}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={16}
                  fontWeight={700}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.metricValue || `${pct}% Benchmark`}
                </text>

                {/* Connector & Side Insight Card */}
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
                  stroke={col}
                  strokeWidth={2}
                />
                <text
                  x={cardX + 20}
                  y={y1 + 32}
                  fill={col}
                  fontSize={15}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  STAGE 0{i + 1} · {node.metricValue || `${pct}%`}
                </text>
                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 20}
                    y={y1 + 58 + li * 22}
                    fill={palette.textSecondary}
                    fontSize={15.5}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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
      const rowGap = 16;
      const rowH = Math.max(115, Math.floor((availH - rowGap * (count - 1)) / count));
      const cardW = Math.floor(availW / 2 - 48);

      return (
        <g>
          {/* Glowing Central Timeline Axis */}
          <line
            x1={centerX}
            y1={bodyTop + 20}
            x2={centerX}
            y2={bodyBottom - 20}
            stroke={palette.accent}
            strokeWidth={6}
            strokeLinecap="round"
          />

          {activeNodes.map((node, i) => {
            const isLeft = i % 2 === 0;
            const y = bodyTop + i * (rowH + rowGap);
            const cy = y + rowH / 2;
            const cardX = isLeft ? padX : centerX + 48;
            const col = nodeColor(i);
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 26, 2);
            const bLines = wrapSvgLines(node.body, 34, 3);

            return (
              <g key={node.id}>
                {/* Horizontal Connector Arm */}
                <line
                  x1={centerX}
                  y1={cy}
                  x2={isLeft ? cardX + cardW : cardX}
                  y2={cy}
                  stroke={col}
                  strokeWidth={3}
                />
                {/* Center Spine Node Medallion */}
                <circle
                  cx={centerX}
                  cy={cy}
                  r={24}
                  fill={col}
                  stroke={palette.bgStart}
                  strokeWidth={4}
                  filter="url(#dropShadow)"
                />
                <text
                  x={centerX}
                  y={cy + 6}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={16}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.badge || `0${i + 1}`}
                </text>

                {/* Milestone Card */}
                <rect
                  x={cardX}
                  y={y}
                  width={cardW}
                  height={rowH}
                  rx={20}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.2}
                  filter="url(#dropShadow)"
                />
                <circle
                  cx={cardX + 34}
                  cy={y + 34}
                  r={20}
                  fill={`${col}22`}
                />
                {renderSvgIcon(iconId, cardX + 34, y + 34, 20, col)}

                {node.metricValue && (
                  <text
                    x={cardX + cardW - 18}
                    y={y + 38}
                    textAnchor="end"
                    fill={col}
                    fontSize={15}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {node.metricValue.slice(0, 12)}
                  </text>
                )}

                <text
                  x={cardX + 64}
                  y={y + 39}
                  fill={palette.textPrimary}
                  fontSize={19.5}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={cardX + 22}
                    y={y + 72 + li * 22}
                    fill={palette.textSecondary}
                    fontSize={15.5}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 5. SIDE-IMAGE EDITORIAL SPLIT (LEFT OR RIGHT) & HORIZONTAL SPLIT BOARD
    if (
      activeTpl === "side-image-editorial-split" ||
      activeTpl === "side-image-right-spotlight" ||
      activeTpl === "side-image-horizontal-board"
    ) {
      const isRightSide = activeTpl === "side-image-right-spotlight";
      const sideW = Math.floor(availW * 0.37);
      const listW = availW - sideW - 26;
      const sideX = isRightSide ? padX + listW + 26 : padX;
      const listX = isRightSide ? padX : padX + sideW + 26;
      const rowGap = 16;
      const rowH = Math.max(108, Math.floor((availH - rowGap * (count - 1)) / count));

      return (
        <g>
          {/* Visual Side Showcase Panel */}
          <clipPath id="sidePanelClip">
            <rect x={sideX} y={bodyTop} width={sideW} height={availH} rx={28} />
          </clipPath>
          <rect
            x={sideX}
            y={bodyTop}
            width={sideW}
            height={availH}
            rx={28}
            fill={palette.cardBg}
            stroke={palette.accent}
            strokeWidth={2.5}
            filter="url(#dropShadow)"
          />

          <g clipPath="url(#sidePanelClip)">
            {sideImageUrl ? (
              <>
                <image
                  href={sideImageUrl}
                  x={sideX}
                  y={bodyTop}
                  width={sideW}
                  height={Math.floor(availH * 0.56)}
                  preserveAspectRatio="xMidYMid slice"
                />
                <rect
                  x={sideX}
                  y={bodyTop}
                  width={sideW}
                  height={Math.floor(availH * 0.56)}
                  fill="url(#bgGrad)"
                  fillOpacity={0.28}
                />
              </>
            ) : (
              /* Rich Vector Hero Illustration when no external photo is set */
              <g>
                <rect
                  x={sideX}
                  y={bodyTop}
                  width={sideW}
                  height={Math.floor(availH * 0.54)}
                  fill="url(#accentGrad)"
                  fillOpacity={0.2}
                />
                <circle
                  cx={sideX + sideW / 2}
                  cy={bodyTop + availH * 0.25}
                  r={110}
                  fill={palette.accent}
                  fillOpacity={0.18}
                />
                <circle
                  cx={sideX + sideW / 2}
                  cy={bodyTop + availH * 0.25}
                  r={72}
                  fill={palette.accent}
                  fillOpacity={0.35}
                />
                {renderSvgIcon(
                  "sparkles",
                  sideX + sideW / 2,
                  bodyTop + availH * 0.25,
                  68,
                  "#FFFFFF",
                )}
              </g>
            )}

            {/* Executive Summary Spotlight Box inside Side Panel */}
            <rect
              x={sideX + 24}
              y={bodyTop + Math.floor(availH * 0.58)}
              width={sideW - 48}
              height={Math.floor(availH * 0.38)}
              rx={22}
              fill={palette.bgStart}
              fillOpacity={0.9}
              stroke={palette.accent}
              strokeWidth={1.8}
            />
            <text
              x={sideX + 46}
              y={bodyTop + Math.floor(availH * 0.58) + 42}
              fill={palette.accent}
              fontSize={15}
              fontWeight={900}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              KEY TAKEAWAY SPOTLIGHT
            </text>
            <text
              x={sideX + 46}
              y={bodyTop + Math.floor(availH * 0.58) + 92}
              fill={palette.textPrimary}
              fontSize={44}
              fontWeight={900}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {activeNodes[0]?.metricValue || `${count} Pillars`}
            </text>
            {wrapSvgLines(
              activeNodes[0]?.body || subtitle,
              26,
              5,
            ).map((l, idx) => (
              <text
                key={idx}
                x={sideX + 46}
                y={bodyTop + Math.floor(availH * 0.58) + 136 + idx * 26}
                fill={palette.textSecondary}
                fontSize={17}
                fontWeight={600}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {l}
              </text>
            ))}
          </g>

          {/* Structured Infographic Cards on Opposite Column */}
          {activeNodes.map((node, i) => {
            const y = bodyTop + i * (rowH + rowGap);
            const col = nodeColor(i);
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 32, 1);
            const bLines = wrapSvgLines(node.body, 46, 2);

            return (
              <g key={node.id}>
                <rect
                  x={listX}
                  y={y}
                  width={listW}
                  height={rowH}
                  rx={20}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2}
                  filter="url(#dropShadow)"
                />
                <circle
                  cx={listX + 46}
                  cy={y + rowH / 2}
                  r={28}
                  fill={`${col}22`}
                  stroke={col}
                  strokeWidth={2}
                />
                {renderSvgIcon(iconId, listX + 46, y + rowH / 2, 24, col)}

                <text
                  x={listX + 90}
                  y={y + 42}
                  fill={palette.textPrimary}
                  fontSize={21}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.badge || `0${i + 1}`}. {tLines[0]}
                </text>

                {bLines.map((line, li) => (
                  <text
                    key={li}
                    x={listX + 90}
                    y={y + 72 + li * 22}
                    fill={palette.textSecondary}
                    fontSize={16}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 6. RADIAL DONUT GAUGE & KPI DASHBOARD
    if (activeTpl === "stat-donut-kpi-dashboard") {
      const cols = 2;
      const rows = Math.ceil(count / cols);
      const gap = 22;
      const cardW = Math.floor((availW - gap) / cols);
      const cardH = Math.max(185, Math.floor((availH - gap * (rows - 1)) / rows));
      const radius = 44;
      const circum = 2 * Math.PI * radius;

      return (
        <g>
          {activeNodes.map((node, i) => {
            const colIdx = i % cols;
            const rowIdx = Math.floor(i / cols);
            const x = padX + colIdx * (cardW + gap);
            const y = bodyTop + rowIdx * (cardH + gap);
            const col = nodeColor(i);
            const pct = parsePercentage(node.metricValue, i);
            const dash = (pct / 100) * circum;
            const tLines = wrapSvgLines(node.title, 22, 2);
            const bLines = wrapSvgLines(node.body, 36, 3);

            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={24}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.2}
                  filter="url(#dropShadow)"
                />

                {/* Radial Donut Ring Gauge */}
                <g transform={`translate(${x + 68}, ${y + 72})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    fill="none"
                    stroke={palette.textSecondary}
                    strokeOpacity={0.2}
                    strokeWidth={10}
                  />
                  <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    fill="none"
                    stroke={col}
                    strokeWidth={10}
                    strokeDasharray={`${dash} ${circum}`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                  />
                  <text
                    x={0}
                    y={7}
                    textAnchor="middle"
                    fill={palette.textPrimary}
                    fontSize={21}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {node.metricValue ? node.metricValue.slice(0, 6) : `${pct}%`}
                  </text>
                </g>

                {/* Title Next to Donut */}
                {tLines.map((line, ti) => (
                  <text
                    key={ti}
                    x={x + 132}
                    y={y + 56 + ti * 26}
                    fill={palette.textPrimary}
                    fontSize={21}
                    fontWeight={800}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {line}
                  </text>
                ))}

                {/* Body Below */}
                {bLines.map((line, bi) => (
                  <text
                    key={bi}
                    x={x + 28}
                    y={y + 148 + bi * 23}
                    fill={palette.textSecondary}
                    fontSize={16}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 7. RADIAL HUB & SPOKE MIND-MAP / CIRCULAR FLYWHEEL
    if (
      activeTpl === "radial-hub-and-spoke" ||
      activeTpl === "circular-flywheel-cycle"
    ) {
      const centerX = Math.floor(W / 2);
      const centerY = Math.floor(bodyTop + availH / 2);
      const radiusX = Math.floor(availW * 0.34);
      const radiusY = Math.floor(availH * 0.36);
      const cardW = isHorizontal ? 340 : 290;
      const cardH = isHorizontal ? 148 : 165;

      return (
        <g>
          {/* Outer Orbit Track */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={radiusX}
            ry={radiusY}
            fill="none"
            stroke={palette.accent}
            strokeOpacity={0.28}
            strokeWidth={4}
            strokeDasharray="10 8"
          />

          {/* Bezier Spoke Lines */}
          {activeNodes.map((node, i) => {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            const nx = centerX + Math.cos(angle) * radiusX;
            const ny = centerY + Math.sin(angle) * radiusY;
            const col = nodeColor(i);
            return (
              <line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={nx}
                y2={ny}
                stroke={col}
                strokeWidth={3.5}
              />
            );
          })}

          {/* Central Hub Core Orb */}
          <circle
            cx={centerX}
            cy={centerY}
            r={92}
            fill={palette.cardBg}
            stroke={palette.accent}
            strokeWidth={5}
            filter="url(#dropShadow)"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={76}
            fill="url(#accentGrad)"
            fillOpacity={0.25}
          />
          {renderSvgIcon("layers", centerX, centerY - 26, 36, palette.accent)}
          <text
            x={centerX}
            y={centerY + 14}
            textAnchor="middle"
            fill={palette.textPrimary}
            fontSize={18}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            CORE SYSTEM
          </text>
          <text
            x={centerX}
            y={centerY + 38}
            textAnchor="middle"
            fill={palette.accent}
            fontSize={15}
            fontWeight={800}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {count} Connected Pillars
          </text>

          {/* Satellite Spoke Cards */}
          {activeNodes.map((node, i) => {
            const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
            const nx = centerX + Math.cos(angle) * radiusX;
            const ny = centerY + Math.sin(angle) * radiusY;
            const x = Math.max(padX, Math.min(W - padX - cardW, nx - cardW / 2));
            const y = Math.max(
              bodyTop,
              Math.min(bodyBottom - cardH, ny - cardH / 2),
            );
            const col = nodeColor(i);
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 22, 1);
            const bLines = wrapSvgLines(node.body, 32, 3);

            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={20}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.5}
                  filter="url(#dropShadow)"
                />
                <circle cx={x + 32} cy={y + 34} r={18} fill={col} />
                {renderSvgIcon(iconId, x + 32, y + 34, 18, palette.badgeText)}
                <text
                  x={x + 60}
                  y={y + 40}
                  fill={palette.textPrimary}
                  fontSize={18}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>
                {bLines.map((line, bi) => (
                  <text
                    key={bi}
                    x={x + 20}
                    y={y + 74 + bi * 21}
                    fill={palette.textSecondary}
                    fontSize={14.5}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 8. VERSUS BATTLE COMPARISON OR DO'S & DON'TS PLAYBOOK
    if (
      activeTpl === "versus-battle-comparison" ||
      activeTpl === "dos-and-donts-matrix"
    ) {
      const isDos = activeTpl === "dos-and-donts-matrix";
      const gap = 36;
      const colW = Math.floor((availW - gap) / 2);
      const rowsTop = bodyTop + 68;
      const rowGap = 16;
      const rowH = Math.max(
        112,
        Math.floor((availH - 68 - rowGap * (count - 1)) / count),
      );

      return (
        <g>
          {/* Left Header */}
          <rect
            x={padX}
            y={bodyTop}
            width={colW}
            height={52}
            rx={16}
            fill="rgba(244, 63, 94, 0.22)"
            stroke="#F43F5E"
            strokeWidth={2}
          />
          <text
            x={padX + colW / 2}
            y={bodyTop + 33}
            textAnchor="middle"
            fill="#FDA4AF"
            fontSize={19}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isDos ? "✗ COMMON MISTAKES TO AVOID" : "◀ LEGACY / OLD WORKFLOW"}
          </text>

          {/* Right Header */}
          <rect
            x={padX + colW + gap}
            y={bodyTop}
            width={colW}
            height={52}
            rx={16}
            fill="rgba(16, 185, 129, 0.22)"
            stroke="#10B981"
            strokeWidth={2}
          />
          <text
            x={padX + colW + gap + colW / 2}
            y={bodyTop + 33}
            textAnchor="middle"
            fill="#6EE7B7"
            fontSize={19}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isDos ? "✓ HIGH-IMPACT BEST PRACTICES" : "▶ AI-FIRST HIGH-LEVERAGE WAY"}
          </text>

          {activeNodes.map((node, i) => {
            const y = rowsTop + i * (rowH + rowGap);
            const leftLines = wrapSvgLines(node.body, 34, 3);
            const rightText =
              node.compareRight ||
              `Execute "${node.title}" with automated verification for ${node.metricValue || "2.4x"} higher ROI.`;
            const rightLines = wrapSvgLines(rightText, 34, 3);

            return (
              <g key={node.id}>
                {/* Left Card */}
                <rect
                  x={padX}
                  y={y}
                  width={colW}
                  height={rowH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke="#F43F5E"
                  strokeOpacity={0.6}
                  strokeWidth={2}
                />
                <text
                  x={padX + 20}
                  y={y + 34}
                  fill="#FDA4AF"
                  fontSize={18}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  ✗ {node.title.slice(0, 32)}
                </text>
                {leftLines.map((l, li) => (
                  <text
                    key={li}
                    x={padX + 20}
                    y={y + 62 + li * 22}
                    fill={palette.textSecondary}
                    fontSize={15}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {l}
                  </text>
                ))}

                {/* Center VS Emblem */}
                <circle
                  cx={W / 2}
                  cy={y + rowH / 2}
                  r={18}
                  fill={palette.accent}
                />
                <text
                  x={W / 2}
                  y={y + rowH / 2 + 5}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={12}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {isDos ? "→" : "VS"}
                </text>

                {/* Right Card */}
                <rect
                  x={padX + colW + gap}
                  y={y}
                  width={colW}
                  height={rowH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke="#10B981"
                  strokeWidth={2.5}
                  filter="url(#dropShadow)"
                />
                <text
                  x={padX + colW + gap + 20}
                  y={y + 34}
                  fill="#6EE7B7"
                  fontSize={18}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  ✓ Winning Play #{i + 1} ({node.metricValue || "Verified"})
                </text>
                {rightLines.map((l, li) => (
                  <text
                    key={li}
                    x={padX + colW + gap + 20}
                    y={y + 62 + li * 22}
                    fill={palette.textPrimary}
                    fontSize={15}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 9. 3D ASCENDING GROWTH STAIRCASE
    if (activeTpl === "step-staircase-ascension") {
      const stepW = Math.floor(availW * 0.68);
      const maxOffset = availW - stepW;
      const rowGap = 14;
      const stepH = Math.max(98, Math.floor((availH - rowGap * (count - 1)) / count));

      return (
        <g>
          {activeNodes.map((node, i) => {
            // Bottom-left to Top-right ascending staircase or Top-left to Bottom-right
            const x =
              padX + Math.floor((maxOffset * i) / Math.max(1, count - 1));
            const y = bodyTop + i * (stepH + rowGap);
            const col = nodeColor(i);
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const tLines = wrapSvgLines(node.title, 32, 1);
            const bLines = wrapSvgLines(node.body, 46, 2);

            return (
              <g key={node.id}>
                {/* 3D Step Shadow Base */}
                <rect
                  x={x + 10}
                  y={y + 10}
                  width={stepW}
                  height={stepH}
                  rx={20}
                  fill={col}
                  fillOpacity={0.28}
                />
                <rect
                  x={x}
                  y={y}
                  width={stepW}
                  height={stepH}
                  rx={20}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.5}
                  filter="url(#dropShadow)"
                />
                <rect
                  x={x + 18}
                  y={y + 18}
                  width={62}
                  height={stepH - 36}
                  rx={14}
                  fill={col}
                />
                {renderSvgIcon(
                  iconId,
                  x + 49,
                  y + stepH / 2 - 10,
                  22,
                  palette.badgeText,
                )}
                <text
                  x={x + 49}
                  y={y + stepH / 2 + 20}
                  textAnchor="middle"
                  fill={palette.badgeText}
                  fontSize={15}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  0{i + 1}
                </text>

                <text
                  x={x + 98}
                  y={y + 40}
                  fill={palette.textPrimary}
                  fontSize={21}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tLines[0]}
                </text>
                {bLines.map((l, li) => (
                  <text
                    key={li}
                    x={x + 98}
                    y={y + 68 + li * 22}
                    fill={palette.textSecondary}
                    fontSize={16}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 10. EDITORIAL NEWSPAPER / HORIZONTAL BAR CHART BRIEF
    if (activeTpl === "editorial-newspaper-digest") {
      const chartH = Math.floor(availH * 0.36);
      const gridTop = bodyTop + chartH + 26;
      const gridAvailH = availH - chartH - 26;
      const cols = 2;
      const rows = Math.ceil(count / cols);
      const gap = 18;
      const cardW = Math.floor((availW - gap) / cols);
      const cardH = Math.max(
        125,
        Math.floor((gridAvailH - gap * (rows - 1)) / rows),
      );

      return (
        <g>
          {/* Top Comparative Horizontal Bar Chart Card */}
          <rect
            x={padX}
            y={bodyTop}
            width={availW}
            height={chartH}
            rx={22}
            fill={palette.cardBg}
            stroke={palette.accent}
            strokeWidth={2}
            filter="url(#dropShadow)"
          />
          <text
            x={padX + 28}
            y={bodyTop + 38}
            fill={palette.accent}
            fontSize={16}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            COMPARATIVE IMPACT &amp; BENCHMARK DISTRIBUTION
          </text>

          {activeNodes.slice(0, 5).map((node, i) => {
            const by = bodyTop + 62 + i * Math.floor((chartH - 76) / 5);
            const pct = parsePercentage(node.metricValue, i);
            const maxBarW = availW - 360;
            const barW = Math.floor((maxBarW * pct) / 100);
            const col = nodeColor(i);
            return (
              <g key={`bar-${node.id}`}>
                <text
                  x={padX + 28}
                  y={by + 18}
                  fill={palette.textPrimary}
                  fontSize={15.5}
                  fontWeight={700}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.title.slice(0, 26)}
                </text>
                <rect
                  x={padX + 260}
                  y={by}
                  width={maxBarW}
                  height={22}
                  rx={11}
                  fill={palette.bgStart}
                />
                <rect
                  x={padX + 260}
                  y={by}
                  width={barW}
                  height={22}
                  rx={11}
                  fill={col}
                />
                <text
                  x={padX + 272 + barW}
                  y={by + 16}
                  fill={palette.textPrimary}
                  fontSize={14}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.metricValue || `${pct}%`}
                </text>
              </g>
            );
          })}

          {/* Bottom Evidence Cards Grid */}
          {activeNodes.map((node, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = padX + c * (cardW + gap);
            const y = gridTop + r * (cardH + gap);
            const col = nodeColor(i);
            const tLines = wrapSvgLines(node.title, 26, 1);
            const bLines = wrapSvgLines(node.body, 36, 3);
            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={18}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={1.8}
                />
                <text
                  x={x + 22}
                  y={y + 34}
                  fill={col}
                  fontSize={18}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.badge || `0${i + 1}`}. {tLines[0]}
                </text>
                {bLines.map((l, li) => (
                  <text
                    key={li}
                    x={x + 22}
                    y={y + 62 + li * 21}
                    fill={palette.textSecondary}
                    fontSize={15}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
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

    // 11. BENTO MOSAIC, HEXAGON CLUSTER, 2x2 QUADRANT, PILLAR TEMPLE, OR HORIZONTAL BOARD
    if (
      activeTpl === "stat-bento-grid" ||
      activeTpl === "honeycomb-hex-cluster" ||
      activeTpl === "quadrant-2x2-strategy" ||
      activeTpl === "pillar-temple-architecture" ||
      activeTpl === "horizontal-landscape-flow" ||
      activeTpl === "horizontal-timeline-gantt"
    ) {
      const cols = isHorizontal ? 3 : 2;
      const rows = Math.ceil(count / cols);
      const gap = 22;
      const cardW = Math.floor((availW - gap * (cols - 1)) / cols);
      const cardH = Math.max(
        170,
        Math.floor((availH - gap * (rows - 1)) / rows),
      );

      return (
        <g>
          {activeNodes.map((node, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = padX + c * (cardW + gap);
            const y = bodyTop + r * (cardH + gap);
            const col = nodeColor(i);
            const iconId = node.icon || inferNodeIcon(node.title, i);
            const pct = parsePercentage(node.metricValue, i);
            const tLines = wrapSvgLines(node.title, 24, 2);
            const bLines = wrapSvgLines(node.body, 34, 3);

            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={activeTpl === "honeycomb-hex-cluster" ? 36 : 24}
                  fill={palette.cardBg}
                  stroke={col}
                  strokeWidth={2.5}
                  filter="url(#dropShadow)"
                />
                {/* Top Icon + Metric Row */}
                <circle
                  cx={x + 42}
                  cy={y + 42}
                  r={24}
                  fill={`${col}24`}
                  stroke={col}
                  strokeWidth={2}
                />
                {renderSvgIcon(iconId, x + 42, y + 42, 22, col)}

                <text
                  x={x + cardW - 24}
                  y={y + 50}
                  textAnchor="end"
                  fill={col}
                  fontSize={28}
                  fontWeight={900}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.metricValue || `0${i + 1}`}
                </text>

                {tLines.map((l, ti) => (
                  <text
                    key={ti}
                    x={x + 24}
                    y={y + 94 + ti * 25}
                    fill={palette.textPrimary}
                    fontSize={21}
                    fontWeight={800}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {l}
                  </text>
                ))}

                {bLines.map((l, bi) => (
                  <text
                    key={bi}
                    x={x + 24}
                    y={y + 142 + bi * 22}
                    fill={palette.textSecondary}
                    fontSize={15.5}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {l}
                  </text>
                ))}

                {/* Bottom Progress Benchmark Bar */}
                <rect
                  x={x + 24}
                  y={y + cardH - 22}
                  width={cardW - 48}
                  height={8}
                  rx={4}
                  fill={palette.bgStart}
                />
                <rect
                  x={x + 24}
                  y={y + cardH - 22}
                  width={Math.floor(((cardW - 48) * pct) / 100)}
                  height={8}
                  rx={4}
                  fill={col}
                />
              </g>
            );
          })}
        </g>
      );
    }

    // DEFAULT & RIBBON BANNERS / STEP ROADMAP / ICEBERG / ANATOMY / SCORECARD
    const rowGap = 18;
    const rowH = Math.max(108, Math.floor((availH - rowGap * (count - 1)) / count));
    const isRibbon = activeTpl === "numbered-ribbon-banners";

    return (
      <g>
        {activeNodes.map((node, i) => {
          const y = bodyTop + i * (rowH + rowGap);
          const col = nodeColor(i);
          const iconId = node.icon || inferNodeIcon(node.title, i);
          const pct = parsePercentage(node.metricValue, i);
          const tLines = wrapSvgLines(node.title, 38, 1);
          const bLines = wrapSvgLines(node.body, 62, 2);

          return (
            <g key={node.id}>
              <rect
                x={padX}
                y={y}
                width={availW}
                height={rowH}
                rx={22}
                fill={palette.cardBg}
                stroke={col}
                strokeWidth={2.2}
                filter="url(#dropShadow)"
              />

              {/* 3D Ribbon Fold or Left Accent Pillar */}
              {isRibbon ? (
                <g>
                  <polygon
                    points={`${padX - 12},${y + 18} ${padX + 86},${y + 18} ${padX + 102},${y + 46} ${padX + 86},${y + 74} ${padX - 12},${y + 74}`}
                    fill={col}
                    filter="url(#dropShadow)"
                  />
                  <text
                    x={padX + 38}
                    y={y + 54}
                    textAnchor="middle"
                    fill={palette.badgeText}
                    fontSize={24}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    #{node.badge || `0${i + 1}`}
                  </text>
                </g>
              ) : (
                <g>
                  <rect
                    x={padX + 20}
                    y={y + (rowH - 68) / 2}
                    width={68}
                    height={68}
                    rx={18}
                    fill={`${col}22`}
                    stroke={col}
                    strokeWidth={2}
                  />
                  {renderSvgIcon(iconId, padX + 54, y + rowH / 2, 30, col)}
                </g>
              )}

              {/* Title */}
              <text
                x={padX + 114}
                y={y + 42}
                fill={palette.textPrimary}
                fontSize={23}
                fontWeight={800}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {tLines[0]}
              </text>

              {/* Metric Pill on Right */}
              <rect
                x={padX + availW - 156}
                y={y + 18}
                width={134}
                height={34}
                rx={17}
                fill={palette.accentSoft}
                stroke={col}
                strokeWidth={1.5}
              />
              <text
                x={padX + availW - 89}
                y={y + 40}
                textAnchor="middle"
                fill={col}
                fontSize={15}
                fontWeight={800}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {node.metricValue ? node.metricValue.slice(0, 12) : `${pct}% Impact`}
              </text>

              {/* Body Lines */}
              {bLines.map((l, bi) => (
                <text
                  key={bi}
                  x={padX + 114}
                  y={y + 72 + bi * 24}
                  fill={palette.textSecondary}
                  fontSize={17}
                  fontWeight={500}
                  fontFamily="system-ui, -apple-system, sans-serif"
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

  const seoEmbedCode = `<!-- Interactive Infographic Embed Code -->
<figure style="max-width:850px;margin:24px auto;text-align:center;font-family:system-ui,sans-serif">
  <a href="${sourceUrl}" target="_blank" rel="noopener">
    <img src="${sourceUrl.replace(/\/$/, "")}/infographic-${template}.png" alt="${title.replace(/"/g, "&quot;")}" style="width:100%;height:auto;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.15)" loading="lazy" />
  </a>
  <figcaption style="margin-top:10px;font-size:13px;color:#475569">
    <strong>${title}</strong> — Visual Infographic designed with <a href="https://doitwithai.tools/tools/blog-to-infographic-generator" target="_blank" rel="noopener">Do It With AI Tools</a>. Source: <a href="${sourceUrl}" target="_blank" rel="noopener">${footerBrand}</a>.
  </figcaption>
</figure>`;

  return (
    <div className="rounded-3xl border-2 border-[#3452d1]/25 bg-white p-4 shadow-sm dark:border-[#5271ff]/30 dark:bg-[#0B1120] sm:p-6 space-y-6">
      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <Check size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. TEMPLATE BROWSER (26 TEMPLATES ACROSS 8 CATEGORIES) */}
      <div className="space-y-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
              <Layers size={14} />
              26 Realistic Vector Infographic Templates · Pure SVG + 2x Retina
              PNG + PDF
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Choose an Infographic Layout or Hover Over the Poster to Download
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowEmbedModal((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <Code2 size={14} />
            SEO Backlink Embed HTML
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                categoryFilter === cat.id
                  ? "bg-[#3452d1] text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable 26-Template Selector Grid */}
        <div className="grid max-h-60 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTemplates.map((tpl) => {
            const active = normalizeTemplateId(template) === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`group rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-[#ff6b35] bg-[#ff6b35]/10 ring-1 ring-[#ff6b35] dark:border-[#ff6b35] dark:bg-[#ff6b35]/15"
                    : "border-slate-200 bg-slate-50/70 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <strong className="truncate text-xs font-extrabold text-slate-900 dark:text-white">
                    {tpl.label}
                  </strong>
                  <span className="shrink-0 rounded-md bg-[#3452d1]/15 px-1.5 py-0.5 text-[10px] font-black text-[#3452d1] dark:text-[#9aabff]">
                    {tpl.badge}
                  </span>
                </div>
                <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {tpl.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Aspect Ratio, Color Palette & Custom Brand Color Pickers */}
        <div className="grid gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Layers size={13} className="text-[#3452d1]" />
              Poster Orientation &amp; Size
            </label>
            <select
              value={aspect}
              onChange={(e) =>
                setAspect(e.target.value as InfographicAspectRatio)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="vertical-poster">
                Vertical Infographic Poster (1080×1920)
              </option>
              <option value="pinterest-tall">
                Pinterest 2:3 Tall Pin (1000×1500)
              </option>
              <option value="portrait-social">
                LinkedIn / Instagram 4:5 Portrait (1080×1350)
              </option>
              <option value="horizontal-landscape">
                Horizontal Widescreen Presentation (1600×1000)
              </option>
              <option value="square-card">
                Universal 1:1 Square Visual (1200×1200)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Palette size={13} className="text-[#ff6b35]" />
              Designer Color Theme (12 Presets + Custom)
            </label>
            <select
              value={paletteId}
              onChange={(e) =>
                setPaletteId(e.target.value as InfographicColorPaletteId)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {INFOGRAPHIC_PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="custom-brand">
                🎨 Custom Brand Colors (Use Pickers →)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Wand2 size={13} className="text-emerald-500" />
              Custom Color Swatches (Click to Pick)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={palette.bgStart}
                  onChange={(e) => {
                    setPaletteId("custom-brand");
                    setCustomColors((prev) => ({
                      ...prev,
                      bgStart: e.target.value,
                      bgEnd: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                BG
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={palette.cardBg.startsWith("#") ? palette.cardBg : "#1E293B"}
                  onChange={(e) => {
                    setPaletteId("custom-brand");
                    setCustomColors((prev) => ({
                      ...prev,
                      cardBg: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                Card
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={palette.accent}
                  onChange={(e) => {
                    setPaletteId("custom-brand");
                    setCustomColors((prev) => ({
                      ...prev,
                      accent: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                Accent
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={palette.textPrimary}
                  onChange={(e) => {
                    setPaletteId("custom-brand");
                    setCustomColors((prev) => ({
                      ...prev,
                      textPrimary: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                Text
              </label>
            </div>
          </div>
        </div>

        {showEmbedModal && (
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-4 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                SEO Backlink Acquisition HTML Embed Code
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(seoEmbedCode);
                  notify("Copied SEO Infographic Embed HTML code!");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#ff6b35] px-3 py-1 text-xs font-bold text-white"
              >
                <Copy size={12} /> Copy Embed HTML
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">
              {seoEmbedCode}
            </pre>
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE: LIVE HOVER-DOWNLOAD INFOGRAPHIC CANVAS (TOP/RIGHT) + INLINE EDITOR (LEFT) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] items-start">
        {/* LEFT COLUMN: INLINE HEADER, SIDE-IMAGE & NODE EDITOR */}
        <div className="space-y-4 order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              1. Customize Header, Side Image &amp; Brand Footer
            </h4>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Top Kicker Pill
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Brand Footer Attribution
                </label>
                <input
                  type="text"
                  value={footerBrand}
                  onChange={(e) => setFooterBrand(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Main Infographic Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Subtitle / Executive Takeaway
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <ImageIcon size={12} className="text-[#ff6b35]" />
                Side-Image / Hero Artwork URL (Used in Side-Image Split Templates)
              </label>
              <input
                type="url"
                value={sideImageUrl}
                onChange={(e) => setSideImageUrl(e.target.value)}
                placeholder="Paste image URL or select an extracted article image below..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
              {extractedImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {extractedImages.slice(0, 5).map((imgUrl, idx) => (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => {
                        setSideImageUrl(imgUrl);
                        setTemplate("side-image-editorial-split");
                        notify(`Applied Article Image #${idx + 1} to Side-Image Split template!`);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold hover:border-[#ff6b35] dark:border-slate-700 dark:bg-slate-900"
                    >
                      Use Article Image #{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EDITABLE VISUAL NODES */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                2. Edit Infographic Nodes &amp; Icons ({nodes.length} / 8)
              </h4>
              <button
                type="button"
                onClick={addNode}
                className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2.5 py-1 text-xs font-extrabold text-white hover:bg-[#2842b5]"
              >
                <Plus size={13} /> Add Node
              </button>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {nodes.map((node, i) => (
                <div
                  key={node.id}
                  className={`rounded-xl border bg-white p-3 space-y-2 shadow-2xs transition dark:bg-slate-950 ${
                    selectedNodeId === node.id
                      ? "border-[#ff6b35] ring-1 ring-[#ff6b35]"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Node #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNode(node.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">
                        Step / Badge
                      </label>
                      <input
                        type="text"
                        value={node.badge}
                        onChange={(e) =>
                          updateNode(node.id, "badge", e.target.value)
                        }
                        className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">
                        Stat / KPI Pill
                      </label>
                      <input
                        type="text"
                        value={node.metricValue || ""}
                        onChange={(e) =>
                          updateNode(node.id, "metricValue", e.target.value)
                        }
                        placeholder="e.g. 88%, 3.4x ROI"
                        className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">
                        Vector Icon
                      </label>
                      <select
                        value={node.icon || inferNodeIcon(node.title, i)}
                        onChange={(e) =>
                          updateNode(
                            node.id,
                            "icon",
                            e.target.value as InfographicIconId,
                          )
                        }
                        className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      >
                        {ICON_OPTIONS.map((ic) => (
                          <option key={ic.id} value={ic.id}>
                            {ic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">
                      Node Headline
                    </label>
                    <input
                      type="text"
                      value={node.title}
                      onChange={(e) =>
                        updateNode(node.id, "title", e.target.value)
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">
                      Concise Visual Description
                    </label>
                    <textarea
                      rows={2}
                      value={node.body}
                      onChange={(e) =>
                        updateNode(node.id, "body", e.target.value)
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE VECTOR SVG INFOGRAPHIC WITH HOVER DOWNLOAD OVERLAY */}
        <div className="space-y-3 order-1 lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Vector Infographic ({dimensions.label})
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-[#ff6b35]">
              <Sparkles size={13} /> Hover over the infographic to download PNG,
              SVG, or PDF
            </span>
          </div>

          {/* HOVERABLE INFOGRAPHIC STAGE */}
          <div
            className={`group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2.5 shadow-xl transition dark:border-slate-700 ${
              isFullscreen
                ? "fixed inset-4 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6"
                : ""
            }`}
          >
            {/* FLOATING HOVER DOWNLOAD BAR OVER THE INFOGRAPHIC */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 opacity-95 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
              <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/90 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Pure Vector + 2x Retina Ready</span>
              </div>

              <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={downloadHighResPng}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#e85d2a]"
                >
                  <Download size={14} />
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={downloadVectorSvg}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#2842b5]"
                >
                  <FileCode2 size={14} />
                  SVG
                </button>
                <button
                  type="button"
                  onClick={printPdfPoster}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500"
                >
                  <Printer size={14} />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={copyInfographicImage}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy size={13} />
                  {copiedImg ? "Copied!" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen((v) => !v)}
                  title="Toggle Fullscreen Preview"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Subtle persistent pill when not hovered on desktop */}
            <div className="pointer-events-none absolute right-5 top-5 z-10 hidden items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-xs transition-opacity sm:inline-flex sm:group-hover:opacity-0">
              <Download size={12} className="text-[#ff6b35]" />
              <span>Hover to Download (PNG · SVG · PDF)</span>
            </div>

            {/* PURE VECTOR SVG INFOGRAPHIC POSTER */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className={`mx-auto block w-full rounded-xl object-contain ${
                isFullscreen ? "max-h-[88vh]" : "max-h-[860px]"
              }`}
              role="img"
              aria-label={title}
            >
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={palette.bgStart} />
                  <stop offset="100%" stopColor={palette.bgEnd} />
                </linearGradient>
                <linearGradient
                  id="accentGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={palette.accent} />
                  <stop offset="100%" stopColor={palette.accentSecondary} />
                </linearGradient>
                <filter
                  id="dropShadow"
                  x="-8%"
                  y="-8%"
                  width="116%"
                  height="120%"
                >
                  <feDropShadow
                    dx="0"
                    dy="8"
                    stdDeviation="10"
                    floodColor="#000000"
                    floodOpacity="0.28"
                  />
                </filter>
                <pattern
                  id="dotGrid"
                  width="36"
                  height="36"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="1.6"
                    fill={palette.textSecondary}
                    fillOpacity="0.14"
                  />
                </pattern>
              </defs>

              {/* 1. Poster Background + Subtle Geometric Mesh */}
              <rect width={W} height={H} fill="url(#bgGrad)" />
              <rect width={W} height={H} fill="url(#dotGrid)" />
              <circle
                cx={W - 90}
                cy={90}
                r={210}
                fill={palette.accent}
                fillOpacity={0.12}
              />
              <circle
                cx={80}
                cy={H - 160}
                r={190}
                fill={palette.accentSecondary}
                fillOpacity={0.1}
              />

              {/* 2. Poster Header Block */}
              <g>
                {/* Kicker Pill */}
                <rect
                  x={padX}
                  y={isHorizontal ? 34 : 46}
                  width={Math.min(
                    availW,
                    Math.max(220, (kicker || "VISUAL PLAYBOOK").length * 13 + 48),
                  )}
                  height={38}
                  rx={19}
                  fill="url(#accentGrad)"
                />
                <text
                  x={padX + 22}
                  y={isHorizontal ? 59 : 71}
                  fill={palette.badgeText}
                  fontSize={16}
                  fontWeight={900}
                  letterSpacing="1.2"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {(kicker || "VISUAL INFOGRAPHIC").toUpperCase()}
                </text>

                {/* Main Title */}
                {titleLines.map((line, idx) => (
                  <text
                    key={idx}
                    x={padX}
                    y={
                      (isHorizontal ? 114 : 134) + idx * (titleFontSize + 10)
                    }
                    fill={palette.textPrimary}
                    fontSize={titleFontSize}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {line}
                  </text>
                ))}

                {/* Subtitle */}
                {subtitleLines.map((line, idx) => (
                  <text
                    key={idx}
                    x={padX}
                    y={
                      (isHorizontal ? 118 : 142) +
                      titleLines.length * (titleFontSize + 10) +
                      idx * 28
                    }
                    fill={palette.textSecondary}
                    fontSize={isHorizontal ? 19 : 21}
                    fontWeight={500}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {line}
                  </text>
                ))}

                {/* Accent Divider Bar */}
                <rect
                  x={padX}
                  y={headerH - 22}
                  width={180}
                  height={6}
                  rx={3}
                  fill="url(#accentGrad)"
                />
              </g>

              {/* 3. Dynamic Template Body */}
              {renderInfographicBody()}

              {/* 4. Poster Footer Bar */}
              <g transform={`translate(0, ${H - footerH})`}>
                <rect
                  width={W}
                  height={footerH}
                  fill="#020617"
                  fillOpacity={0.72}
                />
                <line
                  x1={0}
                  y1={0}
                  x2={W}
                  y2={0}
                  stroke={palette.accent}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
                <circle
                  cx={padX + 14}
                  cy={footerH / 2}
                  r={9}
                  fill={palette.accent}
                />
                <text
                  x={padX + 34}
                  y={footerH / 2 + 7}
                  fill="#FFFFFF"
                  fontSize={20}
                  fontWeight={800}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {footerBrand || "doitwithai.tools"}
                </text>
                <text
                  x={W - padX}
                  y={footerH / 2 + 7}
                  textAnchor="end"
                  fill="#CBD5E1"
                  fontSize={16}
                  fontWeight={700}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  Save &amp; Share This Visual Guide ★
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditableInfographicStudio;
