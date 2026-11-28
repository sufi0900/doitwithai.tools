import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Code2,
  ListTree,
  Sparkles,
} from "lucide-react";
import TableOfContentsGeneratorClient from "@/features/table-of-contents-generator/TableOfContentsGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/table-of-contents-generator";
const title =
  "Free SEO Table of Contents & Jump-Link Generator | HTML & Markdown TOC";
const description =
  "Generate a semantic HTML or Markdown Table of Contents from H2–H4 headings, automatically inject unique id attributes into your article, and export Jump-Link JSON-LD.";

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
    question: "How does a Table of Contents help On-Page SEO and AI Search?",
    answer:
      "A semantic HTML <nav> Table of Contents paired with matching id='...' attributes on your H2 and H3 headings allows Google to display clickable 'Jump to' sitelinks directly in SERP snippets and gives AI answer engines a clear structural map of your article.",
  },
  {
    question: "Why is it important to inject id attributes into the headings too?",
    answer:
      "An anchor link like <a href='#step-1'> only scrolls to the section if the corresponding heading actually carries id='step-1'. Our tab #2 ('Full HTML + Injected IDs') automatically writes the matching id attributes into every H2–H4 tag.",
  },
  {
    question: "How are duplicate heading names handled?",
    answer:
      "If two subheadings share the exact same text (such as 'Examples'), the generator automatically appends a unique suffix (#examples and #examples-2) so your HTML stays valid.",
  },
  {
    question: "Does the generated HTML Table of Contents require JavaScript?",
    answer:
      "No. It uses pure semantic HTML (<nav>, <ol>/<ul>, <li>, and <a href='#slug'>) so it works with zero client-side JavaScript and zero Cumulative Layout Shift (CLS).",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function TableOfContentsGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "SEO Table of Contents & Jump-Link Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Table of Contents Generator", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ToolLandingHero
        slug="table-of-contents-generator"
        title="SEO Table of Contents & Jump-Link Generator"
        description="Turn HTML or Markdown headings into a clean, accessible &lt;nav&gt; Table of Contents, automatically inject collision-free id attributes into your headings, and export Jump-Link JSON-LD schema."
        categoryLabel="On-page SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <TableOfContentsGeneratorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Earn SERP &ldquo;Jump to&rdquo; links and improve long-form scannability
        </h2>
        <p className={prose}>
          Long-form guides without anchor navigation force mobile readers to
          scroll endlessly and prevent search engines from linking directly to
          deep sub-sections in search results.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ListTree,
              "Automatic ID Injection",
              "Generates both the navigation block and the updated article body with matching id attributes on every H2–H4 tag.",
            ],
            [
              Code2,
              "Editable Slugs & Exclusions",
              "Shorten long heading slugs or uncheck specific headings with live preview updates.",
            ],
            [
              Sparkles,
              "Structured ItemList Schema",
              "Includes ready-to-paste JSON-LD ItemList markup mapping each section URL fragment.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ListTree;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Related Heading & Structure Tools
        </h2>
        <p className={prose}>
          Audit your heading hierarchy first in the{" "}
          <Link
            href="/tools/heading-structure-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Heading Structure Analyzer
          </Link>
          , optimize your H2 answer passages in the{" "}
          <Link
            href="/tools/featured-snippet-optimizer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Featured Snippet & AI Overview Optimizer
          </Link>
          , or convert full webpages to clean Markdown in{" "}
          <Link
            href="/tools/article-to-markdown"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Article to Markdown
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="table-of-contents-generator" />
      <ToolFaq title="SEO Table of Contents & jump-link questions" faqs={faqs} />
    </div>
  );
}
