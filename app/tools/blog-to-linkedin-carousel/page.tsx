import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/blog-to-linkedin-carousel";
const title = "Blog to LinkedIn Carousel Maker | PDF Deck & Slide PNG Download";
const description =
  "Turn a public article URL or pasted text into a designed LinkedIn carousel deck. Edit slide headlines and copy, then download a multi-page PDF and slide PNGs.";
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
    question: "How do I upload a carousel to LinkedIn?",
    answer:
      "LinkedIn document posts accept multi-page PDF files and display them as swipeable carousel slides. Download the Carousel PDF from this tool and attach it as a Document in your LinkedIn post.",
  },
  {
    question: "Can I also download individual slide images?",
    answer:
      "Yes. Alongside the multi-page PDF deck, you can download a ZIP archive containing high-resolution PNG images for every slide.",
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
        name: "Blog to LinkedIn Carousel",
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
            name: "Blog to LinkedIn Carousel",
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
            <span aria-current="page">Blog to LinkedIn Carousel</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Visual slide decks
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Blog to LinkedIn Carousel{" "}
                <span className="text-orange-300">with PDF and PNG slides</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/85">
                Transform your reviewed article into a swipeable 6-to-10 slide
                carousel deck. Choose a color theme, edit any slide, and
                download a LinkedIn-ready PDF plus slide PNG images.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/25 bg-white/5 p-6">
              <h2 className="text-lg font-bold">Carousel workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-orange-50/85">
                <li>1. Import a public article URL or paste content</li>
                <li>2. Pick theme, aspect ratio, and slide count</li>
                <li>3. Download Carousel PDF and slide PNGs</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="linkedin-carousel" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Turn key article sections into swipeable educational slides
        </h2>
        <p className={text}>
          Each carousel includes a cover slide, concise insight slides built
          from your article headings and paragraphs, and a closing call-to-action
          slide with source attribution.
        </p>
      </section>
      <ToolFaq title="Blog to LinkedIn Carousel questions" faqs={faqs} />
    </main>
  );
}
