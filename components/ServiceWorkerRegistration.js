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
        const registration = await navigator.serviceWorker.register('/sw.js', {
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

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);




// Replace the preCachePages function
const preCachePages = async (registration) => {
  if (registration.active) {
    try {
      const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];
      const dynamicPages = ['/', '/ai-tools', '/ai-seo', '/ai-code', '/ai-learn-earn'];
      
      console.log('SW: Starting simplified pre-caching...');
      
      // Cache static pages first
      for (const page of staticPages) {
        try {
          const response = await fetch(page, {
            cache: 'no-cache'
          });
          
          if (response.ok) {
            console.log('SW: Successfully pre-cached static page:', page);
          }
        } catch (error) {
          console.log('SW: Failed to pre-cache static page:', page);
        }
      }
      
      // Cache dynamic pages
      for (const page of dynamicPages) {
        try {
          const response = await fetch(page, {
            cache: 'no-cache'
          });
          
          if (response.ok) {
            console.log('SW: Successfully pre-cached dynamic page:', page);
          }
        } catch (error) {
          console.log('SW: Failed to pre-cache dynamic page:', page);
        }
      }
      
    } catch (error) {
      console.error('Pre-caching failed:', error);
    }
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

// Add this function to your ServiceWorkerRegistration component
const ensurePageCaching = async (pathname) => {
  try {
    // Force cache the page with multiple variations
    const urlsToCache = [
      pathname,
      pathname === '/' ? '/' : pathname.replace(/\/$/, ''),
      pathname === '/' ? '/' : pathname + '/',
      window.location.origin + pathname
    ];
    
    for (const url of urlsToCache) {
      await fetch(url, { 
        mode: 'same-origin',
        credentials: 'same-origin',
        cache: 'no-cache' // Force fresh fetch
      });
    }
    
    console.log('✅ Enhanced caching for:', pathname);
  } catch (error) {
    console.log('Failed to enhance cache for:', pathname, error);
  }
};

// Update your route change handler:
const handleRouteChange = () => {
  const newPath = window.location.pathname;
  if (newPath !== currentPath) {
    currentPath = newPath;
    
    // Enhanced caching with delay
    setTimeout(async () => {
      await ensurePageCaching(newPath);
      await cacheCurrentPage();
    }, 500); // Slightly longer delay
  }
};

// Replace the existing cacheStaticPagesAggressively function
const cacheStaticPagesAggressively = async (staticPages) => {
  const cachePromises = staticPages.map(async (page) => {
    try {
      console.log('SW: Aggressively caching static page:', page);
      
      // Fetch the page
      const response = await fetch(page, {
        mode: 'same-origin',
        credentials: 'same-origin',
        cache: 'no-cache' // Force fresh fetch
      });

      if (response.ok) {
        // Cache in multiple stores for redundancy
        const cacheStores = ['doitwithai-v7', 'static-v7', 'pages-v7'];
        const cachePromises = [];
        
        for (const storeName of cacheStores) {
          const cache = await caches.open(storeName);
          
          // Cache with multiple URL variations
          const urlVariations = [
            page,
            page.endsWith('/') ? page.slice(0, -1) : page + '/',
            window.location.origin + page,
            window.location.origin + (page.endsWith('/') ? page.slice(0, -1) : page + '/')
          ];
          
          for (const url of urlVariations) {
            const requestToCache = new Request(url, {
              method: 'GET',
              mode: 'same-origin',
              credentials: 'same-origin'
            });
            cachePromises.push(cache.put(requestToCache, response.clone()));
          }
        }
        
        await Promise.all(cachePromises);
        console.log('SW: Successfully cached static page with all variations:', page);
        
        // Also notify service worker to ensure it's cached there
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PRECACHE_PAGE',
            path: page,
            url: window.location.origin + page
          });
        }
      }
    } catch (error) {
      console.error('SW: Failed to cache static page:', page, error);
    }
  });

  await Promise.allSettled(cachePromises);
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