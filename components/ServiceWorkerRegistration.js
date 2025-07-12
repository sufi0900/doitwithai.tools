// /components/ServiceWorkerRegistration.js
"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // This effect runs only on the client, after hydration
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      const registerSW = async () => {
        try {
          // The 'next-pwa' library will generate sw.js and workbox libraries
          const { Workbox } = await import('workbox-window');

          const wb = new Workbox('/sw.js');

          // Add an event listener to detect when a new version is available.
          wb.addEventListener('waiting', (event) => {
            console.log('A new service worker is waiting to be activated.');
            // Optionally, prompt the user to reload the page
            // if (window.confirm('A new version is available. Reload?')) {
            //   wb.messageSW({ type: 'SKIP_WAITING' });
            // }
          });

          // Add an event listener to detect when the new version has taken control.
          wb.addEventListener('controlling', (event) => {
            console.log('The new service worker is now in control.');
            window.location.reload();
          });
          
          await wb.register();
          console.log('✅ Service Worker registered');

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      };

      // Register the service worker after the window has loaded
      // to avoid blocking initial page render.
      window.addEventListener('load', registerSW);
    }
  }, []);

  return null; // This component doesn't render anything
}