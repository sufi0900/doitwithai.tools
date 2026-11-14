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
  defaultInput?: string;
  defaultSecondaryInput?: string;
  customCtaLabel?: string;
  heroHighlights?: string[];
  toolAccentHex?: string;
  toolBackgroundHex?: string;
  toolThemeMode?: "auto" | "dark" | "light";
  hideEducationSection?: boolean;
  hideFaqSection?: boolean;
  customFaqs?: Array<{ question: string; answer: string }>;
  metaTitle?: string;
  metaDescription?: string;
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

const LIGHT_BACKGROUNDS = new Set(["ivory"]);

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

function buildNativeToolScopeCss(params: {
  scopeClass: string;
  effectiveAccent: string;
  effectiveBackground: string;
  effectiveThemeMode: "dark" | "light";
  hasCustomBackground: boolean;
}) {
  const { scopeClass, effectiveAccent, effectiveBackground, effectiveThemeMode, hasCustomBackground } =
    params;
  const isDark = effectiveThemeMode === "dark";
  const accentFg = isLightColorHex(effectiveAccent) ? "#04101c" : "#ffffff";
  const accentSoft = hexToRgba(effectiveAccent, 0.2);
  const accentBorder = hexToRgba(effectiveAccent, 0.45);
  const accentGlow = hexToRgba(effectiveAccent, 0.16);
  const heroBg = hasCustomBackground
    ? `radial-gradient(circle at 18% 15%, ${accentSoft}, transparent 50%), ${effectiveBackground}`
    : isDark
      ? `radial-gradient(circle at 18% 15%, ${accentSoft}, transparent 48%), linear-gradient(155deg, #040915 0%, #0b152a 100%)`
      : `radial-gradient(circle at 18% 15%, ${accentSoft}, transparent 52%), linear-gradient(155deg, #f8fafc 0%, #eef2ff 100%)`;

  return `
    .${scopeClass} {
      --wb-tool-accent: ${effectiveAccent};
      --wb-tool-accent-fg: ${accentFg};
      --wb-tool-accent-soft: ${accentSoft};
      --wb-tool-accent-border: ${accentBorder};
      --wb-tool-accent-glow: ${accentGlow};
      --wb-tool-bg: ${effectiveBackground};
      background: ${effectiveBackground} !important;
      color: ${isDark ? "#e2e8f0" : "#0f172a"};
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
      .${scopeClass} details.rounded-2xl {
        background-color: rgba(15, 23, 42, 0.88) !important;
        border-color: rgba(148, 163, 184, 0.22) !important;
        color: #cbd5e1 !important;
      }
    `
        : `
      .${scopeClass} main > section:not(:first-of-type) {
        background-color: ${hasCustomBackground ? effectiveBackground : "#f8fafc"};
      }
    `
    }
    .${scopeClass} main > section:first-of-type,
    .${scopeClass} > main > div:first-of-type {
      background-image: ${heroBg} !important;
      border-bottom: 1px solid ${accentBorder} !important;
    }
    .${scopeClass} h1 span {
      background-image: linear-gradient(95deg, ${isDark ? "#ffffff" : "#0f172a"} 10%, ${effectiveAccent} 95%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
    .${scopeClass} button[type="submit"],
    .${scopeClass} button[class*="bg-[#5271"],
    .${scopeClass} button[class*="from-[#3452d1"] {
      background-image: linear-gradient(135deg, ${effectiveAccent}, ${effectiveAccent}) !important;
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
  const overrides = shouldApplyHeroOverride(tool, catalogTool);
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

  // 2. Hero overrides (NEVER use .innerHTML or .replaceChildren on React nodes)
  const h1 = container.querySelector<HTMLElement>("h1");
  const heroContainer = h1?.closest<HTMLElement>("section, div.relative");
  const heroGrid = heroContainer?.querySelector<HTMLElement>(".grid");
  const heroLeftCol = h1?.parentElement;

  if (heroGrid) {
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
  }

  // 3. Default Tool Inputs & Safe Primary CTA Label override (text node only, keeps icons!)
  const allEditableInputs = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
  ).filter((el) => {
    if (el.closest("nav") || el.closest("aside") || el.closest("[data-wb-custom-faqs]")) {
      return false;
    }
    if (el.tagName === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      return type === "text" || type === "url" || type === "search" || type === "email" || !type;
    }
    return true;
  });

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

  if (tool.customCtaLabel && tool.customCtaLabel.trim()) {
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

    if (
      primaryActionBtn &&
      primaryActionBtn.dataset.wbCtaApplied !== tool.customCtaLabel.trim()
    ) {
      primaryActionBtn.dataset.wbCtaApplied = tool.customCtaLabel.trim();
      updateElementTextNodePreservingIcons(primaryActionBtn, tool.customCtaLabel.trim());
    }
  }

  // 4. Education & FAQ section visibility via style.display (NEVER mutating children)
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

  sections.forEach((sectionEl) => {
    if (sectionEl.hasAttribute("data-wb-custom-faqs")) return;
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
      sectionEl.style.display =
        displayMode === "workspace-only" || tool.hideFaqSection || hasCustomFaqs ? "none" : "";
    } else {
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

  // Forward saved BYOK Gemini key on same-origin /api/ tool calls when running inside transferred runtime
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

  const effectiveAccent = useMemo(() => {
    if (isValidHex(tool.toolAccentHex)) return tool.toolAccentHex!.trim();
    if (siteAccent && SITE_ACCENT_HEX_MAP[siteAccent]) {
      return SITE_ACCENT_HEX_MAP[siteAccent];
    }
    return accentColor || "#38bdf8";
  }, [tool.toolAccentHex, siteAccent, accentColor]);

  const effectiveThemeMode: "dark" | "light" = useMemo(() => {
    if (tool.toolThemeMode === "dark" || tool.toolThemeMode === "light") {
      return tool.toolThemeMode;
    }
    if (tool.toolBackgroundHex && isValidHex(tool.toolBackgroundHex)) {
      return isLightColorHex(tool.toolBackgroundHex) ? "light" : "dark";
    }
    if (siteBackground && LIGHT_BACKGROUNDS.has(siteBackground)) {
      return "light";
    }
    return "dark";
  }, [tool.toolThemeMode, tool.toolBackgroundHex, siteBackground]);

  const hasCustomBackground = isValidHex(tool.toolBackgroundHex);
  const effectiveBackground = hasCustomBackground
    ? tool.toolBackgroundHex!.trim()
    : effectiveThemeMode === "dark"
      ? "#070d19"
      : "#f8fafc";

  const scopeCss = useMemo(
    () =>
      buildNativeToolScopeCss({
        scopeClass,
        effectiveAccent,
        effectiveBackground,
        effectiveThemeMode,
        hasCustomBackground,
      }),
    [scopeClass, effectiveAccent, effectiveBackground, effectiveThemeMode, hasCustomBackground],
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

        {/* Subtle corner API Key utility button without breaking full-page immersion */}
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

        {/* Native React rendering of real upstream tool page (zero iframe) */}
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

        {/* Optional Custom FAQs rendered cleanly in React when configured */}
        {!tool.hideFaqSection && tool.customFaqs && tool.customFaqs.length > 0 && (
          <section
            data-wb-custom-faqs="true"
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
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(148, 163, 184, 0.22)",
                    background:
                      effectiveThemeMode === "dark" ? "rgba(15, 23, 42, 0.85)" : "#ffffff",
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
  compact = false,
  allTools,
  onSelectTool,
}: {
  tool: WebsiteToolSpec;
  siteName: string;
  siteSlug?: string;
  accentColor?: string;
  siteAccent?: string;
  siteBackground?: string;
  displayMode?: "full-landing" | "workspace-only";
  compact?: boolean;
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const effectiveAccent =
    (tool.toolAccentHex && /^#[0-9a-f]{3,8}$/i.test(tool.toolAccentHex.trim())
      ? tool.toolAccentHex.trim()
      : siteAccent && SITE_ACCENT_HEX_MAP[siteAccent]) || accentColor;

  const cleanBrand = useMemo(
    () => siteName.split(/[—·|]/)[0]?.trim() || "MetaCraft AI",
    [siteName],
  );
  const preset = useMemo(() => {
    const base = getToolPresetInputs(tool.caseStudySlug || tool.id, cleanBrand);
    return {
      ...base,
      keywordDefault: tool.defaultInput?.trim() || base.keywordDefault,
      contentDefault: tool.defaultSecondaryInput?.trim() || base.contentDefault,
      ctaLabel: tool.customCtaLabel?.trim() || base.ctaLabel,
    };
  }, [tool.caseStudySlug, tool.id, tool.defaultInput, tool.defaultSecondaryInput, tool.customCtaLabel, cleanBrand]);

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

  return (
    <div
      id="tool-workspace"
      className="interactive-tool-runner"
      style={{
        background: "linear-gradient(160deg, #050b18 0%, #0a1529 100%)",
        border: `1px solid ${accentColor}55`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.55)",
        color: "#f8fafc",
        textAlign: "left",
      }}
    >
      <div
        style={{
          background: "rgba(12, 24, 46, 0.95)",
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
              background: "rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#6ee7b7",
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            <Wrench size={12} /> LIVE IN-SITE AI TOOL WORKSPACE
          </span>
          <strong style={{ fontSize: "13.5px", color: "#ffffff" }}>{tool.title}</strong>
          <code
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              background: "rgba(255,255,255,0.05)",
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
              background:
                result?.provider === "gemini-api"
                  ? "rgba(99, 102, 241, 0.22)"
                  : "rgba(34, 211, 238, 0.14)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#c7d2fe",
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
              background: "rgba(15, 23, 42, 0.8)",
              color: "#cbd5e1",
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
            background: "rgba(7, 13, 27, 0.9)",
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
              color: "#94a3b8",
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
                    ? `1px solid ${accentColor}`
                    : "1px solid rgba(148, 163, 184, 0.22)",
                  background: active ? "rgba(34, 211, 238, 0.16)" : "rgba(15, 23, 42, 0.7)",
                  color: active ? "#ffffff" : "#cbd5e1",
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
            background: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(56, 189, 248, 0.28)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <div style={{ color: "#cbd5e1" }}>
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
                border: "1px solid rgba(56, 189, 248, 0.35)",
                background: "#050b16",
                color: "#f8fafc",
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
                background: accentColor,
                color: "#04101c",
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
            : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
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
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              STEP 1 · CONFIGURE INPUTS
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: "17px", color: "#ffffff" }}>
              {tool.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.5 }}>
              {tool.summary}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
            }}
          >
            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
              <span>{preset.keywordLabel}</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: "#050b16",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
              <span>Website / Brand Name</span>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: "#050b16",
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
            <span>Search Intent / Optimization Mode</span>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: "#050b16",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                color: "#ffffff",
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

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
            <span>{preset.contentLabel}</span>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: "#050b16",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                color: "#ffffff",
                fontSize: "12.5px",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(5, 11, 22, 0.78)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              fontSize: "11px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
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
                  background: "rgba(255,255,255,0.08)",
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
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
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
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((descPixels / 920) * 100))}%`,
                    height: "100%",
                    background: descPixels <= 900 ? "#38bdf8" : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
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
              background: `linear-gradient(135deg, ${effectiveAccent} 0%, #6366f1 100%)`,
              color: "#04101c",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 10px 28px rgba(34, 211, 238, 0.25)",
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
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
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
                  background: activeTab === "results" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
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
                  background: activeTab === "serp" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
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
                  background: activeTab === "code" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
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
                  color: "#6ee7b7",
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
                    background: "rgba(5, 11, 22, 0.75)",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    display: "grid",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{m.label}</span>
                  <strong
                    style={{
                      fontSize: "11.5px",
                      color:
                        m.status === "good"
                          ? "#4ade80"
                          : m.status === "warn"
                            ? "#fbbf24"
                            : "#38bdf8",
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
                      background: "rgba(5, 11, 22, 0.85)",
                      border: "1px solid rgba(99, 102, 241, 0.28)",
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
                          color: accentColor,
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
                              color: "#6ee7b7",
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
                            background: "rgba(255,255,255,0.05)",
                            color: "#e2e8f0",
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
                    <strong style={{ fontSize: "14px", color: "#ffffff", lineHeight: 1.35 }}>
                      {item.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
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
              <small style={{ color: "#94a3b8", fontSize: "11.5px" }}>
                ✓ Verified in-site SERP preview for <code>{canonicalSiteUrl}</code> — zero external redirects.
              </small>
            </div>
          )}

          {activeTab === "code" && result?.codeBlock && (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
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
                    background: "#22d3ee",
                    color: "#04101c",
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
    </div>
  );
}
