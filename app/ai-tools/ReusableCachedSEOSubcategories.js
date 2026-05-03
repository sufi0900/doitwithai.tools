"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

const ReusableCachedSEOSubcategories = ({
  currentPage = 1,
  limit = 2,
  onDataLoad,
  initialPageData = null,
  initialTotalCount = null,
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const [subcategoriesToDisplay, setSubcategoriesToDisplay] = useState([]);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

  const start = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  const subcategoryQuery = useMemo(() => `*[_type=="seoSubcategory"]|order(orderRank asc){_id,title,
    "slug": slug.current,
    description,
    "blogCount": count(*[_type == "seo" && references(^._id)])
  }[${start}...${start + limit + 1}]`, [start, limit]);

  const totalSubcategoryCountQuery = useMemo(() => `count(*[_type=="seoSubcategory"])`, []);

  const pageCacheKey = useMemo(() => CACHE_KEYS.PAGE.SEO_SUBCATEGORIES_PAGINATED(currentPage), [currentPage]);
  const totalCountCacheKey = useMemo(() => CACHE_KEYS.PAGE.SEO_SUBCATEGORIES_TOTAL, []);

  const subcategoriesGroup = 'seo-subcategories-all-items';
  const memoizedParams = useMemo(() => ({}), []);

  const stableOptionsPaginated = useMemo(() => ({
    componentName: `SEO_Subcategories_Page_${currentPage}`,
    enableOffline: true,
    group: subcategoriesGroup,
    initialData: currentPage === 1 ? initialPageData : null,
    schemaType: "seoSubcategory",
  }), [currentPage, subcategoriesGroup, initialPageData]);

  const stableOptionsTotalCount = useMemo(() => ({
    componentName: `SEO_Subcategories_TotalCount`,
    enableOffline: true,
    group: subcategoriesGroup,
    initialData: initialTotalCount,
    schemaType: "seoSubcategory",
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
  }), [subcategoriesGroup, initialTotalCount]);

  const {
    data: subcategoryData,
    isLoading: isSubcategoryLoading,
    error: subcategoryError,
    refresh: refreshSubcategories,
    isStale: isSubcategoryStale,
  } = useUnifiedCache(
    pageCacheKey,
    subcategoryQuery,
    memoizedParams,
    stableOptionsPaginated
  );

  const {
    data: totalCountData,
    isLoading: isTotalCountLoading,
    error: totalCountError,
    refresh: refreshTotalCount,
    isStale: isTotalCountStale,
  } = useUnifiedCache(
    totalCountCacheKey,
    totalSubcategoryCountQuery,
    memoizedParams,
    stableOptionsTotalCount
  );

  const totalSubcategories = typeof totalCountData === 'number' ? totalCountData : 0;
  const subcategoriesTotalPages = Math.ceil(totalSubcategories / limit);
  const hasMoreSubcategories = (subcategoryData?.length || 0) > limit;

  useEffect(() => {
    if (subcategoryData) {
      setSubcategoriesToDisplay(subcategoryData.slice(0, limit));
      if (!hasInitialDataLoaded && (subcategoryData !== null || initialPageData !== null) && (totalCountData !== null || initialTotalCount !== null)) {
        setHasInitialDataLoaded(true);
      }
    }
  }, [subcategoryData, limit, hasInitialDataLoaded, totalCountData, initialPageData, initialTotalCount]);

  useEffect(() => {
    if (isSubcategoryStale || isTotalCountStale) {
      setPaginationStaleWarning(true);
      if (typeof window !== 'undefined' && window.navigator.onLine) {
        refreshSubcategories(false);
        refreshTotalCount(false);
      }
    } else if ((subcategoryData && !isSubcategoryStale) && (totalCountData && !isTotalCountStale) && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [isSubcategoryStale, isTotalCountStale, subcategoryData, totalCountData, paginationStaleWarning, refreshSubcategories, refreshTotalCount]);

  useEffect(() => {
    if (onDataLoad && hasInitialDataLoaded && !isSubcategoryLoading && !isTotalCountLoading) {
      onDataLoad(currentPage, subcategoriesTotalPages, hasMoreSubcategories);
    }
  }, [onDataLoad, currentPage, subcategoriesTotalPages, hasMoreSubcategories, isSubcategoryLoading, isTotalCountLoading, hasInitialDataLoaded]);

  usePageCache(pageCacheKey, refreshSubcategories, subcategoryQuery, `SEO Subcategories Page ${currentPage}`);
  usePageCache(totalCountCacheKey, refreshTotalCount, totalSubcategoryCountQuery, `SEO Subcategories Total Count`);

  const handleRefresh = useCallback(async (refreshAllGroup = false) => {
    try {
      if (refreshAllGroup) {
        if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
          await cacheSystem.refreshGroup(subcategoriesGroup);
        } else {
          await refreshSubcategories(true);
          await refreshTotalCount(true);
        }
      } else {
        await refreshSubcategories(true);
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
          <div key={index} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg animate-pulse">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
            <div className="h-16 bg-blue-300 dark:bg-blue-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="">
      {paginationStaleWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">Updating subcategory data...</span>
          </div>
        </div>
      )}
      
      {hasError && subcategoriesToDisplay.length === 0 && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load subcategories.</p>
          <button onClick={() => handleRefresh(false)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
        </div>
      )}
      
      {/* NAVIGATION-FOCUSED Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
       {subcategoriesToDisplay.map((subcategory, index) => (
  <Link
    key={subcategory.slug}
    href={`/ai-seo/categories/${subcategory.slug}`}
    // ADDED: flex flex-col and h-full
    className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-[1.03] cursor-pointer"
    style={{
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }}
  >
    {/* Animated Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
    
    {/* Top Section: Icon + Badge + Text */}
    {/* ADDED: flex-grow here ensures this section fills empty space */}
    <div className="relative z-10 p-6 pb-4 flex-grow">
      <div className="flex items-start justify-between mb-4">
        {/* Icon Stack */}
        <div className="relative w-16 h-16 group-hover:scale-110 transition-all duration-500">
          <div className="absolute inset-0 bg-purple-500/30 dark:bg-purple-400/20 rounded-2xl -rotate-12 -translate-x-3 translate-y-1 group-hover:-rotate-[20deg] group-hover:-translate-x-5 transition-all duration-500 ease-out" />
          <div className="absolute inset-0 bg-blue-400/40 dark:bg-blue-400/20 rounded-2xl rotate-12 translate-x-3 -translate-y-1 group-hover:rotate-[22deg] group-hover:translate-x-5 transition-all duration-500 ease-out" />
          <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl z-10 border border-white/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        {/* Count Badge */}
        {subcategory.blogCount !== undefined && (
          <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {subcategory.blogCount} {subcategory.blogCount === 1 ? 'guide' : 'guides'}
            </span>
          </div>
        )}
      </div>
      
      {/* Title - Fixed Space Fix */}
      {/* ADDED: min-h-[3.5rem] ensures 1-line titles take up same space as 2-line titles */}
      <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {subcategory.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {subcategory.description}
      </p>
    </div>
    
    {/* Bottom CTA Section */}
    {/* This will now ALWAYS be pushed to the bottom because of flex-grow above */}
    <div className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 px-6 py-4 transition-all duration-300">
      <div className="flex items-center justify-between text-white">
        <span className="text-base font-bold">Explore Topic</span>
        <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
    </div>
    
    <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 opacity-0 group-hover:opacity-100 animate-pulse-border transition-opacity duration-400" />
  </Link>
))}
      </div>
      
      {subcategoriesToDisplay.length === 0 && !isSubcategoryLoading && !isTotalCountLoading && !hasError && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No subcategories found.</p>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4">Refresh</button>
        </div>
      )}
    </div>
  );
};

export default ReusableCachedSEOSubcategories;