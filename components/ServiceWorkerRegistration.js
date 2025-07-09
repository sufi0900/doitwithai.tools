"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('✅ Service Worker registered:', registration);
          
          // Check if it's active
          if (registration.active) {
            console.log('✅ Service Worker is active');
          }
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('✅ New Service Worker activated');
                }
              });
            }
          });
          
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      };

      // Register after page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerSW);
      } else {
        registerSW();
      }
    }
  }, []);

  return null; // This component doesn't render anything
}