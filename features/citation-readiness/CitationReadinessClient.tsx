"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { Review } from "../content-evidence/analyze";
import Dashboard from "./Dashboard";
import { passageFlags } from "./workspace";
import dashboardStyles from "./dashboard.module.css";
import type { PageSnapshot } from "../on-page-analyzer/types";
import { importCitationPage } from "./client";
import { draftPage } from "./draft-html";
import styles from "../content-evidence/evidence.module.css";
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
  const [view, setView] = useState<"results" | "article">("results"),
    [editorOpened, setEditorOpened] = useState(false);
  const [navigation, setNavigation] = useState(0),
    [reportVersion, setReportVersion] = useState(0);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [focusRequest, setFocusRequest] = useState<{
    blockId: string;
    nonce: number;
  } | null>(null);
  const [flagLimit, setFlagLimit] = useState(20);
  const resultRef = useRef<HTMLDivElement>(null),
    articleRef = useRef<HTMLDivElement>(null);
  const flags = useMemo(() => (page ? passageFlags(page) : []), [page]);
  function go(next: "results" | "article", blockId?: string) {
    if (next === "article") {
      setEditorOpened(true);
      setFocusRequest(blockId ? { blockId, nonce: Date.now() } : null);
    }
    setView(next);
    setNavigation((n) => n + 1);
  }
  useEffect(() => {
    if (!navigation) return;
    const frame = requestAnimationFrame(() => {
      const node = view === "results" ? resultRef.current : articleRef.current;
      node?.focus({ preventScroll: true });
      node?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [navigation, view]);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const invalidate = () => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError("");
    setSourceError(false);
    setDirty(true);
    setNavigation(0);
  };
  const setDocument = (value: PageSnapshot, showReport = true) => {
    setEditorBase(value);
    setEditorKey((old) => old + 1);
    setPage(showReport ? value : null);
    setDirty(false);
    setReviews({});
    setReportVersion((n) => n + 1);
    setEditorOpened(!showReport);
    setFocusRequest(null);
    setFlagLimit(20);
    go(showReport ? "results" : "article");
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
          Analyze a URL to see your readiness review first. Open the article
          review separately to inspect or edit highlighted passages.
        </p>
        <p className={styles.small}>
          No universal H1 count, paragraph length, or first-sentence formula
          proves AI citation readiness.
        </p>
        <div className={styles.modes} aria-label="Input type">
          {(
            [
              ["url", "Public URL"],
              ["text", "Paste new article"],
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
                ? "Paste formatted content in Article review, then analyze it. Drafts preserve headings and lists; published access remains unchecked."
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
                  ? "Analyzing page…"
                  : mode === "url"
                    ? "Check citation readiness"
                    : "Analyze page HTML"}
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
                setReviews({});
                setEditorOpened(mode === "text");
                setNavigation(0);
                setView(mode === "text" ? "article" : "results");
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
              ? "Review ready. Your results dashboard is available below."
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
      {loading && (
        <section
          className={dashboardStyles.loading}
          role="status"
          aria-live="polite"
        >
          <div className={dashboardStyles.loader} aria-hidden="true" />
          <div>
            <h3>Building your citation readiness review</h3>
            <p>
              Reading returned content, available metadata, and crawler
              policies. This can take a moment.
            </p>
            <p>
              {page
                ? "Your previous report remains available. You can cancel this import."
                : "You can cancel this import without losing your input."}
            </p>
          </div>
        </section>
      )}
      {page && (
        <div
          className={dashboardStyles.viewTabs}
          role="group"
          aria-label="Review workspace view"
        >
          <button
            type="button"
            className={view === "results" ? styles.primary : styles.secondary}
            aria-pressed={view === "results"}
            onClick={() => go("results")}
          >
            Review results
          </button>
          <button
            type="button"
            className={view === "article" ? styles.primary : styles.secondary}
            aria-pressed={view === "article"}
            onClick={() => go("article")}
          >
            Article review · {flags.length} cues
          </button>
        </div>
      )}
      {page && (
        <div
          ref={resultRef}
          tabIndex={-1}
          hidden={view !== "results"}
          className={dashboardStyles.resultTarget}
          aria-label="Citation readiness results"
          aria-busy={loading}
        >
          {page.contentEdited && (
            <p className={styles.warning}>
              Content findings describe your local draft. Imported metadata and
              markup still describe the original page.
            </p>
          )}
          <Dashboard
            key={reportVersion}
            page={page}
            reviews={reviews}
            onSave={(id, value) =>
              setReviews((old) => ({ ...old, [id]: value }))
            }
            onLocate={(id) => go("article", id)}
            onOpenArticle={() => go("article")}
          />
        </div>
      )}
      {editorBase && editorOpened && (
        <div
          ref={articleRef}
          tabIndex={-1}
          hidden={view !== "article"}
          className={dashboardStyles.resultTarget}
          aria-label="Article passage review"
        >
          <div className={dashboardStyles.articleLayout}>
            <ContentEditor
              key={editorKey}
              page={editorBase}
              reviewPage={page || editorBase}
              flags={flags}
              reviews={reviews}
              focusRequest={focusRequest}
              onReview={(draft) => {
                setPage(draft);
                setDirty(false);
                setReviews({});
                setReportVersion((n) => n + 1);
                go("results");
              }}
            />
            <aside
              className={dashboardStyles.flagRail}
              aria-label="Passage review cues"
            >
              <h3>Locate a passage</h3>
              <p>
                Yellow: review cue. Green: evidence recorded by you. Red: marked
                for revision. Unflagged text is not certified correct.
              </p>
              {flags.slice(0, flagLimit).map((flag) => (
                <button
                  type="button"
                  key={flag.id}
                  aria-pressed={focusRequest?.blockId === flag.blockId}
                  onClick={() => go("article", flag.blockId)}
                >
                  <strong>
                    Passage {flag.index + 1} · {flag.label}
                  </strong>
                  <span className="mt-1 block">{flag.detail}</span>
                </button>
              ))}
              {!flags.length && (
                <p>
                  No retained cue is available. You can still inspect or paste
                  content and run a review.
                </p>
              )}
              {flags.length > flagLimit && (
                <button
                  type="button"
                  onClick={() => setFlagLimit((n) => n + 20)}
                >
                  Show more passage cues
                </button>
              )}
              {page && (
                <button type="button" onClick={() => go("results")}>
                  Back to review results
                </button>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
