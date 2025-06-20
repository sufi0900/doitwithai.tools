// utils/articleCacheUtils.js
"use client";

import { ARTICLE_CACHE_KEYS, ARTICLE_CACHE_CONFIG } from './articleCacheKeys';

/**
 * Article Cache Utilities
 * Helper functions for article caching operations
 */

export const articleCacheUtils = {
  // Format cache size for display
  formatCacheSize: (sizeInBytes) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Format time duration
  formatDuration: (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  },

  // Get cache health status
  getCacheHealth: (cacheKey) => {
    if (typeof window === 'undefined') return 'unknown';
    
    try {
      const cached = localStorage.getItem(`article_cache_${cacheKey}`);
      if (!cached) return 'no-cache';
      
      const parsed = JSON.parse(cached);
      const now = Date.now();
      const age = now - parsed.timestamp;
      const expiry = parsed.expiry || ARTICLE_CACHE_CONFIG.EXPIRY_TIMES.ARTICLE_CONTENT;
      
      if (age > expiry) return 'expired';
      if (age > expiry * 0.8) return 'stale';
      if (age > expiry * 0.5) return 'aging';
      return 'fresh';
    } catch (error) {
      return 'corrupted';
    }
  },

  // Get detailed cache info for tooltip
  getCacheInfo: (cacheKey, componentName = null) => {
    if (typeof window === 'undefined') {
      return {
        exists: false,
        size: 0,
        age: 0,
        health: 'unknown',
        componentName: componentName || 'Unknown'
      };
    }

    try {
      const cached = localStorage.getItem(`article_cache_${cacheKey}`);
      if (!cached) {
        return {
          exists: false,
          size: 0,
          age: 0,
          health: 'no-cache',
          componentName: componentName || 'Unknown'
        };
      }

      const parsed = JSON.parse(cached);
      const size = new Blob([cached]).size;
      const age = Date.now() - parsed.timestamp;
      const health = articleCacheUtils.getCacheHealth(cacheKey);

      return {
        exists: true,
        size,
        age,
        health,
        timestamp: parsed.timestamp,
        expiry: parsed.expiry,
        version: parsed.version,
        componentName: componentName || 'Unknown',
        formattedSize: articleCacheUtils.formatCacheSize(size),
        formattedAge: articleCacheUtils.formatDuration(parsed.timestamp),
        data: parsed.data ? Object.keys(parsed.data).length : 0
      };
    } catch (error) {
      return {
        exists: true,
        size: 0,
        age: 0,
        health: 'corrupted',
        componentName: componentName || 'Unknown',
        error: error.message
      };
    }
  },

  // Get all cache info for an article
  getArticleCacheInfo: (articleType, articleSlug) => {
    const cacheKeys = [
      { key: ARTICLE_CACHE_KEYS.ARTICLE_CONTENT(articleType, articleSlug), name: 'Article Content' },
      { key: ARTICLE_CACHE_KEYS.RELATED_POSTS(articleType, articleSlug), name: 'Related Posts' },
      { key: ARTICLE_CACHE_KEYS.RELATED_RESOURCES(articleType, articleSlug), name: 'Related Resources' },
      { key: ARTICLE_CACHE_KEYS.TABLE_OF_CONTENTS(articleType, articleSlug), name: 'Table of Contents' },
      { key: ARTICLE_CACHE_KEYS.ARTICLE_COMMENTS(articleType, articleSlug), name: 'Comments' }
    ];

    const cacheInfo = cacheKeys.map(({ key, name }) => ({
      ...articleCacheUtils.getCacheInfo(key, name),
      cacheKey: key
    }));

    const totalSize = cacheInfo.reduce((total, info) => total + info.size, 0);
    const existingCaches = cacheInfo.filter(info => info.exists);
    const healthCounts = cacheInfo.reduce((counts, info) => {
      counts[info.health] = (counts[info.health] || 0) + 1;
      return counts;
    }, {});

    return {
      components: cacheInfo,
      summary: {
        totalComponents: cacheKeys.length,
        cachedComponents: existingCaches.length,
        totalSize,
        formattedTotalSize: articleCacheUtils.formatCacheSize(totalSize),
        healthCounts,
        overallHealth: articleCacheUtils.getOverallHealth(healthCounts)
      }
    };
  },

  // Determine overall cache health
  getOverallHealth: (healthCounts) => {
    if (healthCounts.corrupted > 0) return 'corrupted';
    if (healthCounts.expired > 0) return 'expired';
    if (healthCounts['no-cache'] > healthCounts.fresh) return 'no-cache';
    if (healthCounts.stale > 0) return 'stale';
    if (healthCounts.aging > 0) return 'aging';
    return 'fresh';
  },

  // Check if cache needs refresh
  needsRefresh: (cacheKey, threshold = 0.8) => {
    const health = articleCacheUtils.getCacheHealth(cacheKey);
    return ['expired', 'stale', 'corrupted', 'no-cache'].includes(health);
  },

  // Get cache status color for UI
  getStatusColor: (status) => {
    switch (status) {
      case 'fresh': return 'text-green-600 bg-green-50';
      case 'cached': return 'text-blue-600 bg-blue-50';
      case 'aging': return 'text-yellow-600 bg-yellow-50';
      case 'stale': return 'text-orange-600 bg-orange-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'update-detected': return 'text-purple-600 bg-purple-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      case 'loading': return 'text-indigo-600 bg-indigo-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  },

  // Get status icon
  getStatusIcon: (status) => {
    switch (status) {
      case 'fresh': return '✅';
      case 'cached': return '💾';
      case 'aging': return '⏳';
      case 'stale': return '⚠️';
      case 'expired': return '❌';
      case 'update-detected': return '🔔';
      case 'offline': return '📱';
      case 'loading': return '⏳';
      case 'error': return '❌';
      default: return '❓';
    }
  },

  // Get readable status text
  getStatusText: (status) => {
    switch (status) {
      case 'fresh': return 'Fresh from server';
      case 'cached': return 'Loaded from cache';
      case 'aging': return 'Cache aging';
      case 'stale': return 'Cache is stale';
      case 'expired': return 'Cache expired';
      case 'update-detected': return 'Update available';
      case 'offline': return 'Offline mode';
      case 'loading': return 'Loading data';
      case 'error': return 'Error occurred';
      default: return 'Unknown status';
    }
  },

  // Performance monitoring
  measureCachePerformance: (operation, cacheKey) => {
    const startTime = performance.now();
    
    return {
      end: (success = true, dataSize = 0) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const perfData = {
          operation,
          cacheKey,
          duration: Math.round(duration * 100) / 100,
          success,
          dataSize,
          timestamp: Date.now()
        };

        console.log(`⚡ Cache ${operation} performance:`, perfData);
        return perfData;
      }
    };
  },

  // Cleanup old caches
  cleanupOldCaches: (maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
    if (typeof window === 'undefined') return 0;
    
    const allKeys = Object.keys(localStorage);
    const articleKeys = allKeys.filter(key => key.startsWith('article_cache_'));
    let cleanedCount = 0;

    articleKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          
          if (age > maxAge) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted cache entries
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });

    console.log(`🧹 Cleaned up ${cleanedCount} old cache entries`);
    return cleanedCount;
  },

  // Export cache data for debugging
  exportCacheData: (articleType, articleSlug) => {
    const cacheInfo = articleCacheUtils.getArticleCacheInfo(articleType, articleSlug);
    const exportData = {
      article: { type: articleType, slug: articleSlug },
      exportTime: new Date().toISOString(),
      ...cacheInfo
    };

    return JSON.stringify(exportData, null, 2);
  },

  // Validate cache integrity
  validateCacheIntegrity: (cacheKey) => {
    if (typeof window === 'undefined') return { valid: false, reason: 'server-side' };

    try {
      const cached = localStorage.getItem(`article_cache_${cacheKey}`);
      if (!cached) return { valid: false, reason: 'not-found' };

      const parsed = JSON.parse(cached);
      
      // Check required fields
      if (!parsed.data) return { valid: false, reason: 'missing-data' };
      if (!parsed.timestamp) return { valid: false, reason: 'missing-timestamp' };
      if (!parsed.expiry) return { valid: false, reason: 'missing-expiry' };

      // Check data structure
      if (typeof parsed.data !== 'object') return { valid: false, reason: 'invalid-data-type' };

      return { valid: true, reason: 'valid' };
    } catch (error) {
      return { valid: false, reason: 'parse-error', error: error.message };
    }
  }
};

export default articleCacheUtils;