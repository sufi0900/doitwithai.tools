"use client";

import {
  ChevronDown,
  FileSearch,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import FormField from "@/components/ai-tools/FormField";
import {
  metaTitleInputSchema,
  type MetaTitleInput,
} from "@/features/meta-title-generator/schema";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const emptyForm: MetaTitleInput = {
  topicSummary: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  pageType: "guide",
  searchIntent: "informational",
  targetAudience: "",
  uniqueValue: "",
  tone: "professional",
  brandName: "",
  location: "",
  currentTitle: "",
  existingTitles: [],
  prohibitedTerms: [],
  includeFreshness: false,
  pageUrl: "",
};

const sampleForm: MetaTitleInput = {
  topicSummary:
    "A practical guide that teaches content marketers how to create accurate meta titles for Google results, AI search systems, and human readers. It explains pixel width, mobile previews, keyword placement, search intent, and human refinement.",
  primaryKeyword: "meta title optimization",
  secondaryKeywords: ["AI SEO", "title tag"],
  pageType: "guide",
  searchIntent: "informational",
  targetAudience: "SEO professionals, content marketers, and website owners",
  uniqueValue:
    "Combines Google, human, and AI-search perspectives with a live pixel check.",
  tone: "authoritative",
  brandName: "Do It With AI Tools",
  location: "",
  currentTitle: "A Comprehensive Guide to Meta Title Optimization",
  existingTitles: [
    "Meta Title Best Practices for SEO",
    "How to Write Better SEO Titles",
  ],
  prohibitedTerms: ["guaranteed rankings"],
  includeFreshness: false,
  pageUrl: "https://doitwithai.tools/ai-seo/meta-title",
};

type Props = {
  busy: boolean;
  onSubmit: (input: MetaTitleInput) => Promise<void>;
};

function splitList(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: string[]) {
  return value.join(", ");
}

export default function MetaTitleForm({ busy, onSubmit }: Props) {
  const [form, setForm] = useState<MetaTitleInput>(emptyForm);
  const [secondaryText, setSecondaryText] = useState("");
  const [existingTitlesText, setExistingTitlesText] = useState("");
  const [prohibitedTermsText, setProhibitedTermsText] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const readiness = useMemo(() => {
    const checks = [
      form.topicSummary.trim().length >= 40,
      form.primaryKeyword.trim().length >= 2,
      form.targetAudience.trim().length >= 2,
      Boolean(form.uniqueValue.trim()),
      Boolean(splitList(secondaryText).length),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, secondaryText]);

  function update<K extends keyof MetaTitleInput>(
    key: K,
    value: MetaTitleInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = metaTitleInputSchema.safeParse({
      ...form,
      secondaryKeywords: splitList(secondaryText),
      existingTitles: splitList(existingTitlesText),
      prohibitedTerms: splitList(prohibitedTermsText),
    });

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

  function applyPreset(preset: MetaTitleInput) {
    setForm(preset);
    setSecondaryText(joinList(preset.secondaryKeywords));
    setExistingTitlesText(preset.existingTitles.join("\n"));
    setProhibitedTermsText(joinList(preset.prohibitedTerms));
    setErrors({});
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <form onSubmit={submit} className="space-y-6 p-5 sm:p-7 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#5271ff]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4662df]">
                <WandSparkles className="h-3.5 w-3.5" />
                Page brief
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Tell the tool what the page actually delivers
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Better context produces titles that are specific, accurate, and
                easier to refine.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => applyPreset(sampleForm)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#5271ff]/20 bg-[#5271ff]/5 px-3 py-2 text-xs font-bold text-[#4662df] transition hover:bg-[#5271ff]/10"
              >
                <Sparkles className="h-3.5 w-3.5" /> Try sample
              </button>
              <button
                type="button"
                onClick={() => {
                  applyPreset(emptyForm);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <FormField
            label="Page topic or content summary"
            htmlFor="topicSummary"
            error={errors.topicSummary}
            hint="Describe the content, offer, evidence, and promised outcome. The model treats this as source material, not instructions."
          >
            <textarea
              id="topicSummary"
              rows={6}
              value={form.topicSummary}
              onChange={(event) => update("topicSummary", event.target.value)}
              placeholder="Example: A step-by-step guide that helps local businesses..."
              className={`${inputClass} resize-y`}
            />
            <div className="mt-1 text-right text-[11px] font-medium text-slate-400">
              {form.topicSummary.length.toLocaleString()} / 5,000
            </div>
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Primary keyword"
              htmlFor="primaryKeyword"
              error={errors.primaryKeyword}
              hint="Use the exact phrase you want evaluated for natural, early placement."
            >
              <input
                id="primaryKeyword"
                value={form.primaryKeyword}
                onChange={(event) =>
                  update("primaryKeyword", event.target.value)
                }
                placeholder="meta title generator"
                className={inputClass}
              />
            </FormField>
            <FormField
              label="Target audience"
              htmlFor="targetAudience"
              error={errors.targetAudience}
              hint="Name the reader and, if useful, their expertise or motivation."
            >
              <input
                id="targetAudience"
                value={form.targetAudience}
                onChange={(event) =>
                  update("targetAudience", event.target.value)
                }
                placeholder="Content marketers and website owners"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FormField label="Page type" htmlFor="pageType">
              <select
                id="pageType"
                value={form.pageType}
                onChange={(event) =>
                  update(
                    "pageType",
                    event.target.value as MetaTitleInput["pageType"],
                  )
                }
                className={inputClass}
              >
                <option value="blog">Blog article</option>
                <option value="guide">Guide</option>
                <option value="product">Product page</option>
                <option value="service">Service page</option>
                <option value="landing-page">Landing page</option>
                <option value="homepage">Homepage</option>
                <option value="category">Category page</option>
                <option value="video">Video page</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Search intent" htmlFor="searchIntent">
              <select
                id="searchIntent"
                value={form.searchIntent}
                onChange={(event) =>
                  update(
                    "searchIntent",
                    event.target.value as MetaTitleInput["searchIntent"],
                  )
                }
                className={inputClass}
              >
                <option value="informational">Informational</option>
                <option value="commercial">Commercial research</option>
                <option value="transactional">Transactional</option>
                <option value="navigational">Navigational</option>
              </select>
            </FormField>
            <FormField label="Tone" htmlFor="tone">
              <select
                id="tone"
                value={form.tone}
                onChange={(event) =>
                  update("tone", event.target.value as MetaTitleInput["tone"])
                }
                className={inputClass}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="direct">Direct</option>
                <option value="technical">Technical</option>
                <option value="conversational">Conversational</option>
              </select>
            </FormField>
          </div>

          <FormField
            label="Unique value or differentiator"
            htmlFor="uniqueValue"
            optional
            hint="Give the tool a credible reason this page is different from competing results."
          >
            <input
              id="uniqueValue"
              value={form.uniqueValue}
              onChange={(event) => update("uniqueValue", event.target.value)}
              placeholder="Includes original examples, a calculator, or first-party experience..."
              className={inputClass}
            />
          </FormField>

          <button
            type="button"
            onClick={() => setAdvanced((value) => !value)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-[#5271ff]/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            aria-expanded={advanced}
          >
            Advanced controls
            <ChevronDown
              className={`h-4 w-4 transition ${advanced ? "rotate-180" : ""}`}
            />
          </button>

          {advanced && (
            <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/70 md:grid-cols-2">
              <FormField
                label="Secondary keywords"
                htmlFor="secondaryKeywords"
                optional
                hint="Separate up to eight phrases with commas."
              >
                <input
                  id="secondaryKeywords"
                  value={secondaryText}
                  onChange={(event) => setSecondaryText(event.target.value)}
                  placeholder="AI SEO, title tag, SERP preview"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Brand name"
                htmlFor="brandName"
                optional
                hint="It may be omitted when it weakens clarity or exceeds the pixel budget."
              >
                <input
                  id="brandName"
                  value={form.brandName}
                  onChange={(event) => update("brandName", event.target.value)}
                  placeholder="Your brand"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Current title"
                htmlFor="currentTitle"
                optional
                hint="Used for comparison and duplicate-risk checks."
              >
                <input
                  id="currentTitle"
                  value={form.currentTitle}
                  onChange={(event) =>
                    update("currentTitle", event.target.value)
                  }
                  placeholder="Current page title"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Page URL"
                htmlFor="pageUrl"
                optional
                hint="Used only in your preview; the generator does not fetch it."
              >
                <input
                  id="pageUrl"
                  value={form.pageUrl}
                  onChange={(event) => update("pageUrl", event.target.value)}
                  placeholder="https://example.com/page"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Location"
                htmlFor="location"
                optional
                hint="Add only when geographic intent matters."
              >
                <input
                  id="location"
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="Dubai, UAE"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Terms to avoid"
                htmlFor="prohibitedTerms"
                optional
                hint="Separate words or phrases with commas."
              >
                <input
                  id="prohibitedTerms"
                  value={prohibitedTermsText}
                  onChange={(event) =>
                    setProhibitedTermsText(event.target.value)
                  }
                  placeholder="cheap, guaranteed, secret"
                  className={inputClass}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField
                  label="Existing titles to differentiate from"
                  htmlFor="existingTitles"
                  optional
                  hint="One per line or comma-separated; up to 30 titles."
                >
                  <textarea
                    id="existingTitles"
                    rows={3}
                    value={existingTitlesText}
                    onChange={(event) =>
                      setExistingTitlesText(event.target.value)
                    }
                    placeholder="Competitor or site title one&#10;Competitor or site title two"
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.includeFreshness}
                  onChange={(event) =>
                    update("includeFreshness", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#5271ff]"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800 dark:text-white">
                    Allow a freshness cue
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    The model may use the current year or “updated” only when
                    the supplied content genuinely supports it.
                  </span>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5271ff] px-6 py-4 text-base font-extrabold text-white shadow-[0_16px_35px_-16px_rgba(82,113,255,0.8)] transition hover:-translate-y-0.5 hover:bg-[#4564ed] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="animate-spin h-5 w-5 rounded-full border-2 border-white/35 border-t-white" />
                Building your title set
              </>
            ) : (
              <>
                <FileSearch className="h-5 w-5 transition group-hover:scale-110" />
                Analyze and generate titles
              </>
            )}
          </button>
        </form>

        <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 lg:p-7">
          <div className="sticky top-28 space-y-7">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <span>Brief readiness</span>
                <span className="text-white">{readiness}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5271ff] to-cyan-400 transition-all"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Add the page promise and secondary context to improve
                differentiation.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                M.E.T.A. method
              </p>
              <div className="mt-4 space-y-3">
                {[
                  ["M", "Messaging", "Human clarity and value"],
                  ["E", "Engines", "Relevance, intent, uniqueness"],
                  ["T", "Trust", "Explicit, supported context"],
                  ["A", "Automation", "Variants plus editorial guidance"],
                ].map(([letter, label, description]) => (
                  <div
                    key={letter}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#5271ff] text-xs font-black">
                      {letter}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{label}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                Human checkpoint
              </p>
              <p className="mt-2 text-xs leading-5 text-amber-50/75">
                Confirm that the final title accurately represents the published
                page. AI suggestions remain editorial options, not ranking
                guarantees.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
