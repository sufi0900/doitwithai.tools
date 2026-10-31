export const LEGACY_BLOG_CATEGORIES = {
  "ai-tools": { key: "aitool", title: "AI Tools", description: "Reviews, tutorials, and practical workflows for using AI tools." },
  "ai-seo": { key: "seo", title: "AI SEO", description: "Modern SEO, GEO, AEO, and AI-assisted content optimization guides." },
  "ai-code": { key: "coding", title: "AI Code", description: "AI-assisted coding, web development, and technical implementation guides." },
  "ai-learn-earn": { key: "makemoney", title: "AI Learn & Earn", description: "Practical guides for learning AI skills and creating sustainable digital opportunities." },
};

export const LEGACY_KEY_TO_SLUG = Object.fromEntries(
  Object.entries(LEGACY_BLOG_CATEGORIES).map(([slug, category]) => [category.key, slug]),
);

export function getBlogCategoryHref(categoryKey) {
  if (categoryKey === "all") return "/blogs";
  if (categoryKey.startsWith("blogCategory:")) {
    return `/blogs/category/${categoryKey.slice("blogCategory:".length)}`;
  }
  const slug = LEGACY_KEY_TO_SLUG[categoryKey];
  // Preserve the four established section URLs and their existing authority.
  // New Sanity-managed categories use /blogs/category/[slug].
  return slug ? `/${slug}` : "/blogs";
}
