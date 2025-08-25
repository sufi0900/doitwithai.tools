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
            // Reduced delay for better UX
            setTimeout(resolve, 1000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500);
            });
          }
        });

        // Check for existing service worker first
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        
        // 🔥 FIX: Check if SW is already controlling the page
        const isControlled = !!navigator.serviceWorker.controller;
        
        if (existingRegistration && isControlled) {
          console.log('SW already active and controlling, skipping registration');
          setSwStatus('active');
          
          // Just update without forcing reload
          await existingRegistration.update();
          
          // Setup listeners and cache without reload
          await setupServiceWorkerListeners(existingRegistration);
          await preCachePages(existingRegistration);
          await preloadStaticPages();
          await warmStaticPageCache();
          await prefetchCurrentPage();
          await ensureOfflinePageCached();
          await prefetchAllContent();
          
          return; // Exit early to prevent reload
        }

        // Register service worker only if not already controlled
        const registration = await navigator.serviceWorker.register('/sw.js?v=2', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup listeners
        await setupServiceWorkerListeners(registration);

        // Pre-cache important pages
        await preCachePages(registration);
        await preloadStaticPages();
        await warmStaticPageCache();
        await prefetchCurrentPage();
        await ensureOfflinePageCached();
        await prefetchAllContent();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // 🔥 FIXED: Separate function for setting up listeners to avoid reload on first install
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
            
            // Only notify about updates, don't auto-reload
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

    // 🔥 CRITICAL FIX: Only reload on controller change if it's an actual update
    let isFirstController = !navigator.serviceWorker.controller;
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      
      // Only reload if this isn't the first controller (i.e., it's an update)
      if (!isFirstController) {
        console.log('SW: Reloading due to controller update');
        window.location.reload();
      } else {
        console.log('SW: First controller, skipping reload');
        isFirstController = false;
      }
    });
  };

  // Add this new function for aggressive static page caching
  const preloadStaticPages = async () => {
    try {
      const staticPages = [
        { url: '/about', priority: 'high' },
        { url: '/faq', priority: 'medium' },
        { url: '/contact', priority: 'medium' },
        { url: '/privacy', priority: 'low' },
        { url: '/terms', priority: 'low' }
      ];

      // Enhanced prefetch with proper navigation headers
      const prefetchPage = async (pageInfo) => {
        const { url, priority } = pageInfo;
        try {
          // Fetch as navigation request to match service worker expectations
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin',
              'Upgrade-Insecure-Requests': '1'
            },
            mode: 'same-origin',
            credentials: 'same-origin',
            cache: 'force-cache'
          });

          if (response.ok) {
            await response.text();
            console.log(`✅ Static page cached for navigation: ${url}`);
            return { success: true, url };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to cache static page ${url}:`, error);
          return { success: false, url, error };
        }
      };

      const prefetchPromises = staticPages.map(prefetchPage);
      await Promise.allSettled(prefetchPromises);
      
      console.log('✅ All static pages prefetched with navigation headers');
    } catch (error) {
      console.error('Failed to prefetch static pages:', error);
    }
  };

  const warmStaticPageCache = async () => {
    if (!navigator.serviceWorker.controller) {
      console.log('No service worker controller, skipping cache warming');
      return;
    }

    const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];
    
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'WARM_STATIC_CACHE',
        pages: staticPages
      });
      
      console.log('✅ Cache warming request sent to service worker');
    } catch (error) {
      console.error('Failed to send cache warming request:', error);
    }
  };

  const prefetchAllContent = async () => {
    try {
      // Simple prefetch without complex manifest
      const importantPages = [
        { url: '/', priority: 'high' },
        { url: '/ai-tools', priority: 'high' },
        { url: '/ai-seo', priority: 'high' },
        { url: '/ai-code', priority: 'medium' },
        { url: '/ai-learn-earn', priority: 'medium' }
      ];
      
      console.log('🚀 Starting comprehensive prefetch...');
      
      const prefetchPromises = importantPages.map(async (pageInfo) => {
        const { url, priority } = pageInfo;
        
        try {
          const response = await fetch(url, {
            mode: 'same-origin',
            credentials: 'same-origin',
            headers: { 'X-Prefetch': 'comprehensive' }
          });
          
          if (response.ok) {
            console.log(`✅ Prefetched ${priority} priority page: ${url}`);
          }
        } catch (error) {
          console.warn(`Failed to prefetch ${url}:`, error);
        }
      });
      
      await Promise.allSettled(prefetchPromises);
      console.log('🎉 Comprehensive prefetch completed!');
    } catch (error) {
      console.error('Comprehensive prefetch failed:', error);
    }
  };

  // Prefetch current page content
  const prefetchCurrentPage = async () => {
    try {
      const currentPath = window.location.pathname;
      
      await fetch(currentPath, { mode: 'same-origin' });
      
      if (currentPath !== '/') {
        await fetch(`${currentPath}?_rsc=1`, { mode: 'same-origin' });
      }
      
      console.log('Pre-cached current page:', currentPath);
    } catch (error) {
      console.log('Failed to pre-cache current page:', error);
    }
  };

  const preCachePages = async (registration) => {
    if (registration.active || registration.installing) {
      try {
        // Wait for service worker to be ready
        await registration.ready;
        
        navigator.serviceWorker.controller?.postMessage({
          type: 'PREFETCH_PAGES',
          staticPages: ['/about', '/faq', '/contact', '/privacy', '/terms'],
        });
        
        console.log('✅ Prefetch request sent to service worker');
      } catch (error) {
        console.error('Prefetch request failed:', error);
      }
    }
  };

  const ensureOfflinePageCached = async () => {
    try {
      await fetch('/offline.html', {
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      console.log('✅ Offline page cached successfully');
    } catch (error) {
      console.log('Failed to cache offline page:', error);
    }
  };

  // 🔥 SIMPLIFIED: Less aggressive client-side navigation caching
  const handleClientSideNavigation = async () => {
    if (typeof window === 'undefined') return;
    
    let currentPath = window.location.pathname;
    const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];

    const cacheOnNavigation = async (newPath) => {
      if (newPath === currentPath) return;
      
      try {
        // Only cache static pages on navigation
        const isStaticPage = staticPages.includes(newPath) || staticPages.includes(newPath.replace(/\/$/, ''));
        
        if (isStaticPage) {
          await fetch(newPath, {
            method: 'GET',
            mode: 'same-origin',
            credentials: 'same-origin',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin',
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

  // Expose updateCache function globally
  useEffect(() => {
    if (mounted) {
      window.updateSWCache = updateCache;
    }
  }, [mounted]);

  // Setup client-side navigation handling
  useEffect(() => {
    if (!mounted) return;
    
    const cleanup = handleClientSideNavigation();
    return cleanup;
  }, [mounted]);

  // Don't render anything during SSR
  if (!mounted) return null;



  return null;
}

