import type { Metadata } from "next";
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
      <header className="relative overflow-hidden bg-[#291B26] text-white">
        <div className={`${section} relative py-12 sm:py-16`}>
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap gap-2 text-xs text-orange-100/80"
          >
            <Link href="/tools">Tools</Link>
            <span aria-hidden>/</span>
            <Link href="/tools/categories/content-conversion">
              Content conversion
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page">Blog to Video Script</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Video scripting
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Blog to Video Script{" "}
                <span className="text-orange-300">with scene cues</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/85">
                Adapt a reviewed article into spoken narration, visual beat
                notes, and on-screen text cues for YouTube or short-form video.
                Download a two-column DOCX script or plain text.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/25 bg-white/5 p-6">
              <h2 className="text-lg font-bold">Script workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-orange-50/85">
                <li>1. Import a public article URL or paste content</li>
                <li>2. Choose YouTube or Shorts format and pace</li>
                <li>3. Edit scenes and download DOCX or TXT</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="video-script" />
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
