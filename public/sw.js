const CACHE_NAME = 'doitwithai-v2';
const RUNTIME_CACHE = 'runtime-v2';
const STATIC_CACHE = 'static-v2';
const API_CACHE = 'api-v2';

// Enhanced precache list
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/ai-tools',
  '/ai-seo', 
  '/ai-code',
  '/ai-learn-earn',
  '/free-ai-resources',
  '/ai-news',
  // Add your static assets
  '/manifest.json',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png'
];

// Install event - Enhanced precaching
self.addEventListener('install', (event) => {
  console.log('SW: Installing v2');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Precaching URLs');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('SW: Precaching complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('SW: Install failed', err);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v2');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Enhanced fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip service worker requests
  if (url.pathname.includes('/sw.js')) return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip webpack HMR and other Next.js internal requests
  if (url.pathname.includes('/_next/') && (
    url.pathname.includes('webpack') ||
    url.pathname.includes('hmr') ||
    url.search.includes('ts=')
  )) return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const isNavigationRequest = request.mode === 'navigate';
  const isAPIRequest = url.pathname.includes('/api/');
  const isSanityRequest = url.hostname.includes('sanity.io');
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
  const isNextStatic = url.pathname.includes('/_next/static/');

  try {
    // 1. Handle Navigation Requests (Page loads)
    if (isNavigationRequest) {
      return await handleNavigationRequest(request);
    }

    // 2. Handle API Requests
    if (isAPIRequest || isSanityRequest) {
      return await handleAPIRequest(request);
    }

    // 3. Handle Static Assets
    if (isStaticAsset || isNextStatic) {
      return await handleStaticAsset(request);
    }

    // 4. Handle Other Requests
    return await handleOtherRequests(request);

  } catch (error) {
    console.error('SW: Request handler failed:', error);
    return await handleOfflineResponse(request);
  }
}

// Handle navigation requests with stale-while-revalidate strategy
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving navigation from cache:', url.pathname);
      
      // Try to update cache in background
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response.clone());
            });
          }
        })
        .catch(() => {
          // Network failed, but we have cached version
        });
      
      return cachedResponse;
    }

    // No cache, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached navigation response:', url.pathname);
      return networkResponse;
    }

    return networkResponse;

  } catch (error) {
    console.log('SW: Navigation request failed:', url.pathname, error);
    
    // Try to serve from cache one more time
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Check if it's a dynamic route that might be cached with different URL
    const dynamicCacheResponse = await findDynamicRoute(url.pathname);
    if (dynamicCacheResponse) {
      return dynamicCacheResponse;
    }

    // Return offline page
    return await caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful API response
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached API response:', url.pathname);
      return networkResponse;
    }

    return networkResponse;

  } catch (error) {
    console.log('SW: API request failed, trying cache:', url.pathname);
    
    // Try cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('SW: Serving API from cache:', url.pathname);
      return cachedResponse;
    }

    // Return error response
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving static asset from cache:', url.pathname);
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful response
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached static asset:', url.pathname);
      return networkResponse;
    }

    return networkResponse;

  } catch (error) {
    console.log('SW: Static asset request failed:', url.pathname, error);
    
    // Try cache one more time
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return 404 for missing assets
    return new Response('Asset not found', { status: 404 });
  }
}

// Handle other requests
async function handleOtherRequests(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving other request from cache:', url.pathname);
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache in runtime cache
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached other request:', url.pathname);
      return networkResponse;
    }

    return networkResponse;

  } catch (error) {
    console.log('SW: Other request failed:', url.pathname, error);
    return await handleOfflineResponse(request);
  }
}

// Find dynamic route in cache
async function findDynamicRoute(pathname) {
  const cacheNames = [CACHE_NAME, RUNTIME_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const keyUrl = new URL(key.url);
      
      // Check if this might be the same dynamic route
      if (keyUrl.pathname.includes(pathname.split('/')[1])) {
        const response = await cache.match(key);
        if (response) {
          console.log('SW: Found similar dynamic route:', keyUrl.pathname);
          return response;
        }
      }
    }
  }
  
  return null;
}

// Handle offline responses
async function handleOfflineResponse(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
  
  // For other requests, try to find any cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return appropriate error
  return new Response('Network unavailable', { status: 503 });
}

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    const { url, data } = event.data;
    
    caches.open(RUNTIME_CACHE).then(cache => {
      cache.put(url, new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      }));
    });
  }
});

// Background sync for cache updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cache-update') {
    event.waitUntil(updateCaches());
  }
});

async function updateCaches() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    for (const key of keys) {
      try {
        const response = await fetch(key);
        if (response && response.status === 200) {
          await cache.put(key, response);
          console.log('SW: Updated cache for:', key.url);
        }
      } catch (error) {
        console.log('SW: Failed to update cache for:', key.url);
      }
    }
  } catch (error) {
    console.error('SW: Cache update failed:', error);
  }
}