import React, { useMemo, useCallback } from "react"; // Import useMemo and useCallback
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import SkelCard from "@/components/Blog/Skeleton/Card"
import OptimizeImage from "@/components/Blog/ImageOptimizer"
import { AccessTime, CalendarMonthOutlined } from "@mui/icons-material";

import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

export default function RecentPosts() {
  // Memoize the queries object as it is static
  const queries = useMemo(() => ({
    recent: `*[_type in ["makemoney", "aitool", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`,
  }), []); 
  // Memoize the options object for useSanityCache
  const stableOptions = useMemo(() => ({
    componentName: 'RecentPosts', // Descriptive name for debugging
    staleTime: 3 * 60 * 1000, // Consistent with HOMEPAGE config
    maxAge: 15 * 60 * 1000, // Consistent with HOMEPAGE config
    enableOffline: true,
  }), []); // Empty dependency array as these options are static

  // Use useSanityCache hook with the memoized query and options
  const {
    data: recentData,
    isLoading: loading,
    error,           // Destructure error
    isStale,         // Destructure isStale
    refresh,         // Destructure refresh function (this is already useCallback from useSanityCache)
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS, // Use the correct cache key for Recent Posts
    queries.recent, // Use the memoized query string
    {}, // No params for this query
    stableOptions // Use the memoized options
  );

  // Register this query's key and refresh function with the PageCacheProvider
  usePageCache(
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS,
    refresh, // Pass the refresh function from useSanityCache
    queries.recent, // Pass the memoized query string
    'Recent Posts' // Label for the cache status button
  );

  // Memoize the schemaSlugMap as it is static
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    news: "ai-news", // Added for consistency if 'news' type ever appears
    freeairesources: "free-ai-resources", // Added for consistency
  }), []); // Empty dependency array means this object will not re-create on every render

  const hasError = !!error; // Convert error object to boolean

  // Memoize the refresh handler for the Retry button (if any)
  // Although there isn't a dedicated retry button in the current JSX for the error,
  // it's good practice to memoize the refresh callback for consistency.
  const handleRefresh = useCallback(async () => {
    // This will trigger a re-fetch for the recent posts.
    // If you were to add a "Retry" button on the error message, you would attach this.
    refresh(true); // Force refresh
  }, [refresh]);

  return (
    <section className="pb-[20px] pt-[20px]">
      <div className="container">
        <h2 className="mb-8 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative mr-2 inline-block">
            Recent
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Post</span>
        </h2>

        {/* NEW: Stale Data Warning */}
        {isStale && recentData && recentData.length > 0 && ( // Ensure there's data to display a warning about
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Recent Posts content may be outdated.</span>
            </div>
          </div>
        )}

        {/* NEW: Error Display */}
        {hasError && !loading && !recentData && ( // Show error if error AND no data fallback
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Failed to load recent posts</h3>
              <p className="text-sm mb-3">{error?.message || 'Unable to fetch data'}</p>
            </div>
            <button
              onClick={handleRefresh} // Use the memoized handleRefresh here
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-wrap justify-start">
          {loading && !recentData ? ( // If loading and no data
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="mx-2 mb-4 flex flex-wrap justify-start">
                <SkelCard />
              </div>
            ))
          ) : recentData && recentData.length > 0 ? ( // Else if data exists
            // Fix: Wrap the mapped JSX inside parentheses to form a single expression
            (
              recentData?.slice(0, 3).map((post) =>
                <div key={post._id} className="mt-4 mb-6 px-2 ">
                  <div className="card transition duration-300 hover:scale-[1.05] max-w-sm transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow  hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    {" "}
                    {post.slug?.current && schemaSlugMap[post._type] ? (
                      <Link
                        href={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                        className="relative block aspect-[37/22] w-full"
                      >
                        {post.tags && post.tags.length > 0 && (
                          <Link
                            href={post.tags[0].link}
                            className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"
                          >
                            {post.tags[0].name}
                          </Link>
                        )}

                        {/* Image */}
                        <div className="relative aspect-[30/22] overflow-hidden">
                          <div className="duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5] absolute inset-0 h-full w-full object-cover transition-transform ">
                            <OptimizeImage
                              src={urlForImage(post.mainImage).url()}
                              alt={post.title}
                              fill
                            />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-red-500">Slug not available</div>
                    )}
                    <div className="p-5">
                      {/* Title */}
                      <Link
                        href={`/${schemaSlugMap[post._type]}/${post.slug?.current || "#"}`}
                      >
                        <h5 className="mb-2 line-clamp-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                          {post.title}
                        </h5>
                      </Link>
                      {/* Overview */}
                      <p className="mb-3 line-clamp-4 font-normal text-gray-700 dark:text-gray-400">
                        {post.overview}
                      </p>
                      {/* Meta Data */}
                      <div className="mb-3 mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <AccessTime className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                          <p className="text-sm font-medium text-dark dark:text-white">
                            Read Time: {post.readTime?.minutes} min
                          </p>
                        </div>
                        <div className="flex items-center">
                          <CalendarMonthOutlined className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                          <p className="text-sm font-medium text-dark dark:text-white">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      {/* Read more link */}
                      <Link
                        href={`/${schemaSlugMap[post._type]}/${post.slug?.current || "#"}`}
                        className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Read more
                        <svg
                          className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-8 w-full">
              <p className="text-gray-500 dark:text-gray-400">No recent posts found at this time.</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
              >
                Refresh Posts
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center md:justify-center">
          <Link href="/blogs">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
              Explore All Blogs
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};