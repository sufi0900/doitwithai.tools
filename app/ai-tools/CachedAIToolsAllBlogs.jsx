// ReusableCachedAllBlogs.jsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache'; // Correct hook import
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

const ReusableCachedAllBlogs = ({
  currentPage = 1,
  limit = 10,
  documentType, // This can be a string or an array of strings
  pageSlugPrefix,
  onDataLoad,
  customQuery = null,
  isSearchMode = false
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const start = (currentPage - 1) * limit;

  // Ensure typeIdentifier is always a string
  const typeIdentifier = (Array.isArray(documentType) && documentType.length > 0)
    ? documentType.join('-')
    : (typeof documentType === 'string' && documentType.length > 0)
      ? documentType
      : 'default-blog-type'; // Using a more distinct fallback

  const pageQuery = customQuery
    ? `${customQuery.trim().endsWith(']') ? customQuery.slice(0, -1) : customQuery}[${start}...${start + limit + 1}]`
    : `*[_type=="${Array.isArray(documentType) ? documentType.join('" || _type=="') : documentType}"]|order(publishedAt desc){_id,title,slug,mainImage,readTime,tags,overview,body,publishedAt,_type,resourceType,resourceFormat,aiToolDetails,seoTitle,seoDescription,seoKeywords,altText,structuredData,"resourceFile":resourceFile.asset->,content,promptContent,"relatedArticle":relatedArticle->{title,slug}}[${start}...${start + limit + 1}]`;

  const totalCountQuery = customQuery
    ? `count(${customQuery.split('[')[0]})`
    : `count(*[_type=="${Array.isArray(documentType) ? documentType.join('" || _type=="') : documentType}"])`;

  const pageCacheKey = isSearchMode
    ? CACHE_KEYS.PAGE.SEARCH_RESULTS(typeIdentifier, cacheSystem.hashString(customQuery || '') + `_page_${currentPage}`)
    : CACHE_KEYS.PAGE.ALL_BLOGS_PAGINATED(typeIdentifier, currentPage);

  const totalCountCacheKey = CACHE_KEYS.PAGE.ALL_BLOGS_TOTAL(typeIdentifier);

  const paginationGroup = `${typeIdentifier}-all-blogs`;

  // --- DEBUGGING LOGS (Optional, remove after fixing) ---
  console.log("ReusableCachedAllBlogs - Debugging values for useSanityCache and usePageCache:");
  console.log(`  typeIdentifier: "${typeIdentifier}"`);
  console.log(`  pageCacheKey: "${pageCacheKey}"`);
  console.log(`  totalCountCacheKey: "${totalCountCacheKey}"`);
  console.log(`  paginationGroup: "${paginationGroup}"`);
  // --- END DEBUGGING LOGS ---

  const { data, isLoading, error, refresh, isStale } = useSanityCache(
    pageCacheKey,
    pageQuery,
    {},
    {
      componentName: `${typeIdentifier || 'Custom'}-AllBlogs-Page${currentPage}`,
      enableOffline: true,
      group: paginationGroup,
    }
  );

  const {
    data: totalData,
    isLoading: totalLoading,
    error: totalError,
    refresh: refreshTotal,
    isStale: totalIsStale,
  } = useSanityCache(
    totalCountCacheKey,
    totalCountQuery,
    {},
    {
      componentName: `${typeIdentifier || 'Custom'}-AllBlogs-TotalCount`,
      enableOffline: true,
      group: paginationGroup,
    }
  );

  // --- CRITICAL FIX: Use the usePageCache hook correctly for each cache key ---
  // Register the paginated blogs data
  usePageCache(
    pageCacheKey,
    refresh, // The refresh function for this specific data
    pageQuery, // The query string for this specific data
    `${typeIdentifier} Blogs Page ${currentPage}` // A descriptive label for the UI button
  );

  // Register the total count data
  usePageCache(
    totalCountCacheKey,
    refreshTotal, // The refresh function for the total count
    totalCountQuery, // The query string for the total count
    `${typeIdentifier} Blogs Total Count` // A descriptive label for the UI button
  );
  // --- END CRITICAL FIX ---


  const totalItems = typeof totalData === 'number' ? totalData : 0;
  const calculatedTotalPages = Math.ceil(totalItems / limit);
  const hasMore = (data?.length || 0) > limit;

  useEffect(() => {
    if (isStale || totalIsStale) {
      setPaginationStaleWarning(true);
      refresh();
      refreshTotal();
    } else if ((data && !isStale) && (totalData && !totalIsStale) && paginationStaleWarning) {
      setPaginationStaleWarning(false);
    }
  }, [isStale, totalIsStale, data, totalData, paginationStaleWarning, refresh, refreshTotal]);

  useEffect(() => {
    if (onDataLoad && !isLoading && !totalLoading) {
      onDataLoad(hasMore, calculatedTotalPages, totalItems);
    }
  }, [onDataLoad, hasMore, calculatedTotalPages, totalItems, isLoading, totalLoading]);

  const handleRefresh = useCallback(async (refreshAllGroup = false) => {
    try {
      if (refreshAllGroup && typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
        await cacheSystem.refreshGroup(paginationGroup);
      } else {
        await refresh();
        await refreshTotal();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [paginationGroup, refresh, refreshTotal]);

  const hasError = error || totalError;

  if (isLoading || totalLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit }).map((_, index) => (
          <SkelCard key={index} />
        ))}
      </div>
    );
  }

  const postsToDisplay = data ? data.slice(0, limit) : [];

  return (
    <div className="space-y-4">
      {paginationStaleWarning && (
        <div className="bg-yellow    border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 1.667-.732 2.5-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 1.51.732 1.5z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">Updating pagination data...</span>
          </div>
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800">
          Page: {currentPage} | CacheKey: {pageCacheKey} | TotalCacheKey: {totalCountCacheKey} | PaginationGroup: {paginationGroup} | PageStale: {isStale ? 'Yes' : 'No'} | TotalStale: {totalIsStale ? 'Yes' : 'No'} | TotalItems: {totalItems} | TotalPages: {calculatedTotalPages} | HasMore: {hasMore ? 'Yes' : 'No'}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {postsToDisplay.map((post) => (
          <CardComponent
            key={post._id}
            ReadTime={post.readTime?.minutes}
            overview={post.overview}
            title={post.title}
            tags={post.tags}
            mainImage={urlForImage(post.mainImage).url()}
            slug={
              post._type === "seo"
                ? `/ai-seo/${post.slug.current}`
                : post._type === "freeResources"
                  ? `/free-resources/${post.slug.current}`
                  : `/${pageSlugPrefix}/${post.slug.current}`
            }
            publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            resourceType={post.resourceType}
            resourceFormat={post.resourceFormat}
            resourceLink={post.resourceLink}
            resourceLinkType={post.resourceLinkType}
            previewSettings={post.previewSettings}
            resourceFile={post.resourceFile}
            content={post.content}
            promptContent={post.promptContent}
            relatedArticle={post.relatedArticle}
            aiToolDetails={post.aiToolDetails}
            seoTitle={post.seoTitle}
            seoDescription={post.seoDescription}
            seoKeywords={post.seoKeywords}
            altText={post.altText}
            structuredData={post.structuredData}
          />
        ))}
      </div>
      {postsToDisplay.length === 0 && !isLoading && !totalLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No posts found for this page.</p>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Refresh All Pages
          </button>
        </div>
      )}
    </div>
  );
};

export default ReusableCachedAllBlogs;