"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

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
                    // Add longer delay to ensure React is fully hydrated
                    setTimeout(resolve, 3000);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(resolve, 2000);
                    });
                }
            });

        // Check for existing service worker
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        
        if (existingRegistration) {
          console.log('Existing SW found, updating...');
          await existingRegistration.update();
          setSwStatus('updated');
        }

        // Register service worker
       const registration = await navigator.serviceWorker.register('/sw.js?v=2', {
  scope: '/',
  updateViaCache: 'none'
});

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
                
                // Optionally notify user about update
                if (window.confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('SW Message:', event.data);
          
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated for:', event.data.url);
          }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          window.location.reload();
        });

        // Pre-cache important pages
        await preCachePages(registration);
        await preloadStaticPages();
        await forcePreCacheAllPages();

        await prefetchCurrentPage();
        await ensureOfflinePageCached(); // Add this line



      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);


// Add this new function for aggressive static page caching
// Replace the existing preloadStaticPages function
const preloadStaticPages = async () => {
  const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];
  
  try {
    // Send message to service worker to handle comprehensive prefetching
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PREFETCH_PAGES',
        data: {
          staticPages: staticPages,
          dynamicPages: ['/', '/ai-tools', '/ai-seo', '/ai-code', '/ai-learn-earn']
        }
      });
      console.log('✅ Comprehensive prefetch request sent to service worker');
    }
    
    // Also prefetch from client side as backup
    const prefetchPromises = staticPages.map(async (page) => {
      try {
        const response = await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
        
        if (response.ok) {
          console.log('✅ Client-side prefetched:', page);
        }
      } catch (error) {
        console.log('Failed to client-side prefetch:', page);
      }
    });
    
    await Promise.allSettled(prefetchPromises);
    console.log('✅ Client-side static pages prefetching completed');
  } catch (error) {
    console.error('Static pages prefetching failed:', error);
  }
};
// Add this new function to force cache all pages immediately
const forcePreCacheAllPages = async () => {
  const allPages = [
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
  
  try {
    // Cache all pages in parallel
    const cachePromises = allPages.map(async (page) => {
      try {
        // Fetch and cache the page
        const response = await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin',
          cache: 'reload' // Force fresh fetch
        });
        
        if (response.ok) {
          // Also cache Next.js data if available
          try {
            await fetch(`/_next/data/BUILD_ID${page === '/' ? '/index' : page}.json`, {
              mode: 'same-origin',
              credentials: 'same-origin'
            });
          } catch (dataError) {
            // Data fetch failed, but page might still work
          }
          
          console.log('✅ Force cached page:', page);
        }
      } catch (error) {
        console.log('Failed to force cache page:', page);
      }
    });
    
    await Promise.allSettled(cachePromises);
    console.log('✅ All pages force cached');
  } catch (error) {
    console.error('Force caching failed:', error);
  }
};
// Prefetch current page content
const prefetchCurrentPage = async () => {
  try {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Prefetch current page
    await fetch(currentPath, { mode: 'same-origin' });
    
    // Prefetch RSC payload for current page
    if (currentPath !== '/') {
      await fetch(`${currentPath}?_rsc=1`, { mode: 'same-origin' });
    }
    
    console.log('Pre-cached current page:', currentPath);
  } catch (error) {
    console.log('Failed to pre-cache current page:', error);
  }
};

// Replace the existing preCachePages function
const preCachePages = async (registration) => {
  if (registration.active) {
    try {
      // Send message to service worker to handle prefetching
      navigator.serviceWorker.controller?.postMessage({
        type: 'PREFETCH_PAGES',
        staticPages: ['/about', '/faq', '/contact', '/privacy', '/terms'],
        dynamicPages: ['/', '/ai-tools', '/ai-seo', '/ai-code', '/ai-learn-earn']
      });
      
      console.log('✅ Prefetch request sent to service worker');
    } catch (error) {
      console.error('Prefetch request failed:', error);
    }
  }
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

// Cache page content when navigating (not just on reload)
const cacheCurrentPage = async () => {
  if (typeof window === 'undefined') return;
  try {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;

    // --- IMPORTANT CHANGE HERE ---
    // Cache the current page HTML by fetching it as a navigation request
    await fetch(currentPath, {
      mode: 'navigate', // Treat as navigation request
      credentials: 'same-origin',
      headers: {
        'X-Purpose': 'cache-on-client-navigation' // Custom header
      }
    });
    console.log('✅Cached current page HTML via client navigation:', currentPath);

    // Cache RSC payload for the current page
    if (currentPath !== '/') {
      try {
        await fetch(`${currentPath}?_rsc=1`, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
        console.log('Cached RSC for:', currentPath);
      } catch (rscError) {
        console.log('Failed to cache RSC for:', currentPath, rscError);
      }
    }

    // For dynamic pages, cache their API data
    await cachePageData(currentPath);
  } catch (error) {
    console.log('Failed to cache current page HTML/data:', error);
  }
};

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


// Add this new function to handle client-side navigation caching
const handleClientSideNavigation = async () => {
  if (typeof window === 'undefined') return;
  
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
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    setTimeout(() => cacheOnNavigation(newPath), 500);
  });
  
  // Also listen for Next.js route changes
  const observer = new MutationObserver((mutations) => {
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
  
  return () => {
    observer.disconnect();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
};


  // Helper function to update cache from client
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

// Add this useEffect after the existing ones
useEffect(() => {
  if (!mounted) return;
  
  const cleanup = handleClientSideNavigation();
  
  return cleanup;
}, [mounted]);


// Add after the existing useEffect hooks
useEffect(() => {
    if (!mounted) return;
    
    let currentPath = window.location.pathname;
    
    // Function to handle route changes
    const handleRouteChange = () => {
        const newPath = window.location.pathname;
        if (newPath !== currentPath) {
            currentPath = newPath;
            
            // Cache the new page after navigation
            setTimeout(() => {
                cacheCurrentPage();
            }, 1000); // Small delay to ensure page is loaded
        }
    };
    
    // Listen for route changes (for client-side navigation)
    const observer = new MutationObserver(() => {
        handleRouteChange();
    });
    
    // Watch for URL changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);
    
    // Cache current page on initial load
    cacheCurrentPage();
    
    return () => {
        observer.disconnect();
        window.removeEventListener('popstate', handleRouteChange);
    };
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