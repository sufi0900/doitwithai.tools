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
const title =
  "960+ AI & ChatGPT Prompts for SEO, Content, Video & Infographics | Do It With AI Tools";
const description =
  "Explore 13 interactive ChatGPT & AI prompt libraries (967+ copyable prompts) for keyword research, topic clustering, on-page SEO, technical SEO, local GBP, AI search (AEO/GEO), link building, YouTube scripts, LinkedIn B2B, and infographics.";
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
    title: "Choose your exact workflow",
    text: "Pick a dedicated prompt library—from 100 Keyword Research or 94 Topic Clustering prompts to 91 AI Search (AEO/GEO), 79 Local SEO, or 77 Infographic prompts.",
  },
  {
    icon: SlidersHorizontal,
    title: "Customize the shared brief once",
    text: "Fill in your topic, audience, and verified proof at the top of any guide to pre-fill every prompt on the page automatically.",
  },
  {
    icon: Layers3,
    title: "Pair with our 90 interactive studios",
    text: "Copy your customized prompt into ChatGPT or click straight into the companion SEO, Content, or Visual Infographic studio on every card.",
  },
];
export default function PromptsPage() {
  const totalPromptCount = publishedPrompts.reduce(
    (sum, p) => sum + (promptDetails[p.id]?.promptCount || 1),
    0,
  );
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
        name: "Published SEO, content, video, and infographic prompt guides",
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
              <span /> THE PROMPT WORKBENCH · {totalPromptCount} COPYABLE PROMPTS
            </p>
            <h1>
              AI prompts for SEO,
              <br />
              <span>content &amp; visuals.</span>
            </h1>
            <p className={styles.lead}>
              Explore {publishedPrompts.length} interactive prompt libraries (
              {totalPromptCount} copy-paste prompts) built for SEO, AEO/GEO,
              local businesses, video scripts, LinkedIn B2B, and visual
              infographics.
            </p>
            <div className={styles.heroActions}>
              <a href="#prompt-library" className={styles.primary}>
                Explore all {publishedPrompts.length} prompt guides{" "}
                <ArrowUpRight size={18} />
              </a>
              <Link href="/tools" className={styles.textLink}>
                Browse all 90 studio tools <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className={styles.heroNote}>
              {publishedPrompts.length} published guides · {totalPromptCount}{" "}
              customizable prompts · Paired with 90 interactive tools
            </p>
          </div>
          <div
            className={styles.heroVisual}
            aria-label="A prompt workflow starts with context and ends with a reviewed result"
          >
            <div className={styles.visualTop}>
              <span>YOUR INTERACTIVE WORKBENCH</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className={styles.visualLine}>
              <span>01</span>
              <div>
                <small>SHARED BRIEF</small>
                <strong>Enter your context once at the top.</strong>
              </div>
            </div>
            <div className={styles.visualLine}>
              <span>02</span>
              <div>
                <small>TASK SPECIFICITY</small>
                <strong>Pick from {totalPromptCount} specialized prompts.</strong>
              </div>
            </div>
            <div className={styles.visualResult}>
              <span aria-hidden="true">✦</span>
              <div>
                <small>COMPANION STUDIO</small>
                <strong>Run directly in our 90 SEO &amp; visual tools.</strong>
              </div>
            </div>
            <div className={styles.visualBottom}>
              <span>Context → Prompt → Companion Studio → Human review</span>
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
              passage. Use our 90 dedicated tools to inspect pages, validate
              schema, and export visual infographics.
            </p>
            <p>
              Every prompt card includes a 1-click button to open the matching
              SEO, Content Conversion, or Visual Infographic studio.
            </p>
            <div className={styles.relatedLinks}>
              <Link href="/tools/on-page-ai-seo-analyzer">
                Audit a page <ArrowUpRight size={16} />
              </Link>
              <Link href="/tools/blog-to-infographic-generator">
                Blog to Infographic Studio <ArrowUpRight size={16} />
              </Link>
              <Link href="/tools">
                Explore all 90 tools <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className={styles.faq}>
            <h2>Prompt library FAQs</h2>
            <details>
              <summary>Which prompt guides are available?</summary>
              <p>
                We publish 13 interactive prompt libraries covering Keyword
                Research (100), Topic Clustering (94), YouTube &amp; Shorts
                Scripts (93), AI Search / AEO / GEO (91), Link Building &amp;
                Digital PR (88), Content Repurposing (87), On-Page SEO &amp;
                E-E-A-T (84), LinkedIn B2B Branding (83), Local SEO &amp; GBP
                (79), Infographics &amp; Data Visualization (77), Technical SEO
                &amp; Schema (76), Meta Titles (9), and Search Intent (6).
              </p>
            </details>
            <details>
              <summary>How does the shared brief customizer work?</summary>
              <p>
                Each prompt guide includes a shared brief at the top of the
                page. Fill in your topic, audience, and evidence once to
                automatically update every prompt on that page, then copy or
                open any prompt directly in ChatGPT.
              </p>
            </details>
            <details>
              <summary>Can a prompt guarantee better rankings?</summary>
              <p>
                No. Prompts accelerate outlining, auditing, schema generation,
                and editing, but rankings depend on real first-hand evidence,
                technical health, and human editorial review.
              </p>
            </details>
            <details>
              <summary>Are all 967+ prompts free to customize and download?</summary>
              <p>
                Yes. Every guide is 100% free to browse, customize in your
                browser, copy, or download as a complete `.TXT` swipe file with
                no sign-in required.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
