/*eslint-disable @next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { urlForImage } from "@/sanity/lib/image";
import SidebarRelatedResources from "@/app/free-ai-resources/SidebarRelatedResources";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import RelatedPost from "./RelatedPost";
import SearchResults from '@/React_Query_Caching/SearchResults';
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import Link from 'next/link';
// Import the new Trustpilot component
import TrustpilotSidebarInvite from './TrustpilotSidebarInvite'; 

// Caching System Imports for Recent Posts
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import {

  Link as LinkIcon,

} from 'lucide-react';
// Professional Icon Components
const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);


const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GridIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ToolIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrendingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const GiftIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const MoneyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RocketIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// --- Enhanced SidebarLoader Component ---
const SidebarLoader = ({ count = 3 }) => {
  return (
    <ul className="p-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="relative flex items-center space-x-3 animate-pulse overflow-hidden rounded-lg p-3">
          {/* Image/Icon Placeholder */}
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          {/* Text Content Placeholders */}
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2563eb]/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        </li>
      ))}
    </ul>
  );
};

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

  const searchHookOptions = useMemo(() => ({
    documentType: ["makemoney", "aitool", "coding", "seo"],
    searchFields: ['title', 'overview', 'body'],
    pageSlugPrefix: 'article-sidebar',
    componentName: `ArticleSidebarSearch-${currentPostId || 'default'}`,
    minSearchLength: 5,
    enabled: isMounted,
    staleTime: 5 * 60 * 1000,
    maxAge: 10 * 60 * 1000,
  }), [currentPostId, isMounted]);

  const searchHook = useCachedSearch(searchHookOptions);

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

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInitiateSearch();
    }
  }, [handleInitiateSearch]);

  const recentPostsQuery = useMemo(() =>
    `*[_type in ["aitool","makemoney","coding","seo","freeairesources","ainews"]]|order(publishedAt desc)[0...3]{_id,title,slug,mainImage{asset->{_id,url},alt},publishedAt,_type}`
    , []);

  const recentPostsCacheOptions = useMemo(() => ({
    componentName: 'BlogSidebarRecentPosts',
    staleTime: 3 * 60 * 1000,
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
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS,
    recentPostsQuery,
    {},
    recentPostsCacheOptions
  );

  usePageCache(
    CACHE_KEYS.HOMEPAGE.RECENT_POSTS,
    refreshRecentPosts,
    recentPostsQuery,
    'Sidebar Recent Posts'
  );

  const [internalRelatedPostsLoading, setInternalRelatedPostsLoading] = useState(true);
  const [internalResourcesLoading, setInternalResourcesLoading] = useState(true);

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

  // Dynamically determine the URL for the related posts
  const viewAllUrl = useMemo(() => {
    return schemaSlugMap[currentPostType] 
      ? `/${schemaSlugMap[currentPostType]}` 
      : '/articles';
  }, [schemaSlugMap, currentPostType]);

  return (
    <div className="w-full px-3 mt-4 lg:w-4/12">
      {/* Enhanced Search Section */}
      <div className="mb-6 mt-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 lg:mt-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-4">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-sm">Search Articles</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all duration-300"
                value={searchHook.searchText}
                onChange={(e) => searchHook.updateSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              aria-label="search button"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-300 disabled:opacity-50"
              onClick={handleInitiateSearch}
              disabled={searchHook.isSearchLoading}
            >
              {searchHook.isSearchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <SearchIcon className="w-4 h-4" />
              )}
            </button>
            <button
              aria-label="reset button"
              className="flex h-10 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors duration-300 text-xs font-medium disabled:opacity-50"
              onClick={searchHook.resetSearch}
              disabled={searchHook.isSearchLoading}
            >
              Reset
            </button>
          </div>
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
          schemaSlugMap={schemaSlugMap}
          showNoResults={searchHook.showNoResults}
          cacheSource={searchHook.cacheSource}
          isStale={searchHook.isStale}
          onResetSearch={searchHook.resetSearch}
          onRefreshSearch={searchHook.refreshSearch}
          className="mb-6"
          minSearchLength={3}
          isSidebarView={true}
        />
      )}

      <div className="space-y-6">
        {/* Related Posts Section */}
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] shadow-sm">
                <LinkIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Related Posts</h3>
            </div>
          </div>
          {(relatedPostsLoading || internalRelatedPostsLoading) ? (
            <SidebarLoader />
          ) : relatedPosts && relatedPosts.length > 0 ? (
            <>
              <ul className="p-4 space-y-3">
                {relatedPosts.map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-[#2563eb] scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-3 group-hover/item:pl-4 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={urlForImage(post.mainImage).url()}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                        date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      />
                    </div>
                    {index < relatedPosts.length - 1 && (
                      <div className="mt-3 h-px bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Added: Dynamic "View All Posts" button */}
              <div className="p-4 pt-0">
                <Link href={viewAllUrl} className="block">
                  <div className="group/cta relative overflow-hidden rounded-lg bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-3 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-white">
                      <RocketIcon className="w-4 h-4" />
                      View All Related Posts
                      <ArrowRightIcon className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No related posts found.</p>
          )}
        </div>

        {/* Related Resources Section */}
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm">
                <GiftIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Related Resources</h3>
            </div>
          </div>
          {(resourcesLoading || internalResourcesLoading) ? (
            <SidebarLoader />
          ) : (
            <SidebarRelatedResources resources={relatedResources} isLoading={resourcesLoading} maxItems={3} />
          )}
        </div>

        {/* Recent Posts Section */}
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          {/* Top Heading Section */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <ClockIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Recent Posts</h3>
            </div>
          </div>

          {recentLoading ? (
            <SidebarLoader />
          ) : recentData && recentData.length > 0 ? (
            <>
              <ul className="p-4 space-y-3">
                {recentData.slice(0, 3).map((post, index) => (
                  <li key={post._id} className="group/item relative">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                    <div className="pl-3 group-hover/item:pl-4 transition-all duration-300">
                      <RelatedPost
                        title={post.title}
                        image={post.mainImage ? urlForImage(post.mainImage).url() : "/path-to-placeholder-image.jpg"}
                        slug={`/${schemaSlugMap[post._type]}/${post.slug?.current || ""}`}
                        date={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
                      />
                    </div>
                    {index < 2 && (
                      <div className="mt-3 h-px bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Explore All Posts Button (Already correct) */}
              <div className="p-4 pt-0">
                <Link href="/blogs" className="block">
                  <div className="group/cta relative overflow-hidden rounded-lg bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-3 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-white">
                      <RocketIcon className="w-4 h-4" />
                      Explore All Posts
                      <ArrowRightIcon className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No recent posts found.</p>
          )}
        </div>
        {/* Popular Categories Section */}
        <div className="group mb-4 relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm">
                <GridIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Popular Categories</h3>
            </div>
          </div>
          <ul className="p-4 space-y-3">
            {[
              { href: "/ai-tools", icon: ToolIcon, label: "AI Tools" },
              { href: "/ai-learn-earn", icon: MoneyIcon, label: "Learn & Earn With AI" },
              { href: "/free-ai-resources", icon: GiftIcon, label: "Free AI Resources" },
              { href: "/ai-seo", icon: TrendingIcon, label: "SEO With AI" },
              { href: "/ai-code", icon: CodeIcon, label: "Code With AI" }
            ].map((category, index) => (
              <li key={category.href} className="group/cat">
                <Link href={category.href} className="flex items-center gap-4 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group-hover/cat:shadow-md">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg text-white text-lg group-hover/cat:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/cat:text-blue-700 transition-colors duration-300">{category.label}</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover/cat:text-blue-700 group-hover/cat:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <NewsLatterBox />
      </div>
            {/* NEW: Trustpilot Invitation Card */}
      <div className="mb-6 mt-8">
        <TrustpilotSidebarInvite />
      </div>

      {/* Enhanced Shimmer Animation */}
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