type GeminiOptions = {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
};

type GeminiErrorPayload = { error?: { message?: string; status?: string; code?: number } };

export class GeminiConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = "GeminiConfigurationError"; }
}

export class GeminiApiError extends Error {
  constructor(public readonly status: number, public readonly providerCode: string, message: string, public readonly retryable: boolean) {
    super(message);
    this.name = "GeminiApiError";
  }
}

export async function generateWithGemini({ system, prompt, maxOutputTokens = 1800, timeoutMs = 30_000 }: GeminiOptions) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiConfigurationError("GEMINI_API_KEY is not configured.");
  const primary = process.env.GEMINI_CONTENT_MODEL || "gemini-3.8-flash";
  const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";
  const attempts = [primary, primary, ...(fallback !== primary ? [fallback] : [])];
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  for (let index = 0; index < attempts.length; index += 1) {
    const model = attempts[index];
    if (index > 0) await delay(index === 1 ? 350 : 650);
    const remaining = deadline - Date.now();
    if (remaining < 400) break;
    try {
      return await generateOnce({ apiKey, model, system, prompt, maxOutputTokens, timeoutMs: Math.min(remaining, Math.max(1300, Math.round(timeoutMs / attempts.length))) });
    } catch (error) {
      lastError = error;
      const retryable = error instanceof GeminiApiError ? error.retryable : error instanceof Error && error.name === "AbortError";
      console.warn("Gemini generation attempt failed", { model, attempt: index + 1, status: error instanceof GeminiApiError ? error.status : undefined, retryable });
      if (!retryable) break;
    }
  }

  if (lastError instanceof Error && lastError.name === "AbortError") throw new GeminiApiError(504, "TIMEOUT", "Gemini request timed out.", true);
  throw lastError instanceof Error ? lastError : new GeminiApiError(503, "UNAVAILABLE", "Gemini is temporarily unavailable.", true);
}

async function generateOnce({ apiKey, model, system, prompt, maxOutputTokens, timeoutMs }: GeminiOptions & { apiKey: string; model: string; maxOutputTokens: number; timeoutMs: number }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens, temperature: 0.2 },
      }),
    });
    if (!response.ok) {
      const payload = await safeJson(response) as GeminiErrorPayload | null;
      const providerCode = payload?.error?.status || statusCode(response.status);
      const retryable = response.status === 429 || response.status === 408 || response.status >= 500;
      const message = response.status === 429
        ? "Gemini has reached a temporary project rate or usage limit."
        : response.status === 503
          ? "Gemini is temporarily overloaded or unavailable."
          : `Gemini request failed with status ${response.status}.`;
      throw new GeminiApiError(response.status, providerCode, message, retryable);
    }
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text ?? "").join("").trim();
    if (!text) throw new GeminiApiError(502, "EMPTY_RESPONSE", "Gemini returned no usable content.", false);
    return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  } finally {
    clearTimeout(timeout);
  }
}

export function aiUnavailableMessage(error: unknown) {
  if (error instanceof GeminiApiError && error.status === 429) return {
    code: "AI_RATE_LIMITED",
    message: "AI writing has reached a temporary project usage limit. Navigation, undo, and exact-text edits still work. Give me the wording you want applied, or try AI refinement again later.",
  };
  if (error instanceof GeminiConfigurationError) return {
    code: "AI_NOT_CONFIGURED",
    message: "AI writing is not configured right now. Navigation, undo, and exact-text edits still work. Give me the wording you want applied and I can update it without AI refinement.",
  };
  return {
    code: "AI_TEMPORARILY_UNAVAILABLE",
    message: "AI writing is temporarily unavailable. Navigation, undo, and exact-text edits still work. Give me the wording you want applied, or try AI refinement again shortly.",
  };
}

function statusCode(status: number) {
  if (status === 429) return "RESOURCE_EXHAUSTED";
  if (status === 503) return "UNAVAILABLE";
  if (status === 401 || status === 403) return "AUTHENTICATION";
  return `HTTP_${status}`;
}

async function safeJson(response: Response) { try { return await response.json(); } catch { return null; } }
function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
