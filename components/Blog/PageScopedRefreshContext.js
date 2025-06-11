// components/Blog/PageScopedRefreshContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PageRefreshContext = createContext();

export const usePageRefresh = () => {
  const context = useContext(PageRefreshContext);
  if (!context) {
    throw new Error('usePageRefresh must be used within PageRefreshProvider');
  }
  return context;
};

export const PageRefreshProvider = ({ children, pageType = 'default' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFunctions, setRefreshFunctions] = useState(new Map());
  const [componentDataSources, setComponentDataSources] = useState(new Map());
  const [componentLastRefresh, setComponentLastRefresh] = useState(new Map());
  const [hasUpdatesAvailable, setHasUpdatesAvailable] = useState(false);
  const [pageLoadTime] = useState(Date.now());

  // Clear update notification
  const clearUpdateNotification = useCallback(() => {
    setHasUpdatesAvailable(false);
    console.log(`Update notification cleared for ${pageType} page`);
  }, [pageType]);

  // Notify that updates are available
  const notifyUpdatesAvailable = useCallback(() => {
    console.log(`Updates available notification triggered for ${pageType} page`);
    setHasUpdatesAvailable(true);
  }, [pageType]);

  const registerRefresh = useCallback((componentName, refreshFn) => {
    setRefreshFunctions(prev => new Map(prev.set(componentName, refreshFn)));
  }, []);

  const registerDataSource = useCallback((componentName, dataSource, wasJustRefreshed = false) => {
    setComponentDataSources(prev => new Map(prev.set(componentName, dataSource)));
    
    if (wasJustRefreshed) {
      setComponentLastRefresh(prev => new Map(prev.set(componentName, Date.now())));
    }
  }, []);

  const unregisterRefresh = useCallback((componentName) => {
    setRefreshFunctions(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentName);
      return newMap;
    });
    
    setComponentDataSources(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentName);
      return newMap;
    });
    
    setComponentLastRefresh(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentName);
      return newMap;
    });
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const refreshPromises = Array.from(refreshFunctions.values()).map(fn => 
        fn().catch(err => {
          console.error('Component refresh failed:', err);
          return null;
        })
      );
      
      const results = await Promise.allSettled(refreshPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Clear updates available flag after successful refresh
      if (successful > 0) {
        setHasUpdatesAvailable(false);
        
        // Update all component refresh times
        const currentTime = Date.now();
        setComponentLastRefresh(prev => {
          const newMap = new Map(prev);
          Array.from(refreshFunctions.keys()).forEach(componentName => {
            newMap.set(componentName, currentTime);
          });
          return newMap;
        });
      }

      // Show toast notifications if available
      if (typeof window !== 'undefined' && window.toast) {
        if (failed === 0) {
          window.toast.success(`${pageType} page refreshed successfully!`);
        } else {
          window.toast.warning(`${successful} components refreshed, ${failed} failed.`);
        }
      }

    } catch (error) {
      console.error(`${pageType} page refresh failed:`, error);
      
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error(`${pageType} page refresh failed`);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunctions, pageType]);

  const getDataSourceStats = useCallback(() => {
    const sources = Array.from(componentDataSources.values());
    const refreshTimes = Array.from(componentLastRefresh.values());
    const currentTime = Date.now();

    const stats = {
      total: sources.length,
      fresh: 0,
      cache: 0,
      offline: 0,
      error: 0,
      hasUpdates: hasUpdatesAvailable
    };

    sources.forEach((source, index) => {
      if (!source) {
        stats.error++;
        return;
      }

      const sourceStr = String(source).toLowerCase();
      const componentRefreshTime = refreshTimes[index];
      const timeSinceRefresh = componentRefreshTime ? currentTime - componentRefreshTime : Infinity;

      if ((sourceStr === 'fresh' || sourceStr === 'server') && timeSinceRefresh < 5 * 60 * 1000) {
        stats.fresh++;
      } else if (sourceStr === 'cache' || sourceStr.includes('cache') || 
                 (sourceStr === 'fresh' && timeSinceRefresh >= 5 * 60 * 1000)) {
        stats.cache++;
      } else if (sourceStr === 'offline' || sourceStr.includes('offline')) {
        stats.offline++;
      } else if (sourceStr === 'error' || sourceStr.includes('error') || 
                 sourceStr.includes('fallback')) {
        stats.error++;
      } else {
        stats.cache++;
      }
    });

    return stats;
  }, [componentDataSources, componentLastRefresh, hasUpdatesAvailable]);

  const hasRecentlyFreshData = useCallback(() => {
    const refreshTimes = Array.from(componentLastRefresh.values());
    const currentTime = Date.now();
    
    return refreshTimes.length > 0 && 
           refreshTimes.every(time => currentTime - time < 2 * 60 * 1000);
  }, [componentLastRefresh]);

  return (
    <PageRefreshContext.Provider
      value={{
        isRefreshing,
        refreshFunctions,
        componentDataSources,
        componentLastRefresh,
        hasUpdatesAvailable,
        registerRefresh,
        registerDataSource,
        unregisterRefresh,
        refreshAll,
        getDataSourceStats,
        notifyUpdatesAvailable,
        hasRecentlyFreshData,
        clearUpdateNotification,
        refreshCount: refreshFunctions.size,
        pageType,
        pageLoadTime
      }}
    >
      {children}
    </PageRefreshContext.Provider>
  );
};