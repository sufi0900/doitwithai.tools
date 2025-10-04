// Fixed useUnifiedCache.js - Remove data dependency and add fetch guards
import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheSystem } from './cacheSystem';
import { getCacheConfig } from './cacheKeys';
import { useCacheContext } from './CacheProvider';
import { client } from '@/sanity/lib/client';
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
    serverData = null,
    preferServerData = true,
  } = options;

  const { addRefreshingKey, removeRefreshingKey, isOnline: networkIsOnline } = useCacheContext();
  const cacheConfig = getCacheConfig(cacheKeyIdentifier);

  // Apply defaults
  const finalStaleTime = staleTime ?? cacheConfig.staleTime;
  const finalMaxAge = maxAge ?? cacheConfig.maxAge;
  const finalEnableOffline = enableOffline ?? cacheConfig.enableOffline;

  // Initialize state with server data if available
  const [data, setData] = useState(() => {
    if (serverData && preferServerData) return serverData;
    return initialData;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (serverData && preferServerData) return false;
    return initialData === null && enabled;
  });

  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [cacheSource, setCacheSource] = useState(() => {
    if (serverData && preferServerData) {
      return serverData.__source || 'server-data';
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
  
  // CRITICAL FIX: Add fetch guards to prevent excessive calls
  const lastFetchTimeRef = useRef(0);
  const FETCH_COOLDOWN = 5000; // 5 second minimum between fetches
  const hasInitialDataRef = useRef(!!serverData || !!initialData);

  // Update refs when props change
  useEffect(() => {
    queryRef.current = query;
    paramsRef.current = params;
    serverDataRef.current = serverData;
  }, [query, params, serverData]);

  // Component lifecycle
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  // Enhanced fetch function with cooldown protection
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

    // CRITICAL FIX: Prevent excessive fetching with cooldown
    const now = Date.now();
    if (!triggeredForceRefresh && (now - lastFetchTimeRef.current < FETCH_COOLDOWN)) {
      console.log(`[useUnifiedCache-${componentName}] Fetch blocked by cooldown`);
      return;
    }

    if (isCurrentlyFetchingRef.current) {
      return;
    }

    isCurrentlyFetchingRef.current = true;
    lastFetchTimeRef.current = now;
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
          const sourceFromProp = serverDataRef.current.__source || 'server-data';
          setCacheSource(sourceFromProp);
          setLastUpdated(new Date());

          // Store server data in local cache for future use
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

          logCacheOperation('HIT', sourceFromProp, fullCacheKey, dataToCache);
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
          setCacheSource(cachedResult.source);
          setLastUpdated(new Date(Date.now() - cachedResult.age));
          
          logCacheOperation('HIT', cachedResult.source, fullCacheKey, cachedResult.data);
          
          if (!cachedResult.isStale) {
            return; // Exit if not stale and not needing background fetch
          }
        }
      }

      // CRITICAL FIX: Only fetch from network if absolutely necessary
      const needsNetworkFetch = triggeredForceRefresh || 
        (!useServerDataFirst && !cachedResult && !hasInitialDataRef.current);

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
          setCacheSource('network');
          setLastUpdated(new Date());
          
          logCacheOperation('MISS', 'network', fullCacheKey, freshData);
        }
      } else if (!networkIsOnline || !navigator.onLine) {
        // Handle offline scenario
        if (finalEnableOffline && cachedResult && cachedResult.data !== null) {
          if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
            setData(cachedResult.data);
            setIsStale(true);
            setCacheSource('offline-cache');
            setLastUpdated(new Date(Date.now() - cachedResult.age));
            setError(null);
            
            logCacheOperation('HIT', 'offline-cache', fullCacheKey, cachedResult.data);
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
            
            logCacheOperation('MISS', 'offline-no-data', fullCacheKey, null);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError' && mountedRef.current && currentFetchId === currentFetchIdRef.current) {
        setError(err);
        setCacheSource('error');
        logCacheOperation('ERROR', 'fetch-error', fullCacheKey, null);
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
    preferServerData
    // REMOVED 'data' from dependencies to prevent loops
  ]);

  // FIXED: Main effect - handle initial load and cache subscription only
  useEffect(() => {
    const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
    const currentQueryString = JSON.stringify({ query: queryRef.current, params: paramsRef.current });
    const queryHasChanged = currentQueryString !== lastRenderedQueryStringRef.current;

    // If server data prop changes and we prefer it, re-initialize state
    if (serverDataRef.current && preferServerData && serverDataRef.current !== data) {
      setData(serverDataRef.current);
      setIsStale(false);
      const sourceFromProp = serverDataRef.current.__source || 'server-data';
      setCacheSource(sourceFromProp);
      setLastUpdated(new Date());
      setIsLoading(false);
      
      logCacheOperation(
        data ? 'UPDATE' : 'HIT', 
        `server-data-prop-${sourceFromProp}`, 
        fullCacheKey, 
        serverDataRef.current
      );
    }

    // CRITICAL FIX: Only trigger fetch if absolutely necessary
    if (enabled && queryHasChanged && !serverDataRef.current) {
      fetchData(false);
      lastRenderedQueryStringRef.current = currentQueryString;
    }

    // Cache subscription
    const unsubscribe = cacheSystem.subscribe(fullCacheKey, (cacheData) => {
      if (mountedRef.current && (!serverDataRef.current || !preferServerData)) {
        if (cacheData) {
          setData(cacheData.data);
          setIsStale(cacheData.isStale || false);
          const subSource = cacheData.source || 'cache-update';
          setCacheSource(subSource);
          setLastUpdated(new Date(Date.now() - (cacheData.age || 0)));
          setError(cacheData.error || null);
          
          logCacheOperation('UPDATE', `subscription-${subSource}`, fullCacheKey, cacheData.data);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    enabled, 
    cacheKeyIdentifier, 
    componentName, 
    fetchData, 
    preferServerData
    // REMOVED serverData and data dependencies
  ]);

  // REMOVED: Background refresh effect that was causing excessive calls

  // Manual refresh function
  const refresh = useCallback(async (isManualForceRefresh = true) => {
    if (!isCurrentlyFetchingRef.current) {
      logCacheOperation('REFRESH', 'manual-trigger', cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current), data);
      await fetchData(isManualForceRefresh);
    }
  }, [fetchData, cacheKeyIdentifier]);

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