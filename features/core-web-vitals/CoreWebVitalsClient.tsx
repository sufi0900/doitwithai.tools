"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import { checkCoreWebVitals } from "./client";
import type { Metric, PageSpeedResult, Strategy, VitalRating } from "./types";

const RATING_STYLE: Record<VitalRating, { className: string; label: string }> = {
  good: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", label: "Good" },
  "needs-improvement": { className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", label: "Needs improvement" },
  poor: { className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", label: "Poor" },
  unknown: { className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Not available" },
};

function scoreColor(score: number | null) {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function MetricRow({ metric }: { metric: Metric }) {
  const style = RATING_STYLE[metric.rating];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-950/60">
      <span className="text-slate-700 dark:text-slate-200">{metric.label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{metric.displayValue}</span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.className}`}>{style.label}</span>
      </div>
    </div>
  );
}

export default function CoreWebVitalsClient() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PageSpeedResult | null>(null);

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    const outcome = await checkCoreWebVitals(url.trim(), strategy);
    setLoading(false);
    if (outcome.ok === false) {
      setError(outcome.message);
      return;
    }
    setResult(outcome.result);
  }

  return (
    <div id="core-web-vitals-checker" className={`${panelClass} p-5 sm:p-8`}>
      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          className={inputClass}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/page"
          inputMode="url"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStrategy("mobile")}
            className={strategy === "mobile" ? primaryButton : secondaryButton}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
          <button
            type="button"
            onClick={() => setStrategy("desktop")}
            className={strategy === "desktop" ? primaryButton : secondaryButton}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
        </div>
        <button type="button" onClick={handleCheck} disabled={loading || !url.trim()} className={`${primaryButton} shrink-0`}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Running check…" : "Check Core Web Vitals"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
        Review mobile or desktop performance. A full check
        usually takes 10–30 seconds.
      </p>
      {error && <p className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {result.categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700">
                <p className={`text-3xl font-black ${scoreColor(category.score)}`}>{category.score ?? ";"}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{category.name}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Real-user field data (Core Web Vitals)
              </h2>
              {result.fieldData.source && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {result.fieldData.source === "page" ? "This page" : "Site-wide average"}
                </span>
              )}
            </div>
            {result.fieldData.metrics.length ? (
              <div className="mt-3 space-y-2">
                {result.fieldData.metrics.map((metric) => (
                  <MetricRow key={metric.id} metric={metric} />
                ))}
              </div>
            ) : (
              <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                No real-user field data is available for this URL yet ; the Chrome User Experience
                Report needs enough real visitor traffic before Google publishes it. The lab data
                below is a simulated single-run alternative.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              Lab data (simulated single run)
            </h2>
            <div className="mt-3 space-y-2">
              {result.labMetrics.map((metric) => (
                <MetricRow key={metric.id} metric={metric} />
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
              Lab data comes from one simulated Lighthouse run and can vary between runs. Field data
              above (when available) reflects real visitors and is the more reliable signal.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
