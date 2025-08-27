// SmartServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function SmartServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);
  const [deviceType, setDeviceType] = useState('unknown');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Device detection function
  const detectDevice = () => {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasSmallScreen = window.screen.width <= 768 || window.innerWidth <= 768;
    
    // More aggressive mobile detection
    if (isMobile || isTablet || (isTouchDevice && hasSmallScreen)) {
      return 'mobile';
    }
    
    return 'desktop';
  };

  useEffect(() => {
    if (!mounted) return;

    const device = detectDevice();
    setDeviceType(device);

    // CRITICAL: Disable service worker completely on mobile devices
    if (device === 'mobile') {
      console.log('📱 Mobile device detected - Service Worker DISABLED for storage conservation');
      setSwStatus('disabled-mobile');
      
      // Clean up any existing service worker on mobile
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister().then(success => {
              if (success) {
                console.log('🗑️ Existing SW unregistered from mobile device');
              }
            });
          });
        });
      }
      return;
    }

    // Only register on desktop devices
    registerServiceWorkerForDesktop();
  }, [mounted]);

  const registerServiceWorkerForDesktop = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      setSwStatus('unsupported');
      return;
    }

    try {
      console.log('🖥️ Desktop device detected - Initializing Service Worker...');

      // Wait for page to be ready
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 500);
        } else {
          window.addEventListener('load', () => {
            setTimeout(resolve, 500);
          });
        }
      });

      // Check initial storage before registering
      const initialCheck = await checkStorageQuota();
      if (initialCheck && initialCheck.usage > 50) {
        console.warn('⚠️ Storage already exceeds 50MB, cleaning before SW registration');
        await forceCleanupAllCaches();
      }

      // Register service worker with storage monitoring
      const registration = await navigator.serviceWorker.register('/sw.js?v=4', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered for desktop:', registration);
      setSwStatus('registered');

      // Setup all monitoring and controls
      setupServiceWorkerControls(registration);
      await initializeCriticalCacheOnly();
      setupStorageMonitoring();
      setupPeriodicCleanup();

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      setSwStatus('failed');
    }
  };

  // Check storage and enforce 50MB limit
  const checkStorageQuota = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usageInMB = Math.round(usage / 1024 / 1024);
        const quotaInMB = Math.round(quota / 1024 / 1024);
        const percentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;
        
        setStorageInfo({
          usage: usageInMB,
          quota: quotaInMB,
          percentage: percentage
        });

        console.log(`📊 Storage: ${usageInMB}MB / ${quotaInMB}MB (${percentage}%)`);

        // CRITICAL: Enforce 50MB hard limit
        if (usageInMB >= 50) {
          console.error('🚨 STORAGE LIMIT EXCEEDED: 50MB limit reached!');
          await forceCleanupAllCaches();
          return { usage: usageInMB, quota: quotaInMB, percentage, exceeded: true };
        }

        // Warning at 40MB
        if (usageInMB >= 40) {
          console.warn('⚠️ STORAGE WARNING: Approaching 50MB limit');
          await aggressiveCleanup();
        }

        return { usage: usageInMB, quota: quotaInMB, percentage, exceeded: false };
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
    return null;
  };

  // Initialize only critical cache (homepage + offline)
  const initializeCriticalCacheOnly = async () => {
    try {
      const criticalPages = [
        { url: '/', priority: 'critical', cache: 'homepage-v1' },
        { url: '/offline.html', priority: 'critical', cache: 'offline-page-v1' }
      ];

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CRITICAL_ONLY',
          pages: criticalPages,
          maxSize: 5 * 1024 * 1024 // 5MB limit for critical cache
        });
      }

      console.log('✅ Critical cache initialized (Homepage + Offline page only)');
    } catch (error) {
      console.error('Failed to initialize critical cache:', error);
    }
  };

  // Setup service worker event listeners and controls
  const setupServiceWorkerControls = (registration) => {
    // Listen for storage warnings from SW
    navigator.serviceWorker.addEventListener('message', async (event) => {
      console.log('SW Message:', event.data);
      
      switch (event.data.type) {
        case 'STORAGE_CRITICAL':
          console.error('🚨 CRITICAL: Storage limit reached from SW');
          await forceCleanupAllCaches();
          break;
        case 'STORAGE_WARNING':
          console.warn('⚠️ Storage warning from SW');
          await aggressiveCleanup();
          break;
        case 'CACHE_ADDED':
          // Check storage after each cache addition
          setTimeout(checkStorageQuota, 1000);
          break;
        case 'CLEANUP_COMPLETE':
          console.log('✅ Cache cleanup completed');
          checkStorageQuota();
          break;
      }
    });

    // Update detection
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSwStatus('update-available');
          }
        });
      }
    });
  };

  // Aggressive cleanup when approaching limits
  const aggressiveCleanup = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'AGGRESSIVE_CLEANUP',
          options: {
            maxRecentPages: 3, // Reduce from 5 to 3
            maxStaticAssets: 10, // Reduce static assets
            maxImages: 5, // Reduce images
            maxAge: 1 * 60 * 60 * 1000, // 1 hour only
            forceCleanup: true
          }
        });
      }
      
      console.log('🧹 Aggressive cleanup initiated');
    } catch (error) {
      console.error('Failed to perform aggressive cleanup:', error);
    }
  };

  // Force cleanup all caches (nuclear option)
  const forceCleanupAllCaches = async () => {
    try {
      const cacheNames = await caches.keys();
      const criticalCaches = ['homepage-v1', 'offline-page-v1'];
      
      // Delete all non-critical caches
      for (const cacheName of cacheNames) {
        if (!criticalCaches.includes(cacheName)) {
          await caches.delete(cacheName);
          console.log(`🗑️ Deleted cache: ${cacheName}`);
        }
      }

      // Clean critical caches but keep essential entries
      for (const criticalCache of criticalCaches) {
        const cache = await caches.open(criticalCache);
        const requests = await cache.keys();
        
        // Keep only the essential entries
        if (criticalCache === 'homepage-v1') {
          const homepagePattern = /^https:\/\/.*\/(?:\?.*)?$/;
          for (const request of requests) {
            if (!homepagePattern.test(request.url)) {
              await cache.delete(request);
            }
          }
        } else if (criticalCache === 'offline-page-v1') {
          const offlinePattern = /offline\.html$/;
          for (const request of requests) {
            if (!offlinePattern.test(request.url)) {
              await cache.delete(request);
            }
          }
        }
      }

      // Clear IndexedDB if exists
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name && (db.name.includes('cache') || db.name.includes('sw'))) {
              indexedDB.deleteDatabase(db.name);
              console.log(`🗑️ Deleted IndexedDB: ${db.name}`);
            }
          }
        } catch (e) {
          console.log('IndexedDB cleanup completed');
        }
      }

      console.log('🧹 FORCE CLEANUP COMPLETED - All non-critical caches cleared');
      
      // Recheck storage
      setTimeout(checkStorageQuota, 2000);
      
    } catch (error) {
      console.error('Failed to force cleanup caches:', error);
    }
  };

  // Setup periodic storage monitoring and cleanup
  const setupStorageMonitoring = () => {
    const monitorStorage = async () => {
      const info = await checkStorageQuota();
      
      if (info) {
        // Enforce strict limits
        if (info.exceeded || info.usage >= 50) {
          console.error('🚨 STORAGE LIMIT BREACH - Initiating emergency cleanup');
          await forceCleanupAllCaches();
        } else if (info.usage >= 40) {
          console.warn('⚠️ STORAGE WARNING - Initiating aggressive cleanup');
          await aggressiveCleanup();
        }
      }
    };

    // Check every 2 minutes
    const interval = setInterval(monitorStorage, 2 * 60 * 1000);
    
    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(monitorStorage, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // Setup periodic cleanup (every 30 minutes)
  const setupPeriodicCleanup = () => {
    const periodicCleanup = async () => {
      console.log('🔄 Periodic cleanup initiated');
      await aggressiveCleanup();
    };

    const interval = setInterval(periodicCleanup, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  };

  // Smart page caching with strict limits
  useEffect(() => {
    if (!mounted || deviceType !== 'desktop') return;

    let recentPagesCount = 0;
    const MAX_RECENT_PAGES = 5;

    const handleSmartCaching = async (url) => {
      try {
        // Only cache article pages
        const isArticlePage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^/]+$/.test(url);
        
        if (isArticlePage && recentPagesCount < MAX_RECENT_PAGES) {
          // Check storage before caching
          const storageCheck = await checkStorageQuota();
          if (storageCheck && storageCheck.usage >= 45) {
            console.warn('⚠️ Storage near limit - skipping page cache');
            return;
          }

          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_RECENT_PAGE',
              url: url,
              maxCount: MAX_RECENT_PAGES,
              storageLimit: 50 * 1024 * 1024 // 50MB
            });
            recentPagesCount++;
          }
        }
      } catch (error) {
        console.log('Failed to cache page smartly:', error);
      }
    };

    // Listen for navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(() => handleSmartCaching(window.location.pathname), 2000);
      return result;
    };

    return () => {
      history.pushState = originalPushState;
    };
  }, [mounted, deviceType]);

  // Expose global cache management
  useEffect(() => {
    if (mounted && deviceType === 'desktop') {
      window.swCacheManager = {
        cleanup: aggressiveCleanup,
        forceCleanup: forceCleanupAllCaches,
        checkStorage: checkStorageQuota,
        getStorageInfo: () => storageInfo,
        getDeviceType: () => deviceType
      };
    }
  }, [mounted, deviceType, storageInfo]);

  // Don't render anything during SSR or on mobile
  if (!mounted) return null;
  
  // Show mobile status in development
  if (process.env.NODE_ENV === 'development' && deviceType === 'mobile') {
    return (
      <div className="fixed top-20 right-4 bg-orange-500 text-white text-xs p-2 rounded z-50">
        📱 SW Disabled (Mobile)
      </div>
    );
  }

  return null;
}