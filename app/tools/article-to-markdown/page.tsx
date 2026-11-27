import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
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
      <ToolLandingHero
        slug="article-to-markdown"
        title="Article to Markdown for notes and docs"
        description="Turn a public webpage or pasted HTML into clean, structured Markdown with YAML frontmatter, tables, and reference links. Download a ready-to-use .md file."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="markdown" />
        </div>
      </ToolLandingHero>
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
