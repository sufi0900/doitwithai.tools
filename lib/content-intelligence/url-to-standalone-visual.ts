/**
 * Universal URL-to-Standalone-Visual Intelligence Contract
 *
 * Shared 6-layer rulebook and deterministic helper exports for every URL-to-social,
 * infographic, carousel, and visual extraction tool across doitwithai.tools.
 */

export {
  classifySectionArchetype,
  isFaqHeadingOrSection,
  rewriteDependentSectionTitle,
  type RecommendedPrismLayout,
  type SectionArchetype,
  type SectionIntelligenceBlockLike,
  type SectionIntelligenceInput,
  type SectionIntelligenceResult,
} from "../blog-infographic-studio/skills/topic-intelligence";

export {
  TRAILING_CLIFFHANGER_WORDS,
  decontextualizeProse,
  hasTitleBodyDuplication,
  hasTrailingCliffhanger,
  scoreHeadlineHighlightPhrases,
  stripTrailingCliffhangers,
  synthesizeStandaloneTitleAndDetail,
  toHeadlineCase,
} from "../blog-infographic-studio/skills/standalone-copywriter";

export {
  INFOGRAPHIC_TOPIC_ICONS,
  SEMANTIC_ICON_PATHS,
  assignDistinctSectionIcons,
  isInfographicTopicIcon,
  scoreSemanticIconCandidates,
  type InfographicTopicIcon,
  type SemanticIconNodeLike,
} from "../blog-infographic-studio/skills/semantic-iconography";

export { runInfographicQaCritic } from "../blog-infographic-studio/skills/visual-qa-critic";

export const UNIVERSAL_URL_TO_VISUAL_RULES = {
  version: "2.0.0",
  layers: [
    "Layer 1: Topic Intelligence & Archetype Routing (FAQ, Process, Comparison, Checklist, Data Metrics, Framework)",
    "Layer 2: Standalone Infographic Copywriting (Concept Kernels, Anti-Duplication, De-Contextualization, Dangling Word Removal)",
    "Layer 3: High-Variety 48-Icon Semantic Vector Registry & Sibling Icon Deduplication",
    "Layer 4: Adaptive Geometry & Typography Fit Solver",
    "Layer 5: Proportional Vertical Slack Distribution & Optical Centering",
    "Layer 6: Automated Pre-Render Visual & Copy QA Critic",
  ],
} as const;
