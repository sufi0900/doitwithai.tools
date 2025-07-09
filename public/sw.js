// public/sw.js
const CACHE_NAME = 'doitwithai-v1';
const RUNTIME_CACHE = 'runtime-v1';
const STATIC_CACHE = 'static-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        // Add your main routes
        '/ai-tools',
        '/ai-seo', 
        '/ai-code',
        '/ai-learn-earn',
        '/free-ai-resources',
        '/ai-news'
      ]);
    }).catch(err => {
      console.error('SW: Install failed', err);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - Enhanced for better page caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip service worker requests
  if (url.pathname.includes('/sw.js')) return;
  
  // Skip Next.js internal files that cause issues
  if (url.pathname.includes('/_next/') && 
      (url.pathname.includes('manifest') || 
       url.pathname.includes('build-manifest') ||
       url.pathname.includes('webpack'))) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('SW: Serving from cache:', url.pathname);
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine cache strategy based on request type
        let cacheName = RUNTIME_CACHE;
        
        // Cache HTML pages in main cache
        if (request.mode === 'navigate' || 
            (request.headers.get('accept') && 
             request.headers.get('accept').includes('text/html'))) {
          cacheName = CACHE_NAME;
        }
        
        // Cache static assets
        if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
          cacheName = STATIC_CACHE;
        }

        caches.open(cacheName).then((cache) => {
          console.log('SW: Caching:', url.pathname, 'in', cacheName);
          cache.put(request, responseToCache);
        });

        return response;
      }).catch((error) => {
        console.log('SW: Fetch failed for:', url.pathname, error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // For other requests, try to find a cached version
        return caches.match(request);
      });
    })
  );
});