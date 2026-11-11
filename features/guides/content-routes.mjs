const EXCLUDED_FROM_TOOLS_SITEMAP = new Set([
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

export function articlePath(article) {
  const category = article?.category || "ai-seo";
  const slug = article?.slug?.current || article?.slug || "";
  return `/${category}/${slug}`;
}

export function toolSitemapEntries(registry, origin) {
  const tools = Array.isArray(registry?.tools) ? registry.tools : [];
  const categories = Array.isArray(registry?.categories) ? registry.categories : [];
  const available = tools.filter(
    (tool) =>
      tool &&
      tool.status === "live" &&
      !EXCLUDED_FROM_TOOLS_SITEMAP.has(tool.slug)
  );
  const paths = [
    "/ai-content-writer",
    "/tools",
    "/tools/categories",
    ...categories
      .filter(
        (category) =>
          category &&
          available.some(
            (tool) =>
              Array.isArray(tool.categories) &&
              tool.categories.includes(category.slug)
          )
      )
      .map((category) => `/tools/categories/${category.slug}`),
    ...available.map((tool) => `/tools/${tool.slug}`),
  ];
  return paths.map((path) => ({ url: `${origin}${path}` }));
}

export function contentSitemapEntries(articles, guides, origin) {
  const articleUrls = (articles || []).map((a) => ({
    url: `${origin}${articlePath(a)}`,
  }));
  const guideUrls = (guides || []).map((g) => ({
    url: `${origin}/guides/${g.slug}`,
  }));
  return [...articleUrls, ...guideUrls];
}
