"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // First check if sw.js exists
          const swResponse = await fetch('/sw.js', { method: 'HEAD' });
          if (!swResponse.ok) {
            console.log('❌ sw.js not found, skipping registration');
            return;
          }

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('✅ Service Worker registered:', registration);

          // Wait for it to be active
          if (registration.installing) {
            registration.installing.addEventListener('statechange', function() {
              if (this.state === 'activated') {
                console.log('✅ Service Worker activated');
              }
            });
          }

          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          if (registration.active) {
            console.log('✅ Service Worker is active');
          }

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      };

      // Register immediately
      registerSW();
    }
  }, []);

  return null;
}