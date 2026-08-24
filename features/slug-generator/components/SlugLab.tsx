"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  PencilLine,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ai-tools/CopyButton";
import ScoreRing from "@/components/ai-tools/ScoreRing";
import {
  buildFullUrl,
  canonicalizeSlug,
  evaluateSlug,
} from "@/features/slug-generator/evaluator";
import type { SlugInput } from "@/features/slug-generator/schema";
import type { EvaluatedSlugCandidate } from "@/features/slug-generator/types";

type Props = {
  candidate: EvaluatedSlugCandidate;
  input: SlugInput;
};

const statusStyles = {
  pass: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200",
  },
  warn: {
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200",
  },
  fail: {
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-200",
  },
};

export default function SlugLab({ candidate, input }: Props) {
  const [value, setValue] = useState(candidate.slug);

  useEffect(() => setValue(candidate.slug), [candidate.slug]);

  const evaluation = useMemo(() => evaluateSlug(value, input), [value, input]);
  const fullUrl = buildFullUrl(input.baseUrl, value);

  return (
    <section
      className="mt-10 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="slug-quality-lab"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-[#4662df]">
                <PencilLine className="h-3.5 w-3.5" /> Live URL lab
              </div>
              <h2
                id="slug-quality-lab"
                className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
              >
                Refine the permanent page label
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Edit the selected option. Formatting and quality checks update
                locally without another AI request.
              </p>
            </div>
            <ScoreRing score={evaluation.score} label="Slug quality score" />
          </div>

          <label
            htmlFor="liveSlug"
            className="mt-7 block text-sm font-bold text-slate-800 dark:text-slate-100"
          >
            Final slug
          </label>
          <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#5271ff] focus-within:ring-4 focus-within:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950">
            <span className="text-slate-400">/</span>
            <input
              id="liveSlug"
              value={value}
              onChange={(event) =>
                setValue(canonicalizeSlug(event.target.value))
              }
              className="min-w-0 flex-1 bg-transparent px-1 py-3.5 text-sm font-bold text-slate-950 outline-none dark:text-white"
              aria-describedby="slug-format-hint"
            />
          </div>
          <p
            id="slug-format-hint"
            className="mt-2 text-xs text-slate-500 dark:text-slate-400"
          >
            Lowercase and hyphen formatting is applied automatically.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Link2 className="h-3.5 w-3.5" /> URL preview
            </div>
            <p className="mt-3 break-all text-sm font-semibold text-slate-700 dark:text-slate-200">
              {fullUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton value={value} label="Copy slug" />
              <CopyButton value={fullUrl} label="Copy full URL" />
            </div>
          </div>

          {input.currentSlug && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/25">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-extrabold text-amber-900 dark:text-amber-100">
                    Existing URL safeguard
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
                    The supplied slug is{" "}
                    {Math.round(evaluation.currentSimilarity * 100)}% similar by
                    word set. If it is already published, do not replace it
                    without a permanent redirect, internal-link, canonical, and
                    sitemap update plan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60 sm:p-7 lg:border-l lg:border-t-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Deterministic review
          </p>
          <div className="mt-5 space-y-3">
            {evaluation.checks.map((check) => {
              const style = statusStyles[check.status];
              const Icon = style.icon;
              return (
                <div
                  key={check.id}
                  className={`rounded-xl border p-3 ${style.className}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-extrabold">{check.label}</p>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 opacity-90">
                    {check.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
