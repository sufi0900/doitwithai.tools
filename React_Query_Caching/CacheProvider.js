'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { cacheSystem } from './cacheSystem';

// --- Cache Context ---
const CacheContext = createContext(null);

// --- Global Cache Provider ---
export const CacheProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStats, setCacheStats] = useState({
    memoryEntries: 0,
    memorySize: 0,
    subscribers: 0,
    isOnline: true,
  });

  // Global state for keys currently being refreshed
  const [refreshingKeys, setRefreshingKeys] = useState(new Set());

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      console.log('[CacheProvider] Connection restored');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('[CacheProvider] Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to network status changes
    const unsubscribeNetwork = cacheSystem.subscribe('network-status', (data) => {
      if (data) {
        setIsOnline(data.online);
      }
    });

    // Update cache stats periodically
    const updateStats = () => {
      setCacheStats(cacheSystem.getCacheStats());
    };
    
    updateStats();
    const statsInterval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeNetwork();
      clearInterval(statsInterval);
    };
  }, []);

  // Global refresh function
  const refreshCache = useCallback(async (pattern = null) => {
    if (pattern) {
      await cacheSystem.invalidatePattern(pattern);
    } else {
      // Refresh all stale data
      await cacheSystem.refreshStaleData();
    }
  }, []);

  // Add a key to the refreshing set
  const addRefreshingKey = useCallback((key) => {
    setRefreshingKeys((prev) => new Set([...prev, key]));
  }, []);

  // Remove a key from the refreshing set
  const removeRefreshingKey = useCallback((key) => {
    setRefreshingKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  // Check if a key is currently refreshing
  const isKeyRefreshing = useCallback((key) => {
    return refreshingKeys.has(key);
  }, [refreshingKeys]);

  const contextValue = {
    isOnline,
    cacheStats,
    refreshCache,
    addRefreshingKey,
    removeRefreshingKey,
    isKeyRefreshing,
    cacheSystem,
  };

  return <CacheContext.Provider value={contextValue}>{children}</CacheContext.Provider>;
};

// --- Custom Hook to use the Cache Context ---
export const useCacheContext = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCacheContext must be used within a CacheProvider');
  }
  return context;
};

// --- Page-specific Cache Provider for Scoped Operations ---
export const PageCacheProvider = ({ children, pageType, pageId }) => {
  const globalCache = useCacheContext();

  // Store page-specific cache keys and their refresh functions
  const [pageCacheKeys, setPageCacheKeys] = useState(new Map());
  const pageRefreshFunctionsRef = useRef(new Map());

  // Register a cache key with its refresh function
  const registerCacheKey = useCallback((cacheKey, refreshFn, query, label) => {
    setPageCacheKeys((prev) => new Map(prev.set(cacheKey, { query, label, refreshFn })));
    pageRefreshFunctionsRef.current.set(cacheKey, refreshFn);
  }, []);

  // Unregister a cache key
  const unregisterCacheKey = useCallback((cacheKey) => {
    setPageCacheKeys((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cacheKey);
      return newMap;
    });
    pageRefreshFunctionsRef.current.delete(cacheKey);
  }, []);

  // Refresh all page-specific cache
  const refreshPageCache = useCallback(async () => {
    const refreshPromises = Array.from(pageRefreshFunctionsRef.current.values()).map((refreshFn) =>
      refreshFn().catch((error) => {
        console.error('Failed to refresh cache key:', error);
        return null;
      })
    );
    await Promise.allSettled(refreshPromises);
  }, []);

  // Invalidate all page-specific cache
  const invalidatePageCache = useCallback(async () => {
    const pattern = `.*${pageType}.*`;
    await globalCache.cacheSystem.invalidatePattern(pattern);
  }, [globalCache, pageType]);

  // Get cache keys for status display
  const getCacheKeys = useCallback(() => {
    return Array.from(pageCacheKeys.entries()).map(([key, info]) => ({
      key,
      query: info.query,
      label: info.label,
    }));
  }, [pageCacheKeys]);

  const pageContextValue = {
    ...globalCache,
    pageType,
    pageId,
    registerCacheKey,
    unregisterCacheKey,
    refreshPageCache,
    invalidatePageCache,
    getCacheKeys,
    pageCacheKeys,
  };

  return <CacheContext.Provider value={pageContextValue}>{children}</CacheContext.Provider>;
};