import type {
  BlogInfographicConfig,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";

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
