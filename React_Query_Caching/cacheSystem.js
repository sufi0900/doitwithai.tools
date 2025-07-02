// React_Query_Caching/cacheSystem.js
import { get, set, del, createStore } from 'idb-keyval';
// Removed direct Sanity client import, as network fetches will go through API route
// import { client } from '@/sanity/lib/client'; 
import { getCacheConfig } from './cacheKeys';

class CustomSanityCache {
  constructor() {
    this.memoryCache = new Map();
    this.subscribers = new Map();
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB
    this.currentMemorySize = 0;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.store = null;
    this.keyOptions = new Map();
    this.refreshPromises = new Map();
    this.initializeStore();
    this.setupNetworkListeners();
  }

  async initializeStore() {
    try {
      this.store = createStore('sanity-cache-db', 'cache-store');
    } catch (error) {
      console.warn('IndexedDB not available, using memory only:', error);
    }
  }

  setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifySubscribers('network-status', { online: true });
        this.refreshStaleData(); // Refresh stale data when online
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifySubscribers('network-status', { online: false });
      });
      window.addEventListener('focus', () => {
        this.refreshStaleData(); // Refresh stale data when tab is re-focused
      });
    }
  }

  generateCacheKey(keyIdentifier, query) {
    let queryStr;
    if (typeof query === 'string') {
      queryStr = query;
    } else if (query === null) {
      queryStr = 'null_query_representation';
    } else if (typeof query === 'undefined') {
      queryStr = 'undefined_query_representation';
    } else {
      try {
        queryStr = JSON.stringify(query);
      } catch (e) {
        console.error("Failed to stringify query for hashing:", e, query);
        queryStr = 'serialization_error_query_representation';
      }
    }

    if (!queryStr || typeof queryStr !== 'string') {
      queryStr = 'invalid_query_data_fallback_hash';
    }

    return `${keyIdentifier}_${this.hashString(queryStr)}`;
  }

  hashString(str) {
    if (typeof str !== 'string' || str === null) {
      return 'invalid_hash_input';
    }
    if (str.length === 0) {
      return 'empty_string_hash';
    }

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async get(fullCacheKey, fetchOptions = {}) {
    const storedOptions = this.keyOptions.get(fullCacheKey) || {};
    const effectiveOptions = { ...storedOptions, ...fetchOptions };
    const cacheConfig = getCacheConfig(effectiveOptions.keyIdentifier || fullCacheKey);
    const staleTime = effectiveOptions.staleTime ?? cacheConfig.staleTime;
    const maxAge = effectiveOptions.maxAge ?? cacheConfig.maxAge;
    const enableOffline = effectiveOptions.enableOffline ?? cacheConfig.enableOffline;
    const forceNetwork = effectiveOptions.forceNetwork || false;

    // Try memory cache first
    const memoryData = this.memoryCache.get(fullCacheKey);
    if (memoryData && !forceNetwork) {
      const age = Date.now() - memoryData.timestamp;
      if (age < staleTime) {
        return { data: memoryData.data, isStale: false, source: 'memory', age };
      }
      if (age < maxAge || (!this.isOnline && enableOffline)) {
        if (this.isOnline) {
          // Trigger background refresh via API route
          this.backgroundRefresh(fullCacheKey, { query: effectiveOptions.query, params: effectiveOptions.params, ...cacheConfig });
        }
        return { data: memoryData.data, isStale: true, source: 'memory', age };
      }
    }

    // Try IndexedDB if not found in memory or memory data expired
    if (this.store && !forceNetwork) {
      try {
        const indexedData = await get(fullCacheKey, this.store);
        if (indexedData) {
          const age = Date.now() - indexedData.timestamp;
          const optionsToStoreInMemory = indexedData.options || effectiveOptions;
          this.setMemoryCache(fullCacheKey, indexedData.data, indexedData.timestamp, optionsToStoreInMemory);
          if (age < maxAge || (!this.isOnline && enableOffline)) {
            if (age > staleTime && this.isOnline) {
              // Trigger background refresh via API route
              this.backgroundRefresh(fullCacheKey, { query: optionsToStoreInMemory.query, params: optionsToStoreInMemory.params, ...cacheConfig });
            }
            return { data: indexedData.data, isStale: age > staleTime, source: 'indexeddb', age };
          }
        }
      } catch (error) {
        console.warn(`IndexedDB read error for ${fullCacheKey}:`, error);
      }
    }

    // --- NEW: If not in local caches (memory, IndexedDB), try fetching from server-side Redis via API route ---
    if (this.isOnline && navigator.onLine) {
      try {
        const response = await fetch('/api/cached-sanity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cacheKeyIdentifier: effectiveOptions.keyIdentifier,
            query: effectiveOptions.query,
            params: effectiveOptions.params,
            cacheOptions: {
              tags: effectiveOptions.tags, // Pass tags for Next.js revalidation
              ex: effectiveOptions.ex, // Pass expiration for Redis
            },
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `API error: ${response.status}`);
        }

        const serverData = result.data;
        const serverSource = result.source; // 'redis' or 'network' from the API route

        // Store the data fetched from the server (which might be from Redis or Sanity) into local caches
        // Use `set` which will also trigger a server-side `set` if data was from Sanity (network)
        await this.set(fullCacheKey, serverData, effectiveOptions);

        return { data: serverData, isStale: false, source: serverSource, age: 0 }; // Always fresh from server
      } catch (apiError) {
        console.error(`[CacheSystem] Error fetching from server API for ${fullCacheKey}:`, apiError);
        // Fall through to return null if API fetch fails
      }
    }
    // --- END NEW ---

    return null;
  }

  async set(fullCacheKey, data, options = {}) {
    const timestamp = Date.now();
    const cacheEntry = {
      data,
      timestamp,
      options: { // Store essential options for potential background refresh later
        keyIdentifier: options.keyIdentifier || fullCacheKey.split('_')[0],
        staleTime: options.staleTime,
        maxAge: options.maxAge,
        query: options.query, // Store the original query
        params: options.params, // Store the original params
        group: options.group,
        enableOffline: options.enableOffline,
        tags: options.tags, // Pass tags to store for API route
        ex: options.ex // Pass expiration for API route
      },
    };
    this.setMemoryCache(fullCacheKey, data, timestamp, cacheEntry.options);
    if (this.store) {
      try {
        await set(fullCacheKey, cacheEntry, this.store);
      } catch (error) {
        console.warn(`IndexedDB write error for ${fullCacheKey}:`, error);
      }
    }
    // Always update keyOptions map with the latest settings
    this.keyOptions.set(fullCacheKey, cacheEntry.options);

    // --- NEW: Send data to server-side Redis via API route if it was a fresh fetch from Sanity ---
    // This `set` method can be called from `get` (after a network fetch) or directly (e.g., from background refresh).
    // The API route will handle the Redis set logic.
    if (this.isOnline && navigator.onLine) { // Only attempt to update server if online
      try {
        await fetch('/api/cached-sanity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cacheKeyIdentifier: cacheEntry.options.keyIdentifier,
            query: cacheEntry.options.query,
            params: cacheEntry.options.params,
            cacheOptions: {
              tags: cacheEntry.options.tags,
              ex: cacheEntry.options.ex,
            },
          }),
        });
        // console.log(`[CacheSystem] Sent data to server Redis for ${fullCacheKey}`);
      } catch (apiError) {
        console.error(`[CacheSystem] Error sending data to server Redis for ${fullCacheKey}:`, apiError);
      }
    }
    // --- END NEW ---

    this.notifySubscribers(fullCacheKey, { data, isStale: false, source: 'network', age: 0 });
  }

  setMemoryCache(cacheKey, data, timestamp, options = {}) {
    const effectiveOptions = this.keyOptions.get(cacheKey) || options;
    const dataSize = this.estimateSize(data);
    if (this.currentMemorySize + dataSize > this.maxMemorySize) {
      this.cleanupMemoryCache();
    }
    this.memoryCache.set(cacheKey, { data, timestamp, size: dataSize, options: effectiveOptions });
    this.currentMemorySize += dataSize;
  }

  estimateSize(obj) {
    try {
      return new TextEncoder().encode(JSON.stringify(obj)).length;
    } catch (e) {
      return 0;
    }
  }

  cleanupMemoryCache() {
    const entries = Array.from(this.memoryCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const targetSize = this.maxMemorySize * 0.75;
    while (this.currentMemorySize > targetSize && entries.length > 0) {
      const [key, entry] = entries.shift();
      this.memoryCache.delete(key);
      this.currentMemorySize -= entry.size;
      if (!this.refreshPromises.has(key)) {
        this.keyOptions.delete(key);
      }
    }
  }

  async del(fullCacheKey) { // Renamed from invalidate to avoid confusion with internal logic
    const memoryEntry = this.memoryCache.get(fullCacheKey);
    if (memoryEntry) {
      this.memoryCache.delete(fullCacheKey);
      this.currentMemorySize -= memoryEntry.size;
    }
    this.keyOptions.delete(fullCacheKey);
    if (this.store) {
      try {
        await del(fullCacheKey, this.store);
      } catch (error) {
        console.warn(`IndexedDB delete error for ${fullCacheKey}:`, error);
      }
    }
    // --- NEW: Invalidate from server-side Redis via API route ---
    if (this.isOnline && navigator.onLine) {
      try {
        // Get the original options to pass tags/paths for Next.js cache invalidation
        const originalOptions = memoryEntry?.options || this.keyOptions.get(fullCacheKey) || {};
        await fetch('/api/cached-sanity', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullCacheKey: fullCacheKey,
            revalidateTags: originalOptions.tags, // Pass tags for Next.js revalidation
            revalidatePaths: originalOptions.revalidatePaths, // If you store paths in options
          }),
        });
        // console.log(`[CacheSystem] Sent invalidate request to server Redis for ${fullCacheKey}`);
      } catch (apiError) {
        console.error(`[CacheSystem] Error sending invalidate request to server Redis for ${fullCacheKey}:`, apiError);
      }
    }
    // --- END NEW ---
    this.notifySubscribers(fullCacheKey, null); // Notify subscribers that data is invalidated
  }

  // Renamed invalidate to del, so renaming invalidatePattern to delPattern for consistency
  async delPattern(pattern) {
    // --- NEW: Send pattern invalidation request to server ---
    if (this.isOnline && navigator.onLine) {
      try {
        await fetch('/api/cached-sanity', {
          method: 'POST', // Use POST for actions that don't fit standard REST verbs easily
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pattern: pattern, action: 'invalidatePattern' }),
        });
        // console.log(`[CacheSystem] Sent pattern invalidate request to server for pattern: ${pattern}`);
      } catch (apiError) {
        console.error(`[CacheSystem] Error sending pattern invalidate request to server:`, apiError);
      }
    }
    // --- END NEW ---

    // Client-side invalidation of pattern (memory and IndexedDB)
    const regex = new RegExp(pattern);
    const keysToInvalidate = new Set();

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        keysToInvalidate.add(key);
      }
    }
    for (const key of this.keyOptions.keys()) {
      if (regex.test(key)) {
        keysToInvalidate.add(key);
      }
    }

    const invalidationPromises = Array.from(keysToInvalidate).map(key => this.del(key)); // Use this.del
    await Promise.allSettled(invalidationPromises);
  }


  subscribe(fullCacheKey, callback) {
    if (!this.subscribers.has(fullCacheKey)) {
      this.subscribers.set(fullCacheKey, new Set());
    }
    this.subscribers.get(fullCacheKey).add(callback);
    return () => {
      const callbacks = this.subscribers.get(fullCacheKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(fullCacheKey);
        }
      }
    };
  }

  notifySubscribers(fullCacheKey, data) {
    const callbacks = this.subscribers.get(fullCacheKey);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  isKeyRefreshing(key) {
    return this.refreshPromises.has(key);
  }

  async backgroundRefresh(fullCacheKey, fetchOptions) {
    if (this.refreshPromises.has(fullCacheKey)) {
      return this.refreshPromises.get(fullCacheKey);
    }

    const refreshPromise = (async () => {
      const options = fetchOptions || this.keyOptions.get(fullCacheKey);
      if (!options || !options.query) {
        console.warn(`Cannot background refresh ${fullCacheKey}: query not available.`);
        return;
      }
      if (!this.isOnline) {
        return;
      }

      try {
        // --- NEW: Fetch data via API route for background refresh ---
        const response = await fetch('/api/cached-sanity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cacheKeyIdentifier: options.keyIdentifier,
            query: options.query,
            params: options.params,
            cacheOptions: {
              tags: options.tags, // Pass tags for Next.js revalidation
              ex: options.ex,
            },
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `API error: ${response.status}`);
        }

        const freshData = result.data; // Data comes from the API route

        // Store in local caches (memory, IndexedDB) and trigger server-side Redis update
        await this.set(fullCacheKey, freshData, options);
      } catch (error) {
        console.warn(`Background refresh failed for ${fullCacheKey}:`, error);
      } finally {
        this.refreshPromises.delete(fullCacheKey);
      }
    })();

    this.refreshPromises.set(fullCacheKey, refreshPromise);
    return refreshPromise;
  }

  async refreshStaleData() {
    if (!this.isOnline) {
      return;
    }
    const now = Date.now();
    const keysToRefresh = new Set();

    for (const [key, options] of this.keyOptions.entries()) {
      const cacheConfig = getCacheConfig(options.keyIdentifier || key);
      const staleTime = options.staleTime ?? cacheConfig.staleTime;
      const maxAge = options.maxAge ?? cacheConfig.maxAge;

      const memoryEntry = this.memoryCache.get(key);
      let currentEntry = memoryEntry;
      if (!currentEntry && this.store) {
        currentEntry = await get(key, this.store).catch(() => null);
        if (currentEntry) {
          this.setMemoryCache(key, currentEntry.data, currentEntry.timestamp, currentEntry.options || options);
        }
      }

      if (currentEntry) {
        const age = now - currentEntry.timestamp;
        if (age > staleTime && age < maxAge && !this.refreshPromises.has(key)) {
          keysToRefresh.add(key);
        }
      }
    }

    const CONCURRENCY_LIMIT = 5;
    const activeRefreshes = new Set();
    const queue = Array.from(keysToRefresh);

    while (queue.length > 0 || activeRefreshes.size > 0) {
      while (queue.length > 0 && activeRefreshes.size < CONCURRENCY_LIMIT) {
        const key = queue.shift();
        if (key) {
          const refreshPromise = this.backgroundRefresh(key);
          activeRefreshes.add(refreshPromise);
          refreshPromise.finally(() => {
            activeRefreshes.delete(refreshPromise);
          });
        }
      }
      if (activeRefreshes.size > 0) {
        await Promise.race(Array.from(activeRefreshes));
      } else if (queue.length === 0 && activeRefreshes.size === 0) {
        break;
      }
    }
  }

  async refreshGroup(groupIdentifier) {
    if (!this.isOnline) {
      console.log(`Skipping refreshGroup "${groupIdentifier}": Offline.`);
      return;
    }
    const keysToRefresh = [];
    for (const [key, options] of this.keyOptions.entries()) {
      if (options.group === groupIdentifier) {
        keysToRefresh.push(key);
      }
    }

    const CONCURRENCY_LIMIT = 5;
    const activeRefreshes = new Set();
    const queue = [...keysToRefresh];
    console.log(`Refreshing group "${groupIdentifier}": ${keysToRefresh.length} items.`);

    while (queue.length > 0 || activeRefreshes.size > 0) {
      while (queue.length > 0 && activeRefreshes.size < CONCURRENCY_LIMIT) {
        const key = queue.shift();
        if (key) {
          const refreshPromise = this.backgroundRefresh(key);
          activeRefreshes.add(refreshPromise);
          refreshPromise.finally(() => {
            activeRefreshes.delete(refreshPromise);
          });
        }
      }
      if (activeRefreshes.size > 0) {
        await Promise.race(Array.from(activeRefreshes));
      } else if (queue.length === 0 && activeRefreshes.size === 0) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log(`Finished refreshing group "${groupIdentifier}".`);
  }


  getCacheStats() {
    return {
      memoryEntries: this.memoryCache.size,
      memorySize: this.currentMemorySize,
      subscribers: this.subscribers.size,
      isOnline: this.isOnline,
      refreshingKeys: this.refreshPromises.size
    };
  }
}

export const cacheSystem = new CustomSanityCache();
