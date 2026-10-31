import type { Metadata } from "next";
import Link from "next/link";
import { Layers, MessageSquare, Sparkles } from "lucide-react";
import SocialThreadGeneratorClient from "@/features/social-thread-generator/SocialThreadGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/social-thread-generator";
const title =
  "Free X (Twitter) & Threads Viral Thread Splitter & Hook Studio";
const description =
  "Split long-form articles and notes into numbered 280-character X (Twitter) or 500-character Threads posts with 3 viral hook options and automatic recap CTAs.";

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
    question: "How many posts should an X (Twitter) or Threads thread have?",
    answer:
      "Threads with 5 to 9 concise posts (1 core insight per post) consistently earn the highest bookmark and repost rates. They are long enough to deliver substantive value without exhausting mobile readers.",
  },
  {
    question: "How does the sentence-safe splitter avoid cutting words in half?",
    answer:
      "Our splitter reserves character space for your post numbering (e.g. '1/7') and breaks paragraphs cleanly at sentence boundaries so every post reads like a standalone micro-insight.",
  },
  {
    question: "Where should I place my external blog link in a thread?",
    answer:
      "Avoid putting external links inside Post #1, as social feed algorithms often throttle initial reach on posts with outbound links. Place your external link in the final Recap & CTA post once readers have engaged with the thread.",
  },
  {
    question: "Can I use this for LinkedIn Carousel slide copy too?",
    answer:
      "Yes! Switch the Target Network dropdown to 'LinkedIn Carousel Copy (320 chars/slide)' to format your points into slide-sized blocks ready for our Blog to LinkedIn Carousel Studio.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function SocialThreadGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "X (Twitter) & Threads Viral Thread Splitter & Hook Studio",
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
          { name: "Social Thread Generator", item: pageUrl },
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
            <span aria-current="page">Social Thread Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · X (Twitter), Threads &amp; Carousels
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                X &amp; Threads Viral{" "}
                <span className={toolHeroHeading}>
                  Thread Splitter &amp; Hook Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Transform long-form articles, notes, or case studies into
                numbered 280-character X posts or 500-character Threads posts
                with 3 interchangeable Post #1 hooks and an automatic TL;DR
                recap finale.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  280c X &amp; 500c Threads Limits
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  3 Viral Hook Angles
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Auto TL;DR Recap Finale
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Repurpose Articles Into Threads in 10 Seconds
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Sentence-safe splitting with (1/N) numbering</li>
                <li>2. Benchmark, Contrarian &amp; Playbook hook switcher</li>
                <li>3. Keeps outbound links in the final post for max reach</li>
                <li>4. Per-post copy buttons + 1-click full thread export</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <SocialThreadGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn one deep guide into a week of high-bookmark social threads
        </h2>
        <p className={prose}>
          Every long-form article on your site already contains enough structured
          insights for multiple X and Threads campaigns—when paced into
          bite-sized, one-idea-per-post cards.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Sparkles,
              "Post #1 Hook Switcher",
              "Test Data/Benchmark, Contrarian, and Step-by-Step Playbook hooks on the fly.",
            ],
            [
              Layers,
              "Sentence-Safe Pacing",
              "Never cuts sentences mid-thought while strictly enforcing 280, 320, or 500 character limits.",
            ],
            [
              MessageSquare,
              "Algorithm-Safe CTA Finale",
              "Automatically builds a final TL;DR summary card that holds your external link and follow callout.",
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

      <ToolResources slug="social-thread-generator" />
      <ToolFaq title="Social Thread Generator & Splitter FAQs" faqs={faqs} />
    </div>
  );
}
