/**
 * Dedicated AI Automation & Autonomous Agent Multi-Provider Router
 * File: lib/autonomous-agents/automation-ai-router.ts
 *
 * Isolates AI Automation & 24-Hour Autopilot LLM token consumption from the main
 * public tools by prioritizing dedicated automation environment variables first,
 * followed by user BYOK keys (`localStorage`), and falling back to platform keys
 * or zero-downtime niche-intelligent synthesis.
 *
 * Supported Free-Tier Providers & Dedicated Environment Variables:
 *  1. Google AI Studio Gemini Free Tier (`gemini-2.5-flash` / `gemini-2.5-flash-lite`)
 *     - Env: `AUTONOMOUS_AUTOMATION_GEMINI_KEY`, `GEMINI_AUTOMATION_API_KEY`, `AUTONOMOUS_AUTOMATION_API_KEY`
 *  2. GroqCloud Free LPU Tier (`llama-3.3-70b-versatile`)
 *     - Env: `AUTONOMOUS_AUTOMATION_GROQ_KEY`, `GROQ_AUTOMATION_API_KEY`
 *  3. Cerebras Inference Free Tier (`llama-3.3-70b`)
 *     - Env: `AUTONOMOUS_AUTOMATION_CEREBRAS_KEY`, `CEREBRAS_AUTOMATION_API_KEY`, `CEREBRAS_API_KEY`
 *  4. OpenRouter Free Models Pool (`meta-llama/llama-3.3-70b-instruct:free`)
 *     - Env: `AUTONOMOUS_AUTOMATION_OPENROUTER_KEY`, `OPENROUTER_AUTOMATION_API_KEY`
 *  5. Mistral AI Free Tier ("Experiment" plan — `mistral-small-latest`)
 *     - Env: `AUTONOMOUS_AUTOMATION_MISTRAL_KEY`, `MISTRAL_AUTOMATION_API_KEY`, `MISTRAL_API_KEY`
 */

/**
 * Dedicated AI Automation & Autonomous Agent Multi-Provider Router
 * File: lib/autonomous-agents/automation-ai-router.ts
 *
 * Isolates AI Automation & 24-Hour Autopilot LLM token consumption from the main
 * public tools by prioritizing dedicated automation environment variables first,
 * followed by user BYOK keys (`localStorage`), and falling back to platform keys
 * or zero-downtime niche-intelligent synthesis.
 *
 * Isomorphic (browser + server safe): zero Node-only imports (`node:crypto`).
 */

export interface FreeLlmProviderGuideItem {
  id: "gemini-ai-studio" | "groq-cloud" | "cerebras-cloud" | "openrouter-free" | "mistral-plateforme";
  name: string;
  recommendedModel: string;
  freeQuotaSummary: string;
  signupUrl: string;
  dedicatedEnvVarName: string;
  secondaryEnvVarName: string;
  whyRecommendedForAutomation: string;
}

export const FREE_LLM_AUTOMATION_PROVIDERS_GUIDE: FreeLlmProviderGuideItem[] = [
  {
    id: "gemini-ai-studio",
    name: "Google AI Studio (Gemini 2.5 Flash / Flash-Lite)",
    recommendedModel: "gemini-2.5-flash",
    freeQuotaSummary: "15 RPM · 1,000,000 TPM · up to 1,500 requests/day free",
    signupUrl: "https://aistudio.google.com/apikey",
    dedicatedEnvVarName: "AUTONOMOUS_AUTOMATION_GEMINI_KEY",
    secondaryEnvVarName: "GEMINI_AUTOMATION_API_KEY",
    whyRecommendedForAutomation:
      "Largest free context window (1M tokens) and native JSON schema support—ideal for real-time website HTML analysis, topic discovery, and long-form SEO/GEO article drafting.",
  },
  {
    id: "groq-cloud",
    name: "GroqCloud Free Developer Tier (Llama 3.3 70B)",
    recommendedModel: "llama-3.3-70b-versatile",
    freeQuotaSummary: "30 RPM · 14,400 requests/day · ~500K tokens/day free",
    signupUrl: "https://console.groq.com/keys",
    dedicatedEnvVarName: "AUTONOMOUS_AUTOMATION_GROQ_KEY",
    secondaryEnvVarName: "GROQ_AUTOMATION_API_KEY",
    whyRecommendedForAutomation:
      "Ultra-fast LPU inference (~300 tokens/sec) makes multi-article batch writing and 5-channel social hook generation finish in seconds.",
  },
  {
    id: "cerebras-cloud",
    name: "Cerebras Cloud Free Tier (Llama 3.3 70B)",
    recommendedModel: "llama-3.3-70b",
    freeQuotaSummary: "30 RPM · 1,000,000 tokens/day free (no credit card required)",
    signupUrl: "https://cloud.cerebras.ai/",
    dedicatedEnvVarName: "AUTONOMOUS_AUTOMATION_CEREBRAS_KEY",
    secondaryEnvVarName: "CEREBRAS_AUTOMATION_API_KEY",
    whyRecommendedForAutomation:
      "Generous 1M free daily token allowance at wafer-scale speed (>1,000 tokens/sec)—perfect for 24-hour continuous autopilot testing.",
  },
  {
    id: "openrouter-free",
    name: "OpenRouter Free Models Pool (:free)",
    recommendedModel: "meta-llama/llama-3.3-70b-instruct:free",
    freeQuotaSummary: "20 RPM · 200 requests/day across 25+ :free models",
    signupUrl: "https://openrouter.ai/settings/keys",
    dedicatedEnvVarName: "AUTONOMOUS_AUTOMATION_OPENROUTER_KEY",
    secondaryEnvVarName: "OPENROUTER_AUTOMATION_API_KEY",
    whyRecommendedForAutomation:
      "Single API key routes across Llama 3.3 70B, DeepSeek R1, Qwen 2.5, and Gemma 3 free endpoints when primary providers hit rate limits.",
  },
  {
    id: "mistral-plateforme",
    name: "Mistral AI La Plateforme (Free Experiment Tier)",
    recommendedModel: "mistral-small-latest",
    freeQuotaSummary: "Free Experiment tier with generous monthly token quota",
    signupUrl: "https://console.mistral.ai/api-keys/",
    dedicatedEnvVarName: "AUTONOMOUS_AUTOMATION_MISTRAL_KEY",
    secondaryEnvVarName: "MISTRAL_AUTOMATION_API_KEY",
    whyRecommendedForAutomation:
      "Independent European LLM cloud that provides an extra isolated quota pool for high-volume article & FAQ generation.",
  },
];

export interface AutomationKeyOverrides {
  geminiKey?: string;
  groqKey?: string;
  cerebrasKey?: string;
  openRouterKey?: string;
  mistralKey?: string;
}

function cleanKey(raw: string | undefined | null): string {
  const trimmed = String(raw || "").trim();
  if (trimmed.length < 12 || trimmed.includes("***") || trimmed.includes("...")) {
    return "";
  }
  return trimmed;
}

function splitKeyList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((k) => cleanKey(k))
    .filter(Boolean);
}

/**
 * Resolves the prioritized list of Gemini API keys for the Automation pipeline:
 * 1. Explicit user BYOK override (from request / browser localStorage)
 * 2. Dedicated Automation Env Vars (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`, `AGENCY_GEMINI_API_KEY`, `GEMINI_AUTOMATION_API_KEY`, `AUTONOMOUS_AUTOMATION_API_KEY`)
 * Never falls back to reserved public-tool keys (`GEMINI_API_KEY*`).
 */
export function getAutomationGeminiKeys(overrides?: AutomationKeyOverrides): string[] {
  const keys: string[] = [];
  const add = (k: string | undefined) => {
    const c = cleanKey(k);
    if (c && !keys.includes(c)) keys.push(c);
  };

  add(overrides?.geminiKey);
  if (typeof process !== "undefined" && process.env) {
    add(process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY);
    add(process.env.AGENCY_GEMINI_API_KEY);
    add(process.env.GEMINI_AUTOMATION_API_KEY);
    add(process.env.AUTONOMOUS_AUTOMATION_API_KEY);
    for (const k of splitKeyList(process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEYS)) {
      add(k);
    }
  }
  return keys;
}

/**
 * Resolves the prioritized list of dedicated Groq API keys for the Automation pipeline.
 */
export function getAutomationGroqKeys(overrides?: AutomationKeyOverrides): string[] {
  const keys: string[] = [];
  const add = (k: string | undefined) => {
    const c = cleanKey(k);
    if (c && !keys.includes(c)) keys.push(c);
  };

  add(overrides?.groqKey);
  if (typeof process !== "undefined" && process.env) {
    add(process.env.AUTONOMOUS_AUTOMATION_GROQ_KEY);
    add(process.env.AGENCY_GROQ_API_KEY);
    add(process.env.GROQ_AUTOMATION_API_KEY);
    for (const k of splitKeyList(process.env.AUTONOMOUS_AUTOMATION_GROQ_KEYS)) {
      add(k);
    }
  }
  return keys;
}

export function getAutomationCerebrasKeys(overrides?: AutomationKeyOverrides): string[] {
  const keys: string[] = [];
  const add = (k: string | undefined) => {
    const c = cleanKey(k);
    if (c && !keys.includes(c)) keys.push(c);
  };
  add(overrides?.cerebrasKey);
  add(process.env.AUTONOMOUS_AUTOMATION_CEREBRAS_KEY);
  add(process.env.CEREBRAS_AUTOMATION_API_KEY);
  add(process.env.CEREBRAS_API_KEY);
  return keys;
}

export function getAutomationOpenRouterKeys(overrides?: AutomationKeyOverrides): string[] {
  const keys: string[] = [];
  const add = (k: string | undefined) => {
    const c = cleanKey(k);
    if (c && !keys.includes(c)) keys.push(c);
  };
  add(overrides?.openRouterKey);
  add(process.env.AUTONOMOUS_AUTOMATION_OPENROUTER_KEY);
  add(process.env.AGENCY_OPENROUTER_API_KEY);
  add(process.env.OPENROUTER_AUTOMATION_API_KEY);
  return keys;
}

export function getAutomationMistralKeys(overrides?: AutomationKeyOverrides): string[] {
  const keys: string[] = [];
  const add = (k: string | undefined) => {
    const c = cleanKey(k);
    if (c && !keys.includes(c)) keys.push(c);
  };
  add(overrides?.mistralKey);
  add(process.env.AUTONOMOUS_AUTOMATION_MISTRAL_KEY);
  add(process.env.MISTRAL_AUTOMATION_API_KEY);
  add(process.env.MISTRAL_API_KEY);
  return keys;
}

export function extractJsonFromLlmText<T>(rawText: string): T {
  const trimmed = String(rawText || "").trim();
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(stripped.slice(firstBrace, lastBrace + 1)) as T;
  }
  const firstBracket = stripped.indexOf("[");
  const lastBracket = stripped.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return JSON.parse(stripped.slice(firstBracket, lastBracket + 1)) as T;
  }
  return JSON.parse(stripped) as T;
}

export interface AutomationJsonPromptOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  keyOverrides?: AutomationKeyOverrides;
  fetchImpl?: typeof fetch;
  parseJson?: (rawText: string) => T;
  deterministicFallback: () => T;
}

export interface AutomationJsonPromptResult<T> {
  data: T;
  providerUsed: string;
  isLiveAi: boolean;
  latencyMs: number;
}

/**
 * Executes a JSON-structured prompt across the dedicated Automation multi-provider chain:
 * Tier 1 (Automation Gemini) -> Tier 2 (Automation Groq) -> Tier 3 (Cerebras) ->
 * Tier 4 (OpenRouter) -> Tier 5 (Mistral) -> Tier 6 (Niche-Intelligent Deterministic Fallback).
 */
export async function runAutomationJsonPrompt<T>(
  options: AutomationJsonPromptOptions<T>,
): Promise<AutomationJsonPromptResult<T>> {
  const startedAt = Date.now();
  const fetcher = options.fetchImpl || (typeof fetch === "function" ? fetch : undefined);
  const temperature = options.temperature ?? 0.8;
  const maxTokens = options.maxOutputTokens ?? 2800;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const parseFn = options.parseJson ?? extractJsonFromLlmText<T>;

  if (fetcher) {
    // 1. Google Gemini (Dedicated Automation Key Pool + evergreen model cascade)
    const geminiKeys = getAutomationGeminiKeys(options.keyOverrides);
    const configuredAgencyModel = (
      process.env.AUTONOMOUS_AUTOMATION_GEMINI_MODEL ||
      process.env.AGENCY_GEMINI_MODEL ||
      ""
    ).trim();
    const geminiModels = Array.from(
      new Set([
        ...(configuredAgencyModel ? [configuredAgencyModel] : []),
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-3.8-flash",
      ]),
    );

    for (let i = 0; i < geminiKeys.length; i++) {
      const apiKey = geminiKeys[i]!;
      for (const geminiModel of geminiModels) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetcher(
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
                systemInstruction: {
                  parts: [
                    {
                      text: `${options.systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON without markdown code fences.`,
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
                  temperature,
                },
              }),
            },
          );
          if (res.ok) {
            const payload = (await res.json()) as {
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
                providerUsed: `Google Gemini (${geminiModel})`,
                isLiveAi: true,
                latencyMs: Date.now() - startedAt,
              };
            }
          }
          if (![400, 404, 429, 503].includes(res.status)) {
            break;
          }
        } catch {
          // Rotate to next model / key / provider
          break;
        } finally {
          clearTimeout(timer);
        }
      }
    }

    // 2. GroqCloud LPU (Dedicated Automation Key -> Platform Key Pool)
    const groqKeys = getAutomationGroqKeys(options.keyOverrides);
    const groqModel =
      process.env.AUTONOMOUS_AUTOMATION_GROQ_MODEL?.trim() ||
      "llama-3.3-70b-versatile";

    for (let i = 0; i < groqKeys.length; i++) {
      const apiKey = groqKeys[i]!;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetcher("https://api.groq.com/openai/v1/chat/completions", {
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
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object without markdown code fences.`,
              },
              { role: "user", content: options.userPrompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: maxTokens,
            temperature,
            stream: false,
          }),
        });
        if (res.ok) {
          const payload = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawText = payload.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const parsed = parseFn(rawText);
            return {
              data: parsed,
              providerUsed: `GroqCloud LPU (${groqModel})`,
              isLiveAi: true,
              latencyMs: Date.now() - startedAt,
            };
          }
        }
      } catch {
        // Rotate to next key / provider
      } finally {
        clearTimeout(timer);
      }
    }

    // 3. Cerebras Cloud Free Tier (llama-3.3-70b)
    const cerebrasKeys = getAutomationCerebrasKeys(options.keyOverrides);
    for (let i = 0; i < cerebrasKeys.length; i++) {
      const apiKey = cerebrasKeys[i]!;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetcher("https://api.cerebras.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: "llama-3.3-70b",
            messages: [
              {
                role: "system",
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object without markdown code fences.`,
              },
              { role: "user", content: options.userPrompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: maxTokens,
            temperature,
            stream: false,
          }),
        });
        if (res.ok) {
          const payload = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawText = payload.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const parsed = parseFn(rawText);
            return {
              data: parsed,
              providerUsed: "Cerebras Wafer-Scale (llama-3.3-70b)",
              isLiveAi: true,
              latencyMs: Date.now() - startedAt,
            };
          }
        }
      } catch {
        // Fall through
      } finally {
        clearTimeout(timer);
      }
    }

    // 4. OpenRouter Free Models Pool
    const openRouterKeys = getAutomationOpenRouterKeys(options.keyOverrides);
    const openRouterModel =
      process.env.AUTONOMOUS_AUTOMATION_OPENROUTER_MODEL?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      "meta-llama/llama-3.3-70b-instruct:free";

    for (let i = 0; i < openRouterKeys.length; i++) {
      const apiKey = openRouterKeys[i]!;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetcher("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://doitwithai.tools",
            "X-Title": "DoItWithAI Autonomous Content OS",
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: openRouterModel,
            messages: [
              {
                role: "system",
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object without markdown code fences.`,
              },
              { role: "user", content: options.userPrompt },
            ],
            response_format: { type: "json_object" },
            max_tokens: maxTokens,
            temperature,
            stream: false,
          }),
        });
        if (res.ok) {
          const payload = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawText = payload.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const parsed = parseFn(rawText);
            return {
              data: parsed,
              providerUsed: `OpenRouter (${openRouterModel})`,
              isLiveAi: true,
              latencyMs: Date.now() - startedAt,
            };
          }
        }
      } catch {
        // Fall through
      } finally {
        clearTimeout(timer);
      }
    }

    // 5. Mistral AI Free Experiment Tier
    const mistralKeys = getAutomationMistralKeys(options.keyOverrides);
    for (let i = 0; i < mistralKeys.length; i++) {
      const apiKey = mistralKeys[i]!;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetcher("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
              {
                role: "system",
                content: `${options.systemPrompt}\n\nReturn ONLY a valid JSON object without markdown code fences.`,
              },
              { role: "user", content: options.userPrompt },
            ],
            response_format: { type: "json_object" },
            max_tokens: maxTokens,
            temperature,
          }),
        });
        if (res.ok) {
          const payload = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawText = payload.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const parsed = parseFn(rawText);
            return {
              data: parsed,
              providerUsed: "Mistral AI (mistral-small-latest)",
              isLiveAi: true,
              latencyMs: Date.now() - startedAt,
            };
          }
        }
      } catch {
        // Fall through
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return {
    data: options.deterministicFallback(),
    providerUsed: "Niche-Intelligent Dynamic Synthesis Fallback",
    isLiveAi: false,
    latencyMs: Date.now() - startedAt,
  };
}
