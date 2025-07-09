// public/sw.js - Update with better caching strategy
const CACHE_NAME = 'doitwithai-v1';
const RUNTIME_CACHE = 'runtime-v1';
const PAGES_CACHE = 'pages-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html'
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
          if (![CACHE_NAME, RUNTIME_CACHE, PAGES_CACHE].includes(cacheName)) {
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
  if (request.url.includes('/sw.js')) return;
  
  // Skip API routes that might cause hydration issues
  if (url.pathname.startsWith('/api/')) return;
  
  // Skip build manifests and internal Next.js files
  if (request.url.includes('/_next/') && 
      (request.url.includes('manifest.json') || 
       request.url.includes('build-manifest'))) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('SW: Serving from cache:', request.url);
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine cache strategy based on request type
        let cacheName = RUNTIME_CACHE;
        
        // Cache HTML pages in pages cache
        if (request.mode === 'navigate' || 
            (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
          cacheName = PAGES_CACHE;
          console.log('SW: Caching page:', request.url);
        }

        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        console.log('SW: Offline, trying cache for:', request.url);
        
        // For navigation requests, try to serve cached page or offline page
        if (request.mode === 'navigate') {
          return caches.match(request).then((cachedPage) => {
            if (cachedPage) {
              return cachedPage;
            }
            return caches.match('/offline.html');
          });
        }
        
        // For other requests, try to find in any cache
        return caches.match(request);
      });
    })
  );
});