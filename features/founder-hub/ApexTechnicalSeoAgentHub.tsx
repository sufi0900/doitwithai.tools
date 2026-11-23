"use client";

import React, { useState } from "react";
import {
  APEX_AGENT_IDENTITY,
  APEX_PAGESPEED_AUDIT_TABLE,
  APEX_CWV_PHASES,
  APEX_HISTORICAL_WORK_LEDGER,
} from "@/lib/founder-hub/apex-cwv-agent-data";

export default function ApexTechnicalSeoAgentHub() {
  const [activeSubTab, setActiveSubTab] = useState<
    "cwv-phases" | "pagespeed-audit" | "history-ledger" | "file-locks"
  >("cwv-phases");
  const [collapsed, setCollapsed] = useState(false);
  const [copiedBlogId, setCopiedBlogId] = useState<string | null>(null);

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of APEX_CWV_PHASES) {
      init[p.id] = p.completed;
      for (const st of p.checklistSteps) {
        init[st.id] = st.done;
      }
    }
    return init;
  });

  const toggleCheck = (key: string) => {
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyBlog = async (id: string, markdown: string) => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedBlogId(id);
      setTimeout(() => setCopiedBlogId(null), 2500);
    } catch {
      // ignore
    }
  };

  const completedPhasesCount = APEX_CWV_PHASES.filter((p) => checkedMap[p.id]).length;

  return (
    <section
      aria-label="Apex-CWV Technical SEO & Core Web Vitals Agent Hub"
      className="bg-slate-950 text-slate-100 border-b border-cyan-500/30"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Top Identity & Multi-AI Coordination Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-cyan-500/20 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                  🤖 Dedicated AI Agent Box · {APEX_AGENT_IDENTITY.shortCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  All 4 Core Web Vitals Phases Completed & Live (100%)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  {completedPhasesCount} / {APEX_CWV_PHASES.length} CWV Phases Done
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                {APEX_AGENT_IDENTITY.agentName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                {APEX_AGENT_IDENTITY.currentMission}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition"
              >
                {collapsed ? "▼ Expand Apex-CWV Command Box" : "▲ Collapse Box"}
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* Sub-Navigation Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: "cwv-phases" as const,
                    label: "⚡ 1. 4-Phase Core Web Vitals Execution Tracker",
                    badge: `${completedPhasesCount}/4 Done`,
                  },
                  {
                    id: "pagespeed-audit" as const,
                    label: "📊 2. PageSpeed Video Audit (62 & 56 -> 98+)",
                    badge: "4 Videos Analyzed",
                  },
                  {
                    id: "history-ledger" as const,
                    label: "🏛️ 3. Complete Work Archive (10 AI Agents + H1 Cluster + CWV)",
                    badge: `${APEX_HISTORICAL_WORK_LEDGER.length} Sprints`,
                  },
                  {
                    id: "file-locks" as const,
                    label: "🛡️ 4. Multi-AI File-Lock & Non-Interference Registry",
                    badge: "Zero Collision",
                  },
                ].map((tab) => {
                  const active = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSubTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                        active
                          ? "bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/25"
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

              {/* SUB-TAB 1: 4-PHASE CORE WEB VITALS EXECUTION TRACKER */}
              {activeSubTab === "cwv-phases" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {APEX_CWV_PHASES.map((phase) => {
                      const isDone = Boolean(checkedMap[phase.id]);
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
                                onClick={() => toggleCheck(phase.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                    : "bg-slate-900 border-slate-600 text-transparent hover:border-cyan-400"
                                }`}
                                aria-label={`Toggle completion for ${phase.title}`}
                              >
                                ✓
                              </button>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold font-mono">
                                    CWV Phase #{phase.phaseNumber}
                                  </span>
                                  <span className="text-xs font-mono text-slate-400">
                                    {phase.scheduledWindow}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-3 text-xs">
                              <div className="font-bold text-rose-300 uppercase tracking-wider text-[10px]">
                                Baseline Before Optimization
                              </div>
                              <div className="font-mono text-slate-200 mt-1">
                                {phase.baselineMetrics}
                              </div>
                            </div>
                            <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/30 p-3 text-xs">
                              <div className="font-bold text-emerald-300 uppercase tracking-wider text-[10px]">
                                Target After Optimization (Zero Visual Loss)
                              </div>
                              <div className="font-mono text-emerald-200 mt-1">
                                {phase.targetMetrics}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                              Engineering Root Causes Fixed in Phase {phase.phaseNumber}:
                            </div>
                            <ul className="space-y-1 text-xs text-slate-300 leading-relaxed">
                              {phase.rootCausesFixed.map((rc, i) => (
                                <li key={i}>• {rc}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                              Phase {phase.phaseNumber} Verification Checklist:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {phase.checklistSteps.map((st) => {
                                const stepDone = Boolean(checkedMap[st.id]) || isDone;
                                return (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => toggleCheck(st.id)}
                                    className="flex items-start gap-2 text-left text-xs text-slate-300 hover:text-white"
                                  >
                                    <span
                                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                        stepDone
                                          ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                          : "bg-slate-950 border-slate-700 text-transparent"
                                      }`}
                                    >
                                      ✓
                                    </span>
                                    <span className={stepDone ? "line-through text-slate-400" : ""}>
                                      {st.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Target Files:
                            </span>
                            {phase.filesTouched.map((f) => (
                              <code
                                key={f}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono"
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

              {/* SUB-TAB 2: PAGESPEED INSIGHTS VIDEO AUDIT TABLE */}
              {activeSubTab === "pagespeed-audit" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                  <div className="p-4 border-b border-slate-800">
                    <h3 className="text-base font-extrabold text-white">
                      PageSpeed Insights Video & Screenshot Root-Cause Matrix (Nov 10, 2026)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Extracted directly from the Founder&apos;s 4 uploaded PageSpeed Insights videos and full-page screenshot.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-900/95 border-b border-slate-800 text-slate-300">
                        <tr>
                          <th className="p-3 font-bold">Template / URL</th>
                          <th className="p-3 font-bold">Device</th>
                          <th className="p-3 font-bold">Score (Before → Target)</th>
                          <th className="p-3 font-bold">FCP</th>
                          <th className="p-3 font-bold">LCP</th>
                          <th className="p-3 font-bold">TBT</th>
                          <th className="p-3 font-bold">CLS</th>
                          <th className="p-3 font-bold">Diagnosed Code Root Cause</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {APEX_PAGESPEED_AUDIT_TABLE.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 align-top">
                            <td className="p-3 font-bold text-white">
                              <div>{row.pageName}</div>
                              <code className="text-[11px] text-cyan-300 font-mono">{row.url}</code>
                            </td>
                            <td className="p-3 font-mono">{row.device}</td>
                            <td className="p-3 font-mono">
                              <span className="text-rose-400 font-bold">{row.perfBefore}</span>
                              <span className="mx-1.5 text-slate-500">→</span>
                              <span className="text-emerald-400 font-extrabold">{row.perfTarget}</span>
                            </td>
                            <td className="p-3 font-mono">
                              {row.fcpBefore} → <span className="text-emerald-300">{row.fcpTarget}</span>
                            </td>
                            <td className="p-3 font-mono">
                              <span className="text-rose-300 font-semibold">{row.lcpBefore}</span> →{" "}
                              <span className="text-emerald-300 font-bold">{row.lcpTarget}</span>
                            </td>
                            <td className="p-3 font-mono">
                              {row.tbtBefore} → <span className="text-emerald-300">{row.tbtTarget}</span>
                            </td>
                            <td className="p-3 font-mono">
                              {row.clsBefore} → <span className="text-emerald-300">{row.clsTarget}</span>
                            </td>
                            <td className="p-3 text-slate-300 max-w-md leading-relaxed">
                              {row.primaryBottleneck}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: COMPLETE HISTORICAL WORK LEDGER */}
              {activeSubTab === "history-ledger" && (
                <div className="space-y-4">
                  {APEX_HISTORICAL_WORK_LEDGER.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
                            {item.date}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            {item.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            Commits: <strong className="text-white">{item.commits.join(", ")}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBlog(item.id, item.blogPostMarkdown)}
                            className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition"
                          >
                            {copiedBlogId === item.id
                              ? "✓ Copied Blog Post Markdown!"
                              : "📋 Copy as Founder Blog Post"}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        {item.title}
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                            Founder Discussion & Strategic Context
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.founderDiscussionSummary}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                            Apex-CWV Architectural Solution
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.technicalArchitectureSummary}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                          Shipped & Verified Deliverables:
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300 leading-relaxed">
                          {item.shippedDeliverables.map((d, i) => (
                            <li key={i}>• {d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Files Touched:
                        </span>
                        {item.filesOwned.map((f) => (
                          <code
                            key={f}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                          >
                            {f}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUB-TAB 4: MULTI-AI FILE-LOCK & NON-INTERFERENCE REGISTRY */}
              {activeSubTab === "file-locks" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {APEX_AGENT_IDENTITY.multiAiFileLockRegistry.map((agent, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {agent.agentName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{agent.scope}</p>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Dedicated Owned / Locked Files:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.lockedFiles.map((lf) => (
                            <code
                              key={lf}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono"
                            >
                              {lf}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
