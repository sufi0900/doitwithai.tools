/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 8)
 * Module: `lib/ai-employee-agency/agent-memory-store.ts`
 *
 * 3-Layer Agent Context Stack, User-Teachable Custom Skills (`userLearnedSkills[]`),
 * Shared Agency Memory Bus & Selective Workflow Interruption Router:
 *
 * 1. Layer 1 — Core Domain SOP System Prompt (`buildAgentCoreSystemPrompt`):
 *    Every one of the 36 AI Employees (Chief AI Officer + 8 Department Managers
 *    + 27 Sub-Agents) has a specialized, domain-engineered system prompt with
 *    strict output rules, equipped skills, and verification gates.
 * 2. Layer 2 — User-Taught Custom Skills & Directives (`userLearnedSkills[]`):
 *    When the Founder instructs any agent in chat (e.g., "Always use emerald
 *    #10B981 for our Pinterest pins" or "Never use generic AI intros") or clicks
 *    "Teach Skill to Agent", the rule is permanently learned by that agent and
 *    injected into its prompt stack on every future run.
 * 3. Layer 3 — Shared Agency Memory Bus (`SharedAgencyMemoryBus`) & Selective
 *    Workflow Interruption (`routeSelectiveWorkflowInterrupt`):
 *    When the Founder uploads a custom visual asset or gives a targeted command
 *    to 1 specialist (e.g., Pinterest 2:3 Pin Specialist), ONLY the required
 *    specialist + its department lead are interrupted/woken up, while all other
 *    departments continue their active work uninterrupted and receive the update
 *    passively through the shared memory bus.
 * ============================================================================
 */

import {
  getAllAgencyEmployeesFlat,
  type AgencySidebarTabId,
} from './agent-registry';

export interface UserLearnedSkillRule {
  id: string;
  agentId: string;
  agentName: string;
  departmentTab: AgencySidebarTabId;
  skillRuleText: string;
  taughtByFounderAtIso: string;
  sourceCommand: string;
}

export interface SharedMemoryBusEvent {
  id: string;
  timestampIso: string;
  sourceAgentId: string;
  sourceAgentName: string;
  departmentTab: AgencySidebarTabId;
  eventType:
    | 'user-taught-skill'
    | 'custom-asset-override'
    | 'selective-specialist-interrupt'
    | 'cross-department-sync';
  summary: string;
  wokenAgentIds: string[];
  uninterruptedDepartmentsCount: number;
  customAssetDataUriOrUrl?: string;
}

export interface SelectiveInterruptRoutingPlan {
  interruptId: string;
  triggerType:
    | 'custom-image-upload'
    | 'teach-agent-skill'
    | 'targeted-specialist-override'
    | 'full-campaign-launch';
  primaryAgentId: string;
  primaryAgentName: string;
  departmentTab: AgencySidebarTabId;
  wokenAgentIds: string[];
  wokenAgentNames: string[];
  uninterruptedAgentCount: number;
  memoryBusEvent: SharedMemoryBusEvent;
  learnedSkillRule?: UserLearnedSkillRule;
}

export interface AgencyMemoryStoreState {
  learnedSkills: UserLearnedSkillRule[];
  sharedMemoryEvents: SharedMemoryBusEvent[];
  customUploadedAssets: Array<{
    id: string;
    title: string;
    targetDepartmentTab: AgencySidebarTabId;
    assignedAgentId: string;
    dataUriOrUrl: string;
    uploadedAtIso: string;
  }>;
}

const AGENCY_MEMORY_STORAGE_KEY = 'doitwithai_agency_v3_memory_bus_v1';

const DEFAULT_LEARNED_SKILLS: UserLearnedSkillRule[] = [
  {
    id: 'skill-seed-1',
    agentId: 'sub-geo-section-writer',
    agentName: 'Long-Form GEO/AEO Section Writer',
    departmentTab: 'content-writing',
    skillRuleText:
      'Open every article with a 50-word direct AEO answer block and include at least 1 quantitative comparison table per H2 section.',
    taughtByFounderAtIso: '2026-11-17T18:00:00.000Z',
    sourceCommand: 'Default Founder Editorial SOP',
  },
  {
    id: 'skill-seed-2',
    agentId: 'sub-pinterest-2x3-specialist',
    agentName: 'Pinterest 2:3 Visual Pin & SEO Specialist',
    departmentTab: 'social-video-fleet',
    skillRuleText:
      'Use high-contrast 1000×1500 (2:3) vertical layouts with bold 5-word top hooks and natural keyword-rich pin descriptions.',
    taughtByFounderAtIso: '2026-11-17T18:00:00.000Z',
    sourceCommand: 'Default Founder Visual Social SOP',
  },
  {
    id: 'skill-seed-3',
    agentId: 'sub-tiktok-reels-script-agent',
    agentName: 'TikTok, Reels & Shorts Video Script Agent',
    departmentTab: 'social-video-fleet',
    skillRuleText:
      'Start every 60-second video script with a 0:00–0:03 pattern-interrupt visual hook showing a real data card or audit metric on screen.',
    taughtByFounderAtIso: '2026-11-17T18:00:00.000Z',
    sourceCommand: 'Default Founder Short-Form Video SOP',
  },
];

const DEFAULT_MEMORY_EVENTS: SharedMemoryBusEvent[] = [
  {
    id: 'mem-evt-initial-1',
    timestampIso: '2026-11-17T18:05:00.000Z',
    sourceAgentId: 'agent-chief-orchestrator',
    sourceAgentName: 'Chief AI Officer & Founder Assistant',
    departmentTab: 'executive-office',
    eventType: 'cross-department-sync',
    summary:
      'Initialized Shared Agency Memory Bus across all 9 Departments (36 AI Employees). Selective Interrupt Router active.',
    wokenAgentIds: ['agent-chief-orchestrator'],
    uninterruptedDepartmentsCount: 8,
  },
];

/**
 * Builds the 3-Layer Prompt Context Stack for any of the 36 AI Employees
 */
export function buildAgentThreeLayerPromptStack(params: {
  agentId: string;
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  activeArticleTitle: string;
  activeKeyword: string;
  learnedSkills?: UserLearnedSkillRule[];
  sharedEvents?: SharedMemoryBusEvent[];
}): {
  systemPrompt: string;
  activeAgentLearnedSkills: UserLearnedSkillRule[];
  recentSharedContextSummary: string;
} {
  const allEmployees = getAllAgencyEmployeesFlat();
  const emp =
    allEmployees.find((e) => e.id === params.agentId) || allEmployees[0]!;

  const skillsForAgent = (params.learnedSkills || DEFAULT_LEARNED_SKILLS).filter(
    (s) => s.agentId === emp.id || s.departmentTab === emp.departmentTab
  );

  const recentEvents = (params.sharedEvents || DEFAULT_MEMORY_EVENTS).slice(0, 4);
  const recentSharedContextSummary = recentEvents
    .map((ev) => `• [${ev.sourceAgentName}]: ${ev.summary}`)
    .join('\n');

  const learnedRulesBlock =
    skillsForAgent.length > 0
      ? skillsForAgent
          .map((s, idx) => `${idx + 1}. ${s.skillRuleText}`)
          .join('\n')
      : '1. Follow DoItWithAI.tools 150-point E-E-A-T & zero-cliche editorial standards.';

  const systemPrompt = [
    `LAYER 1 — CORE SPECIALIST IDENTITY & SOP:`,
    `You are "${emp.name}" (${emp.roleTitle}) in the "${emp.departmentBadge}" department of the DoItWithAI.tools 24/7 Autonomous AI Digital Agency.`,
    `Equipped Skills: ${emp.equippedSkills.join(', ')}.`,
    `Equipped Backend Tools: ${emp.equippedTools.join(', ')}.`,
    `Target Website: ${params.siteName} (${params.siteUrl}) · Primary Niche: ${params.primaryNiche}.`,
    `Active Campaign Article: "${params.activeArticleTitle}" (Primary Keyword: "${params.activeKeyword}").`,
    ``,
    `LAYER 2 — USER-TAUGHT CUSTOM SKILLS & PERMANENT RULES (learnedSkills[]):`,
    learnedRulesBlock,
    ``,
    `LAYER 3 — SHARED AGENCY MEMORY BUS (Latest Cross-Department State):`,
    recentSharedContextSummary,
    ``,
    `EXECUTION DIRECTIVE: Respond in first-person as ${emp.name}. Be concise, concrete, and execution-focused. Never use generic AI filler.`,
  ].join('\n');

  return {
    systemPrompt,
    activeAgentLearnedSkills: skillsForAgent,
    recentSharedContextSummary,
  };
}

/**
 * Detects whether a Founder chat message is teaching a permanent skill/rule,
 * uploading/overriding a custom visual asset, or issuing a selective specialist
 * command, and computes which exact agents wake up while keeping all other
 * departments uninterrupted.
 */
export function routeSelectiveWorkflowInterrupt(params: {
  agentId: string;
  rawMessage: string;
  customAssetUrl?: string;
}): SelectiveInterruptRoutingPlan {
  const allEmployees = getAllAgencyEmployeesFlat();
  const targetEmp =
    allEmployees.find((e) => e.id === params.agentId) || allEmployees[0]!;
  const lower = params.rawMessage.toLowerCase();
  const nowIso = new Date().toISOString();

  // Check if the Founder is teaching a permanent custom skill/rule
  const isTeachingSkill =
    lower.startsWith('remember:') ||
    lower.startsWith('teach skill:') ||
    lower.startsWith('rule:') ||
    lower.includes('always ') ||
    lower.includes('never use ') ||
    lower.includes('from now on');

  const isCustomAssetOverride =
    Boolean(params.customAssetUrl) ||
    lower.includes('custom image') ||
    lower.includes('uploaded image') ||
    lower.includes('use my photo') ||
    lower.includes('replace the pin image');

  const isFullCampaignLaunch =
    lower.includes('launch a new article') ||
    lower.includes('write a new article') ||
    lower.includes('start a campaign');

  let wokenAgentIds: string[] = [targetEmp.id];
  if (targetEmp.tier === 'sub-agent') {
    const parentManager = allEmployees.find(
      (e) => e.departmentTab === targetEmp.departmentTab && e.tier !== 'sub-agent'
    );
    if (parentManager && !wokenAgentIds.includes(parentManager.id)) {
      wokenAgentIds.push(parentManager.id);
    }
  } else if (isFullCampaignLaunch) {
    wokenAgentIds = [
      'agent-chief-orchestrator',
      'agent-keyword-lead',
      'agent-content-manager',
      'agent-design-director',
      'agent-social-manager',
    ];
  } else {
    const firstSub = allEmployees.find(
      (e) => e.departmentTab === targetEmp.departmentTab && e.tier === 'sub-agent'
    );
    if (firstSub) wokenAgentIds.push(firstSub.id);
  }

  const wokenAgentNames = wokenAgentIds.map(
    (id) => allEmployees.find((e) => e.id === id)?.name || id
  );
  const uninterruptedAgentCount = Math.max(
    0,
    allEmployees.length - wokenAgentIds.length
  );

  let learnedSkillRule: UserLearnedSkillRule | undefined;
  if (isTeachingSkill) {
    const cleanedRule = params.rawMessage
      .replace(/^(remember:|teach skill:|rule:)\s*/i, '')
      .trim();
    learnedSkillRule = {
      id: `skill-${Date.now()}`,
      agentId: targetEmp.id,
      agentName: targetEmp.name,
      departmentTab: targetEmp.departmentTab,
      skillRuleText: cleanedRule,
      taughtByFounderAtIso: nowIso,
      sourceCommand: params.rawMessage,
    };
  }

  const triggerType: SelectiveInterruptRoutingPlan['triggerType'] =
    isCustomAssetOverride
      ? 'custom-image-upload'
      : isTeachingSkill
        ? 'teach-agent-skill'
        : isFullCampaignLaunch
          ? 'full-campaign-launch'
          : 'targeted-specialist-override';

  const summary = isCustomAssetOverride
    ? `Selective Asset Override: Woke ${wokenAgentNames.join(
        ' + '
      )} to bind custom image asset while ${uninterruptedAgentCount} other agents continued uninterrupted.`
    : isTeachingSkill
      ? `Learned Permanent Skill for ${targetEmp.name}: "${learnedSkillRule?.skillRuleText}" (broadcast to Shared Memory Bus; ${uninterruptedAgentCount} agents uninterrupted).`
      : `Selective Specialist Task routed to ${wokenAgentNames.join(
          ' + '
        )} (${uninterruptedAgentCount}/36 agents continued background work uninterrupted).`;

  const memoryBusEvent: SharedMemoryBusEvent = {
    id: `mem-evt-${Date.now()}`,
    timestampIso: nowIso,
    sourceAgentId: targetEmp.id,
    sourceAgentName: targetEmp.name,
    departmentTab: targetEmp.departmentTab,
    eventType: isCustomAssetOverride
      ? 'custom-asset-override'
      : isTeachingSkill
        ? 'user-taught-skill'
        : 'selective-specialist-interrupt',
    summary,
    wokenAgentIds,
    uninterruptedDepartmentsCount: isFullCampaignLaunch ? 4 : 8,
    customAssetDataUriOrUrl: params.customAssetUrl,
  };

  return {
    interruptId: `intr-${Date.now()}`,
    triggerType,
    primaryAgentId: targetEmp.id,
    primaryAgentName: targetEmp.name,
    departmentTab: targetEmp.departmentTab,
    wokenAgentIds,
    wokenAgentNames,
    uninterruptedAgentCount,
    memoryBusEvent,
    learnedSkillRule,
  };
}

export function loadAgencyMemoryStore(): AgencyMemoryStoreState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(AGENCY_MEMORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AgencyMemoryStoreState;
        if (parsed && Array.isArray(parsed.learnedSkills)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default state
    }
  }
  return {
    learnedSkills: DEFAULT_LEARNED_SKILLS,
    sharedMemoryEvents: DEFAULT_MEMORY_EVENTS,
    customUploadedAssets: [],
  };
}

export function saveAgencyMemoryStore(
  state: AgencyMemoryStoreState
): AgencyMemoryStoreState {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(AGENCY_MEMORY_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }
  return state;
}
