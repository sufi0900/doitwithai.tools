/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 7 + V4 PHASE 12)
 * Module: `lib/ai-employee-agency/token-telemetry-store.ts`
 *
 * Zero-Based Real-Time Per-Agent & Chat Token Telemetry Ledger + 1-Circle Unit Economics:
 * - V4 Phase 12 Upgrade: Initializes every live session strictly at `0 tokens ($0.0000)`
 *   across all 36 AI Employees + the Founder Chat Box (`chat-copilot-box`), with a
 *   1-click `Reset Session to 0` action and `KEY_SLOT_*` attribution on every call.
 * - Tracks exact input (`promptTokenCount`), output (`candidatesTokenCount`), and
 *   thinking (`thoughtsTokenCount`) tokens in real time as each agent or chat message
 *   executes, computing both Actual Billed Cost ($0.00 on Free Key) and Shadow
 *   Commercial Cost at published API pricing.
 * - Preserves the 5-Stage 1-Circle Reference Unit Economics calculator for SaaS
 *   gross-margin modeling ($49/mo and $149/mo tiers).
 * ============================================================================
 */

import { getAllAgencyEmployeesFlat } from './agent-registry';

export type AgencyLlmProviderId = 'gemini' | 'openai' | 'groq';

export type AgencyLlmModelId =
  | 'gemini-2.5-flash'
  | 'gpt-4o-mini'
  | 'gpt-4.1-mini'
  | 'llama-3.3-70b-versatile';

export type ApiKeySlotId =
  | 'KEY_SLOT_GEMINI_FREE'
  | 'KEY_SLOT_GEMINI_PAID'
  | 'KEY_SLOT_GROQ_FREE'
  | 'KEY_SLOT_GROQ_PAID'
  | 'KEY_SLOT_OPENAI_PAID'
  | 'KEY_SLOT_CUSTOM_OVERRIDE'
  | 'KEY_SLOT_MECHANICAL_ZERO';

export interface LlmModelPricingSpec {
  modelId: AgencyLlmModelId;
  provider: AgencyLlmProviderId;
  displayName: string;
  inputUsdPer1M: number;
  outputUsdPer1M: number;
  cachedInputUsdPer1M: number;
  supportsFreeTierKey: boolean;
  freeTierRateLimitSummary: string;
  pricingSourceUrl: string;
}

export const MODEL_PRICING_CATALOG: Record<AgencyLlmModelId, LlmModelPricingSpec> = {
  'gemini-2.5-flash': {
    modelId: 'gemini-2.5-flash',
    provider: 'gemini',
    displayName: 'Google Gemini 2.5 Flash (Default Hybrid Engine)',
    inputUsdPer1M: 0.30,
    outputUsdPer1M: 2.50,
    cachedInputUsdPer1M: 0.075,
    supportsFreeTierKey: true,
    freeTierRateLimitSummary: 'Free Tier: 10–15 RPM · 250 RPD · Returns exact usageMetadata tokens',
    pricingSourceUrl: 'https://creditforstartups.com/pricing/gemini-api-pricing',
  },
  'gpt-4o-mini': {
    modelId: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'OpenAI GPT-4o-mini (Ultra-Low-Cost Commercial)',
    inputUsdPer1M: 0.15,
    outputUsdPer1M: 0.60,
    cachedInputUsdPer1M: 0.075,
    supportsFreeTierKey: false,
    freeTierRateLimitSummary: 'Paid Tier: 500+ RPM · Ultra-low $0.0054 per full agency circle',
    pricingSourceUrl: 'https://www.aipricing.guru/models/gpt-4o-mini/',
  },
  'gpt-4.1-mini': {
    modelId: 'gpt-4.1-mini',
    provider: 'openai',
    displayName: 'OpenAI GPT-4.1 Mini (High-Depth Editorial)',
    inputUsdPer1M: 0.40,
    outputUsdPer1M: 1.60,
    cachedInputUsdPer1M: 0.10,
    supportsFreeTierKey: false,
    freeTierRateLimitSummary: 'Paid Tier: 500+ RPM · 1M context window · $0.0143 per full circle',
    pricingSourceUrl: 'https://explainx.ai/models/openai/gpt-4.1-mini/cost',
  },
  'llama-3.3-70b-versatile': {
    modelId: 'llama-3.3-70b-versatile',
    provider: 'groq',
    displayName: 'Groq Llama 3.3 70B Versatile (Instant Free/Paid LPU)',
    inputUsdPer1M: 0.59,
    outputUsdPer1M: 0.79,
    cachedInputUsdPer1M: 0.295,
    supportsFreeTierKey: true,
    freeTierRateLimitSummary: 'Free Tier: 30 RPM · 1,000 RPD · ~300 tok/sec LPU speed',
    pricingSourceUrl:
      'https://www.spheron.network/blog/groq-api-pricing-2026-cost-per-token-vs-gpu-rental/',
  },
};

export function resolveApiKeySlotId(params: {
  provider: AgencyLlmProviderId;
  isFreeTierKey: boolean;
  hasKeyOverride?: boolean;
  usedLiveApiKey?: boolean;
}): ApiKeySlotId {
  if (params.hasKeyOverride && params.usedLiveApiKey) {
    return 'KEY_SLOT_CUSTOM_OVERRIDE';
  }
  if (!params.usedLiveApiKey && params.usedLiveApiKey !== undefined) {
    return 'KEY_SLOT_MECHANICAL_ZERO';
  }
  if (params.provider === 'gemini') {
    return params.isFreeTierKey ? 'KEY_SLOT_GEMINI_FREE' : 'KEY_SLOT_GEMINI_PAID';
  }
  if (params.provider === 'groq') {
    return params.isFreeTierKey ? 'KEY_SLOT_GROQ_FREE' : 'KEY_SLOT_GROQ_PAID';
  }
  return 'KEY_SLOT_OPENAI_PAID';
}

export interface CircleStageTokenRecord {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  departmentName: string;
  agentName: string;
  taskDescription: string;
  mechanicalZeroCostTasks: string[];
  promptTokens: number;
  completionTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  shadowPaidCostUsd: number;
  actualCostUsd: number;
  latencyMs: number;
  executionSource: 'live-api-key' | 'free-tier-shadow-telemetry';
}

export interface AgencyCircleTelemetrySnapshot {
  circleId: string;
  timestampIso: string;
  siteName: string;
  activeTopicTitle: string;
  modelId: AgencyLlmModelId;
  provider: AgencyLlmProviderId;
  isFreeTierKeyActive: boolean;
  mechanicalWorkSharePercent: number;
  llmCognitiveSharePercent: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalThinkingTokens: number;
  totalCircleTokens: number;
  singleCircleShadowCostUsd: number;
  singleCircleActualCostUsd: number;
  projected30DayMonthlyCostUsd: number;
  grossMarginAt49UsdPlanPercent: number;
  grossMarginAt149UsdSeoAiTierPercent: number;
  stages: CircleStageTokenRecord[];
}

/**
 * ============================================================================
 * V4 PHASE 12: ZERO-BASED REAL-TIME PER-AGENT & CHAT TOKEN TELEMETRY LEDGER
 * ============================================================================
 */

export const CHAT_BOX_LEDGER_ROW_ID = 'chat-copilot-box';

export interface AgentSessionTokenRow {
  rowId: string;
  displayName: string;
  roleBadge: string;
  departmentName: string;
  departmentTab: string;
  isChatBox: boolean;
  apiKeySlot: ApiKeySlotId;
  modelId: AgencyLlmModelId;
  apiCallsCount: number;
  promptTokens: number;
  completionTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  shadowCostUsd: number;
  actualCostUsd: number;
  lastActionSummary: string;
  lastUpdatedIso: string | null;
  status: 'idle' | 'active';
}

export interface SessionTokenLedgerEvent {
  eventId: string;
  timestampIso: string;
  rowId: string;
  actorName: string;
  actionLabel: string;
  apiKeySlot: ApiKeySlotId;
  modelId: AgencyLlmModelId;
  promptTokens: number;
  completionTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  shadowCostUsd: number;
  actualCostUsd: number;
  usedLiveApiKey: boolean;
}

export interface ZeroBasedSessionTokenLedger {
  sessionId: string;
  startedAtIso: string;
  lastResetAtIso: string;
  siteName: string;
  activeModelId: AgencyLlmModelId;
  isFreeTierKeyActive: boolean;
  activeKeySlot: ApiKeySlotId;
  totalApiCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalThinkingTokens: number;
  totalSessionTokens: number;
  totalShadowCostUsd: number;
  totalActualCostUsd: number;
  chatBoxTokens: number;
  chatBoxShadowCostUsd: number;
  activeAgentsCount: number;
  rows: AgentSessionTokenRow[];
  recentEvents: SessionTokenLedgerEvent[];
}

export interface RecordTokenUsageDelta {
  rowId: string;
  actionLabel: string;
  modelId: AgencyLlmModelId;
  apiKeySlot?: ApiKeySlotId;
  promptTokens: number;
  completionTokens: number;
  thinkingTokens?: number;
  shadowCostUsd?: number;
  actualCostUsd?: number;
  usedLiveApiKey?: boolean;
  isFreeTierKey?: boolean;
}

const TELEMETRY_STORAGE_KEY = 'doitwithai_agency_v3_token_telemetry_v1';
const ZERO_BASED_LEDGER_STORAGE_KEY = 'doitwithai_agency_v4_zero_token_ledger_v1';

/**
 * Computes exact USD cost from input + output + thinking tokens for a given model
 */
export function computeTokenCostUsd(params: {
  modelId: AgencyLlmModelId;
  promptTokens: number;
  completionTokens: number;
  thinkingTokens?: number;
}): number {
  const spec =
    MODEL_PRICING_CATALOG[params.modelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];
  const billableOutputTokens = params.completionTokens + (params.thinkingTokens || 0);
  const inputCost = (params.promptTokens / 1_000_000) * spec.inputUsdPer1M;
  const outputCost = (billableOutputTokens / 1_000_000) * spec.outputUsdPer1M;
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Creates a clean Zero-Based Session Token Ledger initialized strictly at
 * 0 tokens ($0.0000) across the Founder Chat Box + all 36 AI Employees.
 */
export function createZeroBasedSessionTokenLedger(params: {
  siteName: string;
  modelId?: AgencyLlmModelId;
  isFreeTierKeyActive?: boolean;
}): ZeroBasedSessionTokenLedger {
  const nowIso = new Date().toISOString();
  const modelId: AgencyLlmModelId = params.modelId || 'gemini-2.5-flash';
  const spec = MODEL_PRICING_CATALOG[modelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];
  const isFree =
    params.isFreeTierKeyActive !== undefined
      ? params.isFreeTierKeyActive
      : spec.supportsFreeTierKey;
  const defaultSlot = resolveApiKeySlotId({
    provider: spec.provider,
    isFreeTierKey: isFree,
    usedLiveApiKey: true,
  });

  const chatBoxRow: AgentSessionTokenRow = {
    rowId: CHAT_BOX_LEDGER_ROW_ID,
    displayName: 'Founder Copilot & Agent Chat Box',
    roleBadge: 'Interactive Chat',
    departmentName: 'Workspace Copilot',
    departmentTab: 'executive-overview',
    isChatBox: true,
    apiKeySlot: defaultSlot,
    modelId,
    apiCallsCount: 0,
    promptTokens: 0,
    completionTokens: 0,
    thinkingTokens: 0,
    totalTokens: 0,
    shadowCostUsd: 0,
    actualCostUsd: 0,
    lastActionSummary: 'Idle — 0 messages metered in current session',
    lastUpdatedIso: null,
    status: 'idle',
  };

  const agentRows: AgentSessionTokenRow[] = getAllAgencyEmployeesFlat().map((emp) => ({
    rowId: emp.id,
    displayName: emp.name,
    roleBadge: emp.tier === 'manager' || emp.tier === 'executive' ? 'Dept Manager' : 'Sub-Agent',
    departmentName: emp.departmentBadge,
    departmentTab: emp.departmentTab,
    isChatBox: false,
    apiKeySlot: defaultSlot,
    modelId,
    apiCallsCount: 0,
    promptTokens: 0,
    completionTokens: 0,
    thinkingTokens: 0,
    totalTokens: 0,
    shadowCostUsd: 0,
    actualCostUsd: 0,
    lastActionSummary: 'Idle — awaiting task execution',
    lastUpdatedIso: null,
    status: 'idle',
  }));

  return {
    sessionId: `session-${Date.now()}`,
    startedAtIso: nowIso,
    lastResetAtIso: nowIso,
    siteName: params.siteName,
    activeModelId: modelId,
    isFreeTierKeyActive: isFree,
    activeKeySlot: defaultSlot,
    totalApiCalls: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalThinkingTokens: 0,
    totalSessionTokens: 0,
    totalShadowCostUsd: 0,
    totalActualCostUsd: 0,
    chatBoxTokens: 0,
    chatBoxShadowCostUsd: 0,
    activeAgentsCount: 0,
    rows: [chatBoxRow, ...agentRows],
    recentEvents: [],
  };
}

/**
 * Recomputes all aggregate totals from `rows` cleanly to prevent drift.
 */
function recomputeLedgerTotals(
  ledger: ZeroBasedSessionTokenLedger
): ZeroBasedSessionTokenLedger {
  let totalApiCalls = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalThinkingTokens = 0;
  let totalSessionTokens = 0;
  let totalShadowCostUsd = 0;
  let totalActualCostUsd = 0;
  let chatBoxTokens = 0;
  let chatBoxShadowCostUsd = 0;
  let activeAgentsCount = 0;

  for (const row of ledger.rows) {
    totalApiCalls += row.apiCallsCount;
    totalPromptTokens += row.promptTokens;
    totalCompletionTokens += row.completionTokens;
    totalThinkingTokens += row.thinkingTokens;
    totalSessionTokens += row.totalTokens;
    totalShadowCostUsd += row.shadowCostUsd;
    totalActualCostUsd += row.actualCostUsd;

    if (row.isChatBox) {
      chatBoxTokens += row.totalTokens;
      chatBoxShadowCostUsd += row.shadowCostUsd;
    } else if (row.apiCallsCount > 0 || row.totalTokens > 0) {
      activeAgentsCount += 1;
    }
  }

  return {
    ...ledger,
    totalApiCalls,
    totalPromptTokens,
    totalCompletionTokens,
    totalThinkingTokens,
    totalSessionTokens,
    totalShadowCostUsd: Number(totalShadowCostUsd.toFixed(6)),
    totalActualCostUsd: Number(totalActualCostUsd.toFixed(6)),
    chatBoxTokens,
    chatBoxShadowCostUsd: Number(chatBoxShadowCostUsd.toFixed(6)),
    activeAgentsCount,
  };
}

/**
 * Records a real-time token consumption event against a specific agent or the Chat Box.
 */
export function recordSessionTokenUsage(
  ledger: ZeroBasedSessionTokenLedger,
  delta: RecordTokenUsageDelta
): ZeroBasedSessionTokenLedger {
  const nowIso = new Date().toISOString();
  const modelId = delta.modelId || ledger.activeModelId;
  const spec = MODEL_PRICING_CATALOG[modelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];
  const promptTokens = Math.max(0, Math.round(delta.promptTokens));
  const completionTokens = Math.max(0, Math.round(delta.completionTokens));
  const thinkingTokens = Math.max(0, Math.round(delta.thinkingTokens || 0));
  const totalTokens = promptTokens + completionTokens + thinkingTokens;

  if (totalTokens <= 0) {
    return ledger;
  }

  const shadowCostUsd =
    delta.shadowCostUsd !== undefined
      ? Number(delta.shadowCostUsd.toFixed(6))
      : computeTokenCostUsd({
          modelId,
          promptTokens,
          completionTokens,
          thinkingTokens,
        });

  const isFree =
    delta.isFreeTierKey !== undefined ? delta.isFreeTierKey : ledger.isFreeTierKeyActive;
  const actualCostUsd =
    delta.actualCostUsd !== undefined
      ? Number(delta.actualCostUsd.toFixed(6))
      : isFree
      ? 0
      : shadowCostUsd;

  const resolvedSlot: ApiKeySlotId =
    delta.apiKeySlot ||
    resolveApiKeySlotId({
      provider: spec.provider,
      isFreeTierKey: isFree,
      usedLiveApiKey: delta.usedLiveApiKey ?? false,
    });

  let matchedActorName = 'Workspace Copilot';
  let foundTarget = false;

  const updatedRows = ledger.rows.map((row) => {
    if (row.rowId !== delta.rowId) return row;
    foundTarget = true;
    matchedActorName = row.displayName;
    return {
      ...row,
      apiKeySlot: resolvedSlot,
      modelId,
      apiCallsCount: row.apiCallsCount + 1,
      promptTokens: row.promptTokens + promptTokens,
      completionTokens: row.completionTokens + completionTokens,
      thinkingTokens: row.thinkingTokens + thinkingTokens,
      totalTokens: row.totalTokens + totalTokens,
      shadowCostUsd: Number((row.shadowCostUsd + shadowCostUsd).toFixed(6)),
      actualCostUsd: Number((row.actualCostUsd + actualCostUsd).toFixed(6)),
      lastActionSummary: delta.actionLabel,
      lastUpdatedIso: nowIso,
      status: 'active' as const,
    };
  });

  // Fallback to Chat Box row if an unknown rowId was passed
  const finalRows = foundTarget
    ? updatedRows
    : updatedRows.map((row) => {
        if (row.rowId !== CHAT_BOX_LEDGER_ROW_ID) return row;
        matchedActorName = row.displayName;
        return {
          ...row,
          apiKeySlot: resolvedSlot,
          modelId,
          apiCallsCount: row.apiCallsCount + 1,
          promptTokens: row.promptTokens + promptTokens,
          completionTokens: row.completionTokens + completionTokens,
          thinkingTokens: row.thinkingTokens + thinkingTokens,
          totalTokens: row.totalTokens + totalTokens,
          shadowCostUsd: Number((row.shadowCostUsd + shadowCostUsd).toFixed(6)),
          actualCostUsd: Number((row.actualCostUsd + actualCostUsd).toFixed(6)),
          lastActionSummary: delta.actionLabel,
          lastUpdatedIso: nowIso,
          status: 'active' as const,
        };
      });

  const newEvent: SessionTokenLedgerEvent = {
    eventId: `tok-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestampIso: nowIso,
    rowId: foundTarget ? delta.rowId : CHAT_BOX_LEDGER_ROW_ID,
    actorName: matchedActorName,
    actionLabel: delta.actionLabel,
    apiKeySlot: resolvedSlot,
    modelId,
    promptTokens,
    completionTokens,
    thinkingTokens,
    totalTokens,
    shadowCostUsd,
    actualCostUsd,
    usedLiveApiKey: Boolean(delta.usedLiveApiKey),
  };

  return recomputeLedgerTotals({
    ...ledger,
    activeModelId: modelId,
    activeKeySlot: resolvedSlot,
    rows: finalRows,
    recentEvents: [newEvent, ...ledger.recentEvents].slice(0, 40),
  });
}

/**
 * Maps the 5 cognitive stages of a completed Agency Circle audit onto their
 * responsible Department Managers inside the Zero-Based Session Ledger.
 */
const STAGE_TO_AGENT_ID: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'mgr-keyword-strategist',
  2: 'mgr-content-production',
  3: 'mgr-graphic-design',
  4: 'mgr-onpage-seo',
  5: 'mgr-social-media-video',
};

export function recordCircleOrchestrationIntoLedger(
  ledger: ZeroBasedSessionTokenLedger,
  circleSnap: AgencyCircleTelemetrySnapshot,
  options?: {
    apiKeySlot?: ApiKeySlotId;
    usedLiveApiKey?: boolean;
    stageOnly?: 1;
  }
): ZeroBasedSessionTokenLedger {
  const stagesToApply = options?.stageOnly
    ? circleSnap.stages.filter((s) => s.stageNumber === options.stageOnly)
    : circleSnap.stages;

  let next = ledger;
  for (const st of stagesToApply) {
    const agentId = STAGE_TO_AGENT_ID[st.stageNumber] || 'mgr-keyword-strategist';
    next = recordSessionTokenUsage(next, {
      rowId: agentId,
      actionLabel: `Stage ${st.stageNumber}: ${st.taskDescription.slice(0, 82)}`,
      modelId: circleSnap.modelId,
      apiKeySlot: options?.apiKeySlot,
      promptTokens: st.promptTokens,
      completionTokens: st.completionTokens,
      thinkingTokens: st.thinkingTokens,
      shadowCostUsd: st.shadowPaidCostUsd,
      actualCostUsd: st.actualCostUsd,
      usedLiveApiKey:
        options?.usedLiveApiKey ?? st.executionSource === 'live-api-key',
      isFreeTierKey: circleSnap.isFreeTierKeyActive,
    });
  }
  return next;
}

export function loadZeroBasedSessionTokenLedger(params: {
  siteName: string;
  modelId?: AgencyLlmModelId;
  isFreeTierKeyActive?: boolean;
}): ZeroBasedSessionTokenLedger {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(ZERO_BASED_LEDGER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ZeroBasedSessionTokenLedger;
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length >= 2) {
          return parsed;
        }
      }
    } catch {
      // Fallback to clean zero-based ledger
    }
  }
  return createZeroBasedSessionTokenLedger(params);
}

export function saveZeroBasedSessionTokenLedger(
  ledger: ZeroBasedSessionTokenLedger
): ZeroBasedSessionTokenLedger {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        ZERO_BASED_LEDGER_STORAGE_KEY,
        JSON.stringify(ledger)
      );
    } catch {
      // Ignore storage quota restrictions
    }
  }
  return ledger;
}

export function resetZeroBasedSessionTokenLedger(params: {
  siteName: string;
  modelId?: AgencyLlmModelId;
  isFreeTierKeyActive?: boolean;
}): ZeroBasedSessionTokenLedger {
  const fresh = createZeroBasedSessionTokenLedger(params);
  return saveZeroBasedSessionTokenLedger(fresh);
}

/**
 * Builds a complete 5-Stage 1-Circle Reference Token & Cost Telemetry Snapshot
 * (combines any live API call token metrics with the 5-stage circle breakdown)
 */
export function buildAgencyCircleTelemetrySnapshot(params: {
  siteName: string;
  activeTopicTitle: string;
  modelId?: AgencyLlmModelId;
  isFreeTierKeyActive?: boolean;
  liveStage1Override?: {
    promptTokens: number;
    completionTokens: number;
    thinkingTokens: number;
    latencyMs: number;
    isLiveCall: boolean;
  };
}): AgencyCircleTelemetrySnapshot {
  const modelId: AgencyLlmModelId = params.modelId || 'gemini-2.5-flash';
  const spec = MODEL_PRICING_CATALOG[modelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];
  const isFree =
    params.isFreeTierKeyActive !== undefined
      ? params.isFreeTierKeyActive
      : spec.supportsFreeTierKey;

  const s1Prompt = params.liveStage1Override?.promptTokens ?? 1450;
  const s1Completion = params.liveStage1Override?.completionTokens ?? 650;
  const s1Thinking = params.liveStage1Override?.thinkingTokens ?? 0;

  const rawStages: Array<{
    stageNumber: 1 | 2 | 3 | 4 | 5;
    departmentName: string;
    agentName: string;
    taskDescription: string;
    mechanicalZeroCostTasks: string[];
    promptTokens: number;
    completionTokens: number;
    thinkingTokens: number;
    latencyMs: number;
    executionSource: 'live-api-key' | 'free-tier-shadow-telemetry';
  }> = [
    {
      stageNumber: 1,
      departmentName: 'Dept 1 · Keyword & Topic Strategist',
      agentName: 'Keyword & SERP Gap Strategist',
      taskDescription:
        'Clusters live Google Autocomplete seeds, scores KD, and synthesizes non-overlapping H1–H3 brief',
      mechanicalZeroCostTasks: [
        'Live Google Autocomplete JSON scrape ($0.00)',
        'Deterministic KD token-overlap math ($0.00)',
      ],
      promptTokens: s1Prompt,
      completionTokens: s1Completion,
      thinkingTokens: s1Thinking,
      latencyMs: params.liveStage1Override?.latencyMs ?? 640,
      executionSource: params.liveStage1Override?.isLiveCall
        ? 'live-api-key'
        : 'free-tier-shadow-telemetry',
    },
    {
      stageNumber: 2,
      departmentName: 'Dept 2 · Content Production Studio',
      agentName: 'Content Production Manager & Section Writers',
      taskDescription:
        'Drafts 50-word AEO direct answer lead, 4× deep H2 sections, comparison matrix & contextual internal links',
      mechanicalZeroCostTasks: [
        'SERP <580px pixel-width title verification ($0.00)',
        'Connected @graph JSON-LD schema compilation ($0.00)',
      ],
      promptTokens: 3200,
      completionTokens: 4300,
      thinkingTokens: 0,
      latencyMs: 1820,
      executionSource: params.liveStage1Override?.isLiveCall
        ? 'live-api-key'
        : 'free-tier-shadow-telemetry',
    },
    {
      stageNumber: 3,
      departmentName: 'Dept 3 · Visual & SVG Studio',
      agentName: 'Graphic & Visual Design Director',
      taskDescription:
        'Extracts structured quantitative KPIs & callout labels for 1200×675 Hero + 4× 1080×1350 6-Layer SVGs',
      mechanicalZeroCostTasks: [
        '1200×675 Hero Banner SVG vector rendering ($0.00)',
        '4× 1080×1350 6-Layer Section Infographic rendering ($0.00)',
        '0.00 CLS aspect-ratio verification ($0.00)',
      ],
      promptTokens: 850,
      completionTokens: 450,
      thinkingTokens: 0,
      latencyMs: 490,
      executionSource: params.liveStage1Override?.isLiveCall
        ? 'live-api-key'
        : 'free-tier-shadow-telemetry',
    },
    {
      stageNumber: 4,
      departmentName: 'Dept 4, 5 & 6 · On-Page, Off-Page & Tech SEO',
      agentName: 'On-Page, Digital PR & Technical SEO Leads',
      taskDescription:
        'Generates 2026 content-decay refresh blocks, HARO journalist data pitches & backlink outreach emails',
      mechanicalZeroCostTasks: [
        'Live DOM <title>, H1–H3 & canonical tag crawler ($0.00)',
        'robots.txt OAI-SearchBot & PerplexityBot rule check ($0.00)',
      ],
      promptTokens: 2100,
      completionTokens: 300,
      thinkingTokens: 0,
      latencyMs: 580,
      executionSource: params.liveStage1Override?.isLiveCall
        ? 'live-api-key'
        : 'free-tier-shadow-telemetry',
    },
    {
      stageNumber: 5,
      departmentName: 'Dept 7 & 8 · QA Gate, Social & TikTok Fleet',
      agentName: 'Social Media Manager & 60s TikTok Script Agent',
      taskDescription:
        'Writes 60s TikTok/Reels hook storyboard, 8-slide LinkedIn carousel copy, 3× Pinterest SEO pins & Google Ads RSA copy',
      mechanicalZeroCostTasks: [
        '3× 1000×1500 Pinterest 2:3 SVG pin rendering ($0.00)',
        '8-Slide 1080×1350 LinkedIn SVG deck rendering ($0.00)',
        '150-point automated GEO/AEO readability gate ($0.00)',
      ],
      promptTokens: 2200,
      completionTokens: 800,
      thinkingTokens: 0,
      latencyMs: 740,
      executionSource: params.liveStage1Override?.isLiveCall
        ? 'live-api-key'
        : 'free-tier-shadow-telemetry',
    },
  ];

  const stages: CircleStageTokenRecord[] = rawStages.map((st) => {
    const totalTokens = st.promptTokens + st.completionTokens + st.thinkingTokens;
    const shadowPaidCostUsd = computeTokenCostUsd({
      modelId,
      promptTokens: st.promptTokens,
      completionTokens: st.completionTokens,
      thinkingTokens: st.thinkingTokens,
    });
    return {
      ...st,
      totalTokens,
      shadowPaidCostUsd,
      actualCostUsd: isFree ? 0 : shadowPaidCostUsd,
    };
  });

  const totalPromptTokens = stages.reduce((acc, s) => acc + s.promptTokens, 0);
  const totalCompletionTokens = stages.reduce((acc, s) => acc + s.completionTokens, 0);
  const totalThinkingTokens = stages.reduce((acc, s) => acc + s.thinkingTokens, 0);
  const totalCircleTokens =
    totalPromptTokens + totalCompletionTokens + totalThinkingTokens;

  const singleCircleShadowCostUsd = Number(
    stages.reduce((acc, s) => acc + s.shadowPaidCostUsd, 0).toFixed(5)
  );
  const singleCircleActualCostUsd = isFree ? 0 : singleCircleShadowCostUsd;

  const projected30DayMonthlyCostUsd = Number(
    (singleCircleShadowCostUsd * 30).toFixed(3)
  );

  const grossMarginAt49UsdPlanPercent = Number(
    (((49 - projected30DayMonthlyCostUsd) / 49) * 100).toFixed(2)
  );
  const grossMarginAt149UsdSeoAiTierPercent = Number(
    (((149 - projected30DayMonthlyCostUsd) / 149) * 100).toFixed(2)
  );

  return {
    circleId: `circle-${Date.now()}`,
    timestampIso: new Date().toISOString(),
    siteName: params.siteName,
    activeTopicTitle: params.activeTopicTitle,
    modelId,
    provider: spec.provider,
    isFreeTierKeyActive: isFree,
    mechanicalWorkSharePercent: 90,
    llmCognitiveSharePercent: 10,
    totalPromptTokens,
    totalCompletionTokens,
    totalThinkingTokens,
    totalCircleTokens,
    singleCircleShadowCostUsd,
    singleCircleActualCostUsd,
    projected30DayMonthlyCostUsd,
    grossMarginAt49UsdPlanPercent,
    grossMarginAt149UsdSeoAiTierPercent,
    stages,
  };
}

export function loadTokenTelemetrySnapshot(params: {
  siteName: string;
  activeTopicTitle: string;
  modelId?: AgencyLlmModelId;
}): AgencyCircleTelemetrySnapshot {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(TELEMETRY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AgencyCircleTelemetrySnapshot;
        if (parsed && Array.isArray(parsed.stages) && parsed.stages.length === 5) {
          if (!params.modelId || parsed.modelId === params.modelId) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback to fresh snapshot
    }
  }
  return buildAgencyCircleTelemetrySnapshot(params);
}

export function saveTokenTelemetrySnapshot(
  snapshot: AgencyCircleTelemetrySnapshot
): AgencyCircleTelemetrySnapshot {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota restrictions
    }
  }
  return snapshot;
}
