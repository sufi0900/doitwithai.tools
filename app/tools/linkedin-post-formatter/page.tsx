import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Eye,
  Sparkles,
  Type,
} from "lucide-react";
import LinkedinPostFormatterClient from "@/features/linkedin-post-formatter/LinkedinPostFormatterClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

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

      <ToolLandingHero
        slug="linkedin-post-formatter"
        title="LinkedIn Post Formatter & &ldquo;…see more&rdquo; Fold Previewer"
        description="Style your LinkedIn hooks and subheadings with Unicode 𝗕𝗼𝗹𝗱 , 𝘐𝘵𝘢𝘭𝘪𝘤 , and 𝙼𝚘𝚗𝚘 typography, preview the exact mobile and desktop &ldquo;…see more&rdquo; fold line, and score your post for feed engagement."
        categoryLabel="Social Media Studio"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <LinkedinPostFormatterClient />
        </div>
      </ToolLandingHero>

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
