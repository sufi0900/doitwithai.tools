// Create a new file: /lib/staticPageStorage.js
// This will store static page content in IndexedDB for reliable offline access

class StaticPageStorage {
  constructor() {
    this.dbName = 'static-pages-db';
    this.version = 1;
    this.storeName = 'static-pages';
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'path' });
          store.createIndex('lastUpdated', 'lastUpdated');
          store.createIndex('path', 'path', { unique: true });
        }
      };
    });
  }

  async storeStaticPage(path, content, metadata = {}) {
    await this.init();
    
    const data = {
      path,
      content,
      lastUpdated: Date.now(),
      metadata: {
        title: metadata.title || '',
        description: metadata.description || '',
        cached: true,
        ...metadata
      }
    };
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => {
        console.log('Static page stored in IndexedDB:', path);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStaticPage(path) {
    await this.init();
    
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('Static page retrieved from IndexedDB:', path);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async preloadStaticPages() {
    const staticPages = [
      { path: '/about', url: '/about' },
      { path: '/faq', url: '/faq' },
      { path: '/contact', url: '/contact' },
      { path: '/privacy', url: '/privacy' },
      { path: '/terms', url: '/terms' }
    ];

    for (const page of staticPages) {
      try {
        // Check if already cached and fresh (less than 24 hours)
        const cached = await this.getStaticPage(page.path);
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (cached && (now - cached.lastUpdated) < oneDayInMs) {
          console.log('Static page already cached and fresh:', page.path);
          continue;
        }
        
        // Fetch and store the page
        const response = await fetch(page.url);
        if (response.ok) {
          const content = await response.text();
          
          // Extract metadata from the HTML
          const metadata = this.extractMetadata(content);
          
          await this.storeStaticPage(page.path, content, metadata);
        }
        
      } catch (error) {
        console.error('Failed to preload static page:', page.path, error);
      }
    }
  }

  extractMetadata(htmlContent) {
    const metadata = {};
    
    // Extract title
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }
    
    // Extract description
    const descMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    if (descMatch) {
      metadata.description = descMatch[1];
    }
    
    return metadata;
  }

  async getAllStaticPages() {
    await this.init();
    
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredPages() {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    await this.init();
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('lastUpdated');
    
    const request = index.openCursor();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const data = cursor.value;
          if (now - data.lastUpdated > sevenDaysInMs) {
            cursor.delete();
            console.log('Deleted expired static page:', data.path);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const staticPageStorage = new StaticPageStorage();

// Auto-initialize and preload on import
if (typeof window !== 'undefined') {
  staticPageStorage.preloadStaticPages().catch(console.error);
}