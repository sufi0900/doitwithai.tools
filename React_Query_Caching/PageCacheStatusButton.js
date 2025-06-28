'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCacheContext } from './CacheProvider';
import { cacheSystem } from './cacheSystem';

const PageCacheStatusButton = ({
  position = 'fixed',
  className = '',
  showStats = true,
  compact = false
}) => {
  const {
    cacheStats,
    isOnline,
    refreshPageCache,
    getCacheKeys,
  } = useCacheContext();

  const [isOpen, setIsOpen] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isOpen && autoScroll && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      if (scrollHeight > clientHeight) {
        let scrollTop = 0;
        const scrollStep = 1;
        const scrollDelay = 50; // ms
        
        autoScrollIntervalRef.current = setInterval(() => {
          scrollTop += scrollStep;
          container.scrollTop = scrollTop;
          
          // Reset to top when reached bottom
          if (scrollTop >= scrollHeight - clientHeight) {
            setTimeout(() => {
              scrollTop = 0;
              container.scrollTop = 0;
            }, 1000); // Pause at bottom for 1 second
          }
        }, scrollDelay);
      }
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isOpen, autoScroll, keyStatuses]);

  // Stop auto-scroll when user manually scrolls
  const handleManualScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      setAutoScroll(false);
    }
  };

  // Monitor cache status for all registered page keys
  // Replace the existing useEffect that monitors cache status
useEffect(() => {
  if (!getCacheKeys) return;

  const cacheKeys = getCacheKeys();
  const unsubscribers = [];

  const initializeAndSubscribe = async () => {
    const initialStatuses = {};
    const fetchPromises = cacheKeys.map(async ({ key, query, label }) => {
      // Ensure key is a string
      const stringKey = String(key);
      const fullCacheKey = cacheSystem.generateCacheKey(stringKey, query || '');
      
      // Use a proper label that's always a string
      const displayLabel = label || stringKey;
      
      // Set initial loading state immediately
      initialStatuses[fullCacheKey] = {
        key: displayLabel,
        status: 'loading',
        lastUpdated: null,
        source: 'none',
        age: 0
      };

      // Fetch actual status
      try {
        const result = await cacheSystem.get(fullCacheKey, {
          query,
          params: {}
        });
        return { fullCacheKey, data: result, label: displayLabel };
      } catch (error) {
        console.error(`Error getting initial status for ${displayLabel}:`, error);
        return { fullCacheKey, data: null, label: displayLabel };
      }
    });

    // Update state with initial loading statuses
    setKeyStatuses(initialStatuses);

    // Wait for all initial fetches to complete and then update with actual statuses
    const results = await Promise.all(fetchPromises);
    const finalStatuses = {};

    results.forEach(({ fullCacheKey, data, label }) => {
      finalStatuses[fullCacheKey] = {
        key: String(label), // Ensure label is always a string
        status: data ? (data.isStale ? 'stale' : 'fresh') : 'empty',
        lastUpdated: data ? new Date(Date.now() - data.age) : null,
        source: data?.source || 'none',
        age: data?.age || 0
      };
    });

    setKeyStatuses(finalStatuses);

    // Setup subscriptions AFTER initial statuses are resolved
    cacheKeys.forEach(({ key, query, label }) => {
      const stringKey = String(key);
      const fullCacheKey = cacheSystem.generateCacheKey(stringKey, query || '');
      const displayLabel = String(label || stringKey);
      
      const unsubscribe = cacheSystem.subscribe(fullCacheKey, (data) => {
        setKeyStatuses(prev => ({
          ...prev,
          [fullCacheKey]: {
            key: displayLabel,
            status: data === null ? 'empty' : (data.isStale ? 'stale' : 'fresh'),
            lastUpdated: data ? new Date(Date.now() - (data.age || 0)) : null,
            source: data?.source || 'none',
            age: data?.age || 0
          }
        }));
      });
      
      unsubscribers.push(unsubscribe);
    });
  };

  initializeAndSubscribe();

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
}, [getCacheKeys]);

  const getOverallStatus = () => {
    const statuses = Object.values(keyStatuses);
    if (statuses.length === 0) return 'unknown';
    if (statuses.some(s => s.status === 'empty' || s.status === 'loading')) return 'empty';
    if (statuses.some(s => s.status === 'stale')) return 'stale';
    if (statuses.every(s => s.status === 'fresh')) return 'fresh';
    return 'mixed';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshPageCache) {
        await refreshPageCache();
      }
    } catch (error) {
      console.error('Page cache refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fresh': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20';
      case 'stale': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-amber-500/20';
      case 'empty': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20';
      case 'loading': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/20';
      case 'mixed': return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fresh': return '✨';
      case 'stale': return '⚠️';
      case 'empty': return '❌';
      case 'loading': return '⏳';
      case 'mixed': return '🔄';
      default: return '❓';
    }
  };

  const overallStatus = getOverallStatus();
  const totalComponents = Object.keys(keyStatuses).length;

  if (compact) {
    return (
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(overallStatus)} ${className} transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm`}
        title={`Page Cache Status: ${overallStatus} | Click to refresh`}
      >
        <span className="mr-1.5">{isRefreshing ? '⟳' : getStatusIcon(overallStatus)}</span>
        {!isRefreshing && <span>{overallStatus} ({totalComponents})</span>}
      </button>
    );
  }

  return (
    <div className={`${position === 'fixed' ? 'fixed bottom-6 right-6 z-[9999]' : 'relative'} ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-5 py-3 m-10 rounded-2xl shadow-2xl ${getStatusColor(overallStatus)} hover:shadow-3xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10`}
        title="Page Cache Status & Controls"
      >
        <span className="text-xl">{getStatusIcon(overallStatus)}</span>
        <span className="hidden sm:inline font-medium">Cache Status</span>
        <div className="flex items-center space-x-1">
          <span className="text-sm opacity-80">{totalComponents}</span>
          <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ⌃
          </span>
        </div>
      </button>

      {/* Enhanced Tooltip Panel */}
      {isOpen && (
        <div className="absolute overflow-y-scroll overflow-x-hidden bottom-full right-0 mb-4 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-500 ease-out transform origin-bottom-right animate-in slide-in-from-bottom-2 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                  Cache Monitor
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalComponents} components tracked
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Cache Stats */}
          {showStats && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wide">Memory</div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{cacheStats.memoryEntries}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">items cached</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-purple-600 dark:text-purple-400 text-xs font-medium uppercase tracking-wide">Size</div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{Math.round(cacheStats.memorySize / 1024)}KB</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">memory used</div>
              </div>
            </div>
          )}

          {/* Auto-scroll Controls */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Components</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  autoScroll 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {autoScroll ? '⏸️ Pause' : '▶️ Auto'}
              </button>
            </div>
          </div>

          {/* Scrollable Component List */}
          {Object.keys(keyStatuses).length > 0 && (
           <div
  ref={scrollContainerRef}
  onScroll={handleManualScroll}
  className="space-y-2 mb-4 overflow-y-auto pr-2 scrollbar-thin     h-40"
>

            {Object.entries(keyStatuses).map(([fullCacheKey, keyStatus], index) => (
    <div key={fullCacheKey} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
        <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
                keyStatus.status === 'fresh' ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                keyStatus.status === 'stale' ? 'bg-amber-500 shadow-amber-500/50 shadow-lg' :
                keyStatus.status === 'loading' ? 'bg-blue-400 animate-pulse shadow-blue-400/50 shadow-lg' :
                'bg-red-500 shadow-red-500/50 shadow-lg'
            }`}></div>
            <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm" 
                     title={keyStatus.key || fullCacheKey}>
                    {/* Ensure we display a proper string label */}
                    {typeof keyStatus.key === 'string' && keyStatus.key !== '[object Object]' 
                        ? keyStatus.key 
                        : fullCacheKey.split('_').pop() || 'Unknown Component'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {keyStatus.status}
                </div>
            </div>
        </div>
        <div className="text-right">
            {keyStatus.lastUpdated && (
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {Math.round(keyStatus.age / 1000 / 60)}m ago
                </div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500">
                {keyStatus.source}
            </div>
        </div>
    </div>
))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Refresh All</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6b7280;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PageCacheStatusButton;