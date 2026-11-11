"use client";
import React, { useMemo, useState } from "react";
import type {
  BlogInfographicConfig,
  BlogSectionNode,
  BlogSubHeadingNode,
  CanonicalBlogProjectState,
} from "@/lib/blog-writer/canonical-state";
import {
  autoRecommendInfographicTemplate,
  generateAnchorId,
} from "@/lib/blog-writer/deterministic-analyzers";
import { getInfographicDimensions } from "@/lib/blog-infographic-studio/layout-registry";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import {
  PRISM_LAYOUTS,
  withPrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import type { PrismLayout } from "@/lib/blog-infographic-studio/visual-brief";
import {
  selectInfographicTemplate,
  patchInfographic,
} from "@/lib/blog-infographic-studio/project";
export interface Stage2OutlineArchitectProps {
  project: CanonicalBlogProjectState;
  onChange: (next: CanonicalBlogProjectState) => void;
  onRunAiOutline?: () => void;
  onNextStage?: () => void;
  onProceedToNextStage?: () => void;
  onBackStage?: () => void;
  isGeneratingOutline?: boolean;
}
const SECTION_ROLES: {
  id: BlogSectionNode["searchIntentRole"];
  label: string;
}[] = [
  { id: "definition-aeo", label: "Definition & AEO Answer" },
  { id: "step-by-step", label: "Step-by-Step Workflow" },
  { id: "comparison-matrix", label: "Comparison Matrix" },
  { id: "data-benchmarks", label: "Data & KPI Benchmarks" },
  { id: "framework-deep-dive", label: "Framework Deep Dive" },
  { id: "checklist-action", label: "Actionable Checklist" },
  { id: "faq-busting", label: "Myth Busting & FAQs" },
];
const PALETTES: {
  id: BlogInfographicConfig["paletteId"];
  label: string;
}[] = [
  { id: "indigo-cyber", label: "Indigo Cyber" },
  { id: "emerald-growth", label: "Emerald Growth" },
  { id: "amber-executive", label: "Amber Executive" },
  { id: "rose-editorial", label: "Rose Editorial" },
  { id: "cyan-tech", label: "Cyan Tech" },
  { id: "slate-minimal", label: "Slate Minimal" },
  { id: "violet-saas", label: "Violet SaaS" },
  { id: "blue-trust", label: "Blue Trust" },
];
function reindexSections(sections: BlogSectionNode[]): BlogSectionNode[] {
  return sections.map((sec, idx) => ({
    ...sec,
    orderIndex: idx + 1,
    anchorId: generateAnchorId(sec.h2Text, idx),
  }));
}
function createDefaultSection(
  index: number,
  primaryKeyword: string,
  h2Text = `Section ${index + 1}: Core Strategy for ${primaryKeyword || "Your Topic"}`,
): BlogSectionNode {
  const id = `sec-${Date.now().toString(36)}-${index + 1}`;
  const tpl = autoRecommendInfographicTemplate(h2Text);
  return {
    id,
    orderIndex: index + 1,
    h2Text,
    anchorId: generateAnchorId(h2Text, index),
    targetWordCount: 350,
    actualWordCount: 0,
    searchIntentRole: "step-by-step",
    bodyMarkdown: "",
    subHeadings: [],
    includeComparisonTable: false,
    includeKeyTakeawayCallout: true,
    keyTakeawayText: "",
    infographicConfig: {
      id: `vis-${id}`,
      sectionId: id,
      templateId: tpl.templateId,
      templateSlug: tpl.templateSlug,
      templateName: tpl.templateName,
      headline: h2Text,
      subheadline: primaryKeyword
        ? `Visual summary for ${primaryKeyword}`
        : "Editable HTML5/SVG section diagram",
      paletteId: index % 2 === 0 ? "indigo-cyber" : "emerald-growth",
      aspectRatio: "16:9",
      nodes: [
        {
          id: "n1",
          badge: "01",
          title: "Step 1",
          detail: "Define search intent & reader goal",
        },
        {
          id: "n2",
          badge: "02",
          title: "Step 2",
          detail: "Structure H2/H3 semantic hierarchy",
        },
        {
          id: "n3",
          badge: "03",
          title: "Step 3",
          detail: "Embed editable infographic & proof",
        },
      ],
      footerSourceLabel: "DoItWithAI.tools · Visual SEO Studio",
      altText: `${h2Text} infographic`,
    },
  };
}
export default function Stage2OutlineArchitect({
  project,
  onChange,
  onRunAiOutline,
  onNextStage,
  onProceedToNextStage,
  onBackStage,
  isGeneratingOutline = false,
}: Stage2OutlineArchitectProps) {
  const [newH3DraftBySection, setNewH3DraftBySection] = useState<
    Record<string, string>
  >({});
  const proceed = onNextStage ?? onProceedToNextStage;
  const totalTargetWords = useMemo(
    () =>
      project.sections.reduce(
        (sum, s) => sum + (Number(s.targetWordCount) || 0),
        0,
      ),
    [project.sections],
  );
  const commitSections = (nextSections: BlogSectionNode[]) => {
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      sections: reindexSections(nextSections),
    });
  };
  const updateSection = (
    sectionId: string,
    updater: (sec: BlogSectionNode) => BlogSectionNode,
  ) => {
    commitSections(
      project.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
    );
  };
  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= project.sections.length) return;
    const copy = [...project.sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    commitSections(copy);
  };
  const handleAddSection = () => {
    const next = createDefaultSection(
      project.sections.length,
      project.keywordCluster.primaryKeyword,
    );
    commitSections([...project.sections, next]);
  };
  const handleDeleteSection = (sectionId: string) => {
    commitSections(project.sections.filter((s) => s.id !== sectionId));
  };
  const handleAutoMapAllVisuals = () => {
    const mapped = project.sections.map((sec, idx) => {
      const tpl = autoRecommendInfographicTemplate(
        sec.h2Text,
        sec.bodyMarkdown,
      );
      return {
        ...sec,
        infographicConfig: {
          ...selectInfographicTemplate(sec.infographicConfig, tpl.templateId),
          headline: sec.infographicConfig?.headline || sec.h2Text,
          paletteId:
            sec.infographicConfig?.paletteId ||
            (idx % 2 === 0 ? "indigo-cyber" : "emerald-growth"),
          altText: `${sec.h2Text} — ${tpl.templateName}`,
        },
      };
    });
    commitSections(mapped);
  };
  const handleTemplateSelect = (sectionId: string, templateId: number) => {
    const spec =
      BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ??
      BLOG_INFOGRAPHIC_25_TEMPLATES[0];
    updateSection(sectionId, (sec) => ({
      ...sec,
      infographicConfig: {
        ...selectInfographicTemplate(sec.infographicConfig, spec.id),
        altText: `${sec.h2Text} — ${spec.name}`,
      },
    }));
  };
  const handleAddSubHeading = (sectionId: string) => {
    const draft = (newH3DraftBySection[sectionId] ?? "").trim();
    if (!draft) return;
    updateSection(sectionId, (sec) => {
      const nextSub: BlogSubHeadingNode = {
        id: `${sec.id}-sub-${Date.now().toString(36).slice(-4)}`,
        h3Text: draft,
        keyPoints: [],
        bodyMarkdown: "",
      };
      return {
        ...sec,
        subHeadings: [...sec.subHeadings, nextSub],
      };
    });
    setNewH3DraftBySection((prev) => ({ ...prev, [sectionId]: "" }));
  };
  const handleUpdateSubHeading = (
    sectionId: string,
    subId: string,
    h3Text: string,
  ) => {
    updateSection(sectionId, (sec) => ({
      ...sec,
      subHeadings: sec.subHeadings.map((sub) =>
        sub.id === subId ? { ...sub, h3Text } : sub,
      ),
    }));
  };
  const handleDeleteSubHeading = (sectionId: string, subId: string) => {
    updateSection(sectionId, (sec) => ({
      ...sec,
      subHeadings: sec.subHeadings.filter((sub) => sub.id !== subId),
    }));
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span>
              Stage 2 of 6 · Interactive H2/H3 Outline & 25-Template Visual
              Architect
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Engineer Your Semantic H2/H3 Tree & Pair Every Section with an
            Editable Infographic
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Reorder sections, add/remove H3 subheadings, set per-section
            word-count targets, and map each H2 to one of the 25 deterministic
            HTML5/SVG infographic templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Sections
            </div>
            <div className="font-bold text-white">
              {project.sections.length} H2s
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Target Length
            </div>
            <div className="font-bold text-emerald-300">
              {totalTargetWords.toLocaleString()} words
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoMapAllVisuals}
            className="rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3.5 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
          >
            🎨 Auto-Recommend All 25-Template Visuals
          </button>
          <button
            type="button"
            onClick={handleAddSection}
            className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            + Add H2 Section
          </button>
        </div>
      </div>

      {project.sections.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Live Semantic Table of Contents (Auto-Generated `#anchor-id` Slugs)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.sections.map((sec, idx) => (
              <span
                key={sec.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
              >
                <span className="font-mono text-[10px] text-indigo-400">
                  H2.{idx + 1}
                </span>
                <span className="max-w-[220px] truncate">{sec.h2Text}</span>
                <span className="font-mono text-[10px] text-slate-500">
                  #{sec.anchorId}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {project.sections.map((sec, idx) => {
          const matchedTemplate =
            BLOG_INFOGRAPHIC_25_TEMPLATES.find(
              (t) => t.id === sec.infographicConfig?.templateId,
            ) ?? BLOG_INFOGRAPHIC_25_TEMPLATES[0];
          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 transition hover:border-slate-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/15 font-mono text-xs font-bold text-indigo-300">
                    H2 #{idx + 1}
                  </span>
                </div>

                <input
                  type="text"
                  value={sec.h2Text}
                  onChange={(e) => {
                    const nextH2 = e.target.value;
                    updateSection(sec.id, (curr) => ({
                      ...curr,
                      h2Text: nextH2,
                      anchorId: generateAnchorId(nextH2, idx),
                      infographicConfig: {
                        ...curr.infographicConfig,
                        headline: nextH2,
                      },
                    }));
                  }}
                  placeholder="Enter H2 section heading..."
                  className="w-full flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
                />

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, -1)}
                    title="Move section up"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:border-indigo-500 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === project.sections.length - 1}
                    onClick={() => handleMoveSection(idx, 1)}
                    title="Move section down"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:border-indigo-500 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = autoRecommendInfographicTemplate(
                        sec.h2Text,
                        sec.bodyMarkdown,
                      );
                      handleTemplateSelect(sec.id, rec.templateId);
                    }}
                    title="Auto-match visual template from H2 text"
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                  >
                    Auto-Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id)}
                    title="Delete H2 section"
                    className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400">
                    Section Intent Role
                  </label>
                  <select
                    value={sec.searchIntentRole}
                    onChange={(e) =>
                      updateSection(sec.id, (curr) => ({
                        ...curr,
                        searchIntentRole: e.target
                          .value as BlogSectionNode["searchIntentRole"],
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {SECTION_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400">
                    Target Word Count ({sec.targetWordCount} words)
                  </label>
                  <input
                    type="number"
                    min={120}
                    max={1200}
                    step={25}
                    value={sec.targetWordCount}
                    onChange={(e) =>
                      updateSection(sec.id, (curr) => ({
                        ...curr,
                        targetWordCount: Math.max(
                          100,
                          Number(e.target.value) || 300,
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={sec.includeComparisonTable}
                    onChange={(e) =>
                      updateSection(sec.id, (curr) => ({
                        ...curr,
                        includeComparisonTable: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-600 text-indigo-600"
                  />
                  <span>Include Markdown Comparison Table</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={sec.includeKeyTakeawayCallout}
                    onChange={(e) =>
                      updateSection(sec.id, (curr) => ({
                        ...curr,
                        includeKeyTakeawayCallout: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-600 text-indigo-600"
                  />
                  <span>Include Key Takeaway Callout Box</span>
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-indigo-500/25 bg-indigo-950/20 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-indigo-200">
                    🎨 Paired H2 Infographic Template:{" "}
                    <span className="text-white">
                      {sec.infographicConfig.visualEngine
                        ? sec.infographicConfig.templateName
                        : `#${matchedTemplate.id} · ${matchedTemplate.name}`}
                    </span>{" "}
                    <span className="text-indigo-300/80">
                      (
                      {sec.infographicConfig.visualEngine
                        ? "Editorial collection"
                        : matchedTemplate.family}
                      )
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Best for:{" "}
                    {sec.infographicConfig.visualEngine
                      ? PRISM_LAYOUTS.find(
                          (l) => l.id === sec.infographicConfig.prismLayout,
                        )?.description
                      : matchedTemplate.bestForSectionType}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] text-slate-400">
                      Select infographic layout
                    </label>
                    <select
                      value={
                        sec.infographicConfig?.visualEngine
                          ? `prism:${sec.infographicConfig.prismLayout}`
                          : (sec.infographicConfig?.templateId ?? 1)
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith("prism:"))
                          updateSection(sec.id, (curr) => ({
                            ...curr,
                            infographicConfig: withPrismLayout(
                              curr.infographicConfig,
                              value.slice(6) as PrismLayout,
                            ),
                          }));
                        else handleTemplateSelect(sec.id, Number(value));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <optgroup label="Editorial collection">
                        {PRISM_LAYOUTS.map((layout) => (
                          <option key={layout.id} value={`prism:${layout.id}`}>
                            {layout.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Classic collection">
                        {BLOG_INFOGRAPHIC_25_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            #{tpl.id} · {tpl.name} ({tpl.family})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400">
                      Brand Color Palette
                    </label>
                    <select
                      value={sec.infographicConfig?.paletteId ?? "indigo-cyber"}
                      onChange={(e) =>
                        updateSection(sec.id, (curr) => ({
                          ...curr,
                          infographicConfig: {
                            ...patchInfographic(curr.infographicConfig, {
                              paletteId: e.target
                                .value as BlogInfographicConfig["paletteId"],
                              brand: {
                                ...curr.infographicConfig.brand,
                                customColors: {},
                              },
                            }),
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {PALETTES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="self-center text-xs text-slate-400">
                    Fixed template canvas ·{" "}
                    {getInfographicDimensions(sec.infographicConfig).width} ×{" "}
                    {getInfographicDimensions(sec.infographicConfig).height}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  H3 Subheadings inside H2 #{idx + 1} ({sec.subHeadings.length})
                </div>

                {sec.subHeadings.map((sub, subIdx) => (
                  <div key={sub.id} className="flex items-center gap-2 pl-3">
                    <span className="font-mono text-[11px] text-cyan-400">
                      H3.{idx + 1}.{subIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={sub.h3Text}
                      onChange={(e) =>
                        handleUpdateSubHeading(sec.id, sub.id, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSubHeading(sec.id, sub.id)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-rose-400 hover:border-rose-500/40"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pl-3 pt-1">
                  <input
                    type="text"
                    value={newH3DraftBySection[sec.id] ?? ""}
                    onChange={(e) =>
                      setNewH3DraftBySection((prev) => ({
                        ...prev,
                        [sec.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubHeading(sec.id);
                      }
                    }}
                    placeholder="Add an H3 subheading (press Enter)..."
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubHeading(sec.id)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    + Add H3
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center gap-2">
          {onBackStage && (
            <button
              type="button"
              onClick={onBackStage}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              ← Back to Stage 1: Input Hub
            </button>
          )}
          <button
            type="button"
            onClick={handleAddSection}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            + Add Another H2 Section
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onRunAiOutline && (
            <button
              type="button"
              disabled={isGeneratingOutline}
              onClick={onRunAiOutline}
              className="rounded-xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {isGeneratingOutline
                ? "Refreshing AI Outline..."
                : "🤖 Re-Generate Outline & Visual Map with AI"}
            </button>
          )}
          {proceed && (
            <button
              type="button"
              onClick={proceed}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-emerald-500"
            >
              Continue to Stage 3: Long-Form AI Drafting & Section Co-Pilot →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
