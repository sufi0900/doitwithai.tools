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
        // Wait for page to be fully interactive
        await new Promise(resolve => {
          if (document.readyState === 'complete') {

setTimeout(resolve, 2000); // Increased delay for better stability
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1000);
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
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);
        setSwStatus('registered');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                setSwStatus('update-available');
                
                // Optionally notify user about update
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

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          window.location.reload();
        });

        // Pre-cache important pages
        await preCachePages(registration);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);


// Prefetch current page content
const prefetchCurrentPage = async () => {
  try {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Prefetch current page
    await fetch(currentPath, { mode: 'same-origin' });
    
    // Prefetch RSC payload for current page
    if (currentPath !== '/') {
      await fetch(`${currentPath}?_rsc=1`, { mode: 'same-origin' });
    }
    
    console.log('Pre-cached current page:', currentPath);
  } catch (error) {
    console.log('Failed to pre-cache current page:', error);
  }
};


  // Pre-cache important pages
  const preCachePages = async (registration) => {
    if (registration.active) {
      try {
        // Get current page path
        const currentPath = window.location.pathname;
        
        // List of important pages to pre-cache
        const importantPages = [
          '/',
          '/ai-tools',
          '/ai-seo',
          '/ai-code',
          '/ai-learn-earn',
          '/free-ai-resources',
          '/ai-news'
        ];

        // Add current page if it's not in the list
        if (!importantPages.includes(currentPath)) {
          importantPages.push(currentPath);
        }

        // Pre-fetch pages in background
        for (const page of importantPages) {
          try {
            await fetch(page, { mode: 'no-cors' });
            console.log('Pre-cached page:', page);
          } catch (error) {
            console.log('Failed to pre-cache page:', page);
          }
        }
      } catch (error) {
        console.error('Pre-caching failed:', error);
      }
    }
  };

  // Helper function to update cache from client
  const updateCache = (url, data) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_UPDATE',
        url,
        data
      });
    }
  };

  // Expose updateCache function globally for other components
  useEffect(() => {
    if (mounted) {
      window.updateSWCache = updateCache;
    }
  }, [mounted]);

  // Don't render anything during SSR
  if (!mounted) return null;

  // Optional: Show SW status indicator in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: getStatusColor(swStatus),
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        SW: {swStatus}
      </div>
    );
  }

  return null;
}

function getStatusColor(status) {
  switch (status) {
    case 'registered': return '#4CAF50';
    case 'updated': return '#2196F3';
    case 'update-available': return '#FF9800';
    case 'failed': return '#f44336';
    case 'unsupported': return '#9E9E9E';
    default: return '#9E9E9E';
  }
}