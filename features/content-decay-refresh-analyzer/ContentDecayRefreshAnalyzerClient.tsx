"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  Upload,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  DIAGNOSIS_META,
  analyzeContentDecayCsv,
  buildContentDecayDocx,
  exportContentDecayCsv,
  type ContentDecayReport,
  type DecayDiagnosis,
} from "./model";

const SAMPLE_DECAY_CSV = `Page,Previous Clicks,Current Clicks,Previous Impressions,Current Impressions,Previous Position,Current Position
https://doitwithai.tools/guides/best-ai-seo-tools-2024,940,410,18500,16900,2.3,6.8
https://doitwithai.tools/ai-seo/what-is-semantic-seo,680,390,22400,23100,1.9,2.1
https://doitwithai.tools/guides/link-building-checklist-2025,520,240,12200,11400,3.1,7.9
https://doitwithai.tools/prompts/chatgpt-seo-prompts,490,310,19800,11200,2.8,3.0
https://doitwithai.tools/tools/schema-markup-generator,610,790,15400,19200,3.4,2.2`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

function buildInitialSampleDecayReport(): ContentDecayReport {
  return analyzeContentDecayCsv(SAMPLE_DECAY_CSV);
}

export default function ContentDecayRefreshAnalyzerClient() {
  const [csvInput, setCsvInput] = useState(SAMPLE_DECAY_CSV);
  const [report, setReport] = useState<ContentDecayReport | null>(
    buildInitialSampleDecayReport,
  );
  const [filter, setFilter] = useState<DecayDiagnosis | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  function loadSample() {
    setCsvInput(SAMPLE_DECAY_CSV);
    setError("");
    const built = analyzeContentDecayCsv(SAMPLE_DECAY_CSV);
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded 5-page GSC comparison dataset and separated true ranking decay from SERP CTR compression.",
    );
  }

  function updatePlaybookStep(rowId: string, stepIdx: number, value: string) {
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId
            ? {
                ...r,
                refreshPlaybook: r.refreshPlaybook.map((s, idx) =>
                  idx === stepIdx ? value : s,
                ),
              }
            : r,
        ),
      };
    });
  }

  function addPlaybookStep(rowId: string) {
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId
            ? {
                ...r,
                refreshPlaybook: [
                  ...r.refreshPlaybook,
                  "Add 2–3 contextual internal links from high-authority hub articles.",
                ],
              }
            : r,
        ),
      };
    });
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvInput(text);
    setError("");
    setFeedback(`Loaded ${file.name}. Click Analyze Content Decay to run.`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (!csvInput.trim()) {
      setError(
        "Paste your GSC page comparison CSV rows or click 'Load Sample GSC Decay Audit'.",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      const built = analyzeContentDecayCsv(csvInput);
      if (!built.rows.length) {
        setError(
          "Could not parse rows. Format as: Page, Previous Clicks, Current Clicks, Previous Impressions, Current Impressions, Previous Position, Current Position.",
        );
        return;
      }
      setReport(built);
      setRevision((r) => r + 1);
      setFeedback(
        `Analyzed ${built.rows.length} URLs and prioritized refresh playbooks by recoverable clicks.`,
      );
    } finally {
      setBusy(false);
    }
  }

  const filteredRows = useMemo(() => {
    if (!report) return [];
    return report.rows.filter((r) => {
      if (filter !== "all" && r.diagnosis !== filter) return false;
      if (searchQuery.trim()) {
        return r.pageOrQuery
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
      }
      return true;
    });
  }, [report, filter, searchQuery]);

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
        new Blob([exportContentDecayCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "content-decay-refresh-queue.csv",
      );
      setFeedback("Downloaded content decay priority queue CSV.");
    } else {
      const bytes = buildContentDecayDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "content-refresh-action-plan.docx",
      );
      setFeedback("Downloaded editable Word (.docx) content refresh brief.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Analyzing content decay & refresh priorities"
        description="Comparing period-over-period clicks, impressions, and average positions to separate true ranking decay from SERP CTR compression."
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <TrendingDown aria-hidden className="text-[#5271ff]" />
              Diagnose Content Decay & Build Your Refresh Queue
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Import a Google Search Console period-comparison CSV to separate
              true ranking decay from AI Overview CTR compression and seasonality.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample GSC Decay Audit
          </button>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="decay-csv-input" className="block text-sm font-bold">
              GSC Page Comparison CSV Rows (Page, Prev Clicks, Curr Clicks, Prev
              Impr, Curr Impr, Prev Pos, Curr Pos)
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
              <Upload size={14} />
              Upload GSC .CSV
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
          <textarea
            id="decay-csv-input"
            rows={7}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={SAMPLE_DECAY_CSV}
            className={`${control} mt-2 font-mono text-xs`}
          />
        </div>

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
            <TrendingDown size={18} />
            Analyze Content Decay & Refresh Priority
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
          aria-label="Content decay analysis results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Root-Cause Decay Triage · {report.rows.length} URLs · Editable Playbooks
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Content Refresh Priority Queue
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Customize any URL&apos;s refresh checklist below before exporting your `.CSV` queue or `.DOCX` editorial brief.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Priority Queue (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Refresh Brief (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
                  Total Clicks Lost
                </p>
                <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                  -{report.totalLostClicks}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Recoverable organic clicks
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  True Ranking Decay
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.rankingDecayCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Position + clicks dropped
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  SERP CTR Compression
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.ctrCompressionCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Rank held, clicks fell
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Stale Year Tokens
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.outdatedYearSlugCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Contains 2021–2025 token
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All Pages"],
                    ["ranking-decay", "True Ranking Decay"],
                    ["serp-ctr-compression", "SERP CTR Compression"],
                    ["demand-drop", "Demand Drop"],
                    ["growing-or-stable", "Growing / Stable"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFilter(val)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      filter === val
                        ? "border-[#3452d1] bg-[#3452d1] text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter URL or query..."
                  aria-label="Filter URL or query"
                  className="rounded-xl border border-slate-300 bg-transparent py-1.5 pl-8 pr-3 text-xs dark:border-slate-600"
                />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {filteredRows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#3452d1] px-2 py-0.5 text-xs font-bold text-white">
                        Priority {r.priorityScore}/100
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${DIAGNOSIS_META[r.diagnosis].badgeClass}`}
                      >
                        {r.diagnosisLabel}
                      </span>
                      <span className="font-mono text-xs font-bold">
                        {r.pageOrQuery}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <span>
                        Clicks: {r.prevClicks} → {r.currClicks} (
                        <span
                          className={
                            r.clickDelta < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {r.clickDelta > 0 ? `+${r.clickDelta}` : r.clickDelta}{" "}
                          / {r.clickDeltaPct}%
                        </span>
                        ) · Pos: #{r.prevPosition} → #{r.currPosition}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const text = [
                            `URL: ${r.pageOrQuery}`,
                            `Diagnosis: ${r.diagnosisLabel} (Priority ${r.priorityScore}/100)`,
                            `Clicks: ${r.prevClicks} -> ${r.currClicks} (${r.clickDeltaPct}%) | Position: #${r.prevPosition} -> #${r.currPosition}`,
                            "Refresh Playbook:",
                            ...r.refreshPlaybook.map((s, i) => `${i + 1}. ${s}`),
                          ].join("\n");
                          await navigator.clipboard.writeText(text);
                          setFeedback(`Copied refresh brief for ${r.pageOrQuery}.`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                      >
                        <Copy size={12} />
                        Copy Brief
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {r.refreshPlaybook.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3452d1] dark:text-[#9aabff]">
                          {stepIdx + 1}.
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) =>
                            updatePlaybookStep(r.id, stepIdx, e.target.value)
                          }
                          aria-label={`Refresh step ${stepIdx + 1} for ${r.pageOrQuery}`}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-700 focus:border-[#4058D0] focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addPlaybookStep(r.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      <Plus size={12} />
                      Add Playbook Step
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
