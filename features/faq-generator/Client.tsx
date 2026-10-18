"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import {
  example,
  inputSchema,
  prepareSource,
  MAX_SOURCE_CHARS,
  type FaqInput,
  type FaqReport,
  type FaqItem,
} from "./schema";
import {
  reportSchema,
  sourceWording,
  inputKey,
  exportFaq,
  exportReviewNotes,
} from "./workspace";
import { readToolResponse } from "@/lib/ai-tools/client-response";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none focus:ring-2 focus:ring-[#5271FF] disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#5271FF] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5271FF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";
const blank: FaqInput = {
  topic: "",
  audience: "",
  content: "",
  count: 5,
  questions: [],
};
type Snapshot = { input: FaqInput; report: FaqReport };
export default function FaqGeneratorClient() {
  const [input, setInput] = useState<FaqInput>(blank);
  const [questions, setQuestions] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState("");
  const [format, setFormat] = useState<"markdown" | "html">("markdown");
  const active = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const [lastKey, setLastKey] = useState("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      active.current?.abort();
    };
  }, []);
  const data = useMemo(
    () => ({
      ...input,
      questions: questions
        .split(/\r?\n/)
        .map((v) => v.trim())
        .filter(Boolean),
    }),
    [input, questions],
  );
  const coverage = useMemo(
    () => (input.content.trim() ? prepareSource(data) : null),
    [data, input.content],
  );
  const sourceSnapshot = snapshot?.input;
  const passages = useMemo(
    () => (sourceSnapshot ? prepareSource(sourceSnapshot).passages : []),
    [sourceSnapshot],
  );
  const stale = Boolean(
    snapshot && inputKey(data) !== inputKey(snapshot.input),
  );
  const selected =
    snapshot?.report.items.filter((i) => i.reviewed && i.status === "draft")
      .length || 0;
  function updateItem(id: string, patch: Partial<FaqItem>) {
    setSnapshot((old) =>
      old
        ? {
            ...old,
            report: {
              ...old.report,
              items: old.report.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      ...patch,
                      ...("question" in patch || "answer" in patch
                        ? { reviewed: false }
                        : {}),
                    }
                  : i,
              ),
            },
          }
        : old,
    );
    setPreview("");
    setExportError("");
  }
  function parsed() {
    const p = inputSchema.safeParse(data);
    if (!p.success)
      throw new Error(
        p.error.issues[0]?.message || "Check the source and questions.",
      );
    return p.data;
  }
  async function generate() {
    if (active.current) return;
    setError("");
    setStatus("");
    let value: FaqInput;
    try {
      value = parsed();
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    const key = inputKey(value);
    if (snapshot && key === lastKey) {
      setStatus(
        "This source already has a result. Edit and review it, or change an input for a new generation.",
      );
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/ai-tools/faq-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
        signal: controller.signal,
      });
      const payload = await readToolResponse<{
        result: unknown;
        meta?: { provider?: string };
      }>(response);
      const report = reportSchema.parse(payload.result);
      if (!alive.current) return;
      setSnapshot({
        input: value,
        report,
      });
      setLastKey(key);
      setPreview("");
      const answered = report.items.filter((i) => i.status === "draft").length;
      setStatus(
        answered
          ? `${answered} answer drafts ready. Compare each answer with its quotes before selecting it for export.`
          : "No source-backed answers were returned. Review the research questions or add more relevant source text.",
      );
    } catch (e) {
      if (alive.current)
        setError(
          controller.signal.aborted
            ? "Waiting stopped. Your source and previous result are preserved."
            : (e as Error).message,
        );
    } finally {
      clearTimeout(timer);
      active.current = null;
      if (alive.current) setBusy(false);
    }
  }
  function buildExport() {
    try {
      const text = exportFaq(snapshot?.report.items || [], format);
      setPreview(text);
      setExportError("");
      return text;
    } catch (e) {
      setExportError((e as Error).message);
      return null;
    }
  }
  function download(text: string, name: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function loadExample() {
    setInput(example);
    setQuestions(example.questions.join("\n"));
    setError("");
    setStatus("Example loaded. Generate FAQs when ready.");
  }
  return (
    <div
      id="faq-generator"
      className="grid scroll-mt-24 items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="min-w-0 rounded-[28px] border border-white/20 bg-white p-5 text-slate-950 shadow-xl dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Start with your source</h2>
          <button
            type="button"
            className={button}
            disabled={busy}
            onClick={loadExample}
          >
            Try example
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Paste article text or product notes. Drafts use your supplied text,
          with supporting passages you can inspect.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
          className="mt-6"
        >
          <fieldset disabled={busy} className="space-y-5">
            <label className="block text-sm font-bold" htmlFor="faq-topic">
              Topic or page purpose
              <input
                id="faq-topic"
                className={field}
                maxLength={180}
                value={input.topic}
                onChange={(e) => setInput({ ...input, topic: e.target.value })}
                placeholder="For example, choosing an AI writing tool"
                required
                minLength={3}
              />
            </label>
            <label className="block text-sm font-bold" htmlFor="faq-audience">
              Intended reader, optional
              <input
                id="faq-audience"
                className={field}
                maxLength={300}
                value={input.audience}
                onChange={(e) =>
                  setInput({ ...input, audience: e.target.value })
                }
                placeholder="For example, first-time business bloggers"
              />
            </label>
            <label className="block text-sm font-bold" htmlFor="faq-source">
              Source text
              <textarea
                id="faq-source"
                className={field}
                rows={11}
                minLength={150}
                maxLength={MAX_SOURCE_CHARS}
                required
                value={input.content}
                onChange={(e) =>
                  setInput({ ...input, content: e.target.value })
                }
                aria-describedby="faq-source-help"
                placeholder="Paste relevant text, including any limits or exceptions readers need to know."
              />
              <span
                id="faq-source-help"
                className="mt-2 block text-xs font-normal leading-6 text-slate-500 dark:text-slate-400"
              >
                {input.content.length.toLocaleString()}/60,000 characters. Text
                only. Remove confidential information. No websites, images, or
                videos are downloaded.
              </span>
            </label>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/5">
              <p className="text-sm font-bold text-[#4662df] dark:text-blue-200">
                Source coverage preview
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {coverage
                  ? `${coverage.selectedCharacters.toLocaleString()} of ${coverage.sourceCharacters.toLocaleString()} normalized text characters selected across ${coverage.passages.length} of ${coverage.totalPassages} passages.`
                  : "Add text to preview the passages included in your review."}
              </p>
              {coverage?.partial && (
                <p className="mt-2 text-xs leading-6 text-amber-800 dark:text-amber-200">
                  Partial coverage. Passages are sampled across the article,
                  then prioritized by topic and custom questions. Omitted
                  passages are not analyzed.
                </p>
              )}
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer font-semibold">
                  Inspect selected passages
                </summary>
                <div className="mt-3 max-h-60 space-y-3 overflow-y-auto break-words">
                  {coverage?.passages.map((p) => (
                    <p key={p.id} className="leading-6">
                      <strong>Passage {p.id}</strong>
                      <br />
                      {p.text}
                    </p>
                  ))}
                </div>
              </details>
            </div>
            <label className="block text-sm font-bold" htmlFor="faq-count">
              Maximum FAQs
              <select
                id="faq-count"
                className={field}
                value={input.count}
                onChange={(e) =>
                  setInput({
                    ...input,
                    count: Number(e.target.value) as 3 | 5 | 8,
                  })
                }
              >
                {[3, 5, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold" htmlFor="faq-questions">
              Questions to prioritize, optional
              <textarea
                id="faq-questions"
                className={field}
                rows={3}
                maxLength={1800}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="One question per line"
              />
              <span className="mt-2 block text-xs font-normal leading-6 text-slate-500 dark:text-slate-400">
                Up to {input.count} distinct questions, 8–220 characters each.
                Unsupported questions stay in the research list.
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#4664E8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {busy ? "Preparing source-backed FAQs…" : "Generate FAQs"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </fieldset>
        </form>
        {busy && (
          <button
            type="button"
            className={`${button} mt-3 w-full`}
            onClick={() => active.current?.abort()}
          >
            Stop waiting
          </button>
        )}
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Up to 15 successful generations daily, with five starts per ten
          minutes. Failed runs are refunded when possible.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 break-words rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
          >
            {error}
          </p>
        )}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm leading-7 text-[#4662df] dark:text-blue-200"
        >
          {status}
        </p>
      </div>
      <div className="min-w-0 space-y-5">
        {!snapshot ? (
          <div className="rounded-[28px] border border-white/15 bg-white/[0.05] p-6 text-slate-200 sm:p-8">
            <FileCheck2 className="h-9 w-9 text-[#9AABFF]" aria-hidden />
            <h2 className="mt-5 text-2xl font-black text-white">
              An answer you can trace
            </h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              Every answer draft includes matched source quotes. Missing
              evidence becomes a research task, so you can improve the page
              before publishing.
            </p>
            <ol className="mt-6 space-y-4 text-sm leading-7">
              <li>1. Supply your text and reader context.</li>
              <li>2. Compare drafts with their source passages.</li>
              <li>3. Edit, review, and select answers for export.</li>
            </ol>
            <div className="mt-7 rounded-xl border border-blue-300/20 bg-blue-400/5 p-4 text-xs leading-7 text-blue-100">
              <ShieldCheck className="mb-2 h-5 w-5" aria-hidden />
              AI question ideas are not live Google People Also Ask data.
              Matched quotes are not independent fact checks.
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Review your FAQs</h2>
                <span className="rounded-full bg-[#5271FF]/20 px-3 py-2 text-xs font-bold text-blue-100">
                  {selected} selected
                </span>
              </div>
              <p className="mt-3 text-xs leading-7 text-slate-300">
                {snapshot.report.notice}
              </p>
              <p className="mt-2 text-xs leading-7 text-slate-400">
                {snapshot.report.coverage.partial
                  ? "Partial source review"
                  : "Full supplied text selected"}{" "}
                · {snapshot.report.coverage.selectedCharacters.toLocaleString()}{" "}
                characters sent for review. Fewer FAQs may be returned when
                evidence is limited.
              </p>
              {stale && (
                <p className="mt-3 rounded-xl bg-amber-400/10 p-3 text-xs leading-6 text-amber-200">
                  Inputs changed. These drafts and quotes belong to the previous
                  source snapshot. Generate again to use your new inputs.
                </p>
              )}
            </div>
            {snapshot.report.items.map((item, index) => (
              <article
                data-faq-id={item.id}
                key={item.id}
                className="min-w-0 rounded-[24px] border border-white/20 bg-white p-5 text-slate-950 dark:border-slate-700 dark:bg-[#1D2430] dark:text-white sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold">
                    Question {index + 1}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${item.status === "draft" ? "bg-blue-50 text-[#4662df] dark:bg-blue-400/10 dark:text-blue-200" : "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200"}`}
                  >
                    {item.status === "draft"
                      ? "Source quote matched"
                      : "Research needed"}
                  </span>
                </div>
                <label
                  className="mt-4 block text-xs font-bold"
                  htmlFor={`${item.id}-question`}
                >
                  Question
                  <input
                    id={`${item.id}-question`}
                    className={field}
                    disabled={busy}
                    maxLength={220}
                    value={item.question}
                    onChange={(e) =>
                      updateItem(item.id, { question: e.target.value })
                    }
                  />
                </label>
                {item.status === "draft" ? (
                  <>
                    <label
                      className="mt-4 block text-xs font-bold"
                      htmlFor={`${item.id}-answer`}
                    >
                      Answer draft
                      <textarea
                        id={`${item.id}-answer`}
                        className={field}
                        rows={4}
                        maxLength={650}
                        disabled={busy}
                        value={item.answer}
                        onChange={(e) =>
                          updateItem(item.id, { answer: e.target.value })
                        }
                      />
                    </label>
                    <details
                      className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-600"
                      open
                    >
                      <summary className="cursor-pointer text-xs font-bold">
                        Compare supporting quotes
                      </summary>
                      {item.evidence.map((e, i) => (
                        <div key={i} className="mt-3">
                          <blockquote className="border-l-2 border-[#5271FF] pl-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {e.quote}
                          </blockquote>
                          <details className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <summary className="cursor-pointer">
                              Read source passage {e.passageId}
                            </summary>
                            <p className="mt-2 break-words leading-7">
                              {passages.find((p) => p.id === e.passageId)
                                ?.text ||
                                "Passage unavailable. Recheck your source."}
                            </p>
                          </details>
                        </div>
                      ))}
                      <button
                        type="button"
                        disabled={busy}
                        className={`${button} mt-4 text-xs`}
                        onClick={() =>
                          updateItem(item.id, {
                            answer: sourceWording(item),
                          })
                        }
                      >
                        Use source wording
                      </button>
                      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                        Replaces the draft with quoted text. Check that it
                        answers the question.
                      </p>
                    </details>
                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-6 dark:bg-slate-950/40">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[#5271FF]"
                        checked={item.reviewed}
                        disabled={busy}
                        onChange={(e) =>
                          updateItem(item.id, { reviewed: e.target.checked })
                        }
                      />
                      I reviewed the answer against the source. Include it in
                      export.
                    </label>
                  </>
                ) : (
                  <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900 dark:bg-amber-400/5 dark:text-amber-100">
                    {item.reason} This question is excluded from FAQ exports.
                  </p>
                )}
              </article>
            ))}
            <section className="rounded-[24px] border border-white/20 bg-white p-5 dark:border-slate-700 dark:bg-[#1D2430] sm:p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Export reviewed answers
              </h2>
              <p className="mt-3 text-xs leading-7 text-slate-500 dark:text-slate-400">
                Editing a question or answer clears its review selection.
                Research questions are included only in editorial review notes.
              </p>
              <label
                className="mt-4 block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="faq-format"
              >
                Output format
                <select
                  id="faq-format"
                  className={field}
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value as "markdown" | "html");
                    setPreview("");
                  }}
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML accordion</option>
                </select>
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={button}
                  onClick={() => buildExport()}
                >
                  Preview export
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={() => {
                    const text = buildExport();
                    if (text)
                      download(
                        text,
                        `faqs.${format === "html" ? "html" : "md"}`,
                        format === "html"
                          ? "text/html;charset=utf-8"
                          : "text/markdown;charset=utf-8",
                      );
                  }}
                >
                  Download FAQs
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={async () => {
                    const text = buildExport();
                    if (text)
                      try {
                        await navigator.clipboard.writeText(text);
                        setStatus("Reviewed FAQs copied.");
                      } catch {
                        setStatus(
                          "Clipboard unavailable. Copy the export preview or download your FAQs.",
                        );
                      }
                  }}
                >
                  Copy FAQs
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={() =>
                    download(
                      exportReviewNotes(snapshot.report.items),
                      "faq-editorial-review.md",
                      "text/markdown;charset=utf-8",
                    )
                  }
                >
                  Download review notes
                </button>
              </div>
              {exportError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
                >
                  {exportError}
                </p>
              )}
              {preview && (
                <label className="mt-5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Export preview
                  <textarea
                    className={`${field} font-mono`}
                    rows={10}
                    value={preview}
                    readOnly
                  />
                </label>
              )}
              <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Your FAQ export contains only the questions and answers you have
                reviewed and selected.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
