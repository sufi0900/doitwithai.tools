"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  FileSearch,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  analyzeEvidence,
  CUES,
  EMPTY_REVIEW,
  evidenceCsv,
  MAX_TEXT,
  REVIEW_LABELS,
  reviewProgress,
  textInput,
  validateReview,
  type Claim,
  type EvidenceReport,
  type Review,
} from "./analyze";
import type { PageSnapshot } from "../on-page-analyzer/types";
import styles from "./evidence.module.css";

const EXAMPLE_HTML = `<main><h1>Illustrative content review</h1>
<p>Our team tested three writing workflows. This is an illustrative testing claim without supporting records.</p>
<h2>Claims to check</h2><p>This workflow guarantees first-place rankings for every article.</p>
<p>According to Google's content guidance, clear sourcing helps readers assess trust. <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content">Read the original guidance</a>.</p>
<h2>Measurements</h2><p>In this invented example, editing time fell by 42%. No real experiment was conducted.</p></main>`;

function ClaimCard({
  claim,
  review,
  onSave,
  index,
}: {
  claim: Claim;
  review: Review;
  onSave: (review: Review) => void;
  index: number;
}) {
  const [draft, setDraft] = useState<Review>(review);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function change(patch: Partial<Review>) {
    setDraft((previous) => ({ ...previous, ...patch }));
    setSaved(false);
    setError("");
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const clean = {
      ...draft,
      note: draft.note.trim(),
      evidenceUrl: draft.evidenceUrl.trim(),
    };
    const issue = validateReview(clean);
    if (issue) {
      setError(issue);
      return;
    }
    onSave(clean);
    setSaved(true);
  }
  const id = claim.id.replace(/[^a-z0-9-]/gi, "-");
  return (
    <article className={styles.claim} aria-labelledby={`${id}-heading`}>
      <header className={styles.claimHeader}>
        <div>
          <span className={styles.eyebrow}>
            PASSAGE {index + 1} · {claim.section}
          </span>
          <h3 id={`${id}-heading`}>Review the claim in context</h3>
        </div>
        <span className={styles.reviewBadge} data-status={review.status}>
          {REVIEW_LABELS[review.status]}
        </span>
      </header>
      <div className={styles.tags}>
        {claim.cues.map((id) => (
          <span key={id}>{CUES.find((cue) => cue.id === id)!.name}</span>
        ))}
      </div>
      <blockquote>
        {claim.text.length <= 1600 ? (
          claim.text
        ) : (
          <details>
            <summary>{claim.text.slice(0, 300)}… Show full passage</summary>
            <p>{claim.text}</p>
          </details>
        )}
      </blockquote>
      <ul className={styles.advice}>
        {claim.cues.map((id) => (
          <li key={id}>{CUES.find((cue) => cue.id === id)!.advice}</li>
        ))}
      </ul>
      <section className={styles.sources} aria-label="Nearby candidate sources">
        <h4>
          {claim.sources.length
            ? `${claim.sources.length} nearby source candidate${claim.sources.length === 1 ? "" : "s"}`
            : "No nearby source link detected"}
        </h4>
        <p>
          {claim.sources.length
            ? "These links appear in this passage or an adjacent passage. Their presence does not prove they support the claim."
            : "Evidence may exist elsewhere, in a reference list, or in your own records. Check before deciding what to change."}
        </p>
        {claim.sources.length > 0 && (
          <details>
            <summary>Inspect candidate links</summary>
            <ul>
              {claim.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.text} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <small>
                    {source.placement} · {source.kind}
                  </small>
                  <span className={styles.url}>{source.href}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <form onSubmit={save} className={styles.reviewForm}>
        <div className={styles.fieldGrid}>
          <label htmlFor={`${id}-source`}>
            Evidence URL <span>Optional</span>
            <ToolUrlInput
              id={`${id}-source`}
              type="url"
              maxLength={2048}
              value={draft.evidenceUrl}
              onChange={(e) => change({ evidenceUrl: e.target.value })}
              placeholder="https://original-source.example/research"
            />
          </label>
          <label htmlFor={`${id}-status`}>
            Your review decision
            <select
              id={`${id}-status`}
              value={draft.status}
              onChange={(e) =>
                change({ status: e.target.value as Review["status"] })
              }
            >
              {Object.entries(REVIEW_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label htmlFor={`${id}-note`}>
          Source or revision note{" "}
          <span>Optional, unless recording evidence without a URL</span>
          <textarea
            id={`${id}-note`}
            rows={3}
            maxLength={2000}
            value={draft.note}
            onChange={(e) => change({ note: e.target.value })}
            placeholder="Record the source, relevant finding, test conditions, or wording to revise."
          />
        </label>
        <div className={styles.saveRow}>
          <button className={styles.secondary} type="submit">
            Save review decision
          </button>
          <p role="status">
            {saved
              ? "Decision saved for this report."
              : "Only saved decisions enter the export."}
          </p>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </form>
    </article>
  );
}

export default function Client() {
  const [mode, setMode] = useState<"url" | "text" | "html">("url");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [report, setReport] = useState<EvidenceReport | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [visible, setVisible] = useState(20);
  const [version, setVersion] = useState(0);
  const active = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current++;
      active.current?.abort();
    },
    [],
  );
  function cancel() {
    requestId.current++;
    active.current?.abort();
    setBusy(false);
    setNotice("Import canceled. Any previous report is unchanged.");
  }
  async function analyze(event?: FormEvent, example = false) {
    event?.preventDefault();
    const token = ++requestId.current;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 28000);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let next: EvidenceReport;
      if (mode === "text" && !example)
        next = analyzeEvidence(textInput(content, url));
      else {
        const html = example ? EXAMPLE_HTML : mode === "html" ? content : "";
        if (mode === "html" && !example && !html.trim())
          throw new Error("Paste the page HTML you want to review.");
        const response = await fetch("/api/ai-tools/on-page/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: example
              ? "https://example.com/illustrative-review"
              : url.trim(),
            html,
          }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => {
          throw new Error(
            "The import did not finish. Try pasted text or HTML.",
          );
        });
        if (!response.ok || !data.result)
          throw new Error(
            data.error?.message ||
              "The page could not be imported. Try pasted text or HTML.",
          );
        next = analyzeEvidence(data.result as PageSnapshot);
      }
      if (token !== requestId.current) return;
      setReport(next);
      setReviews({});
      setVersion((v) => v + 1);
      setFilter("all");
      setDecisionFilter("all");
      setVisible(20);
      setNotice(
        example
          ? "Illustrative example. Its claims and figures are review exercises, not real findings."
          : "Report ready. Review each passage and save your decisions. Nothing is changed on your website.",
      );
    } catch (e) {
      if (token === requestId.current)
        setError(
          controller.signal.aborted
            ? "The import took too long. Try pasted text or HTML, or import again later."
            : e instanceof Error
              ? e.message
              : "Unable to review this source. Any previous report is unchanged.",
        );
    } finally {
      window.clearTimeout(timeout);
      if (token === requestId.current) setBusy(false);
    }
  }
  function download(format: "csv" | "json") {
    if (!report) return;
    const data =
      format === "csv"
        ? "\uFEFF" + evidenceCsv(report, reviews)
        : JSON.stringify(
            {
              tool: "Content Evidence Review",
              scope: report.input.scope,
              source: report.input.url || "Pasted content",
              checkedAt: report.input.checkedAt,
              partial: report.input.partial,
              warnings: report.input.warnings,
              limitations:
                "Cue-based editorial review. Nearby links and manual decisions do not establish factual accuracy or an E-E-A-T score.",
              claims: report.claims.map((claim) => ({
                ...claim,
                review: reviews[claim.id] || EMPTY_REVIEW,
              })),
            },
            null,
            2,
          );
    const href = URL.createObjectURL(
      new Blob([data], {
        type: format === "csv" ? "text/csv;charset=utf-8" : "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = `content-evidence-review.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    setNotice(
      "Report exported with saved decisions. Unsaved form edits are not included.",
    );
  }
  const progress = report ? reviewProgress(report.claims, reviews) : null;
  const filtered =
    report?.claims.filter(
      (claim) =>
        (filter === "all" ||
          (filter === "missing" && !claim.sources.length) ||
          claim.cues.some((id) => id === filter)) &&
        (decisionFilter === "all" ||
          (reviews[claim.id]?.status || "pending") === decisionFilter),
    ) || [];
  return (
    <div className={styles.workspace} id="evidence-review-workspace">
      <section
        className={styles.inputPanel}
        aria-labelledby="evidence-input-heading"
      >
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>START WITH YOUR CONTENT</span>
            <h2 id="evidence-input-heading">Find claims worth a closer look</h2>
          </div>
          <FileSearch size={30} aria-hidden="true" />
        </div>
        <div className={styles.modes} aria-label="Content source">
          {(
            [
              ["url", "Page URL"],
              ["text", "Paste text"],
              ["html", "Paste HTML"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              disabled={busy}
              onClick={() => {
                setMode(id);
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={(event) => void analyze(event)}>
          <label htmlFor="evidence-url">
            {mode === "url"
              ? "Public article URL"
              : "Page URL for link classification"}
            <span>{mode === "url" ? "Required" : "Optional"}</span>
            <ToolUrlInput
              id="evidence-url"
              type="url"
              value={url}
              maxLength={2048}
              required={mode === "url"}
              disabled={busy}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/article"
            />
          </label>
          {mode !== "url" && (
            <label htmlFor="evidence-content">
              {mode === "text" ? "Article or draft text" : "Page HTML"}
              <textarea
                id="evidence-content"
                rows={10}
                required
                disabled={busy}
                maxLength={mode === "text" ? MAX_TEXT : 750000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  mode === "text"
                    ? "Paste paragraphs and list items. Keep each item on its own line."
                    : "Paste the returned or rendered HTML for the page."
                }
              />
              <small>
                {content.length.toLocaleString()} /{" "}
                {(mode === "text" ? MAX_TEXT : 750000).toLocaleString()}{" "}
                characters
              </small>
            </label>
          )}
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={busy}>
              {busy ? (
                <Loader2
                  className={styles.spinner}
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Search size={18} aria-hidden="true" />
              )}
              {busy
                ? "Preparing your review…"
                : mode === "url"
                  ? "Import and review claims"
                  : "Review this content"}
            </button>
            {busy ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={cancel}
              >
                Cancel import
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void analyze(undefined, true)}
              >
                Try an example
              </button>
            )}
          </div>
        </form>
        <p className={styles.small}>
          URL import reads returned HTML. Content added later by scripts may
          require pasted text or rendered HTML.
        </p>
        <p className={styles.small}>
          Content and decisions stay in this session. Export your report before
          leaving or reloading.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      </section>
      {report && progress && (
        <section
          className={styles.report}
          aria-label="Content evidence report"
          aria-busy={busy}
        >
          <div className={styles.reportTop}>
            <div>
              <span className={styles.eyebrow}>YOUR REVIEW WORKSPACE</span>
              <h2>{report.input.title || "Content evidence report"}</h2>
              <p className={styles.url}>
                {report.input.url || "Pasted content"}
              </p>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => download("csv")}
              >
                <Download size={16} aria-hidden="true" />
                Export CSV
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => download("json")}
              >
                Export JSON
              </button>
            </div>
          </div>
          {report.input.partial && (
            <p className={styles.warning} role="status">
              Partial extraction. Findings cover the retained content, rather
              than the full page.
            </p>
          )}
          {report.input.warnings.map((warning, i) => (
            <p className={styles.warning} key={i}>
              {warning}
            </p>
          ))}
          <div className={styles.stats}>
            <div>
              <strong>{report.claims.length}</strong>
              <span>Passages with review cues</span>
            </div>
            <div>
              <strong>
                {report.claims.filter((c) => !c.sources.length).length}
              </strong>
              <span>No nearby link detected</span>
            </div>
            <div>
              <strong>{progress.reviewed}</strong>
              <span>Reviewed by you</span>
            </div>
            <div>
              <strong>{progress.revise}</strong>
              <span>Marked for revision</span>
            </div>
          </div>
          <div className={styles.progress}>
            <div>
              <ShieldCheck size={20} aria-hidden="true" />
              <strong>
                {progress.reviewed} of {progress.total} passages reviewed
              </strong>
            </div>
            <progress
              value={progress.reviewed}
              max={Math.max(progress.total, 1)}
              aria-label="Manual review progress"
            />
            <p>
              Manual progress, not a trust or accuracy score.{" "}
              {report.sourceCount} distinct source links were retained.
            </p>
          </div>
          <details className={styles.scope}>
            <summary>What this report checked</summary>
            <p>
              Scope: {report.input.scope}. Detected author metadata:{" "}
              {report.input.author || "Not supplied or not detected"}.
            </p>
            <p>
              Rules flag English statistics, attribution, guarantees,
              comparisons, and testing statements. Other claims may still need
              review.
            </p>
            <p>
              Source candidates come from the same passage or an adjacent
              passage within the same section. Source content and authority are
              not verified.
            </p>
          </details>
          <div className={styles.filters}>
            <label htmlFor="evidence-cue-filter">
              Filter review cues
              <select
                id="evidence-cue-filter"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setVisible(20);
                }}
              >
                <option value="all">All review cues</option>
                <option value="missing">No nearby link detected</option>
                {CUES.map((cue) => (
                  <option value={cue.id} key={cue.id}>
                    {cue.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="evidence-decision-filter">
              Filter saved decisions
              <select
                id="evidence-decision-filter"
                value={decisionFilter}
                onChange={(e) => {
                  setDecisionFilter(e.target.value);
                  setVisible(20);
                }}
              >
                <option value="all">All decisions</option>
                {Object.entries(REVIEW_LABELS).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={styles.small} aria-live="polite">
            Showing {Math.min(visible, filtered.length)} of {filtered.length}{" "}
            matching passages.
          </p>
          {filtered.slice(0, visible).map((claim, index) => (
            <ClaimCard
              key={`${version}:${claim.id}`}
              claim={claim}
              review={reviews[claim.id] || EMPTY_REVIEW}
              index={index}
              onSave={(review) =>
                setReviews((previous) => ({ ...previous, [claim.id]: review }))
              }
            />
          ))}
          {filtered.length > visible && (
            <button
              className={styles.secondary}
              onClick={() => setVisible((count) => count + 20)}
            >
              Show 20 more passages
            </button>
          )}
          {!filtered.length && (
            <div className={styles.empty}>
              <FileSearch size={30} aria-hidden="true" />
              <h3>
                {report.claims.length
                  ? "No passages match these filters"
                  : "No review cues matched"}
              </h3>
              <p>
                {report.claims.length
                  ? "Change the filters to continue reviewing your report."
                  : "This does not confirm factual accuracy. Read the content and check any claims these rules missed."}
              </p>
            </div>
          )}
          <div className={styles.nextStep}>
            <strong>Keep your review connected</strong>
            <p>
              Review the whole page in the{" "}
              <Link href="/tools/on-page-ai-seo-analyzer">
                On-page AI SEO Analyzer
              </Link>
              , or refine a passage with the{" "}
              <Link href="/tools/readability-checker">Readability Checker</Link>
              .
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
