/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useCallback, useMemo } from "react";
import ResourceCard from "./ResourceCard";
import ResourceListSchema from "./ResourceListSchema";
import { PageCacheProvider } from "@/React_Query_Caching/CacheProvider";
import "animate.css";
import { useCachedSearch } from '@/React_Query_Caching/useCachedSearch';
import SkelCard from "@/components/Blog/Skeleton/Card";
import { useUnifiedCache } from "@/React_Query_Caching/useUnifiedCache";
import { urlForImage } from "@/sanity/lib/image";

import ReusableCachedFeaturedFreeResources from './ReusableCachedFeaturedFreeResources';
import ReusableCachedFreeResourcesList from './ReusableCachedFreeResourcesList';

const RESOURCE_LIMIT = 6;

// Add this component inside your AllBlogs.jsx file (before the main return)
const ArticleSelector = ({ onArticleSelect, onClose }) => {


  // Query to fetch all articles from all schemas
  const allArticlesQuery = useMemo(() => `*[_type in ["makemoney", "aitool", "coding", "seo"]] | order(publishedAt desc) {
    _id,
    _type,
    title,
    slug,
    mainImage,
    publishedAt,
    overview
  }`, []);

  const { data: articlesData, isLoading: isArticlesLoading, error: articlesError } = useUnifiedCache(
    'all-articles-for-filter',
    allArticlesQuery,
    {},
    {
      componentName: 'ArticleSelectorAllArticles',
      enableOffline: true,
      group: 'article-selector',
      schemaType: ["makemoney", "aitool", "coding", "seo"]
    }
  );

  const getSchemaLabel = (schemaType) => {
    const labels = {
      'makemoney': 'Make Money',
      'aitool': 'AI Tools',
      'coding': 'AI Code',
      'seo': 'AI SEO'
    };
    return labels[schemaType] || schemaType;
  };

  const getSchemaColor = (schemaType) => {
    const colors = {
      'makemoney': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'aitool': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'coding': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'seo': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return colors[schemaType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Article to Filter Assets</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {isArticlesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
          ))}
        </div>
      ) : articlesError ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load articles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {articlesData?.map((article) => (
            <div
              key={article._id}
              onClick={() => onArticleSelect(article)}
              className="group cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
            >
              {/* Article Image */}
              {article.mainImage && (
                <img
                  src={urlForImage(article.mainImage).width(150).height(80).url()}
                  alt={article.title}
                  className="w-full h-16 object-cover rounded-md mb-3"
                />
              )}
              {/* Schema Badge */}
              <div
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${getSchemaColor(article._type)}`}
              >
                {getSchemaLabel(article._type)}
              </div>
              {/* Article Title */}
              <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {article.title}
              </h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add this component for filtered resources display
const FilteredResourcesList = ({ selectedArticle, onClearFilter }) => {
  const getAssetsQuery = useCallback((articleId) =>
    `*[_type == "freeResources" && relatedArticle._ref == "${articleId}"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      tags,
      mainImage,
      overview,
      resourceType,
      resourceFormat,
      resourceLink,
      resourceLinkType,
      previewSettings,
      "resourceFile": resourceFile.asset->,
      content,
      publishedAt,
      promptContent,
      "relatedArticle": relatedArticle->{title, slug, _type, tags, excerpt},
      aiToolDetails,
      seoTitle,
      seoDescription,
      seoKeywords,
      altText,
      structuredData,
      imageMetadata,
      videoMetadata
    }`, []);

  const assetsQuery = selectedArticle ? getAssetsQuery(selectedArticle._id) : null;
  const assetsCacheKey = selectedArticle ? `assets-for-article-${selectedArticle._id}` : null;
  const { data: assetsData, isLoading: isAssetsLoading, error: assetsError } = useUnifiedCache(
    assetsCacheKey,
    assetsQuery,
    {},
    {
      componentName: `FilteredAssets_${selectedArticle?._id || 'none'}`,
      enableOffline: true,
      group: 'filtered-assets',
      schemaType: ["freeResources"],
      enabled: !!selectedArticle
    }
  );

  const getSchemaLabel = (schemaType) => {
    const labels = {
      'makemoney': 'Make Money',
      'aitool': 'AI Tools',
      'coding': 'AI Code',
      'seo': 'AI SEO'
    };
    return labels[schemaType] || schemaType;
  };

  const getSchemaColor = (schemaType) => {
    const colors = {
      'makemoney': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'aitool': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'coding': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'seo': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return colors[schemaType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="mb-10">
      {/* Filter Status Header */}
      <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getSchemaColor(selectedArticle._type)}`}>
                {getSchemaLabel(selectedArticle._type)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assets for: {selectedArticle.title}</h3>
            </div>
          </div>
          <button
            onClick={onClearFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      </div>
      {/* Assets Display */}
      {isAssetsLoading ? (
        <div className="flex flex-wrap -mx-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-3">
              <SkelCard />
            </div>
          ))}
        </div>
      ) : assetsError ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load assets for this article.</p>
        </div>
      ) : !assetsData || assetsData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Assets Found</p>
          <p className="text-gray-500 dark:text-gray-500 mb-4">This article doesn't have any linked free resources yet.</p>
          <button
            onClick={onClearFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Show All Resources
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap -mx-3">
            {assetsData.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
          {/* Results Count */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {assetsData.length} asset{assetsData.length !== 1 ? 's' : ''} linked to this article
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default function FreeResourcesPage({ initialServerData }) {
  // Add these state variables to your AllBlogs.jsx after existing useState declarations
  const [showArticleFilter, setShowArticleFilter] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filteredByArticle, setFilteredByArticle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortBy, setSortBy] = useState('publishedAt');
  const [selectedArticleType, setSelectedArticleType] = useState('all');
  const [resourceCounts, setResourceCounts] = useState(initialServerData?.resourceCounts || {});
  const [totalPages, setTotalPages] = useState(initialServerData?.resourceList ? Math.ceil(initialServerData.resourceList.length / RESOURCE_LIMIT) : 1);
  const [totalItems, setTotalItems] = useState(initialServerData?.resourceCounts?.all || 0);
  const [hasMorePages, setHasMorePages] = useState((initialServerData?.resourceList?.length || 0) > RESOURCE_LIMIT);
  const [listResources, setListResources] = useState(initialServerData?.resourceList?.slice(0, RESOURCE_LIMIT) || []);

  // 1. Add search pagination state variables after existing useState declarations
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const SEARCH_RESULTS_PER_PAGE = 6;
  
  const getCustomSearchFilter = useCallback(() => {
    return {
      filter: '',
      params: {}
    };
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

  // 2. Add pagination logic for search results - add this useMemo after existing useMemo declarations
  const paginatedSearchResults = useMemo(() => {
    if (!searchHook.searchResults || searchHook.searchResults.length === 0) {
      return [];
    }

    const startIndex = (searchCurrentPage - 1) * SEARCH_RESULTS_PER_PAGE;
    const endIndex = startIndex + SEARCH_RESULTS_PER_PAGE;
    return searchHook.searchResults.slice(startIndex, endIndex);
  }, [searchHook.searchResults, searchCurrentPage]);

  const searchTotalPages = useMemo(() => {
    if (!searchHook.searchResults || searchHook.searchResults.length === 0) {
      return 1;
    }
    return Math.ceil(searchHook.searchResults.length / SEARCH_RESULTS_PER_PAGE);
  }, [searchHook.searchResults]);

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

  // 3. Update initiateSearch function to reset search pagination
  const initiateSearch = useCallback(() => {
    const trimmedSearchText = searchHook.searchText.trim();
    if (trimmedSearchText.length >= searchHook.minSearchLength) {
      searchHook.handleSearch();
      setIsSearchActive(true);
      setCurrentPage(1);
      setSearchCurrentPage(1); // Reset search pagination
      handleClearArticleFilter();
    } else {
      handleResetSearch();
    }
  }, [searchHook]);
  
  // 4. Update handleResetSearch to reset search pagination
  const handleResetSearch = useCallback(() => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setCurrentPage(1);
    setSearchCurrentPage(1); // Reset search pagination
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

  const handleClearArticleFilter = () => {
    setSelectedArticle(null);
    setFilteredByArticle(false);
    setShowArticleFilter(false);
    setCurrentPage(1);
  };

  const handleFormatChange = (format) => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setSelectedFormat(format);
    setCurrentPage(1);
    handleClearArticleFilter(); // Reset article filter
  };

  const handleSortChange = (newSortBy) => {
    searchHook.resetSearch();
    setIsSearchActive(false);
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const getCountForFormat = useCallback((format) => {
    return searchHook.isSearchActive ? (searchHook.searchResults?.length || 0) : (resourceCounts[format] || 0);
  }, [resourceCounts, searchHook.isSearchActive, searchHook.searchResults?.length]);

  // Handler functions to add to your main component
  const handleShowArticleFilter = () => {
    // Reset any active search
    searchHook.resetSearch();
    setIsSearchActive(false);
    setShowArticleFilter(true);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    setFilteredByArticle(true);
    setShowArticleFilter(false);
    // Reset other filters
    setSelectedFormat("all");
    setSelectedArticleType("all");
    setCurrentPage(1);
  };

  // 5. Add search pagination handlers
  const handleSearchPrevious = useCallback(() => {
    if (searchCurrentPage > 1) {
      setSearchCurrentPage(prev => prev - 1);
    }
  }, [searchCurrentPage]);

  const handleSearchNext = useCallback(() => {
    if (searchCurrentPage < searchTotalPages) {
      setSearchCurrentPage(prev => prev + 1);
    }
  }, [searchCurrentPage, searchTotalPages]);

  return (
    <PageCacheProvider pageType="free-resources" pageId="main">
      <div className="container mx-auto px-4 mt-10">
        {/* <div className="mb-6 flex justify-end gap-2">
          <PageCacheStatusButton />
        </div> */}

        {/* Featured Resources Section */}
        <ReusableCachedFeaturedFreeResources initialData={initialServerData?.featuredResource} />
        
        {/* --- Search and Filter Section --- */}
        <section className="mb-20">
          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-bold tracking-wide text-gray-900 dark:text-white md:text-3xl lg:text-4xl">
              <span className="relative text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[3px] after:w-full after:bg-blue-600">Search Our</span>
              {""}
              <span className="relative font-extrabold"> Free AI Resources</span>
            </h3>
            <p className="text-base font-medium leading-relaxed text-gray-600 dark:text-gray-400">
              Find exactly what you're looking for in our comprehensive collection of free AI resources.
            </p>
          </div>
          <div className="rounded-2xl p-6 md:p-8 shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for free AI resources..."
                  className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-transparent px-5 py-3 sm:px-4 sm:py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 shadow-sm text-sm sm:text-base"
                  value={searchHook.searchText}
                  onChange={(e) => searchHook.updateSearchText(e.target.value)}
                  onKeyDown={searchHook.handleKeyDown}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col sm:flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={initiateSearch}
                  className="flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                <button
                  onClick={handleResetSearch}
                  className="flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-transparent px-6 py-3 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
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

        {/* Category Filter Buttons with Counts */}
        {!searchHook.isSearchActive && !filteredByArticle && (
          <div id="resource-formats" className="mb-10 flex flex-wrap justify-center gap-2 sm:justify-start lg:justify-center">
            {resourceFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => handleFormatChange(format.value)}
                disabled={filteredByArticle}
                className={`flex items-center rounded-full px-4 py-2 text-sm md:px-6 md:py-3 font-medium transition-all duration-200 shadow-sm
                  ${selectedFormat === format.value
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600'
                  }
                  ${filteredByArticle ? 'opacity-50 cursor-not-allowed' : ''}`
                }
              >
                {format.label}
                <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                  {getCountForFormat(format.value)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Article Filter Button (add this after your existing filters, before the resources grid) */}
        {!searchHook.isSearchActive && !filteredByArticle && (
          <div className="mb-10 flex justify-center">
            <button
              onClick={handleShowArticleFilter}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm md:px-6 md:py-3 md:text-base font-medium transition-all duration-200 shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:from-purple-700 hover:to-blue-700 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Filter by Related Article
            </button>
          </div>
        )}

        {/* Show Article Selector when requested */}
        {showArticleFilter && (
          <ArticleSelector onArticleSelect={handleArticleSelect} onClose={() => setShowArticleFilter(false)} />
        )}

        {/* Resources Grid - Conditional rendering based on filter state */}
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
                  <button
                    onClick={searchHook.refreshSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry Search
                  </button>
                )}
              </div>
            )}
            {searchHook.showNoResults && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No resources found matching "{searchHook.searchText}". Try a different search term.</p>
              </div>
            )}
            
            {/* 6. Replace the search results display section with paginated version */}
            {searchHook.searchResults && searchHook.searchResults.length > 0 && (
              <>
                <div className="flex flex-wrap -mx-3">
                  {paginatedSearchResults.map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
                
                {/* Search Results Count */}
                <div className="text-center mt-6 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((searchCurrentPage - 1) * SEARCH_RESULTS_PER_PAGE) + 1}-{Math.min(searchCurrentPage * SEARCH_RESULTS_PER_PAGE, searchHook.searchResults.length)} of {searchHook.searchResults.length} results for "{searchHook.searchText}"
                  </p>
                </div>

                {/* Search Pagination */}
                {searchTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mb-6">
                    <nav className="flex items-center space-x-2 rounded-lg p-2 bg-transparent shadow-md border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSearchPrevious}
                        disabled={searchCurrentPage === 1}
                        className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                          searchCurrentPage === 1
                            ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                            : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-sm">
                        {searchCurrentPage} of {searchTotalPages}
                      </span>
                      <button
                        onClick={handleSearchNext}
                        disabled={searchCurrentPage >= searchTotalPages}
                        className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                          searchCurrentPage >= searchTotalPages
                            ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                            : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        ) : filteredByArticle ? (
          <FilteredResourcesList selectedArticle={selectedArticle} onClearFilter={handleClearArticleFilter} />
        ) : (
          <ReusableCachedFreeResourcesList
            currentPage={currentPage}
            selectedFormat={selectedFormat}
            selectedArticleType={selectedArticleType}
            sortBy={sortBy}
            onDataLoad={handleListLoad}
            initialData={initialServerData?.resourceList}
          />
        )}

        {/* ResourceListSchema: Only show for main content, not search results */}
        {!searchHook.isSearchActive && !filteredByArticle && totalItems > 0 && (
          <ResourceListSchema resources={listResources} baseUrl="https://www.doitwithai.tools/free-ai-resources" />
        )}

        {/* Pagination (visible only if not in search or filtered view and if there are items to paginate) */}
        {!searchHook.isSearchActive && !filteredByArticle && totalItems > 0 && (
          <div className="flex justify-center items-center space-x-4 mb-10">
            <nav className="flex items-center space-x-2 rounded-lg p-2 bg-transparent shadow-md border border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200
                  ${currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'}`
                }
              >
                Previous
              </button>
              <span className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-sm">
                {currentPage}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasMorePages || currentPage >= totalPages}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200
                  ${!hasMorePages || currentPage >= totalPages
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600'}`
                }
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