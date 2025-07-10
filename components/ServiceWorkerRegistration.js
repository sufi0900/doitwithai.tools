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


  // Pre-cache important pages
// Pre-cache important pages
// Pre-cache important pages with their data
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