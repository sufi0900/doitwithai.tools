import React from "react";
import { CORE_METRICS, coreCards, hasMeasurement } from "./presentation";
import { RATING_STYLE, scoreRating } from "./ratings";
import type { Metric, PageSpeedResult } from "./types";
import { secondaryButton } from "@/features/writing-tools/config";
function ComparisonMetric({ metric }: { metric?: Metric }) {
  return (
    <span className={RATING_STYLE[metric?.rating ?? "unknown"].valueClass}>
      {metric?.displayValue || "Not available"}
    </span>
  );
}
function score(report: PageSpeedResult | null) {
  return (
    report?.categories.find((c) => c.id === "performance")?.score ??
    "Not checked"
  );
}
export default function ReportInsights({
  result,
  mobile,
  desktop,
  onCompare,
  loading,
}: {
  result: PageSpeedResult;
  mobile: PageSpeedResult | null;
  desktop: PageSpeedResult | null;
  onCompare: () => void;
  loading: boolean;
}) {
  const measurements = CORE_METRICS.map((c) =>
    result.fieldData.metrics.find((m) => m.id === c.id),
  );
  const complete = measurements.every(
    (m) => hasMeasurement(m) && m.rating !== "unknown",
  );
  const assessment = !complete
    ? "needs-improvement"
    : measurements.some((m) => m?.rating === "poor")
      ? "poor"
      : measurements.every((m) => m?.rating === "good")
        ? "good"
        : "needs-improvement";
  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <h2 className="font-black text-slate-950 dark:text-white">
          Understand your Core Web Vitals
        </h2>
        <p
          className={`mt-2 rounded-xl border p-3 text-sm leading-7 ${RATING_STYLE[assessment].panelClass} ${RATING_STYLE[assessment].valueClass}`}
        >
          {!complete
            ? "Assessment incomplete. Google has not provided every real-user core metric. Labeled lab measurements are shown where available."
            : measurements.every((m) => m?.rating === "good")
              ? "All three reported core metrics meet the good range."
              : "One or more reported core metrics need attention."}{" "}
          {result.fieldData.source === "origin"
            ? "These measurements describe the origin, rather than this specific page."
            : ""}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {coreCards(result).map((c) => {
            const rating = c.metric?.rating ?? "unknown";
            const style = RATING_STYLE[rating];
            return (
              <div
                key={c.id}
                className={`min-w-0 rounded-xl border p-4 ${style.panelClass}`}
                data-core-card={c.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {c.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className={`mt-2 text-2xl font-black ${style.valueClass}`}>
                  {c.metric?.displayValue || "Not available"}
                </p>
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {c.source === "field"
                    ? "Real-user measurement"
                    : c.source === "lab"
                      ? "Simulated lab measurement"
                      : c.source === "diagnostic"
                        ? "Lab diagnostic, not INP"
                        : "No measurement supplied"}
                </p>
                {c.source !== "field" && (
                  <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {c.note}
                  </p>
                )}
                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {c.goal}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {c.help}
                </p>
              </div>
            );
          })}
        </div>
        {!complete && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-bold">
              Missing field data does not mean the page has failed.
            </p>
            <p>
              Google needs enough eligible visitor samples before publishing
              page or origin data. New or less-visited pages may not qualify.
              Check that the page is publicly accessible and indexable.
            </p>
            <p className="mt-2">
              Use the device-specific lab results to find improvements now.
              Real-user INP cannot be inferred from a loading test.
            </p>
            <a
              className="mt-2 inline-block font-bold underline"
              href="https://developer.chrome.com/docs/crux/methodology"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Google’s field-data requirements
            </a>
          </div>
        )}
        <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Real-user assessments use the 75th percentile. A lab score alone
          cannot establish a real-user Core Web Vitals pass.
        </p>
        <a
          href="https://web.dev/articles/vitals"
          className="mt-2 inline-block text-xs font-bold text-[#5271ff] underline"
        >
          Read Google’s metric guidance
        </a>
      </section>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-slate-950 dark:text-white">
            Compare mobile and desktop
          </h2>
          {(!mobile || !desktop) && (
            <button
              type="button"
              className={secondaryButton}
              onClick={onCompare}
            >
              {loading ? "Preparing" : "View"}{" "}
              {result.strategy === "mobile" ? "desktop" : "mobile"}
            </button>
          )}
        </div>
        <div className="mt-4 max-w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="p-3">Measurement</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Desktop</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs">Real-user data scope</th>
                <td className="p-3 text-xs">
                  {mobile
                    ? mobile.fieldData.source || "Unavailable"
                    : "Not checked"}
                </td>
                <td className="p-3 text-xs">
                  {desktop
                    ? desktop.fieldData.source || "Unavailable"
                    : "Not checked"}
                </td>
              </tr>
              {CORE_METRICS.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <th className="p-3 text-xs">{c.name} (real users)</th>
                  <td className="p-3 text-xs">
                    <ComparisonMetric
                      metric={mobile?.fieldData.metrics.find(
                        (m) => m.id === c.id,
                      )}
                    />
                  </td>
                  <td className="p-3 text-xs">
                    <ComparisonMetric
                      metric={desktop?.fieldData.metrics.find(
                        (m) => m.id === c.id,
                      )}
                    />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <th className="p-3">Performance score</th>
                <td
                  className={`p-3 font-bold ${RATING_STYLE[scoreRating(mobile?.categories.find((c) => c.id === "performance")?.score)].valueClass}`}
                >
                  {score(mobile)}
                </td>
                <td
                  className={`p-3 font-bold ${RATING_STYLE[scoreRating(desktop?.categories.find((c) => c.id === "performance")?.score)].valueClass}`}
                >
                  {score(desktop)}
                </td>
              </tr>
              {Array.from(
                new Map(
                  [
                    ...(mobile?.labMetrics ?? []),
                    ...(desktop?.labMetrics ?? []),
                  ].map((m) => [m.id, m]),
                ).values(),
              ).map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <th className="p-3 text-xs">{m.label}</th>
                  <td className="p-3 text-xs">
                    {mobile ? (
                      <ComparisonMetric
                        metric={mobile.labMetrics.find((v) => v.id === m.id)}
                      />
                    ) : (
                      "Not checked"
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {desktop ? (
                      <ComparisonMetric
                        metric={desktop.labMetrics.find((v) => v.id === m.id)}
                      />
                    ) : (
                      "Not checked"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
          These are separate lab runs under different device conditions. Similar
          results are possible. Compare only reports for the same URL. Real-user
          data covers a rolling collection period and may change slowly.
        </p>
      </section>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <h2 className="font-black text-slate-950 dark:text-white">
          What to improve next
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Start with the reported performance opportunities below. Savings are
          estimates from this run and should not be added together.
        </p>
        <div className="mt-4 space-y-3">
          {result.findings?.length ? (
            result.findings.map((f, i) => (
              <article
                key={f.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 text-sm font-bold text-slate-950 dark:text-white">
                    {i + 1}. {f.title}
                  </h3>
                  <span className="rounded-full bg-[#5271ff]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#5271ff]">
                    {f.category.replace("-", " ")}
                  </span>
                </div>
                {f.displayValue && (
                  <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {f.displayValue}
                  </p>
                )}
                {f.savingsMs !== null && (
                  <p className="mt-2 text-xs font-bold text-[#5271ff]">
                    Estimated time saving: {(f.savingsMs / 1000).toFixed(2)}{" "}
                    seconds
                  </p>
                )}
                {f.savingsBytes !== null && (
                  <p className="mt-1 text-xs text-slate-500">
                    Estimated transfer saving:{" "}
                    {Math.round(f.savingsBytes / 1024)} KB
                  </p>
                )}
                <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {f.description}
                </p>
                <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm leading-7 text-slate-700 dark:bg-blue-950/30 dark:text-slate-200">
                  <strong>Suggested next step </strong>
                  {f.nextStep}
                </p>
                {f.resources.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-bold text-[#5271ff]">
                      Affected resources
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {f.resources.map((url, j) => (
                        <li
                          key={j}
                          className="break-all font-mono text-[11px] leading-6 text-slate-500 dark:text-slate-400"
                        >
                          {url}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            ))
          ) : (
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
              No actionable audit findings were returned in this report. Review
              the measurements and full Google report before deciding whether
              further changes are needed.
            </p>
          )}
        </div>
        <a
          href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(result.requestedUrl)}&form_factor=${result.strategy}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex text-sm font-bold text-[#5271ff] underline"
        >
          Open the full Google report
        </a>
      </section>
    </>
  );
}
