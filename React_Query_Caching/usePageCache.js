'use client';
import { useEffect } from 'react';
import { useCacheContext } from './CacheProvider'; // This is correct for your current setup

export const usePageCache = (cacheKey, refreshFunction, query, label) => {
  const { registerCacheKey, unregisterCacheKey } = useCacheContext();

  useEffect(() => {
    // Check if registerCacheKey is a function before calling it
    if (typeof registerCacheKey === 'function') {
      registerCacheKey(cacheKey, refreshFunction, query, label);
    } else {
      // You can add a console.warn here if you want to be notified
      // console.warn("usePageCache: registerCacheKey is not a function. Skipping registration.");
    }

    return () => {
      // Check if unregisterCacheKey is a function before calling it
      if (typeof unregisterCacheKey === 'function') {
        unregisterCacheKey(cacheKey);
      } else {
        // console.warn("usePageCache: unregisterCacheKey is not a function. Skipping unregistration.");
      }
    };
  }, [cacheKey, refreshFunction, query, label, registerCacheKey, unregisterCacheKey]);
};