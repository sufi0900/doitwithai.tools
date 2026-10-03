import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers3,
  ListChecks,
  PencilLine,
  Search,
  Sparkles,
} from "lucide-react";
import ToolResources from "@/features/tool-catalog/ToolResources";
import WritingClient from "./WritingClient";
import WritingEducation from "./WritingEducation";
import type { WritingKind } from "./schema";
export const writingPages = {
  "meta-description": {
    name: "Meta Description Generator",
    slug: "meta-description-generator",
    description:
      "Explore six page-specific meta descriptions across three writing directions. Edit, compare, preview, and export your chosen draft.",
  },
  "h1-heading": {
    name: "H1 Heading Generator",
    slug: "h1-heading-generator",
    description:
      "Explore six H1 headings across three writing directions. Compare wording, preview page hierarchy, and refine your chosen heading.",
  },
};
export function writingMetadata(kind: WritingKind): Metadata {
  const page = writingPages[kind];
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: page.name, category: "AI SEO Tool", ctaText: "Draft. Compare. Refine.", features: "6 Options,3 Directions,Live Editing Lab" })}`;
  return {
    title: `AI ${page.name}`,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.name,
      description: page.description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.name,
      description: page.description,
      images: [image],
    },
  };
}
const faqContent = {
  "meta-description": [
    [
      "Will Google display my exact meta description?",
      "Google primarily creates snippets from page content and may use your description. The text and display length can vary by query and device.",
    ],
    [
      "Is 160 characters a Google limit?",
      "No. This tool uses a practical editing range. Google can truncate snippets to fit the available space without a fixed description character limit.",
    ],
    [
      "What do the three directions change?",
      "Clear summary explains the page. Reader benefit emphasizes supported value. Next step suggests an action that fits the page's purpose.",
    ],
    [
      "Can I edit without generating again?",
      "Yes. Edit your selected draft in the lab. Character counts, word checks, title comparison, and the illustrative preview update locally.",
    ],
  ],
  "h1-heading": [
    [
      "Does my H1 need to differ from the title tag?",
      "They serve different roles and can share wording. Your H1 is a visible main heading; the title tag describes the page in browser context.",
    ],
    [
      "Is a short heading always better?",
      "No. Use enough detail to identify the topic clearly. The tool's length guidance is an editing preference, not a search engine requirement.",
    ],
    [
      "Does the hierarchy preview generate sections?",
      "No. Add your existing H2 headings to see their relationship with the selected H1. Those headings stay local in your browser.",
    ],
    [
      "What do the three directions change?",
      "Topic first names the subject. Task first focuses on what readers need to do. Audience first frames the page around its intended reader.",
    ],
  ],
};
export default function WritingPage({ kind }: { kind: WritingKind }) {
  const page = writingPages[kind];
  const description = kind === "meta-description";
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: page.name,
        url,
        description: page.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: page.name, item: url },
        ].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...item,
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 text-white sm:pt-16 lg:pb-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-[#5271ff]/30 blur-3xl" />
          <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/tools" className="hover:text-white">
              Tools
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-blue-200">
              {page.name}
            </span>
          </nav>
          <header className="mx-auto max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100">
              <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden /> AI SEO
              · Content Writing
            </p>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              AI {page.name}
              <span className="mt-2 block text-balance bg-gradient-to-r from-[#7f9aff] via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {description
                  ? "Make Every Word Earn Its Place"
                  : "Give Your Page a Clear Starting Point"}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {description
                ? "Go beyond a quick sentence. Explore three snippet strategies, compare six alternatives, and refine the message in an editable preview."
                : "A heading should help readers understand the page. Explore three directions, compare six alternatives, and see your H1 alongside supporting sections."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [
                  description ? Search : Layers3,
                  description ? "Snippet workspace" : "Page hierarchy preview",
                ],
                [ListChecks, "Visible writing checks"],
                [PencilLine, "Human refinement"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Search;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2"
                  >
                    <FeatureIcon
                      className="h-3.5 w-3.5 text-blue-300"
                      aria-hidden
                    />
                    {label as string}
                  </span>
                );
              })}
            </div>
            <a
              href={`#${kind}-workspace`}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-300"
            >
              Start with your page brief{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </header>
          <div className="mt-14">
            <WritingClient kind={kind} />
          </div>
        </div>
      </div>
      <section
        aria-labelledby={`${kind}-workflow`}
        className="bg-slate-50 py-16 dark:bg-[#171C28]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#4662df] dark:text-blue-300">
              A better draft comes from a better process
            </p>
            <h2
              id={`${kind}-workflow`}
              className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
            >
              Draft with AI. Decide with context.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The tool brings alternatives into one workspace. Your knowledge of
              the page turns those alternatives into useful copy.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              [
                BookOpen,
                "01",
                "Brief the actual page",
                "Add the subject, reader, intent, and useful details. Avoid promises the page cannot support.",
              ],
              [
                Layers3,
                "02",
                "Compare different directions",
                description
                  ? "Choose between a clear summary, supported reader value, and a useful next step."
                  : "Choose between a direct topic, a reader's task, and an audience-focused opening.",
              ],
              [
                CheckCircle2,
                "03",
                "Review the final wording",
                "Edit locally, inspect the preview, compare your original draft, and copy the final text or HTML.",
              ],
            ].map(([Icon, number, title, text]) => {
              const StepIcon = Icon as typeof BookOpen;
              return (
                <div
                  key={number as string}
                  className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <StepIcon
                      className="h-6 w-6 text-[#4662df] dark:text-blue-300"
                      aria-hidden
                    />
                    <span className="text-3xl font-black text-slate-100 dark:text-slate-800">
                      {number as string}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
                    {title as string}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {text as string}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <WritingEducation kind={kind} />
      <section
        aria-labelledby={`${kind}-faq`}
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#4662df] dark:text-blue-300">
            Understand what you are reviewing
          </p>
          <h2
            id={`${kind}-faq`}
            className="mt-3 text-3xl font-black text-slate-950 dark:text-white"
          >
            {description ? "Meta description" : "H1 heading"} questions,
            answered
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {[
            ...faqContent[kind],
            [
              "Can this tool guarantee rankings or AI citations?",
              "No. The checks inspect wording and structure. Generated alternatives, clear headings, and useful descriptions cannot guarantee rankings, clicks, traffic, or AI citations.",
            ],
          ].map(([question, answer]) => (
            <details
              key={question}
              className="rounded-2xl border border-slate-200 bg-white p-5 open:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <summary className="cursor-pointer text-sm font-extrabold text-slate-950 dark:text-white">
                {question}
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                {answer}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <a
            className="text-[#4662df] underline underline-offset-4 dark:text-blue-300"
            href={
              description
                ? "https://developers.google.com/search/docs/appearance/snippet"
                : "https://developers.google.com/search/docs/appearance/title-link"
            }
          >
            Read the relevant Google Search Central guidance
          </a>
        </p>
      </section>
      <ToolResources slug={page.slug} />
    </>
  );
}
