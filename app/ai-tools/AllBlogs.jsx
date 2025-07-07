/* eslint-disable @next/next/no-img-alone */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useCallback, useMemo } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';
import ReusableCachedFeaturePost from "@/app/ai-tools/CachedAIToolsFeaturePost"; // Adjust path if these are truly generic
import ReusableCachedAllBlogs from "@/app/ai-tools/CachedAIToolsAllBlogs"; // Adjust path if these are truly generic
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import UnifiedCacheMonitor from '@/React_Query_Caching/UnifiedCacheMonitor';

/**
 * Reusable client component for displaying a blog listing page with search,
 * featured post, and pagination for various Sanity schema types.
 *
 * @param {object} props - Component props.
 * @param {string} props.schemaType - The Sanity schema type (e.g., 'coding', 'aitool').
 * @param {string} props.pageSlugPrefix - The URL prefix for this blog category (e.g., 'ai-tools', 'ai-code').
 * @param {string} props.pageTitle - The main title for the 'Latest X' section.
 * @param {string} props.pageTitleHighlight - The highlighted part of the main title.
 * @param {string} props.pageDescription - The description for the 'Latest X' section.
 * @param {object} props.breadcrumbProps - Props for the Breadcrumb component.
 * @param {string} props.breadcrumbProps.pageName - Breadcrumb page name.
 * @param {string} props.breadcrumbProps.pageName2 - Secondary breadcrumb page name.
 * @param {string} props.breadcrumbProps.description - Breadcrumb description.
 * @param {string} props.breadcrumbProps.firstlinktext - Text for the first link.
 * @param {string} props.breadcrumbProps.firstlink - URL for the first link.
 * @param {string} props.breadcrumbProps.link - URL for the current link.
 * @param {string} props.breadcrumbProps.linktext - Text for the current link.
 * @param {boolean} [props.showSubcategoriesSection=false] - Whether to show the subcategories section.
 * @param {string} [props.subcategoriesSectionTitle] - Title for the subcategories section.
 * @param {string} [props.subcategoriesSectionDescription] - Description for the subcategories section.
 * @param {React.ElementType} [props.SubcategoriesComponent] - The component to render for subcategories (e.g., ReusableCachedSEOSubcategories).
 * @param {number} [props.subcategoriesLimit] - Limit per page for subcategories.
 * @param {object} [props.serverData] - Initial data fetched on the server for hydration. **(ADDED)**
 */
export default function BlogListingPageContent({
  schemaType,
  pageSlugPrefix,
  pageTitle,
  pageTitleHighlight,
  pageDescription,
  breadcrumbProps,
  serverData, // Add this prop
  // New props for subcategories section
  showSubcategoriesSection = false,
  subcategoriesSectionTitle,
  subcategoriesSectionDescription,
  SubcategoriesComponent, // Component to render for subcategories
  subcategoriesLimit = 2, // Default limit for subcategories
}) {
  // Add unified cache for initial page data **(START ADDED)**
  const initialDataCacheOptions = useMemo(() => ({
    componentName: `${schemaType}BlogListingInitial`,
    enableOffline: true,
    initialData: serverData,
    forceRefresh: false,
   
  }), [serverData, schemaType]);

 const initialDataQuery = useMemo(() => 
  `{
    "featuredPost": *[_type=="${schemaType}" && displaySettings.isOwnPageFeature==true][0],
    "firstPageBlogs": *[_type=="${schemaType}"] | order(publishedAt desc)[0...6],
    "totalCount": count(*[_type=="${schemaType}"])
  }`, [schemaType]);

  const initialDataParams = useMemo(() => ({ schemaType }), [schemaType]);

  const {
    data: cachedInitialData,
    isLoading: initialDataLoading,
    error: initialDataError,
    refresh: refreshInitialData,
    isStale: initialDataIsStale
  } = useUnifiedCache(
    CACHE_KEYS.PAGE.BLOG_LISTING_INITIAL(schemaType),
    initialDataQuery,
    initialDataParams,
    { ...initialDataCacheOptions, schemaType }
  );

  // Register with page cache
  usePageCache(
    CACHE_KEYS.PAGE.BLOG_LISTING_INITIAL(schemaType),
    refreshInitialData,
    initialDataQuery,
    `${schemaType}BlogListingInitial`
  );

  // Use cached data if available, fallback to server data
  const finalInitialData = cachedInitialData || serverData;
  // **(END ADDED)**

  // State for main blog pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogsTotalPages, setAllBlogsTotalPages] = useState(1);

  // State for subcategories pagination (MANAGED INTERNALLY HERE)
  const [currentPageSubcategories, setCurrentPageSubcategories] = useState(1);
  const [subcategoriesTotalPages, setSubcategoriesTotalPages] = useState(1);

  // Initialize search hook with dynamic properties
  const searchHookOptions = useMemo(() => ({
    documentType: schemaType, // Dynamic document type
    searchFields: ['title', 'overview', 'body'], // Common search fields
    pageSlugPrefix: pageSlugPrefix, // Dynamic page slug prefix
    componentName: `${schemaType}PageSearch`, // Dynamic component name for cache
    minSearchLength: 3,
  }), [schemaType, pageSlugPrefix]);

  const searchHook = useCachedSearch(searchHookOptions);

  // Main blog pagination handlers
  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  // Callback to receive pagination status from ReusableCachedAllBlogs
  const handleAllBlogsDataLoad = useCallback((hasMore, fetchedTotalPages, fetchedTotalItems) => {
    setAllBlogsTotalPages(fetchedTotalPages);
  }, []);

  // Main blog next button disabled logic:
  const isNextButtonDisabled = searchHook.isSearchActive || currentPage >= allBlogsTotalPages;

  // Subcategories pagination handlers (MANAGED INTERNALLY HERE)
  const handlePreviousSubcategories = useCallback(() => {
    setCurrentPageSubcategories((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleNextSubcategories = useCallback(() => {
    setCurrentPageSubcategories((prev) => prev + 1);
  }, []);

  const handleSubcategoriesDataLoad = useCallback((fetchedCurrentPg, fetchedTotalPgs, fetchedHasMore) => {
    setCurrentPageSubcategories(fetchedCurrentPg);
    setSubcategoriesTotalPages(fetchedTotalPgs);
  }, []);

  // Subcategories pagination disabled logic
  const isNextButtonDisabledSubcategories = searchHook.isSearchActive || currentPageSubcategories >= subcategoriesTotalPages;
  const isPreviousButtonDisabledSubcategories = currentPageSubcategories === 1;

  return (
    <PageCacheProvider pageType={pageSlugPrefix} pageId="main"> {/* Dynamic pageType */}
      {/* Outer wrapper with gradient background matching AISEOPage */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/30">

        {/* Breadcrumb Section */}
        <section className="pt-8">
          <Breadcrumb {...breadcrumbProps} /> {/* Use dynamic breadcrumb props */}
        </section>

        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-12">
      {/* <UnifiedCacheMonitor /> */}

          {/* Cache Status Button */}
          {/* <div className="mb-8 flex justify-end">
            <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
              <PageCacheStatusButton />
            </div>
          </div> */}

          {/* Feature Post Section */}
          <section className="mb-16">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
             <ReusableCachedFeaturePost
  documentType={schemaType}
  pageSlugPrefix={pageSlugPrefix}
  cacheKey={CACHE_KEYS.PAGE.FEATURE_POST(pageSlugPrefix)}
  initialData={finalInitialData?.featuredPost}  // Pass the featured post data
/>
            </div>
          </section>

          {/* Subcategories Section - Conditionally rendered */}
          {showSubcategoriesSection && (
            <section className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {subcategoriesSectionTitle}
                  </span>{" "}
                  {subcategoriesSectionDescription}
                </h2>
                <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                {/* Render the passed SubcategoriesComponent */}
                {SubcategoriesComponent && (
                  <SubcategoriesComponent
                    currentPage={currentPageSubcategories}
                    limit={subcategoriesLimit} // Use the prop for limit
                    onDataLoad={handleSubcategoriesDataLoad} // Pass internal handler
                  />
                )}

                {/* Subcategories Pagination */}
                {!searchHook.isSearchActive && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                      <button
                        onClick={handlePreviousSubcategories}
                        disabled={isPreviousButtonDisabledSubcategories}
                        className={`
                          flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                          ${isPreviousButtonDisabledSubcategories
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
                        {currentPageSubcategories}
                      </div>

                      <button
                        onClick={handleNextSubcategories}
                        disabled={isNextButtonDisabledSubcategories}
                        className={`
                          flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                          ${isNextButtonDisabledSubcategories
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
                )}
              </div>
            </section>
          )}

          {/* Search Section - Styled to match AISEOPage */}
          <section className="mb-16">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white">Search Our {pageTitleHighlight}</h3> {/* Dynamic title */}
                <p className="mt-2 text-blue-100">Find exactly what you're looking for</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Search for ${pageTitle.toLowerCase()}...`} // Dynamic placeholder
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
            pageSlugPrefix={pageSlugPrefix} // Dynamic pageSlugPrefix
            showNoResults={searchHook.showNoResults}
            cacheSource={searchHook.cacheSource}
            isStale={searchHook.isStale}
            onResetSearch={searchHook.resetSearch}
            onRefreshSearch={searchHook.refreshSearch}
            className="mb-16"
          />

          {/* Main Blog Section */}
          {!searchHook.isSearchActive && (
            <section className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                  Latest <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{pageTitleHighlight}</span> {/* Dynamic title */}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  {pageDescription} {/* Dynamic description */}
                </p>
                <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
<ReusableCachedAllBlogs
  currentPage={currentPage}
  limit={5}
  documentType={schemaType}
  pageSlugPrefix={pageSlugPrefix}
  onDataLoad={handleAllBlogsDataLoad}
  initialPageData={finalInitialData?.firstPageBlogs} // Pass initial data
  initialTotalCount={finalInitialData?.totalCount}   // Pass total count
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