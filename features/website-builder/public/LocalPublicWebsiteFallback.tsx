"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicPortfolio } from "./public-portfolio";
import { PublicBlogIndex, PublicContentPage } from "./public-content";
import { PublicProjectsIndex } from "./public-projects-index";
import { PublicCaseStudy } from "./public-case-study";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import {
  getLocalWebsiteBySlug,
  type LocalWebsiteRecord,
} from "@/features/website-builder/lib/local-websites-store";

export type LocalPublicFallbackView =
  | { kind: "home" }
  | { kind: "blog-index" }
  | { kind: "blog-post"; postSlug: string }
  | { kind: "page"; pageSlug: string }
  | { kind: "projects-index" }
  | { kind: "project-detail"; projectSlug: string };

export function LocalPublicWebsiteFallback({
  slug,
  view,
}: {
  slug: string;
  view: LocalPublicFallbackView;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [record, setRecord] = useState<LocalWebsiteRecord | null>(null);

  useEffect(() => {
    const sync = () => {
      setRecord(getLocalWebsiteBySlug(slug));
      setHydrated(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("doitwithai-local-websites-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("doitwithai-local-websites-updated", sync);
    };
  }, [slug]);

  if (!hydrated) {
    return (
      <main className="website-builder-scope flow-page">
        <div className="empty-projects">
          <h2>Loading website preview…</h2>
          <p>Checking browser local workspace for /p/{slug}.</p>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/ai-website-builder">AI Website Builder</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/ai-website-builder/start">Create Website</Link>
        </header>
        <div className="empty-projects">
          <h2>Website /p/{slug} not found in this browser</h2>
          <p>
            This URL has not been published to the cloud yet and no matching draft was found in this browser&apos;s local storage.
          </p>
          <div className="flow-actions">
            <Link className="primary-action" href="/ai-website-builder/start">
              Create Website in Browser →
            </Link>
            <Link className="secondary-action" href="/ai-website-builder/studio/demo">
              Open Interactive Demo Studio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const document = record.publication?.document ?? record.document;

  const previewBanner = (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "rgba(6, 10, 22, 0.94)",
        borderBottom: "1px solid rgba(99, 102, 241, 0.35)",
        padding: "8px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        fontSize: "12px",
        color: "#e2e8f0",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.16)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#6ee7b7",
            fontWeight: 700,
            fontSize: "10.5px",
          }}
        >
          ● LIVE LOCAL STORAGE PREVIEW
        </span>
        <strong>{record.name}</strong>
        <span style={{ color: "#94a3b8" }}>(/p/{slug})</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Link
          href={`/ai-website-builder/studio/${record.id}`}
          style={{
            padding: "5px 11px",
            borderRadius: "8px",
            background: "#6366f1",
            color: "#ffffff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Edit in Website Studio →
        </Link>
        <Link
          href={`/ai-content-writer?targetSiteId=${encodeURIComponent(record.id)}`}
          style={{
            padding: "5px 11px",
            borderRadius: "8px",
            border: "1px solid rgba(56, 189, 248, 0.45)",
            background: "rgba(56, 189, 248, 0.12)",
            color: "#7dd3fc",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Write Blog Post for This Site →
        </Link>
      </div>
    </div>
  );

  if (view.kind === "home") {
    return (
      <>
        {previewBanner}
        <PublicPortfolio document={document} slug={slug} />
      </>
    );
  }

  if (view.kind === "blog-index") {
    return (
      <>
        {previewBanner}
        <PublicBlogIndex document={document} portfolioSlug={slug} />
      </>
    );
  }

  if (view.kind === "blog-post") {
    const post = document.publishing.posts.find((p) => p.slug === view.postSlug);
    if (!post) {
      return (
        <>
          {previewBanner}
          <PublicBlogIndex document={document} portfolioSlug={slug} />
        </>
      );
    }
    return (
      <>
        {previewBanner}
        <PublicContentPage
          document={document}
          portfolioSlug={slug}
          item={post}
          kind="post"
        />
      </>
    );
  }

  if (view.kind === "page") {
    const page = document.publishing.pages.find((p) => p.slug === view.pageSlug);
    if (!page) {
      return (
        <>
          {previewBanner}
          <PublicPortfolio document={document} slug={slug} />
        </>
      );
    }
    return (
      <>
        {previewBanner}
        <PublicContentPage
          document={document}
          portfolioSlug={slug}
          item={page}
          kind="page"
        />
      </>
    );
  }

  if (view.kind === "projects-index") {
    return (
      <>
        {previewBanner}
        <PublicProjectsIndex document={document} portfolioSlug={slug} />
      </>
    );
  }

  const project =
    projectsForPresentation(document).find(
      (p) => p.caseStudySlug === view.projectSlug,
    ) ?? document.content.projects[0];

  if (!project) {
    return (
      <>
        {previewBanner}
        <PublicPortfolio document={document} slug={slug} />
      </>
    );
  }

  return (
    <>
      {previewBanner}
      <PublicCaseStudy
        document={document}
        portfolioSlug={slug}
        project={project}
      />
    </>
  );
}
