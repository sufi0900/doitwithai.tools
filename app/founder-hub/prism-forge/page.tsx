import React from "react";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import FounderLoginGate from "@/features/founder-hub/FounderLoginGate";
import { COOKIE_NAME, getExpectedPasskeys } from "@/lib/founder-hub/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prism Forge · Infographic Handbook | Founder Hub",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

/** Feature-scoped documentation. Reuse the existing founder session; read no other hub data. */
export default async function PrismForgeHandbookPage() {
  const session = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session || !getExpectedPasskeys().includes(session))
    return <FounderLoginGate />;
  const handbook = fs.readFileSync(
    path.join(process.cwd(), "docs", "PRISM_FORGE_INFOGRAPHIC_HANDBOOK.md"),
    "utf8",
  );
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <article className="mx-auto max-w-5xl">
        <a className="text-sm text-indigo-300 underline" href="/founder-hub">
          ← Founder Hub
        </a>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-indigo-300">
          Prism Forge · Visual Systems Engineer
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Infographic implementation handbook
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          The layout contracts, drawing techniques, branding rules, activity
          ledger and manual tests for the blog infographic studio and its shared
          writer visuals.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <a
            className="rounded-xl bg-indigo-600 px-4 py-3 font-bold"
            href="/tools/blog-section-infographic-generator"
          >
            Open infographic studio
          </a>
          <a
            className="rounded-xl border border-slate-700 px-4 py-3"
            href="https://github.com/sufi0900/doitwithai.tools/blob/codex/infographic-studio-redesign/docs/PRISM_FORGE_INFOGRAPHIC_HANDBOOK.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read formatted handbook on GitHub
          </a>
          <a
            className="rounded-xl border border-slate-700 px-4 py-3"
            href="/founder-hub/prism-writer"
          >
            Writer workspace handbook
          </a>
        </div>
        <pre className="mt-8 whitespace-pre-wrap break-words rounded-2xl border border-slate-800 bg-slate-900 p-5 font-mono text-xs leading-7 text-slate-200 sm:p-8 sm:text-sm">
          {handbook}
        </pre>
      </article>
    </main>
  );
}
