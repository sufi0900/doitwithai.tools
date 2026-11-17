'use client';

import React, { useMemo, useState } from 'react';
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
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 8 REDESIGN)
 * Component: `features/ai-employee-agency/FounderCommandChatDock.tsx`
 *
 * Persistent Unified Founder Command Chat, 3-Layer Skill Teaching & Voice Call Dock:
 * - Uses crisp geometric SVG icons (`AgencyUiIcon`) instead of cartoon emojis.
 * - Includes right-side padding (`pr-16 sm:pr-20`) so the global floating
 *   chat button at the bottom-right of the site never overlaps `Send Command`.
 * - V3 Phase 8 Upgrade: Supports teaching permanent custom skills (`Remember: ...`)
 *   to any of the 36 AI Employees and triggers Selective Workflow Interruption
 *   so only the targeted specialist + department manager wake up while all other
 *   departments continue working uninterrupted.
 * ============================================================================
 */

export interface FounderChatMessage {
  id: string;
  sender: 'founder' | 'agent';
  agentName: string;
  departmentBadge?: string;
  text: string;
  timestamp: string;
  selectiveInterruptSummary?: string;
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
}

const QUICK_SCENARIO_CHIPS = [
  {
    label: 'Launch New Article + Social Campaign',
    prompt:
      'Today let’s write and launch a new article on AI technical SEO audit checklists and prepare Pinterest + 60s TikTok scripts',
    targetAgentId: 'agent-chief-orchestrator',
  },
  {
    label: 'Teach Custom Skill to Pinterest Agent',
    prompt:
      'Remember: Always use emerald #10B981 callout badges and 5-word top hooks on every 1000×1500 Pinterest 2:3 pin',
    targetAgentId: 'sub-pinterest-2x3-specialist',
  },
  {
    label: 'Selective Custom Image Override',
    prompt:
      'Use my uploaded custom product screenshot for the active Pinterest 2:3 pin and LinkedIn carousel without interrupting other departments',
    targetAgentId: 'sub-pinterest-2x3-specialist',
  },
  {
    label: 'Write 60s TikTok & Reels Script',
    prompt:
      'Write a 60-second TikTok and Reels script with a 3-second pattern-interrupt hook for our active article',
    targetAgentId: 'sub-tiktok-reels-script-agent',
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
}: FounderCommandChatDockProps) {
  const [chatInput, setChatInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState<boolean>(false);

  const allFlatEmployees = useMemo(() => getAllAgencyEmployeesFlat(), []);

  const speakAgentReplyIfActive = (text: string) => {
    if (
      isVoiceCallActive &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          text.replace(/[^\w\s.,!?:-]/g, '')
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

    const effectiveAgentId = overrideAgentId || chatTargetAgentId;
    if (overrideAgentId && overrideAgentId !== chatTargetAgentId) {
      onChangeTargetAgentId(overrideAgentId);
    }

    const targetEmployee =
      allFlatEmployees.find((emp) => emp.id === effectiveAgentId) ||
      allFlatEmployees[0]!;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    onAppendMessage({
      id: `msg-founder-${Date.now()}`,
      sender: 'founder',
      agentName: 'Founder',
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
          onAppendMessage({
            id: `msg-agent-${Date.now()}`,
            sender: 'agent',
            agentName: data.agentName || targetEmployee.name,
            departmentBadge: data.departmentBadge || targetEmployee.departmentBadge,
            text: data.replyText,
            timestamp: data.timestamp || nowTime,
            selectiveInterruptSummary:
              data.selectiveInterruptPlan?.memoryBusEvent.summary,
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
      agentId: effectiveAgentId,
      rawMessage: trimmed,
    });
    if (onRecordSelectiveInterrupt) {
      onRecordSelectiveInterrupt(localInterrupt);
    }

    const lower = trimmed.toLowerCase();
    const wantsNewArticle =
      lower.includes('article') ||
      lower.includes('write') ||
      lower.includes('launch') ||
      lower.includes('blog');

    let fallbackReply = '';
    if (localInterrupt.learnedSkillRule) {
      fallbackReply = `[${targetEmployee.name} · Permanent Skill Saved]: Added rule "${localInterrupt.learnedSkillRule.skillRuleText}" to Layer 2 memory. Woke only ${localInterrupt.wokenAgentNames.join(
        ' + '
      )} while ${localInterrupt.uninterruptedAgentCount} other agents continued uninterrupted.`;
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
      fallbackReply = `[${targetEmployee.name}]: Initialized full cross-department campaign for "${scored.recommendedH1Title}" (KD ${scored.kdScore}/100). Keyword Strategist → Content Manager → Graphic Designer → QA → Social & TikTok Fleet are now executing in sequence.`;
    } else {
      fallbackReply = `[${targetEmployee.name} · ${targetEmployee.departmentBadge}]: Applied your directive ("${trimmed}") to ${siteName}. Selective Interrupt Router woke ${localInterrupt.wokenAgentNames.join(
        ' + '
      )} while ${localInterrupt.uninterruptedAgentCount} other agents continued uninterrupted.`;
    }

    onAppendMessage({
      id: `msg-agent-${Date.now()}`,
      sender: 'agent',
      agentName: targetEmployee.name,
      departmentBadge: targetEmployee.departmentBadge,
      text: fallbackReply,
      timestamp: nowTime,
      selectiveInterruptSummary: localInterrupt.memoryBusEvent.summary,
    });
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const recognition: any = new (SpeechRec as any)();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
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

  return (
    <footer className="sticky bottom-0 z-30 border-t border-slate-800/90 bg-[#080E1C]/95 backdrop-blur">
      {/* Right-side clearance (`pr-16 sm:pr-20`) ensures floating site chat bubble never overlaps `Send Command` */}
      <div className="max-w-[1600px] mx-auto pl-4 sm:pl-6 pr-16 sm:pr-20 py-2.5 space-y-2.5">
        {isChatDrawerExpanded && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 space-y-3 max-h-[280px] overflow-y-auto text-xs shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <AgencyUiIcon name="chat" className="w-4 h-4 text-sky-400" />
                <span className="font-extrabold text-sky-300">
                  Live Agency Intercom, Skill Trainer &amp; Selective Specialist Interrupt Dock
                </span>
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  {learnedSkills.length} Learned Skills Active
                </span>
                {isVoiceCallActive && (
                  <span className="rounded-full bg-rose-500/20 border border-rose-400/40 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-300 animate-pulse">
                    Live Voice Call Active (TTS + Mic)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggleChatDrawer(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                Minimize Chat
              </button>
            </div>

            {/* 1-Click Quick Scenario & Skill-Teaching Trigger Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                Quick Scenarios &amp; Skill Training:
              </span>
              {QUICK_SCENARIO_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() =>
                    void dispatchCommandMessage(chip.prompt, chip.targetAgentId)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-sky-500/50 hover:text-sky-200 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition"
                >
                  <AgencyUiIcon name="sparkle" className="w-3 h-3 text-sky-400" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Transcript Messages */}
            <div className="space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 space-y-1.5 ${
                    m.sender === 'founder'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-white ml-8'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-300">
                      {m.agentName}
                      {m.departmentBadge ? ` · ${m.departmentBadge}` : ''}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  {m.selectiveInterruptSummary && (
                    <div className="rounded-lg border border-sky-500/30 bg-slate-950/90 px-2.5 py-1 text-[10.5px] font-mono text-sky-300">
                      Memory Bus: {m.selectiveInterruptSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unified Command Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void dispatchCommandMessage(chatInput);
          }}
          className="flex flex-wrap items-center gap-2"
        >
          {/* Agent Selector Dropdown (All 36 Managers + Sub-Agents) */}
          <select
            value={chatTargetAgentId}
            onChange={(e) => onChangeTargetAgentId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-extrabold text-sky-300 focus:border-sky-400 focus:outline-none max-w-[270px]"
            aria-label="Select AI Employee to talk to"
          >
            {allFlatEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.tier === 'sub-agent' ? '↳ ' : '• '}
                {emp.name} ({emp.departmentBadge})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => onToggleChatDrawer(true)}
            placeholder='Command an agent or teach a permanent skill (e.g. "Remember: Always include a 50-word AEO answer lead")...'
            className="flex-1 min-w-[220px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleToggleVoiceCall}
            className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition inline-flex items-center gap-1.5 ${
              isVoiceCallActive
                ? 'border-rose-400 bg-rose-500/20 text-rose-200 animate-pulse'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-400'
            }`}
          >
            <AgencyUiIcon
              name={isVoiceCallActive ? 'mic-off' : 'mic'}
              className="w-3.5 h-3.5"
            />
            <span>{isVoiceCallActive ? 'End Voice' : 'Voice Call'}</span>
          </button>

          <button
            type="submit"
            disabled={isSending}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg transition inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <AgencyUiIcon name="send" className="w-3.5 h-3.5" />
            <span>{isSending ? 'Routing...' : 'Send Command'}</span>
          </button>
        </form>
      </div>
    </footer>
  );
}
