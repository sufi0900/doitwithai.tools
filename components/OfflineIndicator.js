"use client";
import { useState, useEffect } from 'react';

export default function OfflineDebug() {
  const [debug, setDebug] = useState({
    isOnline: true,
    swRegistered: false,
    cacheExists: false,
    indexedDBData: null
  });

  useEffect(() => {
    const checkStatus = async () => {
      const newDebug = {
        isOnline: navigator.onLine,
        swRegistered: !!navigator.serviceWorker?.controller,
        cacheExists: false,
        indexedDBData: null
      };

      // Check if cache exists
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        newDebug.cacheExists = cacheNames.length > 0;
      }

      // Check IndexedDB (your existing cache)
      if (window.indexedDB) {
        try {
          const request = window.indexedDB.open('your-cache-db-name');
          request.onsuccess = () => {
            newDebug.indexedDBData = 'Available';
            setDebug(newDebug);
          };
        } catch (e) {
          newDebug.indexedDBData = 'Error';
        }
      }

      setDebug(newDebug);
    };

    checkStatus();

    // Listen for online/offline changes
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, []);

  // Only show in development or when offline
  if (process.env.NODE_ENV === 'production' && debug.isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 bg-black text-white p-4 text-sm z-50">
      <h3>Debug Info:</h3>
      <p>Online: {debug.isOnline ? '✅' : '❌'}</p>
      <p>SW Registered: {debug.swRegistered ? '✅' : '❌'}</p>
      <p>Cache Exists: {debug.cacheExists ? '✅' : '❌'}</p>
      <p>IndexedDB: {debug.indexedDBData || 'Checking...'}</p>
    </div>
  );
}