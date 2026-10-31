import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Film, Sparkles } from "lucide-react";
import VideoTranscriptToBlogClient from "@/features/video-transcript-to-blog/VideoTranscriptToBlogClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/video-transcript-to-blog";
const title =
  "Free YouTube Transcript & Video Notes to SEO Blog Post Converter";
const description =
  "Convert raw YouTube video transcripts and timestamped notes into a structured SEO blog article with H2 chapters, Featured Snippet summary, and FAQ schema.";

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
    question: "Why shouldn't I publish a raw video transcript directly as a blog post?",
    answer:
      "Spoken transcripts contain conversational filler ('um', 'you know', 'basically'), run-on sentences, and lack H2/H3 heading hierarchy. Search engines and readers prefer structured sections, a concise executive summary above the fold, and scannable bullet takeaways.",
  },
  {
    question: "How does this tool handle YouTube timestamps like [01:15]?",
    answer:
      "Our parser automatically detects timestamp markers, promotes chapter headers into semantic H2 headings, and preserves optional timestamp badges so readers can jump to the exact moment in your embedded video.",
  },
  {
    question: "Does converting my own YouTube videos into blog posts help E-E-A-T?",
    answer:
      "Yes! Repurposing your own videos into written guides embeds your first-hand demonstrations, benchmarks, and personal perspective into text that Google Search and AI answer engines can index and cite.",
  },
  {
    question: "Can I export the finished article as Markdown or HTML?",
    answer:
      "Yes. Switch between the Visual Preview, Markdown (.MD), and semantic HTML tabs to copy or download the format that fits your CMS.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function VideoTranscriptToBlogPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "YouTube Transcript & Video Notes to SEO Blog Post Converter",
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
          { name: "Video Transcript to Blog", item: pageUrl },
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
            <span aria-current="page">Video Transcript to Blog</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Conversion · Video-to-Article Repurposing
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                YouTube Transcript to{" "}
                <span className={toolHeroHeading}>
                  SEO Blog Post Converter
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn raw YouTube transcripts, webinar recordings, or timestamped
                voice notes into a structured SEO article with H2 chapters, a
                48-word Featured Snippet summary, key takeaway bullets, and
                FAQs.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Strips Spoken Filler Words
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Timestamps → H2 Chapters
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Markdown &amp; HTML Export
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                From Spoken Transcript to Ranked Guide
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Removes &ldquo;um&rdquo;, &ldquo;uh&rdquo;, and spoken repetition</li>
                <li>2. Builds a 48-word Featured Snippet summary</li>
                <li>3. Converts timestamp chapters into H2 sections</li>
                <li>4. Exports clean Markdown (.MD) or semantic HTML</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <VideoTranscriptToBlogClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn every video into an evergreen search asset
        </h2>
        <p className={prose}>
          Your videos already contain first-hand experience and original
          insights. Converting them into well-structured articles lets you rank
          in both Google Web Search and YouTube Search simultaneously.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Film,
              "Timestamp Chapter Mapping",
              "Automatically turns [01:15] chapter markers into clean H2 subheadings and jump-link navigation.",
            ],
            [
              Sparkles,
              "AI Editorial Polish",
              "Rewrites spoken sentences into crisp, publication-ready paragraphs while preserving your exact proof points.",
            ],
            [
              FileText,
              "Ready for WordPress & Next.js",
              "Copy semantic HTML with a <nav> Table of Contents or download a clean Markdown file.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Film;
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

      <ToolResources slug="video-transcript-to-blog" />
      <ToolFaq title="Video Transcript to Blog Converter FAQs" faqs={faqs} />
    </div>
  );
}
