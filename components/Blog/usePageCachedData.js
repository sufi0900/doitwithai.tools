import { useCachedSanityData } from './useSanityCache';
import { usePageRefresh } from './PageScopedRefreshContext';
import { useEffect } from 'react';

export const usePageCachedData = (cacheKey, query, componentName, options = {}) => {
  const { registerRefresh, unregisterRefresh, registerDataSource } = usePageRefresh();
  
  const result = useCachedSanityData(cacheKey, query, {
    ...options,
    componentName: componentName
  });

  useEffect(() => {
    registerRefresh(componentName, result.refresh);
    return () => {
      unregisterRefresh(componentName);
    };
  }, [registerRefresh, unregisterRefresh, result.refresh, componentName]);

  useEffect(() => {
    const validDataSource = result.dataSource || 'unknown';
    registerDataSource(componentName, validDataSource);
  }, [registerDataSource, result.dataSource, componentName]);

  return result;
};
