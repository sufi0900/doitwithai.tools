import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  ListTree,
  FileCheck2,
  ScanText,
  Sparkles,
} from "lucide-react";
import { workflows } from "./content";
import { tools, toolPath } from "@/features/tool-catalog/catalog";
import type { HomeArticle } from "./data";
const icons = [ListTree, FileCheck2, ScanText];
export function HomeWorkflows({
  articles,
}: {
  articles: { title: string; slug: string }[];
}) {
  return (
    <section
      aria-labelledby="workflow-title"
      className="home-section bg-slate-50 dark:bg-[#0D1422]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">From learning to doing</p>
            <h2 id="workflow-title" className="home-title">
              Put tools and guidance together
            </h2>
            <p className="home-description">
              Choose a starting point, follow the guidance, and use the tools
              that fit each stage of your work.
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {workflows.map((w, i) => {
            const Icon = icons[i];
            const primary = tools.find((t) => t.slug === w.primary);
            const guide = articles.find((a) => a.slug === w.guideSlug);
            return (
              <article
                key={w.title}
                className={`home-workflow home-workflow-${w.color}`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="home-workflow-icon">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-snug text-slate-900 dark:text-white">
                  {w.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {w.description}
                </p>
                {primary && (
                  <Link
                    href={toolPath(primary.slug)}
                    className="home-text-link mt-6"
                  >
                    Try {primary.name.toLowerCase()}{" "}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                )}
                <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                  {w.supporting.map((slug) => {
                    const t = tools.find((item) => item.slug === slug);
                    return (
                      t && (
                        <Link
                          className="home-support-link"
                          key={slug}
                          href={toolPath(slug)}
                        >
                          {t.name}
                          <ArrowRight aria-hidden className="h-3 w-3" />
                        </Link>
                      )
                    );
                  })}
                  {guide && (
                    <Link
                      className="home-support-link"
                      href={`/ai-seo/${guide.slug}`}
                    >
                      <BookOpen aria-hidden className="h-3.5 w-3.5 shrink-0" />
                      <span>Read the supporting guide</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
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
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <article key={a._id} className="home-learning-card">
                <Link
                  tabIndex={-1}
                  aria-hidden
                  href={`/ai-seo/${a.slug}`}
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
                  <p className="home-eyebrow text-xs">SEO with AI</p>
                  <h3 className="mt-2 text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
                    <Link
                      className="home-focus hover:text-[#5271ff]"
                      href={`/ai-seo/${a.slug}`}
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {a.overview ||
                      "Explore the steps, examples, and practical choices behind this topic."}
                  </p>
                  <Link
                    href={`/ai-seo/${a.slug}`}
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
        <div className="home-founder-panel">
          <div className="home-founder-mark" aria-hidden>
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
        <div className="home-closing-panel">
          <Sparkles
            aria-hidden
            className="mx-auto mb-5 h-8 w-8 text-blue-200"
          />
          <h2
            id="closing-title"
            className="text-3xl font-bold leading-tight sm:text-4xl"
          >
            Keep learning what you can do with AI
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-blue-100">
            Explore more tools, follow a practical guide, or find a free
            resource for your next project.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
