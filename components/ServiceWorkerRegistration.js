"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Wait for page to fully load
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', resolve);
            }
          });

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none' // Important for Vercel
          });

          console.log('✅ Service Worker registered:', registration);

          // Force activation
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('✅ New Service Worker activated');
                  window.location.reload();
                }
              });
            }
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  return null;
}