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
  references: Reference[];
  targetWords: number;
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
