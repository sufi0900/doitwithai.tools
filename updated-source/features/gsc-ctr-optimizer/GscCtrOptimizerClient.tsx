"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  CTR_CURVES,
  analyzeGscCtrCsv,
  buildGscCtrDocx,
  exportGscCtrCsv,
  type CtrCurveProfile,
  type GscCtrReport,
} from "./model";

const SAMPLE_GSC_CTR_CSV = `Query,Clicks,Impressions,CTR,Position
anchor text analyzer,190,14200,1.34%,2.1
google disavow file generator,280,11800,2.37%,1.8
guest post quality checker,140,6900,2.03%,3.2
haro pitch generator,95,4800,1.98%,4.1
schema markup generator,820,4600,17.83%,2.0`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function GscCtrOptimizerClient() {
  const [curve, setCurve] = useState<CtrCurveProfile>("standard");
  const [brandName, setBrandName] = useState("DoItWithAI");
  const [csvInput, setCsvInput] = useState("");
  const [report, setReport] = useState<GscCtrReport | null>(null);
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
    setCsvInput(SAMPLE_GSC_CTR_CSV);
    setError("");
    const built = analyzeGscCtrCsv(SAMPLE_GSC_CTR_CSV, curve, brandName);
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded 5 GSC queries, calculated CTR deficits against position curves, and generated title rewrites.",
    );
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvInput(text);
    setError("");
    setFeedback(`Loaded ${file.name}. Click Calculate CTR Click Deficit to run.`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (!csvInput.trim()) {
      setError(
        "Paste your GSC Query/Page CSV rows or click 'Load Sample GSC CTR Data'.",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      const built = analyzeGscCtrCsv(csvInput, curve, brandName);
      if (!built.rows.length) {
        setError(
          "No valid rows found. Format as: Query/Page, Clicks, Impressions, CTR, Position.",
        );
        return;
      }
      setReport(built);
      setRevision((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  function changeCurve(nextCurve: CtrCurveProfile) {
    setCurve(nextCurve);
    if (report && csvInput.trim()) {
      setReport(analyzeGscCtrCsv(csvInput, nextCurve, brandName));
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

  function handleDownload(format: "csv" | "docx") {
    if (!report) return;
    if (format === "csv") {
      triggerDownload(
        new Blob([exportGscCtrCsv(report)], { type: "text/csv;charset=utf-8" }),
        "gsc-ctr-click-recovery-opportunities.csv",
      );
      setFeedback("Downloaded CTR click-recovery opportunities CSV.");
    } else {
      const bytes = buildGscCtrDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "gsc-ctr-title-rewrite-pack.docx",
      );
      setFeedback("Downloaded editable Word (.docx) title & snippet rewrite pack.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Calculating CTR deficits & recoverable clicks"
        description="Comparing observed GSC click-through rates against organic position curves and generating high-CTR title test variants."
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <MousePointerClick aria-hidden className="text-[#5271ff]" />
              Find High-Impression Queries Losing Clicks to Weak Titles
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Import your Google Search Console Queries or Pages CSV to quantify
              monthly lost clicks and draft high-CTR title/snippet tests.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample GSC CTR Data
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(
            Object.entries(CTR_CURVES) as [
              CtrCurveProfile,
              (typeof CTR_CURVES)["standard"],
            ][]
          ).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              aria-pressed={curve === key}
              onClick={() => changeCurve(key)}
              className={`rounded-xl border p-3.5 text-left transition ${
                curve === key
                  ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
              }`}
            >
              <p className="text-xs font-extrabold">{meta.name}</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {meta.subtitle}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label htmlFor="ctr-brand-name" className="block text-sm font-bold">
            Your Brand Suffix for Title Tag Rewrites
          </label>
          <input
            id="ctr-brand-name"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. DoItWithAI"
            className={`${control} mt-1 max-w-sm`}
          />
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="ctr-csv-input" className="block text-sm font-bold">
              GSC Queries or Pages CSV (Query/Page, Clicks, Impressions, CTR,
              Position)
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
            id="ctr-csv-input"
            rows={7}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={SAMPLE_GSC_CTR_CSV}
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
            <MousePointerClick size={18} />
            Calculate CTR Click Deficit & Title Rewrites
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
          aria-label="GSC CTR optimization results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  {CTR_CURVES[report.curve].name}
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Recoverable Clicks & Snippet Rewrite Opportunities
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Opportunities (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Rewrite Pack (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  Total Recoverable Clicks
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  +{report.totalRecoverableClicks.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Potential extra clicks at benchmark CTR
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
                  Severe CTR Deficits
                </p>
                <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                  {report.severeDeficitCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  High-impression underperformers
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Outperforming Benchmark
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.outperformingCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Beating position CTR curve
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {report.rows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                          r.status === "severe-deficit"
                            ? "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                            : r.status === "moderate-deficit"
                              ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                              : "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                        }`}
                      >
                        {r.recoverableMonthlyClicks > 0
                          ? `+${r.recoverableMonthlyClicks.toLocaleString()} recoverable clicks`
                          : "Beats benchmark"}
                      </span>
                      <span className="font-mono text-sm font-bold">
                        {r.queryOrPage}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Pos <strong>#{r.position}</strong> · Observed CTR:{" "}
                      <strong>{r.observedCtrPct}%</strong> vs Expected:{" "}
                      <strong>{r.expectedCtrPct}%</strong> ({r.impressions.toLocaleString()}{" "}
                      impr)
                    </div>
                  </div>

                  {r.recoverableMonthlyClicks > 0 && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          Recommended High-CTR Title & Snippet Test Variants:
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              `${r.titleVariants.join("\n")}\nMeta: ${r.metaDescriptionDraft}`,
                            );
                            setFeedback(`Copied title variants for "${r.queryOrPage}".`);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-[#3452d1] underline dark:text-[#9aabff]"
                        >
                          <Copy size={12} />
                          Copy Variants
                        </button>
                      </div>
                      <ul className="mt-1.5 space-y-1 font-mono text-[11px]">
                        {r.titleVariants.map((tv) => (
                          <li key={tv}>• {tv}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
