"use client";
import React, { useState, useMemo, useCallback, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';

// Progressive loading: Load non-critical components only when needed
const BlogSidebar = dynamic(() => import("@/app/ai-tools/[slug]/BlogSidebar"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

const RelatedPostsSection = dynamic(() => import("@/app/ai-tools/[slug]/RelatedPostsSection"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>,
  ssr: false
});

const RelatedResources = dynamic(() => import("@/app/free-ai-resources/RelatedResources"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>,
  ssr: false
});

const RecentPost = dynamic(() => import("@/components/RecentPost/RecentHome"), {
  ssr: false
});

const UnifiedCacheMonitor = dynamic(() => import("@/React_Query_Caching/UnifiedCacheMonitor"), {
  ssr: false
});

// Core components that should load immediately
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import "@/styles/customanchor.css";

export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;
  const [shouldLoadSidebar, setShouldLoadSidebar] = useState(false);
  const [shouldLoadRelated, setShouldLoadRelated] = useState(false);

  // Memoize static configurations
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

  // Article cache options
  const articleCacheOptions = useMemo(() => ({
    componentName: `${schemaType}ArticleContent`,
    enableOffline: true,
    initialData: serverData,
    forceRefresh: false,
  }), [serverData, schemaType]);

  // Dynamic article query
  const articleQuery = useMemo(() => 
    `*[_type==$schemaType && slug.current==$currentSlug][0]`, 
    [schemaType]
  );

  const articleQueryParams = useMemo(() => ({
    schemaType: schemaType,
    currentSlug: currentSlug
  }), [schemaType, currentSlug]);

  // Main article content cache
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

  const finalArticleData = cachedArticleData || serverData;
  const currentPostId = finalArticleData?._id;

  // Progressive loading trigger - load sidebar after main content is ready
  React.useEffect(() => {
    if (finalArticleData && !articleLoading) {
      const timer = setTimeout(() => setShouldLoadSidebar(true), 100);
      return () => clearTimeout(timer);
    }
  }, [finalArticleData, articleLoading]);

  // Load related content after sidebar
  React.useEffect(() => {
    if (shouldLoadSidebar) {
      const timer = setTimeout(() => setShouldLoadRelated(true), 200);
      return () => clearTimeout(timer);
    }
  }, [shouldLoadSidebar]);

  // Related posts cache - only load when needed
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`,
    enableOffline: true,
    enabled: !!currentPostId && shouldLoadRelated,
  }), [currentPostId, schemaType, shouldLoadRelated]);

  const relatedPostsQuery = useMemo(() => 
    `*[_type==$schemaType && _id!=$currentPostId] | order(_createdAt desc)[0...3]`, 
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
    { ...relatedPostsOptions, schemaType, enabled: shouldLoadRelated }
  );

  // Related resources cache - only load when needed
  const relatedResourcesOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedResources`,
    enableOffline: true,
    enabled: !!currentPostId && shouldLoadRelated,
  }), [currentPostId, schemaType, shouldLoadRelated]);

  const correctRelatedResourcesQuery = useMemo(() => 
    `*[_type=="freeResources" && references($articleId)]{
      _id,title,tags,mainImage,overview,resourceType,resourceFormat,
      resourceLink,resourceLinkType,previewSettings,
      "resourceFile":resourceFile.asset->,content,publishedAt,promptContent,
      "relatedArticle":relatedArticle->{title,slug,_id,_type},
      seoTitle,seoDescription,seoKeywords,altText,structuredData
    }`, 
    []
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
    { ...relatedResourcesOptions, schemaType: 'freeResources', enabled: shouldLoadRelated }
  );

  // Register cache operations
  usePageCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    refreshArticle,
    articleQuery,
    `${schemaType}ArticleContent`
  );

  if (shouldLoadRelated) {
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
  }

  const isMainContentLoading = articleLoading && !finalArticleData;
  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  // Loading state
  if (isMainContentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading article content...</p>
      </div>
    );
  }

  // Error state
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
              <span className="ml-2 text-orange-800 dark:text-orange-200">You appear to be offline</span>
            </div>
          ) : (
            <p className="text-red-500">Failed to load article: {articleError.message || "Unknown error"}</p>
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

  if (!finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No article data available. Please check your connection and try again.</p>
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
      {/* Stale content warnings */}
      {articleIsStale && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span>
          <span className="ml-2">Article content may be outdated.</span>
        </div>
      )}

      {(relatedPostsStale || resourcesStale) && shouldLoadRelated && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span>
          <span className="ml-2">Related content may be outdated.</span>
        </div>
      )}

      {/* Cache Monitor - Load only when needed */}
      <Suspense fallback={null}>
        {shouldLoadRelated && (
          <UnifiedCacheMonitor
            serverData={serverData}
            params={params}
          />
        )}
      </Suspense>

      {/* Main Blog Layout - Priority content */}
      <BlogLayout
        data={finalArticleData}
        loading={isMainContentLoading}
        relatedPosts={shouldLoadRelated ? (relatedPosts || []) : []}
        relatedPostsLoading={shouldLoadRelated ? relatedPostsLoading : false}
        relatedResources={shouldLoadRelated ? (relatedResources || []) : []}
        resourcesLoading={shouldLoadRelated ? resourcesLoading : false}
        schemaSlugMap={schemaSlugMap}
        imgdesc={imgdesc}
        onRefreshArticle={handleRefreshArticle}
        shouldLoadSidebar={shouldLoadSidebar}
        shouldLoadRelated={shouldLoadRelated}
      />
    </>
  );
}