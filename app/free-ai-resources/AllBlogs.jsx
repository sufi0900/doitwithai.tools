/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useCallback, useMemo } from "react";
import ResourceCard from "./ResourceCard";
import ResourceListSchema from "./ResourceListSchema";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import "animate.css";
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SkelCard from "@/components/Blog/Skeleton/Card";

// Import our new cached components
import ReusableCachedFeaturedFreeResources from './ReusableCachedFeaturedFreeResources';
// import ReusableCachedFreeResourcesCounts from './ReusableCachedFreeResourcesCounts';
import ReusableCachedFreeResourcesList from './ReusableCachedFreeResourcesList';

const RESOURCE_LIMIT = 6;

export default function FreeResourcesPage({ initialServerData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState('publishedAt');

  const [resourceCounts, setResourceCounts] = useState(initialServerData?.resourceCounts || {});
  const [totalPages, setTotalPages] = useState(
    initialServerData?.resourceList ? Math.ceil(initialServerData.resourceList.length / RESOURCE_LIMIT) : 1
  );
  const [totalItems, setTotalItems] = useState(initialServerData?.resourceCounts?.all || 0);
  const [hasMorePages, setHasMorePages] = useState((initialServerData?.resourceList?.length || 0) > RESOURCE_LIMIT);
  const [listResources, setListResources] = useState(initialServerData?.resourceList?.slice(0, RESOURCE_LIMIT) || []);

  const getCustomSearchFilter = useCallback(() => {
    return { filter: '', params: {} };
  }, []);

  const searchHookOptions = useMemo(() => ({
    documentType: ["freeResources"],
    searchFields: ["title", "overview", "content", "resourceType", "aiToolDetails.toolCategory", "aiToolDetails.functionality"],
    pageSlugPrefix: 'free-ai-resources',
    componentName: "free-resources-page-search",
    minSearchLength: 1,
    getCustomFilter: getCustomSearchFilter,
  }), [getCustomSearchFilter]);
  const searchHook = useCachedSearch(searchHookOptions);

  const resourceFormats = [
    { label: "All Resources", value: "all" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Text/Prompts", value: "text" },
    { label: "Documents", value: "document" },
    { label: "AI Tools", value: "aitool" }
  ];

  const sortOptions = [
    { label: "Most Recent", value: "publishedAt" },
    { label: "Title A-Z", value: "title-asc" },
    { label: "Title Z-A", value: "title-desc" }
  ];

  const handleCountsLoad = useCallback((counts) => {
    setResourceCounts(counts);
  }, []);

  const handleListLoad = useCallback((loadedTotalPages, loadedTotalItems, loadedHasMore, resources) => {
    setTotalPages(loadedTotalPages);
    setTotalItems(loadedTotalItems);
    setHasMorePages(loadedHasMore);
    setListResources(resources);
  }, []);

  const initiateSearch = useCallback(() => {
    const trimmedSearchText = searchHook.searchText.trim();
    if (trimmedSearchText.length >= searchHook.minSearchLength) {
      searchHook.handleSearch();
      setIsSearchActive(true);
      setCurrentPage(1);
    } else {
      handleResetSearch();
    }
  }, [searchHook]);

  const handleResetSearch = useCallback(() => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setCurrentPage(1);
  }, [searchHook]);

  const handlePrevious = useCallback(() => {
    if (!searchHook.isSearchActive && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [searchHook.isSearchActive, currentPage]);

  const handleNext = useCallback(() => {
    if (!searchHook.isSearchActive && hasMorePages && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [searchHook.isSearchActive, hasMorePages, currentPage, totalPages]);

  const handleFormatChange = (format) => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setSelectedFormat(format);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const getCountForFormat = useCallback((format) => {
    return searchHook.isSearchActive
      ? (searchHook.searchResults?.length || 0)
      : (resourceCounts[format] || 0);
  }, [resourceCounts, searchHook.isSearchActive, searchHook.searchResults?.length]);

  return (
    <PageCacheProvider pageType="free-resources" pageId="main">
      <div className="container mx-auto px-4 mt-10">
        <div className="mb-6 flex justify-end gap-2">
          <PageCacheStatusButton />
        </div>

        {/* Featured Resources Section */}
        <ReusableCachedFeaturedFreeResources
          initialData={initialServerData?.featuredResource}
        />

        {/* --- Search and Filter Section --- */}
        <section className="mb-20">
          <div className="mb-8 "> {/* Centered the text for a cleaner look */}
            <h3 className="mb-4 text-2xl font-bold tracking-wide text-gray-900 dark:text-white md:text-3xl lg:text-4xl">
              <span className="relative text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[3px] after:w-full after:bg-blue-600">
                Search Our
              </span>
              {" "}
              <span className="relative font-extrabold text-blue-600">
                Free AI Resources
              </span>
            </h3>
            <p className="text-base font-medium leading-relaxed text-gray-600 dark:text-gray-400 mx-auto">
              Find exactly what you're looking for in our comprehensive collection of free AI resources.
            </p>
          </div>
          <div className="rounded-2xl p-6 md:p-8 shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for free AI resources..."
                  className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-transparent px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 shadow-sm"
                  value={searchHook.searchText}
                  onChange={(e) => searchHook.updateSearchText(e.target.value)}
                  onKeyDown={searchHook.handleKeyDown}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={initiateSearch}
                  className="flex items-center justify-center rounded-full bg-blue-600 px-6 py-4 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  Search
                </button>
                <button
                  onClick={handleResetSearch}
                  className="flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-transparent px-6 py-4 font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Buttons with Counts */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {resourceFormats.map((format) => (
            <button
              key={format.value}
              onClick={() => handleFormatChange(format.value)}
              disabled={searchHook.isSearchActive}
              className={`flex items-center rounded-full px-6 py-3 font-medium transition-all duration-200 shadow-sm ${
                selectedFormat === format.value
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' // Active button styling
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600' // Inactive button styling
              } ${searchHook.isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {format.label}
              <span className="ml-2 rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-800 dark:text-gray-200">
                {getCountForFormat(format.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Resources Grid (Conditional Rendering based on search vs. main list) */}
        {searchHook.isSearchActive ? (
          <div className="mb-10">
            {searchHook.isSearchLoading && (
              <div className="flex flex-wrap -mx-3">
                {Array.from({ length: RESOURCE_LIMIT }).map((_, index) => (
                  <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-3">
                    <SkelCard />
                  </div>
                ))}
              </div>
            )}

            {searchHook.searchError && !searchHook.searchResults.length && !searchHook.isSearchLoading && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load search results. {searchHook.searchError.message}</p>
                {searchHook.refreshSearch && (
                  <button onClick={searchHook.refreshSearch} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Retry Search</button>
                )}
              </div>
            )}

            {searchHook.showNoResults && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No resources found matching "{searchHook.searchText}". Try a different search term.</p>
              </div>
            )}

            {searchHook.searchResults && searchHook.searchResults.length > 0 && (
              <div className="flex flex-wrap -mx-3">
                {searchHook.searchResults.map((resource) => (
                  <ResourceCard key={resource._id} resource={resource} />
                ))}
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800 mt-4">
                Search Status: Active:{searchHook.isSearchActive ? 'Yes' : 'No'}|Loading:{searchHook.isSearchLoading ? 'Yes' : 'No'}|Results:{searchHook.searchResults.length}|CacheSource:{searchHook.cacheSource}|Stale:{searchHook.isStale ? 'Yes' : 'No'}|Query:{searchHook.debouncedSearchText}
              </div>
            )}
          </div>
        ) : (
          <ReusableCachedFreeResourcesList
            currentPage={currentPage}
            selectedFormat={selectedFormat}
            sortBy={sortBy}
            onDataLoad={handleListLoad}
            initialData={initialServerData?.resourceList}
          />
        )}

        {/* ResourceListSchema: Only show for main content, not search results */}
        {!searchHook.isSearchActive && totalItems > 0 && (
          <ResourceListSchema
            resources={listResources}
            baseUrl="https://www.doitwithai.tools/free-ai-resources"
          />
        )}

        {/* Pagination (visible only if not in search view and if there are items to paginate) */}
        {!searchHook.isSearchActive && totalItems > 0 && (
          <div className="flex justify-center items-center space-x-4 mb-10">
            <nav className="flex items-center space-x-2 rounded-lg p-2 bg-transparent shadow-md border border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-sm">
                {currentPage}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasMorePages || currentPage >= totalPages}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                  !hasMorePages || currentPage >= totalPages
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </PageCacheProvider>
  );
}