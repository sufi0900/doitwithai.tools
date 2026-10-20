import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const LEVELS = [
  ["H1", "The page's main topic", "Usually one per page, first in the content"],
  ["H2", "A main section of the page", "Several per page, each covering a distinct topic"],
  ["H3", "A sub-point inside an H2 section", "Only used under an H2"],
  ["H4–H6", "Further detail inside an H3 (and so on)", "Rarely needed on short pages"],
];

const WHY = [
  ["Readers", "People skim. Clear headings let them find the part they need without reading everything."],
  ["Accessibility", "Many screen reader users move through a page by jumping between headings, so a logical order and real text matter."],
  ["Search engines", "Headings help search engines understand how a page is organised and which section answers which question."],
  ["AI answer engines", "Well-labelled sections are easier to quote or summarise accurately, because each heading frames the passage under it."],
];

const GOOD = `<h1>How to write a meta description</h1>
  <h2>What a meta description does</h2>
  <h2>How long it should be</h2>
    <h3>On desktop</h3>
    <h3>On mobile</h3>
  <h2>Examples you can adapt</h2>`;

export default function HeadingAnalyzerEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is a good heading structure for SEO?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Heading tags (H1 to H6) are the outline of a page. A good structure has one main heading
            that states the topic, followed by section headings that break the content into clear
            parts, with sub-headings nested in order beneath them. It is one of the simplest ways to
            make a page easier to read, easier to navigate with assistive technology, and easier for
            search engines to interpret.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            What each heading level is for
          </h3>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Typical use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {LEVELS.map(([level, role, use]) => (
                  <tr key={level} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">{level}</td>
                    <td className="px-4 py-3 leading-7">{role}</td>
                    <td className="px-4 py-3 leading-7">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Why heading structure matters</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {WHY.map(([term, definition]) => (
              <div key={term} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <dt className="text-sm font-extrabold text-slate-950 dark:text-white">{term}</dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">What a clean outline looks like</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              One H1, then H2 sections, with H3s only inside the H2 they belong to. Each heading names
              its own topic.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {GOOD}
            </pre>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Adding keywords to headings naturally</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Start from what each section actually answers, then use the wording searchers use where
              it fits. Search engines can handle more than one H1, so the single-H1 advice here is about
              clarity, not a penalty. If your research shows people ask a question, phrasing a heading
              as that question can help the section stand alone. Avoid stuffing the same phrase into every
              heading — check for over-repetition with the{" "}
              <Link href="/tools/keyword-density-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
                Keyword Density and Repetition Checker
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Improve the headings you find</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Need a stronger main heading? Try the{" "}
            <Link href="/tools/h1-heading-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              H1 Heading Generator
            </Link>
            . Planning a new structure from scratch? Use the{" "}
            <Link href="/tools/article-outline-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Article Outline Generator
            </Link>{" "}
            or the{" "}
            <Link href="/tools/seo-content-brief-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              SEO Content Brief Generator
            </Link>
            . Once the outline is sound, check how easy the text is to read with the{" "}
            <Link href="/tools/readability-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Readability Checker
            </Link>{" "}
            and how answer-ready it is with the{" "}
            <Link href="/tools/ai-citation-readiness-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              AI Citation Readiness Checker
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
