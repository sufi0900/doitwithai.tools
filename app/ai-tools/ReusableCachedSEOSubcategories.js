// components/Blog/ReusableCachedSEOSubcategories.js
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

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
          console.log(`Manually refreshing entire group: ${subcategoriesGroup}`);
          await cacheSystem.refreshGroup(subcategoriesGroup);
        } else {
          console.warn("cacheSystem is not defined or refreshGroup method is missing. Cannot refresh group.");
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
          <Card
            key={subcategory.slug}
            sx={{
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px) scale(1.02)",
                boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
              },
              height: { xs: "auto", md: "220px" }, // Responsive height
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
            className="group cursor-pointer shadow-md hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CardActionArea 
              component={Link} 
              href={`/ai-seo/categories/${subcategory.slug}`}
              sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <CardContent sx={{ 
                flex: 1, 
                p: { xs: "16px !important", sm: "20px !important", md: "24px !important" }, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between",
                pt: { xs: "40px !important", sm: "48px !important", md: "24px !important" }, // Add padding-top to avoid badge overlap
              }}>
                <div>
                  <h2 className="line-clamp-2 text-lg font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {subcategory.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 sm:text-base transition-colors duration-300">
                    {subcategory.description}
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="group/button relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden w-fit sm:px-6 sm:py-2.5 sm:text-sm">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    {/* Button Content */}
                    <span className="relative z-10">Explore Category</span>
                    <ArrowForward
                      className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110"
                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                    />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-30 transition-opacity duration-300 blur-sm" />
                  </div>
                </div>
              </CardContent>
              
              {/* Static "Subcategory" Tag */}
              <div 
                className="absolute right-2 top-2 z-20 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 text-[10px] font-semibold capitalize text-white shadow-md backdrop-blur-sm border border-white/20 sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                <LocalOfferIcon style={{ fontSize: "8px" }} className="sm:fontSize-[10px]" />   
                AI Subcategory
              </div>
            </CardActionArea>
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-xl transform scale-0 group-hover:scale-100 transition-transform duration-500 sm:w-10 sm:h-10 sm:rounded-bl-2xl" />
          </Card>
        ))}
      </div>
      {subcategoriesToDisplay.length === 0 && !isSubcategoryLoading && !isTotalCountLoading && !hasError && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No subcategories found.</p>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Refresh All Subcategories</button>
        </div>
      )}
    </div>
  );
};

export default ReusableCachedSEOSubcategories;