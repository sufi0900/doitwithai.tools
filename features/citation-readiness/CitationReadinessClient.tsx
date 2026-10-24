"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import AnswerReadinessPanel from "../on-page-analyzer/AnswerReadinessPanel";
import type { PageSnapshot } from "../on-page-analyzer/types";
import { importCitationPage } from "./client";
import { draftPage, MAX_DRAFT } from "./draft-html";
import ReviewWorkspace from "./ReviewWorkspace";
import styles from "../content-evidence/evidence.module.css";
import analyzerStyles from "../on-page-analyzer/analyzer.module.css";
type Mode = "url" | "text" | "html";
export const exampleDraft =
  "# What is internal linking?\n\nInternal linking connects pages on the same website. It helps readers discover related information and understand a site's structure.\n\n## How do you choose an anchor?\n\nIn this guide, we explore the changing world of search.\n\nChoose descriptive wording that explains the destination. Avoid forcing keywords into every link.\n\n## What did our example test measure?\n\nWe tested three anchor labels in an illustrative exercise. These example results are not published research.\n\n- State the method.\n- Explain limitations.\n- Record supporting evidence.";
export default function CitationReadinessClient() {
  const [mode, setMode] = useState<Mode>("url"),
    [input, setInput] = useState("");
  const [page, setPage] = useState<PageSnapshot | null>(null),
    [loading, setLoading] = useState(false);
  const [error, setError] = useState(""),
    [dirty, setDirty] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const invalidate = () => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError("");
    setDirty(true);
  };
  function example() {
    invalidate();
    setMode("text");
    setInput(exampleDraft);
    setPage(draftPage(exampleDraft));
    setDirty(false);
  }
  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) {
      setError("Add a public URL or content to review.");
      return;
    }
    if (
      mode !== "url" &&
      input.length > (mode === "text" ? MAX_DRAFT : 750_000)
    ) {
      setError(
        mode === "text"
          ? "Paste up to 150,000 characters, or review your draft in sections."
          : "Paste up to 750,000 HTML characters, or review the main article section.",
      );
      return;
    }
    invalidate();
    if (mode === "text") {
      setPage(draftPage(input));
      setDirty(false);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    const outcome = await importCitationPage(
      mode === "url" ? { url: input.trim() } : { html: input },
      controller.signal,
    );
    if (controller.signal.aborted || request.current !== controller) return;
    setLoading(false);
    if (outcome.ok === false) {
      setError(outcome.message);
      return;
    }
    setPage(outcome.page);
    setDirty(false);
  }
  return (
    <div id="ai-citation-readiness-checker" className={styles.workspace}>
      <div className={styles.inputPanel}>
        <span className={styles.eyebrow}>
          Clarity, access, and supporting context
        </span>
        <h2>Review a page or unpublished draft</h2>
        <p className={styles.small}>
          Inspect observable evidence and complete opening paragraphs. This
          review cannot determine whether an AI service will cite your page.
        </p>
        <div className={styles.modes} aria-label="Input type">
          {(
            [
              ["url", "Public URL"],
              ["text", "Draft text"],
              ["html", "Page HTML"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                invalidate();
                setMode(value);
                setInput("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={analyze} aria-busy={loading}>
          <label htmlFor="citation-input">
            {mode === "url"
              ? "Public page URL"
              : mode === "text"
                ? "Draft text with optional Markdown headings"
                : "Page HTML or copied rendered HTML"}
          </label>
          {mode === "url" ? (
            <input
              id="citation-input"
              type="url"
              inputMode="url"
              value={input}
              onChange={(e) => {
                invalidate();
                setInput(e.target.value);
              }}
              placeholder="https://example.com/article"
              required
              aria-describedby="citation-help"
            />
          ) : (
            <textarea
              id="citation-input"
              rows={12}
              value={input}
              onChange={(e) => {
                invalidate();
                setInput(e.target.value);
              }}
              required
              aria-describedby="citation-help"
            />
          )}
          <p id="citation-help" className={styles.small}>
            {mode === "url"
              ? "Use an accessible public page. Returned HTML can omit content added later by scripts. Images and videos are not downloaded."
              : mode === "text"
                ? "Up to 150,000 characters. Use blank lines for paragraphs, # for headings, and - for list items. Live access remains unchecked."
                : "Up to 750,000 characters. Pasted HTML is inspected without running scripts. Live response headers and crawler policies remain unchecked."}
          </p>
          <div className={`${styles.actions} mt-5`}>
            <button
              className={styles.primary}
              type="submit"
              disabled={loading || !input.trim()}
            >
              {loading && (
                <Loader2
                  size={16}
                  className={styles.spinner}
                  aria-hidden="true"
                />
              )}
              {loading
                ? "Reviewing page…"
                : mode === "url"
                  ? "Import and review URL"
                  : "Review content"}
            </button>
            <button
              className={styles.secondary}
              type="button"
              onClick={example}
            >
              Try example
            </button>
            {loading && (
              <button
                type="button"
                className={styles.secondary}
                onClick={invalidate}
              >
                Cancel import
              </button>
            )}
            <button
              className={styles.secondary}
              type="button"
              onClick={() => {
                invalidate();
                setInput("");
                setPage(null);
                setDirty(false);
              }}
            >
              Clear
            </button>
          </div>
        </form>
        <p role="status" className={styles.notice}>
          {loading
            ? "Importing retained text and available page metadata. You can cancel without losing the previous report."
            : ""}
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </div>
      {page && (
        <>
          {dirty && (
            <p className={styles.warning}>
              The report below belongs to the previous input. Run another review
              to update it.
            </p>
          )}
          <ReviewWorkspace page={page} />
          <div className={analyzerStyles.app}>
            <AnswerReadinessPanel page={page} />
          </div>
        </>
      )}
    </div>
  );
}
