"use client";

import React, { useState } from "react";
import {
  GRAND_BLOG_WRITER_EXECUTIVE_SUMMARY,
  FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD,
  GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES,
  BLOG_INFOGRAPHIC_25_TEMPLATES,
} from "@/lib/founder-hub/grand-blog-writer-blueprint";

export default function GrandBlogWriterBlueprintSection() {
  const [activeTab, setActiveTab] = useState<
    "phases" | "founder-discussion" | "visual-25-templates" | "token-architecture"
  >("phases");
  const [collapsed, setCollapsed] = useState(false);

  const [phaseChecked, setPhaseChecked] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES) {
      map[p.id] = p.completed;
    }
    return map;
  });

  const togglePhase = (id: string) => {
    setPhaseChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES.filter(
    (p) => phaseChecked[p.id]
  ).length;
  const totalPhases = GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES.length;
  const progressPercent = Math.round((completedCount / totalPhases) * 100);

  return (
    <section
      aria-label="Grand AI Blog, Article & Content Writer Studio Master Blueprint"
      className="bg-slate-950 text-slate-100 border-b border-indigo-500/40"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/40 p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-indigo-500/25 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  👑 Flagship Product Blueprint · 62-Tool Orchestrator
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  25+ Canva / Napkin.ai Blog Infographic Templates
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  Phase Progress: {completedCount}/{totalPhases} ({progressPercent}%)
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                {GRAND_BLOG_WRITER_EXECUTIVE_SUMMARY.flagshipTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                Unifying <code className="text-indigo-300 font-mono">ai blog writer</code> (14.8K/mo),{" "}
                <code className="text-indigo-300 font-mono">ai content writer</code> (18.1K/mo), and{" "}
                <code className="text-indigo-300 font-mono">ai article writer</code> (12.1K/mo) into a
                single autonomous 62-tool production studio with deterministic 0-token SEO analyzers,
                25+ editable section infographic templates, IndexedDB 500MB+ project storage, and 1-click
                Master <code className="text-emerald-300 font-mono">.ZIP</code> bundle export.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition"
              >
                {collapsed ? "▼ Expand Flagship Blueprint" : "▲ Collapse Box"}
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Combined Keyword Volume
                  </div>
                  <div className="text-xl font-black text-white mt-1">53,300+ / mo</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    AI Blog + Content + Article + Infographic Cluster
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Backend Tools Chained
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    62 Specialized Tools
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    47 Zero-Token Deterministic + 15 AI-Assisted
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                    Editable Blog Visual Studio
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    25+ Infographic + 14 Quote Cards
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    &lt;20ms HTML5 Canvas/SVG · $0 API Cost · Live Editable
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Storage & Export Engine
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    IndexedDB + Master .ZIP
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    500MB+ Browser Project History + 6-Folder ZIP Pack
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: "phases" as const,
                    label: "🚀 1. 10-Phase Implementation Series (Separate Roadmap)",
                    badge: `${completedCount}/${totalPhases} Phases`,
                  },
                  {
                    id: "founder-discussion" as const,
                    label: "💬 2. Complete Founder Discussion & Strategy Log (Separate Record)",
                    badge: `${FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD.length} Decisions`,
                  },
                  {
                    id: "visual-25-templates" as const,
                    label: "🎨 3. 25-Template Canva / Napkin.ai Blog Infographic Studio Spec",
                    badge: "25 Templates",
                  },
                  {
                    id: "token-architecture" as const,
                    label: "⚡ 4. Token-Saving Architecture, IndexedDB & Master .ZIP Spec",
                    badge: "Zero-Conflict",
                  },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25"
                          : "bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: 10-PHASE IMPLEMENTATION SERIES */}
              {activeTab === "phases" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-900/80 border border-indigo-500/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        Sequential Implementation Progress Tracker
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Documented separately per Founder instruction. Phase 1 begins on the next
                        execution turn.
                      </p>
                    </div>
                    <div className="w-full sm:w-64 bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.max(progressPercent, 4)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES.map((phase) => {
                      const isDone = Boolean(phaseChecked[phase.id]);
                      return (
                        <div
                          key={phase.id}
                          className={`rounded-2xl border p-5 space-y-3 transition ${
                            isDone
                              ? "border-emerald-500/45 bg-emerald-950/20"
                              : "border-slate-800 bg-slate-950/90"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => togglePhase(phase.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                    : "bg-slate-900 border-slate-600 text-transparent hover:border-indigo-400"
                                }`}
                                aria-label={`Toggle ${phase.title}`}
                              >
                                ✓
                              </button>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold font-mono">
                                    Phase #{phase.phaseNumber}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-300">
                                    Token Budget: {phase.estimatedTokenCost}
                                  </span>
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                                  {phase.title}
                                </h3>
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 self-start sm:self-center ${
                                isDone
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {isDone ? "✅ Completed & Live" : `⏳ ${phase.status}`}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {phase.primaryObjective}
                          </p>

                          <div className="space-y-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                              Key Engineering Deliverables:
                            </div>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {phase.keyDeliverables.map((d, i) => (
                                <li key={i}>• {d}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Connected Ecosystem Tools:
                            </span>
                            {phase.connectedEcosystemTools.map((t) => (
                              <code
                                key={t}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 font-mono"
                              >
                                /tools/{t}
                              </code>
                            ))}
                          </div>

                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Target Files:
                            </span>
                            {phase.targetFiles.map((f) => (
                              <code
                                key={f}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 font-mono"
                              >
                                {f}
                              </code>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FOUNDER DISCUSSION & VISION LOG */}
              {activeTab === "founder-discussion" && (
                <div className="space-y-4">
                  {FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">
                        {item.questionOrRequirement}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                            Founder Requirement & Strategic Context
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.founderIntentSummary}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                            Engineered Solution & Architecture
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.architecturalDecision}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Connected Routes / Files:
                        </span>
                        {item.connectedToolsOrFiles.map((c) => (
                          <code
                            key={c}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 font-mono"
                          >
                            {c}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: 25+ INFOGRAPHIC TEMPLATES */}
              {activeTab === "visual-25-templates" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                  <div className="p-4 border-b border-slate-800">
                    <h3 className="text-base font-extrabold text-white">
                      25 Deterministic Canva / Napkin.ai-Style Blog Infographic Templates (/tools/blog-section-infographic-generator)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Zero API cost, &lt;20ms HTML5 Canvas/SVG rendering, zero misspelled text, and 100% live node-by-node editing inside the Grand AI Blog Writer.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-900/95 border-b border-slate-800 text-slate-300">
                        <tr>
                          <th className="p-3 font-bold">#</th>
                          <th className="p-3 font-bold">Template Name & Slug</th>
                          <th className="p-3 font-bold">Visual Family</th>
                          <th className="p-3 font-bold">Auto-Mapped Blog Section Type</th>
                          <th className="p-3 font-bold">Live Editable Canva-Style Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {BLOG_INFOGRAPHIC_25_TEMPLATES.map((tpl) => (
                          <tr key={tpl.id} className="hover:bg-slate-900/40 align-top">
                            <td className="p-3 font-mono font-bold text-indigo-300">#{tpl.id}</td>
                            <td className="p-3 font-bold text-white">
                              <div>{tpl.name}</div>
                              <code className="text-[11px] text-slate-400 font-mono">
                                {tpl.slug}
                              </code>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                                {tpl.family}
                              </span>
                            </td>
                            <td className="p-3 text-emerald-300 font-semibold">
                              {tpl.bestForSectionType}
                            </td>
                            <td className="p-3 text-slate-300">{tpl.editableFields}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TOKEN-SAVING, INDEXEDDB & MASTER .ZIP SPEC */}
              {activeTab === "token-architecture" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                      1. Hybrid Token-Minimization Engine
                    </div>
                    <h4 className="text-base font-extrabold text-white">
                      47 Zero-Token Deterministic Tools + 2 Compact JSON LLM Passes
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      <li>
                        • <strong>Shared CanonicalBlogProjectState</strong>: Prevents tool-to-tool contradictions by keeping keyword cluster, meta pack, outline, draft sections, visuals, schema, and social posts in one synchronized object.
                      </li>
                      <li>
                        • <strong>0-Token Deterministic Engines (&lt;15ms)</strong>: Pixel width (&lt;580px), slug optimizer, H1–H6 validator, LSI coverage, Flesch readability, burstiness/originality heatmap, TOC anchors, JSON-LD @graph compiler, CWV HTML serializer, and all 25 Canvas visual templates.
                      </li>
                      <li>
                        • <strong>2 Structured LLM Passes (~3.5K–5.5K tokens total)</strong>: Routed through our 4-Tier Multi-Key Gemini → Groq → OpenRouter failover engine.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                      2. Browser Project History (IndexedDB)
                    </div>
                    <h4 className="text-base font-extrabold text-white">
                      500MB+ Local Workspace Persistence (Zero DB Cost)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      <li>
                        • <strong>Why Not localStorage Alone?</strong> Browser localStorage caps at 5MB (fills up after 2–3 blogs with PNG infographics).
                      </li>
                      <li>
                        • <strong>DoItWithAI_BlogStudio_DB (IndexedDB)</strong>: Stores 50+ full 2,500-word projects alongside their rendered 1080p PNG/SVG visuals, quiz widgets, and version snapshots directly in the user&apos;s browser.
                      </li>
                      <li>
                        • <strong>Portable .blogproject.json</strong>: 1-click export/import to move projects across devices or share with editors.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                      3. Master .ZIP Production Bundle
                    </div>
                    <h4 className="text-base font-extrabold text-white">
                      1-Click Complete Publishing & Campaign Archive
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed font-mono">
                      <li>📁 /article/article-clean-cwv.html</li>
                      <li>📁 /article/article.md + Gutenberg HTML</li>
                      <li>📁 /visuals/hero-1200x630.png + section-1..N.png</li>
                      <li>📁 /seo-technical/schema-graph.json + meta.html</li>
                      <li>📁 /engagement/interactive-reader-quiz.html</li>
                      <li>📁 /social-distribution/omnichannel-pack.md + utm.csv</li>
                      <li>📁 /project-backup/blog-project-state.json</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
