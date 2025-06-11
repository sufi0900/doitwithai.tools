// hooks/useBlogCardCache.js
"use client"; // This hook will be used in a client component

import { useState, useEffect, useRef, useCallback } from "react";

// Simple in-memory cache for the current session
const inMemoryCache = new Map();

// Helper to get a unique key for the cache
function getCacheKey(queryName, params = {}) {
  return `${queryName}-${JSON.stringify(params)}`;
}

export function useBlogCardCache(
  queryName, // A unique name for your query (e.g., "seoTrendBig")
  fetchFunction, // The async function that fetches data (e.g., client.fetch(query))
  dependencies = [], // Dependencies for useEffect, similar to usePageCache
  ttl = 60 * 60 * 1000 // Time-to-live for cache in milliseconds (default: 1 hour)
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const dataRef = useRef(null); // To store the actual data reference for refresh

  const fullCacheKey = getCacheKey(queryName, dependencies); // Generate cache key

  // Function to refresh data, can be called externally
  const refreshData = useCallback(async () => {
    setLoading(true);
    setIsFromCache(false); // Assume not from cache during refresh
    try {
      const newData = await fetchFunction(); // Call the actual fetch function
      setData(newData);
      inMemoryCache.set(fullCacheKey, { data: newData, timestamp: Date.now() });
      localStorage.setItem(fullCacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
    } catch (error) {
      console.error(`Failed to refresh data for ${queryName}:`, error);
      // Optionally, set data to null or an empty array on error
    } finally {
      setLoading(false);
    }
  }, [fullCacheKey, fetchFunction]); // Dependencies for useCallback

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const cachedItemString = localStorage.getItem(fullCacheKey);
      let cachedItem = null;

      if (cachedItemString) {
        try {
          cachedItem = JSON.parse(cachedItemString);
        } catch (e) {
          console.error("Failed to parse cached data from localStorage", e);
          localStorage.removeItem(fullCacheKey); // Clear invalid cache
        }
      }

      // Check in-memory cache first, then localStorage
      const memoryData = inMemoryCache.get(fullCacheKey);

      if (memoryData && (Date.now() - memoryData.timestamp < ttl)) {
        // Data found and not expired in in-memory cache
        setData(memoryData.data);
        setIsFromCache(true);
        setLoading(false);
        dataRef.current = memoryData.data; // Store for potential refresh
      } else if (cachedItem && (Date.now() - cachedItem.timestamp < ttl)) {
        // Data found and not expired in localStorage
        setData(cachedItem.data);
        setIsFromCache(true);
        setLoading(false);
        inMemoryCache.set(fullCacheKey, cachedItem); // Populate in-memory cache
        dataRef.current = cachedItem.data; // Store for potential refresh
      } else {
        // No valid cache, fetch new data
        setIsFromCache(false);
        try {
          const newData = await fetchFunction();
          setData(newData);
          inMemoryCache.set(fullCacheKey, { data: newData, timestamp: Date.now() });
          localStorage.setItem(fullCacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
        } catch (error) {
          console.error(`Failed to fetch data for ${queryName}:`, error);
          // Optionally, set data to null or an empty array on error
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [fullCacheKey, fetchFunction, ttl, ...dependencies]); // Add dependencies for the hook

  return { data, loading, isFromCache, refreshData };
}