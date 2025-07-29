// app/blogs/AllBlogsAggregated.jsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useCallback, useMemo } from "react";

// Components - Remove Breadcrumb, Hero, Search/Filter from here
// as they are now in StaticBlogsPageShell.jsx
import FilterIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Reusable Blog/Caching Components
import ReusableCachedMixedBlogs from "./ReusableCachedAllBlogsGeneral";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';
import UnifiedCacheMonitor from "@/React_Query_Caching/UnifiedCacheMonitor";


export const revalidate = false; // This is a client component, revalidate doesn't apply here.
export const dynamic = "force-dynamic"; // This is a client component, dynamic doesn't apply here.

export default function AllBlogsAggregated({ initialServerData }) {
  const schemaSlugMap = useMemo(() => ({
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  }), []);

  const categoryDisplayNames = useMemo(() => ({
    aitool: "AI Tools",
    seo: "AI SEO",
    coding: "AI Code",
    makemoney: "AI Learn & Earn"
  }), []);

  const cardsPerPage = 5; // Matches the limit passed to ReusableCachedMixedBlogs and server-side fetch

  // State for pagination and filters (managed by parent, but updated by child via onDataLoad)
  const [currentPage, setCurrentPage] = useState(1); // Always start at 1 for the client-side
  const [totalPages, setTotalPages] = useState(
    initialServerData?.totalCount ? Math.ceil(initialServerData.totalCount / cardsPerPage) : 1
  );
  const [totalCount, setTotalCount] = useState(initialServerData?.totalCount || 0);

  // Filter & Sort states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt desc');
  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle

  // Initialize useCachedSearch for searching across ALL blog schemas
  const searchHookOptions = useMemo(() => ({
    documentType: ["makemoney", "aitool", "coding", "seo"], // Document types to search across ALL blogs
    searchFields: ['title', 'overview', 'body'], // Fields to search within
    pageSlugPrefix: 'all-blogs', // A generic prefix for search result links on this page
    componentName: 'AllBlogsPageSearch', // Unique scope identifier for this page's search cache
    minSearchLength: 1,
  }), []);

  const searchHook = useCachedSearch(searchHookOptions);

  // Callback to receive pagination data from ReusableCachedMixedBlogs
  const handleMixedBlogsDataLoad = useCallback((fetchedCurrentPg, fetchedTotalPgs, fetchedTotalCnt) => {
    setCurrentPage(fetchedCurrentPg);
    setTotalPages(fetchedTotalPgs);
    setTotalCount(fetchedTotalCnt);
  }, []);

  // Handle Search function - now uses the hook's performSearch
  const handleInitiateSearch = useCallback(() => {
    const trimmedText = searchHook.searchText.trim();
    if (trimmedText.length > 0) {
      searchHook.handleSearch();
      setCurrentPage(1); // Reset to page 1 on search
    } else {
      searchHook.resetSearch();
      setCurrentPage(1); // Reset to page 1 when search is cleared
    }
  }, [searchHook.searchText, searchHook.handleSearch, searchHook.resetSearch]);

  // Handle category filter change
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on filter change
    searchHook.resetSearch(); // Clear search results as filters affect the main list
  }, [searchHook]);

  // Handle sort order change
  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page on sort change
    searchHook.resetSearch(); // Clear search results as sort affects the main list
  }, [searchHook]);

  // Pagination handlers
  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  return (
    <PageCacheProvider pageType="blogs" pageId="all-posts">
      <UnifiedCacheMonitor />

      {/* Search and Filter Section - Now part of the dynamic client component */}
      <section className="mb-12">
        {/* Adjusted background to match the reference search bar */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 shadow-xl">
          {/* Search Bar - Applied styling from reference */}
          <div className="flex flex-col md:flex-row gap-4 mb-6"> {/* Removed mb-6 to match reference structure */}
             <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                // Applied styling from reference
                className="w-full rounded-xl border-0 bg-white/10 px-6 py-4 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400"
                value={searchHook.searchText}
                onChange={(e) => searchHook.updateSearchText(e.target.value)}
                onKeyDown={searchHook.handleKeyDown}
              />
              {/* Search Icon - Moved inside the input wrapper to match reference */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <SearchIcon className="h-5 w-5 text-blue-200" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleInitiateSearch}
                // Applied styling from reference
                className="flex items-center justify-center rounded-xl bg-white px-6 py-4 font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md"
              >
                <SearchIcon className="mr-2 h-5 w-5" />
                Search
              </button>
              {searchHook.isSearchActive && (
                <button
                  onClick={searchHook.resetSearch}
                  // Applied styling from reference
                  className="flex items-center justify-center rounded-xl bg-white/20 px-6 py-4 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md"
                >
                  <ClearIcon className="mr-2 h-5 w-5" /> {/* Using ClearIcon for reset */}
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle Button (Mobile) - Adjusted colors */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl font-medium transition-all duration-300"
            >
              <FilterIcon />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters (conditionally hidden on mobile) - Adjusted colors */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter('all')}
                  disabled={searchHook.isSearchActive}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' // Main theme color gradient
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' // Lighter blue for inactive
                  } ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  All Categories
                </button>
                {Object.entries(categoryDisplayNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryFilter(key)}
                    disabled={searchHook.isSearchActive}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' // Main theme color gradient
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' // Lighter blue for inactive
                    } ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Sort Options - Adjusted colors */}
              <div className="flex items-center gap-3">
                <SortIcon className="text-blue-500" /> {/* Icon color */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  disabled={searchHook.isSearchActive}
                  className={`px-4 py-3 rounded-xl border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="publishedAt desc">Latest First</option>
                  <option value="publishedAt asc">Oldest First</option>
                  <option value="title asc">A-Z</option>
                  <option value="title desc">Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count - Updated to reflect search status, text color adjustment */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {searchHook.isSearchActive ? (
              <>Showing <span className="font-semibold text-blue-600">{searchHook.searchResults.length}</span> search results</>
            ) : (
              <>Showing <span className="font-semibold text-blue-600">{Math.min(cardsPerPage, totalCount)}</span> of <span className="font-semibold text-blue-600">{totalCount}</span> articles
                {selectedCategory !== 'all' && (
                  <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {categoryDisplayNames[selectedCategory]}
                  </span>
                )}
              </>
            )}
          </p>
          <CalendarTodayIcon className="text-blue-400" /> {/* Icon color adjustment */}
        </div>
      </div>

      {/* Articles Grid / Search Results (Assuming ReusableCachedMixedBlogs and SearchResults will also be styled separately or handle their own styling based on content) */}
      {searchHook.isSearchActive ? (
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
          className="mb-16"
        />
      ) : (
        <ReusableCachedMixedBlogs
          currentPage={currentPage}
          limit={cardsPerPage}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onDataLoad={handleMixedBlogsDataLoad}
          schemaSlugMap={schemaSlugMap}
          initialPageData={currentPage === 1 ? initialServerData?.firstPageBlogs : undefined}
          initialTotalCount={initialServerData?.totalCount}
        />
      )}

      {/* Pagination - Only show if NOT in search results view - Adjusted colors */}
      {!searchHook.isSearchActive && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2 rounded-lg bg-blue-100 p-2 dark:bg-blue-900"> {/* Pagination background */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-400 cursor-not-allowed' // Disabled state
                  : 'bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-700 shadow-md hover:shadow-lg' // Active state
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Current page indicator using the main gradient */}
              <span className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg">
                {currentPage}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentPage >= totalPages
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-400 cursor-not-allowed' // Disabled state
                  : 'bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-700 shadow-md hover:shadow-lg' // Active state
              }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </PageCacheProvider>
  );
}