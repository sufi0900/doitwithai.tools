/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
// Corrected usePageCache import path
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

  const start = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  // Function to build the category filter string for GROQ
  const getCategoryFilter = useCallback((category) => {
    return category === 'all'
      ? `_type in ["makemoney", "aitool", "coding", "seo"]`
      : `_type == "${category}"`;
  }, []); // Dependencies are stable, so useCallback is fine.

  // Function to get the query parameters (if your backend needs them)
  const getQueryParams = useCallback((category) => {
    return category === 'all'
      ? { categories: ["makemoney", "aitool", "coding", "seo"] }
      : { categories: [category] };
  }, []); // Dependencies are stable, so useCallback is fine.

  // Memoize the pageQuery string
  const pageQuery = useMemo(() => `*[${getCategoryFilter(selectedCategory)}] | order(${sortBy}) {
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
  }[${start}...${start + limit}]`, [getCategoryFilter, selectedCategory, sortBy, start, limit]);

  // Memoize the totalCountQuery string
  const totalCountQuery = useMemo(() => `count(*[${getCategoryFilter(selectedCategory)}])`, [getCategoryFilter, selectedCategory]);

  // Define a distinct group for all mixed blogs for cache invalidation
  const allBlogsGroup = useMemo(() => 'all-blogs-mixed-content-group', []); // Memoized to be stable

  // Use unique cache keys based on the NEW CACHE_KEYS definitions
  const pageCacheKey = useMemo(() => CACHE_KEYS.PAGE.MIXED_BLOGS_PAGINATED(currentPage, selectedCategory, sortBy), [currentPage, selectedCategory, sortBy]);
  const totalCountCacheKey = useMemo(() => CACHE_KEYS.PAGE.MIXED_BLOGS_TOTAL_COUNT(selectedCategory, sortBy), [selectedCategory, sortBy]);

  // Memoize options objects for useSanityCache calls
  const stablePageOptions = useMemo(() => ({
    componentName: `MixedBlogsPage_${currentPage}_${selectedCategory}_${sortBy}`,
    enableOffline: true,
    group: allBlogsGroup,
  }), [currentPage, selectedCategory, sortBy, allBlogsGroup]);

  const stableTotalOptions = useMemo(() => ({
    componentName: `MixedBlogsTotal_${selectedCategory}_${sortBy}`,
    enableOffline: true,
    group: allBlogsGroup,
  }), [selectedCategory, sortBy, allBlogsGroup]);


  // FIRST useSanityCache call: Fetch paginated data
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    refresh: refreshPosts,
    isStale: isPostsStale,
    cacheSource: postsCacheSource,
  } = useSanityCache(
    pageCacheKey,
    pageQuery,
    getQueryParams(selectedCategory),
    stablePageOptions
  );

  // SECOND useSanityCache call: Fetch total count
  const {
    data: totalData,
    isLoading: isTotalLoading,
    error: totalError,
    refresh: refreshTotal,
    isStale: isTotalStale,
    cacheSource: totalCacheSource,
  } = useSanityCache(
    totalCountCacheKey,
    totalCountQuery,
    getQueryParams(selectedCategory),
    stableTotalOptions
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
      refreshPosts(false); // Pass false for background refresh
      refreshTotal(false); // Pass false for background refresh
    } else if ((postsData && !isPostsStale) && (totalData && !isTotalStale) && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [isPostsStale, isTotalStale, postsData, totalData, paginationStaleWarning, refreshPosts, refreshTotal]);

  // Effect to notify parent about loaded data and pagination details
  useEffect(() => {
    // Only call onDataLoad if data is stable and not currently loading.
    if (onDataLoad && postsData !== null && typeof totalData === 'number' && !isLoading) {
      onDataLoad(currentPage, totalPages, totalCount);
    }
  }, [currentPage, totalPages, totalCount, onDataLoad, postsData, totalData, isLoading]);

  const handleRefresh = useCallback(async (refreshAll = false) => {
    try {
      if (refreshAll) {
        if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
          console.log("Refreshing entire group:", allBlogsGroup);
          await cacheSystem.refreshGroup(allBlogsGroup);
        } else {
          console.warn("cacheSystem is not defined or refreshGroup method is missing. Cannot refresh cache group.");
          await refreshPosts(true); // Fallback to individual force refresh
          await refreshTotal(true);
        }
      } else {
        await refreshPosts(true); // Force refresh current page
        await refreshTotal(true); // Force refresh current page's total count
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [allBlogsGroup, refreshPosts, refreshTotal]);

  // Determine if there's an error and NO data to display as a fallback
  const hasErrorAndNoData = (postsError || totalError) && (!postsData || postsData.length === 0);

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
        {isLoading && postsToDisplay.length === 0 ? ( // Show skeleton only if loading AND no data is present yet
          Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <SkelCard />
            </div>
          ))
        ) : hasErrorAndNoData ? ( // Show error message if there's an error AND no data
          <div className="col-span-full text-center py-8">
            <p className="text-red-500 mb-4">Failed to load blog posts. {postsError?.message || totalError?.message || ''}</p>
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
        ) : postsToDisplay.length > 0 ? ( // If data exists, display posts
          postsToDisplay.map((post) => (
            <CardComponent
              key={post._id}
              ReadTime={post.readTime?.minutes}
              overview={post.overview}
              title={post.title}
              tags={post.tags}
              mainImage={post.mainImage ? urlForImage(post.mainImage).url() : "https://placehold.co/600x400/cccccc/000000?text=No+Image"}
              slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
              publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            />
          ))
        ) : ( // If no data, no loading, and no error, show "No posts found"
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
