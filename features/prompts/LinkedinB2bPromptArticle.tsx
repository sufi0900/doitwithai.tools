import React from "react";
import Image from "next/image";
import Link from "next/link";
import LinkedinB2bPromptLibrary from "./LinkedinB2bPromptLibrary";
import { linkedinB2bPromoGuides } from "./LinkedinB2bPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const linkedinB2bFaqs = [
  [
    "How many characters show before LinkedIn's '...see more' cutoff on mobile?",
    "On mobile feeds, LinkedIn typically truncates posts after roughly 140 to 210 characters (or after the first 2 to 3 line breaks). Putting a specific number, tension point, or contrarian observation inside your first 140 characters earns the click to expand your post (Prompts 11–21).",
  ],
  [
    "Why do LinkedIn PDF Document Carousels earn so many saves and reposts?",
    "Swipeable `1080×1350` portrait PDF carousels let you break a complex framework into 6 to 8 visual slides (under 25 words per slide) and end with a 1-page summary cheat sheet. Readers save the post so they can reference the framework later (Prompts 33–43).",
  ],
  [
    "How do I write LinkedIn posts with AI without sounding like generic 'broetry'?",
    "Never ask an assistant to 'write a viral LinkedIn post about [topic]'. Supply your own real audit notes, client constraint, or before/after example, and instruct the prompt to use 2-to-3 sentence paragraphs, concrete verbs, and zero dramatic 1-word lines (Prompts 19 and 22–32).",
  ],
  [
    "Should I put external links inside my main LinkedIn post body?",
    "When your goal is feed reach and discussion, make the post 100% self-contained and pair it with a visual card or carousel, placing your companion link in your profile's Featured shelf or first comment. When your goal is direct clicks from warm followers, a clear link at the bottom of a high-value post works well (Prompts 64–73).",
  ],
  [
    "How does strategic commenting fit into a B2B LinkedIn growth system?",
    "Leaving 5 to 10 substantive 3-sentence comments each day on posts by target buyers and niche peers places your name and first 75 characters of your headline directly in front of active readers before you even publish your own post (Prompts 54–63).",
  ],
];

export default function LinkedinB2bPromptArticle({
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
                mainEntity: linkedinB2bFaqs.map(([name, text]) => ({
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
            LinkedIn personal branding &amp; B2B growth
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            83 PROMPTS · EIGHT LINKEDIN PERSONAL BRANDING &amp; B2B WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            83 ChatGPT Prompts for LinkedIn Personal Branding, Carousels &amp;
            B2B Growth
          </h1>
          <p className={body + " max-w-3xl"}>
            Position your LinkedIn Headline and Featured shelf, write
            140-character mobile fold hooks, storyboard 7-slide PDF carousels
            and founder memo cards, leave high-signal comments, and convert
            engagement into warm B2B pipeline.
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
              href="#linkedin-b2b-prompt-library"
            >
              Explore all 83 prompts
            </a>
            <a className={button} href="#linkedin-b2b-prompt-brief">
              Customize LinkedIn brand brief
            </a>
            <Link className={button} href="/tools/linkedin-post-formatter">
              Open LinkedIn Fold Previewer
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp"
            width={1600}
            height={900}
            alt="83 ChatGPT prompts for LinkedIn personal branding, 140-character mobile fold hooks, and PDF document carousels."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            B2B LinkedIn authority system: 140-character mobile hooks, 7-slide
            PDF carousels, founder memo cards, and practitioner teardowns.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Turn real operational experience into B2B trust on LinkedIn
          </h2>
          <p className={body}>
            Decision-makers on LinkedIn scroll past generic AI summaries and
            dramatic 1-sentence-per-line platitudes. What stops their scroll is
            specific practitioner proof: a live teardown of a real workflow, a
            swipeable 7-slide PDF carousel, a 2×2 trade-off matrix, or a candid
            lesson from a client project.
          </p>
          <p className={body}>
            These 83 prompts help you extract your own expertise, format
            140-character mobile fold hooks, storyboard carousels and founder
            memo cards, and turn comment threads into natural DM conversations.
          </p>
          <p className={body}>
            <strong>Fast LinkedIn Workflow Path:</strong> Start by sharpening
            your profile with{" "}
            <a href="#linkedin-prompt-001" className="underline font-semibold">
              Prompt 1 (220c Outcome Headline)
            </a>
            , write your opening hook with{" "}
            <a href="#linkedin-prompt-011" className="underline font-semibold">
              Prompt 11 (140c Mobile Fold Hooks)
            </a>
            , draft a practitioner teardown with{" "}
            <a href="#linkedin-prompt-022" className="underline font-semibold">
              Prompt 22 (Live Workflow Teardown)
            </a>
            , storyboard a carousel with{" "}
            <a href="#linkedin-prompt-033" className="underline font-semibold">
              Prompt 33 (7-Slide PDF Carousel)
            </a>
            , and design a visual card with{" "}
            <a href="#linkedin-prompt-044" className="underline font-semibold">
              Prompt 44 (Founder Memo Card)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={linkedinB2bPromoGuides.postFormatter} />

        {/* 3-Step LinkedIn B2B Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three habits of high-converting B2B LinkedIn creators
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Earn the '...see more' click in 140 chars",
                "Put a specific number, buyer problem, or contrarian observation in your first two lines before the mobile fold.",
              ],
              [
                "Pair text posts with save-worthy visuals",
                "Attach a 7-slide PDF carousel, 2×2 matrix, or Founder Memo card so busy buyers save and share your framework.",
              ],
              [
                "Bridge profile views to Featured assets",
                "Keep your 3-slot Featured shelf stocked with a free interactive tool, a flagship guide, and a clear way to work with you.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Habit {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 83-Prompt Workbench */}
        <LinkedinB2bPromptLibrary />

        {/* Bottom Interactive LinkedIn & Visual Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · LinkedIn &amp; B2B Visual Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            FORMAT YOUR POSTS &amp; EXPORT VISUAL CARDS
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Preview your mobile fold, build carousels &amp; export founder cards
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 83 prompts with our interactive LinkedIn and visual
            design studios to publish high-authority B2B posts in minutes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["linkedin-post-formatter", "LinkedIn Fold Previewer & Formatter"],
              ["blog-to-linkedin-carousel", "LinkedIn PDF Carousel Studio"],
              ["linkedin-comment-generator", "LinkedIn Comment Studio"],
              [
                "quote-stat-testimonial-card-studio",
                "Quote & Founder Memo Card Studio",
              ],
              ["framework-matrix-diagram-builder", "2×2 Matrix & Diagram Studio"],
              ["data-to-chart-visual-card-maker", "Data to Chart Card Studio"],
              ["blog-to-infographic-generator", "Blog to Infographic Studio"],
              ["blog-to-social-posts", "Blog to Social Posts Converter"],
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
        <section className="my-12" aria-labelledby="linkedin-faq-title">
          <h2 id="linkedin-faq-title" className="text-3xl font-bold">
            LinkedIn personal branding &amp; B2B prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {linkedinB2bFaqs.map(([q, a]) => (
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
                href="/prompts/content-repurposing-social-media-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    87 Content Repurposing & Social Media Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Atomize pillar blog posts and reports into multi-channel LinkedIn, X, carousel, and newsletter assets.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/infographic-data-visualization-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    77 Infographic, Data Chart & Diagram Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Design the 2×2 matrices, Founder Memo cards, and 8-node infographics that drive LinkedIn saves.
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
                    Turn your best-performing LinkedIn hooks into 45-second vertical video scripts.
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
                    88 Link Building, Digital PR & Journalist Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Repurpose founder voice notes into quotable 150-word journalist pitches and benchmark studies.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#linkedin-b2b-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#linkedin-b2b-prompt-library">
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
