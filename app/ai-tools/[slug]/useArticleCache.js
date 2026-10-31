// app/article-cache/useArticleCache.js
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from "@/sanity/lib/client";
import { ARTICLE_CACHE_KEYS, ARTICLE_CACHE_CONFIG } from './articleCacheKeys';

// Enhanced cache service with article-specific features
const articleCacheService = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(`article_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from article cache:', error);
      return null;
    }
  },

  set: (key, data, customExpiry = null) => {
    if (typeof window === 'undefined') return;
    try {
      const expiry = customExpiry || ARTICLE_CACHE_CONFIG.EXPIRY_TIMES.ARTICLE_CONTENT;
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: expiry,
        version: '1.0',
        type: 'article'
      };
      localStorage.setItem(`article_cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error writing to article cache:', error);
    }
  },

  clear: (key) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`article_cache_${key}`);
  },

  isExpired: (timestamp, customExpiry = null) => {
    const expiry = customExpiry || ARTICLE_CACHE_CONFIG.EXPIRY_TIMES.ARTICLE_CONTENT;
    return Date.now() - timestamp > expiry;
  },

  // Clear all article caches
  clearAll: () => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('article_cache_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get cache size and stats
  getStats: () => {
    if (typeof window === 'undefined') return { count: 0, size: 0 };
    const keys = Object.keys(localStorage);
    const articleKeys = keys.filter(key => key.startsWith('article_cache_'));
    let totalSize = 0;

    articleKeys.forEach(key => {
      totalSize += localStorage.getItem(key).length;
    });

    return {
      count: articleKeys.length,
      size: totalSize,
      sizeInMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
};

export const useArticleCache = (cacheKey, fetcher, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Polling refs
  const pollingIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  const {
    // Basic options (from your original usePageCache)
    dependencies = [],
    enableOffline = true,
    // forceRefresh = false, // <-- REMOVE or COMMENT OUT this line as it's defined later
    fallbackData = null,

    // Enhanced options (from blog cards system)
    componentName = null,
    enableRealTimeUpdates = true,
    enablePolling = true,
    pollingInterval = ARTICLE_CACHE_CONFIG.POLLING_INTERVALS.ARTICLE_UPDATES,
    customExpiry = null,
    onDataUpdate = null,
    onCacheHit = null,
    onCacheMiss = null,
    onOfflineMode = null,
    enableUpdateDetection = true,
    enableCustomEventListening = true,

    // Article-specific options
    articleType = null,
    articleSlug = null,
    enableEngagementTracking = false,
    enableViewTracking = false,
  } = options;

  // Enhanced data fetching with better error handling and status tracking
  const fetchFreshData = useCallback(async (showLoading = true, forceIgnoreCache = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Check online status
      const isOnline = navigator.onLine;
      if (!isOnline && !enableOffline) {
        throw new Error('Offline and offline mode disabled');
      }

      console.log(`🔄 Fetching fresh data for: ${componentName || cacheKey}`);

      const freshData = await fetcher();

      if (mountedRef.current) {
        setData(freshData);
        setIsFromCache(false);
        setDataSource('server');
        setIsOffline(false);
        setLastRefreshTime(Date.now());
        setUpdateAvailable(false);

        // Cache the fresh data
        articleCacheService.set(cacheKey, freshData, customExpiry);

        // Call callbacks
        if (onDataUpdate) onDataUpdate(freshData, 'server');
        if (onCacheMiss) onCacheMiss(cacheKey);

        console.log(`✅ Fresh data loaded for: ${componentName || cacheKey}`);
      }

      return freshData;
    } catch (error) {
      console.error(`❌ Error fetching data for ${componentName || cacheKey}:`, error);

      if (mountedRef.current) {
        setError(error);

        // Try to use cached data as fallback
        const cachedResult = articleCacheService.get(cacheKey);
        if (cachedResult && enableOffline) {
          setData(cachedResult.data);
          setIsFromCache(true);
          setDataSource('offline-fallback');
          setIsOffline(true);
          if (onOfflineMode) onOfflineMode(cachedResult.data);
          console.log(`📱 Using cached fallback for: ${componentName || cacheKey}`);
        } else if (fallbackData) {
          setData(fallbackData);
          setDataSource('fallback');
          console.log(`🔄 Using provided fallback for: ${componentName || cacheKey}`);
        }
      }

      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, fetcher, componentName, enableOffline, customExpiry, onDataUpdate, onCacheMiss, onOfflineMode, fallbackData]);

  // Enhanced update detection with article-specific logic
  const checkForUpdates = useCallback(async () => {
    if (!enableUpdateDetection || !articleType || !articleSlug) return false;

    try {
      // Check if there's a more recent update timestamp in Sanity
      const updateQuery = `*[_type == "${articleType}" && slug.current == "${articleSlug}"][0]._updatedAt`;
      const lastUpdated = await client.fetch(updateQuery);

      if (lastUpdated) {
        const cachedResult = articleCacheService.get(cacheKey);
        if (cachedResult) {
          const cacheTime = new Date(cachedResult.timestamp);
          const updateTime = new Date(lastUpdated);

          if (updateTime > cacheTime) {
            setUpdateAvailable(true);
            console.log(`🔔 Update detected for article: ${articleType}/${articleSlug}`);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }

    return false;
  }, [enableUpdateDetection, articleType, articleSlug, cacheKey]);

  // Manual refresh function (depends on fetchFreshData)
  const refresh = useCallback(async (forceIgnoreCache = false) => {
    console.log(`🔄 Manual refresh triggered for: ${componentName || cacheKey}`);
    return await fetchFreshData(true, forceIgnoreCache);
  }, [fetchFreshData, componentName, cacheKey]);

  // Force refresh function (sets flag and refreshes) - Depends on 'refresh'
  const forceRefresh = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`force_refresh_${cacheKey}`, 'true');
    }
    return await refresh(true);
  }, [cacheKey, refresh]); // <-- 'refresh' must be declared before 'forceRefresh'


  // Real-time polling for updates
  useEffect(() => {
    if (!enablePolling || !enableRealTimeUpdates) return;

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        if (mountedRef.current && document.visibilityState === 'visible') {
          await checkForUpdates();
        }
      }, pollingInterval);
    };

    // Start polling after initial load
    const timer = setTimeout(startPolling, 2000);

    return () => {
      clearTimeout(timer);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enablePolling, enableRealTimeUpdates, pollingInterval, checkForUpdates]);

  // Custom event listeners for article updates
  useEffect(() => {
    if (!enableCustomEventListening) return;

    const handleArticleUpdate = (event) => {
      const { documentType, slug, timestamp } = event.detail || {};

      if (documentType === articleType && slug === articleSlug) {
        console.log(`📰 Article update event received for ${componentName || cacheKey}`);
        setUpdateAvailable(true);
      }
    };

    const handleForceRefresh = (event) => {
      const { componentName: eventComponentName, cacheKey: eventCacheKey } = event.detail || {};

      if (eventComponentName === componentName || eventCacheKey === cacheKey) {
        console.log(`🎯 Force refresh event received for ${componentName || cacheKey}`);
        fetchFreshData(true, true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('article-update', handleArticleUpdate);
      window.addEventListener('force-component-refresh', handleForceRefresh);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('article-update', handleArticleUpdate);
        window.removeEventListener('force-component-refresh', handleForceRefresh);
      }
    };
  }, [enableCustomEventListening, articleType, articleSlug, componentName, cacheKey, fetchFreshData]);

  // Main data loading effect
  useEffect(() => {
    const loadData = async () => {
      // Check for force refresh flag
      const shouldForceRefresh = (typeof options.forceRefresh !== 'undefined' ? options.forceRefresh : false) || // Access from options
                                 (typeof window !== 'undefined' && localStorage.getItem(`force_refresh_${cacheKey}`) === 'true');

      if (shouldForceRefresh) {
        localStorage.removeItem(`force_refresh_${cacheKey}`);
        await fetchFreshData(true, true);
        return;
      }

      // Try cache first
      const cachedResult = articleCacheService.get(cacheKey);

      if (cachedResult && !articleCacheService.isExpired(cachedResult.timestamp, customExpiry)) {
        // Use cached data
        setData(cachedResult.data);
        setIsFromCache(true);
        setDataSource('cache');
        setLoading(false);
        if (onCacheHit) onCacheHit(cachedResult.data);
        console.log(`💾 Cache hit for: ${componentName || cacheKey}`);

        // Still check for updates in background
        setTimeout(checkForUpdates, 1000);
        return;
      }

      // Check if online
      const isOnline = navigator.onLine;

      if (isOnline) {
        // Fetch fresh data
        await fetchFreshData();
      } else if (cachedResult && enableOffline) {
        // Use expired cache as offline fallback
        setData(cachedResult.data);
        setIsFromCache(true);
        setDataSource('offline');
        setIsOffline(true);
        setLoading(false);
        if (onOfflineMode) onOfflineMode(cachedResult.data);
        console.log(`📱 Offline mode: using expired cache for: ${componentName || cacheKey}`);
      } else if (fallbackData) {
        // Use fallback data
        setData(fallbackData);
        setDataSource('fallback');
        setLoading(false);
        console.log(`🔄 Using fallback data for: ${componentName || cacheKey}`);
      } else {
        setError(new Error('No data available offline'));
        setLoading(false);
      }
    };

    loadData();
  }, [cacheKey, fetchFreshData, customExpiry, enableOffline, fallbackData, onCacheHit, onOfflineMode, componentName, checkForUpdates, dependencies, options.forceRefresh]); // <-- Added options.forceRefresh to dependencies

  // Clear cache function
  const clearCache = useCallback(() => {
    articleCacheService.clear(cacheKey);
    console.log(`🗑️ Cache cleared for: ${componentName || cacheKey}`);
  }, [cacheKey, componentName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Get current status
  const getStatus = useCallback(() => {
    if (loading) return 'loading';
    if (error && !data) return 'error';
    if (isOffline) return 'offline';
    if (updateAvailable) return 'update-detected';
    if (isFromCache) return 'cached';
    return 'fresh';
  }, [loading, error, data, isOffline, updateAvailable, isFromCache]);

  return {
    // Data
    data,
    loading,
    error,

    // Status flags
    isFromCache,
    isOffline,
    updateAvailable,
    dataSource,
    lastRefreshTime,

    // Actions
    refresh,
    clearCache,
    forceRefresh,
    checkForUpdates,

    // Status
    status: getStatus(),

    // Utility
    cacheKey,
    componentName,
  };
};

