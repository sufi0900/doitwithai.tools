import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import { executeAgencyLlmCall, providerBindings, type AgencyLlmRequest } from '@/lib/ai-employee-agency/llm-gateway';
import { computeTokenCostUsd, MODEL_PRICING_CATALOG } from '@/lib/ai-employee-agency/token-telemetry-store';

function workspaceKeys(owner: string): Record<string, string> | undefined {
  return JSON.parse(process.env.AGENCY_BYOK_JSON || '{}')[owner];
}

export function agencyProviderBindings(owner: string) {
  const keys = workspaceKeys(owner);
  return keys ? { gemini: Boolean(keys.gemini), openai: Boolean(keys.openai), groq: Boolean(keys.groq) } : providerBindings();
}

export async function meteredAgencyCall(owner: string, specialist: string, request: AgencyLlmRequest, productionArticle = false) {
  const modelId = request.modelId || 'gemini-2.5-flash';
  if (!Object.hasOwn(MODEL_PRICING_CATALOG, modelId)) throw Error('Unknown model');
  const provider = MODEL_PRICING_CATALOG[modelId].provider;
  const keys = workspaceKeys(owner);
  const failure = (detail: string, status: number) => ({ ok: false as const, apiErrorDetail: detail, status });
  const key = request.apiKeyOverride || keys?.[provider];
  if (keys && (!key || key.trim().length <= 8))
    return failure('Configure the workspace provider key before dispatch.', 503);
  if (!key && !providerBindings()[provider])
    return failure('The selected provider needs a configured key.', 503);
  if (key && key.trim().length <= 8) return failure('Invalid provider key.', 400);
  const db = createSupabaseServiceClient();
  if (!db) return failure('Workspace billing is unavailable.', 503);

  // UTF-8 bytes bound prompt tokens conservatively, including room for message framing.
  const input = new TextEncoder().encode(request.systemPrompt + request.userPrompt).length + 128;
  const output = request.maxOutputTokens ?? 1200;
  const reservation = await db.rpc('agency_reserve_usage', {
    owner, specialist,
    asset: productionArticle ? null : specialist === 'writer' ? 'article' :
      ['facebook', 'linkedin', 'video', 'pinterest', 'social'].includes(specialist) ? 'social' : null,
    model_id: modelId, provider_id: provider, tokens: input + output,
    usd: computeTokenCostUsd({ modelId, promptTokens: input, completionTokens: output }), use_byok: Boolean(key),
  });
  if (reservation.error) return failure('Check the workspace billing entitlement and migrations.', 503);
  if (!reservation.data) return failure('Workspace quota reached. This request exceeds the remaining allowance.', 429);
  const call = await executeAgencyLlmCall({ ...request, modelId, apiKeyOverride: key });
  if (call.usageReported) {
    const result = await db.from('token_usage_ledger').update({
      prompt_tokens: call.promptTokens, completion_tokens: call.completionTokens, thinking_tokens: call.thinkingTokens,
      total_tokens: call.totalTokens, calculated_usd: call.shadowPaidCostUsd, held_tokens: 0, held_usd: 0,
    }).eq('id', reservation.data).eq('workspace_id', owner);
    if (result.error) return failure('Unable to settle provider usage. The reservation remains held.', 503);
  }
  if (!call.ok) return failure(call.apiErrorDetail || 'The provider returned no answer.', 503);
  return { ...call, ok: true as const, status: 200 };
}
