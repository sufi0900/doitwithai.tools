/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useCallback, useMemo } from "react";
import ResourceCard from "./ResourceCard";
// REMOVED: HeroSection is handled by the shell/layout
import ResourceListSchema from "./ResourceListSchema";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import "animate.css";
// Kept SearchIcon and SortIcon as they are part of the UI

import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SkelCard from "@/components/Blog/Skeleton/Card";

export const revalidate = false;
export const dynamic = "force-dynamic";

// Import our new cached components
import ReusableCachedFeaturedFreeResources from './ReusableCachedFeaturedFreeResources';
import ReusableCachedFreeResourcesCounts from './ReusableCachedFreeResourcesCounts';
import ReusableCachedFreeResourcesList from './ReusableCachedFreeResourcesList';

const RESOURCE_LIMIT = 6;

export default function FreeResourcesPage({ initialServerData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState('publishedAt');

  // Initialize with initialServerData or default values
  const [resourceCounts, setResourceCounts] = useState(initialServerData?.resourceCounts || {});
  const [totalPages, setTotalPages] = useState(
    initialServerData?.resourceList ? Math.ceil(initialServerData.resourceList.length / RESOURCE_LIMIT) : 1
  );
  const [totalItems, setTotalItems] = useState(initialServerData?.resourceCounts?.all || 0);
  const [hasMorePages, setHasMorePages] = useState((initialServerData?.resourceList?.length || 0) > RESOURCE_LIMIT);
  const [listResources, setListResources] = useState(initialServerData?.resourceList?.slice(0, RESOURCE_LIMIT) || []);

  // Custom filter function for useCachedSearch
  const getCustomSearchFilter = useCallback((searchTextFromHook) => {
    return { filter: '', params: {} };
  }, []);

  // Define options for useCachedSearch using useMemo for stability
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

  const handlePrevious = () => {
    if (!searchHook.isSearchActive && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!searchHook.isSearchActive && hasMorePages && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

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
      <div className="container mx-auto px-4 mt-10"> {/* Added mx-auto and px-4 for consistent container */}
        <div className="mb-6 flex justify-end gap-2">
          <PageCacheStatusButton />
        </div>

        {/* Featured Resources Section */}
        <ReusableCachedFeaturedFreeResources
          initialData={initialServerData?.featuredResource}
        />

        {/* --- Search and Filter Section --- */}
        {/* Replaced old search section with your provided styling */}
        <section className="mb-20">
          <div className="mb-8">
            <h3 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl text-left"> {/* Added text-left */}
              <span className="group inline-block cursor-pointer">
                <span className="relative text-blue-700"> {/* Changed text-blue-600 to text-blue-700 */}
                  Search Our
                  <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-700"></span> {/* Changed bg-blue-600 to bg-blue-700 */}
                </span>
                {" "}
                <span className="relative my-4 inline-block">
                  Free AI Resources {/* Replaced {pageTitleHighlight} with static text */}
                  <span className="absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-700 transition-all duration-300 group-hover:w-full"></span> {/* Changed bg-blue-600 to bg-blue-700 */}
                </span>
              </span>
            </h3>
            <p className="text-left text-base font-medium leading-relaxed text-gray-600 dark:text-gray-200"> {/* Added text-left */}
              Find exactly what you're looking for in our comprehensive collection of free AI resources. {/* Updated dynamic text to static */}
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-xl"> {/* Added shadow-xl */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for free AI resources..." 
                  className="w-full rounded-xl border-0 bg-white/10 px-6 py-4 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400"
                  value={searchHook.searchText}
                  onChange={(e) => searchHook.updateSearchText(e.target.value)}
                  onKeyDown={searchHook.handleKeyDown}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={initiateSearch} 
                  className="flex items-center justify-center rounded-xl bg-white px-6 py-4 font-medium text-blue-700 shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50" // Changed text-blue-600 to text-blue-700 and added shadow-lg, hover:shadow-xl
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  Search
                </button>
                <button
                  onClick={handleResetSearch} 
                  className="flex items-center justify-center rounded-xl bg-white/20 px-6 py-4 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* Category Filter Buttons with Counts */}
        {/* Adjusted spacing below this section using mb-10 as there was no direct div below in original */}
        <div className="mb-10">
          <ReusableCachedFreeResourcesCounts
            resourceFormats={resourceFormats}
            selectedFormat={selectedFormat}
            handleFormatChange={handleFormatChange}
            handleCountsLoad={handleCountsLoad}
            initialData={initialServerData?.resourceCounts}
          />
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
              <div className="text-left py-8"> {/* Added text-left */}
                <p className="text-red-500 mb-4">Failed to load search results. {searchHook.searchError.message}</p>
                {searchHook.refreshSearch && (
                  <button onClick={searchHook.refreshSearch} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors">Retry Search</button>
                )}
              </div>
            )}

            {searchHook.showNoResults && (
              <div className="text-left py-8"> {/* Added text-left */}
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
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-700 text-white hover:bg-blue-800' // Changed to blue-700/800
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
            <button
              onClick={handleNext}
              disabled={!hasMorePages || currentPage >= totalPages}
              className={`px-4 py-2 rounded-md transition-colors ${
                !hasMorePages || currentPage >= totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-700 text-white hover:bg-blue-800' // Changed to blue-700/800
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </PageCacheProvider>
  );
}