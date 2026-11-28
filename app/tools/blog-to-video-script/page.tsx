import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/blog-to-video-script";
const title = "Blog to Video Script Converter | YouTube & Shorts Script Draft";
const description =
  "Turn a public article URL or pasted text into an editable video script with spoken narration, scene visuals, on-screen text cues, and DOCX or TXT downloads.";
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
    question: "How do I turn a blog post into a video script?",
    answer:
      "Import a public article URL or paste your article text. Review the extracted sections, choose YouTube Long-Form or Shorts/Reels mode, pick a speaking pace, and create your editable script. Download the finished script as DOCX or TXT.",
  },
  {
    question: "Does this generate a rendered video file?",
    answer:
      "No. This tool creates a structured, editable production script with spoken narration, visual directions, on-screen text cues, and scene duration estimates. You can open the DOCX table in Word or Google Docs for recording.",
  },
  {
    question: "Can I customize the hook and scene narration?",
    answer:
      "Yes. Choose from three opening hook styles and edit any scene's spoken narration before downloading the final DOCX or TXT script.",
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
        name: "Blog to Video Script",
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
            name: "Blog to Video Script",
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
        slug="blog-to-video-script"
        title="Blog to Video Script with scene cues"
        description="Adapt a reviewed article into spoken narration, visual beat notes, and on-screen text cues for YouTube or short-form video. Download a two-column DOCX script or plain text."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="video-script" />
        </div>
      </ToolLandingHero>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Turn written articles into structured recording scripts
        </h2>
        <p className={text}>
          Recording directly from a blog post often feels stiff because written
          paragraphs are longer than spoken sentences. This converter extracts
          key sentences in article order, pairs each scene with visual and
          on-screen text cues, and estimates timing based on your speaking rate.
        </p>
      </section>
      <ToolFaq title="Blog to Video Script questions" faqs={faqs} />
    </main>
  );
}
