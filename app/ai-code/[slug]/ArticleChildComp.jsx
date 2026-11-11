// ArticleChildComp of doitwithai.tools — reusable for all article schemas
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import "@/styles/customanchor.css";
import SlugSkeleton from "@/components/Blog/Skeleton/SlugSkeleton";

import { useUnifiedCache } from "@/React_Query_Caching/useUnifiedCache";
import { usePageCache } from "@/React_Query_Caching/usePageCache";
import { CACHE_KEYS } from "@/React_Query_Caching/cacheKeys";

import BlogLayout from "@/features/articles/legacy/components/BlogLayout";
import { applySeoOverrides } from "@/features/articles/legacy/seoArticleOverrides";
import {
  getStaticArticle,
  getStaticArticlesByType,
  getClusterRelatedArticles,
} from "@/features/articles/legacy/staticArticles";

export default function ArticleChildComp({ serverData, params, schemaType }) {
  const currentSlug = params.slug;
  const staticFallback = useMemo(
    () => getStaticArticle(currentSlug, schemaType),
    [currentSlug, schemaType]
  );
  const initialArticle = serverData || staticFallback;
  const isCodeStatic = Boolean(
    initialArticle?.__source === "code-static" || staticFallback
  );

  const [showSkeleton, setShowSkeleton] = useState(!initialArticle);
  const [initialMount, setInitialMount] = useState(true);

  const schemaSlugMap = useMemo(
    () => ({
      makemoney: "ai-learn-earn",
      aitool: "ai-tools",
      coding: "ai-code",
      seo: "ai-seo",
      news: "ai-news",
      freeairesources: "free-ai-resources",
      blogPost: "blogs",
    }),
    []
  );

  const imgdesc = useMemo(
    () => ({
      block: {
        normal: ({ children }) => (
          <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-4 mt-1 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
            {children}
          </p>
        ),
        a: ({ children }) => (
          <a className="text-blue-600 dark:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] hover:bg-[length:0_1.5px] break-words">
            {children}
          </a>
        ),
      },
    }),
    []
  );

  const articleCacheOptions = useMemo(
    () => ({
      componentName: `${schemaType}ArticleContent`,
      enableOffline: true,
      initialData: initialArticle,
      serverData: initialArticle,
      preferServerData: true,
      enabled: !isCodeStatic,
      forceRefresh: false,
      staleTime: 2 * 60 * 60 * 1000,
    }),
    [initialArticle, schemaType, isCodeStatic]
  );

  const articleQuery = useMemo(
    () => `*[_type == $schemaType && slug.current == $currentSlug][0]`,
    []
  );

  const articleQueryParams = useMemo(
    () => ({
      schemaType,
      currentSlug,
    }),
    [schemaType, currentSlug]
  );

  const {
    data: cachedArticleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle,
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    articleQuery,
    articleQueryParams,
    { ...articleCacheOptions, schemaType }
  );

  const finalArticleData = useMemo(() => {
    const base = isCodeStatic
      ? initialArticle
      : cachedArticleData || initialArticle;
    return applySeoOverrides(base, schemaType);
  }, [isCodeStatic, initialArticle, cachedArticleData, schemaType]);

  const currentPostId = finalArticleData?._id;

  useEffect(() => {
    if (initialMount) {
      setInitialMount(false);
      if (initialArticle) {
        setShowSkeleton(false);
      }
      return;
    }

    if (articleLoading && !finalArticleData) {
      setShowSkeleton(true);
    } else if (finalArticleData) {
      const timer = setTimeout(() => setShowSkeleton(false), 50);
      return () => clearTimeout(timer);
    }
  }, [articleLoading, finalArticleData, initialArticle, initialMount]);

  const staticRelatedPosts = useMemo(() => {
    return getClusterRelatedArticles(currentSlug, schemaType, 3).map((doc) =>
      applySeoOverrides(doc, schemaType)
    );
  }, [schemaType, currentSlug]);

  const relatedPostsOptions = useMemo(
    () => ({
      componentName: `${schemaType}RelatedPosts`,
      enableOffline: true,
      enabled: !isCodeStatic && !!currentPostId && !!finalArticleData,
      staleTime: 2 * 60 * 60 * 1000,
    }),
    [isCodeStatic, currentPostId, schemaType, finalArticleData]
  );

  const relatedPostsQuery = useMemo(
    () =>
      `*[_type == $schemaType && _id != $currentPostId] | order(_createdAt desc)[0...3]`,
    []
  );

  const relatedPostsQueryParams = useMemo(
    () => ({
      schemaType,
      currentPostId,
    }),
    [schemaType, currentPostId]
  );

  const {
    data: fetchedRelatedPosts,
    isLoading: relatedPostsLoading,
    refresh: refreshRelatedPosts,
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || "unknown", schemaType),
    relatedPostsQuery,
    relatedPostsQueryParams,
    { ...relatedPostsOptions, schemaType }
  );

  const relatedPosts = useMemo(() => {
    if (Array.isArray(fetchedRelatedPosts) && fetchedRelatedPosts.length > 0) {
      return fetchedRelatedPosts.map((p) => applySeoOverrides(p, schemaType));
    }
    return staticRelatedPosts;
  }, [fetchedRelatedPosts, staticRelatedPosts, schemaType]);

  const relatedResourcesOptions = useMemo(
    () => ({
      componentName: `${schemaType}RelatedResources`,
      enableOffline: true,
      enabled: !!currentPostId && !!finalArticleData,
      staleTime: 2 * 60 * 60 * 1000,
    }),
    [currentPostId, schemaType, finalArticleData]
  );

  const correctRelatedResourcesQuery = useMemo(
    () =>
      `*[_type == "freeResources" && references($articleId)] | order(_createdAt desc)[0...9]{
      _id, title, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->, content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug, _id, _type},
      seoTitle, seoDescription, seoKeywords, altText, structuredData
    }`,
    []
  );

  const relatedResourcesQueryParams = useMemo(
    () => ({
      articleId: currentPostId,
    }),
    [currentPostId]
  );

  const {
    data: relatedResources,
    isLoading: resourcesLoading,
    refresh: refreshRelatedResources,
  } = useUnifiedCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || "unknown"),
    correctRelatedResourcesQuery,
    relatedResourcesQueryParams,
    { ...relatedResourcesOptions, schemaType: "freeResources" }
  );

  usePageCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, schemaType),
    refreshArticle,
    articleQuery,
    `${schemaType}ArticleContent`,
    { enabled: !isCodeStatic }
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId || "unknown", schemaType),
    refreshRelatedPosts,
    relatedPostsQuery,
    `${schemaType}RelatedPosts`,
    { enabled: !isCodeStatic && !!currentPostId && !!finalArticleData }
  );
  usePageCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId || "unknown"),
    refreshRelatedResources,
    correctRelatedResourcesQuery,
    `${schemaType}RelatedResources`,
    { enabled: !!currentPostId && !!finalArticleData }
  );

  const handleRefreshArticle = useCallback(
    () => refreshArticle(true),
    [refreshArticle]
  );

  if (articleError && !finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">
          Failed to load article: {articleError.message || "Unknown error"}
        </p>
        <button
          onClick={handleRefreshArticle}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showSkeleton || (!finalArticleData && articleLoading)) {
    return (
      <div className="relative min-h-screen">
        <div className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-md h-16"></div>
        <SlugSkeleton />
      </div>
    );
  }

  if (!finalArticleData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No article data available. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <BlogLayout
      data={finalArticleData}
      loading={false}
      relatedPosts={relatedPosts || []}
      relatedPostsLoading={false}
      relatedResources={relatedResources || []}
      resourcesLoading={resourcesLoading}
      schemaSlugMap={schemaSlugMap}
      imgdesc={imgdesc}
      onRefreshArticle={handleRefreshArticle}
    />
  );
}
