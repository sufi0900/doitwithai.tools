/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 7 + V4 PHASE 12)
 * Module: `lib/ai-employee-agency/llm-gateway.ts`
 *
 * Unified Server-Side Free/Paid LLM Gateway (`Gemini 2.5 Flash`, `Groq Llama 3.3 70B`,
 * `OpenAI GPT-4o-mini` / `GPT-4.1-mini`) — strict TypeScript (zero `any`).
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
}

export function estimateTokensFromText(text: string): number {
  const cleaned = (text || '').trim();
  if (!cleaned) return 0;
  return Math.max(12, Math.ceil(cleaned.length / 3.85));
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
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        ''
      ).trim(),
      hasOverride: false,
    };
  }
  if (provider === 'groq') {
    return { apiKey: (process.env.GROQ_API_KEY || '').trim(), hasOverride: false };
  }
  if (provider === 'openai') {
    return { apiKey: (process.env.OPENAI_API_KEY || '').trim(), hasOverride: false };
  }
  return { apiKey: '', hasOverride: false };
}

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

  if (provider === 'gemini' && apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
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
        signal: AbortSignal.timeout(12000),
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
          };
        };
        const outputText: string =
          data?.candidates?.[0]?.content?.parts
            ?.map((p) => p?.text || '')
            .join('\n')
            .trim() || '';

        const usage = data?.usageMetadata || {};
        const promptTokens =
          Number(usage.promptTokenCount) ||
          estimateTokensFromText(req.systemPrompt + req.userPrompt);
        const completionTokens =
          Number(usage.candidatesTokenCount) || estimateTokensFromText(outputText);
        const thinkingTokens = Number(usage.thoughtsTokenCount) || 0;
        const totalTokens = promptTokens + completionTokens + thinkingTokens;
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
          ok: true,
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
          telemetryNote: `Live Gemini API (${apiKeySlot}) captured ${totalTokens.toLocaleString()} tokens · Shadow Cost $${shadowPaidCostUsd.toFixed(
            5
          )}`,
        };
      }
    } catch {
      // Fall through to deterministic shadow telemetry if network/key restricted
    }
  }

  if ((provider === 'openai' || provider === 'groq') && apiKey) {
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
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const outputText: string =
          data?.choices?.[0]?.message?.content?.trim() || '';
        const usage = data?.usage || {};
        const promptTokens =
          Number(usage.prompt_tokens) ||
          estimateTokensFromText(req.systemPrompt + req.userPrompt);
        const completionTokens =
          Number(usage.completion_tokens) || estimateTokensFromText(outputText);
        const totalTokens = promptTokens + completionTokens;
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
          ok: true,
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
        };
      }
    } catch {
      // Fall through to deterministic shadow telemetry
    }
  }

  const promptTokens = estimateTokensFromText(
    `${req.systemPrompt}\n${req.userPrompt}`
  );
  const simulatedCompletionTokens = 280;
  const totalTokens = promptTokens + simulatedCompletionTokens;
  const shadowPaidCostUsd = computeTokenCostUsd({
    modelId,
    promptTokens,
    completionTokens: simulatedCompletionTokens,
    thinkingTokens: 0,
  });
  const apiKeySlot = resolveApiKeySlotId({
    provider,
    isFreeTierKey: true,
    hasKeyOverride: false,
    usedLiveApiKey: false,
  });

  return {
    ok: true,
    provider,
    modelId,
    apiKeySlot,
    outputText: '',
    usedLiveApiKey: false,
    isFreeTierKey: true,
    promptTokens,
    completionTokens: simulatedCompletionTokens,
    thinkingTokens: 0,
    totalTokens,
    shadowPaidCostUsd,
    actualCostUsd: 0,
    latencyMs: Math.max(120, Date.now() - startTime),
    telemetryNote: `Shadow Token Meter (${apiKeySlot}) active · ${totalTokens.toLocaleString()} tokens metered at ${spec.displayName} rates ($0.00 billed)`,
  };
}
