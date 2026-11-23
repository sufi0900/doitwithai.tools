import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import KgrCalculatorClient from "@/features/keyword-golden-ratio-calculator/KgrCalculatorClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/keyword-golden-ratio-calculator";
const description =
  "Calculate the Keyword Golden Ratio (KGR) and profile keyword affinity score for up to 50 queries at once to spot low-competition terms that rank fast.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Keyword Golden Ratio (KGR) & Affinity Calculator",
  category: "AI SEO · Low-Competition Keywords",
  ctaText: "Calculate. Filter. Rank.",
  features: "Bulk KGR Scoring,1-Click Allintitle Check,Keyword Affinity Score",
})}`;

export const metadata: Metadata = {
  title: "Free Keyword Golden Ratio (KGR) & Affinity Calculator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Keyword Golden Ratio (KGR) & Affinity Calculator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keyword Golden Ratio (KGR) & Affinity Calculator",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What is the Keyword Golden Ratio (KGR) formula?",
    "The Keyword Golden Ratio (KGR) is the number of Google results that include the exact keyword phrase in their <title> tag (found using the allintitle: search operator) divided by the monthly search volume, where the monthly search volume is 250 or less: KGR = Allintitle Results ÷ Monthly Search Volume.",
  ],
  [
    "What is a good KGR score?",
    "A KGR score under 0.25 is considered a 'Bargain' or low-competition sweet spot because fewer than 1 in 4 searches has a competing page with that exact phrase in its title tag. A score between 0.25 and 1.00 is moderate competition ('Might Work'), and anything above 1.00 is competitive.",
  ],
  [
    "Why is the classic KGR threshold capped at 250 monthly searches?",
    "Keywords with 250 or fewer monthly searches are often overlooked by large media sites, allowing newer domains to rank in the top 50 faster. However, if a higher-volume keyword (for example, 500 to 1,000 searches) also has a ratio below 0.25, our calculator flags it as a 'High-Vol Gem'.",
  ],
  [
    "How do I check the exact allintitle count on Google?",
    "Type allintitle:\"your exact keyword\" in Google Search (with quotes around the phrase so Google checks the exact word order) or click the 'Verify live allintitle on Google' button inside any row of our calculator above.",
  ],
  [
    "How is LinkedIn or Profile Keyword Affinity Score calculated?",
    "Keyword Affinity measures how consistently your target specialty keywords appear across weighted profile or landing-page zones: Headline / H1 (35% weight), About / Opening Summary (25% weight), Experience / Case Studies (25% weight), and Skills / Tags (15% weight).",
  ],
  [
    "Should I create a separate page for every KGR < 0.25 keyword?",
    "No. Always check search intent first: if two KGR bargain keywords ask the exact same question (such as 'free keyword grouper' and 'keyword grouping tool free'), combine them onto a single stronger page using our Keyword Clustering Tool to prevent keyword cannibalization.",
  ],
];

const KGR_PROMPTS = [
  {
    title: "1. Long-Tail KGR Candidate Seed Generator",
    badge: "KGR Ideation",
    prompt: `Act as an SEO Strategist. Generate 25 ultra-specific long-tail keyword ideas (4 to 6 words each) in the [Your Niche] niche that likely have under 250 monthly searches and very few exact-match title tags—focusing on 'how to', 'calculator', 'template', and problem-solving modifiers.`,
  },
  {
    title: "2. LinkedIn Headline & About Section Affinity Optimizer",
    badge: "Keyword Affinity",
    prompt: `Rewrite my LinkedIn Headline and 150-word About summary so they naturally achieve 90%+ keyword affinity for these target terms without sounding stuffed: [Keyword 1, Keyword 2, Keyword 3, Keyword 4].`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function KgrCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Keyword Golden Ratio (KGR) & Affinity Calculator",
        alternateName: [
          "Keyword Golden Ratio Calculator",
          "KGR Calculator",
          "LinkedIn Keyword Affinity Score Calculator",
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
        name: "How to Calculate the Keyword Golden Ratio (KGR)",
        description:
          "Find low-competition keywords using the Allintitle-to-Volume KGR formula in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Find long-tail keywords with ≤ 250 monthly searches",
            text: "Collect specific 3-to-6 word search phrases relevant to your niche with monthly search volume up to 250.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Check Google allintitle results",
            text: "Click the 'allintitle:' button in the calculator to see how many pages include that exact phrase in their HTML <title> tag.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Divide Allintitle by Monthly Search Volume",
            text: "Run the calculator to divide Allintitle by Volume. Target keywords scoring below 0.25 (Green Bargain tier).",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Group synonyms and publish",
            text: "Group closely related KGR keywords onto one page and front-load the primary phrase in your Meta Title (<580px).",
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
            name: "Keyword Golden Ratio (KGR) Calculator",
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
              Keyword Golden Ratio (KGR) Calculator
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI SEO · LOW-COMPETITION KEYWORD &amp; AFFINITY SCORING
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Keyword Golden Ratio (KGR) &amp;{" "}
                <span className={toolHeroHeading}>
                  Affinity Calculator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Calculate the <strong>Keyword Golden Ratio</strong> (
                <code>Allintitle ÷ Search Volume</code>) for up to 50 keywords
                at once, verify live Google <code>allintitle:</code> counts in
                one click, and score your LinkedIn or landing-page keyword
                affinity.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Bulk KGR Calculator (Up to 50 Rows)
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-Click Google allintitle: Launcher
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  LinkedIn &amp; Page Affinity Scorer
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                KGR Scoring Thresholds at a Glance
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    🟢 KGR &lt; 0.25 (Bargain):
                  </strong>{" "}
                  Underserved search query with minimal exact-title competition.
                </li>
                <li>
                  <strong className="text-amber-300">
                    🟡 KGR 0.25 – 1.00 (Might Work):
                  </strong>{" "}
                  Moderate competition; win with strong E-E-A-T and interactive
                  tools.
                </li>
                <li>
                  <strong className="text-rose-300">
                    🔴 KGR &gt; 1.00 (Competitive):
                  </strong>{" "}
                  Saturated title tags; require deeper topical authority and
                  backlinks.
                </li>
                <li>
                  <strong className="text-sky-300">
                    🔵 Profile Keyword Affinity:
                  </strong>{" "}
                  Scores keyword placement across Headline, Summary, Experience,
                  and Skills.
                </li>
              </ul>
            </div>
          </div>

          <KgrCalculatorClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD FORMULA BOX */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · KGR Formula
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How Does the Keyword Golden Ratio (KGR) Work?
          </h2>
          <p className={prose}>
            The <strong>Keyword Golden Ratio (KGR)</strong> is a data-driven
            method for finding underserved long-tail keywords by dividing the
            number of Google search results that contain the exact keyword
            phrase in their page title (<code>allintitle:</code>) by the
            monthly search volume (when search volume is 250 or less). When{" "}
            <code>KGR &lt; 0.25</code>, supply is significantly lower than
            searcher demand.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            KGR Score Tiers &amp; Recommended SEO Action Plan
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">KGR Score Range</th>
                  <th className="px-4 py-3.5">Max Allintitle (at 200 Vol)</th>
                  <th className="px-4 py-3.5">Competition Level</th>
                  <th className="px-4 py-3.5">Recommended Publishing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    Under 0.25 (Great / Bargain)
                  </td>
                  <td className="px-4 py-3.5">≤ 50 allintitle results</td>
                  <td className="px-4 py-3.5">Very Low Title Supply</td>
                  <td className="px-4 py-3.5">
                    Publish immediately with exact phrase in Meta Title (&lt;580px) and H1.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-amber-600 dark:text-amber-400">
                    0.25 to 1.00 (Might Work)
                  </td>
                  <td className="px-4 py-3.5">51 – 200 allintitle results</td>
                  <td className="px-4 py-3.5">Moderate Competition</td>
                  <td className="px-4 py-3.5">
                    Add an interactive calculator, comparison table, and strong internal links.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                    Over 1.00 (Competitive)
                  </td>
                  <td className="px-4 py-3.5">201+ allintitle results</td>
                  <td className="px-4 py-3.5">High Title Saturation</td>
                  <td className="px-4 py-3.5">
                    Use as a broader pillar topic while targeting KGR &lt; 0.25 supporting spokes first.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Once you shortlist your KGR winners, verify their SERP format in the{" "}
            <Link
              href="/tools/search-intent-checker"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Search Intent Checker
            </Link>{" "}
            and group overlapping variants in the{" "}
            <Link
              href="/tools/keyword-clustering-tool"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Keyword Clustering Tool
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for KGR Research &amp; Keyword Affinity
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {KGR_PROMPTS.map((item) => (
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
            Frequently Asked Questions: KGR &amp; Keyword Affinity
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

        <ToolResources slug="keyword-golden-ratio-calculator" />
      </div>
    </>
  );
}
