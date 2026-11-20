"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Layers, Plus, Sparkles } from "lucide-react";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import {
  BUILDER_48_MICROTOOLS_CATALOG,
  MICROTOOL_VERTICALS,
  type MicroToolVerticalId,
} from "@/features/website-builder/tools/microtool-catalog-48";
import { CustomToolSubmissionPanel } from "./CustomToolSubmissionModal";

export function CatalogToolInstaller({
  document,
  execute,
}: {
  document: SiteDocument;
  execute: (command: SiteCommand) => void;
}) {
  const [selectedVertical, setSelectedVertical] = useState<MicroToolVerticalId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    BUILDER_48_MICROTOOLS_CATALOG[0]?.slug ?? "",
  );
  const [includeCompanionPost, setIncludeCompanionPost] = useState(true);
  const [justInstalledTitle, setJustInstalledTitle] = useState("");

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BUILDER_48_MICROTOOLS_CATALOG.filter((tool) => {
      const matchesVertical =
        selectedVertical === "all" || tool.vertical === selectedVertical;
      const matchesQuery =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.verticalLabel.toLowerCase().includes(q) ||
        tool.badges.some((b) => b.toLowerCase().includes(q));
      return matchesVertical && matchesQuery;
    });
  }, [selectedVertical, searchQuery]);

  const activeTool = useMemo(
    () =>
      filteredTools.find((t) => t.slug === selectedSlug) ??
      filteredTools[0] ??
      BUILDER_48_MICROTOOLS_CATALOG[0],
    [filteredTools, selectedSlug],
  );

  const isSingleToolMode =
    document.design.template === "micro-saas-launchpad" &&
    document.content.projects.length > 0;
  const maxToolsReached =
    !isSingleToolMode && document.content.projects.length >= 8;

  function installSelectedTool() {
    if (!activeTool || maxToolsReached) return;
    const replaceFlagshipId = isSingleToolMode
      ? document.content.projects[0]?.id
      : undefined;

    execute({
      type: "project.installCatalogTool",
      title: activeTool.title,
      summary: activeTool.summary,
      caseStudySlug: activeTool.slug,
      role: activeTool.verticalLabel,
      period: activeTool.eyebrow,
      technologies: activeTool.badges.slice(0, 6),
      link: `/tools/${activeTool.slug}`,
      includeCompanionPost,
      ...(replaceFlagshipId ? { replaceItemId: replaceFlagshipId } : {}),
    } as unknown as SiteCommand);

    setJustInstalledTitle(activeTool.title);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <section
        aria-label="48-Tool Builder Library Installer"
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          background: "rgba(15, 23, 42, 0.86)",
          padding: "14px",
          display: "grid",
          gap: "10px",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: "2px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              PATH A · 48 PRE-BUILT NICHE &amp; WHITE-LABEL TOOLS ($0 RUNTIME)
            </span>
            <strong style={{ fontSize: "13px", color: "#f8fafc" }}>
              1-Click Builder Tool Library (8 Verticals)
            </strong>
          </div>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
            {document.content.projects.length}/8 Installed
          </span>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>
            <span>Filter by Industry Vertical</span>
            <select
              value={selectedVertical}
              onChange={(e) => {
                const next = e.target.value as MicroToolVerticalId | "all";
                setSelectedVertical(next);
              }}
              style={{
                padding: "7px 9px",
                borderRadius: "7px",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                background: "rgba(9, 14, 28, 0.9)",
                color: "#f8fafc",
                fontSize: "11.5px",
              }}
            >
              <option value="all">All 8 Industries (48 Tools)</option>
              {MICROTOOL_VERTICALS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.badge})
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>
            <span>Search Tools</span>
            <input
              type="search"
              value={searchQuery}
              placeholder="Solar, mortgage, macro, ROAS..."
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "7px 9px",
                borderRadius: "7px",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                background: "rgba(9, 14, 28, 0.9)",
                color: "#f8fafc",
                fontSize: "11.5px",
              }}
            />
          </label>
        </div>

        <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>
          <span>Select Pre-Built Tool ({filteredTools.length} matching)</span>
          <select
            value={activeTool?.slug ?? ""}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "7px",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              background: "rgba(9, 14, 28, 0.92)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {filteredTools.map((t) => (
              <option key={t.slug} value={t.slug}>
                [{t.exclusiveToBuilder ? "Exclusive" : "White-Label"}] {t.title} — ({t.verticalLabel})
              </option>
            ))}
          </select>
        </label>

        {activeTool && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "9px",
              background: "rgba(9, 14, 28, 0.72)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              display: "grid",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "12.5px", color: "#ffffff" }}>{activeTool.title}</strong>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: activeTool.exclusiveToBuilder
                    ? "rgba(16, 185, 129, 0.16)"
                    : "rgba(56, 189, 248, 0.16)",
                  color: activeTool.exclusiveToBuilder ? "#34d399" : "#7dd3fc",
                  fontWeight: 700,
                }}
              >
                {activeTool.exclusiveToBuilder ? "Builder-Exclusive Niche Tool" : "100% White-Label Agency Tool"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.45 }}>
              {activeTool.summary}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {activeTool.badges.map((b) => (
                <span
                  key={b}
                  style={{
                    fontSize: "10px",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    background: "rgba(30, 41, 59, 0.9)",
                    color: "#cbd5e1",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", color: "#cbd5e1", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={includeCompanionPost}
            onChange={(e) => setIncludeCompanionPost(e.target.checked)}
          />
          <span>Auto-create a companion SEO blog post linking internally to this tool</span>
        </label>

        <button
          type="button"
          disabled={!activeTool || maxToolsReached}
          onClick={installSelectedTool}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "9px 14px",
            borderRadius: "8px",
            border: "none",
            background: maxToolsReached ? "rgba(148, 163, 184, 0.2)" : "#2563eb",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: maxToolsReached ? "not-allowed" : "pointer",
          }}
        >
          {isSingleToolMode ? <Layers size={14} /> : <Plus size={14} />}
          {isSingleToolMode
            ? `Replace Flagship Tool With "${activeTool?.title}"`
            : maxToolsReached
              ? "Maximum 8 Tools Installed"
              : `Install "${activeTool?.title}" Into Website`}
        </button>

        {justInstalledTitle && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#34d399", fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Installed <strong>{justInstalledTitle}</strong> — click it below to customize.
          </div>
        )}
      </section>

      <CustomToolSubmissionPanel
        workspaceId={document.projectId}
        projectId={document.projectId}
      />
    </div>
  );
}
