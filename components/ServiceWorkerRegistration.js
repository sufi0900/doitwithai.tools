"use client";
import { useEffect, useState } from 'react';

// New React component for the update notification
const UpdateNotification = ({ onReload, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#2563eb',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        maxWidth: '300px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: 'slideIn 0.5s ease-out forwards'
      }}
    >
      <div style={{ fontWeight: '600', marginBottom: '8px' }}>🚀 Update Available</div>
      <div style={{ fontSize: '14px', marginBottom: '12px', opacity: '0.9' }}>
        A new version is ready. Refresh to get the latest features.
      </div>
      <div>
        <button
          onClick={onReload}
          style={{
            background: 'white',
            color: '#2563eb',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          Update Now
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [showUpdate, setShowUpdate] = useState(false); // New state to control notification visibility

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
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 2000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1500);
            });
          }
        });

        const registration = await navigator.serviceWorker.register('/sw.js?v=3', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // The new worker is installed and ready to take over
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
                setShowUpdate(true); // Set state to display the pop-up
              }
            });
          }
        });

        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('SW Message:', event.data);
          
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated for:', event.data.url);
          } else if (event.data.type === 'STORAGE_FULL') {
            console.warn('Storage limit reached, cleaning cache...');
            handleStorageFull();
          }
        });

        await initializeEssentialCache(registration);
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  const handleStorageFull = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAN_OLD_CACHE'
      });
    }
  };

  const initializeEssentialCache = async (registration) => {
    if (!registration.active) return;

    try {
      const essentialPages = [
        '/',
        '/about',
        '/contact'
      ];

      navigator.serviceWorker.controller?.postMessage({
        type: 'CACHE_ESSENTIAL_PAGES',
        pages: essentialPages
      });

      await cacheOfflinePage();
      console.log('✅ Essential cache initialized');
    } catch (error) {
      console.error('Failed to initialize essential cache:', error);
    }
  };

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

  useEffect(() => {
    if (!mounted) return;

    let cachedPagesCount = 0;
    const MAX_DYNAMIC_PAGES = 10;

    const handleNavigation = async (newPath) => {
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
            'X-Cache-Priority': 'low'
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

    let currentPath = window.location.pathname;
    const checkNavigation = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        currentPath = newPath;
        setTimeout(() => handleNavigation(newPath), 1000);
      }
    };

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

  useEffect(() => {
    if (mounted) {
      window.updateSWCache = (url, data) => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SELECTIVE_CACHE_UPDATE',
            url,
            data
          });
        }
      };

      window.cleanSWCache = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAN_OLD_CACHE'
          });
        }
      };

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

  useEffect(() => {
    if (!mounted) return;

    const checkStorageUsage = async () => {
      try {
        if (navigator.storage?.estimate) {
          const estimate = await navigator.storage.estimate();
          const usageMB = (estimate.usage / 1024 / 1024).toFixed(2);
          const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
          
          console.log(`Storage usage: ${usageMB}MB / ${quotaMB}MB`);
          
          if (estimate.usage > 100 * 1024 * 1024) {
            console.warn('High storage usage detected, consider cleaning cache');
            
            if (estimate.usage > 150 * 1024 * 1024) {
              handleStorageFull();
            }
          }
        }
      } catch (error) {
        console.error('Failed to check storage:', error);
      }
    };

    const storageInterval = setInterval(checkStorageUsage, 5 * 60 * 1000);
    checkStorageUsage();

    return () => clearInterval(storageInterval);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Conditionally render the pop-up component based on state */}
      {showUpdate && (
        <UpdateNotification
          onReload={() => window.location.reload()}
          onClose={() => setShowUpdate(false)}
        />
      )}
    </>
  );
}