"use client";

import React from "react";
import Link from "next/link";
import type { SiteDocument } from "../domain/site-document";

type BlogPost = SiteDocument["publishing"]["posts"][number];

export interface WriterStudioBridgeCardProps {
  document: SiteDocument;
  post: BlogPost;
  publicSiteSlug?: string;
}

/**
 * Replaces Voxfolio's legacy `blog-writing-assistant.tsx` inside the Website Builder Studio.
 * Enforces strict separation of duties:
 * - The Website Builder Studio handles site layout, templates, 3D/2D scenes, and snapshot publishing.
 * - All blog article drafting, E-E-A-T information-gain research, <25w readability polishing,
 *   SVG infographics, and @graph JSON-LD generation happen exclusively inside the dedicated
 *   AI Content Writer Studio (`/ai-content-writer`) and DoItWithAI backend SEO tools.
 */
export function WriterStudioBridgeCard({
  document,
  post,
  publicSiteSlug,
}: WriterStudioBridgeCardProps) {
  const siteSlug = publicSiteSlug || document.projectId;
  const writerQuery = new URLSearchParams({
    targetSiteId: document.projectId,
    targetSiteName: document.identity.name || "My Website",
    targetSiteSlug: siteSlug,
    postId: post.id,
    title: post.title || "",
    slug: post.slug || "",
  }).toString();

  const publishedSiblingSlugs = document.publishing.posts
    .filter((entry) => entry.id !== post.id && entry.status === "published")
    .map((entry) => `/p/${siteSlug}/blog/${entry.slug}`);

  return (
    <section
      className="writer-studio-bridge-card"
      aria-label="Write and optimize with DoItWithAI Content Writer Studio"
      style={{
        border: "1px solid rgba(99, 102, 241, 0.35)",
        borderRadius: "14px",
        padding: "18px",
        background:
          "linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(9, 13, 28, 0.96))",
        display: "grid",
        gap: "12px",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <div>
          <span
            style={{
              color: "#38bdf8",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            DOITWITHAI CONTENT &amp; SEO ENGINE
          </span>
          <h3 style={{ margin: "4px 0 0", fontSize: "16px", color: "#f8fafc" }}>
            Write &amp; Optimize in AI Content Writer Studio
          </h3>
        </div>
        <span
          style={{
            fontSize: "11px",
            padding: "4px 9px",
            borderRadius: "999px",
            background: post.sourceArticleProjectId
              ? "rgba(16, 185, 129, 0.14)"
              : "rgba(56, 189, 248, 0.12)",
            color: post.sourceArticleProjectId ? "#6ee7b7" : "#7dd3fc",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {post.sourceArticleProjectId ? "Synced with Writer Studio" : "Ready for AI Writer"}
        </span>
      </header>

      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "#94a3b8" }}>
        Blog writing and deep SEO optimization are powered exclusively by our dedicated{" "}
        <strong style={{ color: "#e2e8f0" }}>AI Content Writer Studio</strong> and backend SEO tools.
        Draft your article with 6-dimension Query Fan-Out research, 4-column comparison matrices,
        custom SVG infographics, and full JSON-LD schema—then publish back to this website in 1 click.
      </p>

      {publishedSiblingSlugs.length > 0 && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(56, 189, 248, 0.06)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            fontSize: "12px",
            color: "#cbd5e1",
          }}
        >
          <strong style={{ color: "#38bdf8" }}>
            Topic Cluster Internal Linking Active ({publishedSiblingSlugs.length} live posts):
          </strong>{" "}
          The AI Content Writer Studio will automatically weave contextual internal links to your
          existing articles ({publishedSiblingSlugs.slice(0, 3).join(", ")}).
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
        <Link
          href={`/ai-content-writer?${writerQuery}`}
          style={{
            padding: "9px 14px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            color: "#061018",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          {post.sourceArticleProjectId
            ? "Open & Update in AI Content Writer →"
            : "Write This Article in AI Content Writer →"}
        </Link>
        <Link
          href={`/tools/on-page-ai-seo-repair-agent?siteId=${encodeURIComponent(document.projectId)}`}
          style={{
            padding: "9px 12px",
            borderRadius: "9px",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: "rgba(255,255,255,0.03)",
            color: "#cbd5e1",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          Run On-Page SEO Repair
        </Link>
        <Link
          href={`/tools/internal-link-opportunity-finder?siteId=${encodeURIComponent(document.projectId)}`}
          style={{
            padding: "9px 12px",
            borderRadius: "9px",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: "rgba(255,255,255,0.03)",
            color: "#cbd5e1",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          Audit Cluster Internal Links
        </Link>
      </div>
    </section>
  );
}
