"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  BENCHMARK_PROFILES,
  CATEGORY_META,
  buildAnchorAnalysisReport,
  exportAnchorRowsCsv,
  exportAnchorSummaryCsv,
  parseSubmittedBacklinkTable,
} from "./analyze";
import { extractAnchorsFromHtml } from "./html-extract";
import type {
  AnchorAnalysisReport,
  AnchorCategory,
  FollowStatus,
  PageBenchmarkProfile,
} from "./types";

const SAMPLE_CSV_DATA = `Anchor Text,Source URL,Target URL,Rel,Surrounding Context
DoItWithAI,https://martechweekly.example.com/ai-seo-stack,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Teams use DoItWithAI to audit link anchor ratios before outreach.
doitwithai.tools,https://seoroundup.example.org/resources,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Listed under free technical utilities at doitwithai.tools for quick audits.
https://doitwithai.tools/tools/anchor-text-analyzer,https://SearchForum.example.net/threads/link-audits,https://doitwithai.tools/tools/anchor-text-analyzer,ugc,Here is the direct tool URL: https://doitwithai.tools/tools/anchor-text-analyzer
anchor text analyzer,https://guestpostblog1.example.com/seo-tips,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Run a free anchor text analyzer to spot keyword stuffing early.
anchor text analyzer,https://linkdirectory2.example.com/seo-software,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Best free anchor text analyzer for backlink audits.
anchor text analyzer,https://agencyblog3.example.com/off-page-checklist,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Check ratios using an anchor text analyzer before buying guest posts.
backlink anchor ratio checker,https://contentops.example.io/link-building-guide,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Use a backlink anchor ratio checker when reviewing GSC exports.
DoItWithAI anchor text audit tool,https://digitalprnews.example.com/q4-tools,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,We tested the DoItWithAI anchor text audit tool on 400 referring pages.
how to diversify your backlink profile naturally,https://editorialjournal.example.com/penguin-recovery,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Their breakdown on how to diversify your backlink profile naturally is practical.
click here,https://smallbiztips.example.org/links,https://doitwithai.tools/tools/anchor-text-analyzer,nofollow,For the interactive ratio breakdown, click here to inspect your CSV.
[Image: DoItWithAI Badge],https://partnerdirectory.example.com/badges,https://doitwithai.tools/tools/anchor-text-analyzer,nofollow,Featured SEO Partner badge
DoItWithAI Tools,https://indiehackers-note.example.com/launch-list,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow,Built by the team at DoItWithAI Tools for transparent SEO workflows.`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function AnchorTextAnalyzerClient() {
  const [mode, setMode] = useState<"csv" | "live" | "html">("csv");
  const [profile, setProfile] = useState<PageBenchmarkProfile>("commercial");
  const [targetDomain, setTargetDomain] = useState("doitwithai.tools");
  const [brandTermsInput, setBrandTermsInput] = useState(
    "DoItWithAI, DoItWithAI Tools",
  );
  const [keywordsInput, setKeywordsInput] = useState(
    "anchor text analyzer, anchor text checker, backlink anchor ratio",
  );
  const [tableInput, setTableInput] = useState("");
  const [liveUrlsInput, setLiveUrlsInput] = useState("");
  const [liveScope, setLiveScope] = useState<
    "all-links" | "external-only" | "target-domain-only"
  >("all-links");
  const [htmlInput, setHtmlInput] = useState("");
  const [htmlSourceUrl, setHtmlSourceUrl] = useState(
    "https://publisher.example.com/article",
  );

  const [report, setReport] = useState<AnchorAnalysisReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  // Filters for the placement table
  const [categoryFilter, setCategoryFilter] = useState<AnchorCategory | "all">(
    "all",
  );
  const [followFilter, setFollowFilter] = useState<FollowStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const resultRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  const parsedBrands = useMemo(
    () =>
      brandTermsInput
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [brandTermsInput],
  );

  const parsedKeywords = useMemo(
    () =>
      keywordsInput
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [keywordsInput],
  );

  function loadSample() {
    setMode("csv");
    setProfile("commercial");
    setTargetDomain("doitwithai.tools");
    setBrandTermsInput("DoItWithAI, DoItWithAI Tools");
    setKeywordsInput(
      "anchor text analyzer, anchor text checker, backlink anchor ratio",
    );
    setTableInput(SAMPLE_CSV_DATA);
    setError("");
    const parsed = parseSubmittedBacklinkTable(SAMPLE_CSV_DATA, {
      targetDomain: "doitwithai.tools",
      brandTerms: ["DoItWithAI", "DoItWithAI Tools"],
      targetKeywords: [
        "anchor text analyzer",
        "anchor text checker",
        "backlink anchor ratio",
      ],
    });
    const built = buildAnchorAnalysisReport({
      mode: "csv",
      profile: "commercial",
      targetDomain: "doitwithai.tools",
      brandTerms: ["DoItWithAI", "DoItWithAI Tools"],
      targetKeywords: [
        "anchor text analyzer",
        "anchor text checker",
        "backlink anchor ratio",
      ],
      rows: parsed.rows,
      notes: parsed.notes,
    });
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded a 12-link sample backlink dataset and calculated anchor distribution.",
    );
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("CSV file exceeds 5 MB limit. Filter or trim rows before uploading.");
      return;
    }
    const text = await file.text();
    setTableInput(text);
    setError("");
    setFeedback(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB). Click Analyze Anchors to inspect.`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "csv" && !tableInput.trim()) {
      setError(
        "Paste backlink rows or upload a CSV export (or click 'Load Sample Audit' to test).",
      );
      return;
    }
    if (mode === "live" && !liveUrlsInput.trim()) {
      setError("Enter between 1 and 5 public webpage URLs (one per line).");
      return;
    }
    if (mode === "html" && !htmlInput.trim()) {
      setError("Paste webpage HTML containing <a href> links to inspect.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();

      if (mode === "csv") {
        const parsed = parseSubmittedBacklinkTable(tableInput, {
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
        });
        if (!parsed.rows.length) {
          setError(
            "No valid anchor rows were found. Provide at least one anchor text per line or CSV row.",
          );
          return;
        }
        const built = buildAnchorAnalysisReport({
          mode: "csv",
          profile,
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
          rows: parsed.rows,
          notes: parsed.notes,
        });
        setReport(built);
        setRevision((r) => r + 1);
      } else if (mode === "html") {
        const extracted = extractAnchorsFromHtml({
          html: htmlInput,
          sourceUrl: htmlSourceUrl || "https://example.com",
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
          scope: liveScope,
        });
        if (!extracted.rows.length) {
          setError(
            "No matching <a href> links were found in the pasted HTML for the selected link scope.",
          );
          return;
        }
        const built = buildAnchorAnalysisReport({
          mode: "html",
          profile,
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
          rows: extracted.rows,
          notes: [
            "Parsed from supplied HTML. Live HTTP status and robots policy were not checked.",
          ],
        });
        setReport(built);
        setRevision((r) => r + 1);
      } else {
        const urls = Array.from(
          new Set(
            liveUrlsInput
              .split(/\r?\n/)
              .map((u) => u.trim())
              .filter(Boolean),
          ),
        ).slice(0, 5);

        const res = await fetch("/api/ai-tools/anchor-text-analyzer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            urls,
            targetDomain,
            brandTerms: parsedBrands,
            targetKeywords: parsedKeywords,
            scope: liveScope,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            data?.error?.message ||
              "Could not inspect the supplied URLs. Try CSV/table paste or HTML mode.",
          );
          return;
        }
        if (!data.rows?.length) {
          setError(
            data.notes?.join(" ") ||
              "No matching links were found on the fetched pages for your selected filter scope.",
          );
          return;
        }
        const built = buildAnchorAnalysisReport({
          mode: "live",
          profile,
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
          rows: data.rows,
          notes: data.notes || [],
        });
        setReport(built);
        setRevision((r) => r + 1);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Analysis interrupted. Check your inputs and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  function switchBenchmarkProfile(nextProfile: PageBenchmarkProfile) {
    setProfile(nextProfile);
    if (report) {
      setReport(
        buildAnchorAnalysisReport({
          mode: report.mode,
          profile: nextProfile,
          targetDomain,
          brandTerms: parsedBrands,
          targetKeywords: parsedKeywords,
          rows: report.rows,
          notes: report.notes,
        }),
      );
    }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownload(kind: "rows-csv" | "summary-csv" | "docx") {
    if (!report) return;
    if (kind === "rows-csv") {
      triggerDownload(
        new Blob([exportAnchorRowsCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "anchor-text-audit-rows.csv",
      );
      setFeedback("Downloaded full link-by-link anchor audit CSV.");
    } else if (kind === "summary-csv") {
      triggerDownload(
        new Blob([exportAnchorSummaryCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "anchor-text-distribution-summary.csv",
      );
      setFeedback("Downloaded category distribution summary CSV.");
    } else {
      const { buildAnchorAuditDocx } = await import("./docx");
      const bytes = buildAnchorAuditDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "anchor-text-audit-report.docx",
      );
      setFeedback("Downloaded editable Word (.docx) anchor audit report.");
    }
  }

  const filteredRows = useMemo(() => {
    if (!report) return [];
    return report.rows.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) {
        return false;
      }
      if (followFilter !== "all" && r.followStatus !== followFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.anchorText.toLowerCase().includes(q) ||
          r.sourceUrl.toLowerCase().includes(q) ||
          r.targetUrl.toLowerCase().includes(q) ||
          r.contextSnippet.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [report, categoryFilter, followFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Analyzing anchor text distribution"
        description="Classifying anchors across 8 semantic categories, checking over-optimization thresholds, and preparing your diversification plan."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <BarChart3 aria-hidden className="text-[#5271ff]" />
              Configure Your Anchor Text Audit
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Import backlink rows from GSC/Ahrefs/Semrush, scan live webpages,
              or inspect pasted HTML.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className={secondaryBtn}
          >
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Audit (12 Links)
          </button>
        </div>

        {/* Input Mode Switcher */}
        <div
          role="tablist"
          aria-label="Anchor data source mode"
          className="mt-6 grid gap-2 sm:grid-cols-3"
        >
          {[
            {
              id: "csv" as const,
              label: "1. Paste Table / Upload CSV",
              sub: "GSC, Ahrefs, Semrush, Moz, or custom list",
              icon: FileSpreadsheet,
            },
            {
              id: "live" as const,
              label: "2. Scan Live Webpage URLs",
              sub: "Extract anchors from up to 5 public URLs",
              icon: Globe,
            },
            {
              id: "html" as const,
              label: "3. Inspect Pasted HTML",
              sub: "Offline HTML anchor & rel parser",
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

        {/* Target Domain, Brand Terms & Target Keywords */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="anchor-target-domain"
              className="block text-sm font-bold"
            >
              Your Target Domain or URL
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Used to detect Naked URL and Brand root anchors.
            </p>
            <input
              id="anchor-target-domain"
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              placeholder="e.g. doitwithai.tools"
              className={control}
            />
          </div>
          <div>
            <label
              htmlFor="anchor-brand-terms"
              className="block text-sm font-bold"
            >
              Brand Name Variations (comma-separated)
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Identifies Branded vs Brand + Keyword anchors.
            </p>
            <input
              id="anchor-brand-terms"
              type="text"
              value={brandTermsInput}
              onChange={(e) => setBrandTermsInput(e.target.value)}
              placeholder="e.g. DoItWithAI, DoItWithAI Tools"
              className={control}
            />
          </div>
          <div>
            <label
              htmlFor="anchor-target-keywords"
              className="block text-sm font-bold"
            >
              Target SEO Keywords (comma-separated)
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Detects Exact Match and Partial Match commercial anchors.
            </p>
            <input
              id="anchor-target-keywords"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="e.g. anchor text analyzer, backlink checker"
              className={control}
            />
          </div>
        </div>

        {/* Page Type Benchmark Profile Selector */}
        <div className="mt-6">
          <span className="block text-sm font-bold">
            Target Page Type Benchmark Profile
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Natural anchor distributions differ between a root homepage, a
            commercial product/service page, and an editorial blog post or tool.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(
              Object.entries(BENCHMARK_PROFILES) as [
                PageBenchmarkProfile,
                (typeof BENCHMARK_PROFILES)["homepage"],
              ][]
            ).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                aria-pressed={profile === key}
                onClick={() => switchBenchmarkProfile(key)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  profile === key
                    ? "border-[#3452d1] bg-[#3452d1]/5 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                }`}
              >
                <p className="text-sm font-bold">{meta.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {meta.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Mode-Specific Input Area */}
        {mode === "csv" && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="anchor-csv-input"
                className="block text-sm font-bold"
              >
                Backlink Anchor List or CSV/TSV Table{" "}
                <span className="font-normal">(required)</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
                <Upload size={14} />
                Upload .CSV / .TSV File
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Paste one anchor per line, or paste CSV/TSV rows with columns like{" "}
              <code>Anchor Text, Source URL, Target URL, Rel</code>.
            </p>
            <textarea
              id="anchor-csv-input"
              rows={8}
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              placeholder={`Anchor Text,Source URL,Target URL,Rel\nDoItWithAI,https://publisher.com/post,https://doitwithai.tools,dofollow\nanchor text analyzer,https://seo-blog.org/tools,https://doitwithai.tools/tools/anchor-text-analyzer,dofollow`}
              className={`${control} font-mono text-xs`}
            />
          </div>
        )}

        {mode === "live" && (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="anchor-live-urls"
                className="block text-sm font-bold"
              >
                Public Webpage URLs to Scan (up to 5 URLs, one per line)
              </label>
              <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enter your own page URLs to audit internal/outbound anchor
                distribution, or enter publisher URLs that link to your site.
              </p>
              <textarea
                id="anchor-live-urls"
                rows={4}
                value={liveUrlsInput}
                onChange={(e) => setLiveUrlsInput(e.target.value)}
                placeholder={`https://publisher.example.com/seo-tools-roundup\nhttps://anotherblog.example.org/off-page-guide`}
                className={control}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Link Extraction Filter Scope
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { id: "all-links" as const, label: "All Links on Page" },
                  {
                    id: "external-only" as const,
                    label: "External Outbound Links Only",
                  },
                  {
                    id: "target-domain-only" as const,
                    label: "Links Pointing to My Target Domain Only",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLiveScope(opt.id)}
                    className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                      liveScope === opt.id
                        ? "border-[#3452d1] bg-[#3452d1] text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "html" && (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="anchor-html-source"
                className="block text-sm font-bold"
              >
                Reference Source Page URL (for resolving relative links)
              </label>
              <input
                id="anchor-html-source"
                type="url"
                value={htmlSourceUrl}
                onChange={(e) => setHtmlSourceUrl(e.target.value)}
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="anchor-html-input"
                className="block text-sm font-bold"
              >
                Paste Webpage HTML
              </label>
              <textarea
                id="anchor-html-input"
                rows={7}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder='<article><p>Read the <a href="https://doitwithai.tools">DoItWithAI</a> guide on <a href="https://doitwithai.tools/tools/anchor-text-analyzer">anchor text analyzer</a>.</p></article>'
                className={`${control} mt-1 font-mono text-xs`}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
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
            <BarChart3 size={18} />
            Analyze Anchor Text Distribution
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
              Clear Report
            </button>
          )}
        </div>
      </form>

      {/* Results Dashboard */}
      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Anchor text analysis results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* Executive KPI Banner */}
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Audit Complete · {BENCHMARK_PROFILES[report.profile].name}
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Anchor Naturalness & Distribution Scorecard
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Analyzed {report.totalLinks} link placements across{" "}
                  {report.uniqueSources} source(s) with {report.uniqueAnchors}{" "}
                  unique anchor variations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("rows-csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Download Full Audit (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("summary-csv")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Summary (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Audit Report (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Naturalness Index
                </p>
                <p className="mt-2 text-3xl font-black text-[#3452d1] dark:text-[#9aabff]">
                  {report.diversityScore}
                  <span className="text-base font-semibold text-slate-400">
                    /100
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Based on benchmark fit & entropy
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Over-Optimization Risk
                </p>
                <p
                  className={`mt-2 text-2xl font-black capitalize ${
                    report.riskLevel === "high"
                      ? "text-rose-600 dark:text-rose-400"
                      : report.riskLevel === "moderate"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {report.riskLevel} Risk
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Exact-match vs brand ratio
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Total Links Checked
                </p>
                <p className="mt-2 text-3xl font-black">{report.totalLinks}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {report.uniqueAnchors} unique anchor strings
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Dofollow Share
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.totalLinks > 0
                    ? Math.round(
                        (report.dofollowLinks / report.totalLinks) * 100,
                      )
                    : 0}
                  %
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {report.dofollowLinks} dofollow · {report.nofollowLinks}{" "}
                  nofollow
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Exact Match Share
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.categories.find((c) => c.category === "exact-match")
                    ?.percentage ?? 0}
                  %
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Target: ≤
                  {BENCHMARK_PROFILES[report.profile].ranges["exact-match"][1]}%
                </p>
              </div>
            </div>
          </div>

          {/* 8-Category Distribution vs Target Range Chart */}
          <div className={panel}>
            <h3 className="text-xl font-extrabold">
              Anchor Category Breakdown vs.{" "}
              {BENCHMARK_PROFILES[report.profile].name} Benchmark
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Compare your observed anchor percentages against healthy natural
              ranges for your selected page profile.
            </p>

            <div className="mt-6 space-y-5">
              {report.categories.map((cat) => {
                const meta = CATEGORY_META[cat.category];
                const isOver =
                  cat.status === "above-target" &&
                  (cat.category === "exact-match" ||
                    cat.category === "partial-match");
                return (
                  <div
                    key={cat.category}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}
                        >
                          {cat.label}
                        </span>
                        <span className="text-sm font-bold">
                          {cat.count} links ({cat.percentage}%)
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          · {cat.dofollowCount} dofollow
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Recommended: {cat.recommendedMin}%–{cat.recommendedMax}%
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            isOver
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                              : cat.status === "within-target"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                          }`}
                        >
                          {isOver
                            ? "Over-Optimized"
                            : cat.status === "within-target"
                              ? "Healthy Range"
                              : cat.status === "above-target"
                                ? "Above Range"
                                : "Below Range"}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar with Target Window Marker */}
                    <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        aria-hidden="true"
                        style={{
                          left: `${cat.recommendedMin}%`,
                          width: `${Math.max(2, cat.recommendedMax - cat.recommendedMin)}%`,
                        }}
                        className="absolute inset-y-0 border-x border-dashed border-emerald-500/70 bg-emerald-500/15"
                        title={`Recommended window: ${cat.recommendedMin}%–${cat.recommendedMax}%`}
                      />
                      <div
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? "bg-rose-500"
                            : cat.status === "within-target"
                              ? "bg-[#3452d1]"
                              : "bg-amber-500"
                        }`}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      {cat.description}
                    </p>
                    {cat.sampleAnchors.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cat.sampleAnchors.map((sample) => (
                          <span
                            key={sample}
                            className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            &ldquo;{sample}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Over-Optimization Diagnostics & Next-Link Diversification Planner */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={panel}>
              <h3 className="flex items-center gap-2 text-xl font-extrabold">
                <ShieldAlert aria-hidden className="text-[#5271ff]" />
                Over-Optimization & Footprint Diagnostics
              </h3>
              <div className="mt-4 space-y-4">
                {report.findings.map((f) => (
                  <div
                    key={f.id}
                    className={`rounded-xl border p-4 ${
                      f.severity === "high"
                        ? "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30"
                        : f.severity === "medium"
                          ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30"
                          : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {f.severity === "good" ? (
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        />
                      ) : (
                        <AlertTriangle
                          size={18}
                          className={`mt-0.5 shrink-0 ${
                            f.severity === "high"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        />
                      )}
                      <div>
                        <p className="text-sm font-bold">{f.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
                          {f.detail}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">
                          Action: {f.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={panel}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xl font-extrabold">
                  <Sparkles aria-hidden className="text-[#5271ff]" />
                  Safe Anchor Diversification Plan
                </h3>
                <button
                  type="button"
                  onClick={async () => {
                    const text = report.diversificationPlan
                      .map(
                        (d) =>
                          `${d.categoryLabel} (Suggested: ~${d.recommendedNextCount} links):\n- ${d.examples.join("\n- ")}`,
                      )
                      .join("\n\n");
                    await navigator.clipboard.writeText(text);
                    setFeedback("Copied anchor diversification plan to clipboard.");
                  }}
                  className={secondaryBtn}
                >
                  <Copy size={14} />
                  Copy Plan
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Use these natural anchor variations on your upcoming outreach and
                digital PR placements to balance your ratio.
              </p>

              <div className="mt-4 space-y-4">
                {report.diversificationPlan.map((plan) => (
                  <div
                    key={plan.category}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {plan.categoryLabel}
                      </span>
                      <span className="rounded-full bg-[#3452d1]/10 px-2.5 py-0.5 text-xs font-bold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                        Suggested next: ~{plan.recommendedNextCount} link(s)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {plan.rationale}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {plan.examples.map((ex) => (
                        <span
                          key={ex}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Repeated Anchors Table */}
          <div className={panel}>
            <h3 className="text-xl font-extrabold">
              Most Frequently Repeated Anchor Phrases
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Spot identical commercial anchors repeated across multiple
              referring sources.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="py-3 pr-4">Anchor Phrase</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Occurrences</th>
                    <th className="px-3 py-3">Share</th>
                    <th className="px-3 py-3">Dofollow</th>
                    <th className="py-3 pl-3">Footprint Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {report.repeatedAnchors.slice(0, 12).map((item) => (
                    <tr key={`${item.anchor}-${item.category}`}>
                      <td className="py-3 pr-4 font-mono text-xs font-semibold">
                        {item.anchor}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${CATEGORY_META[item.category].badgeClass}`}
                        >
                          {CATEGORY_META[item.category].label}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold">{item.count}</td>
                      <td className="px-3 py-3">{item.percentage}%</td>
                      <td className="px-3 py-3">{item.dofollowCount}</td>
                      <td className="py-3 pl-3 text-xs text-slate-600 dark:text-slate-300">
                        {item.riskNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filterable Individual Link Placements Table */}
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-extrabold">
                  <Filter size={18} className="text-[#5271ff]" />
                  Classified Link Placements ({filteredRows.length} of{" "}
                  {report.rows.length})
                </h3>
              </div>
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
                    placeholder="Filter anchor or URL..."
                    aria-label="Filter anchor rows"
                    className="rounded-xl border border-slate-300 bg-transparent py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600"
                  />
                </div>
                <select
                  aria-label="Filter by anchor category"
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as AnchorCategory | "all")
                  }
                  className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="all">All 8 Categories</option>
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter by follow attribute"
                  value={followFilter}
                  onChange={(e) =>
                    setFollowFilter(e.target.value as FollowStatus | "all")
                  }
                  className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="all">All Follow Types</option>
                  <option value="dofollow">Dofollow</option>
                  <option value="nofollow">Nofollow</option>
                  <option value="sponsored">Sponsored</option>
                  <option value="ugc">UGC</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="py-3 pr-3">Anchor Text</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Follow</th>
                    <th className="px-3 py-3">Zone</th>
                    <th className="px-3 py-3">Source / Target</th>
                    <th className="py-3 pl-3">Surrounding Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRows.slice(0, 150).map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-3 font-mono font-semibold">
                        {row.anchorText}
                        {row.matchedKeyword && (
                          <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                            Matched: {row.matchedKeyword}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-bold ${CATEGORY_META[row.category].badgeClass}`}
                        >
                          {CATEGORY_META[row.category].label}
                        </span>
                      </td>
                      <td className="px-3 py-3 uppercase font-semibold">
                        {row.followStatus}
                      </td>
                      <td className="px-3 py-3 text-slate-500">{row.zone}</td>
                      <td className="max-w-[220px] truncate px-3 py-3">
                        <div className="truncate font-semibold" title={row.sourceUrl}>
                          From: {row.sourceUrl}
                        </div>
                        <div
                          className="truncate text-slate-500"
                          title={row.targetUrl}
                        >
                          To: {row.targetUrl}
                        </div>
                      </td>
                      <td className="max-w-[260px] py-3 pl-3 text-slate-600 dark:text-slate-300">
                        {row.contextSnippet}
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
