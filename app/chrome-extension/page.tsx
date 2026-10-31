import type { Metadata } from "next";
import ChromeExtensionShowcaseClient from "@/features/chrome-extension/ChromeExtensionShowcaseClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/chrome-extension";
const title =
  "Free AI SEO Inspector, Content Converter & Social Studio Chrome Extension | Do It With AI Tools";
const description =
  "Inspect On-Page & Technical SEO, score E-E-A-T & Information Gain, convert any article to PDF/Word/Markdown/MP3, and generate 15 social media posts in 1 click.";

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
    question:
      "What makes the Do It With AI Chrome Extension different from Ahrefs SEO Toolbar or Detailed SEO?",
    answer:
      "Traditional SEO extensions only display raw meta tags and link counts. Our extension combines a full On-Page/Technical SEO Toolbar (Rendered vs. Raw DOM Canonical, Robots, H1–H6 tree, JSON-LD Schema, Dofollow/Nofollow highlighter) with 20-Point E-E-A-T & Information Gain scoring, 1-Click Article Conversion (Markdown, Word, PDF, Read-Aloud Audio), and an instant 15-Post Social Media Studio.",
  },
  {
    question: "Is the Chrome Extension completely free to use?",
    answer:
      "Yes. All local DOM inspections, E-E-A-T and Information Gain scores, TOC HTML generation, link/image CSV exports, Markdown/Word downloads, and 15 social post templates run 100% free in your browser with no paid subscription required.",
  },
  {
    question:
      "Can I dock the extension to Chrome's Side Panel or open a side-by-side Split View?",
    answer:
      "Yes. Built on Manifest V3, the extension includes both a 'Dock to Side Panel' button (◧) that automatically adapts its layout to narrow side panels AND an 'Auto-Fit Split Screen' button (⇔) that resizes your active browser page and docks the full 2-pane extension right beside it.",
  },
  {
    question:
      "Does it work on websites that block server-side crawlers (like Cloudflare pages)?",
    answer:
      "Yes! Because the extension inspects the live rendered DOM directly inside your active browser tab, it works on any page you can view in Chrome—even pages behind bot protection or login screens.",
  },
  {
    question: "Does the extension slow down my browsing speed?",
    answer:
      "No. The extension uses strict on-demand Manifest V3 activeTab execution—zero background scripts run on your pages until you click the extension icon.",
  },
];

export default function ChromeExtensionPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Do It With AI: SEO Inspector, Content Converter & Social Studio Chrome Extension",
        url: pageUrl,
        description,
        applicationCategory: "BrowserApplication",
        operatingSystem: "Chrome, Brave, Microsoft Edge",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Chrome Extension", item: pageUrl },
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

      {/* Merlin-Inspired Animated Hero + Live Interactive Extension Simulator */}
      <ChromeExtensionShowcaseClient />

      {/* Head-to-Head Comparison Table */}
      <section className="mx-auto max-w-6xl border-t border-slate-200 px-4 py-12 dark:border-slate-800 sm:px-6">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
          Side-by-Side Comparison
        </span>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          How Do It With AI Compares to Standard SEO Extensions
        </h2>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="p-4 font-extrabold">Capability</th>
                <th className="p-4 font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                  Do It With AI Studio
                </th>
                <th className="p-4 font-bold text-slate-500">
                  Ahrefs SEO Toolbar
                </th>
                <th className="p-4 font-bold text-slate-500">
                  MarketingSyrup SEO Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                [
                  "Meta Tags, Canonical (DOM vs. Raw), Robots & Hreflang",
                  "✅ Included Free",
                  "✅ Included",
                  "✅ Included",
                ],
                [
                  "H1–H6 Tree + 1-Click Crawl-Safe <nav> TOC HTML Generator",
                  "✅ Included Free",
                  "Headings only (No TOC HTML)",
                  "Headings only (No TOC HTML)",
                ],
                [
                  "20-Point E-E-A-T & 6-Dimension Information Gain Gauges",
                  "✅ Included Free",
                  "❌ Not available",
                  "❌ Not available",
                ],
                [
                  "Anchor Text Ratio Audit & Guest Post Prospect Vetting",
                  "✅ Included Free",
                  "Basic link list",
                  "Basic link list",
                ],
                [
                  "1-Click Article to Markdown, Word, PDF & Read-Aloud Audio",
                  "✅ Included Free",
                  "❌ Not available",
                  "❌ Not available",
                ],
                [
                  "Instant 15 Social Media Posts + LinkedIn Carousel Handoff",
                  "✅ Included Free",
                  "OG tag list only",
                  "Static OG preview only",
                ],
                [
                  "Responsive Chrome Side Panel + 1-Click Auto-Fit Split View",
                  "✅ Included Free",
                  "Overlay bar",
                  "Popup only",
                ],
              ].map(([feat, ours, ahrefs, seopro]) => (
                <tr key={feat}>
                  <td className="p-4 font-bold">{feat}</td>
                  <td className="p-4 font-extrabold text-emerald-700 dark:text-emerald-300">
                    {ours}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {ahrefs}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {seopro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ToolFaq title="Do It With AI Chrome Extension FAQs" faqs={faqs} />
    </div>
  );
}
