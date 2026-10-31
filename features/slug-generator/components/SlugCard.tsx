"use client";

import { ArrowUpRight, Link2 } from "lucide-react";
import CopyButton from "@/components/ai-tools/CopyButton";
import ScoreRing from "@/components/ai-tools/ScoreRing";
import { SLUG_GROUPS } from "@/features/slug-generator/config";
import { buildFullUrl } from "@/features/slug-generator/evaluator";
import type { SlugInput } from "@/features/slug-generator/schema";
import type { EvaluatedSlugCandidate } from "@/features/slug-generator/types";

type Props = {
  candidate: EvaluatedSlugCandidate;
  input: SlugInput;
  selected: boolean;
  onSelect: () => void;
  featured?: boolean;
};

export default function SlugCard({
  candidate,
  input,
  selected,
  onSelect,
  featured = false,
}: Props) {
  const group = SLUG_GROUPS[candidate.group];
  const fullUrl = buildFullUrl(input.baseUrl, candidate.slug);

  return (
    <article
      className={`rounded-3xl border bg-white transition dark:bg-slate-900 ${
        selected
          ? "border-[#5271ff] shadow-lg shadow-[#5271ff]/10"
          : "border-slate-200 hover:border-[#5271ff]/35 dark:border-slate-800"
      } ${featured ? "p-6 sm:p-7" : "p-5"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{
                backgroundColor: `${group.accent}16`,
                color: group.accent,
              }}
            >
              {group.eyebrow}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {candidate.angle}
            </span>
          </div>
          <p
            className={`mt-4 break-all font-black tracking-tight text-slate-950 dark:text-white ${
              featured ? "text-2xl sm:text-3xl" : "text-xl"
            }`}
          >
            /{candidate.slug}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-slate-400">
            {fullUrl}
          </p>
        </div>
        <ScoreRing
          score={candidate.evaluation.score}
          size={featured ? "md" : "sm"}
          label="Slug quality score"
        />
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {candidate.rationale}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/25">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-emerald-700 dark:text-emerald-300">
            Best for
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-900 dark:text-emerald-100">
            {candidate.bestFor}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/25">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-amber-700 dark:text-amber-300">
            Trade-off
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900 dark:text-amber-100">
            {candidate.tradeoff}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{candidate.evaluation.words} words</span>
          <span>{candidate.evaluation.characters} characters</span>
        </div>
        <div className="flex gap-2">
          <CopyButton value={candidate.slug} label="Copy slug" />
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-[#5271ff] dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100"
          >
            <Link2 className="h-3.5 w-3.5" />
            {selected ? "In URL lab" : "Open in lab"}
            {!selected && <ArrowUpRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
