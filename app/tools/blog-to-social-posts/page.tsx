import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/blog-to-social-posts";
const title = "Blog to Social Posts Converter | LinkedIn, X Thread & Social Drafts";
const description =
  "Turn a public article URL or pasted text into channel-specific LinkedIn posts, X threads, Facebook updates, and Instagram captions. Download CSV or TXT.";
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
    question: "Which social platforms are included?",
    answer:
      "Each conversion creates editable drafts for LinkedIn, an X / Twitter multi-post thread, Facebook, and Instagram, grounded in the reviewed article points.",
  },
  {
    question: "Can I export the social posts into a spreadsheet?",
    answer:
      "Yes. Download the CSV schedule file to open all channel drafts, character counts, angles, and source links in Excel, Google Sheets, or your social scheduler.",
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
        name: "Blog to Social Posts",
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
            name: "Blog to Social Posts",
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
        slug="blog-to-social-posts"
        title="Blog to Social Posts across four channels"
        description="Repurpose your reviewed article into LinkedIn posts, X threads, Facebook updates, and Instagram captions. Edit each draft and download CSV or TXT."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="social-posts" />
        </div>
      </ToolLandingHero>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Draft channel-ready social posts from your article
        </h2>
        <p className={text}>
          Instead of writing social copy from scratch after publishing an
          article, extract the core takeaways into structured drafts tailored
          for LinkedIn, X threads, Facebook, and Instagram.
        </p>
      </section>
      <ToolFaq title="Blog to Social Posts questions" faqs={faqs} />
    </main>
  );
}
