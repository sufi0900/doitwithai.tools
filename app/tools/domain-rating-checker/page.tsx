import type { Metadata } from "next";
import Link from "next/link";
import RatingClient from "@/features/domain-rating/RatingClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/domain-rating-checker";
const title = "Domain Rating Checker | Check Website Backlink Strength";
const description =
  "Check a website’s Domain Rating using Ahrefs data. Understand backlink strength, logarithmic scores, and the difference between DR and Domain Authority.";
// Preview stays out of search until provider access and standalone-use licensing are verified.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: { card: "summary_large_image", title, description },
};
const faqs = [
  {
    question: "What is Domain Rating?",
    answer:
      "Domain Rating is Ahrefs’ relative measure of a website’s backlink-profile strength. It uses a logarithmic scale from zero to one hundred.",
  },
  {
    question: "Is Domain Rating the same as Domain Authority?",
    answer:
      "No. Ahrefs provides DR, Moz provides DA, and Semrush provides Authority Score. Their data and methods differ, so the numbers are not interchangeable.",
  },
  {
    question: "Does this checker show Moz DA or Semrush Authority Score?",
    answer:
      "This version retrieves Ahrefs Domain Rating only. It does not estimate or invent other providers’ scores.",
  },
  {
    question: "Can I check an article URL?",
    answer:
      "Yes. The checker extracts its registered domain and reports domain-level DR. It does not return page-level URL Rating.",
  },
  {
    question: "What is a good Domain Rating?",
    answer:
      "There is no universal target. Compare relevant websites in your niche, then examine their content, audience, and actual links.",
  },
  {
    question: "Why is my score zero or unavailable?",
    answer:
      "Zero is a valid returned score. Missing data, connection problems, and access limits receive separate messages rather than a fabricated zero.",
  },
  {
    question: "Does a higher DR guarantee higher rankings?",
    answer:
      "No. Domain Rating measures backlink-profile strength within Ahrefs’ database. It does not guarantee traffic, indexing, conversions, or search rankings.",
  },
  {
    question: "Does this tool list all my backlinks?",
    answer:
      "No. It requests a single domain score. Use a backlink research service to discover links, then inspect individual placements separately.",
  },
  {
    question: "How fresh is the result?",
    answer:
      "Each completed check requests a score from Ahrefs. The displayed retrieval time describes our request, rather than the last crawl of every backlink.",
  },
  {
    question: "Why might a check fail?",
    answer:
      "Invalid input, provider limits, connection failures, or unavailable service configuration can prevent a result. Wait and retry when the message suggests it.",
  },
];
const section = "mx-auto max-w-5xl px-4 py-12 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: "https://doitwithai.tools" },
      { name: "Tools", item: "https://doitwithai.tools/tools" },
      { name: "Domain Rating checker", item: pageUrl },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    })),
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
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Domain Rating checker</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
            Off-page SEO · Preview
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            Domain Rating Checker{" "}
            <span className={toolHeroHeading}>
              with context behind the number
            </span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Check your website’s backlink-profile strength using Ahrefs data.
            Understand what the score tells you before planning your next SEO
            action.
          </p>
          <p className="mt-6 text-sm text-slate-300">
            One domain per check · No website login required · Clear results and
            limitations
          </p>
        </div>
      </header>
      <RatingClient />
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          How to check your Domain Rating
        </h2>
        <ol className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            [
              "Enter your website",
              "Paste a domain or full website URL. Article paths are removed so the check uses the registered domain.",
            ],
            [
              "Run the check",
              "Select Check Domain Rating. A loading dialog appears while the tool requests the score from Ahrefs.",
            ],
            [
              "Review the context",
              "Read the score, checked domain, and retrieval time. Compare similar websites before deciding what to investigate next.",
            ],
          ].map(([heading, body], i) => (
            <li
              key={heading}
              className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
            >
              <span className="font-black text-[#3452d1] dark:text-blue-200">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Understand the score before using it
        </h2>
        <p className={text}>
          DR compares backlink-profile strength against other websites in
          Ahrefs’ database. Its logarithmic scale means equal point increases do
          not represent equal improvements.
        </p>
        <p className={text}>
          A useful comparison involves websites serving a similar audience and
          purpose. A small specialist publication and a global news website face
          different conditions.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold">Use it as one signal</h3>
            <p className={text}>
              Review relevant referring websites, editorial context, and links
              that help readers. Consider the score alongside actual visibility
              and business outcomes.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold">Keep the limits visible</h3>
            <p className={text}>
              This result does not assess content accuracy, identify every
              backlink, or certify a website as trustworthy. It does not predict
              ranking changes.
            </p>
          </div>
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">DR, DA, and Authority Score</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm leading-7">
            <caption className="sr-only">
              Different providers use different authority metrics
            </caption>
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr>
                {["Metric", "Provider", "Available here"].map((x) => (
                  <th key={x} scope="col" className="p-4">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Domain Rating (DR)", "Ahrefs", "Yes, through its public API"],
                ["Domain Authority (DA)", "Moz", "No"],
                ["Authority Score", "Semrush", "No"],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th scope="row" key={cell} className="p-4 font-semibold">
                        {cell}
                      </th>
                    ) : (
                      <td key={cell} className="p-4">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={text}>
          Each provider uses its own data and methods. A difference between
          their numbers does not mean one checker is broken.
        </p>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7">
          <h2 className="text-2xl font-bold">
            Review the links behind your next decision
          </h2>
          <p className={text}>
            When you know a page should link to your website, inspect that
            placement separately. Our verifier checks supplied source pages and
            records link evidence.
          </p>
          <Link
            href="/tools/backlink-verification-tool"
            className="mt-5 inline-block rounded-xl bg-[#3452d1] px-5 py-3 font-bold text-white hover:bg-[#2943b5]"
          >
            Open Backlink Verification Tool
          </Link>
        </div>
      </section>
      <ToolFaq title="Domain Rating questions" faqs={faqs} />
    </div>
  );
}
