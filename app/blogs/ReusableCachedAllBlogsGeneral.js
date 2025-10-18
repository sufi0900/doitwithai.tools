/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache'; 
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';

const ReusableCachedMixedBlogs = ({
  currentPage = 1,
  limit = 5,
  selectedCategory = 'all',
  sortBy = 'publishedAt desc',
  onDataLoad,
  schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  },
  initialPageData = null,
  initialTotalCount = null,
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const [filterChangeDetected, setFilterChangeDetected] = useState(false);
  
  // Track previous values to detect changes
  const [prevSelectedCategory, setPrevSelectedCategory] = useState(selectedCategory);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);

  // Detect filter changes
  useEffect(() => {
    if (selectedCategory !== prevSelectedCategory || sortBy !== prevSortBy) {
      setFilterChangeDetected(true);
      console.log('Filter change detected:', { selectedCategory, sortBy });
      setPrevSelectedCategory(selectedCategory);
      setPrevSortBy(sortBy);
    }
  }, [selectedCategory, prevSelectedCategory, sortBy, prevSortBy]);

  const start = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  // Function to build the category filter string for GROQ
  const getCategoryFilter = useCallback((category) => {
    const allSchemaTypes = ["makemoney", "aitool", "coding", "seo"];
    return category === 'all'
      ? `_type in ["${allSchemaTypes.join('","')}"]`
      : `_type=="${category}"`;
  }, []);

  // Function to get the schema types for useUnifiedCache's schemaType option
  const getQuerySchemaTypes = useCallback((category) => {
    return category === 'all'
      ? ["makemoney", "aitool", "coding", "seo"]
      : [category];
  }, []);

  // Memoize the page Query string - will update when selectedCategory or sortBy change
  const pageQuery = useMemo(() => {
    const query = `*[${getCategoryFilter(selectedCategory)}]|order(${sortBy}){formattedDate,tags,readTime,_id,_type,title,slug,mainImage,overview,body,publishedAt}[${start}...${start + limit}]`;
    console.log('Page query updated:', query);
    return query;
  }, [getCategoryFilter, selectedCategory, sortBy, start, limit]);

  // Memoize the totalCount Query string
  const totalCountQuery = useMemo(() => {
    const query = `count(*[${getCategoryFilter(selectedCategory)}])`;
    console.log('Total count query updated:', query);
    return query;
  }, [getCategoryFilter, selectedCategory]);

  const allBlogsGroup = useMemo(() => 'all-blogs-mixed-content-group', []);

  // CRITICAL FIX: Create unique cache keys that change with filters
  const pageCacheKey = useMemo(() => {
    const key = CACHE_KEYS.PAGE.MIXED_BLOGS_PAGINATED(currentPage, selectedCategory, sortBy);
    console.log('Page cache key:', key);
    return key;
  }, [currentPage, selectedCategory, sortBy]);

  const totalCountCacheKey = useMemo(() => {
    const key = CACHE_KEYS.PAGE.MIXED_BLOGS_TOTAL_COUNT(selectedCategory, sortBy);
    console.log('Total count cache key:', key);
    return key;
  }, [selectedCategory, sortBy]);

  const stablePageOptions = useMemo(() => ({
    componentName: `MixedBlogsPage_${currentPage}_${selectedCategory}_${sortBy}`,
    enableOffline: true,
    group: allBlogsGroup,
    initialData: currentPage === 1 && selectedCategory === 'all' ? initialPageData : null,
    schemaType: getQuerySchemaTypes(selectedCategory),
  }), [currentPage, selectedCategory, sortBy, allBlogsGroup, initialPageData, getQuerySchemaTypes]);

  const stableTotalOptions = useMemo(() => ({
    componentName: `MixedBlogsTotal_${selectedCategory}_${sortBy}`,
    enableOffline: true,
    group: allBlogsGroup,
    initialData: selectedCategory === 'all' ? initialTotalCount : null,
    schemaType: getQuerySchemaTypes(selectedCategory),
  }), [selectedCategory, sortBy, allBlogsGroup, initialTotalCount, getQuerySchemaTypes]);

  // Fetch paginated data
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    refresh: refreshPosts,
    isStale: isPostsStale,
    cacheSource: postsCacheSource,
  } = useUnifiedCache(
    pageCacheKey,
    pageQuery,
    {},
    stablePageOptions
  );

  // Fetch total count
  const {
    data: totalData,
    isLoading: isTotalLoading,
    error: totalError,
    refresh: refreshTotal,
    isStale: isTotalStale,
    cacheSource: totalCacheSource,
  } = useUnifiedCache(
    totalCountCacheKey,
    totalCountQuery,
    {},
    stableTotalOptions
  );

  // Register cache keys with usePageCache
  usePageCache(pageCacheKey, refreshPosts, pageQuery, `MixedBlogsPage${currentPage}(${selectedCategory},${sortBy})`);
  usePageCache(totalCountCacheKey, refreshTotal, totalCountQuery, `MixedBlogsTotalCount(${selectedCategory},${sortBy})`);

  const postsToDisplay = postsData || [];
  const isLoading = isPostsLoading || isTotalLoading;
  const hasExistingData = postsToDisplay.length > 0;

  // Calculate pagination info
  const totalCount = typeof totalData === 'number' ? totalData : 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Handle stale warning
  useEffect(() => {
    if (isPostsStale || isTotalStale) {
      setPaginationStaleWarning(true);
      if (typeof window !== 'undefined' && window.navigator.onLine) {
        refreshPosts(false);
        refreshTotal(false);
      }
    } else if ((postsData && !isPostsStale) && (totalData !== undefined && !isTotalStale) && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [isPostsStale, isTotalStale, postsData, totalData, paginationStaleWarning, refreshPosts, refreshTotal]);

  // Clear filter change flag after data loads
  useEffect(() => {
    if (!isLoading && filterChangeDetected) {
      setFilterChangeDetected(false);
    }
  }, [isLoading, filterChangeDetected]);

  // Report data to parent
  useEffect(() => {
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
          console.warn("cacheSystem.refreshGroup not available");
          await refreshPosts(true);
          await refreshTotal(true);
        }
      } else {
        await refreshPosts(true);
        await refreshTotal(true);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [allBlogsGroup, refreshPosts, refreshTotal]);

  const hasErrorAndNoData = (postsError || totalError) && (!postsData || postsData.length === 0);

  return (
    <div className="space-y-4">
      {filterChangeDetected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800 text-center text-blue-800 dark:text-blue-200 font-medium flex items-center justify-center">
          <svg className="h-5 w-5 text-blue-600 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Applying filters...
        </div>
      )}

      {paginationStaleWarning && !filterChangeDetected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800 text-center text-yellow-800 dark:text-yellow-200 font-medium">
          Updating blog data...
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800 overflow-auto">
          Page: {currentPage} | Category: {selectedCategory} | Sort: {sortBy} |
          Page CacheKey: {pageCacheKey} | Total Count CacheKey: {totalCountCacheKey} |
          Group: {allBlogsGroup} | Page Stale: {isPostsStale ? 'Yes' : 'No'} | Total Stale: {isTotalStale ? 'Yes' : 'No'} |
          Total Count: {totalCount} | Total Pages: {totalPages} |
          Posts Data Length: {postsData?.length || 0} |
          Posts Cache Source: {postsCacheSource} | Total Cache Source: {totalCacheSource}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {isLoading && postsToDisplay.length === 0 ? (
          Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <SkelCard />
            </div>
          ))
        ) : hasErrorAndNoData ? (
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
                Refresh All Blog Data
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
              mainImage={post.mainImage ? urlForImage(post.mainImage).url() : "https://placehold.co/600x400/cccccc/000000?text=No+Image"}
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
              Refresh All Blog Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusableCachedMixedBlogs;