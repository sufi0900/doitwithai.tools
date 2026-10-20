import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  ListOrdered,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: ListOrdered,
    title: "Collect the URLs you want indexed",
    body: "Paste one URL per line. Include only canonical, indexable pages that return a 200 status ; not redirects, error pages, or noindex pages. If you know a page's last real update date, add it after a comma in YYYY-MM-DD format.",
  },
  {
    icon: FileCode2,
    title: "Review the checks the tool runs for you",
    body: "The tool normalizes each URL, removes duplicates and #fragments, and warns about invalid lines, mixed hosts, and mixed http/https. Fix anything flagged before you publish.",
  },
  {
    icon: ShieldCheck,
    title: "Choose optional fields carefully",
    body: "<lastmod> is worth including only when it reflects genuine content changes. <changefreq> and <priority> are off by default because Google says it ignores them.",
  },
  {
    icon: Download,
    title: "Download sitemap.xml and upload it to your site root",
    body: "Your sitemap should open at https://your-domain/sitemap.xml. Over 50,000 URLs? The tool automatically splits the list into several sitemaps and creates a sitemap index that points to them.",
  },
  {
    icon: Send,
    title: "Reference and submit the sitemap",
    body: "Copy the generated Sitemap: line into your robots.txt, then submit the sitemap URL in Google Search Console and Bing Webmaster Tools so you can see how it is processed.",
  },
  {
    icon: RefreshCw,
    title: "Validate again after every change",
    body: "Switch to the Validate tab and paste your live sitemap's contents whenever you update it. It checks structure, namespace, URL formats, dates, duplicates, and size limits.",
  },
];

const PRACTICES = [
  {
    title: "List only URLs you want in search results",
    body: "Every URL should be canonical, return 200, and be allowed in robots.txt and meta tags.",
  },
  {
    title: "Keep it in sync with your site",
    body: "Generate the sitemap automatically from your CMS or build step, so new pages appear and deleted pages disappear without manual edits.",
  },
  {
    title: "Use one canonical version of each URL",
    body: "Pick https and either www or non-www and list only that form, matching your canonical tags.",
  },
  {
    title: "Be honest with lastmod",
    body: "Update it only when the page content meaningfully changes. Setting every page to today's date teaches search engines to ignore the field.",
  },
  {
    title: "Split large sites logically",
    body: "Separate sitemaps for blog posts, tools, and categories make the Search Console report easier to read.",
  },
];

const MISTAKES = [
  "Including redirected, 404, noindex, or non-canonical URLs, which sends search engines conflicting signals.",
  "Forgetting to escape special characters. An unescaped & breaks the XML ; this tool escapes it as &amp; for you.",
  "Treating the sitemap as a ranking factor. It helps search engines discover URLs; it doesn't guarantee indexing or boost rankings.",
];

export default function SitemapXmlTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to create and validate a sitemap.xml with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a list of URLs to a clean sitemap that search engines can read.
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
              Sitemap best practices
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
