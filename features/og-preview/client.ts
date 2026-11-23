import type { ImageProbeResult, OgState } from "./types";

export type OgImportResult = { ok: true; state: Partial<OgState>; finalUrl: string } | { ok: false; message: string };

export async function importOgTags(pageUrl: string): Promise<OgImportResult> {
  try {
    const response = await fetch("/api/ai-tools/og-preview/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return { ok: false, message: payload?.error?.message || "The page could not be imported." };
    }
    return { ok: true, state: payload.state, finalUrl: payload.finalUrl };
  } catch {
    return { ok: false, message: "Could not reach the import service. Check your connection and try again." };
  }
}

export type ImageCheckResult = { ok: true; result: ImageProbeResult } | { ok: false; message: string };

export async function checkImage(imageUrl: string): Promise<ImageCheckResult> {
  try {
    const response = await fetch("/api/ai-tools/og-preview/image-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return { ok: false, message: payload?.error?.message || "The image could not be checked." };
    }
    return { ok: true, result: payload.result };
  } catch {
    return { ok: false, message: "Could not reach the check service. Check your connection and try again." };
  }
}
