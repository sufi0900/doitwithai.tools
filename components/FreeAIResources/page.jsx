import React from 'react';
import { groq } from "next-sanity";


import dynamic from 'next/dynamic';

import ResourceCard from '@/app/free-ai-resources/RelatedesourceCard';
import Link from 'next/link';
import ResourceSkeleton from '@/app/free-ai-resources/ResourceSkeleton';
import ResourceModalsProvider from '@/app/free-ai-resources/ResourceModalsProvider';

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

const DynamicResourceCarousel = dynamic(() => import('@/app/free-ai-resources/ResourceCarousel'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-wrap -mx-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
          <ResourceSkeleton />
        </div>
      ))}
    </div>
  ),
});

const FeaturedResourcesHorizontal = () => { // Removed 'resource' prop, as it's not used
  const query = groq`*[_type == "freeResources" && isHomePageFeature == true] | order(publishedAt desc) {
    _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
    resourceLink, resourceLinkType, content, publishedAt,
    "resourceFile": resourceFile.asset->,
    promptContent, previewSettings,
    _updatedAt
  }`;

  const {
    data: featuredResources,
    isLoading,
    error,     // Destructure error
    isStale,   // Destructure isStale
    refresh,   // Destructure refresh function
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.FEATURED_RESOURCES_HORIZONTAL, // Use the specific cache key
    query,
    {
      componentName: 'FeaturedResources', // Descriptive name for debugging
      staleTime: 3 * 60 * 1000, // Consistent with HOMEPAGE config
      maxAge: 15 * 60 * 1000, // Consistent with HOMEPAGE config
      enableOffline: true,
    }
  );

  // NEW: Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    CACHE_KEYS.HOMEPAGE.FEATURED_RESOURCES_HORIZONTAL,
    refresh, // Pass the refresh function from useSanityCache
    query,   // Pass the original query string
    'Featured Resources' // Label for the cache status button
  );

  const hasError = !!error; // Convert error object to boolean

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-16 h-1 bg-primary rounded mb-4"></div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle case where no resources are returned but no loading/error
  if (!featuredResources || featuredResources.length === 0) {
    return null; // Or a message like "No featured resources available"
  }

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-20 h-1 bg-primary rounded mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Discover our curated collection of premium AI resources, templates, and tools
          </p>
        </div>

        {/* NEW: Stale Data Warning */}
        {isStale && (<div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span><span>Featured Resources content may be outdated.</span>
          </div>
        </div>)}

        {/* NEW: Error Display */}
        {hasError && !isLoading && !featuredResources && (<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200">
            <h3 className="font-semibold mb-2">Failed to load featured resources</h3>
            <p className="text-sm mb-3">{error?.message || 'Unable to fetch data'}</p>
          </div>
        </div>)}

        <DynamicResourceCarousel>
          {featuredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              wrapperClassName="h-full"
            />
          ))}
        </DynamicResourceCarousel>

        <div className="mt-10 text-center">
          <Link href="/free-ai-resources" className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md transition-colors">
            View All Resources
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
      <ResourceModalsProvider resources={featuredResources} />
    </section>
  );
};

export default FeaturedResourcesHorizontal;