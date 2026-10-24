import React from "react";
import Link from "next/link";
import { ArrowRight, Copy, Download, Search } from "lucide-react";
import type { IntentReport } from "./schema";
import { intentPresentation, reportBasis } from "./presentation";
const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300";
export default function IntentResults({
  report,
  onCopy,
  onDownload,
}: {
  report: IntentReport;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-white">Your intent results</h3>
        <span className="text-sm text-slate-300">
          {report.items.length}{" "}
          {report.items.length === 1 ? "keyword" : "keywords"}
        </span>
      </div>
      <div className="space-y-5">
        {report.items.map((item) => {
          const tone = intentPresentation[item.primary];
          return (
            <article
              key={item.index}
              aria-labelledby={`intent-query-${item.index}`}
              className={`min-w-0 rounded-2xl border border-t-4 border-white/15 bg-slate-950/70 p-5 shadow-lg sm:p-6 ${tone.border}`}
            >
              <h4
                id={`intent-query-${item.index}`}
                className="break-words text-base font-semibold leading-7 text-slate-200"
              >
                {item.keyword}
              </h4>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Likely intent
              </p>
              <p
                data-intent={item.primary}
                className={`mt-2 inline-flex max-w-full break-words rounded-xl border px-4 py-3 text-xl font-extrabold leading-7 sm:text-2xl ${tone.classes}`}
              >
                {item.primary}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {tone.meaning}
              </p>
              {item.secondary && (
                <p
                  className={`mt-3 w-fit max-w-full break-words rounded-lg border px-3 py-2 text-xs leading-6 ${intentPresentation[item.secondary].classes}`}
                >
                  Possible secondary intent: <strong>{item.secondary}</strong>
                </p>
              )}
              <dl className="mt-5 space-y-5 border-t border-white/10 pt-5">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-blue-200">
                    What the reader wants
                  </dt>
                  <dd className="mt-2 break-words text-base leading-7 text-white">
                    {item.task}
                  </dd>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Suggested page format
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold leading-7 text-white">
                    {item.format}
                  </dd>
                </div>
              </dl>
              <details className="mt-4 border-t border-white/10 pt-4">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">
                  Why this intent? See cues and writing advice
                </summary>
                <div className="mt-3">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Supporting cues
                  </h5>
                  {item.evidence.length ? (
                    <ul className="mt-2 space-y-2">
                      {item.evidence.map((cue, index) => (
                        <li
                          key={index}
                          className="break-words text-sm leading-7 text-slate-200"
                        >
                          {cue.source}:{" "}
                          <q className="font-semibold text-white">
                            {cue.quote}
                          </q>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      No explicit wording cue. Inspect current results before
                      choosing a page format.
                    </p>
                  )}
                  <dl className="mt-4 space-y-4">
                    {[
                      ["Content angle", item.angle],
                      ["Appropriate next step", item.nextStep],
                      ["What to verify", item.uncertainty],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {label}
                        </dt>
                        <dd className="mt-1 break-words text-sm leading-7 text-slate-200">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </details>
            </article>
          );
        })}
      </div>
      <div className="mt-5 text-xs leading-6 text-slate-400">
        <p>{reportBasis(report)}. Confirm against current search results.</p>
        <details className="mt-2">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-slate-300">
            How to interpret these results
          </summary>
          <p className="mt-2">{report.notice}</p>
          {(report.audience || report.market) && (
            <p className="mt-2 break-words">
              Supplied context:{" "}
              {[report.audience, report.market].filter(Boolean).join(" · ")}
            </p>
          )}
          {report.method === "Rule-based estimate" && (
            <p className="mt-2">
              This quick check uses English keyword cues. Add an AI review to
              interpret your audience, market, and pasted notes.
            </p>
          )}
        </details>
      </div>
      <section
        aria-label="Save or use your results"
        className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      >
        <h4 className="text-sm font-bold text-white">Keep your results</h4>
        <p className="mt-1 text-xs leading-6 text-slate-400">
          Copy the full interpretation or download a spreadsheet file.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className={action}>
            <Copy aria-hidden className="h-4 w-4" />
            Copy results
          </button>
          <button type="button" onClick={onDownload} className={action}>
            <Download aria-hidden className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </section>
      <Link
        href="/tools/article-outline-generator"
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold leading-6 text-blue-200 underline"
      >
        Open Article Outline Generator
        <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
      </Link>
      <a
        href="#intent-keywords"
        className="mt-2 flex min-h-11 w-fit items-center gap-2 text-sm text-slate-300 underline"
      >
        <Search aria-hidden className="h-4 w-4" />
        Check another keyword
      </a>
    </>
  );
}
