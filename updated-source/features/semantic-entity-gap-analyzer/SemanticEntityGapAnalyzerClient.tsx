"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  FileText,
  Globe,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import {
  buildSemanticGapDocx,
  compareSemanticEntityCoverage,
  exportSemanticGapCsv,
  type EntityGapStatus,
  type SemanticGapReport,
} from "./model";

const SAMPLE_YOUR_TEXT = `# How to Run a Technical SEO Audit
A technical SEO audit checks crawlability and indexation so search engines can access your pages.
## 1. Check Robots.txt and Sitemaps
Verify your XML sitemap and robots.txt rules so Googlebot can crawl important pages.
## 2. Review Meta Tags
Inspect title tags and meta descriptions across key templates.`;

const SAMPLE_COMP_1 = `# Complete Technical SEO Audit Guide for 2026
A technical SEO audit evaluates Google Search Console coverage, Core Web Vitals, canonical tags, and structured data markup.
## 1. Crawl Budget & Robots.txt Directives
Use Screaming Frog and Google Search Console crawl stats to inspect XML sitemaps, robots.txt, and orphan pages.
## 2. Core Web Vitals (LCP, INP, CLS)
Measure Largest Contentful Paint, Interaction to Next Paint (INP), and Cumulative Layout Shift using CrUX field data and PageSpeed Insights.
## 3. Canonical Tags, Redirect Chains & Hreflang
Fix 301 redirect chains, soft 404 errors, canonical tag mismatches, and JSON-LD Schema.org validation.`;

const SAMPLE_COMP_2 = `# 12-Step Technical SEO Checklist
Run a full site audit using Google Search Console, PageSpeed Insights, and Screaming Frog.
## 1. Indexability, Canonical Tags & Redirect Chains
Audit noindex directives, canonical tags, 301 redirect chains, and orphan pages in your site architecture.
## 2. Core Web Vitals & Interaction to Next Paint (INP)
Optimize Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
## 3. Structured Data & JSON-LD Schema.org
Validate JSON-LD Schema.org markup and hreflang annotations.`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

function CoverageCircleGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(Math.max(0, Math.min(100, score))), 60);
    return () => clearTimeout(t);
  }, [score]);

  const size = 128;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const stroke =
    score >= 75 ? "#10B981" : score >= 45 ? "#3452D1" : "#F59E0B";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148, 163, 184, 0.22)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-slate-900 dark:text-white">
          {animated}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Parity
        </span>
      </div>
    </div>
  );
}

export default function SemanticEntityGapAnalyzerClient() {
  // Default to Live URL mode ("live") as requested so users can directly enter their URL + Competitor URLs
  const [mode, setMode] = useState<"live" | "text">("live");
  const [targetKeyword, setTargetKeyword] = useState("technical seo audit");
  const [yourUrl, setYourUrl] = useState("");
  const [yourContent, setYourContent] = useState("");
  const [compUrlsInput, setCompUrlsInput] = useState("");
  const [comp1Text, setComp1Text] = useState("");
  const [comp2Text, setComp2Text] = useState("");

  const [report, setReport] = useState<SemanticGapReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<EntityGapStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  function loadSample() {
    setMode("text");
    setTargetKeyword("technical seo audit");
    setYourContent(SAMPLE_YOUR_TEXT);
    setComp1Text(SAMPLE_COMP_1);
    setComp2Text(SAMPLE_COMP_2);
    setError("");
    const built = compareSemanticEntityCoverage({
      targetKeyword: "technical seo audit",
      yourDoc: { htmlOrText: SAMPLE_YOUR_TEXT, url: "Your Draft" },
      competitorDocs: [
        { htmlOrText: SAMPLE_COMP_1, url: "Competitor #1 (Ranking #1)" },
        { htmlOrText: SAMPLE_COMP_2, url: "Competitor #2 (Ranking #2)" },
      ],
    });
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Compared your draft against 2 top-ranking competitors and extracted missing entities & subtopics.",
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "text") {
      if (!yourContent.trim() || (!comp1Text.trim() && !comp2Text.trim())) {
        setError(
          "Paste your page text/HTML and at least 1 competitor's text/HTML (or click 'Load Sample Competitor Gap').",
        );
        return;
      }
      setBusy(true);
      try {
        await paintToolFeedback();
        await new Promise((r) => setTimeout(r, 850));
        const comps = [
          comp1Text.trim()
            ? { htmlOrText: comp1Text, url: "Competitor #1" }
            : null,
          comp2Text.trim()
            ? { htmlOrText: comp2Text, url: "Competitor #2" }
            : null,
        ].filter(Boolean) as Array<{ htmlOrText: string; url: string }>;

        const built = compareSemanticEntityCoverage({
          targetKeyword,
          yourDoc: { htmlOrText: yourContent, url: yourUrl || "Your Draft" },
          competitorDocs: comps,
        });
        setReport(built);
        setRevision((r) => r + 1);
      } finally {
        setBusy(false);
      }
      return;
    }

    const compUrls = Array.from(
      new Set(
        compUrlsInput
          .split(/\r?\n/)
          .map((u) => u.trim())
          .filter(Boolean),
      ),
    ).slice(0, 3);

    if ((!yourUrl.trim() && !yourContent.trim()) || !compUrls.length) {
      setError(
        "Enter your page URL and 1 to 3 public competitor URLs (or click 'Load Sample Competitor Gap').",
      );
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();
      const res = await fetch("/api/ai-tools/semantic-entity-gap-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          targetKeyword,
          yourUrl: yourUrl.trim(),
          yourContent,
          competitorUrls: compUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.report) {
        setReport(null);
        setError(
          data?.error?.message ||
            "Could not fetch one or more URLs. Switch to 'Compare Pasted Drafts / HTML' mode instead.",
        );
        return;
      }
      setReport(data.report);
      setRevision((r) => r + 1);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setReport(null);
        setError("Comparison interrupted. Try Pasted Drafts mode.");
      }
    } finally {
      setBusy(false);
    }
  }

  const filteredTerms = useMemo(() => {
    if (!report) return [];
    return report.terms.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        return t.term.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [report, statusFilter, searchQuery]);

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownload(format: "csv" | "docx") {
    if (!report) return;
    if (format === "csv") {
      triggerDownload(
        new Blob([exportSemanticGapCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "semantic-entity-gap-matrix.csv",
      );
      setFeedback("Downloaded semantic entity gap CSV.");
    } else {
      const bytes = buildSemanticGapDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "semantic-content-gap-brief.docx",
      );
      setFeedback("Downloaded editable Word (.docx) content optimization brief.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Extracting semantic entities & competitor gaps"
        description="Fetching live pages, comparing named entities, technical phrases, word depth, and H2/H3 subtopics against ranking competitors."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <Layers aria-hidden className="text-[#5271ff]" />
              Compare Your Page Entities Against Top-Ranking Competitors
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Enter your live URL and up to 3 ranking competitor URLs (or paste
              drafts) to uncover missing named entities, technical phrases, and
              H2/H3 subtopics.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Competitor Gap
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Entity comparison input mode"
          className="mt-6 grid gap-2 sm:grid-cols-2"
        >
          {[
            {
              id: "live" as const,
              label: "1. Fetch Live URLs (Your URL + Up to 3 Competitor URLs)",
              sub: "Automatically fetches live pages, headings, and semantic entities",
              icon: Globe,
            },
            {
              id: "text" as const,
              label: "2. Compare Pasted Drafts / HTML (Instant & Offline)",
              sub: "Paste your draft and 1–2 competitor articles side by side",
              icon: FileText,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setMode(tab.id);
                  setError("");
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active
                      ? "mt-0.5 shrink-0 text-[#3452d1] dark:text-[#9aabff]"
                      : "mt-0.5 shrink-0 text-slate-400"
                  }
                />
                <div>
                  <p className="text-sm font-bold">{tab.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {tab.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label
            htmlFor="entity-target-keyword"
            className="block text-sm font-bold"
          >
            Primary Target Keyword / Topic
          </label>
          <input
            id="entity-target-keyword"
            type="text"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="e.g. technical seo audit"
            className={`${control} mt-1`}
          />
        </div>

        {mode === "live" ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="entity-your-url"
                className="block text-sm font-bold"
              >
                Your Page URL (required)
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Enter the public URL of your published article or landing page.
              </p>
              <ToolUrlInput
                id="entity-your-url"
                value={yourUrl}
                onChange={(e) => setYourUrl(e.target.value)}
                placeholder="https://your-site.com/your-article"
                className={`${control} mt-2`}
              />
            </div>
            <div>
              <label
                htmlFor="entity-comp-urls"
                className="block text-sm font-bold"
              >
                Top-Ranking Competitor URLs (1 to 3 URLs, one per line)
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Paste the top 1–3 URLs ranking in Google for your target keyword.
              </p>
              <textarea
                id="entity-comp-urls"
                rows={3}
                value={compUrlsInput}
                onChange={(e) => setCompUrlsInput(e.target.value)}
                placeholder={`https://competitor1.com/guide\nhttps://competitor2.com/guide`}
                className={`${control} mt-2 text-xs`}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div>
              <label
                htmlFor="entity-your-text"
                className="block text-sm font-bold"
              >
                Your Draft / Article Text or HTML
              </label>
              <textarea
                id="entity-your-text"
                rows={8}
                value={yourContent}
                onChange={(e) => setYourContent(e.target.value)}
                placeholder="Paste your article draft, Markdown, or HTML here..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
            <div>
              <label
                htmlFor="entity-comp1-text"
                className="block text-sm font-bold"
              >
                Competitor #1 Article Text or HTML
              </label>
              <textarea
                id="entity-comp1-text"
                rows={8}
                value={comp1Text}
                onChange={(e) => setComp1Text(e.target.value)}
                placeholder="Paste top-ranking Competitor #1 text or HTML..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
            <div>
              <label
                htmlFor="entity-comp2-text"
                className="block text-sm font-bold"
              >
                Competitor #2 Article Text or HTML (optional)
              </label>
              <textarea
                id="entity-comp2-text"
                rows={8}
                value={comp2Text}
                onChange={(e) => setComp2Text(e.target.value)}
                placeholder="Paste Competitor #2 text or HTML..."
                className={`${control} mt-1 text-xs`}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <Layers size={18} />
            Run Semantic Entity Gap Analysis
          </button>
          {report && (
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Clear
            </button>
          )}
        </div>
      </form>

      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Semantic entity gap results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* KPI Scorecard with Circular Coverage Gauge */}
          <div className={panel}>
            <div className="grid items-center gap-6 border-b border-slate-200 pb-6 dark:border-slate-700 lg:grid-cols-[150px_minmax(0,1fr)_auto]">
              <div className="flex justify-center">
                <CoverageCircleGauge score={report.coverageScore} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Semantic Coverage vs. {report.competitorStats.length}{" "}
                  Competitor(s)
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Entity &amp; Subtopic Gap Report
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your Word Count: <strong>{report.yourStats.wordCount}</strong>{" "}
                  (Competitor Avg: <strong>{report.benchmarkWordCount}</strong>)
                  · Your Headings:{" "}
                  <strong>{report.yourStats.headingCount}</strong> (Competitor
                  Avg: <strong>{report.benchmarkHeadingCount}</strong>)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Entity Matrix (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Optimization Brief (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
                  Missing Entities
                </p>
                <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                  {report.missingCriticalCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  0 mentions on your page
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                  Under-Used Terms
                </p>
                <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
                  {report.underUsedCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Below competitor density
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  Well-Covered
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {report.wellCoveredCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Matches competitor usage
                </p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <p className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                  Unique to You
                </p>
                <p className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {report.uniqueYoursCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your differentiation terms
                </p>
              </div>
            </div>
          </div>

          {/* Missing Subtopics Banner */}
          {report.missingSubtopics.length > 0 && (
            <div className={panel}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold">
                  Missing Competitor Subheadings (H2/H3 Gaps)
                </h3>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      report.missingSubtopics.map((s) => `## ${s}`).join("\n"),
                    );
                    setFeedback("Copied missing H2 subtopics to clipboard.");
                  }}
                  className={secondaryBtn}
                >
                  <Copy size={14} />
                  Copy Headings
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.missingSubtopics.map((h) => (
                  <span
                    key={h}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filterable Entity Matrix */}
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-extrabold">
                Semantic Entity &amp; Phrase Matrix ({filteredTerms.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter entity..."
                    aria-label="Filter semantic entities"
                    className="rounded-xl border border-slate-300 bg-transparent py-1.5 pl-8 pr-3 text-xs dark:border-slate-600"
                  />
                </div>
                {(
                  [
                    ["all", "All Terms"],
                    ["missing-critical", "Missing Gaps"],
                    ["under-used", "Under-Used"],
                    ["well-covered", "Well-Covered"],
                    ["unique-yours", "Unique to You"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatusFilter(val)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      statusFilter === val
                        ? "border-[#3452d1] bg-[#3452d1] text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-3 pr-3">Entity / Phrase</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Your Count</th>
                    <th className="px-3 py-3">Competitor Avg</th>
                    <th className="px-3 py-3">Target Range</th>
                    <th className="py-3 pl-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredTerms.map((t) => (
                    <tr key={t.term}>
                      <td className="py-3 pr-3 font-mono font-bold">
                        {t.term}
                        <span className="ml-2 font-sans text-[10px] font-normal text-slate-400">
                          ({t.kind})
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            t.status === "missing-critical"
                              ? "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                              : t.status === "under-used"
                                ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                                : t.status === "well-covered"
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                                  : "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold">{t.yourCount}x</td>
                      <td className="px-3 py-3">
                        {t.competitorAvgCount}x ({t.competitorsMentioning}/
                        {t.totalCompetitors} comps)
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        {t.recommendedRange[0]}–{t.recommendedRange[1]}x
                      </td>
                      <td className="py-3 pl-3 text-slate-600 dark:text-slate-300">
                        {t.suggestedPlacement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
