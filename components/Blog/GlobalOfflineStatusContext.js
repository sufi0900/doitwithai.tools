// components/Blog/GlobalOfflineStatusContext.js
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const GlobalOfflineStatusContext = createContext();

export const useGlobalOfflineStatus = () => {
  const context = useContext(GlobalOfflineStatusContext);
  if (!context) {
    throw new Error('useGlobalOfflineStatus must be used within GlobalOfflineStatusProvider');
  }
  return context;
};

export const GlobalOfflineStatusProvider = ({ children }) => {
  const [componentStatuses, setComponentStatuses] = useState(new Map());
  const [isBrowserOnline, setIsBrowserOnline] = useState(true);

 // Update the globalRetryRefresh function:
const globalRetryRefresh = useCallback(async () => {
  console.log("Attempting global offline retry...");
  const refreshPromises = [];
  
  componentStatuses.forEach(comp => {
    if (comp.refreshFn && (comp.isOffline || comp.dataSource?.includes('cache'))) {
      refreshPromises.push(
        comp.refreshFn().catch(err => {
          console.error(`Failed to refresh component ${comp.name || 'unknown'}:`, err);
          // Don't reject here, just log the error
          return null;
        })
      );
    }
  });

  try {
    const results = await Promise.allSettled(refreshPromises); // Use allSettled instead of all
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (typeof window !== 'undefined' && window.toast) {
      if (failed === 0) {
        window.toast.success('All components refreshed successfully!');
      } else {
        window.toast.warning(`${successful} components refreshed, ${failed} failed.`);
      }
    }
  } catch (error) {
    console.error('Global refresh error:', error);
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.error('Refresh failed.');
    }
  }
}, [componentStatuses]);
  // Modified registerComponent to accept a `scope`
  const registerComponent = useCallback((name, statusAndRefreshFn, scope = 'global') => { // Default scope to 'global'
    setComponentStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(name, { ...statusAndRefreshFn, name, scope }); // Store scope
      return newMap;
    });

    return () => {
      setComponentStatuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(name);
        return newMap;
      });
    };
  }, []);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    if (typeof window !== 'undefined') {
      setIsBrowserOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // New: Get status for a specific scope (or all)
  const getScopedStatus = useCallback((scope = 'all') => {
    let isAnyOffline = false;
    let isAnyCached = false;
    let hasErrors = false;
    let totalComponentsInScope = 0;
    let isAnyStale = false; // Track stale components
    
  componentStatuses.forEach(comp => {
    if (scope === 'all' || comp.scope === scope) {
      totalComponentsInScope++;
      if (comp.isOffline) {
        isAnyOffline = true;
      }
      if (comp.dataSource && comp.dataSource.includes('cache')) {
        isAnyCached = true;
      }
      if (comp.error) {
        hasErrors = true;
      }
    }
  });
  return {
    isAnyComponentCurrentlyOffline: isAnyOffline,
    isAnyComponentCurrentlyCached: isAnyCached,
    hasErrors: hasErrors,
    totalComponentsInScope: totalComponentsInScope,
  };
}, [componentStatuses]);

  // For the GlobalRefreshButton, we want the overall system status
  const allComponentsStatus = getScopedStatus('all');

  return (
    <GlobalOfflineStatusContext.Provider value={{
      isBrowserOnline,
      isAnyComponentCurrentlyOffline: allComponentsStatus.isAnyComponentCurrentlyOffline,
      isAnyComponentCurrentlyCached: allComponentsStatus.isAnyComponentCurrentlyCached,
      isAnyComponentCurrentlyStale: allComponentsStatus.isAnyComponentCurrentlyStale, // Exposed
      hasErrors: allComponentsStatus.hasErrors,
      totalComponentsTracked: allComponentsStatus.totalComponentsInScope,
      registerComponent,
      globalRetryRefresh,
      getScopedStatus // Expose for potentially filtering by scope
    }}>
      {children}
    </GlobalOfflineStatusContext.Provider>
  );
};