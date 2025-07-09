// components/ServiceWorkerRegistration.js
"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerSW = async () => {
      // Check if Service Workers are supported and if we're on the client side
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service Workers not supported or not on client side. Skipping registration.');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // 'updateViaCache: none' is not a standard option for navigator.serviceWorker.register.
          // It's likely a misunderstanding of how Cache-Control headers work.
          // We rely on next-pwa/Workbox to handle caching and updates.
          // Removing this to avoid potential conflicts or misbehavior.
        });

        console.log('✅ Service Worker registered:', registration);

        // This ensures the new worker takes control immediately (important for updates)
        if (registration.installing) {
          registration.installing.postMessage({ type: 'SKIP_WAITING' });
        } else if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // --- IMPORTANT: Removed the problematic 'updatefound' listener that caused reloads ---
        // Service Worker updates will now naturally apply on the *next* page load
        // after the new Service Worker activates in the background.
        // This prevents hydration errors.

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    // Ensure the script runs after the DOM is fully loaded to avoid conflicts
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    // Clean up the event listener if the component unmounts
    return () => {
      window.removeEventListener('load', registerSW);
    };
  }, []); // Empty dependency array, ensures it runs only once on client mount

  return null; // This component doesn't render anything
}
