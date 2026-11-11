"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  HelpCircle,
  Layers,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import { importAudienceWebsite } from "@/features/audience-research/website";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import {
  enrichKeywordRow,
  exampleReport,
  inputSchema,
  intents,
  keywordKey,
  validateOutput,
  type EnrichedKeywordRow,
} from "./schema";
import { importMetrics, exportCsv, type Metric } from "./metrics";

type Row = EnrichedKeywordRow & { origin: string };

const control =
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] disabled:opacity-50 dark:border-slate-600";

export default function KeywordResearchClient() {
  const initialReport = useMemo(() => exampleReport(), []);

  const [seeds, setSeeds] = useState(
    "ai seo content repurposing\nkeyword clustering tool\non page seo audit",
  );
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("English");

  const [rows, setRows] = useState<Row[]>(() =>
    initialReport.keywords.map((r) => ({
      ...r,
      origin: r.sourceSignal || "Google Autocomplete Live",
    })),
  );
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [summary, setSummary] = useState(initialReport.summary);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState("all");
  const [group, setGroup] = useState("all");
  const [maxKd, setMaxKd] = useState<number>(100);
  const [sortBy, setSortBy] = useState<"volume-desc" | "kd-asc" | "cpc-desc">(
    "volume-desc",
  );
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [tab, setTab] = useState<
    "Explorer" | "EasyWins" | "Questions" | "Groups" | "Chart"
  >("Explorer");
  const [context, setContext] = useState("");
  const [coverage, setCoverage] = useState("");
  const [reportMarket, setReportMarket] = useState("United States · English");
  const [fileNote, setFileNote] = useState("");

  const active = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const failure = useRef<HTMLParagraphElement>(null);
  const seedField = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (busy && !dialog.current?.open) dialog.current?.showModal();
    else if (!busy) dialog.current?.close();
  }, [busy]);

  useEffect(() => () => active.current?.abort(), []);

  // Support ?seed= or ?url= query parameters when navigating from On-Page SEO Analyzer or other tools
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramSeed = params.get("seed") || params.get("keyword");
    const paramUrl = params.get("url");
    if (paramSeed && paramSeed.trim()) {
      setSeeds(paramSeed.trim());
      setTimeout(() => {
        void generate(false, paramSeed.trim(), paramUrl || "");
      }, 150);
    } else if (paramUrl && paramUrl.trim()) {
      setUrl(paramUrl.trim());
      setTimeout(() => {
        void generate(false, "", paramUrl.trim());
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      failure.current?.focus({ preventScroll: true });
      failure.current?.scrollIntoView({ block: "center" });
    }
  }, [error]);

  function reveal() {
    requestAnimationFrame(() => {
      results.current?.focus({ preventScroll: true });
      results.current?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }

  async function generate(
    more = false,
    overrideSeeds?: string,
    overrideUrl?: string,
    overrideContext?: string,
  ) {
    if (active.current) return;
    const activeSeedsText = overrideSeeds ?? seeds;
    const activeUrlText = overrideUrl ?? url;
    const activeContextText = overrideContext ?? context;

    if (
      more &&
      reportMarket !== `${country} · ${language}` &&
      reportMarket !== "Illustrative example"
    ) {
      setError("Start a new search before expanding a different market.");
      return;
    }
    setError("");
    if (!activeSeedsText.trim() && !activeUrlText.trim() && !activeContextText.trim()) {
      setError("Add a seed keyword or a public website URL.");
      seedField.current?.focus();
      return;
    }
    const parsed = inputSchema.safeParse({
      seeds: activeSeedsText
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
      context:
        activeContextText ||
        (activeUrlText.trim() ? "Website context will be imported." : ""),
      country,
      language,
      exclude: more ? rows.map((r) => r.keyword).slice(0, 120) : [],
      count: 60,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const abort = new AbortController();
    active.current = abort;
    setBusy(true);
    const deadline = setTimeout(() => abort.abort(), 115000);
    try {
      let website = activeContextText;
      if (activeUrlText.trim() && !website) {
        const imported = await importAudienceWebsite(
          activeUrlText,
          abort.signal,
          setStatus,
        );
        website = imported.text;
        setContext(website);
        setCoverage(imported.note);
      }
      setStatus(
        "Harvesting live Google Autocomplete, YouTube Suggest & Datamuse corpus frequency signals, then calibrating Search Volume, KD & CPC...",
      );
      const data = inputSchema.parse({ ...parsed.data, context: website });
      const response = await fetch("/api/ai-tools/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: abort.signal,
      });
      const body = await readToolResponse<{ result: unknown }>(response);
      const report = validateOutput(body.result, data);
      setRows((previous) =>
        more
          ? [
              ...previous,
              ...report.keywords.map((r) => ({
                ...r,
                origin: r.sourceSignal || "Google Autocomplete + AI",
              })),
            ].slice(0, 120)
          : report.keywords.map((r) => ({
              ...r,
              origin: r.sourceSignal || "Google Autocomplete + AI",
            })),
      );
      if (!more) {
        setMetrics([]);
        setFileNote("");
        setSaved([]);
        setQuery("");
        setGroup("all");
        setIntent("all");
        setMaxKd(100);
        setOnlySaved(false);
      }
      setReportMarket(`${country} · ${language}`);
      setSummary(report.summary);
      setStatus(
        `Discovered ${report.keywords.length} keyword opportunities with Estimated Search Volume, Keyword Difficulty (KD), CPC Range & SERP Feature signals!`,
      );
      setTab("Explorer");
      reveal();
    } catch (e) {
      setError(
        abort.signal.aborted
          ? "Waiting stopped. Your inputs and earlier results remain available."
          : e instanceof Error
            ? e.message
            : "The request failed. Try again.",
      );
    } finally {
      clearTimeout(deadline);
      active.current = null;
      setBusy(false);
    }
  }

  function example() {
    const report = exampleReport();
    setRows(
      report.keywords.map((r) => ({
        ...r,
        origin: r.sourceSignal || "Google Autocomplete Live",
      })),
    );
    setSummary(report.summary);
    setReportMarket("United States · English");
    setSaved([]);
    setMetrics([]);
    setFileNote("");
    setQuery("");
    setIntent("all");
    setGroup("all");
    setMaxKd(100);
    setOnlySaved(false);
    setError("");
    setTab("Explorer");
    reveal();
  }

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 100000)
        throw Error("Use a CSV or TSV file below 100 KB.");
      const bytes = await file.arrayBuffer();
      const view = new Uint8Array(bytes);
      const text =
        view[0] === 255 && view[1] === 254
          ? new TextDecoder("utf-16le").decode(bytes)
          : new TextDecoder().decode(bytes);
      const imported = importMetrics(text);
      setMetrics(imported.metrics);
      setFileNote(
        `${file.name}: ${imported.metrics.length} keywords loaded. ${imported.duplicates} duplicates ignored. ${imported.hasVolume ? "Uploaded volume cells merged over estimates." : "Using estimated search volumes."}`,
      );
      setRows((previous) => {
        const retained = previous.filter((r) => r.origin !== "Uploaded CSV");
        const keys = new Set(retained.map((r) => keywordKey(r.keyword)));
        const added: Row[] = imported.metrics
          .filter((m) => !keys.has(keywordKey(m.keyword)))
          .map((m) => {
            const enriched = enrichKeywordRow(
              {
                keyword: m.keyword,
                question: /[?¿]/.test(m.keyword),
                intent: "mixed",
                group: "Uploaded CSV Keywords",
                format: "guide",
                task: "Review this uploaded keyword and assign a target page.",
              },
              country,
            );
            return {
              ...enriched,
              estimatedVolume: m.volume || enriched.estimatedVolume,
              competition:
                m.competition === "Low" ||
                m.competition === "Medium" ||
                m.competition === "High"
                  ? m.competition
                  : enriched.competition,
              cpcLow: m.bidLow || enriched.cpcLow,
              cpcHigh: m.bidHigh || enriched.cpcHigh,
              sourceSignal: "Uploaded CSV",
              origin: "Uploaded CSV",
            };
          });
        return [...retained, ...added];
      });
      setStatus("CSV metrics merged into your keyword intelligence table!");
      reveal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot read this file.");
    }
  }

  const map = new Map(metrics.map((m) => [keywordKey(m.keyword), m]));

  const visible = useMemo(() => {
    const filtered = rows.filter(
      (r) =>
        (!query ||
          r.keyword.toLowerCase().includes(query.toLowerCase()) ||
          r.group.toLowerCase().includes(query.toLowerCase())) &&
        (intent === "all" || r.intent === intent) &&
        (group === "all" || r.group === group) &&
        r.keywordDifficulty <= maxKd &&
        (!onlySaved || saved.includes(keywordKey(r.keyword))) &&
        (tab !== "EasyWins" || r.keywordDifficulty <= 35) &&
        (tab !== "Questions" ||
          r.question ||
          /^(how|what|why|when|where|who|which|can|does|do|is|are|should)\b/i.test(
            r.keyword,
          ) ||
          r.keyword.includes("?")),
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "kd-asc") return a.keywordDifficulty - b.keywordDifficulty;
      if (sortBy === "cpc-desc") {
        const ca = parseFloat(a.cpcHigh.replace(/[^0-9.]/g, "")) || 0;
        const cb = parseFloat(b.cpcHigh.replace(/[^0-9.]/g, "")) || 0;
        return cb - ca;
      }
      return b.volumeNumber - a.volumeNumber;
    });
  }, [rows, query, intent, group, maxKd, onlySaved, saved, tab, sortBy]);

  const groups = [...new Set(rows.map((r) => r.group))];

  // Aggregate KPI stats
  const kpiStats = useMemo(() => {
    const totalVolume = rows.reduce((sum, r) => sum + (r.volumeNumber || 0), 0);
    const easyWinsCount = rows.filter((r) => r.keywordDifficulty <= 35).length;
    const avgKd = rows.length
      ? Math.round(
          rows.reduce((sum, r) => sum + r.keywordDifficulty, 0) / rows.length,
        )
      : 0;
    const questionCount = rows.filter((r) => r.question).length;
    const highIntentCount = rows.filter(
      (r) => r.intent === "commercial" || r.intent === "transactional",
    ).length;
    return {
      totalVolume,
      easyWinsCount,
      avgKd,
      questionCount,
      highIntentCount,
    };
  }, [rows]);

  function download() {
    const href = URL.createObjectURL(
      new Blob(["\uFEFF" + exportCsv(visible, metrics, reportMarket)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = "keyword-research-intelligence.csv";
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-6">
      <ToolRunOverlay
        active={busy}
        title="Researching keywords, search intent & SERP opportunities"
        description="Grouping seed topics, intent signals, difficulty estimates, and content angles."
      />
      {/* 1-Click Competitor / Article URL Keyword Extractor */}
      <UrlArticleExtractorBar
        label="Option 1: Paste Any Competitor Article or Webpage URL to Extract Seed Topics & Discover 60 Keywords in 1 Click"
        placeholder="Paste any blog post, landing page, or YouTube URL to extract topics & search volumes..."
        onExtracted={(data) => {
          const extractedSeeds = [
            data.focusKeyword,
            ...(data.subTopics || []).slice(0, 4).map((s) => s.title.slice(0, 55)),
          ]
            .filter(Boolean)
            .slice(0, 5)
            .join("\n");
          setSeeds(extractedSeeds || data.title.slice(0, 70));
          setUrl(data.url || "");
          setContext(data.cleanText.slice(0, 4000));
          void generate(
            false,
            extractedSeeds || data.title.slice(0, 70),
            data.url || "",
            data.cleanText.slice(0, 4000),
          );
        }}
        onSelectSubTopic={(sub, data) => {
          setSeeds(sub.title.slice(0, 75));
          setContext(sub.content.slice(0, 3500));
          void generate(
            false,
            sub.title.slice(0, 75),
            data.url || "",
            sub.content.slice(0, 3500),
          );
        }}
      />

      <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-7">
        <dialog
          ref={dialog}
          aria-labelledby="keyword-loading-title"
          onCancel={(e) => {
            e.preventDefault();
            active.current?.abort();
          }}
          className="m-auto w-[min(90vw,460px)] rounded-2xl bg-white p-7 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm dark:bg-slate-900 dark:text-white"
        >
          <Loader2
            aria-hidden
            className="animate-spin motion-reduce:animate-none mx-auto text-[#5271FF]"
            size={36}
          />
          <h2
            id="keyword-loading-title"
            className="mt-4 text-center text-xl font-bold"
          >
            Harvesting Live Search Demand &amp; Volumes...
          </h2>
          <p role="status" className="mt-3 text-center text-sm leading-7">
            {status}
          </p>
          <button
            className={button + " mt-5 w-full"}
            onClick={() => active.current?.abort()}
          >
            Cancel and keep inputs
          </button>
        </dialog>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              brand="keyword-cluster"
              slug="keyword-research-tool"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5271FF]">
                <Sparkles size={14} />
                Live Google Autocomplete + Corpus Volume + KD &amp; CPC Engine
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                AI Keyword Research, Search Volume &amp; Low-KD Opportunity Finder
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void generate(false)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058D0] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#3247b5]"
            >
              <Search size={15} />
              Research 60 Keywords + Volumes
            </button>
            <button type="button" className={button} onClick={example}>
              Load Sample Report
            </button>
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => {
                setSeeds("");
                setUrl("");
                setContext("");
                setCoverage("");
                setError("");
                setStatus("Cleared seed inputs. Sample intelligence table remains below.");
              }}
            >
              <RotateCcw size={14} />
              Clear Seeds
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate(false);
          }}
          noValidate
        >
          <fieldset
            disabled={busy}
            className="grid min-w-0 gap-4 lg:grid-cols-4"
          >
            <label className="text-xs sm:text-sm font-bold lg:col-span-2">
              Seed Keywords (One per line, up to 10)
              <textarea
                ref={seedField}
                className={control + " mt-1.5 font-medium"}
                rows={3}
                maxLength={1210}
                value={seeds}
                onChange={(e) => setSeeds(e.target.value)}
                placeholder="e.g. ai seo content repurposing&#10;linkedin carousel generator&#10;on page seo checklist"
              />
            </label>
            <div className="space-y-3 lg:col-span-2">
              <div>
                <label
                  htmlFor="keyword-url"
                  className="text-xs sm:text-sm font-bold"
                >
                  Optional Website URL for Deep Context
                </label>
                <ToolUrlInput
                  id="keyword-url"
                  className={control + " mt-1.5"}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setContext("");
                    setCoverage("");
                  }}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold">
                  Target Country Market
                  <input
                    required
                    className={control + " mt-1 py-2"}
                    value={country}
                    maxLength={80}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </label>
                <label className="text-xs font-bold">
                  Keyword Language
                  <input
                    required
                    className={control + " mt-1 py-2"}
                    value={language}
                    maxLength={60}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </fieldset>
        </form>

        <details
          open
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <summary className="cursor-pointer text-xs sm:text-sm font-bold">
            Optional: Import Google Keyword Planner / Ahrefs / Semrush CSV to Overlay Custom Volumes
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 items-center">
            <input
              type="file"
              disabled={busy}
              accept=".csv,.tsv,.txt"
              className={control}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports CSV/TSV files up to 500 rows (`Keyword`, `Avg. monthly searches`, `Competition`, `Top of page bid`).
              {fileNote ? ` ${fileNote}` : ""}
            </p>
          </div>
        </details>

        {error && (
          <p
            ref={failure}
            tabIndex={-1}
            role="alert"
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-900 dark:bg-red-950 dark:text-red-100"
          >
            {error}
          </p>
        )}

        {status && !busy && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200"
          >
            <CheckCircle2 size={15} />
            <span>{status}</span>
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        <div
          ref={results}
          tabIndex={-1}
          aria-label="Keyword research results"
          className="mt-6 min-w-0 scroll-mt-32 space-y-5"
          role="region"
        >
          {/* 4 EXECUTIVE KPI CARDS */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#5271FF]">
                <TrendingUp size={13} /> Combined Search Demand
              </span>
              <strong className="mt-1 block text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {kpiStats.totalVolume.toLocaleString("en-US")}
                <span className="text-xs font-bold text-slate-500">/mo</span>
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500">
                Across {rows.length} keywords ({reportMarket})
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setTab("EasyWins");
                setMaxKd(35);
              }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left transition hover:border-emerald-500"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Flame size={13} /> Low-Hanging Fruit (KD ≤ 35)
              </span>
              <strong className="mt-1 block text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {kpiStats.easyWinsCount} Easy Wins
              </strong>
              <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Click to filter fast-ranking keywords →
              </span>
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                <Target size={13} /> Avg. Keyword Difficulty
              </span>
              <strong className="mt-1 block text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {kpiStats.avgKd}
                <span className="text-xs font-bold text-slate-500"> / 100</span>
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500">
                {kpiStats.highIntentCount} commercial / buyer-intent terms
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setTab("Questions");
                setMaxKd(100);
              }}
              className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-left transition hover:border-indigo-500"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <HelpCircle size={13} /> People Also Ask &amp; AEO
              </span>
              <strong className="mt-1 block text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-200">
                {kpiStats.questionCount} Questions
              </strong>
              <span className="mt-0.5 block text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                Ready for Featured Snippets &amp; FAQ →
              </span>
            </button>
          </div>

          {/* HEADER ACTIONS & EDITABLE EXECUTIVE SUMMARY */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="min-w-0 flex-1 max-w-2xl">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Executive Market Summary ({reportMarket})
              </h3>
              <textarea
                aria-label="Editable Executive Market Summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-1 w-full rounded-lg border border-transparent bg-transparent p-1 text-xs sm:text-sm leading-relaxed text-slate-600 focus:border-[#5271FF] focus:bg-white focus:outline-none dark:text-slate-300 dark:focus:bg-slate-900"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={button}
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    visible
                      .map(
                        (r) =>
                          `${r.keyword} (${r.estimatedVolume} | KD ${r.keywordDifficulty} | CPC ${r.cpcLow}-${r.cpcHigh})`,
                      )
                      .join("\n"),
                  );
                  setStatus("Copied visible keywords with volumes & KD!");
                }}
              >
                <Copy size={14} />
                Copy Keywords + Metrics
              </button>
              <button type="button" className={button} onClick={download}>
                <Download size={15} />
                Export CSV ({visible.length})
              </button>
              <button
                type="button"
                className={button + " bg-[#4058d0] text-white border-[#4058d0]"}
                disabled={busy || rows.length >= 120}
                onClick={() => void generate(true)}
              >
                <Sparkles size={14} />
                Expand +60 More Keywords
              </button>
            </div>
          </div>

          {/* 5 VIEW TABS */}
          <div
            className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800"
            role="group"
            aria-label="Research view"
          >
            {(
              [
                { id: "Explorer", label: `All Keywords (${rows.length})`, icon: Search },
                {
                  id: "EasyWins",
                  label: `Low-KD Easy Wins (${kpiStats.easyWinsCount})`,
                  icon: Flame,
                },
                {
                  id: "Questions",
                  label: `Questions & PAA (${kpiStats.questionCount})`,
                  icon: HelpCircle,
                },
                {
                  id: "Groups",
                  label: `Topic Clusters (${groups.length})`,
                  icon: Layers,
                },
                {
                  id: "Chart",
                  label: "Volume vs. KD Opportunity Chart",
                  icon: BarChart3,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={tab === item.id}
                  onClick={() => {
                    setTab(item.id);
                    if (item.id === "EasyWins") setMaxKd(35);
                    else if (maxKd === 35 && tab === "EasyWins") setMaxKd(100);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    tab === item.id
                      ? "bg-[#4058D0] text-white shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* FILTERS & SORT BAR */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-bold">
              Search Keyword or Cluster
              <input
                className={control + " mt-1 py-2"}
                type="search"
                placeholder="Filter by word..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="text-xs font-bold">
              Search Intent
              <select
                className={control + " mt-1 py-2"}
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              >
                <option value="all">All Intents</option>
                {intents.map((i) => (
                  <option key={i} value={i}>
                    {i.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold">
              Topic Cluster Group
              <select
                className={control + " mt-1 py-2"}
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="all">All Topic Clusters</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold">
              Max Difficulty (KD ≤ {maxKd})
              <select
                className={control + " mt-1 py-2"}
                value={maxKd}
                onChange={(e) => setMaxKd(Number(e.target.value))}
              >
                <option value={100}>All Difficulties (KD ≤ 100)</option>
                <option value={30}>Very Easy Only (KD ≤ 30)</option>
                <option value={35}>Low-Hanging Fruit (KD ≤ 35)</option>
                <option value={50}>Medium or Easier (KD ≤ 50)</option>
                <option value={70}>Exclude Ultra-Hard (KD ≤ 70)</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              Sort By Metric
              <select
                className={control + " mt-1 py-2"}
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "volume-desc" | "kd-asc" | "cpc-desc",
                  )
                }
              >
                <option value="volume-desc">Highest Search Volume ↓</option>
                <option value="kd-asc">Lowest Difficulty (Easy Wins) ↑</option>
                <option value="cpc-desc">Highest CPC Value ($) ↓</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong>{visible.length}</strong> of{" "}
              <strong>{rows.length}</strong> keywords · Volumes &amp; KD are
              calibrated from live Google Autocomplete rank, Datamuse corpus
              frequency, and SERP intent models.
            </span>
            <button
              type="button"
              onClick={() => setOnlySaved(!onlySaved)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-bold ${
                onlySaved
                  ? "border-[#5271FF] bg-[#5271FF]/15 text-[#5271FF]"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <Bookmark size={13} />
              Saved Shortlist ({saved.length})
            </button>
          </div>

          {/* TAB CONTENT: GROUPS / TOPIC CLUSTERS */}
          {tab === "Groups" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...new Set(visible.map((r) => r.group))].map((g) => {
                const clusterRows = visible.filter((r) => r.group === g);
                const clusterVol = clusterRows.reduce(
                  (s, r) => s + r.volumeNumber,
                  0,
                );
                const clusterKd = Math.round(
                  clusterRows.reduce((s, r) => s + r.keywordDifficulty, 0) /
                    Math.max(1, clusterRows.length),
                );
                const primaryKw =
                  [...clusterRows].sort(
                    (a, b) => b.volumeNumber - a.volumeNumber,
                  )[0]?.keyword || g;

                return (
                  <section
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/40"
                    key={g}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {g}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-[#5271FF]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#5271FF]">
                            {clusterVol.toLocaleString("en-US")}/mo
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                              clusterKd <= 35
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            Avg KD {clusterKd}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Primary Pillar Target:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {primaryKw}
                        </strong>
                      </p>

                      <ul className="mt-3 space-y-2 text-xs">
                        {clusterRows.map((r) => (
                          <li
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                            key={keywordKey(r.keyword)}
                          >
                            <span className="font-bold text-slate-900 dark:text-white">
                              {r.keyword}
                            </span>
                            <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                {r.estimatedVolume}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 font-extrabold ${
                                  r.keywordDifficulty <= 35
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                }`}
                              >
                                KD {r.keywordDifficulty}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                      <Link
                        href={`/tools/seo-content-brief-generator`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#4058D0] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Build Pillar Content Brief <ArrowUpRight size={12} />
                      </Link>
                      <Link
                        href={`/tools/blog-to-infographic-generator`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        Design Cluster Infographic <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : tab === "Chart" ? (
            /* TAB CONTENT: VISUAL OPPORTUNITY MATRIX */
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Top 15 Keyword Opportunities (Search Volume vs. Ranking Difficulty)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Green bars highlight Low-Hanging Fruit (KD ≤ 35) with strong monthly search demand.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {visible.slice(0, 15).map((r) => {
                  const maxVol = Math.max(
                    1000,
                    ...visible.slice(0, 15).map((x) => x.volumeNumber),
                  );
                  const widthPct = Math.max(
                    8,
                    Math.min(100, Math.round((r.volumeNumber / maxVol) * 100)),
                  );
                  const isEasy = r.keywordDifficulty <= 35;
                  return (
                    <div
                      key={keywordKey(r.keyword)}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="font-extrabold text-slate-900 dark:text-white">
                            {r.keyword}
                          </strong>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {r.intent}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="font-black text-[#4058D0] dark:text-[#9aabff]">
                            {r.estimatedVolume}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isEasy
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : r.keywordDifficulty <= 60
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            KD {r.keywordDifficulty} ({r.difficultyLabel})
                          </span>
                          <span className="text-slate-500">
                            CPC {r.cpcLow}–{r.cpcHigh}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            isEasy
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : "bg-gradient-to-r from-[#4058D0] to-[#4058d0]"
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB CONTENT: MAIN KEYWORD EXPLORER TABLE */
            <div
              className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700"
              tabIndex={0}
              role="region"
              aria-label="Keyword intelligence table, scroll horizontally"
            >
              <table className="w-full min-w-[960px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="p-3" scope="col">
                      Save
                    </th>
                    <th className="p-3" scope="col">
                      Keyword, Source Signal &amp; Content Task
                    </th>
                    <th className="p-3" scope="col">
                      Est. Monthly Volume
                    </th>
                    <th className="p-3" scope="col">
                      KD Score (0–100)
                    </th>
                    <th className="p-3" scope="col">
                      Intent &amp; Trend
                    </th>
                    <th className="p-3" scope="col">
                      CPC Bid &amp; Ads Comp
                    </th>
                    <th className="p-3" scope="col">
                      SERP Features &amp; Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const key = keywordKey(r.keyword);
                    const m = map.get(key);
                    const displayVol = m?.volume || r.estimatedVolume;
                    const displayComp = m?.competition || r.competition;
                    const displayLow = m?.bidLow || r.cpcLow;
                    const displayHigh = m?.bidHigh || r.cpcHigh;

                    return (
                      <tr
                        key={key}
                        className="border-t border-slate-200 align-top transition hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 hover:border-[#5271FF] dark:border-slate-600"
                            aria-label={`${saved.includes(key) ? "Remove" : "Save"} ${r.keyword}`}
                            aria-pressed={saved.includes(key)}
                            onClick={() =>
                              setSaved((p) =>
                                p.includes(key)
                                  ? p.filter((k) => k !== key)
                                  : [...p, key],
                              )
                            }
                          >
                            <Bookmark
                              size={14}
                              className={
                                saved.includes(key)
                                  ? "fill-[#5271FF] text-[#5271FF]"
                                  : ""
                              }
                            />
                          </button>
                        </td>

                        <th scope="row" className="max-w-md p-3 font-normal">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <strong className="break-words text-sm font-extrabold text-slate-900 dark:text-white">
                              {r.keyword}
                            </strong>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {r.sourceSignal || r.origin}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {r.task}
                          </span>
                          <span className="mt-1 inline-block rounded bg-[#5271FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#4058D0] dark:text-[#9aabff]">
                            Cluster: {r.group} · Format: {r.format}
                          </span>
                        </th>

                        <td className="p-3 font-mono">
                          <strong className="block text-sm font-black text-slate-900 dark:text-white">
                            {displayVol}
                          </strong>
                          <span className="text-[10px] font-sans text-slate-500">
                            {m?.volume ? "Uploaded CSV" : "Est. Search Demand"}
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-extrabold ${
                              r.keywordDifficulty <= 30
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : r.keywordDifficulty <= 55
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            KD {r.keywordDifficulty} · {r.difficultyLabel}
                          </span>
                        </td>

                        <td className="p-3 space-y-1">
                          <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold uppercase text-blue-900 dark:bg-blue-900/40 dark:text-blue-100">
                            {r.intent}
                          </span>
                          <span className="block text-[11px] font-semibold text-slate-500">
                            {r.trend === "Rising"
                              ? "📈 Rising Trend"
                              : r.trend === "Seasonal"
                                ? "🗓️ Seasonal"
                                : "🌲 Evergreen"}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-xs">
                          <strong className="block font-bold text-slate-900 dark:text-white">
                            {displayLow} – {displayHigh}
                          </strong>
                          <span className="font-sans text-[11px] text-slate-500">
                            Ads Comp: {displayComp}
                          </span>
                        </td>

                        <td className="p-3 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {(r.serpFeatures || []).map((sf) => (
                              <span
                                key={sf}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {sf}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Link
                              href={`/tools/on-page-ai-seo-analyzer?keyword=${encodeURIComponent(r.keyword)}${url ? `&url=${encodeURIComponent(url)}` : ""}`}
                              className="inline-flex items-center gap-0.5 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white hover:bg-[#4058D0] dark:bg-slate-700"
                            >
                              Audit On-Page <ArrowUpRight size={10} />
                            </Link>
                            <Link
                              href={`/tools/seo-content-brief-generator`}
                              className="inline-flex items-center gap-0.5 rounded border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-700 hover:border-[#5271FF] dark:border-slate-600 dark:text-slate-200"
                            >
                              Brief <ArrowUpRight size={10} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!visible.length && (
            <p className="rounded-xl bg-slate-100 p-5 text-sm dark:bg-slate-800">
              No keywords match the current filter. Try raising the Max KD
              filter or clearing the search box.
            </p>
          )}

          {/* CONNECTED WORKFLOW BAR */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Connected Next-Step SEO &amp; Visual Studios:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                ["on-page-ai-seo-analyzer", "Audit Page for Target Keyword"],
                ["keyword-clustering-tool", "Cluster Keywords by SERP Intent"],
                ["seo-content-brief-generator", "Generate SEO Content Brief"],
                ["blog-to-infographic-generator", "Turn Topic into Visual Infographic"],
              ].map(([slug, label]) => (
                <Link
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  key={slug}
                  href={`/tools/${slug}`}
                >
                  {label} <ArrowUpRight size={13} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
