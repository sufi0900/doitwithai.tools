"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add this function to cache API data for dynamic pages
  const cachePageData = async (pathname) => {
    try {
      // Define which pages need data caching
      const dynamicPages = {
        '/ai-tools': 'aitool',
        '/ai-seo': 'SEO',
        '/ai-code': 'coding',
        '/ai-learn-earn': 'makemoney'
      };

      const category = dynamicPages[pathname];
      if (category) {
        // Cache the API data for this category
        await fetch(`/api/posts?category=${category}`, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });

        console.log('Cached API data for category:', category);
      }

      // For slug pages, cache the specific post data
      if (pathname.includes('/ai-tools/') || pathname.includes('/ai-seo/') ||
        pathname.includes('/ai-code/') || pathname.includes('/ai-learn-earn/')) {

        const slug = pathname.split('/').pop();
        if (slug) {
          try {
            await fetch(`/api/posts/${slug}`, {
              mode: 'same-origin',
              credentials: 'same-origin'
            });
            console.log('Cached post data for slug:', slug);
          } catch (error) {
            console.log('Failed to cache slug data:', slug);
          }
        }
      }
    } catch (error) {
      console.log('Failed to cache page data:', error);
    }
  };

  // 1. REPLACE the existing handleClientSideNavigation function with this corrected version:
  const handleClientSideNavigation = () => {
    if (typeof window === 'undefined') return () => {}; // Return empty cleanup function

    let currentPath = window.location.pathname;

    // Function to cache page when navigating via client-side routing
    const cacheOnNavigation = async (newPath) => {
      if (newPath === currentPath) return;
      
      try {
        console.log('SW: Caching page for client-side navigation:', newPath);
        
        // Cache the HTML page
        await fetch(newPath, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });

        // Cache RSC payload
        if (newPath !== '/') {
          try {
            await fetch(`${newPath}?_rsc=1`, {
              mode: 'same-origin',
              credentials: 'same-origin'
            });
          } catch (rscError) {
            console.log('Failed to cache RSC for:', newPath);
          }
        }

        // Cache API data for dynamic pages
        await cachePageData(newPath);

        // Notify service worker to cache this page
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PRECACHE_PAGE',
            path: newPath,
            url: window.location.origin + newPath
          });
        }

        currentPath = newPath;
        console.log('✅ Successfully cached page for offline access:', newPath);
      } catch (error) {
        console.log('Failed to cache page on navigation:', newPath, error);
      }
    };

    // Override Next.js router to cache pages on navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      const newPath = window.location.pathname;
      setTimeout(() => cacheOnNavigation(newPath), 500);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      const newPath = window.location.pathname;
      setTimeout(() => cacheOnNavigation(newPath), 500);
      return result;
    };

    // Listen for popstate events (back/forward buttons)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setTimeout(() => cacheOnNavigation(newPath), 500);
    };

    window.addEventListener('popstate', handlePopState);

    // Also listen for Next.js route changes using MutationObserver
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setTimeout(() => cacheOnNavigation(newPath), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-pathname']
    });

    // Return cleanup function to prevent memory leaks
    return () => {
      // Restore original functions
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      
      // Remove event listeners
      window.removeEventListener('popstate', handlePopState);
      
      // Disconnect observer
      if (observer) {
        observer.disconnect();
      }
    };
  };

  // 3. SIMPLIFIED aggressiveStaticPrefetch function (replace the existing one):
  const aggressiveStaticPrefetch = async () => {
    try {
      const staticPages = [
        '/',
        '/about',
        '/faq', 
        '/contact',
        '/privacy',
        '/terms',
        '/ai-tools',
        '/ai-seo',
        '/ai-code',
        '/ai-learn-earn'
      ];

      console.log('🚀 Starting aggressive static prefetch...');
      
      // Prefetch pages with a reasonable timeout
      const prefetchPromises = staticPages.map(async (page) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const fetchPromise = fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        }).then(response => {
          if (response.ok) {
            console.log(`✅ Prefetched: ${page}`);
            return response;
          }
          throw new Error(`HTTP ${response.status}`);
        });

        return Promise.race([fetchPromise, timeoutPromise])
          .catch(error => {
            console.log(`❌ Failed to prefetch: ${page}`, error.message);
            return null;
          });
      });

      await Promise.allSettled(prefetchPromises);

      // Send simplified message to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_COMPLETE',
          pages: staticPages
        });
      }

      console.log('✅ Aggressive static prefetch completed');
    } catch (error) {
      console.error('Aggressive prefetch failed:', error);
    }
  };


  // Removed the `prefetchPageComplete` function as it's replaced by the new `aggressiveStaticPrefetch`.
  // Removed the `forceCachePopulation` function as it's no longer needed with the new `aggressiveStaticPrefetch`.
  // Removed the `preloadStaticPages` function as it's replaced by the new `aggressiveStaticPrefetch`.
  // Removed the `prefetchCurrentPage` function as its logic is incorporated into `handleClientSideNavigation`.
  // Removed the `preCachePages` function as it's replaced by the new `aggressiveStaticPrefetch` and `ensureOfflinePageCached`.
  // Removed the `cacheCurrentPage` function as its logic is incorporated into `handleClientSideNavigation`.

  // 5. SIMPLIFIED handleServiceWorkerMessages function:
  const handleServiceWorkerMessages = () => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('SW Message:', event.data);
      
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated for:', event.data.url);
          break;
        case 'PREFETCH_COMPLETE':
          console.log('✅ Prefetch completed');
          window.dispatchEvent(new CustomEvent('offline-ready'));
          break;
        case 'PREFETCH_PROGRESS':
          console.log(`Prefetch progress: ${event.data.completed}/${event.data.total}`);
          break;
        default:
          console.log('Unknown SW message:', event.data);
      }
    });
  };

  // Add this function after preCachePages
  const ensureOfflinePageCached = async () => {
    try {
      // Pre-cache the offline page
      await fetch('/offline.html', {
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      console.log('✅ Offline page cached successfully');
    } catch (error) {
      console.log('Failed to cache offline page:', error);
    }
  };

  // Helper function to update cache from client (kept as it was not explicitly removed)
  const updateCache = (url, data) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_UPDATE',
        url,
        data
      });
    }
  };

  // Expose updateCache function globally for other components
  useEffect(() => {
    if (mounted) {
      window.updateSWCache = updateCache;
    }
  }, [mounted]);

  // 2. UPDATE the useEffect that calls handleClientSideNavigation:
  useEffect(() => {
    if (!mounted) return;
    
    const cleanup = handleClientSideNavigation();
    
    // Return the cleanup function
    return cleanup;
  }, [mounted]);


  // 6. ADD this new function for testing offline capability:
  const testOfflineCapability = async () => {
    // Wait a bit for caches to populate
    setTimeout(async () => {
      try {
        // Test if static pages are accessible
        const testPages = ['/about', '/faq', '/contact'];

        for (const page of testPages) {
          try {
            const response = await fetch(page, { mode: 'same-origin' });
            if (response.ok) {
              console.log(`✅ Offline test passed for: ${page}`);
            }
          } catch (error) {
            console.log(`❌ Offline test failed for: ${page}`);
          }
        }
      } catch (error) {
        console.error('Offline capability test failed:', error);
      }
    }, 5000); // Test after 5 seconds
  };

  // 7. UPDATE the main registerSW function call order:
  useEffect(() => {
    if (!mounted) return;

    const registerSW = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        setSwStatus('unsupported');
        return;
      }

      try {
        // Wait for React hydration to complete
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 2000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1500);
            });
          }
        });

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Handle updates
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
              }
            });
          }
        });

        // Listen for messages from SW
        handleServiceWorkerMessages();

        // Listen for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          window.location.reload();
        });

        // Wait for service worker to be ready before prefetching
        await navigator.serviceWorker.ready;
        
        // Now start prefetching
        await ensureOfflinePageCached();
        await aggressiveStaticPrefetch();
        await testOfflineCapability(); // ADD THIS LINE

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);


  // Don't render anything during SSR
  if (!mounted) return null;

  // Optional: Show SW status indicator in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: getStatusColor(swStatus),
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        SW: {swStatus}
      </div>
    );
  }

  return null;
}

function getStatusColor(status) {
  switch (status) {
    case 'registered': return '#4CAF50';
    case 'updated': return '#2196F3';
    case 'update-available': return '#FF9800';
    case 'failed': return '#f44336';
    case 'unsupported': return '#9E9E9E';
    default: return '#9E9E9E';
  }
}