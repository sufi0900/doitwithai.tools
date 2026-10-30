"use client";
import { useMemo, useState } from "react";
import { coverageCsv, EMPTY_FIELDS, keywordCoverage } from "./coverage";
import type { Token } from "./analyze";
export default function CoveragePanel({
  text,
  tokens,
  targets,
  updating,
  error,
  onSelect,
}: {
  text: string;
  tokens: Token[];
  targets: string[];
  updating: boolean;
  error: string;
  onSelect: (phrase: string) => void;
}) {
  const [fields, setFields] = useState(EMPTY_FIELDS),
    [status, setStatus] = useState("");
  const report = useMemo(
    () => keywordCoverage(text, tokens, targets, fields),
    [text, tokens, targets, fields],
  );
  function download() {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + coverageCsv(report)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-coverage-distribution.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      "Coverage report exported for the current text and supplied page fields.",
    );
  }
  const field =
    "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-base leading-7 text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
  const value = (n: number | null) => (n === null ? "Not supplied" : String(n));
  return (
    <section
      id="keyword-coverage"
      aria-labelledby="keyword-coverage-title"
      aria-busy={updating}
      className="min-w-0 scroll-mt-28 rounded-[28px] border border-white/20 bg-white p-5 text-slate-950 dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-7 lg:col-span-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4058d0] dark:text-blue-200">
            Your phrase plan in context
          </p>
          <h2 id="keyword-coverage-title" className="mt-3 text-2xl font-black">
            Keyword coverage and distribution
          </h2>
        </div>
        <button
          type="button"
          disabled={updating || !targets.length || Boolean(error)}
          onClick={download}
          className="min-h-11 rounded-xl bg-[#4058d0] px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50"
        >
          Export coverage CSV
        </button>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
        The first target phrase is your focus phrase. Remaining targets are
        supporting phrases. Coverage measures exact normalized matches, not
        topical completeness.
      </p>
      <details className="mt-6 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <summary className="cursor-pointer font-bold">
          Add optional page fields for placement checks
        </summary>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Paste these fields separately. They do not enter the body word count
          or density denominator. Blank fields remain unassessed.
        </p>
        <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
          {(
            [
              ["title", "Page title", 1000],
              ["description", "Meta description", 3000],
              ["headings", "Headings, one per line", 12000],
            ] as const
          ).map(([id, label, max]) => (
            <label
              key={id}
              className={`min-w-0 text-sm font-bold ${id === "headings" ? "md:col-span-2" : ""}`}
              htmlFor={`coverage-${id}`}
            >
              {label}
              <textarea
                id={`coverage-${id}`}
                className={field}
                rows={id === "headings" ? 4 : 2}
                maxLength={max}
                value={fields[id]}
                onChange={(e) =>
                  setFields((previous) => ({
                    ...previous,
                    [id]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 min-h-11 text-sm font-semibold text-[#4058d0] underline dark:text-blue-200"
          onClick={() => {
            setFields(EMPTY_FIELDS);
            setStatus("Optional page fields cleared.");
          }}
        >
          Clear optional fields
        </button>
      </details>
      {error ? (
        <p role="alert" className="mt-5 text-sm text-red-700 dark:text-red-200">
          Fix the target phrase list above to view coverage.
        </p>
      ) : !targets.length ? (
        <p className="mt-5 rounded-xl bg-slate-100 p-5 text-sm leading-7 dark:bg-slate-900">
          Add up to ten target phrases above, one per line, to compare presence
          and placement.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              [
                `${report.matchedTargets} / ${targets.length}`,
                "Target phrases found in body",
              ],
              [
                `${report.coveredWords} / ${report.totalWords}`,
                "Distinct body words matched by your plan",
              ],
              [report.paragraphs, "Text paragraphs, separated by blank lines"],
            ].map(([count, label]) => (
              <div
                className="min-w-0 rounded-xl bg-slate-100 p-4 dark:bg-slate-900"
                key={String(label)}
              >
                <strong className="block text-2xl font-black">{count}</strong>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[860px] text-left text-sm">
              <caption className="p-4 text-left text-sm leading-7 text-slate-600 dark:text-slate-300">
                Exact-match placement checks. Select a phrase to highlight it in
                the context panel above.
              </caption>
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {[
                    "Phrase / role",
                    "Body",
                    "Per 100 words",
                    "Paragraphs",
                    "First word",
                    "Title",
                    "Description",
                    "Headings",
                    "Start / middle / end",
                  ].map((label) => (
                    <th scope="col" className="p-3" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr
                    className="border-t border-slate-200 dark:border-slate-700"
                    key={row.phrase}
                  >
                    <th
                      scope="row"
                      className="max-w-60 break-words p-3 font-semibold"
                    >
                      <button
                        type="button"
                        className="min-h-11 text-left text-[#4058d0] underline dark:text-blue-200"
                        onClick={() => onSelect(row.phrase)}
                      >
                        {row.phrase}
                      </button>
                      <small className="block font-normal">{row.role}</small>
                    </th>
                    <td className="p-3">{row.count || "No exact match"}</td>
                    <td className="p-3">{row.rate.toFixed(2)}%</td>
                    <td className="p-3">
                      {row.paragraphs} / {report.paragraphs}
                    </td>
                    <td className="p-3">{row.firstWord ?? "No match"}</td>
                    <td className="p-3">{value(row.title)}</td>
                    <td className="p-3">{value(row.description)}</td>
                    <td className="p-3">{value(row.headings)}</td>
                    <td className="p-3">{row.bands.join(" / ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-7 text-lg font-bold">Where your phrases appear</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Body thirds use token positions. A match belongs to the third where
            it starts, even if it spans a boundary.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {report.rows.map((row) => (
              <div
                className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                key={row.phrase}
              >
                <p className="break-words font-semibold">{row.phrase}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {row.bands.map((n, i) => (
                    <div
                      className={`min-w-0 rounded-lg p-3 ${n ? "bg-blue-50 text-[#3049ad] dark:bg-blue-400/10 dark:text-blue-100" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}
                      key={i}
                    >
                      <small className="block text-xs">
                        {["Start", "Middle", "End"][i]}
                      </small>
                      <strong className="mt-1 block">{n}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-xl bg-blue-50 p-4 text-sm leading-7 text-slate-700 dark:bg-blue-400/5 dark:text-slate-300">
            Matched words are counted once across overlapping phrases. Missing
            exact matches can reflect natural synonyms, rather than a content
            problem. No distribution pattern guarantees rankings.
          </p>
        </>
      )}
      <p
        className="mt-4 text-sm text-[#4058d0] dark:text-blue-200"
        role="status"
      >
        {status}
      </p>
    </section>
  );
}
