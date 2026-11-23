"use client";

/**
 * Phase 3 Core Deliverable #1: Stage 1 Multi-Mode Input Console, SERP Intent Classifier & Live Pixel Preview
 * File: features/blog-writer-studio/components/Stage1InputHub.tsx
 *
 * Built & Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 *
 * Upstream Connections:
 *  - CanonicalBlogProjectState, BlogInputMode, BlogSectionNode, KeywordClusterPack
 *    from '@/lib/blog-writer/canonical-state'
 *  - measureTitlePixelWidth, measureMetaDescriptionPixelWidth, normalizeSeoSlug,
 *    generateAnchorId, autoRecommendInfographicTemplate
 *    from '@/lib/blog-writer/deterministic-analyzers'
 *
 * Downstream Contract (Phases 4, 5 & 10):
 *  - Exports Stage1InputHub accepting:
 *      { project, onChange, onRunAiOutline?, onNextStage?, onProceedToNextStage? }
 *    (supports both `onNextStage` from grand-blog-writer-blueprint.ts and
 *    `onProceedToNextStage` from docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md).
 */

import React, { useMemo, useState } from "react";
import type {
  BlogInputMode,
  BlogSectionNode,
  BlogSubHeadingNode,
  CanonicalBlogProjectState,
  KeywordClusterPack,
} from "@/lib/blog-writer/canonical-state";
import {
  autoRecommendInfographicTemplate,
  generateAnchorId,
  measureMetaDescriptionPixelWidth,
  measureTitlePixelWidth,
  normalizeSeoSlug,
} from "@/lib/blog-writer/deterministic-analyzers";

export interface Stage1InputHubProps {
  project: CanonicalBlogProjectState;
  onChange: (next: CanonicalBlogProjectState) => void;
  onRunAiOutline?: () => void;
  /** Prop name in lib/founder-hub/grand-blog-writer-blueprint.ts */
  onNextStage?: () => void;
  /** Prop name in docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md */
  onProceedToNextStage?: () => void;
  isGeneratingOutline?: boolean;
}

const INPUT_MODES: {
  id: BlogInputMode;
  badge: string;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "keyword-cluster",
    badge: "01 · SEMrush / Ahrefs",
    label: "Keyword Cluster",
    subtitle: "Primary keyword + secondary keywords, LSI entities & PAA questions",
  },
  {
    id: "topic-idea",
    badge: "02 · Topic Brief",
    label: "Topic / Idea",
    subtitle: "Working headline, target reader & editorial angle",
  },
  {
    id: "custom-outline",
    badge: "03 · H2 / H3 Parser",
    label: "Custom Outline",
    subtitle: "Paste H2/H3 lines -> instant deterministic section + visual tree",
  },
  {
    id: "competitor-gap",
    badge: "04 · SERP Gap",
    label: "Competitor Gap",
    subtitle: "Paste competitor headings/claims -> extract missing semantic angles",
  },
  {
    id: "pdf-transcript",
    badge: "05 · Source-to-Blog",
    label: "PDF / Notes / Transcript",
    subtitle: "Turn raw PDF text, YouTube transcript, or research notes into an outline",
  },
  {
    id: "custom-prompt",
    badge: "06 · Power Prompt",
    label: "Custom Prompt",
    subtitle: "Freeform natural-language instructions + Brand Tone & POV",
  },
];

const SEARCH_INTENTS: KeywordClusterPack["searchIntent"][] = [
  "Informational",
  "Commercial Investigation",
  "Transactional",
  "Navigational",
];

const TONES_OF_VOICE: KeywordClusterPack["toneOfVoice"][] = [
  "Authoritative & Human",
  "Conversational First-Person",
  "Technical & Data-Driven",
  "Executive B2B",
];

const POINTS_OF_VIEW: KeywordClusterPack["pointOfView"][] = [
  "First-Person Plural (We/Our)",
  "First-Person Singular (I/My)",
  "Second-Person Direct (You/Your)",
  "Third-Person Objective",
];

function splitList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Deterministic zero-token SERP intent classifier based on commercial/transactional modifiers. */
export function classifyKeywordSearchIntent(
  primaryKeyword: string,
  secondaryKeywords: string[] = []
): KeywordClusterPack["searchIntent"] {
  const combined = `${primaryKeyword} ${secondaryKeywords.join(" ")}`.toLowerCase();
  if (/\b(buy|price|pricing|discount|coupon|deal|hire|order|download|signup|free tool)\b/.test(combined)) {
    return "Transactional";
  }
  if (/\b(best|top|vs\.?|versus|review|reviews|comparison|compare|alternative|alternatives|software|studio|writer|generator|tool)\b/.test(combined)) {
    return "Commercial Investigation";
  }
  if (/\b(login|sign in|dashboard|official|docs|documentation)\b/.test(combined)) {
    return "Navigational";
  }
  return "Informational";
}

function inferRoleFromHeading(h2Text: string): BlogSectionNode["searchIntentRole"] {
  const lower = h2Text.toLowerCase();
  if (/\b(vs\.?|versus|compare|comparison|matrix|alternative)\b/.test(lower)) return "comparison-matrix";
  if (/\b(step|how to|pipeline|workflow|process|stage|guide)\b/.test(lower)) return "step-by-step";
  if (/\b(stat|benchmark|data|metric|roi|cost|pricing|score)\b/.test(lower)) return "data-benchmarks";
  if (/\b(checklist|audit|action|cheat sheet|template)\b/.test(lower)) return "checklist-action";
  if (/\b(faq|question|myth|mistake)\b/.test(lower)) return "faq-busting";
  if (/\b(framework|architecture|pyramid|model|pillar)\b/.test(lower)) return "framework-deep-dive";
  return "definition-aeo";
}

function buildSectionFromHeading(
  h2Text: string,
  index: number,
  primaryKeyword: string,
  subHeadingLines: string[] = []
): BlogSectionNode {
  const sectionId = `sec-${index + 1}-${Date.now().toString(36).slice(-4)}`;
  const tpl = autoRecommendInfographicTemplate(h2Text, subHeadingLines.join(" "));
  const role = inferRoleFromHeading(h2Text);
  const subHeadings: BlogSubHeadingNode[] = subHeadingLines.map((h3, subIdx) => ({
    id: `${sectionId}-sub-${subIdx + 1}`,
    h3Text: h3,
    keyPoints: [],
    bodyMarkdown: "",
  }));

  return {
    id: sectionId,
    orderIndex: index + 1,
    h2Text,
    anchorId: generateAnchorId(h2Text, index),
    targetWordCount: 350,
    actualWordCount: 0,
    searchIntentRole: role,
    bodyMarkdown: "",
    subHeadings,
    includeComparisonTable: role === "comparison-matrix",
    includeKeyTakeawayCallout: true,
    keyTakeawayText: "",
    infographicConfig: {
      id: `vis-${sectionId}`,
      sectionId,
      templateId: tpl.templateId,
      templateSlug: tpl.templateSlug,
      templateName: tpl.templateName,
      headline: h2Text,
      subheadline: primaryKeyword
        ? `Key visual breakdown for ${primaryKeyword}`
        : "Structured visual takeaway for this section",
      paletteId: index % 2 === 0 ? "indigo-cyber" : "emerald-growth",
      aspectRatio: "16:9",
      nodes: [
        {
          id: "n1",
          badge: "01",
          title: subHeadingLines[0] || "Core Principle",
          detail: "Align section structure with reader search intent.",
          metricValue: "Step 1",
        },
        {
          id: "n2",
          badge: "02",
          title: subHeadingLines[1] || "Execution Pattern",
          detail: "Pair concise prose with an editable diagram.",
          metricValue: "Step 2",
        },
        {
          id: "n3",
          badge: "03",
          title: subHeadingLines[2] || "Verified Outcome",
          detail: "Back claims with E-E-A-T citations & benchmarks.",
          metricValue: "Step 3",
        },
      ],
      footerSourceLabel: "DoItWithAI.tools · Visual SEO Studio",
      altText: `${h2Text} — ${tpl.templateName} infographic`,
    },
  };
}

/**
 * Deterministic outline parser: turns pasted H2/H3 lines (`##`, `H2:`, `-`, `1.`, etc.)
 * into a structured BlogSectionNode[] tree with automatic 25-template visual assignment.
 */
export function parseRawOutlineIntoSections(
  rawOutline: string,
  primaryKeyword: string
): BlogSectionNode[] {
  const lines = rawOutline
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const grouped: { h2: string; h3s: string[] }[] = [];
  for (const line of lines) {
    const isH3 =
      /^###\s+/.test(line) ||
      /^h3\s*[:\-]/i.test(line) ||
      /^\d+\.\d+\s+/.test(line) ||
      (grouped.length > 0 && /^[-*•]\s+/.test(line));

    const cleaned = line
      .replace(/^#{1,6}\s+/, "")
      .replace(/^h[1-6]\s*[:\-]\s*/i, "")
      .replace(/^(?:\d+(?:\.\d+)?[.)]|[-*•])\s+/, "")
      .trim();

    if (!cleaned) continue;
    if (isH3 && grouped.length > 0) {
      grouped[grouped.length - 1].h3s.push(cleaned);
    } else {
      grouped.push({ h2: cleaned, h3s: [] });
    }
  }

  return grouped.map((g, idx) => buildSectionFromHeading(g.h2, idx, primaryKeyword, g.h3s));
}

export default function Stage1InputHub({
  project,
  onChange,
  onRunAiOutline,
  onNextStage,
  onProceedToNextStage,
  isGeneratingOutline = false,
}: Stage1InputHubProps) {
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [rawOutlineDraft, setRawOutlineDraft] = useState(() =>
    project.sections
      .map(
        (s) =>
          `H2: ${s.h2Text}${
            s.subHeadings.length ? `\n${s.subHeadings.map((sub) => `  H3: ${sub.h3Text}`).join("\n")}` : ""
          }`
      )
      .join("\n")
  );
  const [competitorHeadingsInput, setCompetitorHeadingsInput] = useState("");
  const [parseFeedback, setParseFeedback] = useState<string | null>(null);

  const proceed = onNextStage ?? onProceedToNextStage;

  const titlePx = useMemo(
    () => measureTitlePixelWidth(project.metaPack.metaTitle),
    [project.metaPack.metaTitle]
  );
  const descPx = useMemo(
    () => measureMetaDescriptionPixelWidth(project.metaPack.metaDescription),
    [project.metaPack.metaDescription]
  );

  const titlePct = Math.min(100, Math.round((titlePx / 580) * 100));
  const descPct = Math.min(100, Math.round((descPx / 920) * 100));

  const titleStatusColor =
    titlePx >= 280 && titlePx <= 580
      ? "bg-emerald-500 text-emerald-300"
      : titlePx <= 610
        ? "bg-amber-500 text-amber-300"
        : "bg-rose-500 text-rose-300";

  const descStatusColor =
    descPx >= 450 && descPx <= 920 ? "bg-emerald-500 text-emerald-300" : "bg-amber-500 text-amber-300";

  const updateCluster = (patch: Partial<KeywordClusterPack>) => {
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      keywordCluster: {
        ...project.keywordCluster,
        ...patch,
      },
    });
  };

  const updateMeta = (patch: Partial<CanonicalBlogProjectState["metaPack"]>) => {
    const nextMeta = { ...project.metaPack, ...patch };
    nextMeta.metaTitlePixelWidth = measureTitlePixelWidth(nextMeta.metaTitle);
    nextMeta.metaDescriptionPixelWidth = measureMetaDescriptionPixelWidth(nextMeta.metaDescription);
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      metaPack: nextMeta,
    });
  };

  const handleAutoOptimizeMetaFromKeyword = () => {
    const pk = project.keywordCluster.primaryKeyword.trim() || "AI Blog Writer";
    const year = "2026";
    const capPk = pk.replace(/\b\w/g, (c) => c.toUpperCase());
    let candidateTitle = `${capPk}: Complete SEO & Visual Guide (${year})`;
    while (measureTitlePixelWidth(candidateTitle) > 575 && candidateTitle.length > 32) {
      candidateTitle = candidateTitle.replace(/\s+\S+$/, "");
    }
    const slug = normalizeSeoSlug(project.metaPack.urlSlug || candidateTitle, pk);
    const baseSite = (project.brandSiteUrl || "https://doitwithai.tools").replace(/\/+$/, "");
    const desc = `Learn how to master ${pk} in ${year} with semantic keyword clustering, editable section infographics, E-E-A-T citations, and JSON-LD schema.`;
    const h1 =
      project.metaPack.h1Title.trim() ||
      `How to Use ${capPk} to Rank on Google & AI Search (${year} Complete Guide)`;

    updateMeta({
      h1Title: h1,
      metaTitle: candidateTitle,
      metaDescription: desc.slice(0, 155),
      urlSlug: slug,
      canonicalUrl: `${baseSite}/ai-seo/${slug}`,
      titleVariations: [
        {
          title: candidateTitle,
          pixelWidth: measureTitlePixelWidth(candidateTitle),
          ctrScore: 96,
          angle: "Primary Keyword Front-Loaded + Year",
        },
        {
          title: `Free ${capPk} & Visual Studio (Rank #1 in ${year})`,
          pixelWidth: measureTitlePixelWidth(`Free ${capPk} & Visual Studio (Rank #1 in ${year})`),
          ctrScore: 94,
          angle: "Commercial Free Hook + Outcome",
        },
        {
          title: `${capPk} vs Basic Tools: 6-Stage SEO Architecture`,
          pixelWidth: measureTitlePixelWidth(`${capPk} vs Basic Tools: 6-Stage SEO Architecture`),
          ctrScore: 91,
          angle: "Comparison & Mechanism Curiosity",
        },
      ],
    });
  };

  const handleParseCustomOutline = () => {
    const parsed = parseRawOutlineIntoSections(
      rawOutlineDraft,
      project.keywordCluster.primaryKeyword
    );
    if (parsed.length === 0) {
      setParseFeedback("Add at least one H2 heading line before parsing.");
      return;
    }
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      sections: parsed,
    });
    setParseFeedback(
      `Parsed ${parsed.length} H2 sections and mapped each section to one of the 25 infographic templates.`
    );
  };

  const handleExtractCompetitorGaps = () => {
    const lines = splitList(competitorHeadingsInput);
    const pk = project.keywordCluster.primaryKeyword || "your topic";
    const gapHeadings = [
      ...lines.slice(0, 4).map((h) => `${h.replace(/^#+\s*/, "")} (Upgraded with 2026 Benchmarks)`),
      `Side-by-Side Comparison Matrix: Top ${pk} Approaches Compared`,
      `Editable Visual Checklist & Common Mistakes to Avoid`,
      `Verified E-E-A-T Evidence, ROI Data & Implementation Roadmap`,
    ];
    const sections = gapHeadings.map((h, i) => buildSectionFromHeading(h, i, pk));
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      sections,
    });
    setParseFeedback(
      `Synthesized ${sections.length} gap-beating H2 sections (including comparison matrix & visual checklist).`
    );
  };

  const handleSynthesizeFromSourceText = () => {
    const raw = project.rawUserBriefOrSourceText.trim();
    const pk = project.keywordCluster.primaryKeyword || project.projectTitle || "Core Guide";
    const paragraphs = raw
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 25);

    const headings =
      paragraphs.length >= 2
        ? paragraphs.slice(0, 6).map((p, idx) => {
            const firstSentence = p.split(/[.!?]/)[0]?.trim() || `Key Insight #${idx + 1}`;
            return firstSentence.split(/\s+/).slice(0, 10).join(" ");
          })
        : [
            `What Is ${pk} and Why It Matters in 2026`,
            `Step-by-Step ${pk} Implementation Workflow`,
            `${pk} Comparison Matrix: Traditional vs Autonomous Studio`,
            `Actionable ${pk} Launch Checklist & KPIs`,
          ];

    const sections = headings.map((h, i) => buildSectionFromHeading(h, i, pk));
    onChange({
      ...project,
      updatedAtIso: new Date().toISOString(),
      sections,
    });
    setParseFeedback(
      `Generated ${sections.length} structured H2 sections with auto-assigned infographic templates.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Workflow Mode + Stage Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <span>Stage 1 of 6 · Multi-Mode Input Hub & SERP Intent Engine</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Configure Your Keyword Cluster, Input Source & Live Google SERP Snippet
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Choose any of the 6 entry workflows below. Pixel widths, URL slugs, and search intent classify deterministically in &lt;5ms at 0 token cost.
          </p>
        </div>

        {/* Express vs Guided Mode Switcher */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            type="button"
            onClick={() =>
              onChange({ ...project, workflowMode: "guided-6-stage", updatedAtIso: new Date().toISOString() })
            }
            className={`rounded-lg px-3 py-2 font-semibold transition ${
              project.workflowMode === "guided-6-stage"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧭 6-Stage Guided Studio
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...project, workflowMode: "express-one-click", updatedAtIso: new Date().toISOString() })
            }
            className={`rounded-lg px-3 py-2 font-semibold transition ${
              project.workflowMode === "express-one-click"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ 1-Click Express Mode
          </button>
        </div>
      </div>

      {/* 6 Input Mode Tabs */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {INPUT_MODES.map((mode) => {
          const active = project.inputMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() =>
                onChange({
                  ...project,
                  inputMode: mode.id,
                  updatedAtIso: new Date().toISOString(),
                })
              }
              className={`rounded-xl border p-3.5 text-left transition ${
                active
                  ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                <span>{mode.badge}</span>
                {active && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-200">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm font-bold text-white">{mode.label}</div>
              <p className="mt-0.5 text-xs text-slate-400">{mode.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Main 12-Col Grid: Left = Mode Inputs + Voice/Author, Right = Live <580px SERP Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 columns */}
        <div className="space-y-5 lg:col-span-7">
          {/* Core Project & Keyword Card (Always Visible) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                1. Project Title & Primary Keyword Cluster
              </h3>
              <button
                type="button"
                onClick={() => {
                  const detected = classifyKeywordSearchIntent(
                    project.keywordCluster.primaryKeyword,
                    project.keywordCluster.secondaryKeywords
                  );
                  updateCluster({ searchIntent: detected });
                }}
                className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
              >
                ⚡ Auto-Classify Search Intent (0 Tokens)
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Working Article / Project Title
                </label>
                <input
                  type="text"
                  value={project.projectTitle}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      projectTitle: e.target.value,
                      updatedAtIso: new Date().toISOString(),
                    })
                  }
                  placeholder="e.g., Complete Guide to AI Blog Writing in 2026"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Primary Target Keyword
                </label>
                <input
                  type="text"
                  value={project.keywordCluster.primaryKeyword}
                  onChange={(e) => updateCluster({ primaryKeyword: e.target.value })}
                  placeholder="e.g., ai blog writer"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mode-Specific Panel */}
            {project.inputMode === "keyword-cluster" && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Secondary Keywords (comma or newline separated)
                    </label>
                    <textarea
                      rows={3}
                      value={project.keywordCluster.secondaryKeywords.join(", ")}
                      onChange={(e) =>
                        updateCluster({ secondaryKeywords: splitList(e.target.value) })
                      }
                      placeholder="ai content writer, ai article writer, free blog post generator"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Semantic LSI Entities (for 75%+ coverage check)
                    </label>
                    <textarea
                      rows={3}
                      value={project.keywordCluster.lsiEntities.join(", ")}
                      onChange={(e) => updateCluster({ lsiEntities: splitList(e.target.value) })}
                      placeholder="search intent, E-E-A-T citations, JSON-LD BlogPosting schema, sentence burstiness"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    People-Also-Ask / Question Keywords (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={project.keywordCluster.questionKeywords.join("\n")}
                    onChange={(e) =>
                      updateCluster({
                        questionKeywords: e.target.value
                          .split(/\r?\n/)
                          .map((q) => q.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Does Google penalize AI blog writer content in 2026?"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {project.inputMode === "topic-idea" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Topic Idea, Core Thesis & Reader Outcome
                  </label>
                  <textarea
                    rows={4}
                    value={project.rawUserBriefOrSourceText}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        rawUserBriefOrSourceText: e.target.value,
                        updatedAtIso: new Date().toISOString(),
                      })
                    }
                    placeholder="Describe the topic, the problem your reader is solving, and the #1 takeaway..."
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSynthesizeFromSourceText}
                  className="rounded-xl bg-indigo-600/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  ⚡ Build Initial H2 Outline + Visual Map from Topic Brief
                </button>
              </div>
            )}

            {project.inputMode === "custom-outline" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Paste Raw H2 / H3 Outline (prefix H3s with `###`, `H3:`, or `-`)
                  </label>
                  <textarea
                    rows={6}
                    value={rawOutlineDraft}
                    onChange={(e) => setRawOutlineDraft(e.target.value)}
                    placeholder={
                      "H2: Why Single-Prompt AI Writers Fail Audits\n  H3: The 3 Fatal Flaws of Raw Chatbot Drafts\nH2: How Our 6-Stage AI Blog Studio Works Step-by-Step"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleParseCustomOutline}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  ⚡ Parse H2/H3 Lines into Interactive Outline + 25-Template Visuals
                </button>
              </div>
            )}

            {project.inputMode === "competitor-gap" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Paste Competitor H2 Headings, Claims, or URLs to Outrank
                  </label>
                  <textarea
                    rows={5}
                    value={competitorHeadingsInput}
                    onChange={(e) => setCompetitorHeadingsInput(e.target.value)}
                    placeholder={
                      "What is an AI Blog Writer?\nTop 5 AI Writing Tools\nPricing & Plans"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExtractCompetitorGaps}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  ⚡ Generate Gap-Beating H2 Outline + Comparison Matrix
                </button>
              </div>
            )}

            {project.inputMode === "pdf-transcript" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Paste Extracted PDF Text, YouTube Transcript, or Research Notes
                  </label>
                  <textarea
                    rows={6}
                    value={project.rawUserBriefOrSourceText}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        rawUserBriefOrSourceText: e.target.value,
                        updatedAtIso: new Date().toISOString(),
                      })
                    }
                    placeholder="Paste raw text from your PDF report, webinar transcript, or field notes..."
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSynthesizeFromSourceText}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  ⚡ Convert Source Notes into Structured H2 Outline
                </button>
              </div>
            )}

            {project.inputMode === "custom-prompt" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Custom Editorial Prompt & Formatting Rules
                  </label>
                  <textarea
                    rows={5}
                    value={project.customUserInstructions}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        customUserInstructions: e.target.value,
                        updatedAtIso: new Date().toISOString(),
                      })
                    }
                    placeholder="e.g., Write with short 2–4 sentence paragraphs, include a concrete comparison matrix, embed editable visual infographics under every H2, and avoid robotic AI clichés."
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {parseFeedback && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                ✓ {parseFeedback}
              </div>
            )}
          </div>

          {/* Search Intent, Brand Voice, POV & E-E-A-T Author Credentials */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              2. Search Intent, Brand Voice & E-E-A-T Author Identity
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300">Search Intent</label>
                <select
                  value={project.keywordCluster.searchIntent}
                  onChange={(e) =>
                    updateCluster({
                      searchIntent: e.target.value as KeywordClusterPack["searchIntent"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {SEARCH_INTENTS.map((intent) => (
                    <option key={intent} value={intent}>
                      {intent}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Tone of Voice</label>
                <select
                  value={project.keywordCluster.toneOfVoice}
                  onChange={(e) =>
                    updateCluster({
                      toneOfVoice: e.target.value as KeywordClusterPack["toneOfVoice"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {TONES_OF_VOICE.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Point of View (POV)</label>
                <select
                  value={project.keywordCluster.pointOfView}
                  onChange={(e) =>
                    updateCluster({
                      pointOfView: e.target.value as KeywordClusterPack["pointOfView"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {POINTS_OF_VIEW.map((pov) => (
                    <option key={pov} value={pov}>
                      {pov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">Target Audience</label>
                <input
                  type="text"
                  value={project.keywordCluster.targetAudience}
                  onChange={(e) => updateCluster({ targetAudience: e.target.value })}
                  placeholder="SEO Strategists, Content Marketers, SaaS Founders"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Brand / Canonical Site URL</label>
                <input
                  type="text"
                  value={project.brandSiteUrl}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      brandSiteUrl: e.target.value,
                      updatedAtIso: new Date().toISOString(),
                    })
                  }
                  placeholder="https://doitwithai.tools"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Author Name (JSON-LD `Person` Schema)
                </label>
                <input
                  type="text"
                  value={project.authorName}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      authorName: e.target.value,
                      updatedAtIso: new Date().toISOString(),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Author Role & E-E-A-T Credentials
                </label>
                <input
                  type="text"
                  value={project.authorRoleAndCredentials}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      authorRoleAndCredentials: e.target.value,
                      updatedAtIso: new Date().toISOString(),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 columns: Live Google SERP Pixel Preview (<580px / <920px) + H1/Slug Controls */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                3. Live Google SERP Pixel Simulator
              </h3>
              <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`rounded-md px-2.5 py-1 font-medium ${
                    serpDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-400"
                  }`}
                >
                  Desktop (&lt;580px)
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`rounded-md px-2.5 py-1 font-medium ${
                    serpDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-400"
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Simulated Google Card */}
            <div
              className={`rounded-xl border border-slate-700/80 bg-white p-4 text-slate-900 shadow-inner ${
                serpDevice === "mobile" ? "max-w-sm" : "w-full"
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  AI
                </span>
                <div className="truncate">
                  <div className="font-medium text-slate-800">
                    {(project.brandSiteUrl || "https://doitwithai.tools").replace(/^https?:\/\//, "")}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {project.brandSiteUrl || "https://doitwithai.tools"} › ai-seo ›{" "}
                    {project.metaPack.urlSlug || "your-slug"}
                  </div>
                </div>
              </div>
              <div className="mt-1.5 text-base font-semibold leading-snug text-[#1a0dab] hover:underline">
                {project.metaPack.metaTitle || "Enter a Meta Title below to preview pixel width..."}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#4d5156]">
                {project.metaPack.metaDescription ||
                  "Enter a Meta Description below (target 500px–920px / 120–158 characters) to preview your Google snippet."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleAutoOptimizeMetaFromKeyword}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                ✨ Auto-Synthesize &lt;580px Meta Pack from Primary Keyword
              </button>
              <button
                type="button"
                onClick={() => {
                  const clean = normalizeSeoSlug(
                    project.metaPack.urlSlug || project.metaPack.h1Title || project.projectTitle,
                    project.keywordCluster.primaryKeyword
                  );
                  const baseSite = (project.brandSiteUrl || "https://doitwithai.tools").replace(/\/+$/, "");
                  updateMeta({ urlSlug: clean, canonicalUrl: `${baseSite}/ai-seo/${clean}` });
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Clean URL Slug
              </button>
            </div>

            {/* Meta Title + <580px Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">Meta Title Tag</label>
                <span className="font-mono text-[11px] text-slate-300">
                  {titlePx}px / 580px ({project.metaPack.metaTitle.length} chars)
                </span>
              </div>
              <input
                type="text"
                value={project.metaPack.metaTitle}
                onChange={(e) => updateMeta({ metaTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${titleStatusColor.split(" ")[0]}`}
                  style={{ width: `${titlePct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Safe desktop window: <span className="text-slate-200">320px – 580px</span> (prevents ellipsis truncation).
              </p>
            </div>

            {/* Meta Description + <920px Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">Meta Description</label>
                <span className="font-mono text-[11px] text-slate-300">
                  {descPx}px / 920px ({project.metaPack.metaDescription.length} chars)
                </span>
              </div>
              <textarea
                rows={3}
                value={project.metaPack.metaDescription}
                onChange={(e) => updateMeta({ metaDescription: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${descStatusColor.split(" ")[0]}`}
                  style={{ width: `${descPct}%` }}
                />
              </div>
            </div>

            {/* H1, URL Slug & 50-Word AEO Direct Answer */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">H1 Article Heading</label>
                <input
                  type="text"
                  value={project.metaPack.h1Title}
                  onChange={(e) => updateMeta({ h1Title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Clean URL Slug</label>
                <input
                  type="text"
                  value={project.metaPack.urlSlug}
                  onChange={(e) => updateMeta({ urlSlug: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">
                  50-Word AI Overview (AEO) Direct Answer Box
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  {project.metaPack.aeoDirectAnswer50Words.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={3}
                value={project.metaPack.aeoDirectAnswer50Words}
                onChange={(e) => updateMeta({ aeoDirectAnswer50Words: e.target.value })}
                placeholder="Concise 40–60 word direct definition placed immediately under the H1 for Google AI Overviews and Perplexity citations..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* CTR Title Variations */}
            {project.metaPack.titleVariations.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Click a CTR Title Variation to Apply
                </div>
                {project.metaPack.titleVariations.map((variation, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateMeta({ metaTitle: variation.title })}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/90 px-3 py-2 text-left text-xs hover:border-indigo-500/60"
                  >
                    <span className="truncate text-slate-200">{variation.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-emerald-400">
                      {variation.pixelWidth}px · CTR {variation.ctrScore}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage 1 Footer Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="text-xs text-slate-400">
          Current Outline:{" "}
          <span className="font-semibold text-white">{project.sections.length} H2 Sections</span> ·{" "}
          Intent: <span className="font-semibold text-indigo-300">{project.keywordCluster.searchIntent}</span>
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
                ? "Running Pass #1 Strategy & Outline..."
                : "🤖 Generate AI Strategy & H2 Outline (Pass #1)"}
            </button>
          )}
          {proceed && (
            <button
              type="button"
              onClick={proceed}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-cyan-500"
            >
              Continue to Stage 2: Outline & 25-Template Visual Architect →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
