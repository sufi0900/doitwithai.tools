"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');

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
            setTimeout(resolve, 2000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 2000);
            });
          }
        });

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Wait for SW to be ready
        await navigator.serviceWorker.ready;

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
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('SW Message:', event.data);
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated for:', event.data.url);
          }
        });

        // CRUCIAL: Start aggressive prefetching after SW is ready
        await aggressivePrefetch();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Enhanced prefetching function
  const aggressivePrefetch = async () => {
    const staticPages = [
      '/',
      '/about',
      '/faq', 
      '/contact',
      '/privacy',
      '/terms'
    ];
    
    const semiDynamicPages = [
      '/ai-tools',
      '/ai-seo',
      '/ai-code',
      '/ai-learn-earn'
    ];

    try {
      console.log('🚀 Starting aggressive prefetch...');

      // 1. Prefetch static pages first (highest priority)
      const staticPromises = staticPages.map(async (page) => {
        try {
          // Fetch the page HTML
          const response = await fetch(page, {
            method: 'GET',
            headers: {
              'Cache-Control': 'max-age=3600',
              'X-Purpose': 'prefetch-static'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Prefetched static page: ${page}`);
            
            // Also prefetch Next.js data if available
            if (page !== '/') {
              try {
                await fetch(`/_next/data/${getBuildId()}${page === '/' ? '/index' : page}.json`);
              } catch (dataError) {
                console.log(`Data prefetch failed for ${page}:`, dataError);
              }
            }
          }
        } catch (error) {
          console.log(`Failed to prefetch static page ${page}:`, error);
        }
      });

      // 2. Prefetch semi-dynamic pages (lower priority)
      const semiDynamicPromises = semiDynamicPages.map(async (page) => {
        try {
          // Fetch the page structure
          const response = await fetch(page, {
            method: 'GET',
            headers: {
              'Cache-Control': 'max-age=1800',
              'X-Purpose': 'prefetch-semi-dynamic'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Prefetched semi-dynamic page: ${page}`);
            
            // Prefetch the API data for these pages
            const categoryMap = {
              '/ai-tools': 'aitool',
              '/ai-seo': 'SEO',
              '/ai-code': 'coding',
              '/ai-learn-earn': 'makemoney'
            };
            
            const category = categoryMap[page];
            if (category) {
              try {
                await fetch(`/api/posts?category=${category}`, {
                  headers: { 'X-Purpose': 'prefetch-api-data' }
                });
                console.log(`✅ Prefetched API data for: ${category}`);
              } catch (apiError) {
                console.log(`API prefetch failed for ${category}:`, apiError);
              }
            }
          }
        } catch (error) {
          console.log(`Failed to prefetch semi-dynamic page ${page}:`, error);
        }
      });

      // Execute all prefetches
      await Promise.allSettled([...staticPromises, ...semiDynamicPromises]);
      
      console.log('🎉 Aggressive prefetch completed!');
      
      // Send message to SW to cache these pages
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_COMPLETE',
          staticPages,
          semiDynamicPages
        });
      }

    } catch (error) {
      console.error('Aggressive prefetch failed:', error);
    }
  };

  // Helper function to get build ID
  const getBuildId = () => {
    // Try to extract build ID from Next.js
    const scripts = document.querySelectorAll('script[src*="/_next/static/"]');
    for (const script of scripts) {
      const match = script.src.match(/\/_next\/static\/([^\/]+)\//);
      if (match) return match[1];
    }
    return 'unknown';
  };

  // Enhanced client-side navigation handling
  useEffect(() => {
    if (!mounted) return;

    let currentPath = window.location.pathname;

    const handleRouteChange = async (newPath) => {
      if (newPath === currentPath) return;
      
      try {
        console.log('🔄 Caching page for navigation:', newPath);
        
        // Cache the new page
        const response = await fetch(newPath, {
          method: 'GET',
          headers: {
            'Cache-Control': 'max-age=3600',
            'X-Purpose': 'navigation-cache'
          }
        });

        if (response.ok) {
          console.log(`✅ Cached page for offline access: ${newPath}`);
          
          // Cache RSC payload if available
          if (newPath !== '/') {
            try {
              await fetch(`${newPath}?_rsc=1`);
            } catch (rscError) {
              console.log('RSC cache failed:', rscError);
            }
          }
        }
        
        currentPath = newPath;
        
      } catch (error) {
        console.log('Failed to cache page on navigation:', error);
      }
    };

    // Override history methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(() => handleRouteChange(window.location.pathname), 500);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      setTimeout(() => handleRouteChange(window.location.pathname), 500);
      return result;
    };

    // Listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => handleRouteChange(window.location.pathname), 500);
    });

    // Cache current page on initial load
    handleRouteChange(currentPath);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
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