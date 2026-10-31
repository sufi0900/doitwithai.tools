import { flowObservations } from "./analyzer";

export default function FlowReview({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const flow = flowObservations(text);
  const cues = [
    flow.shortRun &&
      "Four consecutive prose segments have eight words or fewer. Check whether related ideas would flow better together.",
    flow.similarRun &&
      "Four consecutive prose segments differ by three words or fewer. Read them aloud and check for a repetitive rhythm.",
    flow.denseParagraphs > 0 &&
      `${flow.denseParagraphs} prose blocks exceed 100 words or four sentence segments. Consider a break where the idea changes.`,
    flow.singleSentenceRun &&
      "Every prose block contains one sentence. Check whether some related sentences belong in the same paragraph.",
    flow.inlineColonParagraphs > 0 &&
      "Repeated inline colons appear in a prose block. Check whether paragraph breaks or a properly formatted list would clarify it.",
  ].filter(Boolean) as string[];
  return (
    <div
      className="min-w-0 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
      data-readability-flow
    >
      <h4 className="text-sm font-bold">{label}</h4>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {flow.bands.map((band) => (
          <p
            key={band.label}
            className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950"
          >
            <span className="font-bold">{band.count}</span>{" "}
            {band.count === 1 ? "segment" : "segments"} · {band.label}
            {band.label === "Over 25" ? " words" : ""}
          </p>
        ))}
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
        Prose length range: {flow.minimum}–{flow.maximum} words. Lists and
        colon-ended labels are excluded from these flow cues.
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-bold">
          Sentence length sequence
        </summary>
        <ol
          className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-auto"
          aria-label={`${label} sentence lengths`}
        >
          {flow.lengths.map((count, i) => (
            <li
              key={i}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
              aria-label={`Prose segment ${i + 1}: ${count} words`}
            >
              <span className="text-slate-500 dark:text-slate-400">
                {i + 1}
              </span>{" "}
              · {count}w
            </li>
          ))}
        </ol>
      </details>
      {cues.length ? (
        <ul
          className="mt-4 space-y-2 text-xs leading-6 text-amber-900 dark:text-amber-200"
          aria-label={`${label} flow review cues`}
        >
          {cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          {flow.lengths.length < 4
            ? "Too few prose segments for a repeated-length cue. Check the flow in context."
            : "No repeated-length cue was triggered. Read aloud to check how ideas connect."}
        </p>
      )}
    </div>
  );
}
