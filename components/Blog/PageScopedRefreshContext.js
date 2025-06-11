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

  // Real-time updates using Server-Sent Events

// Only the parts that need to be updated in PageRefreshContext

// Replace the useEffect that handles update checking with this:
useEffect(() => {
  let interval;
  
  const checkForUpdates = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check for updates in localStorage
      const lastUpdateTime = localStorage.getItem(`${pageType}_last_cms_update`);
      const globalUpdateTime = localStorage.getItem('global_last_cms_update');
      
      // Use the most recent update time
      const mostRecentUpdate = Math.max(
        lastUpdateTime ? parseInt(lastUpdateTime) : 0,
        globalUpdateTime ? parseInt(globalUpdateTime) : 0
      );
      
      if (mostRecentUpdate > pageLoadTime) {
        console.log(`Updates detected for ${pageType} page:`, {
          pageLoadTime: new Date(pageLoadTime),
          lastUpdate: new Date(mostRecentUpdate),
          pageType
        });
        setHasUpdatesAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  // Check immediately when component mounts
  checkForUpdates();
  
  // Set up polling interval (every 15 seconds for more responsive updates)
  interval = setInterval(checkForUpdates, 15000);
  
  // Listen for storage events (when localStorage is updated by webhook)
  const handleStorageChange = (e) => {
    if (e.key === `${pageType}_last_cms_update` || e.key === 'global_last_cms_update') {
      console.log('Storage change detected:', e.key, e.newValue);
      checkForUpdates();
    }
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }
  
  return () => {
    if (interval) clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}, [pageType, pageLoadTime]);


  // Check if update is relevant to current page
const clearUpdateNotification = useCallback(() => {
  setHasUpdatesAvailable(false);
  // Optionally clear the localStorage flag
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${pageType}_last_cms_update`);
  }
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
      
      // Clear the update timestamps after successful refresh
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${pageType}_last_cms_update`);
        localStorage.removeItem('global_last_cms_update');
      }
      
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
      } else if (sourceStr === 'error' || sourceStr.includes('error') || sourceStr.includes('fallback')) {
        stats.error++;
      } else {
        stats.cache++;
      }
    });

    return stats;
  }, [componentDataSources, componentLastRefresh, hasUpdatesAvailable]);

  // Manual trigger for testing
  const notifyUpdatesAvailable = useCallback(() => {
    setHasUpdatesAvailable(true);
    localStorage.setItem(`${pageType}_last_cms_update`, Date.now().toString());
  }, [pageType]);

  const hasRecentlyFreshData = useCallback(() => {
    const refreshTimes = Array.from(componentLastRefresh.values());
    const currentTime = Date.now();
    return refreshTimes.length > 0 && refreshTimes.every(time => currentTime - time < 2 * 60 * 1000);
  }, [componentLastRefresh]);

  return (
    <PageRefreshContext.Provider value={{
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
    clearUpdateNotification, // Add this line
    refreshCount: refreshFunctions.size,
    pageType,
    pageLoadTime
  }}>
    {children}
  </PageRefreshContext.Provider>
  );
};