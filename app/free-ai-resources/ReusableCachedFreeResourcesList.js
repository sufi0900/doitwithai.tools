// components/Resources/ReusableCachedFreeResourcesList.jsx
"use client";

import React, { useEffect, useCallback, useState, useMemo } from 'react'; // Import useMemo
import { useSanityCache } from '@/React_Query_Caching/useSanityCache';
import { CACHE_KEYS } from '@/React_Query_Caching/cacheKeys';
import SkelCard from "@/components/Blog/Skeleton/Card";
import ResourceCard from "./ResourceCard";
import { usePageCache } from '@/React_Query_Caching/usePageCache';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem'; // Needed for refreshGroup

// Constants for the resource type and limit
const DOCUMENT_TYPE = "freeResources";
const RESOURCE_LIMIT = 6;


const ReusableCachedFreeResourcesList = ({
  currentPage = 1,
  selectedFormat = "all",
  sortBy = "publishedAt",
  searchText = "", // Accept searchText prop from parent
  onDataLoad, // Callback to send pagination info and resources list to parent
}) => {
  const [listStaleWarning, setListStaleWarning] = useState(false);
  const start = useMemo(() => (currentPage - 1) * RESOURCE_LIMIT, [currentPage, RESOURCE_LIMIT]);
  // Determine if search is active based on searchText being non-empty
  const isSearchMode = useMemo(() => searchText && searchText.trim().length > 0, [searchText]);

  // Helper to format sort order for GROQ
  const getOrderBy = useCallback((sortByValue) => {
    switch (sortByValue) {
      case 'title-asc':
        return 'title asc';
      case 'title-desc':
        return 'title desc';
      default:
        return 'publishedAt desc';
    }
  }, []); // This function itself is stable

  // --- REFACTOR: Use a single memoized function to generate query and parameters ---
  const getDynamicQueryConfig = useCallback(() => {
    const orderBy = getOrderBy(sortBy);
    let filters = `_type == $docType`;
    let queryParams = { docType: DOCUMENT_TYPE };
    let searchFilter = '';
    const trimmedSearchText = searchText.trim();

    if (isSearchMode) {
      // Prioritize search: format and sort filters apply AFTER search
      searchFilter = ` && (title match $searchText || overview match $searchText || content match $searchText || resourceType match $searchText || aiToolDetails.toolCategory match $searchText || aiToolDetails.functionality match $searchText)`;
      queryParams.searchText = `*${trimmedSearchText}*`; // Wildcard search
    } else if (selectedFormat !== "all") {
      // Apply format filter only if not in search mode
      filters += ` && resourceFormat == $resourceFormat`;
      queryParams.resourceFormat = selectedFormat;
    }

    const listQuery = `*[${filters}${searchFilter}] | order(${orderBy}) [${start}...${start + RESOURCE_LIMIT + 1}] {
      _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
      resourceLink, resourceLinkType, previewSettings,
      "resourceFile": resourceFile.asset->,
      content, publishedAt, promptContent,
      "relatedArticle": relatedArticle->{title, slug},
      aiToolDetails,
      seoTitle, seoDescription, seoKeywords, altText, structuredData
    }`;

    const totalCountQuery = `count(*[${filters}${searchFilter}])`;

    return {
      listQuery,
      totalCountQuery,
      queryParams,
      orderBy
    };
  }, [selectedFormat, sortBy, getOrderBy, start, searchText, isSearchMode]);

  // Extract memoized query and params by calling the memoized function
  const { listQuery, totalCountQuery, queryParams, orderBy } = getDynamicQueryConfig();

  // Determine the typeIdentifier for cache keys based on search or format/sort
  const typeIdentifier = useMemo(() => 
    isSearchMode
      ? `search-${btoa(searchText).slice(0, 50).replace(/=/g, '')}` // Hash of search text for unique key
      : `${selectedFormat}-${sortBy}`, // Format-sort for non-search mode
  [isSearchMode, searchText, selectedFormat, sortBy]);

  // CacheKey for the paginated list
  const listCacheKey = useMemo(() => CACHE_KEYS.PAGE.LIST_FREERESOURCES(currentPage, selectedFormat, sortBy, typeIdentifier), 
  [currentPage, selectedFormat, sortBy, typeIdentifier]);
  
  // CacheKey for the total items
  const totalItemsCacheKey = useMemo(() => CACHE_KEYS.PAGE.TOTAL_FREERESOURCES_ITEMS(selectedFormat, typeIdentifier), 
  [selectedFormat, typeIdentifier]);

  const freeResourcesGroup = useMemo(() => 'free-resources', []); // Memoized group name

  // Memoize options objects for useSanityCache calls
  const stableListOptions = useMemo(() => ({
    componentName: `FreeResourcesList_P${currentPage}_F${selectedFormat}_S${sortBy}${isSearchMode ? '_Search' : ''}`,
    enableOffline: true,
    group: freeResourcesGroup,
  }), [currentPage, selectedFormat, sortBy, isSearchMode, freeResourcesGroup]);

  const stableTotalOptions = useMemo(() => ({
    componentName: `FreeResourcesTotal_F${selectedFormat}${isSearchMode ? '_Search' : ''}`,
    enableOffline: true,
    group: freeResourcesGroup,
  }), [selectedFormat, isSearchMode, freeResourcesGroup]);


  // Fetch paginated resources
  const {
    data: resourcesData,
    isLoading: isResourcesLoading,
    error: resourcesError,
    refresh: refreshList,
    isStale: isListStale,
    cacheSource: listCacheSource, // for dev info
  } = useSanityCache(
    listCacheKey,
    listQuery,
    queryParams,
    stableListOptions
  );

  // Fetch total items count
  const {
    data: totalItemsData,
    isLoading: isTotalItemsLoading,
    error: totalItemsError,
    refresh: refreshTotalItems,
    isStale: isTotalItemsStale,
    cacheSource: totalCacheSource, // for dev info
  } = useSanityCache(
    totalItemsCacheKey,
    totalCountQuery,
    queryParams,
    stableTotalOptions
  );

  // Register this component's cache keys with usePageCache
  usePageCache(
    listCacheKey,
    refreshList,
    listQuery,
    `Free Resources List Page ${currentPage} - ${selectedFormat} - ${sortBy} ${isSearchMode ? `(Search: "${searchText}")` : ''}`
  );

  usePageCache(
    totalItemsCacheKey,
    refreshTotalItems,
    totalCountQuery,
    `Free Resources Total Count - ${selectedFormat} ${isSearchMode ? `(Search: "${searchText}")` : ''}`
  );

  // Calculate totalPages and hasMore for the parent
  const totalItems = typeof totalItemsData === 'number' ? totalItemsData : 0;
  const totalPages = Math.ceil(totalItems / RESOURCE_LIMIT);
  const hasMore = (resourcesData?.length || 0) > RESOURCE_LIMIT;

  // Handle stale warnings for the list and total count
  useEffect(() => {
    if (isListStale || isTotalItemsStale) {
      setListStaleWarning(true);
      // Trigger background refresh for current page and total count if online
      if (typeof window !== 'undefined' && window.navigator.onLine) {
        refreshList(false);
        refreshTotalItems(false);
      }
    } else if ((resourcesData && !isListStale) && (totalItemsData && !isTotalItemsStale) && listStaleWarning) {
      setListStaleWarning(false);
    }
  }, [isListStale, isTotalItemsStale, resourcesData, totalItemsData, listStaleWarning, refreshList, refreshTotalItems]);

  // Report pagination data to the parent
  // IMPORTANT: Also pass the actual items for ResourceListSchema
  useEffect(() => {
    if (onDataLoad && !isResourcesLoading && !isTotalItemsLoading) {
      // Slice resourcesData to ensure it only sends RESOURCE_LIMIT items
      // The extra item was fetched to determine 'hasMore'
      onDataLoad(totalPages, totalItems, hasMore, resourcesData ? resourcesData.slice(0, RESOURCE_LIMIT) : []);
    }
  }, [onDataLoad, totalPages, totalItems, hasMore, isResourcesLoading, isTotalItemsLoading, resourcesData]);

  // Manual refresh handler for errors
  const handleRefresh = useCallback(async (refreshAllGroup = false) => {
    try {
      if (refreshAllGroup) {
        if (typeof cacheSystem !== 'undefined' && cacheSystem.refreshGroup) {
          await cacheSystem.refreshGroup(freeResourcesGroup);
        } else {
          console.warn("cacheSystem.refreshGroup is not available. Performing individual refreshes.");
          await refreshList(true);
          await refreshTotalItems(true);
        }
      } else {
        await refreshList(true);
        await refreshTotalItems(true);
      }
    } catch (error) {
      console.error('FreeResources list refresh failed:', error);
    }
  }, [freeResourcesGroup, refreshList, refreshTotalItems]);

  const hasError = resourcesError || totalItemsError;

  // Render loading state for the list
  // Only show skeleton if loading AND no data is currently available
  if (isResourcesLoading && !resourcesData) {
    return (
      <div className="flex flex-wrap -mx-3">
        {Array.from({ length: RESOURCE_LIMIT }).map((_, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-3">
            <SkelCard />
          </div>
        ))}
      </div>
    );
  }

  const itemsToDisplay = resourcesData ? resourcesData.slice(0, RESOURCE_LIMIT) : [];

  return (
    <div className="mb-10">
      {listStaleWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"/></svg><span className="text-yellow-800 dark:text-yellow-200 font-medium">Updating resource list...</span>
          </div>
        </div>
      )}
      {hasError && !itemsToDisplay.length ? ( // Show error if error AND no data fallback
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load resources.</p>
          <button onClick={() => handleRefresh(false)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry Current View</button>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2">Refresh All Resources</button>
        </div>
      ) : itemsToDisplay.length > 0 ? (
        <div className="flex flex-wrap -mx-3">
          {itemsToDisplay.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      ) : ( // No resources found (not loading, no error)
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {isSearchMode && searchText.trim().length > 0
              ? `No resources found matching your search term "${searchText.trim()}".`
              : "No resources found for the current filters. Try another filter or check back later."}
          </p>
          <button onClick={() => handleRefresh(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4">Refresh All Resources</button>
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded dark:bg-gray-800 mt-4">
          ListPage: {currentPage}|Format:{selectedFormat}|Sort:{sortBy}|Search:{searchText}|IsSearchMode:{isSearchMode ? 'Yes' : 'No'}|ListCacheKey:{listCacheKey}|TotalCacheKey:{totalItemsCacheKey}|Group:{freeResourcesGroup}|ListStale:{isListStale?'Yes':'No'}|TotalStale:{isTotalItemsStale?'Yes':'No'}|TotalItems:{totalItems}|TotalPages:{totalPages}|HasMore:{hasMore?'Yes':'No'}|QueryParams: {JSON.stringify(queryParams)}|ListQuery: {listQuery.split('|')[0]}...|ListCacheSrc:{listCacheSource}
        </div>
      )}
    </div>
  );
};

export default ReusableCachedFreeResourcesList;
