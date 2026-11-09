"use client";

import React, { useState, useMemo, useCallback } from "react";
import FounderVideoPlaybook from "./FounderVideoPlaybook";
import {
  MULTI_AI_COLLABORATION_PROTOCOL,
  DAILY_ENGINEERING_VELOCITY,
  SPRINT_PROGRESS_BARS,
  FIVE_FEEDER_TOOLS_BUILD_QUEUE,
  EXECUTIVE_KPI_CARDS,
  GRAND_AI_CONTENT_WRITER_PIPELINE,
  H1_CLUSTER_DOMINATION_BLUEPRINT,
  WEEKLY_EXECUTION_SEQUENCE,
  SYSTEM_ARCHITECTURE_DEPENDENCY_MAP,
  FOUNDER_AI_CHANGELOG,
  type TableSheetData,
  type FounderWorkbookCore,
} from "@/lib/founder-hub/data";

interface Props {
  workbookCore: FounderWorkbookCore;
  handbookMarkdown: string;
  masterPromptText: string;
}

type MainTabId =
  | "overview"
  | "founder-ai-log"
  | "flagship-blueprints"
  | "keyword-plan-64"
  | "expansion-370"
  | "ctr-guides-brand"
  | "gsc-technical-audit"
  | "large-semrush-review"
  | "video-production"
  | "handbook-prompt"
  | "architecture-manual";

function exportRowsToCsv(filename: string, headers: string[], rows: string[][]) {
  const escapeCell = (val: string) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csvLines = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ];
  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function FiveFeederToolsQueueTracker({
  onOpenBlueprints,
}: {
  onOpenBlueprints?: () => void;
}) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of FIVE_FEEDER_TOOLS_BUILD_QUEUE) {
      init[item.id] = item.completed;
      item.checklistSteps.forEach((_, idx) => {
        init[`${item.id}-step-${idx}`] = item.checklistSteps[idx].done;
      });
    }
    return init;
  });

  const toggleCheck = (key: string) => {
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedToolsCount = FIVE_FEEDER_TOOLS_BUILD_QUEUE.filter(
    (t) => checkedMap[t.id]
  ).length;

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/35 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <span>⏰ Scheduled Autonomous Build · Nov 10, 2026 at 6:00 AM PKT</span>
            <span>·</span>
            <span>
              {completedToolsCount} / {FIVE_FEEDER_TOOLS_BUILD_QUEUE.length} Completed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            5 Dedicated Feeder Tools Build Queue & Bespoke Competitor Research Tracker (#58–#62)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            <strong>Founder Quality Directive:</strong> Every tool below applies the universal UX smoothness, SEO/AEO rigor, and 4-tier AI failover from our Testimonial Card Studio, while using{" "}
            <strong className="text-amber-300">
              100% unique, domain-specific interactive architecture and deep competitor research
            </strong>{" "}
            (no copied visual card templates where they don&apos;t belong). Tick marks automatically update to{" "}
            <code className="text-emerald-300 font-mono">[x]</code> as each tool ships.
          </p>
        </div>

        {onOpenBlueprints && (
          <button
            type="button"
            onClick={onOpenBlueprints}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold shrink-0"
          >
            🚀 View Full 8-Stage AI Writer Pipeline →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {FIVE_FEEDER_TOOLS_BUILD_QUEUE.map((tool) => {
          const isToolDone = Boolean(checkedMap[tool.id]);
          return (
            <div
              key={tool.id}
              className={`rounded-2xl border p-5 transition-all space-y-4 ${
                isToolDone
                  ? "border-emerald-500/50 bg-emerald-950/20"
                  : "border-slate-800 bg-slate-950/90"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCheck(tool.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black transition shrink-0 mt-0.5 sm:mt-0 ${
                      isToolDone
                        ? "bg-emerald-500 border-emerald-400 text-slate-950"
                        : "bg-slate-900 border-slate-600 text-transparent hover:border-amber-400"
                    }`}
                    aria-label={`Toggle completion for ${tool.title}`}
                  >
                    ✓
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold font-mono">
                        Order {tool.order}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                        Vol: {tool.searchVolume} · KD: {tool.kd}
                      </span>
                      <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs text-blue-300 font-mono">
                        {tool.route}
                      </code>
                    </div>
                    <h3
                      className={`text-base sm:text-lg font-extrabold mt-1.5 ${
                        isToolDone ? "line-through text-slate-400" : "text-white"
                      }`}
                    >
                      {tool.title}
                    </h3>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 self-start sm:self-center ${
                    isToolDone
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isToolDone ? "✅ Completed & Live" : tool.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    🎯 Primary Keyword & Competitor Benchmark
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong>Primary Keyword:</strong>{" "}
                    <code className="text-emerald-300 font-mono">{tool.primaryKeyword}</code>
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Competitors to Beat:</strong>{" "}
                    {tool.competitorBenchmark}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                    🛠️ Unique Domain-Specific Studio UX (Zero Generic Copy)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tool.uniqueUxArchitecture}
                  </p>
                </div>
              </div>

              {/* 5-Step Sub-Checklist per Tool */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  6:00 AM PKT Execution Checklist (Tick Marks Update as Each Step Completes):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tool.checklistSteps.map((st, idx) => {
                    const stepKey = `${tool.id}-step-${idx}`;
                    const stepDone = Boolean(checkedMap[stepKey]) || isToolDone;
                    return (
                      <button
                        key={stepKey}
                        type="button"
                        onClick={() => toggleCheck(stepKey)}
                        className="flex items-start gap-2 text-left text-xs text-slate-300 hover:text-white group"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            stepDone
                              ? "bg-emerald-500 border-emerald-400 text-slate-950"
                              : "bg-slate-950 border-slate-700 text-transparent group-hover:border-slate-500"
                          }`}
                        >
                          ✓
                        </span>
                        <span className={stepDone ? "line-through text-slate-500" : ""}>
                          {st.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GscVelocityOverviewChart() {
  const [activeMetrics, setActiveMetrics] = useState<{
    errorsFixed: boolean;
    improvementsShipped: boolean;
    routesAndToolsAdded: boolean;
    commitsPushed: boolean;
  }>({
    errorsFixed: true,
    improvementsShipped: true,
    routesAndToolsAdded: true,
    commitsPushed: true,
  });

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(
    DAILY_ENGINEERING_VELOCITY.length - 1
  );

  const totals = useMemo(() => {
    return DAILY_ENGINEERING_VELOCITY.reduce(
      (acc, d) => ({
        errorsFixed: acc.errorsFixed + d.errorsFixed,
        improvementsShipped: acc.improvementsShipped + d.improvementsShipped,
        routesAndToolsAdded: acc.routesAndToolsAdded + d.routesAndToolsAdded,
        commitsPushed: acc.commitsPushed + d.commitsPushed,
      }),
      {
        errorsFixed: 0,
        improvementsShipped: 0,
        routesAndToolsAdded: 0,
        commitsPushed: 0,
      }
    );
  }, []);

  const toggleMetric = (key: keyof typeof activeMetrics) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const width = 860;
  const height = 240;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = 24;

  const getX = (idx: number) =>
    padLeft +
    (idx / Math.max(1, DAILY_ENGINEERING_VELOCITY.length - 1)) * plotW;
  const getY = (val: number) =>
    padTop + plotH - (Math.min(val, maxVal) / maxVal) * plotH;

  const buildPath = (
    selector: (d: (typeof DAILY_ENGINEERING_VELOCITY)[0]) => number
  ) =>
    DAILY_ENGINEERING_VELOCITY.map(
      (d, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(selector(d)).toFixed(1)}`
    ).join(" ");

  const buildAreaPath = (
    selector: (d: (typeof DAILY_ENGINEERING_VELOCITY)[0]) => number
  ) => {
    const line = buildPath(selector);
    const firstX = getX(0).toFixed(1);
    const lastX = getX(DAILY_ENGINEERING_VELOCITY.length - 1).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const activePoint =
    hoveredIdx !== null
      ? DAILY_ENGINEERING_VELOCITY[hoveredIdx]
      : DAILY_ENGINEERING_VELOCITY[DAILY_ENGINEERING_VELOCITY.length - 1];

  const metricCards = [
    {
      key: "improvementsShipped" as const,
      label: "UI/UX & SEO Improvements",
      total: totals.improvementsShipped,
      sub: "Titles, H1s, schemas, layouts & CTR upgrades",
      colorHex: "#3b82f6",
      activeClass: "border-blue-500/70 bg-blue-950/40",
      dotClass: "bg-blue-500",
      textClass: "text-blue-300",
    },
    {
      key: "routesAndToolsAdded" as const,
      label: "New Routes, Tools & Assets",
      total: `${totals.routesAndToolsAdded}+`,
      sub: "104+ tools, 17 static Sanity guides & /founder-hub",
      colorHex: "#10b981",
      activeClass: "border-emerald-500/70 bg-emerald-950/40",
      dotClass: "bg-emerald-500",
      textClass: "text-emerald-300",
    },
    {
      key: "errorsFixed" as const,
      label: "Errors & Bugs Fixed",
      total: totals.errorsFixed,
      sub: "Canvas overlaps, imports, auth & build fixes",
      colorHex: "#f59e0b",
      activeClass: "border-amber-500/70 bg-amber-950/40",
      dotClass: "bg-amber-500",
      textClass: "text-amber-300",
    },
    {
      key: "commitsPushed" as const,
      label: "Commits & Milestones Pushed",
      total: totals.commitsPushed,
      sub: "Verified production releases to main branch",
      colorHex: "#a855f7",
      activeClass: "border-purple-500/70 bg-purple-950/40",
      dotClass: "bg-purple-500",
      textClass: "text-purple-300",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <span>📈 Google Search Console–Style Engineering & SEO Velocity</span>
            <span>·</span>
            <span>Live Sprint Tracker</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Daily Platform Progress: Errors Fixed, Improvements Shipped, Routes Added & Commits
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any metric card below to toggle its trend line on the interactive graph, or hover any date to inspect daily shipped milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Sprint Window:</span>
          <strong className="text-white font-mono">Oct 29 – Nov 10, 2026</strong>
        </div>
      </div>

      {/* 4 GSC-Style Clickable Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-5 pb-2">
        {metricCards.map((m) => {
          const isOn = activeMetrics[m.key];
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMetric(m.key)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isOn
                  ? `${m.activeClass} shadow-lg`
                  : "border-slate-800/80 bg-slate-950/50 opacity-55 hover:opacity-85"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-950 ${
                      isOn ? m.dotClass : "bg-slate-700"
                    }`}
                  >
                    {isOn ? "✓" : ""}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{m.label}</span>
                </div>
                <span className={`text-[10px] font-mono font-semibold ${m.textClass}`}>
                  {isOn ? "VISIBLE" : "HIDDEN"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-2.5">
                {m.total}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{m.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Interactive SVG Multi-Line Graph */}
      <div className="px-5 pt-3 pb-5">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/90 p-4">
          {/* Active Date Callout Banner */}
          {activePoint && (
            <div className="mb-3 pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono font-bold">
                  {activePoint.date}
                </span>
                <span className="text-slate-200 font-semibold">
                  {activePoint.highlightNote}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap">
                <span className="text-blue-300">
                  Improvements: <strong>{activePoint.improvementsShipped}</strong>
                </span>
                <span className="text-emerald-300">
                  Routes/Tools: <strong>{activePoint.routesAndToolsAdded}</strong>
                </span>
                <span className="text-amber-300">
                  Fixes: <strong>{activePoint.errorsFixed}</strong>
                </span>
                <span className="text-purple-300">
                  Commits: <strong>{activePoint.commitsPushed}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[640px] h-auto select-none"
            >
              <defs>
                <linearGradient id="gradImprovements" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradRoutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0, 6, 12, 18, 24].map((tick) => {
                const y = getY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray={tick === 0 ? undefined : "4 4"}
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              {activeMetrics.improvementsShipped && (
                <path
                  d={buildAreaPath((d) => d.improvementsShipped)}
                  fill="url(#gradImprovements)"
                />
              )}
              {activeMetrics.routesAndToolsAdded && (
                <path
                  d={buildAreaPath((d) => d.routesAndToolsAdded)}
                  fill="url(#gradRoutes)"
                />
              )}

              {/* Trend Lines */}
              {activeMetrics.improvementsShipped && (
                <path
                  d={buildPath((d) => d.improvementsShipped)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeMetrics.routesAndToolsAdded && (
                <path
                  d={buildPath((d) => d.routesAndToolsAdded)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeMetrics.errorsFixed && (
                <path
                  d={buildPath((d) => d.errorsFixed)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeMetrics.commitsPushed && (
                <path
                  d={buildPath((d) => d.commitsPushed)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.25"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points & Hover Columns */}
              {DAILY_ENGINEERING_VELOCITY.map((d, idx) => {
                const x = getX(idx);
                const isSelected = hoveredIdx === idx;
                return (
                  <g
                    key={d.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                  >
                    {isSelected && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Invisible wider hit target */}
                    <rect
                      x={x - 24}
                      y={padTop}
                      width={48}
                      height={plotH + padBottom}
                      fill="transparent"
                    />

                    {activeMetrics.improvementsShipped && (
                      <circle
                        cx={x}
                        cy={getY(d.improvementsShipped)}
                        r={isSelected ? 5.5 : 3.5}
                        fill="#3b82f6"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}
                    {activeMetrics.routesAndToolsAdded && (
                      <circle
                        cx={x}
                        cy={getY(d.routesAndToolsAdded)}
                        r={isSelected ? 5.5 : 3.5}
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}
                    {activeMetrics.errorsFixed && (
                      <circle
                        cx={x}
                        cy={getY(d.errorsFixed)}
                        r={isSelected ? 5 : 3}
                        fill="#f59e0b"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}
                    {activeMetrics.commitsPushed && (
                      <circle
                        cx={x}
                        cy={getY(d.commitsPushed)}
                        r={isSelected ? 5 : 3}
                        fill="#a855f7"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    <text
                      x={x}
                      y={height - 12}
                      textAnchor="middle"
                      fill={isSelected ? "#f8fafc" : "#94a3b8"}
                      fontSize="10"
                      fontWeight={isSelected ? "700" : "500"}
                      fontFamily="monospace"
                    >
                      {d.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 4 Sprint Completion Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {SPRINT_PROGRESS_BARS.map((bar) => {
            const fillGradient =
              bar.tone === "emerald"
                ? "from-emerald-500 to-teal-400"
                : bar.tone === "blue"
                ? "from-blue-500 to-indigo-400"
                : bar.tone === "purple"
                ? "from-purple-500 to-fuchsia-400"
                : "from-amber-500 to-orange-400";

            return (
              <div
                key={bar.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{bar.label}</span>
                  <span className="text-xs font-extrabold font-mono text-emerald-300">
                    {bar.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${fillGradient}`}
                    style={{ width: `${Math.min(100, Math.max(5, bar.percentage))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="font-mono text-slate-300">{bar.unitLabel}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{bar.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InteractiveSheetViewer({
  title,
  subtitle,
  sheet,
  csvFilename,
  filterColIdx,
  filterLabel,
  defaultPageSize = 50,
}: {
  title: string;
  subtitle?: string;
  sheet: TableSheetData;
  csvFilename: string;
  filterColIdx?: number;
  filterLabel?: string;
  defaultPageSize?: number;
}) {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filterOptions = useMemo(() => {
    if (filterColIdx === undefined) return [];
    const set = new Set<string>();
    for (const r of sheet.rows) {
      const val = (r[filterColIdx] || "").trim();
      if (val) set.add(val);
    }
    return Array.from(set);
  }, [sheet.rows, filterColIdx]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sheet.rows.filter((r) => {
      if (
        filterColIdx !== undefined &&
        selectedFilter !== "ALL" &&
        (r[filterColIdx] || "").trim() !== selectedFilter
      ) {
        return false;
      }
      if (!q) return true;
      return r.some((cell) => String(cell).toLowerCase().includes(q));
    });

    if (sortCol !== null) {
      list = [...list].sort((a, b) => {
        const va = a[sortCol] ?? "";
        const vb = b[sortCol] ?? "";
        const na = parseFloat(String(va).replace(/[^0-9.-]/g, ""));
        const nb = parseFloat(String(vb).replace(/[^0-9.-]/g, ""));
        if (!Number.isNaN(na) && !Number.isNaN(nb) && String(va).match(/^[0-9.,%-]+$/)) {
          return sortAsc ? na - nb : nb - na;
        }
        return sortAsc
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [sheet.rows, search, selectedFilter, filterColIdx, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const handleSort = (idx: number) => {
    if (sortCol === idx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(idx);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5 flex-wrap">
            <span>{title}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {filteredRows.length.toLocaleString()} / {sheet.rows.length.toLocaleString()} rows
            </span>
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search keyword, URL, brief, cluster..."
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          {filterColIdx !== undefined && filterOptions.length > 0 && (
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setPage(1);
              }}
              aria-label={filterLabel || "Filter"}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All {filterLabel || "Categories"} ({sheet.rows.length})
              </option>
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
            className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value={250}>250 / page</option>
          </select>

          <button
            type="button"
            onClick={() => exportRowsToCsv(csvFilename, sheet.headers, filteredRows)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
          >
            ⬇ Export CSV ({filteredRows.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[680px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950/95 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              {sheet.headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i)}
                  className="py-3 px-3.5 font-semibold text-slate-300 cursor-pointer hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{h || `Col ${i + 1}`}</span>
                    {sortCol === i && (
                      <span className="text-blue-400">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={sheet.headers.length}
                  className="py-10 text-center text-slate-500"
                >
                  No matching rows found for your current search/filter.
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-800/50 transition-colors align-top"
                >
                  {sheet.headers.map((_, cIdx) => {
                    const cell = row[cIdx] ?? "";
                    const isUrl =
                      typeof cell === "string" &&
                      (cell.startsWith("http://") ||
                        cell.startsWith("https://") ||
                        cell.startsWith("/tools/") ||
                        cell.startsWith("/ai-"));
                    const href = cell.startsWith("/")
                      ? cell
                      : cell.replace("https://doitwithai.tools", "") || "/";

                    const isBadgeCol =
                      sheet.headers[cIdx]?.toLowerCase().includes("when") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("priority") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("strategic view") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("disposition");

                    return (
                      <td
                        key={cIdx}
                        className="py-2.5 px-3.5 text-slate-300 max-w-[340px] break-words leading-relaxed"
                      >
                        {isUrl ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-mono text-[11px] break-all"
                          >
                            {cell}
                          </a>
                        ) : isBadgeCol && cell ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              cell.toLowerCase().includes("flagship") ||
                              cell.toLowerCase().includes("quick win") ||
                              cell.toLowerCase().includes("high") ||
                              cell.toLowerCase().includes("1 -")
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : cell.toLowerCase().includes("improve") ||
                                  cell.toLowerCase().includes("tools-based")
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : cell.toLowerCase().includes("agents") ||
                                  cell.toLowerCase().includes("publish")
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing page <span className="text-white font-semibold">{safePage}</span> of{" "}
            <span className="text-white font-semibold">{totalPages}</span> (
            {filteredRows.length.toLocaleString()} total rows)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FounderCommandCenterClient({
  workbookCore,
  handbookMarkdown,
  masterPromptText,
}: Props) {
  const [activeTab, setActiveTab] = useState<MainTabId>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [ctrSubTab, setCtrSubTab] = useState<"ctr" | "guides32" | "brand6" | "aitask">("ctr");
  const [gscSubTab, setGscSubTab] = useState<
    "pages" | "queries" | "countries" | "daily" | "indexing" | "live-audit"
  >("pages");

  // Founder Discussions filtering & blog post copy state
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("ALL");
  const [logSearch, setLogSearch] = useState<string>("");
  const [copiedBlogId, setCopiedBlogId] = useState<string | null>(null);
  const [expandedBlogPreviewId, setExpandedBlogPreviewId] = useState<string | null>(
    "log-sprint-11-scheduled-5-feeder-tools"
  );

  // On-demand state for large datasets (2,621 Keyword Review & 3,700 Raw Semrush)
  const [largeSheets, setLargeSheets] = useState<Record<string, TableSheetData> | null>(null);
  const [largeLoading, setLargeLoading] = useState(false);
  const [largeActiveSheet, setLargeActiveSheet] = useState<"Keyword Review" | "Raw Semrush">(
    "Keyword Review"
  );

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/founder-hub/auth", { method: "DELETE" });
    window.location.reload();
  };

  const loadLargeSheetsIfNeeded = useCallback(async () => {
    if (largeSheets || largeLoading) return;
    setLargeLoading(true);
    try {
      const res = await fetch("/api/founder-hub/large-sheets");
      const json = await res.json();
      if (json.ok && json.sheets) {
        setLargeSheets(json.sheets);
      }
    } catch (err) {
      console.error("Failed to load large sheets:", err);
    } finally {
      setLargeLoading(false);
    }
  }, [largeSheets, largeLoading]);

  const handleCopyMasterPrompt = async () => {
    try {
      await navigator.clipboard.writeText(masterPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyBlogPost = async (id: string, markdown: string) => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedBlogId(id);
      setTimeout(() => setCopiedBlogId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const sheets = workbookCore.sheets;

  const sidebarGroups: {
    groupTitle: string;
    items: { id: MainTabId; icon: string; label: string; badge?: string }[];
  }[] = [
    {
      groupTitle: "Command & Founder Story",
      items: [
        {
          id: "overview",
          icon: "📊",
          label: "Overview & Velocity Graph",
          badge: "Start Here",
        },
        {
          id: "founder-ai-log",
          icon: "📜",
          label: "Founder Discussions & Blog",
          badge: `${FOUNDER_AI_CHANGELOG.length} Sprints`,
        },
        {
          id: "flagship-blueprints",
          icon: "🚀",
          label: "AI Writer & 5-Tool Queue",
          badge: "6 AM PKT",
        },
      ],
    },
    {
      groupTitle: "SEO & Keyword Studio (15 Tabs)",
      items: [
        {
          id: "keyword-plan-64",
          icon: "🎯",
          label: "Master 64 Keyword Plan",
          badge: "Batch 2",
        },
        {
          id: "expansion-370",
          icon: "💎",
          label: "370 Curated Keywords",
          badge: "88.2K Vol",
        },
        {
          id: "ctr-guides-brand",
          icon: "⚡",
          label: "CTR, 32 Guides & Brand",
          badge: "48 Items",
        },
        {
          id: "gsc-technical-audit",
          icon: "🔍",
          label: "GSC & Sitemap Live Audit",
          badge: "6 Sheets",
        },
        {
          id: "large-semrush-review",
          icon: "🗄️",
          label: "2,621 Review & 3,700 Raw",
          badge: "6,321 Rows",
        },
      ],
    },
    {
      groupTitle: "Founder Studio",
      items: [
        {
          id: "video-production",
          icon: "🎬",
          label: "Video Production Playbook",
        },
      ],
    },
    {
      groupTitle: "Engineering & Architecture",
      items: [
        {
          id: "handbook-prompt",
          icon: "📘",
          label: "Tool Handbook & AI Prompt",
          badge: "Copy Prompt",
        },
        {
          id: "architecture-manual",
          icon: "🧩",
          label: "System & /do-it-ai Manual",
          badge: "5 Core Nodes",
        },
      ],
    },
  ];

  const logCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of FOUNDER_AI_CHANGELOG) {
      set.add(item.category);
    }
    return ["ALL", ...Array.from(set)];
  }, []);

  const filteredChangelog = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return FOUNDER_AI_CHANGELOG.filter((item) => {
      if (logCategoryFilter !== "ALL" && item.category !== logCategoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.founderRequestSummary.toLowerCase().includes(q) ||
        item.aiStrategicBlueprint.toLowerCase().includes(q) ||
        item.aiImplementationDetails.some((d) => d.toLowerCase().includes(q)) ||
        item.filesTouched.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [logCategoryFilter, logSearch]);

  const handleSelectTab = (id: MainTabId) => {
    setActiveTab(id);
    setMobileSidebarOpen(false);
    if (id === "large-semrush-review") {
      loadLargeSheetsIfNeeded();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Command Bar (Preserved Header Data + Mobile Sidebar Trigger) */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white"
                aria-label="Toggle navigation sidebar"
              >
                ☰
              </button>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white text-sm shadow">
                AI
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-extrabold text-white">
                    DoItWithAI.tools — Founder & Multi-AI Command Center
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Protected · NoIndex
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    5 Feeder Tools Queued · 6:00 AM PKT
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Unified Documentation, 15-Sheet SEO/Keyword Studio, Architecture Dependency Map &
                  Blog-Ready Founder Discussions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="/tools/quote-stat-testimonial-card-studio"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 border border-slate-700"
            >
              ★ Gold-Standard Tool Reference ↗
            </a>
            <a
              href="/do-it-ai"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700"
            >
              ⚡ Open /do-it-ai ↗
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-rose-300 border border-rose-500/30"
            >
              Lock Session
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Shell: Standard Left Sidebar + Scrollable Content Area */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex relative">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Standard Left Sidebar Navigation Panel */}
        <aside
          className={`${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } fixed lg:sticky top-[69px] left-0 z-30 w-72 shrink-0 h-[calc(100vh-69px)] overflow-y-auto border-r border-slate-800 bg-slate-900/95 backdrop-blur p-4 flex flex-col justify-between transition-transform duration-200`}
        >
          <div className="space-y-6">
            {sidebarGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1.5">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.groupTitle}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        aria-current={active ? "true" : undefined}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 text-left border ${
                          active
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                            : "bg-transparent text-slate-300 border-transparent hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span className="text-sm">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Left Sidebar Footer Summary Card */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">Next Scheduled Run</span>
                <span className="text-amber-300 font-semibold font-mono">6:00 AM PKT</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                5 Feeder Tools (#58–#62) queued in{" "}
                <code className="text-blue-300 font-mono">lib/founder-hub/data.ts</code>.
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-8">
          {/* TAB 1: OVERVIEW & GSC-STYLE VELOCITY GRAPH */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* GSC-Style Daily Activity & Velocity Graph + Progress Bars */}
              <GscVelocityOverviewChart />

              {/* Interactive 5-Tool Scheduled Build Queue & Tick-Mark Tracker */}
              <FiveFeederToolsQueueTracker
                onOpenBlueprints={() => handleSelectTab("flagship-blueprints")}
              />

              {/* Prominent Multi-AI Collaboration Protocol Banner */}
              <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/70 p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-blue-500/20 pb-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                      🤖 Mandatory Multi-AI Collaboration Protocol
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                      {MULTI_AI_COLLABORATION_PROTOCOL.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      {MULTI_AI_COLLABORATION_PROTOCOL.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTab("founder-ai-log")}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                    >
                      📜 Read All 11 Founder Sprints →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("handbook-prompt")}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
                    >
                      📋 Get Universal AI Upgrade Prompt →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("keyword-plan-64")}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                    >
                      📊 Open 64-Item Master Plan →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {MULTI_AI_COLLABORATION_PROTOCOL.agentDuties.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-slate-950/75 border border-slate-800 p-4 space-y-2"
                    >
                      <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wide">
                        {d.step}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{d.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-200">Key Files for AI Agents:</span>
                    <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                      lib/founder-hub/data.ts
                    </code>
                    <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                      lib/founder-hub/workbook-core.json
                    </code>
                    <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                      docs/TOOL_OPTIMIZATION_RULES.md
                    </code>
                  </div>
                  <span className="text-emerald-400 font-semibold">
                    ✓ 100% Blocked from Googlebot & Public Visitors
                  </span>
                </div>
              </div>

              {/* Executive KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXECUTIVE_KPI_CARDS.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {card.badge}
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-3">
                      {card.value}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5">{card.subtext}</div>
                  </div>
                ))}
              </div>

              {/* 8–12 Week Execution Sequence */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  🗓️ Master 8–12 Week Execution Sequence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {WEEKLY_EXECUTION_SEQUENCE.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold text-blue-400">
                            {item.window}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white mb-1.5">{item.focus}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOUNDER DISCUSSIONS & BLOG-READY MULTI-AI LEDGER */}
          {activeTab === "founder-ai-log" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
                      📜 Complete Historical Archive · Blog-Ready Founder Stories
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Chronological Founder Discussions, AI Blueprints & Personal Blog Generator
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Every major Founder prompt, strategic AI discussion, architectural blueprint, and shipped commit from Day 1. Click{" "}
                      <strong className="text-emerald-300">
                        &ldquo;📝 Copy as Personal Blog Post (Markdown)&rdquo;
                      </strong>{" "}
                      on any sprint card to turn that milestone into an article for your personal founder blog.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search discussions, files, commits..."
                      className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/80">
                  {logCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLogCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                        logCategoryFilter === cat
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {cat === "ALL" ? `All Sprints (${FOUNDER_AI_CHANGELOG.length})` : cat}
                    </button>
                  ))}
                </div>

                {/* Sprint Cards */}
                <div className="space-y-6 mt-6">
                  {filteredChangelog.map((entry) => {
                    const isPreviewOpen = expandedBlogPreviewId === entry.id;
                    const isCopied = copiedBlogId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 sm:p-6 space-y-4 shadow-xl"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-md bg-blue-600/25 text-blue-300 border border-blue-500/40 text-xs font-extrabold font-mono">
                              Sprint #{entry.sprintNumber} · {entry.date}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                              {entry.category}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                              {entry.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-400">
                              Commits:{" "}
                              <strong className="text-slate-200">
                                {entry.commits.join(", ")}
                              </strong>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyBlogPost(entry.id, entry.blogPostDraftMarkdown)
                              }
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
                            >
                              {isCopied
                                ? "✓ Copied Blog Markdown!"
                                : "📝 Copy as Personal Blog Post"}
                            </button>
                          </div>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-white">
                          {entry.title}
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="rounded-xl bg-slate-900/90 border border-amber-500/25 p-4">
                            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                              🗣️ Founder Request & Vision (Sufian Mustafa)
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {entry.founderRequestSummary}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-900/90 border border-blue-500/25 p-4">
                            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
                              🧠 AI Strategic Analysis & Architecture Blueprint
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {entry.aiStrategicBlueprint}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                            ⚙️ What We Engineered & Shipped to Production
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                            {entry.aiImplementationDetails.map((detail, i) => (
                              <li key={i}>• {detail}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Collapsible Personal Blog Post Draft */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBlogPreviewId(isPreviewOpen ? null : entry.id)
                            }
                            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80"
                          >
                            <span>
                              📖 Ready-to-Publish Personal Founder Blog Draft (Markdown)
                            </span>
                            <span className="text-blue-400">
                              {isPreviewOpen ? "Hide Preview ▲" : "Show Blog Draft ▼"}
                            </span>
                          </button>
                          {isPreviewOpen && (
                            <pre className="p-4 text-xs text-emerald-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/90 border-t border-slate-800 overflow-x-auto">
                              {entry.blogPostDraftMarkdown}
                            </pre>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 mr-1">
                            Files Touched:
                          </span>
                          {entry.filesTouched.map((f) => (
                            <code
                              key={f}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
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
            </div>
          )}

          {/* TAB 3: GRAND AI CONTENT WRITER, 5-TOOL QUEUE & H1 DOMINATION BLUEPRINTS */}
          {activeTab === "flagship-blueprints" && (
            <div className="space-y-8">
              {/* Interactive 5-Tool Scheduled Build Queue & Tick-Mark Tracker */}
              <FiveFeederToolsQueueTracker />

              {/* Blueprint A: Grand AI Content Writer 8-Stage Pipeline */}
              <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Flagship Product Blueprint · Order #57 – #62
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {GRAND_AI_CONTENT_WRITER_PIPELINE.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {GRAND_AI_CONTENT_WRITER_PIPELINE.subtitle}
                  </p>
                </div>

                {/* Target Commercial Keywords Table */}
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
                    1. Target Commercial Head Terms & High-CPC Cluster (From 1,632-Line Semrush Export)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {GRAND_AI_CONTENT_WRITER_PIPELINE.targetKeywords.map((item) => (
                      <div
                        key={item.kw}
                        className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-1"
                      >
                        <div className="text-xs font-bold text-blue-300 font-mono">
                          &ldquo;{item.kw}&rdquo;
                        </div>
                        <div className="text-sm font-black text-white">
                          {item.vol}/mo{" "}
                          <span className="text-xs font-normal text-slate-400">
                            · KD {item.kd} · CPC {item.cpc}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{item.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8-Stage Connected Pipeline */}
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
                    2. 8-Stage Connected Article Production Architecture (Chaining Existing Studios)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {GRAND_AI_CONTENT_WRITER_PIPELINE.stages.map((st) => (
                      <div
                        key={st.stage}
                        className="rounded-2xl border border-slate-800 bg-slate-950/85 p-4 flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-extrabold">
                            {st.stage}
                          </span>
                          <div className="text-sm font-bold text-white mt-2">{st.name}</div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {st.output}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-300">
                          {st.connectedRoute}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blueprint B: H1 Heading & Tag Cluster Domination Map */}
              <div className="rounded-3xl border border-blue-500/40 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    GSC Striking-Distance Domination Map · /ai-seo/h1-heading
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {H1_CLUSTER_DOMINATION_BLUEPRINT.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {H1_CLUSTER_DOMINATION_BLUEPRINT.subtitle}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900">
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-200">GSC Query (+h1)</th>
                        <th className="py-3 px-4 font-bold text-slate-200">Impressions</th>
                        <th className="py-3 px-4 font-bold text-slate-200">Current Position</th>
                        <th className="py-3 px-4 font-bold text-slate-200">
                          Exact Optimization & Tool Integration Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {H1_CLUSTER_DOMINATION_BLUEPRINT.gscQueries.map((q) => (
                        <tr key={q.query} className="hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-300">
                            {q.query}
                          </td>
                          <td className="py-3 px-4 font-mono text-white">{q.impressions}</td>
                          <td className="py-3 px-4 font-mono text-emerald-300 font-bold">
                            Pos {q.position}
                          </td>
                          <td className="py-3 px-4 text-slate-300 leading-relaxed">
                            {q.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {H1_CLUSTER_DOMINATION_BLUEPRINT.ecosystemMap.map((node) => (
                    <div
                      key={node.asset}
                      className="rounded-2xl border border-slate-800 bg-slate-950/85 p-4 space-y-1.5"
                    >
                      <div className="text-xs font-extrabold text-blue-400 font-mono">
                        {node.asset}
                      </div>
                      <div className="text-sm font-bold text-white">{node.role}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {node.optimization}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 64-ITEM KEYWORD & TOOL EXECUTION PLAN */}
          {activeTab === "keyword-plan-64" && (
            <InteractiveSheetViewer
              title="Sheet 2: 64-Item Master Keyword & Tool Execution Plan (Updated Nov 9 Batch 2)"
              subtitle="Includes Orders #1–#56 plus the new Nov 9 Batch 2 additions (#57 Flagship AI Content Writer Studio, #58 SEO Pricing Calculator Vol 3,600 KD 7, #59 Article-to-Quiz Generator Vol 1,600 KD 14, #60–#64)."
              sheet={sheets["Keyword Plan"]}
              csvFilename="doitwithai-64-keyword-plan-nov9.csv"
              filterColIdx={1}
              filterLabel="Sprint Priority (When)"
              defaultPageSize={100}
            />
          )}

          {/* TAB 5: 370 CURATED EXPANSION KEYWORDS & 4 STRATEGIC VIEWS */}
          {activeTab === "expansion-370" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {sheets["Filtered Expansion Views"].summary.rows.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-4 ${
                      i === 4
                        ? "border-emerald-500/40 bg-emerald-950/30"
                        : "border-slate-800 bg-slate-900/90"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-300">{r[0]}</div>
                    <div className="text-2xl font-black text-white mt-2">
                      {Number(r[1]).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-400">keywords</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vol:{" "}
                      <strong className="text-emerald-300">
                        {Number(r[2]).toLocaleString()}/mo
                      </strong>{" "}
                      · Avg KD:{" "}
                      <strong className="text-blue-300">
                        {Number(r[3]).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <InteractiveSheetViewer
                title="Sheet 3: Filtered Keyword Expansion Master View (370 Curated Keywords · 88,281 Monthly Volume)"
                subtitle="Filter by Strategic View (Tools-Based Keyword, AI Agents & Chatbot Expansion, Blog & Informational Guide, Prompts-Based Keyword) or search any cluster."
                sheet={sheets["Filtered Expansion Views"].table}
                csvFilename="doitwithai-370-curated-expansion-keywords.csv"
                filterColIdx={0}
                filterLabel="Strategic View"
                defaultPageSize={100}
              />
            </div>
          )}

          {/* TAB 6: CTR PLAYBOOK, 32 GUIDES & 6 BRAND DOMINANCE LAYERS */}
          {activeTab === "ctr-guides-brand" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: "ctr" as const,
                    label: "1. CTR & Code Conversion Playbook (10 Actions)",
                  },
                  {
                    id: "guides32" as const,
                    label: "2. 2026–2027 'What AI Can Do' Blog Plan (32 Guides)",
                  },
                  {
                    id: "brand6" as const,
                    label: "3. 'Do It With AI' Brand Dominance Blueprint (6 Layers)",
                  },
                  {
                    id: "aitask" as const,
                    label: "4. Conversational 'AI Do It' Task Queries (34 Seeds)",
                  },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setCtrSubTab(st.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      ctrSubTab === st.id
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {ctrSubTab === "ctr" && (
                <InteractiveSheetViewer
                  title="Sheet 13: CTR, AI-Overview Defense & Code-Level Conversion Playbook (10 Priority Actions)"
                  subtitle="Solves the 22,522 Impressions / 38 Clicks gap with copy-paste SEO titles, meta descriptions, and above-the-fold interactive widgets."
                  sheet={sheets["CTR & Conversion Playbook"]}
                  csvFilename="doitwithai-ctr-conversion-playbook.csv"
                  filterColIdx={8}
                  filterLabel="Target Sprint"
                />
              )}

              {ctrSubTab === "guides32" && (
                <InteractiveSheetViewer
                  title="Sheet 14: 2026–2027 'What AI Can Do' General & Vertical Content Plan (32 High-Intent Guides)"
                  subtitle="Organized across 7 Category Pillars (General AI, AI for SEO, Content Writing, Digital Marketing, Social & Video, Web & Code, 2026–2027 AI Agents & Models)."
                  sheet={sheets["2026-2027 AI Capabilities"]}
                  csvFilename="doitwithai-32-what-ai-can-do-guides.csv"
                  filterColIdx={1}
                  filterLabel="Category Pillar"
                />
              )}

              {ctrSubTab === "brand6" && (
                <InteractiveSheetViewer
                  title="Sheet 15: 'Do It With AI' Brand & Conversational Query Dominance Blueprint (6 Layers)"
                  subtitle="Turns our exact domain phrase ('Do It With AI') into a repeatable task-verb authority system across Homepage, /tools, tool studios, and blog guides."
                  sheet={sheets["Do It With AI Brand Plan"]}
                  csvFilename="doitwithai-brand-dominance-blueprint.csv"
                />
              )}

              {ctrSubTab === "aitask" && (
                <InteractiveSheetViewer
                  title="Sheet 12: AI Task & Conversational Queries ('ai do it', 'can ai do it for me')"
                  subtitle="34 conversational and task-routing query seeds mapped to target hubs and specific tool demonstrations."
                  sheet={sheets["AI Task Queries"]}
                  csvFilename="doitwithai-ai-task-queries.csv"
                  filterColIdx={4}
                  filterLabel="Topic Group"
                />
              )}
            </div>
          )}

          {/* TAB 7: GSC PAGES, QUERIES, COUNTRIES, DAILY, INDEXING & LIVE AUDIT */}
          {activeTab === "gsc-technical-audit" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "pages" as const, label: "Existing Pages (81 URLs)" },
                  { id: "queries" as const, label: "GSC Queries (892 Queries)" },
                  { id: "countries" as const, label: "GSC Countries (146 Countries)" },
                  { id: "daily" as const, label: "GSC Daily Chart (92 Days)" },
                  { id: "indexing" as const, label: "Indexing Coverage (63 Indexed / 81 Excluded)" },
                  { id: "live-audit" as const, label: "Live Technical & 144-URL Sitemap Audit" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setGscSubTab(st.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      gscSubTab === st.id
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {gscSubTab === "pages" && (
                <InteractiveSheetViewer
                  title="Sheet 4: Existing Pages Performance & Action Plan (81 URLs in GSC)"
                  subtitle="Sorted by priority and impressions with concrete page-level actions."
                  sheet={sheets["Existing Pages"]}
                  csvFilename="doitwithai-gsc-existing-pages-81.csv"
                  filterColIdx={5}
                  filterLabel="Priority"
                  defaultPageSize={100}
                />
              )}

              {gscSubTab === "queries" && (
                <InteractiveSheetViewer
                  title="Sheet 8: Google Search Console Queries (892 Exported Queries)"
                  subtitle="Search or sort by Clicks, Impressions, CTR, or Position."
                  sheet={sheets["GSC Queries"]}
                  csvFilename="doitwithai-gsc-queries-892.csv"
                  defaultPageSize={100}
                />
              )}

              {gscSubTab === "countries" && (
                <InteractiveSheetViewer
                  title="Sheet 9: Google Search Console Countries (146 Countries)"
                  subtitle="Geographic breakdown of clicks, impressions, CTR, and average position."
                  sheet={sheets["GSC Countries"]}
                  csvFilename="doitwithai-gsc-countries-146.csv"
                  defaultPageSize={100}
                />
              )}

              {gscSubTab === "daily" && (
                <InteractiveSheetViewer
                  title="Sheet 7: Google Search Console Daily Performance (92 Days)"
                  subtitle="Daily clicks, impressions, CTR, and average position."
                  sheet={sheets["GSC Daily"]}
                  csvFilename="doitwithai-gsc-daily-92.csv"
                  defaultPageSize={100}
                />
              )}

              {gscSubTab === "indexing" && (
                <div className="space-y-6">
                  <InteractiveSheetViewer
                    title="Sheet 10A: Google Search Console Indexing Exclusions Breakdown (81 Excluded / 63 Indexed)"
                    subtitle="31 redirects, 25 404s, 7 noindex, 4 duplicates, 2 5xx, 1 redirect error, 9 crawled-not-indexed, 2 discovered-not-indexed."
                    sheet={sheets.Indexing.exclusions}
                    csvFilename="doitwithai-indexing-exclusions.csv"
                  />
                  <InteractiveSheetViewer
                    title="Sheet 10B: Indexing Growth Timeline (Indexed Pages Climbed from 32 -> 63)"
                    subtitle="Historical coverage snapshot progression."
                    sheet={sheets.Indexing.timeline}
                    csvFilename="doitwithai-indexing-timeline.csv"
                    defaultPageSize={100}
                  />
                </div>
              )}

              {gscSubTab === "live-audit" && (
                <div className="space-y-6">
                  <InteractiveSheetViewer
                    title="Sheet 11A: Live Technical SEO Audit Findings (8 Priority Checks)"
                    subtitle="Public HTML, PortableText table renderer, TOC consistency, and Core Web Vitals checks."
                    sheet={sheets["Live Audit"].findings}
                    csvFilename="doitwithai-live-audit-findings.csv"
                    filterColIdx={0}
                    filterLabel="Priority"
                  />
                  <InteractiveSheetViewer
                    title="Sheet 11B: Live Sitemap HTTP Status Verification (144 URLs · 144 HTTP 200 OK)"
                    subtitle="Every URL in https://doitwithai.tools/sitemap.xml verified."
                    sheet={sheets["Live Audit"].sitemapChecks}
                    csvFilename="doitwithai-144-sitemap-http-checks.csv"
                    defaultPageSize={100}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 8: FULL 2,621 KEYWORD REVIEW & 3,700 RAW SEMRUSH DB */}
          {activeTab === "large-semrush-review" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(["Keyword Review", "Raw Semrush"] as const).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setLargeActiveSheet(name)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        largeActiveSheet === name
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {name === "Keyword Review"
                        ? "Sheet 5: Keyword Review (2,621 Deduplicated Phrases)"
                        : "Sheet 6: Raw Semrush Database (3,700 Source Records)"}
                    </button>
                  ))}
                </div>
              </div>

              {largeLoading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-12 text-center text-sm text-slate-300">
                  ⏳ Loading 6,321 keyword records from protected server store...
                </div>
              )}

              {!largeLoading && largeSheets && largeSheets[largeActiveSheet] && (
                <InteractiveSheetViewer
                  title={
                    largeActiveSheet === "Keyword Review"
                      ? "Sheet 5: Complete Keyword Review Ledger (2,621 Unique Phrases After Nov 9 Batch 2)"
                      : "Sheet 6: Complete Raw Semrush Export Database (3,700 Records Across All Batches)"
                  }
                  subtitle="Full searchable, sortable, filterable database with 1-click CSV export."
                  sheet={largeSheets[largeActiveSheet]}
                  csvFilename={
                    largeActiveSheet === "Keyword Review"
                      ? "doitwithai-2621-keyword-review.csv"
                      : "doitwithai-3700-raw-semrush.csv"
                  }
                  filterColIdx={largeActiveSheet === "Keyword Review" ? 3 : 1}
                  filterLabel={largeActiveSheet === "Keyword Review" ? "Disposition" : "Search Intent"}
                  defaultPageSize={100}
                />
              )}
            </div>
          )}

          {activeTab === "video-production" && (
            <FounderVideoPlaybook />
          )}

          {/* TAB 9: INDUSTRIAL TOOL OPTIMIZATION HANDBOOK & MASTER PROMPT */}
          {activeTab === "handbook-prompt" && (
            <div className="space-y-6">
              {/* 1-Click Copy Universal AI Upgrade Prompt Box */}
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-emerald-500/20">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Section 8 · Universal Copy-Paste Prompt
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-1.5">
                      Copy-Paste Master Prompt for Any AI Agent (Gemini, Claude, Cursor, Windsurf)
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Replace <code className="text-emerald-300">[TOOL_NAME]</code>,{" "}
                      <code className="text-emerald-300">[TOOL_SLUG]</code>, and{" "}
                      <code className="text-emerald-300">[PRIMARY_KEYWORDS]</code> when instructing any
                      AI to build or upgrade a tool.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMasterPrompt}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition whitespace-nowrap"
                  >
                    {copiedPrompt ? "✓ Copied Master Prompt!" : "📋 Copy Master AI Prompt"}
                  </button>
                </div>

                <pre className="mt-4 p-4 rounded-2xl bg-slate-950/95 border border-slate-800 text-xs text-emerald-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[360px] leading-relaxed">
                  {masterPromptText}
                </pre>
              </div>

              {/* Full Handbook Renderer */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      📘 Complete Industrial Tool Optimization Handbook (`docs/TOOL_OPTIMIZATION_RULES.md`)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Documents the 7-stage evolution post-mortem of `/tools/quote-stat-testimonial-card-studio`, mathematical zero-overlap canvas rules, architectural portrait framing, and SEO/AEO standards.
                    </p>
                  </div>
                </div>
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {handbookMarkdown}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 10: SYSTEM ARCHITECTURE, TOOL DEPENDENCIES & /DO-IT-AI MANUAL */}
          {activeTab === "architecture-manual" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-indigo-500/40 bg-slate-900/90 p-6 sm:p-8">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Architecture & Dependency Manual
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                  How All 104+ Tools, `/do-it-ai`, Portable Apps & the 4-Tier AI Failover Engine Connect
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Every AI agent MUST check this dependency map before adding a new tool or modifying
                  shared components so nothing breaks across `/tools`, `/do-it-ai`, or `app/sitemap.js`.
                </p>

                <div className="grid grid-cols-1 gap-5 mt-6">
                  {SYSTEM_ARCHITECTURE_DEPENDENCY_MAP.map((node) => (
                    <div
                      key={node.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-base font-extrabold text-white">{node.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {node.filePaths.map((fp) => (
                            <code
                              key={fp}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-blue-300 font-mono"
                            >
                              {fp}
                            </code>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{node.role}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-3.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Connected Routes & Modules
                          </div>
                          <ul className="space-y-1 text-xs text-slate-300 font-mono">
                            {node.dependencies.map((dep, i) => (
                              <li key={i}>• {dep}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/25 p-3.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                            Mandatory Checklist When Adding / Upgrading a Tool
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-200">
                            {node.whenAddingOrUpgradingTool.map((rule, i) => (
                              <li key={i}>✓ {rule}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
