"use client";

import { RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import FormField from "@/components/ai-tools/FormField";
import {
  slugInputSchema,
  type SlugInput,
} from "@/features/slug-generator/schema";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const emptyForm: SlugInput = {
  pageContext: "",
  primaryKeyword: "",
  currentSlug: "",
  baseUrl: "",
  timeSensitive: false,
};

const sampleForm: SlugInput = {
  pageContext:
    "A detailed review blog about the Merlin AI Chrome extension. The page explains its core features, real use cases, free and paid plans, strengths, limitations, and whether it is useful for writers, researchers, and marketers.",
  primaryKeyword: "Merlin AI review",
  currentSlug: "a-review-blog-for-merlin-ai-chrome-extension",
  baseUrl: "https://doitwithai.tools/ai-tools",
  timeSensitive: false,
};

type Props = {
  busy: boolean;
  onSubmit: (input: SlugInput) => Promise<void>;
};

export default function SlugGeneratorForm({ busy, onSubmit }: Props) {
  const [form, setForm] = useState<SlugInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const readiness = useMemo(() => {
    const contextReady = form.pageContext.trim().length >= 30;
    const usefulContext = [
      form.primaryKeyword,
      form.currentSlug,
      form.baseUrl,
    ].filter((value) => value.trim()).length;
    return contextReady ? Math.min(100, 70 + usefulContext * 10) : 20;
  }, [form]);

  function update<K extends keyof SlugInput>(key: K, value: SlugInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = slugInputSchema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (messages?.[0]) nextErrors[field] = messages[0];
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  function applyPreset(preset: SlugInput) {
    setForm(preset);
    setErrors({});
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.48)] dark:border-slate-800 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
        <form onSubmit={submit} className="space-y-6 p-5 sm:p-7 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4662df]">
                <WandSparkles className="h-3.5 w-3.5" /> Context brief
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Describe the page—not the slug
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                One field is required. The tool interprets the topic and intent
                before deciding what deserves permanent URL space.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => applyPreset(sampleForm)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#5271ff]/20 bg-[#5271ff]/5 px-3 py-2 text-xs font-bold text-[#4662df] transition hover:bg-[#5271ff]/10"
              >
                <Sparkles className="h-3.5 w-3.5" /> Try Merlin example
              </button>
              <button
                type="button"
                onClick={() => applyPreset(emptyForm)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <FormField
            label="What is this page actually about?"
            htmlFor="pageContext"
            error={errors.pageContext}
            hint="Include the page purpose, important coverage, offer, or outcome. Do not try to write a slug yourself."
          >
            <textarea
              id="pageContext"
              rows={7}
              value={form.pageContext}
              onChange={(event) => update("pageContext", event.target.value)}
              placeholder="Example: A review page for an AI browser extension that explains its features, pricing, use cases, benefits, and limitations..."
              className={`${inputClass} resize-y`}
            />
            <div className="mt-1 text-right text-[11px] font-medium text-slate-400">
              {form.pageContext.length.toLocaleString()} / 4,000
            </div>
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Primary keyword"
              htmlFor="primaryKeyword"
              optional
              error={errors.primaryKeyword}
              hint="Leave blank if you want the tool to infer the core topic from the brief."
            >
              <input
                id="primaryKeyword"
                value={form.primaryKeyword}
                onChange={(event) =>
                  update("primaryKeyword", event.target.value)
                }
                placeholder="Merlin AI review"
                className={inputClass}
              />
            </FormField>
            <FormField
              label="Website URL or parent path"
              htmlFor="baseUrl"
              optional
              error={errors.baseUrl}
              hint="Used only to build the live URL preview; the tool does not fetch it."
            >
              <input
                id="baseUrl"
                value={form.baseUrl}
                onChange={(event) => update("baseUrl", event.target.value)}
                placeholder="https://example.com/blog"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_250px] md:items-start">
            <FormField
              label="Current or draft slug"
              htmlFor="currentSlug"
              optional
              error={errors.currentSlug}
              hint="Add it for comparison. If it is already published, changing it requires a redirect plan."
            >
              <input
                id="currentSlug"
                value={form.currentSlug}
                onChange={(event) => update("currentSlug", event.target.value)}
                placeholder="long-current-page-slug"
                className={inputClass}
              />
            </FormField>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <input
                type="checkbox"
                checked={form.timeSensitive}
                onChange={(event) =>
                  update("timeSensitive", event.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5271ff] focus:ring-[#5271ff]"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                  Time-sensitive page
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Enable only when a year or temporary angle is essential.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Brief readiness</span>
                <span>{readiness}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5271ff] to-cyan-400 transition-all"
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#5271ff] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#5271ff]/20 transition hover:-translate-y-0.5 hover:bg-[#4662df] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WandSparkles
                className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`}
              />
              {busy ? "Analyzing the page" : "Generate smart slugs"}
            </button>
          </div>
        </form>

        <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800 lg:border-l lg:border-t-0 lg:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-blue-300">
            What happens next
          </p>
          <ol className="mt-6 space-y-6">
            {[
              [
                "01",
                "Understand",
                "Infer page type, intent, entity, and durable topic.",
              ],
              [
                "02",
                "Compress",
                "Remove headline filler and temporary detail without losing meaning.",
              ],
              [
                "03",
                "Compare",
                "Score seven candidates and explain real trade-offs.",
              ],
            ].map(([number, title, text]) => (
              <li key={number} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-black text-blue-200">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-extrabold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-bold text-cyan-200">
              Not a text converter
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Your sentence is context. The output is a new, compact page
              identifier—not the same sentence with hyphens inserted.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
