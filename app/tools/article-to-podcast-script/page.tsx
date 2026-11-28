import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
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
      <ToolLandingHero
        slug="article-to-podcast-script"
        title="Article to Podcast Script for solo or co-hosts"
        description="Turn a reviewed article into a structured podcast episode outline and script with cold open, segment transitions, runtime estimates, and DOCX or TXT downloads."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="podcast-script" />
        </div>
      </ToolLandingHero>
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
