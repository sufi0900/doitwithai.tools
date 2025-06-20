//contexts/GlobalArticleCacheContext.js
"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import articleCacheInvalidation from './ArticleCacheInvalidation';
import { articleCacheUtils } from './articleCacheUtils';
import { ARTICLE_CACHE_CONFIG } from './articleCacheKeys';


const GlobalArticleCacheContext = createContext();

export const useGlobalArticleCache = () => {
  const context = useContext(GlobalArticleCacheContext);
  if (!context) {
    throw new Error('useGlobalArticleCache must be used within GlobalArticleCacheProvider');
  }
  return context;
};

export const GlobalArticleCacheProvider = ({ children }) => {
  const [globalCacheStats, setGlobalCacheStats] = useState({
    totalArticles: 0,
    totalSize: 0,
    totalComponents: 0,
    healthSummary: {},
    lastUpdated: null
  });
  
  const [activeArticles, setActiveArticles] = useState(new Map());
  const [globalRefreshHistory, setGlobalRefreshHistory] = useState([]);
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);
  const cleanupIntervalRef = useRef(null);
  const statsUpdateIntervalRef = useRef(null);

  // Register an article page
  const registerArticle = useCallback((articleType, articleSlug, componentCount = 0) => {
    console.log(`📝 Registering article: ${articleType}/${articleSlug}`);
    
    setActiveArticles(prev => {
      const newMap = new Map(prev);
      newMap.set(`${articleType}_${articleSlug}`, {
        type: articleType,
        slug: articleSlug,
        componentCount,
        registeredAt: Date.now(),
        lastActivity: Date.now()
      });
      return newMap;
    });

    // Return unregister function
    return () => {
      setActiveArticles(prev => {
        const newMap = new Map(prev);
        newMap.delete(`${articleType}_${articleSlug}`);
        return newMap;
      });
      console.log(`🗑️ Unregistered article: ${articleType}/${articleSlug}`);
    };
  }, []);

  // Update article activity
  const updateArticleActivity = useCallback((articleType, articleSlug) => {
    setActiveArticles(prev => {
      const newMap = new Map(prev);
      const key = `${articleType}_${articleSlug}`;
      if (newMap.has(key)) {
        newMap.set(key, {
          ...newMap.get(key),
          lastActivity: Date.now()
        });
      }
      return newMap;
    });
  }, []);

  // Update global cache statistics
  const updateGlobalStats = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const allKeys = Object.keys(localStorage);
      const articleKeys = allKeys.filter(key => key.startsWith('article_cache_'));
      
      let totalSize = 0;
      const healthCounts = {};
      const articleSet = new Set();

      articleKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
            
            // Extract article info from cache key
            const match = key.match(/article_cache_[\w_]+_(\w+)_(.+)/);
            if (match) {
              articleSet.add(`${match[1]}_${match[2]}`);
            }

            // Check health
            const cacheKey = key.replace('article_cache_', '');
            const health = articleCacheUtils.getCacheHealth(cacheKey);
            healthCounts[health] = (healthCounts[health] || 0) + 1;
          }
        } catch (error) {
          healthCounts.corrupted = (healthCounts.corrupted || 0) + 1;
        }
      });

      setGlobalCacheStats({
        totalArticles: articleSet.size,
        totalSize,
        totalComponents: articleKeys.length,
        formattedSize: articleCacheUtils.formatCacheSize(totalSize),
        healthSummary: healthCounts,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error updating global cache stats:', error);
    }
  }, []);

  // Global refresh all cached articles
  const globalRefreshAll = useCallback(async () => {
    console.log('🌐 Starting global refresh of all cached articles');
    setIsGlobalRefreshing(true);
    
    const refreshStart = Date.now();
    const results = {
      articlesProcessed: 0,
      cacheEntriesCleared: 0,
      errors: []
    };

    try {
      // Clear all article caches
      const clearedCount = articleCacheInvalidation.clearAllArticleCaches();
      results.cacheEntriesCleared = clearedCount;

      // Trigger refresh events for all active articles
      const activeArticlesList = Array.from(activeArticles.values());
      results.articlesProcessed = activeArticlesList.length;

      // Dispatch global refresh event
      if (typeof window !== 'undefined') {
        const refreshEvent = new CustomEvent('global-article-refresh', {
          detail: {
            timestamp: Date.now(),
            articleCount: activeArticlesList.length
          }
        });
        window.dispatchEvent(refreshEvent);
      }

      // Update stats after refresh
      setTimeout(updateGlobalStats, 1000);

      const refreshRecord = {
        timestamp: Date.now(),
        duration: Date.now() - refreshStart,
        ...results
      };

      setGlobalRefreshHistory(prev => [refreshRecord, ...prev.slice(0, 9)]); // Keep last 10 records

      console.log('✅ Global refresh completed:', refreshRecord);
      return refreshRecord;
    } catch (error) {
      console.error('❌ Error during global refresh:', error);
      results.errors.push(error.message);
      throw error;
    } finally {
      setIsGlobalRefreshing(false);
    }
  }, [activeArticles, updateGlobalStats]);

  // Cleanup old/expired caches
  const cleanupOldCaches = useCallback(async () => {
    console.log('🧹 Starting cache cleanup');
    const cleanedCount = articleCacheUtils.cleanupOldCaches(
      ARTICLE_CACHE_CONFIG.CACHE_LIMITS.MAX_CACHE_SIZE_MB * 1024 * 1024
    );
    
    // Update stats after cleanup
    updateGlobalStats();
    
    console.log(`🧹 Cleaned up ${cleanedCount} cache entries`);
    return cleanedCount;
  }, [updateGlobalStats]);

  // Force refresh specific article type
  const refreshArticleType = useCallback(async (articleType) => {
    console.log(`🔄 Refreshing all articles of type: ${articleType}`);
    const clearedCount = articleCacheInvalidation.invalidateByType(articleType);

    // Dispatch type-specific refresh event
    if (typeof window !== 'undefined') {
      const refreshEvent = new CustomEvent('article-type-refresh', {
        detail: {
          articleType,
          timestamp: Date.now(),
          clearedCount
        }
      });
      window.dispatchEvent(refreshEvent);
    }

    updateGlobalStats();
    return clearedCount;
  }, [updateGlobalStats]);

  // Get global cache health
  const getGlobalCacheHealth = useCallback(() => {
    const { healthSummary } = globalCacheStats;
    const total = Object.values(healthSummary).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 'no-cache';
    
    const healthPercentages = {};
    Object.entries(healthSummary).forEach(([health, count]) => {
      healthPercentages[health] = (count / total) * 100;
    });

    // Determine overall health based on percentages
    if (healthPercentages.corrupted > 10) return 'corrupted';
    if (healthPercentages.expired > 30) return 'expired';
    if (healthPercentages.stale > 50) return 'stale';
    if (healthPercentages.aging > 60) return 'aging';
    if (healthPercentages.fresh > 50) return 'fresh';
    
    return 'mixed';
  }, [globalCacheStats]);

  // Get detailed cache report
  const getDetailedCacheReport = useCallback(() => {
    const activeArticlesList = Array.from(activeArticles.values());
    const cacheHealth = getGlobalCacheHealth();
    
    return {
      overview: {
        ...globalCacheStats,
        activeArticles: activeArticlesList.length,
        overallHealth: cacheHealth,
        isGlobalRefreshing
      },
      activeArticles: activeArticlesList.map(article => ({
        ...article,
        cacheInfo: articleCacheUtils.getArticleCacheInfo(article.type, article.slug)
      })),
      refreshHistory: globalRefreshHistory,
      recommendations: generateCacheRecommendations(globalCacheStats, cacheHealth)
    };
  }, [globalCacheStats, activeArticles, globalRefreshHistory, getGlobalCacheHealth, isGlobalRefreshing]);

  // Generate cache recommendations
  const generateCacheRecommendations = useCallback((stats, health) => {
    const recommendations = [];
    
    if (health === 'expired' || health === 'stale') {
      recommendations.push({
        type: 'action',
        priority: 'high',
        message: 'Many caches are stale or expired. Consider a global refresh.',
        action: 'globalRefreshAll'
      });
    }
    
    if (stats.totalSize > ARTICLE_CACHE_CONFIG.CACHE_LIMITS.MAX_CACHE_SIZE_MB * 1024 * 1024 * 0.8) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: 'Cache size is approaching limit. Cleanup recommended.',
        action: 'cleanupOldCaches'
      });
    }
    
    if (stats.totalComponents > ARTICLE_CACHE_CONFIG.CACHE_LIMITS.MAX_ARTICLES_CACHED * 5) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: 'High number of cached components. Consider optimizing cache strategy.',
        action: 'optimize'
      });
    }
    
    return recommendations;
  }, []);

  // Auto-update stats periodically
  useEffect(() => {
    updateGlobalStats(); // Initial update
    
    // Update stats every 30 seconds
    statsUpdateIntervalRef.current = setInterval(updateGlobalStats, 30000);
    
    return () => {
      if (statsUpdateIntervalRef.current) {
        clearInterval(statsUpdateIntervalRef.current);
      }
    };
  }, [updateGlobalStats]);

  // Auto-cleanup old caches periodically
  useEffect(() => {
    // Cleanup every 10 minutes
    cleanupIntervalRef.current = setInterval(cleanupOldCaches, 10 * 60 * 1000);
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanupOldCaches]);

  // Listen for cache invalidation events
  useEffect(() => {
    const handleCacheInvalidation = (event) => {
      console.log('🔔 Global cache invalidation event received:', event.detail);
      // Update stats after any cache invalidation
      setTimeout(updateGlobalStats, 500);
    };

    const handleStorageChange = (event) => {
      if (event.key && event.key.startsWith('article_cache_')) {
        console.log('🔔 Article cache storage change detected');
        setTimeout(updateGlobalStats, 500);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cache-invalidated', handleCacheInvalidation);
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cache-invalidated', handleCacheInvalidation);
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [updateGlobalStats]);

  const contextValue = {
    // Global state
    globalCacheStats,
    activeArticles: Array.from(activeArticles.values()),
    globalRefreshHistory,
    isGlobalRefreshing,

    // Article management
    registerArticle,
    updateArticleActivity,

    // Global operations
    globalRefreshAll,
    cleanupOldCaches,
    refreshArticleType,
    updateGlobalStats,

    // Health and reporting
    getGlobalCacheHealth,
    getDetailedCacheReport,

    // Utilities
    isHealthy: () => ['fresh', 'aging'].includes(getGlobalCacheHealth()),
    needsCleanup: () => globalCacheStats.totalSize > ARTICLE_CACHE_CONFIG.CACHE_LIMITS.MAX_CACHE_SIZE_MB * 1024 * 1024 * 0.8,
    needsRefresh: () => ['expired', 'stale', 'corrupted'].includes(getGlobalCacheHealth())
  };

  return (
    <GlobalArticleCacheContext.Provider value={contextValue}>
      {children}
    </GlobalArticleCacheContext.Provider>
  );
};