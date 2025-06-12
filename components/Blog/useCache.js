// your existing cache service code:
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (for freshness)
    this.STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000; // 30 minutes (for revalidation)
    // You might want to define a default page limit here if you use it for metadata calculation
    this.PAGE_LIMIT = 10; // Or whatever your default limit is
  }

  // Set data in cache with timestamp and source
  // 🟢 MODIFIED: Added `source` parameter. Storing comprehensive `cacheEntry`.
  set(key, data, source = 'cache') { // Default source to 'cache' if not provided
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.getDataVersion(data),
      source, // Store the source (e.g., 'network', 'offline-fallback', 'fresh')
      metadata: {
        size: JSON.stringify(data).length,
        // Only calculate 'pages' if `data` is an array of items for a single page.
        // If 'data' here could also be a `totalCount` (a number), then this calculation might not apply.
        // For simplicity, we'll assume `data` is the array of items for the current page being cached.
        pageItemsCount: Array.isArray(data) ? data.length : 0 // Number of items on this specific page
      }
    };

    this.cache.set(key, cacheEntry); // Store the full cacheEntry in memory
    this.timestamps.set(key, cacheEntry.timestamp); // Keep timestamp separate for quick isValid check

    // Store in localStorage for offline persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));

      // 🟢 NEW: Dispatch custom event for cache write
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cache-write', {
          detail: {
            key,
            size: cacheEntry.metadata.size,
            source: cacheEntry.source,
            timestamp: cacheEntry.timestamp
          }
        });
        window.dispatchEvent(event);
      }

    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  // Get data from cache
  // 🟢 MODIFIED: Now returns the full `cacheEntry` including source and metadata.
  // 🟢 NEW: Dispatches `cache-served` event when data is retrieved.
  get(key) {
    let result = null;
    let cacheEntry = null;

    // 1. Check memory cache first
    const memoryCacheEntry = this.cache.get(key);
    if (memoryCacheEntry && this.isValid(this.timestamps.get(key))) { // Use the separate timestamp for quick check
      cacheEntry = { ...memoryCacheEntry, source: 'memory', fresh: true };
      result = cacheEntry;
    }

    // 2. If not fresh in memory, check localStorage
    if (!result) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const parsedStored = JSON.parse(stored);
          const { data, timestamp: storedTimestamp, source = 'localStorage', metadata } = parsedStored;

          const isStale = Date.now() - storedTimestamp > this.STALE_WHILE_REVALIDATE_DURATION;

          cacheEntry = {
            data,
            source: source, // Use the stored source or default
            fresh: !isStale,
            shouldRevalidate: isStale,
            timestamp: storedTimestamp, // Include timestamp in returned entry
            metadata: metadata || { size: JSON.stringify(data).length, pageItemsCount: Array.isArray(data) ? data.length : 0 }
          };
          result = cacheEntry;

          // If retrieved from localStorage, put it in memory cache for faster subsequent access
          this.cache.set(key, cacheEntry);
          this.timestamps.set(key, cacheEntry.timestamp);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    // 🟢 NEW: Dispatch custom event for cache serving (if data was found)
    if (result && typeof window !== 'undefined') {
      const event = new CustomEvent('cache-served', {
        detail: {
          key: key,
          source: result.source,
          timestamp: result.timestamp,
          size: result.metadata?.size || 0,
          fresh: result.fresh // Indicate if it's fresh or stale
        }
      });
      window.dispatchEvent(event);
    }

    return result; // Returns the full cacheEntry or null
  }

  // Check if cache is still valid
  isValid(timestamp) {
    return timestamp && (Date.now() - timestamp < this.CACHE_DURATION);
  }

  // Generate a simple version hash for data comparison
  // 🟢 MODIFIED: Make it robust for non-array data types (like totalCount)
  getDataVersion(data) {
    if (data === null || typeof data === 'undefined') {
      return 'null_or_undefined';
    }
    if (typeof data === 'object' && !Array.isArray(data)) {
      // For objects like the { data: [...], total: N } structure from Sanity
      // You might hash based on total, or a combination if needed
      // For now, a simple stringify is fine for general uniqueness.
      return JSON.stringify(data);
    }
    if (Array.isArray(data)) {
      // For arrays of items, hash based on IDs and update times
      return JSON.stringify(data.map(item => ({
        id: item._id,
        updatedAt: item._updatedAt || item.publishedAt // Prioritize _updatedAt
      })));
    }
    // For primitive types (number, string, boolean)
    return String(data);
  }

  // Clear specific cache entry
  clear(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

export const cacheService = new CacheService();