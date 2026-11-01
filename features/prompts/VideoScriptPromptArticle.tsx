import React from "react";
import Image from "next/image";
import Link from "next/link";
import VideoScriptPromptLibrary, {
  videoScriptPromoGuides,
} from "./VideoScriptPromptLibrary";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const videoScriptFaqs = [
  [
    "Why should I write the YouTube Title and Thumbnail before the script?",
    "On YouTube, viewers decide whether to click based on the Title + Thumbnail package, and decide whether to stay in the first 15 seconds. Designing the title and 3-word thumbnail text first (Prompts 1–11) ensures your opening line at 0:00 immediately confirms the click promise.",
  ],
  [
    "How many words should a 30-second, 45-second, or 60-second Short script be?",
    "Natural, energetic vertical video narration paces at roughly 150 spoken words per minute (2.5 words per second). That means a 30-second Short is ~75 spoken words, a 45-second Reel/TikTok is ~112 spoken words, and a 60-second breakdown is ~150 spoken words.",
  ],
  [
    "How does TikTok Search SEO work in 2026?",
    "TikTok indexes videos for evergreen search traffic across three signals: (1) Saying the exact target keyword out loud in the first 3 seconds, (2) Placing that keyword as native on-screen text at 0:00, and (3) Including the keyword in the first sentence of your caption (covered in Prompts 34–44).",
  ],
  [
    "How do I stop viewers from swiping away in the middle of a video?",
    "Insert a visual pattern interrupt every 6 to 8 seconds on Shorts/Reels (B-roll cut, screen zoom, chart pop-up, or prop change) and use mid-video open-loop re-hooks between long-form chapters (Prompts 47 and 56).",
  ],
  [
    "Can I turn an existing YouTube video into a blog post, infographic, and Shorts?",
    "Yes. Use Prompts 76–84 alongside our YouTube Transcript Generator and Blog to Infographic Studio to pull the transcript (including auto-captions) and turn it into an SEO article, 8-node visual infographic, and 5 standalone Shorts.",
  ],
];

export default function VideoScriptPromptArticle({
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
                mainEntity: videoScriptFaqs.map(([name, text]) => ({
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
            YouTube scripts, Shorts, Reels &amp; TikTok hooks
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            93 PROMPTS · NINE VIDEO PACKAGING, SCRIPTING &amp; RETENTION WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            93 AI prompts for YouTube scripts, Shorts, Reels &amp; TikTok
            retention hooks
          </h1>
          <p className={body + " max-w-3xl"}>
            Package high-CTR titles and thumbnails, engineer 0–3 second visual
            scroll-stoppers, write 150-WPM connected teleprompter scripts, and
            repurpose video transcripts into SEO articles and infographics.
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
              href="#video-script-prompt-library"
            >
              Explore all 93 prompts
            </a>
            <a className={button} href="#video-script-prompt-brief">
              Customize shared video brief
            </a>
            <Link
              className={button}
              href="/tools/short-form-video-script-generator"
            >
              Open Short-Form Script Builder
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/youtube-shorts-video-script-prompts-hero.webp"
            width={1600}
            height={900}
            alt="93 AI prompts for YouTube scripts, Shorts, Reels, and TikTok hooks beside an interactive teleprompter and video packaging workbench."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Production workflow: Package the Title + Thumbnail click first,
            confirm the promise in 3 seconds, and pace spoken audio at 150 WPM.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            How to write video scripts that hold viewer attention past 0:30
          </h2>
          <p className={body}>
            Most AI-generated video scripts fail in the first 5 seconds because
            they read like dry academic essays or open with slow channel
            greetings (&ldquo;Hey guys, welcome back to my channel...&rdquo;).
            Viewers on YouTube, Shorts, Reels, and TikTok decide whether to stay
            or swipe within 2.5 seconds.
          </p>
          <p className={body}>
            This 93-prompt library is engineered around real video retention
            mechanics: <strong>Title + Thumbnail curiosity packaging</strong>,{" "}
            <strong>0–3s visual + verbal pattern interrupts</strong>,{" "}
            <strong>150-WPM breathable teleprompter prose</strong>, and{" "}
            <strong>TikTok 3-layer search SEO</strong>.
          </p>
          <p className={body}>
            <strong>Recommended Recording Sequence:</strong> Start with{" "}
            <a href="#video-prompt-001" className="underline font-semibold">
              Prompt 1 (Title + Thumbnail Packaging Matrix)
            </a>
            , draft your opener with{" "}
            <a href="#video-prompt-012" className="underline font-semibold">
              Prompt 12 (3 Interchangeable 0–3s Hooks)
            </a>
            , generate your voiceover in{" "}
            <a href="#video-prompt-023" className="underline font-semibold">
              Prompt 23 (45s Connected Teleprompter Script)
            </a>{" "}
            or{" "}
            <a href="#video-prompt-045" className="underline font-semibold">
              Prompt 45 (10-Minute YouTube Outline)
            </a>
            , and turn the finished transcript into a blog post with{" "}
            <a href="#video-prompt-076" className="underline font-semibold">
              Prompt 76 (Transcript to SEO Blog)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard
          guide={videoScriptPromoGuides.shortsAndTeleprompter}
        />

        {/* 3-Step Production System */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            The 3-step retention system behind high-performing videos
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Package the click before scripting",
                "Pair a <55-character title with 3 words of complementary thumbnail text so your 0:00 opening sentence immediately validates why the viewer clicked.",
              ],
              [
                "Record 3 hooks for every vertical video",
                "Spend 20 extra seconds recording a Contrarian Hook, a Number/Proof Hook, and a Mistake Callout Hook so you can A/B test which opener retains the most scrollers.",
              ],
              [
                "Change the visual frame every 7 seconds",
                "Pair your spoken teleprompter script with timestamped B-roll cuts, screen zooms, 1080p data chart cards, and kinetic text pops.",
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

        {/* Main Interactive 93-Prompt Workbench */}
        <VideoScriptPromptLibrary />

        {/* Bottom Interactive Video Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · Video &amp; Creator Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            PUT YOUR VIDEO SCRIPTS &amp; TRANSCRIPTS INTO ACTION
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Build teleprompter scripts, extract transcripts &amp; grab 4K
            thumbnails
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 93 prompts with our interactive creator tools to generate
            connected voiceover scripts, extract YouTube auto-captions, download
            4K thumbnails, and repurpose videos into blog posts and
            infographics.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              [
                "short-form-video-script-generator",
                "Short-Form Video Script Builder",
              ],
              ["tiktok-script-caption-generator", "TikTok Script & SEO Studio"],
              [
                "youtube-title-thumbnail-optimizer",
                "YouTube Title & Thumbnail Optimizer",
              ],
              [
                "youtube-transcript-generator",
                "YouTube Transcript & .SRT Studio",
              ],
              ["video-transcript-to-blog", "Video Transcript to SEO Blog"],
              [
                "social-media-video-thumbnail-grabber",
                "4K Video Thumbnail Grabber",
              ],
              ["blog-to-video-script", "Blog to Video Script Studio"],
              ["blog-to-infographic-generator", "Blog to Infographic Studio"],
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
        <section className="my-12" aria-labelledby="video-faq-title">
          <h2 id="video-faq-title" className="text-3xl font-bold">
            YouTube script, Shorts &amp; TikTok prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {videoScriptFaqs.map(([q, a]) => (
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
                    Atomize any video or pillar article into LinkedIn posts, carousels, X threads, Pinterest pins, and newsletters.
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
                    100 Keyword Research Prompts for SEO & YouTube
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Discover high-intent YouTube and Google search topics before scripting your next video.
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
                    Repurpose video takeaways into 140-character LinkedIn hooks, PDF carousels, and founder stories.
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
                    Turn your video framework into an 8-node infographic, 2×2 matrix, or stat callout graphic.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#video-script-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#video-script-prompt-library">
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
