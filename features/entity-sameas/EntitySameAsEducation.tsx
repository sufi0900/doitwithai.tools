import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const TYPES = [
  ["Organization", "Companies, publishers, nonprofits, and other groups", "Homepage or About page"],
  ["Person", "A named individual such as an author, founder, or expert", "Author page or personal About page"],
  ["Brand", "A brand name that is distinct from the company that owns it", "Brand or product-line page"],
  ["Product", "A specific product you make or sell", "The product's own page"],
  ["Place", "A location, venue, or landmark", "The location's page"],
];

const SOURCES = [
  ["Wikidata", "A free, structured knowledge base that anyone can read. Entries have a Q-number and can store official websites and profile IDs."],
  ["Wikipedia", "An encyclopedia with its own notability and neutrality rules. Not every brand or person qualifies for an article."],
  ["Official profiles", "Verified social or professional pages you control, such as LinkedIn, YouTube, or GitHub."],
  ["Reference databases", "Third-party directories such as Crunchbase that describe your organization."],
];

const EXAMPLE = `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Example Co",
  "url": "https://example.com/",
  "sameAs": [
    "https://www.wikidata.org/wiki/Q00000000",
    "https://www.linkedin.com/company/example-co/",
    "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxx"
  ]
}`;

export default function EntitySameAsEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Learn the method
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What is sameAs schema and why do entities matter?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            In structured data, <code className="font-mono text-xs">sameAs</code> is a property that lists
            URLs of other pages that identify the same real-world entity as the one you are describing,
            such as your Wikidata entry or official social profiles. Search engines and AI systems work
            with entities — things like brands, people, and places — rather than just keywords, and
            sameAs links are one clear way to say &ldquo;this page is about the same thing as these
            profiles.&rdquo; It helps with disambiguation. It is not a ranking shortcut.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
            Where entity information comes from
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {SOURCES.map(([term, definition]) => (
              <div key={term} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <dt className="text-sm font-extrabold text-slate-950 dark:text-white">{term}</dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Which schema type should you use?</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Describes</th>
                  <th className="px-4 py-3">Usual placement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {TYPES.map(([type, describes, placement]) => (
                  <tr key={type} className="align-top text-slate-600 dark:text-slate-300">
                    <td className="px-4 py-3 font-extrabold text-slate-950 dark:text-white">{type}</td>
                    <td className="px-4 py-3 leading-7">{describes}</td>
                    <td className="px-4 py-3 leading-7">{placement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">What the finished markup looks like</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A minimal Organization example with a few sameAs links. The tool produces the same shape
              from the links you tick.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {EXAMPLE}
            </pre>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">If you&apos;re not on Wikidata</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Many legitimate brands have no Wikidata or Wikipedia entry, and that&apos;s fine. Build your
              entity from sources you control: consistent naming across your site, a clear About page,
              and a short list of official profile URLs in your sameAs property. Entries on Wikidata
              and Wikipedia generally need independent, reliable coverage of the subject, so they
              tend to follow real-world recognition rather than create it.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Wikidata is edited by volunteers and can be incomplete or out of date, so always verify
              each link the tool surfaces before you publish it.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Put your entity markup to work</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Add more structured data to the same page with the{" "}
            <Link href="/tools/schema-markup-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              Schema Markup Generator
            </Link>
            . Then see how answer-ready your content is with the{" "}
            <Link href="/tools/ai-citation-readiness-checker" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              AI Citation Readiness Checker
            </Link>{" "}
            and describe your site for AI systems with the{" "}
            <Link href="/tools/llms-txt-generator" className="font-bold text-[#4662df] hover:underline dark:text-blue-300">
              llms.txt Generator
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
