// lib/cache/cacheManager.js
import { client } from "@/sanity/lib/client";

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.isOnline = true;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes default
    this.lastModifiedCache = new Map();
    
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncWithServer();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Generate cache key
  generateKey(query, params = {}) {
    return `${query}_${JSON.stringify(params)}`;
  }

  // Check if cache is stale
  isCacheStale(key, customExpiry = null) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return true;
    
    const expiry = customExpiry || this.cacheExpiry;
    return Date.now() - timestamp > expiry;
  }

  // Set cache with timestamp
  setCache(key, data, lastModified = null) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    if (lastModified) {
      this.lastModifiedCache.set(key, lastModified);
    }
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const cacheData = {
          data,
          timestamp: Date.now(),
          lastModified
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }
    }
  }

  // Get from cache
  getFromCache(key) {
    // First try memory cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Then try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const { data, timestamp, lastModified } = JSON.parse(stored);
          // Restore to memory cache
          this.cache.set(key, data);
          this.timestamps.set(key, timestamp);
          if (lastModified) {
            this.lastModifiedCache.set(key, lastModified);
          }
          return data;
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  // Check for server updates using last modified approach
  async checkForUpdates(query, key) {
    try {
      // Get document count and last modified timestamp
      const metaQuery = `{
        "count": count(${query}),
        "lastModified": max(${query}._updatedAt)
      }`;
      
      const serverMeta = await client.fetch(metaQuery);
      const cachedLastModified = this.lastModifiedCache.get(key);
      
      return {
        hasUpdates: !cachedLastModified || 
                   new Date(serverMeta.lastModified) > new Date(cachedLastModified),
        serverMeta
      };
    } catch (error) {
      console.warn('Failed to check for updates:', error);
      return { hasUpdates: false };
    }
  }

  // Main fetch method with intelligent caching
  async fetchWithCache(query, options = {}) {
    const {
      key = this.generateKey(query),
      forceRefresh = false,
      cacheExpiry = this.cacheExpiry,
      fallbackToCache = true
    } = options;

    // Return cached data immediately if offline
    if (!this.isOnline && this.cache.has(key)) {
      return {
        data: this.getFromCache(key),
        source: 'cache',
        status: 'offline'
      };
    }

    // Check cache first
    const cachedData = this.getFromCache(key);
    const isCacheStale = this.isCacheStale(key, cacheExpiry);

    // Return fresh cache if available and not stale
    if (cachedData && !isCacheStale && !forceRefresh) {
      // Check for updates in background
      this.checkForUpdates(query, key).then(({ hasUpdates, serverMeta }) => {
        if (hasUpdates) {
          this.fetchFreshData(query, key, serverMeta);
        }
      });

      return {
        data: cachedData,
        source: 'cache',
        status: 'fresh'
      };
    }

    try {
      // Fetch fresh data
      const freshData = await client.fetch(query);
      
      // Get metadata for tracking updates
      const metaQuery = `{
        "count": count(${query}),
        "lastModified": max(${query}._updatedAt)
      }`;
      const serverMeta = await client.fetch(metaQuery);
      
      this.setCache(key, freshData, serverMeta.lastModified);
      
      return {
        data: freshData,
        source: 'server',
        status: 'fresh'
      };
    } catch (error) {
      console.error('Failed to fetch from server:', error);
      
      // Fallback to cache if available
      if (fallbackToCache && cachedData) {
        return {
          data: cachedData,
          source: 'cache',
          status: 'error',
          error: error.message
        };
      }
      
      throw error;
    }
  }

  // Fetch fresh data in background
  async fetchFreshData(query, key, serverMeta) {
    try {
      const freshData = await client.fetch(query);
      this.setCache(key, freshData, serverMeta?.lastModified);
      
      // Notify components about update
      this.notifyUpdate(key, freshData);
    } catch (error) {
      console.warn('Background fetch failed:', error);
    }
  }

  // Notify components about cache updates
  notifyUpdate(key, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cacheUpdate', {
        detail: { key, data }
      }));
    }
  }

  // Clear specific cache
  clearCache(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.lastModifiedCache.delete(key);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
    this.timestamps.clear();
    this.lastModifiedCache.clear();
    
    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => localStorage.removeItem(key));
    }
  }

  // Sync with server when online
  async syncWithServer() {
    for (const [key] of this.cache) {
      // Force refresh for all cached items
      try {
        const query = key.split('_')[0]; // Extract original query
        await this.fetchWithCache(query, { key, forceRefresh: true });
      } catch (error) {
        console.warn(`Failed to sync ${key}:`, error);
      }
    }
  }

  // Get cache status
  getCacheStatus(key) {
    const hasCache = this.cache.has(key);
    const isStale = hasCache ? this.isCacheStale(key) : false;
    const timestamp = this.timestamps.get(key);
    
    return {
      hasCache,
      isStale,
      timestamp,
      isOnline: this.isOnline,
      age: timestamp ? Date.now() - timestamp : null
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();