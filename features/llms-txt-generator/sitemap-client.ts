import type { SitemapFetchOutput } from "./schema";

export type SitemapImportResult =
  { ok: true; data: SitemapFetchOutput } | { ok: false; message: string };

export async function importPagesFromSitemap(
  sitemapUrl: string,
): Promise<SitemapImportResult> {
  try {
    const response = await fetch("/api/ai-tools/llms-txt/sitemap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitemapUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return {
        ok: false,
        message:
          payload?.error?.message || "The sitemap could not be imported.",
      };
    }
    return { ok: true, data: payload as SitemapFetchOutput };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the import service. Check your connection and try again.",
    };
  }
}
