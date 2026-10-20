import React from "react";
import type { PageSpeedResult } from "./types";
import { secondaryButton } from "@/features/writing-tools/config";
const core = [
  {
    id: "LARGEST_CONTENTFUL_PAINT_MS",
    name: "Loading (LCP)",
    goal: "Good at 2.5 seconds or less",
    help: "How quickly the main content becomes visible.",
  },
  {
    id: "INTERACTION_TO_NEXT_PAINT",
    name: "Responsiveness (INP)",
    goal: "Good at 200 milliseconds or less",
    help: "How quickly the page responds to visitor interactions.",
  },
  {
    id: "CUMULATIVE_LAYOUT_SHIFT_SCORE",
    name: "Visual stability (CLS)",
    goal: "Good at 0.1 or less",
    help: "Whether visible content shifts unexpectedly.",
  },
];
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
  const measurements = core.map((c) =>
    result.fieldData.metrics.find((m) => m.id === c.id),
  );
  const complete = measurements.every((m) => m && m.rating !== "unknown");
  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <h2 className="font-black text-slate-950 dark:text-white">
          Understand your Core Web Vitals
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {!complete
            ? "Assessment incomplete. One or more real-user core metrics are unavailable."
            : measurements.every((m) => m?.rating === "good")
              ? "All three reported core metrics meet the good range."
              : "One or more reported core metrics need attention."}{" "}
          {result.fieldData.source === "origin"
            ? "These measurements describe the origin, rather than this specific page."
            : ""}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {core.map((c) => {
            const m = result.fieldData.metrics.find((m) => m.id === c.id);
            return (
              <div
                key={c.id}
                className="min-w-0 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60"
              >
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  {c.name}
                </h3>
                <p className="mt-2 text-2xl font-black text-[#5271ff]">
                  {m?.displayValue || "No field data"}
                </p>
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
              disabled={loading}
              className={secondaryButton}
              onClick={onCompare}
            >
              Check {result.strategy === "mobile" ? "desktop" : "mobile"}
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
                <th className="p-3">Performance score</th>
                <td className="p-3">{score(mobile)}</td>
                <td className="p-3">{score(desktop)}</td>
              </tr>
              {result.labMetrics.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <th className="p-3 text-xs">{m.label}</th>
                  <td className="p-3 text-xs">
                    {mobile?.labMetrics.find((v) => v.id === m.id)
                      ?.displayValue || "Not checked"}
                  </td>
                  <td className="p-3 text-xs">
                    {desktop?.labMetrics.find((v) => v.id === m.id)
                      ?.displayValue || "Not checked"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
          These are separate lab runs under different device conditions. Similar
          results are possible. Compare only reports for the same URL.
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
