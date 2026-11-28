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

import {
  GEMINI_MODEL_CASCADE,
  getGeminiApiKeys,
  getGeminiModel,
} from "@/lib/ai-tools/gemini";
import { getGroqApiKeys, getGroqModel } from "@/lib/ai-tools/groq";
import {
  OPENROUTER_FREE_MODELS,
  getOpenRouterModel,
  isOpenRouterConfigured,
} from "@/lib/ai-tools/openrouter";
import { extractJsonText } from "@/lib/ai-tools/request-body";

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
  return extractJsonText(raw);
}

function defaultParseJson<T>(rawText: string): T {
  return JSON.parse(cleanJsonResponseText(rawText)) as T;
}

interface ProviderChainOptions<T> {
  systemPrompt?: string;
  userPrompt: string;
  maxOutputTokens: number;
  timeoutMs: number;
  temperature: number;
  jsonMode: boolean;
  parseRaw: (rawText: string) => T;
}

async function runProviderChain<T>(
  options: ProviderChainOptions<T>
): Promise<{ data: T; providerUsed: string; tierUsed: 1 | 2 | 3 } | null> {
  const { maxOutputTokens: maxTokens, timeoutMs, temperature, jsonMode, parseRaw } =
    options;
  const sysText = options.systemPrompt
    ? jsonMode
      ? `${options.systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown code fences or commentary.`
      : options.systemPrompt
    : undefined;

  // TIER 1: Google Gemini Multi-Key Pool + Evergreen Model Cascade
  const geminiKeys = getGeminiApiKeys();
  const geminiModels = Array.from(
    new Set([getGeminiModel(), ...GEMINI_MODEL_CASCADE])
  ).filter(Boolean);

  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i];
    for (const geminiModel of geminiModels) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            cache: "no-store",
            signal: controller.signal,
            body: JSON.stringify({
              ...(sysText ? { systemInstruction: { parts: [{ text: sysText }] } } : {}),
              contents: [{ role: "user", parts: [{ text: options.userPrompt }] }],
              generationConfig: {
                ...(jsonMode ? { responseMimeType: "application/json" } : {}),
                candidateCount: 1,
                maxOutputTokens: maxTokens,
                temperature,
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
            return {
              data: parseRaw(rawText),
              providerUsed: `Tier 1 · Google Gemini (${geminiModel}, Key #${i + 1})`,
              tierUsed: 1,
            };
          }
        }
        if (![400, 404, 429, 503].includes(response.status)) {
          break;
        }
      } catch {
        break;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  // TIER 2: Groq LPU Multi-Key Pool
  const groqKeys = getGroqApiKeys();
  const groqModel = getGroqModel(false);

  for (let i = 0; i < groqKeys.length; i++) {
    const apiKey = groqKeys[i];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const messages = [
        ...(sysText ? [{ role: "system", content: sysText }] : []),
        { role: "user", content: options.userPrompt },
      ];
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
            messages,
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
            max_completion_tokens: maxTokens,
            temperature,
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
          return {
            data: parseRaw(rawText),
            providerUsed: `Tier 2 · Groq LPU (${groqModel}, Key #${i + 1})`,
            tierUsed: 2,
          };
        }
      }
    } catch {
      // Rotate to next Groq key or fall through to Tier 3
    } finally {
      clearTimeout(timer);
    }
  }

  // TIER 3: OpenRouter Free Multi-Model Pool
  if (isOpenRouterConfigured()) {
    const openRouterModels = Array.from(
      new Set([getOpenRouterModel(), ...OPENROUTER_FREE_MODELS])
    );
    for (const openRouterModel of openRouterModels) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const messages = [
          ...(sysText ? [{ role: "system", content: sysText }] : []),
          { role: "user", content: options.userPrompt },
        ];
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!.trim()}`,
              "HTTP-Referer": "https://doitwithai.tools",
              "X-Title": "DoItWithAI Tools",
            },
            cache: "no-store",
            signal: controller.signal,
            body: JSON.stringify({
              model: openRouterModel,
              messages,
              ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
              max_tokens: maxTokens,
              temperature,
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
            return {
              data: parseRaw(rawText),
              providerUsed: `Tier 3 · OpenRouter (${openRouterModel})`,
              tierUsed: 3,
            };
          }
        }
      } catch {
        // Try next OpenRouter free model
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return null;
}

/**
 * Executes a prompt across the 4-Tier Multi-Key AI Failover chain and guarantees a valid typed response.
 */
export async function runMultiModelFailover<T>(
  options: MultiModelFailoverOptions<T>
): Promise<MultiModelFailoverResult<T>> {
  const startedAt = Date.now();
  const live = await runProviderChain<T>({
    systemPrompt: options.systemPrompt,
    userPrompt: options.userPrompt,
    maxOutputTokens: options.maxOutputTokens ?? 3600,
    timeoutMs: options.timeoutMs ?? 24_000,
    temperature: 0.65,
    jsonMode: true,
    parseRaw: options.parseJson ?? defaultParseJson<T>,
  });

  if (live) {
    return { ...live, latencyMs: Date.now() - startedAt };
  }

  // TIER 4: Guaranteed Zero-Downtime Deterministic Synthesis Fallback (<10ms)
  return {
    data: options.deterministicFallback(),
    providerUsed: "Tier 4 · Deterministic SEO Synthesis Engine (Zero-Downtime Fallback)",
    tierUsed: 4,
    latencyMs: Date.now() - startedAt,
  };
}

/** Executes a plain-text/markdown prompt across the 4-key pool (Gemini -> Groq -> OpenRouter), returning null if all fail. */
export async function runMultiModelTextFailover(options: {
  prompt: string;
  systemPrompt?: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}): Promise<{ text: string; tier: string } | null> {
  const live = await runProviderChain<string>({
    systemPrompt: options.systemPrompt,
    userPrompt: options.prompt,
    maxOutputTokens: options.maxOutputTokens ?? 1200,
    timeoutMs: options.timeoutMs ?? 20_000,
    temperature: options.temperature ?? 0.45,
    jsonMode: false,
    parseRaw: (raw) => raw.trim(),
  });
  return live ? { text: live.data, tier: live.providerUsed } : null;
}
