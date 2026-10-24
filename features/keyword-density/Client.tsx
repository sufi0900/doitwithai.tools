"use client";
import { useDeferredValue, useMemo, useState } from "react";
import {
  analyze,
  distribution,
  example,
  exportCsv,
  findMatches,
  MAX_TEXT,
  previewWindow,
  parseTargets,
  targetWords,
  type Phrase,
} from "./analyze";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-7 text-slate-950 outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
const button =
  "min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:border-[#5271FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5271FF] dark:border-slate-600";
export default function KeywordDensityClient() {
  const [text, setText] = useState("");
  const [rawTargets, setRawTargets] = useState("");
  const [exclude, setExclude] = useState(true);
  const [size, setSize] = useState(1);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");
  const deferred = useDeferredValue(text);
  const report = useMemo(() => analyze(deferred, exclude), [deferred, exclude]);
  const targets = useMemo(() => {
    try {
      return { values: parseTargets(rawTargets), error: "" };
    } catch (e) {
      return { values: [], error: (e as Error).message };
    }
  }, [rawTargets]);
  const targetRows: Phrase[] = useMemo(
    () =>
      targets.values.map((phrase) => {
        const count = findMatches(deferred, report.tokens, phrase).length;
        return {
          phrase,
          count,
          words: targetWords(phrase).length,
          rate: report.totalWords ? (count / report.totalWords) * 100 : 0,
          first: 0,
        };
      }),
    [targets.values, deferred, report.tokens, report.totalWords],
  );
  const matches = useMemo(
    () => findMatches(deferred, report.tokens, selected),
    [deferred, report.tokens, selected],
  );
  const window = useMemo(
    () => previewWindow(deferred, matches),
    [deferred, matches],
  );
  const sections = useMemo(
    () => distribution(deferred, report.tokens, selected),
    [deferred, report.tokens, selected],
  );
  const rows = report.phrases[size - 1];
  const updating = deferred !== text;
  function download() {
    const combined = [...targetRows, ...report.phrases.flat()];
    const seen = new Set<string>();
    const unique = combined.filter((p) => {
      const key = targetWords(p.phrase).join(" ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const url = URL.createObjectURL(
      new Blob([exportCsv(unique, report.totalWords)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-frequency-report.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      "Report downloaded. Use it to compare phrase counts across your revisions.",
    );
  }
  function highlight() {
    if (!window.ranges.length) return deferred.slice(window.start, window.end);
    const parts: React.ReactNode[] = [];
    let cursor = window.start;
    for (const [i, range] of window.ranges.entries()) {
      parts.push(deferred.slice(cursor, range.start));
      parts.push(
        <mark key={i} className="rounded bg-amber-200 px-0.5 text-slate-950">
          {deferred.slice(range.start, range.end)}
        </mark>,
      );
      cursor = range.end;
    }
    parts.push(deferred.slice(cursor, window.end));
    return parts;
  }
  const table = (items: Phrase[], label: string) => (
    <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-slate-200 dark:border-slate-600">
      <table className="w-full text-left text-xs">
        <caption className="p-3 text-left text-slate-500 dark:text-slate-400">
          {label}. Select a phrase to inspect its context.
        </caption>
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th scope="col" className="p-3">
              Phrase
            </th>
            <th scope="col" className="p-3">
              Count
            </th>
            <th scope="col" className="p-3">
              Per 100 words
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr
              key={p.phrase}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <th scope="row" className="p-3 font-medium">
                <button
                  type="button"
                  onClick={() => setSelected(p.phrase)}
                  className="min-h-9 max-w-60 break-words text-left text-[#4662df] underline decoration-blue-300 dark:text-blue-200"
                  aria-pressed={selected === p.phrase}
                >
                  {p.phrase}
                </button>
              </th>
              <td className="p-3 tabular-nums">{p.count}</td>
              <td className="p-3 tabular-nums">{p.rate.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && (
        <p className="p-4 text-sm text-slate-500">
          No phrases match this view. Add text or change the stop-word filter.
        </p>
      )}
    </div>
  );
  return (
    <div id="keyword-checker" className="grid items-start gap-6 lg:grid-cols-2">
      <section className="min-w-0 rounded-[28px] border border-white/20 bg-white p-5 text-slate-950 dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Check your draft</h2>
          <button
            type="button"
            className={button}
            onClick={() => {
              setText(example);
              setRawTargets("AI writing tools\nhuman review");
              setSelected("AI writing tools");
              setStatus(
                "Example loaded. Select a phrase to inspect its matches.",
              );
            }}
          >
            Try example
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-300">
          Paste your article text to see word counts, phrase frequency, and
          repetition patterns as you edit.
        </p>
        <label className="mt-5 block text-sm font-bold" htmlFor="density-text">
          Article or page text
          <textarea
            id="density-text"
            className={field}
            rows={13}
            maxLength={MAX_TEXT}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="density-limit"
          />
        </label>
        <p
          id="density-limit"
          className="mt-2 text-xs text-slate-500 dark:text-slate-400"
        >
          {text.length.toLocaleString()}/150,000 characters. Paste the main
          content, excluding navigation and footer text.
        </p>
        <label
          className="mt-5 block text-sm font-bold"
          htmlFor="density-targets"
        >
          Target phrases, optional
          <textarea
            id="density-targets"
            className={field}
            rows={3}
            maxLength={1300}
            placeholder="One phrase per line, up to ten"
            value={rawTargets}
            onChange={(e) => setRawTargets(e.target.value)}
          />
        </label>
        {targets.error && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-700 dark:text-red-200"
          >
            {targets.error}
          </p>
        )}
        <label className="mt-5 flex items-start gap-3 text-sm leading-7">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[#5271FF]"
            checked={exclude}
            onChange={(e) => setExclude(e.target.checked)}
          />
          Hide common English words at the start or end of discovered phrases.
          Target phrase counts stay unfiltered.
        </label>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className={button}
            disabled={!report.totalWords || updating || Boolean(targets.error)}
            onClick={download}
          >
            Download CSV
          </button>
          <button
            type="button"
            className={button}
            onClick={() => {
              setText("");
              setRawTargets("");
              setSelected("");
              setStatus("Text and results cleared.");
            }}
          >
            Clear text
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-4 text-sm leading-7 text-[#4662df] dark:text-blue-200"
        >
          {updating ? "Updating counts…" : status}
        </p>
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-7 text-slate-600 dark:border-blue-400/20 dark:bg-blue-400/5 dark:text-slate-300">
          Start checking right away. Download your report before leaving or
          refreshing the page.
        </div>
      </section>
      <div className="min-w-0 space-y-5">
        <section
          className="rounded-[28px] border border-white/20 bg-white p-5 text-slate-950 dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-7"
          aria-busy={updating}
        >
          <h2 className="text-2xl font-black">Keyword frequency report</h2>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              [report.totalWords, "Total words"],
              [report.paragraphs, "Text paragraphs"],
              [matches.length, "Selected matches"],
            ].map(([value, label]) => (
              <div
                key={String(label)}
                className="rounded-xl bg-slate-100 p-3 dark:bg-slate-950/60"
              >
                <p className="text-2xl font-black tabular-nums">
                  {Number(value).toLocaleString()}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-7 text-slate-500 dark:text-slate-400">
            Frequency = occurrences ÷ total source words × 100. The denominator
            includes stop words. Multiword phrases use occurrence counts, not
            word coverage.
          </p>
          {targetRows.length > 0 && (
            <>
              <h3 className="mt-6 font-bold">Your target phrases</h3>
              {table(targetRows, "Exact normalized phrase matches")}
            </>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">Discovered phrases</h3>
            <label className="text-xs font-bold">
              Phrase length
              <select
                className="ml-2 rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-950"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "word" : "words"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {table(
            rows.slice(0, 50),
            `Top ${Math.min(50, rows.length)} of ${rows.length.toLocaleString()} phrases. Full counts are in the CSV`,
          )}
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-7 text-amber-900 dark:bg-amber-400/5 dark:text-amber-100">
            Read the highlighted passages before editing. Keep repeated terms
            when they make your explanation accurate and clear.
          </p>
        </section>
        <section className="rounded-[28px] border border-white/20 bg-white p-5 text-slate-950 dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-7">
          <h2 className="text-xl font-black">Inspect repetition in context</h2>
          <p className="mt-3 break-words text-sm leading-7 text-slate-500 dark:text-slate-300">
            {selected
              ? `Selected phrase: ${selected}. ${matches.length} occurrence${matches.length === 1 ? "" : "s"} in the current text.`
              : "Select any phrase in the tables to highlight its occurrences."}
          </p>
          {window.partial && (
            <p className="mt-3 text-xs leading-7 text-amber-800 dark:text-amber-200">
              Context preview is limited to 20,000 characters near the first
              match and 200 highlighted ranges. Counts and CSV cover the full
              text.
            </p>
          )}
          <div
            data-highlight-preview
            className="mt-4 max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 p-4 text-sm leading-8 dark:border-slate-600"
          >
            {deferred
              ? highlight()
              : "Your text and highlighted matches will appear here."}
          </div>
          {sections.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-bold">
                Paragraphs with the highest local frequency
              </h3>
              <ul className="mt-3 space-y-2 text-xs leading-7 text-slate-500 dark:text-slate-300">
                {sections.slice(0, 8).map((s) => (
                  <li key={s.paragraph}>
                    Paragraph {s.paragraph}: {s.count} occurrence
                    {s.count === 1 ? "" : "s"} in {s.words} words (
                    {s.rate.toFixed(2)}%).
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs leading-7 text-slate-500 dark:text-slate-400">
            Overlapping occurrences are counted separately. Overlapping
            highlights merge. Blank lines separate paragraphs; sentence and line
            breaks stop multiword matches.
          </p>
        </section>
      </div>
    </div>
  );
}
