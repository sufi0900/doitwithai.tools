import { useState, useEffect } from 'react';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const usePageCache = (cacheKey, fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Check if we have cached data
      const cachedItem = getCachedData(cacheKey);
      
      if (cachedItem && !isCacheExpired(cachedItem.timestamp)) {
        // Use cached data
        setData(cachedItem.data);
        setIsFromCache(true);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      setLoading(true);
      setIsFromCache(false);
      
      try {
        const freshData = await fetcher();
        setData(freshData);
        
        // Cache the fresh data
        setCachedData(cacheKey, freshData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // If fetch fails but we have expired cache, use it as fallback
        if (cachedItem) {
          setData(cachedItem.data);
          setIsFromCache(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cacheKey, ...dependencies]);

  const refreshData = async () => {
    setLoading(true);
    setIsFromCache(false);
    
    try {
      const freshData = await fetcher();
      setData(freshData);
      setCachedData(cacheKey, freshData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${cacheKey}`);
    }
  };

  return {
    data,
    loading,
    isFromCache,
    refreshData,
    clearCache
  };
};

// Helper functions
const getCachedData = (key) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const setCachedData = (key, data) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

const isCacheExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_EXPIRY;
};