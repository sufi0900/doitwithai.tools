"use client";
import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import FormField from "@/components/ai-tools/FormField";
import {
  writingInputSchema,
  type WritingInput,
  type WritingKind,
} from "./schema";
import {
  emptyBrief,
  sampleBrief,
  inputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "./config";
export default function WritingForm({
  kind,
  busy,
  onGenerate,
}: {
  kind: WritingKind;
  busy: boolean;
  onGenerate: (input: WritingInput) => Promise<void>;
}) {
  const [form, setForm] = useState<WritingInput>({ ...emptyBrief });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const description = kind === "meta-description";
  const id = (field: string) => `${kind}-${field}`;
  const complete = [
    form.brief.trim().length >= 40,
    Boolean(form.keyword.trim()),
    Boolean(form.audience.trim()),
    Boolean(form.uniqueValue.trim()),
  ];
  function update(key: keyof WritingInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }
  function preset(sample: boolean) {
    setForm({ ...(sample ? sampleBrief : emptyBrief) });
    setErrors({});
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = writingInputSchema.safeParse(form);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fields).map(([key, values]) => [
            key,
            values?.[0] || "Review this field.",
          ]),
        ),
      );
      return;
    }
    setErrors({});
    await onGenerate(parsed.data);
  }
  return (
    <div className={panelClass}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
        <form onSubmit={submit} aria-busy={busy} className="p-5 sm:p-7 lg:p-9">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#4662df] dark:text-blue-300">
                <WandSparkles className="h-3.5 w-3.5" aria-hidden /> Step 01 ·
                Page brief
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {description
                  ? "Give the snippet something useful to say"
                  : "Find the main promise of your page"}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description
                  ? "Start with the page's substance. Then explore three ways to introduce it."
                  : "Explain the topic and reader's task. Then explore three heading directions."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => preset(true)}
                className={secondaryButton}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Try example
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => preset(false)}
                className={secondaryButton}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset brief
              </button>
            </div>
          </div>
          <fieldset disabled={busy} className="min-w-0 space-y-6">
            <FormField
              htmlFor={id("brief")}
              label="What is this page actually about?"
              error={errors.brief}
            >
              <textarea
                id={id("brief")}
                name="brief"
                value={form.brief}
                onChange={(e) => update("brief", e.target.value)}
                rows={6}
                maxLength={5000}
                aria-invalid={Boolean(errors.brief)}
                aria-describedby={id("brief-help")}
                className={`${inputClass} resize-y`}
                placeholder="Describe the topic, useful examples, features, and facts your page actually contains."
              />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <p id={id("brief-help")}>
                  40 characters minimum. Only this field is required.
                </p>
                <span>{form.brief.length.toLocaleString()} / 5,000</span>
              </div>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                htmlFor={id("keyword")}
                label="Primary keyword"
                optional
                hint="A topic focus, not a phrase to repeat everywhere."
              >
                <input
                  id={id("keyword")}
                  name="keyword"
                  value={form.keyword}
                  onChange={(e) => update("keyword", e.target.value)}
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. meta titles with AI"
                />
              </FormField>
              <FormField
                htmlFor={id("audience")}
                label="Who is reading?"
                optional
                hint="Give the draft a clear reader and level of knowledge."
              >
                <input
                  id={id("audience")}
                  name="audience"
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                  maxLength={200}
                  className={inputClass}
                  placeholder="e.g. Content marketers"
                />
              </FormField>
              <FormField htmlFor={id("pageType")} label="Page type">
                <select
                  id={id("pageType")}
                  name="pageType"
                  value={form.pageType}
                  onChange={(e) => update("pageType", e.target.value)}
                  className={inputClass}
                >
                  {[
                    "guide",
                    "blog",
                    "product",
                    "service",
                    "landing",
                    "category",
                  ].map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField htmlFor={id("intent")} label="Reader intent">
                <select
                  id={id("intent")}
                  name="intent"
                  value={form.intent}
                  onChange={(e) => update("intent", e.target.value)}
                  className={inputClass}
                >
                  <option value="informational">
                    Learn or solve a problem
                  </option>
                  <option value="commercial">Compare options</option>
                  <option value="transactional">Take an action</option>
                  <option value="navigational">Find a specific page</option>
                </select>
              </FormField>
            </div>
            <FormField
              htmlFor={id("uniqueValue")}
              label="What useful detail should stand out?"
              optional
              hint="Examples, features, or coverage that genuinely exists on this page."
            >
              <textarea
                id={id("uniqueValue")}
                name="uniqueValue"
                rows={2}
                value={form.uniqueValue}
                onChange={(e) => update("uniqueValue", e.target.value)}
                maxLength={400}
                className={inputClass}
                placeholder="e.g. Worked examples and a review checklist"
              />
            </FormField>
            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
              <summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">
                Fine-tune the wording{" "}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Title, existing draft, brand, tone
                </span>
              </summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FormField
                  htmlFor={id("pageTitle")}
                  label="Current title tag"
                  optional
                >
                  <input
                    id={id("pageTitle")}
                    name="pageTitle"
                    value={form.pageTitle}
                    onChange={(e) => update("pageTitle", e.target.value)}
                    maxLength={160}
                    className={inputClass}
                  />
                </FormField>
                <FormField htmlFor={id("brand")} label="Brand name" optional>
                  <input
                    id={id("brand")}
                    name="brand"
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    maxLength={80}
                    className={inputClass}
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    htmlFor={id("currentText")}
                    label={
                      description
                        ? "Existing meta description"
                        : "Existing H1 heading"
                    }
                    optional
                    hint="Use this for a before-and-after comparison in the editing lab."
                  >
                    <textarea
                      id={id("currentText")}
                      name="currentText"
                      value={form.currentText}
                      onChange={(e) => update("currentText", e.target.value)}
                      maxLength={320}
                      rows={2}
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <FormField htmlFor={id("tone")} label="Writing tone">
                  <select
                    id={id("tone")}
                    name="tone"
                    value={form.tone}
                    onChange={(e) => update("tone", e.target.value)}
                    className={inputClass}
                  >
                    <option value="clear">Clear and direct</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </FormField>
              </div>
            </details>
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                type="submit"
                className={`${primaryButton} w-full sm:w-auto`}
                disabled={busy}
              >
                <WandSparkles className="h-4 w-4" aria-hidden />
                {busy
                  ? "Creating your options…"
                  : description
                    ? "Generate 6 meta descriptions"
                    : "Generate 6 H1 headings"}
              </button>
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Your brief is sent to our AI provider. Avoid confidential
                information. Review every generated claim before use.
              </p>
            </div>
          </fieldset>
        </form>
        <aside className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:p-7 lg:border-l lg:border-t-0">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5271ff]/10 text-[#5271ff] dark:text-blue-300">
            <FileText className="h-6 w-6" aria-hidden />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            A useful brief, better choices
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
            Give the AI real substance
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            More context helps shape relevant options. It does not predict their
            performance.
          </p>
          <div className="mt-5 space-y-3">
            {[
              "Page context supplied",
              "Topic focus supplied",
              "Reader defined",
              "Useful detail supplied",
            ].map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <CheckCircle2
                  aria-hidden
                  className={`h-4 w-4 ${complete[index] ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"}`}
                />
                {label}
                <span className="sr-only">
                  {complete[index] ? ": supplied" : ": missing"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl border border-blue-200/70 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
            <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
              {description
                ? "Add detail beyond the title"
                : "Keep the heading true to the page"}
            </p>
            <p className="mt-2 text-xs leading-6 text-blue-800 dark:text-blue-200/80">
              {description
                ? "Show what the reader will find. Avoid filling the description with keywords or repeating the title word for word."
                : "A clear H1 identifies the main topic. A clever hook should still help readers understand where they have landed."}
            </p>
          </div>
          <ol className="mt-7 space-y-4">
            {[
              "Brief your page",
              "Compare three directions",
              "Refine in the live lab",
            ].map((label, index) => (
              <li
                key={label}
                className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 text-[10px] dark:border-slate-700">
                  0{index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
