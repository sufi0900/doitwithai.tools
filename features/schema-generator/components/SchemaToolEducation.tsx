import Link from "next/link";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SCHEMA_DEFINITIONS } from "../config";

const principles = [
  {
    icon: Fingerprint,
    title: "Specific type, real entity",
    text: "Each workflow starts with the page’s primary visible purpose and uses the most specific relevant type instead of stacking unrelated markup.",
  },
  {
    icon: Network,
    title: "Connected @graph output",
    text: "Stable @id references connect the page, primary entity, breadcrumbs, authors, and publishers without conflicting duplicates.",
  },
  {
    icon: ShieldCheck,
    title: "Facts before fullness",
    text: "Required and recommended properties are included only when the user supplies real, visible evidence. Empty optional fields are omitted.",
  },
  {
    icon: FileCheck2,
    title: "Two validation layers",
    text: "Schema.org Validator checks the broader vocabulary; Google Rich Results Test checks current Google-supported search features.",
  },
];

const workflow = [
  [
    "01",
    "Choose the page’s primary purpose",
    "A recipe, event, article, job, product, and organization page require different facts and nesting rules.",
  ],
  [
    "02",
    "Collect visible evidence",
    "Optionally fetch a public URL and use AI to suggest fields, or complete the type-specific form manually.",
  ],
  [
    "03",
    "Review deterministic checks",
    "Resolve missing properties, invalid URLs, incomplete pairs, location rules, date order, rating integrity, and graph relationships.",
  ],
  [
    "04",
    "Validate, download, and publish",
    "Copy the script, download JSON-LD or HTML, run the right external test, and add it only to the page it describes.",
  ],
];

const safeguards = [
  "Never invent prices, ratings, dates, reviews, credentials, locations, or identifiers",
  "Match every marked-up fact to content users can see on the same page",
  "Use canonical absolute URLs and crawlable, relevant image URLs",
  "Keep time-sensitive data such as availability, job deadlines, and event status current",
  "Nest reviews, offers, steps, ingredients, and locations under the entity they describe",
  "Avoid duplicate scripts that make conflicting claims about the same entity",
  "Treat rich-result eligibility, ranking, and AI visibility as outcomes that cannot be guaranteed",
];

export default function SchemaToolEducation() {
  return (
    <div className="mx-auto mt-24 max-w-7xl space-y-24 px-4 pb-24 sm:px-6 lg:px-8">
      <section aria-labelledby="schema-engine-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Beyond a static template
          </p>
          <h2
            id="schema-engine-heading"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            A schema engine that separates extraction from code
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            AI is useful for reading a brief or public page and locating
            candidate facts. It is not used as the final code authority. The
            application compiles reviewed values through type-specific logic,
            removes empty properties, connects related entities, and checks the
            result before export.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {principles.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5271ff]/10 text-[#5271ff]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] bg-slate-950 text-white">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-blue-200">
              <Braces className="h-4 w-4" /> {SCHEMA_DEFINITIONS.length} focused
              workflows
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight">
              High-value schema types without one giant generic form
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Fields change with the selected page type. A remote job asks for
              applicant regions; a mixed event asks for both venue and virtual
              location; a recipe asks for ingredients and ordered steps.
            </p>
            <Link
              href="/ai-seo/schema-markup-optimization"
              className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-cyan-300 transition hover:text-cyan-200"
            >
              Read the complete schema optimization guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 p-7 sm:grid-cols-2 sm:p-10">
            {SCHEMA_DEFINITIONS.map((definition) => (
              <div
                key={definition.id}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold">{definition.label}</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300">
                    {definition.support === "google"
                      ? "Google"
                      : definition.support === "schema"
                        ? "Schema.org"
                        : definition.support === "retired"
                          ? "Retired UI"
                          : "Limited"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {definition.schemaType}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="schema-workflow-heading">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              A safer workflow
            </p>
            <h2
              id="schema-workflow-heading"
              className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
            >
              From page evidence to tested JSON-LD
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              The shortest schema is not automatically the best, and the longest
              schema is not automatically the richest. The goal is the most
              complete truthful representation of the page.
            </p>
          </div>
          <ol className="space-y-4">
            {workflow.map(([number, title, text]) => (
              <li
                key={number}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5271ff] text-xs font-black text-white">
                  {number}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-8 rounded-[30px] border border-slate-200 bg-slate-50 p-7 dark:border-slate-800 dark:bg-slate-900 sm:p-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Integrity gate
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Completeness never justifies fabrication
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The tool requests high-value recommended fields, but it does not
            publish placeholders or make unsupported claims. If a fact is not on
            the page, leave it out or update the visible page first.
          </p>
        </div>
        <ul className="space-y-3">
          {safeguards.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300"
            >
              <ScanSearch className="mt-1 h-4 w-4 shrink-0 text-[#5271ff]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[30px] border border-[#5271ff]/20 bg-gradient-to-br from-[#5271ff]/10 via-white to-cyan-50 p-8 text-center dark:via-slate-950 dark:to-cyan-950/20 sm:p-12">
        <Sparkles className="mx-auto h-7 w-7 text-[#5271ff]" />
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          Build for machine clarity, then verify the real page
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Valid JSON-LD can help systems understand entities and can make pages
          eligible for supported search features. It cannot guarantee a rich
          result, higher ranking, traffic gain, or citation by an AI system.
        </p>
        <a
          href="#schema-markup-generator"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#5271ff] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#5271ff]/20 transition hover:-translate-y-0.5 hover:bg-[#4662df]"
        >
          Return to the generator <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
