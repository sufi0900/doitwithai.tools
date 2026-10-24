import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const COMPARISON = [
  {
    method: "IndexNow",
    how: "You push a notification the moment pages change.",
    reach: "Participating search engines such as Bing and Yandex.",
    bestFor: "Frequent publishing, updates, and deletions.",
  },
  {
    method: "XML sitemap",
    how: "Search engines read your list of URLs and last-modified dates when they choose to.",
    reach: "Any search engine that supports sitemaps, including Google.",
    bestFor: "A complete, always-available map of your site.",
  },
  {
    method: "Search Console URL Inspection",
    how: "You request indexing for one URL at a time inside Google Search Console.",
    reach: "Google only.",
    bestFor: "A handful of important pages.",
  },
];

const RESPONSES = [
  ["200", "Received", "Your URLs were accepted."],
  ["202", "Accepted", "Received; key validation is still pending."],
  ["400", "Bad request", "The request format was invalid."],
  ["403", "Key not valid", "Key file missing, or its contents don't match."],
  ["422", "Unprocessable", "URLs don't match the host, or the key doesn't fit the schema."],
  ["429", "Too many requests", "You've been rate-limited ; slow down and retry later."],
];

export default function IndexNowEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is IndexNow and how does it work?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            IndexNow is an open protocol that lets a website tell participating search engines when a
            URL has been added, updated, or deleted, instead of waiting for them to discover the
            change on their own. You prove you own the site by hosting a small key file, then send
            the changed URLs along with that key. Engines that support the protocol share submitted
            URLs with one another, so one notification can reach several of them. Google is not a
            participating engine at the time of writing ; check indexnow.org for the current list.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            IndexNow vs. sitemaps vs. URL Inspection
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            These methods work together rather than competing. Most sites benefit from a sitemap for
            completeness and a push method for speed.
          </p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">How it works</th>
                  <th className="px-4 py-3">Who it reaches</th>
                  <th className="px-4 py-3">Best for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {COMPARISON.map((row) => (
                  <tr key={row.method} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">{row.method}</td>
                    <td className="px-4 py-3 leading-7">{row.how}</td>
                    <td className="px-4 py-3 leading-7">{row.reach}</td>
                    <td className="px-4 py-3 leading-7">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Why faster discovery matters</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              When you publish a time-sensitive article, fix an error, or retire a page, the quicker a
              search engine learns about it, the sooner its results can reflect the change. That is
              most useful for news, product and price updates, job listings, and sites that publish
              often. It does not replace good content or a crawlable site, and it doesn&apos;t guarantee
              that a page will be indexed or ranked.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Make sure crawlers can reach the pages you submit. Review your{" "}
              <Link href="/tools/robots-txt-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                robots.txt rules
              </Link>{" "}
              first, and consider helping AI systems understand your site with an{" "}
              <Link href="/tools/llms-txt-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                llms.txt file
              </Link>
              .
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Is the IndexNow key a secret?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Not in the password sense. The key sits in a public text file so search engines can
              read it. Its job is to prove you control the site, so use a random value, host the file
              only on sites you own, and don&apos;t reuse one key across unrelated domains. If you ever
              want to rotate it, generate a new key, upload the new file, and start using it for new
              submissions.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              After you&apos;ve submitted, check that your pages are worth the crawl with the{" "}
              <Link href="/tools/ai-citation-readiness-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                AI Citation Readiness Checker
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">IndexNow response codes explained</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RESPONSES.map(([code, name, meaning]) => (
              <div key={code} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-extrabold text-slate-950 dark:text-white">
                  <span className="mr-2 text-[#5271ff]">{code}</span>
                  {name}
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{meaning}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Keep improving the pages you submit</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Fast discovery works best when the page is worth finding. Strengthen titles and snippets
            with the{" "}
            <Link href="/tools/meta-title-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Meta Title Generator
            </Link>
            , then plan new content with the{" "}
            <Link href="/tools/seo-content-brief-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              SEO Content Brief Generator
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
