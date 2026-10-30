import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const FIELDS = [
  ["<loc>", "Required", "The full, absolute URL of the page.", "Yes"],
  ["<lastmod>", "Optional", "When the page content last meaningfully changed (W3C date).", "Yes, when accurate and consistent"],
  ["<changefreq>", "Optional", "A hint about how often the page changes.", "Ignored by Google"],
  ["<priority>", "Optional", "A 0.0–1.0 hint of importance relative to your other URLs.", "Ignored by Google"],
];

const INCLUDE = [
  "Canonical URLs that return a 200 status",
  "Pages you want to appear in search results",
  "Pages that are allowed by robots.txt and have no noindex tag",
];

const EXCLUDE = [
  "Redirected (3xx), missing (404), or blocked URLs",
  "Pages with a noindex directive or a different canonical URL",
  "Duplicate or parameter-based versions of the same page",
  "Internal search results, cart, and login pages",
];

const ESCAPES = [
  ["&", "&amp;"],
  ["'", "&apos;"],
  ['"', "&quot;"],
  [">", "&gt;"],
  ["<", "&lt;"],
];

const NEXT_SNIPPET = `// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://example.com/", lastModified: new Date("2026-10-01") },
    { url: "https://example.com/tools" },
  ];
}`;

export default function SitemapXmlEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is a sitemap.xml and why does it matter?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            An XML sitemap is a file that lists the URLs on your site you want search engines to
            discover and crawl. It is especially useful for new sites, large sites, and pages that
            aren&apos;t well linked from elsewhere. A sitemap doesn&apos;t guarantee a page will be
            indexed or ranked, but it gives search engines a clear, machine-readable list to work from.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            Which sitemap tags do search engines actually use?
          </h3>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Tag</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                  <th className="px-4 py-3">Used by Google?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {FIELDS.map(([tag, status, meaning, used]) => (
                  <tr key={tag} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-950 dark:text-white">{tag}</td>
                    <td className="px-4 py-3">{status}</td>
                    <td className="px-4 py-3 leading-7">{meaning}</td>
                    <td className="px-4 py-3">{used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Other search engines may treat these hints differently, so they are optional here. If you
            can&apos;t keep <code className="font-mono text-xs">lastmod</code> accurate, leaving it out is
            better than guessing.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">What to include</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {INCLUDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">What to leave out</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {EXCLUDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Limits and sitemap index files</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A single sitemap can hold up to 50,000 URLs and be up to 50 MB uncompressed. Larger sites
              use several sitemap files plus a sitemap index that lists them, and you submit just the
              index. This tool builds the split and the index automatically when your list is too long.
            </p>
            <h3 className="mt-8 text-xl font-black text-slate-950 dark:text-white">Special characters in URLs</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              URLs must be entity-escaped inside XML. The generator does this for you; if you edit a
              file by hand, use these replacements:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ESCAPES.map(([char, entity]) => (
                <span
                  key={entity}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {char} → {entity}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Building a Next.js site?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The App Router can generate your sitemap from code, so it stays in sync as you publish.
              Use this tool to validate the output, and a hand-built list for one-off sites.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {NEXT_SNIPPET}
            </pre>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">After you publish your sitemap</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Point crawlers to it with a{" "}
            <Link href="/tools/robots-txt-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              robots.txt file
            </Link>
            , and announce new or updated pages quickly with the{" "}
            <Link href="/tools/indexnow-key-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              IndexNow Key Generator &amp; URL Submitter
            </Link>
            . Then find pages worth improving with the{" "}
            <Link href="/tools/gsc-striking-distance-finder" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Striking Distance Keyword Finder
            </Link>{" "}
            and strengthen your site structure using the{" "}
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
