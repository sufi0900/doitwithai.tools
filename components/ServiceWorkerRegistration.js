"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const pathname = usePathname();

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
        // Wait for page to be fully loaded
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 1000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1000);
            });
          }
        });

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
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
          window.location.reload();
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

  // Cache current page when pathname changes
  useEffect(() => {
    if (!mounted || !pathname) return;

    const cacheCurrentPage = async () => {
      if (navigator.serviceWorker.controller) {
        // Notify SW to cache current page
        navigator.serviceWorker.controller.postMessage({
          type: 'PRECACHE_PAGE',
          path: pathname,
          url: window.location.origin + pathname
        });
      }
    };

    // Cache with delay to ensure page is loaded
    const timer = setTimeout(cacheCurrentPage, 2000);
    return () => clearTimeout(timer);
  }, [mounted, pathname]);

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