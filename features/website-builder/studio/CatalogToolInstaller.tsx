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
import { getTransferredToolManifestEntry } from "@/features/website-builder/tools/transferred-tool-manifest";

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

  const activeManifest = activeTool
    ? getTransferredToolManifestEntry(activeTool.slug)
    : null;

  const isSingleToolMode =
    document.design.template === "micro-saas-launchpad" &&
    document.content.projects.length > 0;
  const replaceFlagshipId = isSingleToolMode ? document.content.projects[0]?.id : undefined;

  const isLimitReached = !replaceFlagshipId && document.content.projects.length >= 8;
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
      link: "",
      role: (activeTool.kind || "Interactive AI Web Utility").slice(0, 100),
      period: "Live on Your Website · Free Utility",
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
        `Runs directly inside your published website (/p/[slug]/projects/${activeTool.slug}) with companion workflow documentation and internal cluster linking (${fullUrl}).`.slice(
          0,
          1200,
        ),
      includeCompanionPost,
      ...(replaceFlagshipId ? { replaceItemId: replaceFlagshipId } : {}),
      ...(activeManifest?.versionLabel
        ? { installedToolVersion: activeManifest.versionLabel }
        : {}),
      ...(activeManifest?.metaTitle ? { metaTitle: activeManifest.metaTitle } : {}),
      ...(activeManifest?.metaDescription
        ? { metaDescription: activeManifest.metaDescription }
        : {}),
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
        padding: "12px",
        background:
          "linear-gradient(145deg, rgba(8, 19, 38, 0.94), rgba(15, 23, 42, 0.92))",
        display: "grid",
        gap: "10px",
        marginBottom: "14px",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "6px",
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 180px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#38bdf8",
            }}
          >
            <Wrench size={12} /> {CATALOG_TOOLS.length} MAIN-SITE LANDING PAGES
          </span>
          <strong
            style={{
              display: "block",
              marginTop: "3px",
              fontSize: "13px",
              color: "#f8fafc",
            }}
          >
            {isSingleToolMode
              ? "⚡ Swap Flagship Tool (Any of 126+ Tools)"
              : "+ Add Tool from DoItWithAI Catalog"}
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

      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.45, color: "#94a3b8" }}>
        {isSingleToolMode
          ? `Pick any of our ${CATALOG_TOOLS.length} tools below to transfer its full live landing page onto your homepage.`
          : `Select any of our ${CATALOG_TOOLS.length} main-website tools to transfer its complete landing page & live tool UI in 1 click.`}
      </p>

      <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1", minWidth: 0 }}>
          <span>Filter by Category</span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSlug("");
            }}
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
              padding: "7px 9px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "#060b16",
              color: "#f8fafc",
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
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

        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1", minWidth: 0 }}>
          <span>Search Tool by Name or Keyword</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 9px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "#060b16",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <Search size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. meta title, schema, keyword..."
              style={{
                width: "100%",
                minWidth: 0,
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

        <label style={{ display: "grid", gap: "4px", fontSize: "11px", color: "#cbd5e1", minWidth: 0 }}>
          <span>Choose Tool ({filteredTools.length} matching)</span>
          <select
            value={activeTool?.slug ?? ""}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
              padding: "8px 9px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              background: "#060b16",
              color: "#f8fafc",
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {filteredTools.map((tool) => (
              <option key={tool.slug} value={tool.slug}>
                {installedSlugs.has(tool.slug) ? "✓ " : ""}
                {tool.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeTool && (
        <div
          style={{
            padding: "9px 10px",
            borderRadius: "10px",
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            fontSize: "11px",
            color: "#cbd5e1",
            display: "grid",
            gap: "4px",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "4px", minWidth: 0 }}>
            <strong style={{ color: "#ffffff", overflowWrap: "anywhere" }}>{activeTool.name}</strong>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              {activeManifest?.versionLabel && (
                <span style={{ fontSize: "9.5px", padding: "2px 6px", borderRadius: "999px", background: "rgba(56, 189, 248, 0.14)", color: "#7dd3fc", fontWeight: 700 }}>
                  {activeManifest.versionLabel}
                </span>
              )}
              <code style={{ color: "#38bdf8", fontSize: "10px", overflowWrap: "anywhere" }}>
                {toolPath(activeTool.slug)}
              </code>
            </div>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", lineHeight: 1.45, overflowWrap: "anywhere" }}>
            {activeTool.description}
          </p>
        </div>
      )}

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          fontSize: "11px",
          color: "#e2e8f0",
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        <input
          type="checkbox"
          checked={includeCompanionPost}
          onChange={(e) => setIncludeCompanionPost(e.target.checked)}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <span style={{ lineHeight: 1.4 }}>
          Also generate a ready-to-publish <strong>SEO blog guide</strong>
        </span>
      </label>

      <button
        type="button"
        disabled={!activeTool || isLimitReached}
        onClick={handleInstallTool}
        style={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "9px 12px",
          borderRadius: "9px",
          border: 0,
          background: isLimitReached
            ? "rgba(148, 163, 184, 0.2)"
            : "linear-gradient(135deg, #22d3ee, #6366f1)",
          color: isLimitReached ? "#94a3b8" : "#04101c",
          fontWeight: 800,
          fontSize: "12px",
          cursor: isLimitReached ? "not-allowed" : "pointer",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <Plus size={14} style={{ flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isLimitReached
            ? "Max 8 Tools Reached"
            : isSingleToolMode
              ? `Set "${activeTool?.name}" as Flagship Tool`
              : isAlreadyInstalled
                ? `Add Another Copy`
                : `Add Tool (${includeCompanionPost ? "+ SEO Guide" : "Tool Only"})`}
        </span>
      </button>

      {justInstalledTitle && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "#6ee7b7",
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          <Check size={14} style={{ flexShrink: 0 }} />{" "}
          {isSingleToolMode
            ? `Swapped flagship landing page to "${justInstalledTitle}"!`
            : `Transferred "${justInstalledTitle}" landing page (0 AI tokens)!`}
        </div>
      )}
    </section>
  );
}
