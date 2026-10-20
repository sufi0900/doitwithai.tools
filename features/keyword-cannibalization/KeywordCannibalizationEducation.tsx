import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const FIXES = [
  {
    title: "Merge and redirect",
    when: "Two pages answer the same question and neither has a strong reason to exist separately.",
    how: "Move the best content into the stronger page, 301-redirect the other URL to it, and update internal links.",
  },
  {
    title: "Differentiate",
    when: "The pages are related but could serve different searches or stages of the journey.",
    how: "Re-target the weaker page's title, headings, and examples toward a distinct query, and link to the leader for the main topic.",
  },
  {
    title: "Fix internal linking",
    when: "A weaker page is getting more internal links or better anchor text than the page you want to rank.",
    how: "Point topic-specific anchors at the preferred page and reduce competing links from unrelated pages.",
  },
  {
    title: "Handle archive pages",
    when: "A tag, category, or paginated URL is competing with a real article.",
    how: "Review noindex or canonical settings and keep archives from outranking the content they list.",
  },
  {
    title: "Leave it alone",
    when: "The pages serve different intents, or one barely appears for the query.",
    how: "Monitor over time. Two results from one site can be perfectly healthy.",
  },
];

const TERMS = [
  ["Leading page", "The competing page with the most clicks for that query (impressions break ties)."],
  ["Split impressions", "Impressions going to the competing pages other than the leader."],
  ["Impression share", "A page's share of the impressions among the pages that compete for that query."],
  ["Overlap level", "Strong, moderate, or light, based on how evenly the leading page and its rivals share impressions."],
];

export default function KeywordCannibalizationEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is keyword cannibalization?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Keyword cannibalization happens when several pages on the same site target or rank for the
            same search query. Instead of one strong page, your visibility is split, search engines may
            switch between URLs, and your own pages compete for the same clicks and links. It is not
            automatically harmful, but when two similar pages share a valuable query it is worth
            deciding which page should be the clear answer.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            How to fix keyword cannibalization
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            There isn&apos;t one fix. Match the action to what the pages are for.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {FIXES.map((fix) => (
              <div
                key={fix.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{fix.title}</h4>
                <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">When: </span>
                  {fix.when}
                </p>
                <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">How: </span>
                  {fix.how}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">How to prevent it from the start</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Plan topics before you write. Group related keywords with the{" "}
              <Link href="/tools/keyword-clustering-tool" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                Keyword Clustering Tool
              </Link>{" "}
              so each cluster maps to one page, and check what searchers expect with the{" "}
              <Link href="/tools/search-intent-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                Search Intent Checker
              </Link>
              . Then lay out your pillars and supporting pages in the{" "}
              <Link href="/tools/topical-map-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                AI Topical Map Generator
              </Link>
              .
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              When you brief a writer, the{" "}
              <Link href="/tools/seo-content-brief-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                SEO Content Brief Generator
              </Link>{" "}
              helps you state the page&apos;s single main purpose up front.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Reading the results honestly</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Search Console reports average positions and combines many searches, devices, and
              locations, so a query can show two URLs even when each one mostly appears for different
              people. The overlap levels here come from simple impression-share rules, not from any
              search engine&apos;s own diagnosis. Treat the list as a place to look, then open the pages
              and decide.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Once a page clearly owns a query, strengthen its links with the{" "}
              <Link href="/tools/internal-link-opportunity-finder" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                Internal Link Opportunity Finder
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Terms used in this report</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {TERMS.map(([term, definition]) => (
              <div key={term} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <dt className="text-sm font-extrabold text-slate-950 dark:text-white">{term}</dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Want queries that are close to page one?</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Cannibalization is one reason a good page stalls at positions 8 to 20. Use the Striking
            Distance Keyword Finder to see which queries are worth improving first.
          </p>
          <Link
            href="/tools/gsc-striking-distance-finder"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4662df] transition hover:underline dark:text-blue-300"
          >
            Open the Striking Distance Keyword Finder <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
