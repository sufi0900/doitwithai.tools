// Add this to your service worker (in the message event listener)
self.addEventListener('message', (event) => {
  if (event.data.type === 'PREFETCH_PAGES') {
    const { staticPages, dynamicPages } = event.data;
    
    // Prefetch static pages aggressively
    Promise.all(staticPages.map(async (page) => {
      try {
        const response = await fetch(page, { mode: 'same-origin' });
        if (response.ok) {
          const cache = await caches.open('static-pages-v1');
          await cache.put(page, response.clone());
          console.log('SW: Prefetched static page:', page);
        }
      } catch (error) {
        console.log('SW: Failed to prefetch:', page, error);
      }
    }));
    
    // Prefetch dynamic pages (shell only)
    Promise.all(dynamicPages.map(async (page) => {
      try {
        const response = await fetch(page, { mode: 'same-origin' });
        if (response.ok) {
          const cache = await caches.open('dynamic-pages-v1');
          await cache.put(page, response.clone());
          console.log('SW: Prefetched dynamic page:', page);
        }
      } catch (error) {
        console.log('SW: Failed to prefetch dynamic page:', page, error);
      }
    }));
  }
});