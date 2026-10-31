import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import PromptSeries from "./PromptSeries";
import { metaPromptSeries, promptCount } from "./meta-workflow";
import { promptHero, metadataGuides } from "./article-assets";
import styles from "./editorial.module.css";

export function EditorialSection({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function GuideCard({ guide }: { guide: typeof metadataGuides.title }) {
  return (
    <aside className={styles.guideCard} aria-label="Read the full guide">
      <Link href={guide.href} className={styles.guideImage}>
        <Image
          src={guide.image}
          width={guide.width}
          height={guide.height}
          alt={guide.alt}
          sizes="(max-width: 640px) 100vw, 420px"
        />
      </Link>
      <div className={styles.guideCopy}>
        <p className={styles.kicker}>GO DEEPER</p>
        <h3>{guide.title}</h3>
        <Link href={guide.href} className={styles.guideButton}>
          Read the full guide <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <p className={styles.guideCaption}>{guide.caption}</p>
    </aside>
  );
}
export default function MetaPromptArticle({
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
          <span aria-current="page">Meta titles and descriptions</span>
        </nav>
        <header className={styles.hero}>
          <div className={styles.heroLabels}>
            <span>ON-PAGE SEO</span>
            <span>THE PROMPT FIELD GUIDE / 01</span>
          </div>
          <h1>
            ChatGPT prompts for
            <br />
            <em>meta titles and meta descriptions</em>
          </h1>
          <p className={styles.dek}>
            Start with the page. Write clearer options. Review the pair before
            you publish.
          </p>
          <p className={styles.heroSummary}>
            Use these nine prompts to turn real page content into title and
            description drafts. Each step includes context, constraints, and a
            human review task.
          </p>
          <div className={styles.author}>
            <Link href="/author/sufian-mustafa">By Sufian Mustafa</Link>
            <span>{promptCount} copyable prompts</span>
            <span>Examples + review checklist</span>
          </div>
          <div className={styles.heroActions}>
            <a href="#prompts" className={styles.primary}>
              Find your prompt <ArrowUpRight size={17} />
            </a>
            <a href="#prompt-customizer">Customize all {promptCount} prompts</a>
            <a href="#worked-example">See the worked example</a>
          </div>
        </header>
        <figure className={styles.featured}>
          <Image
            src={promptHero.src}
            alt={promptHero.alt}
            width={promptHero.width}
            height={promptHero.height}
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <figcaption>
            Copyable ChatGPT prompts for meta titles and descriptions. The
            screen is an illustrative mockup.
          </figcaption>
        </figure>
        <div className={styles.layout}>
          <aside className={styles.toc}>
            <p className={styles.kicker}>INSIDE THIS GUIDE</p>
            <nav aria-label="Article contents">
              <a href="#basics">Start with the basics</a>
              <a href="#meta-title-definition">What is a meta title?</a>
              <a href="#meta-description-definition">
                What is a meta description?
              </a>
              <a href="#ai-search">Where AI search fits</a>
              <a href="#how-to-use">How to use the prompts</a>
              <a href="#prompts">The prompt collection</a>
              {metaPromptSeries.map((p, i) => (
                <a key={p.id} href={`#${p.id}`} className={styles.tocSub}>
                  {i + 1}. {p.label}
                </a>
              ))}
              <a href="#worked-example">A worked example</a>
              <a href="#tools-and-guides">Tools and deeper guides</a>
              <a href="#final-checks">Before you publish</a>
              <a href="#questions">Common questions</a>
            </nav>
            <p className={styles.tocNote}>
              Keep this page open while you compare your drafts.
            </p>
          </aside>
          <div className={styles.body}>
            <EditorialSection
              id="basics"
              kicker="FIRST, THE JOB EACH FIELD DOES"
              title="Two fields, one clear promise"
            >
              <p>
                A title introduces the page’s subject. A description explains
                the useful detail a reader can expect after clicking.
              </p>
              <p>
                Review them together, but give each field its own job. The
                prompts below cover drafting, page types, wording checks, and
                final editing.
              </p>
            </EditorialSection>
            <EditorialSection
              id="meta-title-definition"
              kicker="NAME THE PAGE CLEARLY"
              title="What is a meta title?"
            >
              <p>
                A meta title is the text in a page’s HTML title element. Google
                may use it to create the clickable title in search results.
              </p>
              <p>
                It can also appear in a browser tab. It does not have to be
                identical to the page’s H1 heading.
              </p>
              <p>
                A useful title names the specific topic and sets an accurate
                expectation. For our example, “Image Alt Text Examples” is
                clearer than “Everything About Images.”
              </p>
              <div className={styles.htmlExample}>
                <span>HTML example</span>
                <code>
                  &lt;title&gt;How to Write Image Alt Text, With
                  Examples&lt;/title&gt;
                </code>
              </div>
              <GuideCard guide={metadataGuides.title} />
              <p className={styles.source}>
                Reference:{" "}
                <a href="https://developers.google.com/search/docs/appearance/title-link">
                  Google’s title link guidance
                </a>
                .
              </p>
            </EditorialSection>
            <EditorialSection
              id="meta-description-definition"
              kicker="EXPLAIN WHAT THE READER WILL FIND"
              title="What is a meta description?"
            >
              <p>
                A meta description is a short HTML summary of a webpage. Google
                may use it for a search snippet or select page text instead.
              </p>
              <p>
                Use it to describe the page’s practical value. Mention examples,
                products, or specific scope only when the content supports them.
              </p>
              <p>
                The alt text guide’s description could mention products, charts,
                and decorative images. It should not promise first-place
                rankings.
              </p>
              <div className={styles.htmlExample}>
                <span>HTML example</span>
                <code>
                  &lt;meta name=&quot;description&quot; content=&quot;Write
                  useful image alt text with examples for products and
                  charts.&quot; /&gt;
                </code>
              </div>
              <GuideCard guide={metadataGuides.description} />
              <p className={styles.source}>
                Reference:{" "}
                <a href="https://developers.google.com/search/docs/appearance/snippet">
                  Google’s description guidance
                </a>
                .
              </p>
            </EditorialSection>
            <EditorialSection
              id="ai-search"
              kicker="SEO FUNDAMENTALS, WITH CLEAR LIMITS"
              title="Where the AI search angle belongs"
            >
              <p>
                We consider Google Search and AI-assisted discovery when writing
                these prompts. That means clear subjects, accurate summaries,
                and consistent wording across the page.
              </p>
              <p>
                Those are editorial goals. We do not treat a title or
                description as a shortcut to an AI citation.
              </p>
              <div className={styles.note}>
                <strong>Keep the claim smaller than the evidence.</strong>
                <p>
                  Google says its AI search features do not require special
                  optimization. Helpful content, technical eligibility, and
                  established SEO practices still matter.
                </p>
              </div>
              <p>
                The prompts ask for recognizable topics and supported details.
                They do not calculate citation chances, promise visibility, or
                certify content as “AI optimized.”
              </p>
              <p>
                For broader page checks, use our{" "}
                <Link href="/tools/on-page-ai-seo-analyzer">
                  On-page AI SEO Analyzer
                </Link>
                . Metadata is only one part of that review.
              </p>
              <p className={styles.source}>
                Reference:{" "}
                <a href="https://developers.google.com/search/docs/appearance/ai-features">
                  Google’s guidance on AI features and your website
                </a>
                .
              </p>
            </EditorialSection>
            <EditorialSection
              id="how-to-use"
              kicker="A LITTLE PREPARATION SAVES REWRITING"
              title="How to use the prompt collection"
            >
              <div className={styles.steps}>
                {[
                  [
                    "Bring the source",
                    "Paste the relevant page content or an accurate summary. A URL alone may not give your assistant access to the page.",
                  ],
                  [
                    "Choose the right step",
                    "Start with the brief for a new page. Jump to the pair review if you already have a title and description.",
                  ],
                  [
                    "Update the context",
                    "After choosing a draft title, put it in the current title field. Do the same for the description before reviewing the pair.",
                  ],
                  [
                    "Review and preview",
                    "Check the facts, then inspect the title and description together in a search preview.",
                  ],
                ].map(([title, text], i) => (
                  <div key={title}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p>
                You do not have to run all nine prompts. Each carries its own
                page context, so you can use it in a fresh conversation.
              </p>
              <p>
                Opening ChatGPT does not run a check on your live site. Review
                the message and supply any missing inputs before sending it.
              </p>
            </EditorialSection>
            <EditorialSection
              id="prompts"
              kicker="COPY, CUSTOMIZE, AND REVIEW"
              title="Nine ChatGPT prompts for your metadata workflow"
            >
              <p>
                Use the optional context fields once, then choose the prompt
                that fits your current task. Missing inputs remain visible as
                placeholders.
              </p>
              <PromptSeries />
            </EditorialSection>
            <EditorialSection
              id="worked-example"
              kicker="WHY THE WORDING CHANGES"
              title="From a broad promise to a specific pair"
            >
              <p>
                This fictional example uses a guide about image alt text. It
                contains product and chart examples, plus advice about
                decorative images.
              </p>
              <div className={styles.comparison}>
                <div>
                  <span className={styles.before}>BEFORE</span>
                  <h3>The Ultimate Image SEO Guide</h3>
                  <p>
                    Learn the best secrets to rank every image first with
                    amazing SEO strategies.
                  </p>
                  <ul>
                    <li>
                      The title promises a broader subject than the page covers.
                    </li>
                    <li>
                      The description adds an unsupported ranking promise.
                    </li>
                  </ul>
                </div>
                <div>
                  <span className={styles.afterBadge}>
                    A MORE ACCURATE DRAFT
                  </span>
                  <h3>How to Write Image Alt Text, With Examples</h3>
                  <p>
                    Write useful image alt text with examples for product images
                    and charts. Learn how to handle decorative images, too.
                  </p>
                  <ul>
                    <li>The topic matches the supplied page.</li>
                    <li>
                      The description names details readers can actually find.
                    </li>
                  </ul>
                </div>
              </div>
              <p>
                This is an editorial illustration, not a recorded ChatGPT
                response or a measured performance result.
              </p>
              <div className={styles.previewFigure}>
                <div>
                  <span className={styles.favicon}>E</span>
                  <div>
                    <strong>Example Studio</strong>
                    <small>example.com / image-alt-text</small>
                  </div>
                </div>
                <p className={styles.searchTitle}>
                  How to Write Image Alt Text, With Examples
                </p>
                <p>
                  Write useful image alt text with examples for product images
                  and charts. Learn how to handle decorative images, too.
                </p>
                <small>
                  Illustrative desktop preview. Search appearance varies.
                </small>
              </div>
              <p>
                Character counts are useful editing checks, but letters have
                different widths. Google truncates title links and snippets as
                needed for the display.
              </p>
              <p>
                Use a pixel preview as a practical check. Neither a character
                target nor a pixel target guarantees the exact wording Google
                will show.
              </p>
            </EditorialSection>
            <EditorialSection
              id="tools-and-guides"
              kicker="THE THREE-PART WORKFLOW"
              title="Prompts for thinking. Tools for checking. Guides for depth."
            >
              <p>
                Use the prompts when you want to control the instructions. Use
                our generators when you prefer a guided input form and
                ready-to-compare options.
              </p>
              <div className={styles.resourceGrid}>
                <div>
                  <p className={styles.kicker}>WRITE AND COMPARE</p>
                  <h3>Meta Title Generator</h3>
                  <p>
                    Create alternatives and inspect the wording before choosing
                    a title.
                  </p>
                  <Link
                    className={styles.resourcePrimary}
                    href="/tools/meta-title-generator"
                  >
                    Open title generator <ArrowUpRight size={16} />
                  </Link>
                  <Link href="/ai-seo/meta-title">
                    Read the full meta title guide
                  </Link>
                </div>
                <div>
                  <p className={styles.kicker}>EXPLAIN THE VALUE</p>
                  <h3>Meta Description Generator</h3>
                  <p>
                    Draft page-specific summaries and compare different
                    supported angles.
                  </p>
                  <Link
                    className={styles.resourcePrimary}
                    href="/tools/meta-description-generator"
                  >
                    Open description generator <ArrowUpRight size={16} />
                  </Link>
                  <Link href="/ai-seo/meta-description">
                    Read the full description guide
                  </Link>
                </div>
              </div>
              <div className={styles.toolBand}>
                <Image
                  src="/Png-Logo-of-Do-it-with-ai-tools.png"
                  width={48}
                  height={48}
                  alt=""
                />
                <div>
                  <h3>Check the pair in a search preview</h3>
                  <p>
                    Inspect the wording and display width together before
                    publishing.
                  </p>
                </div>
                <Link href="/tools/serp-rich-result-preview-generator">
                  Open SERP Simulator <ArrowUpRight size={16} />
                </Link>
              </div>
            </EditorialSection>
            <EditorialSection
              id="final-checks"
              kicker="KEEP THE FINAL DECISION HUMAN"
              title="A short review before publishing"
            >
              <ul className={styles.checks}>
                {[
                  "The title and description describe this page, not a broader topic.",
                  "Examples, numbers, and benefits are supported by the content.",
                  "The primary topic reads naturally without repeated keywords.",
                  "The description adds useful detail instead of repeating the title.",
                  "Important qualifications remain intact after editing.",
                  "The full title includes any suffix your website adds.",
                  "You have checked the preview and saved the metadata in your website editor.",
                ].map((t) => (
                  <li key={t}>
                    <Check size={17} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <p>
                If a draft fails the factual check, fix that before shortening
                it. Clear wording cannot compensate for a misleading promise.
              </p>
            </EditorialSection>
            <EditorialSection id="questions" title="Questions before you copy">
              <div className={styles.faq}>
                {[
                  [
                    "Can I use these prompts without a paid ChatGPT plan?",
                    "These are text instructions you can paste into an available ChatGPT conversation. Account access, features, and usage limits depend on your plan.",
                  ],
                  [
                    "Should I paste a URL or the actual content?",
                    "Use the relevant text or a reliable summary. A URL alone does not establish that ChatGPT can access and read the page.",
                  ],
                  [
                    "Will these prompts improve AI citations?",
                    "We do not claim that. The prompts focus on clear topics, factual scope, and consistent metadata. Citation decisions depend on the wider page and search system.",
                  ],
                  [
                    "Do I need a fixed number of characters?",
                    "Treat length targets as editing aids. Display width varies, and search systems can rewrite the visible title or snippet.",
                  ],
                  [
                    "Why does Use in ChatGPT sometimes need manual pasting?",
                    "Sign-in state and browser behavior can affect prefilling. Copy prompt remains available so you can paste the same instructions yourself.",
                  ],
                ].map(([q, a]) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </EditorialSection>
            <section className={styles.closing}>
              <p className={styles.kicker}>KEEP THE WORK CONNECTED</p>
              <h2>Build a title-description pair you can stand behind.</h2>
              <p>
                Start with real content, compare useful options, and check the
                promise before publishing.
              </p>
              <Link href="/prompts">
                Back to the prompt library <ArrowUpRight size={17} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
