// React_Query_Caching/cacheSystem.js
import { get, set, del, createStore } from 'idb-keyval';
import { client } from '@/sanity/lib/client'; // Import your Sanity client here
import { getCacheConfig } from './cacheKeys'; // Import getCacheConfig to apply defaults

// Import PerformanceTracker
import { PerformanceTracker } from './RealTimePerformanceMonitor'; // NEW IMPORT

class CustomSanityCache {
    constructor() {
        this.memoryCache = new Map();
        this.subscribers = new Map();
        this.maxMemorySize = 50 * 1024 * 1024; // 50MB
        this.currentMemorySize = 0;
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true; // Initialize based on current online status
        this.store = null;
        this.keyOptions = new Map(); // To store options like query, params, group for background refresh
        this.refreshPromises = new Map(); // Tracks ongoing refreshes to prevent duplicates
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

    // --- MODIFIED generateCacheKey to handle null/undefined queries ---
 // OPTION 1: Simple content-based cache keys (RECOMMENDED)
generateCacheKey(keyIdentifier, slug, schemaType) {
    // Remove all query processing since we're not using it
    return `${keyIdentifier}_${schemaType}_${slug}`;
}

    // --- MODIFIED hashString for defensive check (though generateCacheKey should now prevent `str` being undefined) ---
    hashString(str) {
        // This defensive check is secondary, as generateCacheKey should now ensure `str` is always a string.
        if (typeof str !== 'string' || str === null) { // Check for null explicitly for safety
            return 'invalid_hash_input'; // Return a consistent value for invalid inputs
        }
        if (str.length === 0) {
            return 'empty_string_hash'; // Return a consistent hash for empty strings
        }
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    // --- END MODIFICATIONS ---

    async get(fullCacheKey, fetchOptions = {}) {
        // NEW: Start performance measurement
        const perfKey = `get_${fullCacheKey}`; // Using fullCacheKey as the unique identifier for this get operation
        PerformanceTracker.startMeasurement(perfKey);

        try {
            // Get options from stored options first, then override with passed fetchOptions
            // Ensure options are correctly merged for cacheConfig lookup
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
                    // console.log(`[CacheSystem] Served fresh from memory: ${fullCacheKey}`);
                    // NEW: End performance measurement for memory cache hit
                    PerformanceTracker.endMeasurement(perfKey,
                        memoryData.data ? JSON.stringify(memoryData.data).length : 0,
                        'memory'
                    );
                    return { data: memoryData.data, isStale: false, source: 'memory', age };
                }
                if (age < maxAge || (!this.isOnline && enableOffline)) {
                    // Serve stale if within maxAge OR offline and allowed
                    // if (this.isOnline) {
                    //     // Only trigger background refresh if online
                    //     this.backgroundRefresh(fullCacheKey, { query: effectiveOptions.query, params: effectiveOptions.params, ...cacheConfig });
                    // }
                    // console.log(`[CacheSystem] Served stale from memory: ${fullCacheKey}, Refreshing: ${this.isOnline ? 'Yes' : 'No(Offline)'}`);
                    // NEW: End performance measurement for stale memory cache hit
                    PerformanceTracker.endMeasurement(perfKey,
                        memoryData.data ? JSON.stringify(memoryData.data).length : 0,
                        'memory'
                    );
                    return { data: memoryData.data, isStale: true, source: 'memory', age };
                }
            }

            // Try IndexedDB if not found in memory or memory data expired
            if (this.store && !forceNetwork) {
                try {
                    const indexedData = await get(fullCacheKey, this.store);
                    // Add debug logging as requested
                    console.log('[IndexedDB] Checking cache for:', fullCacheKey);
                    console.log('[IndexedDB] Found cached data:', !!indexedData);
                 if (indexedData) {
    const age = Date.now() - indexedData.timestamp;
    const isStale = age > staleTime;
    
    // CRITICAL FIX: Only hydrate if not already in memory with same timestamp
    const memoryEntry = this.memoryCache.get(fullCacheKey);
    if (!memoryEntry || memoryEntry.timestamp !== indexedData.timestamp) {
        const optionsToStoreInMemory = indexedData.options || effectiveOptions;
        this.setMemoryCache(fullCacheKey, indexedData.data, indexedData.timestamp, optionsToStoreInMemory);
    }
                        if (age < maxAge || (!this.isOnline && enableOffline)) {
                            // if (age > staleTime && this.isOnline) {
                            //     // Only trigger background refresh if online and data is stale
                            //     this.backgroundRefresh(fullCacheKey, { query: optionsToStoreInMemory.query, params: optionsToStoreInMemory.params, ...cacheConfig });
                            // }
                            // console.log(`[CacheSystem] Served from IndexedDB: ${fullCacheKey}, Stale: ${age > staleTime}, Refreshing: ${this.isOnline && age > staleTime ? 'Yes' : 'No(Offline/NotStale)'}`);
                            // NEW: End performance measurement for IndexedDB hit
                            PerformanceTracker.endMeasurement(perfKey,
                                indexedData.data ? JSON.stringify(indexedData.data).length : 0,
                                'indexeddb'
                            );
                            return { data: indexedData.data, isStale: age > staleTime, source: 'indexeddb', age };
                        }
                    }
                } catch (error) {
                    console.warn(`IndexedDB read error for${fullCacheKey}:`, error);
                    // NEW: End performance measurement on IndexedDB error
                    PerformanceTracker.endMeasurement(perfKey, 0, 'indexeddb-error');
                }
            }

            // If no fresh/stale/offline-enabled cached data, return null
            // console.log(`[CacheSystem] No usable cache found for ${fullCacheKey}`);
            // NEW: End performance measurement if no cache found (effectively a miss for the cache system itself)
            PerformanceTracker.endMeasurement(perfKey, 0, 'cache-miss');
            return null;
        } catch (error) {
            // NEW: End performance measurement if an unexpected error occurs during get
            PerformanceTracker.endMeasurement(perfKey, 0, 'error');
            throw error;
        }
    }

    async set(fullCacheKey, data, options = {}) {
        const timestamp = Date.now();
        const cacheEntry = {
            data,
            timestamp,
            options: {
                // Store essential options for potential background refresh later
                keyIdentifier: options.keyIdentifier || fullCacheKey.split('_')[0],
                staleTime: options.staleTime,
                maxAge: options.maxAge,
                query: options.query, // Store the original query
                params: options.params, // Store the original params
                group: options.group,
                enableOffline: options.enableOffline,
            },
        };

        this.setMemoryCache(fullCacheKey, data, timestamp, cacheEntry.options);

        if (this.store) {
            try {
                await set(fullCacheKey, cacheEntry, this.store);
                // console.log(`[CacheSystem] Set ${fullCacheKey} in IndexedDB.`);
            } catch (error) {
                console.warn(`IndexedDB write error for ${fullCacheKey}:`, error);
            }
        }
        // Always update keyOptions map with the latest settings
        this.keyOptions.set(fullCacheKey, cacheEntry.options);
        this.notifySubscribers(fullCacheKey, { data, isStale: false, source: 'network', age: 0 });
    }

  setMemoryCache(cacheKey, data, timestamp, options = {}) {
    // FIXED: Use consistent timestamp - don't create new ones
    const effectiveOptions = this.keyOptions.get(cacheKey) || options;
    const dataSize = this.estimateSize(data);
    
    // CRITICAL FIX: Use provided timestamp, don't generate new one
    const finalTimestamp = timestamp || Date.now();
    
    if (this.currentMemorySize + dataSize > this.maxMemorySize) {
        this.cleanupMemoryCache();
    }
    
    this.memoryCache.set(cacheKey, {
        data,
        timestamp: finalTimestamp, // Use consistent timestamp
        size: dataSize,
        options: effectiveOptions
    });
    
    this.currentMemorySize += dataSize;
}

    estimateSize(obj) {
        try {
            return new TextEncoder().encode(JSON.stringify(obj)).length;
        } catch (e) {
            // console.warn("Failed to estimate size:", e);
            return 0;
        }
    }

    cleanupMemoryCache() {
        const entries = Array.from(this.memoryCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
        const targetSize = this.maxMemorySize * 0.75; // Target 75% of max size after cleanup

        while (this.currentMemorySize > targetSize && entries.length > 0) {
            const [key, entry] = entries.shift();
            this.memoryCache.delete(key);
            this.currentMemorySize -= entry.size;
            // Ensure we also remove from keyOptions if it's no longer in memory cache and no active refresh
            if (!this.refreshPromises.has(key)) {
                this.keyOptions.delete(key);
            }
        }
        // console.log(`Memory cache cleaned up. Current size: ${this.currentMemorySize / 1024}KB`);
    }

    async invalidate(fullCacheKey) {
        const memoryEntry = this.memoryCache.get(fullCacheKey);
        if (memoryEntry) {
            this.memoryCache.delete(fullCacheKey);
            this.currentMemorySize -= memoryEntry.size;
        }
        this.keyOptions.delete(fullCacheKey); // Remove options as well

        if (this.store) {
            try {
                await del(fullCacheKey, this.store);
                // console.log(`IndexedDB deleted: ${fullCacheKey}`);
            } catch (error) {
                console.warn(`IndexedDB delete error for ${fullCacheKey}:`, error);
            }
        }
        this.notifySubscribers(fullCacheKey, null); // Notify subscribers that data is invalidated
    }

    async invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToInvalidate = new Set(); // Use a Set to avoid duplicates

        // Collect keys from both memory and stored options
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

        const CONCURRENCY_LIMIT = 10;
        const activeInvalidations = new Set();
        const queue = Array.from(keysToInvalidate); // Convert Set to array for queue processing

        // console.log(`Initiating invalidation for ${queue.length} items matching pattern "${pattern}".`);
        while (queue.length > 0 || activeInvalidations.size > 0) {
            while (queue.length > 0 && activeInvalidations.size < CONCURRENCY_LIMIT) {
                const key = queue.shift();
                if (key) {
                    const invalidationPromise = this.invalidate(key);
                    activeInvalidations.add(invalidationPromise);
                    invalidationPromise.finally(() => {
                        activeInvalidations.delete(invalidationPromise);
                    });
                }
            }
            if (activeInvalidations.size > 0) {
                await Promise.race(Array.from(activeInvalidations));
            } else if (queue.length === 0 && activeInvalidations.size === 0) {
                break; // All done
            }
            // Small pause to prevent blocking in case of very large invalidation sets
            // No need for a strict setTimeout here if Promise.race is used, but a tiny one can help yield to event loop.
            // await new Promise(resolve => setTimeout(resolve, 50));
        }
        // console.log(`Finished invalidating keys matching pattern "${pattern}".`);
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

    // NOTE: The `addRefreshingKey`, `removeRefreshingKey`, `isKeyRefreshing`
    // methods were potentially meant for a `_refreshingKeys` Set, but currently
    // `isKeyRefreshing` checks `this.refreshPromises.has(key)`.
    // If `this._refreshingKeys` is not explicitly defined and used as a Set,
    // these two methods (`addRefreshingKey`, `removeRefreshingKey`) are effectively unused.
    // I will leave them commented out as they were previously, focusing on the current bug.
    /*
    addRefreshingKey(key) {
        this._refreshingKeys.add(key);
    }

    removeRefreshingKey(key) {
        this._refreshingKeys.delete(key);
    }
    */

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
                // console.log(`Skipping background refresh for ${fullCacheKey}: Offline.`);
                return;
            }

            try {
                // console.log(`Background refreshing: ${fullCacheKey}`);
                const freshData = await client.fetch(options.query, options.params);
                // Ensure to pass all original options to set, especially enableOffline
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
            // console.log("Skipping refreshStaleData: Offline.");
            return;
        }

        const now = Date.now();
        const keysToRefresh = new Set(); // Use a Set for keys to avoid duplicates

        // Iterate over all known keys (those stored with options)
        for (const [key, options] of this.keyOptions.entries()) {
            const cacheConfig = getCacheConfig(options.keyIdentifier || key);
            const staleTime = options.staleTime ?? cacheConfig.staleTime;
            const maxAge = options.maxAge ?? cacheConfig.maxAge; // Ensure maxAge is considered

            // Get from memory first, then IndexedDB
            const memoryEntry = this.memoryCache.get(key);
            let currentEntry = memoryEntry;
            if (!currentEntry && this.store) {
                // Only try IndexedDB if not in memory, to avoid unnecessary IDB reads
                currentEntry = await get(key, this.store).catch(() => null);
                if (currentEntry) {
                    // Hydrate memory cache if found in IDB during this check
                    this.setMemoryCache(key, currentEntry.data, currentEntry.timestamp, currentEntry.options || options);
                }
            }

            if (currentEntry) {
                const age = now - currentEntry.timestamp;
                // If data is stale, not expired, and not already refreshing, add to refresh queue
                if (age > staleTime && age < maxAge && !this.refreshPromises.has(key)) {
                    keysToRefresh.add(key);
                }
            } else if (options.query && !this.refreshPromises.has(key)) {
                // If no data at all (memory or IDB) but we have a query registered and online
                // This scenario means data is missing/expired from all caches.
                // It should be fetched as a foreground fetch by useSanityCache when enabled,
                // but if this is a critical always-on piece of data, we could trigger a background fetch here.
                // For now, let's let the `useSanityCache` hook handle initial fetching of missing data.
            }
        }

        const CONCURRENCY_LIMIT = 5;
        const activeRefreshes = new Set();
        const queue = Array.from(keysToRefresh);

        // console.log(`Initiating stale data refresh for ${queue.length} items.`);
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
            // Small pause to prevent blocking
            // await new Promise(resolve => setTimeout(resolve, 50));
        }
        // console.log(`Finished refreshing stale data.`);
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
            await new Promise(resolve => setTimeout(resolve, 50)); // Small pause
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