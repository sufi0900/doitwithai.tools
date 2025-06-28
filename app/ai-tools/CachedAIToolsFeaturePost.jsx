"use client";
import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import FeaturePost from "@/components/Blog/featurePost";
import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import { urlForImage } from "@/sanity/lib/image";

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const ReusableCachedFeaturePost = ({ documentType, pageSlugPrefix, cacheKey }) => {
  const featureQuery = `*[_type=="${documentType}"&&displaySettings.isOwnPageFeature==true]{_id,title,overview,mainImage,slug,publishedAt,readTime,tags,"displaySettings":displaySettings}`;

  const { data, isLoading, error, refresh, isStale } = useSanityCache(
    cacheKey,
    featureQuery,
    {
      componentName: `${documentType}FeaturePost`,
      enableOffline: true,
      // The options for staleTime and maxAge will come from getCacheConfig in useSanityCache
    }
  );

  // NEW: Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    cacheKey,
    refresh,
    featureQuery,
    `${documentType} Feature Post` // Label for the cache status button
  );

  if (isLoading) {
    // Assuming FeatureSkeleton covers the Grid layout
    return <FeatureSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load feature posts.</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const postsToDisplay = data || []; // Ensure data is an array for mapping

  return (
    <>
      {isStale && postsToDisplay.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span><span>Feature Post content may be outdated.</span>
          </div>
        </div>
      )}
      {postsToDisplay.map((post) => (
        // Replaced Grid with div, adjust if Grid is a specific UI component you have
        <div key={post._id}>
          <FeaturePost
            title={post.title}
            overview={post.overview}
            mainImage={urlForImage(post.mainImage).url()}
            slug={`/${pageSlugPrefix}/${post.slug.current}`}
            date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            readTime={post.readTime?.minutes}
            tags={post.tags}
          />
        </div>
      ))}
      {postsToDisplay.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No feature posts found.</p>
        </div>
      )}
    </>
  );
};

export default ReusableCachedFeaturePost;