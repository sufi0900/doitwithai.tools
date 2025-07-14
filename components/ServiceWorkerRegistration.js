// ServiceWorkerRegistration.js
"use client";

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      const wb = new Workbox('/sw.js');

      wb.addEventListener('installed', event => {
        if (event.isUpdate) {
          if (confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        }
      });

      wb.register();
    }
  }, []);

  return null;
}