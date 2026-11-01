import React from "react";
import Image from "next/image";
import Link from "next/link";
import InfographicVizPromptLibrary, {
  infographicVizPromoGuides,
} from "./InfographicVizPromptLibrary";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const infographicVizFaqs = [
  [
    "How many words should each node in an infographic contain?",
    "Keep each infographic node to a 3-to-5 word bold title, a 12-to-15 word action description, and a 2-to-4 word metric or rule badge. If a node exceeds 20 words, it turns into a dense paragraph that mobile readers skip (Prompts 1–10).",
  ],
  [
    "How do I choose between a Bar Chart, Line Chart, Donut Chart, and 2×2 Matrix?",
    "Use a Horizontal Ranked Bar Chart when comparing 5+ categories with long labels; a Line Chart for continuous time-series trends; a Donut Chart only for part-to-whole splits with 5 or fewer slices totaling 100%; and a 2×2 Matrix when evaluating options across two trade-off axes like Impact vs. Effort (Prompts 11–30).",
  ],
  [
    "What is the best aspect ratio and resolution for Pinterest Infographic Pins?",
    "Pinterest's vertical feed is optimized for a 2:3 aspect ratio at `1000×1500` pixels.Pins longer than 1:2.1 may get truncated in the feed. Pair every tall pin with a keyword-focused 100-character title, 350-to-500 character description, and screen-reader alt text (Prompts 41–50).",
  ],
  [
    "How do visual infographics and chart cards help with SEO and AI Search citations?",
    "Original charts, 2×2 matrices, and summary infographics increase human dwell time, earn 'Graphic Guest Post' backlinks when bloggers embed your chart with a credit link, and provide structured `<figcaption>` + `ImageObject` context for search engines (Prompts 69–77).",
  ],
  [
    "Can I render the outputs of these 77 prompts directly into PNG and SVG graphics?",
    "Yes. Every prompt on this page is paired directly with our 5 interactive Visual & Infographic Studios (Blog to Infographic, Data to Chart, 2×2 Matrix & Diagram Builder, Pinterest Tall Pin Studio, and Quote/Testimonial Card Studio) where you can edit text inline and export crisp PNG/SVG files.",
  ],
];

export default function InfographicVizPromptArticle({
  schema,
}: {
  schema: Record<string, unknown>;
}) {
  return (
    <article className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...schema,
            "@graph": [
              ...(schema["@graph"] as unknown[]),
              {
                "@type": "FAQPage",
                mainEntity: infographicVizFaqs.map(([name, text]) => ({
                  "@type": "Question",
                  name,
                  acceptedAnswer: { "@type": "Answer", text },
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300"
        >
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/prompts">Prompt library</Link>
          <span>/</span>
          <span aria-current="page">
            Infographics, data visualization &amp; diagrams
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            77 PROMPTS · EIGHT INFOGRAPHIC, CHART &amp; DIAGRAM WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            77 AI Prompts for Infographics, Data Visualization, Charts &amp;
            Strategy Diagrams
          </h1>
          <p className={body + " max-w-3xl"}>
            Convert long blog posts, raw statistics, and frameworks into 8-node
            visual infographics, Bar/Line/Donut chart cards, 2×2 strategy
            matrices, circular flywheels, `1000×1500` Pinterest pins, and 1-page
            HTML cheat sheets.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/author/sufian-mustafa"
              className="inline-flex min-w-0 items-center gap-3"
            >
              <Image
                src="/prompts/sufian-mustafa-portrait.webp"
                width={48}
                height={48}
                alt="Sufian Mustafa"
                className="!h-12 !w-12 shrink-0 rounded-full object-cover object-[center_25%]"
              />
              <span className="min-w-0 text-sm leading-6">
                <strong className="block">Sufian Mustafa</strong>Founder and
                author · Do It With AI Tools
              </span>
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Published November 1, 2026
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className={button + " bg-[#4058D0] text-white dark:text-white"}
              href="#infographic-viz-prompt-library"
            >
              Explore all 77 prompts
            </a>
            <a className={button} href="#infographic-viz-prompt-brief">
              Customize visual design brief
            </a>
            <Link className={button} href="/tools/blog-to-infographic-generator">
              Open Blog to Infographic Studio
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/infographic-data-visualization-prompts-hero.webp"
            width={1600}
            height={900}
            alt="77 AI prompts for infographics, data visualization charts, 2x2 strategy matrices, and tall Pinterest pins."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Visual content suite: Storyboard 8-node infographics, quantitative
            charts, 2×2 matrices, tall Pinterest pins, and quote cards.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Turn walls of text into scannable, citable visual assets
          </h2>
          <p className={body}>
            The hardest part of creating an infographic, data chart, or 2×2
            strategy diagram is not picking colors—it is distilling 2,000 words
            of prose into crisp 12-word visual nodes, insight-led chart titles,
            and balanced quadrant labels without losing accuracy.
          </p>
          <p className={body}>
            These 77 prompts handle the information architecture first, giving
            you structured node maps, chart tables, and diagram specs that you
            can render immediately inside our 5 interactive Visual &amp;
            Infographic Studios.
          </p>
          <p className={body}>
            <strong>Fast Visual Creation Path:</strong> Start with{" "}
            <a href="#infoviz-prompt-001" className="underline font-semibold">
              Prompt 1 (8-Node Blog Infographic)
            </a>
            , select the right chart geometry with{" "}
            <a href="#infoviz-prompt-011" className="underline font-semibold">
              Prompt 11 (Chart Type Selector)
            </a>
            , map strategic trade-offs with{" "}
            <a href="#infoviz-prompt-021" className="underline font-semibold">
              Prompt 21 (2×2 Impact vs. Effort Matrix)
            </a>{" "}
            and{" "}
            <a href="#infoviz-prompt-031" className="underline font-semibold">
              Prompt 31 (Circular Growth Flywheel)
            </a>
            , and package vertical pins with{" "}
            <a href="#infoviz-prompt-041" className="underline font-semibold">
              Prompt 41 (1000×1500 Tall Pinterest Pin)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard
          guide={infographicVizPromoGuides.blogInfographicStudio}
        />

        {/* 3-Step Visual Design Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three rules of high-clarity information design
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Cut copy to 12 words per node",
                "Every visual box needs one 4-word headline, one 12-word action sentence, and one 3-word metric or rule badge.",
              ],
              [
                "Headline the takeaway, not the axis",
                "Title your chart with the conclusion ('45-Word Passages Earn 2.4x More Citations') rather than a generic label.",
              ],
              [
                "Include methodology & embed code",
                "Add a 1-line source/sample-size footer on the graphic and provide an HTML embed snippet so blogs link back to you.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Rule {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 77-Prompt Workbench */}
        <InfographicVizPromptLibrary />

        {/* Bottom Interactive Visual & Infographic Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>
              Do It With AI Tools · Visual &amp; Infographic Design Studios
            </span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            RENDER &amp; DOWNLOAD YOUR VISUALS IN 1 CLICK
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Open our 5 built-in editable Infographic, Chart &amp; Diagram Studios
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Every prompt above pairs directly with our browser-based visual
            studios—complete with 6 editable templates per studio and crisp
            PNG/SVG export.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              [
                "blog-to-infographic-generator",
                "AI Blog to Infographic Studio",
              ],
              [
                "data-to-chart-visual-card-maker",
                "AI Data to Chart Card Maker",
              ],
              [
                "framework-matrix-diagram-builder",
                "2×2 Matrix, SWOT & Flywheel Studio",
              ],
              [
                "pinterest-pin-visual-generator",
                "1000×1500 Tall Pinterest Pin Studio",
              ],
              [
                "quote-stat-testimonial-card-studio",
                "Quote, Founder Memo & Review Card Studio",
              ],
              ["article-to-html-cheatsheet", "1-Page HTML Cheatsheet Studio"],
              ["blog-to-linkedin-carousel", "LinkedIn Carousel Studio"],
              ["image-alt-text-generator", "Chart & Image Alt Text Generator"],
            ].map(([slug, label]) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                href={`/tools/${slug}`}
                key={slug}
              >
                {label} ↗
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="my-12" aria-labelledby="infoviz-faq-title">
          <h2 id="infoviz-faq-title" className="text-3xl font-bold">
            Infographic, data visualization &amp; diagram prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {infographicVizFaqs.map(([q, a]) => (
              <details
                key={q}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <summary className="cursor-pointer text-lg font-bold">
                  {q}
                </summary>
                <p className={body}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Prompt Guides Mesh */}
        <section className="my-12" aria-labelledby="related-prompts-title">
          <h2 id="related-prompts-title" className="text-3xl font-bold">
            Related prompt guides to continue your workflow
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Link
                href="/prompts/content-repurposing-social-media-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    87 Content Repurposing & Social Media Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Turn every article into channel-native social posts, carousels, Pinterest pins, and visual cards.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/link-building-digital-pr-outreach-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    88 Link Building & Digital PR Outreach Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Pitch your original charts, 2×2 matrices, and 8-node infographics for editorial backlinks.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/linkedin-personal-branding-b2b-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    83 LinkedIn Personal Branding & Carousel Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Pair your visual diagrams and Founder Memo cards with 140-character mobile fold hooks.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/on-page-seo-content-writing-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    84 On-Page SEO, Headings & E-E-A-T Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Embed summary infographics, comparison tables, and WCAG alt text inside ranking articles.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#infographic-viz-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#infographic-viz-prompt-library">
            Return to prompt library ↑
          </a>
          <Link className={button} href="/prompts">
            Browse all 13 prompt guides →
          </Link>
        </div>
      </div>
    </article>
  );
}
