/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import BlogLayout from "./BlogLayout";
import { client } from "@/sanity/lib/client";

import { useSanityCache } from "@/React_Query_Caching/useSanityCache";
import { CACHE_KEYS } from "@/React_Query_Caching/cacheKeys";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import { usePageCache } from "@/React_Query_Caching/usePageCache";

import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers";


// --- CORRECTED fetchMainArticleData ---
async function fetchMainArticleData(slug, type) {
  if (!slug || !type) return null;
  // This query is for fetching a SINGLE article by its slug and type
  const query = `*[_type == "${type}" && slug.current == "${slug}"][0]`;
  const data = await client.fetch(query); // No params needed if variables are interpolated directly
  return data;
}
// --- END CORRECTED fetchMainArticleData ---

async function fetchRelatedPostsData(currentPostId, postType) {
  if (!currentPostId || !postType) return [];
  const excludeId = currentPostId ? currentPostId : '';
  // Your query was `*[_type == "aitool" && _id != $excludeId]`.
  // To make it more dynamic based on the current post's type:
  const query = `*[_type == "${postType}" && _id != $excludeId] | order(publishedAt desc) [0...3]`; // Changed _createdAt to publishedAt for consistency
  return await client.fetch(query, { excludeId });
}

export default function AiToolSlugPageCode({ data: initialData, params }) {
  const currentSlug = params.slug;
  const currentPostType = initialData?._type;
  const currentPostId = initialData?._id;

  const {
    data: articleData,
    isLoading: articleLoading,
    error: articleError,
    refresh: refreshArticle,
    isStale: isArticleStale,
    cacheSource: articleCacheSource,
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.CONTENT(currentSlug, currentPostType),
    // Pass slug and type directly to fetchMainArticleData
    () => fetchMainArticleData(currentSlug, currentPostType),
    {
      initialData: initialData,
      componentName: `Article_${currentPostType}_${currentSlug}`,
      enableOffline: true,
      group: `article-content-group-${currentPostType}`,
    }
  );
  usePageCache(CACHE_KEYS.ARTICLE.CONTENT(currentSlug, currentPostType), refreshArticle, `MainArticle:${currentPostType}/${currentSlug}`);


  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
    error: relatedPostsError,
    refresh: refreshRelatedPosts,
    isStale: isRelatedPostsStale,
    cacheSource: relatedPostsCacheSource,
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId, currentPostType),
    // Pass currentPostId and currentPostType to fetchRelatedPostsData
    () => fetchRelatedPostsData(currentPostId, currentPostType),
    {
      componentName: `RelatedPosts_${currentPostType}_${currentPostId}`,
      enableOffline: true,
      group: `article-related-group-${currentPostType}`,
    }
  );
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_POSTS(currentPostId, currentPostType), refreshRelatedPosts, `RelatedPosts:${currentPostType}/${currentPostId}`);


  const {
    data: relatedResources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refresh: refreshResources,
    isStale: isResourcesStale,
    cacheSource: resourcesCacheSource,
  } = useSanityCache(
    CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId),
    // Pass currentPostId and currentPostType to fetchRelatedResources
    () => fetchRelatedResources(currentPostId, currentPostType),
    {
      componentName: `RelatedResources_${currentPostId}`,
      enableOffline: true,
      group: `article-related-group-${currentPostType}`,
    }
  );
  usePageCache(CACHE_KEYS.ARTICLE.RELATED_RESOURCES(currentPostId), refreshResources, `RelatedResources:${currentPostId}`);


  const isPageContentLoading = articleLoading && !articleData; // Simplified logic

  // Consolidate all errors for display
  const hasErrors = articleError || relatedPostsError || resourcesError;

  // If there's an error and no main article data, we should show an error state instead of skeleton
  if (!articleData && hasErrors) {
      return (
          <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4 text-red-600">Error Loading Content</h1>
              <p className="text-gray-600 dark:text-gray-400">
                  {articleError?.message || relatedPostsError?.message || resourcesError?.message || "An unexpected error occurred."}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please try refreshing the page or check your internet connection.
              </p>
              <div className="flex justify-center p-4">
                  <PageCacheStatusButton />
              </div>
          </div>
      );
  }

  // --- Sanity PortableText components (unchanged) ---
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

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    news: "news",
    coding: "ai-code",
    freeairesources: "free-ai-resources",
    seo: "ai-seo",
  };

  return (
    <>
      <div className="flex justify-end p-4">
        <PageCacheStatusButton />
      </div>
      <BlogLayout
        data={articleData} // Pass the data from useSanityCache
        loading={isPageContentLoading}
        relatedPosts={relatedPosts || []}
        relatedPostsLoading={relatedPostsLoading}
        relatedResources={relatedResources || []}
        resourcesLoading={resourcesLoading}
        schemaSlugMap={schemaSlugMap}
        imgdesc={imgdesc}
      />
    </>
  );
}