"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

import { useState } from "react";
import { useReports } from "./useReports";
import { RATING_STYLE, scoreRating } from "./ratings";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
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
import type { Metric, PageSpeedResult, Strategy } from "./types";

const SAMPLE_URL = "https://doitwithai.tools/tools/on-page-ai-seo-analyzer";

const SAMPLE_REPORTS: Record<Strategy, PageSpeedResult> = {
  mobile: {
    checkedAt: "2026-04-01T12:00:00.000Z",
    analysisAt: "2026-04-01T12:00:00.000Z",
    requestedUrl: SAMPLE_URL,
    finalUrl: SAMPLE_URL,
    strategy: "mobile",
    categories: [
      { id: "performance", name: "Performance", score: 86 },
      { id: "accessibility", name: "Accessibility", score: 98 },
      { id: "best-practices", name: "Best Practices", score: 96 },
      { id: "seo", name: "SEO", score: 100 },
    ],
    fieldData: {
      source: "origin",
      overallRating: "good",
      metrics: [
        {
          id: "lcp",
          label: "Largest Contentful Paint (LCP)",
          displayValue: "2.1 s",
          numericValue: 2100,
          rating: "good",
        },
        {
          id: "inp",
          label: "Interaction to Next Paint (INP)",
          displayValue: "145 ms",
          numericValue: 145,
          rating: "good",
        },
        {
          id: "cls",
          label: "Cumulative Layout Shift (CLS)",
          displayValue: "0.03",
          numericValue: 0.03,
          rating: "good",
        },
      ],
    },
    labMetrics: [
      {
        id: "fcp",
        label: "First Contentful Paint (FCP)",
        displayValue: "1.2 s",
        numericValue: 1200,
        rating: "good",
      },
      {
        id: "lcp",
        label: "Largest Contentful Paint (LCP)",
        displayValue: "2.3 s",
        numericValue: 2300,
        rating: "good",
      },
      {
        id: "tbt",
        label: "Total Blocking Time (TBT)",
        displayValue: "110 ms",
        numericValue: 110,
        rating: "good",
      },
      {
        id: "cls",
        label: "Cumulative Layout Shift (CLS)",
        displayValue: "0.02",
        numericValue: 0.02,
        rating: "good",
      },
      {
        id: "si",
        label: "Speed Index",
        displayValue: "2.4 s",
        numericValue: 2400,
        rating: "good",
      },
    ],
    findings: [
      {
        id: "render-blocking-resources",
        title: "Eliminate render-blocking resources",
        description:
          "Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.",
        category: "performance",
        score: 0.65,
        displayValue: "Potential savings of 280 ms",
        savingsMs: 280,
        savingsBytes: 18432,
        resources: [
          "https://doitwithai.tools/_next/static/css/app-layout.css",
        ],
        nextStep:
          "Inline critical above-the-fold CSS and defer non-essential stylesheets.",
      },
      {
        id: "unused-javascript",
        title: "Reduce unused JavaScript",
        description:
          "Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity.",
        category: "performance",
        score: 0.72,
        displayValue: "Potential savings of 42 KiB",
        savingsMs: 190,
        savingsBytes: 43008,
        resources: [
          "https://doitwithai.tools/_next/static/chunks/main-app.js",
        ],
        nextStep:
          "Code-split below-the-fold interactive widgets with dynamic imports.",
      },
    ],
    reportWarnings: [
      "Illustrative sample report pre-loaded. Enter any public URL above and click 'Check Core Web Vitals' to run a live Google PageSpeed Insights test.",
    ],
  },
  desktop: {
    checkedAt: "2026-04-01T12:00:00.000Z",
    analysisAt: "2026-04-01T12:00:00.000Z",
    requestedUrl: SAMPLE_URL,
    finalUrl: SAMPLE_URL,
    strategy: "desktop",
    categories: [
      { id: "performance", name: "Performance", score: 96 },
      { id: "accessibility", name: "Accessibility", score: 98 },
      { id: "best-practices", name: "Best Practices", score: 100 },
      { id: "seo", name: "SEO", score: 100 },
    ],
    fieldData: {
      source: "origin",
      overallRating: "good",
      metrics: [
        {
          id: "lcp",
          label: "Largest Contentful Paint (LCP)",
          displayValue: "1.1 s",
          numericValue: 1100,
          rating: "good",
        },
        {
          id: "inp",
          label: "Interaction to Next Paint (INP)",
          displayValue: "58 ms",
          numericValue: 58,
          rating: "good",
        },
        {
          id: "cls",
          label: "Cumulative Layout Shift (CLS)",
          displayValue: "0.01",
          numericValue: 0.01,
          rating: "good",
        },
      ],
    },
    labMetrics: [
      {
        id: "fcp",
        label: "First Contentful Paint (FCP)",
        displayValue: "0.5 s",
        numericValue: 500,
        rating: "good",
      },
      {
        id: "lcp",
        label: "Largest Contentful Paint (LCP)",
        displayValue: "0.9 s",
        numericValue: 900,
        rating: "good",
      },
      {
        id: "tbt",
        label: "Total Blocking Time (TBT)",
        displayValue: "20 ms",
        numericValue: 20,
        rating: "good",
      },
      {
        id: "cls",
        label: "Cumulative Layout Shift (CLS)",
        displayValue: "0.005",
        numericValue: 0.005,
        rating: "good",
      },
      {
        id: "si",
        label: "Speed Index",
        displayValue: "0.8 s",
        numericValue: 800,
        rating: "good",
      },
    ],
    findings: [],
    reportWarnings: [
      "Illustrative sample report pre-loaded. Enter any public URL above and click 'Check Core Web Vitals' to run a live Google PageSpeed Insights test.",
    ],
  },
};

function MetricRow({ metric }: { metric: Metric }) {
  const style = RATING_STYLE[metric.rating];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-950/60">
      <span className="text-slate-700 dark:text-slate-200">{metric.label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-xs ${style.valueClass}`}>
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
  const [url, setUrl] = useState(SAMPLE_URL);
  const [showSample, setShowSample] = useState(true);
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [validationError, setValidationError] = useState("");
  const { reports, pending, errors, ensure } = useReports();
  const liveResult = matchingReport(reports, url, strategy);
  const liveMobile = matchingReport(reports, url, "mobile");
  const liveDesktop = matchingReport(reports, url, "desktop");
  const result = liveResult || (showSample ? SAMPLE_REPORTS[strategy] : null);
  const mobile = liveMobile || (showSample ? SAMPLE_REPORTS.mobile : null);
  const desktop = liveDesktop || (showSample ? SAMPLE_REPORTS.desktop : null);
  let selectedKey = "",
    mobileKey = "",
    desktopKey = "";
  try {
    selectedKey = reportKey(url, strategy);
    mobileKey = reportKey(url, "mobile");
    desktopKey = reportKey(url, "desktop");
  } catch {
    /* A typed URL is not submitted until validation passes. */
  }
  const loading = Boolean(pending[selectedKey]);
  const anyLoading = Object.values(pending).some(Boolean);
  const otherLoading = Boolean(
    pending[strategy === "mobile" ? desktopKey : mobileKey],
  );
  const error = validationError || errors[selectedKey] || "";
  function handleCheck() {
    try {
      const target = normalizeReportUrl(url);
      setShowSample(false);
      setValidationError("");
      void ensure(target, strategy);
      void ensure(target, strategy === "mobile" ? "desktop" : "mobile");
    } catch {
      setValidationError(
        "Enter a full page URL beginning with https:// or http://.",
      );
    }
  }
  function selectDevice(device: Strategy) {
    setStrategy(device);
    setValidationError("");
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
    <div
      id="core-web-vitals-checker"
      className={`${panelClass} relative p-5 sm:p-8`}
    >
      <div className="flex flex-col gap-3 xl:flex-row">
        <ToolUrlInput
          className={`${inputClass} h-12 flex-1`}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setValidationError("");
          }}
          aria-label="Public page URL"
          placeholder="https://example.com/page"
          inputMode="url"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !anyLoading) handleCheck();
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectDevice("mobile")}
            aria-pressed={strategy === "mobile"}
            className={strategy === "mobile" ? primaryButton : secondaryButton}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
          <button
            type="button"
            onClick={() => selectDevice("desktop")}
            aria-pressed={strategy === "desktop"}
            className={strategy === "desktop" ? primaryButton : secondaryButton}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
        </div>
        <button
          type="button"
          onClick={handleCheck}
          disabled={anyLoading || !url.trim()}
          className={`${primaryButton} min-h-12 shrink-0`}
        >
          {anyLoading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
          {anyLoading ? "Checking devices…" : "Check Core Web Vitals"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
        <span>
          One check prepares mobile and desktop together. Switch devices at any
          time. A fresh check may take up to a minute.
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setUrl(SAMPLE_URL);
              setShowSample(true);
              setValidationError("");
            }}
            className={secondaryButton}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#4058D0]" />
            Load sample report
          </button>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setShowSample(false);
              setValidationError("");
            }}
            className={secondaryButton}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>
      {(loading || otherLoading) && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="status"
          aria-live="polite"
        >
          {(["mobile", "desktop"] as Strategy[]).map((device) => {
            const key = device === "mobile" ? mobileKey : desktopKey;
            const ready = device === "mobile" ? liveMobile : liveDesktop;
            return (
              <span
                key={device}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-200"
              >
                {pending[key] ? (
                  <Loader2
                    aria-hidden
                    className="animate-spin motion-reduce:animate-none h-3 w-3"
                  />
                ) : null}
                {device === "mobile" ? "Mobile" : "Desktop"}:{" "}
                {ready
                  ? "Ready"
                  : pending[key]
                    ? "Checking"
                    : errors[key]
                      ? "Retry needed"
                      : "Waiting"}
              </span>
            );
          })}
        </div>
      )}
      {loading && (
        <div
          className="relative mt-6 min-h-[340px] overflow-hidden rounded-2xl border border-blue-200 bg-slate-50 dark:border-blue-900 dark:bg-slate-950"
          aria-busy="true"
        >
          <div
            aria-hidden
            className="grid grid-cols-3 gap-3 p-5 opacity-40 blur-sm"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse motion-reduce:animate-none h-24 rounded-xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/65 p-5 text-center backdrop-blur-sm dark:bg-slate-950/65"
          >
            <div className="rounded-full border-4 border-blue-100 p-4 dark:border-blue-950">
              <Loader2
                aria-hidden
                className="animate-spin motion-reduce:animate-none h-10 w-10 text-[#4058D0]"
              />
            </div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Measuring {strategy} performance
            </h2>
            <p className="max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
              Your page is being loaded under simulated device conditions. Both
              device reports are being prepared.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can switch devices while the checks continue.
            </p>
          </div>
        </div>
      )}
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
            className="mt-3 inline-flex rounded-xl bg-[#4058D0] px-4 py-3 text-sm font-bold text-white"
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
        <div
          className="mt-8 space-y-6"
          aria-live="polite"
          data-report-device={result.strategy}
        >
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
              {result.analysisAt && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lab run: {new Date(result.analysisAt).toLocaleString()}.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={downloadReport}
              className={secondaryButton}
            >
              Download summary
            </button>
          </div>
          {otherLoading && (
            <p
              role="status"
              className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200"
            >
              This report is ready. The other device is still being measured in
              the background.
            </p>
          )}
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
            loading={otherLoading}
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
                className={`rounded-2xl border p-4 text-center ${RATING_STYLE[scoreRating(category.score)].panelClass}`}
              >
                <p
                  className={`text-3xl font-black ${RATING_STYLE[scoreRating(category.score)].valueClass}`}
                >
                  {category.score ?? "N/A"}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {category.name}
                </p>
                <p
                  className={`mt-2 text-xs font-bold ${RATING_STYLE[scoreRating(category.score)].valueClass}`}
                >
                  {RATING_STYLE[scoreRating(category.score)].label}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4058D0] dark:text-blue-300">
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
                Google has not supplied enough real-user data for this page or
                origin. This does not by itself indicate a website error. The
                lab measurements remain available.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4058D0] dark:text-blue-300">
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
