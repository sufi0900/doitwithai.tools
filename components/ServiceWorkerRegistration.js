// ServiceWorkerRegistration.js - Optimized version with storage management
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
        // Wait for React hydration without excessive delay
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 1000); // Reduced from 3000ms
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500); // Reduced from 2000ms
            });
          }
        });

        // Check storage quota before proceeding
        await checkStorageQuota();

        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup update handling without auto-reload
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwStatus('update-available');
                // Don't auto-reload, just notify
                console.log('SW: New version available');
              }
            });
          }
        });

        // Handle messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'STORAGE_WARNING') {
            handleStorageWarning(event.data);
          }
        });

        // Controlled controller change (no auto-reload)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          // Remove auto-reload for better UX
        });

        // Initialize with essential caching only
        await initializeEssentialCaching(registration);
        await ensureRootPageCached();
        await setupNavigationCaching();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Storage quota management
  const checkStorageQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
      const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
      
      console.log(`Storage used: ${usedMB}MB of ${quotaMB}MB`);
      
      // Warn if using more than 100MB
      if (estimate.usage > 100 * 1024 * 1024) {
        console.warn('High storage usage detected');
        await navigator.serviceWorker.controller?.postMessage({
          type: 'CLEANUP_CACHE'
        });
      }
    }
  };

  // Handle storage warnings from SW
  const handleStorageWarning = (data) => {
    console.warn('Storage warning:', data.message);
    // Optionally show user notification
  };

  // Essential caching only (critical pages)
  const initializeEssentialCaching = async (registration) => {
    const essentialPages = [
      '/', // Always cache root
      '/offline.html'
    ];

    try {
      for (const page of essentialPages) {
        await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin'
        });
      }
      console.log('✅ Essential pages cached');
    } catch (error) {
      console.error('Failed to cache essential pages:', error);
    }
  };

  // Ensure root page is always cached
  const ensureRootPageCached = async () => {
    try {
      await fetch('/', {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
        headers: {
          'X-Purpose': 'root-page-cache'
        }
      });
      console.log('✅ Root page cached for offline access');
    } catch (error) {
      console.error('Failed to cache root page:', error);
    }
  };

  // Smart navigation caching with limits
  const setupNavigationCaching = () => {
    let cachedPagesCount = 0;
    const MAX_DYNAMIC_PAGES = 10; // Limit dynamic page caching
    const cachedUrls = new Set();

    const handleNavigation = async (url) => {
      if (cachedUrls.has(url)) return;
      
      const pathname = new URL(url, window.location.origin).pathname;
      const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];
      
      // Always cache static pages
      if (staticPages.includes(pathname)) {
        try {
          await fetch(pathname, { mode: 'same-origin' });
          cachedUrls.add(url);
          console.log(`✅ Static page cached: ${pathname}`);
        } catch (error) {
          console.error(`Failed to cache static page ${pathname}:`, error);
        }
        return;
      }

      // Limit dynamic page caching
      if (cachedPagesCount >= MAX_DYNAMIC_PAGES) {
        console.log('Dynamic page cache limit reached, skipping:', pathname);
        return;
      }

      // Cache dynamic pages with limit
      if (pathname.startsWith('/ai-') || pathname.startsWith('/free-ai-')) {
        try {
          await fetch(pathname, { mode: 'same-origin' });
          cachedUrls.add(url);
          cachedPagesCount++;
          console.log(`✅ Dynamic page cached (${cachedPagesCount}/${MAX_DYNAMIC_PAGES}): ${pathname}`);
          
          // Send message to SW about cache count
          navigator.serviceWorker.controller?.postMessage({
            type: 'UPDATE_CACHE_COUNT',
            count: cachedPagesCount
          });
        } catch (error) {
          console.error(`Failed to cache dynamic page ${pathname}:`, error);
        }
      }
    };

    // Intercept navigation with debouncing
    let navigationTimeout;
    const debouncedNavigation = (url) => {
      clearTimeout(navigationTimeout);
      navigationTimeout = setTimeout(() => handleNavigation(url), 300);
    };

    // Override history methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      debouncedNavigation(window.location.href);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      debouncedNavigation(window.location.href);
      return result;
    };

    window.addEventListener('popstate', () => {
      debouncedNavigation(window.location.href);
    });

    // Cache current page
    handleNavigation(window.location.href);

    return () => {
      clearTimeout(navigationTimeout);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  };

  // Link prefetching with storage awareness
  useEffect(() => {
    if (!mounted) return;

    const handleLinkHover = async (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href?.startsWith('/') || href.startsWith('//')) return;

      // Check storage before prefetching
      if ('storage' in navigator) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage > 50 * 1024 * 1024) { // 50MB limit for prefetch
          return;
        }
      }

      // Prefetch with low priority
      try {
        await fetch(href, {
          mode: 'same-origin',
          priority: 'low'
        });
      } catch (error) {
        // Ignore prefetch errors
      }
    };

    document.addEventListener('mouseenter', handleLinkHover, true);
    return () => document.removeEventListener('mouseenter', handleLinkHover, true);
  }, [mounted]);

  if (!mounted) return null;

  
  return null;
}

