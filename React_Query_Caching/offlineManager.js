class OfflineManager {
  constructor() {
    this.isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    this.listeners = new Set();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.notifyListeners();
  }

  handleOffline() {
    this.isOnline = false;
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  // Cache critical pages for offline viewing
  async precachePages() {
    const criticalPages = [
      '/ai-tools',
      '/ai-seo', 
      '/ai-code',
      '/ai-learn-earn',
      '/free-ai-resources',
      '/ai-news'
    ];

    if ('caches' in window) {
      const cache = await caches.open('pages-cache-v1');
      const promises = criticalPages.map(page => 
        cache.add(page).catch(err => console.warn(`Failed to cache ${page}:`, err))
      );
      await Promise.all(promises);
    }
  }
}

export const offlineManager = new OfflineManager();