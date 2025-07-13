// Enhanced Service Worker for Complete Static Page Caching
const CACHE_NAME = 'doitwithai-v3';
const STATIC_CACHE = 'static-pages-v3';
const DYNAMIC_CACHE = 'dynamic-pages-v3';
const OFFLINE_PAGE = '/offline.html';

// Define all static pages that should be prefetched
const STATIC_PAGES = [
  '/',
  '/about',
  '/faq', 
  '/contact',
  '/privacy',
  '/terms'
];

// Dynamic category pages
const DYNAMIC_PAGES = [
  '/ai-tools',
  '/ai-seo', 
  '/ai-code',
  '/ai-learn-earn'
];

// Essential assets to cache immediately
const ESSENTIAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

// Install event - cache essential assets and prefetch static pages
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      cacheEssentialAssets(),
      prefetchAllStaticPages(),
      prefetchDynamicPages()
    ]).then(() => {
      console.log('SW: Installation complete, taking control');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      cleanOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activation complete');
      // Notify clients that SW is ready
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED' });
        });
      });
    })
  );
});

// Cache essential assets
async function cacheEssentialAssets() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ESSENTIAL_ASSETS);
    console.log('SW: Essential assets cached');
  } catch (error) {
    console.error('SW: Failed to cache essential assets:', error);
  }
}

// Prefetch all static pages with their Next.js data
async function prefetchAllStaticPages() {
  console.log('SW: Starting static pages prefetch...');
  
  try {
    const cache = await caches.open(STATIC_CACHE);
    
    // Prefetch each static page
    const prefetchPromises = STATIC_PAGES.map(async (page) => {
      try {
        // Cache the HTML page
        const pageResponse = await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
        
        if (pageResponse.ok) {
          await cache.put(page, pageResponse.clone());
          console.log(`SW: Cached static page: ${page}`);
          
          // Also try to cache Next.js data for the page
          await cacheNextJsData(page, cache);
        }
      } catch (error) {
        console.log(`SW: Failed to cache static page ${page}:`, error);
      }
    });
    
    await Promise.allSettled(prefetchPromises);
    console.log('SW: Static pages prefetch completed');
  } catch (error) {
    console.error('SW: Static pages prefetch failed:', error);
  }
}

// Prefetch dynamic category pages
async function prefetchDynamicPages() {
  console.log('SW: Starting dynamic pages prefetch...');
  
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    const prefetchPromises = DYNAMIC_PAGES.map(async (page) => {
      try {
        const pageResponse = await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
        
        if (pageResponse.ok) {
          await cache.put(page, pageResponse.clone());
          console.log(`SW: Cached dynamic page: ${page}`);
          
          // Cache Next.js data
          await cacheNextJsData(page, cache);
        }
      } catch (error) {
        console.log(`SW: Failed to cache dynamic page ${page}:`, error);
      }
    });
    
    await Promise.allSettled(prefetchPromises);
    console.log('SW: Dynamic pages prefetch completed');
  } catch (error) {
    console.error('SW: Dynamic pages prefetch failed:', error);
  }
}

// Cache Next.js data for a page
async function cacheNextJsData(page, cache) {
  try {
    const buildId = await getBuildId();
    if (!buildId) return;
    
    const dataPath = `/_next/data/${buildId}${page === '/' ? '/index' : page}.json`;
    
    const dataResponse = await fetch(dataPath, {
      mode: 'same-origin',
      credentials: 'same-origin'
    });
    
    if (dataResponse.ok) {
      await cache.put(dataPath, dataResponse.clone());
      console.log(`SW: Cached Next.js data for: ${page}`);
    }
  } catch (error) {
    console.log(`SW: Failed to cache Next.js data for ${page}:`, error);
  }
}

// Get Next.js build ID
async function getBuildId() {
  try {
    const response = await fetch('/_next/static/chunks/webpack-*.js', {
      mode: 'same-origin'
    });
    // This is a simplified approach - you might need to adjust based on your setup
    return 'BUILD_ID'; // You can extract this from your build process
  } catch (error) {
    return null;
  }
}

// Clean old caches
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
  
  const deletePromises = cacheNames
    .filter(name => !currentCaches.includes(name))
    .map(name => caches.delete(name));
    
  await Promise.all(deletePromises);
  console.log('SW: Old caches cleaned');
}

// Enhanced fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleFetch(request));
});

// Main fetch handler
async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Handle static pages
    if (STATIC_PAGES.includes(pathname)) {
      return await handleStaticPage(request);
    }
    
    // Handle dynamic pages
    if (DYNAMIC_PAGES.includes(pathname)) {
      return await handleDynamicPage(request);
    }
    
    // Handle Next.js data requests
    if (pathname.startsWith('/_next/data/')) {
      return await handleNextJsData(request);
    }
    
    // Handle static assets
    if (pathname.startsWith('/_next/static/')) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Handle API requests
    if (pathname.startsWith('/api/')) {
      return await networkFirst(request, CACHE_NAME);
    }
    
    // Handle images
    if (pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
      return await cacheFirst(request, CACHE_NAME);
    }
    
    // Default: network first
    return await networkFirst(request, CACHE_NAME);
    
  } catch (error) {
    console.error('SW: Fetch failed:', error);
    return await getOfflinePage();
  }
}

// Handle static pages with cache-first strategy
async function handleStaticPage(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('SW: Serving static page from cache:', request.url);
    return cachedResponse;
  }
  
  // If not cached, try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      console.log('SW: Cached static page:', request.url);
    }
    return response;
  } catch (error) {
    console.log('SW: Static page network failed, serving offline page');
    return await getOfflinePage();
  }
}

// Handle dynamic pages with network-first strategy
async function handleDynamicPage(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request, { 
      timeout: 3000 // 3 second timeout
    });
    
    if (response.ok) {
      await cache.put(request, response.clone());
      console.log('SW: Updated dynamic page cache:', request.url);
    }
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('SW: Serving dynamic page from cache:', request.url);
      return cachedResponse;
    }
    
    return await getOfflinePage();
  }
}

// Handle Next.js data requests
async function handleNextJsData(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Get offline page
async function getOfflinePage() {
  const cache = await caches.open(CACHE_NAME);
  const offlineResponse = await cache.match(OFFLINE_PAGE);
  return offlineResponse || new Response('Offline', { status: 503 });
}

// Handle messages from client
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PREFETCH_PAGES':
      handlePrefetchRequest(data);
      break;
    case 'CACHE_PAGE':
      handleCachePage(data);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    default:
      console.log('SW: Unknown message type:', type);
  }
});

// Handle prefetch request from client
async function handlePrefetchRequest(data) {
  const { staticPages, dynamicPages } = data;
  
  if (staticPages) {
    await prefetchPages(staticPages, STATIC_CACHE);
  }
  
  if (dynamicPages) {
    await prefetchPages(dynamicPages, DYNAMIC_CACHE);
  }
}

// Prefetch specific pages
async function prefetchPages(pages, cacheName) {
  const cache = await caches.open(cacheName);
  
  const prefetchPromises = pages.map(async (page) => {
    try {
      const response = await fetch(page, {
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        await cache.put(page, response.clone());
        console.log(`SW: Prefetched page: ${page}`);
      }
    } catch (error) {
      console.log(`SW: Failed to prefetch page ${page}:`, error);
    }
  });
  
  await Promise.allSettled(prefetchPromises);
}

// Handle cache page request
async function handleCachePage(data) {
  const { url, cacheName = CACHE_NAME } = data;
  
  try {
    const cache = await caches.open(cacheName);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response.clone());
      console.log(`SW: Cached page: ${url}`);
    }
  } catch (error) {
    console.log(`SW: Failed to cache page ${url}:`, error);
  }
}