import type { Metadata } from "next";
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
            <span aria-current="page">Blog to Social Posts</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Social distribution
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Blog to Social Posts{" "}
                <span className="text-orange-300">across four channels</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/85">
                Repurpose your reviewed article into LinkedIn posts, X threads,
                Facebook updates, and Instagram captions. Edit each draft and
                download CSV or TXT.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/25 bg-white/5 p-6">
              <h2 className="text-lg font-bold">Repurposing workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-orange-50/85">
                <li>1. Import a public article URL or paste content</li>
                <li>2. Choose a drafting angle and link preference</li>
                <li>3. Edit channel posts and download CSV or TXT</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="social-posts" />
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
