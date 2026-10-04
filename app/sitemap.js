import { fetchBlogCategorySlugs, fetchURLs } from "./lib/sanity";
import registry from "../features/tool-catalog/registry.json";
import { contentSitemapEntries, toolSitemapEntries } from "../features/guides/content-routes.mjs";

const baseURL = "https://doitwithai.tools";
const toolEntries = toolSitemapEntries(registry, baseURL);
const retiredToolURLs = new Set([
  ...registry.tools.filter((tool) => tool.legacyPath).map((tool) => `${baseURL}${tool.legacyPath}`),
  `${baseURL}/ai-seo-tools`,
]);
// Resource documents are downloads, not editorial detail pages.
const staticPaths = ["", "/ai-tools", "/ai-seo", "/ai-code", "/ai-learn-earn", "/free-ai-resources", "/blogs", "/about", "/contact", "/navigation", "/author/sufian-mustafa", "/faq", "/categories", "/privacy", "/terms-and-conditions", "/brand-assets"];

export default async function sitemap() {
  const [posts, blogCategories] = await Promise.all([fetchURLs(), fetchBlogCategorySlugs()]);
  const dynamicEntries = contentSitemapEntries(posts, baseURL);
  const guides = dynamicEntries.some((entry) => entry.url.startsWith(`${baseURL}/guides/`)) ? [{ url: `${baseURL}/guides` }] : [];
  const categoryEntries = blogCategories.map((category) => ({ url: `${baseURL}/blogs/category/${category.slug}`, ...(category._updatedAt ? { lastModified: new Date(category._updatedAt) } : {}) }));
  const entries = [...staticPaths.map((path) => ({ url: `${baseURL}${path}` })), ...toolEntries, ...guides, ...dynamicEntries, ...categoryEntries].filter((entry) => !retiredToolURLs.has(entry.url));
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
