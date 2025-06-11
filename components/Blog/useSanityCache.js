"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from "@/sanity/lib/client";
import { cacheService } from './useCache';
import { useGlobalRefresh } from "@/components/Blog/GlobalRefreshContext";
import { useGlobalOfflineStatus } from '@/components/Blog/GlobalOfflineStatusContext';
import { usePageRefresh } from './PageScopedRefreshContext';

export const useCachedSanityData = (cacheKey, query, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [dataSource, setDataSource] = useState(null);

  // Call both hooks unconditionally at the top level
  const pageRefreshContext = usePageRefresh();
  const globalRefreshContext = useGlobalRefresh();
  const { registerComponent } = useGlobalOfflineStatus();

  const {
    enableOffline = true,
    forceRefresh = false,
    onDataUpdate,
    componentName,
    usePageContext = false
  } = options;

  // Determine which refresh context to use based on the option
  const refreshContext = usePageContext ? pageRefreshContext : globalRefreshContext;
  const { registerRefresh, unregisterRefresh, registerDataSource } = refreshContext;

  // Use refs to hold the latest values for callbacks
  const isOfflineRef = useRef(isOffline);
  const dataSourceRef = useRef(dataSource);

  useEffect(() => {
    isOfflineRef.current = isOffline;
    dataSourceRef.current = dataSource;
  }, [isOffline, dataSource]);

// In useCachedSanityData.js - Update the fetchFreshData function
const fetchFreshData = useCallback(async (showLoading = true) => {
  if (showLoading) setIsLoading(true);
  setError(null);
  setIsOffline(false);
  
  try {
    const freshData = await client.fetch(query);
    cacheService.set(cacheKey, freshData);
    setData(freshData);
    setDataSource('fresh');
    
    // Register this as fresh data with refresh time tracking
    registerDataSource(componentName || cacheKey, 'fresh', true);
    
    // NEW: Store the current timestamp for this component
    localStorage.setItem(`${componentName || cacheKey}_last_update`, Date.now().toString());
    
    setIsLoading(false);
    if (onDataUpdate) {
      onDataUpdate(freshData);
    }
    return freshData;
  } catch (fetchError) {
    console.error(`Failed to fetch ${cacheKey}:`, fetchError);
    setError(fetchError);
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      setData(cachedResult.data);
      const fallbackSource = `${cachedResult.source}-fallback`;
      setDataSource(fallbackSource);
      registerDataSource(componentName || cacheKey, fallbackSource, false);
      setIsOffline(true);
    } else {
      setIsOffline(true);
      setDataSource('none');
      registerDataSource(componentName || cacheKey, 'none', false);
    }
    setIsLoading(false);
    throw fetchError;
  }
}, [query, cacheKey, onDataUpdate, registerDataSource, componentName]);

  useEffect(() => {
    const loadData = async () => {
      const cachedResult = cacheService.get(cacheKey);
      if (cachedResult && !forceRefresh) {
        setData(cachedResult.data);
        setDataSource(cachedResult.source);
        // Register as cached data (not fresh)
        registerDataSource(componentName || cacheKey, cachedResult.source, false);
        setIsLoading(false);
        setIsOffline(false);
        // Background refresh if needed and online
        if (cachedResult.shouldRevalidate && navigator.onLine) {
          try {
            await fetchFreshData(false);
          } catch (error) {
            console.warn('Background refresh failed:', error);
          }
        }
      } else {
        if (navigator.onLine) {
          try {
            await fetchFreshData(true);
          } catch (error) {
            // Error handled in fetchFreshData
          }
        } else if (enableOffline) {
          const cachedResult = cacheService.get(cacheKey);
          if (cachedResult) {
            setData(cachedResult.data);
            setDataSource('offline');
            registerDataSource(componentName || cacheKey, 'offline', false);
            setIsOffline(true);
            setIsLoading(false);
          } else {
            setError(new Error('No cached data available offline'));
            setIsOffline(true);
            setDataSource('none');
            registerDataSource(componentName || cacheKey, 'none', false);
            setIsLoading(false);
          }
        } else {
          setError(new Error('Not online and offline mode disabled.'));
          setIsOffline(true);
          setDataSource('none');
          registerDataSource(componentName || cacheKey, 'none', false);
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [cacheKey, query, forceRefresh, enableOffline, fetchFreshData, registerDataSource, componentName]);

  useEffect(() => {
    const handleOnline = () => {
      const cachedResult = cacheService.get(cacheKey);
      if (isOfflineRef.current || (cachedResult && cachedResult.shouldRevalidate)) {
        console.log(`Component ${cacheKey} detected online, attempting refresh.`);
        fetchFreshData(false);
      } else {
        setIsOffline(false);
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
      console.log(`Component ${cacheKey} is offline.`);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [cacheKey, fetchFreshData]);

  const refresh = useCallback(() => {
    return fetchFreshData(true);
  }, [fetchFreshData]);

  useEffect(() => {
    const name = componentName || cacheKey;
    registerRefresh(name, refresh);
    return () => {
      unregisterRefresh(name);
    };
  }, [registerRefresh, unregisterRefresh, refresh, cacheKey, componentName]);

  // Register with global offline status system
  useEffect(() => {
    const name = componentName || cacheKey;
    const unregister = registerComponent(name, {
      isOffline: isOffline,
      dataSource: dataSource,
      refreshFn: refresh,
      scope: usePageContext ? 'page' : 'global'
    });
    return () => {
      unregister();
    };
  }, [registerComponent, isOffline, dataSource, refresh, cacheKey, componentName, usePageContext]);

  return {
    data,
    isLoading,
    error,
    isOffline,
    dataSource,
    refresh
  };
};