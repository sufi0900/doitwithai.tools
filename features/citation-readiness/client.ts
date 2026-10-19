import type { AnalysisResult } from "./types";

export type UrlAnalysisResult =
  | {
      ok: true;
      result: AnalysisResult;
      doc: { title: string; wordCount: number; finalUrl: string };
    }
  | { ok: false; message: string };

export async function analyzeUrl(url: string): Promise<UrlAnalysisResult> {
  try {
    const response = await fetch("/api/ai-tools/citation-readiness/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return {
        ok: false,
        message: payload?.error?.message || "The page could not be analyzed.",
      };
    }
    return { ok: true, result: payload.result, doc: payload.doc };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the analyzer. Check your connection and try again.",
    };
  }
}
