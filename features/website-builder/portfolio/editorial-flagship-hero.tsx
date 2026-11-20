"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Layers3,
  Newspaper,
  Palette,
  Rocket,
  Search,
  Sparkles,
  UserCheck,
  Wrench,
} from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { isBlogFirstTemplate } from "@/features/website-builder/domain/template-contracts";
import {
  InteractiveWebsiteToolRunner,
  resolveToolVisualPalette,
} from "@/features/website-builder/tools/InteractiveWebsiteToolRunner";
import { ToolPageCanvasEditor } from "@/features/website-builder/studio/tool-page-canvas-editor";
import type { ToolPageField } from "@/features/website-builder/domain/tool-page-properties";
import { getMultiWebsiteSignatureContract } from "@/features/website-builder/domain/multi-website-signature-templates";
import { MultiWebsiteSignatureHero } from "./MultiWebsiteSignatureHero";
import { getSingleWebsiteSignatureContract } from "@/features/website-builder/domain/single-website-signature-templates";
import { SingleWebsiteSignatureHero } from "./SingleWebsiteSignatureHero";

const FLAGSHIP_TEMPLATE_IDS = new Set([
  "doitwithai-flagship",
  "authority-niche-blog",
  "creator-newsletter-hub",
  "founder-authority-brand",
  "consultant-lead-engine",
  "micro-saas-launchpad",
  "startup-service-agency",
  "swiss-editorial-directory",
  "warm-architectural-studio",
  "crisp-saas-utility-hub",
  "modern-boutique-commerce",
  "trusted-local-service-pro",
  "editorial-magazine-journal",
  "minimalist-founder-monograph",
  "technical-newsletter-docs",
  "creator-lead-magnet-hub",
  "agency-flagship-showcase",
]);

export function isEditorialFlagshipTemplate(id: string): boolean {
  return FLAGSHIP_TEMPLATE_IDS.has(id);
}

export const TEMPLATE_META: Record<
  string,
  {
    kicker: string;
    primaryLabel: string;
    secondaryLabel: string;
    badge: string;
    accentColor: string;
    surfaceBg: string;
    cardBg: string;
    borderColor: string;
    isLight?: boolean;
  }
> = {
  "doitwithai-flagship": {
    kicker: "DOITWITHAI MULTI-TOOL DIRECTORY · 6 LIVE AI TOOLS + 5 PILLAR GUIDES",
    primaryLabel: "Explore 6 Live AI Tools & Guides",
    secondaryLabel: "Connect with Founder",
    badge: "Multi-Tool Directory & Publication",
    accentColor: "#2563eb",
    surfaceBg: "linear-gradient(145deg, #060a16 0%, #0b1329 55%, #080d1d 100%)",
    cardBg: "rgba(15, 23, 42, 0.9)",
    borderColor: "rgba(148, 163, 184, 0.22)",
  },
  "authority-niche-blog": {
    kicker: "CLASSIC BLOGGER & AUTHORITY MAGAZINE · 2-COLUMN EDITION",
    primaryLabel: "Read Latest Articles",
    secondaryLabel: "Subscribe to Updates",
    badge: "Classic Blog + Sticky Sidebar",
    accentColor: "#2563eb",
    surfaceBg: "#f8fafc",
    cardBg: "#ffffff",
    borderColor: "rgba(15, 23, 42, 0.12)",
    isLight: true,
  },
  "creator-newsletter-hub": {
    kicker: "CREATOR DISPATCH · SUBSTACK-STYLE NEWSLETTER & ESSAYS",
    primaryLabel: "Browse Issue Archive",
    secondaryLabel: "Sponsor an Issue",
    badge: "Reader-First Newsletter Hub",
    accentColor: "#be123c",
    surfaceBg: "linear-gradient(160deg, #12081c 0%, #1b0d29 100%)",
    cardBg: "rgba(30, 16, 46, 0.86)",
    borderColor: "rgba(251, 113, 133, 0.26)",
  },
  "founder-authority-brand": {
    kicker: "CREATOR & FOUNDER HUB · SUPPORT, SHOP & BLOG",
    primaryLabel: "Support & Explore Creations",
    secondaryLabel: "Book a 1:1 Session",
    badge: "Creator & Brand Studio",
    accentColor: "#6d28d9",
    surfaceBg: "linear-gradient(155deg, #090d1f 0%, #141936 100%)",
    cardBg: "rgba(22, 28, 58, 0.86)",
    borderColor: "rgba(167, 139, 250, 0.3)",
  },
  "consultant-lead-engine": {
    kicker: "STRATEGIC ADVISORY & ROI ENGINE",
    primaryLabel: "Review Client Case Studies",
    secondaryLabel: "Request Strategy Audit",
    badge: "B2B Advisory Funnel",
    accentColor: "#0284c7",
    surfaceBg: "linear-gradient(155deg, #050914 0%, #0d162a 100%)",
    cardBg: "rgba(15, 23, 42, 0.88)",
    borderColor: "rgba(56, 189, 248, 0.28)",
  },
  "micro-saas-launchpad": {
    kicker: "SINGLE-TOOL AI WEBSITE · INTERACTIVE STUDIO + 5 BLOG GUIDES",
    primaryLabel: "Try Live Tool",
    secondaryLabel: "Read 5 SEO Guides",
    badge: "Single-Tool Flagship Website",
    accentColor: "#2563eb",
    surfaceBg: "linear-gradient(150deg, #040914 0%, #0a192f 100%)",
    cardBg: "rgba(12, 26, 48, 0.88)",
    borderColor: "rgba(56, 189, 248, 0.24)",
  },
  "startup-service-agency": {
    kicker: "DIGITAL SERVICE STUDIO · PACKAGES, PROOF & SEO HUB",
    primaryLabel: "View Service Packages",
    secondaryLabel: "Scope Your Project",
    badge: "Agency & Small Business Funnel",
    accentColor: "#047857",
    surfaceBg: "linear-gradient(155deg, #060c09 0%, #0f1c14 100%)",
    cardBg: "rgba(16, 30, 22, 0.88)",
    borderColor: "rgba(52, 211, 153, 0.26)",
  },
};

export function estimateReadingMinutes(post: {
  blocks: Array<{ text?: string; items: string[] }>;
}): number {
  const words = post.blocks.reduce(
    (sum, b) =>
      sum +
      (b.text ? b.text.split(/\s+/).length : 0) +
      b.items.reduce((acc, item) => acc + item.split(/\s+/).length, 0),
    0,
  );
  return Math.max(2, Math.round(words / 180));
}

const ACCENT_PALETTE: Record<string, { primary: string; secondary: string; softBg: string; border: string; buttonBg: string; buttonFg: string }> = {
  cyan: { primary: "#0284c7", secondary: "#0369a1", softBg: "rgba(2, 132, 199, 0.14)", border: "rgba(56, 189, 248, 0.32)", buttonBg: "#0284c7", buttonFg: "#ffffff" },
  indigo: { primary: "#2563eb", secondary: "#1d4ed8", softBg: "rgba(37, 99, 235, 0.15)", border: "rgba(96, 165, 250, 0.32)", buttonBg: "#2563eb", buttonFg: "#ffffff" },
  violet: { primary: "#6d28d9", secondary: "#5b21b6", softBg: "rgba(109, 40, 217, 0.15)", border: "rgba(167, 139, 250, 0.32)", buttonBg: "#6d28d9", buttonFg: "#ffffff" },
  coral: { primary: "#c2410c", secondary: "#9a3412", softBg: "rgba(194, 65, 12, 0.15)", border: "rgba(251, 146, 60, 0.32)", buttonBg: "#c2410c", buttonFg: "#ffffff" },
  lime: { primary: "#047857", secondary: "#065f46", softBg: "rgba(4, 120, 87, 0.15)", border: "rgba(52, 211, 153, 0.32)", buttonBg: "#047857", buttonFg: "#ffffff" },
  rose: { primary: "#be123c", secondary: "#9f1239", softBg: "rgba(190, 18, 60, 0.15)", border: "rgba(251, 113, 133, 0.32)", buttonBg: "#be123c", buttonFg: "#ffffff" },
  blue: { primary: "#1d4ed8", secondary: "#1e40af", softBg: "rgba(29, 78, 216, 0.15)", border: "rgba(96, 165, 250, 0.32)", buttonBg: "#1d4ed8", buttonFg: "#ffffff" },
  olive: { primary: "#047857", secondary: "#065f46", softBg: "rgba(4, 120, 87, 0.15)", border: "rgba(52, 211, 153, 0.32)", buttonBg: "#047857", buttonFg: "#ffffff" },
};

const BG_SURFACE: Record<string, { heroBg: string; cardBg: string; textMain: string; textSub: string; isLight: boolean }> = {
  midnight: {
    heroBg: "radial-gradient(circle at 16% 16%, rgba(99, 102, 241, 0.22), transparent 46%), radial-gradient(circle at 84% 18%, rgba(34, 211, 238, 0.16), transparent 44%), linear-gradient(180deg, #050914 0%, #0b1329 100%)",
    cardBg: "rgba(15, 23, 42, 0.84)",
    textMain: "#f8fafc",
    textSub: "#cbd5e1",
    isLight: false,
  },
  obsidian: {
    heroBg: "radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.18), transparent 45%), linear-gradient(180deg, #06080f 0%, #0d1322 100%)",
    cardBg: "rgba(13, 19, 34, 0.88)",
    textMain: "#f8fafc",
    textSub: "#cbd5e1",
    isLight: false,
  },
  slate: {
    heroBg: "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.2), transparent 48%), linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    cardBg: "rgba(15, 23, 42, 0.82)",
    textMain: "#f8fafc",
    textSub: "#cbd5e1",
    isLight: false,
  },
  forest: {
    heroBg: "radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.2), transparent 48%), linear-gradient(180deg, #04130e 0%, #092219 100%)",
    cardBg: "rgba(8, 28, 21, 0.86)",
    textMain: "#f8fafc",
    textSub: "#d1fae5",
    isLight: false,
  },
  ember: {
    heroBg: "radial-gradient(circle at 20% 20%, rgba(244, 63, 94, 0.18), transparent 48%), linear-gradient(180deg, #16070b 0%, #240c14 100%)",
    cardBg: "rgba(31, 11, 18, 0.86)",
    textMain: "#f8fafc",
    textSub: "#ffe4e6",
    isLight: false,
  },
  linen: {
    heroBg: "radial-gradient(circle at 18% 18%, rgba(99, 102, 241, 0.1), transparent 45%), linear-gradient(180deg, #faf8f5 0%, #f1ede4 100%)",
    cardBg: "rgba(255, 255, 255, 0.94)",
    textMain: "#0f172a",
    textSub: "#334155",
    isLight: true,
  },
  alabaster: {
    heroBg: "radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.12), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
    cardBg: "rgba(255, 255, 255, 0.95)",
    textMain: "#0f172a",
    textSub: "#334155",
    isLight: true,
  },
  sage: {
    heroBg: "radial-gradient(circle at 18% 18%, rgba(16, 185, 129, 0.12), transparent 45%), linear-gradient(180deg, #f4f7f4 0%, #e7efe8 100%)",
    cardBg: "rgba(255, 255, 255, 0.94)",
    textMain: "#0f172a",
    textSub: "#334155",
    isLight: true,
  },
};

export function EditorialFlagshipHero({
  document,
  publicBasePath,
  navigate,
  onOpenPost,
  onOpenTool,
  onOpenToolsIndex,
  onSelectToolProperty,
}: {
  document: SiteDocument;
  publicBasePath?: string;
  navigate?: (section: "projects" | "contact" | "blog") => void;
  onOpenPost?: (id: string) => void;
  onOpenTool?: (id: string) => void;
  onOpenToolsIndex?: () => void;
  onSelectToolProperty?: (toolId: string, property: ToolPageField) => void;
}) {
  const template = document.design.template;
  const accentTheme = ACCENT_PALETTE[document.design.accent] ?? ACCENT_PALETTE.indigo;
  const bgTheme = BG_SURFACE[document.design.background] ?? BG_SURFACE.midnight;
  const Title = publicBasePath ? "h1" : "h2";

  const [dirSearch, setDirSearch] = useState("");
  const [dirCategory, setDirCategory] = useState("all");

  const posts = useMemo(
    () =>
      document.publishing.posts
        .filter((post) => !publicBasePath || post.status === "published")
        .slice(0, 5),
    [document.publishing.posts, publicBasePath],
  );

  const tools = document.content.projects;
  const primaryTool = tools[0];

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const t of tools) {
      if (t.role) s.add(t.role);
      for (const tech of t.technologies.slice(0, 2)) s.add(tech);
    }
    return ["all", ...Array.from(s).slice(0, 7)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    const q = dirSearch.trim().toLowerCase();
    return tools.filter((t) => {
      const matchesQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.technologies.some((tag) => tag.toLowerCase().includes(q));
      const matchesCat =
        dirCategory === "all" ||
        t.role === dirCategory ||
        t.technologies.includes(dirCategory);
      return matchesQ && matchesCat;
    });
  }, [tools, dirSearch, dirCategory]);

  // 0. PHASE 4 SIGNATURE MULTI-WEBSITE TEMPLATES (5 DISTINCT ARCHITECTURAL SYSTEMS)
  const signatureContract = getMultiWebsiteSignatureContract(template);
  if (signatureContract) {
    return (
      <MultiWebsiteSignatureHero
        document={document}
        contract={signatureContract}
        publicBasePath={publicBasePath}
        navigate={navigate}
        onOpenTool={onOpenTool}
        onOpenPost={onOpenPost}
      />
    );
  }

  // 0b. PHASE 5 SIGNATURE SINGLE-WEBSITE TEMPLATES (BLOGGING, BRANDING & SOLO-TOOL FUNNELS)
  const singleSignatureContract = getSingleWebsiteSignatureContract(template);
  if (singleSignatureContract) {
    return (
      <SingleWebsiteSignatureHero
        document={document}
        contract={singleSignatureContract}
        publicBasePath={publicBasePath}
        navigate={navigate}
        onOpenTool={onOpenTool}
        onOpenPost={onOpenPost}
      />
    );
  }

  // 1. SINGLE-TOOL FLAGSHIP WEBSITE (micro-saas-launchpad)
  if (template === "micro-saas-launchpad") {
    const toolPalette = primaryTool
      ? resolveToolVisualPalette(primaryTool, document.design.accent, document.design.background)
      : {
          accentHex: accentTheme.primary,
          secondaryAccentHex: accentTheme.secondary,
          backgroundHex: "#060b16",
          surfaceColor: bgTheme.cardBg,
          heroGradient: bgTheme.heroBg,
          textPrimary: bgTheme.textMain,
          textSecondary: bgTheme.textSub,
          isLight: bgTheme.isLight,
        };

    return (
      <section
        className="flagship-custom-hero flagship-single-tool-hero"
        id="hero"
        style={{
          background: toolPalette.heroGradient,
          borderBottom: `1px solid ${toolPalette.accentHex}33`,
          padding: "clamp(24px, 4vw, 48px) clamp(16px, 3.5vw, 40px)",
          color: toolPalette.textPrimary,
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "grid", gap: "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "999px",
                    background: `${toolPalette.accentHex}20`,
                    border: `1px solid ${toolPalette.accentHex}50`,
                    color: toolPalette.accentHex,
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <Rocket size={13} /> {primaryTool?.role || document.identity.availability || "SINGLE-TOOL AI SAAS LAUNCHPAD"}
                </span>
                {primaryTool && !publicBasePath && onOpenTool && (
                  <button
                    type="button"
                    onClick={() => onOpenTool(primaryTool.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 11px",
                      borderRadius: "999px",
                      border: `1px solid ${toolPalette.secondaryAccentHex}66`,
                      background: "rgba(15, 23, 42, 0.65)",
                      color: "#e2e8f0",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Palette size={12} /> Customize Full Tool Page in Studio →
                  </button>
                )}
              </div>

              <Title
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 4.2vw, 50px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                  color: toolPalette.textPrimary,
                  overflowWrap: "anywhere",
                }}
              >
                {document.identity.name}
              </Title>

              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(16px, 2vw, 21px)",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${toolPalette.accentHex}, ${toolPalette.secondaryAccentHex})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {document.identity.role}
              </p>

              <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.68, color: toolPalette.textSecondary, maxWidth: "64ch" }}>
                {document.identity.intro}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingTop: "4px" }}>
                <a
                  href="#tool-workspace"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${toolPalette.accentHex}, ${toolPalette.secondaryAccentHex})`,
                    color: "#04101c",
                    fontSize: "14px",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  {primaryTool?.customCtaLabel || `Launch ${primaryTool?.title || "AI Tool"}`} <ArrowUpRight size={16} />
                </a>
                {primaryTool && publicBasePath ? (
                  <a
                    href={`${publicBasePath}/projects/${primaryTool.caseStudySlug || primaryTool.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "12px 18px",
                      borderRadius: "12px",
                      border: `1px solid ${toolPalette.accentHex}55`,
                      background: toolPalette.surfaceColor,
                      color: toolPalette.textPrimary,
                      fontSize: "13.5px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Open Standalone Tool URL <ArrowUpRight size={15} />
                  </a>
                ) : primaryTool && onOpenTool ? (
                  <button
                    type="button"
                    onClick={() => onOpenTool(primaryTool.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "12px 18px",
                      borderRadius: "12px",
                      border: `1px solid ${toolPalette.accentHex}55`,
                      background: toolPalette.surfaceColor,
                      color: toolPalette.textPrimary,
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Focused Landing Page Editor →
                  </button>
                ) : null}
              </div>

              {primaryTool && primaryTool.technologies.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", paddingTop: "4px" }}>
                  {primaryTool.technologies.map((badge) => (
                    <span
                      key={badge}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: "rgba(15, 23, 42, 0.5)",
                        border: "1px solid rgba(148, 163, 184, 0.24)",
                        color: toolPalette.textSecondary,
                        fontSize: "11.5px",
                        fontWeight: 600,
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {primaryTool && (
              <div
                style={{
                  background: toolPalette.surfaceColor,
                  border: `1px solid ${toolPalette.accentHex}44`,
                  borderRadius: "20px",
                  padding: "22px",
                  display: "grid",
                  gap: "14px",
                  boxShadow: "0 22px 50px rgba(2, 6, 23, 0.38)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", color: toolPalette.accentHex, textTransform: "uppercase" }}>
                    {primaryTool.period || "WHAT YOU GET ON EVERY RUN"}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: `${toolPalette.accentHex}22`,
                      color: toolPalette.accentHex,
                      fontWeight: 700,
                    }}
                  >
                    Live Interactive Engine
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", color: toolPalette.textPrimary }}>{primaryTool.title}</h3>
                <p style={{ margin: 0, fontSize: "13.5px", color: toolPalette.textSecondary, lineHeight: 1.6 }}>
                  {primaryTool.summary}
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "8px" }}>
                  {(primaryTool.heroHighlights?.length
                    ? primaryTool.heroHighlights
                    : [
                        "Instant deterministic + AI-assisted analysis with zero signup friction",
                        "Copy-ready outputs, structured diagnostics, and actionable benchmarks",
                        "Fully customizable labels, theme colors, gradients, and FAQs in Studio",
                      ]
                  ).map((bullet, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: toolPalette.textPrimary }}>
                      <CheckCircle2 size={15} style={{ color: toolPalette.accentHex, flexShrink: 0, marginTop: "2px" }} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {primaryTool && (
            <div id="tool-workspace" style={{ paddingTop: "8px" }}>
              {onSelectToolProperty && !publicBasePath ? (
                <ToolPageCanvasEditor
                  tool={primaryTool}
                  onSelectProperty={(property) => onSelectToolProperty(primaryTool.id, property)}
                >
                  <InteractiveWebsiteToolRunner
                    tool={primaryTool}
                    siteName={document.identity.name}
                    siteSlug={document.projectId}
                    siteAccent={document.design.accent}
                    siteBackground={document.design.background}
                  />
                </ToolPageCanvasEditor>
              ) : (
                <InteractiveWebsiteToolRunner
                  tool={primaryTool}
                  siteName={document.identity.name}
                  siteSlug={publicBasePath ? publicBasePath.replace(/^\/p\//, "") : document.projectId}
                  publicBasePath={publicBasePath}
                  siteAccent={document.design.accent}
                  siteBackground={document.design.background}
                />
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // 2. MULTI-TOOL FLAGSHIP DIRECTORY & PUBLICATION (doitwithai-flagship)
  if (template === "doitwithai-flagship") {
    return (
      <section
        className="flagship-custom-hero flagship-multi-tool-hero"
        id="hero"
        style={{
          background: bgTheme.heroBg,
          borderBottom: `1px solid ${accentTheme.border}`,
          padding: "clamp(24px, 4.5vw, 52px) clamp(16px, 3.5vw, 40px)",
          color: bgTheme.textMain,
        }}
      >
        <div style={{ maxWidth: "1260px", margin: "0 auto", display: "grid", gap: "28px" }}>
          <div style={{ display: "grid", gap: "14px", textAlign: document.design.heroAlignment === "left" ? "left" : "center", justifyItems: document.design.heroAlignment === "left" ? "start" : "center" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: accentTheme.softBg,
                  border: `1px solid ${accentTheme.border}`,
                  color: accentTheme.primary,
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                <Sparkles size={13} /> MULTI-TOOL DIRECTORY &amp; PUBLICATION · {tools.length} LIVE TOOLS &amp; {posts.length} GUIDES
              </span>
              {publicBasePath ? (
                <a
                  href={`${publicBasePath}/projects`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 13px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.14)",
                    border: "1px solid rgba(16, 185, 129, 0.38)",
                    color: "#34d399",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Browse Full Tools Directory ({tools.length}) →
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => (onOpenToolsIndex ? onOpenToolsIndex() : navigate?.("projects"))}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 13px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.14)",
                    border: "1px solid rgba(16, 185, 129, 0.38)",
                    color: "#34d399",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Open All {tools.length} Tools Directory Preview →
                </button>
              )}
            </div>

            <Title
              style={{
                margin: 0,
                fontSize: "clamp(30px, 4.8vw, 56px)",
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: bgTheme.textMain,
                maxWidth: "22ch",
                overflowWrap: "anywhere",
              }}
            >
              {document.identity.name}
            </Title>

            <p
              style={{
                margin: 0,
                fontSize: "clamp(16px, 2.1vw, 22px)",
                fontWeight: 800,
                background: `linear-gradient(135deg, ${accentTheme.primary}, ${accentTheme.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                maxWidth: "56ch",
              }}
            >
              {document.identity.role}
            </p>

            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: bgTheme.textSub, maxWidth: "68ch" }}>
              {document.identity.intro}
            </p>
          </div>

          <div
            style={{
              background: bgTheme.cardBg,
              border: `1px solid ${accentTheme.border}`,
              borderRadius: "16px",
              padding: "14px 16px",
              display: "grid",
              gap: "12px",
              boxShadow: "0 18px 42px rgba(2, 6, 23, 0.28)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="search"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder={`Search ${tools.length} interactive AI tools by name, workflow, or tag...`}
                  aria-label="Filter installed AI tools"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "11px",
                    border: `1px solid ${accentTheme.border}`,
                    background: bgTheme.isLight ? "#ffffff" : "rgba(9, 14, 28, 0.85)",
                    color: bgTheme.textMain,
                    fontSize: "13.5px",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDirCategory(cat)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "999px",
                      border: dirCategory === cat ? `1px solid ${accentTheme.primary}` : "1px solid rgba(148, 163, 184, 0.25)",
                      background: dirCategory === cat ? accentTheme.softBg : "transparent",
                      color: dirCategory === cat ? accentTheme.primary : bgTheme.textSub,
                      fontSize: "11.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {cat === "all" ? `All Tools (${tools.length})` : cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredTools.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px dashed rgba(148, 163, 184, 0.35)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "13.5px", color: bgTheme.textSub }}>
                  No tools matched “{dirSearch.trim()}” in {dirCategory === "all" ? "all categories" : dirCategory}.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDirSearch("");
                    setDirCategory("all");
                  }}
                  style={{
                    padding: "7px 13px",
                    borderRadius: "8px",
                    border: `1px solid ${accentTheme.primary}`,
                    background: accentTheme.softBg,
                    color: accentTheme.primary,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
                  gap: "14px",
                }}
              >
                {filteredTools.map((tool, index) => {
                  const toolSlug = tool.caseStudySlug || tool.id;
                  const cleanRole = (tool.role || "INTERACTIVE UTILITY")
                    .replace(/^TOOL\s*\d+\s*[·•-]\s*/i, "")
                    .trim()
                    .toUpperCase();
                  const cardSurface = bgTheme.isLight ? "#ffffff" : "rgba(15, 23, 42, 0.9)";
                  const cardBorder = bgTheme.isLight ? "#e2e8f0" : "rgba(148, 163, 184, 0.22)";
                  const badgeBg = bgTheme.isLight ? "#f1f5f9" : "rgba(30, 41, 59, 0.78)";
                  const badgeBorder = bgTheme.isLight ? "#cbd5e1" : "rgba(148, 163, 184, 0.24)";
                  return (
                    <div
                      key={tool.id}
                      style={{
                        background: cardSurface,
                        border: `1px solid ${cardBorder}`,
                        borderRadius: "12px",
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 800, color: bgTheme.isLight ? accentTheme.primary : "#60a5fa", letterSpacing: "0.08em" }}>
                          TOOL {String(index + 1).padStart(2, "0")} · {cleanRole}
                        </span>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "999px",
                            background: accentTheme.primary,
                            flexShrink: 0,
                          }}
                          title="Live interactive tool"
                        />
                      </div>
                      <h3 style={{ margin: 0, fontSize: "16.5px", fontWeight: 700, lineHeight: 1.32, color: bgTheme.textMain }}>
                        {tool.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.58, color: bgTheme.textSub }}>
                        {tool.summary.slice(0, 130)}
                        {tool.summary.length > 130 ? "…" : ""}
                      </p>
                      {tool.technologies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {tool.technologies.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: badgeBg,
                                border: `1px solid ${badgeBorder}`,
                                color: bgTheme.textSub,
                                fontWeight: 600,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                        {publicBasePath ? (
                          <a
                            href={`${publicBasePath}/projects/${toolSlug}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: "6px",
                              padding: "9px 13px",
                              borderRadius: "8px",
                              background: accentTheme.buttonBg,
                              fontSize: "12.5px",
                              fontWeight: 700,
                              color: accentTheme.buttonFg,
                              textDecoration: "none",
                            }}
                          >
                            <span>Open {tool.title}</span>
                            <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenTool) onOpenTool(tool.id);
                              else navigate?.("projects");
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: "6px",
                              background: accentTheme.buttonBg,
                              border: 0,
                              borderRadius: "8px",
                              padding: "9px 13px",
                              fontSize: "12.5px",
                              fontWeight: 700,
                              color: accentTheme.buttonFg,
                              cursor: "pointer",
                            }}
                          >
                            <span>Customize {tool.title}</span>
                            <Wrench size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 3. REMAINING 5 EDITORIAL FLAGSHIP TEMPLATES
  const blogFirst = isBlogFirstTemplate(template);
  const featuredPost = posts[0];
  const featuredCover = featuredPost
    ? document.media.assets.find((asset) => asset.id === featuredPost.coverMediaId)
    : undefined;

  return (
    <section
      className={`portfolio-hero flagship-hero flagship-${template} align-${document.design.heroAlignment}`}
      id="hero"
      style={{
        background: bgTheme.heroBg,
        borderBottom: `1px solid ${accentTheme.border}`,
      }}
    >
      <div className="ambient-grid" />
      <div className="portfolio-copy flagship-copy">
        <div className="flagship-meta-row">
          <p className="availability">
            <i />
            {document.identity.availability}
          </p>
          <span className="flagship-badge" style={{ borderColor: accentTheme.border, color: accentTheme.primary }}>
            {template === "authority-niche-blog" ? <BookOpen size={15} /> : template === "creator-newsletter-hub" ? <Newspaper size={15} /> : template === "founder-authority-brand" ? <UserCheck size={15} /> : template === "consultant-lead-engine" ? <Compass size={15} /> : <Layers3 size={15} />}
            {document.content.contact.location || "Editorial & Brand Hub"}
          </span>
        </div>
        <Title style={{ color: bgTheme.textMain }}>{document.identity.name}</Title>
        <h3 style={{ color: accentTheme.primary }}>{document.identity.role}</h3>
        <p className="intro" style={{ color: bgTheme.textSub }}>{document.identity.intro}</p>
        <div className="hero-actions">
          <button
            type="button"
            onClick={() => navigate?.(blogFirst ? "blog" : "projects")}
            style={{
              background: `linear-gradient(135deg, ${accentTheme.primary}, ${accentTheme.secondary})`,
              color: "#04101c",
              fontWeight: 800,
            }}
          >
            {blogFirst ? "Explore latest writing" : "Explore selected work"}
          </button>
          <button type="button" className="ghost" onClick={() => navigate?.("contact")}>
            Start a conversation
          </button>
        </div>
      </div>

      <aside className="flagship-aside">
        {featuredPost ? (
          <article className="flagship-featured-card" style={{ background: bgTheme.cardBg, borderColor: accentTheme.border }}>
            <div className="flagship-card-head">
              <span>FEATURED DISPATCH</span>
              <Sparkles size={15} />
            </div>
            {featuredCover && (
              <div className="flagship-card-image">
                <Image src={featuredCover.url} alt={featuredCover.alt} fill sizes="420px" unoptimized />
              </div>
            )}
            <h4>{featuredPost.title}</h4>
            <p>{featuredPost.excerpt}</p>
            {publicBasePath ? (
              <a className="flagship-card-cta" href={`${publicBasePath}/blog/${featuredPost.slug}`}>
                Read full article <ArrowUpRight size={15} />
              </a>
            ) : (
              <button type="button" className="flagship-card-cta" onClick={() => onOpenPost?.(featuredPost.id)}>
                Preview article <ArrowUpRight size={15} />
              </button>
            )}
          </article>
        ) : (
          <div className="flagship-featured-card flagship-stats-card" style={{ background: bgTheme.cardBg, borderColor: accentTheme.border }}>
            <div className="flagship-card-head">
              <span>PLATFORM OVERVIEW</span>
              <Sparkles size={15} />
            </div>
            <div className="flagship-stat-grid">
              <div>
                <strong>{document.publishing.posts.length}</strong>
                <span>Articles</span>
              </div>
              <div>
                <strong>{document.content.projects.length}</strong>
                <span>Tools &amp; Projects</span>
              </div>
              <div>
                <strong>{document.skills.length}</strong>
                <span>Core areas</span>
              </div>
              <div>
                <strong>{document.publishing.pages.length}</strong>
                <span>Custom pages</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
