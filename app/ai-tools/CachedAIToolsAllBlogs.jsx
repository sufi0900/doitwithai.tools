"use client";
import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import React, { useEffect, useState } from 'react';
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";

const ReusableCachedAllBlogs = ({
  currentPage = 1,
  limit = 10,
  documentType,
  pageSlugPrefix,
  cacheKeyPrefix,
  onDataLoad, // This will now receive currentPage and totalPages
  customQuery
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const start = (currentPage - 1) * limit;

  const queryToUse = customQuery
    ? `${customQuery.slice(0, customQuery.lastIndexOf('}'))}[${start}...${start + limit + 1}]`
    : `*[_type == "${documentType}"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        mainImage,
        readTime,
        tags,
        overview,
        body,
        publishedAt,
        _type
      }[${start}...${start + limit + 1}]`;

  const paginationGroup = `${documentType || 'custom'}-all-blogs`;

  const {
    data,
    isLoading,
    error,
    refresh,
    refreshAllPages,
    isPaginationStale,
    totalCount, // Destructure totalCount
    totalPages // Destructure totalPages
  } = useCachedSanityData(
    `${cacheKeyPrefix}-page-${currentPage}`,
    queryToUse,
    {
      componentName: `${documentType || 'Custom'}-AllBlogs-Page${currentPage}`,
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

  // ✨ UPDATED: Pass totalPages and currentPage to onDataLoad
  useEffect(() => {
    if (onDataLoad) {
      onDataLoad(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onDataLoad]); // Depend on currentPage and totalPages

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
      <div className="-mx-4 flex flex-wrap justify-center">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="mx-2 mb-4 flex flex-wrap justify-center">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              Updating pagination data...
            </span>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800">
          Page: {currentPage} | Cache Key: {`${cacheKeyPrefix}-page-${currentPage}`} |
          Pagination Group: {paginationGroup} |
          Stale: {isPaginationStale ? 'Yes' : 'No'} |
          Total Count: {totalCount} | Total Pages: {totalPages}
        </div>
      )}

      <div className="-mx-4 flex flex-wrap justify-center">
        {postsToDisplay.map((post) => (
          <CardComponent
            key={post._id}
            ReadTime={post.readTime?.minutes}
            overview={post.overview}
            title={post.title}
            tags={post.tags}
            mainImage={urlForImage(post.mainImage).url()}
            slug={`/${post._type === "seo" ? "ai-seo" : pageSlugPrefix}/${post.slug.current}`}
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

export default ReusableCachedAllBlogs;