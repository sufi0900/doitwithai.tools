"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        // Wait for hydration to complete
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 1000); // Add delay after page load
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 1000);
            });
          }
        });

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('✅ New Service Worker activated');
                // Don't auto-reload, let user decide
              }
            });
          }
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [isClient]);

  return null;
}