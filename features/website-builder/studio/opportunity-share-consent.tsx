"use client";

import { useState } from "react";
import { Shield, CheckCircle2, XCircle } from "lucide-react";

export function OpportunityShareConsent({
  onConsentGiven,
  onConsentDeclined,
}: {
  onConsentGiven: () => void;
  onConsentDeclined: () => void;
}) {
  const [consented, setConsented] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);

  const canProceed = consented && readPrivacy;

  return (
    <section className="opportunity-share-consent" aria-label="Share consent required">
      <header className="consent-header">
        <Shield size={24} className="consent-icon" />
        <div>
          <strong>Explicit consent required for private sharing</strong>
          <small>This opportunity variant is published as <em>Shared</em>. Private links allow anyone with the URL to view this portfolio for 7 days.</small>
        </div>
      </header>

      <div className="consent-details">
        <h4>What this means</h4>
        <ul>
          <li><CheckCircle2 size={14} /> A unique, unguessable link is created (<code>/s/[token]</code>)</li>
          <li><CheckCircle2 size={14} /> Link expires automatically after <strong>7 days</strong></li>
          <li><CheckCircle2 size={14} /> You can revoke the link at any time from this panel</li>
          <li><CheckCircle2 size={14} /> Recipients see <strong>only</strong> this opportunity variant &mdash; not your canonical portfolio</li>
          <li><CheckCircle2 size={14} /> Recipients can submit anonymous feedback (clarity, relevance, presentation)</li>
        </ul>

        <h4>Privacy boundaries</h4>
        <ul>
          <li><XCircle size={14} /> No IP addresses, device IDs, or personal data are collected from recipients</li>
          <li><XCircle size={14} /> Open counts are coarse: at most <strong>one event per hour per link</strong></li>
          <li><XCircle size={14} /> Feedback is anonymous and not linked to any identity</li>
          <li><XCircle size={14} /> The token itself is <strong>never stored in plaintext</strong> &mdash; only a SHA-256 hash</li>
          <li><XCircle size={14} /> Shared links are <code>noindex, nofollow, noarchive</code> and send <code>Referrer-Policy: no-referrer</code></li>
        </ul>

        <label className="privacy-ack">
          <input
            type="checkbox"
            checked={readPrivacy}
            onChange={(e) => setReadPrivacy(e.target.checked)}
          />
          <span>I have read and understand the privacy boundaries above</span>
        </label>

        <label className="consent-ack">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            disabled={!readPrivacy}
          />
          <span>I consent to creating private share links for this opportunity variant</span>
        </label>
      </div>

      <footer className="consent-actions">
        <button
          type="button"
          className="secondary-action"
          onClick={onConsentDeclined}
        >
          Not now
        </button>
        <button
          type="button"
          className="primary-action"
          disabled={!canProceed}
          onClick={onConsentGiven}
        >
          {canProceed ? "I consent &mdash; enable private sharing" : "Read privacy terms first"}
        </button>
      </footer>
    </section>
  );
}