import { tools as CATALOG_TOOLS, type CatalogTool } from "@/features/tool-catalog/catalog";

const CATALOG_TOOL_MAP = new Map<string, CatalogTool>(
  CATALOG_TOOLS.map((tool) => [tool.slug, tool]),
);

const SLUG_ALIASES: Record<string, string> = {
  "ai-faq-snippet-generator": "ai-faq-generator",
  "faq-generator": "ai-faq-generator",
  "meta-title-description-generator": "meta-title-generator",
  "onpage-ai-seo-analyzer": "on-page-ai-seo-analyzer",
  "json-ld-schema-generator": "schema-markup-generator",
};

const SEEDED_TEMPLATE_PROJECT_IDS = new Set<string>([
  "tool-meta-title-description-generator",
  "flagship-tool-1-meta-generator",
  "flagship-tool-2-onpage-analyzer",
  "flagship-tool-3-schema-generator",
  "flagship-tool-4-keyword-clustering",
  "flagship-tool-5-readability-checker",
  "flagship-tool-6-faq-generator",
]);

const SEEDED_PROJECT_TITLES = new Set<string>([
  "AI Meta Title & Description Generator",
  "On-Page AI SEO Analyzer & Repair Agent",
  "JSON-LD Schema Markup & @graph Generator",
  "Keyword Clustering & Search Intent Mapper",
  "Readability, Sentence Clarity & E-E-A-T Scorer",
  "AI FAQ & Answer Engine Snippet Generator",
]);

const SEEDED_PROJECT_SUMMARY_PREFIXES = [
  "Generate click-magnet Google meta titles",
  "Craft pixel-verified Google meta titles",
  "Run a 28-point technical and semantic on-page SEO audit",
  "Build connected Schema.org JSON-LD @graph blocks",
  "Group raw keyword lists into hub-and-spoke topic clusters",
  "Audit Flesch-Kincaid grade level",
  "Generate 48-word Position-Zero direct answer blocks",
];

const SEEDED_PROJECT_TECH_SIGNATURES = new Set<string>([
  "600px SERP Validator|Meta Title AI|Meta Description AI|CTR Hook Scorer|OpenGraph Tags|AEO Snippets",
  "Meta Title AI|600px SERP Check|CTR Scoring|OpenGraph",
  "On-Page Audit|H1-H6 Hierarchy|Entity Gap|AEO Passages",
  "JSON-LD @graph|FAQPage Schema|SoftwareApplication|Rich Results",
  "Topic Clusters|Intent Mapping|Hub & Spoke|Zero Cannibalization",
  "Grade 7-9 Clarity|<25w Sentences|Active Voice|E-E-A-T Signals",
  "AEO Snippets|FAQPage Schema|Position Zero|PAA Generator",
]);

export function resolveCatalogToolSlug(
  tool: { caseStudySlug?: string; link?: string; id?: string } | undefined,
): string | null {
  if (!tool) return null;

  const candidates: string[] = [];
  if (tool.caseStudySlug) {
    const clean = tool.caseStudySlug.trim().toLowerCase();
    candidates.push(clean);
    candidates.push(clean.replace(/-\d+$/, ""));
  }
  if (tool.link) {
    const match = tool.link.match(/\/tools\/([a-z0-9-]+)/i);
    if (match?.[1]) {
      const linkSlug = match[1].trim().toLowerCase();
      candidates.push(linkSlug);
      candidates.push(linkSlug.replace(/-\d+$/, ""));
    }
  }

  for (const raw of candidates) {
    if (!raw) continue;
    const mapped = SLUG_ALIASES[raw] ?? raw;
    if (CATALOG_TOOL_MAP.has(mapped)) return mapped;
  }

  return null;
}

export function getCatalogToolBySlug(slug: string | null | undefined): CatalogTool | undefined {
  if (!slug) return undefined;
  return CATALOG_TOOL_MAP.get(slug);
}

/**
 * Determines whether a field still matches an unmodified template seed or catalog-installer default,
 * so fresh transferred landing pages preserve the original main-website hero copy "as-is" until
 * the user edits that field in the Tool Landing Page Studio.
 */
export function shouldApplyHeroOverride(
  tool: {
    id?: string;
    title?: string;
    summary?: string;
    role?: string;
    period?: string;
    technologies?: string[];
  },
  catalogTool: CatalogTool | undefined,
): {
  title: boolean;
  summary: boolean;
  role: boolean;
  period: boolean;
  technologies: boolean;
} {
  const titleVal = (tool.title ?? "").trim();
  const summaryVal = (tool.summary ?? "").trim();
  const roleVal = (tool.role ?? "").trim();
  const periodVal = (tool.period ?? "").trim();
  const techKey = (tool.technologies ?? []).join("|");

  const isSeededTitle =
    SEEDED_PROJECT_TITLES.has(titleVal) ||
    (catalogTool ? titleVal === catalogTool.name.trim() || titleVal === catalogTool.name.trim().slice(0, 100) : false);

  const isSeededSummary =
    SEEDED_PROJECT_SUMMARY_PREFIXES.some((prefix) => summaryVal.startsWith(prefix)) ||
    (catalogTool
      ? summaryVal === catalogTool.description.trim() ||
        summaryVal === catalogTool.description.trim().slice(0, 500)
      : false);

  const isDefaultRole =
    !roleVal ||
    /^Tool\s+\d+\s*·/i.test(roleVal) ||
    /^(Flagship Standalone AI SEO Tool|Interactive AI Web Utility|Interactive Website AI Tool|Live Tool)$/i.test(roleVal) ||
    (catalogTool ? roleVal === catalogTool.kind.trim().slice(0, 100) : false);

  const isDefaultPeriod =
    !periodVal ||
    /^(Live Utility\s*·|Live on Your Website|Live on DoItWithAI|v\d+\.\d+\s+Live|Live Tool)/i.test(periodVal);

  const catalogAutoBadges = catalogTool
    ? Array.from(
        new Set([
          ...(catalogTool.categories || []),
          ...(catalogTool.topics || []),
          ...(catalogTool.tags || []).slice(0, 4),
        ]),
      )
        .map((item) => item.trim().slice(0, 32))
        .filter(Boolean)
        .slice(0, 6)
        .join("|")
    : "";

  const isDefaultTechnologies =
    SEEDED_PROJECT_TECH_SIGNATURES.has(techKey) ||
    (catalogAutoBadges.length > 0 && techKey === catalogAutoBadges) ||
    (tool.id ? SEEDED_TEMPLATE_PROJECT_IDS.has(tool.id) && SEEDED_PROJECT_TECH_SIGNATURES.has(techKey) : false);

  return {
    title: Boolean(titleVal) && !isSeededTitle,
    summary: Boolean(summaryVal) && !isSeededSummary,
    role: !isDefaultRole,
    period: !isDefaultPeriod,
    technologies: (tool.technologies?.length ?? 0) > 0 && !isDefaultTechnologies,
  };
}
