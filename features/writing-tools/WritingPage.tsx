import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
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
    title: "AI Meta Description Generator: Free SEO Snippet & Pixel Preview",
    slug: "meta-description-generator",
    description:
      "Generate six page-specific meta descriptions across three editorial angles. Check character & pixel length, compare against your title tag, and export clean HTML.",
    keywords: [
      "ai meta description generator",
      "free meta description generator",
      "seo snippet generator",
      "meta description length checker",
      "write meta description with ai",
    ],
  },
  "h1-heading": {
    name: "H1 Heading Generator",
    title: "AI H1 Heading Generator: Free H1 Tag Creator & Length Checker",
    slug: "h1-heading-generator",
    description:
      "Generate 6 reader-first H1 heading options across 3 editorial angles. Check H1 tag length (20–70 chars), compare H1 vs. title tag overlap, preview H1–H2 hierarchy, and export clean HTML.",
    keywords: [
      "h1 tag generator",
      "ai h1 heading generator",
      "free h1 generator",
      "suggest h1",
      "h1 title tag optimized with ai",
      "h1 title length",
      "h1 heading examples",
    ],
  },
};

export function writingMetadata(kind: WritingKind): Metadata {
  const page = writingPages[kind];
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
    title: page.name,
    category: "AI SEO Tool",
    ctaText: "Draft. Compare. Refine.",
    features: "6 Options,3 Directions,Live Editing Lab",
  })}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "website",
      siteName: "Do It With AI Tools",
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

const faqContent = {
  "meta-description": [
    [
      "Will Google display my exact meta description?",
      "Google primarily creates snippets from page content and uses your meta description when it summarizes the query better than body text alone. Display length varies between desktop (~960px) and mobile (~680px).",
    ],
    [
      "Is 160 characters a strict Google limit?",
      "No. Google truncates snippets based on pixel width rather than a fixed character count. Keeping descriptions between 120 and 158 characters puts your primary value proposition inside the safe mobile and desktop window.",
    ],
    [
      "What do the three directions change?",
      "Clear summary explains the page directly. Reader benefit emphasizes supported value and outcomes. Next step suggests a concrete action that fits the page's purpose.",
    ],
    [
      "Can I edit without generating again?",
      "Yes. Edit your selected draft directly in the live lab. Character counts, word checks, title comparison, and the illustrative SERP preview update locally in real time.",
    ],
  ],
  "h1-heading": [
    [
      "Does my H1 tag need to differ from the meta title tag?",
      "They serve complementary roles and can share wording when accurate. Your meta title (<title>) appears in Google search results (50–60 chars / ≤600px), while your visible H1 heading (<h1>) greets readers at the top of the page (20–70 chars) and anchors the H1–H6 outline.",
    ],
    [
      "How long should an H1 heading be for SEO?",
      "Google does not enforce a strict character limit on H1 tags, but 20 to 70 characters (4 to 12 words) is the practical sweet spot. It prevents awkward multi-line wrapping on mobile and acts as a truncation-safe fallback if Google uses your H1 as the search result title link.",
    ],
    [
      "Can I have multiple H1 tags on a single page?",
      "While HTML5 and Google can parse multiple H1 elements, using one primary H1 per page is the cleanest best practice for screen readers, document hierarchy, and editorial focus. Use H2s for main sections and H3s for subsections, and audit your live URL with our Free Heading Structure Analyzer.",
    ],
    [
      "Does the hierarchy preview generate H2 sections?",
      "You can paste or type your existing H2 headings to inspect how they pair with your selected H1 in real time. If you want AI to build a complete H1–H3 article plan from scratch, open our companion AI Article Outline Generator.",
    ],
    [
      "What do the three H1 writing directions change?",
      "Topic first names the core subject and scope directly. Task first leads with the action or problem the reader wants to complete. Audience first frames the page around the specific reader role or experience level.",
    ],
  ],
};

export default function WritingPage({ kind }: { kind: WritingKind }) {
  const page = writingPages[kind];
  const description = kind === "meta-description";
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const allFaqs = [
    ...faqContent[kind],
    [
      "Can this tool guarantee rankings or AI citations?",
      "No. The checks inspect wording, length fit, and structure. Clear headings and accurate descriptions improve usability and snippet clarity, but rankings and AI citations depend on complete page quality and competition.",
    ],
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${url}#application`,
        name: `Do It With AI Tools ${page.name}`,
        url,
        description: page.description,
        applicationCategory: "SEOApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: description
          ? [
              "Generate 6 meta description options across 3 snippet angles",
              "Real-time character, word, and pixel-width fit checks",
              "Side-by-side comparison with your meta title and H1 heading",
              "One-click HTML <meta> tag and plain-text export",
            ]
          : [
              "Generate 6 reader-first H1 heading options across Topic, Task, and Audience angles",
              "1-click live URL topic and heading extraction",
              "Real-time character count (20–70 char target) and title-tag overlap check",
              "Interactive H1–H2 page hierarchy preview and 1-click <h1> HTML export",
            ],
        creator: {
          "@type": "Person",
          name: "Sufian Mustafa",
          url: "https://doitwithai.tools/author/sufian-mustafa",
        },
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
      {
        "@type": "HowTo",
        name: description
          ? "How to generate and refine an SEO meta description"
          : "How to generate and optimize an H1 heading with AI",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Brief the actual page",
            text: "Enter your topic, target reader, primary keyword, and current title tag—or extract them from a live URL.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Compare 6 options across 3 directions",
            text: description
              ? "Evaluate Clear Summary, Reader Benefit, and Next Step snippet candidates."
              : "Compare Topic-first, Task-first, and Audience-first H1 candidates with character counts and editorial notes.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Refine in the live lab and export",
            text: "Edit wording live, verify H1–H2 hierarchy alignment, and copy plain text or semantic HTML.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: allFaqs.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: {
            "@type": "Answer",
            text: a,
          },
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
      <div
        className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 text-white sm:pt-16 lg:pb-28`}
      >
        <ToolHeroBackground />
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
              <span className={`mt-2 block text-balance ${toolHeroHeading}`}>
                {description
                  ? "Make Every Word Earn Its Place"
                  : "Give Your Page a Clear Starting Point"}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {description
                ? "Go beyond a quick sentence. Explore three snippet strategies, compare six alternatives, and refine the message in an editable preview."
                : "Generate 6 reader-first H1 heading options across 3 editorial angles, inspect how each H1 pairs with your title tag and H2 outline, and refine wording live."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [
                  description ? Search : Layers3,
                  description ? "Snippet workspace" : "Page H1–H2 hierarchy preview",
                ],
                [ListChecks, "20–70 char & intent checks"],
                [PencilLine, "Live editing lab"],
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
          {allFaqs.map(([question, answer]) => (
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
          </a>{" "}
          ·{" "}
          <Link
            className="font-semibold text-[#4662df] underline underline-offset-4 dark:text-blue-300"
            href={description ? "/ai-seo/meta-description" : "/ai-seo/h1-heading"}
          >
            {description
              ? "Read our complete Meta Description SEO Guide"
              : "Read our complete H1 Tag SEO Best Practices, Length & Examples Guide"}
          </Link>
        </p>
      </section>
      <ToolResources slug={page.slug} />
    </>
  );
}
