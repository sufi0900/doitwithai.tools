'use client';
import { useEffect, useRef } from 'react';
import { useCacheContext } from './CacheProvider';

export const usePageCache = (cacheKey, refreshFunction, query, label) => {
  const { registerCacheKey, unregisterCacheKey } = useCacheContext();
  const registeredRef = useRef(false);

  useEffect(() => {
    // Skip registration if cacheKey is null/undefined or functions are not available
    if (!cacheKey || typeof registerCacheKey !== 'function' || registeredRef.current) {
      return;
    }

    try {
      registerCacheKey(cacheKey, refreshFunction, query, label);
      registeredRef.current = true;
    } catch (error) {
      console.warn("usePageCache: Failed to register cache key:", error);
    }

    // Cleanup function
    return () => {
      if (typeof unregisterCacheKey === 'function' && registeredRef.current && cacheKey) {
        try {
          unregisterCacheKey(cacheKey);
          registeredRef.current = false;
        } catch (error) {
          console.warn("usePageCache: Failed to unregister cache key:", error);
        }
      }
    };
  }, [cacheKey, refreshFunction, query, label, registerCacheKey, unregisterCacheKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof unregisterCacheKey === 'function' && registeredRef.current && cacheKey) {
        try {
          unregisterCacheKey(cacheKey);
          registeredRef.current = false;
        } catch (error) {
          console.warn("usePageCache: Failed to unregister cache key on unmount:", error);
        }
      }
    };
  }, []); // Empty dependency array for unmount cleanup

  // Don't return anything - this hook is for side effects only
};