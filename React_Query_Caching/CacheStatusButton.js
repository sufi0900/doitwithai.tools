// components/Blog/CacheStatusButton.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { useCacheContext } from './CacheProvider';
import { cacheSystem } from './cacheSystem';

const CacheStatusButton = ({ 
  cacheKeys = [], 
  position = 'fixed', 
  className = '',
  onRefresh,
  showStats = true,
  compact = false 
}) => {
  const { cacheStats, isOnline, refreshCache } = useCacheContext();
  const [isOpen, setIsOpen] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Monitor cache status for provided keys
  useEffect(() => {
    if (!cacheKeys.length) return;

    const unsubscribers = [];
    const newStatuses = {};

    cacheKeys.forEach(key => {
      const fullCacheKey = typeof key === 'string' ? key : cacheSystem.generateCacheKey(key.key, key.query || '');
      
      // Get initial status
      cacheSystem.get(fullCacheKey).then(result => {
        newStatuses[fullCacheKey] = {
          key: key.label || fullCacheKey,
          status: result ? (result.isStale ? 'stale' : 'fresh') : 'empty',
          lastUpdated: result ? new Date(Date.now() - result.age) : null,
          source: result?.source || 'none',
          age: result?.age || 0
        };
        setKeyStatuses(prev => ({ ...prev, ...newStatuses }));
      });

      // Subscribe to updates
      const unsubscribe = cacheSystem.subscribe(fullCacheKey, (data) => {
        setKeyStatuses(prev => ({
          ...prev,
          [fullCacheKey]: {
            key: key.label || fullCacheKey,
            status: data === null ? 'empty' : (data.isStale ? 'stale' : 'fresh'),
            lastUpdated: data ? new Date(Date.now() - (data.age || 0)) : null,
            source: data?.source || 'none',
            age: data?.age || 0
          }
        }));
      });

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [cacheKeys]);

  const getOverallStatus = () => {
    const statuses = Object.values(keyStatuses);
    if (statuses.length === 0) return 'unknown';
    
    if (statuses.some(s => s.status === 'empty')) return 'empty';
    if (statuses.some(s => s.status === 'stale')) return 'stale';
    if (statuses.every(s => s.status === 'fresh')) return 'fresh';
    
    return 'mixed';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default refresh behavior
        await refreshCache();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fresh': return 'bg-green-500 text-white';
      case 'stale': return 'bg-yellow-500 text-black';
      case 'empty': return 'bg-red-500 text-white';
      case 'mixed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fresh': return '✓';
      case 'stale': return '⚠';
      case 'empty': return '✗';
      case 'mixed': return '◐';
      default: return '?';
    }
  };

  const overallStatus = getOverallStatus();

  if (compact) {
    return (
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(overallStatus)} ${className}`}
        title={`Cache Status: ${overallStatus} | Click to refresh`}
      >
        {isRefreshing ? '⟳' : getStatusIcon(overallStatus)}
        {!isRefreshing && <span className="ml-1">{overallStatus}</span>}
      </button>
    );
  }

  return (
    <div className={`${position === 'fixed' ? 'fixed bottom-4 right-4 z-50' : 'relative'} ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border font-medium transition-all ${getStatusColor(overallStatus)} hover:opacity-90`}
        title="Cache Status & Controls"
      >
        <span className="text-lg">{getStatusIcon(overallStatus)}</span>
        <span className="hidden sm:inline">Cache</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▲</span>
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cache Status</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-600 dark:text-gray-400">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Cache Stats */}
          {showStats && (
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">Memory</div>
                <div className="font-medium">{cacheStats.memoryEntries} items</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">Size</div>
                <div className="font-medium">{Math.round(cacheStats.memorySize / 1024)}KB</div>
              </div>
            </div>
          )}

          {/* Individual Key Statuses */}
          {Object.keys(keyStatuses).length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Data:</div>
              {Object.values(keyStatuses).map((keyStatus, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      keyStatus.status === 'fresh' ? 'bg-green-500' :
                      keyStatus.status === 'stale' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="truncate max-w-32" title={keyStatus.key}>
                      {keyStatus.key.replace(/^.*_/, '')}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {keyStatus.status}
                    </span>
                    {keyStatus.lastUpdated && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {Math.round(keyStatus.age / 1000 / 60)}m ago
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {isRefreshing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                '🔄 Refresh'
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheStatusButton;