import type { PageSpeedResult, Strategy } from "./types";
export type CheckResult =
  { ok: true; result: PageSpeedResult } | { ok: false; message: string };
export async function checkCoreWebVitals(
  url: string,
  strategy: Strategy,
  signal?: AbortSignal,
): Promise<CheckResult> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, 60_000);
  try {
    const response = await fetch("/api/ai-tools/core-web-vitals/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, strategy }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (
      !response.ok ||
      !payload?.result ||
      payload.error ||
      !Array.isArray(payload.result.categories) ||
      !Array.isArray(payload.result.labMetrics) ||
      !Array.isArray(payload.result.fieldData?.metrics)
    ) {
      return {
        ok: false,
        message: payload?.error?.message || "The check could not be completed.",
      };
    }
    return { ok: true, result: payload.result };
  } catch {
    return {
      ok: false,
      message: controller.signal.aborted
        ? "The check timed out. Please retry this device."
        : "Could not reach the check service. Check your connection and try again.",
    };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
