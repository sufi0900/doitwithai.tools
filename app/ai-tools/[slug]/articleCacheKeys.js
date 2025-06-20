// app/article-cache/articleCacheKeys.js
export const ARTICLE_CACHE_KEYS = {
  // Main article content
  ARTICLE_CONTENT: (type, slug) => `article_${type}_${slug}`,
  ARTICLE_METADATA: (type, slug) => `article_meta_${type}_${slug}`,
  
  // Article components data
  RELATED_POSTS: (type, slug) => `related_posts_${type}_${slug}`,
  RELATED_RESOURCES: (type, slug) => `related_resources_${type}_${slug}`,
  ARTICLE_COMMENTS: (type, slug) => `comments_${type}_${slug}`,
  TABLE_OF_CONTENTS: (type, slug) => `toc_${type}_${slug}`,
  
  // Article engagement data
  ARTICLE_VIEWS: (type, slug) => `views_${type}_${slug}`,
  ARTICLE_REACTIONS: (type, slug) => `reactions_${type}_${slug}`,
  ARTICLE_SHARES: (type, slug) => `shares_${type}_${slug}`,
  
  // Pagination for article components
  RELATED_POSTS_PAGE: (type, slug, page) => `related_posts_${type}_${slug}_page_${page}`,
  COMMENTS_PAGE: (type, slug, page) => `comments_${type}_${slug}_page_${page}`,
  
  // Article-specific resource data
  SIMILAR_ARTICLES: (type, slug) => `similar_${type}_${slug}`,
  CATEGORY_RELATED: (type, slug, category) => `category_${category}_${type}_${slug}`,
  
  // Cross-references
  BACKLINKS: (type, slug) => `backlinks_${type}_${slug}`,
  EXTERNAL_REFERENCES: (type, slug) => `external_refs_${type}_${slug}`,
  
  // Article SEO data
  ARTICLE_SCHEMA: (type, slug) => `schema_${type}_${slug}`,
  SOCIAL_META: (type, slug) => `social_meta_${type}_${slug}`,
  
  // Article update tracking
  LAST_MODIFIED: (type, slug) => `last_modified_${type}_${slug}`,
  UPDATE_HISTORY: (type, slug) => `update_history_${type}_${slug}`,
  
  // Grouped cache keys for bulk operations
  ARTICLE_GROUP: (type, slug) => `article_group_${type}_${slug}`,
  ALL_ARTICLE_COMPONENTS: (type, slug) => `all_components_${type}_${slug}`,
  
  // Real-time update keys
  ARTICLE_UPDATE_TIMESTAMP: (type, slug) => `update_ts_${type}_${slug}`,
  GLOBAL_ARTICLE_UPDATE: 'global_article_update_timestamp',
  
  // Article page specific keys
  ARTICLE_PAGE_STATE: (type, slug) => `page_state_${type}_${slug}`,
  ARTICLE_USER_PREFERENCES: (type, slug) => `user_prefs_${type}_${slug}`,
};

// Cache key groups for bulk invalidation
export const ARTICLE_CACHE_GROUPS = {
  // All keys related to a specific article
  FULL_ARTICLE: (type, slug) => [
    ARTICLE_CACHE_KEYS.ARTICLE_CONTENT(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_METADATA(type, slug),
    ARTICLE_CACHE_KEYS.RELATED_POSTS(type, slug),
    ARTICLE_CACHE_KEYS.RELATED_RESOURCES(type, slug),
    ARTICLE_CACHE_KEYS.TABLE_OF_CONTENTS(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_SCHEMA(type, slug),
    ARTICLE_CACHE_KEYS.SOCIAL_META(type, slug),
  ],
  
  // Article content only (main data)
  CONTENT_ONLY: (type, slug) => [
    ARTICLE_CACHE_KEYS.ARTICLE_CONTENT(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_METADATA(type, slug),
    ARTICLE_CACHE_KEYS.TABLE_OF_CONTENTS(type, slug),
  ],
  
  // Related content (sidebar, recommendations)
  RELATED_CONTENT: (type, slug) => [
    ARTICLE_CACHE_KEYS.RELATED_POSTS(type, slug),
    ARTICLE_CACHE_KEYS.RELATED_RESOURCES(type, slug),
    ARTICLE_CACHE_KEYS.SIMILAR_ARTICLES(type, slug),
  ],
  
  // Engagement data
  ENGAGEMENT_DATA: (type, slug) => [
    ARTICLE_CACHE_KEYS.ARTICLE_VIEWS(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_REACTIONS(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_SHARES(type, slug),
    ARTICLE_CACHE_KEYS.ARTICLE_COMMENTS(type, slug),
  ],
  
  // SEO and metadata
  SEO_DATA: (type, slug) => [
    ARTICLE_CACHE_KEYS.ARTICLE_SCHEMA(type, slug),
    ARTICLE_CACHE_KEYS.SOCIAL_META(type, slug),
    ARTICLE_CACHE_KEYS.BACKLINKS(type, slug),
  ],
};

// Helper functions for cache key operations
export const ArticleCacheKeyHelpers = {
  // Extract type and slug from cache key
  parseArticleKey: (cacheKey) => {
    const matches = cacheKey.match(/^[\w_]+_(\w+)_(.+)$/);
    if (matches) {
      return { type: matches[1], slug: matches[2] };
    }
    return null;
  },
  
  // Get all cache keys for an article
  getAllKeysForArticle: (type, slug) => {
    return ARTICLE_CACHE_GROUPS.FULL_ARTICLE(type, slug);
  },
  
  // Check if a cache key belongs to an article
  isArticleKey: (cacheKey, type, slug) => {
    return cacheKey.includes(`_${type}_${slug}`);
  },
  
  // Generate cache key with timestamp
  withTimestamp: (baseKey) => {
    return `${baseKey}_${Date.now()}`;
  },
  
  // Get pagination cache keys for a base key
  getPaginationKeys: (baseKey, maxPages = 10) => {
    const keys = [];
    for (let i = 1; i <= maxPages; i++) {
      keys.push(`${baseKey}_page_${i}`);
    }
    return keys;
  },
};

// Cache expiry configurations
export const ARTICLE_CACHE_CONFIG = {
  // Different expiry times for different types of data
  EXPIRY_TIMES: {
    ARTICLE_CONTENT: 10 * 60 * 1000,    // 10 minutes
    RELATED_POSTS: 15 * 60 * 1000,      // 15 minutes  
    RELATED_RESOURCES: 20 * 60 * 1000,  // 20 minutes
    ENGAGEMENT_DATA: 5 * 60 * 1000,     // 5 minutes
    SEO_DATA: 60 * 60 * 1000,           // 1 hour
    USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Polling intervals for real-time updates
  POLLING_INTERVALS: {
    ARTICLE_UPDATES: 30 * 1000,         // 30 seconds
    ENGAGEMENT_UPDATES: 60 * 1000,      // 1 minute
    RELATED_CONTENT_UPDATES: 5 * 60 * 1000, // 5 minutes
  },
  
  // Cache size limits
  CACHE_LIMITS: {
    MAX_ARTICLES_CACHED: 50,
    MAX_CACHE_SIZE_MB: 10,
    CLEANUP_THRESHOLD: 0.8, // Cleanup when 80% full
  },
};