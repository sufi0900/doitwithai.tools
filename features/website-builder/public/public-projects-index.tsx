"use client";

import React, { useMemo, useState } from "react";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";

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
    projects.some((p) => p.caseStudySlug.includes("generator") || p.caseStudySlug.includes("tool") || p.caseStudySlug.includes("analyzer") || p.caseStudySlug.includes("checker"));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const allTags = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => p.technologies.forEach((t) => s.add(t)));
    return Array.from(s).slice(0, 10);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((proj) => {
      const tagMatch = selectedTag === "all" || proj.technologies.includes(selectedTag);
      if (!tagMatch) return false;
      if (!q) return true;
      return (
        proj.title.toLowerCase().includes(q) ||
        proj.summary.toLowerCase().includes(q) ||
        proj.technologies.some((t) => t.toLowerCase().includes(q))
      );
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
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: "28px" }}
      >
        <header style={{ display: "grid", gap: "10px" }}>
          <p className="section-eyebrow" style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "0.14em" }}>
            {isToolDirectory
              ? `INTERACTIVE AI TOOLS DIRECTORY · ${projects.length} LIVE UTILITIES`
              : "SELECTED WORK & CASE STUDIES"}
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 44px)" }}>
            {isToolDirectory
              ? `${document.identity.name} — All AI Tools`
              : `Projects and case studies by ${document.identity.name}`}
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
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(99, 102, 241, 0.28)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 260px" }}>
            <Search size={16} color="#38bdf8" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isToolDirectory
                  ? `Search ${projects.length} interactive AI tools by name or capability…`
                  : "Search projects…"
              }
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                color: "#f8fafc",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setSelectedTag("all")}
              style={{
                padding: "5px 11px",
                borderRadius: "999px",
                border: 0,
                background: selectedTag === "all" ? "#6366f1" : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              All ({projects.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: "5px 11px",
                  borderRadius: "999px",
                  border: 0,
                  background: selectedTag === tag ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="wb-tools-directory-grid">
          {filteredProjects.map((project, index) => {
            const cover = project.mediaIds
              .map((id) => document.media.assets.find((asset) => asset.id === id))
              .find(Boolean);
            const toolSlug = project.caseStudySlug || project.id;
            return (
              <article
                key={project.id}
                className="wb-tool-directory-card"
                style={{
                  background: "rgba(15, 23, 42, 0.84)",
                  border: "1px solid rgba(99, 102, 241, 0.28)",
                  borderRadius: "16px",
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
                    />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "#38bdf8",
                    }}
                  >
                    {isToolDirectory ? `TOOL 0${index + 1} · IN-SITE AI UTILITY` : project.period || "Project"}
                  </span>
                  <span
                    style={{
                      fontSize: "10.5px",
                      padding: "2px 9px",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.14)",
                      color: "#6ee7b7",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Live in Site
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "19px", lineHeight: 1.3, color: "#ffffff" }}>
                  {project.title}
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                  {project.summary}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {project.technologies.map((technology) => (
                    <em
                      key={technology}
                      style={{
                        fontStyle: "normal",
                        fontSize: "11px",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        color: "#e2e8f0",
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
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #22d3ee, #6366f1)",
                      color: "#04101c",
                      fontSize: "13px",
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
