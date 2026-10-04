import Link from "next/link";
import { BookOpen, CheckCircle2, ClipboardCheck, Layers3 } from "lucide-react";
import type { WritingKind } from "./schema";

const content = {
  "meta-description": {
    heading: "Write a page summary worth reading",
    intro:
      "A meta description summarizes a particular page in its HTML metadata. It should give readers a clear reason to explore that page.",
    context:
      "Google primarily creates snippets from page content and may use the description. Different searches can produce different snippets for the same URL.",
    placement:
      "Use your CMS description field or the description meta tag inside the document head. The preview here illustrates wording, rather than predicting search appearance.",
    brief:
      "An introductory guide for small business owners explains how to write meta titles. It includes examples, a revision checklist, and common mistakes.",
    examples: [
      [
        "Clear summary",
        "Learn how to write meta titles for business pages, with practical examples, a revision checklist, and common mistakes to review.",
        "Choose this direction when readers need a straightforward explanation of what the guide covers.",
      ],
      [
        "Reader benefit",
        "Compare meta title examples and use a revision checklist to make your business page titles clearer and more specific.",
        "Choose this direction when the page provides concrete material that helps readers make a decision.",
      ],
      [
        "Next step",
        "Review your business page titles using practical examples, a writing checklist, and explanations of common meta title mistakes.",
        "Choose this direction when the page supports a useful action. Match that action to what readers can actually do.",
      ],
    ],
    types: [
      [
        "Guides and articles",
        "Name the question, explain the scope, and mention genuinely included examples or steps. Avoid promising answers beyond the article.",
      ],
      [
        "Product pages",
        "Describe the product and its relevant characteristics. Verify prices, availability, compatibility, and other changing details before including them.",
      ],
      [
        "Service pages",
        "State the service, intended customer, and relevant area or process. Only mention offers, credentials, or response times you can substantiate.",
      ],
      [
        "Category pages",
        "Describe the collection and useful selection criteria. Avoid copying the same generic description across unrelated categories.",
      ],
    ],
    before:
      "Best SEO guide! Guaranteed top rankings. SEO titles, title SEO, perfect titles. Click now!",
    after:
      "Explore meta title examples for business pages, a practical writing checklist, and common mistakes to consider before publishing.",
    lesson:
      "The revision replaces repeated keywords and unsupported promises with specific contents from the example brief. Its value comes from accuracy and useful detail.",
    checklist: [
      "Confirm each stated benefit, feature, and offer appears on the page.",
      "Read the description alongside the title. Add useful context instead of repeating every word.",
      "Keep the wording specific to this URL and readable without a keyword list.",
      "Put essential information early. Treat the character range as an editing aid, not a display guarantee.",
      "Save the final description in your CMS and inspect the published page source for the intended tag.",
    ],
    source: "https://developers.google.com/search/docs/appearance/snippet",
    sourceLabel: "Google Search Central: snippet guidance",
  },
  "h1-heading": {
    heading: "Give the page a clear main heading",
    intro:
      "An H1 is a visible heading that identifies the page's main topic. It should help readers understand what they have opened.",
    context:
      "Descriptive headings help people understand page organization. Semantic heading levels also let assistive technology identify sections and support heading navigation.",
    placement:
      "Add the chosen heading to your page's main heading field or H1 element. Use CSS for appearance while preserving meaningful heading structure.",
    brief:
      "A beginner guide for small business owners explains meta title writing through examples, a revision checklist, and common mistakes.",
    examples: [
      [
        "Topic first",
        "Meta Title Writing: Examples and a Revision Checklist",
        "Choose this direction when naming the topic and scope is the clearest introduction.",
      ],
      [
        "Task first",
        "How to Write and Review Meta Titles for Business Pages",
        "Choose this direction when the page teaches a process readers want to complete.",
      ],
      [
        "Audience first",
        "A Small Business Owner's Guide to Writing Meta Titles",
        "Choose this direction when the audience meaningfully shapes the advice, examples, or terminology.",
      ],
    ],
    types: [
      [
        "Educational guides",
        "Name the task or topic and clarify scope. Use an instructional heading only when the page actually provides instructions.",
      ],
      [
        "Product pages",
        "Identify the product clearly. Include a model or meaningful variant when it helps distinguish the page from similar products.",
      ],
      [
        "Service pages",
        "Name the service and add relevant audience or location context. Avoid promotional slogans that leave the service unclear.",
      ],
      [
        "Category pages",
        "Describe the collection. Keep the main heading broad enough to cover its contents without making it vague.",
      ],
    ],
    before: "Discover the Ultimate Secret to Amazing Success",
    after: "How to Write Meta Titles for Small Business Pages",
    lesson:
      "The revision names the actual task and intended context. It lets readers recognize the subject without interpreting a promotional slogan.",
    checklist: [
      "Confirm the heading accurately describes the page's primary topic.",
      "Read it with the title tag. Shared wording is acceptable when both remain clear and accurate.",
      "Check that each H2 introduces a section that belongs under the main topic.",
      "Use heading levels to express organization, rather than selecting a level only for its font size.",
      "Inspect the rendered page and its HTML to confirm the intended H1 and supporting headings are present.",
    ],
    source: "https://www.w3.org/WAI/tutorials/page-structure/headings/",
    sourceLabel: "W3C WAI: accessible heading structure",
  },
};

export default function WritingEducation({ kind }: { kind: WritingKind }) {
  const data = content[kind];
  const description = kind === "meta-description";
  const label = description ? "meta description" : "H1 heading";
  return (
    <div
      data-writing-education
      className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      <section
        aria-labelledby={`${kind}-purpose`}
        className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]"
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#4662df] dark:text-blue-300">
            Understand the element
          </p>
          <h2
            id={`${kind}-purpose`}
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            {data.heading}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
            {data.intro}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            {data.context}
          </p>
          <a
            href={data.source}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#4662df] underline underline-offset-4 dark:text-blue-300"
          >
            <BookOpen aria-hidden className="h-4 w-4" />
            {data.sourceLabel}
          </a>
        </div>
        <aside className="rounded-[28px] bg-slate-950 p-7 text-white sm:p-8">
          <Layers3 aria-hidden className="h-7 w-7 text-blue-300" />
          <h3 className="mt-5 text-xl font-extrabold">
            From the workspace to your website
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {data.placement}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Copy HTML exports an escaped element. Paste it into an appropriate
            code field, rather than a rich text editor that displays markup.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Check existing templates before adding another element. A saved
            draft still needs a publishing review against the real page.
          </p>
        </aside>
      </section>
      <section aria-labelledby={`${kind}-examples`}>
        <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#4662df] dark:text-blue-300">
          A worked example
        </p>
        <h2
          id={`${kind}-examples`}
          className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white"
        >
          One brief. Three useful directions.
        </h2>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Illustrative page brief
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            {data.brief}
          </p>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {data.examples.map(([direction, example, reason], index) => (
            <article
              key={direction}
              className="flex flex-col rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                0{index + 1} · {direction}
              </p>
              <h3 className="mt-4 text-lg font-extrabold leading-7 text-slate-950 dark:text-white">
                {example}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {reason}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          These are editorial examples, not live generated results. Choose
          wording against your own page, rather than copying an unrelated
          example.
        </p>
      </section>
      <section aria-labelledby={`${kind}-page-types`}>
        <h2
          id={`${kind}-page-types`}
          className="text-3xl font-black tracking-tight text-slate-950 dark:text-white"
        >
          Adapt the {label} to the page
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Select the page type in the brief, then supply its distinguishing
          details. An article, product, and service page need different context.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {data.types.map(([title, text]) => (
            <article
              key={title}
              className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900"
            >
              <h3 className="font-extrabold text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        aria-labelledby={`${kind}-revision`}
        className="grid gap-8 lg:grid-cols-2"
      >
        <div>
          <h2
            id={`${kind}-revision`}
            className="text-3xl font-black tracking-tight text-slate-950 dark:text-white"
          >
            Replace vague promises with clear context
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            {data.lesson}
          </p>
          <div className="mt-6 space-y-4">
            {[
              ["Before", data.before],
              ["After", data.after],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-blue-50 p-7 dark:bg-blue-950/30">
          <ClipboardCheck
            aria-hidden
            className="h-7 w-7 text-[#4662df] dark:text-blue-300"
          />
          <h3 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">
            What the writing checks can tell you
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Counts describe the draft's length. Keyword checks look for literal
            words, and repetition checks flag repeated phrases for your review.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Title overlap highlights shared wording. It does not decide whether
            that wording is appropriate or whether the page matches search
            intent.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The claim warning recognizes a limited set of phrases. It cannot
            verify facts, detect every misleading statement, or assess ranking
            potential.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Use your page and reliable sources to confirm every assertion. A
            clean check does not mean the draft has been fact-checked.
          </p>
        </div>
      </section>
      <section
        aria-labelledby={`${kind}-publish`}
        className="rounded-[28px] border border-slate-200 p-6 dark:border-slate-800 sm:p-8"
      >
        <h2
          id={`${kind}-publish`}
          className="text-3xl font-black tracking-tight text-slate-950 dark:text-white"
        >
          Before publishing your {label}
        </h2>
        <ol className="mt-7 grid gap-5 md:grid-cols-2">
          {data.checklist.map((text, index) => (
            <li
              key={text}
              className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300"
            >
              <CheckCircle2
                aria-hidden
                className="mt-1 h-5 w-5 shrink-0 text-[#4662df] dark:text-blue-300"
              />
              <span>
                <span className="font-bold">{index + 1}. </span>
                {text}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-7 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-400">
          Review the page's title, main heading, and description together. Use
          the{" "}
          <Link
            href="/tools/meta-title-generator"
            className="font-semibold text-[#4662df] underline underline-offset-4 dark:text-blue-300"
          >
            Meta Title Generator
          </Link>{" "}
          for title alternatives, then compare them with your{" "}
          {description ? (
            <Link
              href="/tools/h1-heading-generator"
              className="font-semibold text-[#4662df] underline underline-offset-4 dark:text-blue-300"
            >
              H1 heading
            </Link>
          ) : (
            <Link
              href="/tools/meta-description-generator"
              className="font-semibold text-[#4662df] underline underline-offset-4 dark:text-blue-300"
            >
              meta description
            </Link>
          )}
          . Each element should represent the same page accurately.
        </p>
      </section>
    </div>
  );
}
