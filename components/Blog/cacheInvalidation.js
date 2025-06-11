// components/Blog/CacheInvalidationService.js

import { cacheService } from './useCache';
import { CACHE_KEYS } from './cacheKeys';

export class CacheInvalidationService {
  static invalidateByDocumentType(documentType) {
    const invalidationMap = {
      // In the invalidationMap object, update the 'seo' entry:
'seo': [
  CACHE_KEYS.SEO_TREND_BIG,
  CACHE_KEYS.SEO_TREND_RELATED,
  CACHE_KEYS.SEO_SUBCATEGORIES, // Add this line
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
  CACHE_KEYS.SEO_SUBCATEGORIES,
  CACHE_KEYS.SEO_TREND_BIG,
  CACHE_KEYS.SEO_TREND_RELATED,
  CACHE_KEYS.PAGE_ALL_BLOGS('seo'),
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
      ],
      // If you introduce a specific 'seoSubcategory' document type in Sanity
      // and changes to it should trigger invalidation, you would add an entry for it:
      // 'seoSubcategory': [
      //   CACHE_KEYS.SEO_SUBCATEGORIES,
      // ],
    };

    const keysToInvalidate = invalidationMap[documentType];
    if (keysToInvalidate) {
      console.log(`Invalidating cache for document type: ${documentType}`);
      keysToInvalidate.forEach(key => typeof key === 'function' ? key().forEach(k => cacheService.clear(k)) : cacheService.clear(key));
    } else {
      console.log(`No specific invalidation rule for document type: ${documentType}`);
    }
  }

  static invalidatePageCache(pageType) {
    const featureKey = CACHE_KEYS.PAGE_FEATURE_POST(pageType);
    const allBlogsKey = CACHE_KEYS.PAGE_ALL_BLOGS(pageType);
    cacheService.clear(featureKey);
    // Invalidate all paginated `allBlogs` keys for the specific pageType
    for (let i = 1; i <= 10; i++) { // Assuming a max of 10 pages, adjust as needed
      cacheService.clear(`${allBlogsKey}-page-${i}`);
    }
    // Invalidate SEO subcategories if this page type is 'seo'
    if (pageType === 'seo') { // <--- ADD THIS BLOCK
      cacheService.clear(CACHE_KEYS.SEO_SUBCATEGORIES);
      console.log('SEO subcategories cache invalidated for seo page type.');
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
      CACHE_KEYS.MIXED_CATEGORIES_AI_CODE,
      CACHE_KEYS.MIXED_CATEGORIES_AI_EARN,
      CACHE_KEYS.SEO_SUBCATEGORIES, // <--- CONSIDER ADDING THIS if homepage displays subcategories too.
                                   // If not, no need to add here.
    ];
    homepageKeys.forEach(key => cacheService.clear(key));
    console.log("All homepage caches invalidated.");
  }
}