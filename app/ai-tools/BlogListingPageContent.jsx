/*eslint-disable react/no-unescaped-entities*/
"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SearchResults from '@/React_Query_Caching/SearchResults';
import ReusableCachedFeaturePost from "@/app/ai-tools/CachedAIToolsFeaturePost";
import ReusableCachedAllBlogs from "@/app/ai-tools/CachedAIToolsAllBlogs";
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton";
import { useUnifiedCache } from '@/React_Query_Caching/useUnifiedCache';
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import UnifiedCacheMonitor from '@/React_Query_Caching/UnifiedCacheMonitor';

export default function BlogListingPageContent({
  schemaType,
  pageSlugPrefix,
  pageTitle,
  pageTitleHighlight,
  pageDescription,
  serverData,
  showSubcategoriesSection = false,
  subcategoriesSectionTitle,
  subcategoriesSectionDescription,
  SubcategoriesComponent,
  subcategoriesLimit = 2,
}) {
  const initialDataCacheOptions = useMemo(() => ({
    componentName: `${schemaType}BlogListingInitial`,
    enableOffline: true,
    initialData: serverData,
    forceRefresh: false,
  }), [serverData, schemaType]);

  const initialDataQuery = useMemo(() => `{"featuredPost":*[_type=="${schemaType}"&&displaySettings.isOwnPageFeature==true][0],"firstPageBlogs":*[_type=="${schemaType}"]|order(publishedAtdesc)[0...6],"totalCount":count(*[_type=="${schemaType}"])}`, [schemaType]);
  const initialDataParams = useMemo(() => ({ schemaType }), [schemaType]);

  const { data: cachedInitialData, isLoading: initialDataLoading, error: initialDataError, refresh: refreshInitialData, isStale: initialDataIsStale } = useUnifiedCache(CACHE_KEYS.PAGE.BLOG_LISTING_INITIAL(schemaType), initialDataQuery, initialDataParams, { ...initialDataCacheOptions, schemaType });

  usePageCache(CACHE_KEYS.PAGE.BLOG_LISTING_INITIAL(schemaType), refreshInitialData, initialDataQuery, `${schemaType}BlogListingInitial`);

  const finalInitialData = cachedInitialData || serverData;

  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogsTotalPages, setAllBlogsTotalPages] = useState(1);

  const [currentPageSubcategories, setCurrentPageSubcategories] = useState(1);
  const [subcategoriesTotalPages, setSubcategoriesTotalPages] = useState(1);

  const searchHookOptions = useMemo(() => ({
    documentType: schemaType,
    searchFields: ['title', 'overview', 'body'],
    pageSlugPrefix: pageSlugPrefix,
    componentName: `${schemaType}PageSearch`,
    minSearchLength: 3,
  }), [schemaType, pageSlugPrefix]);

  const searchHook = useCachedSearch(searchHookOptions);

  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handleAllBlogsDataLoad = useCallback((hasMore, fetchedTotalPages, fetchedTotalItems) => {
    setAllBlogsTotalPages(fetchedTotalPages);
  }, []);

  const isNextButtonDisabled = searchHook.isSearchActive || currentPage >= allBlogsTotalPages;

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

  const isNextButtonDisabledSubcategories = searchHook.isSearchActive || currentPageSubcategories >= subcategoriesTotalPages;
  const isPreviousButtonDisabledSubcategories = currentPageSubcategories === 1;

  return (
    <PageCacheProvider pageType={pageSlugPrefix} pageId="main">
    
      {/* FeaturePostSection */}
      <section className="mb-8">
        <ReusableCachedFeaturePost
          documentType={schemaType}
          pageSlugPrefix={pageSlugPrefix}
          cacheKey={CACHE_KEYS.PAGE.FEATURE_POST(pageSlugPrefix)}
          initialData={finalInitialData?.featuredPost}
        />
      </section>

      {/* SubcategoriesSection - Conditionally rendered */}
      {showSubcategoriesSection && (
        <section className="mb-8">
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
              <span className="group inline-block cursor-pointer">
                <span className="relative text-blue-600">
                  {subcategoriesSectionTitle}
                  <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-600"></span>
                </span>
                {" "}
                <span className="relative my-4 inline-block">
                  {subcategoriesSectionDescription}
                  <span className="absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </span>
            </h2>
          </div>
          {SubcategoriesComponent && (
            <SubcategoriesComponent
              currentPage={currentPageSubcategories}
              limit={subcategoriesLimit}
              onDataLoad={handleSubcategoriesDataLoad}
            />
          )}
      {!searchHook.isSearchActive && (
  <div className="mt-16 flex justify-center">
    <nav className="flex items-center gap-1 sm:gap-2 rounded-lg bg-gray-100 p-1 sm:p-2 dark:bg-gray-700 w-full max-w-sm sm:max-w-md md:max-w-none md:w-auto">
      <button
        onClick={handlePreviousSubcategories}
        disabled={isPreviousButtonDisabledSubcategories}
        className={`flex items-center justify-center rounded-lg px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium flex-1 md:flex-none md:w-auto transition-all duration-200 ${isPreviousButtonDisabledSubcategories ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500' : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'}`}
      >
        <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="hidden xs:inline sm:inline">Previous</span>
        <span className="xs:hidden sm:hidden">Prev</span>
      </button>
      <div className="flex items-center justify-center rounded-lg bg-blue-600 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm min-w-[40px] sm:min-w-[50px]">
        {currentPageSubcategories}
      </div>
      <button
        onClick={handleNextSubcategories}
        disabled={isNextButtonDisabledSubcategories}
        className={`flex items-center justify-center rounded-lg px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium flex-1 md:flex-none md:w-auto transition-all duration-200 ${isNextButtonDisabledSubcategories ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500' : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'}`}
      >
        <span className="hidden xs:inline sm:inline">Next</span>
        <span className="xs:hidden sm:hidden">Next</span>
        <svg className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </nav>
  </div>
)}
        </section>
      )}
      {/* SearchSection - Updated with left alignment and theme colors */}
      <section className="mb-8">
        <div className="mb-8">
          <h3 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-600">
                Search Our
                <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-600"></span>
              </span>
              {" "}
              <span className="relative my-4 inline-block">
                {pageTitleHighlight}
                <span className="absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h3>
          <p className="text-justify text-base font-medium leading-relaxed text-gray-600 dark:text-gray-200">
            Find exactly what you're looking for in our comprehensive collection of {pageTitle.toLowerCase()}.
          </p>
        </div>
     <div className="rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-800 shadow-lg">
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={`Search for ${pageTitle.toLowerCase()}...`}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
          value={searchHook.searchText}
          onChange={(e) => searchHook.updateSearchText(e.target.value)}
          onKeyDown={searchHook.handleKeyDown}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={searchHook.handleSearch}
          className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Search
        </button>
        <button
          onClick={searchHook.resetSearch}
          className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 px-6 py-4 font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset
        </button>
      </div>
    </div>
  </div>
</section>

      {/* SearchResults */}
      <SearchResults
        searchResults={searchHook.searchResults}
        isLoading={searchHook.isSearchLoading}
        error={searchHook.searchError}
        isSearchActive={searchHook.isSearchActive}
        searchText={searchHook.searchText}
        pageSlugPrefix={pageSlugPrefix}
        showNoResults={searchHook.showNoResults}
        cacheSource={searchHook.cacheSource}
        isStale={searchHook.isStale}
        onResetSearch={searchHook.resetSearch}
        onRefreshSearch={searchHook.refreshSearch}
        className="mb-8"
      />

      {/* MainBlogSection - Updated with left alignment and theme colors */}
      {!searchHook.isSearchActive && (
        <section className="mb-8">
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
              <span className="group inline-block cursor-pointer">
                <span className="relative text-blue-600">
                  Latest
                  <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-600"></span>
                </span>
                {" "}
                <span className="relative my-4 inline-block">
                  {pageTitleHighlight}
                  <span className="absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </span>
            </h2>
            <p className="text-justify text-base font-medium leading-relaxed text-gray-600 dark:text-gray-200 max-w-4xl">
              {pageDescription}
            </p>
          </div>
          <ReusableCachedAllBlogs
            currentPage={currentPage}
            limit={5}
            documentType={schemaType}
            pageSlugPrefix={pageSlugPrefix}
            onDataLoad={handleAllBlogsDataLoad}
            initialPageData={finalInitialData?.firstPageBlogs}
            initialTotalCount={finalInitialData?.totalCount}
          />
          {/* MainBlogPaginationControls */}
      <div className="mt-16 flex justify-center">
  <nav className="flex items-center gap-1 sm:gap-2 rounded-lg bg-gray-100 p-1 sm:p-2 dark:bg-gray-700 w-full max-w-sm sm:max-w-md md:max-w-none md:w-auto">
    {/* Previous Button */}
    <button
      onClick={handlePrevious}
      disabled={currentPage === 1}
      className={`flex items-center justify-center rounded-lg 
                  px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium 
                  flex-1 md:flex-none md:w-auto
                  transition-all duration-200
                  ${currentPage === 1
        ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
        : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'}`}
    >
      <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden xs:inline sm:inline">Previous</span>
      <span className="xs:hidden sm:hidden">Prev</span>
    </button>

    {/* Current Page */}
    <div className="flex items-center justify-center rounded-lg bg-blue-600 
                    px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm 
                    min-w-[40px] sm:min-w-[50px]">
      {currentPage}
    </div>

    {/* Next Button */}
    <button
      onClick={handleNext}
      disabled={isNextButtonDisabled}
      className={`flex items-center justify-center rounded-lg 
                  px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium 
                  flex-1 md:flex-none md:w-auto
                  transition-all duration-200
                  ${isNextButtonDisabled
        ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
        : 'bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400'}`}
    >
      <span className="hidden xs:inline sm:inline">Next</span>
      <span className="xs:hidden sm:hidden">Next</span>
      <svg className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </nav>
</div>


        </section>
      )}
    </PageCacheProvider>
  );
}