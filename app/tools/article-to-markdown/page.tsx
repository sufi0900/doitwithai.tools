import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/article-to-markdown";
const title = "Article to Markdown Converter | Clean .MD & Frontmatter Download";
const description =
  "Convert a public article URL or pasted HTML and text into structured Markdown with YAML frontmatter, headings, lists, tables, and reference links.";
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
    question: "What Markdown formatting is preserved?",
    answer:
      "The converter outputs ATX headings (# through ######), paragraphs, bulleted and numbered lists, blockquotes, fenced code blocks, GitHub-flavored pipe tables, image syntax, and numbered reference links.",
  },
  {
    question: "Can I include YAML frontmatter?",
    answer:
      "Yes. Toggle YAML frontmatter to include the reviewed title, author byline, publication date, and source URL at the top of your .md file for Obsidian, Notion, Astro, or static site generators.",
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
        name: "Article to Markdown",
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
            name: "Article to Markdown",
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
            <span aria-current="page">Article to Markdown</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Clean Markdown
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to Markdown{" "}
                <span className="text-orange-300">for notes and docs</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/85">
                Turn a public webpage or pasted HTML into clean, structured
                Markdown with YAML frontmatter, tables, and reference links.
                Download a ready-to-use .md file.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/25 bg-white/5 p-6">
              <h2 className="text-lg font-bold">Markdown workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-orange-50/85">
                <li>1. Import a public article URL or paste HTML</li>
                <li>2. Review sections and toggle frontmatter</li>
                <li>3. Copy or download the .md file</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="markdown" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Save web articles in portable Markdown format
        </h2>
        <p className={text}>
          Clean Markdown makes it easy to archive research in Obsidian, commit
          documentation to Git repositories, or migrate blog posts into a modern
          CMS without carrying over bloated webpage markup.
        </p>
      </section>
      <ToolFaq title="Article to Markdown questions" faqs={faqs} />
    </main>
  );
}
