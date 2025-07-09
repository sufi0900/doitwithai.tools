// components/ServiceWorkerRegistration.js
"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Add a small delay to ensure page is loaded
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          
          console.log('✅ Service Worker registered successfully');
          
          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is ready');
          
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
          
          // Fallback: Try to register with different options
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered with fallback');
          } catch (fallbackError) {
            console.error('❌ Fallback registration also failed:', fallbackError);
          }
        }
      };

      // Register when page is fully loaded
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}