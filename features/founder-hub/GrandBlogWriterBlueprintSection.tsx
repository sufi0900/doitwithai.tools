"use client";

import React, { useState } from "react";
import {
  MASTER_AI_ARCHITECT_IDENTITY,
  MULTI_AI_NAMING_AND_DAILY_READ_PROTOCOL,
  DAILY_MULTI_AI_NEWS_FEED,
  GRAND_BLOG_WRITER_EXECUTIVE_SUMMARY,
  FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD,
  GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES,
  BLOG_INFOGRAPHIC_25_TEMPLATES,
} from "@/lib/founder-hub/grand-blog-writer-blueprint";

export default function GrandBlogWriterBlueprintSection() {
  const [activeTab, setActiveTab] = useState<
    | "phases"
    | "daily-news-feed"
    | "founder-discussion"
    | "visual-25-templates"
    | "multi-ai-protocol"
  >("phases");
  const [collapsed, setCollapsed] = useState(false);
  const [copiedPhaseId, setCopiedPhaseId] = useState<string | null>(null);

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

  const handleCopyPrompt = async (id: string, promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPhaseId(id);
      setTimeout(() => setCopiedPhaseId(null), 2500);
    } catch {
      // ignore
    }
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
          {/* Header with Master AI Identity Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-indigo-500/25 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  👑 Master AI Architect · {MASTER_AI_ARCHITECT_IDENTITY.codename}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  Phase 1 Shipped &amp; Live · {completedCount}/{totalPhases} Phases ({progressPercent}%)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  62 Tools + 25 Canva/Napkin Visual Templates
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                {GRAND_BLOG_WRITER_EXECUTIVE_SUMMARY.flagshipTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                Authored &amp; maintained by{" "}
                <strong className="text-indigo-300">
                  {MASTER_AI_ARCHITECT_IDENTITY.codename} ({MASTER_AI_ARCHITECT_IDENTITY.officialTitle})
                </strong>
                . Every implementation phase below includes complete{" "}
                <strong className="text-emerald-300">Upstream &amp; Downstream Hand-Off Contracts</strong>{" "}
                and a 1-click copyable prompt so any AI expert can build any phase seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition"
              >
                {collapsed ? "▼ Expand Flagship Blueprint & News" : "▲ Collapse Box"}
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: "phases" as const,
                    label: "🚀 1. 10-Phase Implementation Series & Multi-AI Hand-Off Contracts",
                    badge: `${completedCount}/${totalPhases} Done`,
                  },
                  {
                    id: "daily-news-feed" as const,
                    label: "📰 2. Live Daily Multi-AI News, Commits & Updates Feed",
                    badge: `${DAILY_MULTI_AI_NEWS_FEED.length} Broadcasts`,
                  },
                  {
                    id: "founder-discussion" as const,
                    label: "💬 3. Founder Discussion & Strategy Log (Separate Record)",
                    badge: `${FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD.length} Decisions`,
                  },
                  {
                    id: "visual-25-templates" as const,
                    label: "🎨 4. 25-Template Canva / Napkin.ai Blog Infographic Studio",
                    badge: "25 Templates",
                  },
                  {
                    id: "multi-ai-protocol" as const,
                    label: "🤖 5. Multi-AI Naming, Signature & Daily Read Protocol",
                    badge: "Mandatory Rule",
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

              {/* TAB 1: 10-PHASE IMPLEMENTATION SERIES WITH UPSTREAM/DOWNSTREAM HANDOFFS */}
              {activeTab === "phases" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-900/80 border border-indigo-500/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        10-Phase Flagship Build Progress ({completedCount} of {totalPhases} Phases Completed — {progressPercent}%)
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Phase 1 is completed and live in <code className="text-emerald-300 font-mono">lib/blog-writer/*</code>. Each phase card below contains exact upstream imports, deliverables, downstream exports, and a copyable prompt for any AI expert.
                      </p>
                    </div>
                    <div className="w-full sm:w-64 bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.max(progressPercent, 8)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES.map((phase) => {
                      const isDone = Boolean(phaseChecked[phase.id]);
                      return (
                        <div
                          key={phase.id}
                          className={`rounded-2xl border p-5 space-y-4 transition ${
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
                                  {phase.completedByAi && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-200">
                                      Shipped by: {phase.completedByAi}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                                  {phase.title}
                                </h3>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyPrompt(phase.id, phase.copyPasteAiPrompt)
                                }
                                className="px-3 py-1.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 text-xs font-bold transition"
                              >
                                {copiedPhaseId === phase.id
                                  ? "✓ Copied AI Hand-Off Prompt!"
                                  : "📋 Copy Prompt for Any AI Expert"}
                              </button>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  isDone
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {isDone ? "✅ Completed & Live" : `⏳ ${phase.status}`}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {phase.primaryObjective}
                          </p>

                          {/* Upstream & Downstream Hand-Off Boxes */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                                ⬆️ Upstream Connection (How This Connects to Previous Phase)
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                {phase.upstreamConnection}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                                ⬇️ Downstream Hand-Off Contract (Exports for Next Phase)
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                {phase.downstreamHandoff}
                              </p>
                            </div>
                          </div>

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

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-300 font-semibold italic">
                            <span>— Signed by: {phase.signedBy}</span>
                            <span className="text-slate-500 not-italic font-mono">
                              Multi-AI Unified Spec
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE DAILY MULTI-AI NEWS, COMMITS & UPDATES FEED */}
              {activeTab === "daily-news-feed" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      📰 Daily Multi-AI News, Shipped Commits &amp; Cross-Agent Broadcast Feed
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Every AI coding agent working on <code className="text-indigo-300 font-mono">doitwithai.tools</code> MUST read this feed first to see what was pushed today and log its own signed entry after every commit.
                    </p>
                  </div>

                  {DAILY_MULTI_AI_NEWS_FEED.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold font-mono">
                            {entry.dateIso} · {entry.pktTimestamp}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            🤖 {entry.authorAiCodename} ({entry.authorAiTitle})
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                            {entry.updateCategory}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Commits: <strong className="text-white">{entry.commitShas.join(", ")}</strong>
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-white">{entry.headline}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {entry.detailedSummary}
                      </p>

                      <div className="rounded-xl bg-amber-950/25 border border-amber-500/30 p-3 text-xs">
                        <div className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                          📢 Mandatory Hand-Off Note for Next AI Agent:
                        </div>
                        <p className="text-slate-200 mt-1">{entry.whatNextAiMustKnow}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Files Touched:
                        </span>
                        {entry.filesTouched.map((f) => (
                          <code
                            key={f}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 font-mono"
                          >
                            {f}
                          </code>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-emerald-300 italic">
                        {entry.signatureLine}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: FOUNDER DISCUSSION & VISION LOG */}
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
                            Founder Requirement &amp; Strategic Context
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.founderIntentSummary}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                            Engineered Solution &amp; Architecture
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.architecturalDecision}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-indigo-300 italic">
                        — Signed by: {item.signedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: 25+ INFOGRAPHIC TEMPLATES */}
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
                          <th className="p-3 font-bold">Template Name &amp; Slug</th>
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

              {/* TAB 5: MULTI-AI NAMING, SIGNATURE & DAILY READ PROTOCOL */}
              {activeTab === "multi-ai-protocol" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-indigo-500/40 bg-slate-950/90 p-5 space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                      👑 Primary Lead AI Identity
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      {MASTER_AI_ARCHITECT_IDENTITY.codename} · {MASTER_AI_ARCHITECT_IDENTITY.officialTitle}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {MASTER_AI_ARCHITECT_IDENTITY.primaryResponsibilities.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300">
                      Required Signature Line: {MASTER_AI_ARCHITECT_IDENTITY.signatureFormat}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
                    <h4 className="text-base font-extrabold text-white">
                      {MULTI_AI_NAMING_AND_DAILY_READ_PROTOCOL.ruleTitle}
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      {MULTI_AI_NAMING_AND_DAILY_READ_PROTOCOL.rules.map((rule, idx) => (
                        <li key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          {rule}
                        </li>
                      ))}
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
