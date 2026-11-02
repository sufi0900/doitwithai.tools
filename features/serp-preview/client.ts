import type { ImportedSerpData } from "./server/fetch-page-data";
export type SerpImportResult =
  ({ ok: true } & ImportedSerpData) | { ok: false; message: string };

export async function importSerpData(
  pageUrl: string,
  includeStructuredData = true,
  signal?: AbortSignal,
): Promise<SerpImportResult> {
  try {
    const response = await fetch("/api/ai-tools/serp-preview/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageUrl, includeStructuredData }),
      signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      const retry = Number(response.headers.get("retry-after"));
      return {
        ok: false,
        message:
          (payload?.error?.message || "The page could not be imported.") +
          (response.status === 429 && retry > 0
            ? ` Try again in about ${Math.ceil(retry / 60)} minutes.`
            : ""),
      };
    }
    if (
      !payload.result ||
      typeof payload.result.title !== "string" ||
      typeof payload.result.description !== "string" ||
      typeof payload.result.finalUrl !== "string" ||
      !Array.isArray(payload.result.jsonLd) ||
      typeof payload.result.siteName !== "string" ||
      typeof payload.result.faviconUrl !== "string" ||
      !Array.isArray(payload.result.warnings) ||
      payload.result.warnings.some((item: unknown) => typeof item !== "string")
    )
      return {
        ok: false,
        message:
          "The importer returned an incomplete result. Please try again.",
      };
    return { ...payload.result, ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the import service. Check your connection and try again.",
    };
  }
}
