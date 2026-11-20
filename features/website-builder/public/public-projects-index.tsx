"use client";

import React, { useMemo, useState } from "react";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import { resolveToolVisualPalette } from "@/features/website-builder/tools/InteractiveWebsiteToolRunner";

export function PublicProjectsIndex({
  document,
  portfolioSlug,
  basePath,
}: {
  document: SiteDocument;
  portfolioSlug: string;
  basePath?: string;
}) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const projects = projectsForPresentation(document);
  const template = document.design.template;
  const isToolDirectory =
    template === "doitwithai-flagship" ||
    template === "micro-saas-launchpad" ||
    projects.some(
      (p) =>
        p.role.toLowerCase().includes("tool") ||
        p.role.toLowerCase().includes("utility") ||
        p.caseStudySlug.includes("generator") ||
        p.caseStudySlug.includes("analyzer"),
    );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const p of projects) {
      if (p.role) s.add(p.role);
      for (const t of p.technologies.slice(0, 3)) s.add(t);
    }
    return ["all", ...Array.from(s).slice(0, 8)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.period.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      const matchesTag =
        selectedTag === "all" ||
        p.role === selectedTag ||
        p.technologies.includes(selectedTag);
      return matchesQuery && matchesTag;
    });
  }, [projects, searchQuery, selectedTag]);

  const publishedPages = document.publishing.pages.filter((p) => p.status === "published");
  const hasBlog = document.publishing.posts.some((p) => p.status === "published");

  return (
    <main
      className={`website-builder-scope published-content-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`}
      data-accent={document.design.accent}
    >
      <header className="case-study-nav">
        <a href={path}>
          <ArrowLeft size={16} />
          {document.identity.name}
        </a>
        <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <a href={path}>Home</a>
          <a href={`${path}/projects`} style={{ fontWeight: 800, color: "#38bdf8" }}>
            {isToolDirectory ? `Tools (${projects.length})` : `Projects (${projects.length})`}
          </a>
          {hasBlog && <a href={`${path}/blog`}>Blog &amp; Guides</a>}
          {publishedPages.map((page) => (
            <a key={page.id} href={`${path}/pages/${page.slug}`}>
              {page.navigationLabel}
            </a>
          ))}
          <a href={`${path}#contact`}>Contact</a>
        </nav>
      </header>

      <section
        className="projects-index"
        style={{ maxWidth: "1220px", margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: "28px" }}
      >
        <header style={{ display: "grid", gap: "10px" }}>
          <p className="section-eyebrow">
            {isToolDirectory
              ? `INTERACTIVE AI TOOLS DIRECTORY · ${projects.length} LIVE UTILITIES`
              : "SELECTED WORK & CASE STUDIES"}
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: 0 }}>
            {isToolDirectory ? `${document.identity.name} — All Interactive Tools` : "Projects and case studies"}
          </h1>
          <p style={{ margin: 0, maxWidth: "760px", color: "#94a3b8", fontSize: "15px", lineHeight: 1.65 }}>
            {isToolDirectory
              ? `Explore ${projects.length} interactive AI utilities built into this website. Open any tool card below to launch its dedicated full-page experience.`
              : `A complete collection of work and outcomes by ${document.identity.name}.`}
          </p>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "14px",
            padding: "14px 16px",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isToolDirectory ? `Search ${projects.length} AI tools by keyword or category...` : "Search projects..."}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: "9px",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "rgba(9, 14, 28, 0.85)",
                color: "#f8fafc",
                fontSize: "13px",
              }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: selectedTag === tag ? "1px solid #22d3ee" : "1px solid rgba(148, 163, 184, 0.22)",
                  background: selectedTag === tag ? "rgba(34, 211, 238, 0.16)" : "rgba(15, 23, 42, 0.6)",
                  color: selectedTag === tag ? "#a5f3fc" : "#cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tag === "all" ? `All (${projects.length})` : tag}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div
            style={{
              padding: "28px",
              borderRadius: "16px",
              border: "1px dashed rgba(148, 163, 184, 0.35)",
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: "15px", color: "#f8fafc" }}>
                No matching tools found
              </strong>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                No items matched “{searchQuery.trim()}” in {selectedTag === "all" ? "all categories" : selectedTag}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "9px",
                border: "1px solid rgba(34, 211, 238, 0.45)",
                background: "rgba(34, 211, 238, 0.15)",
                color: "#a5f3fc",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="wb-tools-directory-grid">
            {filteredProjects.map((project, index) => {
              const cover = project.mediaIds
                .map((id) => document.media.assets.find((asset) => asset.id === id))
                .find(Boolean);
              const toolSlug = project.caseStudySlug || project.id;
              const isSiteLight = isLightTemplate(document.design.template) || document.design.background === "ivory" || document.design.background === "cloud";
              const cardSurface = isSiteLight ? "#ffffff" : "rgba(15, 23, 42, 0.9)";
              const cardBorder = isSiteLight ? "#e2e8f0" : "rgba(148, 163, 184, 0.22)";
              const cardTextPrimary = isSiteLight ? "#0f172a" : "#f8fafc";
              const cardTextSecondary = isSiteLight ? "#334155" : "#cbd5e1";
              const badgeBg = isSiteLight ? "#f1f5f9" : "rgba(30, 41, 59, 0.78)";
              const badgeBorder = isSiteLight ? "#cbd5e1" : "rgba(148, 163, 184, 0.24)";
              const cleanRole = (project.role || "AI UTILITY")
                .replace(/^TOOL\s*\d+\s*[·•-]\s*/i, "")
                .trim()
                .toUpperCase();

              return (
                <article
                  key={project.id}
                  className="wb-tool-directory-card"
                  style={{
                    background: cardSurface,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "14px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    height: "100%",
                  }}
                >
                  {cover && (
                    <div
                      className="wb-tool-card-media"
                      style={{ position: "relative", height: "160px", borderRadius: "10px", overflow: "hidden" }}
                    >
                      <Image
                        src={cover.url}
                        alt={cover.alt}
                        fill
                        sizes="(max-width: 760px) 94vw, 430px"
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        color: isSiteLight ? "#1d4ed8" : "#60a5fa",
                      }}
                    >
                      {isToolDirectory
                        ? `TOOL ${String(index + 1).padStart(2, "0")} · ${cleanRole}`
                        : project.period || "Project"}
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 9px",
                        borderRadius: "999px",
                        background: isSiteLight ? "#eff6ff" : "rgba(37, 99, 235, 0.2)",
                        color: isSiteLight ? "#1d4ed8" : "#93c5fd",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Live in Site
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 700, lineHeight: 1.32, color: cardTextPrimary }}>
                    {project.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: "13.5px", color: cardTextSecondary, lineHeight: 1.6 }}>
                    {project.summary}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {project.technologies.map((technology) => (
                      <em
                        key={technology}
                        style={{
                          fontStyle: "normal",
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: cardTextSecondary,
                          fontWeight: 600,
                        }}
                      >
                        {technology}
                      </em>
                    ))}
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <a
                      href={`${path}/projects/${toolSlug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "9px",
                        background: "#2563eb",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <span>Open {project.title}</span>
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
