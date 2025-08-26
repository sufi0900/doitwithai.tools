// ServiceWorkerRegistration.js
"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

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

        // Listen for updates - NO AUTOMATIC RELOAD
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
                setShowUpdatePrompt(true); // Show user-controlled update prompt
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
          if (event.data.type === 'STORAGE_WARNING') {
            console.warn('Storage warning:', event.data.message);
            // Could show user notification about storage cleanup
          }
        });

        // Handle controller change - REMOVED AUTO RELOAD
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          // Don't automatically reload - let user decide
        });

        // Initialize with essential caching only
        await initializeEssentialCaching(registration);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Initialize only essential caching
  const initializeEssentialCaching = async (registration) => {
    try {
      // Always ensure root page is cached first
      await ensureRootPageCached();
      
      // Cache current page
      await cacheCurrentPage();
      
      // Selectively cache static pages (not all at once)
      await cacheStaticPagesSelectively();
      
      // Send storage management message to SW
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'INIT_STORAGE_MANAGEMENT',
          config: {
            maxDynamicPages: 10,
            maxTotalStorage: 100 * 1024 * 1024, // 100MB limit
            staticPages: ['/about', '/faq', '/contact', '/privacy', '/terms']
          }
        });
      }

    } catch (error) {
      console.error('Failed to initialize essential caching:', error);
    }
  };

  // GUARANTEED root page caching
  const ensureRootPageCached = async () => {
    try {
      const rootResponse = await fetch('/', {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'X-Purpose': 'root-page-cache'
        }
      });

      if (rootResponse.ok) {
        await rootResponse.text(); // Consume response to ensure caching
        console.log('✅ Root page cached successfully');
        
        // Also cache root page data
        try {
          await fetch('/_next/data/build/index.json', {
            mode: 'same-origin',
            credentials: 'same-origin'
          });
        } catch (e) {
          // Ignore data fetch errors
        }
      }
    } catch (error) {
      console.error('Failed to cache root page:', error);
    }
  };

  // Cache current page without aggressive prefetching
  const cacheCurrentPage = async () => {
    try {
      const currentPath = window.location.pathname;
      
      // Don't cache if it's already the root page
      if (currentPath === '/') return;

      await fetch(currentPath, {
        mode: 'same-origin',
        credentials: 'same-origin',
        headers: {
          'X-Purpose': 'current-page-cache'
        }
      });

      console.log('✅ Current page cached:', currentPath);
    } catch (error) {
      console.log('Failed to cache current page:', error);
    }
  };

  // Cache static pages one by one, not all at once
  const cacheStaticPagesSelectively = async () => {
    const staticPages = ['/about', '/faq', '/contact'];
    
    // Only cache 2-3 most important static pages initially
    for (const page of staticPages.slice(0, 2)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Spread out requests
        
        const response = await fetch(page, {
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: {
            'X-Purpose': 'static-page-selective-cache'
          }
        });

        if (response.ok) {
          await response.text();
          console.log(`✅ Selectively cached static page: ${page}`);
        }
      } catch (error) {
        console.warn(`Failed to cache static page ${page}:`, error);
        break; // Stop on first failure to prevent cascade issues
      }
    }
  };

  // Smart navigation caching with limits
  const handleSmartNavigation = async () => {
    if (typeof window === 'undefined') return;

    let currentPath = window.location.pathname;
    const cacheQueue = new Set(); // Prevent duplicate caching

    const smartCacheOnNavigation = async (newPath) => {
      if (newPath === currentPath || cacheQueue.has(newPath)) return;
      
      // Only cache if it looks like a content page
      const isDynamicContent = /^\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\//.test(newPath);
      const isStaticPage = ['/about', '/faq', '/contact', '/privacy', '/terms'].includes(newPath);
      
      if (!isDynamicContent && !isStaticPage) return;

      cacheQueue.add(newPath);

      try {
        // Send message to SW to handle smart caching
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SMART_CACHE_PAGE',
            path: newPath,
            isDynamic: isDynamicContent,
            timestamp: Date.now()
          });
        }

        currentPath = newPath;
      } catch (error) {
        console.log('Smart cache failed for:', newPath, error);
      } finally {
        // Remove from queue after delay
        setTimeout(() => cacheQueue.delete(newPath), 5000);
      }
    };

    // Override navigation methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      const newPath = window.location.pathname;
      setTimeout(() => smartCacheOnNavigation(newPath), 1000);
      return result;
    };

    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      const newPath = window.location.pathname;
      setTimeout(() => smartCacheOnNavigation(newPath), 1000);
      return result;
    };

    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname;
      setTimeout(() => smartCacheOnNavigation(newPath), 1000);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  };

  // Setup smart navigation on mount
  useEffect(() => {
    if (!mounted) return;
    const cleanup = handleSmartNavigation();
    return cleanup;
  }, [mounted]);

  // Handle update prompt
  const handleUpdateAccept = () => {
    setShowUpdatePrompt(false);
    window.location.reload();
  };

  const handleUpdateDecline = () => {
    setShowUpdatePrompt(false);
    // User can continue using old version
  };

  // Periodic storage cleanup
  useEffect(() => {
    if (!mounted) return;

    const cleanupInterval = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEANUP_STORAGE'
        });
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(cleanupInterval);
  }, [mounted]);

  // Don't render anything during SSR
  if (!mounted) return null;

  return (
    <>
      {/* Update Prompt Modal */}
      {showUpdatePrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Update Available</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              A new version of the site is available. Would you like to reload to get the latest features?
            </p>
            <div>
              <button 
                onClick={handleUpdateAccept}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              >
                Update Now
              </button>
              <button 
                onClick={handleUpdateDecline}
                style={{
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

   
    </>
  );
}
