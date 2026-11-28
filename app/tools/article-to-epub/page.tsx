import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
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
      <ToolLandingHero
        slug="article-to-epub"
        title="Article to EPUB for comfortable reading"
        description="Package long web articles into a reflowable EPUB 3 e-book with automatic chapter navigation, clean typography, and source attribution."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="epub" />
        </div>
      </ToolLandingHero>
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
