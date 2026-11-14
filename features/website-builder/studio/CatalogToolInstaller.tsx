"use client";

import React, { useMemo, useState } from "react";
import { Check, Plus, Search, Wrench } from "lucide-react";
import {
  categories as CATALOG_CATEGORIES,
  tools as CATALOG_TOOLS,
  toolPath,
  siteOrigin,
} from "@/features/tool-catalog/catalog";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

export function CatalogToolInstaller({
  document,
  execute,
}: {
  document: SiteDocument;
  execute: (command: SiteCommand) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    CATALOG_TOOLS[0]?.slug ?? "meta-title-generator",
  );
  const [includeCompanionPost, setIncludeCompanionPost] = useState<boolean>(true);
  const [justInstalledTitle, setJustInstalledTitle] = useState<string>("");

  const installedSlugs = useMemo(
    () =>
      new Set(
        document.content.projects.flatMap((p) => {
          const items = [p.caseStudySlug];
          if (p.link) {
            const parts = p.link.split("/tools/");
            if (parts[1]) items.push(parts[1].replace(/\/+$/, ""));
          }
          return items;
        }),
      ),
    [document.content.projects],
  );

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATALOG_TOOLS.filter((tool) => {
      const catMatch =
        selectedCategory === "all" || tool.categories.includes(selectedCategory);
      if (!catMatch) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const activeTool = useMemo(
    () =>
      filteredTools.find((t) => t.slug === selectedSlug) ??
      filteredTools[0] ??
      CATALOG_TOOLS[0],
    [filteredTools, selectedSlug],
  );

  const isLimitReached = document.content.projects.length >= 8;
  const isAlreadyInstalled = activeTool
    ? installedSlugs.has(activeTool.slug)
    : false;

  function handleInstallTool() {
    if (!activeTool || isLimitReached) return;
    const fullUrl = `${siteOrigin}${toolPath(activeTool.slug)}`;
    const techBadges = Array.from(
      new Set([
        ...(activeTool.categories || []),
        ...(activeTool.topics || []),
        ...(activeTool.tags || []).slice(0, 4),
      ]),
    )
      .map((item) => item.trim().slice(0, 32))
      .filter(Boolean)
      .slice(0, 6);

    execute({
      type: "project.installCatalogTool",
      slug: activeTool.slug,
      title: activeTool.name.slice(0, 100),
      summary: activeTool.description.slice(0, 500),
      technologies: techBadges.length ? techBadges : ["AI SEO Utility", "Browser Tool"],
      link: fullUrl,
      role: (activeTool.kind || "Interactive AI Web Utility").slice(0, 100),
      period: "Live on DoItWithAI · Free Utility",
      challenge:
        `Eliminate manual ${activeTool.tags?.[0] || activeTool.name} bottlenecks with deterministic browser execution and structured SEO outputs.`.slice(
          0,
          1200,
        ),
      approach:
        `Engineered as an interactive web utility (${toolPath(activeTool.slug)}) with instant copy/export and connected Schema.org markup.`.slice(
          0,
          1800,
        ),
      outcome:
        `Ready to launch at ${fullUrl} with companion workflow documentation and internal cluster linking.`.slice(
          0,
          1200,
        ),
      includeCompanionPost,
    });

    setJustInstalledTitle(activeTool.name);
    window.setTimeout(() => setJustInstalledTitle(""), 3500);
  }

  return (
    <section
      aria-label="Add existing tool from DoItWithAI catalog"
      style={{
        border: "1px solid rgba(56, 189, 248, 0.38)",
        borderRadius: "14px",
        padding: "14px",
        background:
          "linear-gradient(145deg, rgba(8, 19, 38, 0.94), rgba(15, 23, 42, 0.92))",
        display: "grid",
        gap: "10px",
        marginBottom: "14px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#38bdf8",
            }}
          >
            <Wrench size={12} /> ZERO-TOKEN CATALOG PIPELINE ({CATALOG_TOOLS.length} TOOLS)
          </span>
          <strong
            style={{
              display: "block",
              marginTop: "3px",
              fontSize: "13.5px",
              color: "#f8fafc",
            }}
          >
            + Add Tool from DoItWithAI Catalog
          </strong>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.16)",
            color: "#6ee7b7",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            whiteSpace: "nowrap",
          }}
        >
          0 AI Tokens
        </span>
      </header>

      <p style={{ margin: 0, fontSize: "11.5px", lineHeight: 1.5, color: "#94a3b8" }}>
        Select any of our {CATALOG_TOOLS.length} built tools to transfer its landing page metadata,{" "}
        <code>/tools/&lt;slug&gt;</code> URL, and optional SEO guide into this website in 1 click.
      </p>

      <div style={{ display: "grid", gap: "8px" }}>
        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1" }}>
          <span>Filter by Category</span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSlug("");
            }}
            style={{
              padding: "7px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "#060b16",
              color: "#f8fafc",
              fontSize: "12px",
            }}
          >
            <option value="all">All Categories ({CATALOG_TOOLS.length} tools)</option>
            {CATALOG_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1" }}>
          <span>Search Tool by Name or Keyword</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "#060b16",
            }}
          >
            <Search size={13} color="#38bdf8" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. meta title, schema, keyword, readability…"
              style={{
                width: "100%",
                padding: "7px 0",
                border: 0,
                background: "transparent",
                color: "#f8fafc",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
        </label>

        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1" }}>
          <span>Choose Tool ({filteredTools.length} matching)</span>
          <select
            value={activeTool?.slug ?? ""}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              background: "#060b16",
              color: "#f8fafc",
              fontSize: "12px",
            }}
          >
            {filteredTools.map((tool) => (
              <option key={tool.slug} value={tool.slug}>
                {installedSlugs.has(tool.slug) ? "✓ " : ""}
                {tool.name} ({toolPath(tool.slug)})
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeTool && (
        <div
          style={{
            padding: "9px 11px",
            borderRadius: "10px",
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            fontSize: "11.5px",
            color: "#cbd5e1",
            display: "grid",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
            <strong style={{ color: "#ffffff" }}>{activeTool.name}</strong>
            <code style={{ color: "#38bdf8", fontSize: "10.5px" }}>
              {toolPath(activeTool.slug)}
            </code>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", lineHeight: 1.45 }}>
            {activeTool.description}
          </p>
        </div>
      )}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "11.5px",
          color: "#e2e8f0",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={includeCompanionPost}
          onChange={(e) => setIncludeCompanionPost(e.target.checked)}
        />
        <span>
          Also generate a ready-to-publish <strong>SEO blog post guide</strong> for this tool
        </span>
      </label>

      <button
        type="button"
        disabled={!activeTool || isLimitReached}
        onClick={handleInstallTool}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "7px",
          padding: "9px 14px",
          borderRadius: "9px",
          border: 0,
          background: isLimitReached
            ? "rgba(148, 163, 184, 0.2)"
            : "linear-gradient(135deg, #22d3ee, #6366f1)",
          color: isLimitReached ? "#94a3b8" : "#04101c",
          fontWeight: 800,
          fontSize: "12px",
          cursor: isLimitReached ? "not-allowed" : "pointer",
        }}
      >
        <Plus size={14} />
        {isLimitReached
          ? "Maximum 8 Homepage Tools Reached"
          : isAlreadyInstalled
            ? `Add Another Copy of "${activeTool?.name.slice(0, 28)}…"`
            : `+ Add Tool to Website (${includeCompanionPost ? "+ SEO Guide" : "Tool Only"})`}
      </button>

      {justInstalledTitle && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11.5px",
            color: "#6ee7b7",
            fontWeight: 600,
          }}
        >
          <Check size={14} /> Added &ldquo;{justInstalledTitle}&rdquo; to your website with 0 AI tokens!
        </div>
      )}
    </section>
  );
}
