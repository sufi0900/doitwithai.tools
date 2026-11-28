import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Layers,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import SocialThreadGeneratorClient from "@/features/social-thread-generator/SocialThreadGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

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

      <ToolLandingHero
        slug="social-thread-generator"
        title="X & Threads Viral Thread Splitter & Hook Studio"
        description="Transform long-form articles, notes, or case studies into numbered 280-character X posts or 500-character Threads posts with 3 interchangeable Post #1 hooks and an automatic TL;DR recap finale."
        categoryLabel="Social Media Studio"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <SocialThreadGeneratorClient />
        </div>
      </ToolLandingHero>

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
