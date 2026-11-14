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

  if (view.kind === "home") {
    return <PublicPortfolio document={document} slug={slug} />;
  }

  if (view.kind === "blog-index") {
    return <PublicBlogIndex document={document} portfolioSlug={slug} />;
  }

  if (view.kind === "blog-post") {
    const post = document.publishing.posts.find((p) => p.slug === view.postSlug);
    if (!post) {
      return <PublicBlogIndex document={document} portfolioSlug={slug} />;
    }
    return (
      <PublicContentPage
        document={document}
        portfolioSlug={slug}
        item={post}
        kind="post"
      />
    );
  }

  if (view.kind === "page") {
    const page = document.publishing.pages.find((p) => p.slug === view.pageSlug);
    if (!page) {
      return <PublicPortfolio document={document} slug={slug} />;
    }
    return (
      <PublicContentPage
        document={document}
        portfolioSlug={slug}
        item={page}
        kind="page"
      />
    );
  }

  if (view.kind === "projects-index") {
    return <PublicProjectsIndex document={document} portfolioSlug={slug} />;
  }

  const project =
    projectsForPresentation(document).find(
      (p) => p.caseStudySlug === view.projectSlug,
    ) ?? document.content.projects[0];

  if (!project) {
    return <PublicPortfolio document={document} slug={slug} />;
  }

  return (
    <PublicCaseStudy
      document={document}
      portfolioSlug={slug}
      project={project}
    />
  );
}
