"use client";
import { memo } from "react";
import { reportInfo } from "./import";
import { parseCsvText } from "@/features/gsc-striking-distance/gscAnalysis";
function ReportOverview({
  text,
  cannibalization = false,
  validRows = 0,
}: {
  text: string;
  cannibalization?: boolean;
  validRows?: number;
}) {
  if (!text.trim()) return null;
  const info = reportInfo(text);
  const table = parseCsvText(info.normalized).rows;
  const rows = table.slice(1);
  const full =
    info.hasPosition &&
    (cannibalization
      ? info.kind === "query-pages"
      : ["queries", "pages"].includes(info.kind));
  if (full && validRows === 0)
    return (
      <p
        role="status"
        className="mt-5 rounded-xl border border-amber-300/30 p-4 text-sm leading-7 text-amber-200"
      >
        The report format is recognized, but no rows contain usable impressions
        and average positions. Check whether the exported report contains data
        for this date range.
      </p>
    );
  if (full)
    return (
      <p
        role="status"
        className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-200"
      >
        Recognized {info.kind.replace("-", " + ")} report.{" "}
        {rows.length.toLocaleString()} rows loaded. Review the results below.
      </p>
    );
  const supported = ["queries", "pages", "summary"].includes(info.kind);
  return (
    <section
      className="mt-6 min-w-0 rounded-2xl border border-blue-300/25 bg-blue-300/5 p-5"
      aria-live="polite"
    >
      <h3 className="font-bold text-white">
        {supported
          ? "Performance export loaded"
          : info.kind === "empty"
            ? "This file has no data rows"
            : "This file is not a Search Console performance export"}
      </h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        {supported
          ? cannibalization
            ? "This report can show performance, but it does not link queries to individual pages. We cannot infer cannibalization from separate Queries and Pages totals. Use page-filtered query exports above, or upload a combined Query + Page CSV."
            : "This report is useful for performance review. Keyword opportunities require Queries or Pages with average position. Select that report from your ZIP, or enable average position before exporting."
          : "Keyword-frequency and internal-link reports do not include Search Console impressions and positions. Export Performance → Search results as CSV or ZIP, or try the sample."}
      </p>
      {supported && (
        <>
          <p className="mt-3 text-xs text-blue-200">
            {rows.length.toLocaleString()} rows detected. Preview of the first
            10 rows.
          </p>
          <div className="mt-3 max-w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5">
                <tr>
                  {table[0]?.map((h, i) => (
                    <th key={i} className="whitespace-nowrap p-3 text-blue-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-t border-white/10">
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className="max-w-[20rem] break-words p-3 text-slate-300"
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default memo(ReportOverview);
