"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import {
  validateSiteDocument,
  type SiteDocument,
} from "@/features/website-builder/domain/site-document";
import { VisitorKnowledge } from "./visitor-knowledge";

export function WebsiteSettingsClientLoader({
  projectId,
}: {
  projectId: string;
}) {
  const { user, ready, signIn, signingIn } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{
    name: string;
    document: SiteDocument;
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
        const data = (await res.json().catch(() => ({}))) as {
          project?: { name: string; document: unknown };
          error?: string;
        };
        if (!res.ok || !data.project) {
          setError(data.error || "Could not load website settings.");
          setLoading(false);
          return;
        }
        setLoaded({
          name: data.project.name,
          document: validateSiteDocument(data.project.document),
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error loading settings.",
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
          <Link href={`/do-it-ai/website-studio/${projectId}`}>
            Open Studio
          </Link>
        </header>
        <div className="empty-projects">
          <h2>Loading Visitor AI Agent &amp; Project Settings…</h2>
        </div>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/do-it-ai">Workspace</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/ai-website-builder">Website Builder</Link>
        </header>
        <section className="flow-card claim-card">
          <p className="eyebrow">SIGN IN REQUIRED</p>
          <h1>Sign in to manage Visitor AI Agent settings</h1>
          <p>
            Knowledge documents, visitor controls, and analytics belong to your
            Google workspace account.
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
          <Link href="/ai-website-builder">Website Builder</Link>
        </header>
        <div className="empty-projects">
          <h2>Settings unavailable</h2>
          <p>{error || "Could not load this website project."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="website-builder-scope flow-page wide">
      <header className="flow-nav">
        <div className="flow-nav-start">
          <Link href="/do-it-ai">
            <ArrowLeft size={14} style={{ display: "inline", marginRight: 6 }} />
            Back to /do-it-ai
          </Link>
        </div>
        <strong className="flow-brand">
          {loaded.name} · Visitor AI Agent Settings
        </strong>
        <Link href={`/do-it-ai/website-studio/${projectId}`}>
          Edit in Website Studio
        </Link>
      </header>

      <VisitorKnowledge projectId={projectId} initialDocument={loaded.document} />
    </main>
  );
}
