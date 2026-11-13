"use client";

import React from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { ClaimDemo } from "@/features/website-builder/start/claim-demo";

export default function ClaimWebsitePage() {
  const { user, ready, signIn, signingIn } = useWorkspace();

  if (!ready) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/ai-website-builder">Website Builder</Link>
          <Link className="flow-brand" href="/do-it-ai">
            DOITWITHAI STUDIO
          </Link>
          <Link href="/do-it-ai/website-studio/demo">Try demo</Link>
        </header>
        <div className="empty-projects">
          <h2>Checking your Google workspace session…</h2>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/ai-website-builder">Website Builder</Link>
          <Link className="flow-brand" href="/do-it-ai">
            DOITWITHAI STUDIO
          </Link>
          <Link href="/do-it-ai/website-studio/demo">Back to demo</Link>
        </header>
        <section className="flow-card claim-card">
          <p className="eyebrow">SIGN IN REQUIRED</p>
          <h1>Claim your browser draft with Google</h1>
          <p>
            Sign in with your Google account so we can attach the interactive
            demo draft saved in this browser to your private DoItWithAI cloud
            workspace.
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
            <Link className="secondary-action" href="/do-it-ai/website-studio/demo">
              Return to demo studio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <ClaimDemo email={user.email ?? "your Google account"} />;
}
