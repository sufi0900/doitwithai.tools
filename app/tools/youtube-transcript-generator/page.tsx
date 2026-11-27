import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Clock,
  FileText,
  Play,
} from "lucide-react";
import YoutubeTranscriptGeneratorClient from "@/features/youtube-transcript-generator/YoutubeTranscriptGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl = "https://doitwithai.tools/tools/youtube-transcript-generator";
const title =
  "Free YouTube Transcript Generator, Chapter Extractor & AI Summary";
const description =
  "Extract timestamped transcripts and chapters from any YouTube video or Short, generate an AI executive summary, and download .TXT, .SRT subtitles, or Markdown notes.";

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
    question: "How do I extract the transcript of a YouTube video with timestamps?",
    answer:
      "Paste any YouTube watch URL, youtu.be short link, or YouTube Shorts link into the top bar and click 'Fetch Transcript & Chapters'. You can toggle timestamps on or off, search for specific keywords inside the spoken audio, and copy or download the full text.",
  },
  {
    question: "Can I download the transcript as an .SRT subtitle file?",
    answer:
      "Yes! Click the '.SRT' export button to download a properly formatted SubRip (.srt) subtitle file with start and end timecodes ready for Premiere Pro, CapCut, DaVinci Resolve, or LinkedIn native video uploads.",
  },
  {
    question: "How do I turn a YouTube transcript into a full SEO blog post?",
    answer:
      "Click 'Turn Transcript Into SEO Blog Post' in the top right (or paste your YouTube URL directly into our Video Transcript to Blog Converter) to transform the spoken transcript into an H2-structured article with FAQ schema.",
  },
  {
    question: "Does the DoItWithAI Chrome Extension also extract YouTube transcripts?",
    answer:
      "Yes. Opening the DoItWithAI Chrome Extension while watching a YouTube video lets you inspect and repurpose the live video metadata and transcript directly inside your browser tab.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function YoutubeTranscriptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "YouTube Transcript, Chapters & AI Summary Generator",
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
          { name: "YouTube Transcript Generator", item: pageUrl },
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
        slug="youtube-transcript-generator"
        title="YouTube Transcript, Chapters & AI Summary Studio"
        description="Paste any YouTube video or Shorts URL to extract the full timestamped transcript, search inside spoken audio, generate copy-ready YouTube description chapters, and export .TXT , .SRT , or Markdown notes."
        categoryLabel="Video & Content Studio"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <YoutubeTranscriptGeneratorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Read, search, and repurpose any YouTube video in seconds
        </h2>
        <p className={prose}>
          Whether you are researching competitor videos, extracting quotes for
          an article, or generating chapter timestamps for your own channel,
          having a searchable transcript saves hours of manual scrubbing.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Play,
              "Clickable Timecodes",
              "Click any timestamp badge to jump straight to that exact second on YouTube.",
            ],
            [
              Clock,
              "Auto-Generated Chapters",
              "Creates formatted 00:00 chapter lists you can paste straight into your YouTube description to unlock video chapters on SERPs.",
            ],
            [
              FileText,
              ".SRT & Blog Repurposing",
              "Export .SRT subtitle files or send the transcript straight into our SEO Blog Post and Social Thread studios.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Play;
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

      <ToolResources slug="youtube-transcript-generator" />
      <ToolFaq title="YouTube Transcript & Summary Generator FAQs" faqs={faqs} />
    </div>
  );
}
