// Import Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log('Workbox loaded successfully');
  
  // Enable workbox logs in development
  if (process.env.NODE_ENV === 'development') {
    workbox.setConfig({ debug: true });
  }

  // Cache version
  const CACHE_VERSION = 'v8';
  const STATIC_CACHE = `doitwithai-static-${CACHE_VERSION}`;
  const DYNAMIC_CACHE = `doitwithai-dynamic-${CACHE_VERSION}`;
  const PAGES_CACHE = `doitwithai-pages-${CACHE_VERSION}`;

  // Static pages to precache
  const STATIC_PAGES = [
    '/',
    '/about',
    '/faq', 
    '/contact',
    '/privacy',
    '/terms'
  ];

  // Dynamic pages to precache
  const DYNAMIC_PAGES = [
    '/ai-tools',
    '/ai-seo', 
    '/ai-code',
    '/ai-learn-earn',
    '/free-ai-resources',
    '/ai-news'
  ];

  // Precache static assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // Install event - precache important pages
  self.addEventListener('install', (event) => {
    console.log('SW: Installing...');
    event.waitUntil(
      (async () => {
        try {
          // Precache static pages
          const staticCache = await caches.open(STATIC_CACHE);
          console.log('SW: Precaching static pages...');
          
          for (const page of STATIC_PAGES) {
            try {
              const response = await fetch(page, {
                mode: 'navigate',
                credentials: 'same-origin'
              });
              
              if (response.ok) {
                await staticCache.put(page, response.clone());
                // Cache multiple URL variations
                const variations = [
                  page,
                  page === '/' ? '/' : page.replace(/\/$/, ''),
                  page === '/' ? '/' : page + '/'
                ];
                
                for (const variation of variations) {
                  if (variation !== page) {
                    await staticCache.put(variation, response.clone());
                  }
                }
                console.log(`SW: Precached static page: ${page}`);
              }
            } catch (error) {
              console.log(`SW: Failed to precache static page ${page}:`, error);
            }
          }

          // Precache dynamic pages
          const dynamicCache = await caches.open(DYNAMIC_CACHE);
          console.log('SW: Precaching dynamic pages...');
          
          for (const page of DYNAMIC_PAGES) {
            try {
              const response = await fetch(page, {
                mode: 'navigate',
                credentials: 'same-origin'
              });
              
              if (response.ok) {
                await dynamicCache.put(page, response.clone());
                console.log(`SW: Precached dynamic page: ${page}`);
                
                // Also cache the RSC payload
                try {
                  const rscResponse = await fetch(`${page}?_rsc=1`, {
                    mode: 'same-origin',
                    credentials: 'same-origin'
                  });
                  if (rscResponse.ok) {
                    await dynamicCache.put(`${page}?_rsc=1`, rscResponse);
                  }
                } catch (rscError) {
                  console.log(`SW: Failed to cache RSC for ${page}`);
                }
              }
            } catch (error) {
              console.log(`SW: Failed to precache dynamic page ${page}:`, error);
            }
          }

          console.log('SW: Precaching completed');
        } catch (error) {
          console.error('SW: Precaching failed:', error);
        }
      })()
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
  });

  // Activate event - clean old caches
  self.addEventListener('activate', (event) => {
    console.log('SW: Activating...');
    event.waitUntil(
      (async () => {
        // Clean old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('doitwithai-') && !name.includes(CACHE_VERSION)
        );
        
        await Promise.all(
          oldCaches.map(cache => caches.delete(cache))
        );
        
        console.log('SW: Old caches cleaned');
        
        // Claim all clients
        return self.clients.claim();
      })()
    );
  });

  // Enhanced fetch handler
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // Navigation requests (page loads)
    if (request.mode === 'navigate') {
      event.respondWith(
        (async () => {
          try {
            // Try network first
            const networkResponse = await fetch(request);
            
            // Cache successful responses
            if (networkResponse.ok) {
              const cache = await caches.open(PAGES_CACHE);
              await cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
          } catch (error) {
            // Network failed, try cache
            console.log('SW: Network failed, trying cache for:', url.pathname);
            
            // Try different cache stores
            const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, PAGES_CACHE];
            
            for (const cacheName of cacheNames) {
              const cache = await caches.open(cacheName);
              
              // Try exact match first
              let cachedResponse = await cache.match(request);
              
              // Try URL variations
              if (!cachedResponse) {
                const variations = [
                  url.pathname,
                  url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, ''),
                  url.pathname === '/' ? '/' : url.pathname + '/'
                ];
                
                for (const variation of variations) {
                  cachedResponse = await cache.match(variation);
                  if (cachedResponse) break;
                }
              }
              
              if (cachedResponse) {
                console.log(`SW: Serving from cache (${cacheName}):`, url.pathname);
                return cachedResponse;
              }
            }
            
            // If still no match, return offline page or error
            console.log('SW: No cached version found for:', url.pathname);
            return new Response('Page not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          }
        })()
      );
      return;
    }

    // API requests
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        workbox.strategies.networkFirst({
          cacheName: 'api-cache',
          networkTimeoutSeconds: 5,
          plugins: [
            {
              cacheWillUpdate: async ({ response }) => {
                return response.status === 200 ? response : null;
              }
            }
          ]
        })(event)
      );
      return;
    }

    // Static assets
    if (url.pathname.startsWith('/_next/static/')) {
      event.respondWith(
        workbox.strategies.cacheFirst({
          cacheName: 'next-static-cache',
          plugins: [
            {
              cacheWillUpdate: async ({ response }) => {
                return response.status === 200 ? response : null;
              }
            }
          ]
        })(event)
      );
      return;
    }

    // Images
    if (request.destination === 'image') {
      event.respondWith(
        workbox.strategies.cacheFirst({
          cacheName: 'images-cache',
          plugins: [
            {
              cacheWillUpdate: async ({ response }) => {
                return response.status === 200 ? response : null;
              }
            }
          ]
        })(event)
      );
      return;
    }
  });

  // Message handler for manual cache updates
  self.addEventListener('message', (event) => {
    const { type, path, url } = event.data;
    
    if (type === 'PRECACHE_PAGE' && path) {
      // Cache the page
      caches.open(PAGES_CACHE).then(cache => {
        return fetch(path, {
          mode: 'navigate',
          credentials: 'same-origin'
        }).then(response => {
          if (response.ok) {
            cache.put(path, response.clone());
            console.log(`SW: Manually cached page: ${path}`);
          }
        }).catch(error => {
          console.log(`SW: Failed to manually cache page ${path}:`, error);
        });
      });
    }
    
    if (type === 'CACHE_UPDATE' && url) {
      // Handle cache updates from client
      console.log('SW: Received cache update request for:', url);
    }
  });

} else {
  console.log('Workbox failed to load');
}