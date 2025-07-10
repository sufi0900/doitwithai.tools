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
                '/ai-news',
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
            
            // Pre-fetch pages and their data
            for (const page of importantPages) {
                try {
                    // Cache the page HTML
                    const response = await fetch(page, { 
                        mode: 'same-origin',
                        credentials: 'same-origin'
                    });
                    
                    if (response.ok) {
                        // Also fetch RSC payload for the page
                        try {
                            await fetch(`${page}?_rsc=1`, { 
                                mode: 'same-origin',
                                credentials: 'same-origin'
                            });
                        } catch (rscError) {
                            console.log('Failed to pre-cache RSC for:', page);
                        }
                        
                        // For dynamic pages, try to cache their API data
                        if (['ai-tools', 'ai-seo', 'ai-code', 'ai-learn-earn'].includes(page.replace('/', ''))) {
                            try {
                                // Cache the API data for these dynamic pages
                                await fetch(`/api/posts?category=${page.replace('/', '').replace('-', '')}`, {
                                    mode: 'same-origin',
                                    credentials: 'same-origin'
                                });
                            } catch (apiError) {
                                console.log('Failed to pre-cache API data for:', page);
                            }
                        }
                    }
                    
                    console.log('Pre-cached page:', page);
                } catch (error) {
                    console.log('Failed to pre-cache page:', page, error);
                }
            }
        } catch (error) {
            console.error('Pre-caching failed:', error);
        }
    }
};


// Cache data when user visits dynamic pages
const cachePageData = async (pathname) => {
    if (typeof window === 'undefined') return;
    
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
            
            console.log('Cached data for category:', category);
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
                    console.log('Cached data for slug:', slug);
                } catch (error) {
                    console.log('Failed to cache slug data:', slug);
                }
            }
        }
    } catch (error) {
        console.log('Failed to cache page data:', error);
    }
};

// Call this function when pathname changes
useEffect(() => {
    if (mounted) {
        cachePageData(window.location.pathname);
    }
}, [mounted]);

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