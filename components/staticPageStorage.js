// React_Query_Caching/staticPageCache.js
class StaticPageCache {
  constructor() {
    this.memoryCache = new Map();
    this.dbName = 'static-pages-cache';
    this.version = 1;
    this.storeName = 'pages';
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'path' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async cachePage(path, htmlContent) {
    try {
      // Store in memory
      this.memoryCache.set(path, {
        content: htmlContent,
        timestamp: Date.now()
      });

      // Store in IndexedDB
      const db = await this.init();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await store.put({
        path,
        content: htmlContent,
        timestamp: Date.now()
      });
      
      console.log('✅ Cached static page:', path);
    } catch (error) {
      console.error('Failed to cache static page:', path, error);
    }
  }

  async getCachedPage(path) {
    try {
      // Try memory first
      const memoryResult = this.memoryCache.get(path);
      if (memoryResult) {
        return memoryResult.content;
      }

      // Try IndexedDB
      const db = await this.init();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const result = await store.get(path);
      
      if (result) {
        // Update memory cache
        this.memoryCache.set(path, {
          content: result.content,
          timestamp: result.timestamp
        });
        return result.content;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached page:', path, error);
      return null;
    }
  }
}

export const staticPageCache = new StaticPageCache();