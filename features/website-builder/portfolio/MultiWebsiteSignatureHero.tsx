"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import type { MultiWebsiteSignatureContract } from "@/features/website-builder/domain/multi-website-signature-templates";

export function MultiWebsiteSignatureHero({
  document,
  contract,
  publicBasePath,
  navigate,
  onOpenTool,
  onOpenPost,
}: {
  document: SiteDocument;
  contract: MultiWebsiteSignatureContract;
  publicBasePath?: string;
  navigate?: (section: "projects" | "contact" | "blog") => void;
  onOpenTool?: (id: string) => void;
  onOpenPost?: (id: string) => void;
}) {
  const { palette, typography } = contract;
  const tools = document.content.projects;
  const posts = document.publishing.posts
    .filter((post) => !publicBasePath || post.status === "published")
    .slice(0, 4);
  const Title = publicBasePath ? "h1" : "h2";

  function renderToolAction(toolId: string, toolSlug: string, label: string) {
    if (publicBasePath) {
      return (
        <a
          href={`${publicBasePath}/projects/${toolSlug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            width: "100%",
            padding: "9px 13px",
            borderRadius: contract.layoutVariant === "swiss-grid-index" ? "0px" : "8px",
            background: palette.accentHex,
            color: palette.accentFg,
            fontSize: "12.5px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <span>{label}</span>
          <ArrowUpRight size={14} />
        </a>
      );
    }
    return (
      <button
        type="button"
        onClick={() => (onOpenTool ? onOpenTool(toolId) : navigate?.("projects"))}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          width: "100%",
          padding: "9px 13px",
          borderRadius: contract.layoutVariant === "swiss-grid-index" ? "0px" : "8px",
          border: "none",
          background: palette.accentHex,
          color: palette.accentFg,
          fontSize: "12.5px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        <span>{label}</span>
        <Wrench size={13} />
      </button>
    );
  }

  // LAYOUT 1: SWISS EDITORIAL DIRECTORY (Exposed 1.5px ink hairlines, numbered index table, zero rounded boxes)
  if (contract.layoutVariant === "swiss-grid-index") {
    return (
      <section
        id="hero"
        aria-label={contract.name}
        style={{
          background: palette.backgroundHex,
          color: palette.inkPrimary,
          fontFamily: typography.bodyFont,
          borderBottom: `2px solid ${palette.borderHex}`,
          padding: "clamp(28px, 4.5vw, 56px) clamp(18px, 3.5vw, 44px)",
        }}
      >
        <div style={{ maxWidth: "1220px", margin: "0 auto", display: "grid", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderBottom: `2px solid ${palette.borderHex}`,
              paddingBottom: "12px",
              fontFamily: typography.monoFont,
              fontSize: "12px",
            }}
          >
            <strong style={{ color: palette.accentHex, letterSpacing: "0.08em" }}>{contract.eyebrow}</strong>
            <span style={{ color: palette.inkMuted }}>
              INDEXED TOOLS: {tools.length} · EDITORIAL DISPATCHES: {posts.length}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "32px", alignItems: "end" }}>
            <div>
              <Title
                style={{
                  margin: 0,
                  fontFamily: typography.headingFont,
                  fontSize: "clamp(32px, 4.8vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: typography.headingTracking,
                  lineHeight: 1.05,
                  color: palette.inkPrimary,
                }}
              >
                {document.identity.name}
              </Title>
              <p style={{ margin: "12px 0 0", fontSize: "18px", fontWeight: 700, color: palette.accentHex }}>
                {document.identity.role || contract.tagline}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: palette.inkSecondary }}>
              {document.identity.intro}
            </p>
          </div>

          {/* Swiss Hairline Numbered Tool Matrix */}
          <div style={{ borderTop: `2px solid ${palette.borderHex}` }}>
            {tools.map((tool, idx) => {
              const slug = tool.caseStudySlug || tool.id;
              return (
                <div
                  key={tool.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px minmax(0, 1.4fr) minmax(0, 2fr) 210px",
                    gap: "18px",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: `1px solid ${palette.borderHex}`,
                  }}
                >
                  <span style={{ fontFamily: typography.monoFont, fontSize: "13px", fontWeight: 700, color: palette.accentHex }}>
                    /{String(idx + 1).padStart(2, "0")}
                  </span>
                  <strong style={{ fontSize: "16px", color: palette.inkPrimary }}>{tool.title}</strong>
                  <span style={{ fontSize: "13.5px", color: palette.inkSecondary }}>{tool.summary}</span>
                  <div>{renderToolAction(tool.id, slug, "Launch Utility")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // LAYOUTS 2-5: ARCHITECTURAL STUDIO, CRISP SAAS HUB, BOUTIQUE COMMERCE, & TRUSTED LOCAL PRO
  return (
    <section
      id="hero"
      aria-label={contract.name}
      style={{
        background: palette.backgroundHex,
        color: palette.inkPrimary,
        fontFamily: typography.bodyFont,
        borderBottom: `${ palette.ruleWeight } solid ${palette.borderHex}`,
        padding: "clamp(28px, 4.5vw, 56px) clamp(18px, 3.5vw, 44px)",
      }}
    >
      <div style={{ maxWidth: "1220px", margin: "0 auto", display: "grid", gap: "32px" }}>
        {/* Top Trust & Category Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            paddingBottom: "14px",
            borderBottom: `1px solid ${palette.borderHex}`,
          }}
        >
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: palette.accentHex,
              textTransform: "uppercase",
            }}
          >
            {contract.eyebrow}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
            {contract.trustSignals.map((sig) => (
              <span
                key={sig}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: palette.inkSecondary,
                }}
              >
                <CheckCircle2 size={13} style={{ color: palette.accentHex }} /> {sig}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Split */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "14px" }}>
            <Title
              style={{
                margin: 0,
                fontFamily: typography.headingFont,
                fontSize: "clamp(30px, 4.4vw, 52px)",
                fontWeight: 800,
                letterSpacing: typography.headingTracking,
                lineHeight: 1.08,
                color: palette.inkPrimary,
              }}
            >
              {document.identity.name}
            </Title>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: palette.accentHex }}>
              {document.identity.role || contract.tagline}
            </p>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: palette.inkSecondary, maxWidth: "62ch" }}>
              {document.identity.intro}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "6px" }}>
              {contract.defaultNavPages.map((pg) => (
                <span
                  key={pg.slug}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: palette.surfaceTintHex,
                    border: `1px solid ${palette.borderHex}`,
                    color: palette.inkPrimary,
                  }}
                >
                  {pg.navLabel}: {pg.summary}
                </span>
              ))}
            </div>
          </div>

          {/* Right Highlight / Quick Conversion Panel */}
          <aside
            style={{
              background: palette.surfaceHex,
              border: `1.5px solid ${palette.borderHex}`,
              borderRadius: "12px",
              padding: "22px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: typography.monoFont, fontSize: "11px", fontWeight: 700, color: palette.accentHex }}>
                FLAGSHIP INTERACTIVE CONVERTER
              </span>
              <ShieldCheck size={16} style={{ color: palette.accentHex }} />
            </div>
            <h3 style={{ margin: 0, fontFamily: typography.headingFont, fontSize: "20px", color: palette.inkPrimary }}>
              {tools[0]?.title || contract.tagline}
            </h3>
            <p style={{ margin: 0, fontSize: "13.5px", color: palette.inkSecondary, lineHeight: 1.55 }}>
              {tools[0]?.summary || contract.description}
            </p>
            {tools[0] && renderToolAction(tools[0].id, tools[0].caseStudySlug || tools[0].id, `Open ${tools[0].title}`)}
          </aside>
        </div>

        {/* Multi-Tool / Multi-Page Card Grid (Consistent AAA Light Surfaces, Zero Neon Gradients) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
            gap: "18px",
          }}
        >
          {tools.map((tool, index) => {
            const slug = tool.caseStudySlug || tool.id;
            const cleanRole = (tool.role || contract.name)
              .replace(/^TOOL\s*\d+\s*[·•-]\s*/i, "")
              .trim()
              .toUpperCase();
            return (
              <article
                key={tool.id}
                style={{
                  background: palette.surfaceHex,
                  border: `1px solid ${palette.borderHex}`,
                  borderRadius: "10px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <span style={{ fontFamily: typography.monoFont, fontSize: "10.5px", fontWeight: 700, color: palette.accentHex }}>
                  {String(index + 1).padStart(2, "0")} · {cleanRole}
                </span>
                <h3 style={{ margin: 0, fontFamily: typography.headingFont, fontSize: "17px", fontWeight: 700, color: palette.inkPrimary }}>
                  {tool.title}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: palette.inkSecondary, lineHeight: 1.55 }}>
                  {tool.summary}
                </p>
                <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                  {renderToolAction(tool.id, slug, `Open ${tool.title}`)}
                </div>
              </article>
            );
          })}
        </div>

        {/* Editorial Dispatches Strip */}
        {posts.length > 0 && (
          <div style={{ borderTop: `1px solid ${palette.borderHex}`, paddingTop: "20px", display: "grid", gap: "12px" }}>
            <span style={{ fontFamily: typography.monoFont, fontSize: "11px", fontWeight: 700, color: palette.inkMuted, textTransform: "uppercase" }}>
              LATEST EDITORIAL GUIDES &amp; RESEARCH ({posts.length})
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "14px" }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    background: palette.surfaceTintHex,
                    border: `1px solid ${palette.borderHex}`,
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: palette.inkPrimary }}>{post.title}</strong>
                  <p style={{ margin: 0, fontSize: "12.5px", color: palette.inkSecondary }}>
                    {(post.excerpt || "").slice(0, 110)}
                  </p>
                  {publicBasePath ? (
                    <a href={`${publicBasePath}/blog/${post.slug}`} style={{ fontSize: "12px", fontWeight: 700, color: palette.accentHex }}>
                      Read guide →
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenPost?.(post.id)}
                      style={{ justifySelf: "start", background: "transparent", border: 0, padding: 0, fontSize: "12px", fontWeight: 700, color: palette.accentHex, cursor: "pointer" }}
                    >
                      Preview guide →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
