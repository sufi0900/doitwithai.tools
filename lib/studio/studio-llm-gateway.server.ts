/**
 * Isolated Server-Side LLM Gateway & Rate-Limit Controller for DoItWithAI Studio V2
 * File: lib/studio/studio-llm-gateway.server.ts
 *
 * Strict API Key Isolation Contract:
 *  - Public /tools/* endpoints continue using `lib/ai-tools/gemini.ts` (`GEMINI_API_KEY*`) untouched.
 *  - All heavy Studio, Content Writer, Onboarding Keyword Discovery, SEO Workbenches, and
 *    Studio Brand AI Copilot routes use THIS gateway, prioritizing `STUDIO_GEMINI_API_KEY` and
 *    `AUTONOMOUS_AUTOMATION_GEMINI_KEY` without draining public tool keys.
 *  - Honors `AGENCY_UNLIMITED_TESTING=true` (and `STUDIO_UNLIMITED_TESTING=true`) so preview
 *    deployments never fail when Upstash Redis is absent and never hit Free 1/1 quota locks.
 */

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { geminiTextFormat, type GenerationParams } from "@/lib/ai-tools/gemini";
import { extractJsonText, readBoundedJson } from "@/lib/ai-tools/request-body";
import type {
  MultiModelFailoverOptions,
  MultiModelFailoverResult,
} from "@/lib/ai/multi-model-router";

export const STUDIO_GEMINI_MODEL_CASCADE = [
  "gemini-flash-lite-latest",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

export const STUDIO_GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

function cleanSecret(raw: string | undefined | null): string {
  const trimmed = String(raw || "").trim();
  if (trimmed.length < 12 || trimmed.includes("***") || trimmed.includes("...")) {
    return "";
  }
  return trimmed;
}

function splitSecretList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => cleanSecret(item))
    .filter(Boolean);
}

/**
 * Returns true when Preview / QA unlimited testing mode is enabled via Cloudflare env vars.
 */
export function isStudioUnlimitedTesting(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  const raw = (
    process.env.AGENCY_UNLIMITED_TESTING ||
    process.env.STUDIO_UNLIMITED_TESTING ||
    ""
  )
    .trim()
    .toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/**
 * Resolves strictly isolated Gemini API keys for Studio & Content Writer workloads.
 * Never reads public `GEMINI_API_KEY*` unless `ALLOW_STUDIO_PUBLIC_KEY_FALLBACK=true`.
 */
export function getStudioGeminiKeys(): string[] {
  const keys: string[] = [];
  const add = (candidate: string | undefined) => {
    const clean = cleanSecret(candidate);
    if (clean && !keys.includes(clean)) keys.push(clean);
  };

  if (typeof process !== "undefined" && process.env) {
    add(process.env.STUDIO_GEMINI_API_KEY);
    add(process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY);
    add(process.env.AGENCY_GEMINI_API_KEY);
    add(process.env.GEMINI_AUTOMATION_API_KEY);
    add(process.env.AUTONOMOUS_AUTOMATION_API_KEY);
    for (const k of splitSecretList(process.env.STUDIO_GEMINI_API_KEYS)) add(k);
    for (const k of splitSecretList(process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEYS)) {
      add(k);
    }

    if (
      keys.length === 0 &&
      String(process.env.ALLOW_STUDIO_PUBLIC_KEY_FALLBACK || "")
        .trim()
        .toLowerCase() === "true"
    ) {
      add(process.env.GEMINI_API_KEY);
      add(process.env.GEMINI_API_KEY_BACKUP);
    }
  }
  return keys;
}

/**
 * Resolves strictly isolated Groq API keys for Studio & Content Writer workloads.
 */
export function getStudioGroqKeys(): string[] {
  const keys: string[] = [];
  const add = (candidate: string | undefined) => {
    const clean = cleanSecret(candidate);
    if (clean && !keys.includes(clean)) keys.push(clean);
  };

  if (typeof process !== "undefined" && process.env) {
    add(process.env.STUDIO_GROQ_API_KEY);
    add(process.env.AUTONOMOUS_AUTOMATION_GROQ_KEY);
    add(process.env.AGENCY_GROQ_API_KEY);
    add(process.env.GROQ_AUTOMATION_API_KEY);
    for (const k of splitSecretList(process.env.AUTONOMOUS_AUTOMATION_GROQ_KEYS)) {
      add(k);
    }
  }
  return keys;
}

export function getPreferredStudioGeminiModel(): string {
  if (typeof process !== "undefined" && process.env) {
    const explicit = (
      process.env.STUDIO_GEMINI_MODEL ||
      process.env.AUTONOMOUS_AUTOMATION_GEMINI_MODEL ||
      process.env.AGENCY_GEMINI_MODEL ||
      ""
    ).trim();
    if (explicit) return explicit;
  }
  return STUDIO_GEMINI_MODEL_CASCADE[0];
}

export function isStudioAiConfigured(_model?: string): boolean {
  return getStudioGeminiKeys().length > 0 || getStudioGroqKeys().length > 0;
}

export function getStudioRuntimeDiagnostics() {
  const geminiKeys = getStudioGeminiKeys();
  const groqKeys = getStudioGroqKeys();
  const unlimitedTesting = isStudioUnlimitedTesting();
  return {
    unlimitedTesting,
    studioAiConfigured: geminiKeys.length > 0 || groqKeys.length > 0,
    geminiKeyCount: geminiKeys.length,
    groqKeyCount: groqKeys.length,
    primaryModel: getPreferredStudioGeminiModel(),
    providerLabel:
      geminiKeys.length > 0
        ? "Dedicated Studio Gemini Gateway"
        : groqKeys.length > 0
          ? "Dedicated Studio Groq Gateway"
          : "Deterministic Fallback Mode",
  };
}

/* ============================================================================
 * Studio Rate Limiter (Cloudflare Worker Safe + Unlimited Testing Aware)
 * Never throws when Upstash Redis is absent on Preview Workers.
 * ========================================================================== */

type LocalBucket = { count: number; expiresAt: number };
const studioMemoryBuckets = new Map<string, LocalBucket>();
let cachedStudioRedis: Redis | null | undefined;

function getStudioRedis(): Redis | null {
  if (cachedStudioRedis !== undefined) return cachedStudioRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  cachedStudioRedis = url && token ? new Redis({ url, token }) : null;
  return cachedStudioRedis;
}

function hashClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = cfIp || forwarded || req.headers.get("x-real-ip") || "studio-anon";
  return createHash("sha256").update(raw).digest("hex").slice(0, 20);
}

async function bumpCounter(
  key: string,
  ttlSeconds: number,
): Promise<{ count: number; ttl: number }> {
  const redis = getStudioRedis();
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, ttlSeconds);
      return { count, ttl: ttlSeconds };
    } catch {
      // Fall back to Worker isolate memory bucket cleanly
    }
  }

  const now = Date.now();
  const current = studioMemoryBuckets.get(key);
  const next =
    !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + ttlSeconds * 1000 }
      : { count: current.count + 1, expiresAt: current.expiresAt };

  if (studioMemoryBuckets.size > 4000) {
    for (const [k, v] of studioMemoryBuckets) {
      if (v.expiresAt <= now) studioMemoryBuckets.delete(k);
    }
  }
  studioMemoryBuckets.set(key, next);
  return {
    count: next.count,
    ttl: Math.max(1, Math.ceil((next.expiresAt - now) / 1000)),
  };
}

export async function checkStudioRateLimit(
  req: Request,
  toolSlug: string,
  options: {
    dailyLimit?: number;
    burstLimit?: number;
    refundFailures?: boolean;
  } = {},
): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  release?: () => Promise<void>;
}> {
  if (isStudioUnlimitedTesting()) {
    return {
      allowed: true,
      remaining: 9999,
      retryAfterSeconds: 0,
      release: async () => {},
    };
  }

  const dailyLimit = Math.max(10, options.dailyLimit ?? 150);
  const burstLimit = Math.max(5, options.burstLimit ?? 25);
  const subject = hashClientIp(req);
  const dayStamp = new Date().toISOString().slice(0, 10);
  const minStamp = Math.floor(Date.now() / 60_000);

  const burstKey = `studio:rl:burst:${toolSlug}:${minStamp}:${subject}`;
  const dayKey = `studio:rl:day:${toolSlug}:${dayStamp}:${subject}`;

  const [burst, daily] = await Promise.all([
    bumpCounter(burstKey, 65),
    bumpCounter(dayKey, 86_400),
  ]);

  if (burst.count > burstLimit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: burst.ttl,
    };
  }
  if (daily.count > dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: daily.ttl,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, dailyLimit - daily.count),
    retryAfterSeconds: 0,
    release: async () => {
      if (!options.refundFailures) return;
      const existing = studioMemoryBuckets.get(dayKey);
      if (existing && existing.count > 0) {
        existing.count -= 1;
      }
    },
  };
}

/* ============================================================================
 * Core Gemini + Groq Execution Engine (Plug-Compatible with GenerationParams<T>)
 * ========================================================================== */

type StudioInputPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail?: string };

function normalizeParts(content: string | StudioInputPart[]) {
  if (typeof content === "string") return [{ text: content }];
  return content.map((part) => {
    if (part.type === "input_text") return { text: part.text };
    const match =
      /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+=*)$/.exec(
        part.image_url,
      );
    if (!match) throw new Error("INVALID_STUDIO_IMAGE_DATA");
    return { inlineData: { mimeType: match[1], data: match[2] } };
  });
}

function modelSupportsZeroThinkingConfig(model: string): boolean {
  return /gemini-2\.5|flash-lite|flash-latest/i.test(model);
}

async function executeStudioGeneration<T>(
  params: GenerationParams<T>,
  options: { timeout?: number; maxRetries?: 0; temperature?: number } = {},
): Promise<{
  output_parsed: T;
  model: string;
  provider: "gemini" | "groq" | "openrouter";
}> {
  const geminiKeys = getStudioGeminiKeys();
  const groqKeys = getStudioGroqKeys();

  if (geminiKeys.length === 0 && groqKeys.length === 0) {
    throw new Error("STUDIO_AI_NOT_CONFIGURED");
  }

  const preferred = getPreferredStudioGeminiModel();
  const candidateModels = Array.from(
    new Set([
      preferred,
      ...(params.model && /^gemini-/i.test(params.model) ? [params.model] : []),
      ...STUDIO_GEMINI_MODEL_CASCADE,
    ]),
  ).filter(Boolean);

  // Ensure thinking/JSON formatting never starves output tokens
  const effectiveMaxTokens = Math.min(
    8192,
    Math.max(params.max_output_tokens || 2600, 4096),
  );
  const timeoutMs = Math.min(Math.max(options.timeout ?? 42_000, 12_000), 55_000);
  const temperature = options.temperature ?? 0.35;

  let lastError: Error | null = null;

  // 1. Dedicated Gemini Key Pool + Model Cascade
  for (let keyIdx = 0; keyIdx < geminiKeys.length; keyIdx++) {
    const activeKey = geminiKeys[keyIdx]!;
    for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
      const targetModel = candidateModels[modelIdx]!;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const buildRequestBody = (
        useResponseJsonSchema: boolean,
        includeZeroThinking: boolean,
      ) => {
        const systemParts = params.input
          .filter((item) => item.role === "system")
          .flatMap((item) => normalizeParts(item.content as string | StudioInputPart[]));

        if (!useResponseJsonSchema) {
          systemParts.push({
            text: `CRITICAL OUTPUT CONTRACT: Return ONLY valid raw JSON (no markdown code fences, no prose outside JSON) matching this JSON Schema: ${JSON.stringify(
              params.text.format.schema,
            )}`,
          });
        }

        return JSON.stringify({
          ...(systemParts.length > 0
            ? { systemInstruction: { parts: systemParts } }
            : {}),
          contents: params.input
            .filter((item) => item.role === "user")
            .map((item) => ({
              role: "user",
              parts: normalizeParts(item.content as string | StudioInputPart[]),
            })),
          generationConfig: {
            responseMimeType: "application/json",
            ...(useResponseJsonSchema
              ? { responseJsonSchema: params.text.format.schema }
              : {}),
            ...(includeZeroThinking && modelSupportsZeroThinkingConfig(targetModel)
              ? { thinkingConfig: { thinkingBudget: 0 } }
              : {}),
            candidateCount: 1,
            maxOutputTokens: effectiveMaxTokens,
            temperature,
          },
        });
      };

      const sendRequest = (
        useResponseJsonSchema: boolean,
        includeZeroThinking: boolean,
      ) =>
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            targetModel,
          )}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": activeKey,
            },
            cache: "no-store",
            signal: controller.signal,
            body: buildRequestBody(useResponseJsonSchema, includeZeroThinking),
          },
        );

      try {
        let response = await sendRequest(true, true);

        // Fallback if model rejects responseJsonSchema or thinkingConfig with HTTP 400
        if (response.status === 400 && !controller.signal.aborted) {
          response = await sendRequest(false, false);
        }

        if (!response.ok) {
          const status = response.status;
          lastError = new Error(`STUDIO_GEMINI_HTTP_${status}_${targetModel}`);
          // Try next model in cascade on 404/400/429/503
          if (status === 404 || status === 400) {
            continue;
          }
          if (status === 429 || status === 503 || status === 500) {
            continue;
          }
          // Auth error on this key -> move to next key
          if (status === 401 || status === 403) {
            break;
          }
          continue;
        }

        const payload = (await readBoundedJson(response, 600_000)) as {
          candidates?: Array<{
            finishReason?: string;
            content?: { parts?: Array<{ text?: string; thought?: boolean }> };
          }>;
        };

        const candidate = payload.candidates?.[0];
        const text =
          candidate?.content?.parts
            ?.filter((part) => !part.thought)
            .map((part) => part.text || "")
            .join("")
            .trim() || "";

        if (!text) {
          lastError = new Error(`STUDIO_GEMINI_EMPTY_${targetModel}`);
          continue;
        }

        try {
          const parsedJson = JSON.parse(extractJsonText(text));
          const validated = params.text.format.parse(parsedJson);
          return {
            output_parsed: validated,
            model: targetModel,
            provider: "gemini",
          };
        } catch (parseErr) {
          lastError =
            parseErr instanceof Error
              ? parseErr
              : new Error("STUDIO_JSON_VALIDATION_FAILED");
          // Retry once in pure prompt-contract mode on next model if schema output was malformed
          continue;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("STUDIO_FETCH_FAILED");
        continue;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  // 2. Optional Dedicated Groq LPU Fallback (if configured via AUTONOMOUS_AUTOMATION_GROQ_KEY)
  for (let keyIdx = 0; keyIdx < groqKeys.length; keyIdx++) {
    const activeKey = groqKeys[keyIdx]!;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const systemText = params.input
        .filter((item) => item.role === "system")
        .map((item) =>
          typeof item.content === "string"
            ? item.content
            : item.content
                .map((p) => (p.type === "input_text" ? p.text : ""))
                .join("\n"),
        )
        .join("\n\n");
      const userText = params.input
        .filter((item) => item.role === "user")
        .map((item) =>
          typeof item.content === "string"
            ? item.content
            : item.content
                .map((p) => (p.type === "input_text" ? p.text : ""))
                .join("\n"),
        )
        .join("\n\n");

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({
            model: STUDIO_GROQ_DEFAULT_MODEL,
            messages: [
              {
                role: "system",
                content: `${systemText}\n\nReturn ONLY valid JSON matching this schema: ${JSON.stringify(
                  params.text.format.schema,
                )}`,
              },
              { role: "user", content: userText },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: Math.min(effectiveMaxTokens, 6000),
            temperature,
          }),
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const raw = payload.choices?.[0]?.message?.content?.trim() || "";
        if (raw) {
          const validated = params.text.format.parse(
            JSON.parse(extractJsonText(raw)),
          );
          return {
            output_parsed: validated,
            model: STUDIO_GROQ_DEFAULT_MODEL,
            provider: "groq",
          };
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("STUDIO_GROQ_FAILED");
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("STUDIO_PROVIDER_UNAVAILABLE");
}

/**
 * Plug-compatible client factory for `createGenerationHandler` & `createResearchHandler`.
 */
export function getStudioGeminiClient() {
  return {
    generate: executeStudioGeneration,
  };
}

/**
 * High-level structured JSON helper for Studio V2 endpoints (Keyword Discovery,
 * On-Page SEO Optimizer, Technical Diagnostics, and Studio Brand AI Copilot).
 */
export async function generateStudioStructured<T extends z.ZodType>(options: {
  schema: T;
  schemaName: string;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{ data: z.infer<T>; provider: string; model: string }> {
  const res = await executeStudioGeneration(
    {
      model: getPreferredStudioGeminiModel(),
      max_output_tokens: options.maxOutputTokens ?? 3200,
      store: false,
      input: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      text: {
        format: geminiTextFormat(options.schema, options.schemaName),
      },
    },
    {
      timeout: options.timeoutMs ?? 38_000,
      temperature: options.temperature ?? 0.35,
    },
  );
  return {
    data: res.output_parsed,
    provider: res.provider,
    model: res.model,
  };
}

/**
 * Isolated Studio Failover Runner for `app/api/blog-writer/generate/route.ts`
 * Uses ONLY Studio/Automation keys (`AUTONOMOUS_AUTOMATION_GEMINI_KEY` / Groq)
 * and falls back cleanly to `deterministicFallback()` so public tool keys stay untouched.
 */
export async function runStudioModelFailover<T>(
  options: MultiModelFailoverOptions<T>,
): Promise<MultiModelFailoverResult<T>> {
  const startedAt = Date.now();
  const maxTokens = Math.min(8192, Math.max(options.maxOutputTokens ?? 3800, 4096));
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 34_000, 12_000), 52_000);
  const parseFn =
    options.parseJson ??
    ((rawText: string) => JSON.parse(extractJsonText(rawText)) as T);

  const geminiKeys = getStudioGeminiKeys();
  const candidateModels = Array.from(
    new Set([getPreferredStudioGeminiModel(), ...STUDIO_GEMINI_MODEL_CASCADE]),
  ).filter(Boolean);

  const sysInstruction = `${options.systemPrompt}\n\nIMPORTANT: Return ONLY valid raw JSON. Do not wrap in markdown fences or add commentary.`;

  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i]!;
    for (const targetModel of candidateModels) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const send = (includeZeroThinking: boolean) =>
          fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
              targetModel,
            )}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              cache: "no-store",
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: sysInstruction }] },
                contents: [{ role: "user", parts: [{ text: options.userPrompt }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                  ...(includeZeroThinking &&
                  modelSupportsZeroThinkingConfig(targetModel)
                    ? { thinkingConfig: { thinkingBudget: 0 } }
                    : {}),
                  candidateCount: 1,
                  maxOutputTokens: maxTokens,
                  temperature: 0.4,
                },
              }),
            },
          );

        let response = await send(true);
        if (response.status === 400 && !controller.signal.aborted) {
          response = await send(false);
        }

        if (response.ok) {
          const payload = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string; thought?: boolean }> };
            }>;
          };
          const rawText =
            payload.candidates?.[0]?.content?.parts
              ?.filter((p) => !p.thought)
              .map((p) => p.text || "")
              .join("")
              .trim() || "";

          if (rawText) {
            return {
              data: parseFn(rawText),
              providerUsed: `Studio Gemini (${targetModel}, Dedicated Key #${i + 1})`,
              tierUsed: 1,
              latencyMs: Date.now() - startedAt,
            };
          }
        }
        if (response.status === 401 || response.status === 403) {
          break;
        }
      } catch {
        continue;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  const groqKeys = getStudioGroqKeys();
  for (let i = 0; i < groqKeys.length; i++) {
    const apiKey = groqKeys[i]!;
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
            model: STUDIO_GROQ_DEFAULT_MODEL,
            messages: [
              { role: "system", content: sysInstruction },
              { role: "user", content: options.userPrompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: Math.min(maxTokens, 6000),
            temperature: 0.4,
          }),
        },
      );
      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawText = payload.choices?.[0]?.message?.content?.trim() || "";
        if (rawText) {
          return {
            data: parseFn(rawText),
            providerUsed: `Studio Groq (${STUDIO_GROQ_DEFAULT_MODEL}, Key #${i + 1})`,
            tierUsed: 2,
            latencyMs: Date.now() - startedAt,
          };
        }
      }
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    data: options.deterministicFallback(),
    providerUsed: "Studio Tier 4 · Deterministic Synthesis Fallback",
    tierUsed: 4,
    latencyMs: Date.now() - startedAt,
  };
}
