/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState, useCallback, useMemo } from "react";

// Reusable Components
import Breadcrumb from "@/components/Common/Breadcrumb";
import ReusableCachedFeaturePost from "@/app/ai-tools/CachedAIToolsFeaturePost";
import ReusableCachedAllBlogs from "@/app/ai-tools/CachedAIToolsAllBlogs";

// Caching System Imports
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";

// Search System Imports
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';

// No longer needed since ReusableCachedAllBlogs handles fetching and CardComponent handles rendering
// import { urlForImage } from "@/sanity/lib/image";
// import { client } from "@/sanity/lib/client";
// import CardComponent from "@/components/Card/Page";


export const revalidate = false;
export const dynamic = "force-dynamic";

export default function AICodingPage() {
  // State for main blog pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogsTotalPages, setAllBlogsTotalPages] = useState(1); // Renamed for consistency

  // Initialize search hook with specific options for this page
  const searchHookOptions = useMemo(() => ({
    documentType: 'coding', // Document type for this page
    searchFields: ['title', 'overview', 'body'],
    pageSlugPrefix: 'ai-code', // Slug prefix for links on this page
    componentName: 'AICodingPageSearch', // Unique name for the search cache
    minSearchLength: 1,
  }), []);

  const searchHook = useCachedSearch(searchHookOptions);

  // Main blog pagination handlers
  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  // Callback to receive pagination details from ReusableCachedAllBlogs
  const handleAllBlogsDataLoad = useCallback((hasMore, fetchedTotalPages, fetchedTotalItems) => {
    // Only update total pages here, hasMore and totalItems are managed internally by ReusableCachedAllBlogs
    setAllBlogsTotalPages(fetchedTotalPages);
  }, []);

  // Main blog next button disabled logic
  // Disabled if on the last page of main blogs OR if search is currently active
  const isNextButtonDisabled = searchHook.isSearchActive || currentPage >= allBlogsTotalPages;

  return (
    <PageCacheProvider pageType="ai-code" pageId="main">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">

        {/* Breadcrumb Section - Updated Styling */}
        <Breadcrumb
          pageName="Code"
          pageName2="With AI"
          description="The future of coding is here! Explore how AI can become your powerful coding partner. In this category, we guide you through using AI tools like ChatGPT to solve complex coding problems and build websites with minimal technical knowledge. Learn how to transform ideas into functioning digital products quickly and efficiently."
          firstlinktext="Home"
          firstlink="/"
          link="/ai-code"
          linktext="code-with-ai" // Ensure this matches the page's actual slug
        />

        {/* Cache Status Button - Updated Styling */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex justify-end">
            <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
              <PageCacheStatusButton />
            </div>
          </div>

          {/* Feature Post Section - Updated Styling */}
          <section className="mb-16">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
              <ReusableCachedFeaturePost
                documentType="coding" // Document type for this page's feature post
                pageSlugPrefix="ai-code"
                cacheKey={CACHE_KEYS.PAGE.FEATURE_POST('coding')}
              />
            </div>
          </section>

          {/* Search Section - Copied directly from AISEOPage */}
          <section className="mb-16">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white">Search Our AI Coding Resources</h3>
                <p className="mt-2 text-blue-100">Find exactly what you're looking for</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for coding guides, tools, tips..."
                    className="w-full rounded-xl border-0 bg-white/10 px-6 py-4 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400"
                    value={searchHook.searchText}
                    onChange={(e) => searchHook.updateSearchText(e.target.value)}
                    onKeyDown={searchHook.handleKeyDown}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={searchHook.handleSearch}
                    className="flex items-center justify-center rounded-xl bg-white px-6 py-4 font-medium text-blue-600 shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>

                  <button
                    onClick={searchHook.resetSearch}
                    className="flex items-center justify-center rounded-xl bg-white/20 px-6 py-4 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Search Results - Copied directly from AISEOPage */}
          <SearchResults
            searchResults={searchHook.searchResults}
            isLoading={searchHook.isSearchLoading}
            error={searchHook.searchError}
            isSearchActive={searchHook.isSearchActive}
            searchText={searchHook.searchText}
            pageSlugPrefix={searchHook.pageSlugPrefix}
            showNoResults={searchHook.showNoResults}
            cacheSource={searchHook.cacheSource}
            isStale={searchHook.isStale}
            onResetSearch={searchHook.resetSearch}
            onRefreshSearch={searchHook.refreshSearch}
            className="mb-16" // Ensures spacing consistent with AISEOPage
          />

          {/* Main Blog Section - Only visible when search is NOT active */}
          {!searchHook.isSearchActive && (
            <section className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                  Latest <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Coding Insights</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Stay ahead of the curve with our latest AI-powered coding strategies and insights
                </p>
                <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Reusable Cached All Blogs component */}
              <ReusableCachedAllBlogs
                currentPage={currentPage}
                limit={4} // Using 4 like AISEOPage's main blog limit for consistency
                documentType="coding" // Document type for the main blog list
                pageSlugPrefix="ai-code"
                onDataLoad={handleAllBlogsDataLoad}
              />

              {/* Main Blog Pagination - Copied directly from AISEOPage's styling and logic */}
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`
                      flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                      ${currentPage === 1
                        ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                        : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'
                      }
                    `}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
                    {currentPage}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isNextButtonDisabled}
                    className={`
                      flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                      ${isNextButtonDisabled
                        ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                        : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'
                      }
                    `}
                  >
                    Next
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </section>
          )}
        </div>
      </div>
    </PageCacheProvider>
  );
}