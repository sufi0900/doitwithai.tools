import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  ListOrdered,
  Pencil,
  RefreshCw,
  Upload,
} from "lucide-react";

const STEPS = [
  {
    icon: FileSpreadsheet,
    title: "Get a combined Query + Page export",
    body: "The search-results tabs in Search Console export Queries and Pages separately, so you need a source that lists both together. A Search Console connector such as Looker Studio, a Google Sheets add-on, or the Search Analytics API can pull Query and Page in one table. Save it as a CSV with Query, Page, Clicks, Impressions, and Position columns.",
  },
  {
    icon: Upload,
    title: "Load the CSV into the tool",
    body: "Drop the file onto the upload box or paste the text. It is analyzed inside your browser, so your search data isn't uploaded anywhere. Want to see how it works first? Use \"Try sample data\".",
  },
  {
    icon: Filter,
    title: "Set what counts as a competing page",
    body: "A page only counts if it passes your minimum impressions and minimum share. The defaults ignore pages that barely show up for a query, which keeps the list focused. Exclude your brand name so navigational searches don't clutter the results.",
  },
  {
    icon: ListOrdered,
    title: "Review the queries with the most split impressions",
    body: "Open each query to see its leading page and the pages competing with it, with position, impressions, clicks, and share side by side. Start with queries that have high impressions and an even split ; those are where one clear owner would help most.",
  },
  {
    icon: Pencil,
    title: "Choose one action per query",
    body: "Follow the suggested next step as a starting point: merge and redirect near-duplicates, re-target the weaker page, or fix internal links. Check the actual pages and their search intent before changing anything.",
  },
  {
    icon: RefreshCw,
    title: "Re-export and compare after a few weeks",
    body: "Give search engines time to recrawl, then load a fresh export using the same date range length. Look for a single page taking a larger share of impressions and positions becoming steadier.",
  },
];

const PRACTICES = [
  {
    title: "Give every page one primary topic",
    body: "Keep a simple keyword map: one main query per page, with related queries as supporting topics on that same page.",
  },
  {
    title: "Judge by search intent, not just the words",
    body: "Two pages can share a keyword and still serve different needs, such as a guide and a tool. Those often belong together, not merged.",
  },
  {
    title: "Pick the leader on evidence",
    body: "Favor the page with more clicks, better engagement, and more internal and external links, not simply the newest one.",
  },
  {
    title: "Update internal links after any change",
    body: "Point anchor text for the main topic to the leading page so your own site reinforces which page should rank.",
  },
  {
    title: "Redirect permanently when you merge",
    body: "Use a 301 redirect from the retired URL to the leading page, and carry over any useful content first.",
  },
];

const MISTAKES = [
  "Treating every query with two ranking pages as an error. Search engines sometimes show two results from one site on purpose.",
  "Deleting a page without a redirect, which throws away links and leaves visitors on a dead end.",
  "Judging from one short date range. Positions move, so check a longer period before making big changes.",
];

export default function KeywordCannibalizationTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to find keyword cannibalization with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a Search Console export to a clear plan for which page should own each query.
          </p>
        </div>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5271ff]/10 text-[#4662df] dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    <span className="mr-2 text-[#5271ff]">{index + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-blue-50/60 p-5 dark:bg-blue-950/20">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <RefreshCw className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              Keyword cannibalization best practices
            </h3>
            <ul className="mt-4 space-y-3">
              {PRACTICES.map((practice) => (
                <li key={practice.title} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-slate-900 dark:text-white">{practice.title}.</span> {practice.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-amber-50/60 p-5 dark:bg-amber-950/10">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Common mistakes to avoid
            </h3>
            <ul className="mt-4 space-y-3">
              {MISTAKES.map((mistake) => (
                <li key={mistake} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
