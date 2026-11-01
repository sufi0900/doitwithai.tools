import React from "react";
import Image from "next/image";
import Link from "next/link";
import TechnicalSeoPromptLibrary from "./TechnicalSeoPromptLibrary";
import { technicalSeoPromoGuides } from "./TechnicalSeoPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const technicalSeoFaqs = [
  [
    "What is the difference between blocking a URL in robots.txt and adding a noindex tag?",
    "A `Disallow` rule in `robots.txt` stops crawlers from fetching the page, but if other pages link to that URL, Google can still index the URL without seeing its contents. To remove an already-indexed URL from Google Search, allow crawling in `robots.txt` and serve `<meta name='robots' content='noindex'>` (or HTTP `404`/`410`) so Googlebot can read the directive (Prompts 1–10).",
  ],
  [
    "How do I fix 'Crawled - currently not indexed' in Google Search Console?",
    "'Crawled - currently not indexed' means Googlebot fetched the page cleanly but decided it did not add enough unique value compared to existing pages on your site or the web. Group the affected URLs by template: prune or `noindex` thin filter/tag pages, merge overlapping stubs via `301` redirect, and add original data + contextual internal links to priority pages (Prompts 11–20).",
  ],
  [
    "When should I use a 301 redirect vs. a 404 or 410 status code?",
    "Use a `301` permanent redirect only when a close 1-to-1 replacement page exists (or when the retired URL has valuable referring domains relevant to a parent category). Redirecting unrelated deleted pages in bulk to your homepage causes Google to treat them as Soft 404s. If a page is permanently gone with no equivalent replacement and no backlinks, serve a clean `404` or `410` (Prompts 21–30).",
  ],
  [
    "Why should my JSON-LD schema use a connected @graph with @id URIs?",
    "Instead of outputting four disconnected `<script type='application/ld+json'>` islands on the same page, a single `@graph` array lets your `Article`, `WebPage`, `BreadcrumbList`, `Person` (`#author`), and `Organization` (`#publisher`) cross-reference each other unambiguously via persistent `@id` URIs (Prompts 31–40).",
  ],
  [
    "Why does adding loading='lazy' to every image on my page hurt Core Web Vitals?",
    "Adding `loading='lazy'` to your above-the-fold hero image delays browser discovery of the Largest Contentful Paint (LCP) element until layout is calculated. Always eager-load your LCP hero image with `fetchpriority='high'` (or `priority` in Next.js `<Image>`) and reserve `loading='lazy'` for below-the-fold images (Prompts 41–50).",
  ],
];

export default function TechnicalSeoPromptArticle({
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
                mainEntity: technicalSeoFaqs.map(([name, text]) => ({
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
            Technical SEO audits, schema &amp; Core Web Vitals
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            76 PROMPTS · EIGHT TECHNICAL SEO, SCHEMA &amp; PERFORMANCE WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            76 ChatGPT Prompts for Technical SEO Audits, Schema Markup &amp;
            Core Web Vitals
          </h1>
          <p className={body + " max-w-3xl"}>
            Turn raw crawl exports, Google Search Console indexing flags,
            redirect chains, Schema.org `@graph` specs, and Core Web Vitals
            (`LCP`, `INP`, `CLS`) traces into verified fixes and developer
            sprint tickets.
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
              href="#technical-seo-prompt-library"
            >
              Explore all 76 prompts
            </a>
            <a className={button} href="#technical-seo-prompt-brief">
              Customize technical audit brief
            </a>
            <Link className={button} href="/tools/structured-data-validator">
              Open Schema &amp; Tech Validator
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/technical-seo-audit-schema-prompts-hero.webp"
            width={1600}
            height={900}
            alt="76 ChatGPT prompts for Technical SEO audits, JSON-LD schema markup, and Core Web Vitals diagnostics."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Technical SEO architecture: Align `robots.txt`, canonicals, 1-hop
            redirects, connected `@graph` JSON-LD, and Core Web Vitals.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Turn noisy crawl data into verified engineering actions
          </h2>
          <p className={body}>
            An AI assistant cannot crawl your live website—and asking it to
            &ldquo;audit my URL&rdquo; without supplying evidence leads to
            generic checklists. Where AI excels is interpreting the actual
            evidence you paste in: `robots.txt` rules, GSC Page Indexing
            exports, multi-hop redirect chains, broken JSON-LD scripts, and
            PageSpeed Insights traces.
          </p>
          <p className={body}>
            These 76 prompts separate confirmed observations from hypotheses
            that need verification, helping you generate production-ready
            server redirect rules, valid `@graph` JSON-LD, and reproduction-ready
            Jira/Linear tickets for your engineering team.
          </p>
          <p className={body}>
            <strong>Fast Technical Audit Path:</strong> Start with{" "}
            <a href="#techseo-prompt-001" className="underline font-semibold">
              Prompt 1 (Robots.txt Audit)
            </a>
            , triage unindexed pages with{" "}
            <a href="#techseo-prompt-011" className="underline font-semibold">
              Prompt 11 (Crawled - Currently Not Indexed)
            </a>
            , flatten legacy hops with{" "}
            <a href="#techseo-prompt-021" className="underline font-semibold">
              Prompt 21 (Redirect Chain Flattener)
            </a>
            , generate connected schema with{" "}
            <a href="#techseo-prompt-031" className="underline font-semibold">
              Prompt 31 (@graph JSON-LD Template)
            </a>
            , and fix speed bottlenecks with{" "}
            <a href="#techseo-prompt-041" className="underline font-semibold">
              Prompt 41 (LCP Sub-Part Diagnostics)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={technicalSeoPromoGuides.robotsAndSitemaps} />

        {/* 3-Step Technical SEO Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three principles of reliable Technical SEO
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Never send conflicting signals",
                "Ensure your XML sitemaps, internal links, rel=canonical tags, and hreflang annotations all point directly to 200-OK canonical URLs.",
              ],
              [
                "Serve critical HTML & schema on the server",
                "Render titles, meta robots, canonicals, headings, internal links, and JSON-LD in the initial server HTML response.",
              ],
              [
                "Prioritize by revenue & crawl impact",
                "Separate harmless GSC exclusions (like intentional noindex tags or old 301s) from issues blocking money pages or Core Web Vitals.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Principle {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 76-Prompt Workbench */}
        <TechnicalSeoPromptLibrary />

        {/* Bottom Interactive Technical SEO Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · Technical SEO &amp; Schema Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            GENERATE &amp; VALIDATE YOUR CONFIGURATIONS
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Build robots.txt, XML sitemaps, redirect rules &amp; JSON-LD schema
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 76 technical prompts with our interactive generators and
            validators to test your configurations before deploying.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["robots-txt-generator", "Robots.txt & AI Crawler Studio"],
              ["sitemap-xml-generator", "XML Sitemap Generator"],
              ["redirect-rule-generator", "Redirect Rule Generator"],
              ["schema-markup-generator", "JSON-LD Schema Generator"],
              ["structured-data-validator", "Structured Data Validator"],
              ["core-web-vitals-checker", "Core Web Vitals Checker"],
              ["hreflang-generator", "Hreflang Tag Generator"],
              ["internal-link-anchor-auditor", "Internal Link & Anchor Auditor"],
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
        <section className="my-12" aria-labelledby="techseo-faq-title">
          <h2 id="techseo-faq-title" className="text-3xl font-bold">
            Technical SEO audit, schema &amp; Core Web Vitals FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {technicalSeoFaqs.map(([q, a]) => (
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
                href="/prompts/ai-search-aeo-geo-visibility-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    91 AI Search, AEO, GEO & LLM Citation Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Configure /llms.txt, OAI-SearchBot robots.txt rules, and connected @graph entity schema.
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
                    Eliminate keyword cannibalization, rescue orphaned URLs, and flatten internal click depth.
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
                    84 On-Page SEO, Headings & Readability Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Pair clean technical indexing with strong H1–H3 hierarchy, E-E-A-T proof, and snippet blocks.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/local-seo-google-business-profile-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    79 Local SEO & Google Business Profile Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Generate valid LocalBusiness, GeoCoordinates, and multi-location JSON-LD schema.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#technical-seo-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#technical-seo-prompt-library">
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
