// ServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ type: 'desktop', memory: null });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Device detection and memory check
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    // Get device memory if available (Chrome only)
    const deviceMemory = navigator.deviceMemory || null;
    
    // Check screen size as additional mobile indicator
    const smallScreen = window.innerWidth <= 768;
    
    const deviceType = isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop');
    
    return {
      type: deviceType,
      memory: deviceMemory,
      isMobile: isMobile || smallScreen,
      isLowMemory: deviceMemory && deviceMemory <= 4,
    };
  };

  // Check if service worker should be enabled for this device
  const shouldEnableServiceWorker = (device) => {
    // Completely disable for mobile devices
    if (device.isMobile) {
      console.log('📱 Mobile device detected - Service Worker disabled');
      return false;
    }
    
    // Disable for low memory devices
    if (device.isLowMemory) {
      console.log('⚠️ Low memory device detected - Service Worker disabled');
      return false;
    }
    
    // Enable for desktop/tablet with sufficient memory
    return true;
  };

  // Get storage strategy based on device
  const getStorageStrategy = (device) => {
    if (device.isMobile) {
      return {
        enabled: false,
        maxStorage: 0,
        maxPages: 0,
        cacheStrategy: 'none'
      };
    }
    
    if (device.type === 'tablet') {
      return {
        enabled: true,
        maxStorage: 25 * 1024 * 1024, // 25MB
        maxPages: 3,
        cacheStrategy: 'minimal'
      };
    }
    
    // Desktop
    return {
      enabled: true,
      maxStorage: 50 * 1024 * 1024, // 50MB
      maxPages: 5,
      cacheStrategy: 'limited'
    };
  };

  useEffect(() => {
    if (!mounted) return;

    const device = detectDevice();
    setDeviceInfo(device);

    const registerSW = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        setSwStatus('unsupported');
        return;
      }

      // Check if SW should be enabled for this device
      if (!shouldEnableServiceWorker(device)) {
        setSwStatus('disabled-mobile');
        // Unregister any existing service worker
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('📱 Service Worker disabled for mobile device');
        return;
      }

      try {
        // Get storage strategy for this device
        const strategy = getStorageStrategy(device);
        
        // Wait for React hydration to complete
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 500);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 300);
            });
          }
        });

        // Check storage quota first
        await checkStorageQuota(strategy);

        // Check for existing service worker and clean up if needed
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('Existing SW found, cleaning and updating...');
          await cleanupExistingCache();
          await existingRegistration.update();
        }

        // Register service worker with device-specific configuration
        const registration = await navigator.serviceWorker.register(
          `/sw.js?device=${device.type}&strategy=${strategy.cacheStrategy}&v=4`, 
          {
            scope: '/',
            updateViaCache: 'none'
          }
        );

        console.log('✅ Service Worker registered for', device.type, ':', registration);
        setSwStatus('registered');

        // Send device strategy to service worker
        navigator.serviceWorker.controller?.postMessage({
          type: 'SET_DEVICE_STRATEGY',
          strategy: strategy,
          device: device
        });

        // Setup SW event listeners
        setupSWEventListeners(registration);

        // Initialize essential cache only
        await initializeEssentialCache(strategy);

        // Setup storage monitoring
        setupStorageMonitoring(strategy);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Clean up existing cache before new registration
  const cleanupExistingCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    } catch (error) {
      console.error('Failed to cleanup existing cache:', error);
    }
  };

  // Check storage quota with device-specific limits
  const checkStorageQuota = async (strategy) => {
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
          percentage: quota > 0 ? Math.round((usage / quota) * 100) : 0,
          maxAllowed: Math.round(strategy.maxStorage / 1024 / 1024)
        });

        console.log(`📊 Storage Usage: ${usageInMB}MB / ${quotaInMB}MB (${Math.round((usage / quota) * 100)}%)`);
        console.log(`📱 Device limit: ${Math.round(strategy.maxStorage / 1024 / 1024)}MB`);

        // If usage exceeds device-specific limit, clean up
        if (usage > strategy.maxStorage) {
          console.warn('⚠️ Exceeded device storage limit, initiating cleanup');
          await requestCacheCleanup(strategy);
        }

        // If usage is above 70% of our limit, clean up
        if (usage > (strategy.maxStorage * 0.7)) {
          await requestCacheCleanup(strategy);
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
            
            // Auto-reload for critical updates, but ask for non-critical
            const shouldAutoReload = deviceInfo.type === 'desktop';
            if (shouldAutoReload) {
              setTimeout(() => window.location.reload(), 2000);
            } else if (window.confirm('New version available! Reload to update?')) {
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
          checkStorageQuota(getStorageStrategy(deviceInfo));
          break;
        case 'CACHE_CLEANED':
          console.log('Cache cleaned:', event.data.message);
          checkStorageQuota(getStorageStrategy(deviceInfo));
          break;
        case 'STORAGE_EXCEEDED':
          console.error('Storage limit exceeded:', event.data.message);
          requestCacheCleanup(getStorageStrategy(deviceInfo));
          break;
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      // Only reload if not mobile to avoid disrupting mobile experience
      if (!deviceInfo.isMobile) {
        window.location.reload();
      }
    });
  };

  // Initialize only essential cache (very limited for non-desktop)
  const initializeEssentialCache = async (strategy) => {
    if (!strategy.enabled) return;

    try {
      const essentialPages = [
        { url: '/', priority: 'critical' },
        { url: '/offline.html', priority: 'critical' }
      ];

      // Add about page only for desktop
      if (deviceInfo.type === 'desktop') {
        essentialPages.push({ url: '/about', priority: 'medium' });
      }

      // Send message to SW to cache essential pages only
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ESSENTIAL_PAGES',
          pages: essentialPages,
          strategy: strategy
        });
      }

      console.log(`✅ Essential pages cache initialized for ${deviceInfo.type}`);
    } catch (error) {
      console.error('Failed to initialize essential cache:', error);
    }
  };

  // Request cache cleanup with device-specific limits
  const requestCacheCleanup = async (strategy) => {
    if (!strategy.enabled) return;

    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEANUP_CACHE',
          options: {
            maxDynamicPages: strategy.maxPages,
            maxAge: deviceInfo.type === 'mobile' ? 1 * 60 * 60 * 1000 : 3 * 60 * 60 * 1000, // 1h mobile, 3h others
            maxTotalSize: strategy.maxStorage,
            aggressive: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to request cache cleanup:', error);
    }
  };

  // Setup storage monitoring with device-aware intervals
  const setupStorageMonitoring = (strategy) => {
    if (!strategy.enabled) return;

    const monitorStorage = async () => {
      await checkStorageQuota(strategy);
      
      // If storage is getting full, clean up
      if (storageInfo && storageInfo.usage > (strategy.maxStorage * 0.6) / 1024 / 1024) {
        await requestCacheCleanup(strategy);
      }
    };

    // More frequent monitoring for tablets/mobile, less for desktop
    const interval = deviceInfo.type === 'desktop' ? 10 * 60 * 1000 : 2 * 60 * 1000;
    const monitorInterval = setInterval(monitorStorage, interval);

    return () => clearInterval(monitorInterval);
  };

  // Smart page caching on navigation (very limited)
  useEffect(() => {
    if (!mounted) return;

    const strategy = getStorageStrategy(deviceInfo);
    if (!strategy.enabled) return;

    let cachedPagesCount = 0;

    const handleNavigation = async (url) => {
      try {
        // Only cache if we haven't exceeded device-specific limit
        if (cachedPagesCount >= strategy.maxPages) {
          console.log(`Max cached pages (${strategy.maxPages}) reached for ${deviceInfo.type}, skipping cache for:`, url);
          return;
        }

        // Only cache article pages for desktop, nothing for mobile
        const isArticlePage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^/]+$/.test(url);
        
        if (isArticlePage && deviceInfo.type === 'desktop' && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_PAGE_SMART',
            url: url,
            priority: 'low',
            maxCount: strategy.maxPages,
            device: deviceInfo.type
          });
          cachedPagesCount++;
        }
      } catch (error) {
        console.log('Failed to cache page on navigation:', error);
      }
    };

    // Only setup navigation caching for desktop
    if (deviceInfo.type !== 'desktop') return;

    // Listen for client-side navigation (desktop only)
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
  }, [mounted, deviceInfo]);

  // Expose cache management functions globally
  useEffect(() => {
    if (mounted) {
      window.swCacheManager = {
        cleanup: () => requestCacheCleanup(getStorageStrategy(deviceInfo)),
        checkQuota: () => checkStorageQuota(getStorageStrategy(deviceInfo)),
        getStorageInfo: () => storageInfo,
        getDeviceInfo: () => deviceInfo,
        forceCleanup: async () => {
          // Emergency cleanup - delete all caches
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('🧹 Emergency cleanup completed');
        }
      };
    }
  }, [mounted, storageInfo, deviceInfo]);

  // Don't render anything during SSR
  if (!mounted) return null;

  // Show debug info only in development
  if (process.env.NODE_ENV === 'development' && storageInfo) {
    console.log('📊 SW Debug Info:', {
      device: deviceInfo,
      storage: storageInfo,
      status: swStatus,
      strategy: getStorageStrategy(deviceInfo)
    });
  }

  return null;
}