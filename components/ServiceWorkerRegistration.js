//ServiceWorkerRegistration.js

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
        await prefetchCurrentPage();
        await ensureOfflinePageCached(); // Add this line
        await prefetchAllContent(); // Add this line

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);


// Add this new function for aggressive static page caching
const preloadStaticPages = async () => {
  try {
    // Fetch the pages manifest
    const manifestResponse = await fetch('/pages-manifest.json');
    const manifest = await manifestResponse.json();
    
    console.log('📋 Loading pages manifest:', manifest);
    
    // Enhanced prefetch with better error handling
    const prefetchPage = async (pageInfo) => {
      const { url, priority } = pageInfo;
      try {
        // Fetch page HTML
        const response = await fetch(url, {
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: {
            'X-Purpose': 'service-worker-prefetch'
          }
        });
        
        if (response.ok) {
          console.log(`✅ SW prefetched: ${url}`);
          
          // Also prefetch Next.js data
          if (url !== '/') {
            try {
              await fetch(`/_next/data/${process.env.NEXT_PUBLIC_BUILD_ID || 'build'}${url === '/' ? '/index' : url}.json`, {
                mode: 'same-origin',
                credentials: 'same-origin'
              });
            } catch (dataError) {
              console.log(`Data prefetch failed for ${url}:`, dataError);
            }
          }
          
          return { success: true, url };
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`❌ SW failed to prefetch ${url}:`, error);
        return { success: false, url, error };
      }
    };
    
    // Sort by priority and prefetch
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sortedPages = manifest.static_pages.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    // Prefetch in batches
    const batchSize = 3;
    for (let i = 0; i < sortedPages.length; i += batchSize) {
      const batch = sortedPages.slice(i, i + batchSize);
      const batchPromises = batch.map(prefetchPage);
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < sortedPages.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('✅ All static pages prefetching completed');
  } catch (error) {
    console.error('Failed to load pages manifest:', error);
    
    // Fallback to hardcoded list
    const fallbackPages = [
      { url: '/', priority: 'high' },
      { url: '/about', priority: 'medium' },
      { url: '/faq', priority: 'medium' },
      { url: '/contact', priority: 'medium' },
      { url: '/privacy', priority: 'low' },
      { url: '/terms', priority: 'low' },
      { url: '/ai-tools', priority: 'high' },
      { url: '/ai-seo', priority: 'high' },
      { url: '/ai-code', priority: 'high' },
      { url: '/ai-learn-earn', priority: 'high' }
    ];
    
    const fallbackPromises = fallbackPages.map(page => 
      fetch(page.url, {
        mode: 'same-origin',
        credentials: 'same-origin'
      }).then(() => console.log(`✅ Fallback cached: ${page.url}`))
        .catch(err => console.warn(`Fallback cache failed: ${page.url}`))
    );
    
    await Promise.allSettled(fallbackPromises);
  }
};

// Add this after the existing preloadStaticPages function (around line 80)
const prefetchAllContent = async () => {
  try {
    // Fetch comprehensive content manifest
    const manifestResponse = await fetch('/pages-manifest.json');
    const manifest = await manifestResponse.json();
    
    console.log('🚀 Starting comprehensive prefetch...');
    
    // Prefetch all static and dynamic pages
    const allPages = [...manifest.static_pages, ...manifest.dynamic_pages];
    const prefetchPromises = allPages.map(async (pageInfo) => {
      const { url, priority } = pageInfo;
      
      try {
        // Prefetch page HTML
        const response = await fetch(url, {
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: { 'X-Prefetch': 'comprehensive' }
        });
        
        if (response.ok) {
          // Prefetch Next.js data
          if (url !== '/') {
            try {
              await fetch(`/_next/data/${process.env.NEXT_PUBLIC_BUILD_ID || 'build'}${url === '/' ? '/index' : url}.json`);
            } catch (e) { /* ignore */ }
          }
          
          console.log(`✅ Prefetched ${priority} priority page: ${url}`);
        }
      } catch (error) {
        console.warn(`Failed to prefetch ${url}:`, error);
      }
    });
    
    await Promise.allSettled(prefetchPromises);
    
    // Prefetch category content
    await prefetchCategoryContent();
    
    console.log('🎉 Comprehensive prefetch completed!');
  } catch (error) {
    console.error('Comprehensive prefetch failed:', error);
  }
};

// Add this new function for prefetching category content
const prefetchCategoryContent = async () => {
  const categories = ['makemoney', 'aitool', 'coding', 'SEO'];
  const categoryPaths = {
    'aitool': 'ai-tools',
    'SEO': 'ai-seo', 
    'coding': 'ai-code',
    'makemoney': 'ai-learn-earn'
  };
  
  for (const category of categories) {
    try {
      // Fetch category posts from API
      const response = await fetch(`/api/posts?category=${category}`);
      if (response.ok) {
        const posts = await response.json();
        
        // Prefetch individual post pages (first 10 per category)
        const postPromises = posts.slice(0, 10).map(async (post) => {
          const postUrl = `/${categoryPaths[category]}/${post.slug.current}`;
          
          try {
            await fetch(postUrl, {
              mode: 'same-origin',
              credentials: 'same-origin',
              headers: { 'X-Prefetch': 'post' }
            });
            
            // Also prefetch post API data
            await fetch(`/api/posts/${post.slug.current}`);
            
            console.log(`✅ Prefetched post: ${postUrl}`);
          } catch (error) {
            console.warn(`Failed to prefetch post ${postUrl}:`, error);
          }
        });
        
        await Promise.allSettled(postPromises);
        console.log(`✅ Prefetched ${category} category content`);
      }
    } catch (error) {
      console.warn(`Failed to prefetch ${category} category:`, error);
    }
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