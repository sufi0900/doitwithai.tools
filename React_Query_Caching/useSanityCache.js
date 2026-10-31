// React_Query_Caching/useSanityCache.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheSystem } from './cacheSystem';
import { getCacheConfig } from './cacheKeys';
import { useCacheContext } from './CacheProvider';
import { client } from '@/sanity/lib/client';

export const useSanityCache = (cacheKeyIdentifier, query, params = {}, options = {}) => {
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
  } = options;

  const { addRefreshingKey, removeRefreshingKey, isOnline: networkIsOnline } = useCacheContext();
  const cacheConfig = getCacheConfig(cacheKeyIdentifier);
  const finalStaleTime = staleTime ?? cacheConfig.staleTime;
  const finalMaxAge = maxAge ?? cacheConfig.maxAge;
  const finalEnableOffline = enableOffline ?? cacheConfig.enableOffline;

  // Initialize state
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(initialData === null && enabled);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [cacheSource, setCacheSource] = useState(initialData ? 'initial-server-data' : null);
  const [lastUpdated, setLastUpdated] = useState(initialData ? new Date() : null);

  // Refs for stable references
  const queryRef = useRef(query);
  const paramsRef = useRef(params);
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef(null);
  const isCurrentlyFetchingRef = useRef(false);
  const currentFetchIdRef = useRef(0);
  const lastRenderedQueryStringRef = useRef(""); 
  
  // Store callback refs to avoid recreating them
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    queryRef.current = query;
    paramsRef.current = params;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [query, params, onSuccess, onError]);

  // Component lifecycle
  useEffect(() => {
    mountedRef.current = true;
    console.log(`[useSanityCache ${componentName}] Component mounted.`);
    return () => {
      mountedRef.current = false;
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      console.log(`[useSanityCache ${componentName}] Component unmounting.`);
    };
  }, [componentName]);

  // Stable fetchData with minimal dependencies
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

    // Use functional update to avoid dependency on isLoading
    setIsLoading(prev => prev ? prev : true);

    try {
      let cachedResult = null;
      
      // Try cache first (unless force refresh)
      if (!triggeredForceRefresh) {
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

          if (!cachedResult.isStale) {
            if (onSuccessRef.current) onSuccessRef.current(cachedResult.data);
            return;
          }
        }
      }

      // Network fetch if needed
      const needsNetworkFetch = triggeredForceRefresh || !cachedResult || cachedResult.isStale;
      
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
          
          if (onSuccessRef.current) onSuccessRef.current(freshData);
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
            if (onSuccessRef.current) onSuccessRef.current(cachedResult.data);
          }
        } else {
          if (mountedRef.current && currentFetchId === currentFetchIdRef.current) {
            setData(null);
            setIsStale(false);
            setCacheSource('offline-no-data');
            setLastUpdated(null);
            const offlineError = new Error('You are offline and no cached data is available for this content.');
            setError(offlineError);
            if (onErrorRef.current) onErrorRef.current(offlineError);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError' && mountedRef.current && currentFetchId === currentFetchIdRef.current) {
        setError(err);
        setCacheSource('error');
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
    group
  ]);

  // Main effect - CRITICAL: Removed `query` and `params` from dependencies
  useEffect(() => {
    const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
    const currentQueryString = JSON.stringify({ query: queryRef.current, params: paramsRef.current });
    const queryHasChanged = currentQueryString !== lastRenderedQueryStringRef.current;

    if (enabled && (queryHasChanged || (data === null && !isLoading && !isCurrentlyFetchingRef.current))) {
      fetchData(false);
      lastRenderedQueryStringRef.current = currentQueryString;
    }

    // Cache subscription
    const unsubscribe = cacheSystem.subscribe(fullCacheKey, (cacheData) => {
      if (mountedRef.current) {
        if (cacheData) {
          setData(cacheData.data);
          setIsStale(cacheData.isStale || false);
          setCacheSource(cacheData.source || 'cache-update');
          setLastUpdated(new Date(Date.now() - (cacheData.age || 0)));
          setError(cacheData.error || null);
        } else {
          setData(null);
          setIsStale(false);
          setCacheSource('invalidated');
          setLastUpdated(null);
          setError(null);
        }
        
        if (cacheData?.data !== null || cacheData?.error !== null) {
          setIsLoading(false);
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
    // CRITICAL FIX: Removed `query` and `params` from dependencies here.
    // Query content changes are detected by `queryHasChanged` which uses `queryRef.current`.
  ]);

  // Background refresh for stale data
  useEffect(() => {
    if (enabled && data !== null && isStale && networkIsOnline && navigator.onLine && !isCurrentlyFetchingRef.current) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && isStale && networkIsOnline && navigator.onLine && !isCurrentlyFetchingRef.current) {
          fetchData(false);
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [enabled, data, isStale, networkIsOnline, fetchData, componentName]);

  // Manual refresh function
  const refresh = useCallback(async (isManualForceRefresh = true) => {
    if (!isCurrentlyFetchingRef.current) {
      await fetchData(isManualForceRefresh);
    }
  }, [fetchData]);

  return { data, isLoading, error, isStale, cacheSource, lastUpdated, refresh };
};
