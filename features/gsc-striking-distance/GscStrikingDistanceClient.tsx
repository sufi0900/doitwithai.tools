"use client";
import ConsoleImportPanel from "@/features/search-console-import/ConsoleImportPanel";
import ReportOverview from "@/features/search-console-import/ReportOverview";

import { useMemo, useState } from "react";
import { Copy, Download, Lock, Search } from "lucide-react";
import {
  SAMPLE_CSV,
  buildCsv,
  findOpportunities,
  groupByPage,
  parseGscCsv,
  sortOpportunities,
  type SortKey,
} from "./gscAnalysis";

const PAGE_SIZE = 50;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "opportunity", label: "Estimated extra clicks" },
  { value: "impressions", label: "Impressions" },
  { value: "position", label: "Best position first" },
  { value: "ctr", label: "Lowest CTR first" },
  { value: "clicks", label: "Clicks" },
];

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function GscStrikingDistanceClient() {
  // Pre-load SAMPLE_CSV so the striking-distance opportunities workspace is immediately interactive
  const [text, setText] = useState(SAMPLE_CSV);
  const [minPosition, setMinPosition] = useState("8");
  const [maxPosition, setMaxPosition] = useState("20");
  const [minImpressions, setMinImpressions] = useState("100");
  const [targetCtr, setTargetCtr] = useState("10");
  const [exclude, setExclude] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState<
    "all" | "page1-bottom" | "page2"
  >("all");
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [customActions, setCustomActions] = useState<Record<string, string>>(
    {},
  );
  const [notice, setNotice] = useState("");

  const parsed = useMemo(() => parseGscCsv(text), [text]);

  const opportunities = useMemo(() => {
    const items = findOpportunities(parsed.rows, {
      minPosition: numberOr(minPosition, 8),
      maxPosition: numberOr(maxPosition, 20),
      minImpressions: numberOr(minImpressions, 0),
      targetCtr: Math.min(Math.max(numberOr(targetCtr, 10), 0), 100) / 100,
      excludeTerms: exclude.split(","),
    }).map((it) => {
      const key = `${it.label}::${it.page || ""}`;
      return customActions[key] !== undefined
        ? { ...it, action: customActions[key] }
        : it;
    });
    const filtered = items.filter((it) => {
      if (zoneFilter === "page1-bottom" && it.zone !== "page1-bottom")
        return false;
      if (zoneFilter === "page2" && it.zone === "page1-bottom") return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        return (
          it.label.toLowerCase().includes(q) ||
          (it.page || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
    return sortOpportunities(filtered, sortKey);
  }, [
    parsed.rows,
    minPosition,
    maxPosition,
    minImpressions,
    targetCtr,
    exclude,
    sortKey,
    customActions,
    zoneFilter,
    searchFilter,
  ]);

  const pageGroups = useMemo(
    () => groupByPage(opportunities).slice(0, 8),
    [opportunities],
  );

  const totals = useMemo(
    () => ({
      impressions: opportunities.reduce(
        (sum, item) => sum + item.impressions,
        0,
      ),
      extraClicks: opportunities.reduce(
        (sum, item) => sum + item.estExtraClicks,
        0,
      ),
    }),
    [opportunities],
  );

  const downloadCsv = () => {
    const csv = buildCsv(opportunities, parsed.hasPage);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "striking-distance-keywords.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasData = parsed.rows.length > 0;

  return (
    <div
      id="gsc-striking-distance-finder"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <label className={labelClass} htmlFor="gsc-csv-paste">
            1. Load your Search Console export
          </label>
          <ConsoleImportPanel
            sample={SAMPLE_CSV}
            onChange={(value) => {
              setText(value);
              setVisible(PAGE_SIZE);
            }}
          />

          <textarea
            id="gsc-csv-paste"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            rows={5}
            spellCheck={false}
            placeholder="…or paste CSV text here (header row first: Top queries, Clicks, Impressions, CTR, Position)"
            className={`${inputClass} mt-3 font-mono text-xs`}
          />
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Lock
              className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            Your file is read in this browser tab only. Your data stays in this
            browser tab.
          </p>
        </div>

        <div>
          <p className={labelClass}>2. Tune the filters</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="gsc-min-pos"
              >
                Position from
              </label>
              <input
                id="gsc-min-pos"
                type="number"
                min={1}
                step={0.5}
                value={minPosition}
                onChange={(e) => setMinPosition(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="gsc-max-pos"
              >
                Position to
              </label>
              <input
                id="gsc-max-pos"
                type="number"
                min={1}
                step={0.5}
                value={maxPosition}
                onChange={(e) => setMaxPosition(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="gsc-min-impr"
              >
                Minimum impressions
              </label>
              <input
                id="gsc-min-impr"
                type="number"
                min={0}
                step={10}
                value={minImpressions}
                onChange={(e) => setMinImpressions(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-300"
                htmlFor="gsc-target-ctr"
              >
                Target CTR % (assumption)
              </label>
              <input
                id="gsc-target-ctr"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={targetCtr}
                onChange={(e) => setTargetCtr(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-3">
            <label
              className="mb-1 block text-xs font-semibold text-slate-300"
              htmlFor="gsc-exclude"
            >
              Exclude terms (comma-separated, e.g. your brand name)
            </label>
            <input
              id="gsc-exclude"
              type="text"
              value={exclude}
              onChange={(e) => setExclude(e.target.value)}
              placeholder="yourbrand, yourbrand.com"
              className={inputClass}
            />
          </div>
          <div className="mt-3">
            <label
              className="mb-1 block text-xs font-semibold text-slate-300"
              htmlFor="gsc-sort"
            >
              Sort by
            </label>
            <select
              id="gsc-sort"
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
            The target CTR is an editable scenario, not a prediction. Estimated
            extra clicks = impressions × (target CTR − current CTR), never below
            zero.
          </p>
        </div>
      </div>

      <ReportOverview validRows={parsed.rows.length} text={text} />

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
                parsed.hasQuery
                  ? "Striking-distance queries"
                  : "Striking-distance pages",
                opportunities.length.toLocaleString(),
              ],
              [
                "Impressions in range",
                Math.round(totals.impressions).toLocaleString(),
              ],
              [
                "Estimated extra clicks",
                `~${Math.round(totals.extraClicks).toLocaleString()}`,
              ],
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
                  ["all", "All Striking Distance"],
                  ["page1-bottom", "Page 1 Bottom (Pos 8–10)"],
                  ["page2", "Page 2 Top (Pos 11–20)"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setZoneFilter(val)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    zoneFilter === val
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
                  placeholder="Search query or URL..."
                  aria-label="Search query or URL"
                  className="rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-8 pr-3 text-xs text-white focus:border-[#5271ff] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={downloadCsv}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Export
                results (CSV)
              </button>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <p className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-300">
              No rows match these filters. Try a wider position range or clear
              the search filter.
              <button
                type="button"
                onClick={() => {
                  setMinPosition("1");
                  setMaxPosition("100");
                  setMinImpressions("0");
                  setZoneFilter("all");
                  setSearchFilter("");
                }}
                className="mt-3 block rounded-xl bg-[#3452d1] px-4 py-3 text-sm font-bold text-white"
              >
                Show all positions
              </button>
            </p>
          ) : (
            <>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">
                        {parsed.hasQuery ? "Query" : "Page"}
                      </th>
                      <th className="px-3 py-3 text-right">Pos.</th>
                      <th className="px-3 py-3 text-right">Impr.</th>
                      <th className="px-3 py-3 text-right">Clicks</th>
                      <th className="px-3 py-3 text-right">CTR</th>
                      <th className="px-3 py-3 text-right">Est. extra</th>
                      <th className="px-4 py-3">
                        Editable Action Plan (Syncs to CSV)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {opportunities.slice(0, visible).map((item, index) => {
                      const rowKey = `${item.label}::${item.page || ""}`;
                      return (
                        <tr
                          key={`${rowKey}-${index}`}
                          className="align-top text-slate-200"
                        >
                          <td className="max-w-[260px] px-4 py-3 font-semibold text-white">
                            <span className="break-words">{item.label}</span>
                            {parsed.hasQuery &&
                              parsed.hasPage &&
                              item.page && (
                                <span className="mt-0.5 block break-all text-xs font-normal text-slate-400">
                                  {item.page}
                                </span>
                              )}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                item.zone === "page1-bottom"
                                  ? "bg-emerald-400/15 text-emerald-300"
                                  : "bg-sky-400/15 text-sky-300"
                              }`}
                            >
                              {item.position.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {item.impressions.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {item.clicks.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {(item.ctr * 100).toFixed(2)}%
                          </td>
                          <td className="px-3 py-3 text-right font-bold tabular-nums text-cyan-300">
                            +{Math.round(item.estExtraClicks).toLocaleString()}
                          </td>
                          <td className="min-w-[280px] px-4 py-3 text-xs">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.action}
                                onChange={(e) =>
                                  setCustomActions((prev) => ({
                                    ...prev,
                                    [rowKey]: e.target.value,
                                  }))
                                }
                                aria-label={`Action plan for ${item.label}`}
                                className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus:border-[#5271ff] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(
                                    `${item.label}${item.page ? ` (${item.page})` : ""} — Pos ${item.position.toFixed(1)}, ${item.impressions} impr, +${Math.round(item.estExtraClicks)} est. extra clicks. Action: ${item.action}`,
                                  );
                                  setNotice(
                                    `Copied striking-distance brief for "${item.label}".`,
                                  );
                                }}
                                title="Copy action brief"
                                className="shrink-0 rounded-lg border border-white/15 p-1.5 text-slate-300 hover:bg-white/10"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pageGroups.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-black text-white">
                    Pages with the most striking-distance potential
                  </h3>
                  <ul className="mt-3 grid gap-3 md:grid-cols-2">
                    {pageGroups.map((group) => (
                      <li
                        key={group.page}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                      >
                        <p className="break-all text-xs font-semibold text-blue-200">
                          {group.page}
                        </p>
                        <p className="mt-2 text-xs leading-6 text-slate-300">
                          {group.queries} queries ·{" "}
                          {group.impressions.toLocaleString()} impressions · ~
                          {Math.round(group.estExtraClicks).toLocaleString()}{" "}
                          est. extra clicks
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Strongest query: {group.topQuery}
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
