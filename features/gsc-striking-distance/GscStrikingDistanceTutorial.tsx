import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  ListOrdered,
  Pencil,
  RefreshCw,
  Search,
  Target,
  Upload,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Export your queries from Google Search Console",
    body: "Open Search Console, go to Performance → Search results, pick a date range (3 months is a good start), and use Export → Download CSV. Unzip the download and keep Queries.csv ; that's the file this tool reads.",
  },
  {
    icon: Upload,
    title: "Load the CSV into the tool",
    body: "Drop the file onto the upload box or paste the CSV text. The file is parsed inside your browser, so your search data isn't uploaded anywhere. Want to look around first? Use \"Try sample data\".",
  },
  {
    icon: Filter,
    title: "Set your position range and minimum impressions",
    body: "The defaults ; positions 8 to 20 and at least 100 impressions ; surface queries sitting at the bottom of page one and on page two. Raise the impression floor on a large site so low-volume noise doesn't bury the real opportunities.",
  },
  {
    icon: Target,
    title: "Exclude branded queries and adjust the target CTR",
    body: "Add your brand name to the exclude box so navigational searches don't distort the list. Then edit the target CTR to a number you consider realistic for your niche ; the extra-click estimate is a scenario you control, not a forecast.",
  },
  {
    icon: ListOrdered,
    title: "Sort the list and pick three to five queries",
    body: "Sort by estimated extra clicks first, then by lowest CTR to spot snippet problems. Choosing a handful of queries to work on this month beats trying to fix fifty at once.",
  },
  {
    icon: Pencil,
    title: "Update the page, then re-check in a few weeks",
    body: "Follow the suggested next step for each query ; a snippet rewrite, a clearer heading, a direct answer, or internal links. Give search engines a few weeks to recrawl, then export again and compare positions and CTR for the same queries.",
  },
];

const PRACTICES = [
  {
    title: "Work from the page, not just the query",
    body: "Several queries often point at one URL. Improving that page once can lift a whole group of related searches together.",
  },
  {
    title: "Match the wording searchers actually use",
    body: "If a query appears in your data but not on the page, add it where a reader would naturally look: a heading, the opening answer, or a short FAQ.",
  },
  {
    title: "Fix the snippet before rewriting the article",
    body: "A query at position 8 with a very low CTR often needs a clearer title and description, not a new draft.",
  },
  {
    title: "Strengthen internal links to the page",
    body: "Link from related, already-trusted pages using descriptive anchor text that reflects the topic.",
  },
  {
    title: "Compare like with like over time",
    body: "Re-export the same date range length and the same filters so the before-and-after comparison is fair.",
  },
];

const MISTAKES = [
  "Treating average position as a fixed rank ; it blends every position a query appeared in, so a 9.4 can hide results that vary a lot by device or location.",
  "Stuffing the exact query into a page repeatedly instead of answering it clearly once, in a place a reader would expect.",
  "Counting the estimated extra clicks as a promise. They show how much a CTR improvement could be worth, not what will happen.",
];

export default function GscStrikingDistanceTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to find striking distance keywords with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a Search Console export to a short, prioritized list of pages worth improving.
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

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <RefreshCw className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              Striking distance keyword best practices
            </h3>
            <ul className="mt-4 space-y-3">
              {PRACTICES.map((practice) => (
                <li key={practice.title} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-slate-900 dark:text-white">{practice.title}.</span> {practice.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Common mistakes to avoid
            </h3>
            <ul className="mt-4 space-y-3">
              {MISTAKES.map((mistake) => (
                <li key={mistake} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
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
