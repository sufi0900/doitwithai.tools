"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import AnswerReadinessPanel from "../on-page-analyzer/AnswerReadinessPanel";
import type { PageSnapshot } from "../on-page-analyzer/types";
import { importCitationPage } from "./client";
import { draftPage } from "./draft-html";
import ReviewWorkspace from "./ReviewWorkspace";
import styles from "../content-evidence/evidence.module.css";
import analyzerStyles from "../on-page-analyzer/analyzer.module.css";
const ContentEditor = dynamic(() => import("./ContentEditor"), {
  ssr: false,
  loading: () => (
    <p role="status" className={styles.notice}>
      Preparing article editor…
    </p>
  ),
});
type Mode = "url" | "text" | "html";
export const exampleDraft =
  "# What is internal linking?\n\nInternal linking connects pages on the same website. It helps readers discover related information and understand a site's structure.\n\n## How do you choose an anchor?\n\nIn this guide, we explore the changing world of search.\n\nChoose descriptive wording that explains the destination. Avoid forcing keywords into every link.\n\n## What did our example test measure?\n\nWe tested three anchor labels in an illustrative exercise. These example results are not published research.\n\n- State the method.\n- Explain limitations.\n- Record supporting evidence.";
export default function CitationReadinessClient() {
  const [mode, setMode] = useState<Mode>("url"),
    [input, setInput] = useState("");
  const [page, setPage] = useState<PageSnapshot | null>(null),
    [editorBase, setEditorBase] = useState<PageSnapshot | null>(null);
  const [editorKey, setEditorKey] = useState(0),
    [loading, setLoading] = useState(false);
  const [error, setError] = useState(""),
    [sourceError, setSourceError] = useState(false),
    [dirty, setDirty] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const invalidate = () => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError("");
    setSourceError(false);
    setDirty(true);
  };
  const setDocument = (value: PageSnapshot, showReport = true) => {
    setEditorBase(value);
    setEditorKey((old) => old + 1);
    setPage(showReport ? value : null);
    setDirty(false);
  };
  function switchMode(value: Mode) {
    invalidate();
    setMode(value);
    setInput("");
    if (value === "text") setDocument(draftPage(""), false);
  }
  function example() {
    invalidate();
    setMode("text");
    setInput("");
    setDocument(draftPage(exampleDraft));
  }
  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (mode === "text") return;
    if (!input.trim()) {
      setError("Add a public URL or page HTML to review.");
      return;
    }
    if (mode === "html" && input.length > 750_000) {
      setError(
        "Paste up to 750,000 HTML characters, or review the main article section.",
      );
      return;
    }
    invalidate();
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
      setSourceError(Boolean(outcome.code?.startsWith("SOURCE_")));
      return;
    }
    setDocument(outcome.page);
  }
  return (
    <div id="ai-citation-readiness-checker" className={styles.workspace}>
      <div className={styles.inputPanel}>
        <span className={styles.eyebrow}>
          Access evidence and transparent editorial review
        </span>
        <h2>Review a page or unpublished article</h2>
        <p className={styles.small}>
          Import a URL to fill the article editor automatically. For unavailable
          pages, paste formatted content or copied HTML.
        </p>
        <p className={styles.small}>
          No universal H1 count, paragraph length, or first-sentence formula
          proves AI citation readiness.
        </p>
        <div className={styles.modes} aria-label="Input type">
          {(
            [
              ["url", "Public URL"],
              ["text", "Article editor"],
              ["html", "Page HTML"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => switchMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={analyze} aria-busy={loading}>
          {mode !== "text" && (
            <>
              <label htmlFor="citation-input">
                {mode === "url"
                  ? "Public page URL"
                  : "Page HTML or copied rendered HTML"}
              </label>
              {mode === "url" ? (
                <ToolUrlInput
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
                  rows={10}
                  value={input}
                  onChange={(e) => {
                    invalidate();
                    setInput(e.target.value);
                  }}
                  required
                  aria-describedby="citation-help"
                />
              )}
            </>
          )}
          <p id="citation-help" className={styles.small}>
            {mode === "url"
              ? "Use an accessible public page. Access restrictions can prevent importing. A refusal is not an SEO or citation verdict."
              : mode === "text"
                ? "Paste your article in the editor below. Paragraphs, headings, lists, and safe links remain distinct. Published access is not checked."
                : "Up to 750,000 characters. Copied HTML is inspected without running scripts. Live response headers and crawler policies remain unchecked."}
          </p>
          <div className={`${styles.actions} mt-5`}>
            {mode !== "text" && (
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
                  ? "Importing page…"
                  : mode === "url"
                    ? "Import URL into article review"
                    : "Import HTML into article review"}
              </button>
            )}
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
                setEditorBase(mode === "text" ? draftPage("") : null);
                setEditorKey((old) => old + 1);
                setDirty(false);
              }}
            >
              Clear
            </button>
          </div>
        </form>
        <p role="status" className={styles.notice}>
          {loading
            ? "Importing retained text and available metadata. You can cancel without losing the previous report."
            : page && !dirty
              ? "Review ready. Inspect the article and evidence below."
              : ""}
        </p>
        {error && (
          <div className={styles.error} role="alert">
            <p>{error}</p>
            <p className="mt-2">
              An import failure does not establish that Google or AI crawlers
              are blocked. Their policies and network access are separate.
            </p>
            <div className={`${styles.actions} mt-3`}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => switchMode("text")}
              >
                Continue in article editor
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => switchMode("html")}
              >
                Paste copied page HTML
              </button>
            </div>
            {sourceError && (
              <p className="mt-2">
                This source response is separate from your tool usage limit.
                Repeating the same import may still be refused.
              </p>
            )}
          </div>
        )}
      </div>
      {dirty && page && (
        <p className={styles.warning}>
          The report below belongs to the previous import. Run another review to
          update it.
        </p>
      )}
      {editorBase && (
        <ContentEditor
          key={editorKey}
          page={editorBase}
          onReview={(draft) => {
            setPage(draft);
            setDirty(false);
          }}
        />
      )}
      {page && (
        <>
          {page.contentEdited && (
            <p className={styles.warning}>
              Content findings describe your local draft. Available response
              metadata and crawler rules still describe the original import.
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
