"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { checkCoreWebVitals } from "../core-web-vitals/client";
import type { PageSpeedResult, Strategy } from "../core-web-vitals/types";
import styles from "../content-evidence/evidence.module.css";
const ratingColor = (value: string) =>
  value === "good"
    ? "text-emerald-700 dark:text-emerald-300"
    : value === "poor"
      ? "text-rose-700 dark:text-rose-300"
      : value === "needs-improvement"
        ? "text-amber-800 dark:text-amber-300"
        : "text-slate-500 dark:text-slate-400";
export default function PerformancePanel({
  url,
  edited,
  onResult,
}: {
  url: string;
  edited: boolean;
  onResult?: (result: PageSpeedResult) => void;
}) {
  const [strategy, setStrategy] = useState<Strategy>("mobile"),
    [results, setResults] = useState<
      Partial<Record<Strategy, PageSpeedResult>>
    >({});
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function run() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    const outcome = await checkCoreWebVitals(url, strategy, controller.signal);
    if (controller.signal.aborted) return;
    setBusy(false);
    if (outcome.ok === false) {
      setError(outcome.message);
      return;
    }
    setResults((old) => ({ ...old, [strategy]: outcome.result }));
    onResult?.(outcome.result);
  }
  const result = results[strategy],
    score = result?.categories.find((c) => c.id === "performance")?.score;
  return (
    <section aria-label="Optional published-page performance">
      <h3 className="text-xl font-bold">Published-page performance</h3>
      <p className={styles.small}>
        Performance supports page experience. These measurements do not
        establish whether an AI service will cite the page.
      </p>
      {edited && (
        <p className={styles.warning}>
          This test checks the published URL, not your local article edits.
        </p>
      )}
      {!url ? (
        <p className={styles.warning}>
          A published URL is required. Draft text has no measurable live loading
          performance.
        </p>
      ) : (
        <>
          <div className={`${styles.actions} mt-5`}>
            {(["mobile", "desktop"] as const).map((device) => (
              <button
                type="button"
                key={device}
                className={
                  strategy === device ? styles.primary : styles.secondary
                }
                aria-pressed={strategy === device}
                onClick={() => {
                  request.current?.abort();
                  setBusy(false);
                  setError("");
                  setStrategy(device);
                }}
              >
                {device === "mobile" ? "Mobile" : "Desktop"}
              </button>
            ))}
            <button
              type="button"
              className={styles.primary}
              disabled={busy}
              onClick={run}
            >
              {busy && <Loader2 size={16} className={styles.spinner} />}
              {busy
                ? "Measuring published page…"
                : result
                  ? "Run again"
                  : "Run performance check"}
            </button>
            {busy && (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  request.current?.abort();
                  setBusy(false);
                }}
              >
                Cancel performance check
              </button>
            )}
          </div>
          {busy && (
            <p role="status" className={styles.notice}>
              Running the selected device test. Your article report remains
              available.
            </p>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {result && (
            <>
              <div className={styles.stats}>
                <div>
                  <strong
                    className={
                      score == null
                        ? ""
                        : score >= 90
                          ? "!text-emerald-700 dark:!text-emerald-300"
                          : score >= 50
                            ? "!text-amber-800 dark:!text-amber-300"
                            : "!text-rose-700 dark:!text-rose-300"
                    }
                  >
                    {score ?? "Not measured"}
                  </strong>
                  <span>Performance score, not a citation score</span>
                </div>
                <div>
                  <strong>
                    {result.strategy === "mobile" ? "Mobile" : "Desktop"}
                  </strong>
                  <span>Measured device</span>
                </div>
              </div>
              <p className={`${styles.small} break-all`}>
                Measured URL: {result.finalUrl}.{" "}
                {result.analysisAt || result.checkedAt || ""}
              </p>
              <h4 className="mt-5 font-bold">Real-user field data</h4>
              <p className={styles.small}>
                {result.fieldData.source === "origin"
                  ? "Origin-level data, covering the website rather than this specific page."
                  : result.fieldData.source === "page"
                    ? "Page-level data for this URL."
                    : "No field-data scope was returned."}
              </p>
              {result.fieldData.metrics.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {result.fieldData.metrics.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <strong>{m.label}</strong>
                      <p className={ratingColor(m.rating)}>
                        {m.displayValue} · {m.rating}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.small}>
                  No eligible field data was returned. This is unavailable
                  evidence, not a failed measurement.
                </p>
              )}
              <h4 className="mt-5 font-bold">Lab measurements</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.labMetrics.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <strong>{m.label}</strong>
                    <p className={ratingColor(m.rating)}>
                      {m.displayValue} · {m.rating}
                    </p>
                  </div>
                ))}
              </div>
              {result.reportWarnings?.map((warning, i) => (
                <p key={i} className={styles.warning}>
                  {warning}
                </p>
              ))}
            </>
          )}
        </>
      )}
      <Link
        href="/tools/core-web-vitals-checker"
        className="mt-5 inline-flex font-semibold text-[#4058d0] underline dark:text-blue-200"
      >
        Open Core Web Vitals Checker for the detailed report
      </Link>
    </section>
  );
}
