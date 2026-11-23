"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Copy,
  Download,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type RoiPreset = {
  id: string;
  label: string;
  badge: string;
  monthlyBudget: number;
  monthlyVolume: number;
  expectedCtr: number;
  conversionRate: number;
  closeRate: number;
  customerLtv: number;
  pagesPerMonth: number;
  context: string;
};

export const ROI_PRESETS: RoiPreset[] = [
  {
    id: "b2b-saas",
    label: "B2B SaaS Startup",
    badge: "High LTV · Compounding",
    monthlyBudget: 3500,
    monthlyVolume: 22000,
    expectedCtr: 11.0,
    conversionRate: 3.2,
    closeRate: 25.0,
    customerLtv: 2400,
    pagesPerMonth: 8,
    context: "B2B SaaS platform targeting mid-funnel comparison and problem-solving topic clusters.",
  },
  {
    id: "enterprise",
    label: "Enterprise SEO Program",
    badge: "Enterprise Scale",
    monthlyBudget: 12000,
    monthlyVolume: 95000,
    expectedCtr: 14.5,
    conversionRate: 2.5,
    closeRate: 20.0,
    customerLtv: 8500,
    pagesPerMonth: 20,
    context: "Enterprise multi-product website scaling programmatic pages, technical SEO, and AI Overview citations.",
  },
  {
    id: "ecommerce",
    label: "E-Commerce / DTC Brand",
    badge: "Direct Checkout",
    monthlyBudget: 2500,
    monthlyVolume: 48000,
    expectedCtr: 12.0,
    conversionRate: 2.8,
    closeRate: 100.0,
    customerLtv: 165,
    pagesPerMonth: 12,
    context: "Online store optimizing category pages, product schema, and commercial buying guides.",
  },
  {
    id: "local-service",
    label: "Local Business & Agency",
    badge: "High Conversion",
    monthlyBudget: 1200,
    monthlyVolume: 6500,
    expectedCtr: 15.8,
    conversionRate: 6.5,
    closeRate: 35.0,
    customerLtv: 950,
    pagesPerMonth: 4,
    context: "Local service provider targeting Google Map Pack, city service pages, and high-intent 'near me' queries.",
  },
];

export const CTR_BENCHMARKS = [
  { label: "Pos #1 (~27.6% CTR)", value: 27.6 },
  { label: "Pos #2 (~15.8% CTR)", value: 15.8 },
  { label: "Pos #3 (~11.0% CTR)", value: 11.0 },
  { label: "Top 5 Avg (~7.5% CTR)", value: 7.5 },
  { label: "Page 1 Lower #6–10 (~3.2% CTR)", value: 3.2 },
];

export type MonthRow = {
  month: number;
  rampFactor: number;
  traffic: number;
  leads: number;
  customers: number;
  monthlyRevenue: number;
  monthlyCost: number;
  cumulativeCost: number;
  cumulativeRevenue: number;
  cumulativeNet: number;
  status: "Investment Phase" | "Break-Even Reached" | "Compounding Profit";
};

export type RoiCalculationReport = {
  monthlyBudget: number;
  total12MonthCost: number;
  total12MonthRevenue: number;
  total12MonthNetProfit: number;
  roiPercentage: number;
  roiMultiple: number;
  breakEvenMonth: number | null;
  month12Traffic: number;
  month12Revenue: number;
  totalCustomers12Mo: number;
  organicCac: number;
  budgetSplit: Array<{
    category: string;
    share: number;
    amount: number;
    purpose: string;
  }>;
  months: MonthRow[];
};

// Realistic 12-month SEO authority & indexing ramp curve (Month 1 = 12% of mature target -> Month 12 = 115% with compounding long-tail)
const RAMP_CURVE = [
  0.12, 0.2, 0.32, 0.45, 0.58, 0.72, 0.85, 0.95, 1.02, 1.08, 1.12, 1.18,
];

export function calculateSeoRoiModel(params: {
  monthlyBudget: number;
  monthlyVolume: number;
  expectedCtr: number;
  conversionRate: number;
  closeRate: number;
  customerLtv: number;
  pagesPerMonth: number;
}): RoiCalculationReport {
  const budget = Math.max(100, params.monthlyBudget);
  const volume = Math.max(100, params.monthlyVolume);
  const ctr = Math.max(0.5, Math.min(60, params.expectedCtr)) / 100;
  const conv = Math.max(0.1, Math.min(50, params.conversionRate)) / 100;
  const close = Math.max(1, Math.min(100, params.closeRate)) / 100;
  const ltv = Math.max(10, params.customerLtv);
  const velocityBoost = 1 + Math.min(0.35, Math.max(0, (params.pagesPerMonth - 4) * 0.015));

  const baseMatureTraffic = volume * ctr * velocityBoost;
  const months: MonthRow[] = [];
  let cumCost = 0;
  let cumRev = 0;
  let totalCustomers = 0;
  let breakEvenMonth: number | null = null;

  for (let i = 0; i < 12; i++) {
    const m = i + 1;
    const ramp = RAMP_CURVE[i];
    const traffic = Math.round(baseMatureTraffic * ramp);
    const leads = +(traffic * conv).toFixed(1);
    const customers = +(leads * close).toFixed(1);
    const monthlyRevenue = Math.round(customers * ltv);
    cumCost += budget;
    cumRev += monthlyRevenue;
    totalCustomers += customers;
    const cumNet = cumRev - cumCost;

    let status: MonthRow["status"] = "Investment Phase";
    if (cumNet >= 0) {
      if (breakEvenMonth === null) {
        breakEvenMonth = m;
        status = "Break-Even Reached";
      } else {
        status = "Compounding Profit";
      }
    }

    months.push({
      month: m,
      rampFactor: Math.round(ramp * 100),
      traffic,
      leads,
      customers,
      monthlyRevenue,
      monthlyCost: budget,
      cumulativeCost: cumCost,
      cumulativeRevenue: cumRev,
      cumulativeNet: cumNet,
      status,
    });
  }

  const total12MonthCost = cumCost;
  const total12MonthRevenue = cumRev;
  const total12MonthNetProfit = total12MonthRevenue - total12MonthCost;
  const roiPercentage =
    total12MonthCost > 0
      ? Math.round((total12MonthNetProfit / total12MonthCost) * 100)
      : 0;
  const roiMultiple =
    total12MonthCost > 0
      ? +(total12MonthRevenue / total12MonthCost).toFixed(2)
      : 0;
  const organicCac =
    totalCustomers > 0 ? Math.round(total12MonthCost / totalCustomers) : 0;

  const budgetSplit = [
    {
      category: "Content Production & Topic Clusters",
      share: 45,
      amount: Math.round(budget * 0.45),
      purpose: "High-intent pillar guides, comparison pages, and interactive tools.",
    },
    {
      category: "Technical SEO, Schema & AEO/GEO",
      share: 25,
      amount: Math.round(budget * 0.25),
      purpose: "Core Web Vitals, JSON-LD schema, internal linking, and AI Overview readiness.",
    },
    {
      category: "Digital PR & Authority Link Building",
      share: 20,
      amount: Math.round(budget * 0.2),
      purpose: "Original data studies, journalist pitches, and high-authority mentions.",
    },
    {
      category: "SEO Analytics, Testing & AI Tool Stack",
      share: 10,
      amount: Math.round(budget * 0.1),
      purpose: "Search Console tracking, CTR testing, and content refresh audits.",
    },
  ];

  return {
    monthlyBudget: budget,
    total12MonthCost,
    total12MonthRevenue,
    total12MonthNetProfit,
    roiPercentage,
    roiMultiple,
    breakEvenMonth,
    month12Traffic: months[11].traffic,
    month12Revenue: months[11].monthlyRevenue,
    totalCustomers12Mo: Math.round(totalCustomers),
    organicCac,
    budgetSplit,
    months,
  };
}

type AiExecutiveMemo = {
  headline: string;
  executiveSummary: string;
  keyRecommendations: string[];
  riskMitigation: string;
};

const field =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function SeoRoiCalculatorClient() {
  const [monthlyBudget, setMonthlyBudget] = useState(3500);
  const [monthlyVolume, setMonthlyVolume] = useState(22000);
  const [expectedCtr, setExpectedCtr] = useState(11.0);
  const [conversionRate, setConversionRate] = useState(3.2);
  const [closeRate, setCloseRate] = useState(25.0);
  const [customerLtv, setCustomerLtv] = useState(2400);
  const [pagesPerMonth, setPagesPerMonth] = useState(8);
  const [context, setContext] = useState(ROI_PRESETS[0].context);
  const [activePresetId, setActivePresetId] = useState("b2b-saas");

  const [report, setReport] = useState<RoiCalculationReport>(() =>
    calculateSeoRoiModel(ROI_PRESETS[0]),
  );
  const [aiMemo, setAiMemo] = useState<AiExecutiveMemo | null>(null);
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

  async function applyPreset(preset: RoiPreset) {
    setActivePresetId(preset.id);
    setMonthlyBudget(preset.monthlyBudget);
    setMonthlyVolume(preset.monthlyVolume);
    setExpectedCtr(preset.expectedCtr);
    setConversionRate(preset.conversionRate);
    setCloseRate(preset.closeRate);
    setCustomerLtv(preset.customerLtv);
    setPagesPerMonth(preset.pagesPerMonth);
    setContext(preset.context);
    setOverlayMode("calc");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setReport(calculateSeoRoiModel(preset));
      setAiMemo(null);
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} 12-month SEO ROI & Cost model.`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRunCalculation(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setOverlayMode("calc");
    setBusy(true);
    try {
      await paintToolFeedback(550);
      const next = calculateSeoRoiModel({
        monthlyBudget,
        monthlyVolume,
        expectedCtr,
        conversionRate,
        closeRate,
        customerLtv,
        pagesPerMonth,
      });
      setReport(next);
      setRevision((r) => r + 1);
      setStatus("12-month SEO ROI, cost breakdown, and break-even timeline updated.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateAiMemo() {
    if (busy) return;
    setOverlayMode("ai");
    setBusy(true);
    try {
      const next = calculateSeoRoiModel({
        monthlyBudget,
        monthlyVolume,
        expectedCtr,
        conversionRate,
        closeRate,
        customerLtv,
        pagesPerMonth,
      });
      setReport(next);
      const res = await fetch("/api/ai-tools/seo-roi-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyBudget,
          monthlyVolume,
          expectedCtr,
          conversionRate,
          closeRate,
          customerLtv,
          pagesPerMonth,
          context,
          roiPercentage: next.roiPercentage,
          breakEvenMonth: next.breakEvenMonth,
          total12MonthRevenue: next.total12MonthRevenue,
          total12MonthCost: next.total12MonthCost,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { memo?: AiExecutiveMemo };
        if (data.memo) setAiMemo(data.memo);
      }
      setRevision((r) => r + 1);
      setStatus("Generated CFO-ready SEO budget & ROI executive memo.");
    } catch {
      setStatus("Calculated 12-month ROI forecast.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const headers = [
      "Month",
      "Ramp %",
      "Projected Organic Traffic",
      "Monthly Leads / Trials",
      "New Customers",
      "Monthly Revenue ($)",
      "Monthly SEO Spend ($)",
      "Cumulative Spend ($)",
      "Cumulative Revenue ($)",
      "Cumulative Net Profit ($)",
      "Phase Status",
    ];
    const rows = report.months.map((m) => [
      `Month ${m.month}`,
      `${m.rampFactor}%`,
      m.traffic,
      m.leads,
      m.customers,
      m.monthlyRevenue,
      m.monthlyCost,
      m.cumulativeCost,
      m.cumulativeRevenue,
      m.cumulativeNet,
      m.status,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-roi-12-month-forecast.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySummary() {
    const text = [
      `SEO ROI & Cost Forecast (12-Month Model)`,
      `Monthly SEO Budget: $${report.monthlyBudget.toLocaleString()}/mo ($${report.total12MonthCost.toLocaleString()}/yr)`,
      `Projected 12-Month Organic Revenue: $${report.total12MonthRevenue.toLocaleString()}`,
      `Projected 12-Month Net Profit: $${report.total12MonthNetProfit.toLocaleString()}`,
      `Net 12-Month ROI: ${report.roiPercentage}% (${report.roiMultiple}x Return)`,
      `Break-Even Timeline: ${report.breakEvenMonth ? `Month ${report.breakEvenMonth}` : "Beyond Month 12"}`,
      `Month-12 Traffic Run-Rate: ${report.month12Traffic.toLocaleString()} visits/mo`,
      `Estimated Organic CAC: $${report.organicCac.toLocaleString()}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied 12-month SEO ROI summary to clipboard.");
  }

  const isPositiveRoi = report.roiPercentage >= 0;

  return (
    <section
      id="seo-roi-workspace"
      aria-label="SEO ROI, Cost and Budget Calculator Workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Drafting CFO & Executive SEO Budget Memo"
            : "Calculating 12-Month SEO ROI & Compounding Curve"
        }
        description={
          overlayMode === "ai"
            ? "Synthesizing your traffic, conversion, LTV, and budget split into an executive investment strategy."
            : "Modeling 12-month indexing ramp, SERP click-through curve, break-even month, and customer acquisition cost."
        }
      />

      {/* TOP COMMAND PANEL: Presets + Financial & Traffic Inputs */}
      <form
        onSubmit={(e) => void handleRunCalculation(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-400/30">
              <Calculator aria-hidden className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Configure Your SEO Budget, Traffic &amp; Conversion Inputs
              </h2>
              <p className="text-xs text-slate-400">
                Select an industry benchmark preset or enter your own monthly budget, keyword volume, and customer LTV.
              </p>
            </div>
          </div>

          {/* 4 Industry Preset Pills */}
          <div className="flex flex-wrap gap-2">
            {ROI_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  activePresetId === preset.id
                    ? "border-blue-400 bg-blue-600/25 text-white shadow-sm"
                    : "border-white/15 bg-slate-900 text-slate-300 hover:border-white/30 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Core Numeric Inputs Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-budget"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-300"
            >
              <span>1. Monthly SEO Budget ($)</span>
              <span className="font-mono text-white">
                ${monthlyBudget.toLocaleString()}/mo
              </span>
            </label>
            <input
              id="roi-budget"
              type="number"
              min={100}
              max={250000}
              step={100}
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value) || 0)}
              className={field}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Annual investment: ${(monthlyBudget * 12).toLocaleString()}/yr
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-volume"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-300"
            >
              <span>2. Target Monthly Search Volume</span>
              <span className="font-mono text-white">
                {monthlyVolume.toLocaleString()} searches
              </span>
            </label>
            <input
              id="roi-volume"
              type="number"
              min={100}
              max={5000000}
              step={500}
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value) || 0)}
              className={field}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Combined monthly volume of your target keyword clusters
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-ctr"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-300"
            >
              <span>3. Expected Organic CTR (%)</span>
              <span className="font-mono text-white">{expectedCtr}%</span>
            </label>
            <input
              id="roi-ctr"
              type="number"
              min={0.5}
              max={50}
              step={0.5}
              value={expectedCtr}
              onChange={(e) => setExpectedCtr(Number(e.target.value) || 0)}
              className={field}
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {CTR_BENCHMARKS.slice(0, 3).map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setExpectedCtr(b.value)}
                  className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-blue-500/20 hover:text-white"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-conv"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-300"
            >
              <span>4. Visitor-to-Lead / Cart Rate (%)</span>
              <span className="font-mono text-white">{conversionRate}%</span>
            </label>
            <input
              id="roi-conv"
              type="number"
              min={0.1}
              max={40}
              step={0.1}
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value) || 0)}
              className={field}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              % of organic visitors who sign up, inquire, or checkout
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-close"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-300"
            >
              <span>5. Lead-to-Customer Close Rate (%)</span>
              <span className="font-mono text-white">{closeRate}%</span>
            </label>
            <input
              id="roi-close"
              type="number"
              min={1}
              max={100}
              step={1}
              value={closeRate}
              onChange={(e) => setCloseRate(Number(e.target.value) || 0)}
              className={field}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Use 100% for direct e-commerce or 15–35% for B2B/service leads
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <label
              htmlFor="roi-ltv"
              className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300"
            >
              <span>6. Customer Lifetime Value / AOV ($)</span>
              <span className="font-mono text-white">
                ${customerLtv.toLocaleString()}
              </span>
            </label>
            <input
              id="roi-ltv"
              type="number"
              min={10}
              max={500000}
              step={25}
              value={customerLtv}
              onChange={(e) => setCustomerLtv(Number(e.target.value) || 0)}
              className={field}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Average net revenue generated per acquired customer
            </p>
          </div>
        </div>

        {/* Velocity & Business Context Row */}
        <div className="grid gap-4 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
          <div>
            <label
              htmlFor="roi-pages"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Monthly Content / Tool Velocity (Pages/mo)
            </label>
            <input
              id="roi-pages"
              type="number"
              min={1}
              max={100}
              value={pagesPerMonth}
              onChange={(e) => setPagesPerMonth(Number(e.target.value) || 1)}
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="roi-context"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Business Model &amp; Niche Context (Optional for AI Executive Memo)
            </label>
            <input
              id="roi-context"
              type="text"
              maxLength={300}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., B2B SaaS CRM targeting small business owners..."
              className={field}
            />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <TrendingUp aria-hidden className="h-4 w-4" />
              Calculate 12-Month SEO ROI
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGenerateAiMemo()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {busy && overlayMode === "ai" ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles aria-hidden className="h-4 w-4 text-indigo-300" />
              )}
              Generate AI CFO &amp; Budget Memo
            </button>
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
        {/* Top Summary Header + Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl">
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              12-Month SEO Financial Forecast
            </span>
            <h3 className="mt-1.5 text-xl font-black text-white">
              Projected Organic ROI, Break-Even &amp; Budget Allocation
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50 hover:bg-blue-500/15"
            >
              <Copy className="h-4 w-4 text-blue-300" />
              Copy Executive Summary
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50 hover:bg-emerald-500/15"
            >
              <Download className="h-4 w-4 text-emerald-300" />
              Download 12-Month CSV
            </button>
          </div>
        </div>

        {/* 6 Color-Coded KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className={`rounded-2xl border border-t-4 p-5 shadow-lg ${
              isPositiveRoi
                ? "border-white/15 border-t-emerald-400 bg-emerald-950/20"
                : "border-white/15 border-t-amber-400 bg-amber-950/20"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              12-Month Net SEO ROI
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span
                className={`text-3xl font-black ${
                  isPositiveRoi ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {report.roiPercentage >= 0 ? `+${report.roiPercentage}%` : `${report.roiPercentage}%`}
              </span>
              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                {report.roiMultiple}x Return Multiple
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Compares 12-month net organic profit against total SEO investment.
            </p>
          </div>

          <div className="rounded-2xl border border-t-4 border-white/15 border-t-sky-400 bg-sky-950/20 p-5 shadow-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              12-Month Cumulative Revenue
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              ${report.total12MonthRevenue.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Against <strong>${report.total12MonthCost.toLocaleString()}</strong> total 12-month SEO spend.
            </p>
          </div>

          <div className="rounded-2xl border border-t-4 border-white/15 border-t-indigo-400 bg-indigo-950/20 p-5 shadow-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Profit &amp; Break-Even Timeline
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-indigo-200">
                ${report.total12MonthNetProfit.toLocaleString()}
              </span>
              <span className="rounded-lg border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-200">
                {report.breakEvenMonth
                  ? `Break-Even: Month ${report.breakEvenMonth}`
                  : "Break-Even: Month 13+"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Month when cumulative organic revenue exceeds cumulative SEO spend.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Month-12 Monthly Traffic Run-Rate
            </div>
            <div className="mt-2 text-2xl font-black text-blue-300">
              {report.month12Traffic.toLocaleString()} visits/mo
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Generating <strong>${report.month12Revenue.toLocaleString()}/mo</strong> in recurring organic revenue by Month 12.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Customers Acquired (Year 1)
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-300">
              {report.totalCustomers12Mo.toLocaleString()} customers
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              At <strong>${customerLtv.toLocaleString()}</strong> average customer LTV / order value.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Effective Organic CAC
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">
                ${report.organicCac.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">per customer</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              LTV:CAC Ratio:{" "}
              <strong>
                {report.organicCac > 0
                  ? `${(customerLtv / report.organicCac).toFixed(1)}:1`
                  : "N/A"}
              </strong>{" "}
              (3:1+ is healthy B2B/SaaS benchmark).
            </p>
          </div>
        </div>

        {/* AI Executive Memo (When Generated) */}
        {aiMemo && (
          <div className="rounded-2xl border border-indigo-400/40 bg-indigo-950/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <span>AI CFO &amp; Executive Investment Memo</span>
            </div>
            <h4 className="text-lg font-black text-white">{aiMemo.headline}</h4>
            <p className="text-sm leading-7 text-slate-200">
              {aiMemo.executiveSummary}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {aiMemo.keyRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 text-xs leading-6 text-slate-200"
                >
                  <div className="font-bold text-indigo-300 mb-1">
                    Action Pillar #{idx + 1}
                  </div>
                  {rec}
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-200/90 border-t border-white/10 pt-3">
              <strong>Risk &amp; Assumption Guardrail:</strong> {aiMemo.riskMitigation}
            </p>
          </div>
        )}

        {/* Recommended Monthly SEO Budget Allocation Card */}
        <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-black text-white">
                Recommended Monthly SEO Budget Allocation (${report.monthlyBudget.toLocaleString()}/mo)
              </h4>
              <p className="text-xs text-slate-400">
                How high-performing SEO teams divide monthly spend across Content, Technical/AEO, Authority, and Tooling.
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {report.budgetSplit.map((b) => (
              <div
                key={b.category}
                className="rounded-xl border border-white/10 bg-slate-900/90 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                    <span>{b.share}% Share</span>
                    <span className="font-mono text-sm text-white">
                      ${b.amount.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-white">
                    {b.category}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {b.purpose}
                  </p>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${b.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12-Month Month-by-Month Compounding Schedule Table */}
        <div className="rounded-2xl border border-white/15 bg-slate-950/85 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-black text-white">
                12-Month SEO Traffic, Revenue &amp; Break-Even Schedule
              </h4>
              <p className="text-xs text-slate-400">
                Models realistic Google indexing &amp; authority ramp-up from Month 1 (12% maturity) to Month 12 (118% compounding maturity).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-3.5 py-3">Month</th>
                  <th className="px-3.5 py-3 text-right">Ramp %</th>
                  <th className="px-3.5 py-3 text-right">Organic Visits</th>
                  <th className="px-3.5 py-3 text-right">Leads / Carts</th>
                  <th className="px-3.5 py-3 text-right">Customers</th>
                  <th className="px-3.5 py-3 text-right">Monthly Rev</th>
                  <th className="px-3.5 py-3 text-right">Cum. Spend</th>
                  <th className="px-3.5 py-3 text-right">Cum. Revenue</th>
                  <th className="px-3.5 py-3 text-right">Cum. Net Profit</th>
                  <th className="px-3.5 py-3">Phase Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {report.months.map((m) => (
                  <tr
                    key={m.month}
                    className={
                      m.status === "Break-Even Reached"
                        ? "bg-emerald-950/35"
                        : "hover:bg-white/[0.02]"
                    }
                  >
                    <td className="px-3.5 py-2.5 font-bold text-white">
                      Month {m.month}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-400">
                      {m.rampFactor}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-blue-200">
                      {m.traffic.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-300">
                      {m.leads.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-emerald-300">
                      {m.customers.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-white">
                      ${m.monthlyRevenue.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-400">
                      ${m.cumulativeCost.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-200">
                      ${m.cumulativeRevenue.toLocaleString()}
                    </td>
                    <td
                      className={`px-3.5 py-2.5 text-right font-mono font-bold ${
                        m.cumulativeNet >= 0 ? "text-emerald-400" : "text-rose-300"
                      }`}
                    >
                      {m.cumulativeNet >= 0
                        ? `+$${m.cumulativeNet.toLocaleString()}`
                        : `-$${Math.abs(m.cumulativeNet).toLocaleString()}`}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          m.status === "Compounding Profit"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            : m.status === "Break-Even Reached"
                              ? "bg-sky-500/25 text-sky-200 border border-sky-400/40"
                              : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {m.status === "Break-Even Reached" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Connected Workflow Next Steps */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <Link
              href="/tools/keyword-research-tool"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/25"
            >
              Find Target Keywords
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools/keyword-clustering-tool"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
            >
              Group Keywords Into Topic Clusters
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools/search-intent-checker"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-indigo-400/35 bg-indigo-500/15 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25"
            >
              Verify Search Intent &amp; SERP Format
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
