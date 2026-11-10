export const contentPrefixes = {
  makemoney: "ai-learn-earn", aitool: "ai-tools", coding: "ai-code",
  seo: "ai-seo", blogPost: "blogs", guide: "guides",
};

export function articlePath(article) {
  const prefix = contentPrefixes[article?._type];
  const slug = typeof article?.slug === "string" ? article.slug : article?.slug?.current;
  return prefix && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "") ? `/${prefix}/${slug}` : undefined;
}

export function toolSitemapEntries(registry, origin) {
  const tools = Array.isArray(registry?.tools) ? registry.tools : [];
  const categories = Array.isArray(registry?.categories) ? registry.categories : [];
  const available = tools.filter((tool) => tool && tool.status === "live");
  const paths = [
    "/tools",
    "/tools/categories",
    ...categories.filter((category) => category && available.some((tool) => Array.isArray(tool.categories) && tool.categories.includes(category.slug))).map((category) => `/tools/categories/${category.slug}`),
    ...available.map((tool) => `/tools/${tool.slug}`)
  ];
  return paths.map((path) => ({ url: `${origin}${path}` }));
}

export function contentSitemapEntries(posts, origin) {
  return posts.flatMap((post) => {
    const path = articlePath(post);
    if (!path) return [];
    const date = post._updatedAt && new Date(post._updatedAt);
    return [{ url: `${origin}${path}`, ...(date && !Number.isNaN(date.getTime()) ? { lastModified: date } : {}) }];
  });
}
