// ServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);
  const [deviceType, setDeviceType] = useState('unknown');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Device detection
  const detectDevice = () => {
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    const hasSmallScreen = window.innerWidth <= 768;
    const hasTouchScreen = 'ontouchstart' in window;
    
    // Check device memory if available
    const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const isLowMemoryDevice = deviceMemory < 4;
    
    // Check storage quota if available
    const checkStorageQuota = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const quota = estimate.quota || 0;
          const quotaInGB = quota / (1024 * 1024 * 1024);
          return quotaInGB < 10; // Less than 10GB available
        }
      } catch (error) {
        console.log('Could not check storage quota:', error);
      }
      return false;
    };
    
    return {
      isMobile: isMobile || isTablet || hasSmallScreen,
      isLowMemory: isLowMemoryDevice,
      hasTouchScreen,
      deviceMemory,
      checkStorageQuota
    };
  };

  useEffect(() => {
    if (!mounted) return;

    const initializeServiceWorker = async () => {
      const deviceInfo = detectDevice();
      const isLowStorage = await deviceInfo.checkStorageQuota();
      
      // Determine if we should enable SW
      const shouldEnableSW = !deviceInfo.isMobile || 
                            (deviceInfo.deviceMemory >= 4 && !isLowStorage);
      
      setDeviceType(deviceInfo.isMobile ? 'mobile' : 'desktop');
      
      console.log('Device Detection:', {
        isMobile: deviceInfo.isMobile,
        deviceMemory: deviceInfo.deviceMemory,
        isLowStorage,
        shouldEnableSW
      });

      if (!shouldEnableSW) {
        console.log('🚫 Service Worker disabled for this device (mobile/low-memory)');
        setSwStatus('disabled-mobile');
        
        // Unregister any existing service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
            console.log('Unregistered existing service worker');
          }
        }
        return;
      }

      // Proceed with SW registration for desktop/high-memory devices
      await registerServiceWorker();
    };

    initializeServiceWorker();
  }, [mounted]);

  const registerServiceWorker = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      setSwStatus('unsupported');
      return;
    }

    try {
      // Wait for React hydration
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 500);
        } else {
          window.addEventListener('load', () => {
            setTimeout(resolve, 500);
          });
        }
      });

      // Check and cleanup existing cache if needed
      await performInitialCleanup();

      // Register service worker with strict parameters
      const registration = await navigator.serviceWorker.register('/sw.js?v=4', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered:', registration);
      setSwStatus('registered');

      // Setup SW event listeners
      setupServiceWorkerListeners(registration);

      // Initialize minimal cache (homepage + offline page only)
      await initializeMinimalCache();

      // Setup aggressive storage monitoring
      setupStrictStorageMonitoring();

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      setSwStatus('failed');
    }
  };

  // Perform initial cleanup of any existing large caches
  const performInitialCleanup = async () => {
    try {
      const cacheNames = await caches.keys();
      const cachesToKeep = ['homepage-cache-v1', 'offline-page-v1'];
      
      // Delete all old/large caches
      for (const cacheName of cacheNames) {
        if (!cachesToKeep.includes(cacheName)) {
          await caches.delete(cacheName);
          console.log(`🧹 Deleted cache: ${cacheName}`);
        }
      }
      
      // Check storage after cleanup
      await checkStorageQuota();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  // Check storage quota with strict limits
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

        console.log(`📊 Storage: ${usageInMB}MB / ${quotaInMB}MB (${Math.round((usage / quota) * 100)}%)`);

        // STRICT limits - Clean up if usage exceeds 50MB OR 50% of quota
        if (usageInMB > 50 || (usage / quota > 0.5)) {
          console.warn('⚠️ Storage limit exceeded, initiating aggressive cleanup');
          await performAggressiveCleanup();
        }
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
  };

  // Aggressive cleanup function
  const performAggressiveCleanup = async () => {
    try {
      const cacheNames = await caches.keys();
      
      // Keep only homepage and offline page
      const essentialCaches = ['homepage-cache-v1', 'offline-page-v1'];
      
      for (const cacheName of cacheNames) {
        if (!essentialCaches.includes(cacheName)) {
          await caches.delete(cacheName);
          console.log(`🗑️ Deleted cache: ${cacheName}`);
        } else {
          // Even for essential caches, clean old entries
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          // Keep only the most recent entry
          if (requests.length > 1) {
            for (let i = 0; i < requests.length - 1; i++) {
              await cache.delete(requests[i]);
            }
          }
        }
      }
      
      // Clear IndexedDB data if it exists
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name && !db.name.includes('essential')) {
              indexedDB.deleteDatabase(db.name);
              console.log(`🗑️ Deleted IndexedDB: ${db.name}`);
            }
          }
        } catch (error) {
          console.log('IndexedDB cleanup skipped:', error);
        }
      }
      
      // Notify service worker to clean up
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'AGGRESSIVE_CLEANUP',
          maxTotalSize: 20 * 1024 * 1024, // 20MB max total
          keepOnlyEssential: true
        });
      }
      
    } catch (error) {
      console.error('Aggressive cleanup failed:', error);
    }
  };

  // Setup service worker listeners
  const setupServiceWorkerListeners = (registration) => {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSwStatus('update-available');
            // Auto-update without asking user to minimize disruption
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      }
    });

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      switch (event.data.type) {
        case 'STORAGE_WARNING':
          console.warn('Storage warning:', event.data.message);
          performAggressiveCleanup();
          break;
        case 'CACHE_LIMIT_REACHED':
          console.log('Cache limit reached, oldest entries removed');
          break;
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  };

  // Initialize minimal cache (homepage + offline page only)
  const initializeMinimalCache = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ESSENTIALS_ONLY',
          pages: [
            { url: '/', priority: 'critical' },
            { url: '/offline.html', priority: 'critical' }
          ]
        });
      }
      console.log('✅ Minimal cache initialized (homepage + offline only)');
    } catch (error) {
      console.error('Failed to initialize minimal cache:', error);
    }
  };

  // Strict storage monitoring
  const setupStrictStorageMonitoring = () => {
    const monitorStorage = async () => {
      await checkStorageQuota();
    };

    // Monitor every 2 minutes for strict control
    const interval = setInterval(monitorStorage, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  };

  // Smart page caching for recently visited pages (max 5)
  useEffect(() => {
    if (!mounted || swStatus !== 'registered' || deviceType === 'mobile') return;

    let recentPages = [];
    const MAX_RECENT_PAGES = 5;

    const handleNavigation = (url) => {
      // Only cache article pages
      const isArticlePage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn|free-ai-resources|ai-news)\/[^/]+$/.test(url);
      
      if (isArticlePage && navigator.serviceWorker.controller) {
        // Update recent pages list
        recentPages = recentPages.filter(page => page !== url);
        recentPages.unshift(url);
        recentPages = recentPages.slice(0, MAX_RECENT_PAGES);
        
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_RECENT_PAGE',
          url: url,
          recentPages: recentPages
        });
      }
    };

    // Listen for navigation events
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(() => handleNavigation(window.location.pathname), 1000);
      return result;
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => handleNavigation(window.location.pathname), 1000);
    });

    return () => {
      history.pushState = originalPushState;
    };
  }, [mounted, swStatus, deviceType]);

  // Expose cache management functions
  useEffect(() => {
    if (mounted) {
      window.swCacheManager = {
        cleanup: performAggressiveCleanup,
        checkQuota: checkStorageQuota,
        getStorageInfo: () => storageInfo,
        getDeviceType: () => deviceType,
        getSwStatus: () => swStatus
      };
    }
  }, [mounted, storageInfo, deviceType, swStatus]);

  // Don't render during SSR
  if (!mounted) return null;

  // Show minimal status info for debugging
  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
      SW: {swStatus} | Device: {deviceType} | Storage: {storageInfo?.usage || 0}MB
    </div>
  );
}