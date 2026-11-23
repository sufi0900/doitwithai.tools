"use client";
import React, { useId } from "react";
import type { AudienceReport } from "./schema";

type Props = {
  profile: AudienceReport["segments"][number]["proposedProfile"];
  decisions: Record<string, string>;
  segmentIndex: number;
  onDecision: (key: string, value: string) => void;
};

export default function ProposedProfile({
  profile,
  decisions,
  segmentIndex,
  onDecision,
}: Props) {
  const id = useId();
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-[#5271FF]/35 bg-[#5271FF]/5 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 id={`${id}-heading`} className="text-lg font-bold">
          Proposed audience sweet spot
        </h4>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          Assumptions to test
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        Use these starting assumptions to plan a small test. They do not
        describe measured visitors, confirmed buyers, or a statistically optimal
        audience.
      </p>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        {profile.map((item, index) => {
          const key = `profile-${segmentIndex}-${item.topic}`;
          return (
            <article
              key={item.topic}
              aria-labelledby={`${id}-${index}`}
              className="min-w-0 break-words rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <h5
                id={`${id}-${index}`}
                className="text-sm font-bold text-slate-600 dark:text-slate-300"
              >
                {item.topic}
              </h5>
              <p className="mt-2 text-base font-semibold leading-7 text-blue-800 dark:text-blue-200">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-7">
                <strong>Why test this:</strong> {item.reason}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <strong>Validate:</strong> {item.test}
              </p>
              {item.evidence.length > 0 && (
                <details className="mt-3 text-sm leading-7">
                  <summary className="cursor-pointer font-semibold">
                    Supporting context
                  </summary>
                  {item.evidence.map((e, i) => (
                    <blockquote
                      key={i}
                      className="mt-2 border-l-2 border-[#5271FF] pl-3"
                    >
                      {e.source}: “{e.quote}”
                    </blockquote>
                  ))}
                  <p className="mt-2 text-xs leading-6">
                    This context explains the suggestion. It does not establish
                    the actual audience distribution.
                  </p>
                </details>
              )}
              <label className="mt-4 block text-xs font-semibold">
                Review {item.topic.toLowerCase()}
                <select
                  value={decisions[key] || "Not reviewed"}
                  onChange={(e) => onDecision(key, e.target.value)}
                  className="mt-2 min-h-11 w-full max-w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                >
                  {[
                    "Not reviewed",
                    "Use for initial test",
                    "Revise before testing",
                    "Not relevant",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
        Budget ranges are spending scenarios. Financial fit concerns purchase
        constraints, not bank balances or personal wealth.
      </p>
    </section>
  );
}
