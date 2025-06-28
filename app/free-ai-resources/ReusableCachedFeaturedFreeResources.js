// components/Resources/ReusableCachedFeaturedFreeResources.jsx
"use client";

import React from 'react';
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

import FeatureSkeleton from "@/components/Blog/Skeleton/FeatureCard";
import VerticalFeaturePost from "./FeatureResourcePost"; // Assuming this path for rendering




const ReusableCachedFeaturedFreeResources = () => {
  // Query to fetch featured free resources
  const query = `*[_type == "freeResources" && isOwnPageFeature == true] | order(publishedAt desc) {
    _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
    resourceLink, resourceLinkType, previewSettings,
    "resourceFile": resourceFile.asset->,
    content, publishedAt, promptContent,
    "relatedArticle": relatedArticle->{title, slug},
    aiToolDetails,
    seoTitle, seoDescription, seoKeywords, altText, structuredData
  }`;

  const { data: featuredResources, isLoading, error, refresh, isStale } = useSanityCache(
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED, // Use the new specific cache key
    query,
    {}, // No params for this query
    {
      componentName: 'FeaturedFreeResources',
      enableOffline: true,
      group: 'free-resources', // Assign to a group for easy invalidation
    }
  );

  // --- NEW: Register this component's cache key with usePageCache ---
  usePageCache(
    CACHE_KEYS.PAGE.FREERESOURCES_FEATURED, // The cache key for this data
    refresh,                               // The refresh function provided by useSanityCache
    query,                                 // The query string associated
    'Featured Free Resources'              // A descriptive label for debugging/status button
  );
  // --- END NEW ---

  if (isLoading) {
    return <FeatureSkeleton />;
  }

  if (error && !featuredResources) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load featured resources.</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!featuredResources || featuredResources.length === 0) {
    return null; // Don't render anything if no featured resources
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Featured Resources</h2>
      {isStale && featuredResources.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Featured Resources content may be outdated.</span>
            </div>
          </div>
      )}
      {featuredResources.map((resource) => (
        <VerticalFeaturePost key={resource._id} resource={resource} />
      ))}
    </div>
  );
};

export default ReusableCachedFeaturedFreeResources;