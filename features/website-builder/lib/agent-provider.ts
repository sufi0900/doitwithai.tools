import { generateWithGemini } from "./gemini";
import { generateJsonWithOpenAI } from "./openai-json";

export type AgentProvider = "nebius" | "openrouter" | "gemini" | "openai";
type Input<T> = { system: string; prompt: string; maxOutputTokens?: number; totalTimeoutMs?: number; validate: (raw: unknown) => T };
export type ProviderResult<T> = { value: T; provider: AgentProvider; attempted: AgentProvider[] };

export class AgentProvidersUnavailable extends Error {
  constructor(public readonly attempted: AgentProvider[]) { super("AI generation is unavailable. Direct navigation and exact edits still work."); }
}

export async function generateValidatedAgentJson<T>({ system, prompt, maxOutputTokens = 1800, totalTimeoutMs = 20_000, validate }: Input<T>): Promise<ProviderResult<T>> {
  const deadline = Date.now() + totalTimeoutMs;
  const remaining = () => Math.max(0, deadline - Date.now());
  const candidates: { provider: AgentProvider; generate: () => Promise<string> }[] = [];
  const timeout = () => Math.min(8_000, remaining());
  if (process.env.NEBIUS_API_KEY && process.env.NEBIUS_MODEL) candidates.push({ provider: "nebius", generate: () => generateWithNebius({ system, prompt, maxOutputTokens, timeoutMs: timeout() }) });
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL) candidates.push({ provider: "openrouter", generate: () => generateWithOpenRouter({ system, prompt, maxOutputTokens, timeoutMs: timeout() }) });
  if (process.env.GEMINI_API_KEY) candidates.push({ provider: "gemini", generate: () => generateWithGemini({ system, prompt, maxOutputTokens, timeoutMs: timeout() }) });
  if (process.env.OPENAI_API_KEY) candidates.push({ provider: "openai", generate: () => generateJsonWithOpenAI({ system, prompt, maxOutputTokens, timeoutMs: timeout() }) });
  const attempted: AgentProvider[] = [];
  for (const candidate of candidates) {
    if (remaining() < 400) break;
    attempted.push(candidate.provider);
    try {
      return { value: validate(JSON.parse(stripCodeFence(await candidate.generate()))), provider: candidate.provider, attempted };
    } catch (error) {
      // Never log user content, provider responses, API keys, or professional memory.
      console.warn("Agent provider failed", { provider: candidate.provider, reason: error instanceof Error ? error.name : "unknown" });
    }
  }
  throw new AgentProvidersUnavailable(attempted);
}

export async function generateWithNebius({ system, prompt, maxOutputTokens = 1800, timeoutMs = 30_000 }: { system: string; prompt: string; maxOutputTokens?: number; timeoutMs?: number }) {
  const key = process.env.NEBIUS_API_KEY;
  const model = process.env.NEBIUS_MODEL;
  if (!key || !model) throw new Error("Nebius needs both NEBIUS_API_KEY and NEBIUS_MODEL.");
  const response = await fetch("https://api.tokenfactory.nebius.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.2, max_tokens: maxOutputTokens, response_format: { type: "json_object" } }),
  });
  if (!response.ok) throw new Error(`Nebius request returned HTTP ${response.status}.`);
  const body = await response.json() as { choices?: { message?: { content?: string | null } }[] };
  const text = body.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error("Nebius did not return usable JSON content.");
  return text;
}

export async function generateWithOpenRouter({ system, prompt, maxOutputTokens = 1800, timeoutMs = 30_000 }: { system: string; prompt: string; maxOutputTokens?: number; timeoutMs?: number }) {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!key || !model) throw new Error("OpenRouter needs both OPENROUTER_API_KEY and OPENROUTER_MODEL.");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", signal: AbortSignal.timeout(timeoutMs),
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.2, max_tokens: maxOutputTokens, response_format: { type: "json_object" } }),
  });
  if (!response.ok) throw new Error(`OpenRouter request returned HTTP ${response.status}.`);
  const body = await response.json() as { choices?: { message?: { content?: string | null } }[] };
  const text = body.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error("OpenRouter did not return usable JSON content.");
  return text;
}

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
