// React_Query_Caching/useUnifiedCache.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheSystem } from './cacheSystem';
import { getCacheConfig } from './cacheKeys';
import { useCacheContext } from './CacheProvider';
import { client } from '@/sanity/lib/client'; // Sanity client for fetching

// Import the new logging utility
import { logCacheOperation } from './cacheDiagnostics';

export const useUnifiedCache = (cacheKeyIdentifier, query, params = {}, options = {}) => {
  const {
    staleTime,
    maxAge,
    enableOffline,
    componentName = 'Unknown',
    onSuccess,
    onError,
    enabled = true,
    group = null,
    initialData = null,
    serverData = null, // Data provided from the server (with __source property)
    preferServerData = true, // Whether to initially use serverData if available
  } = options;

  const { addRefreshingKey, removeRefreshingKey, isOnline: networkIsOnline } = useCacheContext();
  const cacheConfig = getCacheConfig(cacheKeyIdentifier);
  
  // Apply defaults
  const finalStaleTime = staleTime ?? cacheConfig.staleTime;
  const finalMaxAge = maxAge ?? cacheConfig.maxAge;
  const finalEnableOffline = enableOffline ?? cacheConfig.enableOffline;

  // Initialize state with server data if available, extracting the actual data
  const [data, setData] = useState(() => {
    if (serverData && preferServerData) return serverData;
    return initialData;
  });
  
  const [isLoading, setIsLoading] = useState(() => {
    // Don't show loading if we have server data
    if (serverData && preferServerData) return false;
    return initialData === null && enabled;
  });
  
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  // Initialize cacheSource based on serverData's __source
  const [cacheSource, setCacheSource] = useState(() => {
    if (serverData && preferServerData) {
      return serverData.__source || 'server-data'; // Use the source from serverData
    }
    if (initialData) return 'initial-data';
    return null;
  });
  
  const [lastUpdated, setLastUpdated] = useState(() => {
    if (serverData && preferServerData) return new Date();
    if (initialData) return new Date();
    return null;
  });

  // Refs for stable references
  const queryRef = useRef(query);
  const paramsRef = useRef(params);
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef(null);
  const isCurrentlyFetchingRef = useRef(false);
  const currentFetchIdRef = useRef(0);
  const lastRenderedQueryStringRef = useRef("");
  const serverDataRef = useRef(serverData);

  // Store callback refs
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    queryRef.current = query;
    paramsRef.current = params;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    serverDataRef.current = serverData;
  }, [query, params, onSuccess, onError, serverData]);

  // Component lifecycle
  useEffect(() => {
    mountedRef.current = true;
    console.log(`[useUnifiedCache ${componentName}] Component mounted.`);
    return () => {
      mountedRef.current = false;
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      console.log(`[useUnifiedCache ${componentName}] Component unmounting.`);
    };
  }, [componentName]);

  // Enhanced fetch function that considers server data
  const fetchData = useCallback(async (triggeredForceRefresh = false) => {
    if (!enabled) {
      if (!data && !isCurrentlyFetchingRef.current) {
        setIsLoading(false);
        setError(null);
        setIsStale(false);
        setCacheSource(null);
        setLastUpdated(null);
      }
      return;
    }

    if (isCurrentlyFetchingRef.current) {
      return;
    }

    isCurrentlyFetchingRef.current = true;
    const currentFetchId = ++currentFetchIdRef.current;
    const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
    
    addRefreshingKey(fullCacheKey);
    setError(null);
    setIsLoading(prev => prev ? prev : true);

    try {
      let cachedResult = null;
      let useServerDataFirst = false;

      // Check if we have fresh server data and should use it
      if (serverDataRef.current && preferServerData && !triggeredForceRefresh) {
        useServerDataFirst = true;
        
        if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
          setData(serverDataRef.current);
          setIsStale(false);
          // Use the actual source from serverData, defaulting to 'server-data' if not specified
          const sourceFromProp = serverDataRef.current.__source || 'server-data'; 
          setCacheSource(sourceFromProp);
          setLastUpdated(new Date());
          
          // Store server data in local cache for future use
          // IMPORTANT: Remove the __source tag before storing in IndexedDB
          const dataToCache = { ...serverDataRef.current };
          delete dataToCache.__source; 
          await cacheSystem.set(fullCacheKey, dataToCache, {
            keyIdentifier: cacheKeyIdentifier,
            staleTime: finalStaleTime,
            maxAge: finalMaxAge,
            query: queryRef.current,
            params: paramsRef.current,
            group: group,
            enableOffline: finalEnableOffline,
          });

          // NEW LOGGING ADDITION: Log with the specific server source
          logCacheOperation('HIT', sourceFromProp, fullCacheKey, dataToCache); // Log data without __source

          if (onSuccessRef.current) onSuccessRef.current(serverDataRef.current);
          return; // Exit as we've successfully used server data
        }
      }

      // Try cache if not using server data or force refresh
      if (!useServerDataFirst && !triggeredForceRefresh) {
        cachedResult = await cacheSystem.get(fullCacheKey, {
          staleTime: finalStaleTime,
          maxAge: finalMaxAge,
          enableOffline: finalEnableOffline,
          query: queryRef.current,
          params: paramsRef.current,
          keyIdentifier: cacheKeyIdentifier,
          group: group,
        });

        if (!mountedRef.current || currentFetchId !== currentFetchIdRef.current) {
          return;
        }

        if (cachedResult) {
          setData(cachedResult.data);
          setIsStale(cachedResult.isStale);
          // Set cacheSource to 'indexeddb' or 'memory' as returned by cacheSystem
          setCacheSource(cachedResult.source); 
          setLastUpdated(new Date(Date.now() - cachedResult.age));

          // NEW LOGGING ADDITION
          logCacheOperation('HIT', cachedResult.source, fullCacheKey, cachedResult.data);

          if (!cachedResult.isStale) {
            if (onSuccessRef.current) onSuccessRef.current(cachedResult.data);
            return; // Exit if not stale and not needing background fetch
          }
        }
      }

      // Network fetch if needed (either forced, no server data, or stale/missing cache)
      const needsNetworkFetch = triggeredForceRefresh || 
        (!useServerDataFirst && (!cachedResult || cachedResult.isStale));

      if (needsNetworkFetch && networkIsOnline && navigator.onLine) {
        if (fetchControllerRef.current) {
          fetchControllerRef.current.abort();
        }
        fetchControllerRef.current = new AbortController();
        const signal = fetchControllerRef.current.signal;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network request timed out')), 15000)
        );
        const fetchPromise = client.fetch(queryRef.current, paramsRef.current, { signal });
        const freshData = await Promise.race([fetchPromise, timeoutPromise]);

        if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
          await cacheSystem.set(fullCacheKey, freshData, {
            keyIdentifier: cacheKeyIdentifier,
            staleTime: finalStaleTime,
            maxAge: finalMaxAge,
            query: queryRef.current,
            params: paramsRef.current,
            group: group,
            enableOffline: finalEnableOffline,
          });

          setData(freshData);
          setIsStale(false);
          setCacheSource('network'); // Data came directly from network fetch
          setLastUpdated(new Date());

          // NEW LOGGING ADDITION
          logCacheOperation('MISS', 'network', fullCacheKey, freshData); // Log as a miss from local cache, triggering network

          if (onSuccessRef.current) onSuccessRef.current(freshData);
        }
      } else if (!networkIsOnline || !navigator.onLine) {
        // Handle offline scenario (if we couldn't fetch and are offline)
        if (finalEnableOffline && cachedResult && cachedResult.data !== null) {
          if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
            setData(cachedResult.data);
            setIsStale(true); // Data is potentially stale if from offline cache
            setCacheSource('offline-cache'); // Explicitly mark as offline cache
            setLastUpdated(new Date(Date.now() - cachedResult.age));
            setError(null);

            // NEW LOGGING ADDITION for offline cache hit
            logCacheOperation('HIT', 'offline-cache', fullCacheKey, cachedResult.data);

            if (onSuccessRef.current) onSuccessRef.current(cachedResult.data);
          }
        } else {
          // No cached data available and offline
          if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
            setData(null);
            setIsStale(false);
            setCacheSource('offline-no-data');
            setLastUpdated(null);
            const offlineError = new Error('You are offline and no cached data is available for this content.');
            setError(offlineError);

            // NEW LOGGING ADDITION for offline no data
            logCacheOperation('MISS', 'offline-no-data', fullCacheKey, null);

            if (onErrorRef.current) onErrorRef.current(offlineError);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError' && mountedRef.current && currentFetchId === currentFetchIdRef.current) {
        setError(err);
        setCacheSource('error');
        // NEW LOGGING ADDITION for errors during fetch
        logCacheOperation('ERROR', 'fetch-error', fullCacheKey, null);
        if (onErrorRef.current) onErrorRef.current(err);
      }
    } finally {
      if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
        setIsLoading(false);
        isCurrentlyFetchingRef.current = false;
        removeRefreshingKey(fullCacheKey);
      }
    }
  }, [
    cacheKeyIdentifier, 
    enabled, 
    finalStaleTime, 
    finalMaxAge, 
    finalEnableOffline, 
    networkIsOnline, 
    addRefreshingKey, 
    removeRefreshingKey, 
    componentName, 
    group,
    preferServerData,
    data // Include data in dependency array if you want fetchData to re-run when data changes
  ]);

  // Main effect - handle initial load, server data changes, and cache subscription
  useEffect(() => {
    const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
    const currentQueryString = JSON.stringify({ query: queryRef.current, params: paramsRef.current });
    const queryHasChanged = currentQueryString !== lastRenderedQueryStringRef.current;

    // If serverData prop changes and we prefer it, re-initialize state and log
    // Only if the new serverData is actually different from current data state
    if (serverDataRef.current && preferServerData && serverDataRef.current !== data) {
      setData(serverDataRef.current);
      setIsStale(false);
      const sourceFromProp = serverDataRef.current.__source || 'server-data';
      setCacheSource(sourceFromProp);
      setLastUpdated(new Date());
      setIsLoading(false);
      // Log this as an update if the component already had data, or a hit if it's the first time
      logCacheOperation(data ? 'UPDATE' : 'HIT', `server-data-prop-${sourceFromProp}`, fullCacheKey, serverDataRef.current);
      if (onSuccessRef.current) onSuccessRef.current(serverDataRef.current);
    }
    
    // Trigger initial fetch if enabled, query changed, or no data yet
    if (enabled && (queryHasChanged || (data === null && !isLoading && !isCurrentlyFetchingRef.current))) {
      // If we have serverData and prefer it, fetchData will handle the initial setting and logging.
      // Otherwise, it will attempt to fetch from cache/network.
      if (!serverDataRef.current || !preferServerData || queryHasChanged) {
        fetchData(false); // Do not force refresh if it's initial load and serverData is used
      }
      lastRenderedQueryStringRef.current = currentQueryString;
    }

    // Cache subscription (for IndexedDB updates happening from other parts of the app)
    const unsubscribe = cacheSystem.subscribe(fullCacheKey, (cacheData) => {
      if (mountedRef.current) {
        if (cacheData) {
          // Only update if we don't have server data, or server data is not preferred,
          // or if the cached data is newer/different than current server data (advanced logic for specific needs)
          if (!serverDataRef.current || !preferServerData || cacheData.data !== data) {
            setData(cacheData.data);
            setIsStale(cacheData.isStale || false);
            const subSource = cacheData.source || 'cache-update';
            setCacheSource(subSource);
            setLastUpdated(new Date(Date.now() - (cacheData.age || 0)));
            setError(cacheData.error || null);
            // NEW LOGGING ADDITION for cache subscription updates
            logCacheOperation('UPDATE', `subscription-${subSource}`, fullCacheKey, cacheData.data);
          }
        } else if (!serverDataRef.current) { // If there's no server data, and cache is invalidated
          setData(null);
          setIsStale(false);
          setCacheSource('invalidated');
          setLastUpdated(null);
          setError(null);
          // NEW LOGGING ADDITION for cache invalidation via subscription
          logCacheOperation('INVALIDATED', 'subscription', fullCacheKey, null);
        }
        
        if (cacheData?.data !== null || cacheData?.error !== null) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, cacheKeyIdentifier, componentName, fetchData, serverData, preferServerData, data]);

  // Background refresh for stale data
  useEffect(() => {
    // Only trigger if data is present, stale, online, and not already fetching
    if (enabled && data !== null && isStale && networkIsOnline && 
        navigator.onLine && !isCurrentlyFetchingRef.current) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && isStale && networkIsOnline && 
            navigator.onLine && !isCurrentlyFetchingRef.current) {
          // NEW LOGGING ADDITION for background stale revalidation
          logCacheOperation('REVALIDATE', 'background-stale', cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current), data);
          fetchData(false); // Fetch, but not as a forced refresh
        }
      }, 100); // Short delay to allow render before revalidation

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [enabled, data, isStale, networkIsOnline, fetchData, componentName, cacheKeyIdentifier]); // Add cacheKeyIdentifier to deps

  // Manual refresh function
  const refresh = useCallback(async (isManualForceRefresh = true) => {
    if (!isCurrentlyFetchingRef.current) {
      // NEW LOGGING ADDITION for manual refresh
      logCacheOperation('REFRESH', 'manual-trigger', cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current), data);
      await fetchData(isManualForceRefresh);
    }
  }, [fetchData, cacheKeyIdentifier, data]); // Add cacheKeyIdentifier and data to deps for logging context

  return {
    data,
    isLoading,
    error,
    isStale,
    cacheSource,
    lastUpdated,
    refresh
  };
};