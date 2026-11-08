import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import FaqSchemaValidatorClient from "@/features/faq-schema-validator/FaqSchemaValidatorClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/faq-schema-validator";
const description =
  "Validate, repair, and optimize your FAQPage and Product JSON-LD schema markup to fix syntax errors and win Google AI Overview and Perplexity citations.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free FAQ Schema Validator & AI Visibility Optimizer",
  category: "AI SEO · Structured Data & AI Search Citations",
  ctaText: "Validate. Repair. Cite.",
  features: "FAQPage JSON-LD Validator,Product + FAQ @graph,40-55w AI Answer Check",
})}`;

export const metadata: Metadata = {
  title: "Free FAQ Schema Validator & AI Visibility Optimizer",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free FAQ Schema Validator & AI Visibility Optimizer",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free FAQ Schema Validator & AI Visibility Optimizer",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What are the best SEO tools for FAQ schema markup validation and optimization?",
    "An effective FAQ schema validator checks both strict Schema.org JSON-LD syntax (@context, @type: FAQPage, mainEntity array, and XSS escaping) and AI search readiness—verifying that each acceptedAnswer.text is 40–55 words long, contains verifiable metrics, and matches visible HTML text.",
  ],
  [
    "Does FAQPage schema still matter in 2026 if Google limits classic SERP FAQ drop-downs?",
    "Yes—while Google restricts expandable classic SERP accordions to authoritative health and government domains, Google AI Mode, AI Overviews, Perplexity, Microsoft Copilot, and ChatGPT Search actively parse FAQPage JSON-LD to extract direct Q&A citations.",
  ],
  [
    "How do I optimize product schema markup for AI search alongside FAQPage?",
    "Select 'FAQPage + Product (@graph)' in Input #3 above to merge your Product node (including Offer price, currency, availability, and AggregateRating) with your FAQPage node inside a single @graph array so AI shopping assistants read specs and buyer answers together.",
  ],
  [
    "What is the ideal answer length inside acceptedAnswer.text for AI visibility?",
    "Keep each FAQ answer between 40 and 55 words, starting the first sentence with a direct factual answer and at least one concrete number, price, or specification before adding secondary context.",
  ],
  [
    "Why does the validator convert http://schema.org to https://schema.org?",
    "Modern validators and structured data parsers standardize on 'https://schema.org' and require all embedded canonical URLs and offer links to use HTTPS.",
  ],
  [
    "How can I generate brand-new FAQ questions before validating my JSON-LD?",
    "Use our AI FAQ Generator to brainstorm high-intent People Also Ask questions for your topic, then paste them here to validate your combined @graph JSON-LD.",
  ],
];

const FAQ_SCHEMA_PROMPTS = [
  {
    title: "1. AI Overview & Perplexity FAQ Answer Optimizer Prompt",
    badge: "AI Visibility",
    prompt: `Rewrite the following FAQ pairs about [Target Keyword] so every answer is 40–55 words long, opens with a direct factual statement containing at least one concrete benchmark or specification, and outputs a valid Schema.org FAQPage JSON-LD block.`,
  },
  {
    title: "2. E-Commerce Product + FAQPage Combined @graph Prompt",
    badge: "Product Schema",
    prompt: `Generate a unified Schema.org "@graph" JSON-LD script for [Product Name] at [Canonical URL] combining a Product node (Offer price, priceCurrency, InStock availability, AggregateRating) and an FAQPage node answering the top 4 buyer objections.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function FaqSchemaValidatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free FAQ Schema Validator & AI Visibility Optimizer",
        alternateName: [
          "Best SEO Tools for FAQ Schema Markup Validation and Optimization",
          "Best FAQ Generator for SEO and AI Visibility",
          "Product & FAQPage JSON-LD @graph Validator",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Validate and Optimize FAQPage and Product Schema for AI Search",
        description:
          "Validate JSON-LD syntax, optimize answer lengths for AI Overviews, and build a combined @graph in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your target keyword and canonical URL",
            text: "Provide the primary keyword or product name and the canonical URL of the page.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Select your @graph combination mode",
            text: "Choose FAQPage + WebApplication, FAQPage + Product, or Standalone FAQPage.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Paste your raw JSON-LD or Q: / A: text pairs",
            text: "Paste existing JSON-LD to repair syntax errors or plain Q&A text to auto-build the schema.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your validated <script type='application/ld+json'> block",
            text: "Embed the validated JSON-LD script into your page head alongside matching visible HTML FAQs.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "FAQ Schema Validator & AI Visibility Optimizer",
            item: pageUrl,
          },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
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
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">
              FAQ Schema Validator &amp; AI Visibility Optimizer
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                STRUCTURED DATA STUDIO · FAQPAGE, PRODUCT @GRAPH &amp; AI CITATIONS
              </p>
              <h1 className={toolHeroHeading}>
                Free FAQ Schema Validator &amp; AI Visibility Optimizer
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Validate, repair, and optimize your{" "}
                <strong>FAQPage, Product, and WebApplication JSON-LD</strong>{" "}
                markup—checking{" "}
                <strong>40–55 word AI Overview answer lengths</strong>,{" "}
                <strong>Schema.org syntax</strong>, and{" "}
                <strong>unified @graph entities</strong>.
              </p>
              <div className="mt-5">
                <PortableToolHeroBar
                  title="Free FAQ Schema Validator & AI Visibility Optimizer"
                  path="/tools/faq-schema-validator"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Why Validate FAQ + Product @graph
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>Syntax &amp; Context Repair</strong>: Fixes malformed
                  JSON, <code>http://</code> context, and thin 1-word answers.
                </li>
                <li>
                  • <strong>40–55 Word AI Sweet Spot</strong>: Tunes{" "}
                  <code>acceptedAnswer.text</code> for Perplexity &amp; Google
                  AIO.
                </li>
                <li>
                  • <strong>Product + FAQ @graph</strong>: Connects pricing and
                  specs directly to buyer Q&amp;As.
                </li>
              </ul>
            </div>
          </div>

          <FaqSchemaValidatorClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · FAQ Schema Validation &amp; AI Search
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Validate and Optimize FAQ Schema for AI Visibility
          </h2>
          <p className={prose}>
            To pass <strong>FAQ schema markup validation</strong> and win AI
            Overview citations, use{" "}
            <code>&quot;@context&quot;: &quot;https://schema.org&quot;</code>,
            nest 3–6 conversational <code>Question</code> objects inside{" "}
            <code>mainEntity</code>, write{" "}
            <strong>40–55 word factual answers</strong> inside{" "}
            <code>acceptedAnswer.text</code>, ensure 100% parity with visible
            HTML text, and combine <code>FAQPage</code> with{" "}
            <code>Product</code> or <code>WebApplication</code> in{" "}
            <code>@graph</code>.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Standalone FAQPage vs. Product + FAQ @graph vs. Unstructured HTML Q&amp;As
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Schema Implementation</th>
                  <th className="px-4 py-3.5">Google AIO &amp; LLM Extraction</th>
                  <th className="px-4 py-3.5">Best Page Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    FAQPage + Product / WebApp (<code>@graph</code>)
                  </td>
                  <td className="px-4 py-3.5">
                    Highest — links price/specs directly to buyer Q&amp;As
                  </td>
                  <td className="px-4 py-3.5">
                    E-commerce product pages, SaaS landing pages &amp; free tools
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Standalone <code>FAQPage</code> JSON-LD (40–55w)
                  </td>
                  <td className="px-4 py-3.5">
                    High — clean machine-readable Question/Answer pairs
                  </td>
                  <td className="px-4 py-3.5">
                    Informational blog guides, tutorials &amp; glossaries
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Plain HTML Headings Without JSON-LD
                  </td>
                  <td className="px-4 py-3.5">
                    Moderate — relies on DOM heuristics alone
                  </td>
                  <td className="px-4 py-3.5">
                    Short news updates or simple announcements
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Need to generate fresh questions before validating your schema? Use
            our{" "}
            <Link
              href="/tools/ai-faq-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              AI FAQ Generator
            </Link>{" "}
            or build complete multi-entity structured data in the{" "}
            <Link
              href="/tools/schema-markup-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Schema Markup Generator
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for FAQ Schema Validation &amp; Product @graph
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {FAQ_SCHEMA_PROMPTS.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-[#4662df] dark:text-blue-300">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="text-3xl font-black">
            Frequently Asked Questions: FAQ Schema Validator &amp; AI Visibility
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5" open>
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolResources slug="faq-schema-validator" />
      </div>
    </>
  );
}
