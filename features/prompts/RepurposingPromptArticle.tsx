import React from "react";
import Image from "next/image";
import Link from "next/link";
import RepurposingPromptLibrary from "./RepurposingPromptLibrary";
import { repurposingPromoGuides } from "./RepurposingPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const repurposingFaqs = [
  [
    "What is the difference between copy-pasting and true content atomization?",
    "Copy-pasting drops the same paragraph or bare link onto every social platform. Content atomization slices a single pillar article into self-contained micro-assets—such as a 140-character LinkedIn hook, a 5-slide Instagram carousel, an 8-node vertical infographic, and a 2:3 Pinterest checklist pin—adapted to how people actually read on each feed.",
  ],
  [
    "Why are there 87 prompts instead of a generic list?",
    "Each of the 87 prompts solves a specific operational step across nine distinct distribution workflows: Pillar Atomization (1–10), LinkedIn Posts (11–20), Carousels (21–30), X/Threads Chains (31–40), Visual Infographics & Matrices (41–50), Pinterest SEO Pins (51–60), Facebook & Quote Cards (61–70), Newsletters & Audio Scripts (71–79), and 30-Day Calendars & Comment Replies (80–87).",
  ],
  [
    "How do I pair these text prompts with visual infographics and carousels?",
    "Every prompt in Workflows 3, 5, 6, and 7 generates structured node copy (such as 6-word headlines, 15-word card bodies, or 2x2 matrix quadrants) that you can paste directly into our interactive Blog to Infographic Studio, 2x2 Matrix Builder, or Instagram 5-Slide Carousel Studio.",
  ],
  [
    "Why do the Facebook and LinkedIn prompts emphasize 'Zero-Click' posts and First-Comment links?",
    "Social feed algorithms frequently reduce the organic reach of posts that send users off-platform in the main body. Delivering a complete, standalone takeaway inside the post—paired with a visual card and placing the full article URL in the First Comment—earns higher dwell time, saves, and click-throughs.",
  ],
  [
    "Can I customize all 87 prompts with my own article and brand tone at once?",
    "Yes. Fill in the 'Customize the shared campaign brief' box once with your pillar topic, target audience, and preferred channels, and all 87 prompt templates update automatically.",
  ],
];

export default function RepurposingPromptArticle({
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
                mainEntity: repurposingFaqs.map(([name, text]) => ({
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
            Content repurposing &amp; social media
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            87 PROMPTS · NINE MULTI-CHANNEL REPURPOSING WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            87 ChatGPT prompts for content repurposing &amp; social media
            distribution
          </h1>
          <p className={body + " max-w-3xl"}>
            Stop publishing a 2,000-word blog post once and moving on. Use these
            87 structured prompts to atomize any pillar guide, report, or video
            into LinkedIn posts, 5-slide carousels, visual infographics, X
            threads, 1000×1500 Pinterest pins, and email newsletters.
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
              href="#repurposing-prompt-library"
            >
              Explore all 87 prompts
            </a>
            <a className={button} href="#repurposing-prompt-brief">
              Customize shared campaign brief
            </a>
            <Link
              className={button}
              href="/tools/blog-to-infographic-generator"
            >
              Open Blog to Infographic Studio
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/content-repurposing-prompts-hero.webp"
            width={1600}
            height={900}
            alt="87 content repurposing and social media prompts beside an interactive workbench showing LinkedIn, Carousel, Infographic, X Thread, and Pinterest workflows."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Workflow overview: Atomize one authoritative pillar asset into
            channel-native text, carousel decks, and visual infographics.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Why most content repurposing fails (and how this 87-prompt system
            fixes it)
          </h2>
          <p className={body}>
            Asking an AI assistant to &ldquo;write 5 social posts from my
            article&rdquo; almost always produces generic, emoji-stuffed
            summaries that scrollers ignore. High-performing distribution
            requires isolating <strong>one micro-problem per post</strong> and
            matching the native format of each feed.
          </p>
          <p className={body}>
            Every prompt in this library enforces strict source fidelity—keeping
            your real statistics, caveats, and practitioner stories intact while
            formatting the output for LinkedIn&apos;s 140-character mobile fold,
            Instagram&apos;s 5-slide carousels, 8-node visual infographics, and
            Pinterest&apos;s 1000×1500 vertical pins.
          </p>
          <p className={body}>
            <strong>Quick-Start Sequence:</strong> Start with{" "}
            <a href="#repurposing-prompt-001" className="underline font-semibold">
              Prompt 1 (12-Spoke Atomization Map)
            </a>
            , run{" "}
            <a href="#repurposing-prompt-011" className="underline font-semibold">
              Prompt 11 (LinkedIn 140c Fold Hooks)
            </a>
            , build your visual deck with{" "}
            <a href="#repurposing-prompt-021" className="underline font-semibold">
              Prompt 21 (7-Slide Carousel)
            </a>{" "}
            and{" "}
            <a href="#repurposing-prompt-041" className="underline font-semibold">
              Prompt 41 (8-Node Infographic)
            </a>
            , then map your month with{" "}
            <a href="#repurposing-prompt-080" className="underline font-semibold">
              Prompt 80 (30-Day Distribution Calendar)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={repurposingPromoGuides.infographicStudio} />

        {/* 3-Step How to Use Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            How to turn one pillar guide into 30 days of multi-channel assets
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Slice by sub-topic, not summary",
                "Instead of summarizing a 2,000-word article into one shallow post, extract each H2 section, benchmark stat, and FAQ as its own standalone social asset.",
              ],
              [
                "Pair text hooks with visual cards",
                "Posts paired with a custom 1080×1080 chart card, 2×2 matrix diagram, or 5-slide carousel earn significantly higher dwell time and bookmark saves.",
              ],
              [
                "Protect reach with Zero-Click value",
                "Deliver the complete framework natively inside the feed post, and place your full guide link in the First Comment or final carousel slide.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 87-Prompt Library (Includes Promotional Cards #2 & #3 inside) */}
        <RepurposingPromptLibrary />

        {/* Bottom Interactive Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · Visual &amp; Social Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            FROM PROMPT OUTPUT TO DOWNLOADABLE 1080P GRAPHICS
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Render your repurposed copy into infographics, carousels &amp; cards
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Once you generate your slide copy, infographic nodes, or data points
            using the prompts above, open our interactive visual studios to
            download ready-to-publish PNGs, SVGs, and PDF decks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["blog-to-infographic-generator", "Blog to Infographic Studio"],
              ["linkedin-post-formatter", "LinkedIn Formatter & Card Studio"],
              ["instagram-caption-generator", "Instagram 5-Slide Carousel"],
              ["data-to-chart-visual-card-maker", "Data & KPI Chart Maker"],
              ["framework-matrix-diagram-builder", "2×2 Matrix & Diagram Studio"],
              ["pinterest-pin-visual-generator", "Pinterest 1000×1500 Pin Studio"],
              ["quote-stat-testimonial-card-studio", "Quote & Testimonial Cards"],
              ["social-thread-generator", "X & Threads Splitter"],
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

        {/* Frequently Asked Questions */}
        <section className="my-12" aria-labelledby="repurposing-faq-title">
          <h2 id="repurposing-faq-title" className="text-3xl font-bold">
            Content repurposing &amp; social media prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {repurposingFaqs.map(([q, a]) => (
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
                    77 Infographic, Chart & 2×2 Diagram Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Convert blog posts and statistics into 8-node visual infographics, chart cards, 2×2 matrices, and tall Pinterest pins.
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
                    83 LinkedIn Personal Branding & Carousel Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Turn repurposed insights into 140-character mobile fold hooks, 7-slide PDF carousels, and founder memo cards.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/youtube-shorts-video-script-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    93 YouTube, Shorts, Reels & TikTok Script Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Script 0–3s visual hooks and 150-WPM teleprompter voiceovers or convert video transcripts into SEO articles.
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
                    Structure the source pillar article with question-led H1–H3 headings and 45-word snippet answers.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#repurposing-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#repurposing-prompt-library">
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
