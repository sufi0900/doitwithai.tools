"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Code2,
  Copy,
  KeyRound,
  RefreshCw,
  Sparkles,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import {
  getCatalogToolBySlug,
  resolveCatalogToolSlug,
  shouldApplyHeroOverride,
} from "@/features/website-builder/domain/catalog-tool-resolver";
import type { ToolGradientPreset, ToolPageEdits } from "@/features/website-builder/domain/tool-page-properties";
import { TransferredToolRuntimeProvider } from "./TransferredToolRuntimeContext";
import {
  getTransferredToolComponent,
  hasTransferredToolComponent,
} from "@/features/website-builder/tools/transferred-tool-registry";

export { resolveCatalogToolSlug };

export type WebsiteToolSpec = {
  id: string;
  title: string;
  summary: string;
  caseStudySlug: string;
  technologies: string[];
  link?: string;
  role?: string;
  period?: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  inputLabel?: string;
  defaultInput?: string;
  secondaryInputLabel?: string;
  defaultSecondaryInput?: string;
  customCtaLabel?: string;
  heroHighlights?: string[];
  toolAccentHex?: string;
  toolSecondaryAccentHex?: string;
  toolBackgroundHex?: string;
  toolSurfaceHex?: string;
  toolGradientPreset?: ToolGradientPreset;
  toolThemeMode?: "auto" | "dark" | "light";
  hideEducationSection?: boolean;
  hideFaqSection?: boolean;
  customFaqs?: Array<{ question: string; answer: string }>;
  metaTitle?: string;
  metaDescription?: string;
  toolPageEdits?: ToolPageEdits;
  installedToolVersion?: string;
};

const SITE_ACCENT_HEX_MAP: Record<string, string> = {
  indigo: "#6366f1",
  cyan: "#22d3ee",
  violet: "#a78bfa",
  coral: "#fb7185",
  lime: "#a3e635",
  rose: "#f43f5e",
  blue: "#3b82f6",
  olive: "#84cc16",
};

const SITE_SECONDARY_HEX_MAP: Record<string, string> = {
  indigo: "#22d3ee",
  cyan: "#6366f1",
  violet: "#f43f5e",
  coral: "#f59e0b",
  lime: "#06b6d4",
  rose: "#a855f7",
  blue: "#22d3ee",
  olive: "#10b981",
};

const SITE_BG_HEX_MAP: Record<string, string> = {
  obsidian: "#070d19",
  midnight: "#050b18",
  ink: "#090d16",
  plum: "#13091f",
  cloud: "#f1f5f9",
  ivory: "#f8fafc",
};

const GRADIENT_PRESET_PALETTES: Record<
  Exclude<ToolGradientPreset, "auto">,
  {
    accent: string;
    secondary: string;
    bgDark: string;
    bgLight: string;
    surfaceDark: string;
    surfaceLight: string;
    defaultMode?: "dark" | "light";
  }
> = {
  "indigo-cyan": {
    accent: "#6366f1",
    secondary: "#22d3ee",
    bgDark: "#070d19",
    bgLight: "#f8fafc",
    surfaceDark: "#0f172a",
    surfaceLight: "#ffffff",
  },
  "emerald-cyan": {
    accent: "#10b981",
    secondary: "#06b6d4",
    bgDark: "#041311",
    bgLight: "#f0fdf4",
    surfaceDark: "#09221e",
    surfaceLight: "#ffffff",
  },
  "violet-rose": {
    accent: "#a855f7",
    secondary: "#f43f5e",
    bgDark: "#12081f",
    bgLight: "#faf5ff",
    surfaceDark: "#1f1135",
    surfaceLight: "#ffffff",
  },
  "amber-rose": {
    accent: "#f59e0b",
    secondary: "#f43f5e",
    bgDark: "#160d06",
    bgLight: "#fffbeb",
    surfaceDark: "#27170b",
    surfaceLight: "#ffffff",
  },
  "obsidian-slate": {
    accent: "#38bdf8",
    secondary: "#818cf8",
    bgDark: "#030712",
    bgLight: "#f1f5f9",
    surfaceDark: "#0b1324",
    surfaceLight: "#ffffff",
  },
  "daylight-clean": {
    accent: "#4f46e5",
    secondary: "#0284c7",
    bgDark: "#0f172a",
    bgLight: "#f8fafc",
    surfaceDark: "#1e293b",
    surfaceLight: "#ffffff",
    defaultMode: "light",
  },
};

const LIGHT_BACKGROUNDS = new Set(["ivory", "cloud"]);

const BYOK_STORAGE_KEYS = [
  "doitwithai_portable_api_key",
  "doitwithai_gemini_api_key",
  "doitwithai_byok_gemini_key",
] as const;

function readStoredGeminiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    for (const key of BYOK_STORAGE_KEYS) {
      const val = window.localStorage.getItem(key)?.trim();
      if (val) return val;
    }
  } catch {
    // Ignore storage restriction
  }
  return "";
}

function saveStoredGeminiKey(value: string) {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  try {
    for (const key of BYOK_STORAGE_KEYS) {
      if (trimmed) {
        window.localStorage.setItem(key, trimmed);
      } else {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage restriction
  }
}

function normalizeHex(hex: string): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return clean;
}

function isValidHex(value?: string): boolean {
  if (!value) return false;
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function isLightColorHex(hex: string): boolean {
  const norm = normalizeHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(norm)) return false;
  const r = parseInt(norm.slice(0, 2), 16);
  const g = parseInt(norm.slice(2, 4), 16);
  const b = parseInt(norm.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(99, 102, 241, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveToolVisualPalette(
  toolOrParams:
    | WebsiteToolSpec
    | {
        tool: WebsiteToolSpec;
        siteAccent?: string;
        siteBackground?: string;
        fallbackAccent?: string;
      },
  siteAccentArg?: string,
  siteBackgroundArg?: string,
  fallbackAccentArg?: string,
) {
  const isParamsObj =
    typeof toolOrParams === "object" &&
    toolOrParams !== null &&
    "tool" in toolOrParams &&
    typeof (toolOrParams as { tool?: unknown }).tool === "object";
  const tool = isParamsObj
    ? (toolOrParams as { tool: WebsiteToolSpec }).tool
    : (toolOrParams as WebsiteToolSpec);
  const siteAccent = isParamsObj
    ? (toolOrParams as { siteAccent?: string }).siteAccent
    : siteAccentArg;
  const siteBackground = isParamsObj
    ? (toolOrParams as { siteBackground?: string }).siteBackground
    : siteBackgroundArg;
  const fallbackAccent =
    (isParamsObj
      ? (toolOrParams as { fallbackAccent?: string }).fallbackAccent
      : fallbackAccentArg) ?? "#38bdf8";
  const presetKey =
    tool.toolGradientPreset && tool.toolGradientPreset !== "auto"
      ? tool.toolGradientPreset
      : undefined;
  const preset = presetKey ? GRADIENT_PRESET_PALETTES[presetKey] : undefined;

  const effectiveThemeMode: "dark" | "light" = (() => {
    if (tool.toolThemeMode === "dark" || tool.toolThemeMode === "light") {
      return tool.toolThemeMode;
    }
    if (tool.toolBackgroundHex && isValidHex(tool.toolBackgroundHex)) {
      return isLightColorHex(tool.toolBackgroundHex) ? "light" : "dark";
    }
    if (preset?.defaultMode) {
      return preset.defaultMode;
    }
    if (siteBackground && LIGHT_BACKGROUNDS.has(siteBackground)) {
      return "light";
    }
    return "dark";
  })();

  const effectiveAccent = isValidHex(tool.toolAccentHex)
    ? tool.toolAccentHex!.trim()
    : preset?.accent ||
      (siteAccent && SITE_ACCENT_HEX_MAP[siteAccent]) ||
      fallbackAccent;

  const effectiveSecondaryAccent = isValidHex(tool.toolSecondaryAccentHex)
    ? tool.toolSecondaryAccentHex!.trim()
    : preset?.secondary ||
      (siteAccent && SITE_SECONDARY_HEX_MAP[siteAccent]) ||
      "#6366f1";

  const hasCustomBackground = Boolean(
    isValidHex(tool.toolBackgroundHex) || preset || (siteBackground && SITE_BG_HEX_MAP[siteBackground]),
  );

  const effectiveBackground = isValidHex(tool.toolBackgroundHex)
    ? tool.toolBackgroundHex!.trim()
    : preset
      ? effectiveThemeMode === "dark"
        ? preset.bgDark
        : preset.bgLight
      : siteBackground && SITE_BG_HEX_MAP[siteBackground]
        ? SITE_BG_HEX_MAP[siteBackground]
        : effectiveThemeMode === "dark"
          ? "#070d19"
          : "#f8fafc";

  const effectiveSurface = isValidHex(tool.toolSurfaceHex)
    ? tool.toolSurfaceHex!.trim()
    : preset
      ? effectiveThemeMode === "dark"
        ? preset.surfaceDark
        : preset.surfaceLight
      : effectiveThemeMode === "dark"
        ? "rgba(15, 23, 42, 0.88)"
        : "#ffffff";

  const isLight = effectiveThemeMode === "light";
  const textPrimary = isLight ? "#0f172a" : "#f8fafc";
  const textSecondary = isLight ? "#334155" : "#cbd5e1";
  const heroGradient = `radial-gradient(circle at 16% 18%, ${hexToRgba(effectiveAccent, isLight ? 0.14 : 0.22)}, transparent 46%), radial-gradient(circle at 84% 20%, ${hexToRgba(effectiveSecondaryAccent, isLight ? 0.12 : 0.18)}, transparent 46%), linear-gradient(180deg, ${effectiveBackground} 0%, ${effectiveBackground} 100%)`;

  return {
    effectiveThemeMode,
    effectiveAccent,
    effectiveSecondaryAccent,
    effectiveBackground,
    effectiveSurface,
    hasCustomBackground,
    accentHex: effectiveAccent,
    secondaryAccentHex: effectiveSecondaryAccent,
    backgroundHex: effectiveBackground,
    surfaceColor: effectiveSurface,
    heroGradient,
    textPrimary,
    textSecondary,
    isLight,
  };
}

function setNativeInputValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  if (el.value === value) return;
  const proto =
    el.tagName === "TEXTAREA"
      ? (el.ownerDocument.defaultView?.HTMLTextAreaElement.prototype ??
          HTMLTextAreaElement.prototype)
      : (el.ownerDocument.defaultView?.HTMLInputElement.prototype ??
          HTMLInputElement.prototype);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  const EventCtor = el.ownerDocument.defaultView?.Event ?? Event;
  el.dispatchEvent(new EventCtor("input", { bubbles: true }));
  el.dispatchEvent(new EventCtor("change", { bubbles: true }));
}

function updateElementTextNodePreservingIcons(el: HTMLElement, nextText: string) {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if ((node.nodeValue || "").trim().length > 0) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }
  if (textNodes.length > 0) {
    const primary = textNodes[textNodes.length - 1];
    if (primary.nodeValue?.trim() !== nextText.trim()) {
      primary.nodeValue = ` ${nextText.trim()}`;
    }
    for (let i = 0; i < textNodes.length - 1; i++) {
      if (textNodes[i].nodeValue?.trim()) {
        textNodes[i].nodeValue = "";
      }
    }
    return;
  }
  if (el.children.length === 0 && el.textContent !== nextText) {
    el.textContent = nextText;
  }
}

function findInputLabelElement(
  container: HTMLElement,
  inputEl: HTMLInputElement | HTMLTextAreaElement,
): HTMLElement | null {
  const parentLabel = inputEl.closest("label");
  if (parentLabel) {
    const directSpan = Array.from(parentLabel.children).find(
      (child): child is HTMLElement =>
        child !== inputEl && (child.tagName === "SPAN" || child.tagName === "DIV" || child.tagName === "STRONG"),
    );
    return directSpan ?? parentLabel;
  }
  if (inputEl.id) {
    const forLabel = container.querySelector<HTMLElement>(
      `label[for="${CSS.escape(inputEl.id)}"]`,
    );
    if (forLabel) return forLabel;
  }
  const fieldWrapper = inputEl.parentElement;
  if (fieldWrapper) {
    const siblingLabel = fieldWrapper.querySelector<HTMLElement>("label");
    if (siblingLabel) return siblingLabel;
    const prev = inputEl.previousElementSibling as HTMLElement | null;
    if (prev && (prev.tagName === "LABEL" || prev.tagName === "SPAN")) {
      return prev;
    }
  }
  return null;
}

function buildNativeToolScopeCss(params: {
  scopeClass: string;
  effectiveAccent: string;
  effectiveSecondaryAccent: string;
  effectiveBackground: string;
  effectiveSurface: string;
  effectiveThemeMode: "dark" | "light";
  hasCustomBackground: boolean;
}) {
  const {
    scopeClass,
    effectiveAccent,
    effectiveSecondaryAccent,
    effectiveBackground,
    effectiveSurface,
    effectiveThemeMode,
    hasCustomBackground,
  } = params;
  const isDark = effectiveThemeMode === "dark";
  const accentFg = isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff";
  const accentSoft = hexToRgba(effectiveAccent, 0.22);
  const secondarySoft = hexToRgba(effectiveSecondaryAccent, 0.18);
  const accentBorder = hexToRgba(effectiveAccent, 0.45);
  const accentGlow = hexToRgba(effectiveAccent, 0.16);
  const heroBg = hasCustomBackground
    ? `radial-gradient(circle at 16% 18%, ${accentSoft}, transparent 48%), radial-gradient(circle at 84% 22%, ${secondarySoft}, transparent 52%), ${effectiveBackground}`
    : isDark
      ? `radial-gradient(circle at 16% 18%, ${accentSoft}, transparent 48%), radial-gradient(circle at 84% 22%, ${secondarySoft}, transparent 52%), linear-gradient(155deg, #040915 0%, #0b152a 100%)`
      : `radial-gradient(circle at 16% 18%, ${accentSoft}, transparent 52%), radial-gradient(circle at 84% 22%, ${secondarySoft}, transparent 52%), linear-gradient(155deg, #f8fafc 0%, #eef2ff 100%)`;

  return `
    .${scopeClass} {
      --wb-tool-accent: ${effectiveAccent};
      --wb-tool-accent-secondary: ${effectiveSecondaryAccent};
      --wb-tool-accent-fg: ${accentFg};
      --wb-tool-accent-soft: ${accentSoft};
      --wb-tool-accent-border: ${accentBorder};
      --wb-tool-accent-glow: ${accentGlow};
      --wb-tool-bg: ${effectiveBackground};
      --wb-tool-surface: ${effectiveSurface};
      background: ${effectiveBackground} !important;
      color: ${isDark ? "#e2e8f0" : "#0f172a"};
      container-type: inline-size;
      min-width: 0;
      overflow-x: clip;
    }
    .${scopeClass} [data-portable-hero-bar="true"],
    .${scopeClass} aside[aria-label="Supporting guides and related tools"] {
      display: none !important;
    }
    ${
      isDark
        ? `
      .${scopeClass} main > section,
      .${scopeClass} main > div > section,
      .${scopeClass} section.bg-white,
      .${scopeClass} section[class*="bg-[#f5f7fc]"] {
        background-color: ${hasCustomBackground ? effectiveBackground : "#0b1324"} !important;
        border-color: rgba(148, 163, 184, 0.16) !important;
        color: #e2e8f0 !important;
      }
      .${scopeClass} section.bg-white h2,
      .${scopeClass} section.bg-white h3,
      .${scopeClass} section[class*="bg-[#f5f7fc]"] h2,
      .${scopeClass} section[class*="bg-[#f5f7fc]"] h3,
      .${scopeClass} details summary {
        color: #f8fafc !important;
      }
      .${scopeClass} article.rounded-2xl,
      .${scopeClass} details.rounded-2xl,
      .${scopeClass} [data-wb-surface-card="true"] {
        background-color: ${effectiveSurface} !important;
        border-color: ${hexToRgba(effectiveAccent, 0.24)} !important;
        color: #cbd5e1 !important;
      }
    `
        : `
      .${scopeClass} main > section:not(:first-of-type) {
        background-color: ${hasCustomBackground ? effectiveBackground : "#f8fafc"};
      }
      .${scopeClass} article.rounded-2xl,
      .${scopeClass} details.rounded-2xl,
      .${scopeClass} [data-wb-surface-card="true"] {
        background-color: ${effectiveSurface} !important;
        border-color: ${hexToRgba(effectiveAccent, 0.25)} !important;
        color: #1e293b !important;
      }
    `
    }
    .${scopeClass} main > section:first-of-type,
    .${scopeClass} > main > div:first-of-type,
    .${scopeClass} [data-wb-hero="true"] {
      background-image: ${heroBg} !important;
      border-bottom: 1px solid ${accentBorder} !important;
    }
    .${scopeClass} [data-wb-hero-grid] > * { min-width: 0; }
    .${scopeClass} h1 { overflow-wrap: anywhere; }
    @container (max-width: 760px) {
      .${scopeClass} [data-wb-hero-grid] { grid-template-columns: minmax(0, 1fr) !important; gap: 24px !important; }
      .${scopeClass} [data-wb-hero] h1 { font-size: clamp(26px, 6.8cqi, 44px) !important; line-height: 1.12 !important; }
    }
    @container (max-width: 480px) {
      .${scopeClass} main section { padding-left: 14px !important; padding-right: 14px !important; }
      .${scopeClass} button[type="submit"] { width: 100% !important; justify-content: center !important; }
    }
    .${scopeClass} h1 span {
      background-image: linear-gradient(95deg, ${isDark ? "#ffffff" : "#0f172a"} 5%, ${effectiveAccent} 55%, ${effectiveSecondaryAccent} 98%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
    .${scopeClass} button[type="submit"],
    .${scopeClass} button[class*="bg-[#5271"],
    .${scopeClass} button[class*="from-[#3452d1"],
    .${scopeClass} [data-wb-property="customCtaLabel"] {
      background-image: linear-gradient(135deg, ${effectiveAccent} 0%, ${effectiveSecondaryAccent} 100%) !important;
      background-color: ${effectiveAccent} !important;
      color: ${accentFg} !important;
      border-color: ${accentBorder} !important;
      box-shadow: 0 12px 28px ${accentGlow} !important;
    }
    .${scopeClass} input:focus,
    .${scopeClass} textarea:focus,
    .${scopeClass} select:focus {
      border-color: ${effectiveAccent} !important;
      box-shadow: 0 0 0 3px ${accentGlow} !important;
    }
  `;
}

function applyNativeToolOverrides(params: {
  container: HTMLElement;
  tool: WebsiteToolSpec;
  resolvedSlug: string;
  siteName: string;
  siteSlug?: string;
  displayMode: "full-landing" | "workspace-only";
}) {
  const { container, tool, resolvedSlug, siteName, siteSlug, displayMode } = params;
  const catalogTool = getCatalogToolBySlug(resolvedSlug);
  const baseOverrides = shouldApplyHeroOverride(tool, catalogTool);
  const baseline = tool.toolPageEdits?.baseline ?? {};
  const hasExplicitEdit = (field: string) =>
    Object.prototype.hasOwnProperty.call(baseline, field);

  const overrides = {
    title: baseOverrides.title || hasExplicitEdit("title"),
    summary: baseOverrides.summary || hasExplicitEdit("summary"),
    role: baseOverrides.role || hasExplicitEdit("role"),
    period: baseOverrides.period || hasExplicitEdit("period"),
    technologies: baseOverrides.technologies || hasExplicitEdit("technologies"),
  };

  const cleanBrand = siteName.split(/[—·|]/)[0]?.trim() || siteName || "AI Tools Hub";
  const baseHref = siteSlug ? `/p/${siteSlug}` : "#";
  const toolsHref = siteSlug ? `/p/${siteSlug}/projects` : "#projects";

  // 1. Safe non-destructive breadcrumb update (text-only + href attr)
  const breadcrumb = container.querySelector<HTMLElement>('nav[aria-label="Breadcrumb"]');
  if (breadcrumb) {
    const links = breadcrumb.querySelectorAll<HTMLAnchorElement>("a");
    if (links[0]) {
      updateElementTextNodePreservingIcons(links[0], cleanBrand);
      if (siteSlug) links[0].setAttribute("href", baseHref);
    }
    if (links[1]) {
      updateElementTextNodePreservingIcons(links[1], "Tools");
      if (siteSlug) links[1].setAttribute("href", toolsHref);
    }
    const currentCrumb = breadcrumb.querySelector<HTMLElement>('[aria-current="page"]');
    if (currentCrumb && overrides.title && tool.title.trim()) {
      updateElementTextNodePreservingIcons(currentCrumb, tool.title.trim());
    }
  }

  // 2. Hero overrides & universal [data-wb-property] annotations
  const h1 = container.querySelector<HTMLElement>("h1");
  const heroContainer = h1?.closest<HTMLElement>("section, div.relative");
  const heroGrid = heroContainer?.querySelector<HTMLElement>(".grid");
  const heroLeftCol = h1?.parentElement;
  const heroRightCol =
    heroGrid && heroLeftCol && heroGrid.children.length > 1
      ? (Array.from(heroGrid.children).find((c) => c !== heroLeftCol) as HTMLElement | undefined)
      : undefined;

  if (h1) h1.dataset.wbProperty = "title";
  if (heroContainer) heroContainer.dataset.wbHero = "true";
  if (heroGrid) {
    heroGrid.dataset.wbHeroGrid = "true";
    heroGrid.style.display = displayMode === "workspace-only" ? "none" : "";
  }

  if (h1 && overrides.title && tool.title.trim() && h1.dataset.wbTitleApplied !== tool.title) {
    h1.dataset.wbTitleApplied = tool.title;
    h1.textContent = tool.title;
  }

  if (heroLeftCol) {
    const paragraphs = Array.from(heroLeftCol.children).filter(
      (el): el is HTMLParagraphElement => el.tagName === "P",
    );
    const eyebrowEl = paragraphs[0];
    const leadEl =
      paragraphs.find(
        (el) => h1 && (el.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
      ) ?? paragraphs[1];

    if (eyebrowEl && eyebrowEl !== leadEl) eyebrowEl.dataset.wbProperty = "role";
    if (leadEl) leadEl.dataset.wbProperty = "summary";

    if (eyebrowEl && eyebrowEl !== leadEl && overrides.role && tool.role?.trim()) {
      if (eyebrowEl.textContent !== tool.role.trim()) {
        eyebrowEl.textContent = tool.role.trim();
      }
    }

    if (leadEl && overrides.summary && tool.summary?.trim()) {
      if (leadEl.textContent !== tool.summary.trim()) {
        leadEl.textContent = tool.summary.trim();
      }
    }

    const badgesWrap = Array.from(heroLeftCol.children).find(
      (el): el is HTMLElement =>
        el.tagName === "DIV" &&
        !el.hasAttribute("data-portable-hero-bar") &&
        el.querySelectorAll("span").length > 0 &&
        el.className.includes("flex"),
    );
    if (badgesWrap) {
      badgesWrap.dataset.wbProperty = "technologies";
      if (overrides.technologies && tool.technologies.length > 0) {
        const badgeKey = tool.technologies.join("|");
        if (badgesWrap.dataset.wbBadgesApplied !== badgeKey) {
          badgesWrap.dataset.wbBadgesApplied = badgeKey;
          const existingSpans = Array.from(badgesWrap.querySelectorAll<HTMLElement>(":scope > span"));
          const templateClass =
            existingSpans[0]?.className || "rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold";
          tool.technologies.slice(0, 8).forEach((badgeText, idx) => {
            const targetSpan = existingSpans[idx];
            if (targetSpan) {
              targetSpan.style.display = "";
              targetSpan.textContent = badgeText;
            } else {
              const span = container.ownerDocument.createElement("span");
              span.className = templateClass;
              span.dataset.wbInjectedBadge = "true";
              span.textContent = badgeText;
              badgesWrap.appendChild(span);
            }
          });
          for (let i = tool.technologies.length; i < existingSpans.length; i++) {
            existingSpans[i].style.display = "none";
          }
        }
      }
    }
  }

  // 2b. Right Hero Card Heading (period) & Bullet Highlights (heroHighlights)
  if (heroRightCol) {
    heroRightCol.dataset.wbSurfaceCard = "true";
    const cardHeading = heroRightCol.querySelector<HTMLElement>("p, h2, h3");
    if (cardHeading) {
      cardHeading.dataset.wbProperty = "period";
      if (overrides.period && tool.period?.trim() && cardHeading.textContent !== tool.period.trim()) {
        cardHeading.textContent = tool.period.trim();
      }
    }

    const cardList = heroRightCol.querySelector<HTMLUListElement>("ul");
    if (cardList) {
      cardList.dataset.wbProperty = "heroHighlights";
      if (tool.heroHighlights && tool.heroHighlights.length > 0) {
        const highlightsKey = tool.heroHighlights.join("||");
        if (cardList.dataset.wbHighlightsApplied !== highlightsKey) {
          cardList.dataset.wbHighlightsApplied = highlightsKey;
          const existingItems = Array.from(cardList.querySelectorAll<HTMLLIElement>(":scope > li"));
          const itemClass = existingItems[0]?.className || "text-sm leading-6";
          tool.heroHighlights.slice(0, 6).forEach((line, idx) => {
            let li = existingItems[idx];
            if (!li) {
              li = container.ownerDocument.createElement("li");
              li.className = itemClass;
              li.dataset.wbInjectedHighlight = "true";
              cardList.appendChild(li);
            }
            li.style.display = "";
            li.textContent = line;
          });
          for (let i = tool.heroHighlights.length; i < existingItems.length; i++) {
            existingItems[i].style.display = "none";
          }
        }
      }
    }
  }

  // 3. Default Tool Inputs, Input Labels & Safe Primary CTA Label override
  const allEditableInputs = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
  ).filter((el) => {
    if (
      el.closest("nav") ||
      el.closest("aside") ||
      el.closest("[data-wb-custom-faqs]") ||
      el.closest("[data-wb-runtime-controls]")
    ) {
      return false;
    }
    if (el.tagName === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      return type === "text" || type === "url" || type === "search" || type === "email" || !type;
    }
    return true;
  });

  if (allEditableInputs[0]) {
    allEditableInputs[0].dataset.wbProperty = "defaultInput";
    const primaryLabelEl = findInputLabelElement(container, allEditableInputs[0]);
    if (primaryLabelEl) {
      primaryLabelEl.dataset.wbProperty = "inputLabel";
      if (tool.inputLabel?.trim() && primaryLabelEl.dataset.wbLabelApplied !== tool.inputLabel.trim()) {
        primaryLabelEl.dataset.wbLabelApplied = tool.inputLabel.trim();
        updateElementTextNodePreservingIcons(primaryLabelEl, tool.inputLabel.trim());
      }
    }
  }

  if (allEditableInputs[1]) {
    allEditableInputs[1].dataset.wbProperty = "defaultSecondaryInput";
    const secondaryLabelEl = findInputLabelElement(container, allEditableInputs[1]);
    if (secondaryLabelEl) {
      secondaryLabelEl.dataset.wbProperty = "secondaryInputLabel";
      if (
        tool.secondaryInputLabel?.trim() &&
        secondaryLabelEl.dataset.wbLabelApplied !== tool.secondaryInputLabel.trim()
      ) {
        secondaryLabelEl.dataset.wbLabelApplied = tool.secondaryInputLabel.trim();
        updateElementTextNodePreservingIcons(secondaryLabelEl, tool.secondaryInputLabel.trim());
      }
    }
  }

  const submit = container.querySelector<HTMLElement>('button[type="submit"]');
  if (submit) submit.dataset.wbProperty = "customCtaLabel";

  if (tool.defaultInput && tool.defaultInput.trim()) {
    const token = `${resolvedSlug}:${tool.defaultInput}`;
    const primaryInput = allEditableInputs[0];
    if (primaryInput && container.dataset.wbAppliedDefaultInput !== token) {
      container.dataset.wbAppliedDefaultInput = token;
      setNativeInputValue(primaryInput, tool.defaultInput);
    }
  }

  if (tool.defaultSecondaryInput && tool.defaultSecondaryInput.trim()) {
    const token = `${resolvedSlug}:${tool.defaultSecondaryInput}`;
    const secondaryInput =
      allEditableInputs[1] || container.querySelector<HTMLTextAreaElement>("textarea");
    if (secondaryInput && container.dataset.wbAppliedSecondaryInput !== token) {
      container.dataset.wbAppliedSecondaryInput = token;
      setNativeInputValue(secondaryInput, tool.defaultSecondaryInput);
    }
  }

  {
    const primaryActionBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((btn) => {
      if (
        btn.closest("nav") ||
        btn.closest("aside") ||
        btn.closest("[data-portable-hero-bar]") ||
        btn.closest("[data-wb-runtime-controls]")
      ) {
        return false;
      }
      if (btn.getAttribute("type") === "submit") return true;
      const cls = btn.className || "";
      const txt = (btn.textContent || "").trim();
      return (
        (cls.includes("bg-gradient") ||
          cls.includes("bg-[#5271") ||
          cls.includes("bg-blue-600") ||
          cls.includes("bg-indigo-600")) &&
        txt.length > 2
      );
    });

    if (primaryActionBtn) primaryActionBtn.dataset.wbProperty = "customCtaLabel";
    if (
      tool.customCtaLabel?.trim() &&
      primaryActionBtn &&
      primaryActionBtn.dataset.wbCtaApplied !== tool.customCtaLabel.trim()
    ) {
      primaryActionBtn.dataset.wbCtaApplied = tool.customCtaLabel.trim();
      updateElementTextNodePreservingIcons(primaryActionBtn, tool.customCtaLabel.trim());
    }
  }

  // 4. Education & FAQ section visibility + canvas property annotations
  const mainEl = container.querySelector("main") || container;
  const sections = Array.from(mainEl.querySelectorAll<HTMLElement>("section"));
  const heroRootSection = heroContainer?.tagName === "SECTION" ? heroContainer : null;
  const workspaceContainer =
    allEditableInputs[0]?.closest<HTMLElement>("section") ??
    container.querySelector<HTMLElement>("[data-tool-workspace='true']")?.closest<HTMLElement>(
      "section",
    ) ??
    null;

  const hasCustomFaqs = Boolean(tool.customFaqs && tool.customFaqs.length > 0);
  const educationProps: Array<"challenge" | "approach" | "outcome"> = [
    "challenge",
    "approach",
    "outcome",
  ];
  let eduIndex = 0;

  sections.forEach((sectionEl) => {
    if (
      sectionEl.hasAttribute("data-wb-custom-faqs") ||
      sectionEl.hasAttribute("data-wb-custom-education")
    ) {
      return;
    }
    if (sectionEl === heroRootSection || sectionEl === workspaceContainer) return;
    if (
      heroContainer &&
      (heroContainer.contains(sectionEl) || sectionEl.contains(heroContainer))
    ) {
      return;
    }
    if (workspaceContainer && workspaceContainer.contains(sectionEl)) return;

    const hasDetails = sectionEl.querySelectorAll("details").length > 0;
    const headingText = (sectionEl.querySelector("h2")?.textContent || "").toLowerCase();
    const isFaqSection =
      hasDetails || headingText.includes("faq") || headingText.includes("questions");

    if (isFaqSection) {
      sectionEl.dataset.wbProperty = "customFaqs";
      sectionEl.style.display =
        displayMode === "workspace-only" || tool.hideFaqSection || hasCustomFaqs ? "none" : "";
    } else {
      const mappedProp = educationProps[Math.min(eduIndex, educationProps.length - 1)];
      if (mappedProp && !sectionEl.dataset.wbProperty) {
        sectionEl.dataset.wbProperty = mappedProp;
      }
      eduIndex += 1;
      sectionEl.style.display =
        displayMode === "workspace-only" || tool.hideEducationSection ? "none" : "";
    }
  });
}

function TransferredCatalogToolFrame(props: {
  tool: WebsiteToolSpec;
  resolvedSlug: string;
  siteName: string;
  siteSlug?: string;
  publicBasePath?: string;
  accentColor: string;
  siteAccent?: string;
  siteBackground?: string;
  initialDisplayMode?: "full-landing" | "workspace-only";
  compact?: boolean;
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const {
    tool,
    resolvedSlug,
    siteName,
    siteSlug,
    publicBasePath,
    accentColor,
    siteAccent,
    siteBackground,
    initialDisplayMode = "full-landing",
    compact = false,
    allTools,
    onSelectTool,
  } = props;

  const router = useRouter();
  const rawReactId = useId();
  const scopeClass = useMemo(
    () => `wb-tool-scope-${rawReactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawReactId],
  );
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const displayMode = initialDisplayMode;

  const [isClientMounted, setIsClientMounted] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState("");
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiKeySavedToast, setApiKeySavedToast] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    const existing = readStoredGeminiKey();
    setStoredApiKey(existing);
    setApiKeyDraft(existing);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !storedApiKey.trim()) return;
    const originalFetch = window.fetch.bind(window);
    const trimmedKey = storedApiKey.trim();

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlString =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      const isSameOriginApi =
        urlString.startsWith("/api/") ||
        urlString.startsWith(`${window.location.origin}/api/`);

      if (!isSameOriginApi) {
        return originalFetch(input, init);
      }

      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      if (!headers.has("x-gemini-api-key") && !headers.has("x-goog-api-key")) {
        headers.set("x-gemini-api-key", trimmedKey);
      }
      return originalFetch(input, { ...init, headers });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [storedApiKey]);

  const {
    effectiveThemeMode,
    effectiveAccent,
    effectiveSecondaryAccent,
    effectiveBackground,
    effectiveSurface,
    hasCustomBackground,
  } = useMemo(
    () =>
      resolveToolVisualPalette({
        tool,
        siteAccent,
        siteBackground,
        fallbackAccent: accentColor || "#38bdf8",
      }),
    [tool, siteAccent, siteBackground, accentColor],
  );

  const scopeCss = useMemo(
    () =>
      buildNativeToolScopeCss({
        scopeClass,
        effectiveAccent,
        effectiveSecondaryAccent,
        effectiveBackground,
        effectiveSurface,
        effectiveThemeMode,
        hasCustomBackground,
      }),
    [
      scopeClass,
      effectiveAccent,
      effectiveSecondaryAccent,
      effectiveBackground,
      effectiveSurface,
      effectiveThemeMode,
      hasCustomBackground,
    ],
  );

  const hasManifestEntry = hasTransferredToolComponent(resolvedSlug);

  const TransferredPageComponent = useMemo(
    () => (isClientMounted && hasManifestEntry ? getTransferredToolComponent(resolvedSlug) : null),
    [isClientMounted, hasManifestEntry, resolvedSlug],
  );

  const runOverrides = useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return;
    applyNativeToolOverrides({
      container: el,
      tool,
      resolvedSlug,
      siteName,
      siteSlug,
      displayMode,
    });
  }, [tool, resolvedSlug, siteName, siteSlug, displayMode]);

  useEffect(() => {
    runOverrides();
    const el = surfaceRef.current;
    if (!el || typeof MutationObserver === "undefined") return;

    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(runOverrides);
    });
    observer.observe(el, { childList: true, subtree: true });

    const t1 = window.setTimeout(runOverrides, 120);
    const t2 = window.setTimeout(runOverrides, 450);

    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [runOverrides]);

  const cleanBrand = siteName.split(/[—·|]/)[0]?.trim() || "AI Tools Hub";
  const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(
    /^\/+|\/+$/g,
    "",
  );
  const resolvedBaseHref = publicBasePath || `/p/${slugPart}`;
  const toolsHref = `${resolvedBaseHref}/projects`;

  const handleSurfaceClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (href.startsWith("/p/")) return;

      event.preventDefault();
      if (href === "/") {
        router.push(resolvedBaseHref);
        return;
      }
      if (href === "/tools" || href.startsWith("/tools/categories")) {
        router.push(toolsHref);
        return;
      }
      if (href.startsWith("/tools/")) {
        const targetToolSlug = href.replace(/^\/tools\//, "").split(/[?#]/)[0];
        const installedMatch = allTools?.find(
          (candidate) =>
            resolveCatalogToolSlug(candidate) === targetToolSlug ||
            candidate.caseStudySlug === targetToolSlug,
        );
        if (installedMatch && onSelectTool) {
          onSelectTool(installedMatch);
          return;
        }
        if (installedMatch) {
          router.push(`${resolvedBaseHref}/projects/${installedMatch.caseStudySlug}`);
          return;
        }
        router.push(toolsHref);
        return;
      }
      if (href.startsWith("/guides") || href.startsWith("/do-it-ai")) {
        router.push(toolsHref);
      }
    },
    [router, resolvedBaseHref, toolsHref, allTools, onSelectTool],
  );

  if (!hasManifestEntry) {
    return <FallbackGenericToolRunner {...props} />;
  }

  const hasCustomMethodology = Boolean(
    !tool.hideEducationSection &&
      displayMode !== "workspace-only" &&
      (tool.challenge?.trim() || tool.approach?.trim() || tool.outcome?.trim()),
  );

  return (
    <TransferredToolRuntimeProvider
      value={{
        isTransferredTool: true,
        siteSlug: slugPart,
        siteName: cleanBrand,
        publicBasePath: resolvedBaseHref,
        projectSlug: tool.caseStudySlug || resolvedSlug,
        projectTitle: tool.title,
        accentHex: effectiveAccent,
        backgroundHex: effectiveBackground,
        themeMode: effectiveThemeMode,
      }}
    >
      <div
        ref={surfaceRef}
        id="tool-workspace"
        onClickCapture={handleSurfaceClickCapture}
        className={`wb-native-tool-surface ${scopeClass} ${effectiveThemeMode === "dark" ? "dark" : ""}`}
        style={{
          position: "relative",
          width: "100%",
          background: effectiveBackground,
          borderRadius: compact ? "18px" : "0",
          border: compact ? `1px solid ${hexToRgba(effectiveAccent, 0.32)}` : "none",
          overflow: compact ? "hidden" : "visible",
          color: effectiveThemeMode === "dark" ? "#f8fafc" : "#0f172a",
          textAlign: "left",
        }}
      >
        <style>{scopeCss}</style>

        {allTools && allTools.length > 1 && onSelectTool && (
          <div
            data-wb-runtime-controls="true"
            style={{
              padding: "10px 18px",
              background: effectiveThemeMode === "dark" ? "rgba(6, 11, 23, 0.92)" : "#f1f5f9",
              borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
            }}
          >
            {allTools.map((candidate, idx) => {
              const active = candidate.id === tool.id;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => onSelectTool(candidate)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: active
                      ? `1px solid ${effectiveAccent}`
                      : "1px solid rgba(148, 163, 184, 0.25)",
                    background: active ? hexToRgba(effectiveAccent, 0.18) : "transparent",
                    color: active
                      ? effectiveThemeMode === "dark"
                        ? "#ffffff"
                        : "#0f172a"
                      : effectiveThemeMode === "dark"
                        ? "#cbd5e1"
                        : "#334155",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  0{idx + 1}. {candidate.title}
                </button>
              );
            })}
          </div>
        )}

        <div
          data-wb-runtime-controls="true"
          style={{
            position: "fixed",
            right: "18px",
            bottom: "18px",
            zIndex: 45,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setApiKeyDraft(storedApiKey);
              setApiModalOpen(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 13px",
              borderRadius: "999px",
              border: `1px solid ${
                storedApiKey ? "rgba(52, 211, 153, 0.5)" : hexToRgba(effectiveAccent, 0.45)
              }`,
              background:
                effectiveThemeMode === "dark"
                  ? "rgba(8, 14, 30, 0.92)"
                  : "rgba(255, 255, 255, 0.95)",
              color: effectiveThemeMode === "dark" ? "#f8fafc" : "#0f172a",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 26px rgba(2, 6, 23, 0.28)",
              backdropFilter: "blur(8px)",
            }}
          >
            <KeyRound size={13} color={storedApiKey ? "#34d399" : effectiveAccent} />
            {storedApiKey ? "Gemini Key Saved" : "API Key"}
          </button>
        </div>

        {isClientMounted && TransferredPageComponent ? (
          <React.Suspense
            fallback={
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                Loading interactive tool workspace…
              </div>
            }
          >
            <TransferredPageComponent />
          </React.Suspense>
        ) : (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Loading interactive tool workspace…
          </div>
        )}

        {/* Editable Methodology & Use-Case Playbook Cards (when configured in Studio) */}
        {hasCustomMethodology && (
          <section
            data-wb-custom-education="true"
            style={{
              maxWidth: "1120px",
              margin: "0 auto",
              padding: "28px 20px 20px",
              display: "grid",
              gap: "18px",
            }}
          >
            <div style={{ display: "grid", gap: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: effectiveAccent,
                }}
              >
                TOOL METHODOLOGY &amp; WORKFLOW PLAYBOOK
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(20px, 2.8vw, 26px)",
                  fontWeight: 800,
                  color: effectiveThemeMode === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                How {tool.title} Optimizes Your Workflow
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "14px",
              }}
            >
              {tool.challenge?.trim() && (
                <article
                  data-wb-property="challenge"
                  data-wb-surface-card="true"
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    background: effectiveSurface,
                    border: `1px solid ${hexToRgba(effectiveAccent, 0.26)}`,
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: effectiveAccent,
                    }}
                  >
                    01 · PROBLEM &amp; USE CASE
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13.5px",
                      lineHeight: 1.65,
                      color: effectiveThemeMode === "dark" ? "#cbd5e1" : "#334155",
                    }}
                  >
                    {tool.challenge}
                  </p>
                </article>
              )}
              {tool.approach?.trim() && (
                <article
                  data-wb-property="approach"
                  data-wb-surface-card="true"
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    background: effectiveSurface,
                    border: `1px solid ${hexToRgba(effectiveSecondaryAccent, 0.28)}`,
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: effectiveSecondaryAccent,
                    }}
                  >
                    02 · HOW THE ENGINE WORKS
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13.5px",
                      lineHeight: 1.65,
                      color: effectiveThemeMode === "dark" ? "#cbd5e1" : "#334155",
                    }}
                  >
                    {tool.approach}
                  </p>
                </article>
              )}
              {tool.outcome?.trim() && (
                <article
                  data-wb-property="outcome"
                  data-wb-surface-card="true"
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    background: effectiveSurface,
                    border: `1px solid ${hexToRgba(effectiveAccent, 0.26)}`,
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "#34d399",
                    }}
                  >
                    03 · VERIFIED OUTPUTS
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13.5px",
                      lineHeight: 1.65,
                      color: effectiveThemeMode === "dark" ? "#cbd5e1" : "#334155",
                    }}
                  >
                    {tool.outcome}
                  </p>
                </article>
              )}
            </div>
          </section>
        )}

        {/* Optional Custom FAQs rendered cleanly in React when configured */}
        {!tool.hideFaqSection && tool.customFaqs && tool.customFaqs.length > 0 && (
          <section
            data-wb-custom-faqs="true"
            data-wb-property="customFaqs"
            style={{
              maxWidth: "1120px",
              margin: "0 auto",
              padding: "28px 20px 52px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                marginBottom: "16px",
                color: effectiveThemeMode === "dark" ? "#f8fafc" : "#0f172a",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {tool.customFaqs.map((faq, idx) => (
                <details
                  key={`${faq.question}-${idx}`}
                  data-wb-surface-card="true"
                  style={{
                    borderRadius: "16px",
                    border: `1px solid ${hexToRgba(effectiveAccent, 0.24)}`,
                    background: effectiveSurface,
                    padding: "16px 20px",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: effectiveThemeMode === "dark" ? "#f8fafc" : "#0f172a",
                    }}
                  >
                    {faq.question}
                  </summary>
                  <p
                    style={{
                      marginTop: "10px",
                      fontSize: "14px",
                      lineHeight: 1.65,
                      color: effectiveThemeMode === "dark" ? "#cbd5e1" : "#475569",
                    }}
                  >
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* API Key Modal */}
        {apiModalOpen && (
          <div
            data-wb-runtime-controls="true"
            role="dialog"
            aria-modal="true"
            aria-label="Gemini API Key Settings"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "grid",
              placeItems: "center",
              padding: "16px",
              background: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "440px",
                borderRadius: "18px",
                padding: "20px",
                background: "#0b1324",
                border: `1px solid ${hexToRgba(effectiveAccent, 0.45)}`,
                color: "#f8fafc",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px" }}>
                  <KeyRound size={16} color={effectiveAccent} />
                  Gemini API Key (Optional BYOK)
                </div>
                <button
                  type="button"
                  onClick={() => setApiModalOpen(false)}
                  aria-label="Close API Key settings"
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "#cbd5e1" }}>
                Stored privately in your browser localStorage and sent via secure header on AI tool
                requests inside this site. Leave blank to use built-in defaults.
              </p>
              <input
                type="password"
                value={apiKeyDraft}
                onChange={(e) => setApiKeyDraft(e.target.value)}
                placeholder="AIzaSy... (Google Gemini API Key)"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  background: "#050b18",
                  color: "#f8fafc",
                  padding: "10px 12px",
                  fontSize: "13px",
                }}
              />
              {apiKeySavedToast && (
                <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 700 }}>
                  API Key saved locally for this browser session.
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                {storedApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      saveStoredGeminiKey("");
                      setStoredApiKey("");
                      setApiKeyDraft("");
                      setApiModalOpen(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(248, 113, 113, 0.35)",
                      background: "rgba(248, 113, 113, 0.12)",
                      color: "#fecaca",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    saveStoredGeminiKey(apiKeyDraft);
                    setStoredApiKey(apiKeyDraft.trim());
                    setApiKeySavedToast(true);
                    window.setTimeout(() => {
                      setApiKeySavedToast(false);
                      setApiModalOpen(false);
                    }, 600);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: 0,
                    background: effectiveAccent,
                    color: isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TransferredToolRuntimeProvider>
  );
}

type ToolResultItem = {
  label: string;
  title: string;
  description: string;
  badge?: string;
  score?: number;
};

type ToolRunPayload = {
  ok: boolean;
  provider: "gemini-api" | "deterministic-engine";
  toolSlug: string;
  summary: string;
  overallScore: number;
  metrics: Array<{ label: string; value: string; status: "good" | "warn" | "info" }>;
  items: ToolResultItem[];
  codeBlock: {
    language: string;
    label: string;
    code: string;
  };
};

function getToolPresetInputs(slug: string, siteName: string) {
  if (slug.includes("on-page") || slug.includes("analyzer")) {
    return {
      keywordLabel: "Target Focus Keyword",
      keywordDefault: "On-Page AI SEO Audit",
      contentLabel: "Page H1 & Draft Copy to Audit",
      contentDefault:
        "How to run a 28-point technical and semantic on-page SEO audit that aligns H1-H3 headings, entity density, and Position-Zero answer blocks.",
      intentDefault: "Informational & Technical Audit",
      ctaLabel: "Run 28-Point AI SEO Audit ✨",
    };
  }
  if (slug.includes("schema") || slug.includes("json-ld")) {
    return {
      keywordLabel: "Primary Entity / Application Title",
      keywordDefault: `${siteName} — Structured Data Graph`,
      contentLabel: "Entity Description & Key FAQ Context",
      contentDefault:
        "Build connected Schema.org JSON-LD @graph markup linking Organization, SoftwareApplication, Article, and FAQPage entities with @id references.",
      intentDefault: "Schema.org @graph Markup",
      ctaLabel: "Generate Connected JSON-LD @graph ✨",
    };
  }
  if (slug.includes("cluster") || slug.includes("keyword")) {
    return {
      keywordLabel: "Core Pillar Topic / Seed Keyword",
      keywordDefault: "AI SEO Content Architecture",
      contentLabel: "Raw Keyword List (comma or line separated)",
      contentDefault:
        "ai seo tools, meta title pixel length, json-ld schema generator, keyword clustering workflow, on-page seo checklist, readability grade 8",
      intentDefault: "Hub-and-Spoke Topic Cluster",
      ctaLabel: "Build Topic Clusters & Intent Map ✨",
    };
  }
  if (slug.includes("readability") || slug.includes("clarity")) {
    return {
      keywordLabel: "Target Topic / Audience Benchmark",
      keywordDefault: "Grade 8 Executive Scannability",
      contentLabel: "Draft Paragraph or Article Excerpt to Score & Polish",
      contentDefault:
        "Organizations that implement automated content governance pipelines frequently observe that overly complex sentence structures reduce reader comprehension and lower organic conversion rates.",
      intentDefault: "Grade 7–8 Clarity & E-E-A-T Rewrite",
      ctaLabel: "Score Readability & Generate AI Rewrite ✨",
    };
  }
  if (slug.includes("faq") || slug.includes("snippet") || slug.includes("aeo")) {
    return {
      keywordLabel: "Core Question or Search Topic",
      keywordDefault: "How to win Google AI Overviews & Featured Snippets",
      contentLabel: "Supporting Facts, Product Details, or Context",
      contentDefault:
        "Pages with a 40–55 word direct answer block immediately below an H2 question and matching FAQPage JSON-LD earn significantly more Position-Zero citations.",
      intentDefault: "AEO / People-Also-Ask Snippets",
      ctaLabel: "Generate AEO Answer Block & FAQs ✨",
    };
  }
  return {
    keywordLabel: "Target Keyword / Primary Topic",
    keywordDefault: "AI Meta Title & Description Generator",
    contentLabel: "Meta Description Draft / Value Proposition (140–160 chars)",
    contentDefault:
      "Generate pixel-perfect 600px meta titles and 920px meta descriptions with live Google SERP preview, CTR scoring, and 1-click HTML export.",
    intentDefault: "Commercial & Informational CTR",
    ctaLabel: "Generate 5 AI Variations with Gemini ✨",
  };
}

export function InteractiveWebsiteToolRunner(props: {
  tool: WebsiteToolSpec;
  siteName: string;
  siteSlug?: string;
  publicBasePath?: string;
  accentColor?: string;
  siteAccent?: string;
  siteBackground?: string;
  displayMode?: "full-landing" | "workspace-only";
  compact?: boolean;
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const resolvedSlug = resolveCatalogToolSlug(props.tool);

  if (resolvedSlug) {
    return (
      <TransferredCatalogToolFrame
        tool={props.tool}
        resolvedSlug={resolvedSlug}
        siteName={props.siteName}
        siteSlug={props.siteSlug}
        publicBasePath={props.publicBasePath}
        accentColor={props.accentColor || "#22d3ee"}
        siteAccent={props.siteAccent}
        siteBackground={props.siteBackground}
        initialDisplayMode={props.displayMode ?? "full-landing"}
        compact={props.compact}
        allTools={props.allTools}
        onSelectTool={props.onSelectTool}
      />
    );
  }

  return <FallbackGenericToolRunner {...props} />;
}

function FallbackGenericToolRunner({
  tool,
  siteName,
  siteSlug,
  accentColor = "#22d3ee",
  siteAccent,
  siteBackground,
  displayMode = "full-landing",
  compact = false,
  allTools,
  onSelectTool,
}: {
  tool: WebsiteToolSpec;
  siteName: string;
  siteSlug?: string;
  publicBasePath?: string;
  accentColor?: string;
  siteAccent?: string;
  siteBackground?: string;
  displayMode?: "full-landing" | "workspace-only";
  compact?: boolean;
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const {
    effectiveThemeMode,
    effectiveAccent,
    effectiveSecondaryAccent,
    effectiveBackground,
    effectiveSurface,
  } = useMemo(
    () =>
      resolveToolVisualPalette({
        tool,
        siteAccent,
        siteBackground,
        fallbackAccent: accentColor,
      }),
    [tool, siteAccent, siteBackground, accentColor],
  );
  const isDark = effectiveThemeMode === "dark";

  const cleanBrand = useMemo(
    () => siteName.split(/[—·|]/)[0]?.trim() || "MetaCraft AI",
    [siteName],
  );
  const preset = useMemo(() => {
    const base = getToolPresetInputs(tool.caseStudySlug || tool.id, cleanBrand);
    return {
      ...base,
      keywordLabel: tool.inputLabel?.trim() || base.keywordLabel,
      keywordDefault: tool.defaultInput?.trim() || base.keywordDefault,
      contentLabel: tool.secondaryInputLabel?.trim() || base.contentLabel,
      contentDefault: tool.defaultSecondaryInput?.trim() || base.contentDefault,
      ctaLabel: tool.customCtaLabel?.trim() || base.ctaLabel,
    };
  }, [
    tool.caseStudySlug,
    tool.id,
    tool.inputLabel,
    tool.defaultInput,
    tool.secondaryInputLabel,
    tool.defaultSecondaryInput,
    tool.customCtaLabel,
    cleanBrand,
  ]);

  const [keyword, setKeyword] = useState(preset.keywordDefault);
  const [brand, setBrand] = useState(cleanBrand);
  const [intent, setIntent] = useState(preset.intentDefault);
  const [content, setContent] = useState(preset.contentDefault);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyBox, setShowApiKeyBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "serp" | "code">("results");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [result, setResult] = useState<ToolRunPayload | null>(null);

  const siteDisplayPath = useMemo(() => {
    const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^\/+|\/+$/g, "");
    const toolPart = (tool.caseStudySlug || "meta-title-generator").replace(/^\/+|\/+$/g, "");
    return `/p/${slugPart} › ${toolPart}`;
  }, [siteSlug, cleanBrand, tool.caseStudySlug]);

  const canonicalSiteUrl = useMemo(() => {
    const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^\/+|\/+$/g, "");
    return `/p/${slugPart}`;
  }, [siteSlug, cleanBrand]);

  useEffect(() => {
    const nextPreset = getToolPresetInputs(tool.caseStudySlug || tool.id, cleanBrand);
    const resolvedKw = tool.defaultInput?.trim() || nextPreset.keywordDefault;
    const resolvedContent = tool.defaultSecondaryInput?.trim() || nextPreset.contentDefault;
    setKeyword(resolvedKw);
    setBrand(cleanBrand);
    setIntent(nextPreset.intentDefault);
    setContent(resolvedContent);
    void executeToolRun({
      toolSlug: tool.caseStudySlug || tool.id,
      toolTitle: tool.title,
      keyword: resolvedKw,
      brand: cleanBrand,
      intent: nextPreset.intentDefault,
      content: resolvedContent,
      pageUrl: canonicalSiteUrl,
      customKey: customApiKey,
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id, tool.caseStudySlug, tool.defaultInput, tool.defaultSecondaryInput, cleanBrand]);

  async function executeToolRun(params: {
    toolSlug: string;
    toolTitle: string;
    keyword: string;
    brand: string;
    intent: string;
    content: string;
    pageUrl: string;
    customKey: string;
    silent?: boolean;
  }) {
    if (!params.silent) setLoading(true);
    try {
      const response = await fetch("/api/website-builder/run-tool", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolSlug: params.toolSlug,
          toolTitle: params.toolTitle,
          keyword: params.keyword,
          brand: params.brand,
          intent: params.intent,
          content: params.content,
          pageUrl: params.pageUrl,
          customApiKey: params.customKey || undefined,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as ToolRunPayload;
        setResult(data);
      }
    } catch {
      // Keep current state if offline
    } finally {
      if (!params.silent) setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 2200);
  }

  const liveTitle = useMemo(() => {
    const base = `${keyword.trim() || tool.title} — Free 2026 Tool | ${brand.trim() || cleanBrand}`;
    return base.slice(0, 68);
  }, [keyword, brand, tool.title, cleanBrand]);

  const titleChars = liveTitle.length;
  const titlePixels = Math.round(titleChars * 9.3);
  const descText = (content.trim() || tool.summary).slice(0, 168);
  const descChars = descText.length;
  const descPixels = Math.round(descChars * 5.7);

  const highlightBullets =
    tool.heroHighlights && tool.heroHighlights.length > 0
      ? tool.heroHighlights
      : [
          "Instant Browser Execution: Generate structured outputs in real time.",
          "Pixel & Entity Calibrated: Built for 2026 Google SERP and AI Overview standards.",
          "1-Click Code Export: Copy HTML, Markdown, or JSON-LD snippets immediately.",
        ];

  return (
    <div
      id="tool-workspace"
      className="interactive-tool-runner"
      style={{
        background: effectiveBackground,
        border: `1px solid ${hexToRgba(effectiveAccent, 0.38)}`,
        borderRadius: compact ? "18px" : "20px",
        overflow: "hidden",
        boxShadow: isDark ? "0 24px 64px rgba(0, 0, 0, 0.55)" : "0 18px 42px rgba(15, 23, 42, 0.08)",
        color: isDark ? "#f8fafc" : "#0f172a",
        textAlign: "left",
        containerType: "inline-size",
      }}
    >
      {/* Full Landing Hero Section for Custom / Fallback Tools */}
      {displayMode !== "workspace-only" && !compact && (
        <section
          data-wb-hero="true"
          style={{
            padding: "clamp(24px, 4vw, 44px)",
            background: `radial-gradient(circle at 16% 18%, ${hexToRgba(effectiveAccent, 0.22)}, transparent 48%), radial-gradient(circle at 84% 22%, ${hexToRgba(effectiveSecondaryAccent, 0.18)}, transparent 52%), ${effectiveBackground}`,
            borderBottom: `1px solid ${hexToRgba(effectiveAccent, 0.32)}`,
          }}
        >
          <div
            data-wb-hero-grid="true"
            style={{
              maxWidth: "1140px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "grid", gap: "12px", minWidth: 0 }}>
              <p
                data-wb-property="role"
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: effectiveAccent,
                }}
              >
                {tool.role || "INTERACTIVE AI WEB UTILITY"}
              </p>
              <h1
                data-wb-property="title"
                style={{
                  margin: 0,
                  fontSize: "clamp(26px, 4vw, 44px)",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: isDark ? "#ffffff" : "#0f172a",
                  overflowWrap: "anywhere",
                }}
              >
                {tool.title}
              </h1>
              <p
                data-wb-property="summary"
                style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: isDark ? "#cbd5e1" : "#334155",
                }}
              >
                {tool.summary}
              </p>
              {tool.technologies.length > 0 && (
                <div
                  data-wb-property="technologies"
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}
                >
                  {tool.technologies.map((badge) => (
                    <span
                      key={badge}
                      style={{
                        padding: "5px 11px",
                        borderRadius: "999px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        background: hexToRgba(effectiveAccent, 0.14),
                        border: `1px solid ${hexToRgba(effectiveAccent, 0.35)}`,
                        color: isDark ? "#e2e8f0" : "#1e293b",
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              data-wb-surface-card="true"
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: effectiveSurface,
                border: `1px solid ${hexToRgba(effectiveAccent, 0.28)}`,
                display: "grid",
                gap: "10px",
              }}
            >
              <p
                data-wb-property="period"
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: effectiveAccent,
                }}
              >
                {tool.period || "What This Tool Generates"}
              </p>
              <ul
                data-wb-property="heroHighlights"
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  display: "grid",
                  gap: "8px",
                  fontSize: "13px",
                  lineHeight: 1.55,
                  color: isDark ? "#cbd5e1" : "#334155",
                }}
              >
                {highlightBullets.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <div
        style={{
          background: isDark ? "rgba(12, 24, 46, 0.95)" : "#f1f5f9",
          padding: "12px 18px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: hexToRgba(effectiveAccent, 0.16),
              border: `1px solid ${hexToRgba(effectiveAccent, 0.4)}`,
              color: isDark ? "#e2e8f0" : "#0f172a",
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            <Wrench size={12} color={effectiveAccent} /> LIVE IN-SITE AI TOOL WORKSPACE
          </span>
          <strong style={{ fontSize: "13.5px", color: isDark ? "#ffffff" : "#0f172a" }}>{tool.title}</strong>
          <code
            style={{
              fontSize: "11px",
              color: isDark ? "#94a3b8" : "#475569",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.06)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {siteDisplayPath}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: "999px",
              background: hexToRgba(effectiveAccent, 0.16),
              border: `1px solid ${hexToRgba(effectiveAccent, 0.38)}`,
              color: isDark ? "#c7d2fe" : "#1e293b",
            }}
          >
            {result?.provider === "gemini-api"
              ? "⚡ Powered by Gemini AI Key"
              : "⚡ Instant AI + Pixel Engine Ready"}
          </span>
          <button
            type="button"
            onClick={() => setShowApiKeyBox((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
              color: isDark ? "#cbd5e1" : "#334155",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <KeyRound size={12} />
            {customApiKey.trim() ? "Custom API Key Active" : "API Key Settings"}
          </button>
        </div>
      </div>

      {allTools && allTools.length > 1 && onSelectTool && (
        <div
          style={{
            padding: "10px 18px",
            background: isDark ? "rgba(7, 13, 27, 0.9)" : "#e2e8f0",
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: isDark ? "#94a3b8" : "#475569",
              whiteSpace: "nowrap",
            }}
          >
            SWITCH TOOL ({allTools.length}):
          </span>
          {allTools.map((candidate, idx) => {
            const active = candidate.id === tool.id;
            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onSelectTool(candidate)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: active
                    ? `1px solid ${effectiveAccent}`
                    : "1px solid rgba(148, 163, 184, 0.22)",
                  background: active ? hexToRgba(effectiveAccent, 0.18) : "transparent",
                  color: active ? (isDark ? "#ffffff" : "#0f172a") : isDark ? "#cbd5e1" : "#334155",
                  fontSize: "11.5px",
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                0{idx + 1}. {candidate.title}
              </button>
            );
          })}
        </div>
      )}

      {showApiKeyBox && (
        <div
          style={{
            padding: "12px 18px",
            background: isDark ? "rgba(15, 23, 42, 0.95)" : "#f8fafc",
            borderBottom: `1px solid ${hexToRgba(effectiveAccent, 0.28)}`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <div style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
            <strong>Gemini API Key Configuration:</strong> Uses the built-in server{" "}
            <code>process.env.GEMINI_API_KEY</code> automatically. You can optionally enter a custom Gemini API key below:
          </div>
          <div style={{ display: "flex", gap: "8px", flex: "1 1 280px", maxWidth: "420px" }}>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Optional: Paste custom AIzaSy... Gemini key"
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "8px",
                border: `1px solid ${hexToRgba(effectiveAccent, 0.35)}`,
                background: isDark ? "#050b16" : "#ffffff",
                color: isDark ? "#f8fafc" : "#0f172a",
                fontSize: "12px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKeyBox(false)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: 0,
                background: effectiveAccent,
                color: isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          padding: compact ? "18px" : "22px",
          display: "grid",
          gridTemplateColumns: compact
            ? "1fr"
            : "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div
          data-wb-surface-card="true"
          style={{
            background: effectiveSurface,
            border: `1px solid ${hexToRgba(effectiveAccent, 0.22)}`,
            borderRadius: "16px",
            padding: "18px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: effectiveAccent,
                textTransform: "uppercase",
              }}
            >
              STEP 1 · CONFIGURE INPUTS
            </span>
            <h3 data-wb-property="title" style={{ margin: "4px 0 0", fontSize: "17px", color: isDark ? "#ffffff" : "#0f172a" }}>
              {tool.title}
            </h3>
            <p data-wb-property="summary" style={{ margin: "4px 0 0", fontSize: "12.5px", color: isDark ? "#94a3b8" : "#475569", lineHeight: 1.5 }}>
              {tool.summary}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
              gap: "10px",
            }}
          >
            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: isDark ? "#cbd5e1" : "#334155", fontWeight: 600 }}>
              <span data-wb-property="inputLabel">{preset.keywordLabel}</span>
              <input
                type="text"
                data-wb-property="defaultInput"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: isDark ? "#050b16" : "#f8fafc",
                  border: `1px solid ${hexToRgba(effectiveAccent, 0.35)}`,
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "13px",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: isDark ? "#cbd5e1" : "#334155", fontWeight: 600 }}>
              <span>Website / Brand Name</span>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: isDark ? "#050b16" : "#f8fafc",
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "13px",
                }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: isDark ? "#cbd5e1" : "#334155", fontWeight: 600 }}>
            <span>Search Intent / Optimization Mode</span>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: isDark ? "#050b16" : "#f8fafc",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                color: isDark ? "#ffffff" : "#0f172a",
                fontSize: "12.5px",
              }}
            >
              <option value={preset.intentDefault}>{preset.intentDefault} (Recommended)</option>
              <option value="High-CTR Commercial & Comparison">High-CTR Commercial &amp; Comparison</option>
              <option value="Informational Pillar & AEO Answer">Informational Pillar &amp; AEO Answer</option>
              <option value="Transactional Landing Page">Transactional Tool / Product Page</option>
              <option value="Technical E-E-A-T Benchmark">Technical E-E-A-T Benchmark</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: isDark ? "#cbd5e1" : "#334155", fontWeight: 600 }}>
            <span data-wb-property="secondaryInputLabel">{preset.contentLabel}</span>
            <textarea
              rows={3}
              data-wb-property="defaultSecondaryInput"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: isDark ? "#050b16" : "#f8fafc",
                border: `1px solid ${hexToRgba(effectiveAccent, 0.35)}`,
                color: isDark ? "#ffffff" : "#0f172a",
                fontSize: "12.5px",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: isDark ? "rgba(5, 11, 22, 0.78)" : "#f1f5f9",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              fontSize: "11px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: isDark ? "#94a3b8" : "#475569" }}>
                <span>Title Pixel Gauge</span>
                <strong style={{ color: titlePixels <= 580 ? "#4ade80" : "#f87171" }}>
                  {titleChars} chars · ~{titlePixels}px / 600px
                </strong>
              </div>
              <div
                style={{
                  marginTop: "5px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "rgba(148, 163, 184, 0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((titlePixels / 600) * 100))}%`,
                    height: "100%",
                    background: titlePixels <= 580 ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: isDark ? "#94a3b8" : "#475569" }}>
                <span>Description Gauge</span>
                <strong style={{ color: descPixels <= 900 ? "#4ade80" : "#f87171" }}>
                  {descChars} chars · ~{descPixels}px / 920px
                </strong>
              </div>
              <div
                style={{
                  marginTop: "5px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "rgba(148, 163, 184, 0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((descPixels / 920) * 100))}%`,
                    height: "100%",
                    background: descPixels <= 900 ? effectiveAccent : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            data-wb-property="customCtaLabel"
            disabled={loading}
            onClick={() =>
              void executeToolRun({
                toolSlug: tool.caseStudySlug || tool.id,
                toolTitle: tool.title,
                keyword,
                brand,
                intent,
                content,
                pageUrl: canonicalSiteUrl,
                customKey: customApiKey,
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 18px",
              borderRadius: "11px",
              border: 0,
              background: `linear-gradient(135deg, ${effectiveAccent} 0%, ${effectiveSecondaryAccent} 100%)`,
              color: isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: loading ? "wait" : "pointer",
              boxShadow: `0 10px 28px ${hexToRgba(effectiveAccent, 0.25)}`,
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} /> Running AI Tool Engine…
              </>
            ) : (
              <>
                <Wand2 size={15} /> {preset.ctaLabel}
              </>
            )}
          </button>
        </div>

        <div
          data-wb-surface-card="true"
          style={{
            background: effectiveSurface,
            border: `1px solid ${hexToRgba(effectiveAccent, 0.22)}`,
            borderRadius: "16px",
            padding: "18px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
              paddingBottom: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "results" ? effectiveAccent : "rgba(148,163,184,0.12)",
                  color: activeTab === "results" ? (isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff") : isDark ? "#ffffff" : "#0f172a",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Sparkles size={12} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                AI Outputs ({result?.items.length ?? 5})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("serp")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "serp" ? effectiveAccent : "rgba(148,163,184,0.12)",
                  color: activeTab === "serp" ? (isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff") : isDark ? "#ffffff" : "#0f172a",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Google SERP Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "code" ? effectiveAccent : "rgba(148,163,184,0.12)",
                  color: activeTab === "code" ? (isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff") : isDark ? "#ffffff" : "#0f172a",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Code2 size={12} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                HTML / JSON-LD Export
              </button>
            </div>

            {result && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(16, 185, 129, 0.16)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#10b981",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                Score: {result.overallScore}/100
              </span>
            )}
          </div>

          {result?.metrics && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                gap: "8px",
              }}
            >
              {result.metrics.map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    background: isDark ? "rgba(5, 11, 22, 0.75)" : "#f8fafc",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    display: "grid",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#475569" }}>{m.label}</span>
                  <strong
                    style={{
                      fontSize: "11.5px",
                      color:
                        m.status === "good"
                          ? "#22c55e"
                          : m.status === "warn"
                            ? "#f59e0b"
                            : effectiveAccent,
                    }}
                  >
                    {m.value}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {activeTab === "results" && (
            <div style={{ display: "grid", gap: "10px", maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
              {(result?.items ?? []).map((item, idx) => {
                const copyId = `item-${idx}`;
                const fullCopy = `${item.title}\n${item.description}`;
                return (
                  <div
                    key={`${item.label}-${idx}`}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: isDark ? "rgba(5, 11, 22, 0.85)" : "#f8fafc",
                      border: `1px solid ${hexToRgba(effectiveAccent, 0.26)}`,
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 800,
                          color: effectiveAccent,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: "rgba(16, 185, 129, 0.14)",
                              color: "#10b981",
                              fontWeight: 700,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(fullCopy, copyId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148, 163, 184, 0.25)",
                            background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                            color: isDark ? "#e2e8f0" : "#0f172a",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === copyId ? (
                            <>
                              <Check size={11} color="#4ade80" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <strong style={{ fontSize: "14px", color: isDark ? "#ffffff" : "#0f172a", lineHeight: 1.35 }}>
                      {item.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "serp" && (
            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  color: "#1e293b",
                  display: "grid",
                  gap: "6px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#475569",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span>
                    <strong>{brand}</strong> · {siteDisplayPath}
                  </span>
                  <span
                    style={{
                      color: titlePixels <= 580 ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {titleChars} chars · ~{titlePixels}px / 600px
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1a0dab",
                    lineHeight: 1.3,
                  }}
                >
                  {result?.items[0]?.title || liveTitle}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#334155",
                    lineHeight: 1.55,
                  }}
                >
                  {result?.items[0]?.description || descText}
                </div>
              </div>
              <small style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: "11.5px" }}>
                ✓ Verified in-site SERP preview for <code>{canonicalSiteUrl}</code> — zero external redirects.
              </small>
            </div>
          )}

          {activeTab === "code" && result?.codeBlock && (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: isDark ? "#cbd5e1" : "#334155" }}>
                  {result.codeBlock.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.codeBlock.code, "code-block")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 10px",
                    borderRadius: "7px",
                    border: 0,
                    background: effectiveAccent,
                    color: isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {copiedKey === "code-block" ? (
                    <>
                      <Check size={12} /> Copied Snippet!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#030712",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                  color: "#a5f3fc",
                  fontSize: "11.5px",
                  lineHeight: 1.5,
                  overflowX: "auto",
                  maxHeight: "320px",
                }}
              >
                <code>{result.codeBlock.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Educational / Methodology Sections for Custom Tools */}
      {!tool.hideEducationSection && displayMode !== "workspace-only" && !compact && (
        <section
          data-wb-custom-education="true"
          style={{
            padding: "8px 22px 28px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "14px",
            }}
          >
            <article
              data-wb-property="challenge"
              data-wb-surface-card="true"
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: effectiveSurface,
                border: `1px solid ${hexToRgba(effectiveAccent, 0.24)}`,
                display: "grid",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: effectiveAccent }}>
                01 · PROBLEM &amp; USE CASE
              </span>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: isDark ? "#cbd5e1" : "#334155" }}>
                {tool.challenge ||
                  `Eliminates manual ${tool.title} guesswork with deterministic browser validation and AI-assisted optimization.`}
              </p>
            </article>
            <article
              data-wb-property="approach"
              data-wb-surface-card="true"
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: effectiveSurface,
                border: `1px solid ${hexToRgba(effectiveSecondaryAccent, 0.24)}`,
                display: "grid",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: effectiveSecondaryAccent }}>
                02 · HOW IT WORKS
              </span>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: isDark ? "#cbd5e1" : "#334155" }}>
                {tool.approach ||
                  "Configure your target keyword, intent, and draft inputs above to generate scored variations and copy-ready code."}
              </p>
            </article>
            <article
              data-wb-property="outcome"
              data-wb-surface-card="true"
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: effectiveSurface,
                border: `1px solid ${hexToRgba(effectiveAccent, 0.24)}`,
                display: "grid",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: "#34d399" }}>
                03 · EXPECTED OUTCOME
              </span>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: isDark ? "#cbd5e1" : "#334155" }}>
                {tool.outcome ||
                  "Delivers 5 rank-ready variations, live Google SERP pixel verification, and 1-click HTML/JSON-LD export."}
              </p>
            </article>
          </div>
        </section>
      )}

      {/* Custom or Default FAQs for Custom Tools */}
      {!tool.hideFaqSection && displayMode !== "workspace-only" && !compact && (
        <section
          data-wb-custom-faqs="true"
          data-wb-property="customFaqs"
          style={{
            padding: "4px 22px 28px",
            display: "grid",
            gap: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
            Frequently Asked Questions
          </h3>
          {(tool.customFaqs && tool.customFaqs.length > 0
            ? tool.customFaqs
            : [
                {
                  question: `How does ${tool.title} work?`,
                  answer:
                    "Enter your primary topic and draft context above, then click the primary action button to generate scored outputs and copy-ready code.",
                },
                {
                  question: "Can I customize this tool's inputs, colors, and FAQs in Studio?",
                  answer:
                    "Yes. Click any element in Website Studio or use the left-hand Tool Landing Page Customizer to edit headings, input labels, theme colors, gradients, and FAQs.",
                },
              ]
          ).map((faq, idx) => (
            <details
              key={`${faq.question}-${idx}`}
              data-wb-surface-card="true"
              style={{
                borderRadius: "12px",
                border: `1px solid ${hexToRgba(effectiveAccent, 0.22)}`,
                background: effectiveSurface,
                padding: "12px 16px",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                {faq.question}
              </summary>
              <p style={{ margin: "8px 0 0", fontSize: "13px", lineHeight: 1.6, color: isDark ? "#cbd5e1" : "#475569" }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
