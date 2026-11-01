import React from "react";
import Image from "next/image";
import Link from "next/link";
import LinkBuildingPromptLibrary, {
  linkBuildingPromoGuides,
} from "./LinkBuildingPromptLibrary";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const linkBuildingFaqs = [
  [
    "Why do most cold link-building outreach emails get ignored or marked as spam?",
    "Editors delete templated outreach that opens with fake flattery ('I was browsing your blog this morning and loved your awesome post!') or asks for a link without adding value. Keep your email under 100 words, name the exact section of their article you read, and offer a specific chart, updated 2026 statistic, or free calculator that helps their readers (Prompts 34–44).",
  ],
  [
    "What makes a HARO, Connectively, or Qwoted pitch actually get selected by a journalist?",
    "Reporters scan dozens of replies under tight deadlines. Lead your first sentence with a direct, quotable answer to their question, back it with 2 sentences of concrete proof or a real number, and strip out all AI clichés ('In today's fast-paced world', 'delve', 'testament'). End with a 1-sentence credential bio (Prompts 23–33).",
  ],
  [
    "How do I earn high-authority links if I don't have a huge proprietary database?",
    "You do not need millions of rows of data to publish a citable study. Auditing 100 real industry examples, compiling a verified pricing transparency guide, or shipping a free interactive calculator gives journalists and bloggers a primary source they can cite (Prompts 1–22).",
  ],
  [
    "What is a safe anchor text ratio for backlinks?",
    "Natural editorial backlink profiles are dominated by Branded anchors ('Do It With AI Tools'), Naked URLs, and natural descriptive phrases ('this 2026 benchmark study'). If Exact-Match commercial keyword anchors exceed 10–15% of your profile, it can look manipulative to search engines (Prompts 78–81).",
  ],
  [
    "Should I disavow every low-DR or strange scraper link that shows up in Ahrefs or Semrush?",
    "No. Google's systems automatically ignore routine scraper and directory spam. Only submit a Google Search Console `disavow.txt` file if you have a Manual Action for unnatural links or know that a past agency built paid/manipulative links that could trigger one (Prompts 80–81).",
  ],
];

export default function LinkBuildingPromptArticle({
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
                mainEntity: linkBuildingFaqs.map(([name, text]) => ({
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
            Link building, Digital PR &amp; outreach
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            88 PROMPTS · EIGHT LINK BUILDING, DIGITAL PR &amp; OUTREACH
            WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            88 ChatGPT Prompts for Link Building, Digital PR &amp; Journalist
            Outreach
          </h1>
          <p className={body + " max-w-3xl"}>
            Plan citable data studies and interactive calculators, craft
            150-word HARO and journalist quotes, write personalized under-100-word
            outreach emails, analyze competitor link gaps, reclaim unlinked
            mentions, and audit anchor text safety.
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
              href="#link-building-prompt-library"
            >
              Explore all 88 prompts
            </a>
            <a className={button} href="#link-building-prompt-brief">
              Customize Digital PR &amp; outreach brief
            </a>
            <Link
              className={button}
              href="/tools/digital-pr-linkable-asset-planner"
            >
              Open Digital PR Asset Planner
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/link-building-digital-pr-prompts-hero.webp"
            width={1600}
            height={900}
            alt="88 ChatGPT prompts for link building, Digital PR data studies, and journalist outreach beside an editorial pitch workbench."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Editorial authority system: Combine citable data studies, 150-word
            journalist quotes, link intersect prospecting, and unlinked mention
            reclamation.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Earn editorial links that build both search authority and AI
            corroboration
          </h2>
          <p className={body}>
            Both traditional search engines and AI answer engines (Google AI
            Overviews, ChatGPT Search, and Perplexity) rely on third-party
            editorial citations to verify which brands and studies are trusted
            in a category.
          </p>
          <p className={body}>
            Generic mass-blasted outreach emails no longer work. Earning real
            editorial links requires giving writers something worth citing—a
            verified statistic, an embeddable chart card, a free micro-tool, or
            a sharp practitioner quote—and pitching it with brevity and respect.
          </p>
          <p className={body}>
            <strong>Fast Link Building Path:</strong> Start by planning a
            citable asset with{" "}
            <a href="#linkpr-prompt-001" className="underline font-semibold">
              Prompt 1 (Citation Magnet Data Studies)
            </a>
            , extract press angles with{" "}
            <a href="#linkpr-prompt-012" className="underline font-semibold">
              Prompt 12 (5 Digital PR Angles)
            </a>
            , answer reporter queries with{" "}
            <a href="#linkpr-prompt-023" className="underline font-semibold">
              Prompt 23 (150-Word HARO Pitch)
            </a>
            , send personalized emails with{" "}
            <a href="#linkpr-prompt-034" className="underline font-semibold">
              Prompt 34 (95-Word Editorial Gap Pitch)
            </a>
            , and reclaim existing mentions with{" "}
            <a href="#linkpr-prompt-056" className="underline font-semibold">
              Prompt 56 (Unlinked Brand Mention)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={linkBuildingPromoGuides.digitalPrPlanner} />

        {/* 3-Step Link Building Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three rules for sustainable Digital PR &amp; editorial outreach
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Build something writers need to cite",
                "Journalists and bloggers link to primary numbers, methodology notes, free calculators, and clean visual charts that save them explanation time.",
              ],
              [
                "Lead with the quote or finding",
                "Put your contrarian stat or 3-sentence expert quote in the first 50 words of your email—never bury it beneath three paragraphs of bio.",
              ],
              [
                "Bridge PR authority to money pages",
                "Add contextual internal links and interactive tool cards inside your high-backlink research pages so authority flows to your core product URLs.",
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

        {/* Main Interactive 88-Prompt Workbench */}
        <LinkBuildingPromptLibrary />

        {/* Bottom Interactive Link Building & Digital PR Studios Banner */}
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
              Do It With AI Tools · Link Building &amp; Digital PR Studios
            </span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            EXECUTE YOUR OUTREACH &amp; VISUAL PR CAMPAIGN
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Plan linkable studies, draft pitches &amp; export embeddable charts
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 88 prompts with our Off-Page SEO, Digital PR, and Visual
            Infographic studios to turn research into high-authority backlinks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              [
                "digital-pr-linkable-asset-planner",
                "Digital PR & Linkable Asset Planner",
              ],
              ["journalist-pitch-builder", "HARO & Journalist Pitch Builder"],
              ["outreach-email-builder", "Personalized Outreach Email Studio"],
              [
                "competitor-backlink-gap-analyzer",
                "Competitor Backlink Gap Analyzer",
              ],
              [
                "unlinked-brand-mention-checker",
                "Unlinked Brand Mention Checker",
              ],
              ["broken-link-opportunity-finder", "Broken Link Finder"],
              ["anchor-text-analyzer", "Anchor Text Ratio Analyzer"],
              ["data-to-chart-visual-card-maker", "PR Data Chart Card Studio"],
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
        <section className="my-12" aria-labelledby="linkpr-faq-title">
          <h2 id="linkpr-faq-title" className="text-3xl font-bold">
            Link building, Digital PR &amp; outreach prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {linkBuildingFaqs.map(([q, a]) => (
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
                href="/prompts/infographic-data-visualization-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    77 Infographic, Chart & Strategy Diagram Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Turn your Digital PR data study into embeddable SVG/PNG chart cards and 8-node visual infographics.
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
                    91 AI Search, AEO & GEO Visibility Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Structure quantitative benchmarks and third-party corroboration that earn LLM citations.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/topic-clustering-topical-authority-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    94 Topic Clustering & Topical Authority Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Route earned backlink authority from your PR studies into your Pillar Hubs and commercial spokes.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/linkedin-personal-branding-b2b-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    83 LinkedIn Personal Branding & B2B Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Distribute your original research and case studies across LinkedIn carousels and founder posts.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#link-building-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#link-building-prompt-library">
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
