"use client";

import React from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, FileText, Sparkles } from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import type { SingleWebsiteSignatureContract } from "@/features/website-builder/domain/single-website-signature-templates";
import { getMicroToolConfigBySlug } from "@/features/website-builder/tools/microtool-catalog-48";
import { MicroToolThreeEngineRunner } from "@/features/website-builder/tools/MicroToolThreeEngineRunner";

export function SingleWebsiteSignatureHero({
  document,
  contract,
  publicBasePath,
  navigate,
  onOpenTool,
  onOpenPost,
}: {
  document: SiteDocument;
  contract: SingleWebsiteSignatureContract;
  publicBasePath?: string;
  navigate?: (section: "projects" | "contact" | "blog") => void;
  onOpenTool?: (id: string) => void;
  onOpenPost?: (id: string) => void;
}) {
  const { palette, typography } = contract;
  const Title = publicBasePath ? "h1" : "h2";
  const posts = document.publishing.posts
    .filter((post) => !publicBasePath || post.status === "published")
    .slice(0, 6);
  const featuredPost = posts[0];
  const primaryProject = document.content.projects[0];
  const flagshipMicroTool =
    getMicroToolConfigBySlug(primaryProject?.caseStudySlug) ??
    getMicroToolConfigBySlug(contract.flagshipMicroToolSlug);

  // VARIANT 1: BROADSHEET MAGAZINE JOURNAL (Warm newsprint, double-rule masthead, 2-column cover dispatch + archive index)
  if (contract.layoutVariant === "broadsheet-magazine") {
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
        <div style={{ maxWidth: "1160px", margin: "0 auto", display: "grid", gap: "28px" }}>
          <header
            style={{
              borderTop: `2px solid ${palette.borderHex}`,
              borderBottom: `4px double ${palette.borderHex}`,
              padding: "16px 0",
              textAlign: "center",
              display: "grid",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: typography.monoFont, fontSize: "11.5px", color: palette.inkMuted }}>
              <span>{contract.eyebrow}</span>
              <span>ISSUE ARCHIVE · {posts.length} PUBLISHED DISPATCHES</span>
            </div>
            <Title
              style={{
                margin: 0,
                fontFamily: typography.headingFont,
                fontSize: "clamp(34px, 5.2vw, 62px)",
                fontWeight: 800,
                letterSpacing: typography.headingTracking,
                lineHeight: 1.04,
                color: palette.inkPrimary,
              }}
            >
              {document.identity.name}
            </Title>
            <p style={{ margin: 0, fontSize: "16px", color: palette.inkSecondary, maxWidth: "68ch", justifySelf: "center" }}>
              {document.identity.role || contract.tagline} — {document.identity.intro}
            </p>
          </header>

          {/* Broadsheet 2-Column Split: Lead Cover Story + Chronological Dispatch Desk */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "32px", alignItems: "start" }}>
            <article style={{ display: "grid", gap: "12px", paddingRight: "16px", borderRight: `1px solid ${palette.borderHex}` }}>
              <span style={{ fontFamily: typography.monoFont, fontSize: "11px", fontWeight: 700, color: palette.accentHex }}>
                LEAD COVER DISPATCH
              </span>
              <h3 style={{ margin: 0, fontFamily: typography.headingFont, fontSize: "28px", lineHeight: 1.2, color: palette.inkPrimary }}>
                {featuredPost?.title || "How Compounding Topic Clusters Outperform High-Volume Content Farms"}
              </h3>
              <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.68, color: palette.inkSecondary }}>
                {featuredPost?.excerpt || document.identity.intro}
              </p>
              {featuredPost && (
                publicBasePath ? (
                  <a href={`${publicBasePath}/blog/${featuredPost.slug}`} style={{ fontSize: "13.5px", fontWeight: 700, color: palette.accentHex }}>
                    Read Full Cover Essay →
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenPost?.(featuredPost.id)}
                    style={{ justifySelf: "start", background: palette.accentHex, color: palette.accentFg, border: 0, padding: "9px 15px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Read Full Cover Essay →
                  </button>
                )
              )}
            </article>

            <div style={{ display: "grid", gap: "14px" }}>
              <span style={{ fontFamily: typography.monoFont, fontSize: "11px", fontWeight: 700, color: palette.inkMuted }}>
                RECENT EDITORIAL ISSUES ({posts.length})
              </span>
              {posts.slice(1, 5).map((post, i) => (
                <div key={post.id} style={{ paddingBottom: "12px", borderBottom: "1px solid #d1d5db", display: "grid", gap: "4px" }}>
                  <span style={{ fontFamily: typography.monoFont, fontSize: "11px", color: palette.accentHex }}>
                    DISPATCH 0{i + 2}
                  </span>
                  <strong style={{ fontFamily: typography.headingFont, fontSize: "17px", color: palette.inkPrimary }}>
                    {post.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: "13px", color: palette.inkSecondary }}>
                    {(post.excerpt || "").slice(0, 115)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {flagshipMicroTool && (
            <div style={{ paddingTop: "12px" }}>
              <MicroToolThreeEngineRunner
                config={flagshipMicroTool}
                accentHex={palette.accentHex}
                surfaceHex={palette.surfaceHex}
                textPrimary={palette.inkPrimary}
                textSecondary={palette.inkSecondary}
                isLight={true}
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // VARIANT 2 & 3: MINIMALIST FOUNDER MONOGRAPH & TECHNICAL NEWSLETTER / DOCS
  if (contract.layoutVariant === "founder-monograph" || contract.layoutVariant === "developer-handbook") {
    return (
      <section
        id="hero"
        aria-label={contract.name}
        style={{
          background: palette.backgroundHex,
          color: palette.inkPrimary,
          fontFamily: typography.bodyFont,
          borderBottom: `1px solid ${palette.borderHex}`,
          padding: "clamp(32px, 5vw, 64px) clamp(18px, 3.5vw, 44px)",
        }}
      >
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "grid", gap: "28px" }}>
          <div style={{ display: "grid", gap: "12px", borderBottom: `1px solid ${palette.borderHex}`, paddingBottom: "24px" }}>
            <span style={{ fontFamily: typography.monoFont, fontSize: "11.5px", fontWeight: 700, color: palette.accentHex, letterSpacing: "0.08em" }}>
              {contract.eyebrow}
            </span>
            <Title
              style={{
                margin: 0,
                fontFamily: typography.headingFont,
                fontSize: "clamp(30px, 4.4vw, 48px)",
                fontWeight: 800,
                letterSpacing: typography.headingTracking,
                lineHeight: 1.1,
                color: palette.inkPrimary,
              }}
            >
              {document.identity.name}
            </Title>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: palette.accentHex }}>
              {document.identity.role || contract.tagline}
            </p>
            <p style={{ margin: 0, fontSize: "15.5px", lineHeight: 1.7, color: palette.inkSecondary, maxWidth: "66ch" }}>
              {document.identity.intro}
            </p>
          </div>

          {/* Numbered Monograph / RFC Index */}
          <div style={{ display: "grid", gap: "10px" }}>
            <span style={{ fontFamily: typography.monoFont, fontSize: "11.5px", fontWeight: 700, color: palette.inkMuted }}>
              {contract.layoutVariant === "developer-handbook" ? "ARCHITECTURE RFCS & TECHNICAL GUIDES" : "PUBLISHED ESSAYS & OPERATING NOTES"}
            </span>
            {posts.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px minmax(0, 1fr) auto",
                  gap: "16px",
                  alignItems: "baseline",
                  padding: "14px 0",
                  borderBottom: `1px solid ${palette.borderHex}`,
                }}
              >
                <span style={{ fontFamily: typography.monoFont, fontSize: "12px", fontWeight: 700, color: palette.accentHex }}>
                  {contract.layoutVariant === "developer-handbook" ? `RFC-${String(idx + 1).padStart(2, "0")}` : `0${idx + 1}.`}
                </span>
                <div>
                  <strong style={{ fontSize: "16px", color: palette.inkPrimary, display: "block" }}>{post.title}</strong>
                  <span style={{ fontSize: "13.5px", color: palette.inkSecondary }}>{post.excerpt}</span>
                </div>
                {publicBasePath ? (
                  <a href={`${publicBasePath}/blog/${post.slug}`} style={{ fontFamily: typography.monoFont, fontSize: "12px", fontWeight: 700, color: palette.accentHex }}>
                    Read →
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenPost?.(post.id)}
                    style={{ background: "transparent", border: 0, fontFamily: typography.monoFont, fontSize: "12px", fontWeight: 700, color: palette.accentHex, cursor: "pointer" }}
                  >
                    Preview →
                  </button>
                )}
              </div>
            ))}
          </div>

          {flagshipMicroTool && (
            <MicroToolThreeEngineRunner
              config={flagshipMicroTool}
              accentHex={palette.accentHex}
              surfaceHex={palette.surfaceHex}
              textPrimary={palette.inkPrimary}
              textSecondary={palette.inkSecondary}
              isLight={true}
            />
          )}
        </div>
      </section>
    );
  }

  // VARIANT 4 & 5: CREATOR LEAD-MAGNET HUB & AGENCY FLAGSHIP SHOWCASE (Single Flagship Tool Above the Fold + Supporting Proof)
  return (
    <section
      id="hero"
      aria-label={contract.name}
      style={{
        background: palette.backgroundHex,
        color: palette.inkPrimary,
        fontFamily: typography.bodyFont,
        borderBottom: `${palette.ruleWeight} solid ${palette.borderHex}`,
        padding: "clamp(28px, 4.5vw, 56px) clamp(18px, 3.5vw, 44px)",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gap: "28px" }}>
        <div style={{ display: "grid", gap: "12px", maxWidth: "780px" }}>
          <span style={{ fontFamily: typography.monoFont, fontSize: "11.5px", fontWeight: 700, color: palette.accentHex, letterSpacing: "0.08em" }}>
            {contract.eyebrow}
          </span>
          <Title
            style={{
              margin: 0,
              fontFamily: typography.headingFont,
              fontSize: "clamp(30px, 4.5vw, 52px)",
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
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: palette.inkSecondary }}>
            {document.identity.intro}
          </p>
        </div>

        {/* Above-the-Fold Flagship Interactive Calculator or White-Label Audit */}
        {flagshipMicroTool && (
          <MicroToolThreeEngineRunner
            config={flagshipMicroTool}
            accentHex={palette.accentHex}
            surfaceHex={palette.surfaceHex}
            textPrimary={palette.inkPrimary}
            textSecondary={palette.inkSecondary}
            isLight={true}
          />
        )}

        {/* Supporting Editorial Playbooks / Case Studies */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "16px" }}>
          {contract.editorialSections.map((sec) => (
            <div
              key={sec.label}
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: palette.surfaceHex,
                border: `1px solid ${palette.borderHex}`,
                display: "grid",
                gap: "6px",
              }}
            >
              <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14.5px", color: palette.inkPrimary }}>
                <CheckCircle2 size={15} style={{ color: palette.accentHex }} /> {sec.label}
              </strong>
              <p style={{ margin: 0, fontSize: "13px", color: palette.inkSecondary, lineHeight: 1.55 }}>
                {sec.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
