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
            setTimeout(resolve, 1000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500);
            });
          }
        });

        // Check for existing service worker first
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        const isControlled = !!navigator.serviceWorker.controller;

        if (existingRegistration && isControlled) {
          console.log('SW already active and controlling, updating silently');
          setSwStatus('active');
          
          // Silent update without reload
          await existingRegistration.update();
          
          // Setup listeners
          await setupServiceWorkerListeners(existingRegistration);
          
          // Only cache essential static pages
          await cacheEssentialPages();
          
          return; // Exit early to prevent reload
        }

        // Register service worker only if not already controlled
        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup listeners
        await setupServiceWorkerListeners(registration);
        
        // Cache only essential static pages
        await cacheEssentialPages();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Simplified listener setup
  const setupServiceWorkerListeners = async (registration) => {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      console.log('SW: Update found');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('SW: New version available');
            setSwStatus('update-available');
            
            // Optional: Show update notification (non-intrusive)
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

    // Only reload on controller change if it's an actual update
    let isFirstController = !navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      
      if (!isFirstController) {
        console.log('SW: Reloading due to controller update');
        window.location.reload();
      } else {
        console.log('SW: First controller, skipping reload');
        isFirstController = false;
      }
    });
  };

  // Simplified essential page caching
  const cacheEssentialPages = async () => {
    try {
      // Only cache truly essential static pages
      const essentialPages = [
        { url: '/about', priority: 'high' },
        { url: '/contact', priority: 'medium' },
        { url: '/offline.html', priority: 'high' } // Offline fallback
      ];

      const prefetchPage = async (pageInfo) => {
        const { url, priority } = pageInfo;
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': 'no-cache',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin'
            },
            mode: 'same-origin',
            credentials: 'same-origin',
            cache: 'force-cache'
          });

          if (response.ok) {
            await response.text();
            console.log(`✅ Essential page cached: ${url}`);
            return { success: true, url };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to cache essential page ${url}:`, error);
          return { success: false, url, error };
        }
      };

      const prefetchPromises = essentialPages.map(prefetchPage);
      await Promise.allSettled(prefetchPromises);
      
      console.log('✅ Essential pages cached');
    } catch (error) {
      console.error('Failed to cache essential pages:', error);
    }
  };

  // Simplified navigation handling - only for static pages
  const handleStaticNavigation = async () => {
    if (typeof window === 'undefined') return;

    let currentPath = window.location.pathname;
    const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];

    const cacheOnNavigation = async (newPath) => {
      if (newPath === currentPath) return;
      
      try {
        // Only cache if it's a static page
        const isStaticPage = staticPages.includes(newPath) || 
                            staticPages.includes(newPath.replace(/\/$/, ''));
        
        if (isStaticPage) {
          await fetch(newPath, {
            method: 'GET',
            mode: 'same-origin',
            credentials: 'same-origin',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin'
            }
          });
          console.log(`✅ Cached static page on navigation: ${newPath}`);
        }
        currentPath = newPath;
      } catch (error) {
        console.log('Failed to cache page on navigation:', newPath, error);
      }
    };

    // Listen for navigation changes
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

    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname;
      setTimeout(() => cacheOnNavigation(newPath), 500);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  };

  // Setup navigation handling
  useEffect(() => {
    if (!mounted) return;
    const cleanup = handleStaticNavigation();
    return cleanup;
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
