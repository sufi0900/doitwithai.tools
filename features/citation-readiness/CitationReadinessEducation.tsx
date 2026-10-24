import Link from "next/link";

export default function CitationReadinessEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          How to use your citation readiness review
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              What the AI citation readiness checker measures
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              This checker reviews page features such as headings, answer
              clarity, supporting references, and structured information. Each
              result points to an area you can inspect.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The findings support editorial review. They do not predict
              inclusion in AI answers or track actual mentions across platforms.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use the findings to make information clearer and easier to verify.
              Observed structure cannot establish factual accuracy, expertise,
              or search visibility.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Choose a URL, article editor, or page HTML
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Analyze a public URL when you want to review the available page
              content. Make sure the page opens without a login or access
              challenge.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Paste a draft when the page is unpublished or a public fetch
              cannot read it. Include meaningful headings and the main article
              text.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Pasted text cannot reveal every HTML feature. Treat unavailable
              checks as unassessed, and review the published page after
              uploading your changes.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Turn findings into a useful editing plan
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Start with the main question the reader wants answered. Put a
              direct response near the relevant heading, then explain the
              details and exceptions.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use descriptive sections so people can find a definition, process,
              comparison, or example quickly. Avoid repeating the same phrase in
              every heading.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Prioritize a few meaningful improvements using individual evidence
              rather than a numerical target. Some checks may not suit every
              page type.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Add evidence that readers can verify
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Link factual claims to relevant original sources. Explain what the
              source supports, and check that its date and context fit your
              statement.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              When sharing original observations, explain your method and
              limits. Separate a measured result from your interpretation or
              personal recommendation.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Do not add invented numbers, author credentials, or quotes. Review
              outdated claims and show accurate author information where
              appropriate.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Use an example to improve answer clarity
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A weak opening might say that internal links are very important
              for modern websites. It leaves the practical question unanswered.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A stronger opening explains that internal links connect pages on
              the same site and help readers discover related information. A
              relevant example can follow.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Keep useful details and exceptions. Tables, steps, and examples
              should fit the topic rather than follow a rigid template.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Check technical access alongside content quality
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Google says ordinary SEO practices remain relevant for AI
              Overviews and AI Mode. Eligible pages must be indexed and able to
              show a snippet.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Check crawl access, meaningful internal links, and whether
              important information is available as text. Structured data should
              match what visitors can see.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              After editing, run another review and compare the individual
              findings. Measure real search traffic and reader outcomes
              separately from this page review.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Interpret restrictions and unknown evidence
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Restrictions describe detected directives or response problems.
              Confirm their purpose before changing them, especially on private
              or intentionally excluded pages.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Observed evidence describes extracted features. It does not
              certify access, indexing, expertise, accuracy, or AI citations.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Unknown evidence needs further inspection. Drafts lack live
              headers, and incomplete extraction cannot establish that a feature
              is absent.
            </p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Keep a review record
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Export the action plan and retained opening passages before
              leaving. Reports stay in your current session and do not update
              your website.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Review source support and original methods in Content Evidence
              Review. Check individual external links in External Link and
              Source Review.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              After publishing, import the URL again. Compare specific evidence
              and use your search reports to measure actual outcomes.
            </p>
          </article>
        </div>
        <nav aria-label="Related tools" className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tools/robots-txt-generator"
            className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300"
          >
            Robots.txt Generator
          </Link>
          <Link
            href="/tools/external-link-source-review"
            className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300"
          >
            External Link and Source Review
          </Link>
        </nav>
        <div className="mt-8 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <h3 className="font-bold">Further reading</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag"
                className="text-[#4662df] underline dark:text-blue-300"
              >
                Google indexing and snippet controls
              </a>
            </li>
            <li>
              <a
                href="https://developers.openai.com/api/docs/bots"
                className="text-[#4662df] underline dark:text-blue-300"
              >
                OpenAI search and training crawler guidance
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/search/docs/appearance/ai-features"
                className="text-[#4662df] underline dark:text-blue-300"
              >
                Google AI features guidance
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
