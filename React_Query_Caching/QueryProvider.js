// lib/cache/CacheProvider.jsx (Optional - for global cache management)
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { cache } from './SimpleCache';

const CacheContext = createContext();

export const useCacheContext = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCacheContext must be used within CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const [stats, setStats] = useState({ memoryEntries: 0, keys: [] });

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStats(cache.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const clearAllCache = async () => {
    await cache.clearAll();
    setStats({ memoryEntries: 0, keys: [] });
  };

  const value = {
    cache,
    stats,
    clearAllCache
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
      {/* Optional: Debug panel in development */}
      {process.env.NODE_ENV === 'development' && (
        <CacheDebugPanel stats={stats} onClearAll={clearAllCache} />
      )}
    </CacheContext.Provider>
  );
};

// Debug panel component
const CacheDebugPanel = ({ stats, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-600 text-sm"
      >
        Cache ({stats.memoryEntries})
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Cache Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div>
              <strong>Memory Entries:</strong> {stats.memoryEntries}
            </div>
            
            <div>
              <strong>Cache Keys:</strong>
              <ul className="mt-1 space-y-1 max-h-32 overflow-auto">
                {stats.keys.map((key, index) => (
                  <li key={index} className="text-gray-600 break-all">
                    {key}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={onClearAll}
              className="w-full bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600"
            >
              Clear All Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};