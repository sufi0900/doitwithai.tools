// Custom service worker enhancements
self.addEventListener('install', (event) => {
  console.log('SW: Custom install logic');
  event.waitUntil(
    caches.open('static-pages-precache-v2').then(cache => {
      // Force immediate activation
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Custom activate logic');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name.startsWith('static-pages-precache-v1'))
            .map(name => caches.delete(name))
        );
      })
    ])
  );
});

// Enhanced fetch handler for static pages
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle static pages with cache-first strategy
  if (url.pathname.match(/^\/(about|faq|contact|privacy|terms|ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          console.log('SW: Serving from cache:', url.pathname);
          return response;
        }
        
        // If not in cache, fetch and cache
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open('static-pages-precache-v2').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});