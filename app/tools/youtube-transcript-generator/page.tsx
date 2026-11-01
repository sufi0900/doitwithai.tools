import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, Play } from "lucide-react";
import YoutubeTranscriptGeneratorClient from "@/features/youtube-transcript-generator/YoutubeTranscriptGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
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
            <span aria-current="page">YouTube Transcript Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon slugOrText="youtube-transcript-generator" size={18} />
                <span>Official Platform Studio</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Video &amp; Content Studio · Transcripts, .SRT &amp; AI Chapters
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                YouTube Transcript,{" "}
                <span className={toolHeroHeading}>
                  Chapters &amp; AI Summary Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Paste any YouTube video or Shorts URL to extract the full
                timestamped transcript, search inside spoken audio, generate
                copy-ready YouTube description chapters, and export{" "}
                <code>.TXT</code>, <code>.SRT</code>, or Markdown notes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-Click URL Caption Fetch
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  .TXT, .SRT &amp; .MD Export
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  AI Chapters &amp; Takeaways
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Everything From 1 YouTube Link
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Timestamped or clean plain-text transcript</li>
                <li>2. SubRip (.SRT) subtitle file for video editors</li>
                <li>3. Copy-ready YouTube description chapter timestamps</li>
                <li>4. Direct handoff to Video-to-Blog Converter</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <YoutubeTranscriptGeneratorClient />

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
