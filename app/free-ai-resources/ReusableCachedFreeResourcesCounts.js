// components/Resources/ReusableCachedFreeResourcesCounts.jsx
"use client";

import React, { useMemo, useCallback } from "react"; // Import useMemo and useCallback
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';


const ReusableCachedFreeResourcesCounts = ({
  resourceFormats, // Prop: array of { label, value } for formats
  selectedFormat, // Prop: currently selected format value (used for styling)
  handleFormatChange, // Prop: callback from parent for filter change
  handleCountsLoad, // Prop: callback from parent to set counts
}) => {
  // Memoize the query to get resource counts for all formats
  const memoizedCountsQuery = useMemo(() => `{
    "all": count(*[_type == "freeResources"]),
    "image": count(*[_type == "freeResources" && resourceFormat == "image"]),
    "video": count(*[_type == "freeResources" && resourceFormat == "video"]),
    "text": count(*[_type == "freeResources" && resourceFormat == "text"]),
    "document": count(*[_type == "freeResources" && resourceFormat == "document"]),
    "aitool": count(*[_type == "freeResources" && resourceFormat == "aitool"])
  }`, []); // Empty dependency array as this query is static

  // Memoize an empty params object
  const memoizedParams = useMemo(() => ({}), []);

  // Memoize the options object for useSanityCache
  const stableOptions = useMemo(() => ({
    componentName: 'FreeResourcesCounts',
    enableOffline: true,
    group: 'free-resources', // Assign to the same group as other free resources data
  }), []); // Empty dependency array as these options are stable

  const { data: resourceCounts, isLoading, error, refresh, isStale } = useSanityCache(
    CACHE_KEYS.PAGE.FREERESOURCES_COUNTS, // Use the new specific cache key
    memoizedCountsQuery, // Use the memoized query
    memoizedParams,      // Use the memoized params
    stableOptions        // Use the stable options
  );

  // Register this component's cache key with usePageCache
  usePageCache(
    CACHE_KEYS.PAGE.FREERESOURCES_COUNTS, // The cache key for this data
    refresh,                             // The refresh function provided by useSanityCache
    memoizedCountsQuery,                 // The memoized query string associated
    'Free Resources Counts'              // A descriptive label
  );

  // This effect ensures the parent component receives the updated counts.
  // handleCountsLoad is assumed to be a useCallback from the parent.
  React.useEffect(() => {
    if (resourceCounts && typeof handleCountsLoad === 'function') {
      handleCountsLoad(resourceCounts); // Pass the raw data back to the parent
    }
  }, [resourceCounts, handleCountsLoad]); // Only trigger when resourceCounts changes

  // Memoize the refresh handler for the Retry button
  const handleRefresh = useCallback(() => {
    refresh(true); // Force refresh
  }, [refresh]);

  // Display a loading state or error for the counts section itself
  if (isLoading) {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {resourceFormats.map((format) => (
          <button
            key={format.value}
            className="mb-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2
                       bg-gray-200 text-gray-400 cursor-wait animate-pulse"
            disabled
          >
            {format.label} <span className="w-6 h-4 bg-gray-300 rounded-full"></span>
          </button>
        ))}
      </div>
    );
  }

  if (error && !resourceCounts) { // If there's an error and no cached data to fall back on
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load resource counts. <button onClick={handleRefresh} className="text-blue-500 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
      {isStale && resourceCounts && ( // Show stale warning if data is available but stale
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg w-full text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Resource counts may be outdated.</span>
            </div>
          </div>
      )}
      {resourceFormats.map((format) => (
        <button
          key={format.value}
          className={`mb-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            selectedFormat === format.value
              ? 'bg-primary text-white hover:bg-primary/80'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleFormatChange(format.value)}
        >
          {format.label}
          <span className={`text-xs px-2 py-1 rounded-full ${
            selectedFormat === format.value
              ? 'bg-white/20 text-white'
              : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
          }`}>
            {resourceCounts ? (resourceCounts[format.value] || 0) : 0}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReusableCachedFreeResourcesCounts;
