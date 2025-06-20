// utils/cachePersistence.js
import cacheManager from './cacheManager';

class CachePersistence {
  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  // Save critical cache data to sessionStorage as backup
  saveCriticalCache(key, data, metadata) {
    if (!this.isClient) return;
    
    try {
      const criticalData = {
        data,
        metadata,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`critical_cache_${key}`, JSON.stringify(criticalData));
    } catch (error) {
      console.warn('Failed to save critical cache:', error);
    }
  }

  // Restore critical cache data
  restoreCriticalCache(key) {
    if (!this.isClient) return null;
    
    try {
      const stored = sessionStorage.getItem(`critical_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is not too old (max 1 hour)
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to restore critical cache:', error);
    }
    return null;
  }

  // Initialize cache restoration on page load
  initializeCache() {
    if (!this.isClient) return;
    
    // This will be called when the app starts
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith('critical_cache_'));
    keys.forEach(key => {
      const cacheKey = key.replace('critical_cache_', '');
      const restored = this.restoreCriticalCache(cacheKey);
      if (restored) {
        cacheManager.setCache(cacheKey, restored.data, restored.metadata);
      }
    });
  }
}

const cachePersistence = new CachePersistence();
export default cachePersistence;