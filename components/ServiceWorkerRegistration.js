// ServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);

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
            setTimeout(resolve, 1000); // Reduced delay
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500);
            });
          }
        });

        // Check storage quota first
        await checkStorageQuota();

        // Check for existing service worker
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('Existing SW found, updating...');
          await existingRegistration.update();
          setSwStatus('updated');
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup SW event listeners
        setupSWEventListeners(registration);

        // Initialize essential caching only
        await initializeEssentialCache();

        // Setup storage monitoring
        setupStorageMonitoring();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Check storage quota and availability
  const checkStorageQuota = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usageInMB = Math.round(usage / 1024 / 1024);
        const quotaInMB = Math.round(quota / 1024 / 1024);
        
        setStorageInfo({
          usage: usageInMB,
          quota: quotaInMB,
          percentage: quota > 0 ? Math.round((usage / quota) * 100) : 0
        });

        console.log(`📊 Storage Usage: ${usageInMB}MB / ${quotaInMB}MB (${Math.round((usage / quota) * 100)}%)`);

        // If usage is above 80%, clean up
        if (usage / quota > 0.8) {
          await requestCacheCleanup();
        }

        // If usage is above 50MB, warn and clean
        if (usageInMB > 50) {
          console.warn('⚠️ High storage usage detected, initiating cleanup');
          await requestCacheCleanup();
        }
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
  };

  // Setup service worker event listeners
  const setupSWEventListeners = (registration) => {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      console.log('SW: Update found');
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('SW: New version available');
            setSwStatus('update-available');
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
      
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated for:', event.data.url);
          break;
        case 'STORAGE_WARNING':
          console.warn('Storage warning from SW:', event.data.message);
          break;
        case 'CACHE_CLEANED':
          console.log('Cache cleaned:', event.data.message);
          checkStorageQuota(); // Refresh storage info
          break;
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      window.location.reload();
    });
  };

  // Initialize only essential cache (homepage + static pages)
  const initializeEssentialCache = async () => {
    try {
      const essentialPages = [
        { url: '/', priority: 'critical' },
        { url: '/about', priority: 'high' },
        { url: '/contact', priority: 'medium' },
        { url: '/offline.html', priority: 'critical' }
      ];

      // Send message to SW to cache essential pages only
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ESSENTIAL_PAGES',
          pages: essentialPages
        });
      }

      console.log('✅ Essential pages cache initialized');
    } catch (error) {
      console.error('Failed to initialize essential cache:', error);
    }
  };

  // Request cache cleanup from service worker
  const requestCacheCleanup = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEANUP_CACHE',
          options: {
            maxDynamicPages: 10,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxTotalSize: 50 * 1024 * 1024 // 50MB
          }
        });
      }
    } catch (error) {
      console.error('Failed to request cache cleanup:', error);
    }
  };

  // Setup periodic storage monitoring
  const setupStorageMonitoring = () => {
    const monitorStorage = async () => {
      await checkStorageQuota();
      
      // If storage is getting full, clean up
      if (storageInfo && storageInfo.percentage > 70) {
        await requestCacheCleanup();
      }
    };

    // Monitor every 5 minutes
    const interval = setInterval(monitorStorage, 5 * 60 * 1000);

    return () => clearInterval(interval);
  };

  // Smart page caching on navigation (limited)
  useEffect(() => {
    if (!mounted) return;

    let cachedPagesCount = 0;
    const MAX_CACHED_PAGES = 10;

    const handleNavigation = async (url) => {
      try {
        // Only cache if we haven't exceeded limit
        if (cachedPagesCount >= MAX_CACHED_PAGES) {
          console.log('Max cached pages reached, skipping cache for:', url);
          return;
        }

        // Only cache article pages, not all pages
        const isArticlePage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^/]+$/.test(url);
        
        if (isArticlePage && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_PAGE_SMART',
            url: url,
            priority: 'low',
            maxCount: MAX_CACHED_PAGES
          });
          cachedPagesCount++;
        }
      } catch (error) {
        console.log('Failed to cache page on navigation:', error);
      }
    };

    // Listen for client-side navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 1000);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 1000);
      return result;
    };

    window.addEventListener('popstate', () => {
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 1000);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [mounted]);

  // Expose cache management functions globally
  useEffect(() => {
    if (mounted) {
      window.swCacheManager = {
        cleanup: requestCacheCleanup,
        checkQuota: checkStorageQuota,
        getStorageInfo: () => storageInfo
      };
    }
  }, [mounted, storageInfo]);

  // Don't render anything during SSR
  if (!mounted) return null;


  return null;
}
