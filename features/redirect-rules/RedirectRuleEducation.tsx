import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const STATUS_TABLE = [
  ["301", "Moved permanently", "A permanent move. Search engines treat the new URL as the replacement.", "Changed URLs, merged pages, site restructures"],
  ["308", "Permanent redirect", "Permanent like 301, but the request method (such as POST) is preserved.", "Permanent moves of endpoints that receive form or API requests"],
  ["302", "Found (temporary)", "A temporary move. The old URL is expected to come back.", "Short-term campaigns, A/B tests, maintenance pages"],
  ["307", "Temporary redirect", "Temporary like 302, but the request method is preserved.", "Temporary moves of endpoints that receive form or API requests"],
];

const PLATFORMS = [
  ["Next.js", "next.config.js → redirects()", "Uses :path* for sections. Set statusCode to control the exact status."],
  ["Vercel", "vercel.json → redirects", "Same path syntax as Next.js."],
  ["Netlify / Cloudflare Pages", "_redirects file", "One rule per line, with /* and :splat for sections."],
  ["Apache", ".htaccess or virtual host", "RedirectMatch rules from mod_alias."],
  ["Nginx", "server { } block", "rewrite rules, which run in order."],
];

const WHEN = [
  "A page's URL changes, for example after renaming a slug or restructuring folders.",
  "Two pages are merged into one stronger page.",
  "You move a section, such as /old-blog/ to /blog/.",
  "You retire a page that has a close replacement.",
];

export default function RedirectRuleEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is a 301 redirect and when should you use one?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            A redirect automatically sends visitors and search engine crawlers from one URL to another.
            A 301 redirect signals that the move is permanent, so the old URL&apos;s links and history
            can carry over to the new one. Redirects protect your traffic whenever a URL changes, but
            they only help when they&apos;re accurate, direct, and free of loops.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            301, 302, 307, and 308: which status code to use
          </h3>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">What it means</th>
                  <th className="px-4 py-3">Typical use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {STATUS_TABLE.map(([code, name, meaning, use]) => (
                  <tr key={code} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">{code}</td>
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3 leading-7">{meaning}</td>
                    <td className="px-4 py-3 leading-7">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            For most SEO work on ordinary pages, 301 is the standard choice. Next.js uses 308 when you
            set <code className="font-mono text-xs">permanent: true</code>, so this tool writes the exact
            status code you pick instead.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">When to set up a redirect</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {WHEN.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              If a removed page has no relevant replacement, a 404 or 410 response is usually more honest
              than redirecting it to an unrelated page.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Redirect chains and loops</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A chain happens when A redirects to B, and B redirects to C. Visitors and crawlers must
              follow every hop, which slows loading and wastes crawl effort. A loop happens when pages
              redirect back to each other, so the page never loads. This tool detects both: it
              flattens chains to the final destination and leaves loops out of the output.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Where each platform expects the rules</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Where it goes</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {PLATFORMS.map(([name, where, notes]) => (
                  <tr key={name} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">{name}</td>
                    <td className="px-4 py-3 font-mono text-xs leading-7">{where}</td>
                    <td className="px-4 py-3 leading-7">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            How each platform treats query strings, trailing slashes, and upper-case URLs differs, so
            always test a few real URLs with <code className="font-mono text-xs">curl -I</code> after deploying.
          </p>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Finish the migration</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Redirects are one part of a clean move. Decide which pages to merge with the{" "}
            <Link href="/tools/keyword-cannibalization-finder" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Keyword Cannibalization Finder
            </Link>
            , list only the new URLs in a fresh{" "}
            <Link href="/tools/sitemap-xml-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              sitemap.xml
            </Link>
            , and tell search engines about the changes with the{" "}
            <Link href="/tools/indexnow-key-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              IndexNow URL Submitter
            </Link>
            . Then update your own links with the{" "}
            <Link href="/tools/internal-link-opportunity-finder" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Internal Link Opportunity Finder
            </Link>
            .
          </p>
          <Link
            href="/tools"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4662df] transition hover:underline dark:text-blue-300"
          >
            Browse all tools <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
