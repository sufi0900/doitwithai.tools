"use client";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import { useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  FileCheck2,
  ScanText,
  Sparkles,
  Undo2,
} from "lucide-react";
import { analyzeReadability, preservationChecks } from "./analyzer";
import {
  readabilityInputSchema,
  validateReadability,
  type ReadabilityOutput,
} from "./schema";
const example =
  "In order to prepare an article that provides useful information for readers who may be unfamiliar with the subject, you should start by identifying their main question and then gather relevant examples before drafting each section.\n\nThe draft may require 2 review passes. Due to the fact that AI can miss important context, a human editor should check every claim. AI does not guarantee rankings.";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50";
const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
export default function ReadabilityClient() {
  const [text, setText] = useState("");
  const [threshold, setThreshold] = useState(25);
  const [audience, setAudience] = useState("");
  const [terms, setTerms] = useState("");
  const [tone, setTone] = useState<"clear" | "professional" | "friendly">(
    "clear",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [sourceTerms, setSourceTerms] = useState("");
  const [result, setResult] = useState<ReadabilityOutput | null>(null);
  const [edits, setEdits] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [undo, setUndo] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const analysis = useMemo(
    () => analyzeReadability(text, threshold),
    [text, threshold],
  );
  const revision = edits[selected] || "";
  const after = useMemo(
    () => analyzeReadability(revision, threshold),
    [revision, threshold],
  );
  const before = useMemo(
    () => analyzeReadability(source, threshold),
    [source, threshold],
  );
  const checks = useMemo(
    () => preservationChecks(source, revision, sourceTerms),
    [source, revision, sourceTerms],
  );
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Clipboard unavailable. Use Download text instead.");
    }
  }
  async function generate() {
    setError("");
    setStatus("");
    const input = readabilityInputSchema.safeParse({
      text,
      audience,
      terms,
      tone,
    });
    if (!input.success) {
      setError("Add 40–4500 characters of text before requesting revisions.");
      return;
    }
    setBusy(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 75000);
      let response;
      try {
        response = await fetch("/api/ai-tools/readability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(input.data),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      const body = await readToolResponse(response);
      if (!response.ok)
        throw Error(
          body.error?.message || "Revisions are unavailable. Try again later.",
        );
      const parsed = validateReadability(body.result);
      setSource(input.data.text);
      setSourceTerms(input.data.terms);
      setResult(parsed);
      setEdits(parsed.candidates.map((c) => c.text));
      setSelected(0);
      setStatus(
        "Three revisions are ready. Compare their meaning before applying one.",
      );
      requestAnimationFrame(() => {
        resultRef.current?.focus();
        resultRef.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      });
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "Revision request timed out. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="text-slate-900 dark:text-white">
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className={card} aria-labelledby="readability-input-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="readability-input-title" className="text-2xl font-black">
              Your text, under a clearer lens
            </h2>
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => {
                setText(example);
                setError("");
              }}
            >
              Try an example
            </button>
          </div>
          <label className="mt-5 block text-sm font-bold">
            Text to review
            <textarea
              ref={editorRef}
              name="text"
              className={field}
              rows={11}
              value={text}
              maxLength={4500}
              placeholder="Paste a section, introduction, email, or other English text."
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{text.length} / 4500 characters</span>
            <span>Local checks update as you type.</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className={button}
              disabled={!text}
              onClick={() => copy(text)}
            >
              <Copy aria-hidden className="h-4 w-4" />
              Copy text
            </button>
            <button
              className={button}
              disabled={busy}
              onClick={() => {
                setUndo(text);
                setText("");
                setError("");
              }}
            >
              Clear text
            </button>
            <button
              className={button}
              disabled={undo === null || busy}
              onClick={() => {
                if (undo !== null) {
                  setText(undo);
                  setUndo(null);
                  setStatus("Previous text restored.");
                }
              }}
            >
              <Undo2 aria-hidden className="h-4 w-4" />
              Undo replacement
            </button>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Local checks run in your browser. Text is sent to the AI provider
            only when you request revisions. Avoid confidential information.
            Local edits are lost on refresh.
          </p>
        </section>
        <aside className={card} aria-labelledby="readability-observations">
          <div className="flex items-center gap-3">
            <ScanText
              aria-hidden
              className="h-6 w-6 text-[#4662df] dark:text-blue-300"
            />
            <h2 id="readability-observations" className="text-xl font-black">
              Visible observations
            </h2>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              [analysis.words, "Words"],
              [analysis.sentences.length, "Sentence segments"],
              [analysis.average, "Words per segment"],
              [analysis.paragraphs.length, "Paragraphs"],
            ].map(([n, label]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"
              >
                <p className="text-2xl font-black">{n}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <label className="mt-5 block text-sm font-bold">
            Sentence review threshold
            <select
              className={field}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            >
              {[20, 25, 30].map((n) => (
                <option value={n} key={n}>
                  More than {n} words
                </option>
              ))}
            </select>
          </label>
          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
            These are editing cues, not a reading grade or SEO score. Sentence
            segmentation is approximate. English prose works best.
          </p>
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm leading-7 dark:border-slate-700">
            <p>{analysis.longSentences.length} long sentence segments</p>
            <p>{analysis.longParagraphs.length} paragraphs over 100 words</p>
            <p>
              {analysis.phrases.reduce((n, p) => n + p.count, 0)} possible wordy
              phrases
            </p>
          </div>
        </aside>
      </div>
      <section
        className={`${card} mt-6`}
        aria-labelledby="readability-passages"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="readability-passages" className="text-xl font-black">
            Inspect the passages
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Amber marks segments above your threshold
          </span>
        </div>
        {analysis.words ? (
          <div
            data-readability-highlight
            className="mt-5 whitespace-pre-wrap break-words text-sm leading-8 text-slate-600 dark:text-slate-300"
          >
            {analysis.sentences.map((s, i) => (
              <span key={i}>
                {text.slice(i ? analysis.sentences[i - 1].end : 0, s.start)}
                <span
                  className={
                    s.count > threshold
                      ? "rounded bg-amber-100 px-1 text-amber-950 dark:bg-amber-900/60 dark:text-amber-100"
                      : ""
                  }
                >
                  {s.text}
                </span>
              </span>
            ))}
            {text.slice(
              analysis.sentences.length
                ? analysis.sentences[analysis.sentences.length - 1].end
                : 0,
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Add text to see the sentence review.
          </p>
        )}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold">Possible wordy phrases</h3>
            {analysis.phrases.length ? (
              <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {analysis.phrases.map((p) => (
                  <li key={p.phrase}>
                    <strong>{p.phrase}</strong> ({p.count}) → consider “
                    {p.suggestion}” if the meaning fits.
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs leading-6 text-slate-500">
                No matches in the small phrase list. Other wording may still
                need review.
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold">Repeated content words</h3>
            {analysis.repeated.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.repeated.map((p) => (
                  <span
                    key={p.word}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {p.word} · {p.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs leading-6 text-slate-500">
                No content word repeats three times. Repetition can still be
                useful for clarity.
              </p>
            )}
            <p className="mt-3 text-xs leading-6 text-slate-500">
              This small word filter is literal. Necessary topic terms may
              appear often.
            </p>
          </div>
        </div>
      </section>
      <section
        className={`${card} mt-6`}
        aria-labelledby="readability-ai-title"
        aria-busy={busy}
      >
        <div className="flex items-center gap-3">
          <Sparkles
            aria-hidden
            className="h-6 w-6 text-[#4662df] dark:text-blue-300"
          />
          <h2 id="readability-ai-title" className="text-2xl font-black">
            Optional AI editing partner
          </h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Compare a light edit, a plain-language version, and a version that is
          easier to scan. Review meaning before replacing your draft.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-bold">
            Intended reader
            <input
              name="audience"
              className={field}
              maxLength={250}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </label>
          <label className="text-sm font-bold">
            Terms to preserve
            <input
              name="terms"
              className={field}
              maxLength={600}
              value={terms}
              placeholder="Names or terms, separated by commas"
              onChange={(e) => setTerms(e.target.value)}
            />
          </label>
          <label className="text-sm font-bold">
            Tone
            <select
              name="tone"
              className={field}
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
            >
              {["clear", "professional", "friendly"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          data-readability-generate
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-60"
          disabled={busy}
          onClick={generate}
        >
          <Sparkles aria-hidden className="h-4 w-4" />
          {busy ? "Preparing revisions…" : "Compare AI revisions"}
        </button>
        {result && (
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Generating again replaces previous revision edits. Your source text
            stays in its editor.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </p>
        )}
        <p
          role="status"
          className="mt-4 text-sm text-[#4662df] dark:text-blue-300"
        >
          {busy
            ? "Working on three revisions. This may take up to a minute."
            : status}
        </p>
      </section>
      {result && (
        <section
          ref={resultRef}
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
                onClick={() => setSelected(i)}
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
            <h2 className="text-2xl font-black">
              Compare meaning, then refine the wording
            </h2>
            <p className="mt-3 text-xs leading-6 text-slate-500">
              The original comparison uses the text submitted for this
              generation. Edits to the source above do not change that snapshot.
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
                    setEdits((v) =>
                      v.map((t, i) => (i === selected ? e.target.value : t)),
                    )
                  }
                />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                ["Words", before.words, after.words],
                [
                  "Long segments",
                  before.longSentences.length,
                  after.longSentences.length,
                ],
                ["Average words", before.average, after.average],
              ].map(([label, a, b]) => (
                <span
                  key={label}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300"
                >
                  {label}: {a} → {b}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-500">
              Lower counts do not prove a better revision. Check accuracy, tone,
              and whether important detail remains.
            </p>
            <details className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-bold">
                Original AI change notes and human review
              </summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-500">
                {result.candidates[selected].changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {result.candidates[selected].review}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                These notes describe the generated revision. They do not update
                after your edits.
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
                These literal checks cannot verify meaning or facts. Changed
                units, names, quotations, and qualifications need your review
                even when no match appears.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={button} onClick={() => copy(revision)}>
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
                disabled={busy || revision.length > 4500 || !revision.trim()}
                onClick={() => {
                  setUndo(text);
                  setText(revision);
                  setStatus(
                    revision.length > 4500
                      ? "This revision exceeds the source limit. Copy or download it instead."
                      : "Revision applied to the source. Undo replacement can restore your previous text.",
                  );
                }}
              >
                {revision.length > 4500
                  ? "Source limit: 4500 characters"
                  : "Use revision as source"}
              </button>
              <button
                className={button}
                onClick={() =>
                  setEdits((v) =>
                    v.map((t, i) =>
                      i === selected ? result.candidates[i].text : t,
                    ),
                  )
                }
              >
                Restore AI draft
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
