"use client";

import { ArrowUpRight, Check, Monitor, Smartphone } from "lucide-react";
import CopyButton from "@/components/ai-tools/CopyButton";
import ScoreRing from "@/components/ai-tools/ScoreRing";
import {
  LENS_CONFIG,
  type MetaTitleLens,
} from "@/features/meta-title-generator/config";
import type { EvaluatedCandidate } from "@/features/meta-title-generator/types";

type Props = {
  candidate: EvaluatedCandidate;
  groupLens: MetaTitleLens;
  selected: boolean;
  onSelect: (candidate: EvaluatedCandidate) => void;
};

export default function TitleCard({
  candidate,
  groupLens,
  selected,
  onSelect,
}: Props) {
  const lens = LENS_CONFIG[groupLens];
  const score = candidate.evaluation.scores[groupLens];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 transition dark:bg-slate-900 sm:p-5 ${
        selected
          ? "border-[#5271ff] shadow-[0_16px_40px_-28px_rgba(82,113,255,0.9)] ring-2 ring-[#5271ff]/10"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700"
      }`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: lens.accent }}
      />
      <div className="flex items-start gap-4">
        <ScoreRing score={score} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {candidate.angle}
            </span>
            {selected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5271ff]">
                <Check className="h-3.5 w-3.5" /> In preview
              </span>
            )}
          </div>
          <h4 className="mt-3 text-lg font-extrabold leading-snug tracking-tight text-slate-950 dark:text-white">
            {candidate.title}
          </h4>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{candidate.evaluation.characters} characters</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{candidate.evaluation.pixels}px estimated</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span
              className={`inline-flex items-center gap-1 ${candidate.evaluation.mobileSafe ? "text-emerald-600" : "text-amber-600"}`}
            >
              <Smartphone className="h-3 w-3" />
              {candidate.evaluation.mobileSafe ? "Mobile-safe" : "Check mobile"}
            </span>
            <span
              className={`inline-flex items-center gap-1 ${candidate.evaluation.desktopSafe ? "text-emerald-600" : "text-red-600"}`}
            >
              <Monitor className="h-3 w-3" />
              {candidate.evaluation.desktopSafe ? "Desktop-safe" : "Too wide"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {candidate.rationale}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelect(candidate)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-[#5271ff] dark:bg-white dark:text-slate-950 dark:hover:bg-[#5271ff] dark:hover:text-white"
            >
              Preview <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <CopyButton value={candidate.title} />
          </div>
        </div>
      </div>
    </article>
  );
}
