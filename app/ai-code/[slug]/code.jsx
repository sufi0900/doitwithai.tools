/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react"; // Import useEffect
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout"; // Assuming BlogLayout is truly reusable and its path is fixed
import "@/styles/customanchor.css";

// Caching System Imports
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';

/**
 * Reusable component for fetching and displaying article content, related posts,
 * and related resources for any specified Sanity schema type.
 *
 * @param {object} props - Component props.
 * @param {object} props.serverData - Initial data fetched from the server.
 * @param {object} props.params - Next.js route parameters, containing the 'slug'.
 * @param {string} props.schemaType - The Sanity schema type (e.g., 'coding', 'aitool', 'makemoney', 'seo').
 */
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

  // Memoize options for article content cache
  const articleCacheOptions = useMemo(() => ({
    componentName: `${schemaType}ArticleContent`, // Dynamic component name
    enableOffline: true,
    initialData: serverData, // Use server data as initial data
    forceRefresh: false, // Always allow cache-first behavior
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale
    maxAge: 30 * 60 * 1000, // Example: 30 minutes max age
    // Add tags for server-side revalidation if this fetch is ever direct to Sanity
    // (though with the API proxy, the API route will handle tags)
    tags: [schemaType, currentSlug], 
    ex: 3600 // Expiration for Redis (1 hour)
  }), [serverData, schemaType, currentSlug]);

  // Dynamic article query based on schemaType and currentSlug
  const articleQuery = useMemo(() =>
    `*[_type==$schemaType&&slug.current==$currentSlug][0]`
    , [schemaType]); // Only depends on schemaType for the query string itself

  const articleQueryParams = useMemo(() => ({
    schemaType: schemaType,
    currentSlug: currentSlug
  }), [schemaType, currentSlug]);

  const {
    data: cachedArticleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle,
    isStale: articleIsStale,
    cacheSource: articleCacheSource, // <-- ADDED
    lastUpdated: articleLastUpdated // <-- ADDED
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType), // Dynamic cache key
    articleQuery,
    articleQueryParams, // Pass dynamic params
    articleCacheOptions
  );

  // Determine final article data - prioritize cached data over server data
  const finalArticleData = cachedArticleData || serverData;
  const currentPostId = finalArticleData?._id;

  // --- LOGGING FOR ARTICLE DATA SOURCE ---
  useEffect(() => {
    if (!articleLoading) {
      console.log(`[ArticleChildComp] Main Article (${currentSlug}): Source: ${articleCacheSource}, Stale: ${articleIsStale}, Last Updated: ${articleLastUpdated ? articleLastUpdated.toLocaleString() : 'N/A'}`);
    }
  }, [articleLoading, articleCacheSource, articleIsStale, articleLastUpdated, currentSlug]);
  // --- END LOGGING ---


  // Memoize options for related posts cache
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`, // Dynamic component name
    enableOffline: true,
    enabled: !!currentPostId, // Only enable if we have a post ID
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
    tags: [schemaType], // Tag for related posts
    ex: 3600
  }), [currentPostId, schemaType]);

  // Dynamic related posts query based on schemaType and currentPostId
  const relatedPostsQuery = useMemo(() =>
    `*[_type==$schemaType&&_id!=$currentPostId]|order(_createdAt desc)[0...3]`
    , [schemaType]); // Only depends on schemaType for the query string itself

  const relatedPostsQueryParams = useMemo(() => ({
    schemaType: schemaType,
    currentPostId: currentPostId
  }), [schemaType, currentPostId]);

  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
    error: relatedPostsError,
    refresh: refreshRelatedPosts,
    isStale: relatedPostsStale,
    cacheSource: relatedPostsCacheSource, // <-- ADDED
    lastUpdated: relatedPostsLastUpdated // <-- ADDED
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType), // Dynamic cache key
    relatedPostsQuery,
    relatedPostsQueryParams, // Pass dynamic params
    relatedPostsOptions
  );

  // --- LOGGING FOR RELATED POSTS DATA SOURCE ---
  useEffect(() => {
    if (!relatedPostsLoading && currentPostId) {
      console.log(`[ArticleChildComp] Related Posts (${currentSlug}): Source: ${relatedPostsCacheSource}, Stale: ${relatedPostsStale}, Last Updated: ${relatedPostsLastUpdated ? relatedPostsLastUpdated.toLocaleString() : 'N/A'}`);
    }
  }, [relatedPostsLoading, relatedPostsCacheSource, relatedPostsStale, relatedPostsLastUpdated, currentSlug, currentPostId]);
  // --- END LOGGING ---


  // Memoize options for related resources cache
  const relatedResourcesOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedResources`, // Dynamic component name
    enableOffline: true,
    enabled: !!currentPostId, // Only enable if we have a post ID
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
    tags: ['freeResource'], // Tag for free resources
    ex: 3600
  }), [currentPostId, schemaType]);

  // Related resources query string is static, but params are dynamic
  const correctRelatedResourcesQuery = useMemo(() =>
    `*[_type=="freeResources"&&references($articleId)]{_id,title,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,"relatedArticle":relatedArticle->{title,slug,_id,_type},seoTitle,seoDescription,seoKeywords,altText,structuredData}`
    , []);

  const relatedResourcesQueryParams = useMemo(() => ({
    articleId: currentPostId
  }), [currentPostId]);

  const {
    data: relatedResources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refresh: refreshRelatedResources,
    isStale: resourcesStale,
    cacheSource: resourcesCacheSource, // <-- ADDED
    lastUpdated: resourcesLastUpdated // <-- ADDED
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
    correctRelatedResourcesQuery,
    relatedResourcesQueryParams, // Pass dynamic params
    relatedResourcesOptions
  );

  // --- LOGGING FOR RELATED RESOURCES DATA SOURCE ---
  useEffect(() => {
    if (!resourcesLoading && currentPostId) {
      console.log(`[ArticleChildComp] Related Resources (${currentSlug}): Source: ${resourcesCacheSource}, Stale: ${resourcesStale}, Last Updated: ${resourcesLastUpdated ? resourcesLastUpdated.toLocaleString() : 'N/A'}`);
    }
  }, [resourcesLoading, resourcesCacheSource, resourcesStale, resourcesLastUpdated, currentSlug, currentPostId]);
  // --- END LOGGING ---


  // Register all cache operations with usePageCache for the status button
  usePageCache(CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType), refreshArticle, articleQuery, `${schemaType} ArticleContent`);
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType), refreshRelatedPosts, relatedPostsQuery, `${schemaType} RelatedPosts`);
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'), refreshRelatedResources, correctRelatedResourcesQuery, `${schemaType} RelatedResources`);

  // Loading logic - show loading only if we have no data at all AND we're actually loading
  const isMainContentLoading = articleLoading && !finalArticleData;

  // Memoize refresh callback for error state
  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  // Handle loading states
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
    const isOfflineError = !navigator.onLine || articleError.message.includes('offline') || articleError.message.includes('network');
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
        <button onClick={handleRefreshArticle} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Retry</button>
      </div>
    );
  }

  // If we still don't have any article data, show a message
  if (!finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No article data available. Please check your connection and try again.</p>
        <button onClick={handleRefreshArticle} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <>
      {/* Stale content warnings */}
      {articleIsStale && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span><span className="ml-2">Article content may be outdated.</span>
        </div>
      )}
      {(relatedPostsStale || resourcesStale) && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span><span className="ml-2">Related content may be outdated.</span>
        </div>
      )}
      <BlogLayout
        data={finalArticleData}
        loading={isMainContentLoading}
        relatedPosts={relatedPosts || []}
        relatedPostsLoading={relatedPostsLoading}
        relatedResources={relatedResources || []}
        resourcesLoading={resourcesLoading}
        schemaSlugMap={schemaSlugMap}
        imgdesc={imgdesc}
        onRefreshArticle={handleRefreshArticle} // Pass a stable callback for refresh
      />
    </>
  );
}
