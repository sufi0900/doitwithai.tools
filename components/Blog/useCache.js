class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000; // 30 minutes
  }

  // Set data in cache with timestamp
  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    
    // Store in localStorage for offline persistence
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: this.getDataVersion(data)
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  // Get data from cache
  get(key) {
    const memoryData = this.cache.get(key);
    const timestamp = this.timestamps.get(key);
    
    if (memoryData && this.isValid(timestamp)) {
      return { data: memoryData, source: 'memory', fresh: true };
    }
    
    // Check localStorage for offline support
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const { data, timestamp: storedTimestamp } = JSON.parse(stored);
        const isStale = Date.now() - storedTimestamp > this.STALE_WHILE_REVALIDATE_DURATION;
        
        return { 
          data, 
          source: 'localStorage', 
          fresh: !isStale,
          shouldRevalidate: isStale
        };
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    
    return null;
  }

  // Check if cache is still valid
  isValid(timestamp) {
    return timestamp && (Date.now() - timestamp < this.CACHE_DURATION);
  }

  // Generate a simple version hash for data comparison
  getDataVersion(data) {
    return JSON.stringify(data.map(item => ({ 
      id: item._id, 
      updatedAt: item._updatedAt || item.publishedAt 
    }))).length;
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
