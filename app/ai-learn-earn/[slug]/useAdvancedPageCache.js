// hooks/useAdvancedPageCache.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useArticleCache } from './ArticleCacheContext';



const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useAdvancedPageCache = (baseKey, fetcher, schemaType, params = {}, options = {}) => {
  const { componentId } = params;
  
  if (!componentId) {
    throw new Error("'componentId' is required for useAdvancedPageCache.");
  }

  const { _registerRefreshFunction, _unregisterRefreshFunction, hasUpdatesAvailableGlobally } = useArticleCache();
  
  // Generate cache key
  const cacheKey = generateCacheKey(baseKey, schemaType, params);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('cached');
  const [hasUpdatesAvailable, setHasUpdatesAvailable] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const memoizedFetcher = useCallback(fetcher, []);

  // Helper functions for cache management
  const getCachedData = (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setCachedData = (key, data) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + (options.ttl || CACHE_EXPIRY),
        source: 'api',
        schemaType,
        componentId
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  const isCacheExpired = (timestamp) => {
    return Date.now() - timestamp > (options.ttl || CACHE_EXPIRY);
  };

const handleOfflineScenario = useCallback(async () => {
  // In offline mode, try to get any available cached data
  const cachedItem = getCachedData(cacheKey);
  if (cachedItem) {
    setData(cachedItem.data);
    setIsFromCache(true);
    setCacheStatus('offline');
    setMetadata({
      timestamp: cachedItem.timestamp,
      source: 'cache',
      expires: cachedItem.expires,
      schemaType: cachedItem.schemaType
    });
    return true;
  }

  // NEW: Try alternative cache keys for related resources
  if (componentId === 'related-resources') {
    const alternativeKeys = generateAlternativeCacheKeys(baseKey, schemaType, params);
    for (const altKey of alternativeKeys) {
      const altCachedItem = getCachedData(altKey);
      if (altCachedItem) {
        console.log(`Found alternative cache for related resources: ${altKey}`);
        setData(altCachedItem.data);
        setIsFromCache(true);
        setCacheStatus('offline');
        setMetadata({
          timestamp: altCachedItem.timestamp,
          source: 'cache',
          expires: altCachedItem.expires,
          schemaType: altCachedItem.schemaType
        });
        return true;
      }
    }
  }

  return false;
}, [cacheKey, componentId, baseKey, schemaType, params]);

 const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    if (forceRefresh) {
      setIsRefreshing(true);
    }

    try {
      const cachedItem = getCachedData(cacheKey);
      if (!forceRefresh && cachedItem && !isCacheExpired(cachedItem.timestamp)) {
        setData(cachedItem.data);
        setIsFromCache(true);
        setCacheStatus(hasUpdatesAvailableGlobally ? 'updates-available' : 'cached');
        setHasUpdatesAvailable(hasUpdatesAvailableGlobally);
        setMetadata({
          timestamp: cachedItem.timestamp,
          source: 'cache',
          expires: cachedItem.expires,
          schemaType: cachedItem.schemaType
        });
        setLoading(false);
        if (forceRefresh) setIsRefreshing(false);
        return;
      }

      setIsFromCache(false);
      const freshData = await memoizedFetcher();
      setData(freshData);
      
      setCachedData(cacheKey, freshData);
      setCacheStatus('fresh');
      setHasUpdatesAvailable(false);
      setMetadata({
        timestamp: Date.now(),
        source: 'api',
        expires: Date.now() + (options.ttl || CACHE_EXPIRY),
        schemaType
      });

    } catch (error) {
      console.error(`Error fetching data for ${cacheKey}:`, error);
      
      const offlineDataLoaded = await handleOfflineScenario();
      if (!offlineDataLoaded) {
        setCacheStatus('offline');
        setMetadata(null);
      }
    } finally {
      setLoading(false);
      if (forceRefresh) setIsRefreshing(false);
    }
  }, [cacheKey, memoizedFetcher, hasUpdatesAvailableGlobally, handleOfflineScenario, options.ttl, schemaType]);



const initialLoadRef = useRef(false);
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    let isMounted = true;

    const loadDataSafely = async () => {
      try {
        await loadData();
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
          await handleOfflineScenario();
        }
      }
    };

    const refreshFunction = () => {
      if (isMounted) {
        return loadData(true);
      }
    };

    _registerRefreshFunction(componentId, refreshFunction);
    loadDataSafely();

    return () => {
      isMounted = false;
      _unregisterRefreshFunction(componentId);
    };
  }, []); // Empty dependency array for
// NEW: Helper function to generate alternative cache keys
const generateAlternativeCacheKeys = (baseKey, schemaType, params) => {
  const alternatives = [];
  
  if (baseKey === 'related_resources') {
    // Try with different article ID combinations
    if (params.articleId) {
      alternatives.push(`related_resources_freeResources_${params.articleId}_related-resources`);
    }
    if (params.id) {
      alternatives.push(`related_resources_freeResources_${params.id}_related-resources`);
    }
    if (params.slug) {
      alternatives.push(`related_resources_freeResources_article_${params.slug}_related-resources`);
    }
    // Try without specific IDs
    alternatives.push(`related_resources_freeResources_related-resources`);
  }
  
  return alternatives;
};

  // Effect to load data and register refresh function
  useEffect(() => {
    let isMounted = true;
    
    const loadDataSafely = async () => {
      try {
        await loadData();
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
        }
      }
    };

    // Register refresh function with context
    const refreshFunction = () => {
      if (isMounted) {
        return loadData(true);
      }
    };
    
    _registerRefreshFunction(componentId, refreshFunction);
    
    // Load data on initial mount
    loadDataSafely();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      _unregisterRefreshFunction(componentId);
    };
  }, [cacheKey]); // Simplified dependencies

  // Update status when global updates are detected
  useEffect(() => {
    if (hasUpdatesAvailableGlobally && !isRefreshing && data) {
      setCacheStatus('updates-available');
      setHasUpdatesAvailable(true);
    }
  }, [hasUpdatesAvailableGlobally, isRefreshing]); // Removed 'data' dependency

 const lastGlobalUpdateCheck = useRef(false);
  useEffect(() => {
    if (hasUpdatesAvailableGlobally !== lastGlobalUpdateCheck.current) {
      lastGlobalUpdateCheck.current = hasUpdatesAvailableGlobally;
      
      if (hasUpdatesAvailableGlobally && !isRefreshing && data) {
        setCacheStatus('updates-available');
        setHasUpdatesAvailable(true);
      }
    }
  }, [hasUpdatesAvailableGlobally, isRefreshing, data]);

  // FIXED: Memoize return values
  const refreshData = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${cacheKey}`);
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    isFromCache,
    refreshData,
    clearCache,
    cacheStatus,
    hasUpdatesAvailable,
    metadata,
    isRefreshing
  };
};

// Helper function to generate cache key
function generateCacheKey(baseKey, schemaType, params = {}) {
  const keyParts = [baseKey];
  if (schemaType) keyParts.push(schemaType);
  if (params.id) keyParts.push(params.id);
  if (params.slug) keyParts.push(params.slug);
  if (params.articleId) keyParts.push(`article_${params.articleId}`);
  if (params.componentId) keyParts.push(params.componentId);
  if (params.filters) keyParts.push(JSON.stringify(params.filters));
  return keyParts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
}