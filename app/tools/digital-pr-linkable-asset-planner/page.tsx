import type { Metadata } from "next";
import Link from "next/link";
import PlannerClient from "@/features/digital-pr/PlannerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl =
  "https://doitwithai.tools/tools/digital-pr-linkable-asset-planner";
const title = "Digital PR and Linkable Asset Planner | Free Campaign Brief";
const description =
  "Plan a useful linkable asset from your audience, reader problem, and evidence access. Edit your digital PR brief and download DOCX, Markdown, and CSV actions.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};
const faqs = [
  {
    question: "What does this digital PR planner create?",
    answer:
      "It creates an editable campaign brief, evidence collection protocol, asset outline, publisher research workflow, measurement notes, and action list. It does not create the finished research, website tool, or media coverage.",
  },
  {
    question: "How does the format recommendation work?",
    answer:
      "Public or owned data suggests a research report. Expert access or no collected evidence suggests a practical guide. Optional settings let you choose a visual explainer or calculator brief instead. The recommendation is a rule, not a quality score.",
  },
  {
    question: "Can I start without data?",
    answer:
      "Yes. Select no evidence collected yet. The plan explains the source and reviewer work still needed. Do not publish its proposed angle as an established finding.",
  },
  {
    question: "Is this an AI generator or a journalist database?",
    answer:
      "No. Guided rules organize your inputs locally. This version does not call an AI model, browse websites, identify journalists, find email addresses, or send messages.",
  },
  {
    question: "What makes an asset worth citing?",
    answer:
      "A clear reader benefit, a useful reference, and evidence that can be checked give an editor a reason to consider it. Relevance and accuracy still require human judgment. Links are an editorial choice.",
  },
  {
    question: "Which files can I download?",
    answer:
      "Download an editable DOCX plan, a Markdown file with the brief and action checklist, or a CSV action list. Exports use your current text, task owners, and self-reported completion statuses.",
  },
  {
    question: "Can the tool guarantee backlinks or rankings?",
    answer:
      "No. It does not estimate links, coverage, response rates, traffic, or search volume. Set targets from your own baseline and record actual outcomes separately.",
  },
  {
    question: "Does it verify sources or analyze private data?",
    answer:
      "No. Evidence access is self-reported. Supply collection notes rather than sensitive records. Check permissions, methods, findings, and expert credentials before publication.",
  },
  {
    question: "Are my edits saved?",
    answer:
      "Plan assembly and downloads happen in the browser. This feature does not upload the brief or save it between visits. Export a copy before leaving the page.",
  },
  {
    question: "Does changing an input replace my edited plan?",
    answer:
      "No. Your edited plan stays available until you explicitly rebuild it. Rebuilding replaces the current plan with a new brief based on the form.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Digital PR and Linkable Asset Planner",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Digital PR Planner", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
    ],
  };
  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Digital PR planner</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Guided campaign planning
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Digital PR and Linkable Asset Planner{" "}
                <span className={toolHeroHeading}>
                  start with a reason to cite
                </span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Turn a reader problem and your evidence access into a practical
                campaign brief. Plan the research, asset, review, and outreach
                before production begins.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                {[
                  "Transparent format recommendation",
                  "Editable brief and action list",
                  "DOCX, Markdown, and CSV",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-lg border border-white/15 px-3 py-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-[#b4c3ff]">
                A useful question comes first
              </p>
              <p className="mt-5 text-lg leading-8">
                What can you help these readers understand, decide, or do
                better?
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Define the value, check the evidence, and package something an
                editor can review.
              </p>
            </div>
          </div>
        </div>
      </header>
      <PlannerClient />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          How to plan a linkable asset
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            [
              "Describe the reader task",
              "Enter your topic, audience, and the decision the asset should support. Narrow subjects make review easier.",
            ],
            [
              "Choose an evidence starting point",
              "State what you can access. Add collection notes, then review the recommended format or choose your own.",
            ],
            [
              "Refine and export the brief",
              "Edit the angle, method, outline, and distribution plan. Assign owners and download the formats your team needs.",
            ],
          ].map(([heading, body], n) => (
            <li
              key={heading}
              className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
            >
              <span className="font-bold text-[#3452d1] dark:text-[#b4c3ff]">
                0{n + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{heading}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section
        className={`${section} border-y border-slate-100 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Choose a format that fits the evidence
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            [
              "Research report",
              "Useful when you can collect comparable data and explain the method. Define the population, period, exclusions, and limitations before drafting findings.",
            ],
            [
              "Practical guide",
              "Useful for a concrete reader task. Plan documented steps, an appropriate reviewer, exceptions, and a reusable checklist.",
            ],
            [
              "Calculator or worksheet",
              "Useful for a repeatable decision. The brief specifies inputs, rules, examples, and tests. You still need to build and verify the actual asset.",
            ],
            [
              "Visual explainer",
              "Useful when a chart or process diagram improves understanding. Plan source credits, honest scales, text equivalents, and readable downloads.",
            ],
          ].map(([heading, body]) => (
            <div key={heading}>
              <h3 className="text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Example: a useful reference for renters
        </h2>
        <p className={text}>
          A fictional energy publisher wants to help renters choose changes that
          do not require permanent installation. Public guidance and tariff
          sources could support a research brief. The team must check reuse
          terms, current prices, and regional coverage before publishing
          comparisons.
        </p>
        <p className={text}>
          The planner organizes that work into a method note, an asset outline,
          and review actions. It does not claim which change saves the most
          money. That answer needs actual evidence and analysis.
        </p>
      </section>
      <section className={`${section} bg-slate-50 dark:bg-slate-900/50`}>
        <h2 className="text-2xl font-extrabold">
          Use the brief as a starting point
        </h2>
        <p className={text}>
          This tool produces planning guidance from your inputs. It does not
          verify facts, collect datasets, create the finished asset, or contact
          publishers. Task completion is self-reported. Treat proposed angles as
          questions until research supports them.
        </p>
        <p className={text}>
          Check the accuracy, originality, accessibility, and maintenance needs
          of the finished resource. Measure actual editorial coverage and reader
          outcomes. A polished brief cannot guarantee links or search
          visibility.
        </p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-600"
            href="/tools/outreach-email-builder"
          >
            Personalized Outreach Email Builder
          </Link>
          <Link
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-600"
            href="/tools/backlink-verification-tool"
          >
            Backlink Verification Tool
          </Link>
        </div>
      </section>
      <ToolFaq title="Digital PR planner questions" faqs={faqs} />
    </div>
  );
}
