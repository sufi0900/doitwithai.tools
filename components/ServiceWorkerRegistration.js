"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const registerSW = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
      }

      try {
        // Wait longer for React to fully hydrate
        await new Promise(resolve => {
          const checkHydration = () => {
            // Check if React has finished hydrating
            if (document.readyState === 'complete' && 
                document.querySelector('[data-reactroot]') || 
                document.querySelector('#__next')) {
              setTimeout(resolve, 3000); // Increase delay
            } else {
              setTimeout(checkHydration, 100);
            }
          };
          checkHydration();
        });

        // Clear any existing service workers that might cause conflicts
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.scope !== window.location.origin + '/') {
            await registration.unregister();
          }
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW: Controller changed');
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [mounted]);

  if (!mounted) return null;
  return null;
}