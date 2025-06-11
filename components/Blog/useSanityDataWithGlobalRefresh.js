// components/Blog/useSanityDataWithGlobalRefresh.js (create this new file)
"use client";

import { useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/sanity/lib/client";
import { useGlobalRefresh } from "@/components/Blog/GlobalRefreshContext";
import { useGlobalOfflineStatus } from "@/components/Blog/GlobalOfflineStatusContext";

// Function to fetch data from Sanity (same as your existing fetchSanityData)
const fetchSanityData = async (query) => {
  return await client.fetch(query);
};

export const useSanityDataWithGlobalRefresh = (queryKey, query, options = {}) => {
  const { componentName, scope = 'global', enableOffline = true } = options;
  const name = componentName || (Array.isArray(queryKey) ? queryKey.join('-') : queryKey);

  const queryClient = useQueryClient();
  const { registerRefresh, unregisterRefresh, registerDataSource } = useGlobalRefresh();
  const { registerComponent } = useGlobalOfflineStatus();

  // Use a ref to hold the latest query status for GlobalOfflineStatusContext registration
  const currentStatusRef = useRef({
    isOffline: false,
    dataSource: null,
    error: null,
  });

  // The actual React Query hook
  const queryResult = useQuery({
    queryKey: [queryKey],
    queryFn: () => fetchSanityData(query),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    // When data is fetched or revalidated
    onSuccess: (data) => {
      const isCachedByRQ = queryClient.getQueryState([queryKey])?.status === 'success' && queryClient.getQueryState([queryKey])?.isStale === false; // Check if React Query considers it fresh
      // This logic needs to be careful: if we hit network, it's 'fresh'. If we retrieve from RQ cache and it's stale, it's 'cached'.
      // React Query internally manages its cache. If it hits network, it's fresh. If it uses stale data, it's cached.
      // For simplicity, let's say if RQ returns data *without* an immediate refetch, it's 'cached' or 'fresh' based on staleness.
      // However, we only care about if *our* global system sees it as fresh or cached relative to the last network fetch.
      // If `onSuccess` runs, it means RQ successfully got data (from network or its cache).
      // We will assume that if we get data, it's 'fresh' from the perspective of a successful query execution.
      // The 'cached' status should primarily come from your `useCachedSanityData` if it served data from IndexedDB cache.
      // For React Query, a successful query is often treated as 'fresh' unless specifically from `initialData` or `placeholderData`.
      
      // Let's refine this: If RQ successfully fetches from network, it's 'fresh'.
      // If it served from its *stale* cache and is in the process of refetching, then it's effectively 'cached' for the moment.
      
      // A more robust way to check if RQ is serving *stale* cache initially:
      // When `onSuccess` runs, if `queryResult.isFetchedAfterMount` is true, it means a network request just finished.
      // If `queryResult.isFetchedAfterMount` is false (meaning data was synchronous from initialData or cache), it's 'cached'.
      // This is tricky with `staleTime`.
      
      // Simplification for global status: If React Query's query is *currently* fetching, it's refreshing.
      // If it has data and `isStale` is false (meaning fresh according to RQ's staleTime), consider it 'fresh'.
      // If it has data and `isStale` is true, consider it 'cached' (it's using potentially old data).
      
      const queryState = queryClient.getQueryState([queryKey]);
      let currentDataSource = 'fresh';
      if (queryState && queryState.status === 'success') {
          if (queryState.dataUpdatedAt < Date.now() - queryState.staleTime) { // Rough check for staleness
              currentDataSource = 'cached';
          }
      }
      
      currentStatusRef.current = {
        isOffline: false,
        dataSource: currentDataSource,
        error: null,
      };
      registerDataSource(name, currentDataSource); // Register with global refresh
    },
    onError: (err) => {
      console.error(`Error fetching data for ${name}:`, err);
      currentStatusRef.current = {
        isOffline: true, // Assuming error means offline or network issue
        dataSource: 'error',
        error: err,
      };
      registerDataSource(name, 'error'); // Register as error
    },
    // This is important for determining if data is coming from cache
    onSettled: (data, error) => {
        const queryState = queryClient.getQueryState([queryKey]);
        if (queryState) {
            let dataSourceStatus = 'unknown';
            if (queryState.status === 'success') {
                // If it's a synchronous hit from cache (e.g., initialData or fresh in cache)
                if (queryState.isStale === false && queryState.dataUpdatedAt > 0 && (Date.now() - queryState.dataUpdatedAt < queryState.staleTime)) {
                    dataSourceStatus = 'fresh'; // From RQ's perspective, it's fresh
                } else if (queryState.dataUpdatedAt > 0) {
                    dataSourceStatus = 'cached'; // Stale data from cache
                } else {
                    dataSourceStatus = 'fresh'; // Default for a successful, non-cached fetch
                }
            } else if (queryState.status === 'error') {
                dataSourceStatus = 'error';
            }
            currentStatusRef.current = {
                isOffline: queryState.status === 'error' || !navigator.onLine,
                dataSource: dataSourceStatus,
                error: error,
            };
            registerDataSource(name, dataSourceStatus);
        }
    },
  });

  // Function to imperatively refetch data using React Query's invalidateQueries
  const refreshFn = useCallback(async () => {
    try {
      currentStatusRef.current = { ...currentStatusRef.current, isOffline: false, error: null };
      registerDataSource(name, 'refreshing'); // Indicate refreshing state
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      await queryClient.refetchQueries({ queryKey: [queryKey] }); // Ensure it refetches
      // After successful refetch, onSuccess will update the status
    } catch (err) {
      console.error(`Failed to refresh RQ component ${name}:`, err);
      currentStatusRef.current = { ...currentStatusRef.current, isOffline: true, error: err, dataSource: 'error' };
      registerDataSource(name, 'error');
      throw err;
    }
  }, [queryKey, queryClient, registerDataSource, name]);


  // Register with GlobalRefreshContext
  useEffect(() => {
    registerRefresh(name, refreshFn, scope);
    return () => {
      unregisterRefresh(name);
    };
  }, [name, refreshFn, registerRefresh, unregisterRefresh, scope]);

  // Register with GlobalOfflineStatusContext
  useEffect(() => {
    // This effect ensures that the GlobalOfflineStatusContext always has the latest status
    // from React Query's internal state.
    const status = queryResult.isFetching
      ? 'fetching'
      : queryResult.isSuccess
      ? (queryResult.isStale ? 'cached' : 'fresh') // If not fetching and success, check staleness for status
      : queryResult.isError
      ? 'error'
      : 'loading'; // Default to loading if not success/error/fetching

    const isCurrentlyOffline = queryResult.isError || !navigator.onLine;

    // Update the ref for GlobalOfflineStatusContext's use
    currentStatusRef.current = {
        isOffline: isCurrentlyOffline,
        dataSource: status,
        error: queryResult.error,
    };

    // Register with GlobalOfflineStatusContext (the function itself, not the values directly)
    // The registerComponent callback in GlobalOfflineStatusContext should ideally be updated
    // to accept a function that returns the latest state, to avoid stale closures.
    // For now, we'll call registerComponent on every relevant state change to update.
    const unregister = registerComponent(name, {
        isOffline: isCurrentlyOffline,
        dataSource: status,
        refreshFn: refreshFn, // Pass the refresh function
        scope: scope,
        error: queryResult.error
    });

    return unregister; // Cleanup function
  }, [name, queryResult.status, queryResult.isFetching, queryResult.isSuccess, queryResult.isError, queryResult.error, queryResult.isStale, registerComponent, refreshFn, scope]);


  return {
    ...queryResult,
    refresh: refreshFn, // Expose the refresh function via your hook
    dataSource: currentStatusRef.current.dataSource, // Return the current data source for component use
    isOffline: currentStatusRef.current.isOffline,
  };
};