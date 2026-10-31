import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Film, Sparkles } from "lucide-react";
import ShortFormVideoScriptGeneratorClient from "@/features/short-form-video-script-generator/ShortFormVideoScriptGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/short-form-video-script-generator";
const title =
  "Free Short-Form Video Script & Hook Generator (Shorts, Reels & TikTok)";
const description =
  "Generate high-retention 30s, 45s, and 60s vertical video scripts for YouTube Shorts, Instagram Reels, and TikTok with 3-second scroll-stopper hooks and B-roll cues.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};

const faqs = [
  {
    question: "How many words should a 45-second or 60-second vertical video script be?",
    answer:
      "At an energetic speaking pace of 150 words per minute (2.5 words per second), a 30-second Short is ~75 words, a 45-second Short is ~110 words, and a 60-second Short is ~150 words.",
  },
  {
    question: "What is a 'Pattern Interrupt' in YouTube Shorts and Reels?",
    answer:
      "A pattern interrupt is a visual or auditory change every 6 to 8 seconds—such as a camera zoom cut, a B-roll screen recording, or a bold on-screen text badge—that resets viewer attention and prevents swipe-aways.",
  },
  {
    question: "Why should I record 3 opening hooks for the same Short?",
    answer:
      "The first 3 seconds determine your Viewed-vs-Swiped-Away ratio. Recording 3 opening lines takes only 20 extra seconds during filming and gives you a backup version if the first hook underperforms.",
  },
  {
    question: "How does a 'Seamless Loop' ending work?",
    answer:
      "By ending your final sentence with a conjunction ('...and that is why') that grammatically flows straight into the first word of your 0:00 hook, viewers often watch the first 3 seconds a second time, pushing average percentage viewed above 100%.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function ShortFormVideoScriptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Short-Form Video Hook & Retention Script Builder",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Short-Form Video Script Builder", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Short-Form Video Script Builder</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · YouTube Shorts, Reels &amp; TikTok
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Short-Form Video Hook &amp;{" "}
                <span className={toolHeroHeading}>
                  Retention Script Builder
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn any tip, case study, or blog takeaway into a timed 30s,
                45s, or 60s vertical video script with 3 scroll-stopper hooks,
                7-second pattern interrupts, B-roll cues, and on-screen caption
                overlays.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  3 Scroll-Stopper Hooks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  7s Pattern Interrupts
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  150 WPM Teleprompter Pacing
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Built for Vertical Retention
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 0:00–0:03 Contrarian, Number &amp; Mistake hooks</li>
                <li>2. Timed spoken lines + B-roll visual directions</li>
                <li>3. Bold 3–5 word on-screen text overlays per beat</li>
                <li>4. Loopable ending CTA + post caption &amp; hashtags</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <ShortFormVideoScriptGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Beat the 3-second swipe-away threshold on Shorts, Reels, and TikTok
        </h2>
        <p className={prose}>
          Short-form algorithms reward two metrics above all else: the
          Viewed-vs-Swiped-Away rate in the first 3 seconds and the average
          percentage viewed across the full video.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Sparkles,
              "0–3s Hook Trio",
              "Compare Contrarian, Proof/Number, and Mistake Callout hooks before stepping in front of the camera.",
            ],
            [
              Clock,
              "150 WPM Pacing Guard",
              "Calculates exact spoken word count and speaking duration so your script never feels rushed or cut off.",
            ],
            [
              Film,
              "Visual & Caption Cues",
              "Pairs every spoken beat with a specific B-roll cut and uppercase on-screen caption for silent scrollers.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Sparkles;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ToolResources slug="short-form-video-script-generator" />
      <ToolFaq title="Short-Form Video Script Builder FAQs" faqs={faqs} />
    </div>
  );
}
