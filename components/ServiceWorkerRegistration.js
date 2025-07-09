// components/ServiceWorkerRegistration.js
"use client";
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Just listen for SW updates, don't register manually
    const handleSWUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('✅ Service Worker updated');
        });

        // Check if SW is already active
        navigator.serviceWorker.ready.then((registration) => {
          console.log('✅ Service Worker ready:', registration);
        });
      }
    };

    // Delay to avoid hydration conflicts
    setTimeout(handleSWUpdate, 2000);
  }, [mounted]);

  if (!mounted) return null;
  return null;
}