import React from "react";
import Link from "next/link";
import { ArrowRight, Copy, Download, Search } from "lucide-react";
import { intents, type IntentReport } from "./schema";
import { intentPresentation, reportBasis } from "./presentation";

const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-400/50 hover:bg-blue-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300";

function detectSpecialQueryBadge(keyword: string): {
  label: string;
  classes: string;
} | null {
  const lower = keyword.toLowerCase();
  if (
    /\b(?:near me|nearby|in my area|local|agencies|agency|consultant|consultants|company|companies|services|clinic|firm|contractor)\b/i.test(
      lower,
    )
  ) {
    return {
      label: "📍 Local Map Pack & Service Provider Intent",
      classes:
        "border-teal-400/45 bg-teal-500/15 text-teal-200",
    };
  }
  if (
    /\b(?:tool|tools|generator|checker|analyzer|calculator|grouper|builder|auditor|studio|free online)\b/i.test(
      lower,
    )
  ) {
    return {
      label: "⚡ Interactive Tool / Utility Intent",
      classes:
        "border-indigo-400/45 bg-indigo-500/15 text-indigo-200",
    };
  }
  return null;
}

export default function IntentResults({
  report,
  onCopy,
  onDownload,
}: {
  report: IntentReport;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const counts = intents.map((intent) => ({
    intent,
    count: report.items.filter((i) => i.primary === intent).length,
    tone: intentPresentation[intent],
  }));

  return (
    <div className="space-y-6">
      {/* Top Dashboard Summary & Action Toolbar */}
      <section
        aria-label="Result controls"
        className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full border border-blue-400/35 bg-blue-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-300">
                {reportBasis(report)}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {report.items.length}{" "}
                {report.items.length === 1
                  ? "keyword reviewed"
                  : "keywords reviewed"}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-black text-white">
              Search Intent &amp; SERP Page Format Breakdown
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={onCopy} className={action}>
              <Copy aria-hidden className="h-4 w-4 text-blue-300" />
              Copy results
            </button>
            <button type="button" onClick={onDownload} className={action}>
              <Download aria-hidden className="h-4 w-4 text-emerald-300" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Color-Coded Intent Distribution Strip */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {counts.map(({ intent, count, tone }) => (
            <div
              key={intent}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                count > 0
                  ? tone.classes
                  : "border-white/10 bg-slate-950/60 text-slate-500"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.badgeDot}`} />
              <span>{intent}:</span>
              <span className="rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-xs">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive Keyword Intent Cards Grid */}
      <div
        className={`grid gap-6 ${
          report.items.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {report.items.map((item) => {
          const tone = intentPresentation[item.primary];
          const specialBadge = detectSpecialQueryBadge(item.keyword);
          return (
            <article
              key={item.index}
              aria-labelledby={`intent-query-${item.index}`}
              className={`min-w-0 flex flex-col justify-between rounded-2xl border border-t-4 border-white/15 bg-gradient-to-b ${tone.cardBg} p-5 sm:p-6 shadow-xl transition hover:border-white/25 ${tone.border}`}
            >
              <div>
                {/* Card Header: Keyword + Index Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Keyword #{String(item.index + 1).padStart(2, "0")}
                    </span>
                    <h4
                      id={`intent-query-${item.index}`}
                      className="mt-1 break-words text-lg sm:text-xl font-black leading-snug text-white"
                    >
                      {item.keyword}
                    </h4>
                  </div>
                </div>

                {/* Prominent Color-Coded Primary & Secondary Intent Badges */}
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Likely intent
                    </p>
                    <span className="text-[11px] font-medium text-slate-400">
                      {tone.serpFeature}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <p
                      data-intent={item.primary}
                      className={`inline-flex items-center gap-2 max-w-full break-words rounded-xl border px-3.5 py-1.5 text-sm font-black leading-6 ${tone.classes}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.badgeDot}`}
                      />
                      {item.primary}
                    </p>

                    {specialBadge && (
                      <span
                        className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-bold ${specialBadge.classes}`}
                      >
                        {specialBadge.label}
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm leading-6 text-slate-300">
                    {tone.meaning}
                  </p>

                  {item.secondary && (
                    <p
                      className={`mt-3 w-fit max-w-full break-words rounded-lg border px-3 py-1.5 text-xs leading-6 ${intentPresentation[item.secondary].classes}`}
                    >
                      Possible secondary intent: <strong>{item.secondary}</strong>
                    </p>
                  )}
                </div>

                {/* Core Actionable Insights: Reader Task & Suggested Page Format */}
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-blue-300">
                      What the reader wants
                    </dt>
                    <dd className="mt-2 break-words text-sm leading-6 text-white">
                      {item.task}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-blue-500/25 bg-blue-950/25 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-emerald-300">
                      Suggested page format
                    </dt>
                    <dd className="mt-2 break-words text-sm font-bold leading-6 text-white">
                      {item.format}
                    </dd>
                  </div>
                </dl>

                {/* Visible Content Angle Summary */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Content Angle &amp; Structure
                  </div>
                  <p className="mt-1 text-xs sm:text-sm leading-6 text-slate-200">
                    {item.angle}
                  </p>
                </div>
              </div>

              {/* Expandable Supporting Cues & Verification Details */}
              <div className="mt-4 border-t border-white/10 pt-3">
                <details className="group">
                  <summary className="min-h-10 cursor-pointer py-1.5 text-xs sm:text-sm font-bold text-blue-300 hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">
                    Why this intent? See cues and writing advice
                  </summary>
                  <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/80 p-4 space-y-3">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Supporting cues
                      </h5>
                      {item.evidence.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {item.evidence.map((cue, index) => (
                            <li
                              key={index}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-xs leading-6 text-slate-200"
                            >
                              <span>{cue.source}:</span>
                              <q className="font-bold text-white">
                                {cue.quote}
                              </q>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-xs leading-6 text-slate-300">
                          No explicit wording cue. Inspect current results
                          before choosing a page format.
                        </p>
                      )}
                    </div>
                    <dl className="space-y-3 border-t border-white/10 pt-3">
                      {[
                        ["Content angle", item.angle],
                        ["Appropriate next step", item.nextStep],
                        ["What to verify", item.uncertainty],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {label}
                          </dt>
                          <dd className="mt-1 break-words text-xs sm:text-sm leading-6 text-slate-200">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </details>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Interpretation Notice & Connected SEO Workflow Links */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-xs leading-6 text-slate-400">
        <p>{reportBasis(report)}. Confirm against current search results.</p>
        <details open className="mt-2">
          <summary className="min-h-10 cursor-pointer py-1.5 font-semibold text-slate-300">
            How to interpret these results
          </summary>
          <p className="mt-1">{report.notice}</p>
          {(report.audience || report.market) && (
            <p className="mt-1 break-words">
              Supplied context:{" "}
              {[report.audience, report.market].filter(Boolean).join(" · ")}
            </p>
          )}
          {report.method === "Rule-based estimate" && (
            <p className="mt-1">
              This quick check uses English keyword cues. Add an AI review to
              interpret your audience, market, and pasted notes.
            </p>
          )}
        </details>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
          <Link
            href="/tools/article-outline-generator"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-sm font-bold leading-6 text-blue-200 hover:bg-blue-500/25"
          >
            Open Article Outline Generator
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
          </Link>
          <Link
            href="/tools/keyword-clustering-tool"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-sm font-bold leading-6 text-emerald-200 hover:bg-emerald-500/25"
          >
            Group Keywords Into Clusters
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
          </Link>
          <a
            href="#intent-keywords"
            className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-slate-300 underline hover:text-white"
          >
            <Search aria-hidden className="h-4 w-4" />
            Check another keyword
          </a>
        </div>
      </div>
    </div>
  );
}
