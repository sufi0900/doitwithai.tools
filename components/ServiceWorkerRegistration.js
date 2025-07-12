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
        await preloadStaticPages();
        await prefetchCurrentPage();


      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);


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

const preCachePages = async (registration) => {
  if (registration.active) {
    try {
      const currentPath = window.location.pathname;
      // List of important pages to pre-cache
      const importantPages = [
        '/',
        '/ai-tools',
        '/ai-seo',
        '/ai-code',
        '/ai-learn-earn',
        '/free-ai-resources',
        ' /ai-news',
        '/about',
        '/faq',
        '/contact',
        '/privacy',
        '/terms'
      ];

      // Add current page if it's not in the list
      if (!importantPages.includes(currentPath)) {
        importantPages.push(currentPath);
      }

      for (const page of importantPages) {
        try {
          // --- IMPORTANT CHANGE HERE ---
          // Explicitly fetch the HTML for the page
          // This ensures the Service Worker's navigation handler can cache it
          const htmlResponse = await fetch(page, {
            mode: 'navigate', // Treat as navigation request
            credentials: 'same-origin',
            headers: {
              'X-Purpose': 'prefetch-html-for-offline' // Custom header for SW debugging/logic
            }
          });

          if (htmlResponse.ok) {
            console.log('Pre-cached page HTML:', page);
            // The SW's navigation handler should now cache this.

            // Also fetch RSC payload for the page if it's dynamic
            if (page !== '/') {
              try {
                await fetch(`${page}?_rsc=1`, {
                  mode: 'same-origin',
                  credentials: 'same-origin'
                });
                console.log('Pre-cached RSC for:', page);
              } catch (rscError) {
                console.log('Failed to pre-cache RSC for:', page, rscError);
              }
            }

            // For dynamic pages, try to cache their API data
            if (['ai-tools', 'ai-seo', 'ai-code', 'ai-learn-earn'].includes(page.replace('/', ''))) {
              try {
                await fetch(`/api/posts?category=${page.replace('/', '').replace('-', '')}`, {
                  mode: 'same-origin',
                  credentials: 'same-origin'
                });
                console.log('Pre-cached API data for:', page);
              } catch (apiError) {
                console.log('Failed to pre-cache API data for:', page, apiError);
              }
            }
          }
        } catch (error) {
          console.log('Failed to pre-cache page:', page, error);
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