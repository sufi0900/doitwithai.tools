'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getAllAgencyEmployeesFlat,
  type AgencySidebarTabId,
} from '@/lib/ai-employee-agency/agent-registry';
import {
  scoreKeywordWithDoItWithAiEngine,
  type ScoredKeywordBrief,
} from '@/lib/ai-employee-agency/handoff-orchestrator';
import {
  routeSelectiveWorkflowInterrupt,
  type SelectiveInterruptRoutingPlan,
  type SharedMemoryBusEvent,
  type UserLearnedSkillRule,
} from '@/lib/ai-employee-agency/agent-memory-store';
import {
  computeTokenCostUsd,
  resolveApiKeySlotId,
  MODEL_PRICING_CATALOG,
  type AgencyLlmModelId,
  type ApiKeySlotId,
} from '@/lib/ai-employee-agency/token-telemetry-store';
import {
  GENERAL_COPILOT_AGENT_ID,
  answerFromWorkspaceKnowledge,
  type WorkspaceKnowledgeSnapshot,
} from '@/lib/ai-employee-agency/workspace-knowledge-snapshot';
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 13 REDESIGN)
 * Component: `features/ai-employee-agency/FounderCommandChatDock.tsx`
 *
 * Right-Side Slide-Over Copilot & 36-Agent Messenger Drawer:
 * - Replaces the cramped bottom bar with a full-height 420px Right-Side
 *   Slide-Over Drawer + 1-click Full-Screen Chat mode + sleek Floating Launcher.
 * - Defaults to General ChatGPT-Style Workspace Assistant (no agent required)
 *   with a 1-click switcher to any of the 36 AI Employees or Voice Call.
 * - Injects live `WorkspaceKnowledgeSnapshot` (published/draft blogs, designs,
 *   SEO/AI health scores, schedule, and zero-based session tokens) on every turn.
 * - Zero robotic debug prefixes in replies; clean token & memory pills below.
 * - Full Dual-Theme Light & Dark Mode support.
 * ============================================================================
 */

function renderFormattedChatText(text: string): React.ReactNode {
  const lines = (text || '').split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={pIdx} className="font-extrabold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
              <code
                key={pIdx}
                className="rounded bg-slate-800/40 px-1 py-0.5 text-[10.5px] font-mono text-sky-400"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export interface FounderChatMessage {
  id: string;
  sender: 'founder' | 'agent';
  agentName: string;
  departmentBadge?: string;
  text: string;
  timestamp: string;
  selectiveInterruptSummary?: string;
  tokenCountBadge?: number;
  apiStatusBadge?: string;
}

interface FounderCommandChatDockProps {
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  activeArticleTitle: string;
  activeKeyword: string;
  isInternalSite: boolean;
  existingSlugs: string[];
  chatTargetAgentId: string;
  onChangeTargetAgentId: (agentId: string) => void;
  isChatDrawerExpanded: boolean;
  onToggleChatDrawer: (expanded: boolean) => void;
  messages: FounderChatMessage[];
  onAppendMessage: (msg: FounderChatMessage) => void;
  onSpawnArticleFromBrief: (brief: ScoredKeywordBrief) => void;
  onSelectDepartmentTab: (tabId: AgencySidebarTabId) => void;
  learnedSkills?: UserLearnedSkillRule[];
  sharedMemoryEvents?: SharedMemoryBusEvent[];
  onRecordSelectiveInterrupt?: (plan: SelectiveInterruptRoutingPlan) => void;
  selectedLlmModel?: AgencyLlmModelId;
  isFreeTierKeyMode?: boolean;
  testApiKeyInput?: string;
  onRecordChatTokenUsage?: (usage: {
    agentId: string;
    agentName: string;
    promptTokens: number;
    completionTokens: number;
    thinkingTokens: number;
    totalTokens: number;
    shadowPaidCostUsd: number;
    actualCostUsd: number;
    apiKeySlot: ApiKeySlotId;
    modelId: AgencyLlmModelId;
    usedLiveApiKey: boolean;
    actionLabel: string;
  }) => void;
  workspaceKnowledge?: WorkspaceKnowledgeSnapshot;
  isLightTheme?: boolean;
}

const QUICK_PROMPTS = [
  {
    label: 'Live Workspace Summary',
    prompt: 'Give me a quick status summary of my site, articles, designs, and token usage.',
    targetAgentId: GENERAL_COPILOT_AGENT_ID,
  },
  {
    label: 'How Many Blogs Published?',
    prompt: 'How many blogs are published or drafted right now, and what are their titles?',
    targetAgentId: GENERAL_COPILOT_AGENT_ID,
  },
  {
    label: 'Launch New Article Campaign',
    prompt:
      'Launch a new article on AI technical SEO audit checklists and prepare Pinterest + 60s TikTok scripts',
    targetAgentId: 'agent-chief-orchestrator',
  },
  {
    label: 'Teach Permanent Rule',
    prompt:
      'Remember: Always use emerald #10B981 callout badges and 5-word top hooks on every 1000×1500 Pinterest 2:3 pin',
    targetAgentId: 'sub-pinterest-2x3-specialist',
  },
];

export default function FounderCommandChatDock({
  siteName,
  siteUrl,
  primaryNiche,
  activeArticleTitle,
  activeKeyword,
  isInternalSite,
  existingSlugs,
  chatTargetAgentId,
  onChangeTargetAgentId,
  isChatDrawerExpanded,
  onToggleChatDrawer,
  messages,
  onAppendMessage,
  onSpawnArticleFromBrief,
  onSelectDepartmentTab,
  learnedSkills = [],
  sharedMemoryEvents = [],
  onRecordSelectiveInterrupt,
  selectedLlmModel = 'gemini-2.5-flash',
  isFreeTierKeyMode = true,
  testApiKeyInput = '',
  onRecordChatTokenUsage,
  workspaceKnowledge,
  isLightTheme = false,
}: FounderCommandChatDockProps) {
  const [chatInput, setChatInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState<boolean>(false);
  const [isFullScreenChat, setIsFullScreenChat] = useState<boolean>(false);
  const [activeModeAgentId, setActiveModeAgentId] = useState<string>(
    GENERAL_COPILOT_AGENT_ID
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const allFlatEmployees = useMemo(() => getAllAgencyEmployeesFlat(), []);

  // Sync external specialist selection if parent explicitly picks a non-default specialist
  useEffect(() => {
    if (chatTargetAgentId && chatTargetAgentId !== 'agent-chief-orchestrator') {
      setActiveModeAgentId(chatTargetAgentId);
    }
  }, [chatTargetAgentId]);

  useEffect(() => {
    if (isChatDrawerExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isChatDrawerExpanded]);

  const isGeneralMode = activeModeAgentId === GENERAL_COPILOT_AGENT_ID;
  const activeSpecialist = useMemo(
    () =>
      allFlatEmployees.find((emp) => emp.id === activeModeAgentId) ||
      allFlatEmployees[0]!,
    [allFlatEmployees, activeModeAgentId]
  );

  const speakAgentReplyIfActive = (text: string) => {
    if (
      isVoiceCallActive &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          text.replace(/[*`#]/g, '').replace(/[^\w\s.,!?:-]/g, '')
        );
        utterance.rate = 1.04;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore browser speech synthesis restrictions
      }
    }
  };

  const dispatchCommandMessage = async (
    rawText: string,
    overrideAgentId?: string
  ) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    const effectiveAgentId = overrideAgentId || activeModeAgentId;
    if (overrideAgentId) {
      setActiveModeAgentId(overrideAgentId);
      if (overrideAgentId !== GENERAL_COPILOT_AGENT_ID) {
        onChangeTargetAgentId(overrideAgentId);
      }
    }

    const effectiveIsGeneral = effectiveAgentId === GENERAL_COPILOT_AGENT_ID;
    const targetEmployee = effectiveIsGeneral
      ? allFlatEmployees[0]!
      : allFlatEmployees.find((emp) => emp.id === effectiveAgentId) ||
        allFlatEmployees[0]!;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    onAppendMessage({
      id: `msg-founder-${Date.now()}`,
      sender: 'founder',
      agentName: 'You',
      text: trimmed,
      timestamp: nowTime,
    });
    setChatInput('');
    onToggleChatDrawer(true);
    setIsSending(true);

    try {
      const res = await fetch('/api/ai-employee-agency/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: effectiveAgentId,
          message: trimmed,
          siteName,
          siteUrl,
          primaryNiche,
          activeArticleTitle,
          activeKeyword,
          isInternalSite,
          existingSlugs,
          learnedSkills,
          sharedEvents: sharedMemoryEvents,
          modelId: selectedLlmModel,
          apiKeyOverride: testApiKeyInput.trim() || undefined,
          isFreeTierKey: isFreeTierKeyMode,
          workspaceKnowledge,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          agentName?: string;
          departmentBadge?: string;
          replyText?: string;
          spawnedKeywordBrief?: ScoredKeywordBrief;
          recommendedTabRedirect?: AgencySidebarTabId;
          selectiveInterruptPlan?: SelectiveInterruptRoutingPlan;
          llmGatewayStatus?: {
            usedLiveApiKey?: boolean;
            apiKeySlot?: ApiKeySlotId;
            telemetryNote?: string;
            apiErrorDetail?: string;
          };
          tokenUsage?: {
            modelId?: AgencyLlmModelId;
            apiKeySlot?: ApiKeySlotId;
            usedLiveApiKey?: boolean;
            promptTokens?: number;
            completionTokens?: number;
            thinkingTokens?: number;
            totalTokens?: number;
            shadowPaidCostUsd?: number;
            actualCostUsd?: number;
          };
          timestamp?: string;
        };

        if (data.ok && data.replyText) {
          if (data.selectiveInterruptPlan && onRecordSelectiveInterrupt) {
            onRecordSelectiveInterrupt(data.selectiveInterruptPlan);
          }
          if (data.spawnedKeywordBrief) {
            onSpawnArticleFromBrief(data.spawnedKeywordBrief);
          }
          if (data.recommendedTabRedirect) {
            onSelectDepartmentTab(data.recommendedTabRedirect);
          }

          let meteredTotalTokens: number | undefined;
          if (data.tokenUsage && onRecordChatTokenUsage) {
            const pTok = Number(data.tokenUsage.promptTokens) || 0;
            const cTok = Number(data.tokenUsage.completionTokens) || 0;
            const tTok = Number(data.tokenUsage.thinkingTokens) || 0;
            meteredTotalTokens =
              Number(data.tokenUsage.totalTokens) || pTok + cTok + tTok;
            const usedModel = data.tokenUsage.modelId || selectedLlmModel;
            const spec =
              MODEL_PRICING_CATALOG[usedModel] ||
              MODEL_PRICING_CATALOG['gemini-2.5-flash'];
            onRecordChatTokenUsage({
              agentId: effectiveAgentId,
              agentName:
                data.agentName ||
                (effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name),
              promptTokens: pTok,
              completionTokens: cTok,
              thinkingTokens: tTok,
              totalTokens: meteredTotalTokens,
              shadowPaidCostUsd: Number(data.tokenUsage.shadowPaidCostUsd) || 0,
              actualCostUsd: Number(data.tokenUsage.actualCostUsd) || 0,
              apiKeySlot:
                data.tokenUsage.apiKeySlot ||
                resolveApiKeySlotId({
                  provider: spec.provider,
                  isFreeTierKey: isFreeTierKeyMode,
                  usedLiveApiKey: Boolean(data.tokenUsage.usedLiveApiKey),
                }),
              modelId: usedModel,
              usedLiveApiKey: Boolean(data.tokenUsage.usedLiveApiKey),
              actionLabel: `Copilot → ${
                data.agentName ||
                (effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name)
              }: "${trimmed.slice(0, 60)}"`,
            });
          }

          onAppendMessage({
            id: `msg-agent-${Date.now()}`,
            sender: 'agent',
            agentName:
              data.agentName ||
              (effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name),
            departmentBadge:
              data.departmentBadge ||
              (effectiveIsGeneral
                ? 'General AI Assistant'
                : targetEmployee.departmentBadge),
            text: data.replyText,
            timestamp: data.timestamp || nowTime,
            selectiveInterruptSummary:
              data.selectiveInterruptPlan?.learnedSkillRule
                ? `Saved rule: ${data.selectiveInterruptPlan.learnedSkillRule.skillRuleText}`
                : undefined,
            tokenCountBadge: meteredTotalTokens,
            apiStatusBadge: data.llmGatewayStatus?.usedLiveApiKey
              ? `Live ${data.llmGatewayStatus.apiKeySlot || 'API'}`
              : data.llmGatewayStatus?.apiErrorDetail || 'Local Workspace Engine',
          });
          speakAgentReplyIfActive(data.replyText);
          setIsSending(false);
          return;
        }
      }
    } catch {
      // Deterministic local fallback if offline
    }

    const localInterrupt = routeSelectiveWorkflowInterrupt({
      agentId: targetEmployee.id,
      rawMessage: trimmed,
    });
    if (onRecordSelectiveInterrupt) {
      onRecordSelectiveInterrupt(localInterrupt);
    }

    const lower = trimmed.toLowerCase();
    const wantsNewArticle =
      lower.includes('launch') ||
      lower.includes('write a new') ||
      lower.includes('new article') ||
      lower.includes('create an article');

    let fallbackReply = '';
    if (localInterrupt.learnedSkillRule) {
      fallbackReply = `Got it — I've saved your permanent rule for **${siteName}**:\n\n> "${localInterrupt.learnedSkillRule.skillRuleText}"\n\n${localInterrupt.wokenAgentNames.join(
        ' and '
      )} will apply it while the other ${
        localInterrupt.uninterruptedAgentCount
      } agents keep running uninterrupted.`;
    } else if (wantsNewArticle) {
      const cleanedTopic = trimmed
        .replace(
          /^(today\s+)?(let's|lets|please|can you)?\s*(write|launch|create|publish)\s*(a\s+new\s+article\s+on|an\s+article\s+about|about|on)?/i,
          ''
        )
        .trim();
      const scored = scoreKeywordWithDoItWithAiEngine({
        rawKeyword: cleanedTopic || primaryNiche,
        siteName,
        primaryNiche,
        existingSlugs,
      });
      onSpawnArticleFromBrief(scored);
      fallbackReply = `I've initialized a full cross-department campaign for **"${scored.recommendedH1Title}"** (KD ${scored.kdScore}/100). Keyword Strategist, Content Manager, Visual Studio, and Social Fleet are now lined up in sequence.`;
    } else if (workspaceKnowledge) {
      fallbackReply =
        answerFromWorkspaceKnowledge(trimmed, workspaceKnowledge) ||
        `I'm connected to your live **${siteName}** workspace (${workspaceKnowledge.totalArticlesCount} articles, ${workspaceKnowledge.totalVisualAssetsCount} visual assets, and ${workspaceKnowledge.sessionTokensUsed.toLocaleString()} session tokens used). Ask about your blogs, designs, SEO health, schedule, or switch to any of the 36 specialists above.`;
    } else {
      fallbackReply = `Done — I've applied your request ("${trimmed}") to **${siteName}**.`;
    }

    const estPrompt = Math.max(48, Math.ceil(trimmed.length / 3.85) + 120);
    const estCompletion = Math.max(36, Math.ceil(fallbackReply.length / 3.85));
    const estTotal = estPrompt + estCompletion;

    onAppendMessage({
      id: `msg-agent-${Date.now()}`,
      sender: 'agent',
      agentName: effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name,
      departmentBadge: effectiveIsGeneral
        ? 'General AI Assistant'
        : targetEmployee.departmentBadge,
      text: fallbackReply,
      timestamp: nowTime,
      selectiveInterruptSummary: localInterrupt.learnedSkillRule
        ? `Saved rule: ${localInterrupt.learnedSkillRule.skillRuleText}`
        : undefined,
      tokenCountBadge: estTotal,
    });

    if (onRecordChatTokenUsage) {
      const estShadow = computeTokenCostUsd({
        modelId: selectedLlmModel,
        promptTokens: estPrompt,
        completionTokens: estCompletion,
        thinkingTokens: 0,
      });
      onRecordChatTokenUsage({
        agentId: effectiveAgentId,
        agentName: effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name,
        promptTokens: estPrompt,
        completionTokens: estCompletion,
        thinkingTokens: 0,
        totalTokens: estTotal,
        shadowPaidCostUsd: estShadow,
        actualCostUsd: 0,
        apiKeySlot: 'KEY_SLOT_MECHANICAL_ZERO',
        modelId: selectedLlmModel,
        usedLiveApiKey: false,
        actionLabel: `Copilot (Local Meter) → ${
          effectiveIsGeneral ? 'Workspace Copilot' : targetEmployee.name
        }: "${trimmed.slice(0, 56)}"`,
      });
    }

    speakAgentReplyIfActive(fallbackReply);
    setIsSending(false);
  };

  const handleToggleVoiceCall = () => {
    if (isVoiceCallActive) {
      setIsVoiceCallActive(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setIsVoiceCallActive(true);
    onToggleChatDrawer(true);

    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (typeof SpeechRec === 'function') {
        try {
          type BrowserSpeechRecognition = {
            lang: string;
            interimResults: boolean;
            onresult: (event: {
              results?: ArrayLike<ArrayLike<{ transcript?: string }>>;
            }) => void;
            start: () => void;
          };
          const SpeechRecCtor = SpeechRec as new () => BrowserSpeechRecognition;
          const recognition = new SpeechRecCtor();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          recognition.onresult = (event) => {
            const transcript = event?.results?.[0]?.[0]?.transcript;
            if (transcript) {
              setChatInput(transcript);
            }
          };
          recognition.start();
        } catch {
          // Fallback to voice-enabled text mode
        }
      }
    }
  };

  // Theme-aware surface classes
  const drawerBg = isLightTheme
    ? 'bg-white border-slate-200 text-slate-900'
    : 'bg-[#080F1E] border-slate-800 text-slate-100';
  const headerBg = isLightTheme
    ? 'bg-slate-50 border-slate-200'
    : 'bg-[#0B1427] border-slate-800';
  const subtleText = isLightTheme ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isLightTheme
    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-400';

  return (
    <>
      {/* =====================================================================
          FLOATING RIGHT-BOTTOM COPILOT LAUNCHER PILL (WHEN DRAWER IS CLOSED)
         ===================================================================== */}
      {!isChatDrawerExpanded && (
        <button
          type="button"
          data-v5-solid="true"
          onClick={() => onToggleChatDrawer(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2.5 text-xs font-extrabold text-white shadow-2xl shadow-blue-600/25 transition-all"
          title="Open Workspace Copilot & 36-Agent Messenger"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </span>
          <AgencyUiIcon name="chat" className="w-4 h-4" />
          <span>Ask Copilot</span>
          {workspaceKnowledge && (
            <span className="hidden sm:inline-block rounded-full bg-slate-950/30 px-2 py-0.5 text-[10px] font-mono">
              {workspaceKnowledge.sessionTokensUsed.toLocaleString()} tok
            </span>
          )}
        </button>
      )}

      {/* =====================================================================
          RIGHT-SIDE SLIDE-OVER COPILOT & 36-AGENT DRAWER (420px OR FULL-SCREEN)
         ===================================================================== */}
      {isChatDrawerExpanded && (
        <aside
          className={`fixed z-50 flex flex-col border-l shadow-2xl transition-all duration-200 ${drawerBg} ${
            isFullScreenChat
              ? 'inset-0 w-screen h-screen border-l-0'
              : 'top-0 right-0 h-dvh w-full sm:w-[420px] lg:w-[440px]'
          }`}
          aria-label="Workspace Copilot and Agent Messenger Drawer"
        >
          {/* Drawer Header */}
          <div className={`border-b px-4 py-3 space-y-2.5 shrink-0 ${headerBg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 shrink-0">
                  <AgencyUiIcon name="sparkle" className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">
                    {isGeneralMode ? 'Workspace Copilot' : activeSpecialist.name}
                  </div>
                  <div className={`text-[10px] truncate ${subtleText}`}>
                    {isGeneralMode
                      ? `Live context: ${siteName} · ${
                          workspaceKnowledge?.totalArticlesCount ?? 0
                        } articles`
                      : `${activeSpecialist.departmentBadge} · 3-Layer Memory`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleVoiceCall}
                  className={`rounded-lg border p-1.5 transition ${
                    isVoiceCallActive
                      ? 'border-rose-400 bg-rose-500/20 text-rose-400 animate-pulse'
                      : isLightTheme
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                  title={isVoiceCallActive ? 'End Voice Mode' : 'Start Voice Mode'}
                >
                  <AgencyUiIcon
                    name={isVoiceCallActive ? 'mic-off' : 'mic'}
                    className="w-3.5 h-3.5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullScreenChat((prev) => !prev)}
                  className={`rounded-lg border p-1.5 transition ${
                    isLightTheme
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                  title={
                    isFullScreenChat
                      ? 'Exit Full-Screen Chat'
                      : 'Expand Full-Screen Chat'
                  }
                >
                  <AgencyUiIcon
                    name={
                      isFullScreenChat
                        ? 'exit-fullscreen'
                        : 'expand-fullscreen'
                    }
                    className="w-3.5 h-3.5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFullScreenChat(false);
                    onToggleChatDrawer(false);
                  }}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                    isLightTheme
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                  title="Close Copilot Drawer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Mode & Specialist Switcher (Default: General Workspace Copilot + All 36 Agents) */}
            <div className="flex items-center gap-2">
              <select
                value={activeModeAgentId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setActiveModeAgentId(nextId);
                  if (nextId !== GENERAL_COPILOT_AGENT_ID) {
                    onChangeTargetAgentId(nextId);
                  }
                }}
                className={`flex-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold focus:border-sky-400 focus:outline-none ${inputBg}`}
                aria-label="Switch between General Workspace Copilot and 36 AI Specialists"
              >
                <option value={GENERAL_COPILOT_AGENT_ID}>
                  ★ General Workspace Copilot (Default ChatGPT Mode)
                </option>
                {allFlatEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.tier === 'sub-agent' ? '↳ ' : '• '}
                    {emp.name} ({emp.departmentBadge})
                  </option>
                ))}
              </select>
              <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                {learnedSkills.length} Skills
              </span>
            </div>
          </div>

          {/* Live Context Ribbon */}
          {workspaceKnowledge && (
            <div
              className={`border-b px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono shrink-0 ${
                isLightTheme
                  ? 'bg-sky-50/70 border-slate-200 text-slate-600'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <span>
                Blogs: <strong>{workspaceKnowledge.publishedArticlesCount}</strong> pub ·{' '}
                <strong>{workspaceKnowledge.draftArticlesCount}</strong> draft
              </span>
              <span>
                SEO: <strong>{workspaceKnowledge.seoHealthScore}</strong> · AI:{' '}
                <strong>{workspaceKnowledge.aiDiscoverabilityScore}</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                {workspaceKnowledge.sessionTokensUsed.toLocaleString()} tok ($
                {workspaceKnowledge.sessionShadowCostUsd.toFixed(4)})
              </span>
            </div>
          )}

          {/* Scrollable Conversation Thread */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-xs">
            {/* Quick Starter Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {QUICK_PROMPTS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() =>
                    void dispatchCommandMessage(chip.prompt, chip.targetAgentId)
                  }
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition ${
                    isLightTheme
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-400 hover:text-sky-700'
                      : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-sky-500/50 hover:text-sky-200'
                  }`}
                >
                  <AgencyUiIcon name="sparkle" className="w-3 h-3 text-sky-400" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'founder' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  data-v5-solid={m.sender === 'founder' ? 'true' : undefined}
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 space-y-1.5 ${
                    m.sender === 'founder'
                      ? 'bg-[#1D4ED8] text-white rounded-br-sm'
                      : isLightTheme
                      ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-3 text-[10px] ${
                      m.sender === 'founder' ? 'text-sky-100' : subtleText
                    }`}
                  >
                    <span className="font-bold">
                      {m.agentName}
                      {m.departmentBadge ? ` · ${m.departmentBadge}` : ''}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className="leading-relaxed text-[12px]">
                    {renderFormattedChatText(m.text)}
                  </div>
                  {(m.selectiveInterruptSummary || m.tokenCountBadge || m.apiStatusBadge) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {m.selectiveInterruptSummary && (
                        <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-mono text-emerald-400">
                          {m.selectiveInterruptSummary}
                        </span>
                      )}
                      {m.tokenCountBadge !== undefined && m.tokenCountBadge > 0 && (
                        <span className="rounded-md bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[9.5px] font-mono text-sky-400">
                          +{m.tokenCountBadge.toLocaleString()} tok
                        </span>
                      )}
                      {m.apiStatusBadge && (
                        <span className="rounded-md bg-slate-800/40 border border-slate-700/50 px-1.5 py-0.5 text-[9.5px] font-mono text-slate-400">
                          {m.apiStatusBadge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void dispatchCommandMessage(chatInput);
            }}
            className={`border-t p-3 space-y-2 shrink-0 ${headerBg}`}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  isGeneralMode
                    ? `Ask anything about ${siteName}, blogs, SEO, or tokens...`
                    : `Message ${activeSpecialist.name} or teach a rule ("Remember: ...")...`
                }
                className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:border-sky-400 focus:outline-none ${inputBg}`}
              />
              <button
                type="submit"
                data-v5-solid="true"
                disabled={isSending || !chatInput.trim()}
                className="rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-3.5 py-2 text-xs font-extrabold text-white shadow transition inline-flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                <AgencyUiIcon name="send" className="w-3.5 h-3.5" />
                <span>{isSending ? '...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}
