"use client";

import React from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { CreationFlow } from "@/features/website-builder/start/creation-flow";

export default function StartWebsitePage() {
  const { user, ready, signIn } = useWorkspace();

  const metaName =
    (typeof user?.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    (typeof user?.user_metadata?.name === "string" && user.user_metadata.name) ||
    user?.email?.split("@")[0] ||
    "";

  const suggestedName = metaName.trim().slice(0, 60);

  return (
    <main className="website-builder-scope flow-page wide">
      <header className="flow-nav">
        <Link href="/do-it-ai/website-studio/demo">Try live demo</Link>
        <Link className="flow-brand" href="/do-it-ai">
          DOITWITHAI STUDIO
        </Link>
        {user ? (
          <Link href="/do-it-ai">My workspace</Link>
        ) : (
          <button
            type="button"
            className="text-action"
            onClick={() => void signIn()}
          >
            Sign in with Google
          </button>
        )}
      </header>

      <div className="flow-heading">
        <p className="eyebrow">VOICE-DIRECTED &amp; TEMPLATE CREATION</p>
        <h1>Build your website with Do It AI Agent.</h1>
        <p>
          Describe your blog, brand, SaaS, or 3D portfolio by voice, or choose
          from 16 editorial and WebGL templates. Every website syncs seamlessly
          with AI Content Writer.
        </p>
      </div>

      {!ready ? (
        <div className="empty-projects">
          <h2>Loading your DoItWithAI session…</h2>
          <p>Checking Google workspace credentials.</p>
        </div>
      ) : (
        <CreationFlow
          authenticated={Boolean(user)}
          suggestedName={suggestedName}
          ownerId={user?.id ?? "guest"}
        />
      )}
    </main>
  );
}
