import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import { executeAgencyLlmCall, providerBindings, type AgencyLlmRequest } from '@/lib/ai-employee-agency/llm-gateway';
import {
  computeTokenCostUsd,
  MODEL_PRICING_CATALOG,
  type AgencyLlmModelId,
} from '@/lib/ai-employee-agency/token-telemetry-store';

function workspaceKeys(owner: string): Record<string, string> | undefined {
  return JSON.parse(process.env.AGENCY_BYOK_JSON || '{}')[owner];
}

export function agencyProviderBindings(owner: string) {
  const keys = workspaceKeys(owner);
  return keys
    ? { gemini: Boolean(keys.gemini), openai: Boolean(keys.openai), groq: Boolean(keys.groq) }
    : providerBindings();
}

/**
 * Estimates prompt tokens accurately (~4 UTF-8 bytes per token + message framing).
 * Fixes the V5 4x over-reservation bug where raw UTF-8 byte length was reserved as tokens.
 */
export function estimatePromptTokens(systemPrompt: string, userPrompt: string): number {
  const utf8Bytes = new TextEncoder().encode(systemPrompt + userPrompt).length;
  return Math.max(64, Math.ceil(utf8Bytes / 4) + 128);
}

/**
 * Founder Unlimited Testing Mode:
 * When AGENCY_UNLIMITED_TESTING=true (or workspace UUID is in AGENCY_UNLIMITED_WORKSPACE_IDS / AGENCY_ADMIN_USER_IDS),
 * removes hard daily/monthly quota lockouts during Preview testing while STILL recording 100% real token & USD telemetry.
 */
export function isUnlimitedTestingEnabled(owner: string): boolean {
  const globalFlag = (process.env.AGENCY_UNLIMITED_TESTING || '').trim().toLowerCase();
  if (globalFlag === 'true' || globalFlag === '1' || globalFlag === 'yes') {
    return true;
  }
  const allowList = [
    process.env.AGENCY_UNLIMITED_WORKSPACE_IDS || '',
    process.env.AGENCY_ADMIN_USER_IDS || '',
  ]
    .join(',')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return allowList.includes(owner);
}

/**
 * 1-Flip Provider-Agnostic Model Resolution:
 * - Testing default: Gemini via isolated AUTONOMOUS_AUTOMATION_GEMINI_KEY.
 * - Commercial OpenAI upgrade: set AGENCY_PRIMARY_PROVIDER=openai + AUTONOMOUS_AUTOMATION_OPENAI_KEY
 *   (and optional AGENCY_OPENAI_MODEL=gpt-4.1-mini | gpt-4o-mini) to upgrade all specialists automatically.
 */
export function resolveDefaultAgencyModelId(
  owner: string,
  requested?: AgencyLlmModelId,
): AgencyLlmModelId {
  const primaryProvider = (process.env.AGENCY_PRIMARY_PROVIDER || '').trim().toLowerCase();
  const bindings = agencyProviderBindings(owner);

  if (primaryProvider === 'openai' && bindings.openai) {
    const configured = (process.env.AGENCY_OPENAI_MODEL || '').trim() as AgencyLlmModelId;
    if (configured && Object.hasOwn(MODEL_PRICING_CATALOG, configured)) {
      return configured;
    }
    return 'gpt-4.1-mini';
  }

  if (primaryProvider === 'groq' && bindings.groq) {
    return 'llama-3.3-70b-versatile';
  }

  if (requested && Object.hasOwn(MODEL_PRICING_CATALOG, requested)) {
    return requested;
  }

  return 'gemini-2.5-flash';
}

export function resolveMeteredAssetKind(
  specialist: string,
  productionArticle = false,
): 'article' | 'existing_page_optimization' | 'social' | null {
  if (productionArticle) return null;
  if (specialist === 'writer') return 'article';
  if (specialist === 'refresh') return 'existing_page_optimization';
  if (['facebook', 'linkedin', 'video', 'pinterest', 'social'].includes(specialist)) {
    return 'social';
  }
  return null;
}

export async function meteredAgencyCall(
  owner: string,
  specialist: string,
  request: AgencyLlmRequest,
  productionArticle = false,
) {
  const modelId = resolveDefaultAgencyModelId(owner, request.modelId);
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

  const unlimitedTesting = isUnlimitedTestingEnabled(owner);

  if (unlimitedTesting) {
    const call = await executeAgencyLlmCall({ ...request, modelId, apiKeyOverride: key });
    if (call.usageReported) {
      await db.from('token_usage_ledger').insert({
        workspace_id: owner,
        operation: specialist,
        model: call.modelId || modelId,
        provider: call.provider || provider,
        prompt_tokens: call.promptTokens,
        completion_tokens: call.completionTokens,
        thinking_tokens: call.thinkingTokens,
        total_tokens: call.totalTokens,
        calculated_usd: call.shadowPaidCostUsd,
        held_tokens: 0,
        held_usd: 0,
      });
    }
    if (!call.ok) return failure(call.apiErrorDetail || 'The provider returned no answer.', 503);
    return { ...call, ok: true as const, status: 200 };
  }

  const input = estimatePromptTokens(request.systemPrompt, request.userPrompt);
  const output = request.maxOutputTokens ?? 1200;
  const reservation = await db.rpc('agency_reserve_usage', {
    owner,
    specialist,
    asset: resolveMeteredAssetKind(specialist, productionArticle),
    model_id: modelId,
    provider_id: provider,
    tokens: input + output,
    usd: computeTokenCostUsd({ modelId, promptTokens: input, completionTokens: output }),
    use_byok: Boolean(key),
  });
  if (reservation.error) return failure('Check the workspace billing entitlement and migrations.', 503);
  if (!reservation.data) {
    return failure(
      'Workspace quota reached. Enable AGENCY_UNLIMITED_TESTING=true in Preview for unlimited testing, or upgrade tier limits.',
      429,
    );
  }
  const call = await executeAgencyLlmCall({ ...request, modelId, apiKeyOverride: key });
  if (call.usageReported) {
    const result = await db
      .from('token_usage_ledger')
      .update({
        prompt_tokens: call.promptTokens,
        completion_tokens: call.completionTokens,
        thinking_tokens: call.thinkingTokens,
        total_tokens: call.totalTokens,
        calculated_usd: call.shadowPaidCostUsd,
        held_tokens: 0,
        held_usd: 0,
      })
      .eq('id', reservation.data)
      .eq('workspace_id', owner);
    if (result.error) return failure('Unable to settle provider usage. The reservation remains held.', 503);
  }
  if (!call.ok) return failure(call.apiErrorDetail || 'The provider returned no answer.', 503);
  return { ...call, ok: true as const, status: 200 };
}
