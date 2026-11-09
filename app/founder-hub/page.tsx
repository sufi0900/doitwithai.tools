import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import FounderCommandCenterClient from "@/features/founder-hub/FounderCommandCenterClient";
import { COOKIE_NAME, getExpectedPasskeys } from "@/app/api/founder-hub/auth/route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founder & Multi-AI Command Center | DoItWithAI.tools (Internal)",
  description:
    "Protected internal command center, 15-sheet SEO/Keyword studio, architecture dependency manual, and multi-AI collaboration ledger for DoItWithAI.tools.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
    },
  },
};

export default async function FounderHubPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const expected = getExpectedPasskeys();
  const initialAuthenticated = Boolean(sessionCookie && expected.includes(sessionCookie));

  let handbookMarkdown = "";
  let masterPromptText = "";
  try {
    const handbookPath = path.join(process.cwd(), "docs", "TOOL_OPTIMIZATION_RULES.md");
    handbookMarkdown = fs.readFileSync(handbookPath, "utf8");

    const promptMarker = "## 8. Copy-Paste Master Prompt for Any AI Agent or Developer";
    const markerIdx = handbookMarkdown.indexOf(promptMarker);
    if (markerIdx !== -1) {
      const rawSection = handbookMarkdown.slice(markerIdx + promptMarker.length);
      const quoteLines = rawSection
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith(">"))
        .map((line) => line.replace(/^\s*>\s?/, ""));
      masterPromptText = quoteLines.join("\n").trim();
    }
  } catch {
    handbookMarkdown = "Handbook file not found at docs/TOOL_OPTIMIZATION_RULES.md.";
  }

  return (
    <FounderCommandCenterClient
      initialAuthenticated={initialAuthenticated}
      handbookMarkdown={handbookMarkdown}
      masterPromptText={masterPromptText}
    />
  );
}
