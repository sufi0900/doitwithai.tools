"use client";

import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Scissors,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  SLUG_GROUPS,
  type SlugGroupId,
} from "@/features/slug-generator/config";
import { evaluateSlug } from "@/features/slug-generator/evaluator";
import type {
  SlugApiResponse,
  SlugCandidate,
  SlugInput,
} from "@/features/slug-generator/schema";
import type { EvaluatedSlugCandidate } from "@/features/slug-generator/types";
import SlugCard from "./SlugCard";
import SlugLab from "./SlugLab";

type Props = {
  data: SlugApiResponse;
  input: SlugInput;
  onRegenerate: () => void;
};

function withEvaluation(
  candidate: SlugCandidate,
  group: SlugGroupId,
  input: SlugInput,
): EvaluatedSlugCandidate {
  return {
    ...candidate,
    group,
    evaluation: evaluateSlug(candidate.slug, input),
  };
}

export default function SlugResults({ data, input, onRegenerate }: Props) {
  const evaluated = useMemo(
    () => ({
      top: withEvaluation(data.result.topRecommendation, "balanced", input),
      concise: data.result.alternatives.concise.map((candidate) =>
        withEvaluation(candidate, "concise", input),
      ),
      keyword: data.result.alternatives.keywordAligned.map((candidate) =>
        withEvaluation(candidate, "keyword", input),
      ),
      intent: data.result.alternatives.intentLed.map((candidate) =>
        withEvaluation(candidate, "intent", input),
      ),
    }),
    [data, input],
  );

  const allCandidates = useMemo(
    () => [
      evaluated.top,
      ...evaluated.concise,
      ...evaluated.keyword,
      ...evaluated.intent,
    ],
    [evaluated],
  );
  const [selectedSlug, setSelectedSlug] = useState(evaluated.top.slug);
  const selected =
    allCandidates.find((candidate) => candidate.slug === selectedSlug) ||
    evaluated.top;

  const groups = [
    { id: "concise" as const, candidates: evaluated.concise },
    { id: "keyword" as const, candidates: evaluated.keyword },
    { id: "intent" as const, candidates: evaluated.intent },
  ];

  return (
    <div className="mt-12 rounded-[36px] bg-slate-100 p-4 text-slate-950 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Context-to-URL analysis complete
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight dark:text-white sm:text-4xl">
            Seven choices, one permanent decision
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Start with the recommendation, compare the three focused strategies,
            then validate your final edit in the URL lab.
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-[#5271ff]/40 hover:text-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RotateCcw className="h-4 w-4" /> Regenerate
        </button>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-7">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-300">
            <BrainCircuit className="h-4 w-4" /> What the tool understood
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {data.result.analysis.summary}
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Page type", data.result.analysis.pageType],
              ["Search intent", data.result.analysis.searchIntent],
              ["Core topic", data.result.analysis.coreTopic],
              ["Primary entity", data.result.analysis.primaryEntity],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/[0.07] p-3">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
              Stable concepts worth preserving
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.result.analysis.stableConcepts.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-blue-100"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
            <Scissors className="h-4 w-4" /> Compression decisions
          </div>
          <h3 className="mt-3 text-xl font-black dark:text-white">
            What did not earn permanent URL space
          </h3>
          <div className="mt-5 space-y-3">
            {data.result.analysis.detailsCompressed.map((item) => (
              <div
                key={`${item.detail}-${item.decision}`}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {item.detail}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  {item.decision}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-[#5271ff]/8 mt-5 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#5271ff]" />
              <p className="text-xs leading-5 text-slate-700 dark:text-slate-200">
                {data.result.analysis.recommendedDirection}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="recommended-slug">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5271ff] text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#5271ff]">
              Editorial recommendation
            </p>
            <h3
              id="recommended-slug"
              className="text-2xl font-black dark:text-white"
            >
              Best overall slug
            </h3>
          </div>
        </div>
        <SlugCard
          candidate={evaluated.top}
          input={input}
          selected={selected.slug === evaluated.top.slug}
          onSelect={() => setSelectedSlug(evaluated.top.slug)}
          featured
        />
      </section>

      <section className="mt-12" aria-labelledby="slug-alternatives">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
            Focused alternatives
          </p>
          <h3
            id="slug-alternatives"
            className="mt-2 text-2xl font-black dark:text-white sm:text-3xl"
          >
            Choose the trade-off that fits the page
          </h3>
        </div>

        <div className="mt-7 space-y-9">
          {groups.map(({ id, candidates }) => {
            const config = SLUG_GROUPS[id];
            return (
              <div key={id}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p
                      className="text-xs font-extrabold uppercase tracking-[0.15em]"
                      style={{ color: config.accent }}
                    >
                      {config.eyebrow}
                    </p>
                    <h4 className="mt-1 text-xl font-black dark:text-white">
                      {config.label}
                    </h4>
                  </div>
                  <p className="max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {config.description}
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {candidates.map((candidate) => (
                    <SlugCard
                      key={candidate.slug}
                      candidate={candidate}
                      input={input}
                      selected={selected.slug === candidate.slug}
                      onSelect={() => setSelectedSlug(candidate.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SlugLab candidate={selected} input={input} />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#5271ff]">
            <CheckCircle2 className="h-4 w-4" /> Before publishing
          </div>
          <ul className="mt-4 space-y-3">
            {data.result.editorNotes.map((note) => (
              <li
                key={note}
                className="flex gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5271ff]" />
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            <Clock3 className="h-4 w-4" /> Session details
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-600 dark:text-slate-300">
            Results remain in this page session and do not create indexable URL
            result pages. The visible counts and checks are calculated by the
            application, not estimated by the language model.
          </p>
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            Remaining requests in the current limit window:{" "}
            {data.meta.remaining}
          </p>
        </div>
      </section>
    </div>
  );
}
