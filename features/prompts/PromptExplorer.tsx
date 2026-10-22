"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Copy, Search, X } from "lucide-react";
import {
  fillPreview,
  filterPreviews,
  promptCategories,
  promptPreviews,
  type CategoryId,
  type PromptPreview,
} from "./catalog";
import styles from "./prompts.module.css";

function PreviewWorkspace({
  prompt,
  close,
}: {
  prompt: PromptPreview;
  close: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const output = useRef<HTMLTextAreaElement>(null);
  const text = fillPreview(prompt.template, values);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Paste the prompt into your preferred AI assistant.");
    } catch {
      output.current?.focus();
      output.current?.select();
      setMessage(
        "Copy is unavailable here. The prompt is selected for manual copying.",
      );
    }
  }
  return (
    <section className={styles.workspace} aria-labelledby="preview-title">
      <div className={styles.workspaceHeading}>
        <div>
          <p className={styles.eyebrow}>SAMPLE WORKFLOW</p>
          <h3 id="preview-title">{prompt.title}</h3>
          <p>
            This preview shows how future prompts can work. It is not a
            published tutorial.
          </p>
        </div>
        <button
          className={styles.close}
          onClick={close}
          aria-label="Close sample preview"
        >
          <X size={20} />
        </button>
      </div>
      <div className={styles.workspaceGrid}>
        <div className={styles.inputPanel}>
          <h4>1. Make it yours</h4>
          <p>Add context, or leave the placeholders for later.</p>
          {prompt.inputs.map((input) => (
            <label key={input}>
              {input}
              <textarea
                rows={3}
                maxLength={6000}
                value={values[input] || ""}
                placeholder={`Add ${input.toLowerCase()}…`}
                onChange={(e) => {
                  setValues((previous) => ({
                    ...previous,
                    [input]: e.target.value,
                  }));
                  setMessage("");
                }}
              />
            </label>
          ))}
        </div>
        <div className={styles.outputPanel}>
          <div className={styles.outputTitle}>
            <h4>2. Take your prompt</h4>
            <span>Editable inputs · Copy-ready</span>
          </div>
          <label className={styles.srOnly} htmlFor="sample-prompt-output">
            Customized sample prompt
          </label>
          <textarea
            id="sample-prompt-output"
            ref={output}
            readOnly
            value={text}
            rows={12}
            className={styles.promptText}
          />
          <button onClick={copy} className={styles.primary}>
            <Copy size={16} /> Copy sample prompt
          </button>
          <p className={styles.copyStatus} role="status">
            {message || "Unfilled fields stay visible as {{placeholders}}."}
          </p>
          <div className={styles.checklist}>
            <h4>3. Check the result</h4>
            <ul>
              {prompt.checks.map((check) => (
                <li key={check}>
                  <Check size={15} aria-hidden="true" />
                  {check}
                </li>
              ))}
            </ul>
            <Link href={prompt.tool.href}>
              {prompt.tool.name}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export default function PromptExplorer() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const results = filterPreviews(category, query);
  const active = results.find((prompt) => prompt.id === selected);
  const categoryName = promptCategories.find(
    (item) => item.id === category,
  )?.name;
  function reset() {
    setCategory("all");
    setQuery("");
    setSelected(null);
  }
  function open(id: string) {
    setSelected(id);
    // Wait for the expanded workspace to settle before bringing its heading into view.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        workspace.current?.focus({ preventScroll: true });
        workspace.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      }),
    );
  }
  function close() {
    setSelected(null);
    resultsHeading.current?.focus({ preventScroll: true });
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
        <span className={styles.previewPill}>Preview collection</span>
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
                  setSelected(null);
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
                    ? promptPreviews.length
                    : promptPreviews.filter((p) => p.category === item.id)
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
              Search prompt previews
            </label>
            <input
              id="prompt-search"
              type="search"
              maxLength={160}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              placeholder="Try meta titles, readability, or search intent…"
            />
            {query ? (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={18} />
              </button>
            ) : null}
          </div>
          <div className={styles.resultsMeta}>
            <h3 ref={resultsHeading} tabIndex={-1}>
              {categoryName}
            </h3>
            <p aria-live="polite">
              {results.length}{" "}
              {results.length === 1 ? "sample workflow" : "sample workflows"}
            </p>
          </div>
          <p className={styles.previewNotice}>
            A look at what’s coming. Explore sample prompts below while the full
            guides are being prepared.
          </p>
          {active ? (
            <div
              ref={workspace}
              tabIndex={-1}
              className={styles.workspaceAnchor}
            >
              <PreviewWorkspace key={active.id} prompt={active} close={close} />
            </div>
          ) : null}
          <div className={styles.cardGrid}>
            {results.map((prompt, i) => (
              <article
                className={styles.card}
                key={prompt.id}
                data-tone={prompt.category}
              >
                <div className={styles.cardMeta}>
                  <span className={styles.topic}>
                    {
                      promptCategories.find((c) => c.id === prompt.category)
                        ?.name
                    }
                  </span>
                  <span className={styles.sampleLabel}>PREVIEW</span>
                </div>
                <span className={styles.cardNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} /
                </span>
                <h4>{prompt.title}</h4>
                <p>{prompt.description}</p>
                <div className={styles.outcome}>
                  <span>WHAT YOU’LL WORK TOWARD</span>
                  <p>{prompt.outcome}</p>
                </div>
                <div className={styles.tags}>
                  {prompt.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <button
                  className={styles.cardAction}
                  aria-expanded={selected === prompt.id}
                  onClick={() => open(prompt.id)}
                  aria-label={`Preview sample: ${prompt.title}`}
                >
                  Explore sample <ArrowRight size={17} />
                </button>
              </article>
            ))}
          </div>
          {!results.length ? (
            <div className={styles.empty}>
              <Search size={30} aria-hidden="true" />
              <h3>No matching previews yet</h3>
              <p>Try a broader term or explore another category.</p>
              <button onClick={reset} className={styles.primary}>
                Show all previews
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
