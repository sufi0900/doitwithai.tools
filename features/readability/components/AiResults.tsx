"use client";
import { useEffect, useMemo, useRef } from "react";
import { Copy, Download, FileCheck2 } from "lucide-react";
import FlowReview from "../FlowReview";
import { preservationChecks } from "../analyzer";
import { analyzeDocument } from "../engine";
import type { Revisions } from "../hooks/useRevisions";
import { button, card, field } from "./styles";

type Props = {
  rev: Revisions;
  onCopy: (value: string) => void;
  /** Returns an error message when the passage can no longer be replaced. */
  onReplace: (snapshot: string, replacement: string) => string | null;
};

export default function AiResults({ rev, onCopy, onReplace }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { result, edits, selected, source, sourceTerms, generation } = rev;
  const revision = edits[selected] || "";

  useEffect(() => {
    if (!generation) return;
    ref.current?.focus();
    ref.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [generation]);

  const before = useMemo(() => analyzeDocument(source), [source]);
  const after = useMemo(() => analyzeDocument(revision), [revision]);
  const checks = useMemo(
    () => preservationChecks(source, revision, sourceTerms),
    [source, revision, sourceTerms],
  );

  if (!result) return null;

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label="Readability revisions"
      className="mt-8 scroll-mt-28 outline-none"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {result.candidates.map((c, i) => (
          <button
            key={c.approach}
            data-readability-option
            aria-pressed={i === selected}
            onClick={() => rev.setSelected(i)}
            className={`rounded-2xl border p-5 text-left focus-visible:ring-4 focus-visible:ring-blue-300 ${i === selected ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider">
              0{i + 1} · {c.approach}
            </p>
            <p className="mt-3 text-sm leading-7">{c.changes[0]}</p>
          </button>
        ))}
      </div>

      <div className={`${card} mt-5`}>
        <h2 className="text-2xl font-black">Compare meaning, then refine the wording</h2>
        <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
          The original comparison uses the passage submitted for this generation.
          Later edits in the main editor do not change it.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold">Submitted original</h3>
            <div
              data-readability-original
              className="mt-2 max-h-[440px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:bg-slate-950 dark:text-slate-300"
            >
              {source}
            </div>
          </div>
          <label className="text-sm font-bold">
            Editable revision
            <textarea
              aria-label="Editable readability revision"
              rows={12}
              maxLength={6500}
              className={field}
              value={revision}
              onChange={(e) =>
                rev.setEdits((v) => v.map((t, i) => (i === selected ? e.target.value : t)))
              }
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3" data-readability-compare>
          {[
            ["Estimated grade", before.grade, after.grade],
            ["Words", before.words, after.words],
            ["Very hard sentences", before.counts.veryHard, after.counts.veryHard],
            ["Hard sentences", before.counts.hard, after.counts.hard],
            ["Passive voice", before.counts.passive, after.counts.passive],
            ["Adverbs", before.counts.adverb, after.counts.adverb],
          ].map(([label, a, b]) => (
            <span
              key={label as string}
              className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300"
            >
              {label}: {a} → {b}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Lower counts do not prove a better revision. Check accuracy, tone, and
          whether important detail remains.
        </p>

        <section className="mt-5" aria-label="Sentence flow and paragraph review">
          <h3 className="text-lg font-bold">Sentence flow and paragraph breaks</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Length bands and review cues are editing preferences, not a quality
            score. Greater variation does not automatically mean clearer writing.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FlowReview text={source} label="Submitted original flow" />
            <FlowReview text={revision} label="Current revision flow" />
          </div>
        </section>

        <details className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <summary className="cursor-pointer text-sm font-bold">
            Original AI change notes and human review
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-500">
            {result.candidates[selected].changes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-7 text-slate-500">{result.candidates[selected].review}</p>
          <p className="mt-3 text-xs text-slate-500">
            These notes describe the generated revision. They do not update after your edits.
          </p>
        </details>

        <div className="mt-5 rounded-xl bg-amber-50 p-5 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <FileCheck2 aria-hidden className="h-5 w-5" />
            Literal preservation review
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-6">
            {[
              ["Numbers missing", checks.missingNumbers],
              ["New numbers", checks.addedNumbers],
              ["Required terms missing", checks.missingTerms],
              ["Caution words missing", checks.missingCautions],
            ].map(([label, items]) => (
              <li key={label as string}>
                <strong>{label as string}: </strong>
                {(items as string[]).join(", ") || "No matches"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-6">
            These literal checks cannot verify meaning or facts. Changed units,
            names, quotations, and qualifications need your review even when no
            match appears.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className={button} onClick={() => onCopy(revision)}>
            <Copy aria-hidden className="h-4 w-4" />
            Copy revision
          </button>
          <button
            className={button}
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([revision], { type: "text/plain;charset=utf-8" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "readability-revision.txt";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <Download aria-hidden className="h-4 w-4" />
            Download text
          </button>
          <button
            className={button}
            data-readability-replace
            disabled={rev.busy || !revision.trim()}
            onClick={() => {
              const problem = onReplace(source, revision);
              rev.setStatus(
                problem ||
                  "Passage replaced in the editor. Use Undo in the editor toolbar to restore it.",
              );
            }}
          >
            Replace the passage in the editor
          </button>
          <button
            className={button}
            onClick={() =>
              rev.setEdits((v) =>
                v.map((t, i) => (i === selected ? result.candidates[i].text : t)),
              )
            }
          >
            Restore AI draft
          </button>
        </div>
      </div>
    </section>
  );
}
