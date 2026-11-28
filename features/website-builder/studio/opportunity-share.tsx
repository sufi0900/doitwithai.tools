"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { ExternalLink, Eye, MessageSquare } from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { OpportunityShareConsent } from "./opportunity-share-consent";

type Share = { id: string; expires_at: string; revoked_at: string | null; openCount?: number };
type Feedback = {
  clarity: number;
  relevance: number;
  presentation: number;
  comment: string | null;
  submittedAt: string;
};
type FeedbackResponse = { feedback: Feedback[]; average: { clarity: number; relevance: number; presentation: number } | null; count: number };

const CONSENT_KEY_PREFIX = "voxfolio-share-consent:";

function getConsentKey(projectId: string) {
  return `${CONSENT_KEY_PREFIX}${projectId}`;
}

function hasConsent(projectId: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getConsentKey(projectId)) === "true";
}

function setConsent(projectId: string, value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getConsentKey(projectId), value ? "true" : "false");
}

export function OpportunityShare({ document, publishedDocument }: { document: SiteDocument; publishedDocument?: SiteDocument }) {
  const [shares, setShares] = useState<Share[]>([]);
  const [createdUrl, setCreatedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<Record<string, FeedbackResponse>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const publishedShared = publishedDocument?.opportunity.visibility === "shared";
  const consentGiven = hasConsent(document.projectId);

  useEffect(() => {
    if (!publishedShared) return;
    let live = true;
    fetch(`/api/projects/${document.projectId}/shares`)
      .then((response) => response.json())
      .then((data) => { if (live) setShares(data.shares ?? []); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [document.projectId, publishedShared]);

  async function create() {
    if (!consentGiven) {
      setShowConsent(true);
      return;
    }
    setBusy(true); setError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/shares`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create a link.");
      setCreatedUrl(`${window.location.origin}${data.url}`);
      setShares((list) => [data.share, ...list]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create a link."); }
    finally { setBusy(false); }
  }

  function handleConsentGiven() {
    setConsent(document.projectId, true);
    setShowConsent(false);
    create();
  }

  function handleConsentDeclined() {
    setShowConsent(false);
  }

  async function revoke(id: string) {
    setBusy(true); setError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/shares`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shareId: id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not revoke the link.");
      setShares((list) => list.map((item) => item.id === id ? { ...item, revoked_at: new Date().toISOString() } : item));
      setCreatedUrl("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not revoke the link."); }
    finally { setBusy(false); }
  }

  async function loadFeedback(shareId: string) {
    if (feedbackData[shareId]) { setFeedbackOpen(feedbackOpen === shareId ? null : shareId); return; }
    setFeedbackLoading(shareId);
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/shares/${shareId}/feedback`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load feedback.");
      setFeedbackData((prev) => ({ ...prev, [shareId]: data }));
      setFeedbackOpen(shareId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load feedback.");
    } finally { setFeedbackLoading(null); }
  }

  function openPreview(url: string) { window.open(url, "_blank", "noopener,noreferrer"); }

  if (document.opportunity.visibility !== "shared") return null;

  const activeShares = shares.filter((share) => !share.revoked_at && new Date(share.expires_at).getTime() > Date.now());
  const revokedShares = shares.filter((share) => share.revoked_at || new Date(share.expires_at).getTime() <= Date.now());

  return (
    <>
      {showConsent && (
        <OpportunityShareConsent
          onConsentGiven={handleConsentGiven}
          onConsentDeclined={handleConsentDeclined}
        />
      )}
      <section className="opportunity-planner" aria-label="Private opportunity links">
        <header>
          <strong>Private share links</strong>
          <small>Publish this opportunity as Shared first. Links expire after seven days and can be revoked at any time.</small>
        </header>
        {!publishedShared && <p>Publish the latest Shared version to enable private links.</p>}
        {!consentGiven && publishedShared && (
          <p className="consent-notice">Explicit consent is required before creating private links. Click "Create private link" to review and consent.</p>
        )}
        <button className="secondary-action" type="button" disabled={!publishedShared || busy} onClick={create}>
          {busy ? "Working&hellip;" : "Create private link"}
        </button>
      {createdUrl && (
        <div className="opportunity-share-url">
          <input aria-label="New private share URL" readOnly value={createdUrl} onFocus={(e) => e.target.select()} />
          <button type="button" onClick={() => void navigator.clipboard.writeText(createdUrl)}>Copy</button>
          <button type="button" className="icon-button" onClick={() => openPreview(createdUrl)} aria-label="Open share link in new tab">
            <ExternalLink size={16} />
          </button>
          <small>Copy this URL now; the token cannot be recovered later.</small>
        </div>
      )}
      {error && <p role="alert" className="field-error">{error}</p>}

      {activeShares.length > 0 && (
        <div className="opportunity-shares-list">
          <h4>Active links</h4>
          {activeShares.map((share) => {
            const hasFeedback = feedbackData[share.id] && feedbackData[share.id].count > 0;
            return (
              <div className="opportunity-share-row" key={share.id}>
                <div className="share-info">
                  <small>Active until {new Date(share.expires_at).toLocaleDateString()} &middot; {share.openCount ?? 0} hourly opens</small>
                  {hasFeedback && (
                    <span className="feedback-badge">
                      <MessageSquare size={12} /> {feedbackData[share.id].count} feedback
                    </span>
                  )}
                </div>
                <div className="share-actions">
                  <button type="button" className="icon-button" onClick={() => loadFeedback(share.id)} disabled={busy || feedbackLoading === share.id} aria-label={feedbackOpen === share.id ? "Hide feedback" : "View feedback"}>
                    <MessageSquare size={16} />
                  </button>
                  <button type="button" className="icon-button" onClick={() => openPreview(`/s/${share.id}`)} aria-label="Preview share link">
                    <Eye size={16} />
                  </button>
                  <button type="button" disabled={busy} onClick={() => revoke(share.id)}>Revoke</button>
                </div>
                {feedbackOpen === share.id && feedbackData[share.id] && (
                  <FeedbackPanel data={feedbackData[share.id]} onClose={() => setFeedbackOpen(null)} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {revokedShares.length > 0 && (
        <details className="opportunity-shares-revoked">
          <summary>Revoked or expired links ({revokedShares.length})</summary>
          {revokedShares.map((share) => (
            <div className="opportunity-share-row revoked" key={share.id}>
              <small>Expired {share.revoked_at ? "&middot; Revoked " + new Date(share.revoked_at).toLocaleDateString() : new Date(share.expires_at).toLocaleDateString()} &middot; {share.openCount ?? 0} hourly opens</small>
            </div>
          ))}
        </details>
      )}
    </section>
    </>
  );
}

function FeedbackPanel({ data, onClose }: { data: FeedbackResponse; onClose: () => void }) {
  const { feedback, average, count } = data;
  return (
    <div className="feedback-panel" role="region" aria-label="Recipient feedback">
      <header className="feedback-header">
        <strong>Recipient feedback ({count})</strong>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close feedback">&times;</button>
      </header>
      {average && (
        <div className="feedback-averages">
          <div className="avg-item"><span className="avg-label">Clarity</span><span className="avg-value">{average.clarity.toFixed(1)} / 5</span></div>
          <div className="avg-item"><span className="avg-label">Relevance</span><span className="avg-value">{average.relevance.toFixed(1)} / 5</span></div>
          <div className="avg-item"><span className="avg-label">Presentation</span><span className="avg-value">{average.presentation.toFixed(1)} / 5</span></div>
        </div>
      )}
      <div className="feedback-list">
        {feedback.map((f, i) => (
          <div className="feedback-item" key={i}>
            <div className="feedback-ratings">
              <span>Clarity: {f.clarity}/5</span>
              <span>Relevance: {f.relevance}/5</span>
              <span>Presentation: {f.presentation}/5</span>
            </div>
            {f.comment && <p className="feedback-comment">{f.comment}</p>}
            <time className="feedback-time" dateTime={f.submittedAt}>{new Date(f.submittedAt).toLocaleDateString()}</time>
          </div>
        ))}
        {count === 0 && <p className="feedback-empty">No feedback received yet.</p>}
      </div>
    </div>
  );
}