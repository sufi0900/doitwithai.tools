import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import LocalSeoAuditClient from "@/features/local-seo-audit-tool/LocalSeoAuditClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/local-seo-audit-tool";
const description =
  "Run a free local SEO audit for your SMB to check Google Business Profile signals, near me keyword coverage, NAP citations, and LocalBusiness schema.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free Local SEO Audit Tool: Map Pack & Near Me Optimizer",
  category: "AI SEO · Local Search & SMB Geo-Targeting",
  ctaText: "Audit GBP. Win Map Pack.",
  features: "Free Local SEO Audit,Near Me Keyword Matrix,LocalBusiness Schema",
})}`;

export const metadata: Metadata = {
  title: "Free Local SEO Audit Tool: Map Pack & Near Me Optimizer",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Local SEO Audit Tool: Map Pack & Near Me Optimizer",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Local SEO Audit Tool: Map Pack & Near Me Optimizer",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What does a free local SEO audit check for small and medium businesses (SMBs)?",
    "Our free local SEO audit evaluates your Google Business Profile (GBP) primary and secondary categories, customer review velocity, 'near me' and city-modified on-page signals, Name-Address-Phone (NAP) citation consistency, and LocalBusiness JSON-LD structured data.",
  ],
  [
    "How do I rank for 'near me' keywords in SEO without keyword stuffing?",
    "Google resolves 'near me' searches using the searcher's GPS coordinates matched against your Google Business Profile proximity, LocalBusiness areaServed schema, neighborhood landmarks mentioned on your city page, and customer reviews citing your service and city.",
  ],
  [
    "What are the most important local SEO tools for SMBs and multi-location brands?",
    "Every SMB needs four core local workflows: a Local SEO Audit Tool for Map Pack diagnostics, a Google Business Profile Auditor, a Local SEO Service-Area & City Page Planner, and a Google Review Link & QR Poster Generator to drive steady customer reviews.",
  ],
  [
    "How can e-commerce stores use AI-powered local SEO geo-targeting?",
    "E-commerce brands with showrooms, regional warehouses, or local pickup can publish city-specific showroom pages containing LocalBusiness + Product schema, local inventory availability, and regional shipping turnaround times to capture high-intent local shoppers.",
  ],
  [
    "Why is NAP consistency critical for both Google Map Pack and AI voice search?",
    "Google, Apple Maps, Bing Places, ChatGPT Search, and Perplexity verify business legitimacy by cross-referencing your exact Name, Street Address, Suite number, and Phone number across your website footer and major citation directories.",
  ],
  [
    "How do I generate a direct Google review link after completing my local SEO audit?",
    "Open our Google Review Link & QR Poster Generator to create a 1-click review link and printable counter QR code so satisfied local customers can leave 5-star reviews in seconds.",
  ],
];

const LOCAL_AUDIT_PROMPTS = [
  {
    title: "1. SMB Google Map Pack & GBP Category Optimization Prompt",
    badge: "Map Pack & GBP",
    prompt: `Act as a Local SEO Specialist auditing [Business Name], a [Primary Service] serving [Target City & Neighborhoods]. Recommend the exact Primary and 4 Secondary Google Business Profile categories, 10 high-margin service items to add to the GBP Services tab, and 3 review-request follow-up templates that naturally encourage customers to mention the service and neighborhood.`,
  },
  {
    title: "2. 'Near Me' & Hyper-Local City Page Content Brief Prompt",
    badge: "'Near Me' SEO",
    prompt: `Create a high-converting local service page outline for "[Primary Service] in [Target City]" that wins both organic results and "near me" Map Pack clicks. Include an under-580px SEO Title, a single-sentence Meta Description, a 50-word local pricing & response-time Quick Answer, neighborhood landmark proof, and LocalBusiness JSON-LD.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function LocalSeoAuditToolPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free Local SEO Audit Tool: Map Pack & Near Me Optimizer",
        alternateName: [
          "Free Local SEO Audit",
          "Local SEO Tools for SMBs",
          "Near Me Keywords SEO Optimizer",
          "AI-Powered Local SEO Geo-Targeting Tool",
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
        name: "How to Run a Free Local SEO Audit for Map Pack and Near Me Rankings",
        description:
          "Audit your Google Business Profile, near me keyword placement, NAP citations, and LocalBusiness schema in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your business name, primary service, and target city areas",
            text: "Provide your SMB name, core service category, and the cities or neighborhoods you serve.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Add your NAP string, GBP review metrics, and current page signals",
            text: "Paste your phone, address, URL, review count, and current title/H1 tags.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Inspect your 'Near Me' Keyword Matrix and 3-Pack Readiness scores",
            text: "Review where to place implicit 'near me', explicit city+service, and emergency queries across your page and GBP.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your LocalBusiness JSON-LD and export the audit",
            text: "Embed the generated LocalBusiness schema with areaServed and export your checklist to Markdown or CSV.",
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
            name: "Free Local SEO Audit Tool",
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
            <span aria-current="page">Free Local SEO Audit Tool</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                LOCAL SEO SUITE · MAP PACK, NEAR ME KEYWORDS &amp; SMB CITATIONS
              </p>
              <h1 className={toolHeroHeading}>
                Free Local SEO Audit Tool: Map Pack &amp; &ldquo;Near Me&rdquo;
                Optimizer
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Run an instant <strong>free local SEO audit</strong> for your
                SMB or multi-location brand—checking{" "}
                <strong>Google Business Profile 3-Pack readiness</strong>,{" "}
                <strong>&ldquo;near me&rdquo; keyword placement</strong>,{" "}
                <strong>NAP citation consistency</strong>, and{" "}
                <strong>LocalBusiness JSON-LD schema</strong>.
              </p>
              <div className="mt-5">
                <PortableToolHeroBar slug="local-seo-audit-tool" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                4-Pillar SMB Local SEO Engine
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>Google Map Pack Diagnostics</strong>: Primary &amp;
                  secondary GBP categories, review velocity &amp; photos.
                </li>
                <li>
                  • <strong>&ldquo;Near Me&rdquo; Keyword Matrix</strong>: Maps
                  implicit, city-explicit, emergency &amp; voice queries.
                </li>
                <li>
                  • <strong>NAP &amp; LocalBusiness Schema</strong>: Outputs
                  ready-to-paste JSON-LD with <code>areaServed</code>.
                </li>
              </ul>
            </div>
          </div>

          <LocalSeoAuditClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Free Local SEO Audit &amp; Near Me Rankings
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Audit Your Local SEO and Rank in Google&apos;s 3-Pack
          </h2>
          <p className={prose}>
            To rank in Google&apos;s Local Map Pack and win{" "}
            <strong>&ldquo;near me&rdquo; searches</strong>, align your{" "}
            <strong>Primary Google Business Profile category</strong> with your
            core service, place your exact{" "}
            <strong>Service + City in your H1 and Title tag</strong>, maintain
            100% <strong>NAP consistency</strong> across directories, and embed{" "}
            <code>LocalBusiness</code> JSON-LD with verified{" "}
            <code>areaServed</code> cities.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Local Map Pack vs. Organic City Pages vs. AI Local Search
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Local Channel</th>
                  <th className="px-4 py-3.5">Primary Ranking Factors</th>
                  <th className="px-4 py-3.5">Key Optimization Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Google Map Pack (3-Pack)
                  </td>
                  <td className="px-4 py-3.5">
                    Proximity, Primary GBP Category, Review Count &amp; Velocity
                  </td>
                  <td className="px-4 py-3.5">
                    Set exact GBP categories + reply to reviews with city names
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Organic City &amp; Service Pages
                  </td>
                  <td className="px-4 py-3.5">
                    Title/H1 City Match, Neighborhood Proof, Local Backlinks
                  </td>
                  <td className="px-4 py-3.5">
                    Add 50-word local cost answer + ZIP &amp; landmark sections
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    &ldquo;Near Me&rdquo; Mobile Searches
                  </td>
                  <td className="px-4 py-3.5">
                    GPS Distance, Open-Now Hours, Click-to-Call UX, NAP Trust
                  </td>
                  <td className="px-4 py-3.5">
                    Embed <code>LocalBusiness</code> JSON-LD + verified hours
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    AI Local Overviews &amp; Voice
                  </td>
                  <td className="px-4 py-3.5">
                    Cross-Directory NAP Consensus (Yelp, BBB, Apple, GBP)
                  </td>
                  <td className="px-4 py-3.5">
                    Standardize NAP string + publish on-page <code>FAQPage</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Ready to expand across multiple suburbs or service areas? Build your
            non-duplicate location architecture in our{" "}
            <Link
              href="/tools/local-seo-service-page-planner"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Local SEO Service-Area &amp; City Page Planner
            </Link>{" "}
            and generate a printable customer review QR poster in the{" "}
            <Link
              href="/tools/google-review-link-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Google Review Link &amp; QR Poster Generator
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for Local SEO Audits &amp; &ldquo;Near Me&rdquo; Pages
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {LOCAL_AUDIT_PROMPTS.map((item) => (
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
            Frequently Asked Questions: Free Local SEO Audit &amp; Near Me SEO
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

        <ToolResources slug="local-seo-audit-tool" />
      </div>
    </>
  );
}
