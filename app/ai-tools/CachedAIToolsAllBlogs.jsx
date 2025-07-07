// ReusableCachedAllBlogs.jsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import CardComponent from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card";
import { urlForImage } from "@/sanity/lib/image";
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';
import { CacheStatusIndicator } from '@/React_Query_Caching/CacheStatusIndicator';

const ReusableCachedAllBlogs = ({
  currentPage = 1,
  limit = 10,
  documentType,
  pageSlugPrefix,
  onDataLoad,
  customQuery = null,
  isSearchMode = false ,
   initialPageData = null,    // Add this prop
  initialTotalCount = null,  // Add this prop
}) => {
  const [paginationStaleWarning, setPaginationStaleWarning] = useState(false);
  const start = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  // --- COMPONENT LIFECYCLE DEBUG LOGS (Controlled by useEffect) ---
  useEffect(() => {
    console.log(`%c[ReusableCachedAllBlogs Component] Mounted for Page ${currentPage}`, 'color: purple; font-weight: bold;');
    console.log(`%c[ReusableCachedAllBlogs Component] Current prop currentPage: ${currentPage}`, 'color: blue;');
    return () => {
      console.log(`%c[ReusableCachedAllBlogs Component] Unmounted for Page ${currentPage}`, 'color: red; font-weight: bold;');
    };
  }, [currentPage]); 

  // Add debugging for prop changes - this useEffect runs on every prop change
  useEffect(() => {
    console.log(`%c[ReusableCachedAllBlogs Component] Props changed - currentPage: ${currentPage}, documentType: ${documentType}, isSearchMode: ${isSearchMode}`, 'color: orange;');
  }, [currentPage, documentType, pageSlugPrefix, limit, isSearchMode]);
  // --- END COMPONENT LIFECYCLE DEBUG LOGS ---


  // Ensure typeIdentifier is always a string
  const typeIdentifier = useMemo(() => (
    (Array.isArray(documentType) && documentType.length > 0)
      ? documentType.join('-')
      : (typeof documentType === 'string' && documentType.length > 0)
        ? documentType
        : 'default-blog-type'
  ), [documentType]);

  // MEMOIZE THE QUERIES
  const memoizedPageQuery = useMemo(() => {
    return customQuery
      ? `${customQuery.trim().endsWith(']') ? customQuery.slice(0, -1) : customQuery}[${start}...${start + limit + 1}]`
      : `*[_type=="${Array.isArray(documentType) ? documentType.join('" || _type=="') : documentType}"] | order(publishedAt desc) {
          _id, title, slug, mainImage, readTime, tags, overview, body, publishedAt, _type,
          resourceType, resourceFormat, aiToolDetails, seoTitle, seoDescription, seoKeywords,
          altText, structuredData, "resourceFile": resourceFile.asset->, content, promptContent,
          "relatedArticle": relatedArticle->{title, slug}
        }[${start}...${start + limit + 1}]`;
  }, [customQuery, documentType, start, limit]);

  const memoizedTotalCountQuery = useMemo(() => {
    return customQuery
      ? `count(${customQuery.split('[')[0]})`
      : `count(*[_type=="${Array.isArray(documentType) ? documentType.join('" || _type=="') : documentType}"])`;
  }, [customQuery, documentType]);

  // MEMOIZE THE PARAMS OBJECT: This is crucial for stopping infinite loops related to params
  const memoizedParams = useMemo(() => ({}), []); 

  const pageCacheKey = useMemo(() => {
    return isSearchMode
      ? CACHE_KEYS.PAGE.SEARCH_RESULTS(typeIdentifier, cacheSystem.hashString(customQuery || '') + `_page_${currentPage}`)
      : CACHE_KEYS.PAGE.ALL_BLOGS_PAGINATED(typeIdentifier, currentPage);
  }, [isSearchMode, typeIdentifier, customQuery, currentPage]);

  const totalCountCacheKey = useMemo(() => {
    return CACHE_KEYS.PAGE.ALL_BLOGS_TOTAL(typeIdentifier);
  }, [typeIdentifier]);

  const paginationGroup = useMemo(() => `${typeIdentifier}-all-blogs`, [typeIdentifier]);

 const stableCacheOptions = useMemo(() => ({
    componentName: `${typeIdentifier || 'Custom'}-AllBlogs-Page${currentPage}`,
    enableOffline: true,
    group: paginationGroup,
    initialData: currentPage === 1 ? initialPageData : null, // Only use for first page
 
  }), [typeIdentifier, currentPage, paginationGroup, initialPageData]);

  const stableTotalCacheOptions = useMemo(() => ({
    componentName: `${typeIdentifier || 'Custom'}-AllBlogs-TotalCount`,
    enableOffline: true,
    group: paginationGroup,
    initialData: initialTotalCount, // Use initial total count

  }), [typeIdentifier, paginationGroup, initialTotalCount]);

  // Removed the direct console.log statements from here.
  // They will no longer spam the console on every component re-render.

 const {
  data: pageData,
  isLoading: pageIsLoading,
  error: pageError,
  refresh: refreshPageData,
  isStale: pageIsStale,
  cacheSource: pageCacheSource,
  lastUpdated: pageLastUpdated
} = useUnifiedCache(
  pageCacheKey,
  memoizedPageQuery,
  memoizedParams,
  { ...stableCacheOptions, schemaType: typeIdentifier }
);

const {
  data: totalData,
  isLoading: totalIsLoading,
  error: totalError,
  refresh: refreshTotal,
  isStale: totalIsStale,
  cacheSource: totalCacheSource,
  lastUpdated: totalLastUpdated
} = useUnifiedCache(
  totalCountCacheKey,
  memoizedTotalCountQuery,
  memoizedParams,
  { ...stableTotalCacheOptions, schemaType: typeIdentifier }
);

  usePageCache(pageCacheKey, refreshPageData, memoizedPageQuery, `${typeIdentifier}BlogsPage${currentPage}`);
  usePageCache(totalCountCacheKey, refreshTotal, memoizedTotalCountQuery, `${typeIdentifier}BlogsTotalCount`);

  const totalItems = typeof totalData === 'number' ? totalData : 0;
  const calculatedTotalPages = Math.ceil(totalItems / limit);
  const hasMore = (pageData && Array.isArray(pageData) && pageData.length > limit);

  useEffect(() => {
    if (onDataLoad && !pageIsLoading && !totalIsLoading) {
      onDataLoad(hasMore, calculatedTotalPages, totalItems);
    }
  }, [onDataLoad, hasMore, calculatedTotalPages, totalItems, pageIsLoading, totalIsLoading]);

  const handleRefresh = useCallback(async (refreshAllGroup = false) => {
    try {
      if (refreshAllGroup && typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
        console.log(`Manually refreshing entire group: ${paginationGroup}`);
        await cacheSystem.refreshGroup(paginationGroup);
      } else {
        console.log(`Manually refreshing current page and total count`);
        await refreshPageData();
        await refreshTotal();
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  }, [paginationGroup, refreshPageData, refreshTotal]);

  const hasError = pageError || totalError;

  // Consolidate loading/error states for indicator
  const combinedIsLoading = pageIsLoading || totalIsLoading;
  const combinedIsStale = pageIsStale || totalIsStale;
  let combinedCacheSource = pageCacheSource === 'network' ? 'network' : totalCacheSource === 'network' ? 'network' : (pageCacheSource || totalCacheSource);
  if (combinedIsLoading) {
      combinedCacheSource = 'loading';
  } else if (hasError) {
      combinedCacheSource = 'error';
  }
  const combinedLastUpdated = pageLastUpdated || totalLastUpdated;
  const combinedError = hasError;


  // Render skeleton cards if loading and no data is present yet
  if (combinedIsLoading && !pageData) {
    return (
      <div style={{ position: 'relative' }}>
      
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, index) => (
            <SkelCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Handle combined error state
  if (combinedError && !pageData) {
    return (
      <div style={{ position: 'relative', textAlign: 'center', padding: '20px' }}>
       
        <p className="text-red-500 dark:text-red-400">
          Failed to load content: {combinedError.message || 'An unknown error occurred.'}
        </p>
        <button onClick={() => handleRefresh(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Try Again
        </button>
      </div>
    );
  }

  const postsToDisplay = (pageData && Array.isArray(pageData)) ? pageData.slice(0, limit) : [];

  return (
    <div className="space-y-4" style={{ position: 'relative' }}>
      {/* Cache Status Indicator for this component instance */}


      {paginationStaleWarning && (
        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 1.667-.732 2.5-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 1.51.732 1.5z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">Updating pagination data...</span>
          </div>
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
            mainImage={post.mainImage ? urlForImage(post.mainImage).url() : "https://placehold.co/600x400/cccccc/000000?text=No+Image"} 
            slug={
              post._type === "seo"
                ? `/ai-seo/${post.slug.current}`
                : post._type === "freeairesources"
                  ? `/free-ai-resources/${post.slug.current}`
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

      {postsToDisplay.length === 0 && !combinedIsLoading && !combinedError && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No posts found for this page.
          </p>
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
