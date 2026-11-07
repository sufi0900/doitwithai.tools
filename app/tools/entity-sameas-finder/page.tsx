import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import EntitySameAsClient from "@/features/entity-sameas/EntitySameAsClient";
import EntitySameAsTutorial from "@/features/entity-sameas/EntitySameAsTutorial";
import EntitySameAsEducation from "@/features/entity-sameas/EntitySameAsEducation";

const pageUrl = "https://doitwithai.tools/tools/entity-sameas-finder";

export const metadata: Metadata = {
  title: "Free Entity & sameAs Finder: Wikidata Links to JSON-LD",
  description:
    "Look up your brand, person, product, or place on Wikidata, review the Wikipedia and social profile links it knows, and generate sameAs JSON-LD you can review and publish. No login required.",
  keywords: [
    "sameas schema generator",
    "wikidata entity finder",
    "entity seo tool",
    "organization schema sameas",
    "knowledge graph entity",
    "json-ld sameas",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Entity & sameAs Finder: Wikidata Links to JSON-LD",
    description: "Find your entity on Wikidata and turn verified profile links into sameAs schema markup.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Entity and sameAs Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Entity & sameAs Finder: Wikidata Links to JSON-LD",
    description: "Build sameAs schema from Wikidata in minutes.",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: { "ai-content-declaration": "human-created, ai-assisted" },
};

const faqs = [
  {
    question: "What does sameAs do in schema markup?",
    answer:
      "It lists URLs of other pages that identify the same real-world entity, such as a Wikidata entry or an official social profile. It helps search engines and AI systems connect your page to the right entity.",
  },
  {
    question: "Will adding sameAs improve my rankings?",
    answer:
      "Not directly. It supports disambiguation and entity recognition, but it is not a ranking shortcut and it does not guarantee a Knowledge Panel or any other search feature.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "From Wikidata, a public knowledge base. Wikidata is maintained by volunteers, so the information can be incomplete or out of date. Always open and verify each link before using it.",
  },
  {
    question: "Is my search sent to your servers?",
    answer:
      "No. Your search text goes from your browser straight to Wikidata. The JSON-LD is built in your browser, and nothing you enter is stored by this tool.",
  },
  {
    question: "What if my brand isn't on Wikidata?",
    answer:
      "That is common for newer or smaller brands. Don't create an entry just for SEO, since Wikidata has notability rules. Instead, paste your own official profile URLs into the tool and generate sameAs markup from those.",
  },
  {
    question: "Where should I put the generated JSON-LD?",
    answer:
      "On the page that describes the entity — usually the homepage or About page for an Organization, or an author or About page for a Person. After publishing, test it with the Schema Markup Validator or Google's Rich Results Test.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Entity & sameAs Finder",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Search Wikidata for a brand, person, product, or place",
        "Review official website, Wikipedia, and profile links",
        "Add your own profile URLs",
        "Generate Organization, Person, Brand, Product, or Place JSON-LD",
        "Safe script-tag output and one-click copy",
      ],
      creator: {
        "@type": "Person",
        name: "Sufian Mustafa",
        url: "https://doitwithai.tools/author/sufian-mustafa",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        { "@type": "ListItem", position: 3, name: "Entity & sameAs Finder", item: pageUrl },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "HowTo",
      name: "How to build sameAs schema markup for your brand",
      step: [
        { "@type": "HowToStep", name: "Search for your entity", text: "Search Wikidata for your brand, person, product, or place." },
        { "@type": "HowToStep", name: "Pick the correct entry", text: "Read the short descriptions and choose the entry that is really yours." },
        { "@type": "HowToStep", name: "Review the profile links", text: "Open each link to confirm it belongs to you and untick any that don't." },
        { "@type": "HowToStep", name: "Add your own profiles", text: "Paste official profile URLs that Wikidata doesn't list." },
        { "@type": "HowToStep", name: "Copy the JSON-LD", text: "Choose the schema type, check the name and website, and copy the markup." },
        { "@type": "HowToStep", name: "Publish and test", text: "Add it to the page it describes and test it with a schema validator." },
      ],
    },
  ],
};

export default function EntitySameAsFinderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
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
            <span aria-current="page">Entity & sameAs Finder</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Entity SEO · Knowledge Graph & JSON-LD Disambiguation
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Entity & sameAs Finder 
                <span className={toolHeroHeading}>
                  From Wikidata to Schema Markup
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Look up your brand, author, product, or organization on Wikidata, verify official Wikipedia and authority profile links, and compile clean sameAs JSON-LD.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live Wikidata entity search
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Official profile verification
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Ready-to-paste JSON-LD
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Steps to Disambiguated Schema
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Entity Lookup:</strong> Search Wikidata for your exact person, brand, or topic entity.
                </li>
                <li>
                  <strong className="text-indigo-300">ID Verification:</strong> Confirm the Q-ID description, aliases, and Wikipedia URL.
                </li>
                <li>
                  <strong className="text-sky-300">Profile Curation:</strong> Select verified social and authority URLs for your array.
                </li>
                <li>
                  <strong className="text-amber-300">JSON-LD Output:</strong> Copy Organization, Person, or Thing schema with sameAs links.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <EntitySameAsClient />
          </div>
        </div>
      </div>

      <EntitySameAsTutorial />
      <EntitySameAsEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Entity & sameAs finder FAQ
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {faq.question}
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5271ff]" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="entity-sameas-finder" />
    </>
  );
}
