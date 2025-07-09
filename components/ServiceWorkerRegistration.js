// Update ServiceWorkerRegistration component
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
        // Critical: Wait for React hydration to complete
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            // Wait for hydration and any client-side rendering
            setTimeout(resolve, 3000);
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 3000);
            });
          }
        });

        // Check if already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('✅ Service Worker already registered');
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('✅ Service Worker registered:', registration);

        // Handle controller change (when SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('✅ Service Worker controller changed');
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