"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from "@/sanity/lib/client";
import { cacheService } from './useCache'; // Assuming useCache exports cacheService
import { useGlobalRefresh } from "@/components/Blog/GlobalRefreshContext";
import { useGlobalOfflineStatus } from '@/components/Blog/GlobalOfflineStatusContext';
import { usePageRefresh } from './PageScopedRefreshContext';

export const useCachedSanityData = (cacheKey, query, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [dataSource, setDataSource] = useState(null);

  // States for total count and total pages for pagination
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Call both hooks unconditionally at the top level
  const pageRefreshContext = usePageRefresh();
  const globalRefreshContext = useGlobalRefresh();
  const { registerComponent, isBrowserOnline } = useGlobalOfflineStatus(); // Destructure isBrowserOnline

  const {
    enableOffline = true,
    forceRefresh = false,
    onDataUpdate,
    componentName,
    usePageContext = false,
    isPaginated = false,
    paginationGroup = null, // e.g., 'seo-all-blogs', 'ai-tools-all-blogs'
    currentPage = 1, // Keep this prop as it's useful for the consumer
    limit = 10,
      fallbackData = null // Add this line

  } = options;

  // Determine which refresh context to use based on the option
  const refreshContext = usePageContext ? pageRefreshContext : globalRefreshContext;
  const { registerRefresh, unregisterRefresh, registerDataSource: registerContextDataSource } = refreshContext; // Renamed to avoid conflict

  // Use refs to hold the latest values for callbacks
  const isOfflineRef = useRef(isOffline);
  const dataSourceRef = useRef(dataSource);

  useEffect(() => {
    isOfflineRef.current = isOffline;
    dataSourceRef.current = dataSource;
  }, [isOffline, dataSource]);

  // Removed generateCacheKey - it's not used internally here

  // Get all pagination cache keys for a group (not used for this hook's internal logic, but useful for refreshAllPages)
  const getPaginationCacheKeys = useCallback((baseKey, maxPages = 20) => {
    if (!isPaginated) return [baseKey];
    const keys = [];
    for (let i = 1; i <= maxPages; i++) {
      keys.push(`${baseKey}-page-${i}`);
    }
    return keys;
  }, [isPaginated]);

  // --- NEW: Add a cache key for total count for a pagination group ---
  const getGroupTotalCountCacheKey = useCallback((groupName) => {
    // This key will be prefixed with 'cache_' by the CacheService when stored in localStorage
    return `${groupName}-total-count`;
  }, []);



const fetchFreshData = useCallback(async (showLoading = true, refreshAllPages = false) => {
  if (showLoading) setIsLoading(true);
  setError(null);
  
  // Don't immediately set isOffline to false, wait for actual fetch result
  
  try {
    const queryParams = options.queryParams || {};
    const result = await client.fetch(query, queryParams);
    const freshData = Array.isArray(result) ? result : result.data;
    const fetchedTotalCount = result?.total || freshData.length;

    cacheService.set(cacheKey, freshData, 'network');
    setData(freshData);
    setDataSource('network');
    setIsOffline(false); // Only set offline to false after successful fetch
    registerContextDataSource(componentName || cacheKey, 'network', true);
    
    localStorage.setItem(`${componentName || cacheKey}_last_update`, Date.now().toString());

    if (isPaginated && paginationGroup) {
      cacheService.set(getGroupTotalCountCacheKey(paginationGroup), fetchedTotalCount, 'network');
      console.log(`📊 Stored total count ${fetchedTotalCount} for group: ${paginationGroup}`);
      setTotalCount(fetchedTotalCount);
      setTotalPages(Math.ceil(fetchedTotalCount / limit));

      if (refreshAllPages) {
        const allPaginationKeys = getPaginationCacheKeys(paginationGroup);
        allPaginationKeys.forEach(key => {
          if (key !== cacheKey) {
            cacheService.clear(key);
          }
        });
        localStorage.setItem(`${paginationGroup}_pagination_refresh`, Date.now().toString());
        console.log(`🔄 Cleared all pagination cache for group: ${paginationGroup}`);
      }
    } else {
      setTotalCount(freshData.length);
      setTotalPages(1);
    }

    setIsLoading(false);
    if (onDataUpdate) {
      onDataUpdate(freshData, fetchedTotalCount);
    }
    return { data: freshData, total: fetchedTotalCount };
    
  } catch (fetchError) {
    console.error(`Failed to fetch ${cacheKey}:`, fetchError);
    
    // Handle offline state more carefully
    const cachedResult = cacheService.get(cacheKey);
    
    if (isPaginated && paginationGroup) {
      const cachedTotal = cacheService.get(getGroupTotalCountCacheKey(paginationGroup));
      if (cachedTotal) {
        setTotalCount(cachedTotal.data);
        setTotalPages(Math.ceil(cachedTotal.data / limit));
      } else {
        setTotalCount(0);
        setTotalPages(0);
      }
    }

    if (cachedResult) {
      setData(cachedResult.data);
      const fallbackSource = `${cachedResult.source}-fallback`;
      setDataSource(fallbackSource);
      registerContextDataSource(componentName || cacheKey, fallbackSource, false);
      
      // Only set offline if we're actually offline or if this is a network error
      const isActuallyOffline = !navigator.onLine || fetchError.message.includes('NetworkError') || fetchError.message.includes('fetch');
      setIsOffline(isActuallyOffline);
    } else {
      setError(fetchError);
      setIsOffline(true);
      setDataSource('none');
    }

    setIsLoading(false);
    
    if (!cachedResult) {
      throw fetchError;
    }
  }
}, [query, cacheKey, onDataUpdate, registerContextDataSource, componentName, isPaginated, paginationGroup, getPaginationCacheKeys, getGroupTotalCountCacheKey, limit, options.queryParams]);
// Check if pagination cache is stale (or if total count is missing/stale)
  const isPaginationCacheStale = useCallback(() => {
    if (!isPaginated || !paginationGroup) return false;

    // Check if the total count cache key is stale/missing
    const totalCountKey = getGroupTotalCountCacheKey(paginationGroup);
    const cachedTotalResult = cacheService.get(totalCountKey); // This retrieves the full cacheEntry
    if (!cachedTotalResult || cachedTotalResult.shouldRevalidate) {
      console.log(`Total count cache missing or stale for group ${paginationGroup}, considering stale.`);
      return true; // If total count isn't cached or is stale, the whole group is stale for revalidation
    }

    const groupRefreshTime = localStorage.getItem(`${paginationGroup}_pagination_refresh`);
    const componentUpdateTime = localStorage.getItem(`${componentName || cacheKey}_last_update`);

    // If no group refresh time or component update time, assume not stale (first load scenario)
    if (!groupRefreshTime || !componentUpdateTime) return false;

    return parseInt(groupRefreshTime) > parseInt(componentUpdateTime);
  }, [isPaginated, paginationGroup, componentName, cacheKey, getGroupTotalCountCacheKey]);

  useEffect(() => {
    const loadData = async () => {
      const cachedResult = cacheService.get(cacheKey); // Get full cache entry
      const isPaginationStaleFlag = isPaginationCacheStale();

      // Removed `let cachedTotalCount = 0;` from here

      if (cachedResult && !forceRefresh && !isPaginationStaleFlag) {
        setData(cachedResult.data);
        setDataSource(cachedResult.source);
        registerContextDataSource(componentName || cacheKey, cachedResult.source, false); // Use renamed registerContextDataSource
        setIsLoading(false);
        setIsOffline(false);

        // --- NEW: Set total count and total pages from cache if available for paginated content ---
        if (isPaginated && paginationGroup) {
          const totalCountKey = getGroupTotalCountCacheKey(paginationGroup);
          const cachedTotalEntry = cacheService.get(totalCountKey); // Get full cache entry
          if (cachedTotalEntry) {
            setTotalCount(cachedTotalEntry.data);
            setTotalPages(Math.ceil(cachedTotalEntry.data / limit));
          } else {
            // Fallback: If total count is missing but page data exists,
            // assume 0 or infer from current data length for display,
            // but the `isPaginationCacheStaleFlag` should have already triggered a fetch.
            setTotalCount(cachedResult.data ? cachedResult.data.length : 0);
            setTotalPages(cachedResult.data && limit > 0 ? Math.ceil(cachedResult.data.length / limit) : 0);
          }
        } else {
          // For non-paginated data, totalCount is just the data length
          setTotalCount(cachedResult.data ? cachedResult.data.length : 0);
          setTotalPages(1);
        }

        // Background refresh if needed and online
        if (cachedResult.shouldRevalidate && isBrowserOnline) { // Use isBrowserOnline from context
          try {
            await fetchFreshData(false); // This will update the total count as well
          } catch (error) {
            console.warn('Background refresh failed:', error);
          }
        }
      } else {
        // No valid cached data, or forceRefresh/stale pagination, fetch fresh
        // Check online status before fetching
        if (isBrowserOnline) { // Use isBrowserOnline from context
          try {
            await fetchFreshData(true, isPaginationStaleFlag); // This will update the total count
          } catch (error) {
            // Error handled in fetchFreshData, so no explicit action here
          }
        } else if (enableOffline) {
          // Offline, no fresh data to fetch, try to serve whatever is available in cache
          const offlineCachedResult = cacheService.get(cacheKey);
          if (offlineCachedResult) {
            setData(offlineCachedResult.data);
            setDataSource('offline');
            registerContextDataSource(componentName || cacheKey, 'offline', false); // Use renamed registerContextDataSource
            setIsOffline(true);
            setIsLoading(false);

            // --- NEW: Set total count and total pages from cache for offline display ---
            if (isPaginated && paginationGroup) {
              const totalCountKey = getGroupTotalCountCacheKey(paginationGroup);
              const cachedTotalEntry = cacheService.get(totalCountKey);
              if (cachedTotalEntry) {
                setTotalCount(cachedTotalEntry.data);
                setTotalPages(Math.ceil(cachedTotalEntry.data / limit));
              } else {
                // If offline and no total count cached, assume 0 for a safe "next" button disable
                setTotalCount(0);
                setTotalPages(0);
              }
            } else {
              setTotalCount(offlineCachedResult.data ? offlineCachedResult.data.length : 0);
              setTotalPages(1);
            }

          } else {
            setError(new Error('No cached data available offline'));
            setIsOffline(true);
            setDataSource('none');
            registerContextDataSource(componentName || cacheKey, 'none', false); // Use renamed registerContextDataSource
            setIsLoading(false);
          }
        } else {
          setError(new Error('Not online and offline mode disabled.'));
          setIsOffline(true);
          setDataSource('none');
          registerContextDataSource(componentName || cacheKey, 'none', false); // Use renamed registerContextDataSource
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [
    cacheKey, query, forceRefresh, enableOffline, fetchFreshData, registerContextDataSource, // Renamed
    componentName, isPaginationCacheStale, isPaginated, paginationGroup,
    getGroupTotalCountCacheKey, limit, isBrowserOnline // Added isBrowserOnline
  ]);

// In useCachedSanityData hook, replace the existing useEffect for online/offline detection:
useEffect(() => {
  const handleOnline = () => {
    console.log(`Component ${cacheKey} detected online, setting offline to false`);
    setIsOffline(false); // Always set to false when online
    
    const cachedResult = cacheService.get(cacheKey);
    const isPaginationStale = isPaginationCacheStale();
    
    if (isOfflineRef.current || (cachedResult && cachedResult.shouldRevalidate) || isPaginationStale) {
      console.log(`Component ${cacheKey} attempting refresh after coming online.`);
      fetchFreshData(false, isPaginationStale);
    }
  };

  const handleOffline = () => {
    console.log(`Component ${cacheKey} detected offline`);
    setIsOffline(true);
  };

  // Initial online status check
  if (typeof navigator !== 'undefined') {
    const initialOnlineStatus = navigator.onLine;
    setIsOffline(!initialOnlineStatus);
    console.log(`Initial online status for ${cacheKey}: ${initialOnlineStatus ? 'online' : 'offline'}`);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
}, [cacheKey, fetchFreshData, isPaginationCacheStale]);
  // Enhanced refresh function with pagination support
  const refresh = useCallback((refreshAllPages = false) => {
    return fetchFreshData(true, refreshAllPages);
  }, [fetchFreshData]);

  useEffect(() => {
    const name = componentName || cacheKey;
    registerRefresh(name, refresh, { isPaginated, paginationGroup }); // Pass paginationInfo to registerRefresh
    return () => {
      unregisterRefresh(name);
    };
  }, [registerRefresh, unregisterRefresh, refresh, cacheKey, componentName, isPaginated, paginationGroup]);

  // Register with global offline status system
  useEffect(() => {
    const name = componentName || cacheKey;
    const unregister = registerComponent(name, {
      isOffline: isOffline,
      dataSource: dataSource,
      refreshFn: refresh,
      scope: usePageContext ? 'page' : 'global',
      isPaginated: isPaginated,
      paginationGroup: paginationGroup
    });

    return () => {
      unregister();
    };
  }, [registerComponent, isOffline, dataSource, refresh, cacheKey, componentName, usePageContext, isPaginated, paginationGroup]);
// In your useCachedSanityData hook, add this useEffect for initial data:
useEffect(() => {
  if (fallbackData && !data) {
    setData(fallbackData);
    setDataSource('server-fallback');
    setIsLoading(false);
    registerContextDataSource(componentName || cacheKey, 'server-fallback', true);
  }
}, [fallbackData, data, setData, setDataSource, setIsLoading, registerContextDataSource, componentName, cacheKey]);
  return {
    data,
    isLoading,
    error,
    isOffline,
    dataSource,
    refresh,
    refreshAllPages: () => refresh(true),
    isPaginationStale: isPaginationCacheStale(),
    totalCount,
    totalPages,

  };
};
