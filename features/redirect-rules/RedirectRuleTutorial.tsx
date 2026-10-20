import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "List every old URL and where it should go",
    body: "Write one rule per line: old URL, new URL, and an optional status code. Paths like /old-page are enough, and full URLs work too. Moving a whole section? End both sides with /*, as in /old-blog/*, /blog/*.",
  },
  {
    icon: Search,
    title: "Pick the closest matching destination for each page",
    body: "Send each old URL to the page that best answers the same need, not just to the home page. Redirecting many unrelated pages to one generic destination can look like a soft 404 to search engines.",
  },
  {
    icon: ShieldCheck,
    title: "Read the safety checks",
    body: "The tool flags redirect loops, redirects to the same URL, conflicting duplicates, query-string sources, and characters that could break a server config. It also flattens chains so visitors make one hop, not several.",
  },
  {
    icon: Download,
    title: "Choose your platform and copy the rules",
    body: "Pick Next.js, Vercel, Netlify or Cloudflare Pages, Apache, or Nginx. Copy the output or download it as a file, and add it to your site's configuration using the note shown under the code.",
  },
  {
    icon: Terminal,
    title: "Deploy and test with curl",
    body: "Run curl -I against a handful of old URLs. You should see the status code you chose and a location header pointing at the new URL. Test a pattern redirect and a URL that should not redirect too.",
  },
  {
    icon: RefreshCw,
    title: "Update links, your sitemap, and monitor Search Console",
    body: "Change internal links to point straight at the new URLs, replace old URLs in your sitemap, and watch Search Console for crawl errors over the following weeks.",
  },
];

const PRACTICES = [
  {
    title: "Use 301 or 308 for permanent moves",
    body: "They tell search engines the move is permanent. Use 302 or 307 only when the old URL will return.",
  },
  {
    title: "Redirect one-to-one wherever you can",
    body: "A relevant destination keeps visitors and search engines on-topic. Reserve broad redirects for sections that genuinely moved together.",
  },
  {
    title: "Avoid chains",
    body: "Point every old URL directly at the final destination. Each extra hop slows the page and adds a chance of error.",
  },
  {
    title: "Keep redirects in place",
    body: "Leave them live for at least a year, or for as long as the old URLs still receive links or traffic.",
  },
  {
    title: "Keep a record of the map",
    body: "Export the cleaned CSV so you can audit, hand over, or re-create the rules on another platform later.",
  },
];

const MISTAKES = [
  "Redirecting everything to the home page, which usually gives visitors an irrelevant landing page.",
  "Creating loops, such as A → B and B → A, which make the page unreachable.",
  "Putting a ?query string in a source rule and expecting the server to match it. Most servers match the path only.",
];

export default function RedirectRuleTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to create 301 redirect rules with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a list of old URLs to tested redirect rules for your hosting setup.
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
              Redirect best practices
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
