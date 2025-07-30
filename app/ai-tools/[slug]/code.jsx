/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import "@/styles/customanchor.css";

// Caching System Imports
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';

// Dynamic imports with loading states - Critical for FCP improvement
const BlogLayout = dynamic(() => import("@/app/ai-tools/[slug]/BlogLayout"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  ),
  ssr: false // Disable SSR for this component to improve server response time
});

const UnifiedCacheMonitor = dynamic(() => import("@/React_Query_Caching/UnifiedCacheMonitor"), {
  loading: () => null,
  ssr: false
});

export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;

  // Memoize static mappings and configurations at the top level
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools", 
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news",
    freeairesources: "free-ai-resources",
  }), []);

  // Memoize imgdesc to prevent re-creation - MOVED TO TOP
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

  // Priority: Article content cache (most critical for FCP)
  const articleCacheOptions = useMemo(() => ({
    componentName: `${schemaType}ArticleContent`,
    enableOffline: true,
    initialData: serverData,
    forceRefresh: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - Keep content fresh but not too aggressive
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

  // Determine final article data - prioritize cached data over server data
  const finalArticleData = cachedArticleData || serverData;
  const currentPostId = finalArticleData?._id;

  // Lower priority: Related posts cache (load after main content)
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`,
    enableOffline: true,
    enabled: !!currentPostId && !!finalArticleData, // Only enable if we have main content
    staleTime: 10 * 60 * 1000, // 10 minutes - Less critical, can be staler
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

  // Lowest priority: Related resources cache (load last)
  const relatedResourcesOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedResources`,
    enableOffline: true,
    enabled: !!currentPostId && !!finalArticleData, // Only enable if we have main content
    staleTime: 15 * 60 * 1000, // 15 minutes - Least critical
  }), [currentPostId, schemaType, finalArticleData]);

  const correctRelatedResourcesQuery = useMemo(() => 
    `*[_type == "freeResources" && references($articleId)]{
      _id,title,tags,mainImage,overview,resourceType,resourceFormat,
      resourceLink,resourceLinkType,previewSettings,
      "resourceFile": resourceFile.asset->,content,publishedAt,promptContent,
      "relatedArticle": relatedArticle->{title,slug,_id,_type},
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
    { ...relatedResourcesOptions, schemaType: 'freeResources' }
  );

  // Register all cache operations with usePageCache for the status button
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

  // Critical: Only show loading for main content if we have no data at all
  const isMainContentLoading = articleLoading && !finalArticleData;

  // Memoize refresh callback for error state
  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  // Priority loading states - Show content ASAP even if supporting content is loading
  if (isMainContentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading article content...</p>
      </div>
    );
  }

  // Handle error states - improved offline handling
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

  // If we still don't have any article data, show a message
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
      {/* Stale content warnings - only show for critical content */}
      {articleIsStale && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span>
          <span className="ml-2">Article content may be outdated.</span>
        </div>
      )}

      {/* Cache Monitor - Load last */}
      <UnifiedCacheMonitor
        serverData={serverData}
        params={params}
      />

      {/* Main Blog Layout - Priority content loads first */}
      <BlogLayout
        data={finalArticleData}
        loading={isMainContentLoading}
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