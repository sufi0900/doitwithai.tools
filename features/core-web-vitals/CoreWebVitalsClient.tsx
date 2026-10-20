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
import {
  matchingReport,
  reportKey,
  normalizeReportUrl,
  reportSummary,
} from "./report-state";
import ReportInsights from "./ReportInsights";
import { checkCoreWebVitals } from "./client";
import type { Metric, PageSpeedResult, Strategy, VitalRating } from "./types";

const RATING_STYLE: Record<VitalRating, { className: string; label: string }> =
  {
    good: {
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      label: "Good",
    },
    "needs-improvement": {
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      label: "Needs improvement",
    },
    poor: {
      className:
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      label: "Poor",
    },
    unknown: {
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      label: "Not available",
    },
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
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {metric.displayValue}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.className}`}
        >
          {style.label}
        </span>
      </div>
    </div>
  );
}

export default function CoreWebVitalsClient() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<Record<string, PageSpeedResult>>({});
  const result = matchingReport(reports, url, strategy);
  const mobile = matchingReport(reports, url, "mobile");
  const desktop = matchingReport(reports, url, "desktop");
  async function handleCheck(device: Strategy = strategy) {
    let target: string;
    try {
      target = normalizeReportUrl(url);
    } catch {
      setError("Enter a full page URL beginning with https:// or http://.");
      return;
    }
    setError("");
    if (matchingReport(reports, target, device)) return;
    setLoading(true);
    try {
      const outcome = await checkCoreWebVitals(target, device);
      if (outcome.ok === false) {
        setError(outcome.message);
        return;
      }
      if (outcome.result.strategy !== device) {
        setError(
          "The returned report did not match the selected device. Please try again.",
        );
        return;
      }
      setReports((previous) => {
        const entries = Object.entries(previous).slice(-19);
        return {
          ...Object.fromEntries(entries),
          [reportKey(target, device)]: {
            ...outcome.result,
            checkedAt: outcome.result.checkedAt || new Date().toISOString(),
          },
        };
      });
    } finally {
      setLoading(false);
    }
  }
  function selectDevice(device: Strategy) {
    if (loading || device === strategy) return;
    setStrategy(device);
    setError("");
    if (url.trim()) void handleCheck(device);
  }
  function downloadReport() {
    if (!result) return;
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(
      new Blob([reportSummary(result)], { type: "text/plain;charset=utf-8" }),
    );
    link.href = objectUrl;
    link.download = `core-web-vitals-${result.strategy}-report.txt`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div id="core-web-vitals-checker" className={`${panelClass} p-5 sm:p-8`}>
      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          className={`${inputClass} h-12 flex-1`}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError("");
          }}
          disabled={loading}
          aria-label="Public page URL"
          placeholder="https://example.com/page"
          inputMode="url"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectDevice("mobile")}
            disabled={loading}
            aria-pressed={strategy === "mobile"}
            className={strategy === "mobile" ? primaryButton : secondaryButton}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
          <button
            type="button"
            onClick={() => selectDevice("desktop")}
            disabled={loading}
            aria-pressed={strategy === "desktop"}
            className={strategy === "desktop" ? primaryButton : secondaryButton}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
        </div>
        <button
          type="button"
          onClick={() => void handleCheck()}
          disabled={loading || !url.trim()}
          className={`${primaryButton} min-h-12 shrink-0`}
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
          {loading ? "Running check…" : "Check Core Web Vitals"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
        {strategy === "mobile" ? "Mobile" : "Desktop"} selected. Switching
        devices checks the matching report when a URL is entered. A check
        usually takes 10–30 seconds.
      </p>
      {error && (
        <div
          role="status"
          className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5"
        >
          <p className="text-sm font-semibold leading-7 text-amber-700 dark:text-amber-200">
            {error}
          </p>
          <a
            href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=${strategy}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-xl bg-[#5271ff] px-4 py-3 text-sm font-bold text-white"
          >
            Check in Google PageSpeed Insights
          </a>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-300">
            The direct report uses the same page URL and selected device. This
            tool does not substitute estimated scores.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-blue-300/30 bg-blue-50 p-5 dark:bg-blue-950/30">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                {result.strategy === "mobile" ? "Mobile" : "Desktop"}{" "}
                performance report
              </h2>
              <p className="mt-1 break-all text-xs leading-6 text-slate-600 dark:text-slate-300">
                {result.finalUrl}
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                {result.strategy === "mobile"
                  ? "Simulated mobile conditions"
                  : "Simulated desktop conditions"}
                . Scores can vary between runs.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadReport}
              className={secondaryButton}
            >
              Download summary
            </button>
          </div>
          {result.reportWarnings?.map((warning, i) => (
            <p
              key={i}
              className="rounded-xl border border-amber-300/30 p-4 text-xs leading-6 text-amber-700 dark:text-amber-200"
            >
              {warning}
            </p>
          ))}
          <ReportInsights
            result={result}
            mobile={mobile}
            desktop={desktop}
            onCompare={() =>
              selectDevice(strategy === "mobile" ? "desktop" : "mobile")
            }
            loading={loading}
          />

          {result.checkedAt && (
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-300">
              Report checked at {new Date(result.checkedAt).toLocaleString()}.
              Reports may be reused for up to 30 minutes.
            </p>
          )}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {result.categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700"
              >
                <p
                  className={`text-3xl font-black ${scoreColor(category.score)}`}
                >
                  {category.score ?? "N/A"}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {category.name}
                </p>
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
                  {result.fieldData.source === "page"
                    ? "This page"
                    : "Origin-level data"}
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
                No real-user field data is available for this URL yet ; the
                Chrome User Experience Report needs enough real visitor traffic
                before Google publishes it. The lab data below is a simulated
                single-run alternative.
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
              Lab data comes from one simulated Lighthouse run and can vary
              between runs. Field data above (when available) reflects real
              visitors and is the more reliable signal.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
