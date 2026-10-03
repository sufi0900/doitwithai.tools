"use client";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Layers3,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  outlineInputSchema,
  validateOutline,
  type OutlineInput,
} from "./schema";
import {
  createDraft,
  outlineMarkdown,
  outlineObservations,
  type DraftHeading,
  type DraftSection,
  type OutlineDraft,
} from "./workspace";
const empty: OutlineInput = {
  title: "",
  context: "",
  audience: "",
  keyword: "",
  intent: "learn",
  format: "guide",
  depth: "balanced",
  questions: "",
  evidence: "",
};
const example: OutlineInput = {
  ...empty,
  title: "How to write a blog post with AI",
  context:
    "Create a practical human-led workflow for planning and writing an article with AI. Cover choosing a useful angle, outlining, drafting one section at a time, checking facts, and reviewing the published page. Avoid one-click publishing and unsupported SEO promises.",
  audience: "Creators and small business owners new to AI writing",
  keyword: "write a blog post with AI",
  intent: "complete a task",
  format: "tutorial",
  questions:
    "How do I brief AI? How do I avoid generic writing? What should I verify?",
  evidence:
    "I can supply screenshots of my own workflow and a tested planning prompt. No traffic results or benchmarks are available.",
};
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-40";
function HeadingEditor({
  value,
  onChange,
  label,
}: {
  value: DraftHeading;
  onChange: (h: DraftHeading) => void;
  label: string;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
        {label} heading
        <input
          aria-label={`${label} heading`}
          className={field}
          value={value.heading}
          maxLength={180}
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={button}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value.heading);
              setCopyStatus("Heading copied.");
            } catch {
              setCopyStatus(
                "Use the outline download if clipboard access is unavailable.",
              );
            }
          }}
        >
          <Copy aria-hidden className="h-4 w-4" />
          Copy heading
        </button>
        <span
          role="status"
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {copyStatus}
        </span>
      </div>
      <fieldset>
        <legend className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Choose an alternative, then refine it
        </legend>
        <div className="mt-2 grid gap-2">
          {value.options.map((option, i) => (
            <button
              type="button"
              key={i}
              aria-pressed={value.heading === option}
              onClick={() => onChange({ ...value, heading: option })}
              className={`flex min-h-11 items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs leading-5 transition focus-visible:ring-4 focus-visible:ring-blue-200 ${value.heading === option ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200" : "border-slate-200 text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:text-slate-300"}`}
            >
              <span className="font-bold">0{i + 1}</span>
              <span>{option}</span>
              {value.heading === option && (
                <Check aria-hidden className="ml-auto h-4 w-4 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </fieldset>
      <details className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
        <summary className="cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
          Writing plan and evidence
        </summary>
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
            AI planning notes refer to the original section. Review them after
            changing its heading.
          </p>
          {[
            ["purpose", "Section purpose"],
            ["starter", "Opening approach"],
            ["evidenceNeeded", "Evidence to gather"],
          ].map(([key, name]) => (
            <label
              key={key}
              className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              {name}
              <textarea
                rows={2}
                maxLength={1000}
                className={field}
                value={value[key as "purpose"]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Coverage points, one per line
            <textarea
              rows={3}
              className={field}
              maxLength={2000}
              value={value.points.join("\n")}
              onChange={(e) =>
                onChange({ ...value, points: e.target.value.split("\n") })
              }
            />
          </label>
        </div>
      </details>
    </div>
  );
}
export default function OutlineClient() {
  const [brief, setBrief] = useState<OutlineInput>(empty);
  const [draft, setDraft] = useState<OutlineDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(false);
  const [notes, setNotes] = useState(true);
  const resultRef = useRef<HTMLElement>(null);
  const change = (key: keyof OutlineInput, value: string) =>
    setBrief((b) => ({ ...b, [key]: value }));
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    const input = outlineInputSchema.safeParse(brief);
    if (!input.success) {
      setError(
        "Add a title of at least five characters and a context brief of at least 40 characters.",
      );
      return;
    }
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 75000);
      let response: Response;
      try {
        response = await fetch("/api/ai-tools/article-outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input.data),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      const body = await response.json();
      if (!response.ok)
        throw Error(
          body.error?.message || "Generation failed. Try again later.",
        );
      setDraft(createDraft(validateOutline(body.result, input.data.depth)));
      setPreview(false);
      setStatus(
        "Your outline is ready. Review the headings and evidence before drafting.",
      );
      requestAnimationFrame(() => {
        resultRef.current?.focus();
        resultRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "Generation timed out. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus(
        "Clipboard unavailable. Use Download Markdown to save your outline.",
      );
    }
  }
  const update = (fn: (d: OutlineDraft) => OutlineDraft) =>
    setDraft((d) => (d ? fn(d) : d));
  const stats = draft && outlineObservations(draft);
  const sectionCard =
    "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
  return (
    <div className="text-slate-900 dark:text-white">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form
          onSubmit={generate}
          noValidate
          className={sectionCard}
          aria-busy={busy}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">
              Start with your article brief
            </h2>
            <button
              type="button"
              disabled={busy}
              className={button}
              onClick={() => {
                setBrief(example);
                setError("");
              }}
            >
              Try an example
            </button>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Explain the reader&apos;s task and your angle. Relevant details make
            the plan more useful than a title alone.
          </p>
          <label className="mt-5 block text-sm font-bold">
            Working title{" "}
            <span className="font-normal text-slate-500">(required)</span>
            <input
              name="title"
              value={brief.title}
              onChange={(e) => change("title", e.target.value)}
              maxLength={180}
              className={field}
              placeholder="How to write a blog post with AI"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Context and scope{" "}
            <span className="font-normal text-slate-500">(required)</span>
            <textarea
              name="context"
              rows={5}
              value={brief.context}
              onChange={(e) => change("context", e.target.value)}
              maxLength={6000}
              className={field}
              placeholder="What should readers learn or do? What should the article include or avoid?"
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["audience", "Intended reader", 300],
              ["keyword", "Primary topic or keyword", 120],
            ].map(([key, label, max]) => (
              <label key={key} className="text-sm font-bold">
                {label}
                <input
                  name={key as string}
                  className={field}
                  maxLength={max as number}
                  value={brief[key as "audience"]}
                  onChange={(e) =>
                    change(key as keyof OutlineInput, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              [
                "intent",
                "Reader intent",
                [
                  "learn",
                  "complete a task",
                  "compare options",
                  "make a decision",
                ],
              ],
              [
                "format",
                "Article format",
                ["guide", "tutorial", "comparison", "list", "explainer"],
              ],
              ["depth", "Outline depth", ["focused", "balanced", "detailed"]],
            ].map(([key, label, options]) => (
              <label key={key as string} className="text-sm font-bold">
                {label as string}
                <select
                  name={key as string}
                  className={field}
                  value={brief[key as "intent"]}
                  onChange={(e) =>
                    change(key as keyof OutlineInput, e.target.value)
                  }
                >
                  {(options as string[]).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <details className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-bold">
              Reader questions and source notes
            </summary>
            {[
              ["questions", "Questions the article should answer", 1500],
              ["evidence", "Your evidence, experience, and boundaries", 2000],
            ].map(([key, label, max]) => (
              <label key={key} className="mt-4 block text-sm font-bold">
                {label}
                <textarea
                  name={key as string}
                  rows={3}
                  className={field}
                  maxLength={max as number}
                  value={brief[key as "questions"]}
                  onChange={(e) =>
                    change(key as keyof OutlineInput, e.target.value)
                  }
                />
              </label>
            ))}
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Notes guide the plan. This tool does not fetch URLs or verify
              sources.
            </p>
          </details>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={busy}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-60"
            >
              <Sparkles aria-hidden className="h-4 w-4" />
              {busy
                ? "Planning your outline…"
                : draft
                  ? "Generate a new outline"
                  : "Generate article outline"}
            </button>
            <button
              type="button"
              disabled={busy}
              className={button}
              onClick={() => {
                setBrief(empty);
                setError("");
              }}
            >
              Clear brief
            </button>
          </div>
          {draft && (
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Generating again replaces the current outline and edits. Copy or
              download your work first.
            </p>
          )}
          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Your brief is sent to the configured AI provider when you generate.
            Avoid confidential information. Local edits are lost on refresh.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
            >
              {error}
            </p>
          )}
        </form>
        <aside className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 text-white">
          <Layers3 aria-hidden className="h-7 w-7 text-blue-300" />
          <h3 className="mt-5 text-xl font-extrabold">A plan you can shape</h3>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            {[
              "Three alternatives for every heading, including H1 and the closing section.",
              "Section purposes, opening approaches, and coverage points.",
              "Nested H3s where useful, with evidence prompts for the writer.",
              "Editable structure, section reordering, and clean Markdown export.",
            ].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">
            This is planning assistance. Intent is supplied by you, rather than
            verified through live search results.
          </p>
        </aside>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-5 text-sm text-blue-200"
      >
        {busy
          ? "Creating headings and writing notes. This may take up to a minute."
          : status}
      </p>
      {draft && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Editable article outline"
          className="mt-10 scroll-mt-28 outline-none"
        >
          <div className="rounded-3xl bg-white p-6 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                  Your article blueprint
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Review the structure. Make it yours.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {draft.angle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={button}
                  onClick={() => setPreview((p) => !p)}
                >
                  {preview ? "Edit outline" : "Preview headings"}
                </button>
                <button
                  className={button}
                  onClick={() => copy(outlineMarkdown(draft, notes))}
                >
                  <Copy aria-hidden className="h-4 w-4" />
                  Copy outline
                </button>
                <button
                  className={button}
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([outlineMarkdown(draft, notes)], {
                        type: "text/markdown;charset=utf-8",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "article-outline.md";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  <Download aria-hidden className="h-4 w-4" />
                  Download Markdown
                </button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>
                1 H1 · {stats?.h2} H2 · {stats?.h3} H3
              </span>
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  checked={notes}
                  onChange={(e) => setNotes(e.target.checked)}
                />
                Include writing notes in export
              </label>
            </div>
            {!!(stats?.blanks || stats?.duplicates) && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Review {stats?.blanks} empty headings and {stats?.duplicates}{" "}
                exact duplicate headings. These checks inspect structure, not
                SEO quality.
              </p>
            )}
          </div>
          {preview ? (
            <div className={`${sectionCard} mt-5`}>
              <p className="text-xs text-slate-500">
                Illustrative hierarchy. These labels represent your future
                article, rather than this tool page&apos;s heading structure.
              </p>
              <p className="mt-6 text-2xl font-black">H1 · {draft.title}</p>
              {[draft.introduction, ...draft.sections, draft.closing].map(
                (s, i) => (
                  <div key={i} className="mt-6 border-l-2 border-blue-200 pl-5">
                    <p className="text-lg font-bold">H2 · {s.heading}</p>
                    {"subheadings" in s &&
                      (s as DraftSection).subheadings.map((h, j) => (
                        <p
                          key={j}
                          className="mt-3 pl-4 text-sm text-slate-500 dark:text-slate-300"
                        >
                          H3 · {h.heading}
                        </p>
                      ))}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className={sectionCard}>
                <h3 className="mb-5 text-lg font-black">
                  H1 · Main article heading
                </h3>
                <label className="text-xs font-bold">
                  Selected H1
                  <input
                    aria-label="Selected H1"
                    value={draft.title}
                    maxLength={180}
                    className={field}
                    onChange={(e) =>
                      update((d) => ({ ...d, title: e.target.value }))
                    }
                  />
                </label>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {draft.titleOptions.map((o, i) => (
                    <button
                      key={i}
                      className={button}
                      aria-pressed={o === draft.title}
                      onClick={() => update((d) => ({ ...d, title: o }))}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className={sectionCard}>
                <h3 className="mb-5 text-lg font-black">H2 · Introduction</h3>
                <HeadingEditor
                  label="Introduction"
                  value={draft.introduction}
                  onChange={(h) => update((d) => ({ ...d, introduction: h }))}
                />
              </div>
              {draft.sections.map((s, i) => (
                <div key={i} className={sectionCard}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black">H2 · Section {i + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        className={button}
                        aria-label={`Move section ${i + 1} up`}
                        disabled={i === 0}
                        onClick={() =>
                          update((d) => {
                            const sections = [...d.sections];
                            [sections[i - 1], sections[i]] = [
                              sections[i],
                              sections[i - 1],
                            ];
                            return { ...d, sections };
                          })
                        }
                      >
                        <ArrowUp aria-hidden className="h-4 w-4" />
                      </button>
                      <button
                        className={button}
                        aria-label={`Move section ${i + 1} down`}
                        disabled={i === draft.sections.length - 1}
                        onClick={() =>
                          update((d) => {
                            const sections = [...d.sections];
                            [sections[i + 1], sections[i]] = [
                              sections[i],
                              sections[i + 1],
                            ];
                            return { ...d, sections };
                          })
                        }
                      >
                        <ArrowDown aria-hidden className="h-4 w-4" />
                      </button>
                      <button
                        className={button}
                        onClick={() =>
                          copy(
                            `## ${s.heading}\n${s.points.map((p) => `- ${p}`).join("\n")}`,
                          )
                        }
                      >
                        <Copy aria-hidden className="h-4 w-4" />
                        Copy section
                      </button>
                      <button
                        className={button}
                        aria-label={`Remove section ${i + 1}`}
                        disabled={draft.sections.length <= 1}
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            sections: d.sections.filter((_, n) => n !== i),
                          }))
                        }
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <HeadingEditor
                    label={`Section ${i + 1}`}
                    value={s}
                    onChange={(h) =>
                      update((d) => ({
                        ...d,
                        sections: d.sections.map((v, n) =>
                          n === i ? { ...v, ...h } : v,
                        ),
                      }))
                    }
                  />
                  {(s as DraftSection).subheadings.map((h, j) => (
                    <div
                      key={j}
                      className="mt-5 border-l-2 border-blue-200 pl-4 sm:pl-6"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold">
                          H3 · Subsection {j + 1}
                        </h4>
                        <button
                          className={button}
                          aria-label={`Remove subsection ${j + 1} from section ${i + 1}`}
                          onClick={() =>
                            update((d) => ({
                              ...d,
                              sections: d.sections.map((v, n) =>
                                n === i
                                  ? {
                                      ...v,
                                      subheadings: v.subheadings.filter(
                                        (_, k) => k !== j,
                                      ),
                                    }
                                  : v,
                              ),
                            }))
                          }
                        >
                          <Trash2 aria-hidden className="h-4 w-4" />
                        </button>
                      </div>
                      <HeadingEditor
                        label={`Section ${i + 1} subsection ${j + 1}`}
                        value={h}
                        onChange={(h) =>
                          update((d) => ({
                            ...d,
                            sections: d.sections.map((v, n) =>
                              n === i
                                ? {
                                    ...v,
                                    subheadings: v.subheadings.map((v, k) =>
                                      k === j ? h : v,
                                    ),
                                  }
                                : v,
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}
                  <button
                    className={`${button} mt-5`}
                    disabled={s.subheadings.length >= 5}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        sections: d.sections.map((v, n) =>
                          n === i
                            ? {
                                ...v,
                                subheadings: [
                                  ...v.subheadings,
                                  {
                                    heading: "New subsection",
                                    options: [
                                      "New subsection",
                                      "A specific reader question",
                                      "A practical next step",
                                    ],
                                    purpose:
                                      "Define the purpose of this subsection.",
                                    starter:
                                      "Explain how you will introduce this subsection.",
                                    points: [
                                      "Add a useful coverage point",
                                      "Add an example or reader question",
                                    ],
                                    evidenceNeeded:
                                      "List the evidence you need to gather.",
                                  },
                                ],
                              }
                            : v,
                        ),
                      }))
                    }
                  >
                    <Plus aria-hidden className="h-4 w-4" />
                    Add H3
                  </button>
                </div>
              ))}
              <div className={sectionCard}>
                <h3 className="mb-5 text-lg font-black">
                  H2 · Topic-specific closing section
                </h3>
                <HeadingEditor
                  label="Closing section"
                  value={draft.closing}
                  onChange={(h) => update((d) => ({ ...d, closing: h }))}
                />
              </div>
            </div>
          )}
          <div className={`${sectionCard} mt-5`}>
            <h3 className="text-lg font-extrabold">
              Writer review before drafting
            </h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {draft.review.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-6 text-slate-500">
              AI review notes are suggestions, not verified research. Save the
              outline before leaving this page.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
