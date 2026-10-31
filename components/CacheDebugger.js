"use client";
import { useState } from 'react';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

export default function CacheDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  const checkCacheStats = async () => {
    const stats = await cacheSystem.getStats();
    setCacheStats(stats);
  };

  if (process.env.NODE_ENV === 'production') {
    // Hide in production or show only to admins
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Cache Debug
      </button>
      {isVisible && (
        <div className="bg-white border rounded p-4 mt-2 shadow-lg max-w-md">
          <button onClick={checkCacheStats} className="mb-2 bg-green-500 text-white px-3 py-1 rounded">
            Check Cache
          </button>
          {cacheStats && (
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(cacheStats, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}