import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import type { HomeArticle } from "./data";
import { articlePath, articleCategory } from "./article-path";
export { default as HomeWorkflows } from "./HomeJourney";
export function HomeLearning({ articles }: { articles: HomeArticle[] }) {
  return (
    <section
      id="learning"
      aria-labelledby="learning-title"
      className="home-section bg-white dark:bg-[#111827]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Learn the process behind the output</p>
            <h2 id="learning-title" className="home-title">
              Make better decisions about your SEO and content
            </h2>
            <p className="home-description">
              Read practical guides with examples, prompts, and review steps
              you can apply to your own website or client work.
            </p>
          </div>
          <Link className="home-text-link shrink-0" href="/ai-seo">
            Explore SEO with AI <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        {articles.length ? (
          <div className="home-learning-grid">
            {articles.map((a) => (
              <article key={a._id} className="home-learning-card">
                <Link
                  tabIndex={-1}
                  aria-hidden
                  href={articlePath(a)}
                  className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  <BookOpen
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[#5271ff]/50"
                  />
                  {a.image ? (
                    <Image
                      src={`${a.image}?w=640&h=400&fit=crop&auto=format`}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="object-cover transition duration-300 motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <BookOpen className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[#5271ff]" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="home-eyebrow text-xs">
                    {articleCategory(a)}
                    {articles[0]._id === a._id ? " / Featured" : ""}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
                    <Link
                      className="home-focus hover:text-[#5271ff]"
                      href={articlePath(a)}
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {a.overview ||
                      "Explore the steps, examples, and practical choices behind this topic."}
                  </p>
                  <Link
                    href={articlePath(a)}
                    className="home-text-link mt-auto pt-5"
                  >
                    Read guide <ArrowRight aria-hidden className="h-4 w-4" />
                    <span className="sr-only">: {a.title}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="home-fallback">
            <BookOpen aria-hidden className="h-7 w-7 text-[#5271ff]" />
            <p>Explore our learning hub for practical articles and examples.</p>
            <Link href="/ai-seo" className="home-text-link">
              Visit the learning hub{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        )}
        <Link className="home-text-link mt-7" href="/blogs">
          Browse all articles <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
export function HomeFounder() {
  return (
    <section
      aria-labelledby="founder-title"
      className="home-section bg-white dark:bg-[#111827]"
    >
      <div className="home-shell">
        <div className="home-founder-editorial">
          <div className="home-founder-portrait">
            <Image
              src="/images/founder/sufian-mustafa.webp"
              alt="Sufian Mustafa, founder of Do It With AI Tools"
              width={360}
              height={360}
              sizes="(max-width: 767px) 160px, 180px"
            />
          </div>
          <div className="max-w-3xl">
            <p className="home-eyebrow">Human judgment, AI assistance</p>
            <h2 id="founder-title" className="home-title">
              Built by someone who puts AI to work
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              I’m Sufian Mustafa, founder of Do It With AI Tools, a developer
              and marketer working with SEO and content.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              I build practical tools and share guidance that combines AI
              assistance with careful review and clear explanations.
            </p>
            <Link href="/author/sufian-mustafa" className="home-text-link mt-5">
              Meet the founder <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function HomeClosing() {
  return (
    <section
      aria-labelledby="closing-title"
      className="home-section bg-white pt-0 dark:bg-[#111827]"
    >
      <div className="home-shell">
        <div className="mb-12 rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-[#161F30] sm:p-8">
          <p className="home-eyebrow">Practical AI across your workflow</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Where AI helps in SEO, content writing, and social media—and what you still review
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            AI can speed up repetitive marketing tasks, from grouping keyword lists and drafting metadata to repurposing blog posts for social channels. Your experience and verification turn those drafts into publishable work.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SEO &amp; keyword research
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                Use AI to group related keywords, classify search intent, inspect on-page headings, and draft JSON-LD schema—then verify live search results and real site facts.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Content writing &amp; editing
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                Let AI help structure article outlines, compare title and meta description angles, and simplify dense sentences while you supply original examples and accuracy checks.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Social media &amp; visual assets
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                Turn finished articles into LinkedIn posts, short-form video scripts, and visual infographics faster, keeping your brand tone and claims consistent across formats.
              </p>
            </div>
          </div>
        </div>
        <div className="home-closing-banner">
          <Sparkles
            aria-hidden
            className="home-closing-spark h-8 w-8 text-blue-200"
          />
          <h2
            id="closing-title"
            className="text-3xl font-bold leading-tight sm:text-4xl"
          >
            Put your next content task into motion
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white">
            Choose an SEO tool, follow a useful guide, or find a free resource
            to support the work ahead.
          </p>
          <div className="home-closing-actions">
            <Link className="home-closing-primary" href="/tools">
              Explore tools <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link className="home-closing-secondary" href="/ai-seo">
              Read guides
            </Link>
            <Link className="home-closing-secondary" href="/free-ai-resources">
              Find resources
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
