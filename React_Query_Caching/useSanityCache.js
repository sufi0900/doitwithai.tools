// usesanitycache.js
'use client';

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
    // forceRefresh is now handled primarily by the refresh() callback, not a direct option
    group = null,
    initialData = null,
  } = options;

  const { addRefreshingKey, removeRefreshingKey, isOnline: networkIsOnline } = useCacheContext();

  const cacheConfig = getCacheConfig(cacheKeyIdentifier);
  const finalStaleTime = staleTime ?? cacheConfig.staleTime;
  const finalMaxAge = maxAge ?? cacheConfig.maxAge;
  const finalEnableOffline = enableOffline ?? cacheConfig.enableOffline;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(initialData === null && enabled);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [cacheSource, setCacheSource] = useState(initialData ? 'initial-server-data' : null);
  const [lastUpdated, setLastUpdated] = useState(initialData ? new Date() : null);

  const queryRef = useRef(query);
  const paramsRef = useRef(params);
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef(null);

  // This ref tracks if an explicit fetch (initial or refresh) has been requested
  const hasTriggeredFetchRef = useRef(false);

  useEffect(() => {
    queryRef.current = query;
    paramsRef.current = params;
  }, [query, params]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (fetchControllerRef.current) {
        console.log(`[useSanityCache:${componentName}] Aborting fetch due to unmount.`);
        fetchControllerRef.current.abort();
      }
    };
  }, [componentName]);

  const fetchData = useCallback(
    async (forceNetworkFetch = false, isInitialCall = false) => {
      if (!enabled) {
        if (isInitialCall) {
          setData(null);
          setIsLoading(false);
          setError(null);
          setIsStale(false);
          setCacheSource(null);
          setLastUpdated(null);
        }
        return;
      }

      const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
      addRefreshingKey(fullCacheKey);
      setError(null);

      let cachedResult = null;
      let freshData = null;

      // Only set loading true if we expect a wait, and not if we already have data
      // or it's not an initial call and we are already loading.
      if (!data || forceNetworkFetch || isInitialCall) {
        if (!isLoading) {
          setIsLoading(true);
          console.log(`[useSanityCache:${componentName}] Set isLoading to TRUE (fetch initiated).`);
        }
      }

      try {
        // 1. Try to get from cache first
        if (!forceNetworkFetch) { // Only check cache if not forcing a network fetch
          cachedResult = await cacheSystem.get(fullCacheKey, {
            staleTime: finalStaleTime,
            maxAge: finalMaxAge,
            enableOffline: finalEnableOffline,
            query: queryRef.current,
            params: paramsRef.current,
            keyIdentifier: cacheKeyIdentifier,
            group: group,
          });

          if (cachedResult && mountedRef.current) {
            setData(cachedResult.data);
            setIsStale(cachedResult.isStale);
            setCacheSource(cachedResult.source);
            setLastUpdated(new Date(Date.now() - cachedResult.age));
            console.log(`[useSanityCache:${componentName}] Found cached data. Stale: ${cachedResult.isStale}, Source: ${cachedResult.source}`);

            if (!cachedResult.isStale && !forceNetworkFetch) {
              setIsLoading(false); // Data is fresh and from cache, stop loading
              removeRefreshingKey(fullCacheKey);
              if (onSuccess) onSuccess(cachedResult.data);
              return; // Exit early if fresh cached data is found
            }
          }
        }

        // 2. Determine if network fetch is needed
        const needsNetworkFetch = forceNetworkFetch || !cachedResult || cachedResult.isStale;

        if (needsNetworkFetch && networkIsOnline && navigator.onLine) {
          try {
            if (fetchControllerRef.current) {
              fetchControllerRef.current.abort();
              console.log(`[useSanityCache:${componentName}] Aborting previous fetch before starting new.`);
            }
            fetchControllerRef.current = new AbortController();
            const signal = fetchControllerRef.current.signal;
            console.log(`[useSanityCache:${componentName}] Fetching from network.`);

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Network request timed out')), 15000));
            const fetchPromise = client.fetch(queryRef.current, paramsRef.current, { signal });
            freshData = await Promise.race([fetchPromise, timeoutPromise]);

            if (mountedRef.current) {
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
              if (onSuccess) onSuccess(freshData);
              console.log(`[useSanityCache:${componentName}] Network fetch SUCCESS, data updated.`);
            }
          } catch (networkError) {
            if (networkError.name === 'AbortError') {
              console.log(`[useSanityCache:${componentName}] Network fetch aborted.`);
              return;
            }
            console.warn(`[useSanityCache:${componentName}] Network failed:`, networkError.message);
            if (cachedResult?.data !== null) { // Use optional chaining for safety
              console.log(`[useSanityCache:${componentName}] Network failed, serving stale cached data.`);
              if (mountedRef.current) {
                setData(cachedResult.data);
                setIsStale(true);
                setCacheSource('cache-network-failed');
                setLastUpdated(new Date(Date.now() - cachedResult.age));
                setError(null); // Clear previous error if stale data is available
                if (onSuccess) onSuccess(cachedResult.data);
              }
            } else {
              throw networkError; // Re-throw if no cached data to fall back on
            }
          }
        } else if (!networkIsOnline || !navigator.onLine) {
          console.log(`[useSanityCache:${componentName}] Offline mode detected.`);
          if (finalEnableOffline) {
            if (cachedResult?.data !== null) {
              if (mountedRef.current) {
                setData(cachedResult.data);
                setIsStale(true);
                setCacheSource('offline-cache');
                setLastUpdated(new Date(Date.now() - cachedResult.age));
                setError(null);
                if (onSuccess) onSuccess(cachedResult.data);
                console.log(`[useSanityCache:${componentName}] Serving data from offline cache.`);
              }
            } else {
              if (mountedRef.current) {
                setData(null);
                setIsStale(false);
                setCacheSource('offline-no-data');
                setLastUpdated(null);
                const offlineError = new Error('You are offline and no cached data is available for this content.');
                setError(offlineError);
                if (onError) onError(offlineError);
                console.warn(`[useSanityCache:${componentName}] Offline, no data available.`);
              }
            }
          } else {
            throw new Error('You are offline and cached data is disabled for this content.');
          }
        } else if (!cachedResult && !freshData) {
          console.warn(`[useSanityCache:${componentName}] Online but no data (cached or network) could be obtained.`);
          throw new Error('No data available and unable to fetch from network.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(`[useSanityCache:${componentName}] Error in fetchData:`, err);
          if (mountedRef.current) {
            setError(err);
            if (!data && !cachedResult?.data) { // If no current data and no cached fallback
              setData(null);
            }
            if (onError) onError(err);
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          removeRefreshingKey(fullCacheKey);
          console.log(`[useSanityCache:${componentName}] Set isLoading to FALSE in finally block.`);
        }
      }
    },
    [
      cacheKeyIdentifier, enabled, finalStaleTime, finalMaxAge, finalEnableOffline,
      networkIsOnline, addRefreshingKey, removeRefreshingKey, componentName,
      onSuccess, onError, data, isLoading, group, // Remove isStale from dependencies here
    ]
  );

  // Main Effect to Trigger Data Fetching
  useEffect(() => {
    // Determine if an initial fetch is needed or if stale data needs refreshing
    const isFirstLoadAndNoInitialData = enabled && !hasTriggeredFetchRef.current && initialData === null;
    const isStaleAndOnlineBackgroundRefresh = enabled && data !== null && isStale && networkIsOnline && navigator.onLine;

    console.log(`%c[useSanityCache:${componentName}] Effect Trigger Check (Main):`, 'color:purple;font-weight:bold;');
    console.log(`isFirstLoadAndNoInitialData: ${isFirstLoadAndNoInitialData}`);
    console.log(`isStaleAndOnlineBackgroundRefresh: ${isStaleAndOnlineBackgroundRefresh}`);
    console.log(`Current data: ${!!data}, Current isLoading: ${isLoading}, Current isStale: ${isStale}`);

    if (isFirstLoadAndNoInitialData || isStaleAndOnlineBackgroundRefresh) {
      console.log(`%c[useSanityCache:${componentName}] Effect triggered fetchData. Condition met.`, 'color:orange;font-weight:bold;');
      hasTriggeredFetchRef.current = true; // Mark that a fetch has been requested
      fetchData(false, isFirstLoadAndNoInitialData); // Don't force network fetch, allow cache first
    } else {
      console.log(`%c[useSanityCache:${componentName}] Effect did NOT trigger fetchData. Conditions not met.`, 'color:gray;');
      // If we are not loading and have no data/error from an initial fetch, ensure isLoading is false.
      if (!isLoading && data === null && !error && enabled && hasTriggeredFetchRef.current) {
         setIsLoading(false); // This ensures `isLoading` is correctly false after an attempt
      }
    }

    // Subscribe to cache updates for this specific key
    const fullCacheKey = cacheSystem.generateCacheKey(cacheKeyIdentifier, queryRef.current);
    const unsubscribe = cacheSystem.subscribe(fullCacheKey, (cacheData) => {
      if (mountedRef.current) {
        console.log(`[useSanityCache:${componentName}] Cache subscription update for ${fullCacheKey}:`, cacheData ? 'data present' : 'data invalidated');
        if (cacheData) {
          // Only update if the received data is newer or has different stale status
          const currentLastUpdatedTime = lastUpdated?.getTime() || 0;
          const newLastUpdatedTime = Date.now() - (cacheData.age || 0);

          // Avoid infinite loops if cache updates are too frequent with same data
          if (cacheData.data !== data || cacheData.isStale !== isStale || newLastUpdatedTime > currentLastUpdatedTime) {
              setData(cacheData.data);
              setIsStale(cacheData.isStale || false);
              setCacheSource(cacheData.source || 'cache-update');
              setLastUpdated(new Date(newLastUpdatedTime));
              if (cacheData.error) {
                  setError(cacheData.error);
              } else {
                  setError(null);
              }
          }
        } else {
          // Data invalidated
          setData(null);
          setIsStale(false);
          setCacheSource('invalidated');
          setLastUpdated(null);
          setError(null);
        }
        setIsLoading(false); // Cache update means we're done loading for this cycle
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    enabled, cacheKeyIdentifier, initialData, data, isLoading, isStale,
    networkIsOnline, componentName, fetchData, // fetchData is stable due to useCallback
    lastUpdated // Add lastUpdated as dependency for subscription update logic
  ]);

  // Public refresh function
  const refresh = useCallback(async () => {
    console.log(`[useSanityCache:${componentName}] Manual refresh triggered.`);
    hasTriggeredFetchRef.current = true; // Ensure fetch is triggered
    await fetchData(true, true); // Force network fetch and treat as initial call for loading state
  }, [fetchData, componentName]);

  return { data, isLoading, error, isStale, cacheSource, lastUpdated, refresh };
};