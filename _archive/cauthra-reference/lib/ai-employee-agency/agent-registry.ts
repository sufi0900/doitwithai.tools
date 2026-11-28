/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V2 PHASE 2)
 * Module: `lib/ai-employee-agency/agent-registry.ts`
 *
 * Complete Modular Registry of the Executive Orchestrator + 8 Department
 * Managers (Main Agents) + 27 Specialized Sub-Agents across all 9 Sidebar Tabs.
 * Every agent has explicit `skills[]`, `tools[]`, parent/child topology, and
 * canvas coordinates for both the 12-Node Core View and the Full Sub-Agent View.
 * ============================================================================
 */

export type AgencySidebarTabId =
  | 'executive-office'
  | 'keyword-strategist'
  | 'content-writing'
  | 'graphic-design'
  | 'on-page-seo'
  | 'off-page-seo'
  | 'technical-seo'
  | 'social-video-fleet'
  | 'qa-publishing';

export type AgencyEmployeeTier = 'executive' | 'manager' | 'sub-agent';

export interface AgencySubAgentDefinition {
  id: string;
  name: string;
  roleTitle: string;
  parentManagerId: string;
  departmentTab: AgencySidebarTabId;
  departmentBadge: string;
  accentHex: string;
  handoffStageOrder: number;
  equippedSkills: string[];
  equippedTools: string[];
  defaultActionStatus: string;
  sampleDeliverablePreview: string;
  canvasX: number;
  canvasY: number;
}

export interface AgencyDepartmentManagerDefinition {
  id: string;
  departmentNumber: number;
  departmentTab: AgencySidebarTabId;
  sidebarIcon: string;
  sidebarLabel: string;
  sidebarShortRole: string;
  name: string;
  roleTitle: string;
  tier: 'executive' | 'manager';
  departmentBadge: string;
  accentHex: string;
  parentManagerId?: string;
  handoffStageOrder: number;
  equippedSkills: string[];
  equippedTools: string[];
  defaultActionStatus: string;
  subAgents: AgencySubAgentDefinition[];
  canvasX: number;
  canvasY: number;
}

export interface InteractiveOfficeNode {
  id: string;
  name: string;
  roleTitle: string;
  tier: AgencyEmployeeTier;
  departmentTab: AgencySidebarTabId;
  departmentBadge: string;
  accentHex: string;
  x: number;
  y: number;
  parentNodeId?: string;
  handoffStageOrder: number;
  liveActionText: string;
  equippedSkills: string[];
  equippedTools: string[];
  sampleOutput: string;
}

/**
 * Master Registry of All 9 Agency Department Leads (Executive + 8 Department Managers)
 * and their 27 Specialized Sub-Agents.
 */
export const AGENCY_DEPARTMENT_REGISTRY: AgencyDepartmentManagerDefinition[] = [
  // ==========================================================================
  // DEPT 0: EXECUTIVE OFFICE & FOUNDER ASSISTANT (`executive-office`)
  // ==========================================================================
  {
    id: 'agent-chief-orchestrator',
    departmentNumber: 0,
    departmentTab: 'executive-office',
    sidebarIcon: '🏢',
    sidebarLabel: 'Executive Office & Brief',
    sidebarShortRole: 'Daily graph & Founder manual alerts',
    name: 'Chief AI Officer & Founder Assistant',
    roleTitle: 'Personal Executive Assistant, Scenario Dispatcher & Handoff Supervisor',
    tier: 'executive',
    departmentBadge: 'Executive Office',
    accentHex: '#38BDF8',
    handoffStageOrder: 1,
    equippedSkills: [
      'founder-intent-parser',
      'cross-department-handoff-router',
      'daily-kpi-telemetry-synthesis',
    ],
    equippedTools: [
      'voice-speech-synthesis',
      'manual-blocker-detector',
      'orchestration-state-machine',
    ],
    defaultActionStatus:
      'Supervising all 8 AI Departments · Monitoring Founder manual action queue & active handoffs',
    canvasX: 570,
    canvasY: 64,
    subAgents: [
      {
        id: 'sub-daily-briefing-synthesizer',
        name: 'Daily Briefing & Telemetry Synthesizer',
        roleTitle: 'Aggregates 24-hour output metrics across Keywords, Content, SEO & Social',
        parentManagerId: 'agent-chief-orchestrator',
        departmentTab: 'executive-office',
        departmentBadge: 'Exec Sub-Agent 1',
        accentHex: '#38BDF8',
        handoffStageOrder: 1,
        equippedSkills: ['kpi-delta-aggregation', 'executive-digest-formatting'],
        equippedTools: ['campaign-telemetry-reader'],
        defaultActionStatus: 'Compiling 24-hour department throughput & QA pass rates',
        sampleDeliverablePreview:
          'Daily Executive Summary: 6 Low-KD keyword clusters locked, 30 standalone 6-layer SVGs compiled, 96/100 average GEO readiness score.',
        canvasX: 290,
        canvasY: 64,
      },
      {
        id: 'sub-founder-manual-escalator',
        name: 'Founder Manual Action Escalator',
        roleTitle: 'Flags external CMS, robots.txt, or OAuth tasks requiring human approval',
        parentManagerId: 'agent-chief-orchestrator',
        departmentTab: 'executive-office',
        departmentBadge: 'Exec Sub-Agent 2',
        accentHex: '#F59E0B',
        handoffStageOrder: 1,
        equippedSkills: ['external-cms-permission-detection', 'priority-blocker-triage'],
        equippedTools: ['manual-blocker-detector'],
        defaultActionStatus: 'Checking external website robots.txt & @graph schema deployment status',
        sampleDeliverablePreview:
          'Escalation Alert: External domain requires 1-time paste of AI-crawler robots.txt rules and connected @graph JSON-LD header snippet.',
        canvasX: 850,
        canvasY: 64,
      },
      {
        id: 'sub-scenario-task-dispatcher',
        name: 'Scenario & Task Dispatcher',
        roleTitle: 'Converts Founder natural-language chat/voice commands into multi-agent workflows',
        parentManagerId: 'agent-chief-orchestrator',
        departmentTab: 'executive-office',
        departmentBadge: 'Exec Sub-Agent 3',
        accentHex: '#38BDF8',
        handoffStageOrder: 1,
        equippedSkills: ['natural-language-brief-extraction', 'sequential-stage-scheduler'],
        equippedTools: ['cross-department-handoff-router'],
        defaultActionStatus: 'Listening on Founder Intercom & Voice Call Dock for instant scenario triggers',
        sampleDeliverablePreview:
          'Active Scenario Pipeline: Stage 1 (Keyword Brief) → Stage 2 (Content & Hero SVG) → Stage 3 (On-Page/Tech Audit) → Stage 4 (QA & Publish) → Stage 5 (Social & TikTok).',
        canvasX: 1060,
        canvasY: 64,
      },
    ],
  },

  // ==========================================================================
  // DEPT 1: KEYWORD & TOPIC STRATEGIST (`keyword-strategist`)
  // ==========================================================================
  {
    id: 'agent-keyword-lead',
    departmentNumber: 1,
    departmentTab: 'keyword-strategist',
    sidebarIcon: '🔑',
    sidebarLabel: 'Keyword & Topic Strategist',
    sidebarShortRole: 'Web search + KD engine → Content brief',
    name: 'Keyword & Topic Strategist',
    roleTitle: 'Live Web Autocomplete + DoItWithAI Keyword KD Engine & H1–H3 Architect',
    tier: 'manager',
    departmentBadge: 'Dept 1 · Keywords',
    accentHex: '#F59E0B',
    parentManagerId: 'agent-chief-orchestrator',
    handoffStageOrder: 2,
    equippedSkills: [
      'serp-intent-clustering',
      'low-kd-opportunity-mining',
      'h1-h3-outline-engineering',
    ],
    equippedTools: [
      'google-autocomplete-live-scraper',
      'doitwithai-keyword-scoring-engine',
      'sitemap-cannibalization-guard',
    ],
    defaultActionStatus:
      'Scraping live Google Autocomplete + scoring KD via DoItWithAI Keyword Engine → Handing off to Content Manager',
    canvasX: 165,
    canvasY: 195,
    subAgents: [
      {
        id: 'sub-autocomplete-trend-scout',
        name: 'Live Web & Autocomplete Trend Scout',
        roleTitle: 'Queries Google Autocomplete & rising 2026 search modifiers in real time',
        parentManagerId: 'agent-keyword-lead',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Keyword Sub-Agent 1',
        accentHex: '#FBBF24',
        handoffStageOrder: 2,
        equippedSkills: ['google-suggest-expansion', 'question-modifier-mining'],
        equippedTools: ['google-autocomplete-live-scraper'],
        defaultActionStatus: 'Expanding seed niche into long-tail "how to", "vs", and "checklist" queries',
        sampleDeliverablePreview:
          'Discovered 18 live autocomplete queries with strong commercial & informational intent.',
        canvasX: 145,
        canvasY: 345,
      },
      {
        id: 'sub-doitwithai-kd-scorer',
        name: 'DoItWithAI Keyword KD & Intent Scorer',
        roleTitle: 'Scores Keyword Difficulty (0–100), AEO Citation Potential & Search Intent',
        parentManagerId: 'agent-keyword-lead',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Keyword Sub-Agent 2',
        accentHex: '#F59E0B',
        handoffStageOrder: 2,
        equippedSkills: ['kd-heuristic-computation', 'aeo-overview-trigger-scoring'],
        equippedTools: ['doitwithai-keyword-scoring-engine', 'serp-intent-classifier'],
        defaultActionStatus: 'Filtering for KD <= 28 with high AI Overview citation probability',
        sampleDeliverablePreview:
          'KD Scoring Matrix: Selected top 6 non-overlapping keywords averaging KD 17/100 and 94/100 GEO readiness.',
        canvasX: 145,
        canvasY: 425,
      },
      {
        id: 'sub-heading-cluster-architect',
        name: 'Heading Structure (H1–H3) & Cluster Architect',
        roleTitle: 'Locks H1 title, 4 visual-ready H2 headings, H3 sub-points & FAQ questions',
        parentManagerId: 'agent-keyword-lead',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Keyword Sub-Agent 3',
        accentHex: '#FDE68A',
        handoffStageOrder: 2,
        equippedSkills: ['semantic-heading-hierarchy', 'jaccard-cannibalization-prevention'],
        equippedTools: ['sitemap-cannibalization-guard'],
        defaultActionStatus: 'Packaging SELECTED_KEYWORD_BRIEF packet for Content Production Manager',
        sampleDeliverablePreview:
          'Handoff Packet Ready: H1 + 4 H2 sections (Stat Card, Comparison Matrix, Step Flow, Pitfall Grid) + 4 PAA FAQs.',
        canvasX: 145,
        canvasY: 505,
      },
    ],
  },

  // ==========================================================================
  // DEPT 2: CONTENT PRODUCTION STUDIO (`content-writing`)
  // ==========================================================================
  {
    id: 'agent-content-manager',
    departmentNumber: 2,
    departmentTab: 'content-writing',
    sidebarIcon: '✍️',
    sidebarLabel: 'Content Writing Studio',
    sidebarShortRole: 'Published / Drafts / Writing / Not Started',
    name: 'Content Production Manager',
    roleTitle: 'Receives Keyword Brief & Coordinates Writer, Meta, Link, Schema & Design Agents',
    tier: 'manager',
    departmentBadge: 'Dept 2 · Content Lead',
    accentHex: '#8B5CF6',
    parentManagerId: 'agent-keyword-lead',
    handoffStageOrder: 3,
    equippedSkills: [
      'editorial-task-decomposition',
      'brand-voice-enforcement',
      'multi-agent-article-assembly',
    ],
    equippedTools: [
      'writer-studio-bridge',
      'sub-agent-dispatcher',
      'markdown-html-compiler',
    ],
    defaultActionStatus:
      'Distributing active keyword brief to Section Writer, Meta Specialist, Link Weaver & Graphic Designer',
    canvasX: 445,
    canvasY: 195,
    subAgents: [
      {
        id: 'sub-geo-section-writer',
        name: 'Long-Form GEO/AEO Section Writer',
        roleTitle: 'Writes 50-word direct AEO answer lead, H2/H3 prose & comparison tables',
        parentManagerId: 'agent-content-manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agent 1',
        accentHex: '#A855F7',
        handoffStageOrder: 4,
        equippedSkills: ['geo-50word-lead-writer', 'human-rhythm-stylist'],
        equippedTools: ['markdown-section-drafter'],
        defaultActionStatus: 'Drafting 50-word direct answer lead + 4 standalone H2 sections',
        sampleDeliverablePreview:
          'Drafted 2,100-word evidence-backed guide with 50-word AEO snippet block and structured comparison table.',
        canvasX: 605,
        canvasY: 345,
      },
      {
        id: 'sub-meta-pixel-specialist',
        name: 'Meta Title (<580px) & Description Specialist',
        roleTitle: 'Crafts high-CTR SERP titles (<60 chars) & meta descriptions (<155 chars)',
        parentManagerId: 'agent-content-manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agent 2',
        accentHex: '#C084FC',
        handoffStageOrder: 4,
        equippedSkills: ['serp-pixel-width-optimization', 'ctr-power-word-calibration'],
        equippedTools: ['meta-title-pixel-calculator'],
        defaultActionStatus: 'Verifying SERP title pixel width (<580px) & primary keyword front-loading',
        sampleDeliverablePreview:
          'Meta Title (54 chars / 492px) & Meta Description (148 chars / 880px) verified with zero truncation.',
        canvasX: 605,
        canvasY: 425,
      },
      {
        id: 'sub-contextual-link-weaver',
        name: 'Internal & External Link Weaver',
        roleTitle: 'Injects natural anchor links to sibling articles, interactive tools & citations',
        parentManagerId: 'agent-content-manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agent 3',
        accentHex: '#9333EA',
        handoffStageOrder: 4,
        equippedSkills: ['contextual-anchor-link-mapper', 'hub-and-spoke-interlinking'],
        equippedTools: ['internal-link-graph-builder'],
        defaultActionStatus: 'Weaving contextual internal links + authoritative external source citations',
        sampleDeliverablePreview:
          'Inserted 3 internal hub-and-spoke links and 2 primary benchmark citations with descriptive anchor text.',
        canvasX: 605,
        canvasY: 505,
      },
      {
        id: 'sub-jsonld-graph-writer',
        name: 'Connected @graph JSON-LD Schema Writer',
        roleTitle: 'Compiles BlogPosting + FAQPage + Organization + ImageObject JSON-LD',
        parentManagerId: 'agent-content-manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agent 4',
        accentHex: '#7E22CE',
        handoffStageOrder: 4,
        equippedSkills: ['schema-org-entity-linking', 'faqpage-jsonld-synthesis'],
        equippedTools: ['jsonld-graph-compiler'],
        defaultActionStatus: 'Compiling connected @graph JSON-LD block for AI Overviews & Rich Results',
        sampleDeliverablePreview:
          'Generated valid <script type="application/ld+json"> with @graph linking BlogPosting, FAQPage, and Author.',
        canvasX: 605,
        canvasY: 575,
      },
    ],
  },

  // ==========================================================================
  // DEPT 3: CREATIVE & GRAPHIC DESIGN STUDIO (`graphic-design`)
  // ==========================================================================
  {
    id: 'agent-design-director',
    departmentNumber: 3,
    departmentTab: 'graphic-design',
    sidebarIcon: '🎨',
    sidebarLabel: 'Graphic & Visual Designer',
    sidebarShortRole: 'Featured hero + 4× 6-layer SVGs + Pins',
    name: 'Creative & Graphic Design Director',
    roleTitle: 'Featured Hero Image (16:9) + 4× Standalone 6-Layer Section Infographics (1080×1350)',
    tier: 'manager',
    departmentBadge: 'Dept 3 · Visual Studio',
    accentHex: '#EC4899',
    parentManagerId: 'agent-content-manager',
    handoffStageOrder: 3,
    equippedSkills: [
      '6-layer-prism-infographic-synthesis',
      'brand-palette-contrast-harmony',
      'editorial-hero-composition',
    ],
    equippedTools: [
      'featured-hero-svg-generator',
      'six-layer-infographic-engine',
      'zero-cls-vector-optimizer',
    ],
    defaultActionStatus:
      'Rendering 1200×675 Featured Hero Image + 4× standalone 1080×1350 section infographics',
    canvasX: 375,
    canvasY: 345,
    subAgents: [
      {
        id: 'sub-featured-hero-designer',
        name: 'Featured Hero Image Designer (1200×675)',
        roleTitle: 'Creates the article cover banner with brand hex gradients & 3 key callout cards',
        parentManagerId: 'agent-design-director',
        departmentTab: 'graphic-design',
        departmentBadge: 'Design Sub-Agent 1',
        accentHex: '#F472B6',
        handoffStageOrder: 3,
        equippedSkills: ['16x9-editorial-cover-layout', 'wcag-contrast-typography'],
        equippedTools: ['featured-hero-svg-generator'],
        defaultActionStatus: 'Rendering 1200×675 Featured Hero SVG synced to website brand palette',
        sampleDeliverablePreview:
          'Compiled 1200×675 Featured Hero Banner SVG with brand primary/secondary glow and 3 metric badges.',
        canvasX: 375,
        canvasY: 425,
      },
      {
        id: 'sub-six-layer-infographic-architect',
        name: '6-Layer Section Infographic Architect (1080×1350)',
        roleTitle: 'Builds 4 standalone 4:5 portrait infographics (1 per H2 section)',
        parentManagerId: 'agent-design-director',
        departmentTab: 'graphic-design',
        departmentBadge: 'Design Sub-Agent 2',
        accentHex: '#EC4899',
        handoffStageOrder: 3,
        equippedSkills: ['4x5-portrait-bento-grid', 'data-callout-visualization'],
        equippedTools: ['six-layer-infographic-engine', 'zero-cls-vector-optimizer'],
        defaultActionStatus: 'Synthesizing 4× 1080×1350 6-layer SVG infographics with explicit viewBox',
        sampleDeliverablePreview:
          'Rendered 4 standalone 1080×1350 section infographics (Stat Card, Comparison Table, Process Flow, Checklist).',
        canvasX: 375,
        canvasY: 505,
      },
      {
        id: 'sub-social-carousel-pin-designer',
        name: 'Social Carousel & 2:3 Vertical Pin Designer',
        roleTitle: 'Adapts article visuals into 1000×1500 Pinterest Pins & 8-Slide LinkedIn Decks',
        parentManagerId: 'agent-design-director',
        departmentTab: 'graphic-design',
        departmentBadge: 'Design Sub-Agent 3',
        accentHex: '#DB2777',
        handoffStageOrder: 6,
        equippedSkills: ['2x3-pinterest-visual-hierarchy', '8-slide-carousel-pacing'],
        equippedTools: ['pinterest-2x3-pin-compiler', 'linkedin-8slide-html-pdf-builder'],
        defaultActionStatus: 'Formatting 3× 1000×1500 Pinterest SVGs & 8-slide 1080×1350 carousel frames',
        sampleDeliverablePreview:
          'Prepared 3 tall 2:3 Pinterest Pin SVGs and 8-slide interactive LinkedIn carousel deck.',
        canvasX: 375,
        canvasY: 575,
      },
    ],
  },

  // ==========================================================================
  // DEPT 4: ON-PAGE SEO & CONTENT REFRESH (`on-page-seo`)
  // ==========================================================================
  {
    id: 'agent-onpage-lead',
    departmentNumber: 4,
    departmentTab: 'on-page-seo',
    sidebarIcon: '🛠️',
    sidebarLabel: 'On-Page SEO & Refresh',
    sidebarShortRole: 'Meta, H1-H3, internal links & 2026 refresh',
    name: 'On-Page SEO Lead Engineer',
    roleTitle: 'Live HTML DOM Auditor, Internal Link Graph & 2026 Content Decay Refresher',
    tier: 'manager',
    departmentBadge: 'Dept 4 · On-Page SEO',
    accentHex: '#10B981',
    parentManagerId: 'agent-chief-orchestrator',
    handoffStageOrder: 4,
    equippedSkills: [
      'live-dom-heading-audit',
      'content-decay-gap-analyzer',
      'internal-link-orphan-prevention',
    ],
    equippedTools: [
      'live-html-page-crawler',
      'drop-in-refresh-markdown-generator',
      'internal-link-orphan-detector',
    ],
    defaultActionStatus:
      'Auditing live HTML headings, <580px SERP titles, internal link spokes & decaying blog posts',
    canvasX: 725,
    canvasY: 195,
    subAgents: [
      {
        id: 'sub-live-dom-auditor',
        name: 'Live DOM Heading & Word-Count Auditor',
        roleTitle: 'Inspects H1–H3 nesting, semantic density & image alt attributes',
        parentManagerId: 'agent-onpage-lead',
        departmentTab: 'on-page-seo',
        departmentBadge: 'On-Page Sub-Agent 1',
        accentHex: '#34D399',
        handoffStageOrder: 4,
        equippedSkills: ['h1-h3-semantic-validation', 'alt-text-entity-enrichment'],
        equippedTools: ['live-html-page-crawler'],
        defaultActionStatus: 'Scanning H1/H2 hierarchy and verifying descriptive SVG alt attributes',
        sampleDeliverablePreview:
          'DOM Audit Pass: Single H1 verified, 4 semantic H2 sections, 100% descriptive alt attributes on inline SVGs.',
        canvasX: 725,
        canvasY: 275,
      },
      {
        id: 'sub-content-decay-refresher',
        name: 'Content Decay & 2026 Refresh Injector',
        roleTitle: 'Identifies older articles losing impressions & generates drop-in 2026 refresh blocks',
        parentManagerId: 'agent-onpage-lead',
        departmentTab: 'on-page-seo',
        departmentBadge: 'On-Page Sub-Agent 2',
        accentHex: '#10B981',
        handoffStageOrder: 4,
        equippedSkills: ['content-decay-gap-analyzer', '2026-stat-table-injection'],
        equippedTools: ['drop-in-refresh-markdown-generator'],
        defaultActionStatus: 'Generating drop-in 2026 AEO Answer Block + updated comparison table for existing posts',
        sampleDeliverablePreview:
          'Prepared 3 drop-in 2026 Refresh Patches (+50-word AEO lead + 2026 benchmark table + 2 new FAQ schema items).',
        canvasX: 725,
        canvasY: 355,
      },
      {
        id: 'sub-serp-schema-verifier',
        name: 'SERP Pixel & Schema Compliance Verifier',
        roleTitle: 'Validates Title/Meta pixel widths & Rich Result schema eligibility',
        parentManagerId: 'agent-onpage-lead',
        departmentTab: 'on-page-seo',
        departmentBadge: 'On-Page Sub-Agent 3',
        accentHex: '#059669',
        handoffStageOrder: 4,
        equippedSkills: ['serp-truncation-guard', 'jsonld-syntax-validator'],
        equippedTools: ['jsonld-graph-compiler'],
        defaultActionStatus: 'Validating <script type="application/ld+json"> @graph nodes',
        sampleDeliverablePreview:
          'Zero schema warnings: BlogPosting, FAQPage, Organization, and BreadcrumbList verified.',
        canvasX: 725,
        canvasY: 435,
      },
    ],
  },

  // ==========================================================================
  // DEPT 5: OFF-PAGE SEO & DIGITAL PR (`off-page-seo`)
  // ==========================================================================
  {
    id: 'agent-offpage-lead',
    departmentNumber: 5,
    departmentTab: 'off-page-seo',
    sidebarIcon: '📣',
    sidebarLabel: 'Off-Page SEO & Digital PR',
    sidebarShortRole: 'Backlink gaps, directories & PR pitches',
    name: 'Off-Page Authority & Digital PR Lead',
    roleTitle: 'Competitor Backlink Gap Scout, Journalist Pitches & Link-Magnet Embeds',
    tier: 'manager',
    departmentBadge: 'Dept 5 · Off-Page PR',
    accentHex: '#F97316',
    parentManagerId: 'agent-chief-orchestrator',
    handoffStageOrder: 4,
    equippedSkills: [
      'backlink-gap-heuristics',
      'data-driven-journalist-pitching',
      'infographic-embed-outreach',
    ],
    equippedTools: [
      'data-pr-pitch-composer',
      'directory-submission-packager',
      'embeddable-infographic-code-builder',
    ],
    defaultActionStatus:
      'Packaging journalist data pitches, niche directory submissions & infographic embed snippets',
    canvasX: 985,
    canvasY: 195,
    subAgents: [
      {
        id: 'sub-competitor-backlink-scout',
        name: 'Competitor Backlink & Link-Magnet Scout',
        roleTitle: 'Finds high-DR resource pages & roundups linking to competitors',
        parentManagerId: 'agent-offpage-lead',
        departmentTab: 'off-page-seo',
        departmentBadge: 'Off-Page Sub-Agent 1',
        accentHex: '#FB923C',
        handoffStageOrder: 4,
        equippedSkills: ['competitor-refdomain-gap-mining', 'link-magnet-topic-matching'],
        equippedTools: ['backlink-gap-heuristics'],
        defaultActionStatus: 'Identifying high-authority roundup pages & resource hubs in niche',
        sampleDeliverablePreview:
          'Identified 3 high-priority backlink targets (Industry Weekly Roundup, Niche Resource Directory, Partner Hub).',
        canvasX: 985,
        canvasY: 275,
      },
      {
        id: 'sub-journalist-pr-pitch-writer',
        name: 'Journalist Data Pitch & HARO/Qwoted Writer',
        roleTitle: 'Drafts concise, stat-backed email pitches with embeddable 6-layer SVG charts',
        parentManagerId: 'agent-offpage-lead',
        departmentTab: 'off-page-seo',
        departmentBadge: 'Off-Page Sub-Agent 2',
        accentHex: '#F97316',
        handoffStageOrder: 4,
        equippedSkills: ['haro-qwoted-response-structuring', 'exclusive-stat-hook-writing'],
        equippedTools: ['data-pr-pitch-composer', 'embeddable-infographic-code-builder'],
        defaultActionStatus: 'Drafting ready-to-send journalist outreach emails with attribution HTML',
        sampleDeliverablePreview:
          'Ready-to-copy Digital PR pitch + <figure> attribution embed snippet for 1080×1350 SVG infographic.',
        canvasX: 985,
        canvasY: 355,
      },
      {
        id: 'sub-directory-mention-agent',
        name: 'Niche Directory & Unlinked Mention Agent',
        roleTitle: 'Prepares standardized listing descriptions & unlinked brand mention claims',
        parentManagerId: 'agent-offpage-lead',
        departmentTab: 'off-page-seo',
        departmentBadge: 'Off-Page Sub-Agent 3',
        accentHex: '#EA580C',
        handoffStageOrder: 4,
        equippedSkills: ['citation-nap-consistency', 'unlinked-mention-reclamation'],
        equippedTools: ['directory-submission-packager'],
        defaultActionStatus: 'Compiling 50-word and 120-word directory submission copy + UTM links',
        sampleDeliverablePreview:
          'Directory Pack Ready: Standardized title, category tags, and backlink attribution copy.',
        canvasX: 985,
        canvasY: 435,
      },
    ],
  },

  // ==========================================================================
  // DEPT 6: TECHNICAL & LOCAL ENTITY SEO (`technical-seo`)
  // ==========================================================================
  {
    id: 'agent-technical-lead',
    departmentNumber: 6,
    departmentTab: 'technical-seo',
    sidebarIcon: '⚙️',
    sidebarLabel: 'Technical & Local SEO',
    sidebarShortRole: 'CWV, robots.txt AI bots & manual fixes',
    name: 'Technical & Local SEO Architect',
    roleTitle: 'Core Web Vitals (0.00 CLS), robots.txt AI Crawler Guard & Entity Schema',
    tier: 'manager',
    departmentBadge: 'Dept 6 · Technical SEO',
    accentHex: '#06B6D4',
    parentManagerId: 'agent-chief-orchestrator',
    handoffStageOrder: 4,
    equippedSkills: [
      'cwv-cls-lcp-optimization',
      'ai-crawler-robots-governance',
      'knowledge-graph-sameas-disambiguation',
    ],
    equippedTools: [
      'robots-txt-ai-bot-validator',
      'sitemap-xml-health-checker',
      'organization-sameas-schema-builder',
      'founder-manual-fix-escalator',
    ],
    defaultActionStatus:
      'Verifying 0.00 CLS vector dimensions, OAI-SearchBot/PerplexityBot permissions & Organization schema',
    canvasX: 1015,
    canvasY: 195,
    subAgents: [
      {
        id: 'sub-cwv-speed-auditor',
        name: 'Core Web Vitals (LCP/CLS) & Speed Auditor',
        roleTitle: 'Enforces explicit width/height/viewBox on all visual assets for 0.00 CLS',
        parentManagerId: 'agent-technical-lead',
        departmentTab: 'technical-seo',
        departmentBadge: 'Tech Sub-Agent 1',
        accentHex: '#22D3EE',
        handoffStageOrder: 4,
        equippedSkills: ['zero-cls-dimension-locking', 'inline-svg-payload-minification'],
        equippedTools: ['zero-cls-vector-optimizer'],
        defaultActionStatus: 'Auditing Featured Hero (1200×675) & Section SVGs (1080×1350) for 0.00 CLS',
        sampleDeliverablePreview:
          'CLS Score: 0.00 Verified. Every SVG carries explicit width, height, and aspect-ratio reservation.',
        canvasX: 1015,
        canvasY: 285,
      },
      {
        id: 'sub-robots-canonical-guard',
        name: 'robots.txt, AI Crawler & Canonical Guard',
        roleTitle: 'Ensures GPTBot, OAI-SearchBot, PerplexityBot & Google-Extended are allowed',
        parentManagerId: 'agent-technical-lead',
        departmentTab: 'technical-seo',
        departmentBadge: 'Tech Sub-Agent 2',
        accentHex: '#06B6D4',
        handoffStageOrder: 4,
        equippedSkills: ['ai-search-crawler-whitelisting', 'canonical-tag-deduplication'],
        equippedTools: ['robots-txt-ai-bot-validator', 'sitemap-xml-health-checker'],
        defaultActionStatus: 'Checking robots.txt for OAI-SearchBot, GPTBot, PerplexityBot & sitemap index',
        sampleDeliverablePreview:
          'User-agent: OAI-SearchBot Allow: / | User-agent: PerplexityBot Allow: / | Self-referencing canonicals active.',
        canvasX: 1015,
        canvasY: 365,
      },
      {
        id: 'sub-local-entity-schema-agent',
        name: 'Local Business & Knowledge Graph Entity Agent',
        roleTitle: 'Builds Organization, WebSite, and sameAs entity disambiguation JSON-LD',
        parentManagerId: 'agent-technical-lead',
        departmentTab: 'technical-seo',
        departmentBadge: 'Tech Sub-Agent 3',
        accentHex: '#0891B2',
        handoffStageOrder: 4,
        equippedSkills: ['entity-id-graph-linking', 'sameas-authority-mapping'],
        equippedTools: ['organization-sameas-schema-builder'],
        defaultActionStatus: 'Generating Organization + WebSite @id entity graph for LLM citation trust',
        sampleDeliverablePreview:
          'Organization @id linked to official social profiles, founder profile, and primary niche knowsAbout entities.',
        canvasX: 1015,
        canvasY: 445,
      },
    ],
  },

  // ==========================================================================
  // DEPT 7: QA & AUTONOMOUS PUBLISHING (`qa-publishing`)
  // ==========================================================================
  {
    id: 'agent-qa-publisher',
    departmentNumber: 7,
    departmentTab: 'qa-publishing',
    sidebarIcon: '✅',
    sidebarLabel: 'QA & Publishing Queue',
    sidebarShortRole: '150-pt readability gate & auto-publish',
    name: 'Quality Assurance & Publishing Controller',
    roleTitle: '150-Point E-E-A-T Readability Gate + Internal Auto-Publisher / External Packager',
    tier: 'manager',
    departmentBadge: 'Dept 7 · QA & Publish',
    accentHex: '#22C55E',
    parentManagerId: 'sub-geo-section-writer',
    handoffStageOrder: 5,
    equippedSkills: [
      '150pt-readability-eeat-audit',
      'anti-cliche-burstiness-verification',
      'destination-aware-publishing',
    ],
    equippedTools: [
      '150pt-geo-quality-gate',
      'anti-cliche-linter',
      'internal-blog-store-publisher',
      'external-cms-draft-packager',
    ],
    defaultActionStatus:
      'Running 150-point E-E-A-T & readability gate → Auto-publishing internal sites or staging external drafts',
    canvasX: 845,
    canvasY: 345,
    subAgents: [
      {
        id: 'sub-150pt-readability-gate',
        name: '150-Point Readability, E-E-A-T & Anti-Fluff Gate',
        roleTitle: 'Verifies 50w AEO lead, sentence burstiness, zero AI clichés & visual completeness',
        parentManagerId: 'agent-qa-publisher',
        departmentTab: 'qa-publishing',
        departmentBadge: 'QA Sub-Agent 1',
        accentHex: '#4ADE80',
        handoffStageOrder: 5,
        equippedSkills: ['ai-cliche-elimination', 'aeo-citation-readiness-scoring'],
        equippedTools: ['150pt-geo-quality-gate', 'anti-cliche-linter'],
        defaultActionStatus: 'Auditing article against 150-point GEO/AEO rubric (Score: 96/100 PASS)',
        sampleDeliverablePreview:
          'QA Gate Passed (96/100): 50w AEO Answer Block ✓ | 4 Section SVGs ✓ | Comparison Matrix ✓ | Zero banned clichés ✓.',
        canvasX: 845,
        canvasY: 425,
      },
      {
        id: 'sub-internal-site-autopublisher',
        name: 'Internal Site Auto-Publisher (/p/[slug]/blog)',
        roleTitle: 'Publishes approved articles directly to internal DoItWithAI Website Builder blogs',
        parentManagerId: 'agent-qa-publisher',
        departmentTab: 'qa-publishing',
        departmentBadge: 'QA Sub-Agent 2',
        accentHex: '#22C55E',
        handoffStageOrder: 5,
        equippedSkills: ['instant-internal-blog-deployment', 'hub-navigation-rebinding'],
        equippedTools: ['internal-blog-store-publisher'],
        defaultActionStatus: 'Deploying approved articles directly to /p/[slug]/blog/[article-slug]',
        sampleDeliverablePreview:
          'Internal Site Mode: Instant live publication to /p/[slug]/blog with hero SVG, 4 section SVGs, and JSON-LD.',
        canvasX: 845,
        canvasY: 505,
      },
      {
        id: 'sub-external-cms-packager',
        name: 'External CMS Draft & Webhook Packager',
        roleTitle: 'Packages Markdown, HTML, @graph JSON-LD & SVG bundle for external domains',
        parentManagerId: 'agent-qa-publisher',
        departmentTab: 'qa-publishing',
        departmentBadge: 'QA Sub-Agent 3',
        accentHex: '#16A34A',
        handoffStageOrder: 5,
        equippedSkills: ['cms-ready-bundle-compilation', 'webhook-payload-signing'],
        equippedTools: ['external-cms-draft-packager'],
        defaultActionStatus: 'Staging 📘 Draft Ready package for external website CMS push',
        sampleDeliverablePreview:
          'External Site Mode: Complete Markdown + HTML + @graph Schema + SVG Asset Pack staged for 1-click export.',
        canvasX: 845,
        canvasY: 575,
      },
    ],
  },

  // ==========================================================================
  // DEPT 8: SOCIAL MEDIA & TIKTOK VIDEO FLEET (`social-video-fleet`)
  // ==========================================================================
  {
    id: 'agent-social-manager',
    departmentNumber: 8,
    departmentTab: 'social-video-fleet',
    sidebarIcon: '📲',
    sidebarLabel: 'Social & TikTok Video Fleet',
    sidebarShortRole: 'Pinterest, LinkedIn, X, IG & TikTok scripts',
    name: 'Social Media & Viral Video Manager',
    roleTitle: 'Orchestrates Pinterest 2:3, LinkedIn 8-Slide, FB/IG, X Threads & 60s TikTok Scripts',
    tier: 'manager',
    departmentBadge: 'Dept 8 · Social Lead',
    accentHex: '#F43F5E',
    parentManagerId: 'agent-qa-publisher',
    handoffStageOrder: 6,
    equippedSkills: [
      'omnichannel-hook-adaptation',
      'short-form-video-retention-architecture',
      'drip-schedule-orchestration',
    ],
    equippedTools: [
      'pinterest-2x3-pin-compiler',
      'linkedin-8slide-html-pdf-builder',
      'viral-thread-atomizer',
      'tiktok-trend-hook-analyzer',
      'short-form-video-storyboard-writer',
    ],
    defaultActionStatus:
      'Fanning out published article into Pinterest 2:3 Pins, LinkedIn 8-Slide Deck, X Thread & 60s TikTok Script',
    canvasX: 375,
    canvasY: 495,
    subAgents: [
      {
        id: 'sub-pinterest-2x3-specialist',
        name: 'Pinterest 2:3 Visual Growth Specialist',
        roleTitle: 'Generates 3× tall 1000×1500 (2:3) SVG Pins + keyword-rich Pin descriptions',
        parentManagerId: 'agent-social-manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Social Sub-Agent 1',
        accentHex: '#FB7185',
        handoffStageOrder: 6,
        equippedSkills: ['pinterest-fresh-pin-seo', '2x3-vertical-scroll-stopping-design'],
        equippedTools: ['pinterest-2x3-pin-compiler'],
        defaultActionStatus: 'Compiling 3× 1000×1500 (2:3) Pinterest Pin SVGs with board/keyword metadata',
        sampleDeliverablePreview:
          '3× Tall 2:3 Pinterest Pins (Stat Hook, Checklist Pin, Myth-Buster Pin) + SEO descriptions & destination URLs.',
        canvasX: 660,
        canvasY: 495,
      },
      {
        id: 'sub-linkedin-8slide-specialist',
        name: 'LinkedIn 8-Slide PDF Carousel Specialist',
        roleTitle: 'Builds 8-slide 1080×1350 executive carousel deck + B2B thought-leadership post',
        parentManagerId: 'agent-social-manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Social Sub-Agent 2',
        accentHex: '#38BDF8',
        handoffStageOrder: 6,
        equippedSkills: ['b2b-carousel-storytelling', 'dwell-time-slide-sequencing'],
        equippedTools: ['linkedin-8slide-html-pdf-builder'],
        defaultActionStatus: 'Structuring 8-slide 1080×1350 LinkedIn Carousel + founder commentary hook',
        sampleDeliverablePreview:
          '8-Slide LinkedIn Carousel (Cover Hook → Problem → 4 Framework Slides → Proof Table → CTA Slide).',
        canvasX: 660,
        canvasY: 565,
      },
      {
        id: 'sub-fb-ig-bento-specialist',
        name: 'Facebook & Instagram Bento Specialist',
        roleTitle: 'Creates 4:5 Instagram feed captions & Facebook community discussion posts',
        parentManagerId: 'agent-social-manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Social Sub-Agent 3',
        accentHex: '#EC4899',
        handoffStageOrder: 6,
        equippedSkills: ['ig-saveable-carousel-copy', 'fb-group-discussion-starters'],
        equippedTools: ['social-bento-caption-generator'],
        defaultActionStatus: 'Writing Instagram save-worthy caption + Facebook engagement question',
        sampleDeliverablePreview:
          'IG/FB Pack: Contrarian hook + 5 bullet takeaways + "Save this post for your next audit" CTA.',
        canvasX: 795,
        canvasY: 565,
      },
      {
        id: 'sub-x-threads-viral-writer',
        name: 'X (Twitter) & Threads Viral Thread Writer',
        roleTitle: 'Atomizes article into a 6-post high-retention X/Threads thread with stat hooks',
        parentManagerId: 'agent-social-manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Social Sub-Agent 4',
        accentHex: '#A855F7',
        handoffStageOrder: 6,
        equippedSkills: ['viral-thread-atomizer', 'contrarian-stat-opener'],
        equippedTools: ['viral-thread-atomizer'],
        defaultActionStatus: 'Atomizing H2 takeaways into a 6-part X & Threads viral thread',
        sampleDeliverablePreview:
          '1/6 Thread Hook + 4 evidence-backed framework tweets + final bookmark & article link CTA.',
        canvasX: 935,
        canvasY: 565,
      },
      {
        id: 'sub-tiktok-reels-script-agent',
        name: 'TikTok, Reels & Shorts Video Script & Trend Agent',
        roleTitle: 'Analyzes niche short-form trends & scripts 60s video (0–3s Hook + B-Roll + CTA)',
        parentManagerId: 'agent-social-manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'TikTok / Video Agent',
        accentHex: '#38BDF8',
        handoffStageOrder: 6,
        equippedSkills: [
          'tiktok-trend-hook-analyzer',
          '3-second-pattern-interrupt-scripting',
          '60s-scene-storyboard-direction',
        ],
        equippedTools: [
          'tiktok-trend-hook-analyzer',
          'short-form-video-storyboard-writer',
        ],
        defaultActionStatus:
          'Scripting 60-second TikTok / Reels / Shorts video with 3-second visual hook & B-roll cues',
        sampleDeliverablePreview:
          '[0:00-0:03 HOOK] + [0:03-0:18 PROBLEM] + [0:18-0:45 SCREEN WALKTHROUGH] + [0:45-0:60 COMMENT CTA].',
        canvasX: 935,
        canvasY: 495,
      },
    ],
  },
];

/**
 * Returns the Sidebar navigation array derived from the Master Registry
 */
export const SIDEBAR_DEPARTMENTS_FROM_REGISTRY = AGENCY_DEPARTMENT_REGISTRY.map(
  (dept) => ({
    id: dept.departmentTab,
    icon: dept.sidebarIcon,
    label: dept.sidebarLabel,
    shortRole: dept.sidebarShortRole,
    accentHex: dept.accentHex,
    managerName: dept.name,
    subAgentCount: dept.subAgents.length,
  })
);

/**
 * Look up a specific Department Manager and its specialized Sub-Agents by Sidebar Tab ID
 */
export function getDepartmentByTabId(
  tabId: AgencySidebarTabId
): AgencyDepartmentManagerDefinition {
  return (
    AGENCY_DEPARTMENT_REGISTRY.find((d) => d.departmentTab === tabId) ||
    AGENCY_DEPARTMENT_REGISTRY[0]!
  );
}

/**
 * Returns a flat list of all 36 AI Employees (9 Managers/Leads + 27 Sub-Agents)
 * for the Unified Founder Command Bar & 1-on-1 Voice/Text Chat selector.
 */
export function getAllAgencyEmployeesFlat(): Array<{
  id: string;
  name: string;
  roleTitle: string;
  tier: AgencyEmployeeTier;
  departmentTab: AgencySidebarTabId;
  departmentBadge: string;
  accentHex: string;
  equippedSkills: string[];
  equippedTools: string[];
}> {
  const list: Array<{
    id: string;
    name: string;
    roleTitle: string;
    tier: AgencyEmployeeTier;
    departmentTab: AgencySidebarTabId;
    departmentBadge: string;
    accentHex: string;
    equippedSkills: string[];
    equippedTools: string[];
  }> = [];

  for (const dept of AGENCY_DEPARTMENT_REGISTRY) {
    list.push({
      id: dept.id,
      name: dept.name,
      roleTitle: dept.roleTitle,
      tier: dept.tier,
      departmentTab: dept.departmentTab,
      departmentBadge: dept.departmentBadge,
      accentHex: dept.accentHex,
      equippedSkills: dept.equippedSkills,
      equippedTools: dept.equippedTools,
    });
    for (const sub of dept.subAgents) {
      list.push({
        id: sub.id,
        name: sub.name,
        roleTitle: sub.roleTitle,
        tier: 'sub-agent',
        departmentTab: sub.departmentTab,
        departmentBadge: sub.departmentBadge,
        accentHex: sub.accentHex,
        equippedSkills: sub.equippedSkills,
        equippedTools: sub.equippedTools,
      });
    }
  }

  return list;
}
