/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useCallback, useMemo } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';
import ReusableCachedFeaturePost from "@/app/ai-tools/CachedAIToolsFeaturePost";
import ReusableCachedAllBlogs from "@/app/ai-tools/CachedAIToolsAllBlogs";
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";

export const revalidate = false;
export const dynamic = "force-dynamic";

export default function AIToolPage() { // This component name might be confusing if it's ai-tools/page.jsx
  // State for main blog pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogsTotalPages, setAllBlogsTotalPages] = useState(1);
  // Removed redundant states: searchResults, hasMorePages, totalItems,
  // as their functionality is now handled by searchHook or by allBlogsTotalPages.

  // Initialize search hook
  const searchHookOptions = useMemo(() => ({
    documentType: 'aitool', // Correct document type for this page
    searchFields: ['title', 'overview', 'body'],
    pageSlugPrefix: 'ai-tools',
    componentName: 'AIToolsPageSearch', // Specific component name for this page's search
    minSearchLength: 1,
  }), []);

  const searchHook = useCachedSearch(searchHookOptions);

  // Main blog pagination handlers
  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Callback to receive pagination status from ReusableCachedAllBlogs
  const handleAllBlogsDataLoad = useCallback((hasMore, fetchedTotalPages, fetchedTotalItems) => {
    // Only set total pages here; hasMore and totalItems are primarily for ReusableCachedAllBlogs's internal logic/debugging
    setAllBlogsTotalPages(fetchedTotalPages);
  }, []);

  // Main blog next button disabled logic:
  // Disabled if search is active OR if on the last page of main blogs
  const isNextButtonDisabled = searchHook.isSearchActive || currentPage >= allBlogsTotalPages;


  return (
    <PageCacheProvider pageType="ai-tools" pageId="main">
      {/* Outer wrapper with gradient background matching AISEOPage */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">

        {/* Breadcrumb Section */}
        <section className="pt-8">
          <Breadcrumb
            pageName="Best AI Tools"
            pageName2="for Productivity"
            description="Unlock the power of AI to enhance productivity and creativity like never before!! In this category, we review the best freemium AI tools designed to streamline tasks and boost SEO. Discover smart solutions that transform your workflow, whether you're a digital marketer, SEO professional, or curious beginner. Our insights help you work smarter, save time, and elevate your project with cutting-edge AI technology."
            firstlinktext="Home"
            firstlink="/"
            link="/ai-tools"
            linktext="ai-tools"
          />
        </section>

        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-12">

          {/* Cache Status Button */}
          <div className="mb-8 flex justify-end">
            <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
              <PageCacheStatusButton />
            </div>
          </div>

          {/* Feature Post Section */}
          <section className="mb-16">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
              <ReusableCachedFeaturePost
                documentType="aitool"
                pageSlugPrefix="ai-tools"
                cacheKey={CACHE_KEYS.PAGE.FEATURE_POST('ai-tools')}
              />
            </div>
          </section>

          {/* Search Section - Styled to match AISEOPage */}
          <section className="mb-16">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white">Search Our AI Tools</h3>
                <p className="mt-2 text-blue-100">Find exactly what you're looking for</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for AI tools, categories, features..."
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

          {/* Search Results */}
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
            className="mb-16" // Added mb-16 for consistent spacing
          />

          {/* Main Blog Section */}
          {!searchHook.isSearchActive && (
            <section className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                  Latest <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Tools</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Explore the newest and most effective AI tools to boost your productivity.
                </p>
                <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                <ReusableCachedAllBlogs
                  currentPage={currentPage}
                  limit={10} // Keeping limit as 10 as per original
                  documentType="aitool" // Correct document type for this page
                  pageSlugPrefix="ai-tools"
                  onDataLoad={handleAllBlogsDataLoad}
                />

                {/* Main Blog Pagination Controls */}
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
              </div>
            </section>
          )}
        </div>
      </div>
    </PageCacheProvider>
  );
}