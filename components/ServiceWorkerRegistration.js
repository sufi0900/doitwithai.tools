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
        // Initialize IndexedDB for offline page tracking
        await initOfflinePagesDB();

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

  // Initialize IndexedDB for offline page tracking
  const initOfflinePagesDB = () => {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        resolve(false);
        return;
      }

      const request = indexedDB.open('offlinePages', 1);
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB');
        resolve(false);
      };
      
      request.onsuccess = () => {
        console.log('IndexedDB initialized for offline pages');
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pages')) {
          const store = db.createObjectStore('pages', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  };

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

  // Cache essential pages + homepage + current page for offline access
  const cacheEssentialPages = async () => {
    try {
      const currentPath = window.location.pathname;
      
      // Essential pages that MUST be available offline
      const essentialPages = [
        { url: '/', priority: 'critical' }, // Homepage is critical
        { url: '/offline.html', priority: 'critical' }, // Offline fallback
        { url: currentPath, priority: 'critical' }, // Current page for offline access
        { url: '/about', priority: 'high' },
        { url: '/contact', priority: 'medium' }
      ];

      // Remove duplicates
      const uniquePages = essentialPages.filter((page, index, self) => 
        index === self.findIndex(p => p.url === page.url)
      );

      const prefetchPage = async (pageInfo) => {
        const { url, priority } = pageInfo;
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': priority === 'critical' ? 'no-cache' : 'max-age=3600',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin',
              'X-Offline-Cache': 'true'
            },
            mode: 'same-origin',
            credentials: 'same-origin',
            cache: priority === 'critical' ? 'reload' : 'force-cache'
          });

          if (response.ok) {
            await response.text();
            console.log(`✅ ${priority} page cached for offline: ${url}`);
            
            // Send message to service worker to ensure it's in offline cache
            if (navigator.serviceWorker.controller && priority === 'critical') {
              navigator.serviceWorker.controller.postMessage({
                type: 'ENSURE_OFFLINE_CACHE',
                url: url,
                priority: priority
              });
            }
            
            return { success: true, url };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to cache ${priority} page ${url}:`, error);
          return { success: false, url, error };
        }
      };

      const prefetchPromises = uniquePages.map(prefetchPage);
      await Promise.allSettled(prefetchPromises);
      
      // Store last visited page info for offline access
      if (typeof window !== 'undefined') {
        const currentPageInfo = {
          url: currentPath,
          timestamp: Date.now(),
          title: document.title || 'Page',
          isStatic: ['/about', '/faq', '/contact', '/privacy', '/terms'].includes(currentPath)
        };
        
        localStorage.setItem('lastVisitedPage', JSON.stringify(currentPageInfo));
        console.log('✅ Last visited page stored for offline access:', currentPath);
      }
      
      console.log('✅ Essential pages cached (including homepage and current page)');
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


  return null;
}

