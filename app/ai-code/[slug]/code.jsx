"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from 'next/dynamic';
import "@/styles/customanchor.css";
import SlugSkeleton from '@/components/Blog/Skeleton/SlugSkeleton';

// Caching System Imports
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';

// Dynamic imports with better loading strategy
const BlogLayout = dynamic(() => import("@/app/ai-tools/[slug]/BlogLayout"), {
  loading: () => null, // Don't show loading here - we'll handle it ourselves
  ssr: false
});

const UnifiedCacheMonitor = dynamic(() => import("@/React_Query_Caching/UnifiedCacheMonitor"), {
  loading: () => null,
  ssr: false
});

export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonTimeout, setSkeletonTimeout] = useState(null);

  // Memoized configurations (same as before)
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools", 
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news",
    freeairesources: "free-ai-resources",
  }), []);

  const imgdesc = useMemo(() => ({
    block: {
      normal: ({ children }) => (
        <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
          {children}
        </p>
      ),
      a: ({ children }) => (
        <a className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      ),
    },
  }), []);

  // Priority: Article content cache
  const articleCacheOptions = useMemo(() => ({
    componentName: `${schemaType}ArticleContent`,
    enableOffline: true,
    initialData: serverData,
    forceRefresh: false,
    staleTime: 5 * 60 * 1000,
  }), [serverData, schemaType]);

  const articleQuery = useMemo(() => 
    `*[_type == $schemaType && slug.current == $currentSlug][0]`, 
    [schemaType]
  );

  const articleQueryParams = useMemo(() => ({
    schemaType: schemaType,
    currentSlug: currentSlug
  }), [schemaType, currentSlug]);

  const {
    data: cachedArticleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle,
    isStale: articleIsStale
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    articleQuery,
    articleQueryParams,
    { ...articleCacheOptions, schemaType }
  );

  // Determine final article data
  const finalArticleData = cachedArticleData || serverData;
  const currentPostId = finalArticleData?._id;

  // **SMART LOADING SKELETON LOGIC**
  useEffect(() => {
    // Only show skeleton if:
    // 1. We're actually loading (not just stale)
    // 2. We don't have ANY data (neither cached nor server)
    // 3. It's been more than 300ms (avoid flash for quick loads)
    
    if (articleLoading && !finalArticleData) {
      const timeout = setTimeout(() => {
        setShowSkeleton(true);
      }, 300); // 300ms delay before showing skeleton
      
      setSkeletonTimeout(timeout);
      
      return () => {
        clearTimeout(timeout);
        setSkeletonTimeout(null);
      };
    } else {
      // Clear skeleton immediately when data is available
      setShowSkeleton(false);
      if (skeletonTimeout) {
        clearTimeout(skeletonTimeout);
        setSkeletonTimeout(null);
      }
    }
  }, [articleLoading, finalArticleData, skeletonTimeout]);

  // Related posts cache (lower priority)
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`,
    enableOffline: true,
    enabled: !!currentPostId && !!finalArticleData,
    staleTime: 10 * 60 * 1000,
  }), [currentPostId, schemaType, finalArticleData]);

  const relatedPostsQuery = useMemo(() => 
    `*[_type == $schemaType && _id != $currentPostId] | order(_createdAt desc)[0...3]`, 
    [schemaType]
  );

  const relatedPostsQueryParams = useMemo(() => ({
    schemaType: schemaType,
    currentPostId: currentPostId
  }), [schemaType, currentPostId]);

  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
    error: relatedPostsError,
    refresh: refreshRelatedPosts,
    isStale: relatedPostsStale
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType),
    relatedPostsQuery,
    relatedPostsQueryParams,
    { ...relatedPostsOptions, schemaType }
  );

  // Related resources cache (lowest priority)
  const relatedResourcesOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedResources`,
    enableOffline: true,
    enabled: !!currentPostId && !!finalArticleData,
    staleTime: 15 * 60 * 1000,
  }), [currentPostId, schemaType, finalArticleData]);

  const correctRelatedResourcesQuery = useMemo(() => 
    `*[_type == "freeResources" && references($articleId)]{
      _id, title, tags, mainImage, overview, resourceType, resourceFormat, 
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->, content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug, _id, _type},
      seoTitle, seoDescription, seoKeywords, altText, structuredData
    }`, []
  );

  const relatedResourcesQueryParams = useMemo(() => ({
    articleId: currentPostId
  }), [currentPostId]);

  const {
    data: relatedResources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refresh: refreshRelatedResources,
    isStale: resourcesStale
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
    correctRelatedResourcesQuery,
    relatedResourcesQueryParams,
    { ...relatedResourcesOptions, schemaType: 'freeResources' }
  );

  // Register cache operations
  usePageCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    refreshArticle,
    articleQuery,
    `${schemaType}ArticleContent`
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType),
    refreshRelatedPosts,
    relatedPostsQuery,
    `${schemaType}RelatedPosts`
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
    refreshRelatedResources,
    correctRelatedResourcesQuery,
    `${schemaType}RelatedResources`
  );

  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  // **IMPROVED ERROR HANDLING**
  if (articleError && !finalArticleData) {
    const isOfflineError = !navigator.onLine || 
      articleError.message.includes('offline') || 
      articleError.message.includes('network');

    return (
      <div className="text-center py-8">
        <div className="mb-4">
          {isOfflineError ? (
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <span className="text-orange-600 dark:text-orange-400">📡</span>
              <span className="ml-2 text-orange-800 dark:text-orange-200">
                You appear to be offline
              </span>
            </div>
          ) : (
            <p className="text-red-500">
              Failed to load article: {articleError.message || "Unknown error"}
            </p>
          )}
        </div>
        <button
          onClick={handleRefreshArticle}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // **SMART LOADING STATE** - Only show skeleton when truly needed
  if (showSkeleton) {
    return (
      <div className="relative">
        <SlugSkeleton />
      </div>
    );
  }

  // If we still don't have any article data, show a message
  if (!finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No article data available. Please check your connection and try again.
        </p>
        <button
          onClick={handleRefreshArticle}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>

      <UnifiedCacheMonitor serverData={serverData} params={params} />

      {/* Main Blog Layout - Show immediately when data is available */}
      <BlogLayout
        data={finalArticleData}
        loading={false} // Never pass loading true here since we handle it above
        relatedPosts={relatedPosts || []}
        relatedPostsLoading={relatedPostsLoading}
        relatedResources={relatedResources || []}
        resourcesLoading={resourcesLoading}
        schemaSlugMap={schemaSlugMap}
        imgdesc={imgdesc}
        onRefreshArticle={handleRefreshArticle}
      />
    </>
  );
}