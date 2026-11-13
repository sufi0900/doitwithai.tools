"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { validateSiteDocument, type SiteDocument } from "@/features/website-builder/domain/site-document";
import { PortfolioStudio } from "./portfolio-studio";

interface ApiProjectResponse {
  project?: {
    id: string;
    name: string;
    document: unknown;
    revision: number;
  };
  publication?: {
    slug: string;
    revision: number;
    published_at: string;
    document?: unknown;
  } | null;
  publishedDocument?: unknown;
  error?: string;
}

export function WebsiteStudioClientLoader({
  projectId,
  welcomeFromVox = false,
}: {
  projectId: string;
  welcomeFromVox?: boolean;
}) {
  const { user, ready, signIn, signingIn } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{
    document: SiteDocument;
    projectName: string;
    publication?: {
      slug: string;
      revision: number;
      published_at: string;
      document?: SiteDocument;
    };
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      setUnauthorized(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setUnauthorized(false);
    setError(null);

    void (async () => {
      try {
        const res = await authorizedWebsiteFetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        const data = (await res.json().catch(() => ({}))) as ApiProjectResponse;
        if (!res.ok || !data.project) {
          setError(data.error || "Could not load this website project.");
          setLoading(false);
          return;
        }

        const doc = validateSiteDocument(data.project.document);
        const pubRaw = data.publication;
        const pubDocRaw = data.publishedDocument ?? pubRaw?.document;
        const publication = pubRaw
          ? {
              slug: pubRaw.slug,
              revision: pubRaw.revision,
              published_at: pubRaw.published_at,
              document: pubDocRaw ? validateSiteDocument(pubDocRaw) : undefined,
            }
          : undefined;

        setLoaded({
          document: { ...doc, revision: data.project.revision },
          projectName: data.project.name,
          publication,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error loading your studio.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, projectId]);

  if (!ready || loading) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/do-it-ai">Workspace</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/ai-website-builder">Website Builder</Link>
        </header>
        <div className="empty-projects">
          <h2>Opening your Website Studio…</h2>
          <p>Syncing draft document, template design, and blog posts.</p>
        </div>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/ai-website-builder">Website Builder</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/do-it-ai/website-studio/demo">Try Interactive Demo</Link>
        </header>
        <section className="flow-card claim-card">
          <p className="eyebrow">GOOGLE WORKSPACE SIGN-IN REQUIRED</p>
          <h1>Sign in to edit this private website</h1>
          <p>
            Saved website drafts are private to your DoItWithAI Google account.
            Sign in to continue editing, or explore the open browser demo first.
          </p>
          <div className="flow-actions">
            <button
              type="button"
              className="primary-action"
              disabled={signingIn}
              onClick={() => void signIn()}
            >
              {signingIn ? "Connecting to Google…" : "Sign in with Google"}
            </button>
            <Link
              className="secondary-action"
              href="/do-it-ai/website-studio/demo"
            >
              Open Interactive Flagship Demo
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (error || !loaded) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/do-it-ai">Back to /do-it-ai</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/ai-website-builder/start">Create new website</Link>
        </header>
        <div className="empty-projects">
          <h2>Website not available</h2>
          <p>{error || "We could not find that website project."}</p>
          <div className="flow-actions">
            <Link className="primary-action" href="/do-it-ai">
              Return to Unified Workspace
            </Link>
            <Link
              className="secondary-action"
              href="/do-it-ai/website-studio/demo"
            >
              Launch Demo Studio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PortfolioStudio
      initialDocument={loaded.document}
      projectName={loaded.projectName}
      persistence="server"
      initialPublication={loaded.publication}
      authenticated
      userEmail={user?.email ?? undefined}
      welcomeFromVox={welcomeFromVox}
    />
  );
}
