/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 7 + V4 PHASE 12)
 * Module: `lib/ai-employee-agency/llm-gateway.ts`
 *
 * Unified Server-Side Free/Paid LLM Gateway (`Gemini Flash-Lite / Flash`, `Groq Llama 3.3 70B`,
 * `OpenAI GPT-4o-mini` / `GPT-4.1-mini`):
 * - Strictly isolates Digital Agency requests onto dedicated agency/automation keys
 *   (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`, `AGENCY_GEMINI_API_KEY`, `AUTONOMOUS_AUTOMATION_GROQ_KEY`,
 *   `AGENCY_OPENAI_API_KEY`) so public-tool keys are never drained.
 * - Extracts exact token telemetry (`promptTokenCount`, `candidatesTokenCount`,
 *   `thoughtsTokenCount` on Gemini; `prompt_tokens`, `completion_tokens` on Groq/OpenAI),
 *   tags every call with its `apiKeySlot` (`KEY_SLOT_*`), and surfaces sanitized
 *   provider HTTP diagnostics whenever an upstream call fails.
 * ============================================================================
 */

import {
  MODEL_PRICING_CATALOG,
  computeTokenCostUsd,
  resolveApiKeySlotId,
  type AgencyLlmModelId,
  type AgencyLlmProviderId,
  type ApiKeySlotId,
} from './token-telemetry-store';

export interface AgencyLlmRequest {
  modelId?: AgencyLlmModelId;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKeyOverride?: string;
  isFreeTierKey?: boolean;
}

export interface AgencyLlmResponse {
  ok: boolean;
  usageReported: boolean;
  provider: AgencyLlmProviderId;
  modelId: AgencyLlmModelId;
  apiKeySlot: ApiKeySlotId;
  outputText: string;
  usedLiveApiKey: boolean;
  isFreeTierKey: boolean;
  promptTokens: number;
  completionTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  shadowPaidCostUsd: number;
  actualCostUsd: number;
  latencyMs: number;
  telemetryNote: string;
  apiErrorDetail?: string;
}

async function readProviderErrorDetail(
  provider: AgencyLlmProviderId,
  res: Response
): Promise<string> {
  try {
    const raw = await res.text();
    let extracted = '';
    try {
      const parsed = JSON.parse(raw) as {
        error?: { message?: string; status?: string };
        message?: string;
      };
      extracted = parsed?.error?.message || parsed?.message || '';
    } catch {
      extracted = raw;
    }
    const sanitized = extracted
      .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[redacted-key]')
      .replace(/sk-[0-9A-Za-z\-_]{16,}/g, '[redacted-key]')
      .replace(/gsk_[0-9A-Za-z\-_]{16,}/g, '[redacted-key]')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    return sanitized
      ? `${provider.toUpperCase()} HTTP ${res.status}: ${sanitized}`
      : `${provider.toUpperCase()} HTTP ${res.status}`;
  } catch {
    return `${provider.toUpperCase()} HTTP ${res.status}`;
  }
}

function resolveServerApiKey(
  provider: AgencyLlmProviderId,
  apiKeyOverride?: string
): { apiKey: string; hasOverride: boolean } {
  if (apiKeyOverride && apiKeyOverride.trim().length > 8) {
    return { apiKey: apiKeyOverride.trim(), hasOverride: true };
  }
  if (typeof process === 'undefined' || !process.env) {
    return { apiKey: '', hasOverride: false };
  }

  if (provider === 'gemini') {
    return {
      apiKey: (
        process.env.AUTONOMOUS_AUTOMATION_GEMINI_KEY ||
        process.env.AGENCY_GEMINI_API_KEY ||
        process.env.GEMINI_AUTOMATION_API_KEY ||
        process.env.AUTONOMOUS_AUTOMATION_API_KEY ||
        ''
      ).trim(),
      hasOverride: false,
    };
  }
  if (provider === 'groq') {
    return {
      apiKey: (
        process.env.AUTONOMOUS_AUTOMATION_GROQ_KEY ||
        process.env.AGENCY_GROQ_API_KEY ||
        process.env.GROQ_AUTOMATION_API_KEY ||
        ''
      ).trim(),
      hasOverride: false,
    };
  }
  if (provider === 'openai') {
    return {
      apiKey: (
        process.env.AUTONOMOUS_AUTOMATION_OPENAI_KEY ||
        process.env.AGENCY_OPENAI_API_KEY ||
        process.env.OPENAI_AGENCY_API_KEY ||
        ''
      ).trim(),
      hasOverride: false,
    };
  }
  return { apiKey: '', hasOverride: false };
}

export function providerBindings() {
  return {
    gemini: Boolean(resolveServerApiKey('gemini').apiKey),
    openai: Boolean(resolveServerApiKey('openai').apiKey),
    groq: Boolean(resolveServerApiKey('groq').apiKey),
  };
}

/**
 * Executes an AI Employee cognitive task via Google Gemini, Groq LPU, or OpenAI
 * and returns exact real-time token usage + shadow commercial cost + KEY_SLOT_*.
 */
export async function executeAgencyLlmCall(
  req: AgencyLlmRequest
): Promise<AgencyLlmResponse> {
  const startTime = Date.now();
  const modelId: AgencyLlmModelId = req.modelId || 'gemini-2.5-flash';
  const spec =
    MODEL_PRICING_CATALOG[modelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];
  const provider = spec.provider;
  const { apiKey, hasOverride } = resolveServerApiKey(provider, req.apiKeyOverride);
  const isFreeTierKey =
    req.isFreeTierKey !== undefined ? req.isFreeTierKey : spec.supportsFreeTierKey;

  let apiErrorDetail: string | undefined = !apiKey
    ? provider === 'gemini'
      ? 'No dedicated Agency Gemini API key configured on server (set AUTONOMOUS_AUTOMATION_GEMINI_KEY).'
      : `No dedicated Agency ${provider.toUpperCase()} API key configured on server.`
    : undefined;

  // 1. Live Google Gemini REST API (lowest-cost/highest-quota evergreen cascade)
  if (apiKey && provider === 'gemini') {
    const envAgencyModel = (
      process.env.AGENCY_GEMINI_MODEL ||
      process.env.AUTONOMOUS_AUTOMATION_GEMINI_MODEL ||
      ''
    ).trim();
    const candidateModels =
      modelId === 'gemini-2.5-flash'
        ? Array.from(
            new Set([
              ...(envAgencyModel ? [envAgencyModel] : []),
              'gemini-flash-lite-latest',
              'gemini-3.5-flash-lite',
              'gemini-flash-latest',
              'gemini-3.8-flash',
              'gemini-2.5-flash',
            ])
          )
        : [modelId];

    for (const targetGeminiModel of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          targetGeminiModel
        )}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: req.systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: req.userPrompt }],
              },
            ],
            generationConfig: {
              temperature: req.temperature ?? 0.35,
              maxOutputTokens: req.maxOutputTokens ?? 1200,
            },
          }),
          signal: AbortSignal.timeout(22000),
        });

        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
            usageMetadata?: {
              promptTokenCount?: number;
              candidatesTokenCount?: number;
              thoughtsTokenCount?: number;
              totalTokenCount?: number;
            };
          };
          const outputText: string =
            data?.candidates?.[0]?.content?.parts
              ?.map((p) => p?.text || '')
              .join('\n')
              .trim() || '';

          const usage = data?.usageMetadata || {};
          const promptTokens = Number(usage.promptTokenCount) || 0;
          const completionTokens = Number(usage.candidatesTokenCount) || 0;
          const thinkingTokens = Number(usage.thoughtsTokenCount) || 0;
          const totalTokens =
            usage.totalTokenCount ?? promptTokens + completionTokens + thinkingTokens;
          const shadowPaidCostUsd = computeTokenCostUsd({
            modelId,
            promptTokens,
            completionTokens,
            thinkingTokens,
          });
          const apiKeySlot = resolveApiKeySlotId({
            provider,
            isFreeTierKey,
            hasKeyOverride: hasOverride,
            usedLiveApiKey: true,
          });

          return {
            ok: Boolean(outputText),
            usageReported: typeof usage.promptTokenCount === 'number',
            provider,
            modelId,
            apiKeySlot,
            outputText,
            usedLiveApiKey: true,
            isFreeTierKey,
            promptTokens,
            completionTokens,
            thinkingTokens,
            totalTokens,
            shadowPaidCostUsd,
            actualCostUsd: isFreeTierKey ? 0 : shadowPaidCostUsd,
            latencyMs: Date.now() - startTime,
            telemetryNote: `Live Gemini API (${targetGeminiModel} · ${apiKeySlot}) captured ${totalTokens.toLocaleString()} tokens · Shadow Cost $${shadowPaidCostUsd.toFixed(
              5
            )}`,
            apiErrorDetail: outputText ? undefined : 'Gemini returned an empty response.',
          };
        }

        apiErrorDetail = await readProviderErrorDetail('gemini', res);
        // Cascade to the next candidate model on 404/400/429/503
        if (![400, 404, 429, 503].includes(res.status)) {
          break;
        }
      } catch (err) {
        apiErrorDetail =
          err instanceof Error
            ? `GEMINI network/timeout error: ${err.message.slice(0, 140)}`
            : 'GEMINI network/timeout error.';
        break;
      }
    }
  }

  // 2. Live OpenAI or Groq OpenAI-Compatible Chat Completions API
  if (apiKey && (provider === 'openai' || provider === 'groq')) {
    try {
      const endpoint =
        provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          temperature: req.temperature ?? 0.35,
          max_tokens: req.maxOutputTokens ?? 1200,
          messages: [
            { role: 'system', content: req.systemPrompt },
            { role: 'user', content: req.userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(22000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        };
        const outputText: string =
          data?.choices?.[0]?.message?.content?.trim() || '';
        const usage = data?.usage || {};
        const promptTokens = Number(usage.prompt_tokens) || 0;
        const completionTokens = Number(usage.completion_tokens) || 0;
        const totalTokens = usage.total_tokens ?? promptTokens + completionTokens;
        const shadowPaidCostUsd = computeTokenCostUsd({
          modelId,
          promptTokens,
          completionTokens,
          thinkingTokens: 0,
        });
        const apiKeySlot = resolveApiKeySlotId({
          provider,
          isFreeTierKey,
          hasKeyOverride: hasOverride,
          usedLiveApiKey: true,
        });

        return {
          ok: Boolean(outputText),
          usageReported: typeof usage.prompt_tokens === 'number',
          provider,
          modelId,
          apiKeySlot,
          outputText,
          usedLiveApiKey: true,
          isFreeTierKey,
          promptTokens,
          completionTokens,
          thinkingTokens: 0,
          totalTokens,
          shadowPaidCostUsd,
          actualCostUsd: isFreeTierKey ? 0 : shadowPaidCostUsd,
          latencyMs: Date.now() - startTime,
          telemetryNote: `Live ${provider.toUpperCase()} (${apiKeySlot}) captured ${totalTokens.toLocaleString()} tokens · Shadow Cost $${shadowPaidCostUsd.toFixed(
            5
          )}`,
          apiErrorDetail: outputText ? undefined : `${provider.toUpperCase()} returned an empty response.`,
        };
      }
      apiErrorDetail = await readProviderErrorDetail(provider, res);
    } catch (err) {
      apiErrorDetail =
        err instanceof Error
          ? `${provider.toUpperCase()} network/timeout error: ${err.message.slice(0, 140)}`
          : `${provider.toUpperCase()} network/timeout error.`;
    }
  }

  return {
    ok: false,
    usageReported: false,
    provider,
    modelId,
    apiKeySlot: 'KEY_SLOT_MECHANICAL_ZERO',
    outputText: '',
    usedLiveApiKey: false,
    isFreeTierKey,
    promptTokens: 0,
    completionTokens: 0,
    thinkingTokens: 0,
    totalTokens: 0,
    shadowPaidCostUsd: 0,
    actualCostUsd: 0,
    latencyMs: Date.now() - startTime,
    telemetryNote: 'Provider unavailable',
    apiErrorDetail:
      apiErrorDetail || 'Provider request failed. Check provider configuration.',
  };
}
