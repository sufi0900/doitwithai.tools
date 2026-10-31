import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Gauge,
  MessageSquareText,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Search-engine lens",
    text: "Creates descriptive, concise, intent-aligned options with early natural keyword placement and duplicate-risk checks.",
  },
  {
    icon: UserRound,
    title: "Human lens",
    text: "Focuses on useful promises, specificity, readable phrasing, and credible reasons to click—without empty hype.",
  },
  {
    icon: Bot,
    title: "AI-readable lens",
    text: "Explores direct answer patterns, unambiguous entities, and supported format or authority cues for machine interpretation.",
  },
  {
    icon: Gauge,
    title: "Unified recommendation",
    text: "Ranks the strongest cross-audience options after applying deterministic character, pixel, keyword, and quality checks.",
  },
];

const practices = [
  "Preferred 45–58 character working range with a 60-character guardrail",
  "Browser-measured pixel width for conservative mobile and desktop targets",
  "Primary keyword presence and first-eight-word placement",
  "Search-intent, page-type, audience, tone, and location alignment",
  "Keyword-stuffing, all-caps, punctuation, and clickbait guardrails",
  "Comparison against current, competitor, or existing site titles",
  "Optional brand, freshness, secondary keyword, and prohibited-term controls",
  "Human-editable final title with an always-visible quality review",
];

const steps = [
  {
    number: "01",
    title: "Describe the real page",
    text: "Supply the page topic, target keyword, intended audience, search intent, and the outcome the content genuinely delivers.",
  },
  {
    number: "02",
    title: "Compare four strategic lenses",
    text: "Review Unified, Search Engine, Human, and AI-readable groups. Each explains what it prioritizes and where it may trade something off.",
  },
  {
    number: "03",
    title: "Refine in the SERP lab",
    text: "Choose a recommendation, edit it, switch between mobile and desktop, and resolve any pixel, keyword, or duplication warning.",
  },
  {
    number: "04",
    title: "Validate against the page",
    text: "Before publishing, confirm the title matches the visible H1, content language, actual evidence, and promise made to the searcher.",
  },
];

export default function ToolEducation() {
  return (
    <div className="mx-auto mt-24 max-w-7xl space-y-24 px-4 pb-24 sm:px-6 lg:px-8">
      <section aria-labelledby="different-title-generator">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            More than a list generator
          </p>
          <h2
            id="different-title-generator"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            One page brief, four ways to evaluate the promise
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Most title tools stop after producing a handful of phrases. This
            workflow combines AI ideation with a fixed editorial system so you
            can understand why an option exists, what it optimizes, and what
            still needs human judgment.
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
        aria-labelledby="best-practices-built-in"
      >
        <div className="rounded-[32px] bg-slate-950 p-7 text-white sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5271ff]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.17em] text-blue-300">
            Methodology built in
          </p>
          <h2
            id="best-practices-built-in"
            className="mt-3 text-3xl font-black tracking-tight"
          >
            Best practices become visible checks
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Language generation is handled by the AI model. Exact counts, pixel
            estimates, keyword placement, duplicate similarity, and visible
            warnings are handled by application code. This separation makes the
            result easier to trust and refine.
          </p>
          <Link
            href="/ai-seo/meta-title"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-blue-50"
          >
            Read the complete meta title guide{" "}
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

      <section aria-labelledby="how-to-use-title-generator">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Practical workflow
          </p>
          <h2
            id="how-to-use-title-generator"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            From page context to a publishable title
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
        aria-labelledby="limits-title-tool"
      >
        <div>
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-[#5271ff]" />
            <h2
              id="limits-title-tool"
              className="text-2xl font-black text-slate-950 dark:text-white"
            >
              Pixel-aware, not pixel-promising
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Google does not publish a fixed title character limit. Title links
            are truncated as needed to fit the device, and Google may generate a
            different title from the page title, H1, Open Graph title, or other
            prominent text. The simulator therefore uses conservative browser
            measurements as a practical editing signal, not a guarantee.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-6 w-6 text-[#5271ff]" />
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              AI-readable, not citation-guaranteed
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Explicit wording can make a page topic easier for systems to
            interpret, but a title alone cannot guarantee an AI citation,
            ranking, or click. Content quality, evidence, crawlability, site
            reputation, query relevance, and many other factors remain decisive.
          </p>
        </div>
      </section>

      <section className="rounded-[36px] bg-gradient-to-br from-[#5271ff] to-[#2745ca] p-7 text-white shadow-2xl shadow-[#5271ff]/20 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-blue-100">
            <FileText className="h-4 w-4" /> Learn the reasoning behind the tool
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Build the judgment, not just the title
          </h2>
          <p className="mt-4 text-sm leading-7 text-blue-50/90">
            Explore pixel width, keyword strategy, human engagement, AI-readable
            context, common mistakes, and the human refinement loop in the
            complete guide.
          </p>
        </div>
        <Link
          href="/ai-seo/meta-title"
          className="mt-7 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#3150d4] transition hover:-translate-y-0.5 hover:shadow-xl lg:mt-0"
        >
          Open the meta title guide <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
