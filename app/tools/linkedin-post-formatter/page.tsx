import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Sparkles, Type } from "lucide-react";
import LinkedinPostFormatterClient from "@/features/linkedin-post-formatter/LinkedinPostFormatterClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/linkedin-post-formatter";
const title =
  "Free LinkedIn Post Formatter, Unicode Styler & Fold Previewer";
const description =
  "Format LinkedIn posts with Unicode bold, italic, and monospace text, preview the exact mobile and desktop '...see more' cutoff line, and score your opening hook.";

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
    question: "Where does LinkedIn cut off posts with the '...see more' button?",
    answer:
      "LinkedIn truncates feed posts after the first 3 lines of text—or roughly 140 characters on mobile and 210 characters on desktop. Earning clicks on '...see more' is one of the strongest positive engagement and dwell-time signals in the LinkedIn feed algorithm.",
  },
  {
    question: "How does Unicode bold and italic text work on LinkedIn?",
    answer:
      "Because LinkedIn's standard text post editor does not include rich-text buttons, our formatter maps standard ASCII characters to mathematical alphanumeric Unicode symbols (such as 𝗕𝗼𝗹𝗱 and 𝘐𝘵𝘢𝘭𝘪𝘤) that render natively across desktop, iOS, and Android.",
  },
  {
    question: "Should I bold entire paragraphs in my LinkedIn post?",
    answer:
      "No. Overusing Unicode bold makes posts harder for screen readers to parse. Use Unicode bold selectively on your opening hook line and short 2–4 word subheadings or numbered list takeaways.",
  },
  {
    question: "How many hashtags should I include in a LinkedIn post?",
    answer:
      "Include 3 to 5 relevant niche hashtags at the very bottom of your post. Using more than 5 hashtags can dilute topical classification and make the post look cluttered.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function LinkedinPostFormatterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "LinkedIn Post Formatter & Fold Previewer",
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
          { name: "LinkedIn Post Formatter", item: pageUrl },
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
            <span aria-current="page">LinkedIn Post Formatter</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · LinkedIn Typography &amp; Dwell Time
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                LinkedIn Post Formatter &amp;{" "}
                <span className={toolHeroHeading}>
                  &ldquo;…see more&rdquo; Fold Previewer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Style your LinkedIn hooks and subheadings with Unicode{" "}
                <strong>𝗕𝗼𝗹𝗱</strong>, <em>𝘐𝘵𝘢𝘭𝘪𝘤</em>, and <code>𝙼𝚘𝚗𝚘</code>{" "}
                typography, preview the exact mobile and desktop{" "}
                <strong>&ldquo;…see more&rdquo;</strong> fold line, and score
                your post for feed engagement.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  7 Unicode Text Styles
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Mobile &amp; Desktop Fold Preview
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  5-Point Hook Scorecard
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Built for LinkedIn Creators &amp; Founders
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Highlight any text to apply Unicode Bold or Italic</li>
                <li>2. Exact 140-char Mobile &amp; 210-char Desktop fold check</li>
                <li>3. Proven data-driven &amp; contrarian hook templates</li>
                <li>4. Character, word, reading-time &amp; hashtag counters</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <LinkedinPostFormatterClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Win the first 3 lines before the &ldquo;…see more&rdquo; fold
        </h2>
        <p className={prose}>
          On LinkedIn, readers only see your first 2 to 3 lines before deciding
          whether to scroll past or tap &ldquo;…see more&rdquo;. Formatting your
          opening hook and whitespace cleanly turns casual scrollers into
          engaged readers.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Type,
              "Instant Unicode Styling",
              "Apply Bold Sans, Italic, Bold Serif, Monospace, Underline, or Strikethrough to any highlighted phrase.",
            ],
            [
              Eye,
              "Mobile vs. Desktop Fold",
              "See the exact character where LinkedIn truncates your post on both iPhone/Android and desktop feeds.",
            ],
            [
              Sparkles,
              "Hook & Dwell-Time Audit",
              "Verifies line-1 hook length, line-2 whitespace break, post depth, hashtag count, and closing question.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Type;
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

      <ToolResources slug="linkedin-post-formatter" />
      <ToolFaq title="LinkedIn Post Formatter & Fold Previewer FAQs" faqs={faqs} />
    </div>
  );
}
