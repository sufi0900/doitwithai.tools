// ServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  // Enhanced storage limits for safety
  const STORAGE_LIMITS = {
    MAX_TOTAL_SIZE: 50 * 1024 * 1024,        // 50MB total (reduced from your current 200-400MB)
    MAX_DYNAMIC_PAGES: 8,                     // Reduced from 10 for safety
    MAX_ARTICLE_SIZE: 2 * 1024 * 1024,       // 2MB per article max
    WARNING_THRESHOLD: 0.6,                  // 60% storage usage warning
    CRITICAL_THRESHOLD: 0.8,                 // 80% storage usage critical
    CLEANUP_INTERVAL: 10 * 60 * 1000,        // Check every 10 minutes
    CACHE_MAX_AGE: 3 * 24 * 60 * 60 * 1000   // 3 days (reduced from 7)
  };

  // Essential pages that must ALWAYS be cached
  const ESSENTIAL_PAGES = [
    { url: '/', priority: 'critical', maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days for root
    { url: '/offline.html', priority: 'critical', maxAge: 30 * 24 * 60 * 60 * 1000 },
    { url: '/about', priority: 'high', maxAge: 7 * 24 * 60 * 60 * 1000 },
    { url: '/contact', priority: 'high', maxAge: 7 * 24 * 60 * 60 * 1000 }
  ];

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
        // Wait for React hydration
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 1000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500);
            });
          }
        });

        // CRITICAL: Perform aggressive cleanup BEFORE registration
        await performAggressiveCleanup();

        // Check storage quota
        await checkStorageQuota();

        // Register service worker with enhanced versioning
        const timestamp = Date.now();
        const registration = await navigator.serviceWorker.register(`/sw.js?v=4&t=${timestamp}`, {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup enhanced SW event listeners
        setupSWEventListeners(registration);

        // Initialize essential cache with size limits
        await initializeEssentialCacheWithLimits();

        // Setup aggressive storage monitoring
        setupAggressiveStorageMonitoring();

        // Setup emergency cleanup system
        setupEmergencyCleanup();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Perform aggressive cleanup before SW registration
  const performAggressiveCleanup = async () => {
    try {
      // Clear old caches that might be from previous versions
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          !name.includes('essential') && !name.includes('static')
        );
        
        for (const cacheName of oldCaches) {
          console.log('🧹 Removing old cache:', cacheName);
          await caches.delete(cacheName);
        }
      }

      // Clear IndexedDB if it exists and is too large
      await cleanupIndexedDB();

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  // Enhanced storage quota checking with detailed breakdown
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
          percentage: percentage,
          isCritical: percentage > (STORAGE_LIMITS.CRITICAL_THRESHOLD * 100),
          isWarning: percentage > (STORAGE_LIMITS.WARNING_THRESHOLD * 100)
        });

        console.log(`📊 Storage Usage: ${usageInMB}MB / ${quotaInMB}MB (${percentage}%)`);

        // Get detailed cache breakdown
        await getCacheBreakdown();

        // Trigger cleanup based on thresholds
        if (percentage > (STORAGE_LIMITS.CRITICAL_THRESHOLD * 100)) {
          console.error('🚨 CRITICAL: Storage usage above 80%! Performing emergency cleanup');
          await performEmergencyCleanup();
        } else if (percentage > (STORAGE_LIMITS.WARNING_THRESHOLD * 100)) {
          console.warn('⚠️ WARNING: Storage usage above 60%! Performing cleanup');
          await requestAdvancedCacheCleanup();
        }

        // Additional safety check for absolute size
        if (usageInMB > 75) {
          console.error('🚨 CRITICAL: Total storage exceeds 75MB! Emergency cleanup');
          await performEmergencyCleanup();
        }
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
  };

  // Get detailed breakdown of what's using storage
  const getCacheBreakdown = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const breakdown = {};
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          let cacheSize = 0;

          for (const request of keys) {
            try {
              const response = await cache.match(request);
              if (response) {
                const blob = await response.blob();
                cacheSize += blob.size;
              }
            } catch (e) {
              // Skip if unable to read
            }
          }

          breakdown[cacheName] = {
            size: Math.round(cacheSize / 1024 / 1024 * 100) / 100, // MB with 2 decimals
            count: keys.length
          };
          totalSize += cacheSize;
        }

        setCacheStats({
          breakdown,
          totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100,
          cacheCount: cacheNames.length
        });

        console.log('📈 Cache Breakdown:', breakdown);
      }
    } catch (error) {
      console.error('Failed to get cache breakdown:', error);
    }
  };

  // Enhanced service worker event listeners
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

    // Enhanced message handling
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('SW Message:', event.data);
      
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated for:', event.data.url);
          checkStorageQuota(); // Refresh after cache update
          break;
        case 'STORAGE_WARNING':
          console.warn('Storage warning from SW:', event.data.message);
          requestAdvancedCacheCleanup();
          break;
        case 'STORAGE_CRITICAL':
          console.error('CRITICAL storage alert from SW:', event.data.message);
          performEmergencyCleanup();
          break;
        case 'CACHE_CLEANED':
          console.log('Cache cleaned:', event.data.message);
          checkStorageQuota();
          break;
        case 'CACHE_REJECTED':
          console.log('Cache rejected (size limit):', event.data.url, event.data.reason);
          break;
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      window.location.reload();
    });
  };

  // Initialize essential cache with strict size limits
  const initializeEssentialCacheWithLimits = async () => {
    try {
      // GUARANTEE root page is cached first
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ESSENTIAL_PAGES',
          pages: ESSENTIAL_PAGES,
          options: {
            maxSize: STORAGE_LIMITS.MAX_ARTICLE_SIZE,
            forceRootPage: true, // Ensure root is always cached
            timeout: 10000 // 10 second timeout per page
          }
        });
      }

      console.log('✅ Essential pages cache initialized with size limits');
    } catch (error) {
      console.error('Failed to initialize essential cache:', error);
    }
  };

  // Advanced cache cleanup with intelligent prioritization
  const requestAdvancedCacheCleanup = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEANUP_CACHE_ADVANCED',
          options: {
            maxDynamicPages: STORAGE_LIMITS.MAX_DYNAMIC_PAGES,
            maxAge: STORAGE_LIMITS.CACHE_MAX_AGE,
            maxTotalSize: STORAGE_LIMITS.MAX_TOTAL_SIZE,
            preserveEssential: ESSENTIAL_PAGES.map(p => p.url),
            prioritizeByAccess: true, // Keep recently accessed pages
            prioritizeBySize: true     // Remove large pages first
          }
        });
      }
    } catch (error) {
      console.error('Failed to request advanced cleanup:', error);
    }
  };

  // Emergency cleanup - more aggressive
  const performEmergencyCleanup = async () => {
    try {
      console.log('🚨 Performing emergency cleanup...');
      
      // Clear all non-essential caches immediately
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const essentialUrls = ESSENTIAL_PAGES.map(p => p.url);
        
        for (const cacheName of cacheNames) {
          if (!cacheName.includes('essential') && !cacheName.includes('static')) {
            console.log('🗑️ Emergency: Removing cache:', cacheName);
            await caches.delete(cacheName);
          } else {
            // Clean essential cache but keep core pages
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
              const url = new URL(request.url).pathname;
              if (!essentialUrls.includes(url) && url !== '/') {
                await cache.delete(request);
              }
            }
          }
        }
      }

      // Clear IndexedDB
      await cleanupIndexedDB();

      // Force re-cache of root page
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'FORCE_CACHE_ROOT',
          url: '/'
        });
      }

      // Refresh storage info
      setTimeout(() => checkStorageQuota(), 1000);

    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  };

  // Cleanup IndexedDB if it exists
  const cleanupIndexedDB = async () => {
    try {
      if ('indexedDB' in window) {
        // This is a general cleanup - you might need to adjust based on your specific IndexedDB usage
        const dbRequest = indexedDB.open('your-db-name'); // Replace with your actual DB name
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['cache-data'], 'readwrite'); // Replace with your store name
          const store = transaction.objectStore('cache-data');
          
          // Clear old entries (keep only recent ones)
          const request = store.openCursor();
          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const data = cursor.value;
              const age = Date.now() - (data.timestamp || 0);
              if (age > STORAGE_LIMITS.CACHE_MAX_AGE) {
                cursor.delete();
              }
              cursor.continue();
            }
          };
        };
      }
    } catch (error) {
      console.log('IndexedDB cleanup skipped:', error);
    }
  };

  // Setup aggressive storage monitoring
  const setupAggressiveStorageMonitoring = () => {
    let monitoringInterval;
    let emergencyMode = false;

    const monitorStorage = async () => {
      await checkStorageQuota();
      
      if (storageInfo) {
        if (storageInfo.isCritical && !emergencyMode) {
          emergencyMode = true;
          await performEmergencyCleanup();
          // Increase monitoring frequency in emergency mode
          clearInterval(monitoringInterval);
          monitoringInterval = setInterval(monitorStorage, 2 * 60 * 1000); // Every 2 minutes
        } else if (storageInfo.isWarning) {
          await requestAdvancedCacheCleanup();
        } else if (emergencyMode && !storageInfo.isCritical) {
          emergencyMode = false;
          // Return to normal monitoring frequency
          clearInterval(monitoringInterval);
          monitoringInterval = setInterval(monitorStorage, STORAGE_LIMITS.CLEANUP_INTERVAL);
        }
      }
    };

    // Initial monitoring interval
    monitoringInterval = setInterval(monitorStorage, STORAGE_LIMITS.CLEANUP_INTERVAL);

    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  };

  // Setup emergency cleanup triggers
  const setupEmergencyCleanup = () => {
    // Cleanup on page visibility change (when user leaves/returns)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned, check storage
        setTimeout(() => checkStorageQuota(), 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup before page unload
    const handleBeforeUnload = () => {
      if (storageInfo && storageInfo.isCritical) {
        // Quick cleanup before leaving
        requestAdvancedCacheCleanup();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  };

  // Ultra-smart page caching with strict limits
  useEffect(() => {
    if (!mounted) return;

    let cachedPagesCount = 0;
    let recentCacheAttempts = [];
    const MAX_CACHE_ATTEMPTS_PER_MINUTE = 3;

    const handleNavigation = async (url) => {
      try {
        // Rate limiting - prevent excessive caching
        const now = Date.now();
        recentCacheAttempts = recentCacheAttempts.filter(time => now - time < 60000); // Last minute

        if (recentCacheAttempts.length >= MAX_CACHE_ATTEMPTS_PER_MINUTE) {
          console.log('🛑 Cache rate limit reached, skipping:', url);
          return;
        }

        // Check current storage before caching
        if (storageInfo && (storageInfo.isCritical || storageInfo.usage > 40)) {
          console.log('🛑 Storage too high, skipping cache for:', url);
          return;
        }

        // Only cache if we haven't exceeded limit
        if (cachedPagesCount >= STORAGE_LIMITS.MAX_DYNAMIC_PAGES) {
          console.log('🛑 Max cached pages reached, skipping cache for:', url);
          return;
        }

        // More selective article page detection
        const isArticlePage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^/]+\/?$/.test(url);
        const isNotAsset = !/\.(js|css|png|jpg|gif|ico|svg)$/i.test(url);
        
        if (isArticlePage && isNotAsset && navigator.serviceWorker.controller) {
          recentCacheAttempts.push(now);
          
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_PAGE_ULTRA_SMART',
            url: url,
            options: {
              priority: 'low',
              maxCount: STORAGE_LIMITS.MAX_DYNAMIC_PAGES,
              maxSize: STORAGE_LIMITS.MAX_ARTICLE_SIZE,
              maxAge: STORAGE_LIMITS.CACHE_MAX_AGE,
              timeout: 15000, // 15 second timeout
              skipIfLarge: true,
              checkStorageFirst: true
            }
          });
          cachedPagesCount++;
        }
      } catch (error) {
        console.log('Failed to cache page on navigation:', error);
      }
    };

    // Enhanced navigation detection
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 2000); // Longer delay for stability
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 2000);
      return result;
    };

    window.addEventListener('popstate', () => {
      const newUrl = window.location.pathname;
      setTimeout(() => handleNavigation(newUrl), 2000);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [mounted, storageInfo]);

  // Enhanced global cache manager
  useEffect(() => {
    if (mounted) {
      window.swCacheManager = {
        // Basic operations
        cleanup: requestAdvancedCacheCleanup,
        emergencyCleanup: performEmergencyCleanup,
        checkQuota: checkStorageQuota,
        
        // Information
        getStorageInfo: () => storageInfo,
        getCacheStats: () => cacheStats,
        
        // Advanced operations
        clearAllDynamicCache: async () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CLEAR_ALL_DYNAMIC_CACHE'
            });
          }
        },
        
        // Force recache essentials
        recacheEssentials: async () => {
          await initializeEssentialCacheWithLimits();
        },
        
        // Get current limits
        getLimits: () => STORAGE_LIMITS
      };

      // Expose storage info to console for debugging
      console.log('🔧 SW Cache Manager available at window.swCacheManager');
      console.log('📋 Current limits:', STORAGE_LIMITS);
    }
  }, [mounted, storageInfo, cacheStats]);

  // Don't render anything during SSR
  if (!mounted) return null;



  return null;
}