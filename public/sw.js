const CACHE_NAME = 'doitwithai-v7'; // Increment version
const RUNTIME_CACHE = 'runtime-v7';
const STATIC_CACHE = 'static-v7';
const API_CACHE = 'api-v7';
const PAGES_CACHE = 'pages-v7';
// Enhanced precache list with proper static pages
const PRECACHE_URLS = [
    '/',
    '/offline.html',
    '/ai-tools',
    '/ai-seo',
    '/ai-code',
    '/ai-learn-earn',
    '/free-ai-resources',
    '/ai-news',
    '/about',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
    '/manifest.json',
    '/icons/web-app-manifest-192x192.png',
    '/icons/web-app-manifest-512x512.png'
];

// Install event - Enhanced precaching
self.addEventListener('install', (event) => {
    console.log('SW: Installing v4');
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

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('SW: Activating v4');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (![CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE, API_CACHE, PAGES_CACHE].includes(cacheName)) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('SW: Claiming clients');
            return self.clients.claim();
        })
    );
});



// Enhanced fetch handler with proper navigation handling// Replace the entire fetch event listener in sw.js
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip service worker requests
  if (url.pathname.includes('/sw.js')) return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip webpack HMR
  if (url.pathname.includes('/_next/') && url.search.includes('ts=')) return;

  event.respondWith(handleSimplifiedRequest(request));
});

// Add this new simplified request handler
async function handleSimplifiedRequest(request) {
  const url = new URL(request.url);
  const isNavigationRequest = request.mode === 'navigate';
  const isAPIRequest = url.pathname.includes('/api/') || url.hostname.includes('sanity.io');
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
  const isNextStatic = url.pathname.includes('/_next/static/');

  try {
    // Handle navigation requests
    if (isNavigationRequest) {
      return await handleNavigationRequest(request);
    }

    // Handle static assets (cache first)
    if (isStaticAsset || isNextStatic) {
      return await handleStaticAsset(request);
    }

    // Handle API requests (network first)
    if (isAPIRequest) {
      return await handleAPIRequest(request);
    }

    // Handle other requests
    return await handleOtherRequests(request);

  } catch (error) {
    console.error('SW: Request failed:', error);
    if (isNavigationRequest) {
      return await getOfflinePage();
    }
    return new Response('Service Unavailable', { status: 503 });
  }
}

// Replace the entire fetch event listener in sw.js
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip service worker requests
  if (url.pathname.includes('/sw.js')) return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip webpack HMR
  if (url.pathname.includes('/_next/') && url.search.includes('ts=')) return;

  event.respondWith(handleSimplifiedRequest(request));
});

// Add this new simplified request handler
async function handleSimplifiedRequest(request) {
  const url = new URL(request.url);
  const isNavigationRequest = request.mode === 'navigate';
  const isAPIRequest = url.pathname.includes('/api/') || url.hostname.includes('sanity.io');
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
  const isNextStatic = url.pathname.includes('/_next/static/');

  try {
    // Handle navigation requests
    if (isNavigationRequest) {
      return await handleNavigationRequest(request);
    }

    // Handle static assets (cache first)
    if (isStaticAsset || isNextStatic) {
      return await handleStaticAsset(request);
    }

    // Handle API requests (network first)
    if (isAPIRequest) {
      return await handleAPIRequest(request);
    }

    // Handle other requests
    return await handleOtherRequests(request);

  } catch (error) {
    console.error('SW: Request failed:', error);
    if (isNavigationRequest) {
      return await getOfflinePage();
    }
    return new Response('Service Unavailable', { status: 503 });
  }
}

async function handleRequest(request) {
    const url = new URL(request.url);
    const isNavigationRequest = request.mode === 'navigate';
    const isAPIRequest = url.pathname.includes('/api/');
    const isSanityRequest = url.hostname.includes('sanity.io');
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
    const isNextStatic = url.pathname.includes('/_next/static/');
    const isRSCRequest = url.search.includes('_rsc=') || url.pathname.includes('/_next/');
    
    try {
        // 1. Handle Navigation Requests (Page loads)
        if (isNavigationRequest) {
            return await handleNavigationRequest(request);
        }
        
        // 2. Handle RSC (React Server Components) Requests
        if (isRSCRequest) {
            return await handleRequest(request);
        }
        
        // 3. Handle Next.js API Routes
        if (isAPIRequest) {
            return await handleNextAPIRequest(request);
        }
        
        // 4. Handle Sanity API Requests
        if (isSanityRequest) {
            return await handleAPIRequest(request);
        }
        
        // 5. Handle Static Assets
        if (isStaticAsset || isNextStatic) {
            return await handleStaticAsset(request);
        }
        
        // 6. Handle Other Requests
        return await handleOtherRequests(request);
        
    } catch (error) {
        console.error('SW: Request handler failed:', error);
        return await handleOfflineResponse(request);
    }
}

// Replace the existing handleNavigationRequest function
// Replace the existing handleNavigationRequest function
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  console.log('SW: Handling navigation request for:', pathname);

  try {
    // Try network first with timeout
    if (navigator.onLine) {
      try {
        const networkResponse = await Promise.race([
          fetch(request),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Network timeout')), 5000)
          )
        ]);
        
        if (networkResponse && networkResponse.status === 200) {
          // Cache in primary store only
          const cache = await caches.open(PAGES_CACHE);
          await cache.put(request, networkResponse.clone());
          console.log('SW: Cached navigation response:', pathname);
          return networkResponse;
        }
      } catch (networkError) {
        console.log('SW: Network failed for navigation:', pathname);
      }
    }

    // Try cache if network fails or offline
    return await getCachedNavigationImproved(request);
    
  } catch (error) {
    console.log('SW: Navigation request failed:', pathname);
    return await getCachedNavigationImproved(request);
  }
}
// Replace getCachedNavigation with this improved version:

async function getCachedNavigationImproved(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  console.log('SW: Looking for cached navigation:', pathname);

  // Simplified URL variations
  const urlsToTry = [
    pathname,
    pathname === '/' ? '/' : pathname.replace(/\/$/, ''),
    pathname === '/' ? '/' : pathname + '/',
  ];

  // Try each cache store in priority order
  const cacheStores = [PAGES_CACHE, CACHE_NAME, RUNTIME_CACHE];
  
  for (const cacheStore of cacheStores) {
    try {
      const cache = await caches.open(cacheStore);
      
      // Try exact matches first
      for (const urlToTry of urlsToTry) {
        const cachedResponse = await cache.match(urlToTry);
        if (cachedResponse) {
          console.log('SW: Found cached page:', urlToTry, 'in', cacheStore);
          return cachedResponse;
        }
      }
      
      // Try with request object
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('SW: Found cached page via request match in', cacheStore);
        return cachedResponse;
      }
      
    } catch (error) {
      console.log('SW: Cache access failed for:', cacheStore);
    }
  }

  // Return offline page if no cache found
  return await getOfflinePage();
}

// Add this function to your sw.js file
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE, API_CACHE, PAGES_CACHE];
  
  // Only delete caches that are clearly old versions
  const cachesToDelete = cacheNames.filter(cacheName => {
    // Don't delete current caches
    if (currentCaches.includes(cacheName)) return false;
    
    // Only delete caches that match our naming pattern but are old versions
    const isOldVersion = cacheName.match(/^(doitwithai|runtime|static|api|pages)-v\d+$/) && 
                         !cacheName.includes('v7');
    
    return isOldVersion;
  });
  
  return Promise.all(
    cachesToDelete.map(cacheName => {
      console.log('SW: Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}

// Update your activate event listener:
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v7');
  event.waitUntil(
    cleanupOldCaches()
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
  );
});


// Add this function to your sw.js
async function ensureCachePersistence() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const persistent = await navigator.storage.persist();
    console.log('SW: Cache persistence:', persistent ? 'granted' : 'denied');
    
    if (persistent) {
      const estimate = await navigator.storage.estimate();
      console.log('SW: Storage estimate:', estimate);
    }
  }
}

// Call this in your install event:
self.addEventListener('install', (event) => {
  console.log('SW: Installing v7');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('SW: Precaching URLs');
        return cache.addAll(PRECACHE_URLS);
      }),
      ensureCachePersistence()
    ]).then(() => {
      console.log('SW: Precaching complete');
      return self.skipWaiting();
    }).catch(err => {
      console.error('SW: Install failed', err);
    })
  );
});


// Enhanced static page caching function
async function cacheStaticPageAggressively(request, response) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Cache in multiple stores for redundancy
    const cachePromises = [
      caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())),
      caches.open(PAGES_CACHE).then(cache => cache.put(request, response.clone())),
      caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()))
    ];
    
    // Also cache with and without trailing slash
    const alternativeUrl = pathname.endsWith('/') ? 
      pathname.slice(0, -1) : pathname + '/';
    
    if (alternativeUrl !== pathname) {
      const alternativeRequest = new Request(url.origin + alternativeUrl, request);
      cachePromises.push(
        caches.open(CACHE_NAME).then(cache => cache.put(alternativeRequest, response.clone())),
        caches.open(PAGES_CACHE).then(cache => cache.put(alternativeRequest, response.clone())),
        caches.open(STATIC_CACHE).then(cache => cache.put(alternativeRequest, response.clone()))
      );
    }
    
    await Promise.all(cachePromises);
    console.log('SW: Aggressively cached static page:', pathname);
    
  } catch (error) {
    console.error('SW: Failed to cache static page:', pathname, error);
  }
}

// Enhanced cache retrieval for static pages
// Enhanced static page caching function
async function cacheStaticPageAggressively(request, response) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Cache in multiple stores for redundancy
    const cachePromises = [
      caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())),
      caches.open(PAGES_CACHE).then(cache => cache.put(request, response.clone())),
      caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()))
    ];
    
    // Also cache with and without trailing slash
    const alternativeUrl = pathname.endsWith('/') ? 
      pathname.slice(0, -1) : pathname + '/';
    
    if (alternativeUrl !== pathname) {
      const alternativeRequest = new Request(url.origin + alternativeUrl, request);
      cachePromises.push(
        caches.open(CACHE_NAME).then(cache => cache.put(alternativeRequest, response.clone())),
        caches.open(PAGES_CACHE).then(cache => cache.put(alternativeRequest, response.clone())),
        caches.open(STATIC_CACHE).then(cache => cache.put(alternativeRequest, response.clone()))
      );
    }
    
    await Promise.all(cachePromises);
    console.log('SW: Aggressively cached static page:', pathname);
    
  } catch (error) {
    console.error('SW: Failed to cache static page:', pathname, error);
  }
}

// Enhanced cache retrieval for static pages
async function getCachedStaticPage(request, allowStale = false) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Try multiple URL variations
  const urlsToTry = [
    request.url,
    pathname,
    pathname.replace(/\/$/, ''), // without trailing slash
    pathname.endsWith('/') ? pathname : pathname + '/', // with trailing slash
    url.origin + pathname
  ];
  
  // Try multiple cache stores
  const cacheStores = [STATIC_CACHE, CACHE_NAME, PAGES_CACHE, RUNTIME_CACHE];
  
  for (const cacheStore of cacheStores) {
    try {
      const cache = await caches.open(cacheStore);
      
      for (const urlToTry of urlsToTry) {
        const cachedResponse = await cache.match(urlToTry);
        if (cachedResponse) {
          console.log('SW: Found cached static page:', urlToTry, 'in', cacheStore);
          return cachedResponse;
        }
      }
    } catch (error) {
      console.log('SW: Cache access failed for:', cacheStore);
    }
  }
  
  return null;
}


// Helper function to get cached navigation response
async function getCachedNavigation(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  console.log('SW: Looking for cached navigation:', pathname);

  // Simple cache matching strategies
  const urlsToTry = [
    request.url,
    pathname,
    pathname === '/' ? '/' : pathname.replace(/\/$/, ''), // Try without trailing slash
    pathname === '/' ? '/' : pathname + '/', // Try with trailing slash
    url.origin + pathname
  ];

  // Try each cache store
  const cacheStores = [CACHE_NAME, PAGES_CACHE, RUNTIME_CACHE];
  for (const cacheStore of cacheStores) {
    try {
      const cache = await caches.open(cacheStore);
      for (const urlToTry of urlsToTry) {
        const cachedResponse = await cache.match(urlToTry);
        if (cachedResponse) {
          console.log('SW: Found cached page:', urlToTry, 'in', cacheStore);
          return cachedResponse;
        }
      }
    } catch (error) {
      console.log('SW: Cache access failed for:', cacheStore);
    }
  }
  return null; // Return null if no cached response is found
}

// Handle RSC requests specially
async function handleRequest(request) {
    const url = new URL(request.url);
    const isNavigationRequest = request.mode === 'navigate';
    const isAPIRequest = url.pathname.includes('/api/') || url.hostname.includes('sanity.io');
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
    const isNextStatic = url.pathname.includes('/_next/static/');
    const isRSCRequest = url.search.includes('_rsc=') || url.pathname.includes('/_next/');
    
    try {
        // 1. Handle Navigation Requests (Page loads) - PRIORITY
        if (isNavigationRequest) {
            return await handleNavigationRequest(request);
        }
        
        // 2. Handle Static Assets
        if (isStaticAsset || isNextStatic) {
            return await handleStaticAsset(request);
        }
        
        // 3. Handle API Requests
        if (isAPIRequest) {
            return await handleAPIRequest(request);
        }
        
        // 4. Handle RSC Requests
        if (isRSCRequest) {
            return await handleRSCRequest(request);
        }
        
        // 5. Handle Other Requests
        return await handleOtherRequests(request);
        
    } catch (error) {
        console.error('SW: Request handler failed:', error);
        
        if (isNavigationRequest) {
            return await getOfflinePage();
        }
        
        return new Response('Network Error', { status: 503 });
    }
}

// Handle API requests with enhanced caching for Sanity data
async function handleAPIRequest(request) {
    const url = new URL(request.url);
    const isSanityRequest = url.hostname.includes('sanity.io');
    
    try {
        // For Sanity requests, try cache first when offline
        if (isSanityRequest && !navigator.onLine) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log('SW: Serving Sanity data from cache (offline):', url.pathname);
                return cachedResponse;
            }
        }
        
        // Try network first
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), 8000)
            )
        ]);
        
        if (networkResponse && networkResponse.status === 200) {
            // Cache successful API response with longer expiry for Sanity
            const cache = await caches.open(API_CACHE);
            const responseClone = networkResponse.clone();
            
            // Store with custom headers for better offline access
            const enhancedResponse = new Response(await responseClone.text(), {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: {
                    ...Object.fromEntries(networkResponse.headers.entries()),
                    'sw-cached': new Date().toISOString(),
                    'sw-cache-type': isSanityRequest ? 'sanity-api' : 'api'
                }
            });
            
            cache.put(request, enhancedResponse);
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
        
        // Return appropriate error response
        return new Response(JSON.stringify({
            error: 'Network unavailable',
            offline: true,
            cached: false
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


// Handle Next.js API routes specifically
async function handleNextAPIRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Check if offline first
        if (!navigator.onLine) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log('SW: Serving Next.js API from cache (offline):', url.pathname);
                return cachedResponse;
            }
        }
        
        // Try network with timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), 5000)
            )
        ]);
        
        if (networkResponse && networkResponse.status === 200) {
            // Cache the API response
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('SW: Cached Next.js API response:', url.pathname);
            return networkResponse;
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('SW: Next.js API request failed:', url.pathname);
        
        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return empty response to prevent errors
        return new Response(JSON.stringify({ error: 'Offline', data: [] }), {
            status: 200,
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
    const cacheNames = [CACHE_NAME, RUNTIME_CACHE, PAGES_CACHE];
    
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


// Add this after the existing message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    const { url, data } = event.data;
    caches.open(RUNTIME_CACHE).then(cache => {
      cache.put(url, new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      }));
    });
  }
  
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ... (skip non-GET, sw.js, chrome-extension, webpackHMR requests)

  // Determine if it's an HTML request (for navigation or client-side HTML fetch)
  const isHtmlRequest = request.headers.get('accept')?.includes('text/html');

  // Determine if it's a top-level navigation (only true for full page loads)
  const isTopLevelNavigation = request.mode === 'navigate';

  // Identify RSC (React Server Component) payloads
  const isRSCPayload = url.search.includes('_rsc=') || request.headers.get('RSC'); // Next.js 13+ might send 'RSC' header

  // Your existing checks
  const isAPIRequest = url.pathname.includes('/api/') || url.hostname.includes('sanity.io');
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
  const isNextStatic = url.pathname.includes('/_next/static/');

  event.respondWith(
    (async () => {
      try {
        // PRIORITY 1: Handle actual top-level navigations (full page loads)
        if (isTopLevelNavigation) {
          console.log('SW: Handling top-level navigation request for:', url.pathname);
          return await handleNavigationRequest(request);
        }

        // PRIORITY 2: Handle client-side HTML fetches (e.g., from preCachePages or cacheCurrentPage)
        // This is crucial for caching pages navigated via Link component after a refresh
        if (isHtmlRequest) {
          console.log('SW: Handling client-side HTML fetch for:', url.pathname);
          // Use a network-first strategy, but aggressively cache successful responses
          const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => setTimeout(() => reject(new Error('HTML fetch timeout')), 5000))
          ]);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(PAGES_CACHE);
            const runtimeCache = await caches.open(RUNTIME_CACHE); // Also put in runtime for other uses
            cache.put(request, networkResponse.clone());
            runtimeCache.put(request, networkResponse.clone());
            console.log('SW: Cached client-side HTML response in multiple stores:', url.pathname);
            return networkResponse;
          }
        }

        // PRIORITY 3: Handle static assets (cache-first)
        if (isStaticAsset || isNextStatic) {
          return await handleStaticAsset(request);
        }

        // PRIORITY 4: Handle API requests (network-first, fall back to cache)
        if (isAPIRequest) {
          return await handleAPIRequest(request);
        }

        // PRIORITY 5: Handle RSC (React Server Components) payloads (network-first, fall back to cache)
        if (isRSCPayload) {
          return await handleRSCRequest(request);
        }

        // PRIORITY 6: Handle other requests (network-first, fall back to cache)
        return await handleOtherRequests(request);

      } catch (error) {
        console.error('SW: Request handler failed:', error);
        // If navigation request fails, show offline page
        if (isTopLevelNavigation || isHtmlRequest) {
          return await getOfflinePage();
        }
        return new Response('Network Error or Resource Not Available Offline', { status: 503 });
      }
    })()
  );
});


  // Add this new handler for precaching pages
  if (event.data && event.data.type === 'PRECACHE_PAGE') {
    const { path, url } = event.data;
    
    // Cache the page in multiple cache stores for better offline access
    Promise.all([
      caches.open(PAGES_CACHE),
      caches.open(RUNTIME_CACHE),
      caches.open(CACHE_NAME)
    ]).then(([pagesCache, runtimeCache, mainCache]) => {
      // Fetch and cache the page
      return fetch(path, { mode: 'same-origin' })
        .then(response => {
          if (response && response.status === 200) {
            pagesCache.put(path, response.clone());
            runtimeCache.put(path, response.clone());
            mainCache.put(path, response.clone());
            console.log('SW: Pre-cached page from client navigation:', path);
          }
          return response;
        });
    }).catch(error => {
      console.log('SW: Failed to pre-cache page:', path, error);
    });
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