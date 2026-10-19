import Link from "next/link";

export default function RobotsEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Robots.txt generator guide</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">How to build a robots.txt file safely</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Start by checking your existing file before replacing it. Save a backup so you can restore earlier rules if needed.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Choose the crawler group you want to manage. The wildcard user agent applies broadly, while named groups target specific crawlers.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Add paths carefully, then review the preview and crawler matrix. Download the file only after checking every rule against your intended policy.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Understand Allow and Disallow with an example</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">A Disallow rule for /drafts/ asks matching crawlers to avoid that directory. An Allow rule can describe a more specific permitted path.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">For example, a site could restrict /drafts/ while allowing /drafts/public-example/. Check overlapping rules with the crawler documentation before publishing.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Paths are case sensitive. A small spelling change can affect which URLs match, so copy paths from real pages rather than guessing.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Separate crawler access from indexing and privacy</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Robots.txt manages crawling requests. A blocked URL may still appear in search results when other pages link to it.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Use a supported noindex directive when your goal is removing a page from search. The crawler must access the page to see that directive.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Protect confidential pages with authentication or server access rules. Never publish secret paths or assume a robots rule secures a document.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Review AI crawler choices individually</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Decide separately whether you want discovery in search products and use for model training. Read each operator policy before choosing a rule.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The matrix helps review named groups, but it does not prove that every bot will obey them. User-requested fetches can follow different policies.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Avoid blocking useful search access accidentally when your intention is only to restrict training. Recheck your policy when vendors change their documentation.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Publish and test the final file</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Place robots.txt at the root of the relevant host, such as https://example.com/robots.txt. Each subdomain needs its own configuration.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Open that address after deployment. Confirm that it returns the intended plain text rather than a login screen or an HTML error page.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Check important URLs in Search Console and monitor crawling after changes. Keep required styles and scripts accessible so search engines can render public pages.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Troubleshoot unexpected results</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">If a live import fails, confirm that the host is public and the address is correct. You can still build rules manually.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">If the file looks correct but access fails, inspect firewall rules and hosting protection. Robots.txt is only one part of the access path.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Review the file after migrations, staging launches, and major URL changes. Remove temporary restrictions before making a site public.</p>
          </article>
        </div>
        <nav aria-label="Related tools" className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools/llms-txt-generator" className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300">llms.txt Generator</Link>
          <Link href="/tools/ai-citation-readiness-checker" className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300">AI Citation Readiness Checker</Link>
        </nav>
        <div className="mt-8 text-sm leading-7 text-slate-600 dark:text-slate-300"><h3 className="font-bold">Further reading</h3><ul className="mt-2 list-disc space-y-2 pl-5">
          <li><a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" className="text-[#4662df] underline dark:text-blue-300">Google robots.txt guidance</a></li>
        </ul></div>
      </div>
    </section>
  );
}
