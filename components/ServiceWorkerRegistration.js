// components/MinimalServiceWorkerRegistration.js
"use client";

import { useEffect, useState } from 'react';

export default function MinimalServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');
  const [storageInfo, setStorageInfo] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

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
        // Unregister any existing service workers from next-pwa
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of existingRegistrations) {
          console.log('Unregistering existing SW:', registration.scope);
          await registration.unregister();
        }

        // Wait for page to be fully loaded
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve);
          });
        }

        // Register our minimal service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Minimal Service Worker registered:', registration);
        setSwStatus('registered');

        // Setup event listeners
        setupSWEventListeners(registration);

        // Get initial cache and storage info
        await updateCacheInfo();
        await updateStorageInfo();

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        setSwStatus('failed');
      }
    };

    registerSW();
  }, [mounted]);

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
            // Auto-update for minimal SW since it's small
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      }
    });

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('SW Message:', event.data);
      
      switch (event.data.type) {
        case 'STORAGE_INFO':
          setStorageInfo({
            usage: event.data.usage,
            quota: event.data.quota,
            percentage: event.data.quota > 0 ? Math.round((event.data.usage / event.data.quota) * 100) : 0
          });
          break;
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: Controller changed');
      window.location.reload();
    });
  };

  const updateCacheInfo = async () => {
    try {
      if (!navigator.serviceWorker.controller) return;
      
      const messageChannel = new MessageChannel();
      const response = await new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_INFO' }, 
          [messageChannel.port2]
        );
      });
      
      setCacheInfo(response);
    } catch (error) {
      console.error('Failed to get cache info:', error);
    }
  };

  const updateStorageInfo = async () => {
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
      }
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  const clearRecentCache = async () => {
    try {
      if (!navigator.serviceWorker.controller) return;
      
      const messageChannel = new MessageChannel();
      await new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_RECENT_CACHE' }, 
          [messageChannel.port2]
        );
      });
      
      await updateCacheInfo();
      await updateStorageInfo();
      console.log('Recent cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear recent cache:', error);
    }
  };

  // Expose cache management functions
  useEffect(() => {
    if (mounted) {
      window.swCacheManager = {
        clearRecent: clearRecentCache,
        getCacheInfo: updateCacheInfo,
        getStorageInfo: updateStorageInfo,
        storageInfo,
        cacheInfo
      };
    }
  }, [mounted, storageInfo, cacheInfo]);

  // Don't render anything during SSR
  if (!mounted) return null;

 

  return null;
}