"use client";

/**
 * Phase 5 Stage 3 UI Deliverable: 4-Tier AI Long-Form Drafting Engine, Per-Section Co-Pilot & AI Humanizer
 * File: features/blog-writer-studio/components/Stage3DraftingAndCopilot.tsx
 *
 * Connects directly to POST /api/blog-writer/generate (app/api/blog-writer/generate/route.ts)
 * and provides:
 *  - 1-Click Full Article + Pack Generation (Pass #2 via 4-Tier Failover)
 *  - Per-Section AI Co-Pilot Toolbar (Rewrite, Expand, Humanize Burstiness, Add Comparison Table,
 *    Add 50-Word AEO Box, Regenerate Visual Nodes)
 *  - Live Burstiness (σ), Anti-Cliché Footprint, and Provider Tier Telemetry
 *
 * — Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 */

import React, { useState } from "react";
import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
import {
  analyzeReadabilityAndBurstiness,
  applyOneClickSeoAutoFixes,
} from "@/lib/blog-writer/deterministic-analyzers";
import type { SectionCopilotAction } from "@/app/api/blog-writer/generate/route";

export interface Stage3DraftingAndCopilotProps {
  project: CanonicalBlogProjectState;
  onChange: (updated: CanonicalBlogProjectState) => void;
  onAdvanceToStage4?: () => void;
}

const COPILOT_ACTIONS: {
  id: SectionCopilotAction;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    id: "humanize-burstiness",
    label: "✨ Humanize & Boost Burstiness",
    badge: "σ ≥ 6.0",
    description: "Strips AI clichés and alternates punchy 6-word sentences with deep analysis.",
  },
  {
    id: "expand-examples",
    label: "📈 Expand with B2B Examples",
    badge: "+150w",
    description: "Injects concrete real-world implementation metrics and empirical proof.",
  },
  {
    id: "rewrite",
    label: "⚡ Sharpen & Tighten Prose",
    badge: "Active Voice",
    description: "Rewrites for executive clarity and front-loaded LSI entity prominence.",
  },
  {
    id: "add-comparison-table",
    label: "📊 Add Comparison Matrix",
    badge: "Markdown Table",
    description: "Generates a structured 4-column comparison table for Featured Snippets.",
  },
  {
    id: "add-aeo-box",
    label: "🎯 Add 50-Word AEO Callout",
    badge: "AI Overviews",
    description: "Creates an encyclopedic takeaway box optimized for LLM citations.",
  },
  {
    id: "regenerate-visual-nodes",
    label: "🎨 Refresh Infographic Nodes",
    badge: "25 Templates",
    description: "Synthesizes 4 fresh data nodes and KPIs for this section's visual diagram.",
  },
];

export function Stage3DraftingAndCopilot({
  project,
  onChange,
  onAdvanceToStage4,
}: Stage3DraftingAndCopilotProps) {
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [activeCopilotKey, setActiveCopilotKey] = useState<string | null>(null);
  const [customInstructionBySec, setCustomInstructionBySec] = useState<Record<string, string>>({});
  const [lastProviderUsed, setLastProviderUsed] = useState<string>(
    "4-Tier Multi-Key Router Ready (Gemini -> Groq -> OpenRouter -> Deterministic)"
  );
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const fullArticleText = [
    project.metaPack.aeoDirectAnswer50Words,
    ...project.sections.map(
      (s) =>
        `${s.h2Text}\n${s.bodyMarkdown}\n${s.subHeadings
          .map((sub) => `${sub.h3Text}\n${sub.bodyMarkdown}`)
          .join("\n")}`
    ),
  ].join("\n\n");

  const stats = analyzeReadabilityAndBurstiness(fullArticleText);

  async function handleGenerateFullArticle() {
    setIsGeneratingFull(true);
    setStatusBanner("Running Pass #2 Long-Form Drafting Engine across H2 sections, FAQs, Quiz & Social Pack...");
    try {
      const response = await fetch("/api/blog-writer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-full-article-and-pack",
          project,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        updatedProject?: CanonicalBlogProjectState;
        providerUsed?: string;
        latencyMs?: number;
      };
      if (payload.updatedProject) {
        onChange(payload.updatedProject);
        if (payload.providerUsed) setLastProviderUsed(payload.providerUsed);
        if (typeof payload.latencyMs === "number") setLastLatencyMs(payload.latencyMs);
        setStatusBanner(
          `✅ Full article, 5 FAQs, 5 Quiz MCQs, and 6-Channel Social Pack generated via ${payload.providerUsed || "4-Tier Router"}!`
        );
      }
    } catch {
      const fallback = applyOneClickSeoAutoFixes(project);
      onChange(fallback);
      setStatusBanner("⚡ Applied local deterministic SEO synthesis & auto-fix.");
    } finally {
      setIsGeneratingFull(false);
    }
  }

  async function handleRunSectionCopilot(
    sectionId: string,
    copilotAction: SectionCopilotAction
  ) {
    const key = `${sectionId}:${copilotAction}`;
    setActiveCopilotKey(key);
    try {
      const response = await fetch("/api/blog-writer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "section-copilot-action",
          project,
          sectionId,
          copilotAction,
          customCopilotInstruction: customInstructionBySec[sectionId] || "",
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        updatedProject?: CanonicalBlogProjectState;
        providerUsed?: string;
        latencyMs?: number;
      };
      if (payload.updatedProject) {
        onChange(payload.updatedProject);
        if (payload.providerUsed) setLastProviderUsed(payload.providerUsed);
        if (typeof payload.latencyMs === "number") setLastLatencyMs(payload.latencyMs);
        setStatusBanner(
          `✅ Executed "${copilotAction}" on section ${sectionId} via ${payload.providerUsed || "Co-Pilot"}.`
        );
      }
    } catch {
      const fallback = applyOneClickSeoAutoFixes(project);
      onChange(fallback);
    } finally {
      setActiveCopilotKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Command Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span>⚡ Stage 3 · 4-Tier Long-Form Drafting Engine & Section Co-Pilot</span>
              {lastLatencyMs !== null && (
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[11px] text-indigo-200">
                  {lastLatencyMs}ms
                </span>
              )}
            </div>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              Humanized Long-Form Drafting & Per-Section AI Co-Pilot
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Generate your complete multi-section article, 50-word AEO answer, comparison tables, 5 FAQs, 5 Quiz MCQs, and 6-channel social pack—or refine individual H2 sections with micro-actions.
            </p>
            <p className="mt-1.5 text-xs text-emerald-300/90">
              Active Engine: <span className="font-mono font-semibold">{lastProviderUsed}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateFullArticle}
              disabled={isGeneratingFull}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-500 disabled:opacity-60"
            >
              {isGeneratingFull ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing Full Article & Pack...</span>
                </>
              ) : (
                <>
                  <span>🚀 Generate Full Article, FAQs, Quiz & Social Pack</span>
                </>
              )}
            </button>

            {onAdvanceToStage4 && (
              <button
                type="button"
                onClick={onAdvanceToStage4}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
              >
                <span>Open Stage 4 Rich Editor & Scorecard →</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Telemetry Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-xs text-slate-400">Total Article Words</div>
            <div className="mt-0.5 text-lg font-bold text-white">
              {stats.wordCount.toLocaleString()} words
            </div>
            <div className="text-[11px] text-slate-400">
              {project.sections.length} H2 Sections · {project.faqs.length} FAQs
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-xs text-slate-400">Sentence Burstiness (σ)</div>
            <div className="mt-0.5 text-lg font-bold text-emerald-400">
              σ = {stats.burstinessStdDev}
            </div>
            <div className="text-[11px] text-slate-400">
              Benchmark: σ ≥ 5.5 (Human Rhythm)
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-xs text-slate-400">Human Originality Score</div>
            <div className="mt-0.5 text-lg font-bold text-indigo-300">
              {stats.humanOriginalityScore}/100
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.aiClichesDetected.length} AI Clichés Detected
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-xs text-slate-400">Readability (Flesch)</div>
            <div className="mt-0.5 text-lg font-bold text-amber-300">
              {stats.fleschReadingEase} / 100
            </div>
            <div className="text-[11px] text-slate-400">
              Grade-8/9 Executive Clarity
            </div>
          </div>
        </div>

        {statusBanner && (
          <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/50 px-4 py-2.5 text-xs font-medium text-indigo-200">
            {statusBanner}
          </div>
        )}
      </div>

      {/* Per-Section Co-Pilot Cards */}
      <div className="space-y-4">
        {project.sections.map((sec, idx) => {
          const secStats = analyzeReadabilityAndBurstiness(
            `${sec.bodyMarkdown}\n${sec.subHeadings.map((s) => s.bodyMarkdown).join("\n")}`
          );

          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
                    H2 #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{sec.h2Text}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Anchor: #{sec.anchorId}</span>
                      <span>·</span>
                      <span>Role: {sec.searchIntentRole}</span>
                      <span>·</span>
                      <span className="text-emerald-300">
                        Visual: #{sec.infographicConfig?.templateId}{" "}
                        {sec.infographicConfig?.templateName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200">
                    {secStats.wordCount} words
                  </span>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                    σ = {secStats.burstinessStdDev}
                  </span>
                </div>
              </div>

              {/* Co-Pilot Action Pills */}
              <div className="mt-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Per-Section AI Co-Pilot Micro-Actions (&lt;600 Tokens)
                  </span>
                  <input
                    type="text"
                    value={customInstructionBySec[sec.id] || ""}
                    onChange={(e) =>
                      setCustomInstructionBySec((prev) => ({
                        ...prev,
                        [sec.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional custom co-pilot focus (e.g. 'add SaaS pricing metrics')..."
                    className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {COPILOT_ACTIONS.map((act) => {
                    const isRunning = activeCopilotKey === `${sec.id}:${act.id}`;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        disabled={Boolean(activeCopilotKey)}
                        onClick={() => handleRunSectionCopilot(sec.id, act.id)}
                        title={act.description}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white disabled:opacity-50"
                      >
                        <span>{isRunning ? "⏳ Running..." : act.label}</span>
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-indigo-300">
                          {act.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Section Markdown Editor */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Section Body Markdown (Editable)
                  </label>
                  <textarea
                    rows={5}
                    value={sec.bodyMarkdown}
                    onChange={(e) => {
                      const nextSections = project.sections.map((s) =>
                        s.id === sec.id
                          ? {
                              ...s,
                              bodyMarkdown: e.target.value,
                              actualWordCount: e.target.value
                                .split(/\s+/)
                                .filter(Boolean).length,
                            }
                          : s
                      );
                      onChange({
                        ...project,
                        updatedAtIso: new Date().toISOString(),
                        sections: nextSections,
                      });
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Paired Visual Infographic Nodes
                  </div>
                  <div className="space-y-1.5">
                    {(sec.infographicConfig?.nodes || []).slice(0, 4).map((node) => (
                      <div
                        key={node.id}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-300">
                          <span>
                            [{node.badge}] {node.title}
                          </span>
                          {node.metricValue && (
                            <span className="text-[11px] text-emerald-400">
                              {node.metricValue}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                          {node.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Stage3DraftingAndCopilot;
