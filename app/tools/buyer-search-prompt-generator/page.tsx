import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import BuyerSearchPromptClient from "@/features/buyer-search-prompt-generator/BuyerSearchPromptClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/buyer-search-prompt-generator";
const description =
  "Generate 4 buyer search prompts across problem discovery, category comparisons, competitor alternatives, and product schema to win AI shopping citations.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free AI Buyer Search & Commercial Prompt Generator",
  category: "Content Writing · Commercial & E-Commerce Prompts",
  ctaText: "Map Buyers. Win Citations.",
  features: "Generate 4 Buyer Prompts,Product Page AI Visibility,Buyer Persona Prompts",
})}`;

export const metadata: Metadata = {
  title: "Free AI Buyer Search & Commercial Prompt Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Buyer Search & Commercial Prompt Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Buyer Search & Commercial Prompt Generator",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "How do I generate 4 buyer search prompts that cover the entire purchase journey?",
    "Enter your product or service, buyer persona, pricing tier, primary pain point, competitors, and proof into the dashboard above to generate 4 structured prompts covering Problem-Aware Discovery, Category Shortlisting, Competitor Versus Evaluation, and Transactional Review Verification.",
  ],
  [
    "How do I optimize product pages for AI visibility in ChatGPT Search, Perplexity, and Google AI Mode?",
    "Keep your product name as the H1, state exact pricing and technical specifications in plain HTML tables, include a 50-word Quick Answer explaining who the product is best for, and embed valid Product or SoftwareApplication JSON-LD with Offer and review data.",
  ],
  [
    "How do product reviews impact AI search visibility and buying recommendations?",
    "Answer engines synthesize specific pros, cons, and use-case outcomes from verified customer reviews to decide which product fits a user's prompt constraints (such as budget, room size, or team workflow), making on-page review summaries essential for AI citations.",
  ],
  [
    "How do I do AI prompt SEO research for e-commerce and SaaS websites?",
    "Instead of targeting only 2-word head terms, test conversational buyer prompts that combine a persona, a constraint, a budget, and a pain point—then verify whether your product or comparison page directly answers each constraint.",
  ],
  [
    "Can I use these prompts for creative technology writing and informational guides?",
    "Yes—Stage #1 generates informational and problem-aware writing prompts for technology and educational guides, while Stages #2 through #4 transition readers into commercial comparisons and purchase-ready product pages.",
  ],
  [
    "Which tool should I use next to verify the search intent of my buyer keywords?",
    "Copy your target keywords into our Search Intent Checker to validate Informational, Commercial, and Transactional SERP signals, or group them into page clusters in our Keyword Clustering Tool.",
  ],
];

const BUYER_TEMPLATES = [
  {
    title: "1. ChatGPT & Claude Buyer Persona Research Prompt",
    badge: "Buyer Persona",
    prompt: `Act as a B2B & E-Commerce Buyer Psychologist. For [Product/Service] priced at [Price Tier] targeting [Ideal Buyer Persona], list the top 4 conversational search queries a buyer types into ChatGPT Search, Perplexity, and Google before purchasing—covering (1) Pain-Point Diagnosis, (2) Category Best-For Comparison, (3) Competitor Switching Cost, and (4) Review & Warranty Verification.`,
  },
  {
    title: "2. Product Page AI Visibility & Schema Audit Prompt",
    badge: "Product SEO & AEO",
    prompt: `Audit this product page copy for [Product Name] so it earns citations in Google AI Overviews and Perplexity Shopping. Keep the product name as H1, write a natural SEO title and single-sentence meta description, build a 4-column HTML comparison table against [Competitors], and output valid Product JSON-LD with Offer and AggregateRating properties.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function BuyerSearchPromptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free AI Buyer Search & Commercial Prompt Generator",
        alternateName: [
          "Generate 4 Buyer Search Prompts",
          "ChatGPT Buyer Persona Prompt Generator",
          "Product Page AI Visibility Prompt Generator",
          "E-Commerce & SaaS Commercial Prompt Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Generate 4 Buyer Search Prompts for SEO and AI Shopping Visibility",
        description:
          "Create 4 funnel-mapped buyer search prompts and product page optimization checklists in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your product or service and ideal buyer persona",
            text: "Specify what you sell and the exact buyer role or customer segment you want to attract.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Add pricing tier, primary pain point, and top competitors",
            text: "Include concrete pricing, the problem that triggers a search, and the alternatives buyers compare.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Include your verified proof or differentiator",
            text: "Add lab specs, setup speed, warranty terms, or ROI benchmarks that set your offer apart.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your 4 buyer search prompts and export to Markdown or CSV",
            text: "Use the 4 generated prompts across your problem guides, comparison pages, 'vs' pages, and product schema.",
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
            name: "AI Buyer Search & Commercial Prompt Generator",
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
              AI Buyer Search &amp; Commercial Prompt Generator
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                COMMERCIAL &amp; PRODUCT SEO · GENERATE 4 BUYER SEARCH PROMPTS
              </p>
              <h1 className={toolHeroHeading}>
                Free AI Buyer Search &amp; Commercial Prompt Generator
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Instantly <strong>generate 4 buyer search prompts</strong>{" "}
                mapped across{" "}
                <strong>
                  Problem Discovery, Category Shortlists, Competitor Versus
                  Comparisons, and Transactional Product Schema
                </strong>{" "}
                so your e-commerce and SaaS pages earn high-intent citations in
                Google AI Mode, ChatGPT Search, and Perplexity.
              </p>
              <div className="mt-5">
                <PortableToolHeroBar slug="buyer-search-prompt-generator" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                4-Stage Buyer Prompt Architecture
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>Stage 1 · Problem-Aware Discovery</strong>: Captures
                  informational &amp; technology pain-point queries.
                </li>
                <li>
                  • <strong>Stage 2 · Category &amp; Persona Shortlist</strong>:
                  Wins &ldquo;Best [Product] for [Persona] under [Price]&rdquo;
                  tables.
                </li>
                <li>
                  • <strong>Stages 3 &amp; 4 · Versus &amp; Product Schema</strong>
                  : Converts competitor switchers and review-checkers.
                </li>
              </ul>
            </div>
          </div>

          <BuyerSearchPromptClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Buyer Search Prompts &amp; Product AI Visibility
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Generate 4 Buyer Search Prompts for E-Commerce &amp; SaaS SEO
          </h2>
          <p className={prose}>
            To capture commercial buyers across Google and AI answer engines,
            map every product to <strong>4 buyer search prompts</strong>:{" "}
            <strong>(1) Pain-Point Diagnosis</strong> (informational root
            cause), <strong>(2) Persona &amp; Budget Shortlist</strong>{" "}
            (comparison table), <strong>(3) Competitor Versus Switch</strong>{" "}
            (head-to-head trade-offs), and{" "}
            <strong>(4) Transactional Review &amp; Schema Verification</strong>{" "}
            (pricing, warranty, and <code>Product</code> JSON-LD).
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            The 4 Buyer Search Stages: Intent, Prompt Structure &amp; Page Target
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Buyer Stage</th>
                  <th className="px-4 py-3.5">Conversational Buyer Query Pattern</th>
                  <th className="px-4 py-3.5">Target Page &amp; Schema Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    1. Problem Discovery
                  </td>
                  <td className="px-4 py-3.5">
                    &ldquo;How do [Persona] fix [Pain Point] without [Cost/Risk]?&rdquo;
                  </td>
                  <td className="px-4 py-3.5">
                    Educational Guide + 50-word Answer + <code>FAQPage</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    2. Category Shortlist
                  </td>
                  <td className="px-4 py-3.5">
                    &ldquo;Best [Category] for [Persona] under [Price] in 2026&rdquo;
                  </td>
                  <td className="px-4 py-3.5">
                    Category Hub + HTML Specs Table + <code>ItemList</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    3. Competitor Versus
                  </td>
                  <td className="px-4 py-3.5">
                    &ldquo;[Your Product] vs [Competitor] for [Use Case]&rdquo;
                  </td>
                  <td className="px-4 py-3.5">
                    Dedicated Comparison Page + Switching Checklist
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    4. Purchase &amp; Reviews
                  </td>
                  <td className="px-4 py-3.5">
                    &ldquo;Is [Product] worth [Price]? Verified specs &amp; reviews&rdquo;
                  </td>
                  <td className="px-4 py-3.5">
                    Product H1 Page + <code>Product</code> /{" "}
                    <code>SoftwareApplication</code> JSON-LD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Want to classify your full keyword list by buyer stage? Run your
            terms through our{" "}
            <Link
              href="/tools/search-intent-checker"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Search Intent Checker
            </Link>{" "}
            and calculate how many customers those commercial rankings will
            generate in our{" "}
            <Link
              href="/tools/seo-roi-calculator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Enterprise SEO ROI &amp; AI Cost Calculator
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for Buyer Personas &amp; Product Page AI Visibility
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {BUYER_TEMPLATES.map((item) => (
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
            Frequently Asked Questions: Buyer Search Prompts &amp; Product SEO
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

        <ToolResources slug="buyer-search-prompt-generator" />
      </div>
    </>
  );
}
