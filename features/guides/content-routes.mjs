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
  const available = registry.tools.filter((tool) => tool.status === "live");
  const paths = ["/tools", "/tools/categories", ...registry.categories.filter((category) => available.some((tool) => tool.categories.includes(category.slug))).map((category) => `/tools/categories/${category.slug}`), ...available.map((tool) => `/tools/${tool.slug}`)];
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
