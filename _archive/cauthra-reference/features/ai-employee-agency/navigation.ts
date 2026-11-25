import type { AgencySidebarTabId } from '@/lib/ai-employee-agency/agent-registry';
import type { AgencyUiIconName } from './AgencySvgIcons';

export type ExecutiveSubViewId = 'overview' | 'tokens' | 'memory' | 'heartbeat';

interface V6SidebarItem {
  id: string;
  label: string;
  uiIcon?: AgencyUiIconName;
  deptIcon?: AgencySidebarTabId;
  targetTab: AgencySidebarTabId;
  execSubView?: ExecutiveSubViewId;
  openGraph?: boolean;
}

export const V6_SINGLE_SIDEBAR_GROUPS: Array<{
  groupLabel: string;
  items: V6SidebarItem[];
}> = [
  {
    groupLabel: 'Workspace',
    items: [
      {
        id: 'nav-overview',
        label: 'Overview',
        uiIcon: 'dashboard-grid',
        targetTab: 'executive-office',
        execSubView: 'overview',
      },
      {
        id: 'nav-canvas',
        label: 'Live Node Canvas',
        uiIcon: 'node-graph',
        targetTab: 'executive-office',
        openGraph: true,
      },
    ],
  },
  {
    groupLabel: 'Content & Creative',
    items: [
      {
        id: 'nav-keywords',
        label: 'Keyword & Topics',
        deptIcon: 'keyword-strategist',
        targetTab: 'keyword-strategist',
      },
      {
        id: 'nav-articles',
        label: 'Article Studio',
        deptIcon: 'content-writing',
        targetTab: 'content-writing',
      },
      {
        id: 'nav-visuals',
        label: 'Visual & Infographics',
        deptIcon: 'graphic-design',
        targetTab: 'graphic-design',
      },
      {
        id: 'nav-social',
        label: 'Social & Video',
        deptIcon: 'social-video-fleet',
        targetTab: 'social-video-fleet',
      },
    ],
  },
  {
    groupLabel: 'SEO & Growth',
    items: [
      {
        id: 'nav-audit',
        label: 'Technical Site Audit',
        uiIcon: 'technical',
        targetTab: 'technical-seo',
      },
      {
        id: 'nav-onpage',
        label: 'On-Page & Competitors',
        uiIcon: 'onpage',
        targetTab: 'on-page-seo',
      },
      {
        id: 'nav-visibility',
        label: 'AI Visibility & Links',
        deptIcon: 'off-page-seo',
        targetTab: 'off-page-seo',
      },
    ],
  },
  {
    groupLabel: 'Operations',
    items: [
      {
        id: 'nav-publish',
        label: 'QA & Auto-Publish',
        uiIcon: 'check-shield',
        targetTab: 'qa-publishing',
      },
      {
        id: 'nav-tokens',
        label: 'Token & API Usage',
        uiIcon: 'activity',
        targetTab: 'executive-office',
        execSubView: 'tokens',
      },
      {
        id: 'nav-skills',
        label: 'Agent Skills & Cron',
        uiIcon: 'settings',
        targetTab: 'executive-office',
        execSubView: 'memory',
      },
    ],
  },
];

