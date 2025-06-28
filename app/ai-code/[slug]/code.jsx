/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useMemo, useCallback } from "react";
import BlogLayout from "@/app/ai-tools/[slug]/BlogLayout";
import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers";
import "@/styles/customanchor.css";

// Caching System Imports
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';

export default function CodingChildComp({ serverData, params, serverFetchFailed = false }) {
  const currentSlug = params.slug;

  // Schema slug mapping
  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools", 
    coding: "ai-code",
    seo: "ai-seo",
  };


const articleQuery = `*[_type == "coding" && slug.current == "${currentSlug}"][0]`;
const {
  data: cachedArticleData,
  isLoading: articleLoading,
  error: articleError,
  refresh: refreshArticle,
  isStale: articleIsStale
} = useSanityCache(
  CACHE_KEYS.ARTICLE.CONTENT(currentSlug, 'coding'),
  articleQuery,
  {},
  {
    componentName: 'CodingArticleContent',
    enableOffline: true,
    initialData: serverData, // Use server data as initial data
    // Always allow cache-first behavior
    forceRefresh: false
  }
);

// Determine final article data - prioritize cached data over server data
const finalArticleData = cachedArticleData || serverData;
const currentPostId = finalArticleData?._id;

// 2. Cache related posts - only if we have article data
const relatedPostsQuery = `*[_type == "coding" && _id != "${currentPostId}"] | order(_createdAt desc)[0...3]`;
const {
  data: relatedPosts,
  isLoading: relatedPostsLoading,
  error: relatedPostsError,
  refresh: refreshRelatedPosts,
  isStale: relatedPostsStale
} = useSanityCache(
  CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', 'coding'),
  relatedPostsQuery,
  { excludeId: currentPostId },
  {
    componentName: 'CodingRelatedPosts',
    enableOffline: true,
    enabled: !!currentPostId, // Only enable if we have a post ID
  }
);

// 3. Cache related resources - only if we have article data
const correctRelatedResourcesQuery = `*[_type == "freeResources" && references($articleId)]{
  _id, title, tags, mainImage, overview, resourceType, resourceFormat, 
  resourceLink, resourceLinkType, previewSettings,
  "resourceFile": resourceFile.asset->, content, publishedAt, promptContent,
  "relatedArticle": relatedArticle->{title, slug, _id, _type},
  seoTitle, seoDescription, seoKeywords, altText, structuredData
}`;
const {
  data: relatedResources,
  isLoading: resourcesLoading,
  error: resourcesError,
  refresh: refreshRelatedResources,
  isStale: resourcesStale
} = useSanityCache(
  CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'),
  correctRelatedResourcesQuery,
  { articleId: currentPostId },
  {
    componentName: 'CodingRelatedResources',
    enableOffline: true,
    enabled: !!currentPostId, // Only enable if we have a post ID
  }
);

// Register all cache operations with usePageCache for the status button
usePageCache(CACHE_KEYS.ARTICLE.CONTENT(currentSlug, 'coding'), refreshArticle, articleQuery, 'ArticleContent');
usePageCache(CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || 'unknown', 'coding'), refreshRelatedPosts, relatedPostsQuery, 'RelatedPosts');
usePageCache(CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || 'unknown'), refreshRelatedResources, correctRelatedResourcesQuery, 'RelatedResources');

// State for pagination (keeping existing functionality)
const [currentPage, setCurrentPage] = useState(1);
const [allData, setAllData] = useState([]);

// Loading logic - show loading only if we have no data at all AND we're actually loading
const isMainContentLoading = articleLoading && !finalArticleData;

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
      <button
        onClick={refreshArticle}
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
        onClick={refreshArticle}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
  const imgdesc = {
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
  };

 
  return (
    <>
      {/* Stale content warnings */}
      {articleIsStale && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span>
          <span className="ml-2">Article content may be outdated.</span>
        </div>
      )}
      
      {(relatedPostsStale || resourcesStale) && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span>⚠️</span>
          <span className="ml-2">Related content may be outdated.</span>
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
        onRefreshArticle={refreshArticle}
      />
    </>
  );
}
