"use client";
import { Eye, EyeOff, ScanText } from "lucide-react";
import FlowReview from "../FlowReview";
import {
  allowances,
  buildFeedback,
  formatDuration,
  gradeLabel,
  issueTypes,
  targetPresets,
  type DocumentAnalysis,
  type IssueType,
} from "../engine";
import { field, issueStyles } from "./styles";

type Props = {
  analysis: DocumentAnalysis;
  text: string;
  target: number;
  onTarget: (grade: number) => void;
  visible: Record<IssueType, boolean>;
  onToggle: (type: IssueType) => void;
  onJump: (type: IssueType) => void;
  longThreshold: number;
  onThreshold: (n: number) => void;
};

const plural = (n: number, one: string, many = `${one}s`) =>
  n === 1 ? one : many;

function rowText(
  type: IssueType,
  n: number,
  a: DocumentAnalysis,
  limit: ReturnType<typeof allowances>,
) {
  switch (type) {
    case "veryHard":
      return `of ${a.sentenceCount} ${plural(a.sentenceCount, "sentence is", "sentences are")} very hard to read.`;
    case "hard":
      return `of ${a.sentenceCount} ${plural(a.sentenceCount, "sentence is", "sentences are")} hard to read.`;
    case "passive":
      return `${plural(n, "use", "uses")} of passive voice. Aim for ${limit.passive} or fewer.`;
    case "adverb":
      return `${plural(n, "adverb")}. Aim for ${limit.adverbs} or fewer.`;
    case "weakener":
      return `weakening ${plural(n, "word or phrase", "words or phrases")}.`;
    case "simpler":
      return `${plural(n, "word or phrase", "words or phrases")} with a simpler alternative.`;
  }
}

export default function InsightsPanel({
  analysis: a,
  text,
  target,
  onTarget,
  visible,
  onToggle,
  onJump,
  longThreshold,
  onThreshold,
}: Props) {
  const has = a.sentenceCount > 0;
  const limit = allowances(a);
  const feedback = buildFeedback(a, target);
  const tone =
    !has || a.grade <= target
      ? "text-emerald-600 dark:text-emerald-400"
      : a.grade <= target + 2
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  const rows = issueTypes.filter((t) => a.counts[t] > 0);

  return (
    <div className="space-y-5" data-readability-insights>
      <section aria-labelledby="readability-grade">
        <div className="flex items-center gap-2">
          <ScanText aria-hidden className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
          <h2 id="readability-grade" className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Readability
          </h2>
        </div>
        <p className={`mt-3 text-4xl font-black ${tone}`} aria-live="polite">
          {has ? `Grade ${a.grade}` : "No text yet"}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {gradeLabel(a.grade, has)}
        </p>
        <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Estimated grade, based on the ARI formula. It is an editing guide, not a
          guarantee of comprehension or an SEO score.
        </p>
        <label className="mt-3 block text-xs font-bold">
          Target reader
          <select
            className={`${field} !mt-1 !py-2`}
            value={target}
            onChange={(e) => onTarget(Number(e.target.value))}
          >
            {targetPresets.map((p) => (
              <option key={p.id} value={p.grade}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-6 dark:bg-blue-950" aria-live="polite">
          Target: grade {target}. {has ? (a.grade <= target ? "Your estimated grade meets this target." : `${a.grade - target} grades above your target.`) : "Add text to compare."}
          {" "}Changing readers adjusts sentence highlights and revision guidance. The measured grade stays based on your text.
        </p>
      </section>

      <section className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            [a.words.toLocaleString(), "Words"],
            [a.characters.toLocaleString(), "Characters"],
            [formatDuration(a.readingSeconds), "Reading time"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <dd className="text-sm font-black">{value}</dd>
              <dt className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Issues found" className="space-y-2">
        {has && !rows.length && (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
            No highlights found. Read the text aloud once to check the flow.
          </p>
        )}
        {rows.map((type) => {
          const s = issueStyles[type];
          const n = a.counts[type];
          return (
            <div
              key={type}
              className={`flex items-stretch gap-1 rounded-xl border ${s.row}`}
              data-readability-issue={type}
            >
              <button
                type="button"
                onClick={() => onJump(type)}
                className="flex flex-1 items-start gap-3 rounded-l-xl p-3 text-left text-sm font-bold leading-6 focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label={`${n} ${s.label}. Jump to the next one.`}
              >
                <span className="grid h-6 min-w-6 place-items-center rounded-md bg-white/70 px-1 text-xs font-black dark:bg-black/30">
                  {n}
                </span>
                <span>{rowText(type, n, a, limit)}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggle(type)}
                aria-pressed={visible[type]}
                aria-label={`${visible[type] ? "Hide" : "Show"} ${s.label} highlights`}
                className="grid w-11 shrink-0 place-items-center rounded-r-xl focus-visible:ring-4 focus-visible:ring-blue-300"
              >
                {visible[type] ? <Eye aria-hidden className="h-4 w-4" /> : <EyeOff aria-hidden className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </section>

      {has && (
        <section aria-labelledby="readability-feedback" className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 id="readability-feedback" className="text-sm font-black">
            What to fix first
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-6 text-slate-600 dark:text-slate-300">
            {feedback.map((f) => (
              <li key={f.id}>{f.text}</li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            These allowances are editing preferences, not readability standards.
          </p>
        </section>
      )}

      <details className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-black">Show more stats</summary>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          {[
            ["Sentences", a.sentenceCount],
            ["Paragraphs", a.paragraphs],
            ["Words per sentence", a.averageSentenceWords],
            ["Longest sentence", `${a.longestSentenceWords} words`],
            ["Speaking time", formatDuration(a.speakingSeconds)],
            ["Characters, no spaces", a.charactersNoSpaces.toLocaleString()],
            ["Flesch reading ease", a.fleschEase ?? "None"],
            ["Flesch-Kincaid grade", a.fleschKincaid ?? "None"],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-0.5 text-sm font-black">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          Syllable-based scores use an approximate English counter. Treat them as estimates.
        </p>
        <label className="mt-4 block text-xs font-bold">
          Long sentence marker
          <select
            className={`${field} !mt-1 !py-2`}
            value={longThreshold}
            onChange={(e) => onThreshold(Number(e.target.value))}
          >
            {[20, 25, 30].map((n) => (
              <option key={n} value={n}>
                More than {n} words
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs">
          <span className="font-black">{a.longSentences}</span>{" "}
          {plural(a.longSentences, "sentence is", "sentences are")} over {longThreshold} words.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {a.bands.map((band) => (
            <li key={band.label} className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] dark:bg-slate-950">
              <span className="font-black">{band.count}</span> · {band.label}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <FlowReview text={text} label="Sentence flow" />
        </div>
      </details>
    </div>
  );
}
