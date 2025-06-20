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
      fallbackData = null, // Add this line
        enableForceRefreshDetection = false,  // Add this new option
 // ADD THESE NEW OPTIONS:
  enableImmediateRefresh = false,
  enableCustomEventListening = false

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



const fetchFreshData = useCallback(async (showLoading = true, refreshAllPages = false, forceIgnoreCache = false) => {
  if (showLoading) setIsLoading(true);
  setError(null);
  
  try {
    const queryParams = options.queryParams || {};
    const result = await client.fetch(query, queryParams);
    const freshData = Array.isArray(result) ? result : result.data;
    const fetchedTotalCount = result?.total || freshData.length;
    
    // SUCCESS: Cache and update state
    // If forceIgnoreCache is true, clear the cache first
    if (forceIgnoreCache) {
      cacheService.clear(cacheKey);
      console.log(`🗑️ Force cleared cache for: ${cacheKey}`);
    }
    
    cacheService.set(cacheKey, freshData, 'network');
    setData(freshData); // This should immediately update the UI
    setDataSource('network');
    setIsOffline(false);
    registerContextDataSource(componentName || cacheKey, 'network', true);
    localStorage.setItem(`${componentName || cacheKey}_last_update`, Date.now().toString());
    
    // Clear any force refresh flags after successful update
    if (forceIgnoreCache && typeof window !== 'undefined') {
      localStorage.removeItem(`${componentName || cacheKey}_force_refresh`);
      console.log(`✅ Cleared force refresh flag for: ${componentName || cacheKey}`);
    }
    
    // Handle pagination data
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
    
    // Handle error state more carefully
    const cachedResult = cacheService.get(cacheKey);
    
    // Handle pagination total count for error cases
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
      // We have cached data, use it
      setData(cachedResult.data);
      const fallbackSource = `${cachedResult.source}-fallback`;
      setDataSource(fallbackSource);
      registerContextDataSource(componentName || cacheKey, fallbackSource, false);
      
      // Determine if we should show offline status
      const isActuallyOffline = !navigator.onLine || 
                                fetchError.message.includes('NetworkError') || 
                                fetchError.message.includes('fetch') || 
                                fetchError.name === 'TypeError';
      setIsOffline(isActuallyOffline);
    } else if (fallbackData) {
      // No cached data but we have fallback data
      setData(fallbackData);
      setDataSource('fallback');
      registerContextDataSource(componentName || cacheKey, 'fallback', false);
      setIsOffline(!navigator.onLine);
    } else {
      // No cached data and no fallback
      setError(fetchError);
      setIsOffline(true);
      setDataSource('none');
      registerContextDataSource(componentName || cacheKey, 'none', false);
    }
    
    setIsLoading(false);
    
    // Only throw error if we have no data to show
    if (!cachedResult && !fallbackData) {
      throw fetchError;
    }
  }
}, [query, cacheKey, onDataUpdate, registerContextDataSource, componentName, isPaginated, paginationGroup, getPaginationCacheKeys, getGroupTotalCountCacheKey, limit, options.queryParams, fallbackData]);
const handleImmediateRefresh = useCallback(async () => {
  console.log(`🔄 Immediate refresh triggered for ${componentName || cacheKey}`);
  try {
    await fetchFreshData(true, false, true); // Force ignore cache
  } catch (error) {
    console.error(`Immediate refresh failed for ${componentName || cacheKey}:`, error);
  }
}, [componentName, cacheKey, fetchFreshData]);

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

const checkForceRefreshFlag = useCallback(() => {
  if (typeof window === 'undefined') return false;
  
  const forceRefreshKey = `${componentName || cacheKey}_force_refresh`;
  const forceRefreshTime = localStorage.getItem(forceRefreshKey);
  const lastUpdateTime = localStorage.getItem(`${componentName || cacheKey}_last_update`);
  
  if (forceRefreshTime) {
    console.log(`🔄 Force refresh flag found for ${componentName || cacheKey}`, {
      forceRefreshTime,
      lastUpdateTime
    });
    
    // Always return true if force refresh flag exists, regardless of last update time
    return true;
  }
  
  return false;
}, [componentName, cacheKey]);
useEffect(() => {
  if (!enableCustomEventListening || !componentName) return;

  const handleCustomRefresh = (event) => {
    const { componentName: eventComponentName } = event.detail || {};
    if (eventComponentName === componentName) {
      console.log(`🎯 Custom refresh event received for ${componentName}`);
      handleImmediateRefresh();
    }
  };

  const handleArticleUpdate = (event) => {
    const { documentType, slug } = event.detail || {};
    if (componentName.includes(documentType) && componentName.includes(slug)) {
      console.log(`📰 Article update event received for ${componentName}`);
      handleImmediateRefresh();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('force-component-refresh', handleCustomRefresh);
    window.addEventListener('article-update', handleArticleUpdate);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('force-component-refresh', handleCustomRefresh);
      window.removeEventListener('article-update', handleArticleUpdate);
    }
  };
}, [enableCustomEventListening, componentName, handleImmediateRefresh])

useEffect(() => {
  const loadData = async () => {
    const shouldForceRefresh = checkForceRefreshFlag();
    const isPaginationStaleFlag = isPaginationCacheStale();
    const cachedResult = cacheService.get(cacheKey);
    
    // Force refresh takes highest priority
    if (shouldForceRefresh) {
      console.log(`🔄 Force refreshing ${componentName || cacheKey}`);
      if (isBrowserOnline) {
        try {
          await fetchFreshData(true, isPaginationStaleFlag, true); // forceIgnoreCache = true
          // Clear the force refresh flag after successful refresh
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`${componentName || cacheKey}_force_refresh`);
          }
        } catch (error) {
          console.warn('Force refresh failed:', error);
        }
      }
      return;
    }
    
    if (cachedResult && !forceRefresh && !isPaginationStaleFlag) {
      // We have valid cached data
      setData(cachedResult.data);
      const initialSource = cachedResult.source === 'network' ? 'cache' : cachedResult.source;
      setDataSource(initialSource);
      registerContextDataSource(componentName || cacheKey, initialSource, false);
      setIsLoading(false);
      setIsOffline(false);
      
      // Handle pagination data from cache
      if (isPaginated && paginationGroup) {
        const totalCountKey = getGroupTotalCountCacheKey(paginationGroup);
        const cachedTotalEntry = cacheService.get(totalCountKey);
        if (cachedTotalEntry) {
          setTotalCount(cachedTotalEntry.data);
          setTotalPages(Math.ceil(cachedTotalEntry.data / limit));
        } else {
          setTotalCount(cachedResult.data ? cachedResult.data.length : 0);
          setTotalPages(cachedResult.data && limit > 0 ? Math.ceil(cachedResult.data.length / limit) : 0);
        }
      } else {
        setTotalCount(cachedResult.data ? cachedResult.data.length : 0);
        setTotalPages(1);
      }
      
      // Background refresh if needed and online
      if (cachedResult.shouldRevalidate && isBrowserOnline) {
        try {
          await fetchFreshData(false);
        } catch (error) {
          console.warn('Background refresh failed:', error);
        }
      }
    } else {
      // No valid cached data, or force refresh, or stale pagination
      if (isBrowserOnline) {
        try {
          await fetchFreshData(true, isPaginationStaleFlag, shouldForceRefresh);
        } catch (error) {
          console.warn('Initial fetch failed:', error);
        }
      } else if (enableOffline) {
        // Offline handling
        const offlineCachedResult = cacheService.get(cacheKey);
        if (offlineCachedResult) {
          setData(offlineCachedResult.data);
          setDataSource('offline');
          registerContextDataSource(componentName || cacheKey, 'offline', false);
          setIsOffline(true);
          setIsLoading(false);
          
          // Handle pagination data for offline display
          if (isPaginated && paginationGroup) {
            const totalCountKey = getGroupTotalCountCacheKey(paginationGroup);
            const cachedTotalEntry = cacheService.get(totalCountKey);
            if (cachedTotalEntry) {
              setTotalCount(cachedTotalEntry.data);
              setTotalPages(Math.ceil(cachedTotalEntry.data / limit));
            } else {
              setTotalCount(0);
              setTotalPages(0);
            }
          } else {
            setTotalCount(offlineCachedResult.data ? offlineCachedResult.data.length : 0);
            setTotalPages(1);
          }
        } else if (fallbackData) {
          setData(fallbackData);
          setDataSource('server-fallback');
          registerContextDataSource(componentName || cacheKey, 'server-fallback', false);
          setIsOffline(false);
          setIsLoading(false);
        } else {
          setError(new Error('No cached data available offline'));
          setIsOffline(true);
          setDataSource('none');
          registerContextDataSource(componentName || cacheKey, 'none', false);
          setIsLoading(false);
        }
      } else {
        setError(new Error('Not online and offline mode disabled.'));
        setIsOffline(true);
        setDataSource('none');
        registerContextDataSource(componentName || cacheKey, 'none', false);
        setIsLoading(false);
      }
    }
  };
  
  loadData();
}, [cacheKey, query, forceRefresh, enableOffline, fetchFreshData, registerContextDataSource, componentName, isPaginationCacheStale, isPaginated, paginationGroup, getGroupTotalCountCacheKey, limit, isBrowserOnline, fallbackData, checkForceRefreshFlag]);
// In useCachedSanityData hook, replace the existing useEffect for online/offline detection:
// Replace the existing online/offline useEffect in useCachedSanityData with this:
useEffect(() => {
    const handleOnline = async () => {
        console.log(`Component ${cacheKey} detected online`);
        
        // Always set offline to false when online
        setIsOffline(false);
        
        const cachedResult = cacheService.get(cacheKey);
        const isPaginationStale = isPaginationCacheStale();
        
        // Check if we need to refresh due to being offline or stale cache
        if (isOfflineRef.current || 
            (cachedResult && cachedResult.shouldRevalidate) || 
            isPaginationStale ||
            !cachedResult) { // Also refresh if no cached data at all
            
            console.log(`Component ${cacheKey} attempting refresh after coming online.`);
            try {
                await fetchFreshData(false, isPaginationStale);
            } catch (error) {
                console.warn(`Background refresh failed for ${cacheKey}:`, error);
                // Don't set offline to true here, as we're online but just failed to fetch
            }
        }
    };

    const handleOffline = () => {
        console.log(`Component ${cacheKey} detected offline`);
        setIsOffline(true);
    };

    // Enhanced initial online status check
    if (typeof navigator !== 'undefined') {
        const initialOnlineStatus = navigator.onLine;
        
        // Set initial offline state based on browser status AND available data
        if (!initialOnlineStatus) {
            setIsOffline(true);
        } else {
            // We're online, but check if we have data
            const cachedResult = cacheService.get(cacheKey);
            if (!cachedResult && !fallbackData) {
                // Online but no cached data and no fallback - this is normal initial state
                setIsOffline(false);
            } else {
                setIsOffline(false);
            }
        }
        
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
}, [cacheKey, fetchFreshData, isPaginationCacheStale, fallbackData]);
  // Enhanced refresh function with pagination support
// Enhanced refresh function with pagination support
// Replace the existing refresh function
// Add this function in useCachedSanityData hook
const clearCacheAndRefresh = useCallback(async () => {
  console.log(`🧹 Force clearing cache and refreshing for: ${componentName || cacheKey}`);
  
  // Clear cache first
  cacheService.clear(cacheKey);
  
  // Clear any localStorage flags
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${componentName || cacheKey}_force_refresh`);
    localStorage.removeItem(`${componentName || cacheKey}_last_update`);
  }
  
  // Fetch fresh data with force ignore cache
  return await fetchFreshData(true, false, true);
}, [cacheKey, componentName, fetchFreshData]);
const refresh = useCallback((refreshAllPages = false, forceIgnoreCache = false) => {
  if (forceIgnoreCache) {
    return clearCacheAndRefresh();
  }
  return fetchFreshData(true, refreshAllPages, forceIgnoreCache);
}, [fetchFreshData, clearCacheAndRefresh]);

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
  // Add this useEffect in your useCachedSanityData hook after the existing useEffect for registration
useEffect(() => {
  const name = componentName || cacheKey;
  console.log(`Registering component: ${name}`, {
    dataSource: dataSourceRef.current,
    isOffline: isOfflineRef.current,
    usePageContext
  });
}, [componentName, cacheKey, usePageContext]);
// ADD this new useEffect to your useCachedSanityData hook
useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleForceRefresh = async (event) => {
        const expectedComponentName = componentName || cacheKey;
        
        // Check if this event is for our component
        if (event.detail?.componentName === expectedComponentName) {
            console.log(`🚀 Processing force refresh for ${expectedComponentName}`);
            
            // Clear cache first
            cacheService.clear(cacheKey);
            
            // Then fetch fresh data with force ignore cache
            try {
                await fetchFreshData(true, false, true); // showLoading, refreshAllPages, forceIgnoreCache
                console.log(`✅ Force refresh completed for ${expectedComponentName}`);
            } catch (error) {
                console.error(`❌ Force refresh failed for ${expectedComponentName}:`, error);
            }
        }
    };

    window.addEventListener('force-article-refresh', handleForceRefresh);
    
    return () => {
        window.removeEventListener('force-article-refresh', handleForceRefresh);
    };
}, [componentName, cacheKey, fetchFreshData]);


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