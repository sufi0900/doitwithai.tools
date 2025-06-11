// GlobalRefreshContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const GlobalRefreshContext = createContext();

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (!context) {
    throw new Error('useGlobalRefresh must be used within GlobalRefreshProvider');
  }
  return context;
};

export const GlobalRefreshProvider = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFunctions, setRefreshFunctions] = useState(new Map());
  const [componentDataSources, setComponentDataSources] = useState(new Map()); // NEW: Track data sources
const [pageRefreshFunctions, setPageRefreshFunctions] = useState(new Map());

  const registerRefresh = useCallback((componentName, refreshFn) => {
    setRefreshFunctions(prev => new Map(prev.set(componentName, refreshFn)));
  }, []);

  // NEW: Register component data source status
  const registerDataSource = useCallback((componentName, dataSource) => {
    setComponentDataSources(prev => new Map(prev.set(componentName, dataSource)));
  }, []);
const registerPageRefresh = useCallback((pageName, componentName, refreshFn) => {
  setPageRefreshFunctions(prev => {
    const newMap = new Map(prev);
    if (!newMap.has(pageName)) {
      newMap.set(pageName, new Map());
    }
    newMap.get(pageName).set(componentName, refreshFn);
    return newMap;
  });
}, []);

// Unregister page refresh function
const unregisterPageRefresh = useCallback((pageName, componentName) => {
  setPageRefreshFunctions(prev => {
    const newMap = new Map(prev);
    if (newMap.has(pageName)) {
      newMap.get(pageName).delete(componentName);
      if (newMap.get(pageName).size === 0) {
        newMap.delete(pageName);
      }
    }
    return newMap;
  });
}, []);

  const unregisterRefresh = useCallback((componentName) => {
    setRefreshFunctions(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentName);
      return newMap;
    });
    // Also clean up data sources
    setComponentDataSources(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentName);
      return newMap;
    });
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const refreshPromises = Array.from(refreshFunctions.values()).map(fn => fn());
      await Promise.all(refreshPromises);
      
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success('All content refreshed successfully!');
      }
    } catch (error) {
      console.error('Global refresh failed:', error);
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('Some content failed to refresh');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunctions]);

  // NEW: Calculate data source statistics
  const getDataSourceStats = useCallback(() => {
    const sources = Array.from(componentDataSources.values());
    const stats = {
      total: sources.length,
      fresh: 0,
      cache: 0,
      offline: 0,
      error: 0
    };

    sources.forEach(source => {
      // Handle null/undefined sources
      if (!source) {
        stats.error++;
        return;
      }

      const sourceStr = String(source).toLowerCase();
      
      if (sourceStr === 'fresh' || sourceStr === 'server') {
        stats.fresh++;
      } else if (sourceStr === 'cache' || sourceStr.includes('cache')) {
        stats.cache++;
      } else if (sourceStr === 'offline' || sourceStr.includes('offline')) {
        stats.offline++;
      } else if (sourceStr === 'error' || sourceStr.includes('error') || sourceStr.includes('fallback')) {
        stats.error++;
      } else {
        // Handle any other unknown sources
        stats.error++;
      }
    });

    return stats;
  }, [componentDataSources]);
  const refreshPage = useCallback(async (pageName) => {
  setIsRefreshing(true);
  try {
    const pageComponents = pageRefreshFunctions.get(pageName);
    if (pageComponents) {
      const refreshPromises = Array.from(pageComponents.values()).map(fn => fn());
      await Promise.all(refreshPromises);
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success(`${pageName} content refreshed successfully!`);
      }
    }
  } catch (error) {
    console.error(`${pageName} refresh failed:`, error);
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.error(`Some ${pageName} content failed to refresh`);
    }
  } finally {
    setIsRefreshing(false);
  }
}, [pageRefreshFunctions]);

const getPageComponentCount = useCallback((pageName) => {
  const pageComponents = pageRefreshFunctions.get(pageName);
  return pageComponents ? pageComponents.size : 0;
}, [pageRefreshFunctions]);

  return (
    <GlobalRefreshContext.Provider value={{
      isRefreshing,
      
      registerRefresh,
      registerDataSource, // NEW
      unregisterRefresh,
      refreshAll,
      refreshCount: refreshFunctions.size,
      getDataSourceStats, // NEW
      componentDataSources // NEW: Expose for debugging if needed
    }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};