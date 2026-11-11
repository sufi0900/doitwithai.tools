import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import KeywordClusteringClient from "@/features/keyword-clustering/KeywordClusteringClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/keyword-clustering-tool";
const description =
  "Group your raw keyword list or CSV export into page-level topic clusters by shared search intent so you can plan stronger SEO pages without cannibalization.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "AI Keyword Clustering & Grouping Tool",
  category: "AI SEO · Content Planning",
  ctaText: "Group. Cluster. Plan.",
  features: "Search-Intent Clustering,Instant Word Grouping,CSV Import & Export",
})}`;

export const metadata: Metadata = {
  title: "Free AI Keyword Clustering Tool: Group Keywords by Intent",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Keyword Clustering Tool: Group Keywords by Intent",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Keyword Clustering Tool: Group Keywords by Intent",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What is the difference between keyword grouping and keyword clustering?",
    "In everyday SEO, both solve the exact same problem—organizing a messy keyword list into structured buckets so you know what to publish. The subtle distinction is that basic keyword grouping often sorts phrases by shared words (like grouping every phrase containing 'meta title'), whereas search-intent clustering groups phrases by whether they belong on the same webpage (separating 'how to write meta titles' into an educational guide and 'meta title generator' into an interactive tool).",
  ],
  [
    "Is this keyword grouping and clustering tool completely free?",
    "Yes, you can paste up to 80 keywords per batch or upload a CSV/TSV export, group them using either AI Search-Intent Clustering or the 0.1-second Instant Word Grouper, refine your groups, and export your content plan without paying or logging in.",
  ],
  [
    "How do I decide whether a group of keywords belongs on one page or separate pages?",
    "Ask the Single-Page Intent Question: would a searcher typing Keyword A be completely satisfied landing on the exact same page as Keyword B? When two queries share the same reader task and expected page format, keep them in one cluster on a single canonical URL.",
  ],
  [
    "Can I import a CSV export from Google Search Console, Ahrefs, or Semrush?",
    "Yes, upload any CSV or TSV file under 100 KB, pick the column that holds your queries, and the workspace will remove exact duplicates while keeping every unique keyword accounted for.",
  ],
  [
    "Can I split, merge, or move keywords after the tool groups them?",
    "Yes, select any keyword checkboxes in the workspace to move them into another cluster, split a broad group into two specialized page briefs, merge overlapping synonym groups, or undo recent edits in one click.",
  ],
  [
    "How does grouping keywords into clusters stop keyword cannibalization?",
    "Keyword cannibalization happens when two or more pages on your site target slight wording variations of the same reader need, splitting your impressions and backlinks. Consolidating those variations into one cluster with one target URL focuses all ranking signals on a single authoritative page.",
  ],
  [
    "What should I do after organizing my keyword clusters?",
    "Assign a target URL to each cluster, check borderline queries in the Search Intent Checker, and export your reviewed cluster brief into the SEO Content Brief Generator or Article Outline Generator.",
  ],
];

const CLUSTER_PROMPTS = [
  {
    title: "1. Search-Intent Keyword Clustering Prompt",
    badge: "Prevent Cannibalization",
    prompt: `Act as a Senior SEO Strategist. Group the following raw keyword list into page-level clusters based on shared search intent rather than shared words alone. For each cluster, provide: (1) Cluster Name, (2) Primary Target Keyword, (3) Supporting Secondary Keywords, (4) Expected Page Format (Guide, Comparison, or Interactive Tool), and (5) Suggested URL Slug.\n\nKeywords:\n[Paste 20-80 keywords here]`,
  },
  {
    title: "2. Pillar & Spoke Topic Architecture Prompt",
    badge: "Topical Authority",
    prompt: `Take these grouped keyword clusters for [Your Niche] and organize them into 1 central Pillar Guide and 5-8 supporting Spoke pages, including the exact natural anchor text each spoke should use when linking back to the Pillar page.`,
  },
  {
    title: "3. Search Console Striking-Distance Grouping Prompt",
    badge: "GSC Optimization",
    prompt: `Here are queries from Google Search Console where my page gets impressions between positions 15 and 85. Separate them into: (A) Same-intent phrasing variations to weave naturally into my existing H2s and FAQs, and (B) Distinct reader tasks that deserve their own dedicated page.\n\nGSC Queries:\n[Paste GSC queries here]`,
  },
  {
    title: "4. Modifier & Funnel Stage Sorting Prompt",
    badge: "Fast Taxonomy",
    prompt: `Sort this keyword list by user journey stage: (1) Top-of-Funnel Learning ('how to', 'what is', 'examples'), (2) Mid-Funnel Evaluation ('best', 'vs', 'alternatives'), and (3) Bottom-of-Funnel Action ('tool', 'generator', 'template', 'near me').`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Keyword Clustering & Grouping Tool",
        alternateName: [
          "Keyword Grouping Tool",
          "Keyword Grouper",
          "Free AI Keyword Clustering Tool",
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
          { name: "Keyword Clustering Tool", item: pageUrl },
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
            <span aria-current="page">Keyword Clustering Tool</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI SEO · KEYWORD GROUPING &amp; SEARCH-INTENT CLUSTERING
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Keyword Clustering Tool:{" "}
                <span className={toolHeroHeading}>
                  Group Your Keywords by Search Intent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Paste a raw keyword list or upload a CSV to group related
                searches into single-page topic clusters—so you know when to
                write one comprehensive guide versus separate pages.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Paste list or import CSV/TSV
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  AI Intent + Instant Stem Grouping
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Split, merge &amp; export briefs
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Outputs in Every Cluster Plan
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    Primary Hub Keyword:
                  </strong>{" "}
                  Selects a clear representative target query for each topic
                  group.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    Shared Reader Task:
                  </strong>{" "}
                  Explains why the grouped phrases belong on the same page.
                </li>
                <li>
                  <strong className="text-sky-300">Page Format &amp; Focus:</strong>{" "}
                  Recommends whether the cluster needs a guide, comparison, or
                  interactive tool.
                </li>
                <li>
                  <strong className="text-amber-300">
                    Editable Workspace:
                  </strong>{" "}
                  Move, split, merge, and export clusters as CSV, JSON, or
                  Markdown.
                </li>
              </ul>
            </div>
          </div>
          <KeywordClusteringClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* CLEAR, NATURAL EXPLANATION: KEYWORD GROUPING VS KEYWORD CLUSTERING */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Clear Up the Confusion
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Keyword Grouping vs. Keyword Clustering: Are They Different?
          </h2>
          <p className={prose}>
            Many marketers wonder whether they need a{" "}
            <strong>keyword grouping tool</strong> (or keyword grouper) or a{" "}
            <strong>keyword clustering tool</strong>. In practice, both refer to
            the same core workflow: taking an unsorted list of keywords and
            organizing them into structured page groups so you don&apos;t create
            multiple pages that compete against each other.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Approach</th>
                  <th className="px-4 py-3.5">How It Sorts Your List</th>
                  <th className="px-4 py-3.5">When to Use It</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    Word &amp; Stem Grouping (Fast Grouper)
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Groups phrases instantly by shared root words and modifier
                    type (guides vs. comparisons vs. tools).
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Great for a 0.1-second first pass on a raw keyword list.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    AI Search-Intent Clustering
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Groups queries that share the exact same reader goal and
                    belong on a single destination URL.
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Best for finalizing page briefs and preventing keyword
                    cannibalization.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Need to check the intent of a few specific queries before grouping a
            large batch? Run them through our{" "}
            <Link
              href="/tools/search-intent-checker"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Search Intent Checker
            </Link>{" "}
            first, discover new seed terms in the{" "}
            <Link
              href="/tools/keyword-research-tool"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Keyword Research Tool
            </Link>
            , or read our full guide on{" "}
            <Link
              href="/ai-seo/what-to-do-after-keyword-research"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              What to Do After Keyword Research
            </Link>
            .
          </p>
        </section>

        {/* VISUAL DIAGRAMS */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Visual Workflow
          </p>
          <h2 className="mt-2 text-3xl font-black">
            How Intent-Based Keyword Grouping Shapes Your Site Architecture
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/articles/what-to-do-after-keyword-research/keyword-clustering-intent-mapping.webp"
                alt="Grouping keywords into page-level topic clusters by shared search intent"
                className="w-full rounded-2xl object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 px-2 text-xs leading-6 text-slate-300">
                <strong className="text-white">
                  1. Group by Reader Task, Not Just Shared Words:
                </strong>{" "}
                Why phrases that share a topic still separate into distinct
                guide and tool pages when search intent differs.
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/articles/what-to-do-after-keyword-research/topic-cluster-pillar-architecture.webp"
                alt="Pillar page and supporting cluster spoke internal linking diagram"
                className="w-full rounded-2xl object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 px-2 text-xs leading-6 text-slate-300">
                <strong className="text-white">
                  2. Connect Clusters into a Hub-and-Spoke Map:
                </strong>{" "}
                Once your clusters are defined, link supporting tutorials and
                tools back to your main pillar guide.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* PRACTICAL WORKFLOW */}
        <section>
          <h2 className="text-3xl font-black">
            A Practical Workflow from Keyword List to Page Brief
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "01",
                "Paste a focused batch",
                "Paste 2–80 unique keywords or import a CSV/TSV column. Duplicate rows are cleaned automatically before grouping.",
              ],
              [
                "02",
                "Pick your grouping mode",
                "Use 'Group Keywords with AI' for context-aware search intent clustering, or 'Instant Word & Stem Grouper' for immediate sorting.",
              ],
              [
                "03",
                "Inspect each cluster",
                "Check the representative primary keyword, reader task, and suggested page format to confirm all terms belong on one URL.",
              ],
              [
                "04",
                "Split, merge, or move terms",
                "Refine the workspace by splitting mixed groups into separate pages or merging close synonyms into a single stronger cluster.",
              ],
              [
                "05",
                "Map to existing pages first",
                "Check whether an existing URL on your site already covers that cluster before creating a brand-new page.",
              ],
              [
                "06",
                "Export and outline",
                "Download your plan as CSV, Markdown, or JSON, then send your cluster into the Article Outline Generator or SEO Content Brief Generator.",
              ],
            ].map(([n, title, body]) => (
              <article
                key={n}
                className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-900"
              >
                <span className="font-black text-[#4662df] dark:text-blue-300">
                  {n}
                </span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className={prose}>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* COPY-PASTE PROMPTS */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Copy-Paste AI Prompts
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Prompts to Group and Cluster Keywords with AI
          </h2>
          <p className={prose}>
            Use these prompts when working in ChatGPT, Claude, or Gemini—or
            browse our full{" "}
            <Link
              href="/prompts/chatgpt-prompts-for-keyword-research"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Keyword Research Prompts
            </Link>{" "}
            and{" "}
            <Link
              href="/prompts/chatgpt-prompts-for-topic-clusters"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Topic Cluster Prompts
            </Link>{" "}
            collections:
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {CLUSTER_PROMPTS.map((item) => (
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
            Frequently Asked Questions: Grouping &amp; Clustering Keywords
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

        <ToolResources slug="keyword-clustering-tool" />
      </div>
    </>
  );
}
