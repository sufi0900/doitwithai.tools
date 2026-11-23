import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/article-to-epub";
const title = "Article to EPUB Converter | Reflowable E-Book Download";
const description =
  "Convert a public article URL or pasted text into a reflowable EPUB 3 e-book with chapter navigation, clean typography, and source references.";
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
    question: "Is the downloaded file a real EPUB 3 package?",
    answer:
      "Yes. The converter builds a standard OCF EPUB 3 archive with an uncompressed mimetype header, container.xml, OPF package metadata, an EPUB navigation table of contents, stylesheet, and valid XHTML content.",
  },
  {
    question: "Where can I open the .epub file?",
    answer:
      "You can open the downloaded .epub file in Apple Books, Calibre, Kobo, Google Play Books, PocketBook, or send it to Kindle via Send to Kindle.",
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
        name: "Article to EPUB",
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
            name: "Article to EPUB",
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
            <span aria-current="page">Article to EPUB</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content conversion · E-reader format
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to EPUB{" "}
                <span className={toolHeroHeading}>for comfortable reading</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Package long web articles into a reflowable EPUB 3 e-book with
                automatic chapter navigation, clean typography, and source
                attribution.
              </p>
              <PortableToolHeroBar />
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 shadow-xl p-6">
              <h2 className="text-lg font-bold">E-book workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li>1. Import a public article URL or paste content</li>
                <li>2. Review title, attribution, and typography</li>
                <li>3. Download your .epub e-book file</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="epub" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Read long-form articles on any e-reader with reflowable text
        </h2>
        <p className={text}>
          Unlike fixed-page PDFs, EPUB files adapt to your screen size, font
          preferences, and reading mode in Apple Books, Calibre, and e-ink
          devices.
        </p>
      </section>
      <ToolFaq title="Article to EPUB questions" faqs={faqs} />
    </main>
  );
}
