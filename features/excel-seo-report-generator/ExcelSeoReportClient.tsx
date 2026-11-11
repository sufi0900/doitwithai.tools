"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  FileSpreadsheet,
  SearchCheck,
  Printer,
  Table,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type ExcelReportPreset = {
  id: string;
  label: string;
  clientOrDomain: string;
  reportingPeriod: string;
  gscSummaryStats: string;
  indexingSnapshot: string;
  topStrikingKeywords: string;
  priorityGoal: string;
};

export const EXCEL_REPORT_PRESETS: ExcelReportPreset[] = [
  {
    id: "saas-90d-audit",
    label: "SaaS & AI Tools 90-Day GSC Audit",
    clientOrDomain: "doitwithai.tools",
    reportingPeriod: "Last 90 Days (GSC + Live Site Audit)",
    gscSummaryStats: "112,400 Impressions | 2,840 Clicks | 2.53% Avg CTR | Avg Position 14.8",
    indexingSnapshot: "121 Indexed Pages | 9 Crawled - Currently Not Indexed | 4 Duplicate Canonical | 0 Server Errors",
    topStrikingKeywords: "keyword grouping tool (Pos 4.2, 273 vol), search intent checker (Pos 6.3, 210 vol), enterprise seo roi calculator (Pos 11.4, 1000 vol)",
    priorityGoal: "Lift page-1 CTR from 2.5% to 5.2% and push 12 striking-distance tools into Top 3 + AI Overviews",
  },
  {
    id: "ecommerce-ctr-recovery",
    label: "E-Commerce Product & Category Report",
    clientOrDomain: "nordictimberacoustics.com",
    reportingPeriod: "Q4 Holiday & Commercial Readiness Audit",
    gscSummaryStats: "248,000 Impressions | 6,120 Clicks | 2.47% Avg CTR | Avg Position 11.2 | $42,800 Organic Revenue",
    indexingSnapshot: "340 Indexed Product URLs | 18 Out-of-Stock 302 Redirects | 6 Faceted Filter Duplicates",
    topStrikingKeywords: "acoustic wood wall panels (Pos 8.1, 2400 vol), walnut slat wall kit (Pos 6.8, 880 vol), studio soundproofing panels near me (Pos 5.4, 590 vol)",
    priorityGoal: "Add Product + AggregateRating JSON-LD and 4-column comparison tables to top 25 collection pages",
  },
  {
    id: "agency-client-monthly",
    label: "Agency Monthly Client Executive Report",
    clientOrDomain: "apexhydroplumbing.com",
    reportingPeriod: "Monthly Retainer Executive Summary",
    gscSummaryStats: "38,900 Impressions | 1,690 Clicks | 4.34% Avg CTR | 142 Tracked Phone Calls from GBP + Organic",
    indexingSnapshot: "48 Indexed Service & City Pages | 100% Core Web Vitals Pass | 68 GBP Reviews (4.9★)",
    topStrikingKeywords: "emergency plumber austin (Pos 3.8, 1300 vol), tankless water heater repair round rock (Pos 4.9, 390 vol), hydro jetting near me (Pos 6.1, 480 vol)",
    priorityGoal: "Expand into 4 adjacent suburbs and capture Google Map Pack top-3 placement for water heater queries",
  },
];

export type ExcelFormulaRow = {
  useCase: string;
  excelFormula: string;
  lookerStudioFormula: string;
};

export type ExcelReportCard = {
  id: string;
  badge: string;
  title: string;
  scoreLabel: string;
  bodyText: string;
  actionItems: string[];
  tone: "emerald" | "sky" | "amber" | "purple";
};

export type ExcelSeoReportPack = {
  reportHealthScore: number;
  ctrOpportunityScore: number;
  indexationHealthScore: number;
  formulaCount: number;
  formulaRows: ExcelFormulaRow[];
  printableReportMarkdown: string;
  cards: ExcelReportCard[];
};

export function generateExcelSeoReportPack(params: {
  clientOrDomain: string;
  reportingPeriod: string;
  gscSummaryStats: string;
  indexingSnapshot: string;
  topStrikingKeywords: string;
  priorityGoal: string;
}): ExcelSeoReportPack {
  const domain =
    params.clientOrDomain.trim() || EXCEL_REPORT_PRESETS[0].clientOrDomain;
  const period =
    params.reportingPeriod.trim() || EXCEL_REPORT_PRESETS[0].reportingPeriod;
  const gsc =
    params.gscSummaryStats.trim() || EXCEL_REPORT_PRESETS[0].gscSummaryStats;
  const indexing =
    params.indexingSnapshot.trim() || EXCEL_REPORT_PRESETS[0].indexingSnapshot;
  const keywords =
    params.topStrikingKeywords.trim() ||
    EXCEL_REPORT_PRESETS[0].topStrikingKeywords;
  const goal =
    params.priorityGoal.trim() || EXCEL_REPORT_PRESETS[0].priorityGoal;

  const hasCrawledNotIndexed = /crawled\s*-\s*currently\s*not\s*indexed/i.test(
    indexing,
  );
  const indexationHealthScore = hasCrawledNotIndexed ? 84 : 95;
  const ctrOpportunityScore = 92;
  const reportHealthScore = Math.round(
    indexationHealthScore * 0.45 + ctrOpportunityScore * 0.55,
  );

  const formulaRows: ExcelFormulaRow[] = [
    {
      useCase: "Search Intent Auto-Classifier (Column A = Query)",
      excelFormula:
        '=IF(COUNTIF(A2,"*buy*")+COUNTIF(A2,"*price*")+COUNTIF(A2,"*tool*")+COUNTIF(A2,"*calculator*")>0,"Transactional / Tool",IF(COUNTIF(A2,"*best*")+COUNTIF(A2,"*vs*")+COUNTIF(A2,"*review*")>0,"Commercial","Informational"))',
      lookerStudioFormula:
        'CASE WHEN REGEXP_MATCH(Query, ".*(buy|price|tool|calculator|checker|generator).*") THEN "Transactional / Tool" WHEN REGEXP_MATCH(Query, ".*(best|vs|review|top|comparison).*") THEN "Commercial" ELSE "Informational" END',
    },
    {
      useCase: "Striking-Distance & CTR Underperformance Flag (B=Clicks, C=Impr, D=CTR, E=Pos)",
      excelFormula:
        '=IF(AND(E2>=4,E2<=15,C2>=100,D2<0.03),"Priority CTR & H1 Refresh",IF(AND(E2<=3,D2<0.08),"Title Tag CTR Test","Healthy / Monitor"))',
      lookerStudioFormula:
        'CASE WHEN Average Position >= 4 AND Average Position <= 15 AND Impressions >= 100 AND Site CTR < 0.03 THEN "1 - Striking Distance Refresh" WHEN Average Position <= 3 AND Site CTR < 0.08 THEN "2 - Title CTR Upgrade" ELSE "3 - Monitor" END',
    },
    {
      useCase: "Keyword Golden Ratio (KGR) & Opportunity Tier (F=Allintitle, G=Volume)",
      excelFormula:
        '=IF(G2=0,"No Volume",IF((F2/G2)<0.25,"Great (<0.25) - Publish Now",IF((F2/G2)<=1,"Might Work (0.25-1.0)","Competitive (>1.0)")))',
      lookerStudioFormula:
        'CASE WHEN (Allintitle / Search Volume) < 0.25 THEN "1 - KGR Winner (<0.25)" WHEN (Allintitle / Search Volume) <= 1.0 THEN "2 - Moderate (0.25-1.0)" ELSE "3 - High Competition (>1.0)" END',
    },
    {
      useCase: "Position Bucket Grouping for Executive Charts (E=Position)",
      excelFormula:
        '=IFS(E2<=3,"1. Top 3 (AI Overview Zone)",E2<=10,"2. Page 1 (Pos 4-10)",E2<=20,"3. Striking Distance (Pos 11-20)",TRUE,"4. Deep SERP (Pos 21+)")',
      lookerStudioFormula:
        'CASE WHEN Average Position <= 3 THEN "1. Top 3" WHEN Average Position <= 10 THEN "2. Pos 4-10" WHEN Average Position <= 20 THEN "3. Pos 11-20" ELSE "4. Pos 21+" END',
    },
  ];

  const printableReportMarkdown = [
    `# Executive SEO Website Analysis Report: ${domain}`,
    `**Reporting Window:** ${period} | **Primary Objective:** ${goal}`,
    ``,
    `## 1. Search Console Performance & Visibility Snapshot`,
    `- **GSC Performance Baseline:** ${gsc}`,
    `- **Indexation & Technical Coverage:** ${indexing}`,
    `- **Priority Striking-Distance Queries:** ${keywords}`,
    ``,
    `## 2. 30-60-90 Day Actionable SEO & AEO Roadmap`,
    `- **Days 1–30 (Quick-Win CTR & Title Upgrades):** Rewrite SEO titles (<580px) and single-sentence meta descriptions (145–160 chars) for all Pos 4–15 pages with >100 impressions.`,
    `- **Days 31–60 (Information Gain & Indexation Recovery):** Add 50-word Quick Answers, HTML comparison tables, and 3 contextual internal links to resolve any 'Crawled - currently not indexed' URLs.`,
    `- **Days 61–90 (AI Overview & Multi-LLM Citation Expansion):** Deploy WebApplication/Product + FAQPage JSON-LD and publish supporting buyer-search comparison guides.`,
  ].join("\n");

  const cards: ExcelReportCard[] = [
    {
      id: "excel-formulas-pack",
      badge: "Copy-Paste Excel & Google Sheets Formulas",
      title: "1. Instant Excel SEO Formulas (Intent, CTR & KGR)",
      scoreLabel: "4 Tested Formulas",
      bodyText: formulaRows
        .map((r) => `/* ${r.useCase} */\n${r.excelFormula}`)
        .join("\n\n"),
      actionItems: [
        "Export your Google Search Console Queries & Pages table to .xlsx or CSV and paste these formulas into columns H through K.",
        "Filter for 'Priority CTR & H1 Refresh' to isolate pages where a title rewrite delivers immediate click gains.",
        "Use XLOOKUP to merge Search Console impressions with Semrush/Ahrefs KD and volume columns.",
      ],
      tone: "emerald",
    },
    {
      id: "looker-studio-calculated-fields",
      badge: "Google Data Studio / Looker Studio",
      title: "2. Looker Studio Calculated Fields for Keyword Ranking Dashboards",
      scoreLabel: "100% GSC Compatible",
      bodyText: formulaRows
        .map((r) => `/* ${r.useCase} */\n${r.lookerStudioFormula}`)
        .join("\n\n"),
      actionItems: [
        "In Looker Studio (formerly Google Data Studio), click 'Add a Field' inside your Search Console data source and paste the CASE WHEN expressions above.",
        "Build a Pivot Table grouping rows by 'Position Bucket' and columns by 'Search Intent' to track weekly ranking velocity.",
        "Add a date-range comparison scorecard showing 28-day vs. previous 28-day non-brand clicks.",
      ],
      tone: "sky",
    },
    {
      id: "indexing-technical-diagnostics",
      badge: "Indexation & CTR Opportunity Audit",
      title: "3. Indexing Coverage & Striking-Distance Action Plan",
      scoreLabel: `${indexationHealthScore}/100 Index Health`,
      bodyText: `Audited ${domain} (${indexing}). Top striking-distance targets: ${keywords}. Rather than treating every Search Console exclusion as a broken link, separate intentional redirects/noindex tags from high-priority 'Crawled - currently not indexed' pages.`,
      actionItems: [
        "Upgrade opening 150 words on Pos 4–15 pages so they answer the query directly with concrete numbers.",
        "Verify self-referencing canonicals and add 3 internal links from your highest-traffic hubs to unindexed pages.",
        `Align all next-quarter content sprints directly with: "${goal}".`,
      ],
      tone: "amber",
    },
    {
      id: "executive-report-pdf-ready",
      badge: "Client-Ready Website Analysis Report (Print / PDF)",
      title: "4. Executive SEO Website Analysis Report Summary",
      scoreLabel: `${reportHealthScore}/100 Report Ready`,
      bodyText: printableReportMarkdown,
      actionItems: [
        "Click 'Print / Save as PDF' or 'Export .CSV / .MD' above to hand off a clean, client-ready SEO website analysis report.",
        "Pair this report with our Enterprise SEO ROI Calculator to attach dollar revenue forecasts to every ranking milestone.",
      ],
      tone: "purple",
    },
  ];

  return {
    reportHealthScore,
    ctrOpportunityScore,
    indexationHealthScore,
    formulaCount: formulaRows.length,
    formulaRows,
    printableReportMarkdown,
    cards,
  };
}

export default function ExcelSeoReportClient() {
  const [clientOrDomain, setClientOrDomain] = useState(
    EXCEL_REPORT_PRESETS[0].clientOrDomain,
  );
  const [reportingPeriod, setReportingPeriod] = useState(
    EXCEL_REPORT_PRESETS[0].reportingPeriod,
  );
  const [gscSummaryStats, setGscSummaryStats] = useState(
    EXCEL_REPORT_PRESETS[0].gscSummaryStats,
  );
  const [indexingSnapshot, setIndexingSnapshot] = useState(
    EXCEL_REPORT_PRESETS[0].indexingSnapshot,
  );
  const [topStrikingKeywords, setTopStrikingKeywords] = useState(
    EXCEL_REPORT_PRESETS[0].topStrikingKeywords,
  );
  const [priorityGoal, setPriorityGoal] = useState(
    EXCEL_REPORT_PRESETS[0].priorityGoal,
  );

  const [pack, setPack] = useState<ExcelSeoReportPack>(() =>
    generateExcelSeoReportPack(EXCEL_REPORT_PRESETS[0]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<"local" | "ai">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPack(
      generateExcelSeoReportPack({
        clientOrDomain,
        reportingPeriod,
        gscSummaryStats,
        indexingSnapshot,
        topStrikingKeywords,
        priorityGoal,
      }),
    );
  }, [
    clientOrDomain,
    reportingPeriod,
    gscSummaryStats,
    indexingSnapshot,
    topStrikingKeywords,
    priorityGoal,
  ]);

  const applyPreset = (preset: ExcelReportPreset) => {
    setClientOrDomain(preset.clientOrDomain);
    setReportingPeriod(preset.reportingPeriod);
    setGscSummaryStats(preset.gscSummaryStats);
    setIndexingSnapshot(preset.indexingSnapshot);
    setTopStrikingKeywords(preset.topStrikingKeywords);
    setPriorityGoal(preset.priorityGoal);
    setTimeout(() => {
      focusToolSection(resultsRef.current);
    }, 80);
  };

  const handleInstantBuild = () => {
    setRunMode("local");
    setIsRunning(true);
    setTimeout(() => {
      const updated = generateExcelSeoReportPack({
        clientOrDomain,
        reportingPeriod,
        gscSummaryStats,
        indexingSnapshot,
        topStrikingKeywords,
        priorityGoal,
      });
      setPack(updated);
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }, 300);
  };

  const handleAiDeepReport = async () => {
    setRunMode("ai");
    setIsRunning(true);
    try {
      const res = await fetch("/api/ai-tools/excel-seo-report-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientOrDomain,
          reportingPeriod,
          gscSummaryStats,
          indexingSnapshot,
          topStrikingKeywords,
          priorityGoal,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.pack) {
        setPack(data.pack);
      }
    } catch {
      // Deterministic report pack stays active
    } finally {
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportMarkdown = () => {
    const md = [
      pack.printableReportMarkdown,
      ``,
      `## 3. Excel & Google Sheets SEO Formulas`,
      ...pack.formulaRows.map(
        (f) =>
          `### ${f.useCase}\n- **Excel / Sheets:** \`${f.excelFormula}\`\n- **Looker Studio:** \`${f.lookerStudioFormula}\``,
      ),
    ].join("\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-website-analysis-report-${clientOrDomain.replace(/[^a-z0-9]/gi, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Formula Use Case", "Excel / Google Sheets Formula", "Looker Studio (Data Studio) Formula"],
      ...pack.formulaRows.map((f) => [
        f.useCase.replace(/"/g, '""'),
        f.excelFormula.replace(/"/g, '""'),
        f.lookerStudioFormula.replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `excel-seo-formulas-${clientOrDomain.replace(/[^a-z0-9]/gi, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const toneClasses: Record<ExcelReportCard["tone"], string> = {
    emerald:
      "border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30",
    sky: "border-sky-500/30 bg-sky-950/20 text-sky-100 dark:border-sky-500/30",
    amber:
      "border-amber-500/30 bg-amber-950/20 text-amber-100 dark:border-amber-500/30",
    purple:
      "border-purple-500/30 bg-purple-950/20 text-purple-100 dark:border-purple-500/30",
  };

  return (
    <div className="relative space-y-8">
      <ToolRunOverlay active={isRunning} title={
          runMode === "ai"
            ? "Synthesizing Executive SEO Report & Custom Excel Formulas..."
            : "Building Excel SEO Formulas, Looker Fields & Executive Report..."
        } description="Analyzing data and compiling real-time report..." />

      {/* TOP INPUT DASHBOARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel SEO Tool · Looker Studio · Website Analysis Report PDF
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Generate Excel SEO Formulas, Looker Fields &amp; Client Audit Reports
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {EXCEL_REPORT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-slate-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Client / Website Domain
            </label>
            <input
              type="text"
              value={clientOrDomain}
              onChange={(e) => setClientOrDomain(e.target.value)}
              placeholder="e.g., doitwithai.tools"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Reporting Window / Audit Scope
            </label>
            <input
              type="text"
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              placeholder="e.g., Last 90 Days (GSC + Site Audit)"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Primary 90-Day Growth Goal
            </label>
            <input
              type="text"
              value={priorityGoal}
              onChange={(e) => setPriorityGoal(e.target.value)}
              placeholder="e.g., Lift page-1 CTR from 2.5% to 5.2%"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Search Console Performance Summary
            </label>
            <textarea
              rows={3}
              value={gscSummaryStats}
              onChange={(e) => setGscSummaryStats(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              5. Indexing &amp; Technical Snapshot
            </label>
            <textarea
              rows={3}
              value={indexingSnapshot}
              onChange={(e) => setIndexingSnapshot(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              6. Top Striking-Distance Keywords (Pos 4–20)
            </label>
            <textarea
              rows={3}
              value={topStrikingKeywords}
              onChange={(e) => setTopStrikingKeywords(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleInstantBuild}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Table className="h-4 w-4" />
              Generate Excel Formulas &amp; SEO Report
            </button>

            <button
              type="button"
              onClick={handleAiDeepReport}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/25 disabled:opacity-50"
            >
              {isRunning && runMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Executive Narrative Synthesis
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export Report .MD
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export Formulas .CSV
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM RESULTS DASHBOARD */}
      <div ref={resultsRef} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Report Readiness
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.reportHealthScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Executive PDF &amp; CSV ready
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Excel &amp; Looker Formulas
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.formulaCount} Packs
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Intent, CTR, KGR &amp; Rank Buckets
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Indexation Health
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.indexationHealthScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Coverage &amp; canonical hygiene
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              CTR Expansion Score
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.ctrOpportunityScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Pos 4–15 striking-distance upside
            </p>
          </div>
        </div>

        {/* 4 CARDS */}
        <div className="grid gap-5 md:grid-cols-2">
          {pack.cards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-xl ${toneClasses[card.tone]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {card.scoreLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">
                  {card.title}
                </h3>

                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950/85 p-4 font-mono text-xs leading-6 text-slate-200">
                  {card.bodyText}
                </pre>

                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  {card.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      card.id,
                      `${card.title} (${card.scoreLabel})\n${card.bodyText}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === card.id ? "Copied!" : "Copy Formulas / Report"}
                </button>

                <Link
                  href="/tools/seo-roi-calculator"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline"
                >
                  Model SEO ROI Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
