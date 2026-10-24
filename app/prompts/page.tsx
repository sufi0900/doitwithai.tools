import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Layers3,
  SlidersHorizontal,
} from "lucide-react";
import PromptExplorer from "@/features/prompts/PromptExplorer";
import {
  publishedPrompts,
  promptDetails,
  promptPath,
} from "@/features/prompts/details";
import styles from "@/features/prompts/prompts.module.css";

const origin = "https://doitwithai.tools";
const title = "AI Prompts for SEO & Content Writing | Do It With AI Tools";
const description =
  "Explore our SEO and content prompt library. Use nine customizable ChatGPT prompts to draft, compare, and improve meta titles and descriptions.";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title,
  description,
  alternates: { canonical: `${origin}/prompts` },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: `${origin}/prompts`, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};
const steps = [
  {
    icon: Compass,
    title: "Start with the task",
    text: "Choose a prompt for drafting, comparing, or refining your meta title and description.",
  },
  {
    icon: SlidersHorizontal,
    title: "Add your context",
    text: "Replace the input fields with your topic, audience, and source material. Specific inputs make the task clearer.",
  },
  {
    icon: Layers3,
    title: "Review before you publish",
    text: "Use the checklist, check the facts, and compare the result with your original goal.",
  },
];
export default function PromptsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${origin}/prompts#page`,
        url: `${origin}/prompts`,
        name: title,
        description,
        mainEntity: { "@id": `${origin}/prompts#guides` },
        isPartOf: {
          "@type": "WebSite",
          name: "Do It With AI Tools",
          url: origin,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/prompts#guides`,
        name: "Published SEO prompt guides",
        numberOfItems: publishedPrompts.length,
        itemListElement: publishedPrompts.map((prompt, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: promptDetails[prompt.id].title,
          url: `${origin}${promptPath(prompt.id)}`,
        })),
      },
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
        ],
      },
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
          <span aria-current="page">Prompt library</span>
        </nav>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> THE PROMPT WORKBENCH
            </p>
            <h1>
              AI prompts for SEO
              <br />
              <span>and content writing.</span>
            </h1>
            <p className={styles.lead}>
              AI prompts for SEO and content writing, organized around the work
              you actually need to do.
            </p>
            <div className={styles.heroActions}>
              <a href="#prompt-library" className={styles.primary}>
                Explore the workflows <ArrowUpRight size={18} />
              </a>
              <Link href="/tools" className={styles.textLink}>
                Looking for a tool? <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className={styles.heroNote}>
              {publishedPrompts.length} published{" "}
              {publishedPrompts.length === 1 ? "guide" : "guides"} · Customize,
              copy, and review
            </p>
          </div>
          <div
            className={styles.heroVisual}
            aria-label="A prompt workflow starts with context and ends with a reviewed result"
          >
            <div className={styles.visualTop}>
              <span>YOUR NEXT GOOD ANSWER</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className={styles.visualLine}>
              <span>01</span>
              <div>
                <small>THE TASK</small>
                <strong>Make the goal clear.</strong>
              </div>
            </div>
            <div className={styles.visualLine}>
              <span>02</span>
              <div>
                <small>THE CONTEXT</small>
                <strong>Bring your own details.</strong>
              </div>
            </div>
            <div className={styles.visualResult}>
              <span aria-hidden="true">✦</span>
              <div>
                <small>THE RESULT</small>
                <strong>A starting point you can shape.</strong>
              </div>
            </div>
            <div className={styles.visualBottom}>
              <span>Context → Prompt → Human review</span>
              <span aria-hidden="true">● ● ●</span>
            </div>
          </div>
        </header>
        <PromptExplorer />
        <section className={styles.how} aria-labelledby="how-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                A SMALLER GAP BETWEEN IDEA AND ACTION
              </p>
              <h2 id="how-heading">A prompt is the starting point.</h2>
            </div>
            <p>
              Your judgment turns the draft into something useful. Follow a
              simple process, whatever assistant you prefer.
            </p>
          </div>
          <div className={styles.stepGrid}>
            {steps.map(({ icon: Icon, title, text }, i) => (
              <article key={title}>
                <div className={styles.stepTop}>
                  <Icon size={22} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.bottomGrid}>
          <div className={styles.editorial}>
            <p className={styles.eyebrow}>PROMPTS + TOOLS + YOUR EXPERIENCE</p>
            <h2>Build a workflow, not a pile of outputs.</h2>
            <p>
              Use prompts to explore ideas, structure a draft, or review a
              passage. Use dedicated tools to inspect the details.
            </p>
            <p>
              For SEO work, that can mean checking heading order, previewing a
              search snippet, or reviewing a page’s on-page signals.
            </p>
            <div className={styles.relatedLinks}>
              <Link href="/tools/on-page-ai-seo-analyzer">
                Review a page <ArrowUpRight size={16} />
              </Link>
              <Link href="/tools">
                Explore all tools <ArrowUpRight size={16} />
              </Link>
              <Link href="/ai-seo">
                Learn SEO with AI <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className={styles.faq}>
            <h2>A few useful answers</h2>
            <details>
              <summary>Which prompt guides are available?</summary>
              <p>
                Start with our complete meta title and meta description guide.
                It includes nine customizable ChatGPT prompts, a worked example,
                and a review checklist.
              </p>
            </details>
            <details>
              <summary>How do I use a sample prompt?</summary>
              <p>
                Open a workflow page, fill in the context fields, then copy the
                prompt into your preferred AI assistant. Review the result
                yourself.
              </p>
            </details>
            <details>
              <summary>Can a prompt guarantee better rankings?</summary>
              <p>
                No. Prompts can support research, writing, and editing. Rankings
                depend on many factors, and generated claims still need
                checking.
              </p>
            </details>
            <details>
              <summary>Do I need to sign in?</summary>
              <p>
                No sign-in is needed to browse the guides or customize and copy
                their prompts.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
