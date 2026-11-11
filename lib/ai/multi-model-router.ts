/**
 * 4-Tier Multi-Key AI Failover Router
 * File: lib/ai/multi-model-router.ts
 *
 * Implements the repository-wide 4-Tier Zero-Downtime AI Execution Architecture:
 *  - Tier 1 (Primary): Google Gemini Multi-Key Pool (GEMINI_API_KEY, GEMINI_API_KEYS, GEMINI_API_KEY_2..10, GEMINI_API_KEY_BACKUP)
 *  - Tier 2 (Secondary): Groq LPU Multi-Key Pool (GROQ_API_KEY, GROQ_API_KEYS, GROQ_API_KEY_2..5)
 *  - Tier 3 (Tertiary): OpenRouter Free Model Pool (OPENROUTER_API_KEY)
 *  - Tier 4 (Guaranteed Fallback): Deterministic Synthesis Engine (<10ms, 0 HTTP 500s even when offline or rate-limited)
 *
 * — Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 */

import { getGeminiApiKeys, getGeminiModel } from "@/lib/ai-tools/gemini";
import { getGroqApiKeys, getGroqModel } from "@/lib/ai-tools/groq";
import { getOpenRouterModel, isOpenRouterConfigured } from "@/lib/ai-tools/openrouter";

export interface MultiModelFailoverOptions<T> {
  /** System instructions defining persona, rules, and JSON contract */
  systemPrompt: string;
  /** User task prompt and structured input context */
  userPrompt: string;
  /** Maximum output tokens for the completion (default: 3600) */
  maxOutputTokens?: number;
  /** Per-provider timeout in milliseconds (default: 24000) */
  timeoutMs?: number;
  /** Optional custom JSON parser/validator; defaults to JSON.parse after stripping code fences */
  parseJson?: (rawText: string) => T;
  /** Tier-4 deterministic synthesis fallback guaranteed to return valid T if Tiers 1-3 fail */
  deterministicFallback: () => T;
}

export interface MultiModelFailoverResult<T> {
  data: T;
  providerUsed: string;
  tierUsed: 1 | 2 | 3 | 4;
  latencyMs: number;
}

/**
 * Strips ```json ... ``` wrappers or leading/trailing prose around a JSON object.
 */
export function cleanJsonResponseText(raw: string): string {
  const trimmed = raw.trim();
  const strippedFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = strippedFence.indexOf("{");
  const lastBrace = strippedFence.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return strippedFence.slice(firstBrace, lastBrace + 1);
  }
  return strippedFence;
}

function defaultParseJson<T>(rawText: string): T {
  const cleaned = cleanJsonResponseText(rawText);
  return JSON.parse(cleaned) as T;
}

/**
 * Executes a prompt across the 4-Tier Multi-Key AI Failover chain and guarantees a valid typed response.
 */
export async function runMultiModelFailover<T>(
  options: MultiModelFailoverOptions<T>
): Promise<MultiModelFailoverResult<T>> {
  const startedAt = Date.now();
  const maxTokens = options.maxOutputTokens ?? 3600;
  const timeoutMs = options.timeoutMs ?? 24_000;
  const parseFn = options.parseJson ?? defaultParseJson<T>;

  // ============================================================================
  // TIER 1: Google Gemini Multi-Key Pool (gemini-2.5-flash / gemini-2.0-flash)
  // ============================================================================
  const geminiKeys = getGeminiApiKeys();
  const geminiModel = getGeminiModel("gemini-2.5-flash");

  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `${options.systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown code fences or commentary.`,
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: options.userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              candidateCount: 1,
              maxOutputTokens: maxTokens,
              temperature: 0.65,
            },
          }),
        }
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string; thought?: boolean }> };
          }>;
        };
        const rawText = payload.candidates?.[0]?.content?.parts
          ?.filter((p) => !p.thought)
          .map((p) => p.text || "")
          .join("")
          .trim();

        if (rawText) {
          const parsed = parseFn(rawText);
          return {
            data: parsed,
            providerUsed: `Tier 1 · Google Gemini (${geminiModel}, Key #${i + 1})`,
            tierUsed: 1,
            latencyMs: Date.now() - startedAt,
          };
        }
      }
    } catch {
      // Rotate to next Gemini key or fall through to Tier 2
    } finally {
      clearTimeout(timer);
    }
  }

  // ============================================================================
  // TIER 2: Groq LPU Multi-Key Pool (Llama 3.3 70B / GPT-OSS-120B)
  // ============================================================================
  const groqKeys = getGroqApiKeys();
  const groqModel = getGroqModel(false);

  for (let i = 0; i < groqKeys.length; i++) {
    const apiKey = groqKeys[i];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: groqModel,
            messages: [
              {
                role: "system",
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object. Do not wrap in markdown code fences.`,
              },
              {
                role: "user",
                content: options.userPrompt,
              },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: maxTokens,
            temperature: 0.65,
            stream: false,
          }),
        }
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawText = payload.choices?.[0]?.message?.content?.trim();
        if (rawText) {
          const parsed = parseFn(rawText);
          return {
            data: parsed,
            providerUsed: `Tier 2 · Groq LPU (${groqModel}, Key #${i + 1})`,
            tierUsed: 2,
            latencyMs: Date.now() - startedAt,
          };
        }
      }
    } catch {
      // Rotate to next Groq key or fall through to Tier 3
    } finally {
      clearTimeout(timer);
    }
  }

  // ============================================================================
  // TIER 3: OpenRouter Multi-Model Pool
  // ============================================================================
  if (isOpenRouterConfigured()) {
    const openRouterModel = getOpenRouterModel();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!.trim()}`,
            "HTTP-Referer": "https://doitwithai.tools",
            "X-Title": "DoItWithAI Flagship Blog Studio",
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: openRouterModel,
            messages: [
              {
                role: "system",
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object without markdown code blocks.`,
              },
              {
                role: "user",
                content: options.userPrompt,
              },
            ],
            response_format: { type: "json_object" },
            max_tokens: maxTokens,
            temperature: 0.65,
            stream: false,
          }),
        }
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawText = payload.choices?.[0]?.message?.content?.trim();
        if (rawText) {
          const parsed = parseFn(rawText);
          return {
            data: parsed,
            providerUsed: `Tier 3 · OpenRouter (${openRouterModel})`,
            tierUsed: 3,
            latencyMs: Date.now() - startedAt,
          };
        }
      }
    } catch {
      // Fall through to Tier 4 Deterministic Synthesis
    } finally {
      clearTimeout(timer);
    }
  }

  // ============================================================================
  // TIER 4: Guaranteed Zero-Downtime Deterministic Synthesis Fallback (<10ms)
  // ============================================================================
  const fallbackData = options.deterministicFallback();
  return {
    data: fallbackData,
    providerUsed: "Tier 4 · Deterministic SEO Synthesis Engine (Zero-Downtime Fallback)",
    tierUsed: 4,
    latencyMs: Date.now() - startedAt,
  };
}
