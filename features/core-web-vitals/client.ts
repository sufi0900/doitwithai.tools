import type { PageSpeedResult, Strategy } from "./types";

export type CheckResult = { ok: true; result: PageSpeedResult } | { ok: false; message: string };

export async function checkCoreWebVitals(url: string, strategy: Strategy): Promise<CheckResult> {
  try {
    const response = await fetch("/api/ai-tools/core-web-vitals/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, strategy }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return { ok: false, message: payload?.error?.message || "The check could not be completed." };
    }
    return { ok: true, result: payload.result };
  } catch {
    return { ok: false, message: "Could not reach the check service. Check your connection and try again." };
  }
}
