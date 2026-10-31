import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck2,
  GitMerge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import DisavowFileGeneratorClient from "@/features/disavow-file-generator/DisavowFileGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/disavow-file-generator";
const title =
  "Free Google Disavow File Generator & Validator | Build disavow.txt";
const description =
  "Convert toxic backlink URLs or audit CSVs into a Google Search Console compliant disavow.txt file. Normalize domain: rules, merge existing files, and prevent self-disavows.";

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
    question: "What format does Google Search Console require for a disavow.txt file?",
    answer:
      "Google Search Console requires a UTF-8 or 7-bit ASCII plain-text (.txt) file with one rule per line, up to 100,000 lines and 2 MB maximum. Whole domains must use the 'domain:example.com' prefix without http://, https://, www., or URL paths. Comments must start with a '#' character.",
  },
  {
    question: "Why does Google Search Console reject some disavow files?",
    answer:
      "The most common rejection cause is including protocols or paths inside a domain rule (such as 'domain:https://example.com/' instead of 'domain:example.com'). Our generator automatically strips protocols, www prefixes, ports, and paths from domain-level entries.",
  },
  {
    question: "Should I disavow at the domain: level or single URL level?",
    answer:
      "Google recommends using 'domain:' whenever links come from a link farm, scraper network, or PBN so that future auto-generated pages on that domain are also ignored. Use single URL rules only when a spammy comment or scraped page sits on an otherwise reputable platform (like Medium, GitHub, or Wikipedia).",
  },
  {
    question: "Does uploading a new disavow.txt overwrite my old file in Search Console?",
    answer:
      "Yes. Uploading a new disavow file in Google Search Console completely replaces your previous list. Use our 'Validate & Merge Existing disavow.txt' tab to combine your existing disavow file with newly discovered toxic links before downloading.",
  },
  {
    question: "How does the Self-Disavow Guard protect my site?",
    answer:
      "Enter your own domain in the Protected Domain field and the tool will automatically block any URL or domain rule matching your property, preventing accidental self-disavowal from messy CSV exports.",
  },
  {
    question: "How are multi-tenant blog subdomains like blogspot.com or wordpress.com handled?",
    answer:
      "When root domain collapsing is enabled, the parser preserves the specific tenant subdomain on shared blogging hosts (such as spamblog.blogspot.com or tenant.wordpress.com) so you disavow only the abusive blog rather than the entire hosting platform.",
  },
  {
    question: "When should I submit a disavow file to Google?",
    answer:
      "Google advises disavowing backlinks only when you have a considerable number of spammy, artificial, or paid links pointing to your site AND those links have caused a manual action or are likely to cause one.",
  },
  {
    question: "Are my pasted toxic backlinks uploaded to a server?",
    answer:
      "No. All parsing, domain normalization, deduplication, and UTF-8 file generation happen locally in your browser.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function DisavowFileGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Google Disavow File Generator & Validator",
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
          { name: "Disavow File Generator", item: pageUrl },
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
            <span aria-current="page">Disavow file generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Link Spam Cleanup
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Google Disavow File Generator{" "}
                <span className={toolHeroHeading}>
                  & Syntax Validator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn messy toxic URLs or backlink audit CSVs into a strict,
                Google Search Console compliant <code>disavow.txt</code> file.
                Normalize <code>domain:</code> prefixes, merge existing files,
                and guard against accidental self-disavows.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Strict GSC UTF-8 spec
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Existing disavow.txt merger
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Self-disavow & platform guard
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                GSC Spec Checkpoints
              </p>
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="rounded-lg bg-slate-950/80 p-3 text-emerald-300">
                  <p className="text-slate-400"># Valid domain-level syntax</p>
                  <p>domain:spam-network-example.xyz</p>
                  <p className="mt-2 text-slate-400"># Valid single-URL syntax</p>
                  <p>https://example.org/spam-comment-page</p>
                </div>
                <p className="font-sans text-xs text-slate-300">
                  Strips invalid <code>domain:https://</code> prefixes,
                  deduplicates covered URLs, and verifies the 2 MB / 100k-line
                  cap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <DisavowFileGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Built for real link audits
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Avoid formatting errors that cause Google Search Console to reject your submission
        </h2>
        <p className={prose}>
          A single malformed <code>domain:</code> line—such as leaving{" "}
          <code>https://</code>, <code>www.</code>, or a trailing slash attached
          to a domain rule—can cause Search Console to reject your entire file.
          Our generator normalizes every line deterministically and keeps an
          auditable CSV and DOCX trail for client reporting.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              FileCheck2,
              "Automatic Domain Normalization",
              "Strips protocols, ports, query strings, and www prefixes from domain rules while keeping multi-tenant blog subdomains intact.",
            ],
            [
              GitMerge,
              "Safe Existing File Merging",
              "Because Google replaces your previous disavow list on every upload, merge your existing disavow.txt with new audit entries in one step.",
            ],
            [
              Sparkles,
              "Authority Platform & Self Guard",
              "Prevents accidental domain-wide disavowal of your own property or major platforms like Wikipedia, GitHub, Medium, and LinkedIn.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
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
          Connected Off-Page Audit Tools
        </h2>
        <p className={prose}>
          Before disavowing links, inspect your anchor text ratios with the{" "}
          <Link
            href="/tools/anchor-text-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Anchor Text Distribution Analyzer
          </Link>
          , verify live link attributes in the{" "}
          <Link
            href="/tools/backlink-verification-tool"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Backlink Verification Tool
          </Link>
          , or evaluate prospective publishers before outreach using the{" "}
          <Link
            href="/tools/link-placement-quality-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Guest Post & Link Placement Quality Checker
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="disavow-file-generator" />
      <ToolFaq title="Google disavow file generator questions" faqs={faqs} />
    </div>
  );
}
