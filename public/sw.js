const CACHE_NAME = 'doitwithai-v8'; // Increment version for new SW logic
const RUNTIME_CACHE = 'runtime-v8';
const STATIC_CACHE = 'static-v8';
const API_CACHE = 'api-v8';
const PAGES_CACHE = 'pages-v8';

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

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
    console.log('SW: Installing', CACHE_NAME);
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

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
    console.log('SW: Activating', CACHE_NAME);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches that don't match current versions
                    if (![CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE, API_CACHE, PAGES_CACHE].includes(cacheName)) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve(); // Ensure all promises resolve
                })
            );
        }).then(() => {
            console.log('SW: Claiming clients');
            return self.clients.claim();
        })
    );
});

// --- FETCH EVENT ---
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip service worker script itself
    if (url.pathname.includes('/sw.js')) return;

    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') return;

    // Skip Next.js internal requests (webpack HMR, ts, etc.)
    if (url.pathname.includes('/_next/') && (
        url.pathname.includes('webpack') ||
        url.pathname.includes('hmr') ||
        url.search.includes('ts=')
    )) return;

    // Determine request types
    const isHtmlRequest = request.headers.get('accept')?.includes('text/html');
    const isTopLevelNavigation = request.mode === 'navigate';
    const isAPIRequest = url.pathname.startsWith('/api/') || url.hostname.includes('sanity.io');
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
    const isNextStatic = url.pathname.startsWith('/_next/static/');
    const isRSCPayload = url.search.includes('_rsc=') || request.headers.get('RSC'); // Next.js 13+ RSC header

    event.respondWith(
        (async () => {
            try {
                // PRIORITY 1: Handle HTML Page Requests (Navigation or Client-side HTML fetches)
                if (isTopLevelNavigation || isHtmlRequest) {
                    return await handlePageRequest(request);
                }

                // PRIORITY 2: Handle Static Assets (Cache-First)
                if (isStaticAsset || isNextStatic) {
                    return await handleStaticAsset(request);
                }

                // PRIORITY 3: Handle API Requests (Network-First, then Cache)
                if (isAPIRequest) {
                    return await handleAPIRequest(request, url.hostname.includes('sanity.io'));
                }

                // PRIORITY 4: Handle RSC (React Server Components) Payloads (Network-First, then Cache)
                if (isRSCPayload) {
                    return await handleRSCRequest(request);
                }

                // PRIORITY 5: Handle Other Requests (Network-First, then Cache)
                return await handleOtherRequests(request);

            } catch (error) {
                console.error('SW: Request handler failed for:', url.pathname, error);
                // For HTML requests, return offline page; for others, a generic error
                if (isTopLevelNavigation || isHtmlRequest) {
                    return await getOfflinePage();
                }
                return new Response('Network Error or Resource Not Available Offline', { status: 503 });
            }
        })()
    );
});

// --- CACHE STRATEGY FUNCTIONS ---

// Handles both top-level navigations and client-side HTML fetches
async function handlePageRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    console.log('SW: Handling page request for:', pathname);

    try {
        // Try network first with a timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout for page')), 5000))
        ]);

        if (networkResponse && networkResponse.status === 200) {
            // Cache successful response in both PAGES_CACHE and RUNTIME_CACHE
            const pagesCache = await caches.open(PAGES_CACHE);
            const runtimeCache = await caches.open(RUNTIME_CACHE);
            pagesCache.put(request, networkResponse.clone());
            runtimeCache.put(request, networkResponse.clone());
            console.log('SW: Cached page response in multiple stores:', pathname);
            return networkResponse;
        }
    } catch (error) {
        console.log('SW: Network failed for page:', pathname, error.message);
    }

    // Fallback to cache if network fails or isn't available
    return await getCachedPage(request);
}

// Helper function to get cached HTML page response
async function getCachedPage(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    console.log('SW: Looking for cached page:', pathname);

    // Try various URL forms for cache matching
    const urlsToTry = [
        request.url,
        pathname,
        pathname.endsWith('/') ? pathname : `${pathname}/`, // Add trailing slash if missing
        pathname.endsWith('/') ? pathname.slice(0, -1) : pathname, // Remove trailing slash if present
        url.origin + pathname
    ];

    // Try each cache store in a preferred order
    const cacheStores = [PAGES_CACHE, CACHE_NAME, RUNTIME_CACHE];
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
            console.log('SW: Cache access failed for:', cacheStore, error);
        }
    }
    return null; // Return null if no cached response is found
}

// Handles all API requests (Next.js internal or Sanity)
async function handleAPIRequest(request, isSanity = false) {
    const url = new URL(request.url);
    const timeoutDuration = isSanity ? 8000 : 5000; // Sanity gets a bit more time

    try {
        // Cache-first when offline, especially for Sanity
        if (!navigator.onLine) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log(`SW: Serving ${isSanity ? 'Sanity' : 'API'} data from cache (offline):`, url.pathname);
                return cachedResponse;
            }
        }

        // Network-first with timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Network timeout for API')), timeoutDuration)
            )
        ]);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(API_CACHE);
            const responseClone = networkResponse.clone();

            // Optionally add custom headers for debugging/info
            const enhancedResponse = new Response(await responseClone.text(), {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: {
                    ...Object.fromEntries(networkResponse.headers.entries()),
                    'sw-cached-at': new Date().toISOString(),
                    'sw-cache-type': isSanity ? 'sanity-api' : 'next-api'
                }
            });
            cache.put(request, enhancedResponse);
            console.log(`SW: Cached ${isSanity ? 'Sanity' : 'Next.js'} API response:`, url.pathname);
            return networkResponse;
        }
        return networkResponse; // Return network response even if not 200, if not cached

    } catch (error) {
        console.log(`SW: ${isSanity ? 'Sanity' : 'API'} request failed, trying cache:`, url.pathname, error);
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log(`SW: Serving ${isSanity ? 'Sanity' : 'API'} from cache:`, url.pathname);
            return cachedResponse;
        }
        // Return appropriate error response if no cache
        return new Response(JSON.stringify({
            error: 'Network unavailable or API request failed',
            offline: true,
            cached: false
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handles React Server Component payloads
async function handleRSCRequest(request) {
    const url = new URL(request.url);
    try {
        // Network-first with timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout for RSC')), 5000))
        ]);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE); // RSCs can go to runtime or a dedicated RSC cache
            cache.put(request, networkResponse.clone());
            console.log('SW: Cached RSC payload:', url.pathname);
            return networkResponse;
        }
        return networkResponse;
    } catch (error) {
        console.log('SW: RSC request failed, trying cache:', url.pathname, error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('SW: Serving RSC from cache:', url.pathname);
            return cachedResponse;
        }
        return new Response(JSON.stringify({ error: 'Offline RSC', data: null }), {
            status: 200, // Return 200 to not break Next.js client-side if data is just missing
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handles static assets (JS, CSS, images, fonts)
async function handleStaticAsset(request) {
    const url = new URL(request.url);
    try {
        // Cache-first strategy
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('SW: Serving static asset from cache:', url.pathname);
            return cachedResponse;
        }

        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('SW: Cached static asset:', url.pathname);
            return networkResponse;
        }
        return networkResponse; // Return network response even if not 200

    } catch (error) {
        console.log('SW: Static asset request failed, trying cache:', url.pathname, error);
        // Try cache one more time in case fetch failed but cache exists
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Asset not found', { status: 404 });
    }
}

// Handles requests that don't fall into other categories
async function handleOtherRequests(request) {
    const url = new URL(request.url);
    try {
        // Cache-first strategy
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('SW: Serving other request from cache:', url.pathname);
            return cachedResponse;
        }

        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('SW: Cached other request:', url.pathname);
            return networkResponse;
        }
        return networkResponse;

    } catch (error) {
        console.log('SW: Other request failed, trying cache:', url.pathname, error);
        // Fallback to offline response if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Network unavailable for resource', { status: 503 });
    }
}



// Message handler for cache updates from client (e.g., CacheProvider)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        const { url, data } = event.data;
        caches.open(RUNTIME_CACHE).then(cache => {
            // Note: `url` should be a Request object or string, `data` is the response body
            // This assumes `data` is meant to be the response content.
            // If `data` is a full Response object from client, it should be `cache.put(url, data)`
            cache.put(url, new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            }));
            console.log('SW: CACHE_UPDATE message received, cached:', url);
        }).catch(err => console.error('SW: CACHE_UPDATE failed:', err));
    }
    // New handler for precaching pages sent from client-side navigation
    if (event.data && event.data.type === 'PRECACHE_PAGE') {
        const { path } = event.data; // Assuming `url` is the full request object or string
        console.log('SW: PRECACHE_PAGE message received for:', path);

        Promise.all([
            caches.open(PAGES_CACHE),
            caches.open(RUNTIME_CACHE),
            caches.open(CACHE_NAME)
        ]).then(([pagesCache, runtimeCache, mainCache]) => {
            // Fetch and cache the page to ensure it's available offline
            return fetch(path, { mode: 'no-cors' }) // Use no-cors for cross-origin fetches if needed, but 'same-origin' is safer for your own site
                .then(response => {
                    if (response && response.status === 200) {
                        pagesCache.put(path, response.clone());
                        runtimeCache.put(path, response.clone());
                        mainCache.put(path, response.clone());
                        console.log('SW: Pre-cached page from client message:', path);
                    } else {
                        console.log('SW: Pre-caching page from client message failed (status):', path, response?.status);
                    }
                    return response;
                });
        }).catch(error => {
            console.error('SW: Failed to pre-cache page from client message:', path, error);
        });
    }
});

// Background sync for cache updates (if needed)
self.addEventListener('sync', (event) => {
    if (event.tag === 'cache-update') {
        console.log('SW: Background sync event triggered:', event.tag);
        event.waitUntil(updateCaches());
    }
});

// Function to update existing cached items during background sync
async function updateCaches() {
    console.log('SW: Starting background cache update');
    try {
        const cache = await caches.open(CACHE_NAME); // Or iterate through all relevant caches
        const keys = await cache.keys();

        for (const key of keys) {
            try {
                const response = await fetch(key);
                if (response && response.status === 200) {
                    await cache.put(key, response);
                    console.log('SW: Updated cache for:', key.url);
                }
            } catch (error) {
                console.log('SW: Failed to update cache for (offline/error):', key.url, error);
            }
        }
        console.log('SW: Background cache update complete');
    } catch (error) {
        console.error('SW: Background cache update failed:', error);
    }
}