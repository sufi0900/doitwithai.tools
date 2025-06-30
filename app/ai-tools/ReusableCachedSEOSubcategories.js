// components/Blog/ReusableCachedSEOSubcategories.js (or wherever it resides)
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link"; // Assuming Link is used for navigation
// Removed SkelCard and CacheStatusIndicator imports as they are no longer needed here

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache'; // Ensure this is imported!
import { cacheSystem } from '@/React_Query_Caching/cacheSystem'; // Import cacheSystem for refreshGroup

const ReusableCachedSEOSubcategories = ({
  currentPage = 1,
  limit = 2, // Default limit matching parent's SUBCATEGORIES_LIMIT
  onDataLoad, // Callback: onDataLoad(currentPage, totalPages, hasMore)
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const [subcategoriesToDisplay, setSubcategoriesToDisplay] = useState([]); // State to hold the sliced data
  // Flag to indicate initial data has been loaded (from network or cache)
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

  const start = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  // Memoize the query for paginated subcategories
  const subcategoryQuery = useMemo(() => `*[_type=="seoSubcategory"]|order(orderRank asc){_id,title,
    "slug": slug.current, // Ensure slug is flattened for direct use
    description,
    "blogCount": count(*[_type == "seo" && references(^._id)]) // Count related 'seo' blogs
  }[${start}...${start + limit + 1}]`, [start, limit]); // Changed _type to seoSubcategory

  // Memoize the query for total count of subcategories
  const totalSubcategoryCountQuery = useMemo(() => `count(*[_type=="seoSubcategory"])`, []); // Changed _type to seoSubcategory

  // Cache key for the current page of subcategories
  const pageCacheKey = useMemo(() => CACHE_KEYS.PAGE.SEO_SUBCATEGORIES_PAGINATED(currentPage), [currentPage]);

  // Cache key for the total count of subcategories
  const totalCountCacheKey = useMemo(() => CACHE_KEYS.PAGE.SEO_SUBCATEGORIES_TOTAL, []);

  // Define a group identifier for SEO subcategories
  const subcategoriesGroup = 'seo-subcategories-all-items';

  // Memoized empty params object for useSanityCache
  const memoizedParams = useMemo(() => ({}), []);

  // Memoize options object for useSanityCache paginated data
  const stableOptionsPaginated = useMemo(() => ({
    componentName: `SEO_Subcategories_Page_${currentPage}`,
    enableOffline: true,
    group: subcategoriesGroup,
  }), [currentPage, subcategoriesGroup]);

  // Memoize options object for useSanityCache total count data
  const stableOptionsTotalCount = useMemo(() => ({
    componentName: `SEO_Subcategories_TotalCount`,
    enableOffline: true,
    group: subcategoriesGroup,
  }), [subcategoriesGroup]);


  // Fetch paginated subcategory data
  const {
    data: subcategoryData,
    isLoading: isSubcategoryLoading,
    error: subcategoryError,
    refresh: refreshSubcategories,
    isStale: isSubcategoryStale,
  } = useSanityCache(
    pageCacheKey,
    subcategoryQuery,
    memoizedParams, // Use memoized params
    stableOptionsPaginated // Use stable options
  );

  // Fetch total count of subcategories
  const {
    data: totalCountData,
    isLoading: isTotalCountLoading,
    error: totalCountError,
    refresh: refreshTotalCount,
    isStale: isTotalCountStale,
  } = useSanityCache(
    totalCountCacheKey,
    totalSubcategoryCountQuery,
    memoizedParams, // Use memoized params
    stableOptionsTotalCount // Use stable options
  );

  // Calculate pagination details
  const totalSubcategories = typeof totalCountData === 'number' ? totalCountData : 0;
  const subcategoriesTotalPages = Math.ceil(totalSubcategories / limit);
  const hasMoreSubcategories = (subcategoryData?.length || 0) > limit;

  // Effect to slice data and update local state for display
  useEffect(() => {
    if (subcategoryData) {
      setSubcategoriesToDisplay(subcategoryData.slice(0, limit));
      // Set flag once data is initially available (from cache or network)
      if (!hasInitialDataLoaded && subcategoryData !== null && totalCountData !== null) {
        setHasInitialDataLoaded(true);
      }
    }
  }, [subcategoryData, limit, hasInitialDataLoaded, totalCountData]);


  // Handle stale warning for pagination data
  useEffect(() => {
    if (isSubcategoryStale || isTotalCountStale) {
      setPaginationStaleWarning(true);
      // Trigger background refresh for current page and total count if online
      if (typeof window !== 'undefined' && window.navigator.onLine) {
        refreshSubcategories(false); // background refresh
        refreshTotalCount(false);   // background refresh
      }
    } else if ((subcategoryData && !isSubcategoryStale) && (totalCountData && !isTotalCountStale) && paginationStaleWarning) {
      // If data is fresh and warning was active, dismiss it
      setPaginationStaleWarning(false);
    }
  }, [isSubcategoryStale, isTotalCountStale, subcategoryData, totalCountData, paginationStaleWarning, refreshSubcategories, refreshTotalCount]);

  // Pass total pages and hasMore back to parent
  useEffect(() => {
    // Only call onDataLoad if loading is complete AND initial data has been set.
    if (onDataLoad && hasInitialDataLoaded && !isSubcategoryLoading && !isTotalCountLoading) {
      onDataLoad(currentPage, subcategoriesTotalPages, hasMoreSubcategories);
    }
  }, [onDataLoad, currentPage, subcategoriesTotalPages, hasMoreSubcategories, isSubcategoryLoading, isTotalCountLoading, hasInitialDataLoaded]);

  // NEW: Register this component's cache keys and refresh functions with the PageCacheProvider
  usePageCache(
    pageCacheKey,
    refreshSubcategories,
    subcategoryQuery,
    `SEO Subcategories Page ${currentPage}` // Label for cache status button
  );

  usePageCache(
    totalCountCacheKey,
    refreshTotalCount,
    totalSubcategoryCountQuery,
    `SEO Subcategories Total Count` // Label for cache status button
  );

  const handleRefresh = useCallback(async (refreshAllGroup = false) => {
    try {
      if (refreshAllGroup) {
        // Assuming cacheSystem is globally available or imported in a higher scope
        if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
          console.log(`Manually refreshing entire group: ${subcategoriesGroup}`);
          await cacheSystem.refreshGroup(subcategoriesGroup);
        } else {
          console.warn("cacheSystem is not defined or refreshGroup method is missing. Cannot refresh group.");
          await refreshSubcategories(true); // Fallback to force refresh current page
          await refreshTotalCount(true);
        }
      } else {
        await refreshSubcategories(true); // Force refresh for current page
        await refreshTotalCount(true);
      }
    } catch (error) {
      console.error('Subcategories refresh failed:', error);
    }
  }, [subcategoriesGroup, refreshSubcategories, refreshTotalCount]);

  const hasError = subcategoryError || totalCountError;

  if (isSubcategoryLoading || isTotalCountLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow animate-pulse dark:bg-gray-800 dark:border-gray-700 h-48">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-3 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-4 dark:bg-gray-700"></div>
            <div className="mt-auto h-8 bg-blue-300 rounded w-1/3 dark:bg-blue-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginationStaleWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">Updating subcategory data...</span>
          </div>
        </div>
      )}
      {hasError && subcategoriesToDisplay.length === 0 && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load subcategories.</p>
          <button onClick={() => handleRefresh(false)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry Current Page</button>
          <button onClick={() => handleRefresh(true)} className="ml-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Refresh All Subcategories</button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subcategoriesToDisplay.map((subcategory) => (
          <Link
            href={`/ai-seo/category/${subcategory.slug}`} // Use subcategory.slug directly
            key={subcategory.slug} // Use subcategory.slug for key
            className="card hover:shadow-lg mt-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:scale-[1.03] max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{subcategory.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{subcategory.description}</p>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Read more
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" /></svg>
            </button>
          </Link>
        ))}
      </div>
      {subcategoriesToDisplay.length === 0 && !isSubcategoryLoading && !isTotalCountLoading && !hasError && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No subcategories found.</p>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Refresh All Subcategories</button>
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800 mt-4">
          SubcatPage: {currentPage} | PageCacheKey: {pageCacheKey} | TotalCountCacheKey: {totalCountCacheKey} | Group: {subcategoriesGroup} | PageStale: {isSubcategoryStale ? 'Yes' : 'No'} | TotalStale: {isTotalCountStale ? 'Yes' : 'No'} | TotalSubcategories: {totalSubcategories} | SubcategoriesTotalPages: {subcategoriesTotalPages} | Has More: {hasMoreSubcategories ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default ReusableCachedSEOSubcategories;
