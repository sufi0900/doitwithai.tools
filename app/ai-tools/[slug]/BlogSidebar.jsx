/*eslint-disable @next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { client } from "@/sanity/lib/client"; // Keep if needed for other non-cached fetches
import { urlForImage } from "@/sanity/lib/image";
import SidebarRelatedResources from "@/app/free-ai-resources/SidebarRelatedResources";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import RelatedPost from "./RelatedPost";
import SearchResults from '@/React_Query_Caching/SearchResults';
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import Link from 'next/link';

// Caching System Imports for Recent Posts
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';

// --- New SidebarLoader Component ---
const SidebarLoader = ({ count = 3 }) => {
  return (
    <ul className="p-6 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="relative flex items-center space-x-3 animate-pulse overflow-hidden">
          {/* Image/Icon Placeholder */}
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          {/* Text Content Placeholders */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }}></div>
        </li>
      ))}
    </ul>
  );
};
// --- End SidebarLoader Component ---

const BlogSidebar = ({
  relatedPosts,
  relatedPostsLoading,
  relatedResources,
  resourcesLoading,
  schemaSlugMap,
  currentPostId,
  currentPostType,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize searchHookOptions with better dependency management
  const searchHookOptions = useMemo(() => ({
    documentType: ["makemoney", "aitool", "coding", "seo"],
    searchFields: ['title', 'overview', 'body'],
    pageSlugPrefix: 'article-sidebar',
    componentName: `ArticleSidebarSearch-${currentPostId || 'default'}`,
    minSearchLength: 5,
    enabled: isMounted,
    staleTime: 5 * 60 * 1000, // 5 minutes
    maxAge: 10 * 60 * 1000, // 10 minutes
  }), [currentPostId, isMounted]);

  const searchHook = useCachedSearch(searchHookOptions);

  // Memoize handleInitiateSearch
  const handleInitiateSearch = useCallback(() => {
    const trimmedText = searchHook.searchText.trim();
    if (trimmedText.length >= 5) {
      setTimeout(() => {
        searchHook.handleSearch();
      }, 100);
    } else if (trimmedText.length === 0) {
      searchHook.resetSearch();
    }
  }, [searchHook]);

  // Memoize handleKeyDown
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInitiateSearch();
    }
  }, [handleInitiateSearch]);


  // Refactor Recent Posts section to use useSanityCache with HOMEPAGE.RECENT_POSTS
  const recentPostsQuery = useMemo(() =>
    `*[_type in ["aitool","makemoney","coding","seo","freeairesources","ainews"]]|order(publishedAt desc)[0...3]{_id,title,slug,mainImage{asset->{_id,url},alt},publishedAt,_type}`
    , []); // Query is static

  const recentPostsCacheOptions = useMemo(() => ({
    componentName: 'BlogSidebarRecentPosts',
    staleTime: 3 * 60 * 1000, // Consistent with homepage recent posts
    maxAge: 15 * 60 * 1000,
    enableOffline: true,
  }), []);

  const {
    data: recentData,
    isLoading: recentLoading,
    error: recentError,
    refresh: refreshRecentPosts,
    isStale: recentIsStale,
  } = useSanityCache(
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS, // <<< Use the SAME cache key
    recentPostsQuery,
    {}, // No params for this query
    recentPostsCacheOptions
  );

  // Register with PageCache for status button
  usePageCache(
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS,
    refreshRecentPosts,
    recentPostsQuery,
    'Sidebar Recent Posts' // Label for the cache status button
  );

  // Internal loading states to ensure loaders show immediately for related posts/resources
  const [internalRelatedPostsLoading, setInternalRelatedPostsLoading] = useState(true);
  const [internalResourcesLoading, setInternalResourcesLoading] = useState(true);

  // Handle internal loading states
  useEffect(() => {
    if (relatedPosts !== undefined || relatedPostsLoading === false) {
      setInternalRelatedPostsLoading(false);
    }
  }, [relatedPosts, relatedPostsLoading]);

  useEffect(() => {
    if (relatedResources !== undefined || resourcesLoading === false) {
      setInternalResourcesLoading(false);
    }
  }, [relatedResources, resourcesLoading]);

  // Render search results using data from searchHook
  return (
    <div className="w-full px-4 mt-4 lg:w-4/12">
      {/* Search Section */}
     <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
  <div className="flex items-center justify-between">
    <input
      type="text"
      placeholder="Search here..."
      className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
      value={searchHook.searchText}
      onChange={(e) => searchHook.updateSearchText(e.target.value)}
      onKeyDown={handleKeyDown}
    />
    <button
      aria-label="search button"
      className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white"
      onClick={handleInitiateSearch}
                  disabled={searchHook.isSearchLoading} // Disable during loading

    >
   {searchHook.isSearchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
          <button
            aria-label="reset button"
            className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            onClick={searchHook.resetSearch}
            disabled={searchHook.isSearchLoading} // Disable during loading
          >
            Reset
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchHook.searchText.trim().length > 0 && (
        <SearchResults
          searchResults={searchHook.searchResults}
          isLoading={searchHook.isSearchLoading}
          error={searchHook.searchError}
          isSearchActive={searchHook.isSearchActive}
          searchText={searchHook.searchText}
          pageSlugPrefix={schemaSlugMap[currentPostType] || 'article-sidebar'}
          showNoResults={searchHook.showNoResults}
          cacheSource={searchHook.cacheSource}
          isStale={searchHook.isStale}
          onResetSearch={searchHook.resetSearch}
          onRefreshSearch={searchHook.refreshSearch}
          className="mb-10"
          minSearchLength={5}
        />
      )}
      <div className="space-y-8">
        {/* Related Posts Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4-4m-4 4l4-4m0 0l-1.102 1.102" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Related Posts</h3>
            </div>
            {(relatedPostsLoading || internalRelatedPostsLoading) ? (
              <SidebarLoader />
            ) : relatedPosts && relatedPosts.length > 0 ? (
              <ul className="p-6 space-y-4">
                {relatedPosts.map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={urlForImage(post.mainImage).url()}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                        date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      />
                    </div>
                    {index < relatedPosts.length - 1 && (
                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No related posts found.</p>
            )}
          </div>
        </div>
        {/* Related Resources Section - NEW */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4-4m-4 4l4-4m0 0l-1.102 1.102" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Related Resources</h3>
            </div>
            {(resourcesLoading || internalResourcesLoading) ? (
              <SidebarLoader />
            ) : (
              <SidebarRelatedResources resources={relatedResources} isLoading={resourcesLoading} maxItems={3} />
            )}
          </div>
        </div>
        {/* Recent Posts Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Recent Posts</h3>
            </div>
            {recentLoading ? (
              <SidebarLoader />
            ) : recentData && recentData.length > 0 ? ( // Added check for recentData
              <ul className="p-6 space-y-4">
                {recentData.slice(0, 3).map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-emerald-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={post.mainImage ? urlForImage(post.mainImage).url() : "/path-to-placeholder-image.jpg"}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug?.current || ""}`}
                        date={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
                      />
                    </div>
                    {index < 2 && (
                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent posts found.</p>
            )}
            {/* Explore All Posts Link */}
            <Link href="/blogs" className="block mt-6">
              <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 text-lg font-semibold text-white">
                  <span className="text-xl">🚀</span>Explore All Posts<span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
        {/* Popular Categories Section */}
        <div className="group mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg"></div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Popular Categories</h3>
            </div>
            <ul className="p-6 space-y-3">
              {[
                { href: "/ai-tools", icon: "⚙️", label: "AI Tools", gradient: "from-blue-500 to-cyan-500" },
                { href: "/ai-learn-earn", icon: "💰", label: "Learn & Earn With AI", gradient: "from-green-500 to-emerald-500" },
                { href: "/free-ai-resources", icon: "🎁", label: "Free AI Resources", gradient: "from-purple-500 to-violet-500" },
                { href: "/ai-seo", icon: "📈", label: "SEO With AI", gradient: "from-orange-500 to-red-500" },
                { href: "/ai-code", icon: "💻", label: "Code With AI", gradient: "from-indigo-500 to-purple-500" }
              ].map((category, index) => (
                <li key={category.href} className="group/cat">
                  <Link href={category.href} className="flex items-center gap-4 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-300 group-hover/cat:scale-[1.02] group-hover/cat:shadow-md">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg text-white text-lg group-hover/cat:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover/cat:text-primary transition-colors duration-300">{category.label}</span>
                    </div>
                    <svg className="h-5 w-5 text-gray-400 group-hover/cat:text-primary group-hover/cat:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <br /><br />
      <NewsLatterBox />
      {/* Tailwind CSS keyframes for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default BlogSidebar;