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
            <p className="home-eyebrow">Learn how to use AI well</p>
            <h2 id="learning-title" className="home-title">
              Build skills you can put into practice
            </h2>
            <p className="home-description">
              Read step-by-step guides on AI, SEO, and digital marketing, with
              examples that help you apply what you learn.
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
          <div className="home-founder-emblem" aria-hidden>
            <Image
              src="/icons/apple-touch-icon.png"
              alt=""
              width={64}
              height={64}
            />
          </div>
          <div className="max-w-3xl">
            <p className="home-eyebrow">Human judgment, AI assistance</p>
            <h2 id="founder-title" className="home-title">
              Built by someone who puts AI to work
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              I’m Sufian Mustafa, the founder of Do It With AI Tools, sharing
              tools and guidance shaped by my work in development, SEO, and
              content.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              My approach combines AI assistance with human judgment, with a
              focus on clear guidance and useful results.
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
        <div className="home-closing-banner">
          <Sparkles
            aria-hidden
            className="home-closing-spark h-8 w-8 text-blue-200"
          />
          <h2
            id="closing-title"
            className="text-3xl font-bold leading-tight sm:text-4xl"
          >
            Keep learning what you can do with AI
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white">
            Explore more tools, follow a practical guide, or find a free
            resource for your next project.
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
