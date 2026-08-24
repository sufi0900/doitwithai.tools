"use client";

import { Award, CheckCircle2, Scale, Sparkles } from "lucide-react";
import CopyButton from "@/components/ai-tools/CopyButton";
import ScoreRing from "@/components/ai-tools/ScoreRing";
import { LENS_CONFIG } from "@/features/meta-title-generator/config";
import type { EvaluatedCandidate } from "@/features/meta-title-generator/types";

type Props = {
  recommendations: EvaluatedCandidate[];
  onSelect: (candidate: EvaluatedCandidate) => void;
};

export default function TopRecommendations({
  recommendations,
  onSelect,
}: Props) {
  return (
    <section aria-labelledby="top-recommendations" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
            <Award className="h-4 w-4" /> Editorial shortlist
          </div>
          <h2
            id="top-recommendations"
            className="text-3xl font-black tracking-tight text-slate-950 dark:text-white"
          >
            Top three recommendations
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            These are ranked after generation using deterministic keyword,
            length, pixel, quality, and duplicate-risk checks.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {recommendations.map((candidate, index) => {
          const lens = LENS_CONFIG[candidate.lens];

          return (
            <article
              key={candidate.key}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                index === 0
                  ? "border-[#5271ff]/40 bg-gradient-to-b from-[#5271ff]/10 to-white ring-2 ring-[#5271ff]/10 dark:to-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                    {index + 1}
                  </span>
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-[0.13em]"
                    style={{ color: lens.accent }}
                  >
                    {index === 0 ? "Best overall" : lens.label}
                  </span>
                </div>
                <ScoreRing
                  score={candidate.evaluation.overallScore}
                  size="sm"
                />
              </div>

              <h3 className="mt-5 text-xl font-black leading-snug tracking-tight text-slate-950 dark:text-white">
                {candidate.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {candidate.rationale}
              </p>

              <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex gap-2">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Trade-off
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {candidate.tradeoff}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {candidate.evaluation.characters} chars ·{" "}
                {candidate.evaluation.pixels}px
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(candidate)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271ff] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4564ed]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Open in SERP lab
                </button>
                <CopyButton value={candidate.title} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
