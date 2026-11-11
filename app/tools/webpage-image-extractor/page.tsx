import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Image as ImageIcon } from "lucide-react";
import WebpageImageExtractorClient from "@/features/webpage-image-extractor/WebpageImageExtractorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/webpage-image-extractor";
const title =
  "Free Webpage Image Extractor & Bulk .ZIP Downloader | SEO & Media Tool";
const description =
  "Extract all images, Open Graph banners, and logos from any webpage URL, inspect dimensions and alt text, and download all images as a single .ZIP archive.";

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
    question: "How does the Bulk .ZIP Image Downloader avoid browser CORS errors?",
    answer:
      "When you click 'Download Selected as .ZIP', our server-side extractor fetches the public image files directly from the source domain, packages them alongside a CSV manifest (00-images-manifest.csv) containing every image URL and alt attribute, and streams the single .ZIP archive to your browser.",
  },
  {
    question: "What types of images does this tool extract from a URL?",
    answer:
      "It discovers Open Graph social preview banners (og:image and twitter:image), standard <img> tags, lazy-loaded data-src and srcset attributes, and brand logos in PNG, JPG, WebP, SVG, GIF, and AVIF formats.",
  },
  {
    question: "Can I also audit missing alt text while extracting images?",
    answer:
      "Yes! Every extracted image card displays its live alt attribute (or a 'Missing alt text' warning badge) along with a CSV manifest inside the downloaded .ZIP archive.",
  },
  {
    question: "Can I use extracted article images inside the Social Media Post generators?",
    answer:
      "Yes. All of our Social Media and Thread studios use the same Universal URL Extractor so you can pair any generated social post with real images pulled directly from your article.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function WebpageImageExtractorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Webpage Image Extractor & Bulk .ZIP Downloader",
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
          { name: "Webpage Image Extractor", item: pageUrl },
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

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Webpage Image Extractor</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content &amp; Media Utilities · Image Audit &amp; Bulk .ZIP
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Webpage Image Extractor{" "}
                <span className={toolHeroHeading}>
                  &amp; Bulk .ZIP Downloader
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Paste any article or webpage URL to extract every image, Open
                Graph social banner, and SVG graphic—inspect formats,
                dimensions, and alt text, and download all assets in a single{" "}
                <code>.ZIP</code> bundle.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-Click Bulk .ZIP Archive
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  OG, Lazy-Load &amp; Srcset Support
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Includes Alt-Text CSV Manifest
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Extract &amp; Repurpose Page Visuals
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Discovers standard, lazy-loaded &amp; OG images</li>
                <li>2. Filters by Social Banners, Content Images &amp; Logos</li>
                <li>3. Flags missing alt attributes automatically</li>
                <li>4. Packages selected images + CSV manifest into .ZIP</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <WebpageImageExtractorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Grab every visual asset from an article in one click
        </h2>
        <p className={prose}>
          When migrating content, auditing competitor visuals, or repurposing a
          blog post into social media carousels, saving images one by one wastes
          valuable time.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ImageIcon,
              "Deep DOM & Meta Discovery",
              "Extracts og:image, twitter:image, srcset, data-src, and standard <img> tags.",
            ],
            [
              Download,
              "Server-Side .ZIP Bundling",
              "Packages up to 25 selected images plus a complete CSV manifest into a single downloadable .ZIP file.",
            ],
            [
              CheckCircle2,
              "Alt Text & Format Inspection",
              "See which images use modern WebP/AVIF formats and which ones are missing SEO alt text.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ImageIcon;
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

      <ToolResources slug="webpage-image-extractor" />
      <ToolFaq title="Webpage Image Extractor & .ZIP Downloader FAQs" faqs={faqs} />
    </div>
  );
}
