import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/blog-to-newsletter";
const title = "Blog to Newsletter Converter | HTML, TXT & DOCX Email Draft";
const description =
  "Adapt a public article URL or pasted text into an editable email newsletter with subject lines, preheader text, key takeaways, and HTML or TXT downloads.";
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
    question: "What files can I download for my email platform?",
    answer:
      "You can download a responsive inline-CSS HTML email file (.html), a plain-text edition (.txt), and an editable Word document (.docx).",
  },
  {
    question: "Can I edit the subject line and intro before exporting?",
    answer:
      "Yes. After generating the newsletter draft, edit the subject line and intro paragraph directly and your HTML, TXT, and DOCX downloads update automatically.",
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
        name: "Blog to Newsletter",
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
            name: "Blog to Newsletter",
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
        slug="blog-to-newsletter"
        title="Blog to Newsletter in HTML and plain text"
        description="Turn a reviewed blog post into a subscriber-ready email digest with subject lines, preview text, key takeaways, and a call to action."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="newsletter" />
        </div>
      </ToolLandingHero>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Send a concise email digest that drives readers to your full article
        </h2>
        <p className={text}>
          Subscribers prefer a scannable email summary with clear takeaways and
          a direct link to read more. This tool structures your reviewed article
          into both an inline-styled HTML template and a plain-text copy.
        </p>
      </section>
      <ToolFaq title="Blog to Newsletter questions" faqs={faqs} />
    </main>
  );
}
