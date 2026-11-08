import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import OutboundLinkCheckerClient from "@/features/outbound-link-checker/OutboundLinkCheckerClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/outbound-link-checker";
const description =
  "Audit your outbound links, anchor text, rel attributes (nofollow, sponsored, ugc), and citation authority with instant SEO-safe HTML and Markdown fixes.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free Outbound Link Checker & External SEO Link Auditor",
  category: "AI SEO · Link Audit & Citation Verification",
  ctaText: "Inspect. Qualify. Protect.",
  features: "Outbound Rel Tag Checker,Anchor Leak Prevention,Auto-Repaired HTML Links",
})}`;

export const metadata: Metadata = {
  title: "Free Outbound Link Checker & External SEO Link Auditor",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Outbound Link Checker & External SEO Link Auditor",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Outbound Link Checker & External SEO Link Auditor",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What does an outbound link checker inspect for SEO and AI search?",
    "Our outbound link checker parses your HTML and Markdown links to verify HTTPS security, Google rel attribute compliance (rel='sponsored', rel='ugc', rel='nofollow', rel='noopener'), primary source deep-link quality, and whether any external anchor text accidentally leaks your page's primary target keyword.",
  ],
  [
    "When should I use rel='sponsored' vs. rel='nofollow' vs. rel='ugc' on external links?",
    "According to Google Search Central guidelines, use rel='sponsored' on affiliate links, paid placements, and compensated partner URLs; use rel='ugc' on user-generated comments or forum posts; and use rel='nofollow' when you cannot vouch for an external page's editorial integrity.",
  ],
  [
    "Why is linking out with my page's primary target keyword dangerous for SEO?",
    "When you hyperlink your own target keyword to an external domain, you tell search engines that the destination URL is the authoritative resource for that exact query—creating an external anchor cannibalization leak that can suppress your own page's rankings.",
  ],
  [
    "Do outbound links to authoritative sources help Google E-E-A-T and AI Overview citations?",
    "Yes—citing specific deep links from primary standards bodies, government datasets, peer-reviewed research, and official documentation demonstrates verifiable sourcing and helps LLM answer engines validate your claims.",
  ],
  [
    "Why does the checker flag bare homepage URLs (like https://example.com/)?",
    "Bare root URLs rarely substantiate a specific claim, statistic, or technical standard; replacing root domain links with the exact documentation or study URL improves user verification and citation fidelity.",
  ],
  [
    "How do I audit my internal links after fixing my outbound links?",
    "Once your external links are properly qualified, run your internal site links through our Internal Link Anchor & Cannibalization Auditor or discover new cross-linking opportunities in the Internal Link Opportunity Finder.",
  ],
];

const OUTBOUND_PROMPTS = [
  {
    title: "1. Outbound Link Rel Attribute & Affiliate Compliance Prompt",
    badge: "Rel Compliance",
    prompt: `Audit all HTML <a> and Markdown links in this article draft targeting [Target Keyword]. Flag any affiliate or partner URLs (?ref=, ?via=, ?aff=) missing rel="sponsored noopener", upgrade any insecure http:// links to https://, and rewrite any external anchor text that matches our primary keyword [Target Keyword].`,
  },
  {
    title: "2. Primary Source Deep-Link & E-E-A-T Citation Upgrade Prompt",
    badge: "E-E-A-T Citations",
    prompt: `Review the external citations in this draft about [Topic]. Replace generic "click here" or bare homepage URLs with descriptive 4–6 word entity anchors pointing to specific primary documentation, standards, or benchmark studies.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function OutboundLinkCheckerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free Outbound Link Checker & External SEO Link Auditor",
        alternateName: [
          "Outbound Link Checker",
          "SEO Tools Link Checker",
          "External Link & Rel Attribute Auditor",
          "Affiliate & Sponsored Link Compliance Checker",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Audit Outbound Links for SEO Rel Compliance and Anchor Safety",
        description:
          "Check external links for rel='sponsored', keyword anchor leaks, and deep-link citation quality in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your page's target keyword and root domain",
            text: "Provide the primary keyword your page targets and your domain name so the checker separates internal and external links.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Paste your HTML <a> tags, Markdown links, or URLs",
            text: "Paste all links from your article or review page into the input box.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Inspect the Link-by-Link Diagnostic Table",
            text: "Review flagged HTTP links, missing rel='sponsored' tags, bare homepages, and target-keyword anchor conflicts.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your auto-repaired HTML snippet or export to CSV",
            text: "Copy the cleaned, SEO-safe HTML links with proper rel attributes and descriptive anchors.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "Outbound Link Checker",
            item: pageUrl,
          },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
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
            <span aria-current="page">Outbound Link Checker</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                LINK AUDIT &amp; VERIFICATION · REL ATTRIBUTES &amp; ANCHOR SAFETY
              </p>
              <h1 className={toolHeroHeading}>
                Free Outbound Link Checker &amp; External SEO Link Auditor
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Inspect your external HTML and Markdown links for{" "}
                <strong>
                  rel=&ldquo;sponsored&rdquo; / &ldquo;nofollow&rdquo; compliance
                </strong>
                , <strong>target-keyword anchor leaks</strong>,{" "}
                <strong>insecure HTTP URLs</strong>, and{" "}
                <strong>E-E-A-T deep-link authority</strong>—with instant,
                copy-ready HTML repairs.
              </p>
              <div className="mt-5">
                <PortableToolHeroBar
                  title="Free Outbound Link Checker & External SEO Link Auditor"
                  path="/tools/outbound-link-checker"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                What This Link Checker Protects
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>Google Link Spam Compliance</strong>: Auto-detects
                  affiliate URLs missing <code>rel=&quot;sponsored&quot;</code>.
                </li>
                <li>
                  • <strong>Keyword Cannibalization Guard</strong>: Flags
                  external links that use your page&apos;s own target keyword.
                </li>
                <li>
                  • <strong>Deep-Link Citation Quality</strong>: Separates
                  specific documentation URLs from bare homepages.
                </li>
              </ul>
            </div>
          </div>

          <OutboundLinkCheckerClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Outbound Link SEO Best Practices
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Optimize Outbound Links for Google SEO and E-E-A-T
          </h2>
          <p className={prose}>
            To optimize outbound links without leaking ranking equity, qualify
            every paid or affiliate URL with{" "}
            <code>rel=&quot;sponsored noopener&quot;</code>, use{" "}
            <code>rel=&quot;ugc&quot;</code> for user submissions, never use
            your page&apos;s primary target keyword as external anchor text, and
            link directly to specific HTTPS documentation or study URLs rather
            than bare homepages.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Google Outbound Link Qualification Matrix (Dofollow vs. Sponsored vs. UGC)
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Link Scenario</th>
                  <th className="px-4 py-3.5">Recommended Rel Attribute</th>
                  <th className="px-4 py-3.5">Anchor Text Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Editorial Primary Citation (.gov, .edu, Docs)
                  </td>
                  <td className="px-4 py-3.5">
                    Standard Dofollow + <code>rel=&quot;noopener&quot;</code>
                  </td>
                  <td className="px-4 py-3.5">
                    Specific study, standard, or specification title
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Affiliate, Partner, or Paid Placement
                  </td>
                  <td className="px-4 py-3.5">
                    <code>rel=&quot;sponsored noopener&quot;</code>
                  </td>
                  <td className="px-4 py-3.5">
                    Brand or product name (never your own target keyword)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    User Comments, Forum Posts &amp; Reviews
                  </td>
                  <td className="px-4 py-3.5">
                    <code>rel=&quot;ugc nofollow noopener&quot;</code>
                  </td>
                  <td className="px-4 py-3.5">
                    Descriptive context; strip raw spam URLs
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Unverified or Untrusted External Page
                  </td>
                  <td className="px-4 py-3.5">
                    <code>rel=&quot;nofollow noopener&quot;</code>
                  </td>
                  <td className="px-4 py-3.5">
                    Neutral brand or claim reference
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Need to evaluate the factual credibility of the external domains you
            cite? Run them through our{" "}
            <Link
              href="/tools/external-link-source-review"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              External Link and Source Review
            </Link>{" "}
            tool, and check your internal site architecture with the{" "}
            <Link
              href="/tools/internal-link-anchor-auditor"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Internal Link Anchor &amp; Cannibalization Auditor
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for Auditing Outbound Links &amp; Rel Attributes
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {OUTBOUND_PROMPTS.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-[#4662df] dark:text-blue-300">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="text-3xl font-black">
            Frequently Asked Questions: Outbound Link Checker &amp; SEO Link Audits
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5" open>
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolResources slug="outbound-link-checker" />
      </div>
    </>
  );
}
