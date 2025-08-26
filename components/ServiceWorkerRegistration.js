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
            setTimeout(resolve, 2000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1500);
            });
          }
        });

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Handle updates with user prompt (no forced reload)
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
                
                // Show user-friendly update notification
                showUpdateNotification();
              }
            });
          }
        });

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('SW Message:', event.data);
          
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated for:', event.data.url);
          } else if (event.data.type === 'STORAGE_FULL') {
            console.warn('Storage limit reached, cleaning cache...');
            handleStorageFull();
          }
        });

        // Initialize essential caching only
        await initializeEssentialCache(registration);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Show user-friendly update notification
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">🚀 Update Available</div>
        <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
          A new version is ready. Refresh to get the latest features.
        </div>
        <div>
          <button onclick="location.reload()" style="
            background: white;
            color: #2563eb;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 8px;
          ">Update Now</button>
          <button onclick="document.getElementById('sw-update-notification').remove()" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      const elem = document.getElementById('sw-update-notification');
      if (elem) elem.remove();
    }, 10000);
  };

  // Handle storage full scenario
  const handleStorageFull = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAN_OLD_CACHE'
      });
    }
  };

  // Initialize only essential caching
  const initializeEssentialCache = async (registration) => {
    if (!registration.active) return;

    try {
      // Cache root page and critical static pages only
      const essentialPages = [
        '/', // Always cache root
        '/about',
        '/contact'
      ];

      // Send message to SW to cache essential pages
      navigator.serviceWorker.controller?.postMessage({
        type: 'CACHE_ESSENTIAL_PAGES',
        pages: essentialPages
      });

      // Ensure offline page is cached
      await cacheOfflinePage();

      console.log('✅ Essential cache initialized');
    } catch (error) {
      console.error('Failed to initialize essential cache:', error);
    }
  };

  // Cache offline page
  const cacheOfflinePage = async () => {
    try {
      await fetch('/offline.html', {
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      console.log('✅ Offline page cached');
    } catch (error) {
      console.log('Failed to cache offline page:', error);
    }
  };

  // Smart page caching on navigation (limited)
  useEffect(() => {
    if (!mounted) return;

    let cachedPagesCount = 0;
    const MAX_DYNAMIC_PAGES = 10; // Limit dynamic page caching

    const handleNavigation = async (newPath) => {
      // Skip if already cached or limit reached
      if (cachedPagesCount >= MAX_DYNAMIC_PAGES) {
        console.log('Cache limit reached, skipping:', newPath);
        return;
      }

      try {
        const response = await fetch(newPath, {
          method: 'GET',
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: {
            'X-Cache-Priority': 'low' // Indicate low priority caching
          }
        });

        if (response.ok) {
          cachedPagesCount++;
          console.log(`✅ Cached page (${cachedPagesCount}/${MAX_DYNAMIC_PAGES}):`, newPath);
        }
      } catch (error) {
        console.log('Failed to cache page:', newPath, error);
      }
    };

    // Monitor navigation
    let currentPath = window.location.pathname;

    const checkNavigation = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        currentPath = newPath;
        setTimeout(() => handleNavigation(newPath), 1000);
      }
    };

    // Listen for navigation changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(checkNavigation, 500);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      setTimeout(checkNavigation, 500);
      return result;
    };

    window.addEventListener('popstate', checkNavigation);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', checkNavigation);
    };
  }, [mounted]);

  // Expose cache management functions
  useEffect(() => {
    if (mounted) {
      // Controlled cache update function
      window.updateSWCache = (url, data) => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SELECTIVE_CACHE_UPDATE',
            url,
            data
          });
        }
      };

      // Cache cleanup function
      window.cleanSWCache = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAN_OLD_CACHE'
          });
        }
      };

      // Get cache status
      window.getCacheStatus = async () => {
        const estimate = await navigator.storage?.estimate?.();
        return {
          usage: estimate?.usage || 0,
          quota: estimate?.quota || 0,
          usageInMB: ((estimate?.usage || 0) / 1024 / 1024).toFixed(2)
        };
      };
    }
  }, [mounted]);

  // Monitor storage usage
  useEffect(() => {
    if (!mounted) return;

    const checkStorageUsage = async () => {
      try {
        if (navigator.storage?.estimate) {
          const estimate = await navigator.storage.estimate();
          const usageMB = (estimate.usage / 1024 / 1024).toFixed(2);
          const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
          
          console.log(`Storage usage: ${usageMB}MB / ${quotaMB}MB`);
          
          // Warn if usage exceeds 100MB
          if (estimate.usage > 100 * 1024 * 1024) {
            console.warn('High storage usage detected, consider cleaning cache');
            
            // Auto-clean if over 150MB
            if (estimate.usage > 150 * 1024 * 1024) {
              handleStorageFull();
            }
          }
        }
      } catch (error) {
        console.error('Failed to check storage:', error);
      }
    };

    // Check storage every 5 minutes
    const storageInterval = setInterval(checkStorageUsage, 5 * 60 * 1000);
    checkStorageUsage(); // Check immediately

    return () => clearInterval(storageInterval);
  }, [mounted]);

  // Don't render anything during SSR
  if (!mounted) return null;

  // Optional: Show SW status indicator in development


  return null;
}
