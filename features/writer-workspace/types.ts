import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: { type: string; attrs?: Record<string, any> }[];
  content?: RichNode[];
};
export type Reference = {
  id: string;
  url: string;
  title: string;
  text: string;
  importedAt?: string;
};
export type PipelineStageId =
  | "analyze"
  | "keywords"
  | "web_research"
  | "internal_links"
  | "serp_meta"
  | "featured_image"
  | "outline"
  | "sections"
  | "infographics"
  | "readability_eeat"
  | "social_video";

export type PipelineStageRecord = {
  id: PipelineStageId;
  label: string;
  status: "pending" | "active" | "done" | "skipped" | "error";
  detail?: string;
};

export type ResearchLinkItem = {
  url: string;
  title: string;
  snippet?: string;
  anchorText?: string;
  sourceKind: "internal" | "external";
  relevanceScore?: number;
};

export type BrandVoiceProfile = {
  sourceDomain: string;
  voiceSummary: string;
  pointOfView: string;
  sentenceRhythm: string;
  vocabularyNotes: string[];
  avoidPhrases: string[];
  sampledPages: string[];
};

export type ResearchCompetitorBenchmarks = {
  targetWordsMin: number;
  targetWordsMax: number;
  targetH2Min: number;
  targetH2Max: number;
  targetParagraphsMin: number;
  targetParagraphsMax: number;
  targetImagesMin: number;
  targetImagesMax: number;
  analyzedPages: Array<{
    url: string;
    title: string;
    wordCount: number;
    h2Headings: string[];
  }>;
};

export type SemanticTermTarget = {
  term: string;
  minCount: number;
  maxCount: number;
  category: "primary" | "secondary" | "entity";
};

export type ContentArchetypeId =
  | "how-to-tutorial"
  | "comparison-versus"
  | "listicle-roundup"
  | "news-update"
  | "conceptual-explainer"
  | "product-review"
  | "opinion-essay";

export type NicheDomainId =
  | "seo-marketing"
  | "software-dev"
  | "health-medical"
  | "finance-tax"
  | "legal-compliance"
  | "gardening-home"
  | "travel-local"
  | "ecommerce-product"
  | "entertainment-culture"
  | "general-business";

export type CanonicalBriefContract = {
  archetype: ContentArchetypeId;
  archetypeLabel: string;
  niche: NicheDomainId;
  nicheLabel: string;
  lengthMode: "auto" | "custom";
  targetWordsMin: number;
  targetWordsMax: number;
  recommendedTargetWords: number;
  lengthRationale: string;
  toneMode: "auto" | "custom";
  resolvedTone: string;
  toneRationale: string;
  requiredAssets: string[];
  requiredQualifiers: string[];
  prohibitedClaims: string[];
  editorialStrictness: "standard" | "high" | "strict" | "maximum";
  firstHandExperienceProvided: boolean;
};

export type InternalCapabilityRecord = {
  url: string;
  title: string;
  anchorText: string;
  pageType: "tool" | "guide" | "page";
  verifiedCapabilities: string[];
  supportedInputs: string[];
  nonCapabilities: string[];
  keywords: string;
};

export type ClaimVerificationEntry = {
  id: string;
  sectionHeading?: string;
  claimText: string;
  category:
    | "factual-rule"
    | "ui-workflow"
    | "tool-capability"
    | "citation"
    | "domain-qualifier"
    | "first-hand-claim";
  status: "verified" | "qualified" | "repaired" | "flagged";
  detail: string;
  sourceUrl?: string;
};

export type VerificationLogReport = {
  verifiedAt: string;
  status: "passed" | "repaired" | "needs-review";
  researchStatus: "live-verified" | "partial-web" | "brief-only" | "failed";
  draftStatus: "complete" | "partial" | "failed";
  verificationStatus: "passed" | "passed-with-repairs" | "needs-review" | "skipped";
  enrichmentStatus: "complete" | "partial" | "failed";
  fullTextCharsAudited: number;
  claimsChecked: ClaimVerificationEntry[];
  repairsApplied: string[];
  warnings: string[];
};

export type ResearchPacket = {
  analyzedIntent: string;
  searchIntent: "informational" | "commercial" | "transactional" | "navigational" | "mixed";
  primaryTopic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  lsiEntities: string[];
  questionsToAnswer: string[];
  competitorAngles: string[];
  eeatSignals: string[];
  conclusionDirective?: string;
  visualDirectives?: string[];
  internalLinks: ResearchLinkItem[];
  externalLinks: ResearchLinkItem[];
  quickAnswerTargetWords?: number;
  fetchedAt?: string;
  siteScanned?: string;
  warnings?: string[];
  researchMode?:
    | "live-google-grounding"
    | "live-serp-api"
    | "public-reference"
    | "brief-only";
  searchQueriesUsed?: string[];
  groundedSummary?: string;
  competitorBenchmarks?: ResearchCompetitorBenchmarks;
  semanticTerms?: SemanticTermTarget[];
  evidencePassages?: Array<{
    claimOrFact: string;
    sourceTitle: string;
    sourceUrl: string;
  }>;
  brandVoice?: BrandVoiceProfile;
  briefContract?: CanonicalBriefContract;
  capabilityLinks?: InternalCapabilityRecord[];
};

export type FeaturedBannerState = {
  headline: string;
  subheadline: string;
  badge?: string;
  theme?: string;
  altText: string;
  altScore?: number;
  altVerdict?: string;
  aspectRatio: "16:9";
  width: 1200;
  height: 630;
  sourceRevision?: string;
};

export type BriefDirectives = {
  websiteUrl: string;
  conclusionStyle: string;
  visualHints: string[];
  faqRequested: boolean;
  toneOverride?: string;
};

export type WriterRun = {
  status: "idle" | "planning" | "drafting" | "paused" | "failed" | "done";
  inputHash: string;
  completed: string[];
  current?: string;
  error?: string;
  provider?: string;
  stage?: PipelineStageId;
  stageLabel?: string;
  stages?: PipelineStageRecord[];
};

export type SocialOverride = {
  caption?: string;
  headline?: string;
  body?: string;
  variant?: string;
  theme?: string;
  sourceRevision?: string;
};

export type ComprehensionQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export interface WriterWorkspaceState {
  version: 1;
  studioUnlocked?: boolean;
  document?: RichNode;
  trackedTerms?: string[];
  references: Reference[];
  targetWords: number;
  lengthMode?: "auto" | "custom";
  toneMode?: "auto" | "custom";
  language: string;
  metaDescriptions: string[];
  serpTitles?: string[];
  quickAnswerBox?: string;
  run: WriterRun;
  brand: { name: string; color: string; logo?: string };
  social: Record<string, SocialOverride>;
  socialCarousels?: Record<string, { slides: Array<{ headline: string; body: string; tag?: string }> }>;
  videoScripts?: { youtubeLong?: string; shortForm?: string; thumbnailHeadline?: string };
  featuredBanner?: FeaturedBannerState;
  sectionAltTexts?: Record<string, { altText: string; score?: number; verdict?: string }>;
  research?: ResearchPacket;
  brandVoiceOverride?: Partial<BrandVoiceProfile>;
  verificationLog?: VerificationLogReport;
  customImages?: Record<
    string,
    { id: string; src: string; alt: string; caption?: string }
  >;
  sectionVisualOverrides?: Record<
    string,
    { dataUrl: string; altText: string; caption?: string }
  >;
  visualRevisions?: Record<string, string>;
  email?: { subject: string; body: string; sourceRevision: string };
  quizQuestions?: ComprehensionQuizQuestion[];
}
declare module "@/lib/blog-writer/canonical-state" {
  interface CanonicalBlogProjectState {
    writerWorkspace?: WriterWorkspaceState;
  }
}
export type Project = CanonicalBlogProjectState;
export type OutlineItem = {
  id?: string;
  heading: string;
  subheadings: string[];
  words?: number;
};
export type Plan = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  introduction: string;
  titles: string[];
  descriptions: string[];
  sections: OutlineItem[];
};
