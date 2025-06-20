// Create this new file: utils/cacheSyncHelper.js
"use client";

/**
 * Helper utilities for cache synchronization
 */

export const ensureCacheConsistency = (cacheKey, data) => {
  if (typeof window !== 'undefined' && data) {
    // Force a small delay to ensure DOM is ready
    setTimeout(() => {
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('cacheUpdated', {
        detail: { cacheKey, data }
      }));
    }, 50);
  }
};

export const createStableCacheKey = (baseKey, schemaType, params) => {
  // Remove undefined/null values and sort params for consistency
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, value]) => value != null)
  );
  
  const keyParts = [baseKey];
  if (schemaType) keyParts.push(schemaType);
  
  // Add params in consistent order
  const sortedKeys = Object.keys(cleanParams).sort();
  sortedKeys.forEach(key => {
    if (key !== 'componentId') { // Exclude componentId from cache key
      keyParts.push(`${key}_${cleanParams[key]}`);
    }
  });
  
  return keyParts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
};