"use client";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import React, { useEffect, useRef, useState } from "react";
import { Check, X, Loader2, ScanText } from "lucide-react";
import {
  CUES,
  EMPTY_REVIEW,
  REVIEW_LABELS,
  validateReview,
  type Claim,
  type Review,
} from "../content-evidence/analyze";
import type { EditorialReview } from "../on-page-analyzer/review";
import { reviewClaim } from "./claim-review-client";
import styles from "../content-evidence/evidence.module.css";
function ClaimCard({
  claim,
  saved,
  onSave,
  onLocate,
  index,
}: {
  claim: Claim;
  saved: Review;
  onSave: (value: Review) => void;
  onLocate: () => void;
  index: number;
}) {
  const [draft, setDraft] = useState(saved),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false),
    [result, setResult] = useState<EditorialReview | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  function update(patch: Partial<Review>) {
    request.current?.abort();
    setBusy(false);
    setResult(null);
    setDraft((old) => ({ ...old, ...patch }));
    setError("");
    setNotice("Unsaved review details");
  }
  function save(status: Review["status"]) {
    const value = {
        status,
        note: draft.note.trim(),
        evidenceUrl: draft.evidenceUrl.trim(),
      },
      issue = validateReview(value);
    if (issue) {
      setError(issue);
      return;
    }
    setDraft(value);
    onSave(value);
    setError("");
    setNotice(
      "Your decision was saved for this report. It is not independent fact verification.",
    );
  }
  async function inspect() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const value = await reviewClaim(claim, draft, controller.signal);
      if (!controller.signal.aborted) setResult(value);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "Passage review unavailable.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  const id = `citation-claim-${index}`;
  return (
    <article className={`${styles.claim} [overflow-wrap:anywhere]`}>
      <div className={styles.claimHeader}>
        <h3>
          Passage {index + 1} · {claim.section}
        </h3>
        <span className={styles.reviewBadge} data-status={saved.status}>
          {REVIEW_LABELS[saved.status]}
        </span>
      </div>
      <div className={styles.tags}>
        {claim.cues.map((cue) => (
          <span key={cue}>{CUES.find((c) => c.id === cue)?.name}</span>
        ))}
      </div>
      <blockquote>
        <details>
          <summary>
            {claim.text.slice(0, 300)}
            {claim.text.length > 300
              ? "… Show full passage"
              : " · Show passage"}
          </summary>
          <p>{claim.text}</p>
        </details>
      </blockquote>
      <p className={styles.small}>
        {claim.sources.length
          ? `${claim.sources.length} nearby source candidates. Their contents and support were not verified.`
          : "No nearby source candidate was extracted. This does not establish that evidence is absent online."}
      </p>
      {claim.sources.slice(0, 8).map((s) => (
        <a
          key={s.href}
          href={s.href}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-2 block break-all text-sm text-[#4058d0] underline dark:text-blue-200"
        >
          {s.text || s.href}
        </a>
      ))}
      <div className="mt-5 grid gap-3">
        <label htmlFor={`${id}-note`}>
          Evidence note or source excerpt
          <textarea
            id={`${id}-note`}
            rows={3}
            maxLength={2000}
            value={draft.note}
            onChange={(e) => update({ note: e.target.value })}
          />
        </label>
        <label htmlFor={`${id}-source`}>
          Evidence URL, optional
          <ToolUrlInput
            id={`${id}-source`}
            type="url"
            value={draft.evidenceUrl}
            maxLength={2048}
            onChange={(e) => update({ evidenceUrl: e.target.value })}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => save("recorded")}
        >
          <Check size={16} aria-hidden="true" />
          Record evidence
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => save("revise")}
        >
          <X size={16} aria-hidden="true" />
          Needs revision
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => save("dismissed")}
        >
          No evidence needed, my judgment
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => save("pending")}
        >
          Reset
        </button>
        <button type="button" className={styles.secondary} onClick={onLocate}>
          Locate in article review
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={busy}
          onClick={inspect}
        >
          {busy ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <ScanText size={16} />
          )}
          {busy ? "Reviewing passage…" : "Review with AI"}
        </button>
      </div>
      <p className={styles.small}>
        AI review uses the first 1,600 passage characters and your supplied
        note. It reviews wording and evidence gaps without searching or
        verifying online facts.
      </p>
      {busy && (
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            request.current?.abort();
            setBusy(false);
          }}
        >
          Cancel passage review
        </button>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <p role="status" className={styles.notice}>
        {notice}
      </p>
      {result && (
        <section
          className={styles.sources}
          aria-label="Selected passage editorial review"
        >
          <h4>Editorial observations, not a fact-check verdict</h4>
          <p>{result.summary}</p>
          {result.insights.map((insight, i) => (
            <div key={i} className="mt-4">
              <blockquote>{insight.quote}</blockquote>
              <p>{insight.observation}</p>
              <p className="mt-2 font-semibold">{insight.action}</p>
            </div>
          ))}
          {!result.insights.length && (
            <p>
              No supported editorial observations were returned. This does not
              verify the claim.
            </p>
          )}
        </section>
      )}
    </article>
  );
}
export default function ClaimsPanel({
  claims,
  reviews,
  onSave,
  onLocate,
}: {
  claims: Claim[];
  reviews: Record<string, Review>;
  onSave: (id: string, value: Review) => void;
  onLocate: (id: string) => void;
}) {
  const [batch, setBatch] = useState(0),
    size = 10;
  return (
    <div>
      <p className={styles.small}>
        Record evidence, request revision, or dismiss a cue using your judgment.
        These actions update review progress, not citation likelihood.
      </p>
      {claims.slice(batch * size, (batch + 1) * size).map((claim, i) => (
        <ClaimCard
          key={claim.id}
          index={batch * size + i}
          claim={claim}
          saved={reviews[claim.id] || EMPTY_REVIEW}
          onSave={(value) => onSave(claim.id, value)}
          onLocate={() => onLocate(claim.id)}
        />
      ))}
      {!claims.length && (
        <p className={styles.empty}>
          No supported claim pattern matched. Accuracy and completeness remain
          unverified.
        </p>
      )}
      {claims.length > size && (
        <div className={`${styles.actions} mt-5`}>
          <button
            className={styles.secondary}
            type="button"
            disabled={!batch}
            onClick={() => setBatch((b) => b - 1)}
          >
            Previous passages
          </button>
          <span>
            Page {batch + 1} of {Math.ceil(claims.length / size)}
          </span>
          <button
            className={styles.secondary}
            type="button"
            disabled={(batch + 1) * size >= claims.length}
            onClick={() => setBatch((b) => b + 1)}
          >
            Next passages
          </button>
        </div>
      )}
    </div>
  );
}
