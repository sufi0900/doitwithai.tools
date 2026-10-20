"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, Lock, RotateCcw, Upload } from "lucide-react";
import {
  SAMPLE_CSV,
  buildCsv,
  findCannibalization,
  findPagePairs,
  parseQueryPageCsv,
  sortFindings,
  type Severity,
  type SortKey,
} from "./cannibalizationLib";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const PAGE_SIZE = 25;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "split", label: "Impressions split away from the leader" },
  { value: "impressions", label: "Total impressions" },
  { value: "pages", label: "Number of competing pages" },
  { value: "share", label: "Most evenly split first" },
];

const SEVERITY_LABEL: Record<Severity, string> = {
  strong: "Strong overlap",
  moderate: "Moderate overlap",
  light: "Light overlap",
};

const SEVERITY_CLASS: Record<Severity, string> = {
  strong: "bg-rose-400/15 text-rose-300",
  moderate: "bg-amber-400/15 text-amber-300",
  light: "bg-sky-400/15 text-sky-300",
};

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function KeywordCannibalizationClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [minTotal, setMinTotal] = useState("50");
  const [minPage, setMinPage] = useState("10");
  const [minShare, setMinShare] = useState("10");
  const [ignoreParams, setIgnoreParams] = useState(true);
  const [exclude, setExclude] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("split");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [dragging, setDragging] = useState(false);

  const parsed = useMemo(() => parseQueryPageCsv(text), [text]);

  const findings = useMemo(() => {
    const items = findCannibalization(parsed.rows, {
      minTotalImpressions: numberOr(minTotal, 50),
      minPageImpressions: numberOr(minPage, 10),
      minShare: Math.min(Math.max(numberOr(minShare, 10), 0), 100) / 100,
      ignoreUrlParams: ignoreParams,
      excludeTerms: exclude.split(","),
    });
    return sortFindings(items, sortKey);
  }, [parsed.rows, minTotal, minPage, minShare, ignoreParams, exclude, sortKey]);

  const pairs = useMemo(() => findPagePairs(findings, 8), [findings]);

  const totals = useMemo(() => {
    const pages = new Set<string>();
    let impressions = 0;
    for (const finding of findings) {
      impressions += finding.totalImpressions;
      finding.competing.forEach((page) => pages.add(page.page));
    }
    return { impressions, pages: pages.size };
  }, [findings]);

  const loadFile = async (file: File | undefined) => {
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is larger than 25 MB. Export a shorter date range and try again.");
      return;
    }
    if (/\.(xlsx|xls|zip)$/i.test(file.name)) {
      setFileError("Please load a .csv file. In Google Sheets or Excel, use File → Download/Save as → CSV.");
      return;
    }
    setText(await file.text());
    setFileName(file.name);
    setVisible(PAGE_SIZE);
  };

  const reset = () => {
    setText("");
    setFileName("");
    setFileError("");
    setVisible(PAGE_SIZE);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadCsv = () => {
    const blob = new Blob([buildCsv(findings)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "keyword-cannibalization-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasData = parsed.rows.length > 0;

  return (
    <div
      id="keyword-cannibalization-finder"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <label className={labelClass} htmlFor="kc-csv-paste">
            1. Load a Query + Page export
          </label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void loadFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragging ? "border-cyan-300 bg-cyan-300/10" : "border-white/15 bg-slate-900/40"
            }`}
          >
            <FileSpreadsheet className="h-8 w-8 text-blue-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-200">
              {fileName ? `Loaded: ${fileName}` : "Drop a CSV with Query and Page columns"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50"
              >
                <Upload className="h-4 w-4" aria-hidden="true" /> Choose CSV file
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(SAMPLE_CSV);
                  setFileName("sample-data.csv");
                  setVisible(PAGE_SIZE);
                }}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                Try sample data
              </button>
              {text && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Clear
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Choose a CSV file"
              onChange={(event) => void loadFile(event.target.files?.[0])}
            />
          </div>

          <textarea
            id="kc-csv-paste"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setFileName("");
              setVisible(PAGE_SIZE);
            }}
            rows={5}
            spellCheck={false}
            placeholder="…or paste CSV text here (header row first: Query, Page, Clicks, Impressions, Position)"
            className={`${inputClass} mt-3 font-mono text-xs`}
          />
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
            Your file is analyzed in this browser tab only. Nothing is uploaded, stored, or sent to an AI model.
          </p>
          {fileError && (
            <p role="alert" className="mt-2 text-xs font-semibold text-amber-300">
              {fileError}
            </p>
          )}
        </div>

        <div>
          <p className={labelClass}>2. Tune what counts as competing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="kc-min-total">
                Min. impressions per query
              </label>
              <input id="kc-min-total" type="number" min={0} step={10} value={minTotal} onChange={(e) => setMinTotal(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="kc-min-page">
                Min. impressions per page
              </label>
              <input id="kc-min-page" type="number" min={0} step={5} value={minPage} onChange={(e) => setMinPage(e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="kc-min-share">
                Min. impression share for a page to count (%)
              </label>
              <input id="kc-min-share" type="number" min={0} max={100} step={5} value={minShare} onChange={(e) => setMinShare(e.target.value)} className={inputClass} />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={ignoreParams}
              onChange={(event) => setIgnoreParams(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            Treat URLs that differ only by ?parameters, #fragments, or a trailing slash as one page
          </label>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="kc-exclude">
              Exclude queries containing (comma-separated, e.g. your brand)
            </label>
            <input id="kc-exclude" type="text" value={exclude} onChange={(e) => setExclude(e.target.value)} placeholder="yourbrand" className={inputClass} />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="kc-sort">
              Sort by
            </label>
            <select id="kc-sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={inputClass}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            A query is flagged when two or more of your pages each meet the thresholds above. Having two pages
            appear for one query is not always a problem ; use the results as a review list.
          </p>
        </div>
      </div>

      {parsed.error && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {parsed.error}
        </p>
      )}

      {hasData && (
        <div className="mt-8" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Queries with competing pages", findings.length.toLocaleString()],
              ["Impressions on those queries", Math.round(totals.impressions).toLocaleString()],
              ["Pages involved", totals.pages.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {parsed.skipped > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {parsed.skipped.toLocaleString()} row(s) skipped because a query, page, impressions, or position value was missing or invalid.
            </p>
          )}

          {findings.length === 0 ? (
            <p className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-300">
              No competing pages found with these settings. Try lowering the minimum impressions or the minimum share ; or this may simply mean each query is well-targeted.
            </p>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-white">
                  Showing {Math.min(visible, findings.length).toLocaleString()} of {findings.length.toLocaleString()} queries
                </p>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Export report (CSV)
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {findings.slice(0, visible).map((finding, index) => (
                  <details
                    key={`${finding.query}-${index}`}
                    open={index === 0}
                    className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 open:bg-slate-900/80"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-white">{finding.query}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className={`rounded-full px-2 py-0.5 font-bold ${SEVERITY_CLASS[finding.severity]}`}>
                          {SEVERITY_LABEL[finding.severity]}
                        </span>
                        {finding.competing.length} pages · {finding.totalImpressions.toLocaleString()} impr.
                      </span>
                    </summary>

                    <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full min-w-[620px] text-left text-xs">
                        <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-3 py-2">Page</th>
                            <th className="px-3 py-2 text-right">Pos.</th>
                            <th className="px-3 py-2 text-right">Impr.</th>
                            <th className="px-3 py-2 text-right">Clicks</th>
                            <th className="px-3 py-2 text-right">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-200">
                          {finding.competing.map((page, pageIndex) => (
                            <tr key={page.page}>
                              <td className="max-w-[340px] px-3 py-2 break-all">
                                {pageIndex === 0 && (
                                  <span className="mr-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                                    Leader
                                  </span>
                                )}
                                {page.page}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">{page.position.toFixed(1)}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{page.impressions.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{page.clicks.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{(page.share * 100).toFixed(0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-slate-300">
                      <span className="font-bold text-white">Suggested next step: </span>
                      {finding.recommendation}
                    </p>
                  </details>
                ))}
              </div>

              {visible < findings.length && (
                <button
                  type="button"
                  onClick={() => setVisible((count) => count + PAGE_SIZE)}
                  className="mt-4 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                >
                  Show {Math.min(PAGE_SIZE, findings.length - visible)} more
                </button>
              )}

              {pairs.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-black text-white">Page pairs that compete most often</h3>
                  <ul className="mt-3 grid gap-3 md:grid-cols-2">
                    {pairs.map((pair) => (
                      <li key={`${pair.pageA}|${pair.pageB}`} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <p className="break-all text-xs font-semibold text-blue-200">{pair.pageA}</p>
                        <p className="my-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">vs</p>
                        <p className="break-all text-xs font-semibold text-blue-200">{pair.pageB}</p>
                        <p className="mt-2 text-xs text-slate-300">
                          {pair.sharedQueries} shared quer{pair.sharedQueries === 1 ? "y" : "ies"} · {pair.impressions.toLocaleString()} combined impressions
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
