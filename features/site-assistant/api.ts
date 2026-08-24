import type { SiteAssistantRequest, SiteAssistantResponse } from "./types";

export async function askSiteAssistant(
  input: SiteAssistantRequest,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/ai-assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        "The website assistant is unavailable. Please try again.",
    );
  }
  return payload as SiteAssistantResponse;
}
