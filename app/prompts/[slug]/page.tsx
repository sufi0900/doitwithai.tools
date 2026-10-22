import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import PromptBuilder from "@/features/prompts/PromptBuilder";
import { promptPreviews, promptCategories } from "@/features/prompts/catalog";
import {
  findPromptDetail,
  promptDetails,
  promptPath,
} from "@/features/prompts/details";
import styles from "@/features/prompts/prompts.module.css";
const origin = "https://doitwithai.tools";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(promptDetails).map((detail) => ({ slug: detail.slug }));
}
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const item = findPromptDetail(params.slug);
  if (!item) return {};
  const { detail, prompt } = item;
  return {
    metadataBase: new URL(origin),
    title: `${detail.title} | Do It With AI Tools`,
    description: prompt.description,
    alternates: { canonical: `${origin}${promptPath(prompt.id)}` },
    robots: { index: detail.ready, follow: true },
    openGraph: {
      title: detail.title,
      description: prompt.description,
      url: `${origin}${promptPath(prompt.id)}`,
      type: detail.ready ? "article" : "website",
      images: [
        {
          url: "/prompts/opengraph-image",
          width: 1200,
          height: 630,
          alt: "SEO and content writing prompts",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: detail.title,
      description: prompt.description,
      images: ["/prompts/opengraph-image"],
    },
  };
}
export default function PromptDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = findPromptDetail(params.slug);
  if (!item) notFound();
  const { prompt, detail } = item;
  const category = promptCategories.find((c) => c.id === prompt.category);
  const url = `${origin}${promptPath(prompt.id)}`;
  const related = promptPreviews
    .filter((p) => p.id !== prompt.id)
    .sort(
      (a, b) =>
        Number(b.category === prompt.category) -
        Number(a.category === prompt.category),
    )
    .slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: "AI prompts",
            item: `${origin}/prompts`,
          },
          { "@type": "ListItem", position: 3, name: detail.title, item: url },
        ],
      },
      ...(detail.ready
        ? [
            {
              "@type": "Article",
              headline: detail.title,
              description: prompt.description,
              url,
              mainEntityOfPage: url,
              author: {
                "@type": "Person",
                name: "Sufian Mustafa",
                url: `${origin}/author/sufian-mustafa`,
              },
            },
          ]
        : []),
    ],
  };
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className={styles.wrap}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/prompts">Prompts</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{prompt.title}</span>
        </nav>
        {!detail.ready ? (
          <p className={styles.previewNotice}>
            <strong>Design preview.</strong> This sample is not a finished
            guide. The full guide is being prepared.
          </p>
        ) : null}
        <header className={styles.detailHero}>
          <div>
            <p className={styles.eyebrow}>{category?.name} · PROMPT WORKFLOW</p>
            <h1>{detail.title}</h1>
            <p className={styles.lead}>{detail.overview}</p>
            <div className={styles.heroActions}>
              <a href="#customize" className={styles.primary}>
                Customize the prompt <ArrowUpRight size={16} />
              </a>
              <a href="#worked-example" className={styles.textLink}>
                See the example
              </a>
            </div>
            <p className={styles.heroNote}>
              {detail.ready
                ? "By Sufian Mustafa · Includes an illustrative example"
                : "Upcoming guide preview · Illustrative example"}
            </p>
          </div>
          <aside className={styles.detailOutcome}>
            <span className={styles.eyebrow}>YOUR WORKING RESULT</span>
            <h2>{prompt.outcome}</h2>
            <p>
              Bring your context. Compare the output. Keep the final decision
              yours.
            </p>
            <div className={styles.tags}>
              {prompt.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </header>
        <nav className={styles.detailNav} aria-label="On this page">
          <a href="#customize">Prompt builder</a>
          <a href="#steps">How to use it</a>
          <a href="#worked-example">Worked example</a>
          <a href="#review">Review checklist</a>
        </nav>
        <section id="customize" className={styles.detailSection}>
          <p className={styles.eyebrow}>THE WORKBENCH</p>
          <h2>Make the prompt fit your task</h2>
          <p>
            Fill in your details, or load the example to see how the inputs
            shape the instructions.
          </p>
          <div className={styles.workspace}>
            <PromptBuilder prompt={prompt} example={detail.example} />
          </div>
        </section>
        <div className={styles.detailColumns}>
          <article>
            <section id="steps" className={styles.detailSection}>
              <p className={styles.eyebrow}>FROM CONTEXT TO A USEFUL DRAFT</p>
              <h2>How to use this workflow</h2>
              <ol className={styles.detailSteps}>
                {detail.steps.map((step, i) => (
                  <li key={step}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section id="worked-example" className={styles.detailSection}>
              <p className={styles.eyebrow}>AN ILLUSTRATIVE EXAMPLE</p>
              <h2>See the input and a possible result</h2>
              <p>
                This example explains the workflow. It is not a recorded model
                test or a promise of identical output.
              </p>
              <dl className={styles.exampleInputs}>
                {Object.entries(detail.example).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.exampleOutput}>
                <h3>A possible result</h3>
                <p>{detail.output}</p>
              </div>
              <p>{detail.exampleNote}</p>
            </section>
            {detail.ready ? (
              <section className={styles.detailSection}>
                <h2>When the first title is not right</h2>
                <p>
                  A polished title can still miss the page’s purpose. Compare
                  each option with the page summary before changing its wording.
                </p>
                <p>
                  If every option feels generic, add the specific example,
                  method, or audience that makes your page useful.
                </p>
                <div className={styles.exampleOutput}>
                  <h3>A follow-up prompt</h3>
                  <p>
                    Review this title against the page summary above: [paste
                    title]. Identify vague wording, unsupported claims, and
                    missing context. Suggest two clearer alternatives using only
                    the supplied facts. Explain what each revision changes.
                  </p>
                </div>
                <p>
                  Keep the same conversation so your assistant has the original
                  context. Ask for a factual correction before asking for more
                  creative wording.
                </p>
                <h3>Check meaning before length</h3>
                <p>
                  Character counts help compare options, but letters occupy
                  different widths. A short-looking title can still take more
                  display space than expected.
                </p>
                <p>
                  Use the SERP Simulator to inspect the result. Search displays
                  vary, and Google may show a different title for a query.
                </p>
                <Link
                  className={styles.textLink}
                  href="/tools/serp-rich-result-preview-generator"
                >
                  Preview the title in SERP Simulator <ArrowUpRight size={16} />
                </Link>
                <p>
                  <a href="https://developers.google.com/search/docs/appearance/title-link">
                    Read Google’s guidance on title links
                  </a>
                </p>
              </section>
            ) : null}
            <section className={styles.detailSection}>
              <h2>Common mistakes to avoid</h2>
              <ul className={styles.detailList}>
                {detail.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
          </article>
          <aside id="review" className={styles.reviewAside}>
            <div className={styles.detailOutcome}>
              <p className={styles.eyebrow}>BEFORE YOU PUBLISH</p>
              <h2>Review the result</h2>
              <ul className={styles.reviewList}>
                {prompt.checks.map((check) => (
                  <li key={check}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {check}
                  </li>
                ))}
              </ul>
              <Link className={styles.primary} href={prompt.tool.href}>
                {prompt.tool.name}
                <ArrowUpRight size={16} />
              </Link>
              <p className={styles.heroNote}>
                Check the output against your real content. A prompt cannot
                guarantee rankings.
              </p>
            </div>
          </aside>
        </div>
        <section className={styles.detailSection}>
          <div className={styles.sectionHeading}>
            <h2>Keep building your workflow</h2>
            <Link className={styles.textLink} href="/prompts">
              <ArrowLeft size={16} />
              All prompt workflows
            </Link>
          </div>
          <div className={styles.stepGrid}>
            {related.map((p) => (
              <article key={p.id}>
                <p className={styles.eyebrow}>
                  {promptDetails[p.id].ready
                    ? "PROMPT GUIDE"
                    : "UPCOMING GUIDE PREVIEW"}
                </p>
                <h3>
                  <Link href={promptPath(p.id)}>{p.title}</Link>
                </h3>
                <p>{p.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
