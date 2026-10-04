"use client";

import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  RotateCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  LENS_CONFIG,
  LENS_ORDER,
} from "@/features/meta-title-generator/config";
import { evaluateTitle } from "@/features/meta-title-generator/evaluator";
import type {
  MetaTitleApiResponse,
  MetaTitleInput,
} from "@/features/meta-title-generator/schema";
import type { EvaluatedCandidate } from "@/features/meta-title-generator/types";
import SerpSimulator from "./SerpSimulator";
import TitleCard from "./TitleCard";
import TopRecommendations from "./TopRecommendations";

type Props = {
  data: MetaTitleApiResponse;
  input: MetaTitleInput;
  onRegenerate: () => void;
};

export default function MetaTitleResults({ data, input, onRegenerate }: Props) {
  const evaluated = useMemo<EvaluatedCandidate[]>(() => {
    return data.result.groups.flatMap((group) =>
      group.candidates.map((candidate, index) => ({
        ...candidate,
        key: `${group.lens}-${index}-${candidate.title}`,
        lens: group.lens,
        evaluation: evaluateTitle(candidate.title, input, group.lens),
      })),
    );
  }, [data, input]);

  const recommendations = useMemo(() => {
    const ranked = [...evaluated].sort(
      (a, b) => b.evaluation.overallScore - a.evaluation.overallScore,
    );
    const shortlist: EvaluatedCandidate[] = [];
    const bestUnified = ranked.find(
      (candidate) => candidate.lens === "unified",
    );
    if (bestUnified) shortlist.push(bestUnified);

    for (const candidate of ranked) {
      if (shortlist.length === 3) break;
      if (
        !shortlist.some((item) => item.key === candidate.key) &&
        !shortlist.some((item) => item.lens === candidate.lens)
      ) {
        shortlist.push(candidate);
      }
    }

    for (const candidate of ranked) {
      if (shortlist.length === 3) break;
      if (!shortlist.some((item) => item.key === candidate.key)) {
        shortlist.push(candidate);
      }
    }

    return shortlist;
  }, [evaluated]);
  const [selectedKey, setSelectedKey] = useState(recommendations[0]?.key || "");
  const selected =
    evaluated.find((candidate) => candidate.key === selectedKey) ||
    recommendations[0];
  const [editedTitle, setEditedTitle] = useState(selected?.title || "");

  function selectCandidate(candidate: EvaluatedCandidate) {
    setSelectedKey(candidate.key);
    setEditedTitle(candidate.title);
    window.setTimeout(
      () =>
        document
          .getElementById("serp-lab")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  }

  return (
    <div className="mt-14 space-y-14" id="generator-results" aria-live="polite">
      <p className="text-sm text-slate-600 dark:text-slate-300">Scores are local editorial heuristics. They do not measure Google rankings, clicks, or AI citation probability. Pixel previews are estimates.</p>
      <section className="overflow-hidden rounded-[28px] border border-[#5271ff]/20 bg-gradient-to-br from-[#5271ff]/10 via-white to-cyan-50 p-5 dark:via-slate-900 dark:to-slate-900 sm:p-7 lg:p-9">
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5271ff] text-white shadow-lg shadow-[#5271ff]/25">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
              Your editorial analysis
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {data.result.analysis.recommendedDirection}
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {data.result.analysis.assistantMessage}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Intent", data.result.analysis.intent],
                ["Page promise", data.result.analysis.pagePromise],
                ["Differentiator", data.result.analysis.differentiator],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/80 bg-white/70 p-3.5 dark:border-slate-700 dark:bg-slate-950/60"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#5271ff]/25 bg-white px-3.5 py-2.5 text-xs font-extrabold text-[#5271ff] transition hover:bg-[#5271ff] hover:text-white dark:bg-slate-900"
          >
            <RotateCw className="h-3.5 w-3.5" /> Regenerate
          </button>
        </div>
      </section>

      <TopRecommendations
        recommendations={recommendations}
        onSelect={selectCandidate}
      />

      <div id="serp-lab" className="scroll-mt-28">
        <SerpSimulator
          title={editedTitle}
          input={input}
          lens={selected?.lens}
          onTitleChange={setEditedTitle}
        />
      </div>

      <section className="space-y-10" aria-labelledby="all-title-options">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5271ff]">
            <BrainCircuit className="h-4 w-4" /> Tri-lens options
          </div>
          <h2
            id="all-title-options"
            className="text-3xl font-black tracking-tight text-slate-950 dark:text-white"
          >
            Compare how each audience changes the title
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Each category begins with its strategy, then provides five distinct
            options with live measurements and an honest rationale.
          </p>
        </div>

        {LENS_ORDER.map((lensKey) => {
          const group = data.result.groups.find(
            (item) => item.lens === lensKey,
          );
          if (!group) return null;
          const lens = LENS_CONFIG[lensKey];
          const groupCandidates = evaluated.filter(
            (candidate) => candidate.lens === lensKey,
          );

          return (
            <div
              key={lensKey}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/30"
            >
              <div className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: lens.accent }}
                      />
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
                        style={{ color: lens.accent }}
                      >
                        {lens.eyebrow}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                      {group.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {group.explanation}
                    </p>
                  </div>
                  <div className="flex max-w-sm flex-wrap gap-2">
                    {group.focuses.map((focus) => (
                      <span
                        key={focus}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-6">
                {groupCandidates.map((candidate) => (
                  <TitleCard
                    key={candidate.key}
                    candidate={candidate}
                    groupLens={lensKey}
                    selected={candidate.key === selectedKey}
                    onSelect={selectCandidate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5271ff]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Final human review notes</h2>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {data.result.editorNotes.map((note) => (
                <div
                  key={note}
                  className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
