import Link from "next/link";
import { Code2, Eye, ShieldAlert } from "lucide-react";

export default function SerpPreviewEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you trust the preview
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Make your search preview useful
          </h2>
        </div>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Check the{" "}
          <a
            className="text-[#5271ff] underline"
            href="https://developers.google.com/search/docs/appearance/structured-data/sd-policies"
          >
            Google structured data guidelines
          </a>{" "}
          before publishing. Our cards illustrate data fields, including older
          formats. They do not certify eligibility for a current Google Search
          feature.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Pixels explain more than character counts
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Two titles with 55 characters can have very different widths. Wide
              capitals take more space than narrow letters. Compare the measured
              width and visible lines, then put the most useful words early.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Our desktop preset uses 600 pixels for the title and two 480 pixel
              description lines. Mobile uses 340 pixel lines. These are
              adjustable viewing contexts through device selection, rather than
              official Google limits.
            </p>
            <Link
              href="/ai-seo/meta-title"
              className="mt-3 inline-block text-sm font-bold text-[#4662df] underline dark:text-blue-300"
            >
              Read our guide to writing meta titles with AI
            </Link>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              A useful description adds context
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Explain what the page offers and why it helps. Avoid repeating the
              title word for word. Preview optional dates because they use space
              that could otherwise show descriptive text.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A description can fit this preset and still be rewritten or
              shortened in search. The query and device influence the final
              snippet.
            </p>
            <Link
              href="/ai-seo/meta-description"
              className="mt-3 inline-block text-sm font-bold text-[#4662df] underline dark:text-blue-300"
            >
              Read our meta description guide
            </Link>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Import efficiently, then refine locally
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use the prominent Import from URL button to load a public page.
              Switch off the body scan for a quicker metadata check. Keep
              editing without importing again. Recent successful imports may be
              reused for five minutes.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Some websites block automated requests or add metadata through
              JavaScript. Enter the fields manually when the returned HTML does
              not contain the expected information.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Separate markup from search eligibility
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The inspector can display several recognized items from one page.
              Each card reflects its own fields. FAQ and HowTo cards remain
              useful for inspecting older markup, although Google has retired
              both rich result displays.
            </p>
            <a
              href="https://developers.google.com/search/updates"
              className="mt-3 inline-block text-sm font-bold text-[#4662df] underline dark:text-blue-300"
            >
              Check current Google Search feature updates
            </a>
          </article>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Eye className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Google does not always use your title
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Google sometimes rewrites the displayed title or description based
              on the query, even when valid meta tags are present. This preview
              shows what you are providing, not a guarantee it is what gets
              shown.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Code2 className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Valid markup ≠ guaranteed rich result
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Technically valid JSON-LD is necessary but not sufficient. Google
              applies its own content-quality and eligibility criteria per rich
              result type, and can choose not to show one even for perfectly
              valid markup.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ShieldAlert className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Markup must match visible content
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              FAQ and Review markup is only meant for Q&As and reviews an
              ordinary visitor can actually see on the page. Markup for content
              that is not genuinely present is a structured-data policy
              violation, not just a wasted effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
