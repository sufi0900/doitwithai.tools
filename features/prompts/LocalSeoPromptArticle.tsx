import React from "react";
import Image from "next/image";
import Link from "next/link";
import LocalSeoPromptLibrary from "./LocalSeoPromptLibrary";
import { localSeoPromoGuides } from "./LocalSeoPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const localSeoFaqs = [
  [
    "Why shouldn't I put my city or keywords into my Google Business Profile name?",
    "Adding extra cities or service keywords to your GBP business name (unless they are part of your registered legal name and physical storefront signage) violates Google Business Profile guidelines and frequently triggers profile suspensions. Put your categories, services, and service areas in their dedicated GBP fields instead (Prompts 1–10).",
  ],
  [
    "Why do some Google Business Profile Update posts get automatically rejected?",
    "Google's automated post filter frequently rejects GBP Updates that contain a phone number in the body text, excessive ALL-CAPS promotional text, or misleading links. Use the built-in 'Call now' or 'Learn more' button instead of typing your phone number in the post copy (Prompts 11–20).",
  ],
  [
    "How do I create city landing pages without getting hit by a doorway page penalty?",
    "Never clone the same 500-word template across 20 suburbs with only the city name swapped. Give each city or service-area page real neighborhood proof—such as specific services performed in that area, local building/climate considerations, driving or service-radius context, and customer reviews from that community (Prompts 21–30).",
  ],
  [
    "Does adding keywords when replying to Google reviews help rankings?",
    "Owner responses do not directly boost Google Map Pack rankings the way customer-written review text does, but thoughtful replies mentioning the service performed and neighborhood reassure prospective callers reading your reviews and build strong conversion trust (Prompts 31–40).",
  ],
  [
    "Should Service-Area Businesses (SABs) show their home address in LocalBusiness schema?",
    "If you hide your street address in Google Business Profile because customers do not visit your location, keep your street address hidden or omitted in public directories and use `areaServed` in your LocalBusiness schema rather than publishing a residential address inconsistently (Prompts 41–50 and 61–70).",
  ],
];

export default function LocalSeoPromptArticle({
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
                mainEntity: localSeoFaqs.map(([name, text]) => ({
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
            Local SEO &amp; Google Business Profile
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            79 PROMPTS · EIGHT LOCAL SEO &amp; GOOGLE BUSINESS PROFILE WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            79 ChatGPT prompts for Local SEO &amp; Google Business Profile
          </h1>
          <p className={body + " max-w-3xl"}>
            Optimize your Google Business Profile categories and 750-character
            description, publish policy-safe GBP Updates, plan anti-doorway city
            pages, reply to customer reviews, clean up NAP citations, and
            generate valid LocalBusiness JSON-LD schema.
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
              href="#local-seo-prompt-library"
            >
              Explore all 79 prompts
            </a>
            <a className={button} href="#local-seo-prompt-brief">
              Customize local business brief
            </a>
            <Link className={button} href="/tools/google-business-profile-auditor">
              Open GBP Completeness Auditor
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/local-seo-gbp-prompts-hero-v2.webp"
            width={1600}
            height={900}
            alt="79 ChatGPT prompts for Local SEO and Google Business Profile optimization beside a Map Pack and review workflow."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Local SEO system: Align your GBP categories, city service pages,
            customer reviews, NAP citations, and LocalBusiness schema.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Build local search trust across Google Maps and organic results
          </h2>
          <p className={body}>
            Local rankings and phone calls depend on three signals working
            together: relevance (accurate GBP categories and dedicated service
            pages), prominence (authentic customer reviews and local community
            links), and consistency (matching NAP details and LocalBusiness
            JSON-LD schema).
          </p>
          <p className={body}>
            These 79 prompts follow Google Business Profile guidelines—helping
            you write high-converting descriptions, weekly GBP Update posts,
            unique neighborhood landing pages, and empathetic review responses
            without risking profile suspensions or thin doorway penalties.
          </p>
          <p className={body}>
            <strong>Fast Local SEO Path:</strong> Start with{" "}
            <a href="#localseo-prompt-001" className="underline font-semibold">
              Prompt 1 (750c GBP Description)
            </a>{" "}
            and{" "}
            <a href="#localseo-prompt-002" className="underline font-semibold">
              Prompt 2 (Primary &amp; Secondary Categories)
            </a>
            , plan your website pages with{" "}
            <a href="#localseo-prompt-021" className="underline font-semibold">
              Prompt 21 (Anti-Doorway City Blueprint)
            </a>
            , set up your review workflow with{" "}
            <a href="#localseo-prompt-031" className="underline font-semibold">
              Prompt 31 (SMS Review Request)
            </a>
            , and validate your markup with{" "}
            <a href="#localseo-prompt-061" className="underline font-semibold">
              Prompt 61 (LocalBusiness JSON-LD)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={localSeoPromoGuides.gbpAuditor} />

        {/* 3-Step Local SEO Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three rules for sustainable Map Pack &amp; local organic growth
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Match every GBP category to a real page",
                "Link your primary GBP category to your main hub and support every secondary category with a dedicated service page on your site.",
              ],
              [
                "Prove real neighborhood experience",
                "Replace generic swapped city names with actual local project photos, regional code/climate notes, and neighborhood customer reviews.",
              ],
              [
                "Keep NAP & schema 100% consistent",
                "Use the exact same legal business name, address format, and phone number across your website footer, GBP, directories, and JSON-LD.",
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

        {/* Main Interactive 79-Prompt Workbench */}
        <LocalSeoPromptLibrary />

        {/* Bottom Interactive Local SEO Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · Local SEO &amp; GBP Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            COMPLETE YOUR LOCAL SEO WORKFLOW
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Audit your GBP, reply to reviews &amp; generate LocalBusiness schema
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 79 prompts with our dedicated Local SEO studios to score
            your profile completeness, generate direct review links, and validate
            your structured data.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["google-business-profile-auditor", "GBP Completeness Auditor"],
              ["local-seo-service-page-planner", "Local Service Page Planner"],
              ["google-review-response-generator", "Google Review Response Studio"],
              ["google-review-link-generator", "Google Review Link & QR Generator"],
              ["nap-consistency-checker", "NAP Consistency Formatter"],
              ["local-business-schema-generator", "LocalBusiness Schema Generator"],
              ["quote-stat-testimonial-card-studio", "Review Testimonial Visual Card Studio"],
              ["ai-faq-generator", "Local FAQ & Schema Generator"],
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
        <section className="my-12" aria-labelledby="localseo-faq-title">
          <h2 id="localseo-faq-title" className="text-3xl font-bold">
            Local SEO &amp; Google Business Profile prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {localSeoFaqs.map(([q, a]) => (
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
                href="/prompts/technical-seo-audit-schema-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    76 Technical SEO Audit, Schema & CWV Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Validate connected @graph JSON-LD, clean up 301 redirects, and fix mobile Core Web Vitals.
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
                    Structure local service pages with question-led H1–H3 headings and first-hand customer proof.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/link-building-digital-pr-outreach-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    88 Link Building, Digital PR & Outreach Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Earn local press citations, community sponsorships, and resource page backlinks.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/keyword-research-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    100 Keyword Research Prompts for SEO & Local
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Uncover high-intent local service, cost, and comparison queries in your city.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#local-seo-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#local-seo-prompt-library">
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
