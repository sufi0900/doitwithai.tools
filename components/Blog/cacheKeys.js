export const CACHE_KEYS = {
  TRENDING_BIG: 'trending-big',
  TRENDING_RELATED: 'trending-related',
  FEATURE_BIG: 'feature-big',
  FEATURE_RELATED: 'feature-related',

  // Category-specific
  SEO_TREND_BIG: 'seo-trend-big',
  SEO_TREND_RELATED: 'seo-trend-related',
  AITOOL_ALL: 'aitool-all',
  CODING_ALL: 'coding-all',
  MAKEMONEY_ALL: 'makemoney-all',

  // Mixed categories
  MIXED_CATEGORIES_AI_TOOLS: 'mixed-categories-ai-tools',
  MIXED_CATEGORIES_AI_CODE: 'mixed-categories-ai-code',
  MIXED_CATEGORIES_AI_EARN: 'mixed-categories-ai-earn',

  // New key for Featured Resources Horizontal
  FEATURED_RESOURCES_HORIZONTAL: 'featured-resources-horizontal',

  // New key for Recent Posts
  RECENT_POSTS: 'recent-posts',

  // Page-specific cache keys (generic)
  PAGE_FEATURE_POST: (pageType) => `${pageType}-page-feature`,
  PAGE_ALL_BLOGS: (pageType) => `${pageType}-page-all`,
// Add this to your existing CACHE_KEYS object in cacheKeys.js
SEO_SUBCATEGORIES: 'seo-subcategories',
SEO_SUBCATEGORY_POSTS: (subcategorySlug) => `seo-subcategory-${subcategorySlug}`,
// Add these to your existing CACHE_KEYS object
ALL_BLOGS_MIXED: 'all-blogs-mixed',
ALL_BLOGS_MIXED_CATEGORY: (category) => `all-blogs-mixed-${category}`,
ALL_BLOGS_MIXED_SEARCH: 'all-blogs-mixed-search',


// Add these to your existing CACHE_KEYS object
ARTICLE_SINGLE: (type, slug) => `${type}-article-${slug}`,
ARTICLE_RELATED_POSTS: (type, slug) => `${type}-related-posts-${slug}`,
ARTICLE_RELATED_RESOURCES: (type, slug) => `${type}-related-resources-${slug}`,

ARTICLES_GROUP: (type) => `${type}-articles-group`,
RELATED_RESOURCES_GLOBAL: 'related-resources-global'

};