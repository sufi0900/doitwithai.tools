// React_Query_Caching/cacheKeys.js

export const CACHE_KEYS = {
  // Homepage Keys
  HOMEPAGE: {
    TRENDING_BIG: 'homepage_trending_big',
    TRENDING_RELATED: 'homepage_trending_related',
    FEATURE_BIG: 'homepage_feature_big',
    FEATURE_RELATED: 'homepage_feature_related',
    RECENT_POSTS: 'homepage_recent_posts',
    AI_SEO: 'homepage_ai_seo',
    SEO_TREND_BIG: 'homepage_seo_trend_big',
    SEO_TREND_RELATED: 'homepage_seo_trend_related',
    MIXED_AI_TOOLS: 'homepage_mixed_ai_tools',
    MIXED_AI_CODE: 'homepage_mixed_ai_code',
    MIXED_AI_EARN: 'homepage_mixed_ai_earn',
    FEATURED_RESOURCES_HORIZONTAL: 'homepage_featured_resources_horizontal',
  },

  // Page Specific Keys
  PAGE: {
    FEATURE_POST: (pageType) => `page_${pageType}_feature_post`,
    // Specific for single-documentType blog pages (e.g., ai-tools, ai-learn-earn)
    ALL_BLOGS_TOTAL: (documentType) => `page_${documentType}_all_blogs_total`,
    ALL_BLOGS_PAGINATED: (documentType, pageNum) => `page_${documentType}_all_blogs_page_${pageNum}`,

    // Keys specifically for the mixed blogs page (all-posts)
    MIXED_BLOGS_TOTAL_COUNT: (category, sortBy) => `page_mixed_blogs_total_cat_${category}_sort_${sortBy}`,
    MIXED_BLOGS_PAGINATED: (page, category, sortBy) => `page_mixed_blogs_p${page}_cat_${category}_sort_${sortBy}`,
  BLOG_LISTING_INITIAL: (schemaType) => `page:${schemaType}:listing:initial`,

    // Consolidated and canonical definition for search results
    SEARCH_RESULTS: (documentTypeOrScope, searchHash) => `page_${documentTypeOrScope}_search_${searchHash}`,

    SEO_SUBCATEGORIES_TOTAL: 'page_seo_subcategories_total',
    SEO_SUBCATEGORIES_PAGINATED: (pageNum) => `page_seo_subcategories_page_${pageNum}`,

    // Free Resources related keys
    LIST_FREERESOURCES: (page, format, sortBy, typeIdentifier = 'none') => {
      const searchHash = typeIdentifier ? btoa(typeIdentifier).slice(0, 50).replace(/=/g, '') : 'none';
      return `page_freeresources_list_p${page}_f${format}_s${sortBy}_q${searchHash}`;
    },
    TOTAL_FREERESOURCES_ITEMS: (format, typeIdentifier = 'none') => {
      const searchHash = typeIdentifier ? btoa(typeIdentifier).slice(0, 50).replace(/=/g, '') : 'none';
      return `page_freeresources_total_f${format}_q${searchHash}`;
    },

    // Key for all documents fetched for client-side offline search (CRITICAL FOR OFFLINE SEARCH)
    ALL_DOCS_FOR_OFFLINE_SEARCH: (typeIdentifier) => `page_all_docs_offline_${typeIdentifier}`,
  },

  // Article Keys
  ARTICLE: {
        CONTENT: (slug, type) => `article_content_${type}_${slug}`, // Key for the main article content
    RELATED_POSTS: (articleId, articleType) => `article_related_posts_${articleType}_${articleId}`, // Key for related posts
    RELATED_RESOURCES: (articleId) => `article_related_resources_${articleId}`, // Key for related resources
   
  },

  // Global Keys (for data that might be truly global and less frequently updated)
  GLOBAL: {
    ALL_POSTS: (page, category, sort) => `global_all_posts_${page}_${category}_${sort}`,
    // MIXED_BLOGS: (page, category, sort) => `global_mixed_blogs_${page}_${category}_${sort}`
  },

  // Schema-specific Keys (for very granular control, or if a schema has unique caching requirements)
  SCHEMA: {
    AI_TOOLS: { LIST: (page) => `aitool_list_${page}`, FEATURE: 'aitool_feature', TRENDING: 'aitool_trending' },
    CODING: { LIST: (page) => `coding_list_${page}`, FEATURE: 'coding_feature', TRENDING: 'coding_trending' },
    MAKE_MONEY: { LIST: (page) => `makemoney_list_${page}`, FEATURE: 'makemoney_feature', TRENDING: 'makemoney_trending' },
    SEO: { LIST: (page) => `seo_list_${page}`, FEATURE: 'seo_feature', TRENDING: 'seo_trending' },
    FREE_RESOURCES: {
      LIST: (page) => `freeresources_list_${page}`,
      RELATED: (articleId) => `freeresources_related_${articleId}`
    }
  }
};

export const CACHE_CONFIG = {
  // Default fallback configuration
  DEFAULT: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true
  },

  // Homepage specific configurations
  HOMEPAGE: {
    staleTime: 5 * 60 * 1000, // 3 minutes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },

  // Page-level specific configurations (for FEATURE_POST, etc.)
  PAGE_FEATURE_POST: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },
  // Config for single-documentType ALL_BLOGS_TOTAL
  PAGE_ALL_BLOGS_TOTAL: {
    staleTime: 5 * 60 * 1000, // 2 minutes for total count
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },
  // Config for single-documentType ALL_BLOGS_PAGINATED
  PAGE_ALL_BLOGS_PAGINATED: {
    staleTime: 5 * 60 * 1000, // 1 minute
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },

  // Config for mixed blogs total count
  PAGE_MIXED_BLOGS_TOTAL_COUNT: {
    staleTime: 5 * 60 * 1000, // 2 minutes for total count of mixed blogs
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },
  // Config for mixed blogs paginated data
  PAGE_MIXED_BLOGS_PAGINATED: {
    staleTime: 5 * 60 * 1000, // 1 minute for paginated mixed blogs
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },

  // Canonical specific config for search results (used by useCachedSearch)
  PAGE_SEARCH_RESULTS: {
    staleTime: 5 * 60 * 1000, // Search results can be stale quickly
    maxAge: 7 * 24 * 60 * 60 * 1000, // But keep them for 7 days offline
    enableOffline: true,
  },
  SEO_SUBCATEGORIES: {
    staleTime: 2 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },

  PAGE_FREERESOURCES_FEATURED: { staleTime: 10 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true, },
  PAGE_FREERESOURCES_COUNTS: { staleTime: 10 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true, },
  PAGE_FREERESOURCES_LIST: { staleTime: 10 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true, },
  PAGE_FREERESOURCES_TOTAL_ITEMS: { staleTime: 2 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true, },

  ARTICLE_CONTENT: { staleTime:  30 * 60 * 1000,  maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true },
  RELATED_CONTENT: { staleTime: 30 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true },

  PAGINATION: { staleTime: 2 * 60 * 1000, maxAge: 7 * 24 * 60 * 60 * 1000, enableOffline: true },

  // Config for all docs fetched for client-side offline search (base data)
  PAGE_ALL_DOCS_FOR_OFFLINE_SEARCH_CONFIG: {
    staleTime: 60 * 60 * 1000, // 1 hour
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOffline: true,
  },
};

// Helper function to get config for a cache key
export const getCacheConfig = (cacheKey) => {
  if (typeof cacheKey !== 'string' || !cacheKey) {
    return CACHE_CONFIG.DEFAULT;
  }

  // Always check most specific keys first
  if (cacheKey.startsWith('page_') && cacheKey.includes('_search_')) {
    return CACHE_CONFIG.PAGE_SEARCH_RESULTS;
  }

  // All Docs For Offline Search key
  if (cacheKey.startsWith('page_all_docs_offline_')) {
    return CACHE_CONFIG.PAGE_ALL_DOCS_FOR_OFFLINE_SEARCH_CONFIG;
  }

  // Free Resources related keys
  if (cacheKey === CACHE_KEYS.PAGE.FREERESOURCES_FEATURED) { return CACHE_CONFIG.PAGE_FREERESOURCES_FEATURED; }
  if (cacheKey === CACHE_KEYS.PAGE.FREERESOURCES_COUNTS) { return CACHE_CONFIG.PAGE_FREERESOURCES_COUNTS; }
  if (cacheKey.startsWith('page_freeresources_list_')) { return CACHE_CONFIG.PAGE_FREERESOURCES_LIST; }
  if (cacheKey.startsWith('page_freeresources_total_')) { return CACHE_CONFIG.PAGE_FREERESOURCES_TOTAL_ITEMS; }

  // Blog/Pagination related keys (including mixed blogs)
  if (cacheKey.startsWith('page_mixed_blogs_total_cat_')) { return CACHE_CONFIG.PAGE_MIXED_BLOGS_TOTAL_COUNT; }
  if (cacheKey.startsWith('page_mixed_blogs_p')) { return CACHE_CONFIG.PAGE_MIXED_BLOGS_PAGINATED; }

  if (cacheKey.includes('_all_blogs_total') && cacheKey.startsWith('page_')) {
    return CACHE_CONFIG.PAGE_ALL_BLOGS_TOTAL;
  }
  if (cacheKey.includes('_all_blogs_page_') && cacheKey.startsWith('page_')) {
    return CACHE_CONFIG.PAGE_ALL_BLOGS_PAGINATED;
  }

  // Other page-specific feature posts
  if (cacheKey.includes('_feature_post') && cacheKey.startsWith('page_')) { return CACHE_CONFIG.PAGE_FEATURE_POST; }

  // Homepage
  if (cacheKey.startsWith('homepage_')) { return CACHE_CONFIG.HOMEPAGE; }

  // Article & Related Content
  if (cacheKey.startsWith('article_') && !cacheKey.includes('related')) { return CACHE_CONFIG.ARTICLE_CONTENT; }
  if (cacheKey.includes('related_posts_') || cacheKey.includes('related_resources_')) { return CACHE_CONFIG.RELATED_CONTENT; }

  // SEO Subcategories
  if (cacheKey.startsWith('page_seo_subcategories_')) {
    return CACHE_CONFIG.SEO_SUBCATEGORIES;
  }
// --- NEW ARTICLE CACHE KEY CHECKS ---
  if (cacheKey.startsWith('article_content_')) {
    return CACHE_CONFIG.ARTICLE_CONTENT;
  }
  if (cacheKey.startsWith('article_related_posts_')) {
    return CACHE_CONFIG.ARTICLE_RELATED_POSTS;
  }
  if (cacheKey.startsWith('article_related_resources_')) {
    return CACHE_CONFIG.ARTICLE_RELATED_RESOURCES;
  }
  // --- END NEW ARTICLE CACHE KEY CHECKS --
  // Fallback to PAGINATION if it's a general list key not covered above
  if (cacheKey.includes('_list_') || cacheKey.includes('_blogs_')) { return CACHE_CONFIG.PAGINATION; }

  // If no specific match, return default
  return CACHE_CONFIG.DEFAULT;
};


// Invalidation patterns
export const INVALIDATION_PATTERNS = {
  HOMEPAGE_ALL: 'homepage_.*',
  SCHEMA_ALL: (schemaType) => `.*_${schemaType}_.*`,
  PAGINATION: (schemaType) => `page_${schemaType}_all_blogs_.*`,
  ARTICLE_ALL: (slug, type) => `(article_content_${type}_${slug}|article_related_posts_${type}_.*|article_related_resources_.*)`, // Matches content and related items
  FREERESOURCES_ALL: 'page_freeresources_.*',
  MIXED_BLOGS_ALL: 'page_mixed_blogs_.*',
  SEARCH_ALL: 'page_.*_search_.*',
  
  ALL_DOCS_FOR_OFFLINE_SEARCH_ALL: 'page_all_docs_offline_.*',
    ARTICLE_FULL_REFRESH: (slug, id, type) => `(article_content_${type}_${slug}|article_related_posts_${type}_${id}|article_related_resources_${id})`

};