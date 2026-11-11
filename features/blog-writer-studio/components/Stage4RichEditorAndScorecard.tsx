"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  BlogInfographicConfig,
  BlogSectionNode,
  CanonicalBlogProjectState,
} from "@/lib/blog-writer/canonical-state";
import {
  applyOneClickSeoAutoFixes,
  measureMetaDescriptionPixelWidth,
  measureTitlePixelWidth,
  runFullDeterministicSeoScorecard,
} from "@/lib/blog-writer/deterministic-analyzers";
import { BlogInfographicStudio } from "@/features/blog-infographic-studio/BlogInfographicStudio";
import {
  generateBlogInfographicSvg,
  renderBlogInfographicToCanvas,
  ASPECT_RATIO_DIMENSIONS,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import {
  PRISM_LAYOUTS,
  withPrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import type { SectionCopilotAction } from "@/app/api/blog-writer/generate/route";
export interface Stage4RichEditorAndScorecardProps {
  project: CanonicalBlogProjectState;
  onChange: (updated: CanonicalBlogProjectState) => void;
  onRunSectionCopilot?: (
    sectionId: string,
    action: SectionCopilotAction,
    customInstruction?: string,
  ) => Promise<void> | void;
  onAdvanceToStage5?: () => void;
}
type EditorViewMode = "rich-visual" | "markdown-source" | "semantic-html";
const QUICK_COPILOT_PILLS: {
  action: SectionCopilotAction;
  label: string;
  title: string;
}[] = [
  {
    action: "humanize-burstiness",
    label: "✨ Humanize (σ ≥ 6.0)",
    title: "Boost sentence burstiness and remove robotic phrasing",
  },
  {
    action: "expand-examples",
    label: "📈 Expand Examples",
    title: "Add concrete B2B benchmarks and implementation proof",
  },
  {
    action: "rewrite",
    label: "⚡ Tighten Prose",
    title: "Rewrite for active voice and semantic clarity",
  },
  {
    action: "add-comparison-table",
    label: "📊 + Comparison Table",
    title: "Generate a 4-column Markdown comparison matrix for this section",
  },
  {
    action: "add-aeo-box",
    label: "🎯 + 50w AEO Takeaway",
    title: "Add a 50-word executive takeaway callout box",
  },
  {
    action: "regenerate-visual-nodes",
    label: "🎨 Refresh Visual Data",
    title: "Synthesize 4 fresh KPI/diagram nodes for the section infographic",
  },
];
function InlineSectionInfographicCard({
  config,
  sectionIndex,
  onOpenModal,
  onQuickChangeConfig,
}: {
  config: BlogInfographicConfig;
  sectionIndex: number;
  onOpenModal: () => void;
  onQuickChangeConfig: (updated: BlogInfographicConfig) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualError, setVisualError] = useState("");
  const dims =
    ASPECT_RATIO_DIMENSIONS[config.aspectRatio] ||
    ASPECT_RATIO_DIMENSIONS["16:9"];
  useEffect(() => {
    if (!canvasRef.current) return;
    let stale = false;
    setVisualError("");
    const canvas = canvasRef.current;
    void renderBlogInfographicToCanvas(canvas, config).catch((error) => {
      if (stale) return;
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      setVisualError(
        error instanceof Error
          ? error.message
          : "Open the visual editor to complete this infographic.",
      );
    });
    return () => {
      stale = true;
    };
  }, [config]);
  function handleCycleTemplate(delta: number) {
    if (config.visualEngine === "prism-antv") {
      const index = PRISM_LAYOUTS.findIndex((l) => l.id === config.prismLayout);
      onQuickChangeConfig(
        withPrismLayout(
          config,
          PRISM_LAYOUTS[
            (Math.max(0, index) + delta + PRISM_LAYOUTS.length) %
              PRISM_LAYOUTS.length
          ].id,
        ),
      );
      return;
    }
    const currentIdx = BLOG_INFOGRAPHIC_25_TEMPLATES.findIndex(
      (t) => t.id === config.templateId,
    );
    const nextIdx =
      (Math.max(0, currentIdx) + delta + BLOG_INFOGRAPHIC_25_TEMPLATES.length) %
      BLOG_INFOGRAPHIC_25_TEMPLATES.length;
    const nextSpec = BLOG_INFOGRAPHIC_25_TEMPLATES[nextIdx];
    onQuickChangeConfig({
      ...config,
      templateId: nextSpec.id,
      templateSlug: nextSpec.slug,
      templateName: nextSpec.name,
      renderedSvgMarkup: undefined,
      renderedPngDataUrl: undefined,
    });
  }
  function handleDownloadSvg() {
    let svgMarkup: string;
    try {
      svgMarkup = generateBlogInfographicSvg(config);
    } catch (error) {
      setVisualError(
        error instanceof Error
          ? error.message
          : "Fix the infographic before exporting.",
      );
      return;
    }
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.templateSlug || "section-infographic"}-h2-${sectionIndex + 1}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/90 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
            {config.visualEngine
              ? "Editorial collection"
              : `Template #${config.templateId}/25`}
          </span>
          <span className="text-xs font-semibold text-white">
            {config.templateName}
          </span>
          <span className="hidden text-[11px] text-slate-400 sm:inline">
            · {config.aspectRatio}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleCycleTemplate(-1)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
            title="Previous infographic template"
          >
            ◀ Prev
          </button>
          <button
            type="button"
            onClick={() => handleCycleTemplate(1)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
            title="Next infographic template"
          >
            Next ▶
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
          >
            ⬇ SVG
          </button>
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1 text-xs font-bold text-white shadow transition hover:from-indigo-400 hover:to-violet-500"
          >
            <span>Customize infographic</span>
          </button>
        </div>
      </div>

      {visualError && (
        <p
          role="alert"
          className="m-3 rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-xs leading-relaxed text-amber-200"
        >
          {visualError} Open “Customize infographic” to adjust the content or
          format.
        </p>
      )}
      <div
        className={`relative items-center justify-center bg-slate-950 p-3 ${visualError ? "hidden" : "flex"}`}
      >
        <canvas
          ref={canvasRef}
          width={dims.width}
          height={dims.height}
          onClick={onOpenModal}
          style={{ aspectRatio: `${dims.width} / ${dims.height}` }}
          className="h-auto w-full max-w-3xl cursor-pointer rounded-xl border border-slate-800 shadow-md transition hover:border-indigo-500/60"
          title="Click to edit this section infographic"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 bg-slate-950/80 px-4 py-2 text-[11px] text-slate-400">
        <span>
          Alt Text: <strong className="text-slate-300">{config.altText}</strong>
        </span>
        <span className="text-emerald-400">
          {dims.width} × {dims.height} · {config.aspectRatio}
        </span>
      </div>
    </div>
  );
}
function MarkdownTablePreview({ markdown }: { markdown: string }) {
  const lines = markdown
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  if (lines.length < 2) {
    return (
      <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300">
        {markdown}
      </pre>
    );
  }
  const parseRow = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const headers = parseRow(lines[0]);
  const dataRows = lines
    .slice(1)
    .filter((l) => !/^\|[\s:-]+\|/.test(l))
    .map(parseRow);
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
      <table className="w-full border-collapse text-left text-xs text-slate-200">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/90 text-indigo-300">
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5 font-bold">
                {h.replace(/\*\*/g, "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-900/40">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2 text-slate-300">
                  {cell.replace(/\*\*/g, "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Stage4RichEditorAndScorecard({
  project,
  onChange,
  onRunSectionCopilot,
  onAdvanceToStage5,
}: Stage4RichEditorAndScorecardProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>("rich-visual");
  const [activeSectionId, setActiveSectionId] = useState<string>(
    project.sections[0]?.id || "sec-h2-1",
  );
  const [modalVisualSectionId, setModalVisualSectionId] = useState<
    string | null
  >(null);
  const [runningCopilotKey, setRunningCopilotKey] = useState<string | null>(
    null,
  );
  const [copiedBanner, setCopiedBanner] = useState<string | null>(null);
  const liveScorecard = useMemo(
    () => runFullDeterministicSeoScorecard(project),
    [project],
  );
  const fullBodyLower = useMemo(() => {
    return [
      project.metaPack.h1Title,
      project.metaPack.aeoDirectAnswer50Words,
      ...project.sections.map(
        (s) =>
          `${s.h2Text} ${s.bodyMarkdown} ${s.subHeadings
            .map((sub) => `${sub.h3Text} ${sub.bodyMarkdown}`)
            .join(
              " ",
            )} ${s.comparisonTableMarkdown || ""} ${s.keyTakeawayText || ""}`,
      ),
      ...project.faqs.map((f) => `${f.question} ${f.answer}`),
    ]
      .join(" ")
      .toLowerCase();
  }, [project]);
  const compiledFullMarkdown = useMemo(() => {
    const blocks: string[] = [
      `# ${project.metaPack.h1Title}`,
      "",
      `> **50-Word AEO Direct Answer:** ${project.metaPack.aeoDirectAnswer50Words}`,
      "",
      "## Key Executive Takeaways (TL;DR)",
      ...project.metaPack.tldrBullets.map((b) => `- ${b}`),
      "",
    ];
    project.sections.forEach((sec, idx) => {
      blocks.push(`## ${sec.h2Text} {#${sec.anchorId}}`);
      blocks.push("");
      blocks.push(
        `![${sec.infographicConfig?.altText || sec.h2Text}](../visuals/section-${idx + 1}-infographic.svg)`,
      );
      blocks.push("");
      if (sec.bodyMarkdown) {
        blocks.push(sec.bodyMarkdown);
        blocks.push("");
      }
      sec.subHeadings.forEach((sub) => {
        blocks.push(`### ${sub.h3Text}`);
        blocks.push(sub.bodyMarkdown || "");
        blocks.push("");
      });
      if (sec.includeComparisonTable && sec.comparisonTableMarkdown) {
        blocks.push(sec.comparisonTableMarkdown);
        blocks.push("");
      }
      if (sec.includeKeyTakeawayCallout && sec.keyTakeawayText) {
        blocks.push(`> ${sec.keyTakeawayText}`);
        blocks.push("");
      }
    });
    if (project.faqs.length > 0) {
      blocks.push("## Frequently Asked Questions (FAQ)");
      blocks.push("");
      project.faqs.forEach((f) => {
        blocks.push(`### ${f.question}`);
        blocks.push(f.answer);
        blocks.push("");
      });
    }
    return blocks.join("\n");
  }, [project]);
  const compiledSemanticHtmlPreview = useMemo(() => {
    const tocItems = project.sections
      .map((s) => `    <li><a href="#${s.anchorId}">${s.h2Text}</a></li>`)
      .join("\n");
    const sectionHtmlBlocks = project.sections
      .map((s, idx) => {
        const fetchAttr =
          idx === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"';
        const visualDims =
          ASPECT_RATIO_DIMENSIONS[s.infographicConfig?.aspectRatio || "16:9"];
        const subBlocks = s.subHeadings
          .map(
            (sub) =>
              `    <h3>${sub.h3Text}</h3>\n    <p>${(sub.bodyMarkdown || "").replace(/\n\n+/g, "</p>\n    <p>")}</p>`,
          )
          .join("\n");
        return [
          `  <section id="${s.anchorId}">`,
          `    <h2>${s.h2Text}</h2>`,
          `    <figure class="blog-section-infographic" style="aspect-ratio: ${visualDims.width} / ${visualDims.height};">`,
          `      <img src="/visuals/section-${idx + 1}-infographic.svg" alt="${s.infographicConfig?.altText || s.h2Text}" width="${visualDims.width}" height="${visualDims.height}" ${fetchAttr} decoding="async" />`,
          `      <figcaption>${s.infographicConfig?.headline || s.h2Text} — ${s.infographicConfig?.footerSourceLabel || "DoItWithAI.tools"}</figcaption>`,
          `    </figure>`,
          `    <p>${(s.bodyMarkdown || "").replace(/\n\n+/g, "</p>\n    <p>")}</p>`,
          subBlocks,
          s.includeKeyTakeawayCallout && s.keyTakeawayText
            ? `    <aside class="key-takeaway-callout">${s.keyTakeawayText}</aside>`
            : "",
          `  </section>`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
    const faqHtml =
      project.faqs.length > 0
        ? [
            `  <section aria-label="Frequently Asked Questions" id="faqs">`,
            `    <h2>Frequently Asked Questions</h2>`,
            ...project.faqs.map(
              (f) =>
                `    <details>\n      <summary><strong>${f.question}</strong></summary>\n      <p>${f.answer}</p>\n    </details>`,
            ),
            `  </section>`,
          ].join("\n")
        : "";
    return [
      `<article itemscope itemtype="https://schema.org/BlogPosting">`,
      `  <header>`,
      `    <h1 itemprop="headline">${project.metaPack.h1Title}</h1>`,
      `    <div class="aeo-direct-answer" role="region" aria-label="Quick Answer">`,
      `      <p><strong>Quick Answer:</strong> ${project.metaPack.aeoDirectAnswer50Words}</p>`,
      `    </div>`,
      `    <nav aria-label="Table of Contents">`,
      `      <strong>Table of Contents</strong>`,
      `      <ol>`,
      tocItems,
      `      </ol>`,
      `    </nav>`,
      `  </header>`,
      "",
      sectionHtmlBlocks,
      "",
      faqHtml,
      `</article>`,
    ].join("\n");
  }, [project]);
  function updateSection(
    sectionId: string,
    updater: (sec: BlogSectionNode) => BlogSectionNode,
  ) {
    const nextSections = project.sections.map((s) =>
      s.id === sectionId ? updater(s) : s,
    );
    const updated: CanonicalBlogProjectState = {
      ...project,
      updatedAtIso: new Date().toISOString(),
      sections: nextSections,
    };
    updated.scorecard = runFullDeterministicSeoScorecard(updated);
    onChange(updated);
  }
  async function triggerSectionCopilot(
    sectionId: string,
    action: SectionCopilotAction,
  ) {
    const key = `${sectionId}:${action}`;
    setRunningCopilotKey(key);
    try {
      if (onRunSectionCopilot) {
        await onRunSectionCopilot(sectionId, action);
      } else {
        const res = await fetch("/api/blog-writer/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "section-copilot-action",
            project,
            sectionId,
            copilotAction: action,
          }),
        });
        const data = (await res.json()) as {
          updatedProject?: CanonicalBlogProjectState;
        };
        if (data.updatedProject) {
          onChange(data.updatedProject);
        }
      }
    } finally {
      setRunningCopilotKey(null);
    }
  }
  function handleInsertMissingLsiEntity(entity: string) {
    const targetId = activeSectionId || project.sections[0]?.id;
    if (!targetId) return;
    updateSection(targetId, (sec) => {
      const addition = `\n\nIn practice, integrating **${entity}** directly into this stage strengthens both topical depth and reader comprehension.`;
      const nextBody = `${sec.bodyMarkdown.trim()}${addition}`;
      return {
        ...sec,
        bodyMarkdown: nextBody,
        actualWordCount: nextBody.split(/\s+/).filter(Boolean).length,
      };
    });
    setCopiedBanner(`✓ Wove semantic entity "${entity}" into section!`);
    setTimeout(() => setCopiedBanner(null), 2600);
  }
  function handleOneClickAutoFixAll() {
    let working = applyOneClickSeoAutoFixes(project);
    const missingEntities = working.keywordCluster.lsiEntities.filter(
      (ent) => !fullBodyLower.includes(ent.toLowerCase()),
    );
    if (missingEntities.length > 0 && working.sections.length > 0) {
      const entitySentence = `\n\n**Semantic Entity Alignment:** This workflow incorporates ${missingEntities
        .slice(0, 4)
        .map((e) => `**${e}**`)
        .join(", ")} to satisfy comprehensive search intent.`;
      working = {
        ...working,
        sections: working.sections.map((s, idx) =>
          idx === 0
            ? {
                ...s,
                bodyMarkdown: `${s.bodyMarkdown.trim()}${entitySentence}`,
              }
            : s,
        ),
      };
    }
    working.scorecard = runFullDeterministicSeoScorecard(working);
    onChange(working);
    setCopiedBanner(
      `✨ Auto-Fixed Meta Pixels, Slug, AI Clichés, H2 Infographics & LSI Coverage! Score: ${working.scorecard.overallScore}/100`,
    );
    setTimeout(() => setCopiedBanner(null), 3500);
  }
  function handleCopyText(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    setCopiedBanner(`✓ Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedBanner(null), 2500);
  }
  const activeModalSection = project.sections.find(
    (s) => s.id === modalVisualSectionId,
  );
  return (
    <div className="relative">
      {copiedBanner && (
        <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-2.5 text-xs font-semibold text-emerald-200 shadow-lg">
          {copiedBanner}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-md">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setViewMode("rich-visual")}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "rich-visual"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✨ Rich Visual & Section Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode("markdown-source")}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "markdown-source"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📝 Markdown Source
              </button>
              <button
                type="button"
                onClick={() => setViewMode("semantic-html")}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "semantic-html"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                💻 Clean Semantic HTML
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopyText(compiledFullMarkdown, "Full Article Markdown")
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                📋 Copy Markdown
              </button>
              {onAdvanceToStage5 && (
                <button
                  type="button"
                  onClick={onAdvanceToStage5}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
                >
                  Stage 5: Technical SEO & Schema →
                </button>
              )}
            </div>
          </div>

          {viewMode === "rich-visual" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-md">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-[11px] font-semibold text-indigo-300">
                    Single H1 + 50-Word AEO Power Answer + TOC Jump Links
                  </span>
                  <span className="text-xs text-slate-400">
                    {liveScorecard.totalWordCount.toLocaleString()} words · ~
                    {liveScorecard.estimatedReadingMinutes} min read
                  </span>
                </div>

                <label className="block text-xs font-semibold text-slate-400">
                  Article H1 Headline
                </label>
                <input
                  type="text"
                  value={project.metaPack.h1Title}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      projectTitle: e.target.value,
                      metaPack: {
                        ...project.metaPack,
                        h1Title: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-base font-bold text-white focus:border-indigo-500 focus:outline-none"
                />

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-400">
                        SERP Meta Title
                      </span>
                      <span
                        className={
                          project.metaPack.metaTitlePixelWidth <= 580
                            ? "font-mono text-emerald-400"
                            : "font-mono text-amber-400"
                        }
                      >
                        {project.metaPack.metaTitlePixelWidth}px / 580px
                      </span>
                    </div>
                    <input
                      type="text"
                      value={project.metaPack.metaTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({
                          ...project,
                          metaPack: {
                            ...project.metaPack,
                            metaTitle: val,
                            metaTitlePixelWidth: measureTitlePixelWidth(val),
                          },
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-400">
                        SERP Meta Description
                      </span>
                      <span
                        className={
                          project.metaPack.metaDescriptionPixelWidth <= 920
                            ? "font-mono text-emerald-400"
                            : "font-mono text-amber-400"
                        }
                      >
                        {project.metaPack.metaDescriptionPixelWidth}px / 920px
                      </span>
                    </div>
                    <input
                      type="text"
                      value={project.metaPack.metaDescription}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({
                          ...project,
                          metaPack: {
                            ...project.metaPack,
                            metaDescription: val,
                            metaDescriptionPixelWidth:
                              measureMetaDescriptionPixelWidth(val),
                          },
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">
                      🎯 Direct answer summary
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      {
                        project.metaPack.aeoDirectAnswer50Words
                          .split(/\s+/)
                          .filter(Boolean).length
                      }{" "}
                      words
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={project.metaPack.aeoDirectAnswer50Words}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        metaPack: {
                          ...project.metaPack,
                          aeoDirectAnswer50Words: e.target.value,
                        },
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-emerald-500/20 bg-slate-950/90 p-2.5 text-xs leading-relaxed text-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Table of Contents (#anchor-id Jump Links)
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.sections.map((sec, idx) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          activeSectionId === sec.id
                            ? "border-indigo-500 bg-indigo-500/20 font-semibold text-white"
                            : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {idx + 1}. #{sec.anchorId}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {project.sections.map((sec, idx) => {
                const isFocused = activeSectionId === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`rounded-2xl border p-5 shadow-md transition ${
                      isFocused
                        ? "border-indigo-500/50 bg-slate-900/95"
                        : "border-slate-800 bg-slate-900/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                          H2 #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.h2Text}
                          onChange={(e) =>
                            updateSection(sec.id, (s) => ({
                              ...s,
                              h2Text: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        #{sec.anchorId}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-[11px] font-semibold text-slate-400">
                        AI Co-Pilot:
                      </span>
                      {QUICK_COPILOT_PILLS.map((pill) => {
                        const isBusy =
                          runningCopilotKey === `${sec.id}:${pill.action}`;
                        return (
                          <button
                            key={pill.action}
                            type="button"
                            disabled={Boolean(runningCopilotKey)}
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerSectionCopilot(sec.id, pill.action);
                            }}
                            title={pill.title}
                            className="rounded-lg border border-slate-700/80 bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-white disabled:opacity-50"
                          >
                            {isBusy ? "⏳ Working..." : pill.label}
                          </button>
                        );
                      })}
                    </div>

                    {sec.infographicConfig && (
                      <InlineSectionInfographicCard
                        config={sec.infographicConfig}
                        sectionIndex={idx}
                        onOpenModal={() => setModalVisualSectionId(sec.id)}
                        onQuickChangeConfig={(nextCfg) =>
                          updateSection(sec.id, (s) => ({
                            ...s,
                            infographicConfig: nextCfg,
                          }))
                        }
                      />
                    )}

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Section Body Prose (Markdown)</span>
                        <span>
                          {sec.bodyMarkdown.split(/\s+/).filter(Boolean).length}{" "}
                          words
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={sec.bodyMarkdown}
                        onChange={(e) =>
                          updateSection(sec.id, (s) => ({
                            ...s,
                            bodyMarkdown: e.target.value,
                            actualWordCount: e.target.value
                              .split(/\s+/)
                              .filter(Boolean).length,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {sec.subHeadings.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-slate-800/80 pt-3">
                        <div className="text-xs font-semibold text-indigo-300">
                          H3 Subheadings ({sec.subHeadings.length})
                        </div>
                        {sec.subHeadings.map((sub, sIdx) => (
                          <div
                            key={sub.id}
                            className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                                H3.{sIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={sub.h3Text}
                                onChange={(e) =>
                                  updateSection(sec.id, (s) => ({
                                    ...s,
                                    subHeadings: s.subHeadings.map((item, i) =>
                                      i === sIdx
                                        ? { ...item, h3Text: e.target.value }
                                        : item,
                                    ),
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <textarea
                              rows={3}
                              value={sub.bodyMarkdown}
                              onChange={(e) =>
                                updateSection(sec.id, (s) => ({
                                  ...s,
                                  subHeadings: s.subHeadings.map((item, i) =>
                                    i === sIdx
                                      ? {
                                          ...item,
                                          bodyMarkdown: e.target.value,
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs leading-relaxed text-slate-300 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {(sec.includeComparisonTable ||
                      Boolean(sec.comparisonTableMarkdown)) && (
                      <div className="mt-4 rounded-xl border border-indigo-500/25 bg-indigo-950/15 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300">
                            📊 Structured Comparison Matrix (Featured Snippet
                            Ready)
                          </span>
                        </div>
                        {sec.comparisonTableMarkdown && (
                          <MarkdownTablePreview
                            markdown={sec.comparisonTableMarkdown}
                          />
                        )}
                        <textarea
                          rows={4}
                          value={sec.comparisonTableMarkdown || ""}
                          onChange={(e) =>
                            updateSection(sec.id, (s) => ({
                              ...s,
                              includeComparisonTable: true,
                              comparisonTableMarkdown: e.target.value,
                            }))
                          }
                          placeholder="| Criteria | Option A | Option B |"
                          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {(sec.includeKeyTakeawayCallout ||
                      Boolean(sec.keyTakeawayText)) && (
                      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/15 p-3">
                        <div className="text-xs font-bold text-amber-300">
                          💡 Section Executive Takeaway Callout
                        </div>
                        <textarea
                          rows={2}
                          value={sec.keyTakeawayText || ""}
                          onChange={(e) =>
                            updateSection(sec.id, (s) => ({
                              ...s,
                              includeKeyTakeawayCallout: true,
                              keyTakeawayText: e.target.value,
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-amber-500/20 bg-slate-950 p-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    ❓ Schema-Ready FAQ Pairs ({project.faqs.length} FAQs ·
                    Synced with FAQPage JSON-LD)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...project,
                        faqs: [
                          ...project.faqs,
                          {
                            id: `faq-${project.faqs.length + 1}`,
                            question: `How do I optimize ${project.keywordCluster.primaryKeyword} for AI search?`,
                            answer:
                              "Combine a 50-word direct definition, semantic LSI entities, zero-CLS visual diagrams, and validated JSON-LD schema.",
                          },
                        ],
                      })
                    }
                    className="rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25"
                  >
                    + Add FAQ Pair
                  </button>
                </div>

                <div className="space-y-3">
                  {project.faqs.map((faq, fIdx) => (
                    <div
                      key={faq.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3"
                    >
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const nextFaqs = project.faqs.map((item, i) =>
                            i === fIdx
                              ? { ...item, question: e.target.value }
                              : item,
                          );
                          onChange({ ...project, faqs: nextFaqs });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const nextFaqs = project.faqs.map((item, i) =>
                            i === fIdx
                              ? { ...item, answer: e.target.value }
                              : item,
                          );
                          onChange({ ...project, faqs: nextFaqs });
                        }}
                        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === "markdown-source" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Unified Markdown Source (
                    {liveScorecard.totalWordCount.toLocaleString()} words)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clean Markdown with #anchor-id headings, infographic figure
                    references, comparison tables, and FAQs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(compiledFullMarkdown, "Unified Markdown")
                  }
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  📋 Copy Full Markdown
                </button>
              </div>
              <pre className="max-h-[760px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200">
                {compiledFullMarkdown}
              </pre>
            </div>
          )}

          {viewMode === "semantic-html" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Clean Core Web Vitals Semantic &lt;article&gt; HTML
                  </h3>
                  <p className="text-xs text-slate-400">
                    Includes image dimensions matching each selected format,
                    source captions, alt text and loading attributes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      compiledSemanticHtmlPreview,
                      "Clean Semantic HTML",
                    )
                  }
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  📋 Copy Semantic HTML
                </button>
              </div>
              <pre className="max-h-[760px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">
                {compiledSemanticHtmlPreview}
              </pre>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Live Deterministic Audit (0 Tokens)
                </span>
                <h3 className="text-base font-bold text-white">
                  SEO, AEO & Originality Scorecard
                </h3>
              </div>
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400/60 bg-emerald-500/10">
                <span className="text-xl font-extrabold text-emerald-300">
                  {liveScorecard.overallScore}
                </span>
                <span className="text-[10px] font-semibold text-emerald-200">
                  / 100
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOneClickAutoFixAll}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
            >
              ✨ 1-Click Auto-Fix All SEO Warnings
            </button>

            <div className="space-y-2 border-b border-slate-800 pb-4">
              {[
                {
                  label: "Title & SERP Pixel Fit",
                  score: liveScorecard.titleAndSerpScore,
                },
                {
                  label: "H1–H3 Heading Hierarchy",
                  score: liveScorecard.headingScore,
                },
                {
                  label: "Keyword & LSI Entity Depth",
                  score: liveScorecard.keywordAndLsiScore,
                },
                {
                  label: "Human Burstiness & Anti-Cliché",
                  score: liveScorecard.humanOriginalityScore,
                },
                {
                  label: "Readability (Flesch Clarity)",
                  score: liveScorecard.readabilityScore,
                },
                {
                  label: "25-Template Visual Density",
                  score: liveScorecard.visualDensityScore,
                },
                {
                  label: "Technical Schema & Zero-CLS",
                  score: liveScorecard.technicalCwvScore,
                },
              ].map((pillar) => (
                <div key={pillar.label}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{pillar.label}</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {pillar.score}/100
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                      style={{ width: `${Math.min(100, pillar.score)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                <div className="text-[10px] text-slate-400">
                  Primary Keyword
                </div>
                <div className="mt-0.5 font-bold text-white">
                  {liveScorecard.primaryKeywordCount}x (
                  {liveScorecard.primaryKeywordDensityPercent}%)
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                <div className="text-[10px] text-slate-400">
                  Burstiness & Clichés
                </div>
                <div className="mt-0.5 font-bold text-emerald-300">
                  σ={liveScorecard.burstinessStdDev} ·{" "}
                  {liveScorecard.aiClichesDetected.length} Clichés
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Semantic LSI Entities (Click Unused to Insert)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.keywordCluster.lsiEntities.map((entity) => {
                  const isUsed = fullBodyLower.includes(entity.toLowerCase());
                  return (
                    <button
                      key={entity}
                      type="button"
                      onClick={() => {
                        if (!isUsed) handleInsertMissingLsiEntity(entity);
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                        isUsed
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                          : "border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-white"
                      }`}
                      title={
                        isUsed
                          ? `Found in article body: "${entity}"`
                          : `Click to weave "${entity}" into the active H2 section`
                      }
                    >
                      {isUsed ? `✓ ${entity}` : `+ ${entity}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="mb-2 text-xs font-bold text-white">
                7-Pillar Deterministic SEO Checks
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {liveScorecard.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200">
                        {chk.label}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          chk.status === "pass"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {chk.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Current:{" "}
                      <strong className="text-slate-200">
                        {chk.currentValue}
                      </strong>
                    </div>
                    {chk.status !== "pass" && (
                      <div className="mt-1 text-[11px] text-amber-300/90">
                        Fix: {chk.fixRecommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeModalSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <div className="relative max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-3xl border border-indigo-500/40 bg-slate-950 p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Embedded Section Visual Customizer · H2 #
                  {activeModalSection.orderIndex + 1}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {activeModalSection.h2Text}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalVisualSectionId(null)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                ✕ Close Visual Studio
              </button>
            </div>

            <BlogInfographicStudio
              mode="embedded-modal"
              initialConfig={activeModalSection.infographicConfig}
              sourceSection={activeModalSection}
              onSaveConfig={(updatedCfg) => {
                updateSection(activeModalSection.id, (sec) => ({
                  ...sec,
                  infographicConfig: updatedCfg,
                }));
                setModalVisualSectionId(null);
                setCopiedBanner(
                  `🎨 Updated infographic (${updatedCfg.templateName}) for "${activeModalSection.h2Text}"!`,
                );
                setTimeout(() => setCopiedBanner(null), 3000);
              }}
              onClose={() => setModalVisualSectionId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default Stage4RichEditorAndScorecard;
