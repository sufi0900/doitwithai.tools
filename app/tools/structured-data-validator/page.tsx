import type { Metadata } from "next";
import Link from "next/link";
import ValidatorClient from "@/features/schema-inspector/ValidatorClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl = "https://doitwithai.tools/tools/structured-data-validator";
const title = "Structured Data Validator | Inspect & Correct JSON-LD";
const description =
  "Inspect a page's JSON-LD entities, review syntax and supported field checks, correct source drafts, and export reviewed structured data.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: [
      { url: "https://doitwithai.tools/ogimage.png", width: 1200, height: 630 },
    ],
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
    q: "Does valid JSON mean my schema is fully valid?",
    a: "No. JSON syntax, vocabulary conformance, field formats, visible-content accuracy, and Google feature policies are separate checks. This validator reports its supported local checks and links to official testing tools.",
  },
  {
    q: "Why are there more entities than script blocks?",
    a: "A script can contain a graph with several entities. An Article can also contain nested Person, Organization, and ImageObject entities. Each typed object appears separately, while multiple types on one object share a card.",
  },
  {
    q: "Can I correct errors here?",
    a: "Yes. Edit the source block, review syntax feedback, and apply the correction to your draft. Export the reviewed markup and publish it through your website editor. Your live website is not edited automatically.",
  },
  {
    q: "Why is my dynamically inserted schema missing?",
    a: "URL import reads returned HTML without executing JavaScript. Paste the rendered page HTML or the JSON-LD itself to inspect client-inserted markup. Do not treat missing extracted markup as proof that a website has none.",
  },
  {
    q: "Are Article properties mandatory?",
    a: "Google's Article documentation lists recommended properties rather than universal required properties. This tool labels field-profile suggestions as review items. Missing recommendations do not establish a Google eligibility failure.",
  },
  {
    q: "Which formats are supported?",
    a: "This tool inspects JSON-LD in imported or pasted HTML, and directly pasted JSON-LD. Microdata, RDFa, custom context expansion, and remote reference resolution are not covered. Use Schema.org Validator for broader vocabulary validation.",
  },
];
export default function StructuredDataValidatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Structured Data Validator",
        url: pageUrl,
        description,
        applicationCategory: "SEOApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://doitwithai.tools",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://doitwithai.tools/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Structured Data Validator",
            item: pageUrl,
          },
        ],
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
      <section className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
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
            <span aria-current="page">Structured Data Validator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO · JSON-LD Syntax & Rich Result Inspector
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Structured Data & 
                <span className={toolHeroHeading}>
                  JSON-LD Schema Validator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect all JSON-LD structured data blocks on a live URL or pasted code. Catch syntax errors, missing @context/@type fields, invalid dates, and rich-result gaps.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live URL or raw JSON-LD
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Inline code editor & fixer
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Entity & property breakdown
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Schema Checks Performed
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">JSON Syntax:</strong> Catches trailing commas, unescaped quotes, and broken brackets.
                </li>
                <li>
                  <strong className="text-indigo-300">Graph Entities:</strong> Lists every @type detected across standalone and @graph blocks.
                </li>
                <li>
                  <strong className="text-sky-300">Required Fields:</strong> Flags missing properties needed for Google rich result eligibility.
                </li>
                <li>
                  <strong className="text-amber-300">Live Remediation:</strong> Edit JSON-LD inline, re-validate instantly, and export clean code.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-10 dark:bg-[#0c1422]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ValidatorClient />
        </div>
      </section>
      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Understand what your schema report means
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              [
                "Separate blocks from entities",
                "One JSON-LD script can describe an entire graph. Inspect individual Article, Person, Organization, and other typed items without confusing entities with script counts.",
              ],
              [
                "Review precise field evidence",
                "Expand a card to see detected values, property paths, date problems, local references, and missing profile recommendations. Unknown types remain visible with explicit coverage limits.",
              ],
              [
                "Correct and validate again",
                "Edit the relevant source block, review syntax feedback, and apply it to your draft. Export reviewed markup before publishing, then use official tools for broader validation.",
              ],
            ].map(([name, text]) => (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
                key={name}
              >
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
            <h3 className="font-extrabold text-blue-950 dark:text-blue-100">
              Syntax, vocabulary, and search eligibility are different
            </h3>
            <p className="mt-3 text-sm leading-7 text-blue-950/80 dark:text-blue-100">
              A passing local check does not certify every schema rule. Use
              Schema.org Validator for vocabulary review and Google Rich Results
              Test for supported search features.
            </p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm font-bold text-blue-800 dark:text-blue-200">
              <a
                href="https://validator.schema.org/"
                target="_blank"
                rel="noreferrer"
              >
                Schema.org Validator
              </a>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
              >
                Google Rich Results Test
              </a>
              <Link href="/tools/on-page-ai-seo-analyzer">
                Review the whole page
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 px-5 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Structured data questions
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <details
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950"
                key={f.q}
              >
                <summary className="cursor-pointer text-sm font-extrabold leading-6 text-slate-950 dark:text-white">
                  {f.q}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="structured-data-validator" />
    </>
  );
}
