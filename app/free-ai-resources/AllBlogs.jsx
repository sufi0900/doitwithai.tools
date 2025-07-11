/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useCallback, useMemo } from "react"; // Import useCallback, useMemo
import Breadcrumb from "@/components/Common/Breadcrumb";
import ResourceCard from "./ResourceCard" // Keep if you still use it for individual card rendering (e.g., in SearchResults if not using your generic CardComponent)
import HeroSection from "./HeroSection";
import ResourceListSchema from "./ResourceListSchema";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import "animate.css"; // Ensure animate.css is still needed and installed
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SkelCard from "@/components/Blog/Skeleton/Card";

export const revalidate = false;
export const dynamic = "force-dynamic";

// Import our new cached components
import ReusableCachedFeaturedFreeResources from './ReusableCachedFeaturedFreeResources';
import ReusableCachedFreeResourcesCounts from './ReusableCachedFreeResourcesCounts';
import ReusableCachedFreeResourcesList from './ReusableCachedFreeResourcesList';

const RESOURCE_LIMIT = 6;

// --- Accept initialServerData and breadcrumbProps ---
export default function FreeResourcesPage({ initialServerData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState('publishedAt');

  // Initialize with initialServerData or default values
  const [resourceCounts, setResourceCounts] = useState(initialServerData?.resourceCounts || {});
  const [totalPages, setTotalPages] = useState(initialServerData?.resourceList ? Math.ceil(initialServerData.resourceList.length / RESOURCE_LIMIT) : 1);
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
      <div className="container mt-10">
        <HeroSection />
        <Breadcrumb
          pageName="Free AI Resources"
          pageName2="Gallery"
          description="Browse our collection of free AI resources including images, videos, templates, AI tools, and more to enhance your projects. These resources are organized by category and fully searchable."
          link="/free-ai-resources"
          linktext="free-resources"
          firstlinktext="Home"
          firstlink="/"
        />

        <div className="mb-6 flex justify-end gap-2">
          <PageCacheStatusButton />
        </div>
 <ReusableCachedFeaturedFreeResources
        initialData={initialServerData?.featuredResource} // Pass initial featured data
      />

        {/* Search and Filter Section */}
        <div className="card mb-10 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          {/* Search Bar */}
          <div className="flex items-center w-full relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources, AI tools, categories..."
              className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-12 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
              value={searchHook.searchText}
              onChange={(e) => searchHook.updateSearchText(e.target.value)}
              onKeyDown={searchHook.handleKeyDown}
            />
            <button
              aria-label="search button"
              className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-primary text-white hover:bg-primary/80 transition-colors"
              onClick={initiateSearch}
            >
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 6.125 15.0312 4.5625 14.1875 3.1875C13.3438 1.8125 12.25 0.75 10.9062 0.09375C9.5625 -0.03125 8.15625 0 6.9375 0.5C5.6875 1 4.625 1.75 3.75 2.8125C2.9375 3.875 2.375 5.09375 2.25 6.40625C2.125 7.71875 2.375 9.03125 3.0625 10.2188C3.75 11.4062 4.75 12.4062 5.96875 13.0938C7.1875 13.7812 8.5625 14.0938 9.96875 14.0938C11.5938 14.0938 13.1562 13.5 14.4375 12.5L19.9062 17C20.0312 17.0625 20.1562 17.0938 20.25 17.0938C20.375 17.0938 20.5 17.0625 20.5938 16.9688C20.8125 16.8125 20.8125 16.4688 20.5938 16.2812L19.4062 16.8125ZM3.5625 7.125C3.5625 6.03125 3.875 5 4.4375 4.125C5 3.25 5.78125 2.5625 6.75 2.1875C7.71875 1.8125 8.75 1.75 9.75 2C10.75 2.25 11.6562 2.78125 12.375 3.5C13.0938 4.21875 13.5938 5.125 13.8438 6.125C14.0938 7.125 14.0312 8.15625 13.6875 9.125C13.3438 10.0938 12.6562 10.9062 11.8125 11.4688C10.9375 12.0312 9.90625 12.3438 8.8125 12.3438C7.375 12.3438 6.0 11.7812 4.96875 10.75C3.9375 9.71875 3.5625 8.53125 3.5625 7.125Z" fill="white" />
              </svg>
            </button>
            {(searchHook.isSearchActive || searchHook.searchText.length > 0) && (
              <button
                aria-label="clear search button"
                className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={handleResetSearch}
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SortIcon className="text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
      
                className={`rounded-md border border-stroke bg-[#f8f8f8] px-4 py-2 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark
                ${searchHook.isSearchActive ? 'opacity-70' : ''}`} 
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Resources Display */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {getCountForFormat(selectedFormat)} {selectedFormat === 'all' ? 'resources' : resourceFormats.find(f => f.value === selectedFormat)?.label.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Category Filter Buttons with Counts */}
      <ReusableCachedFreeResourcesCounts
        resourceFormats={resourceFormats}
        selectedFormat={selectedFormat}
        // Removed getCountForFormat prop as ReusableCachedFreeResourcesCounts now manages its own counts data
        handleFormatChange={handleFormatChange}
        handleCountsLoad={handleCountsLoad}
        initialData={initialServerData?.resourceCounts} // Pass initial counts data
      />
        {/* Resources Grid (Conditional Rendering based on search vs. main list) */}
        {searchHook.isSearchActive ? (
          <div className="mb-10">
            {/* Loading/Error/No Results for Search */}
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
                    <button onClick={searchHook.refreshSearch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry Search</button>
                )}
              </div>
            )}

            {searchHook.showNoResults && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No resources found matching "{searchHook.searchText}". Try a different search term.</p>
              </div>
            )}

            {/* Display Search Results using ResourceCard */}
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
          />
        )}

        {/* ResourceListSchema: Only show for main content, not search results */}
        {/* Pass listResources from ReusableCachedFreeResourcesList component */}
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
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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