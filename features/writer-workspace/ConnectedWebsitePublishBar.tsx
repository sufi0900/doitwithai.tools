"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  convertWriterArticleToSitePostPayload,
  type ConnectedWebsiteSummary,
  type WriterArticleBridgeInput,
} from "../website-builder/ecosystem-bridge";

export interface ConnectedWebsitePublishBarProps {
  article: WriterArticleBridgeInput;
  connectedWebsites: ConnectedWebsiteSummary[];
  initialSelectedSiteId?: string;
  onSyncToWebsite?: (
    websiteId: string,
    payload: ReturnType<typeof convertWriterArticleToSitePostPayload>,
    publishImmediately: boolean
  ) => Promise<{ ok: boolean; liveUrl?: string; error?: string }>;
}

/**
 * Renders at the bottom of the AI Content Writer Studio (`ArticleEditor` / `SearchAppearancePanel`)
 * to give the user two seamless post-writing choices:
 * 1. Standard Export / Copy (HTML, Markdown, PDF, Word) for external websites.
 * 2. 1-Click "Publish to My Connected Website" for any website built in the DoItWithAI Website Builder.
 */
export function ConnectedWebsitePublishBar({
  article,
  connectedWebsites,
  initialSelectedSiteId,
  onSyncToWebsite,
}: ConnectedWebsitePublishBarProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSelectedSiteId || connectedWebsites[0]?.projectId || ""
  );
  const [pillarSlug, setPillarSlug] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [publishedUrl, setPublishedUrl] = useState<string>("");

  const selectedWebsite = connectedWebsites.find((w) => w.projectId === selectedSiteId);

  async function handlePush(publishImmediately: boolean) {
    if (!selectedWebsite) return;
    setBusy(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const payload = convertWriterArticleToSitePostPayload({
        ...article,
        publishImmediately,
      });
      if (onSyncToWebsite) {
        const res = await onSyncToWebsite(selectedWebsite.projectId, payload, publishImmediately);
        if (!res.ok) {
          setErrorMessage(res.error || "Could not sync article to the selected website.");
        } else {
          const targetPath =
            res.liveUrl ||
            (selectedWebsite.publicSlug
              ? `/p/${selectedWebsite.publicSlug}/blog/${payload.slug}`
              : `/do-it-ai/website-studio/${selectedWebsite.projectId}`);
          setPublishedUrl(targetPath);
          setStatusMessage(
            publishImmediately
              ? `Published live to "${selectedWebsite.name}" (${payload.blocks.length} structured blocks synced).`
              : `Saved as a reviewable draft inside "${selectedWebsite.name}" (${payload.blocks.length} blocks).`
          );
        }
      } else {
        const targetPath = selectedWebsite.publicSlug
          ? `/p/${selectedWebsite.publicSlug}/blog/${payload.slug}`
          : `/do-it-ai/website-studio/${selectedWebsite.projectId}`;
        setPublishedUrl(targetPath);
        setStatusMessage(
          `Prepared ${payload.blocks.length} governed blocks for "${selectedWebsite.name}". Open Website Studio to review and publish.`
        );
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Publish article to your connected DoItWithAI website"
      style={{
        marginTop: "16px",
        padding: "18px 20px",
        borderRadius: "14px",
        border: "1px solid rgba(56, 189, 248, 0.32)",
        background:
          "linear-gradient(135deg, rgba(10, 16, 31, 0.94), rgba(15, 23, 42, 0.92))",
        display: "grid",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span
            style={{
              color: "#38bdf8",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            CONNECTED WEBSITE PUBLISHER · 1-CLICK BRIDGE
          </span>
          <h4 style={{ margin: "4px 0 0", fontSize: "15px", color: "#f8fafc" }}>
            {connectedWebsites.length > 0
              ? "Publish This Article Directly to Your Connected Website"
              : "Don't Have a Website Yet? Launch One in 60 Seconds"}
          </h4>
        </div>
        <Link
          href="/do-it-ai"
          style={{
            fontSize: "12px",
            color: "#7dd3fc",
            textDecoration: "none",
          }}
        >
          Open Unified Workspace (/do-it-ai) →
        </Link>
      </div>

      {connectedWebsites.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            You can export this article below for an external CMS, or create a blog/brand website with our{" "}
            <strong style={{ color: "#e2e8f0" }}>AI &amp; Voice Website Builder</strong> and publish articles in 1 click.
          </p>
          <Link
            href="/ai-website-builder/start"
            style={{
              padding: "9px 15px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              color: "#061018",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Create My Blog / Brand Website →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#cbd5e1" }}>
              <span>Target Connected Website</span>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  background: "#070c18",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                {connectedWebsites.map((site) => (
                  <option key={site.projectId} value={site.projectId}>
                    {site.name} ({site.publicSlug ? `/p/${site.publicSlug}` : "Draft"} · {site.publishedPostCount} posts)
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#cbd5e1" }}>
              <span>Topic Cluster Pillar Slug (Optional Hub-and-Spoke)</span>
              <input
                type="text"
                value={pillarSlug}
                onChange={(e) => setPillarSlug(e.target.value)}
                placeholder="e.g. ai-seo-guide"
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  background: "#070c18",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              />
            </label>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              disabled={busy || !selectedWebsite}
              onClick={() => void handlePush(false)}
              style={{
                padding: "9px 14px",
                borderRadius: "9px",
                border: "1px solid rgba(56, 189, 248, 0.45)",
                background: "rgba(56, 189, 248, 0.1)",
                color: "#7dd3fc",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {busy ? "Syncing…" : "Send as Website Draft"}
            </button>

            <button
              type="button"
              disabled={busy || !selectedWebsite}
              onClick={() => void handlePush(true)}
              style={{
                padding: "9px 16px",
                borderRadius: "9px",
                border: 0,
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                color: "#041311",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {busy ? "Publishing…" : `Publish Live to ${selectedWebsite?.name ?? "Website"}`}
            </button>

            {publishedUrl && (
              <Link
                href={publishedUrl}
                style={{
                  fontSize: "12px",
                  color: "#6ee7b7",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                View on Website ({publishedUrl}) →
              </Link>
            )}
          </div>
        </>
      )}

      {statusMessage && (
        <p style={{ margin: 0, fontSize: "12px", color: "#6ee7b7" }} role="status">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p style={{ margin: 0, fontSize: "12px", color: "#fda4af" }} role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
