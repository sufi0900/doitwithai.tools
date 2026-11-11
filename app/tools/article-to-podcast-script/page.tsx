import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/article-to-podcast-script";
const title = "Article to Podcast Script Converter | Solo & Co-Host Script DOCX";
const description =
  "Adapt a public article URL or pasted text into an editable solo or two-host podcast script with intro hooks, segment transitions, and DOCX or TXT downloads.";
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
    question: "Can I choose between a solo host and two co-hosts?",
    answer:
      "Yes. Choose Two-Host Conversation to alternate segments between Host A and Host B with transition cues, or Solo Host Monologue for a single presenter.",
  },
  {
    question: "What file formats can I download?",
    answer:
      "You can download a formatted Word document (.docx) and a plain-text script (.txt), or copy the entire episode script to your clipboard.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-10 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Article to Podcast Script",
        url: pageUrl,
        description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tools",
            item: "https://doitwithai.tools/tools",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Content Conversion",
            item: "https://doitwithai.tools/tools/categories/content-conversion",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Article to Podcast Script",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/tools">Tools</Link>
            <span aria-hidden>/</span>
            <Link href="/tools/categories/content-conversion">
              Content conversion
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page">Article to Podcast Script</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content conversion · Audio show prep
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to Podcast Script{" "}
                <span className={toolHeroHeading}>for solo or co-hosts</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Turn a reviewed article into a structured podcast episode outline
                and script with cold open, segment transitions, runtime
                estimates, and DOCX or TXT downloads.
              </p>
              <PortableToolHeroBar />
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 shadow-xl p-6">
              <h2 className="text-lg font-bold">Podcast script workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li>1. Import a public article URL or paste content</li>
                <li>2. Select Solo or Two-Host mode and speaking pace</li>
                <li>3. Edit dialogue and download DOCX or TXT</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="podcast-script" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Prepare a natural podcast episode from written research
        </h2>
        <p className={text}>
          Structure your article&apos;s key points into conversational show
          segments with clear speaker cues, runtime estimates, and show-notes
          source attribution.
        </p>
      </section>
      <ToolFaq title="Article to Podcast Script questions" faqs={faqs} />
    </main>
  );
}
