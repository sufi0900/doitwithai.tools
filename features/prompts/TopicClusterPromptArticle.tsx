import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopicClusterPromptLibrary from "./TopicClusterPromptLibrary";
import { topicClusterPromoGuides } from "./TopicClusterPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const topicClusterFaqs = [
  [
    "How do I know if two keywords belong on the same page or need two separate URLs?",
    "Compare the reader's task and the current top 10 search results for both queries. If 4 or more of the same URLs rank in the top 10 for both queries—or if answering one query naturally answers the other—group them onto a single canonical URL with an H2 subheading. Only create a second URL when the search intent or required page format differs (Prompts 12–22).",
  ],
  [
    "How do I stop my Pillar Page from cannibalizing its own child Spoke articles?",
    "Give the Pillar Page the 'Executive Overview & Routing' job: define each subtopic in 150 to 200 words, give a summary checklist, and link out with a clear descriptive anchor to the child Spoke for the 20+ examples, edge cases, and step-by-step walk-through (Prompts 23–33 and 66–75).",
  ],
  [
    "What is the ideal internal linking structure inside a Topic Cluster?",
    "Every child Spoke should link upward to its parent Pillar Hub within the first 300 words, the Pillar Hub should link downward to every child Spoke, and each Spoke should link horizontally to 2 to 3 adjacent sibling Spokes—plus at least one commercial tool or comparison page (Prompts 45–55).",
  ],
  [
    "Should I publish the Pillar Hub first or the supporting Spoke articles first?",
    "Publishing 5 to 6 foundational Spokes first (or launching the Pillar + 4 Spokes together as a batch) ensures your Pillar Hub immediately has real, indexed deep-dive pages to link out to rather than dead placeholder sections (Prompts 86–94).",
  ],
  [
    "Why do purely informational topic clusters sometimes fail to drive revenue?",
    "Clusters made of 100% top-of-funnel definitions attract readers who leave immediately after getting a quick definition. Always include middle- and bottom-of-funnel spokes in your topical map—such as 'X vs. Y' comparison matrices, template/prompt packs, and interactive free tools (Prompts 56–65).",
  ],
];

export default function TopicClusterPromptArticle({
  schema,
}: {
  schema: Record<string, unknown>;
}) {
  return (
    <article className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...schema,
            "@graph": [
              ...(schema["@graph"] as unknown[]),
              {
                "@type": "FAQPage",
                mainEntity: topicClusterFaqs.map(([name, text]) => ({
                  "@type": "Question",
                  name,
                  acceptedAnswer: { "@type": "Answer", text },
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300"
        >
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/prompts">Prompt library</Link>
          <span>/</span>
          <span aria-current="page">
            Topic clustering, pillar pages &amp; topical authority
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            94 PROMPTS · NINE TOPIC CLUSTERING &amp; TOPICAL AUTHORITY WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            94 ChatGPT Prompts for Topic Clustering, Pillar Pages &amp; Topical
            Authority
          </h1>
          <p className={body + " max-w-3xl"}>
            Architect 3-tier Pillar-and-Spoke topical maps, cluster keywords by
            SERP overlap, define anti-cannibalization scope boundaries, build
            bidirectional internal link matrices, and connect informational hubs
            to high-converting tools and comparison pages.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/author/sufian-mustafa"
              className="inline-flex min-w-0 items-center gap-3"
            >
              <Image
                src="/prompts/sufian-mustafa-portrait.webp"
                width={48}
                height={48}
                alt="Sufian Mustafa"
                className="!h-12 !w-12 shrink-0 rounded-full object-cover object-[center_25%]"
              />
              <span className="min-w-0 text-sm leading-6">
                <strong className="block">Sufian Mustafa</strong>Founder and
                author · Do It With AI Tools
              </span>
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Published November 1, 2026
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className={button + " bg-[#4058D0] text-white dark:text-white"}
              href="#topic-cluster-prompt-library"
            >
              Explore all 94 prompts
            </a>
            <a className={button} href="#topic-cluster-prompt-brief">
              Customize topical cluster brief
            </a>
            <Link className={button} href="/tools/topical-map-generator">
              Open AI Topical Map Studio
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/topic-clustering-topical-authority-prompts-hero-v2.webp"
            width={1600}
            height={900}
            alt="94 ChatGPT prompts for topic clustering, pillar pages, and topical authority beside a Hub and Spoke graph."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Topical authority architecture: 1 distinct search intent per URL,
            clear Pillar-to-Spoke scope boundaries, and 100% bidirectional
            internal linking.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Build connected topical silos instead of isolated blog posts
          </h2>
          <p className={body}>
            Publishing random, disconnected articles one keyword at a time
            leads to orphaned pages and accidental keyword cannibalization.
            Search engines and AI answer engines reward domains that cover a
            subject systematically—with a central Pillar Hub, clearly scoped
            child Spokes, semantic entity depth, and interactive tools.
          </p>
          <p className={body}>
            These 94 prompts guide you from initial domain mapping and SERP
            overlap clustering to Pillar Page outlines, internal link matrices,
            and 90-day publishing roadmaps.
          </p>
          <p className={body}>
            <strong>Fast Topical Authority Path:</strong> Start by mapping your
            domain with{" "}
            <a href="#cluster-prompt-001" className="underline font-semibold">
              Prompt 1 (3-Tier Topical Map)
            </a>
            , group your keyword list with{" "}
            <a href="#cluster-prompt-012" className="underline font-semibold">
              Prompt 12 (Single-URL Keyword Clustering)
            </a>
            , design your hub with{" "}
            <a href="#cluster-prompt-023" className="underline font-semibold">
              Prompt 23 (Pillar Page Blueprint)
            </a>
            , wire your internal links with{" "}
            <a href="#cluster-prompt-045" className="underline font-semibold">
              Prompt 45 (Hub &amp; Spoke Link Matrix)
            </a>
            , and resolve overlapping URLs with{" "}
            <a href="#cluster-prompt-066" className="underline font-semibold">
              Prompt 66 (GSC Cannibalization Audit)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={topicClusterPromoGuides.topicalMapStudio} />

        {/* 3-Step Topical Authority Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three rules of cannibalization-free topical clusters
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "One search intent = one canonical URL",
                "Combine close wording variations onto a single strong page rather than spinning up thin duplicate articles.",
              ],
              [
                "Set strict Include / Exclude boundaries",
                "Tell each spoke writer what to cover in depth and what to summarize in two sentences with a link to the sibling spoke.",
              ],
              [
                "Anchor every cluster in a free tool or study",
                "Place an interactive calculator, studio tool, or benchmark study inside your cluster to earn links and conversions.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Rule {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 94-Prompt Workbench */}
        <TopicClusterPromptLibrary />

        {/* Bottom Interactive Topical Authority Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>
              Do It With AI Tools · Topical Authority &amp; Clustering Studios
            </span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            ARCHITECT, CLUSTER &amp; AUDIT YOUR SILOS
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Generate topical maps, cluster keywords &amp; audit cannibalization
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 94 prompts with our interactive Topical Map, Keyword
            Clustering, and Internal Link studios to build durable organic
            authority.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["topical-map-generator", "AI Topical Map Generator"],
              ["keyword-clustering-tool", "Keyword Clustering Tool"],
              [
                "keyword-cannibalization-finder",
                "Keyword Cannibalization Finder",
              ],
              [
                "internal-link-opportunity-finder",
                "Internal Link Opportunity Finder",
              ],
              [
                "semantic-entity-gap-analyzer",
                "Semantic Entity & Content Gap Analyzer",
              ],
              [
                "comparison-page-generator",
                "X vs. Y Comparison Page Builder",
              ],
              [
                "gsc-striking-distance-finder",
                "GSC Striking Distance Finder",
              ],
              [
                "framework-matrix-diagram-builder",
                "Hub & Spoke Diagram Builder",
              ],
            ].map(([slug, label]) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                href={`/tools/${slug}`}
                key={slug}
              >
                {label} ↗
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="my-12" aria-labelledby="cluster-faq-title">
          <h2 id="cluster-faq-title" className="text-3xl font-bold">
            Topic clustering, pillar pages &amp; topical authority FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {topicClusterFaqs.map(([q, a]) => (
              <details
                key={q}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <summary className="cursor-pointer text-lg font-bold">
                  {q}
                </summary>
                <p className={body}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Prompt Guides Mesh */}
        <section className="my-12" aria-labelledby="related-prompts-title">
          <h2 id="related-prompts-title" className="text-3xl font-bold">
            Related prompt guides to continue your workflow
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Link
                href="/prompts/keyword-research-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    100 Keyword Research Prompts for SEO & YouTube
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Discover seed queries, long-tail modifiers, and competitor keyword gaps to feed your topical map.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/on-page-seo-content-writing-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    84 On-Page SEO, Headings, E-E-A-T & Readability Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Execute each spoke brief with question-led H1–H3 headings and 45-word snippet definitions.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/ai-search-aeo-geo-visibility-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    91 AI Search, AEO, GEO & Citation Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Connect your cluster entities in a unified JSON-LD @graph and optimize for Query Fan-Out.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/technical-seo-audit-schema-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    76 Technical SEO Audit, Schema & CWV Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Audit canonical signals, internal link depth, and XML sitemaps across your entire topical silo.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#topic-cluster-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#topic-cluster-prompt-library">
            Return to prompt library ↑
          </a>
          <Link className={button} href="/prompts">
            Browse all 13 prompt guides →
          </Link>
        </div>
      </div>
    </article>
  );
}
