import Image from "next/image";
import polish from "./intent-article.module.css";
import Link from "next/link";
import PromptBuilder from "./PromptBuilder";
import { intentExample, intentPrompts } from "./intent-workflow";
import styles from "./editorial.module.css";
export default function IntentPromptArticle({
  schema,
}: {
  schema: Record<string, unknown>;
}) {
  return (
    <article className={styles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className={styles.wrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/prompts">Prompt library</Link>
          <span>/</span>
          <span aria-current="page">Search intent prompts</span>
        </nav>
        <header className={styles.hero}>
          <p className={styles.kicker}>
            KEYWORD RESEARCH · SIX PRACTICAL PROMPTS
          </p>
          <h1>ChatGPT prompts for search intent</h1>
          <p className={styles.dek}>
            Understand the task behind a query before choosing what to publish.
          </p>
          <p className={styles.heroSummary}>
            These prompts separate keyword clues from supplied result evidence.
            Customize each brief, review uncertainty, and build a focused
            content plan.
          </p>
          <Link href="/author/sufian-mustafa" className={polish.authorCard}>
            <Image
              src="/sufi.jpeg"
              width={48}
              height={48}
              alt="Sufian Mustafa"
              className={polish.avatar}
            />
            <span>
              <strong>Sufian Mustafa</strong>
              <span>Founder and author · Do It With AI Tools</span>
            </span>
          </Link>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#intent-prompts">
              Choose a prompt
            </a>
            <Link
              className={polish.secondaryButton}
              href="/tools/search-intent-checker"
            >
              Use Search Intent Checker
            </Link>
          </div>
        </header>
        <figure className={polish.cover}>
          <Image
            src="/prompts/search-intent-prompts-hero.webp"
            width={1600}
            height={900}
            alt="Search intent prompts beside a screen showing a query, reusable prompt, and Copy prompt button."
            sizes="(max-width: 1200px) 100vw, 1100px"
            priority
          />
          <figcaption>
            Reusable prompts for reviewing reader goals and choosing a useful
            content format.
          </figcaption>
        </figure>
        <div className="mx-auto max-w-4xl space-y-12">
          <nav
            aria-label="Guide contents"
            className="rounded-2xl border border-slate-300 p-5 dark:border-slate-600"
          >
            <strong>In this guide</strong>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
              <li>
                <a href="#intent-basics">Understand intent</a>
              </li>
              <li>
                <a href="#intent-optimization">Optimize your page</a>
              </li>
              <li>
                <a href="#intent-workflow">Follow the workflow</a>
              </li>
              <li>
                <a href="#intent-prompts">Customize six prompts</a>
              </li>
              <li>
                <a href="#intent-example">See a worked example</a>
              </li>
              <li>
                <a href="#intent-faq">Questions and limits</a>
              </li>
            </ul>
          </nav>
          <section id="intent-basics" className={styles.section}>
            <h2>What search intent tells you</h2>
            <p>
              Search intent, also called keyword intent, describes the task
              someone wants to complete through a search.
            </p>
            <p>
              Knowing the topic is only the start. A reader seeking instructions
              needs a different experience from someone ready to buy.
            </p>
            <p>
              Consider “how to write a meta title” and “meta title generator.”
              Both concern titles, but the second may require an interactive
              tool.
            </p>
            <p>
              A wording clue offers a starting interpretation. Current results
              can provide additional evidence about page types and reader
              expectations.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-600">
              <table className="w-full text-left text-base">
                <caption className="p-4 text-left">
                  Illustrative queries and practical starting strategies
                </caption>
                <thead>
                  <tr>
                    {["Intent", "Reader task", "Starting strategy"].map((x) => (
                      <th key={x} scope="col" className="p-4">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Informational",
                      "Learn how to write a meta title",
                      "Explain the task and demonstrate it.",
                    ],
                    [
                      "Navigational",
                      "Reach ChatGPT login",
                      "Help readers reach the official destination.",
                    ],
                    [
                      "Commercial investigation",
                      "Compare the best writing tools",
                      "Present criteria, limitations, and supported comparisons.",
                    ],
                    [
                      "Transactional",
                      "Buy a keyword research course",
                      "Clarify the offer, terms, and next action.",
                    ],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="border-t border-slate-300 dark:border-slate-600"
                    >
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={i} scope="row" className="p-4">
                            {cell}
                          </th>
                        ) : (
                          <td key={i} className="p-4">
                            {cell}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Mixed intent is possible. Do not force a single label when the
              wording or observed results support competing tasks.
            </p>
          </section>
          <section id="intent-optimization" className={styles.section}>
            <h2>How to turn search intent into a useful page</h2>
            <p>
              Search engines interpret queries and assess which pages may
              satisfy them. A modifier is a clue, rather than a complete
              explanation of the reader.
            </p>
            <p>
              For a practical review, separate the reader’s task from the page’s
              format. Then decide what evidence, examples, or functionality
              would complete that task.
            </p>
            <h3>Choose the type, format, and angle separately</h3>
            <p>
              A page type could be a guide, product page, category, or
              interactive tool. A format could be a tutorial, comparison, or
              checklist.
            </p>
            <p>
              The angle identifies the audience or constraint you serve. For
              example, beginners may need setup steps, while experienced teams
              may need workflow comparisons.
            </p>
            <p>
              Ahrefs’{" "}
              <a href="https://ahrefs.com/blog/search-intent/">
                search intent guide
              </a>{" "}
              explains this distinction. Use it to interpret evidence without
              copying another page’s structure blindly.
            </p>
            <h3>Make the next action match the reader’s task</h3>
            <p>
              A tutorial can offer a worked example or relevant tool. A
              comparison should help readers choose using clear criteria and
              disclosed limitations.
            </p>
            <p>
              A transactional page needs understandable terms and an accessible
              action. A navigational page should make the intended destination
              easy to find.
            </p>
            <h3>Use a keyword intent checker as a starting point</h3>
            <p>
              Enter the exact query in our{" "}
              <Link href="/tools/search-intent-checker">
                Search Intent Checker
              </Link>
              . Inspect its supporting wording and suggested reader task.
            </p>
            <p>
              For a deeper review, add your audience and current result notes.
              Our tool interprets those notes without independently verifying
              the result sample.
            </p>
            <p>
              If the evidence conflicts, preserve that uncertainty. Recheck the
              exact query, market, and language before changing a useful page.
            </p>
            <h3>Review usefulness after publishing</h3>
            <p>
              Compare relevant Search Console queries with the page’s purpose.
              Look for mismatched promises, missing examples, or an action that
              interrupts the reader’s task.
            </p>
            <p>
              Clicks and position alone do not establish an intent problem.
              Check changes in context before making large rewrites.
            </p>
          </section>
          <section id="intent-workflow" className={styles.section}>
            <h2>Use evidence before choosing a format</h2>
            <ol className="list-decimal space-y-3 pl-6">
              <li>
                Record the exact query, audience, market, language, and review
                date.
              </li>
              <li>Run a wording-only check. Keep broad queries uncertain.</li>
              <li>
                Inspect current results manually. Record visible titles,
                destinations, page types, and meaningful differences.
              </li>
              <li>
                Use one query when reviewing result notes. Separate your
                observations from your interpretation.
              </li>
              <li>
                Choose a primary reader task, then decide the page type, format,
                and angle.
              </li>
              <li>
                Check your draft against that task before polishing titles and
                headings.
              </li>
            </ol>
            <p>
              Remove confidential information from your notes. Public URLs alone
              do not provide page content to these prompts.
            </p>
            <p>
              If your assistant browses, request source URLs and observation
              dates. Check those sources yourself before relying on the
              interpretation.
            </p>
          </section>
          <section id="intent-prompts" className={styles.section}>
            <h2>Six prompts you can customize</h2>
            <p>
              Start with the first prompt. Use later prompts when you have the
              evidence or draft they require.
            </p>
            <p>
              Each prompt carries its own context. You can copy it into a new
              conversation without relying on earlier messages.
            </p>
            {intentPrompts.map((prompt, index) => (
              <section
                id={prompt.id}
                key={prompt.id}
                className="my-8 rounded-2xl border border-slate-300 p-4 dark:border-slate-600 sm:p-6"
              >
                <h3>
                  {index + 1}. {prompt.title}
                </h3>
                <p>{prompt.description}</p>
                <details className="mt-4" open={index === 0}>
                  <summary className="min-h-11 cursor-pointer py-2 font-semibold">
                    Customize and copy this prompt
                  </summary>
                  <PromptBuilder prompt={prompt} example={intentExample} />
                </details>
                <p className="mt-4 text-base">
                  <strong>Review before accepting</strong> Check exact cues,
                  missing evidence, and whether the suggested task matches your
                  reader.
                </p>
              </section>
            ))}
          </section>
          <section id="intent-example" className={styles.section}>
            <h2>A worked example without invented search results</h2>
            <p>
              <strong>Query</strong> “how to write a meta title”
            </p>
            <p>
              <strong>Context</strong> New bloggers writing an English tutorial.
              No live result notes are available.
            </p>
            <p>
              <strong>Provisional interpretation</strong> Informational intent.
              The phrase “how to” suggests a practical learning task.
            </p>
            <p>
              <strong>Useful starting format</strong> A guide explaining the
              title’s role, a repeatable writing process, and examples with
              clear reasoning.
            </p>
            <p>
              <strong>Still unknown</strong> Which formats appear in current
              results, which reader constraints dominate, and whether a tool
              experience also matters.
            </p>
            <p>
              This example uses supplied wording only. It does not establish
              current rankings or prove that a tutorial will outperform other
              formats.
            </p>
            <p>
              Compare “best meta title tools.” The comparison cue suggests
              commercial investigation, so meaningful selection criteria become
              more useful than writing instructions alone.
            </p>
          </section>
          <aside className="rounded-2xl border border-[#5271FF]/40 bg-[#5271FF]/10 p-6">
            <h2>Turn the review into your next action</h2>
            <p>
              Use our{" "}
              <Link
                href="/tools/search-intent-checker"
                className="font-bold underline"
              >
                Search Intent Checker
              </Link>{" "}
              for compact labels, supporting cues, and downloadable results.
            </p>
            <p>
              Then use the{" "}
              <Link
                href="/tools/article-outline-generator"
                className="font-bold underline"
              >
                Article Outline Generator
              </Link>{" "}
              to structure the reviewed reader task.
            </p>
            <p>
              When the page purpose is clear, try our{" "}
              <Link
                href="/prompts/chatgpt-prompts-for-meta-title-and-meta-description"
                className="font-bold underline"
              >
                meta title and description prompts
              </Link>
              .
            </p>
          </aside>
          <section className={styles.section}>
            <h2>Common mistakes to avoid</h2>
            <ul className="list-disc space-y-3 pl-6">
              <li>
                Assuming every branded query is navigational. A brand plus
                “alternatives” may signal comparison.
              </li>
              <li>
                Treating a modifier as conclusive evidence. Wording and current
                results can disagree.
              </li>
              <li>Combining every possible task into one unfocused page.</li>
              <li>
                Calling AI output a live search audit without checking its
                sources.
              </li>
              <li>
                Inventing volume, difficulty, or confidence percentages to make
                the report seem complete.
              </li>
              <li>
                Rewriting useful content before confirming that its reader task
                is actually wrong.
              </li>
            </ul>
          </section>
          <section className={styles.section}>
            <h2>Keep building your content workflow</h2>
            <div className={polish.readingGrid}>
              {[
                [
                  "/ai-seo/chatgpt-target-audience-research",
                  "Research your target audience",
                  "Clarify who the page serves before selecting its angle.",
                ],
                [
                  "/ai-seo/chatgpt-keyword-research",
                  "Plan keyword research with ChatGPT",
                  "Connect query ideas with the questions your content needs to answer.",
                ],
                [
                  "/prompts/chatgpt-prompts-for-meta-title-and-meta-description",
                  "Write accurate titles and descriptions",
                  "Use your reviewed page purpose to create a faithful search preview.",
                ],
              ].map(([href, title, description]) => (
                <Link href={href} key={href} className={polish.readingCard}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span>Read the guide ↗</span>
                </Link>
              ))}
            </div>
          </section>
          <section id="intent-faq" className={styles.section}>
            <h2>Questions about search intent prompts</h2>
            {[
              [
                "Why can a tool label disagree with the results I see?",
                "A wording estimate and a live result sample use different evidence. Check the exact query, location, language, and date before accepting either interpretation.",
              ],
              [
                "Should I add more words when a page does not match intent?",
                "Extra text may not solve a task mismatch. First check the page type, opening promise, useful examples, and next action.",
              ],
              [
                "Are search intent and keyword intent different?",
                "Both terms describe the reader task behind a search query. Use the same evidence-led workflow for either term.",
              ],
              [
                "Can ChatGPT determine intent from a keyword alone?",
                "It can suggest an interpretation from wording. Broad queries and conflicting cues need more context and current result inspection.",
              ],
              [
                "Do these prompts automatically search Google?",
                "No. They work with your supplied inputs. Any browsing depends on your assistant, and retrieved evidence still needs review.",
              ],
              [
                "Should mixed intent always become separate pages?",
                "No. Decide whether the tasks fit one coherent experience. Separate pages are useful when reader goals conflict, not merely because labels differ.",
              ],
              [
                "Will matching intent guarantee rankings or AI citations?",
                "No. Intent alignment supports a useful page purpose. It does not establish ranking outcomes, factual accuracy, or citation likelihood.",
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="border-b border-slate-300 py-4 dark:border-slate-600"
              >
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </section>
          <section className={styles.section}>
            <h2>Sources and editorial boundaries</h2>
            <p>
              Reviewed on October 25, 2026. The prompts are editorial workflows,
              not a measured search-intent model.
            </p>
            <ul className="list-disc space-y-3 pl-6">
              <li>
                <a
                  href="https://www.semrush.com/blog/keyword-intent/"
                  className="underline"
                >
                  Semrush’s keyword intent guide
                </a>{" "}
                explains the terminology, categories, and mixed intents.
              </li>
              <li>
                <a
                  href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                  className="underline"
                >
                  Google’s people-first content guidance
                </a>{" "}
                supports focusing on a real audience and useful content.
              </li>
            </ul>
            <p>
              Our examples are illustrative. Their suggested formats must be
              checked against your actual page purpose and current evidence.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
