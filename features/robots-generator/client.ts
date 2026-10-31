import type { RobotsState } from "./types";

export type RobotsFetchResult =
  | { ok: true; state: RobotsState; raw: string; finalUrl: string }
  | { ok: false; message: string };

export async function fetchExistingRobots(
  siteUrl: string,
): Promise<RobotsFetchResult> {
  try {
    const response = await fetch("/api/ai-tools/robots-txt/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return {
        ok: false,
        message: payload?.error?.message || "robots.txt could not be fetched.",
      };
    }
    return {
      ok: true,
      state: payload.state,
      raw: payload.raw,
      finalUrl: payload.finalUrl,
    };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the fetch service. Check your connection and try again.",
    };
  }
}
