import registry from "./registry.json";

/**
 * Slugs excluded from the `/tools` catalog to prevent keyword cannibalization:
 *  1. Full-article / blog / content writer slugs (`ai-content-writer`, `ai-blog-writer`,
 *     `ai-article-writer`, `ai-blog-article-writer`) now live at the standalone root-level
 *     flagship platform route `/ai-content-writer` (outside `/tools`).
 *  2. Legacy `blog-to-infographic-generator` is consolidated into the 25-template
 *     `blog-section-infographic-generator`.
 *  3. Dedicated `/agents/*` routes live under `/agents/<slug>` rather than duplicating under `/tools/<slug>`.
 *
 * — Signed by: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)
 */
export const EXCLUDED_FROM_TOOLS_CATALOG_SLUGS = new Set<string>([
  "ai-content-writer",
  "ai-blog-writer",
  "ai-article-writer",
  "ai-blog-article-writer",
  "blog-to-infographic-generator",
  "seo-optimizer-ai-agent",
  "ai-support-agent-builder",
  "client-intake-lead-agent",
  "ai-marketing-campaign-agent",
  "whatsapp-instagram-ai-agent-studio",
  "no-code-workflow-agent-planner",
  "on-page-ai-seo-repair-agent",
  "ai-citation-geo-agent",
  "serp-content-gap-agent",
  "omnichannel-marketing-agent",
]);

export const categories = registry.categories;
export const tools = registry.tools.filter(
  (tool) =>
    tool.status === "live" && !EXCLUDED_FROM_TOOLS_CATALOG_SLUGS.has(tool.slug)
);
export type CatalogTool = (typeof tools)[number];
export const toolPath = (slug: string) =>
  slug === "ai-content-writer" ||
  slug === "ai-blog-writer" ||
  slug === "ai-article-writer" ||
  slug === "ai-blog-article-writer"
    ? "/ai-content-writer"
    : `/tools/${slug}`;
export const categoryPath = (slug: string) => `/tools/categories/${slug}`;
export const siteOrigin = "https://doitwithai.tools";
export const featuredTools = tools.filter((tool) => tool.featuredOrder != null);

export function collectionSchema(
  name: string,
  path: string,
  items: CatalogTool[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteOrigin}${path}#collection`,
    name,
    url: `${siteOrigin}${path}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", path: "" },
        { name: "Tools", path: "/tools" },
        ...(path.startsWith("/tools/categories")
          ? [{ name: "Categories", path: "/tools/categories" }]
          : []),
        ...(path.startsWith("/tools/categories/") ? [{ name, path }] : []),
      ].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteOrigin}${item.path}`,
      })),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${siteOrigin}${toolPath(tool.slug)}`,
      })),
    },
  };
}
