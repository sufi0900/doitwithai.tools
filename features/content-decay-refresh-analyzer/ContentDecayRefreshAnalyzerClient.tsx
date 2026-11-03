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
  analyzeContentDecayPeriods,
  refreshBriefText,
  type RefreshBrief,
  buildContentDecayDocx,
  exportContentDecayCsv,
  type ContentDecayReport,
  type DecayDiagnosis,
} from "./model";

const SAMPLE_DECAY_CSV = `Page,Previous Clicks,Current Clicks,Previous Impressions,Current Impressions,Previous Position,Current Position
https://example.com/guides/tool-comparison-2024,940,410,18500,16900,2.3,6.8
https://example.com/guides/semantic-seo,680,390,22400,23100,1.9,2.1
https://example.com/guides/link-building-2025,520,240,12200,11400,3.1,7.9
https://example.com/prompts/seo,490,310,19800,11200,2.8,3.0
https://example.com/tools/schema,610,790,15400,19200,3.4,2.2`;

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
  const [inputMode, setInputMode] = useState<"comparison" | "periods">(
    "comparison",
  );
  const [previousInput, setPreviousInput] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [isSample, setIsSample] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const uploadVersion = useRef(0);
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
    uploadVersion.current++;
    setInputMode("comparison");
    setCsvInput(SAMPLE_DECAY_CSV);
    setIsSample(true);
    setDirty(false);
    setFilter("all");
    setSearchQuery("");
    setSelectedId("");
    setError("");
    const built = analyzeContentDecayCsv(SAMPLE_DECAY_CSV);
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Illustrative five-page sample loaded. These are demonstration numbers, not measured website results.",
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
                  "Describe a specific improvement and the evidence needed before publishing.",
                ],
              }
            : r,
        ),
      };
    });
  }

  async function handleFileUpload(
    e: ChangeEvent<HTMLInputElement>,
    target: "comparison" | "previous" | "current" = "comparison",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const version = ++uploadVersion.current;
    try {
      if (file.size > 2_000_000)
        throw new Error("Choose a CSV smaller than 2 MB.");
      const text = await file.text();
      if (version !== uploadVersion.current) return;
      if (target === "comparison") setCsvInput(text);
      else if (target === "previous") setPreviousInput(text);
      else setCurrentInput(text);
      setDirty(true);
      setError("");
      setFeedback(
        `Loaded ${file.name}. Build the refresh queue to update results.`,
      );
    } catch (err) {
      if (version === uploadVersion.current)
        setError(
          err instanceof Error
            ? err.message
            : "Could not read this file. Paste the CSV instead.",
        );
    } finally {
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (
      inputMode === "comparison"
        ? !csvInput.trim()
        : !previousInput.trim() || !currentInput.trim()
    ) {
      setError(
        "Paste your GSC page comparison CSV rows or click 'Try illustrative sample'.",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      const built =
        inputMode === "comparison"
          ? analyzeContentDecayCsv(csvInput)
          : analyzeContentDecayPeriods(previousInput, currentInput);
      if (!built.rows.length) {
        setError(
          "Could not parse rows. Format as: Page, Previous Clicks, Current Clicks, Previous Impressions, Current Impressions, Previous Position, Current Position.",
        );
        return;
      }
      setReport(built);
      setIsSample(
        inputMode === "comparison" &&
          csvInput.trim() === SAMPLE_DECAY_CSV.trim(),
      );
      setDirty(false);
      setFilter("all");
      setSearchQuery("");
      setSelectedId("");
      setRevision((r) => r + 1);
      setFeedback(
        `Compared ${built.rows.length} matched items. Review the evidence and complete an editorial brief before publishing.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not analyze this data. Check the CSV format.",
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

  const selectedRow =
    report?.rows.find((row) => row.id === selectedId) ?? report?.rows[0];
  function updateBrief(field: keyof RefreshBrief, value: string) {
    if (!selectedRow) return;
    setReport((prev) =>
      prev
        ? {
            ...prev,
            rows: prev.rows.map((row) =>
              row.id === selectedRow.id
                ? { ...row, brief: { ...row.brief, [field]: value } }
                : row,
            ),
          }
        : prev,
    );
  }
  async function copyBrief() {
    if (!selectedRow) return;
    try {
      await navigator.clipboard.writeText(refreshBriefText(selectedRow));
      setFeedback("Copied selected refresh brief.");
    } catch {
      setError("Clipboard unavailable. Download the Word brief instead.");
    }
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
        description="Comparing supplied metrics and preparing evidence-led editing checklists."
      />

      <form
        id="content-refresh-tool"
        aria-busy={busy}
        onSubmit={handleSubmit}
        noValidate
        className={panel}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <TrendingDown aria-hidden className="text-[#5271ff]" />
              Find pages to refresh
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Compare equal-length Search Console periods. Your CSV is processed
              in this browser; no Google login or CMS connection is needed.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Try illustrative sample
          </button>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="CSV input format"
        >
          {(
            [
              ["comparison", "Comparison CSV"],
              ["periods", "Two period exports"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={busy}
              aria-pressed={inputMode === value}
              className={inputMode === value ? primaryBtn : secondaryBtn}
              onClick={() => {
                uploadVersion.current++;
                setInputMode(value);
                setDirty(true);
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Use the same Pages or Queries grouping, search type, country, and
          device filters in both periods.{" "}
          <a href="#prepare-refresh-data" className="font-bold underline">
            See export instructions and column order
          </a>
          .
        </p>
        {inputMode === "periods" && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {(
              [
                [
                  "previous",
                  "Previous period",
                  previousInput,
                  setPreviousInput,
                ],
                ["current", "Current period", currentInput, setCurrentInput],
              ] as const
            ).map(([target, label, value, setter]) => (
              <div key={target}>
                <label
                  className="block text-sm font-bold"
                  htmlFor={`refresh-${target}`}
                >
                  {label} Pages.csv or Queries.csv
                </label>
                <input
                  type="file"
                  aria-label={`Upload ${label} CSV`}
                  accept=".csv,.tsv,.txt"
                  disabled={busy}
                  onChange={(event) => handleFileUpload(event, target)}
                  className="my-2 block w-full text-xs"
                />
                <textarea
                  id={`refresh-${target}`}
                  rows={7}
                  className={`${control} font-mono text-xs`}
                  value={value}
                  onChange={(event) => {
                    uploadVersion.current++;
                    setter(event.target.value);
                    setDirty(true);
                  }}
                  placeholder="Top pages,Clicks,Impressions,CTR,Position"
                />
              </div>
            ))}
          </div>
        )}
        {inputMode === "comparison" && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="decay-csv-input"
                className="block text-sm font-bold"
              >
                GSC Page Comparison CSV Rows (Page, Prev Clicks, Curr Clicks,
                Prev Impr, Curr Impr, Prev Pos, Curr Pos)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
                <Upload size={14} />
                Upload GSC .CSV
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={(event) => handleFileUpload(event)}
                  disabled={busy}
                  className="sr-only"
                />
              </label>
            </div>
            <textarea
              id="decay-csv-input"
              rows={7}
              value={csvInput}
              onChange={(e) => {
                uploadVersion.current++;
                setCsvInput(e.target.value);
                setDirty(true);
              }}
              placeholder={SAMPLE_DECAY_CSV}
              className={`${control} mt-2 font-mono text-xs`}
            />
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
            <TrendingDown size={18} />
            Build content refresh queue
          </button>
          {report && (
            <button
              type="button"
              onClick={() => {
                uploadVersion.current++;
                setReport(null);
                setCsvInput("");
                setPreviousInput("");
                setCurrentInput("");
                setDirty(false);
                setError("");
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

      {dirty && report && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-amber-300 p-4 text-sm"
        >
          Inputs changed. Results and exports below still describe the previous
          analysis.
        </p>
      )}
      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Content decay analysis results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          <div className={panel}>
            {isSample && (
              <p className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                <strong>Illustrative sample:</strong> example.com URLs and
                invented demonstration metrics. Replace them with your exports
                for a real review.
              </p>
            )}
            {report.warnings.map((note) => (
              <p
                key={note}
                className="mb-3 text-sm leading-7 text-slate-600 dark:text-slate-300"
              >
                {note}
              </p>
            ))}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Comparison signals · {report.rows.length} URLs · Editable
                  Playbooks
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Content Refresh Priority Queue
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Customize any URL&apos;s refresh checklist below before
                  exporting your `.CSV` queue or `.DOCX` editorial brief.
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
                  Observed period difference
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Ranking decline signal
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
                  CTR decline signal
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
                  Year tokens to review
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.outdatedYearSlugCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Historical years may be intentional
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All Pages"],
                    ["ranking-decay", "Ranking decline signal"],
                    ["serp-ctr-compression", "CTR decline signal"],
                    ["demand-drop", "Impression decline"],
                    ["growing-or-stable", "No material click decline"],
                    ["insufficient-evidence", "Further comparison needed"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={filter === val}
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

            <p className="mt-4 text-sm" role="status">
              Showing {filteredRows.length} of {report.rows.length} items. CSV
              and Word exports include the full queue.
            </p>
            {filteredRows.length === 0 && (
              <p className="mt-5 rounded-xl border border-slate-300 p-5 text-sm">
                No items match these filters. Choose All Pages or clear your
                search.
              </p>
            )}
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
                      <span className="min-w-0 break-all font-mono text-xs font-bold">
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
                          /{" "}
                          {r.clickDeltaPct === null
                            ? "no previous baseline"
                            : `${r.clickDeltaPct}%`}
                        </span>
                        ) · Pos: {r.prevPosition ?? "unavailable"} →{" "}
                        {r.currPosition ?? "unavailable"}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              refreshBriefText(r),
                            );
                            setFeedback(
                              `Copied refresh brief for ${r.pageOrQuery}.`,
                            );
                          } catch {
                            setError(
                              "Clipboard unavailable. Download the Word brief instead.",
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                      >
                        <Copy size={12} />
                        Copy Brief
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {r.evidenceNotes.join(" ")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(r.id);
                      document.getElementById("refresh-brief")?.focus();
                    }}
                    className={`${secondaryBtn} mt-3`}
                  >
                    Edit this page&apos;s refresh brief
                  </button>
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
          {selectedRow && (
            <div
              id="refresh-brief"
              tabIndex={-1}
              className={`${panel} scroll-mt-8`}
            >
              <h3 className="text-2xl font-black">
                Build an actionable content refresh brief
              </h3>
              <label
                htmlFor="refresh-brief-page"
                className="mt-5 block text-sm font-bold"
              >
                Page or query to brief
              </label>
              <select
                id="refresh-brief-page"
                className={`${control} mt-2`}
                value={selectedRow.id}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {report.rows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.pageOrQuery}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                The checklist uses your supplied metrics. Fill in page-specific
                decisions after reading the article and checking its search
                queries. This tool does not fetch the article, inspect
                competitors, or write verified replacement copy.
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {(
                  [
                    [
                      "targetQuery",
                      "Target query",
                      "The question or task this page should satisfy",
                    ],
                    [
                      "audience",
                      "Reader and search intent",
                      "Who needs this page and what they need to do",
                    ],
                    [
                      "objective",
                      "Refresh objective",
                      "Example: make the setup instructions accurate and complete",
                    ],
                    [
                      "keep",
                      "Keep",
                      "Useful sections, examples, and original findings to preserve",
                    ],
                    [
                      "update",
                      "Update or remove",
                      "Exact section, stale claim, and the supported correction",
                    ],
                    [
                      "add",
                      "Add",
                      "Missing steps, original examples, screenshots, or reader questions",
                    ],
                    [
                      "sources",
                      "Evidence and sources to verify",
                      "Original source URLs, dates, and the claims they support",
                    ],
                    [
                      "internalLinks",
                      "Internal links",
                      "Destination URL and helpful anchor/context",
                    ],
                    [
                      "proposedTitle",
                      "Proposed title",
                      "An accurate, descriptive title for this page",
                    ],
                    [
                      "proposedDescription",
                      "Proposed meta description",
                      "A specific summary of what readers can accomplish",
                    ],
                    [
                      "successCheck",
                      "Publish and measure",
                      "What to record and when to compare matched results",
                    ],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label
                      htmlFor={`brief-${key}`}
                      className="text-sm font-bold"
                    >
                      {label}
                    </label>
                    <textarea
                      id={`brief-${key}`}
                      rows={3}
                      value={selectedRow.brief[key]}
                      placeholder={placeholder}
                      onChange={(event) => updateBrief(key, event.target.value)}
                      className={`${control} mt-2`}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={`${primaryBtn} mt-5`}
                onClick={copyBrief}
              >
                <Copy size={16} />
                Copy selected brief
              </button>
              <p className="mt-3 text-xs text-slate-500">
                Brief edits are included in both exports. Work stays in this tab
                and is cleared on reload.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
