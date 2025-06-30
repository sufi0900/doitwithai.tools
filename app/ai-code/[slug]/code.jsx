/*eslint-disable @next/next/no-img-element*/
"use client";

import React, { useState, useMemo, useCallback } from "react";
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import "@/styles/customanchor.css";

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';

export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;

  // Initialize finalArticleData with serverData directly, this will make currentPostId stable from the start
  // This assumes serverData might contain a partial or initial article if available.
  const [finalArticleData, setFinalArticleData] = useState(serverData);

  // Derive currentPostId from the state
  const currentPostId = finalArticleData?._id;

  // Memoize the schema slug mapping as it's static
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news",
    freeairesources: "free-ai-resources",
  }), []);

  // All useMemo and useSanityCache calls remain at the top level
  // and their 'enabled' properties will be based on the initial 'currentPostId' derived from serverData,
  // and then update React appropriately on re-renders when useSanityCache provides new data.

  const articleCacheOptions = useMemo(() => ({
    componentName: `${schemaType}ArticleContent`,
    enableOffline: true,
    initialData: serverData, // Still use serverData as initial data for this specific cache
    forceRefresh: false,
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
  }), [serverData, schemaType]);

  const articleQuery = useMemo(() =>
    `*[_type==$schemaType&&slug.current==$currentSlug][0]`,
  [schemaType]);

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
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    articleQuery,
    articleQueryParams,
    articleCacheOptions
  );

  // Update finalArticleData when cached data becomes available
  React.useEffect(() => {
    if (cachedArticleData) {
      setFinalArticleData(cachedArticleData);
    }
  }, [cachedArticleData]);


  // Memoize options for related posts cache
  const relatedPostsOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedPosts`,
    enableOffline: true,
    enabled: !!currentPostId, // This is now based on a state variable, more stable
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
  }), [currentPostId, schemaType]);

  const relatedPostsQuery = useMemo(() =>
    `*[_type==$schemaType&&_id!=$currentPostId]|order(_createdAt desc)[0...3]`,
  [schemaType]);

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
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType),
    relatedPostsQuery,
    relatedPostsQueryParams,
    relatedPostsOptions
  );

  // Memoize options for related resources cache
  const relatedResourcesOptions = useMemo(() => ({
    componentName: `${schemaType}RelatedResources`,
    enableOffline: true,
    enabled: !!currentPostId, // This is now based on a state variable, more stable
    staleTime: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
  }), [currentPostId, schemaType]);

  const correctRelatedResourcesQuery = useMemo(() =>
    `*[_type=="freeResources"&&references($articleId)]{_id,title,tags,mainImage,overview,resourceType,resourceFormat,resourceLink,resourceLinkType,previewSettings,"resourceFile":resourceFile.asset->,content,publishedAt,promptContent,"relatedArticle":relatedArticle->{title,slug,_id,_type},seoTitle,seoDescription,seoKeywords,altText,structuredData}`,
  []);

  const relatedResourcesQueryParams = useMemo(() => ({
    articleId: currentPostId
  }), [currentPostId]);

  const {
    data: relatedResources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refresh: refreshRelatedResources,
    isStale: resourcesStale
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
    correctRelatedResourcesQuery,
    relatedResourcesQueryParams,
    relatedResourcesOptions
  );

  usePageCache(CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType), refreshArticle, articleQuery, `${schemaType} ArticleContent`);
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', schemaType), refreshRelatedPosts, relatedPostsQuery, `${schemaType} RelatedPosts`);
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'), refreshRelatedResources, correctRelatedResourcesQuery, `${schemaType} RelatedResources`);

  const isMainContentLoading = articleLoading && !finalArticleData;

  const handleRefreshArticle = useCallback(() => refreshArticle(true), [refreshArticle]);

  if (isMainContentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading article content...</p>
      </div>
    );
  }

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

  if (!finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No article data available. Please check your connection and try again.</p>
        <button onClick={handleRefreshArticle} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Retry</button>
      </div>
    );
  }

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

  return (
    <>
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
        onRefreshArticle={handleRefreshArticle}
      />
    </>
  );
}