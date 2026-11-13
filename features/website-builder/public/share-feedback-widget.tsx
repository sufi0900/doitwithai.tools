"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { useState } from "react";
import { Star, CheckCircle, MessageSquare } from "lucide-react";

export function ShareFeedbackWidget({ shareToken, onSubmit }: { shareToken: string; onSubmit?: () => void }) {
  const [step, setStep] = useState<"idle" | "rating" | "comment" | "submitted">("idle");
  const [ratings, setRatings] = useState({ clarity: 0, relevance: 0, presentation: 0 });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setRating(key: keyof typeof ratings, value: number) {
    setRatings((r) => ({ ...r, [key]: value }));
  }

  async function submit() {
    if (ratings.clarity === 0 || ratings.relevance === 0 || ratings.presentation === 0) {
      setError("Please rate all three categories.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/shares/${shareToken}/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...ratings, comment: comment.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not submit feedback.");
      setStep("submitted");
      onSubmit?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "submitted") {
    return (
      <div className="share-feedback-widget submitted" role="status">
        <CheckCircle size={32} className="success-icon" />
        <strong>Thank you!</strong>
        <p>Your feedback has been sent to the portfolio owner.</p>
      </div>
    );
  }

  if (step === "idle") {
    return (
      <button type="button" className="share-feedback-trigger" onClick={() => setStep("rating")}>
        <MessageSquare size={18} />
        <span>Leave feedback</span>
      </button>
    );
  }

  if (step === "rating") {
    return (
      <div className="share-feedback-widget" role="dialog" aria-label="Leave feedback">
        <header><strong>How was this portfolio?</strong><small>Anonymous — takes 30 seconds</small></header>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="rating-grid">
          {[
            { key: "clarity", label: "Clarity", description: "Was the content clear and easy to understand?" },
            { key: "relevance", label: "Relevance", description: "Did the projects and experience match the opportunity?" },
            { key: "presentation", label: "Presentation", description: "Was the visual design and layout effective?" },
          ].map(({ key, label, description }) => (
            <fieldset key={key} className="rating-field">
              <legend>{label}</legend>
              <p className="rating-hint">{description}</p>
              <div className="star-row" role="radiogroup" aria-label={label}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={ratings[key as keyof typeof ratings] === n}
                                    aria-label={`${n} out of 5`}
                    onClick={() => setRating(key as keyof typeof ratings, n)}
                    className={ratings[key as keyof typeof ratings] >= n ? "filled" : ""}
                  >
                    <Star size={20} />
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="feedback-actions">
          <button type="button" className="secondary-action" onClick={() => setStep("idle")}>Cancel</button>
          <button type="button" className="primary-action" disabled={busy} onClick={() => setStep("comment")}>
            {busy ? "Sending…" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-feedback-widget" role="dialog" aria-label="Optional comment">
      <header><strong>Anything else?</strong><small>Optional — your comment is anonymous</small></header>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What stood out? What could be improved?"
        maxLength={2000}
        rows={4}
      />
      <div className="feedback-actions">
        <button type="button" className="secondary-action" onClick={() => setStep("rating")}>Back</button>
        <button type="button" className="primary-action" disabled={busy} onClick={submit}>
          {busy ? "Sending…" : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}