/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useCallback, useMemo } from "react";

// Components
import Breadcrumb from "@/components/Common/Breadcrumb"; 
import FilterIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Reusable Blog/Caching Components
import ReusableCachedMixedBlogs from "./ReusableCachedAllBlogsGeneral"; // This is the component for the main mixed blog list
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider';
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';


export const revalidate = false;
export const dynamic = "force-dynamic";

export default function AllBlogsPage() {
  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
    // Add any other document types and their corresponding slug prefixes
  };

  const categoryDisplayNames = {
    aitool: "AI Tools",
    seo: "AI SEO",
    coding: "AI Code",
    makemoney: "AI Learn & Earn"
  };

  // State for pagination and filters (managed by parent, but updated by child via onDataLoad)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter & Sort states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt desc');
  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle

  const cardsPerPage = 5; // Matches the limit passed to ReusableCachedMixedBlogs

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
  // This function is now just a wrapper for the search hook's functionality
// CRITICAL FIX: Simplified search handler
const handleInitiateSearch = useCallback(() => {
  const trimmedText = searchHook.searchText.trim();
  if (trimmedText.length > 0) {
    searchHook.handleSearch();
    setCurrentPage(1);
  } else {
    searchHook.resetSearch();
    setCurrentPage(1);
  }
}, [searchHook.searchText, searchHook.handleSearch, searchHook.resetSearch]); // FIXED: More specific dependencies
  // Handle category filter change
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on filter change
    searchHook.resetSearch(); // Clear search results as filters affect the main list
  };

  // Handle sort order change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page on sort change
    searchHook.resetSearch(); // Clear search results as sort affects the main list
  };

  // Pagination handlers (controlled by parent's state, updated by child)
  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current count for display in Hero Section Stats Bar
  const currentDisplayCount = searchHook.isSearchActive ? searchHook.searchResults.length : totalCount;

  return (
    <PageCacheProvider pageType="blogs" pageId="all-posts">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">

        {/* Breadcrumb Section - New Styling */}
        <Breadcrumb
          pageName="AI-Powered"
          pageName2="Blog Hub"
          description="Discover cutting-edge AI insights and articles across our AI-powered categories. Get the best AI tools, SEO strategies, coding techniques, and monetization opportunities. It's your complete resource for mastering AI in the digital world."
          firstlinktext="Home"
          firstlink="/"
          link="/all-blogs"
          linktext="all-blogs"
        />

        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-12">

          {/* Cache Status Button - New Styling */}
          <div className="mb-8 flex justify-end">
            <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
              {/* <PageCacheStatusButton /> */}
            </div>
          </div>

          {/* Hero Section - New Styling */}
          <section className="text-center mb-16">
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
              <span className="relative inline-block mr-3">
                AI-Powered
                <span className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blog Hub
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Discover cutting-edge AI insights and articles across our AI-powered categories. Get the best AI tools, SEO strategies, coding techniques, and monetization opportunities. It's your complete resource for mastering AI in the digital world.
            </p>

            {/* Stats Bar */}
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentDisplayCount}+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">Weekly</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Updates</div>
              </div>
            </div>
          </section>

          {/* Search and Filter Section - New Styling */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles, topics, or keywords..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={searchHook.searchText}
                    onChange={(e) => searchHook.updateSearchText(e.target.value)}
                    onKeyDown={searchHook.handleKeyDown}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleInitiateSearch}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Search
                  </button>
                  {searchHook.isSearchActive && ( // Show clear button only when a search is active
                    <button
                      onClick={searchHook.resetSearch} // Directly use searchHook's reset
                      className="px-6 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300"
                    >
                      <ClearIcon />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Toggle Button (Mobile) */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300"
                >
                  <FilterIcon />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filters (conditionally hidden on mobile) */}
              <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      disabled={searchHook.isSearchActive} // Disable filters when search is active
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      All Categories
                    </button>
                    {Object.entries(categoryDisplayNames).map(([key, name]) => (
                      <button
                        key={key}
                        onClick={() => handleCategoryFilter(key)}
                        disabled={searchHook.isSearchActive} // Disable filters when search is active
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                          selectedCategory === key
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-3">
                    <SortIcon className="text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disabled={searchHook.isSearchActive} // Disable sort when search is active
                      className={`px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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

          {/* Results Count - Updated to reflect search status */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {searchHook.isSearchActive ? ( // Use searchHook.isSearchActive to control count display
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
              <CalendarTodayIcon className="text-gray-400" />
            </div>
          </div>

          {/* Articles Grid / Search Results */}
          {searchHook.isSearchActive ? ( // Display search results if search is active
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
          ) : ( // Otherwise display the main mixed blog list
            <ReusableCachedMixedBlogs
              currentPage={currentPage}
              limit={cardsPerPage}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              onDataLoad={handleMixedBlogsDataLoad}
              schemaSlugMap={schemaSlugMap}
            />
          )}

          {/* Pagination - Only show if NOT in search results view */}
          {!searchHook.isSearchActive && (
            <div className="flex justify-center mt-12"> {/* Added mt-12 for spacing */}
              <nav className="flex items-center space-x-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700"> {/* Consistent styling */}
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg">
                    {currentPage}
                  </span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    currentPage >= totalPages
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
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
        </div>
      </div>
    </PageCacheProvider>
  );
}