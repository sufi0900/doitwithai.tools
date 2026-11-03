"use client";
import ConsoleImportPanel from "@/features/search-console-import/ConsoleImportPanel";
import ReportOverview from "@/features/search-console-import/ReportOverview";

import { useMemo, useState } from "react";
import { Copy, Download, Lock, Search } from "lucide-react";
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
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function KeywordCannibalizationClient() {
  // Pre-load SAMPLE_CSV so the cannibalization audit workspace is immediately interactive
  const [text, setText] = useState(SAMPLE_CSV);
  const [minTotal, setMinTotal] = useState("50");
  const [minPage, setMinPage] = useState("10");
  const [minShare, setMinShare] = useState("10");
  const [ignoreParams, setIgnoreParams] = useState(true);
  const [exclude, setExclude] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("split");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const parsed = useMemo(() => parseQueryPageCsv(text), [text]);

  const findings = useMemo(() => {
    const items = findCannibalization(parsed.rows, {
      minTotalImpressions: numberOr(minTotal, 50),
      minPageImpressions: numberOr(minPage, 10),
      minShare: Math.min(Math.max(numberOr(minShare, 10), 0), 100) / 100,
      ignoreUrlParams: ignoreParams,
      excludeTerms: exclude.split(","),
    }).map((f) =>
      customNotes[f.query] !== undefined
        ? { ...f, recommendation: customNotes[f.query] }
        : f,
    );
    const filtered = items.filter((f) => {
      if (severityFilter !== "all" && f.severity !== severityFilter)
        return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        return (
          f.query.toLowerCase().includes(q) ||
          f.competing.some((p) => p.page.toLowerCase().includes(q))
        );
      }
      return true;
    });
    return sortFindings(filtered, sortKey);
  }, [
    parsed.rows,
    minTotal,
    minPage,
    minShare,
    ignoreParams,
    exclude,
    sortKey,
    customNotes,
    severityFilter,
    searchFilter,
  ]);

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

  const downloadCsv = () => {
    const blob = new Blob([buildCsv(findings)], {
      type: "text/csv;charset=utf-8",
    });
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
            1. Load your Search Console export
          </label>
          <ConsoleImportPanel
            cannibalization
            sample={SAMPLE_CSV}
            onChange={(value) => {
              setText(value);
              setVisible(PAGE_SIZE);
            }}
          />

          <textarea
            id="kc-csv-paste"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            rows={5}
            spellCheck={false}
            placeholder="…or paste CSV text here (header row first: Query, Page, Clicks, Impressions, Position)"
            className={`${inputClass} mt-3 font-mono text-xs`}
          />
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Lock
              className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            Your file is analyzed in this browser tab only. Your data stays in
            this browser tab.
          </p>
        </div>

        <div>
          <p className={labelClass}>2. Tune what counts as competing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="kc-min-total"
              >
                Min. impressions per query
              </label>
              <input
                id="kc-min-total"
                type="number"
                min={0}
                step={10}
                value={minTotal}
                onChange={(e) => setMinTotal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="kc-min-page"
              >
                Min. impressions per page
              </label>
              <input
                id="kc-min-page"
                type="number"
                min={0}
                step={5}
                value={minPage}
                onChange={(e) => setMinPage(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="kc-min-share"
              >
                Min. impression share for a page to count (%)
              </label>
              <input
                id="kc-min-share"
                type="number"
                min={0}
                max={100}
                step={5}
                value={minShare}
                onChange={(e) => setMinShare(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={ignoreParams}
              onChange={(event) => setIgnoreParams(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            Treat URLs that differ only by ?parameters, #fragments, or a
            trailing slash as one page
          </label>
          <div className="mt-3">
            <label
              className="mb-1 block text-xs font-semibold text-slate-300"
              htmlFor="kc-exclude"
            >
              Exclude queries containing (comma-separated, e.g. your brand)
            </label>
            <input
              id="kc-exclude"
              type="text"
              value={exclude}
              onChange={(e) => setExclude(e.target.value)}
              placeholder="yourbrand"
              className={inputClass}
            />
          </div>
          <div className="mt-3">
            <label
              className="mb-1 block text-xs font-semibold text-slate-300"
              htmlFor="kc-sort"
            >
              Sort by
            </label>
            <select
              id="kc-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={inputClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            A query is flagged when two or more of your pages each meet the
            thresholds above. Edit any consolidation note inline before
            exporting your CSV report.
          </p>
        </div>
      </div>

      <ReportOverview
        validRows={parsed.rows.length}
        text={text}
        cannibalization
      />

      {notice && (
        <p role="status" className="mt-4 text-xs font-bold text-emerald-300">
          {notice}
        </p>
      )}

      {hasData && (
        <div className="mt-8" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                "Queries with competing pages",
                findings.length.toLocaleString(),
              ],
              [
                "Impressions on those queries",
                Math.round(totals.impressions).toLocaleString(),
              ],
              ["Pages involved", totals.pages.toLocaleString()],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "All Overlaps"],
                  ["strong", "Strong Overlap"],
                  ["moderate", "Moderate Overlap"],
                  ["light", "Light Overlap"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSeverityFilter(val)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    severityFilter === val
                      ? "border-[#4058D0] bg-[#3452d1] text-white"
                      : "border-white/15 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter query or URL..."
                  aria-label="Filter query or URL"
                  className="rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-8 pr-3 text-xs text-white focus:border-[#5271ff] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={downloadCsv}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Export
                report (CSV)
              </button>
            </div>
          </div>

          {findings.length === 0 ? (
            <p className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-300">
              No competing pages found with these settings. Try lowering the
              minimum impressions or clearing the search filter.
            </p>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                {findings.slice(0, visible).map((finding, index) => (
                  <details
                    key={`${finding.query}-${index}`}
                    open
                    className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 open:bg-slate-900/80"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-white">
                        {finding.query}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span
                          className={`rounded-full px-2 py-0.5 font-bold ${SEVERITY_CLASS[finding.severity]}`}
                        >
                          {SEVERITY_LABEL[finding.severity]}
                        </span>
                        {finding.competing.length} pages ·{" "}
                        {finding.totalImpressions.toLocaleString()} impr.
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
                              <td className="max-w-[340px] break-all px-3 py-2">
                                {pageIndex === 0 && (
                                  <span className="mr-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                                    Leader
                                  </span>
                                )}
                                {page.page}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {page.position.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {page.impressions.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {page.clicks.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {(page.share * 100).toFixed(0)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        Editable Consolidation Plan:
                      </span>
                      <input
                        type="text"
                        value={finding.recommendation}
                        onChange={(e) =>
                          setCustomNotes((prev) => ({
                            ...prev,
                            [finding.query]: e.target.value,
                          }))
                        }
                        aria-label={`Consolidation plan for ${finding.query}`}
                        className="min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-200 focus:border-[#5271ff] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const textBrief = [
                            `Query: "${finding.query}" (${SEVERITY_LABEL[finding.severity]} · ${finding.totalImpressions} impr)`,
                            ...finding.competing.map(
                              (p, idx) =>
                                `  ${idx === 0 ? "[Leader]" : "[Competing]"} ${p.page} — Pos ${p.position.toFixed(1)}, ${p.impressions} impr (${Math.round(p.share * 100)}%)`,
                            ),
                            `Plan: ${finding.recommendation}`,
                          ].join("\n");
                          await navigator.clipboard.writeText(textBrief);
                          setNotice(
                            `Copied cannibalization brief for "${finding.query}".`,
                          );
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10"
                      >
                        <Copy size={12} />
                        Copy Brief
                      </button>
                    </div>
                  </details>
                ))}
              </div>

              {pairs.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-black text-white">
                    Page pairs that compete most often
                  </h3>
                  <ul className="mt-3 grid gap-3 md:grid-cols-2">
                    {pairs.map((pair) => (
                      <li
                        key={`${pair.pageA}|${pair.pageB}`}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                      >
                        <p className="break-all text-xs font-semibold text-blue-200">
                          {pair.pageA}
                        </p>
                        <p className="my-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          vs
                        </p>
                        <p className="break-all text-xs font-semibold text-blue-200">
                          {pair.pageB}
                        </p>
                        <p className="mt-2 text-xs text-slate-300">
                          {pair.sharedQueries} shared quer
                          {pair.sharedQueries === 1 ? "y" : "ies"} ·{" "}
                          {pair.impressions.toLocaleString()} combined
                          impressions
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
