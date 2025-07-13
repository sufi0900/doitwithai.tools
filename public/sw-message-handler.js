// public/sw-message-handler.js
// This file should be imported in your service worker

// Add this to your service worker (sw.js) - it will be auto-generated but you can add custom logic

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  console.log('SW received message:', event.data);
  
  switch (event.data.type) {
    case 'AGGRESSIVE_CACHE_STATIC':
      await handleAggressiveStaticCaching(event.data.pages, event.data.buildId);
      break;
    case 'PREFETCH_PAGES':
      await handlePrefetchPages(event.data.staticPages, event.data.dynamicPages);
      break;
    case 'CACHE_UPDATE':
      await handleCacheUpdate(event.data.url, event.data.data);
      break;
    case 'PRECACHE_PAGE':
      await handlePrecachePage(event.data.path, event.data.url);
      break;
  }
});

// Aggressive static caching function
async function handleAggressiveStaticCaching(pages, buildId) {
  console.log('🚀 SW: Starting aggressive static caching...');
  
  let completed = 0;
  const total = pages.length;
  
  // Notify client about progress
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PREFETCH_PROGRESS',
        completed: 0,
        total: total
      });
    });
  });

  const cachePromises = pages.map(async (page) => {
    try {
      const cache = await caches.open('static-pages-v2');
      
      // Cache main HTML
      const htmlResponse = await fetch(page, {
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      
      if (htmlResponse.ok) {
        await cache.put(page, htmlResponse.clone());
        console.log(`✅ SW: Cached HTML for ${page}`);
      }

      // Cache Next.js data
      const dataPath = page === '/' ? '/index' : page;
      try {
        const dataResponse = await fetch(`/_next/data/${buildId}${dataPath}.json`, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
        
        if (dataResponse.ok) {
          const dataCache = await caches.open('next-data-cache-v2');
          await dataCache.put(`/_next/data/${buildId}${dataPath}.json`, dataResponse);
          console.log(`✅ SW: Cached data for ${page}`);
        }
      } catch (dataError) {
        console.log(`SW: Data cache failed for ${page}`);
      }

      // Cache RSC payload
      if (page !== '/') {
        try {
          const rscResponse = await fetch(`${page}?_rsc=1`, {
            mode: 'same-origin',
            credentials: 'same-origin'
          });
          
          if (rscResponse.ok) {
            const rscCache = await caches.open('rsc-cache-v1');
            await rscCache.put(`${page}?_rsc=1`, rscResponse);
            console.log(`✅ SW: Cached RSC for ${page}`);
          }
        } catch (rscError) {
          console.log(`SW: RSC cache failed for ${page}`);
        }
      }

      completed++;
      
      // Notify client about progress
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PREFETCH_PROGRESS',
            completed: completed,
            total: total
          });
        });
      });

    } catch (error) {
      console.error(`SW: Failed to cache ${page}:`, error);
      completed++;
    }
  });

  await Promise.allSettled(cachePromises);
  
  // Notify completion
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'STATIC_CACHE_COMPLETE',
        cached: completed,
        total: total
      });
    });
  });
  
  console.log('✅ SW: Aggressive static caching completed');
}

// Handle regular prefetch requests
async function handlePrefetchPages(staticPages, dynamicPages) {
  console.log('SW: Handling prefetch request...');
  
  // Prefetch static pages
  const staticCache = await caches.open('static-pages-v2');
  for (const page of staticPages) {
    try {
      const response = await fetch(page, { mode: 'same-origin' });
      if (response.ok) {
        await staticCache.put(page, response);
        console.log(`SW: Prefetched static page: ${page}`);
      }
    } catch (error) {
      console.log(`SW: Failed to prefetch static page ${page}:`, error);
    }
  }
  
  // Prefetch dynamic pages (shell only)
  const dynamicCache = await caches.open('semi-dynamic-pages-v2');
  for (const page of dynamicPages) {
    try {
      const response = await fetch(page, { mode: 'same-origin' });
      if (response.ok) {
        await dynamicCache.put(page, response);
        console.log(`SW: Prefetched dynamic page shell: ${page}`);
      }
    } catch (error) {
      console.log(`SW: Failed to prefetch dynamic page ${page}:`, error);
    }
  }
}

// Handle cache updates
async function handleCacheUpdate(url, data) {
  try {
    const cache = await caches.open('enhanced-navigation-cache-v2');
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
    console.log(`SW: Updated cache for ${url}`);
  } catch (error) {
    console.error(`SW: Failed to update cache for ${url}:`, error);
  }
}

// Handle precache requests
async function handlePrecachePage(path, url) {
  try {
    const cache = await caches.open('enhanced-navigation-cache-v2');
    const response = await fetch(url, { mode: 'same-origin' });
    
    if (response.ok) {
      await cache.put(path, response);
      console.log(`SW: Precached page: ${path}`);
    }
  } catch (error) {
    console.error(`SW: Failed to precache ${path}:`, error);
  }
}

// Enhanced fetch event listener for better offline handling
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests, try cache first if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          // Network failed, try cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log('SW: Serving cached navigation:', event.request.url);
            return cachedResponse;
          }
          
          // Try to match without trailing slash
          const urlWithoutSlash = event.request.url.replace(/\/$/, '');
          const cachedWithoutSlash = await caches.match(urlWithoutSlash);
          if (cachedWithoutSlash) {
            console.log('SW: Serving cached navigation (no slash):', urlWithoutSlash);
            return cachedWithoutSlash;
          }
          
          // Fallback to offline page
          return caches.match('/offline.html');
        })
    );
  }
});