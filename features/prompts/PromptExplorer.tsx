"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  FileText,
  ScanLine,
  PenLine,
  Mail,
  Sparkles,
} from "lucide-react";
import { filterPreviews, promptCategories, type CategoryId } from "./catalog";
import styles from "./prompts.module.css";
import { promptDetails, promptPath, publishedPrompts } from "./details";

export default function PromptExplorer() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const results = filterPreviews(category, query, publishedPrompts);
  const categoryName = promptCategories.find(
    (item) => item.id === category,
  )?.name;
  function reset() {
    setCategory("all");
    setQuery("");
  }
  return (
    <section
      id="prompt-library"
      className={styles.library}
      aria-labelledby="library-heading"
    >
      <div className={styles.libraryIntro}>
        <div>
          <p className={styles.eyebrow}>FIND YOUR NEXT WORKFLOW</p>
          <h2 id="library-heading">The prompt library</h2>
        </div>
        <span className={styles.previewPill}>Practical prompt guides</span>
      </div>
      <div className={styles.libraryLayout}>
        <aside className={styles.sidebar} aria-label="Prompt categories">
          <p className={styles.sidebarLabel}>BROWSE BY TASK</p>
          <div className={styles.categoryList}>
            {promptCategories.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCategory(item.id);
                }}
                aria-pressed={category === item.id}
                className={
                  category === item.id ? styles.categoryActive : styles.category
                }
                data-tone={item.id}
              >
                <span className={styles.categoryDot} aria-hidden="true" />
                <span>{item.name}</span>
                <small>
                  {item.id === "all"
                    ? publishedPrompts.length
                    : publishedPrompts.filter((p) => p.category === item.id)
                        .length}
                </small>
              </button>
            ))}
          </div>
          <div className={styles.sidebarNote}>
            <span aria-hidden="true">✦</span>
            <strong>Bring your expertise.</strong>
            <p>
              Use a prompt to support your thinking. Keep the final judgment
              yours.
            </p>
            <Link href="/tools">
              Pair it with a tool <ArrowUpRight size={14} />
            </Link>
          </div>
        </aside>
        <div className={styles.results}>
          <div className={styles.searchBar}>
            <Search size={20} aria-hidden="true" />
            <label htmlFor="prompt-search" className={styles.srOnly}>
              Search prompt guides
            </label>
            <input
              id="prompt-search"
              type="search"
              maxLength={160}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search meta titles, descriptions, or page types…"
            />
            {query ? (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={18} />
              </button>
            ) : null}
          </div>
          <div className={styles.resultsMeta}>
            <h3>{categoryName}</h3>
            <p aria-live="polite">
              {results.length} {results.length === 1 ? "workflow" : "workflows"}
            </p>
          </div>
          <p className={styles.previewNotice}>
            Open a guide to customize its prompts, copy them, and review your
            results with a practical checklist.
          </p>
          <div className={styles.cardGrid}>
            {results.map((prompt) => {
              const detail = promptDetails[prompt.id];
              const cover = detail.cover;
              return (
                <article
                  className={styles.card}
                  key={prompt.id}
                  data-tone={prompt.category}
                  data-cover={cover ? "image" : "illustration"}
                  data-status="published"
                >
                  <div className={styles.cardCover}>
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        width={cover.width}
                        height={cover.height}
                        sizes="(max-width: 540px) 100vw, 420px"
                      />
                    ) : (
                      <>
                        <div className={styles.coverIcon}>
                          {prompt.category === "technical" ? (
                            <ScanLine size={28} />
                          ) : prompt.category === "content" ? (
                            <PenLine size={28} />
                          ) : prompt.category === "off-page" ? (
                            <Mail size={28} />
                          ) : prompt.category === "ai-search" ? (
                            <Sparkles size={28} />
                          ) : prompt.category === "keywords" ? (
                            <Search size={28} />
                          ) : (
                            <FileText size={28} />
                          )}
                        </div>
                        <span className={styles.coverLabel}>
                          {
                            promptCategories.find(
                              (c) => c.id === prompt.category,
                            )?.name
                          }
                        </span>
                        <span className={styles.coverCaption}>
                          Practical prompt workflow
                        </span>
                      </>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.topic}>
                        {
                          promptCategories.find((c) => c.id === prompt.category)
                            ?.name
                        }
                      </span>
                      <span className={styles.sampleLabel}>FIELD GUIDE</span>
                    </div>
                    <h4>
                      <Link href={promptPath(prompt.id)}>{prompt.title}</Link>
                    </h4>
                    <p>{prompt.description}</p>
                    <p className={styles.cardFormat}>
                      {detail.promptCount
                        ? `${detail.promptCount} copyable prompts · `
                        : ""}
                      Article guide
                    </p>
                    <div className={styles.outcome}>
                      <span>WHAT YOU’LL WORK TOWARD</span>
                      <p>{prompt.outcome}</p>
                    </div>
                    <div className={styles.tags}>
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <Link
                      className={styles.cardAction}
                      href={promptPath(prompt.id)}
                      aria-label={`Read the guide: ${prompt.title}`}
                    >
                      Read the guide <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {!results.length ? (
            <div className={styles.empty}>
              <Search size={30} aria-hidden="true" />
              <h3>
                {query.trim()
                  ? "No matching guides"
                  : "No published guides in this category yet"}
              </h3>
              <p>Browse all published guides or try another search.</p>
              <button onClick={reset} className={styles.primary}>
                Show all guides
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
