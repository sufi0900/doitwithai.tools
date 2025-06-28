/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem'; // Needed for clearGroup/refreshGroup

const ReusableCachedMixedBlogs = ({
  currentPage = 1,
  limit = 5,
  selectedCategory = 'all',
  sortBy = 'publishedAt desc',
  onDataLoad, // Callback to send data back to parent
  schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  }
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

  // We no longer need these refs to clear cache on filter/sort change,
  // as we want to *retain* cached data across filter changes.
  // const prevSelectedCategoryRef = useRef(selectedCategory);
  // const prevSortByRef = useRef(sortBy);

  const start = (currentPage - 1) * limit;

  // Function to build the category filter string for GROQ
  const getCategoryFilter = useCallback((category) => {
    return category === 'all'
      ? `_type in ["makemoney", "aitool", "coding", "seo"]`
      : `_type == "${category}"`;
  }, []);

  // Function to get the query parameters based on category (if your backend needs them)
  const getQueryParams = useCallback((category) => {
    return category === 'all'
      ? { categories: ["makemoney", "aitool", "coding", "seo"] }
      : { categories: [category] };
  }, []);

  // 1. Query for the current page's data
  const pageQuery = `*[${getCategoryFilter(selectedCategory)}] | order(${sortBy}) {
    formattedDate,
    tags,
    readTime,
    _id,
    _type,
    title,
    slug,
    mainImage,
    overview,
    body,
    publishedAt
  }[${start}...${start + limit}]`;

  // 2. Query for the total count of items (for pagination calculation)
  const totalCountQuery = `count(*[${getCategoryFilter(selectedCategory)}])`;

  // Define a distinct group for all mixed blogs for cache invalidation
  // This group should encompass ALL fetched data by this component, regardless of filter.
  // It's used for a full "Refresh All" or if external content changes require it.
  const allBlogsGroup = 'all-blogs-mixed-content-group'; // Renamed for clarity on its purpose

  // Use unique cache keys based on the NEW CACHE_KEYS definitions
  const pageCacheKey = CACHE_KEYS.PAGE.MIXED_BLOGS_PAGINATED(currentPage, selectedCategory, sortBy);
  const totalCountCacheKey = CACHE_KEYS.PAGE.MIXED_BLOGS_TOTAL_COUNT(selectedCategory, sortBy);


  // FIRST useSanityCache call: Fetch paginated data
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    refresh: refreshPosts,
    isStale: isPostsStale,
    cacheSource: postsCacheSource, // Added for debugging
  } = useSanityCache(
    pageCacheKey,
    pageQuery,
    getQueryParams(selectedCategory),
    {
      componentName: `MixedBlogsPage_${currentPage}_${selectedCategory}_${sortBy}`,
      enableOffline: true,
      group: allBlogsGroup, // All data for mixed blogs belongs to this group
    }
  );

  // SECOND useSanityCache call: Fetch total count
  const {
    data: totalData,
    isLoading: isTotalLoading,
    error: totalError,
    refresh: refreshTotal,
    isStale: isTotalStale,
    cacheSource: totalCacheSource, // Added for debugging
  } = useSanityCache(
    totalCountCacheKey,
    totalCountQuery,
    getQueryParams(selectedCategory),
    {
      componentName: `MixedBlogsTotal_${selectedCategory}_${sortBy}`,
      enableOffline: true,
      group: allBlogsGroup, // Total count data also belongs to this group
    }
  );

  // Register the cache keys with usePageCache hook for UI status
  usePageCache(
    pageCacheKey,
    refreshPosts,
    pageQuery,
    `Mixed Blogs Page ${currentPage} (${selectedCategory}, ${sortBy})`
  );

  usePageCache(
    totalCountCacheKey,
    refreshTotal,
    totalCountQuery,
    `Mixed Blogs Total Count (${selectedCategory}, ${sortBy})`
  );
  // --- END CRITICAL FIX FOR usePageCache ---


  // Combine loading states
  const isLoading = isPostsLoading || isTotalLoading;

  // Calculate totalPages from fetched totalCount and limit
  const totalCount = typeof totalData === 'number' ? totalData : 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Handle stale warning and trigger refresh for both queries
  useEffect(() => {
    if (isPostsStale || isTotalStale) {
      setPaginationStaleWarning(true);
      // Trigger background refresh for current page and total count
      // This will update the cache in the background.
      refreshPosts();
      refreshTotal();
    } else if ((postsData && !isPostsStale) && (totalData && !isTotalStale) && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [isPostsStale, isTotalStale, postsData, totalData, paginationStaleWarning, refreshPosts, refreshTotal]);

  // Effect to notify parent about loaded data and pagination details
  useEffect(() => {
    // Only call onDataLoad if data is stable and not currently loading.
    // Check if postsData is not null/undefined and totalData is a number.
    if (onDataLoad && postsData !== null && typeof totalData === 'number' && !isLoading) {
      // console.log("Child sending data to parent:", { currentPage, totalPages, totalCount }); // Debugging
      onDataLoad(currentPage, totalPages, totalCount);
    }
  }, [currentPage, totalPages, totalCount, onDataLoad, postsData, totalData, isLoading]);

  // --- REMOVED THE USEFFECT THAT CLEARS CACHE ON FILTER/SORT CHANGE ---
  // The problem was here: it was clearing the entire group, deleting previously cached data.
  // We want to *retain* cached data for other filters/sorts.
  // Instead, useSanityCache should just look for the specific key in cache.
  /*
  useEffect(() => {
    if (prevSelectedCategoryRef.current !== selectedCategory || prevSortByRef.current !== sortBy) {
        if (typeof cacheSystem !== 'undefined' && cacheSystem.clearGroup) {
            cacheSystem.clearGroup(allBlogsGroup);
        } else {
            console.warn("cacheSystem is not defined or clearGroup method is missing. Cannot clear cache group.");
        }
    }
    prevSelectedCategoryRef.current = selectedCategory;
    prevSortByRef.current = sortBy;
  }, [selectedCategory, sortBy, allBlogsGroup]);
  */
  // --- END REMOVAL ---


  const handleRefresh = useCallback(async (refreshAll = false) => {
    try {
      if (refreshAll) {
        // Refresh the entire group if requested. This is for a full re-sync.
        if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
            await cacheSystem.refreshGroup(allBlogsGroup);
        } else {
            console.warn("cacheSystem is not defined or refreshGroup method is missing. Cannot refresh cache group.");
            // Fallback to individual refresh if global cacheSystem isn't available
            await refreshPosts();
            await refreshTotal();
        }
      } else {
        // Only refresh the current page and its total count
        await refreshPosts();
        await refreshTotal();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [allBlogsGroup, refreshPosts, refreshTotal]);

  const hasError = (postsError || totalError) && (!postsData || postsData.length === 0);

  const postsToDisplay = postsData || [];

  return (
    <div className="space-y-4">
      {paginationStaleWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800 text-center text-yellow-800 dark:text-yellow-200 font-medium">
          Updating blog data...
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800">
          Page: {currentPage} | Category: {selectedCategory} | Sort: {sortBy} |
          Page CacheKey: {pageCacheKey} | Total Count CacheKey: {totalCountCacheKey} |
          Group: {allBlogsGroup} | Page Stale: {isPostsStale ? 'Yes' : 'No'} | Total Stale: {isTotalStale ? 'Yes' : 'No'} |
          Total Count: {totalCount} | Total Pages: {totalPages} |
          Posts Data Length: {postsData?.length || 0} |
          Posts Cache Source: {postsCacheSource} | Total Cache Source: {totalCacheSource}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {isLoading ? (
          Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <SkelCard />
            </div>
          ))
        ) : hasError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500 mb-4">Failed to load blog posts.</p>
            <div className="space-x-2">
              <button
                onClick={() => handleRefresh(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry Current Page
              </button>
              <button
                onClick={() => handleRefresh(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Refresh All Blog Data (Full Re-sync)
              </button>
            </div>
          </div>
        ) : postsToDisplay.length > 0 ? (
          postsToDisplay.map((post) => (
            <CardComponent
              key={post._id}
              ReadTime={post.readTime?.minutes}
              overview={post.overview}
              title={post.title}
              tags={post.tags}
              mainImage={urlForImage(post.mainImage).url()}
              slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
              publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No posts found for this selection.</p>
            <button
              onClick={() => handleRefresh(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh All Blog Data (Full Re-sync)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusableCachedMixedBlogs;