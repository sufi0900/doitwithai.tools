"use client";

import React, { useState, useMemo } from "react";
import {
  MASTER_VISION_PHASES,
  VOXFOLIO_ECOSYSTEM_BLUEPRINT,
  type MasterVisionPhase,
} from "@/lib/founder-hub/data";

export function MasterVisionCompletionCalculator({
  onOpenVoxfolioTab,
}: {
  onOpenVoxfolioTab?: () => void;
}) {
  const [phases, setPhases] = useState<MasterVisionPhase[]>(() =>
    MASTER_VISION_PHASES.map((p) => ({ ...p }))
  );
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseTotal, setNewPhaseTotal] = useState(20);
  const [newPhaseCompleted, setNewPhaseCompleted] = useState(0);
  const [newPhaseCategory, setNewPhaseCategory] = useState<MasterVisionPhase["category"]>(
    "VoxFolio & Ecosystem Expansion"
  );

  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let coreTotal = 0;
    let coreCompleted = 0;

    for (const p of phases) {
      totalItems += p.totalItems;
      completedItems += p.completedItems;
      if (
        p.category === "Core SEO & Tools (DoItWithAI)" ||
        p.category === "Content & Keyword Sheet"
      ) {
        coreTotal += p.totalItems;
        coreCompleted += p.completedItems;
      }
    }

    const overallPct =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 1000) / 10 : 0;
    const corePct =
      coreTotal > 0 ? Math.round((coreCompleted / coreTotal) * 1000) / 10 : 0;
    const remainingItems = Math.max(0, totalItems - completedItems);

    return {
      totalItems,
      completedItems,
      remainingItems,
      overallPct,
      coreTotal,
      coreCompleted,
      corePct,
    };
  }, [phases]);

  const adjustPhaseCompleted = (id: string, delta: number) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextCompleted = Math.max(0, Math.min(p.totalItems, p.completedItems + delta));
        return { ...p, completedItems: nextCompleted };
      })
    );
  };

  const adjustPhaseTotal = (id: string, delta: number) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextTotal = Math.max(1, p.totalItems + delta);
        const nextCompleted = Math.min(p.completedItems, nextTotal);
        return { ...p, totalItems: nextTotal, completedItems: nextCompleted };
      })
    );
  };

  const handleAddCustomPhase = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newPhaseTitle.trim();
    if (!cleanTitle) return;
    const safeTotal = Math.max(1, Number(newPhaseTotal) || 10);
    const safeDone = Math.max(0, Math.min(safeTotal, Number(newPhaseCompleted) || 0));

    const newItem: MasterVisionPhase = {
      id: `custom-phase-${Date.now()}`,
      phaseNumber: phases.length + 1,
      title: `Phase ${phases.length + 1}: ${cleanTitle}`,
      category: newPhaseCategory,
      completedItems: safeDone,
      totalItems: safeTotal,
      weight: 5,
      status: safeDone >= safeTotal ? "Completed" : "Future R&D",
      deliverablesSummary:
        "Custom Founder scope expansion dynamically factored into Master Vision completion percentage.",
    };

    setPhases((prev) => [...prev, newItem]);
    setNewPhaseTitle("");
    setNewPhaseTotal(20);
    setNewPhaseCompleted(0);
  };

  const handleResetBaseline = () => {
    setPhases(MASTER_VISION_PHASES.map((p) => ({ ...p })));
  };

  return (
    <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/45 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-indigo-500/20 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2">
            <span>🧮 Built-In Dynamic Master Vision & Implementation Calculator</span>
            <span>·</span>
            <span>{phases.length} Active & Future Phases</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Total Founder Vision Progress Bar & Dynamic Scope Calculator ({stats.overallPct}% Complete)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Calculates exact completion across every SEO keyword row, tool build, article migration,{" "}
            <strong className="text-indigo-300">VoxFolio 3D Website/Blog integration</strong>,{" "}
            <strong className="text-emerald-300">1-Click Tool Website Injector</strong>, and{" "}
            <strong className="text-purple-300">Buffer-Style Social Media Auto-Publisher</strong>. Whenever you add new future tasks or phases below, the total percentage automatically recalibrates!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenVoxfolioTab && (
            <button
              type="button"
              onClick={onOpenVoxfolioTab}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
            >
              🌐 Open VoxFolio & Ecosystem Blueprint →
            </button>
          )}
          <button
            type="button"
            onClick={handleResetBaseline}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            ↺ Reset to Repo Baseline
          </button>
        </div>
      </div>

      {/* Top Master Progress Bars (Overall Vision vs. Core SEO/Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-indigo-500/40 bg-slate-950/90 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                1. Grand Ecosystem Vision (DoItWithAI + VoxFolio + Social Auto-Publisher)
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {stats.completedItems} completed of {stats.totalItems} total milestones ({stats.remainingItems} remaining)
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {stats.overallPct}%
            </div>
          </div>
          <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(2, stats.overallPct))}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                2. Core DoItWithAI.tools & Master Keyword Sheet Execution
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {stats.coreCompleted} completed of {stats.coreTotal} core SEO, tool & content milestones
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-blue-400">
              {stats.corePct}%
            </div>
          </div>
          <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(2, stats.corePct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase-by-Phase Interactive Breakdown Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {phases.map((p) => {
          const pct = p.totalItems > 0 ? Math.round((p.completedItems / p.totalItems) * 100) : 0;
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/85 p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    {p.category}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-emerald-300">
                    {pct}% ({p.completedItems}/{p.totalItems})
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-snug">{p.title}</div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct === 100
                        ? "bg-emerald-500"
                        : pct >= 50
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {p.deliverablesSummary}
                </p>
              </div>

              {/* Interactive Calculator Controls per Phase */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 mr-1">Done:</span>
                  <button
                    type="button"
                    onClick={() => adjustPhaseCompleted(p.id, -1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPhaseCompleted(p.id, 1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPhaseCompleted(p.id, p.totalItems)}
                    className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold"
                  >
                    100%
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Scope:</span>
                  <button
                    type="button"
                    onClick={() => adjustPhaseTotal(p.id, 5)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono"
                    title="Add +5 items to this phase's total scope"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Future Scope / Phase Simulator Form */}
      <form
        onSubmit={handleAddCustomPhase}
        className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 flex flex-col lg:flex-row lg:items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            ➕ Add New Future Implementation Series / Scope (Recalculates Master % Automatically)
          </label>
          <input
            type="text"
            value={newPhaseTitle}
            onChange={(e) => setNewPhaseTitle(e.target.value)}
            placeholder="e.g., Phase 10: Custom Niche WordPress & Shopify Plugin Bridge (25 Tasks)..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Track Category
          </label>
          <select
            value={newPhaseCategory}
            onChange={(e) =>
              setNewPhaseCategory(e.target.value as MasterVisionPhase["category"])
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
          >
            <option value="VoxFolio & Ecosystem Expansion">VoxFolio & Ecosystem Expansion</option>
            <option value="Social & Off-Page Automation">Social & Off-Page Automation</option>
            <option value="Core SEO & Tools (DoItWithAI)">Core SEO & Tools (DoItWithAI)</option>
            <option value="Content & Keyword Sheet">Content & Keyword Sheet</option>
          </select>
        </div>

        <div className="w-28">
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Total Tasks
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={newPhaseTotal}
            onChange={(e) => setNewPhaseTotal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
          />
        </div>

        <div className="w-28">
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Done So Far
          </label>
          <input
            type="number"
            min={0}
            max={500}
            value={newPhaseCompleted}
            onChange={(e) => setNewPhaseCompleted(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow shrink-0"
        >
          Add to Master Plan & Recalculate %
        </button>
      </form>
    </div>
  );
}

export function VoxFolioEcosystemView() {
  return (
    <div className="space-y-8">
      <MasterVisionCompletionCalculator />

      <div className="rounded-3xl border border-indigo-500/40 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              VoxFolio V27.12 Technical Audit & Cross-Platform Bridge
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              {VOXFOLIO_ECOSYSTEM_BLUEPRINT.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {VOXFOLIO_ECOSYSTEM_BLUEPRINT.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={VOXFOLIO_ECOSYSTEM_BLUEPRINT.repoAudit.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 border border-slate-700"
            >
              GitHub: voice-directed-3d-portfolio-builder ↗
            </a>
            <a
              href={VOXFOLIO_ECOSYSTEM_BLUEPRINT.repoAudit.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow"
            >
              Open Live VoxFolio App ↗
            </a>
          </div>
        </div>

        {/* VoxFolio Repository Audit Metrics */}
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
            1. Verified Technical Audit of VoxFolio ({VOXFOLIO_ECOSYSTEM_BLUEPRINT.repoAudit.currentVersion})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOXFOLIO_ECOSYSTEM_BLUEPRINT.repoAudit.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-1.5"
              >
                <div className="text-xs font-bold text-indigo-300">{m.label}</div>
                <div className="text-lg font-black text-white">{m.value}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Ecosystem Integration Stages */}
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
            2. Six-Stage Master Plan: Connecting VoxFolio, DoItWithAI.tools, /do-it-ai & Social Auto-Publishing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VOXFOLIO_ECOSYSTEM_BLUEPRINT.ecosystemStages.map((st) => (
              <div
                key={st.stage}
                className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-extrabold">
                    {st.stage}
                  </span>
                  <code className="text-[11px] text-emerald-300 font-mono">
                    {st.connection}
                  </code>
                </div>
                <h4 className="text-base font-extrabold text-white">{st.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{st.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
