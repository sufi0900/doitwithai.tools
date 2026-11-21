"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  convertWriterArticleToSitePostPayload,
  type ConnectedWebsiteSummary,
  type WriterArticleBridgeInput,
} from "../website-builder/ecosystem-bridge";
import {
  getLocalWebsiteRecord,
  getSelectedWriterTargetSiteId,
  listLocalWebsitesAsConnectedSummaries,
  setSelectedWriterTargetSiteId,
  upsertWriterArticleIntoLocalWebsite,
} from "../website-builder/lib/local-websites-store";

export interface ConnectedWebsitePublishBarProps {
  article: WriterArticleBridgeInput;
  connectedWebsites: ConnectedWebsiteSummary[];
  initialSelectedSiteId?: string;
  onSelectWebsite?: (websiteId: string) => void;
  onSyncToWebsite?: (
    websiteId: string,
    payload: ReturnType<typeof convertWriterArticleToSitePostPayload>,
    publishImmediately: boolean
  ) => Promise<{ ok: boolean; liveUrl?: string; error?: string }>;
}

/**
 * Renders at the bottom of the AI Content Writer Studio (`ArticleEditor` / `SearchAppearancePanel`)
 * to give the user seamless post-writing publishing:
 * - Automatically detects both browser `localStorage` websites and cloud-synced websites.
 * - If 1 website exists: provides direct 1-click publishing to that website.
 * - If 2+ websites exist: renders a "Publish to Where?" dropdown so the user chooses which
 *   created website receives the blog post.
 */
export function ConnectedWebsitePublishBar({
  article,
  connectedWebsites,
  initialSelectedSiteId,
  onSelectWebsite,
  onSyncToWebsite,
}: ConnectedWebsitePublishBarProps) {
  const [localWebsites, setLocalWebsites] = useState<ConnectedWebsiteSummary[]>(
    [],
  );

  useEffect(() => {
    const syncLocal = () => {
      setLocalWebsites(listLocalWebsitesAsConnectedSummaries());
    };
    syncLocal();
    window.addEventListener("storage", syncLocal);
    window.addEventListener("doitwithai-local-websites-updated", syncLocal);
    return () => {
      window.removeEventListener("storage", syncLocal);
      window.removeEventListener("doitwithai-local-websites-updated", syncLocal);
    };
  }, []);

  const allWebsites = useMemo(() => {
    const seen = new Set<string>();
    return [...localWebsites, ...connectedWebsites].filter((site) => {
      if (seen.has(site.projectId)) return false;
      seen.add(site.projectId);
      return true;
    });
  }, [localWebsites, connectedWebsites]);

  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSelectedSiteId ||
      getSelectedWriterTargetSiteId() ||
      allWebsites[0]?.projectId ||
      "",
  );

  useEffect(() => {
    const storedTarget = getSelectedWriterTargetSiteId();
    const candidate = initialSelectedSiteId || storedTarget;
    if (candidate && allWebsites.some((w) => w.projectId === candidate)) {
      setSelectedSiteId(candidate);
      onSelectWebsite?.(candidate);
      return;
    }
    if (!selectedSiteId && allWebsites[0]?.projectId) {
      setSelectedSiteId(allWebsites[0].projectId);
      onSelectWebsite?.(allWebsites[0].projectId);
    }
  }, [initialSelectedSiteId, allWebsites, selectedSiteId, onSelectWebsite]);

  useEffect(() => {
    const onTargetChanged = (event: Event) => {
      const custom = event as CustomEvent<{ siteId?: string }>;
      const nextId = custom.detail?.siteId;
      if (nextId && allWebsites.some((w) => w.projectId === nextId)) {
        setSelectedSiteId(nextId);
        onSelectWebsite?.(nextId);
      }
    };
    window.addEventListener("doitwithai-target-site-changed", onTargetChanged);
    return () =>
      window.removeEventListener(
        "doitwithai-target-site-changed",
        onTargetChanged,
      );
  }, [allWebsites, onSelectWebsite]);

  const [pillarSlug, setPillarSlug] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [publishedUrl, setPublishedUrl] = useState<string>("");

  const selectedWebsite =
    allWebsites.find((w) => w.projectId === selectedSiteId) ?? allWebsites[0];

  async function handlePush(publishImmediately: boolean) {
    if (!selectedWebsite) return;
    setBusy(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const payload = convertWriterArticleToSitePostPayload({
        ...article,
        pillarClusterSlug: pillarSlug.trim() || undefined,
        publishImmediately,
      });

      const isLocalRecord = Boolean(
        getLocalWebsiteRecord(selectedWebsite.projectId),
      );

      if (isLocalRecord) {
        const localRes = upsertWriterArticleIntoLocalWebsite(
          selectedWebsite.projectId,
          {
            type: "publishing.upsertFromWriterStudio",
            sourceArticleProjectId: payload.sourceArticleProjectId,
            title: payload.title,
            slug: payload.slug,
            seoTitle: payload.seoTitle,
            seoDescription: payload.seoDescription,
            excerpt: payload.excerpt,
            tags: payload.tags,
            pillarClusterSlug: payload.pillarClusterSlug,
            blocks: payload.blocks,
            publishImmediately,
          },
          publishImmediately,
        );
        if (!localRes.ok) {
          setErrorMessage(
            localRes.error || "Could not publish article to local website.",
          );
        } else {
          setPublishedUrl(
            localRes.liveUrl ||
              `/ai-website-builder/studio/${selectedWebsite.projectId}`,
          );
          setStatusMessage(
            localRes.message ||
              `Synced "${payload.title}" to "${selectedWebsite.name}".`,
          );
          setLocalWebsites(listLocalWebsitesAsConnectedSummaries());
        }
        return;
      }

      if (onSyncToWebsite) {
        const res = await onSyncToWebsite(
          selectedWebsite.projectId,
          payload,
          publishImmediately,
        );
        if (!res.ok) {
          setErrorMessage(
            res.error || "Could not sync article to the selected website.",
          );
        } else {
          const targetPath =
            res.liveUrl ||
            (selectedWebsite.publicSlug
              ? `/p/${selectedWebsite.publicSlug}/blog/${payload.slug}`
              : `/ai-website-builder/studio/${selectedWebsite.projectId}`);
          setPublishedUrl(targetPath);
          setStatusMessage(
            publishImmediately
              ? `Published live to "${selectedWebsite.name}" (${payload.blocks.length} structured blocks synced).`
              : `Saved as a reviewable draft inside "${selectedWebsite.name}" (${payload.blocks.length} blocks).`,
          );
        }
      } else {
        const targetPath = selectedWebsite.publicSlug
          ? `/p/${selectedWebsite.publicSlug}/blog/${payload.slug}`
          : `/ai-website-builder/studio/${selectedWebsite.projectId}`;
        setPublishedUrl(targetPath);
        setStatusMessage(
          `Prepared ${payload.blocks.length} governed blocks for "${selectedWebsite.name}". Open Website Studio to review and publish.`,
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
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
            CONNECTED WEBSITE PUBLISHER · 1-CLICK BRIDGE ({allWebsites.length}{" "}
            WEBSITE{allWebsites.length === 1 ? "" : "S"} DETECTED)
          </span>
          <h4 style={{ margin: "4px 0 0", fontSize: "15px", color: "#f8fafc" }}>
            {allWebsites.length === 0
              ? "Don't Have a Website Yet? Launch One in 60 Seconds"
              : allWebsites.length === 1
                ? `1-Click Publish to "${allWebsites[0].name}"`
                : "Publish to Where? Choose Which Website Receives This Blog Post"}
          </h4>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/ai-website-builder/start"
            style={{
              fontSize: "12px",
              color: "#a5b4fc",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            + Create New Website
          </Link>
          <Link
            href="/do-it-ai?view=websites"
            style={{
              fontSize: "12px",
              color: "#7dd3fc",
              textDecoration: "none",
            }}
          >
            Manage Websites (/do-it-ai) →
          </Link>
        </div>
      </div>

      {allWebsites.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            You can export this article below for an external CMS, or create an AI tools, blog, or brand website with our{" "}
            <strong style={{ color: "#e2e8f0" }}>
              AI &amp; Voice Website Builder
            </strong>{" "}
            (no sign-in required) and publish articles in 1 click.
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
            Create My Website Now →
          </Link>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: "5px",
                fontSize: "12px",
                color: "#cbd5e1",
              }}
            >
              <span>
                {allWebsites.length > 1
                  ? "Publish to Where? (Select Target Website)"
                  : "Target Connected Website"}
              </span>
              <select
                value={selectedWebsite?.projectId ?? ""}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedSiteId(nextId);
                  setSelectedWriterTargetSiteId(nextId);
                  onSelectWebsite?.(nextId);
                }}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  background: "#070c18",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                {allWebsites.map((site) => (
                  <option key={site.projectId} value={site.projectId}>
                    {site.name} (
                    {site.publicSlug ? `/p/${site.publicSlug}` : "Local Draft"}{" "}
                    · {site.publishedPostCount} posts)
                  </option>
                ))}
              </select>
            </label>

            <label
              style={{
                display: "grid",
                gap: "5px",
                fontSize: "12px",
                color: "#cbd5e1",
              }}
            >
              <span>Topic Cluster Pillar Slug (Optional Hub-and-Spoke)</span>
              <input
                type="text"
                value={pillarSlug}
                onChange={(e) => setPillarSlug(e.target.value)}
                placeholder="e.g. meta-title-generator"
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

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
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
              {busy ? "Syncing…" : `Save as Draft in "${selectedWebsite?.name ?? "Website"}"`}
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
              {busy
                ? "Publishing…"
                : `Publish Live to "${selectedWebsite?.name ?? "Website"}"`}
            </button>

            {selectedWebsite && (
              <Link
                href={`/ai-website-builder/studio/${selectedWebsite.projectId}`}
                style={{
                  fontSize: "12px",
                  color: "#a5b4fc",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Open Studio →
              </Link>
            )}

            {publishedUrl && (
              <Link
                href={publishedUrl}
                style={{
                  fontSize: "12px",
                  color: "#6ee7b7",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                View Published Article ({publishedUrl}) →
              </Link>
            )}
          </div>
        </>
      )}

      {statusMessage && (
        <p
          style={{ margin: 0, fontSize: "12px", color: "#6ee7b7" }}
          role="status"
        >
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p
          style={{ margin: 0, fontSize: "12px", color: "#fda4af" }}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
}
