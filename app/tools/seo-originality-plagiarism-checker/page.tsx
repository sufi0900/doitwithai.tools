import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import SeoOriginalityPlagiarismClient from "@/features/seo-originality-plagiarism-checker/SeoOriginalityPlagiarismClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/seo-originality-plagiarism-checker";
const description =
  "Check your SEO content for n-gram plagiarism, AI writing clichés, information gain, and Google rapid index readiness with instant humanized rewrites.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free SEO Plagiarism, Originality & Rapid Index Checker",
  category: "AI SEO · Content Originality & Indexing",
  ctaText: "Scan. Humanize. Index.",
  features: "4-Gram Anti-Plagiarism,AI Cliché Removal,Rapid Index Readiness",
})}`;

export const metadata: Metadata = {
  title: "Free SEO Plagiarism, Originality & Rapid Index Checker",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free SEO Plagiarism, Originality & Rapid Index Checker",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO Plagiarism, Originality & Rapid Index Checker",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "How does a free SEO tools plagiarism checker differ from an academic plagiarism scanner?",
    "An SEO anti-plagiarism and originality checker evaluates 4-gram shingle overlap across competitor SERP snippets and sister pages on your own domain so your URLs avoid Google's 'Duplicate without user-selected canonical' and 'Crawled - currently not indexed' exclusions.",
  ],
  [
    "Why is my page stuck in 'Crawled - currently not indexed' in Google Search Console?",
    "Pages remain in 'Crawled - currently not indexed' when their opening paragraphs repeat generic definitions already covered by hundreds of sites or share boilerplate template text with other URLs on your domain without adding unique benchmarks, tables, or first-hand evidence.",
  ],
  [
    "How do readers and search quality raters know if SEO content is AI generated?",
    "While no detector can prove authorship with certainty, unedited AI drafts exhibit uniform 15–18 word sentence lengths (low burstiness), repetitive transitional clichés ('delve into', 'in today's fast-paced digital landscape', 'testament to'), and zero primary measurements or named edge cases.",
  ],
  [
    "How do I make AI content creation for SEO sound human and factual?",
    "Strip throat-clearing transitions, alternate short 8-word takeaways with detailed 22-word technical explanations, replace vague adjectives with exact dates or Search Console figures, and lead every section with a direct 50-word answer.",
  ],
  [
    "What is a safe 4-gram shingle overlap percentage for programmatic SEO pages?",
    "Keep shared 4-word shingle overlap below 12%–15% between sibling pages on the same domain, and ensure every programmatic URL renders unique entity attributes, localized data, or interactive calculations in the initial HTML.",
  ],
  [
    "Once my page passes the Rapid Index Readiness check, how should I submit it?",
    "Confirm the page returns HTTP 200 with a self-referencing canonical tag, link to it from at least 3 already-indexed pages on your site, and submit an instant ping using our IndexNow Key Generator alongside your XML sitemap.",
  ],
];

const ORIGINALITY_PROMPTS = [
  {
    title: "1. Anti-Cliché & High-Information-Gain Rewrite Prompt",
    badge: "Human Cadence",
    prompt: `Rewrite the following draft about [Target Keyword] so it sounds like a seasoned practitioner sharing first-hand findings. Remove all synthetic transitions ("delve into", "moreover", "in today's fast-paced landscape", "testament to"), vary sentence length between 7 and 24 words, and open with a concrete 50-word Quick Answer backed by specific benchmarks.`,
  },
  {
    title: "2. 'Crawled - Currently Not Indexed' Recovery Audit Prompt",
    badge: "Rapid Indexation",
    prompt: `Audit this URL draft for Google's Information Gain and canonical distinctiveness. Identify any paragraphs that repeat generic SERP consensus, suggest 3 unique data points or comparison table columns we can add, and write a distinct 150-word lead that differentiates this page from sibling URLs on our domain.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function SeoOriginalityPlagiarismCheckerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free SEO Plagiarism, Originality & Rapid Index Checker",
        alternateName: [
          "Free SEO Tools Plagiarism Checker",
          "SEO Tool Rapid Index Checker",
          "SEO Tools Anti Plagiarism",
          "AI Content Humanizer & Information Gain Checker",
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
        name: "How to Check SEO Content for Plagiarism, AI Clichés, and Rapid Index Readiness",
        description:
          "Audit 4-gram shingle originality, human sentence burstiness, and Google index readiness in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your target keyword and canonical URL",
            text: "Specify the primary keyword and canonical URL you want Google and AI engines to index.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Paste your draft and optional competitor or sister-page text",
            text: "Paste your article draft along with any reference snippet to measure exact 4-gram shingle overlap.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Review Shingle Originality, Human Cadence, and Information Gain scores",
            text: "Inspect flagged AI clichés, overlapping 4-word shingles, and sentence-length burstiness.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your humanized rewrite and export the audit",
            text: "Copy the cleaned, high-information-gain rewrite or export the full diagnostic report to Markdown or CSV.",
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
            name: "SEO Plagiarism, Originality & Rapid Index Checker",
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
              SEO Plagiarism, Originality &amp; Rapid Index Checker
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                CONTENT ORIGINALITY · 4-GRAM ANTI-PLAGIARISM &amp; RAPID INDEXING
              </p>
              <h1 className={toolHeroHeading}>
                Free SEO Plagiarism, Originality &amp; Rapid Index Checker
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Scan your drafts for{" "}
                <strong>4-gram shingle duplication</strong>,{" "}
                <strong>synthetic AI writing clichés</strong>,{" "}
                <strong>sentence burstiness</strong>, and{" "}
                <strong>Google Information Gain signals</strong> so your pages
                sound authentically human and clear{" "}
                <em>&ldquo;Crawled - currently not indexed&rdquo;</em> hurdles.
              </p>
              <div className="mt-5">
                <PortableToolHeroBar
                  title="Free SEO Plagiarism, Originality & Rapid Index Checker"
                  path="/tools/seo-originality-plagiarism-checker"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Why Originality Drives Indexation
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>4-Gram Shingle Scanner</strong>: Detects exact phrase
                  collisions against competitor snippets or sibling templates.
                </li>
                <li>
                  • <strong>AI Footprint &amp; Burstiness Audit</strong>: Flags
                  predictable LLM transitions and uniform sentence lengths.
                </li>
                <li>
                  • <strong>Rapid Index Readiness Score</strong>: Verifies E-E-A-T
                  evidence density before you ping Search Console or IndexNow.
                </li>
              </ul>
            </div>
          </div>

          <SeoOriginalityPlagiarismClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Anti-Plagiarism &amp; Index Readiness
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Pass SEO Originality and Google Rapid Index Checks
          </h2>
          <p className={prose}>
            To prevent duplicate content exclusions and pass rapid index checks,
            keep <strong>4-gram shingle overlap below 12%</strong> across
            competitor and sister URLs, eliminate predictable AI transition
            clichés, maintain a{" "}
            <strong>sentence-length burstiness above ±5.5 words</strong>, and
            include verifiable <strong>Information Gain</strong> (metrics,
            benchmarks, or interactive tools) in your opening 200 words.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            SEO Originality Signals: Indexed Pages vs. Excluded Drafts
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Quality Dimension</th>
                  <th className="px-4 py-3.5">Rapidly Indexed SEO Page</th>
                  <th className="px-4 py-3.5">
                    &ldquo;Crawled - Not Indexed&rdquo; Risk
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    4-Gram Shingle Overlap
                  </td>
                  <td className="px-4 py-3.5">
                    &lt; 12% shared phrases; distinct opening 150-word lead
                  </td>
                  <td className="px-4 py-3.5">
                    &gt; 35% template repetition across sibling or SERP pages
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Information Gain &amp; Evidence
                  </td>
                  <td className="px-4 py-3.5">
                    Specific dates, test metrics, tables &amp; edge-case answers
                  </td>
                  <td className="px-4 py-3.5">
                    Generic consensus summaries without primary numbers
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Human Sentence Burstiness
                  </td>
                  <td className="px-4 py-3.5">
                    ±6 to ±10 word variation mixing concise and deep sentences
                  </td>
                  <td className="px-4 py-3.5">
                    Monotonous 16-word sentences with &ldquo;delve into&rdquo; &amp;
                    &ldquo;moreover&rdquo;
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Canonical &amp; Internal Discovery
                  </td>
                  <td className="px-4 py-3.5">
                    Self-referencing canonical + 3 contextual internal links
                  </td>
                  <td className="px-4 py-3.5">
                    Orphaned URL or conflicting canonical/noindex directives
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Once your draft scores 80+ on originality and information gain,
            generate your instant submission key with our{" "}
            <Link
              href="/tools/indexnow-key-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              IndexNow Key Generator
            </Link>{" "}
            and verify how Claude, Copilot, and Perplexity extract your answers
            in the{" "}
            <Link
              href="/tools/claude-copilot-seo-analyzer"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Claude, Copilot &amp; Multi-LLM SEO Analyzer
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for Humanizing SEO Content &amp; Fixing Index Exclusions
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {ORIGINALITY_PROMPTS.map((item) => (
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
            Frequently Asked Questions: SEO Plagiarism, AI Detection &amp; Rapid Indexing
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

        <ToolResources slug="seo-originality-plagiarism-checker" />
      </div>
    </>
  );
}
