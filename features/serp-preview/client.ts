export type SerpImportResult =
  | { ok: true; title: string; description: string; finalUrl: string; jsonLd: unknown[] }
  | { ok: false; message: string };

export async function importSerpData(pageUrl: string): Promise<SerpImportResult> {
  try {
    const response = await fetch("/api/ai-tools/serp-preview/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return { ok: false, message: payload?.error?.message || "The page could not be imported." };
    }
    return {
      ok: true,
      title: payload.result.title,
      description: payload.result.description,
      finalUrl: payload.result.finalUrl,
      jsonLd: payload.result.jsonLd,
    };
  } catch {
    return { ok: false, message: "Could not reach the import service. Check your connection and try again." };
  }
}
