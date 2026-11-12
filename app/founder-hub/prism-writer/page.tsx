import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import FounderLoginGate from "@/features/founder-hub/FounderLoginGate";
import { COOKIE_NAME, getExpectedPasskeys } from "@/lib/founder-hub/auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prism Forge · Writer Workspace Handbook | Founder Hub",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};
export default async function WriterHandbook() {
  const session = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session || !getExpectedPasskeys().includes(session))
    return <FounderLoginGate />;
  const handbook = fs.readFileSync(
    path.join(process.cwd(), "docs", "PRISM_FORGE_WRITER_WORKSPACE.md"),
    "utf8",
  );
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100">
      <article className="mx-auto max-w-5xl">
        <a href="/founder-hub" className="text-sm text-indigo-300 underline">
          ← Founder Hub
        </a>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-indigo-300">
          Prism Forge · Visual Systems Engineer
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Writer workspace implementation handbook
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Design decisions, orchestration, feature contracts, activity records,
          and manual testing.
        </p>
        <a
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold"
          href="/ai-content-writer"
        >
          Open the writer
        </a>
        <pre className="mt-8 whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-6 font-mono text-xs leading-7 text-slate-200">
          {handbook}
        </pre>
      </article>
    </main>
  );
}
