import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Link2,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Context before formatting",
    text: "The brief is analyzed for page type, intent, entity, and durable topic before a slug is written.",
  },
  {
    icon: Scissors,
    title: "Meaning-aware compression",
    text: "The tool explains which headline details were omitted and why they do not need permanent URL space.",
  },
  {
    icon: SlidersHorizontal,
    title: "Focused alternatives",
    text: "Compare concise, keyword-aligned, and intent-led options without sorting through dozens of near-duplicates.",
  },
  {
    icon: ShieldCheck,
    title: "Visible quality checks",
    text: "Formatting, word count, topic coverage, filler, repetition, and time-sensitivity checks remain deterministic.",
  },
];

const practices = [
  "Readable, descriptive words instead of IDs or unreadable strings",
  "Lowercase formatting with single hyphens rather than underscores",
  "A practical 3–5 meaningful-word target without sacrificing clarity",
  "One primary topic or keyword phrase instead of keyword stuffing",
  "Stop-word removal only when the page meaning remains intact",
  "Intent cues such as review, pricing, or comparison only when useful",
  "Evergreen wording without unnecessary dates or freshness language",
  "A redirect warning whenever an existing slug may be replaced",
];

const steps = [
  {
    number: "01",
    title: "Describe the page",
    text: "Explain what the page covers and what it helps the reader understand, compare, or do.",
  },
  {
    number: "02",
    title: "Review the interpretation",
    text: "Confirm the detected page type, search intent, core entity, and stable concepts before choosing a URL.",
  },
  {
    number: "03",
    title: "Compare real trade-offs",
    text: "Choose between the recommended balance and concise, keyword, or intent-focused alternatives.",
  },
  {
    number: "04",
    title: "Finalize once",
    text: "Edit in the URL lab, validate the permanent topic label, and avoid unnecessary changes after publishing.",
  },
];

export default function SlugToolEducation() {
  return (
    <div className="mx-auto mt-24 max-w-7xl space-y-24 px-4 pb-24 sm:px-6 lg:px-8">
      <section aria-labelledby="different-slug-generator">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Beyond mechanical slugification
          </p>
          <h2
            id="different-slug-generator"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            A page brief becomes a permanent topic label
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Conventional slug tools clean a sentence, lowercase it, and insert
            separators. This workflow solves a different problem: it decides
            what the URL should mean after the headline, supporting details, and
            temporary wording have been removed.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#5271ff]/10 text-[#5271ff]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"
        aria-labelledby="slug-practices-built-in"
      >
        <div className="rounded-[32px] bg-slate-950 p-7 text-white sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5271ff]">
            <Link2 className="h-6 w-6" />
          </div>
          <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.17em] text-blue-300">
            Methodology built in
          </p>
          <h2
            id="slug-practices-built-in"
            className="mt-3 text-3xl font-black tracking-tight"
          >
            Concise by design, not by blind deletion
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            AI handles meaning, alternatives, and editorial explanation.
            Application code handles formatting, counts, topic-token coverage,
            repetition, filler, date risk, and the editable final review.
          </p>
          <Link
            href="/ai-seo/write-slug-urls"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-blue-50"
          >
            Read the complete slug URL guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {practices.map((practice) => (
            <div
              key={practice}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                {practice}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-to-use-slug-generator">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Practical workflow
          </p>
          <h2
            id="how-to-use-slug-generator"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            From page context to a stable URL
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-4xl font-black text-[#5271ff]/15">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="grid gap-8 rounded-[36px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-9 lg:grid-cols-2"
        aria-labelledby="slug-tool-boundaries"
      >
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#5271ff]" />
            <h2
              id="slug-tool-boundaries"
              className="text-2xl font-black text-slate-950 dark:text-white"
            >
              Clear URL, not a ranking promise
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            A descriptive URL can help people and systems identify a page, but
            no slug guarantees rankings, clicks, crawl speed, or AI citations.
            Content quality, technical accessibility, relevance, authority,
            internal structure, and many other signals still matter.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#5271ff]" />
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              New-page tool first
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The safest time to choose a slug is before publishing. If an old URL
            must change, evaluate the business case and implement a permanent
            redirect while updating internal links, canonicals, and sitemaps.
          </p>
        </div>
      </section>

      <section className="rounded-[36px] bg-gradient-to-br from-[#5271ff] to-[#2745ca] p-7 text-white shadow-2xl shadow-[#5271ff]/20 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-blue-100">
            <FileText className="h-4 w-4" /> Learn the complete method
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Understand the decision before you lock the URL
          </h2>
          <p className="mt-4 text-sm leading-7 text-blue-50/90">
            Explore search intent, 3–5 word compression, keyword use, stop-word
            judgment, URL stability, common mistakes, AI-assisted workflows, and
            safe slug changes in the complete guide.
          </p>
        </div>
        <Link
          href="/ai-seo/write-slug-urls"
          className="mt-7 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#3150d4] transition hover:-translate-y-0.5 hover:shadow-xl lg:mt-0"
        >
          Open the slug URL guide <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
