// sitemap.js - FIXED VERSION
import { fetchBlogCategorySlugs, fetchURLs } from "../app/lib/sanity";
import registry from "../features/tool-catalog/registry.json";

const baseURL = "https://doitwithai.tools";
const liveTools = registry.tools.filter(tool => tool.status === "live");
const retiredToolURLs = new Set(liveTools.map(tool => `${baseURL}${tool.legacyPath}`));
const toolEntries = ["/tools", "/tools/categories", ...registry.categories.map(category => `/tools/categories/${category.slug}`), ...liveTools.map(tool => `/tools/${tool.slug}`)].map(path => ({ url: `${baseURL}${path}`, changeFrequency: "monthly", priority: 0.8 }));

// Define the correct URL mapping for your schema types
const SCHEMA_TYPE_TO_URL_PREFIX = {
  makemoney: "ai-learn-earn",
  aitool: "ai-tools",
  coding: "ai-code",
  seo: "ai-seo",
  blogPost: "blogs",
  freeResources: "free-ai-resources",
};

export default async function sitemap() {
  try {
    // Fetch all posts from Sanity.io
    const [posts, blogCategories] = await Promise.all([
      fetchURLs(),
      fetchBlogCategorySlugs(),
    ]);

    // Map the fetched posts to the sitemap format with correct URL prefixes
    const sitemapEntries = posts.map((post) => {
      const urlPrefix = SCHEMA_TYPE_TO_URL_PREFIX[post._type] || post._type;

      return {
        url: `${baseURL}/${urlPrefix}/${post.slug}`,
        lastModified: new Date(post._updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    const blogCategoryEntries = blogCategories.map((category) => ({
      url: `${baseURL}/blogs/category/${category.slug}`,
      lastModified: new Date(category._updatedAt || Date.now()),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    // Add all your static routes (THIS WAS MISSING!)
    const staticRoutes = [
      // Homepage
      {
        url: baseURL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      // Main category pages
      {
        url: `${baseURL}/ai-tools`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseURL}/ai-seo`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseURL}/ai-seo-tools`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseURL}/ai-seo/meta-title-generator`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseURL}/ai-seo/slug-url-generator`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseURL}/ai-seo/schema-markup-generator`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseURL}/ai-code`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseURL}/ai-learn-earn`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseURL}/free-ai-resources`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseURL}/blogs`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      // Other important pages
      {
        url: `${baseURL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseURL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseURL}/blogs`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      // Newly added static pages
      {
        url: `${baseURL}/navigation`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseURL}/author/sufian-mustafa`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseURL}/faq`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseURL}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];

    // Combine dynamic and static entries
    const allEntries = [...sitemapEntries, ...blogCategoryEntries, ...staticRoutes, ...toolEntries].filter(entry => !retiredToolURLs.has(entry.url));

    // Remove duplicates and sort by priority
    const uniqueEntries = allEntries.filter(
      (entry, index, self) =>
        index === self.findIndex((e) => e.url === entry.url),
    );

    return uniqueEntries.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return at least static routes if dynamic fetch fails
    return [
      ...toolEntries,
      {
        url: baseURL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
