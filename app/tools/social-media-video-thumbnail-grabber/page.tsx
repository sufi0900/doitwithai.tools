import type { Metadata } from "next";
import Link from "next/link";
import { Download, Film, Image as ImageIcon } from "lucide-react";
import SocialMediaVideoThumbnailGrabberClient from "@/features/social-media-video-thumbnail-grabber/SocialMediaVideoThumbnailGrabberClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/social-media-video-thumbnail-grabber";
const title =
  "Free YouTube, Shorts & Social Video 4K Thumbnail & Frame Downloader (.ZIP)";
const description =
  "Download 1080p/4K YouTube & Shorts thumbnails (maxresdefault), storyboard video frames, and social OpenGraph cover cards individually or bundled in a 1-click .ZIP file.";

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
    question: "How do I download the highest resolution 4K/1080p thumbnail from a YouTube video or Short?",
    answer:
      "Paste any YouTube watch link, youtu.be short link, or YouTube Shorts link into the box and click 'Grab 4K Thumbnails & Frames'. You will immediately get the 1280×720 HD maxresdefault cover, standard covers, and 3 auto-captured in-video storyboard frames.",
  },
  {
    question: "Can I download all video thumbnails and frames at once as a .ZIP?",
    answer:
      "Yes! Select the resolutions and storyboard frames you want and click 'Download Selected as .ZIP' to bundle all images plus a CSV manifest into a single archive.",
  },
  {
    question: "Does this also work for non-YouTube pages and social posts?",
    answer:
      "Yes. For public webpages and social URLs, the tool inspects OpenGraph (og:image), X/Twitter card images (twitter:image), HTML5 <video poster> attributes, and hero media assets.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function SocialMediaVideoThumbnailGrabberPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "YouTube, Shorts & Social Video 4K Thumbnail Downloader",
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
          { name: "Video Thumbnail & Frame Grabber", item: pageUrl },
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
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Video Thumbnail &amp; Frame Grabber</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Video &amp; Social Media Studio · 4K Covers, Frames &amp; .ZIP Export
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                YouTube, Shorts &amp; Social{" "}
                <span className={toolHeroHeading}>
                  4K Thumbnail &amp; Frame Grabber
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Extract every thumbnail resolution (`maxresdefault`, `sddefault`,
                `hqdefault`), 3 in-video storyboard frames (`25%`, `50%`, `75%`),
                and privacy-enhanced embed code—or download all covers in a
                single 1-click <code>.ZIP</code> bundle.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                All 7 Video Assets in 1 Click
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 1280×720 HD Widescreen Cover (maxresdefault)</li>
                <li>2. SD, HQ &amp; Medium 16:9 Fallback Covers</li>
                <li>3. 3 Auto-Captured Storyboard Video Stills</li>
                <li>4. 1-Click Server-Side .ZIP Bundle + CSV Manifest</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <SocialMediaVideoThumbnailGrabberClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Grab high-resolution video covers, storyboard stills, and embeds
        </h2>
        <p className={prose}>
          Whether you are embedding a video in a blog post, auditing competitor
          thumbnail designs, or repurposing a YouTube Short across social feeds,
          instant access to uncompressed cover assets and storyboard stills
          keeps your workflow fast.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ImageIcon,
              "MaxRes 1080p/4K Covers",
              "Pulls the highest resolution maxresdefault.jpg file directly from YouTube's image CDN.",
            ],
            [
              Film,
              "In-Video Storyboard Stills",
              "Inspects auto-captured frames at the 25%, 50%, and 75% marks of the video.",
            ],
            [
              Download,
              "1-Click .ZIP Archive",
              "Bundles all selected thumbnails and a CSV manifest into a single download.",
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

      <ToolResources slug="social-media-video-thumbnail-grabber" />
      <ToolFaq title="Video Thumbnail & Frame Grabber FAQs" faqs={faqs} />
    </div>
  );
}
