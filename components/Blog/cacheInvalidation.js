import { cacheService } from './useCache';
import { CACHE_KEYS } from './cacheKeys';

export class CacheInvalidationService {
  // Helper method to clear all pagination cache keys
  static clearPaginationCache(baseKey, maxPages = 20) {
    for (let i = 1; i <= maxPages; i++) {
      const paginationKey = `${baseKey}-page-${i}`;
      cacheService.clear(paginationKey);
    }
    // Also clear the total count cache for this base key
    cacheService.clear(`${baseKey}-total-count`); // Added: Clear total count cache
    console.log(`Cleared pagination cache for: ${baseKey} (up to page ${maxPages})`);
  }

  // Helper method to set pagination group refresh timestamp
  static setPaginationRefreshTimestamp(groupName) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${groupName}_pagination_refresh`, Date.now().toString());
    }
  }

  static invalidateByDocumentType(documentType) {
    const invalidationMap = {
      'seo': [
        CACHE_KEYS.SEO_TREND_BIG,
        CACHE_KEYS.SEO_TREND_RELATED,
        // CACHE_KEYS.SEO_SUBCATEGORIES, // This specific key might not be needed if it's always paginated now
        CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS,
        CACHE_KEYS.MIXED_CATEGORIES_AI_CODE,
        CACHE_KEYS.MIXED_CATEGORIES_AI_EARN,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.PAGE_ALL_BLOGS('seo'),
        CACHE_KEYS.PAGE_FEATURE_POST('seo')
      ],
      'aitool': [
        CACHE_KEYS.PAGE_FEATURE_POST('ai-tools'),
        CACHE_KEYS.PAGE_ALL_BLOGS('ai-tools'),
        CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS,
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
      ],
      'coding': [
        CACHE_KEYS.PAGE_FEATURE_POST('coding'),
        CACHE_KEYS.PAGE_ALL_BLOGS('coding'),
        CACHE_KEYS.MIXED_CATEGORIES_AI_CODE,
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
      ],
      'makemoney': [
        CACHE_KEYS.PAGE_FEATURE_POST('makemoney'),
        CACHE_KEYS.PAGE_ALL_BLOGS('makemoney'),
        CACHE_KEYS.MIXED_CATEGORIES_AI_EARN,
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
      ],
      'seoSubcategory': [
        // When a seoSubcategory document itself changes, we need to invalidate the whole pagination group.
        // We don't need to explicitly clear CACHE_KEYS.SEO_SUBCATEGORIES here if it's only used as a prefix for pagination.
        // Instead, directly clear the pagination group.
        // CACHE_KEYS.SEO_SUBCATEGORIES, // Removed, as we'll use clearPaginationGroup instead.
        CACHE_KEYS.SEO_TREND_BIG, // These might still be affected by subcategory changes
        CACHE_KEYS.SEO_TREND_RELATED,
        CACHE_KEYS.PAGE_ALL_BLOGS('seo'), // If subcategory changes affect blog listings
        CACHE_KEYS.PAGE_FEATURE_POST('seo')
      ],
      'freeResources': [
        CACHE_KEYS.FEATURED_RESOURCES_HORIZONTAL,
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
      ],
      'news': [
        CACHE_KEYS.TRENDING_BIG,
        CACHE_KEYS.TRENDING_RELATED,
        CACHE_KEYS.FEATURE_BIG,
        CACHE_KEYS.FEATURE_RELATED,
      ]
    };

    const keysToInvalidate = invalidationMap[documentType];
    if (keysToInvalidate) {
      console.log(`Invalidating cache for document type: ${documentType}`);

      keysToInvalidate.forEach(key => {
        if (typeof key === 'function') {
          key().forEach(k => cacheService.clear(k));
        } else {
          cacheService.clear(key);
          // Also clear pagination cache for list-type keys
          if (key.includes('PAGE_ALL_BLOGS')) { // This handles PAGE_ALL_BLOGS('seo'), PAGE_ALL_BLOGS('ai-tools') etc.
            const groupNamePart = key.split('PAGE_ALL_BLOGS-')[1]; // Extracts 'seo' or 'ai-tools'
            this.clearPaginationGroup(`${groupNamePart}-all-blogs`); // This matches the paginationGroup used in ReusableCachedAllBlogs
          }
          // NEW: Handle seoSubcategory pagination group invalidation
          if (documentType === 'seoSubcategory') { // If the document type is seoSubcategory
            this.clearPaginationGroup('seoSubcategories-all-items'); // Clear the specific subcategory pagination group
          }
        }
      });
    } else {
      console.log(`No specific invalidation rule for document type: ${documentType}`);
    }
  }

  static invalidatePageCache(pageType) {
    const featureKey = CACHE_KEYS.PAGE_FEATURE_POST(pageType);
    const allBlogsKey = CACHE_KEYS.PAGE_ALL_BLOGS(pageType);

    // Clear feature cache
    cacheService.clear(featureKey);

    // Clear all paginated `allBlogs` keys for the specific page type
    // NOTE: This also clears the total-count for all blogs via clearPaginationCache
    this.clearPaginationCache(allBlogsKey);

    // Set pagination refresh timestamp for blogs
    this.setPaginationRefreshTimestamp(`${pageType}-all-blogs`);

    // Invalidate SEO subcategories if this page type is 'seo'
    if (pageType === 'seo') {
      // SEO subcategories are now paginated, so clear their group
      this.clearPaginationGroup('seoSubcategories-all-items'); // Use the specific pagination group name
      console.log('SEO subcategories pagination cache invalidated for seo page type.');
    }

    console.log(`${pageType} page caches invalidated.`);
  }

  static invalidateHomepage() {
    const homepageKeys = [
      CACHE_KEYS.TRENDING_BIG,
      CACHE_KEYS.TRENDING_RELATED,
      CACHE_KEYS.FEATURE_BIG,
      CACHE_KEYS.FEATURE_RELATED,
      CACHE_KEYS.RECENT_POSTS,
      CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS,
      CACHE_CATEGORIES.MIXED_CATEGORIES_AI_CODE,
      CACHE_KEYS.MIXED_CATEGORIES_AI_EARN,
      // CACHE_KEYS.SEO_SUBCATEGORIES, // This specific key might not be needed if it's always paginated now
    ];

    homepageKeys.forEach(key => {
      cacheService.clear(key);
      // Clear pagination cache for list-type keys
      if (key.includes('RECENT_POSTS')) {
        this.clearPaginationGroup('recent-posts'); // Assuming 'recent-posts' is its group name
      } else if (key.includes('MIXED_CATEGORIES')) {
        // You'll need to define clearPaginationGroup for each mixed category type
        // For example:
        if (key === CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS) this.clearPaginationGroup('ai-tools-mixed-categories');
        if (key === CACHE_KEYS.MIXED_CATEGORIES_AI_CODE) this.clearPaginationGroup('ai-code-mixed-categories');
        if (key === CACHE_KEYS.MIXED_CATEGORIES_AI_EARN) this.clearPaginationGroup('ai-earn-mixed-categories');
      } else if (key === CACHE_KEYS.SEO_SUBCATEGORIES) { // If SEO_SUBCATEGORIES is still used as a non-paginated part on homepage
        this.clearPaginationGroup('seoSubcategories-all-items'); // Clear its paginated form
      }
    });
    console.log("All homepage caches invalidated.");
  }

  // New method: Clear all pagination cache for a specific group
  static clearPaginationGroup(groupName) {
    // This method needs to know the baseKey associated with the groupName
    let baseKeyForClearCache;
    if (groupName === 'seoSubcategories-all-items') {
      baseKeyForClearCache = CACHE_KEYS.SEO_SUBCATEGORIES;
    } else if (groupName.endsWith('-all-blogs')) {
      const docType = groupName.replace('-all-blogs', '');
      baseKeyForClearCache = CACHE_KEYS.PAGE_ALL_BLOGS(docType);
    }
    // Add more mappings for other paginated groups if they exist
    // For example, if you have RECENT_POSTS paginated, add:
    else if (groupName === 'recent-posts') {
      baseKeyForClearCache = CACHE_KEYS.RECENT_POSTS;
    }
    // Add mixed categories here too if they are paginated groups
    else if (groupName === 'ai-tools-mixed-categories') {
      baseKeyForClearCache = CACHE_KEYS.MIXED_CATEGORIES_AI_TOOLS;
    }
    else if (groupName === 'ai-code-mixed-categories') {
      baseKeyForClearCache = CACHE_KEYS.MIXED_CATEGORIES_AI_CODE;
    }
    else if (groupName === 'ai-earn-mixed-categories') {
      baseKeyForClearCache = CACHE_KEYS.MIXED_CATEGORIES_AI_EARN;
    }
    // ... other specific pagination groups

    if (baseKeyForClearCache) {
      this.clearPaginationCache(baseKeyForClearCache);
      this.setPaginationRefreshTimestamp(groupName); // This timestamp is for the group
      console.log(`Pagination group ${groupName} cleared and timestamp updated.`);
    } else {
      console.warn(`clearPaginationGroup: No baseKey mapping found for groupName: ${groupName}`);
    }
  }

  // New method: Check if pagination cache is stale
  static isPaginationCacheStale(groupName, componentKey) {
    if (typeof window === 'undefined') return false;

    const groupRefreshTime = localStorage.getItem(`${groupName}_pagination_refresh`);
    const componentUpdateTime = localStorage.getItem(`${componentKey}_last_update`);

    if (!groupRefreshTime || !componentUpdateTime) return false;

    return parseInt(groupRefreshTime) > parseInt(componentUpdateTime);
  }
}