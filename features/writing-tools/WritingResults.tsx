"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  Info,
  Copy,
  Download,
  LayoutTemplate,
  Monitor,
  PencilLine,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import {
  type WritingInput,
  type WritingKind,
  type WritingOutput,
} from "./schema";
import { exportMarkup, reviewWriting } from "./evaluator";
import {
  inputClass,
  panelClass,
  primaryButton,
  secondaryButton,
  strategies,
  strategyHints,
} from "./config";
export default function WritingResults({
  kind,
  output,
  input,
  busy,
  onRegenerate,
}: {
  kind: WritingKind;
  output: WritingOutput;
  input: WritingInput;
  busy: boolean;
  onRegenerate: () => void;
}) {
  const [drafts, setDrafts] = useState(output.candidates.map((c) => c.text));
  const [selected, setSelected] = useState(0);
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const [copyStatus, setCopyStatus] = useState("");
  const [pageTitle, setPageTitle] = useState(input.pageTitle);
  const [outline, setOutline] = useState("");
  const [compare, setCompare] = useState(false);
  const description = kind === "meta-description";
  const text = drafts[selected];
  const candidate = output.candidates[selected];
  const checks = useMemo(
    () => reviewWriting(text, { ...input, pageTitle }, kind),
    [text, input, pageTitle, kind],
  );
  const edited = text !== candidate.text;
  const markup = exportMarkup(text, kind);
  const originalChecks = input.currentText
    ? reviewWriting(input.currentText, input, kind)
    : null;
  function select(index: number) {
    setSelected(index);
    setCopyStatus("");
    document.getElementById(`${kind}-lab`)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    document.getElementById(`${kind}-editor`)?.focus({ preventScroll: true });
  }
  function edit(value: string) {
    setDrafts((current) =>
      current.map((draft, index) => (index === selected ? value : draft)),
    );
    setCopyStatus("");
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied.`);
    } catch {
      setCopyStatus(
        "Copy is unavailable. Select the text and copy it manually.",
      );
    }
  }
  function download() {
    const content = [
      `${description ? "Meta description" : "H1 heading"} draft`,
      text,
      "",
      "HTML",
      markup,
      "",
      "Review checks",
      ...checks.rows.map((row) => `${row.label}: ${row.note}`),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kind}-draft.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setCopyStatus("Draft downloaded with HTML and review notes.");
  }
  return (
    <div className="mt-12 space-y-10 text-slate-900 dark:text-white">
      <section aria-labelledby={`${kind}-results`} className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-blue-300">
              Step 02 · Compare directions
            </p>
            <h2
              id={`${kind}-results`}
              tabIndex={-1}
              className="mt-3 scroll-mt-24 text-3xl font-black tracking-tight text-white sm:text-4xl lg:scroll-mt-28"
            >
              Six options. Three different starting points.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Pick the direction that fits your page. Then refine the wording in
              the live lab.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onRegenerate}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {busy ? "Generating…" : "Generate new options"}
          </button>
        </div>
        <div className="mt-7 grid gap-5 xl:grid-cols-3">
          {strategies[kind].map((strategy, groupIndex) => (
            <div
              key={strategy}
              className="rounded-[26px] border border-white/15 bg-white/[0.04] p-4 sm:p-5"
            >
              <div className="mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-400/15 text-xs font-black text-blue-200">
                    0{groupIndex + 1}
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {strategy}
                  </h3>
                </div>
                <p className="mt-3 min-h-10 text-xs leading-6 text-slate-400">
                  {strategyHints[strategy]}
                </p>
              </div>
              <div className="space-y-4">
                {output.candidates.map((option, index) =>
                  option.approach !== strategy ? null : (
                    <article
                      key={index}
                      data-writing-option={index}
                      className={`rounded-2xl border bg-white p-5 transition dark:bg-slate-900 ${selected === index ? "border-[#5271ff] ring-2 ring-[#5271ff]/30" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Option {index + 1}
                        </p>
                        {selected === index && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#5271ff]/10 px-2 py-1 text-[10px] font-bold text-[#4662df] dark:text-blue-300">
                            <Check className="h-3 w-3" aria-hidden /> In your
                            lab
                          </span>
                        )}
                      </div>
                      <p className="mt-3 min-h-16 break-words text-base font-extrabold leading-7 text-slate-900 dark:text-white">
                        {drafts[index]}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold text-slate-500">
                        {Array.from(drafts[index]).length} characters ·{" "}
                        {drafts[index] !== option.text ? "Edited" : "AI draft"}
                      </p>
                      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {drafts[index] !== option.text
                          ? "Original reasoning: "
                          : "Why this direction: "}
                        {option.explanation}
                      </p>
                      <button
                        type="button"
                        aria-pressed={selected === index}
                        onClick={() => select(index)}
                        className={`mt-4 w-full ${selected === index ? primaryButton : secondaryButton}`}
                      >
                        <PencilLine className="h-3.5 w-3.5" aria-hidden />
                        {selected === index
                          ? "Continue editing"
                          : "Use in editing lab"}
                        <span className="sr-only">: option {index + 1}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </article>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        id={`${kind}-lab`}
        aria-labelledby={`${kind}-lab-heading`}
        className={`${panelClass} scroll-mt-24 lg:scroll-mt-28`}
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#4662df] dark:text-blue-300">
                  <PencilLine className="h-3.5 w-3.5" aria-hidden /> Step 03 ·
                  Live {description ? "snippet" : "heading"} lab
                </p>
                <h2
                  id={`${kind}-lab-heading`}
                  className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
                >
                  {description
                    ? "See the snippet. Refine the message."
                    : "See the heading in its page context."}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Local edits update the checks and preview without another AI
                  request.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Option {selected + 1} · {edited ? "Your edit" : "AI draft"}
              </span>
            </div>
            <label
              htmlFor={`${kind}-editor`}
              className="mt-7 block text-sm font-bold text-slate-800 dark:text-slate-100"
            >
              Your {description ? "meta description" : "H1 heading"}
            </label>
            <textarea
              id={`${kind}-editor`}
              value={text}
              onChange={(e) => edit(e.target.value)}
              maxLength={320}
              rows={description ? 3 : 2}
              className={`mt-2 ${inputClass} text-base font-semibold`}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {checks.count} characters · {checks.words} words
              </p>
              <button
                type="button"
                disabled={!edited}
                onClick={() => edit(candidate.text)}
                className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[#4662df] disabled:opacity-40 dark:text-blue-300"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restore
                original option
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={checks.empty}
                onClick={() => copy(text, "Text")}
                className={primaryButton}
              >
                <Copy className="h-4 w-4" aria-hidden /> Copy{" "}
                {description ? "description" : "heading"}
              </button>
              <button
                type="button"
                disabled={checks.empty}
                onClick={() => copy(markup, "HTML")}
                className={secondaryButton}
              >
                <Copy className="h-3.5 w-3.5" aria-hidden /> Copy HTML
              </button>
              <button
                type="button"
                disabled={checks.empty}
                onClick={download}
                className={secondaryButton}
              >
                <Download className="h-3.5 w-3.5" aria-hidden /> Download draft
              </button>
            </div>
            <p
              role="status"
              aria-live="polite"
              className="mt-3 min-h-5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
            >
              {copyStatus}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                <LayoutTemplate className="h-4 w-4" aria-hidden />
                {description
                  ? "Illustrative search preview"
                  : "Page layout preview"}
              </p>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                {(["mobile", "desktop"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={device === value}
                    onClick={() => setDevice(value)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold capitalize ${device === value ? "bg-white text-[#4662df] shadow-sm dark:bg-slate-800 dark:text-blue-300" : "text-slate-500"}`}
                  >
                    {value === "mobile" ? (
                      <Smartphone className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Monitor className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`mx-auto mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white transition-[max-width] dark:border-slate-700 dark:bg-slate-950 ${device === "mobile" ? "max-w-[360px]" : "max-w-full"}`}
              data-writing-preview={device}
            >
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-slate-300"
                />
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-slate-300"
                />
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-slate-300"
                />
                <span className="ml-2 truncate text-[10px] font-medium text-slate-500">
                  {description
                    ? "Search result layout example"
                    : "Your page layout example"}
                </span>
              </div>
              <div className="min-w-0 p-5 sm:p-6">
                {description ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-xs font-black text-[#4662df] dark:bg-blue-950"
                      >
                        {(input.brand || "W").charAt(0)}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {input.brand || "Your website"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          example.com › your-page
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 break-words text-xl leading-7 text-blue-700 dark:text-blue-400">
                      {pageTitle || "Your page title"}
                    </p>
                    <p
                      className="mt-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: device === "mobile" ? 3 : 2,
                        overflow: "hidden",
                      }}
                    >
                      {text || "Your description appears here."}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#4662df]">
                      {input.pageType} · main heading
                    </p>
                    <p
                      data-preview-h1
                      className={`mt-3 break-words font-black leading-tight tracking-tight text-slate-950 dark:text-white ${device === "mobile" ? "text-2xl" : "text-3xl"}`}
                    >
                      {text || "Your main heading appears here."}
                    </p>
                    <p className="mt-4 text-xs leading-6 text-slate-500">
                      Page introduction and body content follow your heading.
                    </p>
                    <div className="my-5 space-y-2" aria-hidden>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                      <div className="h-2 w-4/5 rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                    {outline
                      .split("\n")
                      .filter((v) => v.trim())
                      .slice(0, 4)
                      .map((heading, index) => (
                        <div
                          key={index}
                          className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"
                        >
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            H2
                          </span>
                          <p className="mt-1 break-words text-sm font-bold text-slate-800 dark:text-slate-100">
                            {heading}
                          </p>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              {description
                ? "This preview uses a two- or three-line layout for editing. Google can show different text and lengths for each query and device."
                : "This sample layout helps you inspect hierarchy and wrapping. Your website's typography and layout may differ."}
            </p>
            {description ? (
              <div className="mt-5">
                <label
                  htmlFor={`${kind}-preview-title`}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Preview title
                </label>
                <input
                  id={`${kind}-preview-title`}
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  maxLength={160}
                  className={`mt-2 ${inputClass}`}
                  placeholder="Add your title to check how the two elements work together"
                />
              </div>
            ) : (
              <div className="mt-5">
                <label
                  htmlFor={`${kind}-outline`}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Your supporting H2 headings (optional)
                </label>
                <textarea
                  id={`${kind}-outline`}
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  maxLength={800}
                  rows={3}
                  className={`mt-2 ${inputClass}`}
                  placeholder="One existing section heading per line"
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Add up to four headings for the preview. These are your
                  inputs, not AI-generated sections.
                </p>
              </div>
            )}
            {input.currentText && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <button
                  type="button"
                  aria-expanded={compare}
                  onClick={() => setCompare((v) => !v)}
                  className="flex min-h-10 w-full items-center justify-between gap-3 text-left text-sm font-bold text-slate-800 dark:text-white"
                >
                  Compare with your existing{" "}
                  {description ? "description" : "H1"}
                  <ArrowDown
                    aria-hidden
                    className={`h-4 w-4 transition ${compare ? "rotate-180" : ""}`}
                  />
                </button>
                {compare && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Before · {originalChecks?.count} characters
                      </p>
                      <p className="mt-2 break-words text-sm leading-6">
                        {input.currentText}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4662df]">
                        Your draft · {checks.count} characters
                      </p>
                      <p className="mt-2 break-words text-sm leading-6">
                        {text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <details className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <summary className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                HTML for your selected draft
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <code>{markup}</code>
              </pre>
            </details>
          </div>
          <aside className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:p-7 lg:border-l lg:border-t-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Live review checks
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Text-based observations. No ranking scores or fact verification.
            </p>
            <div className="mt-5 space-y-3">
              {checks.rows.map((row) => (
                <div
                  key={row.label}
                  className={`rounded-xl border p-3.5 ${row.warn ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                >
                  <div className="flex items-center gap-2">
                    {row.warn ? (
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <Info
                        className="h-4 w-4 shrink-0 text-[#4662df] dark:text-blue-300"
                        aria-hidden
                      />
                    )}
                    <h3 className="text-xs font-extrabold">{row.label}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-6">{row.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-[#5271ff]/20 bg-[#5271ff]/5 p-4">
              <p className="text-xs font-extrabold text-[#4662df] dark:text-blue-300">
                Your final editorial check
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                <li>Does the page support every claim?</li>
                <li>Will the wording make sense to your reader?</li>
                <li>Does it match the page's actual purpose?</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
