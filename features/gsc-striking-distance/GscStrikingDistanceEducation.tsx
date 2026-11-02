import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, XCircle } from "lucide-react";

const PLAYBOOK = [
  {
    situation: "Position 8–10, low CTR",
    meaning: "You're on page one but few searchers choose your result.",
    action: "Rewrite the title and meta description to match the query and promise something specific.",
    tool: { href: "/tools/meta-title-generator", label: "Meta Title Generator" },
  },
  {
    situation: "Position 8–10, healthy CTR",
    meaning: "Searchers like the snippet; the page may not be strong enough to climb.",
    action: "Expand the section that answers the query, add evidence or examples, and link to it from related pages.",
    tool: { href: "/tools/internal-link-opportunity-finder", label: "Internal Link Opportunity Finder" },
  },
  {
    situation: "Position 11–15",
    meaning: "The page is relevant but not yet the best answer.",
    action: "Add or sharpen a heading that answers the query directly, and cover the follow-up questions readers have.",
    tool: { href: "/tools/article-outline-generator", label: "Article Outline Generator" },
  },
  {
    situation: "Position 16–20",
    meaning: "The page only partly matches what searchers want.",
    action: "Check the search intent first, then decide whether a new section or a dedicated page is warranted.",
    tool: { href: "/tools/search-intent-checker", label: "Search Intent Checker" },
  },
];

const DOS = [
  "Use the query's wording in a heading or the first answer paragraph, where a reader would expect it.",
  "Answer the question in one or two clear sentences before adding detail.",
  "Cover closely related questions in the same page so it feels complete.",
  "Describe images with plain alt text that fits the surrounding content.",
];

const DONTS = [
  "Repeat the exact keyword in every paragraph hoping to push the page up.",
  "Add a section that doesn't help the reader just to include a phrase.",
  "Change the title so far from the page's real content that it misleads searchers.",
];

const GLOSSARY = [
  ["Impressions", "How many times a result for your page appeared in search results."],
  ["Clicks", "How many times people clicked through to your site from those results."],
  ["CTR", "Click-through rate: clicks divided by impressions."],
  ["Average position", "The mean ranking of your result across all appearances for a query, so it can hide big swings."],
];

export default function GscStrikingDistanceEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What are striking distance keywords?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Striking distance keywords are search queries where your site already ranks close to the
            top ; usually around positions 8 to 20, at the bottom of page one or on page two ; and
            gets impressions but few clicks. Because Google already considers your page relevant,
            these queries are often a faster place to improve than starting a brand-new article.
            Your own Search Console data is the best source for finding them.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            What to do at each position
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The right fix depends on where the query sits and how it performs. Use this as a starting
            point, then confirm with the page itself.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PLAYBOOK.map((item) => (
              <div
                key={item.situation}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{item.situation}</h4>
                <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.meaning}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">Try: </span>
                  {item.action}
                </p>
                <Link
                  href={item.tool.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4662df] transition hover:underline dark:text-blue-300"
                >
                  {item.tool.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">
            How to work keywords into a page naturally
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The goal is a page that answers the query better, not a page that repeats it more. After
            editing, run your draft through the{" "}
            <Link href="/tools/keyword-density-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Keyword Density and Repetition Checker
            </Link>{" "}
            to make sure no phrase is overused.
          </p>
          <div className="mt-5 grid gap-8 md:grid-cols-2">
            <ul className="space-y-3">
              {DOS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {DONTS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <XCircle className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Reading the numbers honestly</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Search Console reports an <em>average</em> position, so a query listed at 9.4 may have
              ranked higher or lower depending on the searcher&apos;s device, location, and result layout.
              Treat position as a guide to where to look, not an exact rank. The estimated extra clicks
              in this tool are a what-if based on the target CTR you choose, and click-through rates vary
              by query type, SERP features, and niche.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Also keep in mind that the Search Console report export is limited to roughly 1,000 rows
              per table, and some queries are anonymized and left out. For larger sites, export by
              section or by page to see more of the picture.
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Search Console terms at a glance</h3>
            <dl className="mt-3 space-y-3">
              {GLOSSARY.map(([term, definition]) => (
                <div key={term} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <dt className="text-sm font-extrabold text-slate-950 dark:text-white">{term}</dt>
                  <dd className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Keep going after you find your queries</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Once you have a shortlist, group related queries with the{" "}
            <Link href="/tools/keyword-clustering-tool" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Keyword Clustering Tool
            </Link>
            , then turn each group into a writer-ready plan with the{" "}
            <Link href="/tools/seo-content-brief-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              SEO Content Brief Generator
            </Link>
            . For snippet fixes, the{" "}
            <Link href="/tools/meta-description-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Meta Description Generator
            </Link>{" "}
            helps you compare wording before you publish.
          </p>
        </div>
      </div>
    </section>
  );
}
