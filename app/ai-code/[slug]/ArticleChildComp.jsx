//ArticleChildComp which is reusbale for all the sanity schemas
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



export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;


  // REPLACED with immediate skeleton logic:
  const [showSkeleton, setShowSkeleton] = useState(!serverData); // Show skeleton immediately if no serverData
  const [initialMount, setInitialMount] = useState(true);

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
    staleTime: 2 * 60 * 60 * 1000,
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

  // --- REPLACED SKELETON LOGIC ---
  useEffect(() => {
    // Handle initial mount
    if (initialMount) {
      setInitialMount(false);
      // If we have server data, hide skeleton immediately
      if (serverData) {
        setShowSkeleton(false);
      }
      return;
    }

    // Handle subsequent loading states
    if (articleLoading && !finalArticleData) {
      setShowSkeleton(true);
    } else if (finalArticleData) {
      // Small delay to prevent flash, but much shorter than before
      const timer = setTimeout(() => setShowSkeleton(false), 50);
      return () => clearTimeout(timer);
    }
  }, [articleLoading, finalArticleData, serverData, initialMount]);
  // --- END REPLACED SKELETON LOGIC ---


  // Related posts cache (lower priority)
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`,
    enableOffline: true,
    enabled: !!currentPostId && !!finalArticleData,
    staleTime: 2 * 60 * 60 * 1000,
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
    staleTime: 2 * 60 * 60 * 1000,
  }), [currentPostId, schemaType, finalArticleData]);

   const correctRelatedResourcesQuery = useMemo(() => 
    `*[_type == "freeResources" && references($articleId)] | order(_createdAt desc)[0...9]{
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
  // Note: These usePageCache calls should now pass an 'enabled' option
  // if you want to conditionally register/unregister based on `shouldLoadRelated` etc.
  // As per our previous discussion, the `usePageCache` hook itself needs to handle the `enabled` option.
  usePageCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    refreshArticle,
    articleQuery,
    `${schemaType}ArticleContent`,
    { enabled: true } // Main content is always enabled
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType),
    refreshRelatedPosts,
    relatedPostsQuery,
    `${schemaType}RelatedPosts`,
    { enabled: !!currentPostId && !!finalArticleData } // Only enable if related data should load
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
    refreshRelatedResources,
    correctRelatedResourcesQuery,
    `${schemaType}RelatedResources`,
    { enabled: !!currentPostId && !!finalArticleData } // Only enable if related data should load
  );

  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  // IMPROVED ERROR HANDLING (KEEP AS IS)
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

  // --- REPLACED SKELETON RETURN SECTION ---
  if (showSkeleton || (!finalArticleData && articleLoading)) {
    return (
      <div className="relative min-h-screen">
        {/* Add static navbar placeholder to prevent layout shift */}
        <div className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-md h-16"></div>
        <SlugSkeleton />
      </div>
    );
  }
  // --- END REPLACED SKELETON RETURN SECTION ---

  // If we still don't have any article data after all checks, show a message
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
      {/* <UnifiedCacheMonitor serverData={serverData} params={params} /> */}

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