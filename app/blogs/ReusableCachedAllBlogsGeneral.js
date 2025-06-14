"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import React, { useEffect, useState } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";

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
  }
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  
  const start = (currentPage - 1) * limit;
  
  // Build query based on category selection
  const categoryFilter = selectedCategory === 'all' 
    ? `_type in ["makemoney", "aitool", "coding", "seo"]`
    : `_type == "${selectedCategory}"`;
    
  const queryToUse = `*[${categoryFilter}] | order(${sortBy}) {
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
  }[${start}...${start + limit + 1}]`;

  // Build cache key and pagination group
  const cacheKeyBase = selectedCategory === 'all' ? 'all-blogs-mixed' : `all-blogs-mixed-${selectedCategory}`;
  const paginationGroup = `${cacheKeyBase}-blogs`;
  
  const {
    data,
    isLoading,
    error,
    refresh,
    refreshAllPages,
    isPaginationStale,
    totalCount,
    totalPages
  } = useCachedSanityData(
    `${cacheKeyBase}-page-${currentPage}`,
    queryToUse,
    {
      componentName: `MixedBlogs-${selectedCategory}-Page${currentPage}`,
      usePageContext: true,
      enableOffline: true,
      forceRefresh: false,
      isPaginated: true,
      paginationGroup: paginationGroup,
      currentPage: currentPage,
      limit: limit
    }
  );

  useEffect(() => {
    if (isPaginationStale) {
      setPaginationStaleWarning(true);
      refresh();
    }
  }, [isPaginationStale, refresh]);

  useEffect(() => {
    if (data && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [data, paginationStaleWarning]);

  // Pass data to parent component
  useEffect(() => {
    if (onDataLoad) {
      onDataLoad(currentPage, totalPages, totalCount);
    }
  }, [currentPage, totalPages, totalCount, onDataLoad]);

  const handleRefresh = async (refreshAll = false) => {
    try {
      if (refreshAll) {
        await refreshAllPages();
      } else {
        await refresh();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <SkelCard />
          </div>
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load blog posts</p>
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
            Refresh All Pages
          </button>
        </div>
      </div>
    );
  }

  const postsToDisplay = data ? data.slice(0, limit) : [];

  return (
    <div className="space-y-4">
      {paginationStaleWarning && (
        <div className="text-center py-2 text-blue-600">
          Updating pagination data...
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800">
          Page: {currentPage} | CacheKey: {`${cacheKeyBase}-page-${currentPage}`} | 
          PaginationGroup: {paginationGroup} | Stale: {isPaginationStale ? 'Yes' : 'No'} | 
          TotalCount: {totalCount} | TotalPages: {totalPages}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {postsToDisplay.map((post) => (
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
        ))}
      </div>

      {postsToDisplay.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No posts found</p>
          <button
            onClick={() => handleRefresh(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh All Pages
          </button>
        </div>
      )}
    </div>
  );
};

export default ReusableCachedMixedBlogs;