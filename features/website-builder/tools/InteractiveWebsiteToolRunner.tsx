"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  KeyRound,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Wand2,
  Wrench,
} from "lucide-react";
import {
  getCatalogToolBySlug,
  resolveCatalogToolSlug,
  shouldApplyHeroOverride,
} from "@/features/website-builder/domain/catalog-tool-resolver";

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
  toolThemeMode?: "auto" | "dark" | "light";
  hideEducationSection?: boolean;
  hideFaqSection?: boolean;
  customFaqs?: Array<{ question: string; answer: string }>;
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

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
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

function applyTransferredToolCustomizations(params: {
  doc: Document;
  tool: WebsiteToolSpec;
  resolvedSlug: string;
  siteName: string;
  siteSlug?: string;
  effectiveAccent: string;
  effectiveThemeMode: "dark" | "light";
  displayMode: "full-landing" | "workspace-only";
}) {
  const {
    doc,
    tool,
    resolvedSlug,
    siteName,
    siteSlug,
    effectiveAccent,
    effectiveThemeMode,
    displayMode,
  } = params;
  if (!doc || !doc.body) return;

  const catalogTool = getCatalogToolBySlug(resolvedSlug);
  const overrides = shouldApplyHeroOverride(tool, catalogTool);
  const cleanBrand = siteName.split(/[—·|]/)[0]?.trim() || siteName || "AI Tools Hub";
  const baseHref = siteSlug ? `/p/${siteSlug}` : "#";
  const toolsHref = siteSlug ? `/p/${siteSlug}/projects` : "#projects";

  // 1. Hide main-site chrome that does not belong inside a Website Builder site
  doc.querySelectorAll<HTMLElement>('[data-portable-hero-bar="true"]').forEach((el) => {
    el.style.display = "none";
  });
  doc
    .querySelectorAll<HTMLElement>('aside[aria-label="Supporting guides and related tools"]')
    .forEach((el) => {
      el.style.display = "none";
    });

  // 2. Rewrite breadcrumb to the user's own Website Builder site
  const breadcrumb = doc.querySelector<HTMLElement>('nav[aria-label="Breadcrumb"]');
  if (breadcrumb) {
    const links = breadcrumb.querySelectorAll<HTMLAnchorElement>("a");
    if (links[0]) {
      links[0].textContent = cleanBrand;
      if (siteSlug) {
        links[0].href = baseHref;
        links[0].target = "_top";
      }
    }
    if (links[1]) {
      links[1].textContent = "Tools";
      if (siteSlug) {
        links[1].href = toolsHref;
        links[1].target = "_top";
      }
    }
    const currentCrumb = breadcrumb.querySelector<HTMLElement>('[aria-current="page"]');
    if (currentCrumb && overrides.title) {
      if (!currentCrumb.dataset.wbOrigText) {
        currentCrumb.dataset.wbOrigText = currentCrumb.textContent || "";
      }
      currentCrumb.textContent = tool.title;
    } else if (currentCrumb && currentCrumb.dataset.wbOrigText !== undefined) {
      currentCrumb.textContent = currentCrumb.dataset.wbOrigText;
    }
  }

  // 3. Hero overrides & Compact Workspace visibility
  const h1 = doc.querySelector<HTMLElement>("h1");
  const heroContainer = h1?.closest<HTMLElement>("section, div.relative");
  const heroGrid = heroContainer?.querySelector<HTMLElement>(".grid");
  const heroLeftCol = h1?.parentElement;
  const heroRightCol =
    heroGrid && heroLeftCol && heroGrid.children.length > 1
      ? (Array.from(heroGrid.children).find((c) => c !== heroLeftCol) as HTMLElement | undefined)
      : undefined;

  if (heroContainer) {
    if (displayMode === "workspace-only" && heroGrid) {
      heroGrid.style.display = "none";
    } else if (heroGrid) {
      heroGrid.style.display = "";
    }
  }

  if (h1) {
    if (h1.dataset.wbOrigHtml === undefined) {
      h1.dataset.wbOrigHtml = h1.innerHTML;
    }
    if (overrides.title) {
      h1.textContent = tool.title;
    } else if (h1.dataset.wbOrigHtml !== undefined) {
      h1.innerHTML = h1.dataset.wbOrigHtml;
    }
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

    if (eyebrowEl && eyebrowEl !== leadEl) {
      if (eyebrowEl.dataset.wbOrigText === undefined) {
        eyebrowEl.dataset.wbOrigText = eyebrowEl.textContent || "";
      }
      if (overrides.role && tool.role) {
        eyebrowEl.textContent = tool.role;
      } else {
        eyebrowEl.textContent = eyebrowEl.dataset.wbOrigText;
      }
    }

    if (leadEl) {
      if (leadEl.dataset.wbOrigText === undefined) {
        leadEl.dataset.wbOrigText = leadEl.textContent || "";
      }
      if (overrides.summary && tool.summary) {
        leadEl.textContent = tool.summary;
      } else {
        leadEl.textContent = leadEl.dataset.wbOrigText;
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
      if (badgesWrap.dataset.wbOrigHtml === undefined) {
        badgesWrap.dataset.wbOrigHtml = badgesWrap.innerHTML;
      }
      if (overrides.technologies && tool.technologies.length > 0) {
        badgesWrap.replaceChildren();
        tool.technologies.slice(0, 6).forEach((badgeText) => {
          const span = doc.createElement("span");
          span.className = "rounded-lg border border-white/15 px-3 py-2";
          span.textContent = badgeText;
          badgesWrap.appendChild(span);
        });
      } else {
        badgesWrap.innerHTML = badgesWrap.dataset.wbOrigHtml;
      }
    }
  }

  if (heroRightCol) {
    const cardHeading = heroRightCol.querySelector<HTMLElement>("p, h2, h3");
    if (cardHeading) {
      if (cardHeading.dataset.wbOrigText === undefined) {
        cardHeading.dataset.wbOrigText = cardHeading.textContent || "";
      }
      if (overrides.period && tool.period) {
        cardHeading.textContent = tool.period;
      } else {
        cardHeading.textContent = cardHeading.dataset.wbOrigText;
      }
    }

    const cardList = heroRightCol.querySelector<HTMLUListElement>("ul");
    if (cardList) {
      if (cardList.dataset.wbOrigHtml === undefined) {
        cardList.dataset.wbOrigHtml = cardList.innerHTML;
      }
      if (tool.heroHighlights && tool.heroHighlights.length > 0) {
        cardList.replaceChildren();
        const highlightColors = [
          "text-emerald-300",
          "text-sky-300",
          "text-indigo-300",
          "text-amber-300",
          "text-emerald-300",
          "text-sky-300",
        ];
        tool.heroHighlights.slice(0, 6).forEach((line, idx) => {
          const li = doc.createElement("li");
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0 && colonIdx < 36) {
            const strong = doc.createElement("strong");
            strong.className = highlightColors[idx % highlightColors.length] || "text-sky-300";
            strong.textContent = `${line.slice(0, colonIdx)}:`;
            li.appendChild(strong);
            li.appendChild(doc.createTextNode(line.slice(colonIdx + 1)));
          } else {
            li.textContent = line;
          }
          cardList.appendChild(li);
        });
      } else {
        cardList.innerHTML = cardList.dataset.wbOrigHtml;
      }
    }
  }

  // 4. Default Tool Inputs & Primary CTA Label inside live React tool workspace
  const allEditableInputs = Array.from(
    doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
  ).filter((el) => {
    if (el.closest("nav") || el.closest("aside") || el.closest("[data-wb-custom-faqs]")) {
      return false;
    }
    if (el instanceof HTMLInputElement || el.tagName === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      return type === "text" || type === "url" || type === "search" || type === "email" || !type;
    }
    return true;
  });

  if (tool.defaultInput && tool.defaultInput.trim()) {
    const primaryInput = allEditableInputs[0];
    if (primaryInput && doc.body.dataset.wbAppliedDefaultInput !== tool.defaultInput) {
      doc.body.dataset.wbAppliedDefaultInput = tool.defaultInput;
      setNativeInputValue(primaryInput, tool.defaultInput);
    }
  } else {
    delete doc.body.dataset.wbAppliedDefaultInput;
  }

  if (tool.defaultSecondaryInput && tool.defaultSecondaryInput.trim()) {
    const secondaryInput = allEditableInputs[1] || doc.querySelector<HTMLTextAreaElement>("textarea");
    if (
      secondaryInput &&
      doc.body.dataset.wbAppliedSecondaryInput !== tool.defaultSecondaryInput
    ) {
      doc.body.dataset.wbAppliedSecondaryInput = tool.defaultSecondaryInput;
      setNativeInputValue(secondaryInput, tool.defaultSecondaryInput);
    }
  } else {
    delete doc.body.dataset.wbAppliedSecondaryInput;
  }

  const primaryActionBtn = Array.from(doc.querySelectorAll<HTMLButtonElement>("button")).find(
    (btn) => {
      if (btn.closest("nav") || btn.closest("aside") || btn.closest("[data-portable-hero-bar]")) {
        return false;
      }
      if (btn.getAttribute("type") === "submit") return true;
      const cls = btn.className || "";
      const txt = (btn.textContent || "").trim();
      return (
        (cls.includes("bg-gradient") || cls.includes("bg-[#5271") || cls.includes("bg-blue-600") || cls.includes("bg-indigo-600")) &&
        txt.length > 2
      );
    },
  );

  if (primaryActionBtn) {
    if (primaryActionBtn.dataset.wbOrigHtml === undefined) {
      primaryActionBtn.dataset.wbOrigHtml = primaryActionBtn.innerHTML;
    }
    if (tool.customCtaLabel && tool.customCtaLabel.trim()) {
      const svg = primaryActionBtn.querySelector("svg")?.cloneNode(true);
      primaryActionBtn.replaceChildren();
      if (svg) primaryActionBtn.appendChild(svg);
      primaryActionBtn.appendChild(doc.createTextNode(tool.customCtaLabel.trim()));
    } else if (primaryActionBtn.dataset.wbOrigHtml !== undefined) {
      primaryActionBtn.innerHTML = primaryActionBtn.dataset.wbOrigHtml;
    }
  }

  // 5. Education & FAQ section visibility + Custom FAQs
  const mainEl = doc.querySelector("main") || doc.body;
  const sections = Array.from(mainEl.querySelectorAll<HTMLElement>("section"));
  const heroRootSection = heroContainer?.tagName === "SECTION" ? heroContainer : null;
  const workspaceContainer =
    allEditableInputs[0]?.closest<HTMLElement>("section") ??
    doc.querySelector<HTMLElement>("[data-tool-workspace='true']")?.closest<HTMLElement>("section") ??
    null;

  sections.forEach((sectionEl) => {
    if (sectionEl === heroRootSection || sectionEl === workspaceContainer) return;
    if (heroContainer && (heroContainer.contains(sectionEl) || sectionEl.contains(heroContainer))) return;
    if (workspaceContainer && workspaceContainer.contains(sectionEl)) return;

    const hasDetails = sectionEl.querySelectorAll("details").length > 0;
    const headingText = (sectionEl.querySelector("h2")?.textContent || "").toLowerCase();
    const isFaqSection =
      hasDetails || headingText.includes("faq") || headingText.includes("questions");

    if (isFaqSection) {
      sectionEl.style.display =
        displayMode === "workspace-only" || tool.hideFaqSection ? "none" : "";

      const detailsParent =
        sectionEl.querySelector("details")?.parentElement ||
        sectionEl.querySelector<HTMLElement>(".space-y-4, .divide-y");
      if (detailsParent) {
        if (detailsParent.dataset.wbOrigHtml === undefined) {
          detailsParent.dataset.wbOrigHtml = detailsParent.innerHTML;
        }
        if (tool.customFaqs && tool.customFaqs.length > 0) {
          detailsParent.setAttribute("data-wb-custom-faqs", "true");
          detailsParent.replaceChildren();
          tool.customFaqs.forEach((faq) => {
            const details = doc.createElement("details");
            details.className =
              "group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6";
            const summary = doc.createElement("summary");
            summary.className =
              "cursor-pointer list-none pr-8 text-base font-extrabold text-slate-950 marker:hidden dark:text-white";
            summary.textContent = faq.question;
            const ans = doc.createElement("p");
            ans.className =
              "mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300";
            ans.textContent = faq.answer;
            details.appendChild(summary);
            details.appendChild(ans);
            detailsParent.appendChild(details);
          });
        } else if (detailsParent.dataset.wbOrigHtml !== undefined) {
          detailsParent.removeAttribute("data-wb-custom-faqs");
          detailsParent.innerHTML = detailsParent.dataset.wbOrigHtml;
        }
      }
    } else {
      sectionEl.style.display =
        displayMode === "workspace-only" || tool.hideEducationSection ? "none" : "";
    }
  });

  // 6. Theme & Color injection synced to Website Builder design
  const isDark = effectiveThemeMode === "dark";
  doc.documentElement.classList.toggle("dark", isDark);

  const accentSoft = hexToRgba(effectiveAccent, 0.22);
  const accentBorder = hexToRgba(effectiveAccent, 0.48);
  const accentGlow = hexToRgba(effectiveAccent, 0.16);

  let styleEl = doc.getElementById("wb-transferred-tool-theme") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = "wb-transferred-tool-theme";
    doc.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --wb-tool-accent: ${effectiveAccent};
      --wb-tool-accent-soft: ${accentSoft};
      --wb-tool-accent-border: ${accentBorder};
      --wb-tool-accent-glow: ${accentGlow};
    }
    html, body {
      overflow-x: hidden !important;
      ${isDark ? "background: #070d19 !important; color: #e2e8f0 !important;" : "background: #f8fafc !important; color: #0f172a !important;"}
    }
    ${isDark ? `
      main > section,
      main > div > section,
      section.bg-white,
      section[class*="bg-[#f5f7fc]"] {
        background-color: #0b1324 !important;
        border-color: rgba(148, 163, 184, 0.16) !important;
        color: #e2e8f0 !important;
      }
      section.bg-white h2,
      section.bg-white h3,
      section[class*="bg-[#f5f7fc]"] h2,
      section[class*="bg-[#f5f7fc]"] h3,
      details summary {
        color: #f8fafc !important;
      }
      article.rounded-2xl,
      details.rounded-2xl {
        background-color: #0f172a !important;
        border-color: rgba(148, 163, 184, 0.2) !important;
        color: #cbd5e1 !important;
      }
    ` : ""}
    [data-portable-hero-bar="true"],
    aside[aria-label="Supporting guides and related tools"] {
      display: none !important;
    }
    main > section:first-of-type,
    main > div:first-of-type {
      background-image: radial-gradient(circle at 18% 15%, ${accentSoft}, transparent 48%), linear-gradient(155deg, #040915 0%, #0b152a 100%) !important;
      border-bottom: 1px solid ${accentBorder} !important;
    }
    h1 span {
      background-image: linear-gradient(95deg, #ffffff 10%, ${effectiveAccent} 95%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
    button[type="submit"],
    button[class*="bg-[#5271"],
    button[class*="from-[#3452d1"] {
      background-image: linear-gradient(135deg, ${effectiveAccent}, ${effectiveAccent}) !important;
      background-color: ${effectiveAccent} !important;
      border-color: ${accentBorder} !important;
      box-shadow: 0 12px 28px ${accentGlow} !important;
    }
    input:focus, textarea:focus, select:focus {
      border-color: ${effectiveAccent} !important;
      box-shadow: 0 0 0 3px ${accentGlow} !important;
    }
  `;
}

function TransferredCatalogToolFrame({
  tool,
  resolvedSlug,
  siteName,
  siteSlug,
  accentColor,
  siteAccent,
  siteBackground,
  initialDisplayMode = "full-landing",
  allTools,
  onSelectTool,
}: {
  tool: WebsiteToolSpec;
  resolvedSlug: string;
  siteName: string;
  siteSlug?: string;
  accentColor: string;
  siteAccent?: string;
  siteBackground?: string;
  initialDisplayMode?: "full-landing" | "workspace-only";
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(960);
  const [displayMode, setDisplayMode] = useState<"full-landing" | "workspace-only">(
    initialDisplayMode,
  );

  const effectiveAccent = useMemo(() => {
    if (tool.toolAccentHex && /^#[0-9a-f]{3,8}$/i.test(tool.toolAccentHex.trim())) {
      return tool.toolAccentHex.trim();
    }
    if (siteAccent && SITE_ACCENT_HEX_MAP[siteAccent]) {
      return SITE_ACCENT_HEX_MAP[siteAccent];
    }
    return accentColor || "#38bdf8";
  }, [tool.toolAccentHex, siteAccent, accentColor]);

  const effectiveThemeMode: "dark" | "light" = useMemo(() => {
    if (tool.toolThemeMode === "dark" || tool.toolThemeMode === "light") {
      return tool.toolThemeMode;
    }
    if (siteBackground && LIGHT_BACKGROUNDS.has(siteBackground)) {
      return "light";
    }
    return "dark";
  }, [tool.toolThemeMode, siteBackground]);

  const measureIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.documentElement) return;
      const mainHeight = doc.querySelector("main")?.scrollHeight ?? 0;
      const bodyHeight = doc.body?.scrollHeight ?? 0;
      const docHeight = doc.documentElement.scrollHeight ?? 0;
      const nextHeight = Math.max(mainHeight, bodyHeight, docHeight, 720);
      setIframeHeight((prev) => (Math.abs(prev - nextHeight) > 4 ? nextHeight + 8 : prev));
    } catch {
      // Cross-origin safety guard
    }
  }, []);

  const syncCustomizations = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;
      applyTransferredToolCustomizations({
        doc,
        tool,
        resolvedSlug,
        siteName,
        siteSlug,
        effectiveAccent,
        effectiveThemeMode,
        displayMode,
      });
      measureIframeHeight();
    } catch {
      // Cross-origin safety guard
    }
  }, [
    tool,
    resolvedSlug,
    siteName,
    siteSlug,
    effectiveAccent,
    effectiveThemeMode,
    displayMode,
    measureIframeHeight,
  ]);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeHeight(960);
  }, [resolvedSlug]);

  useEffect(() => {
    if (!iframeLoaded) return;
    syncCustomizations();
    const t1 = window.setTimeout(syncCustomizations, 180);
    const t2 = window.setTimeout(syncCustomizations, 550);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [iframeLoaded, syncCustomizations]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeLoaded) return;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let rafId = 0;

    const scheduleMeasure = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(measureIframeHeight);
    };

    try {
      const doc = iframe.contentDocument;
      if (doc) {
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(scheduleMeasure);
          resizeObserver.observe(doc.documentElement);
          if (doc.body) resizeObserver.observe(doc.body);
        }
        if (typeof MutationObserver !== "undefined" && doc.body) {
          mutationObserver = new MutationObserver(() => {
            scheduleMeasure();
          });
          mutationObserver.observe(doc.body, {
            childList: true,
            subtree: true,
          });
        }
      }
    } catch {
      // Safe fallback
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [iframeLoaded, measureIframeHeight]);

  const cleanBrand = siteName.split(/[—·|]/)[0]?.trim() || "AI Tools Hub";
  const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(
    /^\/+|\/+$/g,
    "",
  );
  const targetSlug = tool.caseStudySlug || resolvedSlug;

  return (
    <div
      id="tool-workspace"
      className="interactive-tool-runner transferred-tool-landing"
      style={{
        background: "#050b18",
        border: `1px solid ${hexToRgba(effectiveAccent, 0.42)}`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.52)",
        color: "#f8fafc",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(9, 17, 34, 0.96)",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: hexToRgba(effectiveAccent, 0.16),
              border: `1px solid ${hexToRgba(effectiveAccent, 0.42)}`,
              color: "#e2e8f0",
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            <Layers size={12} color={effectiveAccent} /> LIVE TRANSFERRED LANDING PAGE
          </span>
          <code
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              background: "rgba(255,255,255,0.05)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            /p/{slugPart}/projects/{targetSlug}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() =>
              setDisplayMode((prev) => (prev === "full-landing" ? "workspace-only" : "full-landing"))
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(15, 23, 42, 0.85)",
              color: "#cbd5e1",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {displayMode === "full-landing" ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            {displayMode === "full-landing" ? "Full Page View" : "Tool Workspace Only"}
          </button>
          <a
            href={`/tools/${resolvedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: `1px solid ${hexToRgba(effectiveAccent, 0.35)}`,
              background: hexToRgba(effectiveAccent, 0.12),
              color: "#f8fafc",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={12} /> Open Source Page
          </a>
        </div>
      </div>

      {allTools && allTools.length > 1 && onSelectTool && (
        <div
          style={{
            padding: "9px 16px",
            background: "rgba(6, 11, 23, 0.94)",
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
                  padding: "5px 12px",
                  borderRadius: "999px",
                  border: active
                    ? `1px solid ${effectiveAccent}`
                    : "1px solid rgba(148, 163, 184, 0.22)",
                  background: active ? hexToRgba(effectiveAccent, 0.2) : "rgba(15, 23, 42, 0.72)",
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

      <div style={{ position: "relative", width: "100%", minHeight: "720px", background: effectiveThemeMode === "dark" ? "#070d19" : "#f8fafc" }}>
        {!iframeLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "grid",
              placeItems: "center",
              background: "rgba(5, 11, 24, 0.92)",
              color: "#cbd5e1",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={16} color={effectiveAccent} className="animate-spin" />
              Loading live landing page from /tools/{resolvedSlug}…
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={resolvedSlug}
          src={`/tools/${resolvedSlug}?embed=1`}
          title={`${tool.title} — Transferred Tool Landing Page`}
          onLoad={() => {
            setIframeLoaded(true);
            syncCustomizations();
            window.setTimeout(syncCustomizations, 200);
          }}
          style={{
            width: "100%",
            height: `${iframeHeight}px`,
            border: 0,
            display: "block",
            overflow: "hidden",
            opacity: iframeLoaded ? 1 : 0,
            transition: "opacity 180ms ease",
          }}
        />
      </div>
    </div>
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
        accentColor={props.accentColor || "#22d3ee"}
        siteAccent={props.siteAccent}
        siteBackground={props.siteBackground}
        initialDisplayMode={props.displayMode ?? "full-landing"}
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
