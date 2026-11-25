/**
 * Phase 1 Foundation: Canonical Contracts for the 2027 Autonomous AI Content,
 * Visual & Social Agent Operating System (`doitwithai.tools`).
 *
 * Designed for zero-auth browser `localStorage` testing in Phase 1 and seamless
 * upgrade to durable background queues (Inngest / Trigger.dev) + live MCP/API
 * connectors in Phases 2–6.
 */

export type AutonomousAgentId =
  | "website-brand-scout"
  | "trend-keyword-radar"
  | "topical-map-architect"
  | "geo-article-writer"
  | "citation-readiness-critic"
  | "prism-visual-infographic"
  | "arcads-hook-matrix"
  | "pinterest-pin-growth"
  | "linkedin-carousel-agent"
  | "x-thread-agent"
  | "omnichannel-publisher"
  | "analytics-winner-loop";

export type AutonomousPipelineStage =
  | "discovery"
  | "editorial"
  | "visual"
  | "social-matrix"
  | "publishing"
  | "analytics";

export interface AutonomousAgentRoleSpec {
  id: AutonomousAgentId;
  order: number;
  name: string;
  shortBadge: string;
  stage: AutonomousPipelineStage;
  deterministicSharePercent: number;
  estimatedTokensPerArticle: number;
  responsibility: string;
  deterministicPreStep: string;
  llmMicroPromptContract: string;
  inputContract: string[];
  outputContract: string[];
  qualityGateRules: string[];
  fallbackBehavior: string;
}

export type WebsitePublishingMode =
  | "internal-doitwithai-site"
  | "external-workspace-staging"
  | "external-wordpress-rest"
  | "external-sanity-cms"
  | "external-custom-webhook";

export type SocialConnectorMode =
  | "local-browser-sandbox"
  | "buffer-mcp"
  | "postiz-open-source"
  | "pinterest-api-v5"
  | "linkedin-native-api";

export type CampaignCadence =
  | "instant-test-batch"
  | "daily-1-article"
  | "weekly-2-articles"
  | "weekly-3-articles";

export type AutopilotApprovalMode =
  | "copilot-review-queue"
  | "confidence-gated-90";

export type ArcadsHookArchetype =
  | "contrarian-data"
  | "symptom-diagnostic"
  | "numbered-playbook"
  | "before-after-vs"
  | "faq-direct-answer";

export type SocialChannelId =
  | "pinterest"
  | "linkedin"
  | "x-twitter"
  | "instagram"
  | "facebook"
  | "threads"
  | "newsletter";

export interface ArcadsSocialVariation {
  id: string;
  archetype: ArcadsHookArchetype;
  archetypeLabel: string;
  channel: SocialChannelId;
  hookLine: string;
  bodyCopy: string;
  ctaLine: string;
  targetUrl: string;
  visualFormat: "pinterest-2x3-pin" | "linkedin-4x5-carousel" | "bento-card" | "thread-cards";
  visualHeadline: string;
  visualSubheadline: string;
  visualPoints: Array<{
    badge: string;
    title: string;
    detail: string;
  }>;
  predictedCtrScore: number;
}

export interface PinterestPinCandidate {
  id: string;
  pinVariantIndex: 1 | 2 | 3;
  angleLabel: "Step-by-Step Timeline" | "Myth vs. Reality Comparison" | "Actionable Checklist";
  boardName: string;
  pinTitle: string;
  pinDescription: string;
  altText: string;
  destinationUrl: string;
  aspectRatio: "2:3";
  dimensions: { width: 1000; height: 1500 };
  prismLayout: "timeline" | "comparison" | "checklist" | "editorial";
  paletteId: string;
  backgroundPattern: "dots-glow" | "svg-waves" | "mesh-grid" | "concentric-rings" | "clean-gradient";
  cardStyle: "glass-editorial" | "playbook-contrast" | "bordered-bento" | "minimal-stripe";
  nodes: Array<{
    id: string;
    badge: string;
    title: string;
    detail: string;
  }>;
  scheduledDayOffset: number;
  status: "staged" | "scheduled-buffer" | "published-pinterest";
  simulatedMetrics?: {
    impressions: number;
    saves: number;
    outboundClicks: number;
    saveRatePercent: number;
  };
}

export interface GeoCitationReadinessReport {
  overallScore: number;
  has50WordDirectAnswer: boolean;
  hasComparisonTable: boolean;
  hasFaqJsonLd: boolean;
  hasOriginalInfographics: boolean;
  hasInternalToolLinks: boolean;
  unverifiedClaimsCount: number;
  passedGate90: boolean;
  improvementNotes: string[];
}

export interface AutomatedArticleJob {
  id: string;
  orderIndex: number;
  topicTitle: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: "informational-guide" | "comparison-vs" | "step-by-step-howto" | "tool-playbook";
  kdProxyScore: number;
  trendSource: "google-trends-rss" | "autocomplete-gap" | "sitemap-cluster" | "user-seed-prompt";
  matchedInternalToolSlug?: string;
  matchedInternalToolTitle?: string;
  status:
    | "queued"
    | "researching"
    | "drafting-article"
    | "generating-visuals"
    | "building-social-matrix"
    | "qa-critic-review"
    | "ready-for-review"
    | "published";
  completedAgents: AutonomousAgentId[];
  activeAgent?: AutonomousAgentId;
  scheduledForIso: string;
  publishedUrl?: string;
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  aeoDirectAnswer50Words: string;
  outlineSections: Array<{
    h2: string;
    archetype: "process" | "framework" | "comparison" | "checklist" | "faq";
    summary: string;
    points: Array<{ badge: string; title: string; detail: string }>;
  }>;
  geoReadiness: GeoCitationReadinessReport;
  arcadsVariations: ArcadsSocialVariation[];
  pinterestPins: PinterestPinCandidate[];
  compiledArticleMarkdown?: string;
  sectionInfographicSvgs?: string[];
  byokProviderUsed?: "gemini-2.5-flash" | "groq-llama-3.3-70b" | "deterministic-zero-token";
  lastPublishReport?: {
    destination: string;
    status: "published" | "draft" | "staged";
    targetUrl: string;
    socialDispatchedCount: number;
    publishedAtIso: string;
  };
  updatedAtIso: string;
}

export interface ConnectedWebsiteProfile {
  id: string;
  siteName: string;
  siteUrl: string;
  publishingMode: WebsitePublishingMode;
  internalBuilderSlug?: string;
  primaryNiche: string;
  brandPrimaryHex: string;
  brandSecondaryHex: string;
  darkThemePreferred: boolean;
  installedTools: Array<{ slug: string; title: string; url: string }>;
  wordpressConfig?: {
    endpointUrl: string;
    username: string;
    appPasswordMasked: string;
    defaultStatus: "draft" | "publish";
  };
  webhookUrl?: string;
}

export interface SocialChannelConnection {
  channel: SocialChannelId;
  label: string;
  enabled: boolean;
  connectorMode: SocialConnectorMode;
  accountHandle: string;
  defaultBoardOrTarget: string;
  bufferMcpConnected: boolean;
  lastSyncedAtIso?: string;
}

export interface FreeTierByokConfig {
  usePlatformFreeTier: boolean;
  geminiFreeKeyMasked: string;
  groqFreeKeyMasked: string;
  rpmCooldownSeconds: number;
  maxArticlesPerCampaign: number;
  dailyTokenCap: number;
}

export interface WinnerFormulaRecord {
  id: string;
  label: string;
  sourceChannel: SocialChannelId;
  winningHookArchetype: ArcadsHookArchetype;
  winningPrismLayout: "editorial" | "timeline" | "comparison" | "checklist" | "ribbon" | "constellation";
  winningPaletteId: string;
  winningCardStyle: "glass-editorial" | "playbook-contrast" | "bordered-bento" | "minimal-stripe";
  WinningBackgroundPattern: "dots-glow" | "svg-waves" | "mesh-grid" | "concentric-rings" | "clean-gradient";
  observedSaveRatePercent: number;
  observedCtrPercent: number;
  lockedAtIso: string;
}

export interface AutonomousCampaign {
  id: string;
  name: string;
  createdAtIso: string;
  updatedAtIso: string;
  websiteId: string;
  seedTopicsOrPrompt: string;
  targetArticleCount: number;
  cadence: CampaignCadence;
  approvalMode: AutopilotApprovalMode;
  confidenceThreshold: number;
  status: "draft" | "running" | "paused" | "completed";
  jobs: AutomatedArticleJob[];
}

export interface AutonomousStudioStoreState {
  version: 1;
  activeCampaignId: string;
  websites: ConnectedWebsiteProfile[];
  campaigns: AutonomousCampaign[];
  socialConnections: SocialChannelConnection[];
  byokConfig: FreeTierByokConfig;
  winnerFormulas: WinnerFormulaRecord[];
  lastSavedAtIso: string;
}
