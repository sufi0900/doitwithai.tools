"use client";

import React, { useMemo, useState } from "react";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight, Search, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import { InteractiveWebsiteToolRunner } from "@/features/website-builder/tools/InteractiveWebsiteToolRunner";

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
  const [activeToolId, setActiveToolId] = useState<string>(projects[0]?.id ?? "");

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

  const activeTool = useMemo(
    () => projects.find((p) => p.id === activeToolId) ?? projects[0],
    [projects, activeToolId],
  );

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
        <nav style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <a href={`${path}/projects`} style={{ fontWeight: 800, color: "#38bdf8" }}>
            {isToolDirectory ? `🧰 All Tools (${projects.length})` : `Projects (${projects.length})`}
          </a>
          {hasBlog && <a href={`${path}/blog`}>Blog &amp; Guides</a>}
          {publishedPages.map((page) => (
            <a key={page.id} href={`${path}/pages/${page.slug}`}>
              {page.navigationLabel}
            </a>
          ))}
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
              ? `Run any of our ${projects.length} interactive AI utilities directly inside this website. Click a tool card below to launch its dedicated workspace or test it immediately in the live runner.`
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredProjects.map((project, index) => {
            const cover = project.mediaIds
              .map((id) => document.media.assets.find((asset) => asset.id === id))
              .find(Boolean);
            const toolSlug = project.caseStudySlug || project.id;
            const isSelected = activeTool?.id === project.id;
            return (
              <article
                key={project.id}
                style={{
                  background: "rgba(15, 23, 42, 0.84)",
                  border: isSelected
                    ? "1px solid #22d3ee"
                    : "1px solid rgba(99, 102, 241, 0.28)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                {cover && (
                  <div style={{ position: "relative", height: "160px", borderRadius: "10px", overflow: "hidden" }}>
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
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.14)",
                      color: "#6ee7b7",
                      fontWeight: 700,
                    }}
                  >
                    Live in Site
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "19px", color: "#ffffff" }}>{project.title}</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.55 }}>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px" }}>
                  <a
                    href={`${path}/projects/${toolSlug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 14px",
                      borderRadius: "9px",
                      background: "linear-gradient(135deg, #22d3ee, #6366f1)",
                      color: "#04101c",
                      fontSize: "12px",
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    <Wrench size={13} /> Open Dedicated Tool Page <ArrowUpRight size={14} />
                  </a>
                  {isToolDirectory && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveToolId(project.id);
                        const el = window.document.getElementById("tool-workspace");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "9px 12px",
                        borderRadius: "9px",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        background: "rgba(15, 23, 42, 0.8)",
                        color: "#7dd3fc",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Sparkles size={13} /> Run Inline Below ↓
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {isToolDirectory && activeTool && (
          <div style={{ marginTop: "12px", display: "grid", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "#22d3ee" }}>
                  ACTIVE IN-SITE TOOL WORKSPACE
                </span>
                <h2 style={{ margin: "4px 0 0", fontSize: "24px" }}>
                  Running: {activeTool.title}
                </h2>
              </div>
              <a
                href={`${path}/projects/${activeTool.caseStudySlug || activeTool.id}`}
                style={{ color: "#38bdf8", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
              >
                Open standalone URL ({path}/projects/{activeTool.caseStudySlug || activeTool.id}) →
              </a>
            </div>
            <InteractiveWebsiteToolRunner
              tool={activeTool}
              siteName={document.identity.name}
              siteSlug={portfolioSlug}
              allTools={projects}
              onSelectTool={(next) => setActiveToolId(next.id)}
            />
          </div>
        )}
      </section>
    </main>
  );
}
