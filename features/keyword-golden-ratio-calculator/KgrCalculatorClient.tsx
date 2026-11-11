"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type KgrInputRow = {
  id: string;
  keyword: string;
  allintitle: number;
  volume: number;
};

export type KgrEvaluatedRow = KgrInputRow & {
  kgr: number;
  tier: "Great (< 0.25)" | "Might Work (0.25–1.0)" | "Competitive (> 1.0)" | "High-Vol Gem";
  recommendation: string;
  maxAllintitleForBargain: number;
  allintitleSearchUrl: string;
};

export type KgrPreset = {
  id: string;
  label: string;
  niche: string;
  rows: Array<{ keyword: string; allintitle: number; volume: number }>;
};

export const KGR_PRESETS: KgrPreset[] = [
  {
    id: "ai-seo-niche",
    label: "AI & SEO Tools Batch",
    niche: "AI SEO utilities, keyword groupers, and search intent tools",
    rows: [
      { keyword: "keyword golden ratio calculator", allintitle: 18, volume: 110 },
      { keyword: "free keyword grouping tool", allintitle: 42, volume: 210 },
      { keyword: "enterprise seo roi calculator", allintitle: 29, volume: 240 },
      { keyword: "ai citation readiness checker", allintitle: 9, volume: 170 },
      { keyword: "claude seo analysis tool", allintitle: 64, volume: 210 },
      { keyword: "best seo tools for beginners", allintitle: 840, volume: 590 },
    ],
  },
  {
    id: "b2b-saas",
    label: "B2B SaaS Long-Tail Batch",
    niche: "B2B SaaS workflow automation and customer support agents",
    rows: [
      { keyword: "ai support agent from internal docs", allintitle: 14, volume: 140 },
      { keyword: "client intake ai agent template", allintitle: 19, volume: 180 },
      { keyword: "b2b sales research buyer fit scoring", allintitle: 11, volume: 160 },
      { keyword: "saas content writing checklist", allintitle: 95, volume: 220 },
      { keyword: "crm software for small business", allintitle: 3200, volume: 1200 },
    ],
  },
  {
    id: "local-ecom",
    label: "Local & E-Commerce Batch",
    niche: "Local service pages and e-commerce product buying guides",
    rows: [
      { keyword: "local seo service page planner", allintitle: 12, volume: 150 },
      { keyword: "google review response generator free", allintitle: 38, volume: 230 },
      { keyword: "how to check google keyword rankings", allintitle: 185, volume: 250 },
      { keyword: "ecommerce category page seo template", allintitle: 27, volume: 190 },
    ],
  },
];

export function evaluateKgrRows(rows: KgrInputRow[]): KgrEvaluatedRow[] {
  return rows
    .filter((r) => r.keyword.trim().length > 0)
    .map((r) => {
      const vol = Math.max(1, r.volume);
      const ait = Math.max(0, r.allintitle);
      const kgr = +(ait / vol).toFixed(3);
      const maxAllintitleForBargain = Math.floor(vol * 0.25);

      let tier: KgrEvaluatedRow["tier"] = "Competitive (> 1.0)";
      let recommendation =
        "High allintitle saturation. Target inside a broader pillar page or build authority links first.";

      if (kgr < 0.25 && vol <= 250) {
        tier = "Great (< 0.25)";
        recommendation =
          "Classic KGR Bargain! Very few pages target this exact phrase in their <title>. Publish a focused page or tool now.";
      } else if (kgr < 0.25 && vol > 250) {
        tier = "High-Vol Gem";
        recommendation =
          "High search volume (>250) with low allintitle ratio (<0.25). High-priority pillar or interactive tool candidate.";
      } else if (kgr <= 1.0) {
        tier = "Might Work (0.25–1.0)";
        recommendation =
          "Moderate title competition. Win by front-loading the exact phrase in your Meta Title (<580px) and adding a 50-word answer block.";
      }

      const allintitleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        `allintitle:"${r.keyword.trim()}"`,
      )}`;

      return {
        ...r,
        volume: vol,
        allintitle: ait,
        kgr,
        tier,
        recommendation,
        maxAllintitleForBargain,
        allintitleSearchUrl,
      };
    });
}

export type AffinityReport = {
  targetKeyword: string;
  overallScore: number;
  grade: "Optimal Affinity (80–100%)" | "Moderate Affinity (55–79%)" | "Low Affinity (< 55%)";
  sections: Array<{
    section: string;
    weight: number;
    score: number;
    matchedTerms: string[];
    missingTerms: string[];
    fix: string;
  }>;
};

export function calculateKeywordAffinity(params: {
  targetKeywords: string;
  headlineText: string;
  summaryText: string;
  experienceText: string;
  skillsText: string;
}): AffinityReport {
  const kwList = params.targetKeywords
    .split(/,|\n/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const activeKws = kwList.length > 0 ? kwList : ["ai seo", "keyword research", "content strategy"];

  const checkSection = (
    name: string,
    weight: number,
    content: string,
    fixAdvice: string,
  ) => {
    const lower = content.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];
    for (const kw of activeKws) {
      if (lower.includes(kw)) matched.push(kw);
      else missing.push(kw);
    }
    const ratio = activeKws.length > 0 ? matched.length / activeKws.length : 0;
    const score = Math.round(ratio * 100);
    return {
      section: name,
      weight,
      score,
      matchedTerms: matched,
      missingTerms: missing,
      fix: missing.length > 0 ? `${fixAdvice}: add "${missing.slice(0, 2).join('", "')}".` : "All target keywords naturally present.",
    };
  };

  const s1 = checkSection(
    "Headline / H1 Title (35% Weight)",
    35,
    params.headlineText,
    "Front-load your primary specialty in your Headline/H1",
  );
  const s2 = checkSection(
    "About / Opening Summary (25% Weight)",
    25,
    params.summaryText,
    "Weave missing core phrases into your first 100 words",
  );
  const s3 = checkSection(
    "Experience & Case Studies (25% Weight)",
    25,
    params.experienceText,
    "Include exact role/deliverable keywords in bullet points",
  );
  const s4 = checkSection(
    "Skills, Tags & Endorsements (15% Weight)",
    15,
    params.skillsText,
    "Add exact-match skill tags for recruiter/algorithm filters",
  );

  const overallScore = Math.round(
    (s1.score * 0.35) + (s2.score * 0.25) + (s3.score * 0.25) + (s4.score * 0.15),
  );

  const grade: AffinityReport["grade"] =
    overallScore >= 80
      ? "Optimal Affinity (80–100%)"
      : overallScore >= 55
        ? "Moderate Affinity (55–79%)"
        : "Low Affinity (< 55%)";

  return {
    targetKeyword: activeKws.join(", "),
    overallScore,
    grade,
    sections: [s1, s2, s3, s4],
  };
}

type AiKgrStrategy = {
  headline: string;
  summary: string;
  clusterPlan: Array<{
    groupName: string;
    keywords: string;
    pageFormat: string;
    suggestedTitle: string;
  }>;
};

const field =
  "w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function KgrCalculatorClient() {
  const [activeTab, setActiveTab] = useState<"kgr" | "affinity">("kgr");
  const [activePresetId, setActivePresetId] = useState("ai-seo-niche");
  const [nicheContext, setNicheContext] = useState(KGR_PRESETS[0].niche);
  const [rows, setRows] = useState<KgrInputRow[]>(() =>
    KGR_PRESETS[0].rows.map((r, i) => ({ id: `row-${i}`, ...r })),
  );
  const [bulkPaste, setBulkPaste] = useState("");
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  // LinkedIn & Profile Keyword Affinity State
  const [affKeywords, setAffKeywords] = useState(
    "ai seo, keyword research, technical seo, content strategy",
  );
  const [affHeadline, setAffHeadline] = useState(
    "Founder & AI SEO Strategist | Building Free Keyword Research & Content Strategy Tools",
  );
  const [affSummary, setAffSummary] = useState(
    "Helping solo founders and marketers scale organic traffic using AI SEO workflows, keyword research automation, and structured content strategy.",
  );
  const [affExperience, setAffExperience] = useState(
    "Built 90+ browser-based AI SEO and technical SEO utilities with interactive dashboards and structured data.",
  );
  const [affSkills, setAffSkills] = useState(
    "AI SEO, Keyword Research, Technical SEO, On-Page Optimization",
  );

  const [evaluated, setEvaluated] = useState<KgrEvaluatedRow[]>(() =>
    evaluateKgrRows(
      KGR_PRESETS[0].rows.map((r, i) => ({ id: `row-${i}`, ...r })),
    ),
  );
  const [affinityReport, setAffinityReport] = useState<AffinityReport>(() =>
    calculateKeywordAffinity({
      targetKeywords: "ai seo, keyword research, technical seo, content strategy",
      headlineText:
        "Founder & AI SEO Strategist | Building Free Keyword Research & Content Strategy Tools",
      summaryText:
        "Helping solo founders and marketers scale organic traffic using AI SEO workflows, keyword research automation, and structured content strategy.",
      experienceText:
        "Built 90+ browser-based AI SEO and technical SEO utilities with interactive dashboards and structured data.",
      skillsText: "AI SEO, Keyword Research, Technical SEO, On-Page Optimization",
    }),
  );

  const [aiStrategy, setAiStrategy] = useState<AiKgrStrategy | null>(null);
  const [busy, setBusy] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"calc" | "ai">("calc");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultsRef.current);
    }
  }, [busy, revision]);

  async function loadPreset(preset: KgrPreset) {
    setActivePresetId(preset.id);
    setNicheContext(preset.niche);
    const nextRows = preset.rows.map((r, i) => ({
      id: `row-${Date.now()}-${i}`,
      ...r,
    }));
    setRows(nextRows);
    setOverlayMode("calc");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setEvaluated(evaluateKgrRows(nextRows));
      setAiStrategy(null);
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} and calculated KGR scores.`);
    } finally {
      setBusy(false);
    }
  }

  function updateRow(id: string, patch: Partial<KgrInputRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  function addRow() {
    if (rows.length >= 50) return;
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        keyword: "",
        allintitle: 15,
        volume: 120,
      },
    ]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function applyBulkPaste() {
    const lines = bulkPaste
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (lines.length === 0) return;
    const parsed: KgrInputRow[] = lines.map((line, idx) => {
      const parts = line.split(/,|\t/).map((s) => s.trim());
      const keyword = parts[0] || `keyword ${idx + 1}`;
      const allintitle = Number(parts[1]) >= 0 ? Number(parts[1]) : 20;
      const volume = Number(parts[2]) > 0 ? Number(parts[2]) : 150;
      return {
        id: `bulk-${Date.now()}-${idx}`,
        keyword,
        allintitle,
        volume,
      };
    });
    setRows(parsed);
    setEvaluated(evaluateKgrRows(parsed));
    setShowBulkPaste(false);
    setRevision((r) => r + 1);
    setStatus(`Imported ${parsed.length} keywords and calculated KGR ratios.`);
  }

  async function handleRunKgr(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setOverlayMode("calc");
    setBusy(true);
    try {
      await paintToolFeedback(500);
      if (activeTab === "kgr") {
        setEvaluated(evaluateKgrRows(rows));
        setStatus("Calculated Keyword Golden Ratio (KGR) for all rows.");
      } else {
        setAffinityReport(
          calculateKeywordAffinity({
            targetKeywords: affKeywords,
            headlineText: affHeadline,
            summaryText: affSummary,
            experienceText: affExperience,
            skillsText: affSkills,
          }),
        );
        setStatus("Calculated LinkedIn & Profile Keyword Affinity Score.");
      }
      setRevision((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAiStrategy() {
    if (busy) return;
    const currentEval = evaluateKgrRows(rows);
    setEvaluated(currentEval);
    setOverlayMode("ai");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools/keyword-golden-ratio-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheContext,
          items: currentEval.slice(0, 15).map((r) => ({
            keyword: r.keyword,
            allintitle: r.allintitle,
            volume: r.volume,
            kgr: r.kgr,
            tier: r.tier,
          })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { strategy?: AiKgrStrategy };
        if (data.strategy) setAiStrategy(data.strategy);
      }
      setRevision((r) => r + 1);
      setStatus("Generated AI KGR prioritization & page-clustering plan.");
    } catch {
      setStatus("KGR calculation complete.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const headers = [
      "Keyword",
      "Allintitle Results",
      "Monthly Search Volume",
      "KGR Score",
      "KGR Status Tier",
      "Max Allintitle for <0.25 Bargain",
      "Action Recommendation",
    ];
    const csvRows = evaluated.map((r) => [
      r.keyword,
      r.allintitle,
      r.volume,
      r.kgr,
      r.tier,
      r.maxAllintitleForBargain,
      r.recommendation,
    ]);
    const csv =
      "\uFEFF" +
      [headers, ...csvRows]
        .map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "kgr-keyword-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyResults() {
    const text = evaluated
      .map(
        (r) =>
          `${r.keyword} — KGR: ${r.kgr} (${r.tier}) [Allintitle: ${r.allintitle} / Vol: ${r.volume}] -> ${r.recommendation}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied KGR results to clipboard.");
  }

  const bargainCount = evaluated.filter(
    (r) => r.tier === "Great (< 0.25)" || r.tier === "High-Vol Gem",
  ).length;
  const moderateCount = evaluated.filter(
    (r) => r.tier === "Might Work (0.25–1.0)",
  ).length;
  const competitiveCount = evaluated.filter(
    (r) => r.tier === "Competitive (> 1.0)",
  ).length;

  return (
    <section
      id="kgr-calculator-workspace"
      aria-label="Keyword Golden Ratio and Affinity Calculator Workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Building AI KGR Clustering & Content Plan"
            : "Calculating Keyword Golden Ratio & Affinity Scores"
        }
        description={
          overlayMode === "ai"
            ? "Grouping your <0.25 KGR bargain keywords into single-page briefs and SERP title hooks."
            : "Evaluating Allintitle-to-Volume ratios, bargain thresholds, and section-weighted keyword affinity."
        }
      />

      {/* TOP COMMAND PANEL */}
      <form
        onSubmit={(e) => void handleRunKgr(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/30">
              <Calculator aria-hidden className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Keyword Golden Ratio (KGR) &amp; Affinity Studio
              </h2>
              <p className="text-xs text-slate-400">
                Switch between Bulk KGR Calculation (Allintitle ÷ Volume) and LinkedIn / Page Keyword Affinity Scoring.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl border border-white/15 bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("kgr")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "kgr"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              1. Bulk KGR Calculator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("affinity")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "affinity"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              2. LinkedIn &amp; Page Affinity Score
            </button>
          </div>
        </div>

        {activeTab === "kgr" ? (
          <div className="space-y-5">
            {/* Presets + Bulk Import Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sample Batches:
                </span>
                {KGR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => void loadPreset(preset)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      activePresetId === preset.id
                        ? "border-emerald-400 bg-emerald-500/20 text-white"
                        : "border-white/15 bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPaste(!showBulkPaste)}
                className="rounded-xl border border-blue-400/35 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-200 hover:bg-blue-500/20"
              >
                {showBulkPaste ? "Hide Bulk Paste" : "📋 Paste CSV / Bulk Rows"}
              </button>
            </div>

            {showBulkPaste && (
              <div className="rounded-xl border border-blue-400/30 bg-slate-900/90 p-4 space-y-3">
                <label className="block text-xs font-bold text-blue-200">
                  Paste up to 50 lines in format: <code>keyword, allintitle, search_volume</code>
                </label>
                <textarea
                  rows={4}
                  value={bulkPaste}
                  onChange={(e) => setBulkPaste(e.target.value)}
                  placeholder={"keyword golden ratio calculator, 18, 110\nfree keyword grouping tool, 42, 210\nai citation readiness checker, 9, 170"}
                  className={field}
                />
                <button
                  type="button"
                  onClick={applyBulkPaste}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Load Pasted Rows Into Table
                </button>
              </div>
            )}

            {/* Interactive Keyword + Allintitle + Volume Input Grid */}
            <div className="space-y-2.5">
              <div className="hidden sm:grid sm:grid-cols-[1fr_150px_160px_130px_44px] gap-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>Keyword Phrase</span>
                <span>Allintitle Count</span>
                <span>Monthly Volume</span>
                <span>Live Google Check</span>
                <span />
              </div>

              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_150px_160px_130px_44px] items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900/75 p-2.5"
                >
                  <input
                    type="text"
                    value={row.keyword}
                    onChange={(e) =>
                      updateRow(row.id, { keyword: e.target.value })
                    }
                    placeholder={`Keyword #${idx + 1}`}
                    aria-label={`Keyword ${idx + 1}`}
                    className={field}
                  />
                  <input
                    type="number"
                    min={0}
                    max={10000000}
                    value={row.allintitle}
                    onChange={(e) =>
                      updateRow(row.id, {
                        allintitle: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Allintitle"
                    aria-label={`Allintitle for keyword ${idx + 1}`}
                    className={field}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10000000}
                    value={row.volume}
                    onChange={(e) =>
                      updateRow(row.id, {
                        volume: Number(e.target.value) || 1,
                      })
                    }
                    placeholder="Volume"
                    aria-label={`Monthly volume for keyword ${idx + 1}`}
                    className={field}
                  />
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `allintitle:"${row.keyword.trim()}"`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-slate-950 px-2.5 py-2 text-xs font-semibold text-blue-300 hover:border-blue-400 hover:text-white"
                  >
                    <span>allintitle:</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove row ${idx + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:border-rose-400/40 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-blue-400 hover:text-white"
                >
                  <Plus className="h-4 w-4 text-blue-400" />
                  Add Keyword Row ({rows.length}/50)
                </button>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    value={nicheContext}
                    onChange={(e) => setNicheContext(e.target.value)}
                    placeholder="Website niche context (optional for AI Clustering Plan)..."
                    className={field}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE 2: LinkedIn & Profile Keyword Affinity Calculator */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
                Target Keywords (Comma-Separated, up to 8)
              </label>
              <input
                type="text"
                value={affKeywords}
                onChange={(e) => setAffKeywords(e.target.value)}
                placeholder="ai seo, keyword research, technical seo, content strategy"
                className={field}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  1. LinkedIn Headline or Page H1 (35% Weight)
                </label>
                <textarea
                  rows={2}
                  value={affHeadline}
                  onChange={(e) => setAffHeadline(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  2. About / Opening Summary (25% Weight)
                </label>
                <textarea
                  rows={2}
                  value={affSummary}
                  onChange={(e) => setAffSummary(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  3. Experience / Body Case Studies (25% Weight)
                </label>
                <textarea
                  rows={2}
                  value={affExperience}
                  onChange={(e) => setAffExperience(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  4. Skills / Endorsements / Tags (15% Weight)
                </label>
                <textarea
                  rows={2}
                  value={affSkills}
                  onChange={(e) => setAffSkills(e.target.value)}
                  className={field}
                />
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <Calculator className="h-4 w-4" />
              {activeTab === "kgr"
                ? "Calculate KGR Scores Now"
                : "Calculate Keyword Affinity Score"}
            </button>
            {activeTab === "kgr" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRunAiStrategy()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
              >
                {busy && overlayMode === "ai" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-300" />
                )}
                Group &amp; Prioritize with AI
              </button>
            )}
          </div>
          {status && (
            <span className="text-xs font-medium text-emerald-300">
              {status}
            </span>
          )}
        </div>
      </form>

      {/* BOTTOM FULL-WIDTH RESULTS DASHBOARD */}
      <div
        ref={resultsRef}
        tabIndex={-1}
        className="scroll-mt-24 space-y-6 focus-visible:outline-none"
      >
        {activeTab === "kgr" ? (
          <>
            {/* Top Summary & Distribution Strip */}
            <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    KGR Formula: Allintitle ÷ Monthly Search Volume
                  </span>
                  <h3 className="mt-1.5 text-xl font-black text-white">
                    Keyword Golden Ratio (KGR) Scorecard ({evaluated.length} Keywords)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={copyResults}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50"
                  >
                    <Copy className="h-4 w-4 text-blue-300" />
                    Copy Results
                  </button>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50"
                  >
                    <Download className="h-4 w-4 text-emerald-300" />
                    Download CSV
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 border-t border-white/10 pt-4">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3">
                  <div className="text-xs font-bold uppercase text-emerald-200">
                    🟢 KGR Bargains (&lt; 0.25)
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {bargainCount} Keywords
                  </div>
                  <p className="text-[11px] text-emerald-100/80">
                    Low title competition — prioritize for immediate publishing
                  </p>
                </div>
                <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3">
                  <div className="text-xs font-bold uppercase text-amber-200">
                    🟡 Might Work (0.25 – 1.00)
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {moderateCount} Keywords
                  </div>
                  <p className="text-[11px] text-amber-100/80">
                    Moderate competition — pair with strong E-E-A-T &amp; tools
                  </p>
                </div>
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3">
                  <div className="text-xs font-bold uppercase text-rose-200">
                    🔴 Competitive (&gt; 1.00)
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {competitiveCount} Keywords
                  </div>
                  <p className="text-[11px] text-rose-100/80">
                    High title saturation — target long-tail modifiers first
                  </p>
                </div>
              </div>
            </div>

            {/* AI Strategy Clustering Card */}
            {aiStrategy && (
              <div className="rounded-2xl border border-indigo-400/40 bg-indigo-950/30 p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                  <span>AI KGR Publishing &amp; Clustering Strategy</span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {aiStrategy.headline}
                </h4>
                <p className="text-sm leading-7 text-slate-200">
                  {aiStrategy.summary}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiStrategy.clusterPlan.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-slate-950/85 p-4 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-emerald-300">
                        {c.groupName} · {c.pageFormat}
                      </div>
                      <div className="text-sm font-bold text-white">
                        Suggested Title: {c.suggestedTitle}
                      </div>
                      <p className="text-xs text-slate-400">
                        Grouped Keywords: {c.keywords}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color-Coded KGR Result Cards */}
            <div className="grid gap-5 lg:grid-cols-2">
              {evaluated.map((item, idx) => {
                const isBargain =
                  item.tier === "Great (< 0.25)" || item.tier === "High-Vol Gem";
                const isMid = item.tier === "Might Work (0.25–1.0)";
                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border border-t-4 p-5 shadow-xl flex flex-col justify-between ${
                      isBargain
                        ? "border-white/15 border-t-emerald-400 bg-gradient-to-b from-emerald-950/30 to-slate-950/95"
                        : isMid
                          ? "border-white/15 border-t-amber-400 bg-gradient-to-b from-amber-950/30 to-slate-950/95"
                          : "border-white/15 border-t-rose-400 bg-gradient-to-b from-rose-950/25 to-slate-950/95"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Keyword #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <h4 className="mt-0.5 text-lg font-black text-white">
                            {item.keyword}
                          </h4>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black ${
                            isBargain
                              ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                              : isMid
                                ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                                : "border-rose-400/50 bg-rose-500/20 text-rose-200"
                          }`}
                        >
                          {isBargain && <CheckCircle2 className="h-3.5 w-3.5" />}
                          KGR: {item.kgr} · {item.tier}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl border border-white/10 bg-slate-950/80 p-3 text-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Allintitle
                          </div>
                          <div className="mt-0.5 font-mono text-sm font-bold text-white">
                            {item.allintitle.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Monthly Volume
                          </div>
                          <div className="mt-0.5 font-mono text-sm font-bold text-blue-300">
                            {item.volume.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            &lt;0.25 Ceiling
                          </div>
                          <div className="mt-0.5 font-mono text-sm font-bold text-emerald-300">
                            ≤ {item.maxAllintitleForBargain} titles
                          </div>
                        </div>
                      </div>

                      <p className="mt-3.5 text-xs sm:text-sm leading-6 text-slate-200">
                        {item.recommendation}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <a
                        href={item.allintitleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white"
                      >
                        <span>Verify live allintitle on Google</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link
                        href="/tools/meta-title-generator"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white"
                      >
                        <span>Draft Title Tag</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          /* AFFINITY SCORE RESULTS DASHBOARD */
          <div className="rounded-2xl border border-white/15 bg-slate-950/85 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-400/35 bg-blue-500/15 px-3 py-0.5 text-xs font-bold uppercase text-blue-300">
                  LinkedIn &amp; Profile Keyword Affinity Score
                </span>
                <h3 className="mt-1.5 text-2xl font-black text-white">
                  Overall Affinity: {affinityReport.overallScore}% ({affinityReport.grade})
                </h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {affinityReport.sections.map((sec) => (
                <div
                  key={sec.section}
                  className="rounded-xl border border-white/10 bg-slate-900/90 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {sec.section}
                    </span>
                    <span className="rounded-lg bg-blue-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-200">
                      {sec.score}% Match
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-slate-300">{sec.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
