import type { Metadata } from "next";
import Link from "next/link";
import { Layers, MessageSquareQuote, Sparkles } from "lucide-react";
import QuoteStatTestimonialCardStudioClient from "@/features/quote-stat-testimonial-card-studio/QuoteStatTestimonialCardStudioClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl =
  "https://doitwithai.tools/tools/quote-stat-testimonial-card-studio";
const title =
  "Free AI Quote, Tweet Screenshot, Founder Memo & Testimonial Card Studio";
const description =
  "Extract the best quotes from any article URL or paste customer reviews to design 1080x1080 verified social post cards, highlighter quotes, founder memos, and 5-star testimonial graphics.";

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
    question: "What visual templates are included in the Quote & Testimonial Studio?",
    answer:
      "You can switch live between 6 high-performing social formats: (1) Verified Post / Tweet Screenshot Card, (2) Neon Highlighter Quote Card, (3) Founder Memo / Apple Notes Card, (4) 5-Star Client Testimonial Card, (5) Contrarian Myth vs. Reality Split Card, and (6) Magazine Pull-Quote Poster.",
  },
  {
    question: "Can it extract shareable quotes directly from a blog URL?",
    answer:
      "Yes! Paste any article URL at the top of the workspace to automatically extract 5 quotable takeaways and preview each one across all 6 visual templates.",
  },
  {
    question: "Can I customize the author name, handle, and highlighted phrase?",
    answer:
      "Yes. Every card lets you edit the author name, handle/role, highlighted ribbon phrase, main quote, and secondary takeaway with real-time 1080×1080 canvas preview.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function QuoteStatTestimonialCardStudioPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Quote, Tweet Screenshot & Testimonial Visual Card Studio",
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Quote & Testimonial Card Studio", item: pageUrl },
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
            <span aria-current="page">
              Quote &amp; Testimonial Card Studio
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="quote-stat-testimonial-card-studio"
                  size={18}
                />
                <span>Quote, Memo &amp; Testimonial Visual Studio</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · Shareable Quotes, Founder Memos &amp; Reviews
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Quote, Founder Memo &amp;{" "}
                <span className={toolHeroHeading}>
                  Testimonial Card Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Extract the sharpest quotes from any article URL or customer
                review and turn them into 1080×1080 verified social post cards,
                highlighter quotes, founder notes, and 5-star testimonials.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                6 Built-In Viral Card Formats
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Verified Tweet / Post Screenshot Card</li>
                <li>2. Neon Highlighter &amp; Founder Memo Cards</li>
                <li>3. 5-Star Client Testimonial &amp; Myth vs. Reality</li>
                <li>4. Instant 1080×1080 PNG + Social Caption Bundle</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <QuoteStatTestimonialCardStudioClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn every article and customer win into 5 shareable quote graphics
        </h2>
        <p className={prose}>
          Verified post screenshots, founder memos, and 5-star review cards are
          among the highest-performing single-image formats on LinkedIn,
          Instagram, and Facebook.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MessageSquareQuote,
              "6 High-Converting Templates",
              "Switch between Verified Post Cards, Highlighter Quotes, Founder Memos, 5-Star Reviews, and Myth vs. Reality.",
            ],
            [
              Sparkles,
              "5 Quotes From Any URL",
              "Automatically pull 5 standalone quotable insights from any blog post or video transcript.",
            ],
            [
              Layers,
              "1080×1080 PNG + Caption",
              "Download crisp square graphics paired with a ready-to-paste social caption.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof MessageSquareQuote;
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

      <ToolResources slug="quote-stat-testimonial-card-studio" />
      <ToolFaq title="Quote & Testimonial Card Studio FAQs" faqs={faqs} />
    </div>
  );
}
