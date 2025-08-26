// hooks/useStorageMonitor.js
"use client";
import { useEffect, useState } from 'react';

export function useStorageMonitor() {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    quota: 0,
    percentage: 0,
    warning: false
  });

  useEffect(() => {
    let intervalId;

    const checkStorageUsage = async () => {
      if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
        return;
      }

      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;
        const usedMB = used / (1024 * 1024);

        const warning = usedMB > 100 || percentage > 80; // Warning at 100MB or 80% quota

        setStorageInfo({
          used: usedMB,
          quota: quota / (1024 * 1024),
          percentage,
          warning
        });

        // Trigger cleanup if storage is getting full
        if (warning && navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'EMERGENCY_CLEANUP',
            reason: 'storage_warning',
            currentUsage: usedMB
          });
        }

      } catch (error) {
        console.warn('Failed to check storage usage:', error);
      }
    };

    // Check immediately and then every 5 minutes
    checkStorageUsage();
    intervalId = setInterval(checkStorageUsage, 5 * 60 * 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const clearStorage = async () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_ALL_CACHE',
        keepEssential: true // Keep root page and critical static pages
      });
    }
  };

  return {
    storageInfo,
    clearStorage
  };
}