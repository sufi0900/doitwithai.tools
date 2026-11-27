import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
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
      <ToolLandingHero
        slug="blog-to-linkedin-carousel"
        title="Blog to LinkedIn Carousel with PDF and PNG slides"
        description="Transform your reviewed article into a swipeable 6-to-10 slide carousel deck. Choose a color theme, edit any slide, and download a LinkedIn-ready PDF plus slide PNG images."
        categoryLabel="Content conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="linkedin-carousel" />
        </div>
      </ToolLandingHero>
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
