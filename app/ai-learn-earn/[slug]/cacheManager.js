/*** Core cache management utilities with advanced features */
import cacheStorage from './cacheStorage';

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const LONG_TTL = 30 * 60 * 1000; // 30 minutes for resources
const UPDATE_CHECK_INTERVAL = 15 * 1000; // 15 seconds

/**
 * @typedef {'fresh' | 'cached' | 'updates-available' | 'offline'} CacheStatus
 */

/**
 * @typedef {object} CacheItemMetadata
 * @property {number} timestamp - When the item was cached.
 * @property {number} expires - When the cache item expires.
 * @property {string} version - Version of the cache item.
 * @property {'api' | 'cache'} source - Where the data came from (API or cache).
 * @property {boolean} compressed - Whether the data is compressed.
 * @property {string} [schemaType] - Sanity schema type (e.g., 'aitool').
 * @property {string} [componentId] - ID of the component that requested this cache (e.g., 'main-content', 'related-posts').
 */

/**
 * @typedef {object} ComponentStat
 * @property {CacheStatus} status - Current cache status of the component.
 * @property {number} timestamp - Last time this component's data was updated/checked.
 * @property {boolean} isFromCache - True if data is currently served from cache.
 * @property {string} source - Source of the data ('api' or 'cache').
 * @property {string} [cacheKey] - The cache key used for this component.
 * @property {boolean} hasUpdatesAvailable - Whether updates are detected for this component's data.
 * @property {string} schemaType - The Sanity schema type associated with this component's data.
 */

class CacheManager {
    constructor() {
        /**
         * @type {Map<string, Function[]>}
         * Stores update listeners for specific cache keys.
         */
        this.updateListeners = new Map();
        /**
         * @type {Map<string, ComponentStat>}
         * Stores real-time statistics for tracked components.
         */
        this.componentStats = new Map();
        /**
         * @type {Map<string, number>}
         * Stores polling interval IDs for update detection.
         */
        this.pollingIntervals = new Map();
        /**
         * @type {Map<string, number>}
         * Stores the timestamp of the last update check for each schema type.
         */
        this.lastUpdateCheck = new Map();

        // Ensure cleanup runs periodically
        if (typeof window !== 'undefined') {
            setInterval(() => cacheStorage.cleanup(), 60 * 60 * 1000); // Hourly cleanup
        }
    }

   // Replace the existing generateCacheKey method in your cacheManager.js with this updated version:

/**
 * Generates a robust cache key based on various parameters.
 * @param {string} baseKey - A base identifier for the cache entry (e.g., 'article_content', 'related_posts').
 * @param {string} [schemaType] - The Sanity schema type (e.g., 'aitool', 'makemoney').
 * @param {object} [params={}] - Additional parameters like ID, slug, or filters.
 * @param {string} [params.id] - Document ID.
 * @param {string} [params.slug] - Document slug.
 * @param {string} [params.articleId] - Related article ID.
 * @param {string} [params.componentId] - Component ID for tracking.
 * @param {object} [params.filters] - Filters applied to the query.
 * @returns {string} The generated cache key.
 */
generateCacheKey(baseKey, schemaType, params = {}) {
  const keyParts = [baseKey];
  
  if (schemaType) keyParts.push(schemaType);
  if (params.id) keyParts.push(params.id);
  if (params.slug) keyParts.push(params.slug);
  if (params.articleId) keyParts.push(`article_${params.articleId}`);
  
  // Don't include componentId in the actual cache key to avoid duplicates
  // ComponentId is used for tracking but not for cache storage key generation
  
  if (params.filters) keyParts.push(JSON.stringify(params.filters));
  
  // Generate consistent key
  return keyParts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
}

    /**
     * Sets data into the cache with additional metadata.
     * @param {string} key - The cache key.
     * @param {*} data - The data to cache.
     * @param {object} [options={}] - Caching options.
     * @param {number} [options.ttl] - Time-to-live in milliseconds.
     * @param {'api' | 'cache'} [options.source='api'] - Source of the data.
     * @param {string} [options.schemaType] - Sanity schema type.
     * @param {string} [options.componentId] - ID of the component.
     * @returns {boolean} True if successfully set.
     */
    
    setCache(key, data, options = {}) {
        const cacheOptions = {
            ttl: options.ttl || DEFAULT_TTL,
            source: options.source || 'api',
            schemaType: options.schemaType,
            componentId: options.componentId
        };

        return cacheStorage.setItem(key, data, cacheOptions);
    }

    /**
     * Retrieves data from cache.
     * @param {string} key - The cache key.
     * @returns {{data: *, metadata: CacheItemMetadata} | null} The cached data and its metadata, or null.
     */
    getCache(key) {
        const cachedItem = cacheStorage.getItem(key);
        if (cachedItem) {
            // Decompress and parse is handled by cacheStorage.getItem
            // The `data` property of `cachedItem` already contains the actual data.
            // The `metadata` for this item is essentially the `cachedItem` itself (timestamp, expires, source, etc.)
            return {
                data: cachedItem.data,
                metadata: {
                    timestamp: cachedItem.timestamp,
                    expires: cachedItem.expires,
                    version: cachedItem.version,
                    source: cachedItem.source,
                    compressed: cachedItem.compressed,
                    schemaType: cachedItem.schemaType,
                    componentId: cachedItem.componentId
                }
            };
        }
        return null;
    }

    /**
     * Clears a specific item from the cache.
     * @param {string} key - The cache key to clear.
     */
    clearCache(key) {
        cacheStorage.removeItem(key);
    }

    /**
     * Clears all items from the cache.
     */
    clearAllCache() {
        cacheStorage.clear();
    }

    /**
     * Registers a listener for updates on a specific cache key.
     * @param {string} key - The cache key to listen for.
     * @param {Function} listener - The callback function to execute when an update is detected.
     */
    onUpdate(key, listener) {
        if (!this.updateListeners.has(key)) {
            this.updateListeners.set(key, []);
        }
        this.updateListeners.get(key)?.push(listener);
    }

    /**
     * Unregisters a listener.
     * @param {string} key - The cache key.
     * @param {Function} listener - The listener to remove.
     */
    offUpdate(key, listener) {
        if (this.updateListeners.has(key)) {
            const listeners = this.updateListeners.get(key)?.filter(l => l !== listener);
            if (listeners?.length === 0) {
                this.updateListeners.delete(key);
            } else {
                this.updateListeners.set(key, listeners || []);
            }
        }
    }

    /**
     * Triggers all listeners for a given cache key.
     * @param {string} key - The cache key that was updated.
     * @param {any} [payload] - Optional payload to pass to listeners.
     */
    triggerUpdate(key, payload) {
        this.updateListeners.get(key)?.forEach(listener => listener(payload));
    }

    /**
     * Updates component statistics.
     * @param {string} componentId - Unique ID of the component.
     * @param {Partial<ComponentStat>} stats - Partial statistics to update.
     */
    updateComponentStat(componentId, stats) {
        const currentStats = this.componentStats.get(componentId) || {};
        this.componentStats.set(componentId, { ...currentStats, ...stats, timestamp: Date.now() });
    }

    /**
     * Retrieves statistics for a specific component.
     * @param {string} componentId - Unique ID of the component.
     * @returns {ComponentStat | undefined} Component statistics.
     */
    getComponentStat(componentId) {
        return this.componentStats.get(componentId);
    }

    /**
     * Retrieves all tracked component statistics.
     * @returns {Map<string, ComponentStat>} All component statistics.
     */
    getAllComponentStats() {
        return this.componentStats;
    }

    /**
     * Calculates summary statistics across all tracked components.
     * @returns {{total: number, fresh: number, cached: number, updatesAvailable: number, offline: number, isCompletelyOffline: boolean, hasRecentlyFreshData: boolean}}
     */

    
    getGlobalCacheStats() {
        let total = 0;
        let fresh = 0;
        let cached = 0;
        let updatesAvailable = 0;
        let offline = 0;
        let hasRecentlyFreshData = false; // Indicates if any component was recently fetched from API

        const now = Date.now();
        this.componentStats.forEach(stat => {
            total++;
            if (stat.status === 'fresh') {
                fresh++;
                // Check if fetched from API recently (e.g., last 30 seconds)
                if (stat.source === 'api' && (now - stat.timestamp) < 30 * 1000) {
                    hasRecentlyFreshData = true;
                }
            } else if (stat.status === 'cached') {
                cached++;
            } else if (stat.status === 'updates-available') {
                updatesAvailable++;
            } else if (stat.status === 'offline') {
                offline++;
            }
        });

        // Determine browser online status (only if window is defined)
        const isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        return {
            total,
            fresh,
            cached,
            updatesAvailable,
            offline,
            isCompletelyOffline: !isBrowserOnline || offline > 0, // Considered offline if browser is offline or any component is offline
            hasRecentlyFreshData,
            isBrowserOnline // Expose browser online status
        };
    }
}

// Singleton instance
const cacheManager = new CacheManager();
export default cacheManager;

// Export individual methods for convenience
export const {
    generateCacheKey,
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    onUpdate,
    offUpdate,
    triggerUpdate,
    updateComponentStat,
    getComponentStat,
    getAllComponentStats,
    getGlobalCacheStats
} = cacheManager;
