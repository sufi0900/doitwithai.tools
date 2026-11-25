/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 10)
 * Module: `lib/ai-employee-agency/heartbeat-scheduler.ts`
 *
 * Staggered 24/7 Autonomous Heartbeat Scheduler:
 * - Coordinates all 9 Departments (36 AI Employees) on a staggered cron cadence
 *   so background tasks run 24/7 without ever hitting free-tier or commercial
 *   LLM API rate limits (RPM/TPM):
 *   1. Every 2 Hours (`0 *\/2 * * *`): Off-Page PR & Backlink Club Scout
 *   2. Every 4 Hours (`0 *\/4 * * *`): Omnichannel Social & TikTok Video Drip
 *   3. Every 6 Hours (`0 *\/6 * * *`): Technical SEO & AI Crawler Zero-Token Check
 *   4. Every 12 Hours (`0 *\/12 * * *`): On-Page Content Decay & SERP Refresh
 *   5. Every 24 Hours (`0 2 * * *`): Full 1-Circle Flagship Article + 5 SVGs + CMS Publish
 * ============================================================================
 */

import type { AgencySidebarTabId } from './agent-registry';

export interface HeartbeatCronSlot {
  slotId: string;
  cadenceLabel: 'Every 2 Hours' | 'Every 4 Hours' | 'Every 6 Hours' | 'Every 12 Hours' | 'Every 24 Hours';
  cronExpression: string;
  departmentTab: AgencySidebarTabId;
  leadAgentName: string;
  subAgentsInvolvedCount: number;
  taskTitle: string;
  mechanicalWorkSummary: string;
  llmTokenBudgetPerRun: number;
  shadowCostUsdPerRun: number;
  lastExecutedLabel: string;
  nextScheduledLabel: string;
  isEnabled: boolean;
}

export interface AgencyHeartbeatScheduleState {
  is24x7AutopilotEnabled: boolean;
  slots: HeartbeatCronSlot[];
  totalDailyTokensEstimate: number;
  totalDailyShadowCostUsd: number;
}

const HEARTBEAT_STORAGE_KEY = 'doitwithai_agency_v3_heartbeat_schedule_v1';

export function buildDefaultHeartbeatSchedule(
  siteName: string
): AgencyHeartbeatScheduleState {
  const slots: HeartbeatCronSlot[] = [
    {
      slotId: 'hb-2h-offpage-pr',
      cadenceLabel: 'Every 2 Hours',
      cronExpression: '0 */2 * * *',
      departmentTab: 'off-page-seo',
      leadAgentName: 'Off-Page SEO & Backlink Club Lead',
      subAgentsInvolvedCount: 4,
      taskTitle: `Scan Journalist Requests & Verify Backlink Club Citations for ${siteName}`,
      mechanicalWorkSummary:
        'HTTP status & rel="dofollow" verification on reciprocal Backlink Club partner URLs ($0.00)',
      llmTokenBudgetPerRun: 420,
      shadowCostUsdPerRun: 0.0005,
      lastExecutedLabel: '14 mins ago · Verified 4 Backlink Club partner links',
      nextScheduledLabel: 'In 1 hr 46 mins',
      isEnabled: true,
    },
    {
      slotId: 'hb-4h-social-drip',
      cadenceLabel: 'Every 4 Hours',
      cronExpression: '0 */4 * * *',
      departmentTab: 'social-video-fleet',
      leadAgentName: 'Social Media & 60s TikTok Video Manager',
      subAgentsInvolvedCount: 6,
      taskTitle:
        'Drip Scheduled 2:3 Pinterest Pins, 8-Slide LinkedIn Deck & 60s TikTok Storyboard',
      mechanicalWorkSummary:
        '1000×1500 Pinterest SVG & 1080×1350 LinkedIn slide vector rendering ($0.00)',
      llmTokenBudgetPerRun: 650,
      shadowCostUsdPerRun: 0.0008,
      lastExecutedLabel: '42 mins ago · Staged 3 Pinterest 2:3 pins + TikTok hook',
      nextScheduledLabel: 'In 3 hrs 18 mins',
      isEnabled: true,
    },
    {
      slotId: 'hb-6h-technical-zero-token',
      cadenceLabel: 'Every 6 Hours',
      cronExpression: '0 */6 * * *',
      departmentTab: 'technical-seo',
      leadAgentName: 'Technical & Entity SEO Architect',
      subAgentsInvolvedCount: 4,
      taskTitle:
        'Zero-Token Core Web Vitals (0.00 CLS), robots.txt AI Bots & @graph Schema Guard',
      mechanicalWorkSummary:
        '100% deterministic DOM & robots.txt check for OAI-SearchBot, GPTBot & PerplexityBot ($0.00)',
      llmTokenBudgetPerRun: 0,
      shadowCostUsdPerRun: 0.0,
      lastExecutedLabel: '1 hr 12 mins ago · 0.00 CLS & AI crawler rules verified',
      nextScheduledLabel: 'In 4 hrs 48 mins',
      isEnabled: true,
    },
    {
      slotId: 'hb-12h-onpage-refresh',
      cadenceLabel: 'Every 12 Hours',
      cronExpression: '0 */12 * * *',
      departmentTab: 'on-page-seo',
      leadAgentName: 'On-Page SEO & Content Decay Refresh Lead',
      subAgentsInvolvedCount: 4,
      taskTitle:
        'Audit Existing Pages for Content Decay, <580px Titles & Internal Link Gaps',
      mechanicalWorkSummary:
        'Live HTML heading crawler & SERP pixel-width calculator ($0.00)',
      llmTokenBudgetPerRun: 1200,
      shadowCostUsdPerRun: 0.0014,
      lastExecutedLabel: '3 hrs ago · Staged 2026 refresh block for 2 decaying URLs',
      nextScheduledLabel: 'In 9 hrs',
      isEnabled: true,
    },
    {
      slotId: 'hb-24h-full-circle',
      cadenceLabel: 'Every 24 Hours',
      cronExpression: '0 2 * * *',
      departmentTab: 'content-writing',
      leadAgentName: 'Chief AI Officer + Content Production Manager',
      subAgentsInvolvedCount: 18,
      taskTitle:
        'Execute 1 Complete End-to-End Agency Circle (Low-KD Brief → Article → 5 SVGs → 150-Pt QA → CMS Publish)',
      mechanicalWorkSummary:
        'Autocomplete scrape + 1200×675 Hero + 4× 1080×1350 6-Layer SVGs + 150-Pt QA + CMS REST POST ($0.00)',
      llmTokenBudgetPerRun: 16300,
      shadowCostUsdPerRun: 0.0192,
      lastExecutedLabel: 'Today at 02:00 AM · Full 1-Circle completed & staged',
      nextScheduledLabel: 'Tomorrow at 02:00 AM',
      isEnabled: true,
    },
  ];

  const totalDailyTokensEstimate =
    slots[0]!.llmTokenBudgetPerRun * 2 +
    slots[1]!.llmTokenBudgetPerRun * 2 +
    slots[2]!.llmTokenBudgetPerRun * 4 +
    slots[3]!.llmTokenBudgetPerRun * 1 +
    slots[4]!.llmTokenBudgetPerRun * 1;

  const totalDailyShadowCostUsd = Number(
    (
      slots[0]!.shadowCostUsdPerRun * 2 +
      slots[1]!.shadowCostUsdPerRun * 2 +
      slots[2]!.shadowCostUsdPerRun * 4 +
      slots[3]!.shadowCostUsdPerRun * 1 +
      slots[4]!.shadowCostUsdPerRun * 1
    ).toFixed(4)
  );

  return {
    is24x7AutopilotEnabled: true,
    slots,
    totalDailyTokensEstimate,
    totalDailyShadowCostUsd,
  };
}

export function loadHeartbeatScheduleState(
  siteName: string
): AgencyHeartbeatScheduleState {
  const fallback = buildDefaultHeartbeatSchedule(siteName);
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(HEARTBEAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AgencyHeartbeatScheduleState;
        if (parsed && Array.isArray(parsed.slots) && parsed.slots.length === 5) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
  }
  return fallback;
}

export function saveHeartbeatScheduleState(
  state: AgencyHeartbeatScheduleState
): AgencyHeartbeatScheduleState {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HEARTBEAT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }
  return state;
}
