import type { Metadata } from "next";
import Link from "next/link";
import { Award, CheckCheck, FileCheck2, ShieldCheck } from "lucide-react";
import EeatContentAuditorClient from "@/features/eeat-content-auditor/EeatContentAuditorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/eeat-content-auditor";
const title =
  "Free E-E-A-T & Helpful Content Auditor | 20-Signal On-Page SEO Checker";
const description =
  "Audit any webpage across 20 observable Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) signals. Check author schema, citations, and trust policies.";

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
    question: "Is E-E-A-T a single numeric ranking factor in Google's algorithm?",
    answer:
      "No. Google's Search Quality Rater Guidelines use E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) as a framework to evaluate helpful content. Rather than inventing a fictional ranking metric, this auditor inspects 20 concrete, verifiable HTML, schema, authorship, citation, and policy signals on your page.",
  },
  {
    question: "What are the 20 on-page signals checked by this E-E-A-T auditor?",
    answer:
      "It checks 5 signals per pillar: Experience (first-hand testing phrasing, tables/code exhibits, alt-tagged visuals, quantitative figures, methodology block), Expertise (named human author, author profile/LinkedIn link, peer/technical reviewer, content depth, practitioner Q&A), Authoritativeness (Article JSON-LD, sameAs Knowledge Graph links, outbound citations, .gov/.edu/.org documentation links, BreadcrumbList), and Trustworthiness (HTTPS, published/modified dates, About/Contact links, Editorial/Privacy policy links, and scope disclosures).",
  },
  {
    question: "How does YMYL Strict mode differ from Standard Editorial mode?",
    answer:
      "In YMYL (Your Money or Your Life) mode—designed for finance, medical, legal, and safety pages—signals like secondary expert review ('Reviewed by...'), primary institutional citations, and scope disclaimers carry significantly higher weight.",
  },
  {
    question: "How do I improve my page's Experience pillar score?",
    answer:
      "Include evidence that you actually tested or built what you are describing: add a 'Methodology / How We Tested' subheading, include comparison tables or original measurements, and use annotated screenshots with descriptive alt attributes.",
  },
  {
    question: "Why does JSON-LD sameAs markup matter for Authoritativeness?",
    answer:
      "Adding sameAs arrays inside your Person and Organization JSON-LD connects your author byline directly to verifiable external profiles (LinkedIn, Wikidata, GitHub, or official directories), helping search and AI engines disambiguate your identity.",
  },
  {
    question: "Can I audit unpublished drafts or staging HTML?",
    answer:
      "Yes. Switch to the 'Audit Pasted Webpage HTML' tab to inspect raw HTML before publishing.",
  },
  {
    question: "What reports can I export for clients or content writers?",
    answer:
      "You can download a 20-signal CSV checklist or an editable Microsoft Word (.docx) remediation brief listing exact observed evidence and fix instructions.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function EeatContentAuditorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "E-E-A-T & Helpful Content Trust Auditor",
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
          { name: "E-E-A-T Content Auditor", item: pageUrl },
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
            <span aria-current="page">E-E-A-T content auditor</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Helpful Content & Trust Signals
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                E-E-A-T & Helpful Content{" "}
                <span className={toolHeroHeading}>
                  20-Signal On-Page Auditor
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect any live URL or HTML draft across 20 verifiable
                Experience, Expertise, Authoritativeness, and Trustworthiness
                signals—from author schema and <code>sameAs</code> entity links
                to methodology disclosures and primary citations.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  20 observable HTML & schema checks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Standard & YMYL modes
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV & DOCX remediation briefs
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Pillars Inspected (5 Signals Each)
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Experience:</strong>{" "}
                  First-hand testing, tables/code exhibits, methodology block.
                </li>
                <li>
                  <strong className="text-indigo-300">Expertise:</strong> Named
                  author bio, credential links, reviewer sign-off, depth.
                </li>
                <li>
                  <strong className="text-sky-300">Authoritativeness:</strong>{" "}
                  Article JSON-LD, <code>sameAs</code> links, primary citations.
                </li>
                <li>
                  <strong className="text-amber-300">Trustworthiness:</strong>{" "}
                  Timestamps, About/Contact/Editorial policy links, disclosures.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <EeatContentAuditorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Verifiable on-page evidence
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Turn abstract E-E-A-T guidelines into concrete editorial & schema tasks
        </h2>
        <p className={prose}>
          Search engines and AI answer engines look for corroborating proof that
          a page was created by an accountable human expert backed by verifiable
          sources. Auditing your page template ensures you never publish
          articles with missing author attribution, unlinked entities, or absent
          update timestamps.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Award,
              "Prove First-Hand Experience",
              "Detect whether your draft includes practitioner testing language, quantitative measurements, and structured tables or exhibits.",
            ],
            [
              CheckCheck,
              "Connect Author & Entity Schema",
              "Verify that Article JSON-LD, Person credentials, Reviewer attribution, and sameAs Knowledge Graph links are present in your markup.",
            ],
            [
              FileCheck2,
              "Export Writer & Dev Fix Lists",
              "Download a prioritized DOCX brief or CSV checklist separating content editorial additions from developer schema fixes.",
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
          Related On-Page & Entity SEO Tools
        </h2>
        <p className={prose}>
          Pair your E-E-A-T audit with our{" "}
          <Link
            href="/tools/entity-sameas-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Entity & sameAs Finder
          </Link>{" "}
          to build verified JSON-LD profile arrays, review specific claim
          citations in{" "}
          <Link
            href="/tools/content-evidence-review"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Content Evidence Review
          </Link>
          , or optimize your answer blocks in the{" "}
          <Link
            href="/tools/featured-snippet-optimizer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Featured Snippet & AI Overview Passage Optimizer
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="eeat-content-auditor" />
      <ToolFaq title="E-E-A-T & Helpful Content audit questions" faqs={faqs} />
    </div>
  );
}
