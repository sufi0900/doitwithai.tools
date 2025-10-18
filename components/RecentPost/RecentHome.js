import React, { useMemo, useCallback } from "react"; // Import useMemo and useCallback
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import SkelCard from "@/components/Blog/Skeleton/Card"
import OptimizeImage from "@/app/ai-seo/[slug]/OptimizedImage";

import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';

import { 
  AccessTime, 
  CalendarMonthOutlined,
  
  ArrowRightAltOutlined
} from "@mui/icons-material";
import { 
 
  Sparkles, 
 
  TrendingUp as TrendingUpLucide,
 
} from "lucide-react";

export default function RecentPosts({ initialData = [] }) { // Accept initialData prop
  // Memoize the queries object as it is static
 const queries = useMemo(() => ({
    recent: `*[_type in ["makemoney","aitool","coding","freeairesources","seo","news"]]|order(publishedAt desc)[0...5]`,
  }), []);

  const commonSchemaTypes = useMemo(() => ["makemoney", "aitool", "coding", "freeairesources", "seo", "news"], []);

  const stableOptions = useMemo(() => ({
    componentName: 'RecentPosts',
    staleTime: 3 * 60 * 1000,
    maxAge: 15 * 60 * 1000,
    enableOffline: true,
    // --- NEW: Pass initialData ---
    initialData: initialData,
    // --- NEW: Specify schemaType (array if multiple types) ---
    schemaType: commonSchemaTypes,
  }), [initialData, commonSchemaTypes]); // Add initialData to dependency array

  const { data: recentData, isLoading: loading, error, isStale, refresh } = useUnifiedCache( // --- CHANGED: useUnifiedCache ---
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS,
    queries.recent,
    {},
    stableOptions
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
  <section className="pb-4 sm:pb-[20px] mt-6 sm:mt-[40px] lg:mt-16">
  <div className="container mx-auto px-3 sm:px-4">
    <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
  
  {/* Responsive heading with proper mobile typography */}
  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white leading-tight">
    <span className="relative mr-1 sm:mr-2 inline-block">
      Latest
      {/* Responsive underline that scales with text size */}
      <span className="absolute bottom-[-3px] xs:bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] left-0 h-0.5 sm:h-1 w-full bg-blue-500"></span>
    </span>
    <span className="text-blue-500">Posts</span>
  </h2>
  
  {/* Responsive "Read All Blogs" button */}
  <Link href="/blogs" passHref>
    <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border-2 border-blue-500 bg-transparent px-4 sm:px-6 py-2 sm:py-2.5 text-center text-sm sm:text-base font-medium text-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white min-h-[44px] sm:min-h-auto">
      <span className="truncate">Read All Blogs</span>
      <span className="ml-1 sm:ml-2 flex-shrink-0">➔</span>
    </span>
  </Link>
</div>
        
        {/* NEW: Stale Data Warning */}
        {isStale && recentData && recentData.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span>⚠️</span><span>Recent Posts content may be outdated.</span>
            </div>
          </div>
        )}
        
        {/* NEW: Error Display */}
        {hasError && !loading && !recentData && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Failed to load recent posts</h3>
              <p className="text-sm mb-3">{error?.message || 'Unable to fetch data'}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            >
              Retry
            </button>
          </div>
        )}
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && !recentData ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkelCard key={index} />
            ))
          ) : recentData && recentData.length > 0 ? (
            recentData?.slice(0, 3).map((post) => (
              <Link
                key={post._id}
                href={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                className="group relative  w-full transition-all duration-400 ease-in-out
                           hover:scale-[1.02] transform cursor-pointer overflow-hidden rounded-xl border
                           border-gray-200 bg-white shadow-md hover:shadow-xl dark:border-gray-700 dark:bg-gray-800
                           dark:hover:bg-gray-700 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[37/22] overflow-hidden">
                  <div className="absolute inset-0 h-full w-full transition-all duration-500 ease-out group-hover:scale-110">
                    <OptimizeImage
                     src={urlForImage(post.mainImage).width(800).height(600).fit("crop").auto("format").url()}
                     alt={post.title}
                       width={800}
                        height={600}
                                   
                     quality={80}
                     priority={false} // set to true only for above-the-fold images
                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                  {/* Enhanced Tag */}
                  {post.tags && post.tags.length > 0 && (
                    <span 
                      className="absolute right-3 top-3 z-20 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 backdrop-blur-sm border border-white/20"
                    >
                      <Sparkles className="w-3 h-3" />
                      {post.tags[0].name}
                    </span>
                  )}
                  
                  {/* Reading Progress Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
                
                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Enhanced Title with Better Visibility */}
                  <h5 className="mb-2 line-clamp-2 text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {post.title}
                  </h5>
                  
                  {/* Overview */}
                  <p className="mb-3 line-clamp-3 md:line-clamp-4 font-normal text-gray-700 dark:text-gray-400 flex-grow">
                    {post.overview}
                  </p>
                  
                  {/* Enhanced Meta Information */}
                  <div className="mt-auto mb-3 flex items-center justify-start gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                        <CalendarMonthOutlined 
                          className="text-blue-600 dark:text-blue-400" 
                          sx={{ fontSize: 12 }}
                        />
                      </div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                    
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300">
                        <AccessTime 
                          className="text-green-600 dark:text-green-400" 
                          sx={{ fontSize: 12 }}
                        />
                      </div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">
                        {post.readTime?.minutes || '-'} min
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Read More Button */}
                  <div className="flex justify-start mt-4">
                    <div
                      className="group/button relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg  first-line:focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden w-fit"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                      
                      {/* Button Content */}
                      <span className="relative z-10">Read Full Article</span>
                      <ArrowRightAltOutlined 
                        className="relative z-10 transition-all duration-300 group-hover/button:translate-x-0.5 group-hover/button:scale-110" 
                        sx={{ fontSize: 14 }}
                      />
                      
                      {/* Glow Effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-20 transition-opacity duration-300 blur-sm" />
                    </div>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
              </Link>
            ))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No recent posts found at this time.</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
              >
                Refresh Posts
              </button>
            </div>
          )}
        </div>


       
         

      </div>
    </section>
  );
};