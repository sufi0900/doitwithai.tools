'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSanityCache } from './useSanityCache';
import { CACHE_KEYS } from './cacheKeys';
import { useCacheContext } from './CacheProvider';

export const useCachedSearch = (options = {}) => {
  const {
    documentType = '',
    searchFields = ['title', 'overview', 'body'],
    pageSlugPrefix = 'ai-tools',
    enabled = true,
    debounceMs = 300,
    minSearchLength = 1,
    componentName = 'Search',
  } = options;

  const { isOnline } = useCacheContext();
  
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // CRITICAL FIX: Consolidate all result states into single state object
  const [searchState, setSearchState] = useState({
    results: [],
    isLoading: false,
    error: null,
    isStale: false,
    cacheSource: 'offline-client-side',
    searchMode: 'idle' // 'idle', 'online', 'offline'
  });

  const debounceTimeoutRef = useRef(null);
  const searchTextRef = useRef('');
  const previousOnlineState = useRef(isOnline);
  const stateUpdateInProgress = useRef(false); // CRITICAL: Prevent concurrent updates

  // Initialize hook
  useEffect(() => {
    if (enabled && !isInitialized) {
      setIsInitialized(true);
    }
  }, [enabled, isInitialized]);

  // CRITICAL FIX: Simplified search mode management
  const currentSearchMode = useMemo(() => {
    if (!isSearchActive) return 'idle';
    return isOnline ? 'online' : 'offline';
  }, [isSearchActive, isOnline]);

  // Update search mode only when it actually changes
  useEffect(() => {
    if (searchState.searchMode !== currentSearchMode) {
      setSearchState(prev => ({
        ...prev,
        searchMode: currentSearchMode
      }));
    }
  }, [currentSearchMode, searchState.searchMode]);

  // Track online state changes
  useEffect(() => {
    if (previousOnlineState.current !== isOnline) {
      console.log(`[useCachedSearch] Network state changed: ${isOnline ? 'online' : 'offline'}`);
      previousOnlineState.current = isOnline;
    }
  }, [isOnline]);

  // CRITICAL FIX: Simplified debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchText.trim().length >= minSearchLength || searchText.trim().length === 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchText(searchText);
      }, debounceMs);
    } else {
      setDebouncedSearchText('');
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchText, debounceMs, minSearchLength]);

  // Query generation functions (unchanged)
  const generateSanitySearchQuery = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < minSearchLength) {
      return null;
    }

    const docTypeFilter = Array.isArray(documentType) 
      ? documentType.map(type => `_type == "${type}"`).join(' || ')
      : `_type == "${documentType}"`;

    const conditions = searchFields.map(field => `${field} match $searchText`).join(' || ');

    if (!conditions) {
      console.warn("No search fields configured for documentType:", documentType);
      return null;
    }

    return `*[(${docTypeFilter}) && (${conditions})]{
      _id,
      title,
      overview,
      mainImage,
      slug,
      publishedAt,
      readTime,
      tags,
      "_type": _type,
      resourceType,
      resourceFormat,
      resourceLink,
      resourceLinkType,
      previewSettings,
      "resourceFile": resourceFile.asset->,
      content,
      promptContent,
      "relatedArticle": relatedArticle->{title, slug},
      aiToolDetails,
      seoTitle,
      seoDescription,
      seoKeywords,
      altText,
      structuredData
    }`;
  }, [documentType, searchFields, minSearchLength]);

  const generateNetworkSearchCacheKey = useCallback((searchTerm) => {
    if (!searchTerm) return null;
    const searchHash = btoa(searchTerm).slice(0, 20).replace(/=/g, '');
    const typeIdentifier = Array.isArray(documentType) 
      ? documentType.join('-') 
      : documentType;
    return CACHE_KEYS.PAGE.SEARCH_RESULTS(typeIdentifier, searchHash);
  }, [documentType]);

  const allDocsForOfflineQuery = useCallback(() => {
    const docTypeFilter = Array.isArray(documentType) 
      ? documentType.map(type => `_type == "${type}"`).join(' || ')
      : `_type == "${documentType}"`;
    return `*[(${docTypeFilter})]{
      _id,
      title,
      overview,
      mainImage,
      slug,
      publishedAt,
      readTime,
      tags,
      "_type": _type,
      resourceType,
      resourceFormat,
      aiToolDetails
    }`;
  }, [documentType]);

  const allDocsForOfflineCacheKey = useCallback(() => {
    const typeIdentifier = Array.isArray(documentType) 
      ? documentType.join('-') 
      : documentType;
    return CACHE_KEYS.PAGE.ALL_BLOGS_TOTAL(typeIdentifier);
  }, [documentType]);

  // Load offline data for fallback
  const {
    data: allOfflineDocs,
    isLoading: isLoadingAllOfflineDocs,
    error: allOfflineDocsBaseError,
  } = useSanityCache(
    allDocsForOfflineCacheKey(),
    allDocsForOfflineQuery(),
    {},
    {
      enabled: enabled && isInitialized,
      componentName: `${Array.isArray(documentType) ? documentType.join('-') : documentType}-AllDocsForOfflineSearch`,
      staleTime: 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      enableOffline: true,
      group: `all-docs-${Array.isArray(documentType) ? documentType.join('-') : documentType}`,
    }
  );

  // Network search setup
  const currentNetworkQuery = generateSanitySearchQuery(debouncedSearchText);
  const currentNetworkCacheKey = generateNetworkSearchCacheKey(debouncedSearchText);
  const networkSearchParams = debouncedSearchText ? { searchText: `*${debouncedSearchText}*` } : {};

  const shouldEnableNetworkSearch = useMemo(() => {
    const basicConditions = enabled && isInitialized && isSearchActive && !!currentNetworkQuery;
    
    if (!basicConditions || !isOnline || searchState.searchMode !== 'online') {
      return false;
    }

    if (allOfflineDocs && Array.isArray(allOfflineDocs) && allOfflineDocs.length > 0) {
      const currentQuery = debouncedSearchText.trim().toLowerCase();
      if (currentQuery.length > 0) {
        const hasLocalMatches = allOfflineDocs.some(doc => {
          return searchFields.some(field => {
            const fieldValue = doc[field];
            return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(currentQuery);
          });
        });
        if (!hasLocalMatches) {
          console.log(`[useCachedSearch] Network search disabled - no local matches for "${debouncedSearchText}"`);
          return false;
        }
      }
    }

    console.log(`[useCachedSearch] Network search enabled for query: "${debouncedSearchText}"`);
    return true;
  }, [enabled, isInitialized, isSearchActive, currentNetworkQuery, isOnline, searchState.searchMode, debouncedSearchText, allOfflineDocs, searchFields]);

  // Network search hook
  const {
    data: networkSearchResults,
    isLoading: isNetworkSearchLoading,
    error: networkSearchError,
    isStale: isNetworkStale,
    cacheSource: networkCacheSource,
    refresh: refreshNetworkSearch,
  } = useSanityCache(
    currentNetworkCacheKey || 'disabled-network-search',
    currentNetworkQuery,
    networkSearchParams,
    {
      enabled: shouldEnableNetworkSearch,
      componentName: `${componentName}-SanitySearch`,
      staleTime: 2 * 60 * 1000,
      maxAge: 24 * 60 * 60 * 1000,
      enableOffline: true,
      group: `search-${Array.isArray(documentType) ? documentType.join('-') : documentType}`,
    }
  );

  // CRITICAL FIX: Single effect to handle all search result updates
  useEffect(() => {
    // Prevent concurrent updates
    if (stateUpdateInProgress.current) {
      return;
    }

    const shouldShowSearchResults = isSearchActive && 
      debouncedSearchText.trim().length >= minSearchLength && 
      isInitialized;

    if (!shouldShowSearchResults) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
        error: null,
        isStale: false
      }));
      return;
    }

    stateUpdateInProgress.current = true;

    const updateSearchResults = async () => {
      try {
        const currentQuery = debouncedSearchText.trim().toLowerCase();
        
        if (searchState.searchMode === 'online') {
          // Handle online search
          if (isNetworkSearchLoading && (!allOfflineDocs || allOfflineDocs.length === 0)) {
            setSearchState(prev => ({
              ...prev,
              isLoading: true,
              error: null
            }));
          } else if (networkSearchResults && Array.isArray(networkSearchResults)) {
            const validNetworkResults = networkSearchResults.filter(doc => {
              if (!doc || typeof doc !== 'object') return false;
              return searchFields.some(field => {
                const fieldValue = doc[field];
                return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(currentQuery);
              });
            });

            setSearchState(prev => ({
              ...prev,
              results: validNetworkResults,
              isLoading: false,
              error: validNetworkResults.length === 0 ? new Error(`No results found for "${debouncedSearchText}"`) : null,
              isStale: isNetworkStale,
              cacheSource: networkCacheSource || 'network'
            }));
          } else if (networkSearchError && allOfflineDocs && allOfflineDocs.length > 0) {
            // Fallback to offline results
            const validOfflineResults = allOfflineDocs.filter(doc => {
              if (!doc || typeof doc !== 'object') return false;
              return searchFields.some(field => {
                const fieldValue = doc[field];
                return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(currentQuery);
              });
            });

            setSearchState(prev => ({
              ...prev,
              results: validOfflineResults,
              isLoading: false,
              error: validOfflineResults.length === 0 ? new Error(`No results found for "${debouncedSearchText}"`) : null,
              isStale: true,
              cacheSource: 'offline-fallback'
            }));
          } else if (!isNetworkSearchLoading) {
            // Network finished with no results, try offline
            if (allOfflineDocs && allOfflineDocs.length > 0) {
              const validOfflineResults = allOfflineDocs.filter(doc => {
                if (!doc || typeof doc !== 'object') return false;
                return searchFields.some(field => {
                  const fieldValue = doc[field];
                  return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(currentQuery);
                });
              });

              setSearchState(prev => ({
                ...prev,
                results: validOfflineResults,
                isLoading: false,
                error: validOfflineResults.length === 0 ? new Error(`No results found for "${debouncedSearchText}"`) : null,
                isStale: false,
                cacheSource: 'offline-client-side'
              }));
            } else {
              setSearchState(prev => ({
                ...prev,
                results: [],
                isLoading: false,
                error: new Error(`No results found for "${debouncedSearchText}"`),
                isStale: false,
                cacheSource: 'network'
              }));
            }
          }
        } else if (searchState.searchMode === 'offline') {
          // Handle offline search
          if (isLoadingAllOfflineDocs) {
            setSearchState(prev => ({
              ...prev,
              isLoading: true,
              error: null
            }));
          } else if (allOfflineDocs && Array.isArray(allOfflineDocs) && allOfflineDocs.length > 0) {
            const validOfflineResults = allOfflineDocs.filter(doc => {
              if (!doc || typeof doc !== 'object') return false;
              return searchFields.some(field => {
                const fieldValue = doc[field];
                return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(currentQuery);
              });
            });

            setSearchState(prev => ({
              ...prev,
              results: validOfflineResults,
              isLoading: false,
              error: validOfflineResults.length === 0 ? new Error(`No results found for "${debouncedSearchText}"`) : null,
              isStale: false,
              cacheSource: 'offline-client-side'
            }));
          } else if (allOfflineDocsBaseError) {
            setSearchState(prev => ({
              ...prev,
              results: [],
              isLoading: false,
              error: allOfflineDocsBaseError,
              isStale: false,
              cacheSource: 'offline-client-side'
            }));
          } else {
            setSearchState(prev => ({
              ...prev,
              results: [],
              isLoading: false,
              error: new Error("You are offline and no cached data is available for search."),
              isStale: false,
              cacheSource: 'offline-client-side'
            }));
          }
        }
      } catch (error) {
        console.error('[useCachedSearch] Error updating search results:', error);
        setSearchState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          error: error,
          isStale: false
        }));
      } finally {
        stateUpdateInProgress.current = false;
      }
    };

    updateSearchResults();
  }, [
    isSearchActive,
    debouncedSearchText,
    minSearchLength,
    isInitialized,
    searchState.searchMode,
    isNetworkSearchLoading,
    networkSearchResults,
    networkSearchError,
    isNetworkStale,
    networkCacheSource,
    allOfflineDocs,
    isLoadingAllOfflineDocs,
    allOfflineDocsBaseError,
    searchFields
  ]);

  // Handle search action (button click or Enter key)
  const handleSearch = useCallback(() => {
    if (searchText.trim().length >= minSearchLength) {
      setIsSearchActive(true);
      setDebouncedSearchText(searchText); // Ensure debounced text is updated immediately
    } else {
      console.log(`Please enter at least ${minSearchLength} character(s) for search.`);
      setIsSearchActive(false);
      setDebouncedSearchText('');
    }
  }, [searchText, minSearchLength]);

  // Reset all search-related states
  const resetSearch = useCallback(() => {
    setSearchText('');
    setDebouncedSearchText('');
    setIsSearchActive(false);
    setSearchState({
      results: [],
      isLoading: false,
      error: null,
      isStale: false,
      cacheSource: 'offline-client-side',
      searchMode: 'idle'
    });
  }, []);

  // Update search text as user types
  const updateSearchText = useCallback((newSearchText) => {
    setSearchText(newSearchText);
    searchTextRef.current = newSearchText;

    // If user clears the search text and search was active, automatically reset
    if (newSearchText.trim().length === 0 && isSearchActive) {
      resetSearch();
    }
  }, [isSearchActive, resetSearch]);

  // Handle Enter key press in the search input
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (searchText.trim() !== '') {
        handleSearch();
      } else {
        resetSearch();
      }
    }
  }, [searchText, handleSearch, resetSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchText,
    debouncedSearchText,
    isSearchActive,
    searchResults: searchState.results,
    isSearchLoading: searchState.isLoading,
    searchError: searchState.error,
    isStale: searchState.isStale,
    cacheSource: searchState.cacheSource,
    updateSearchText,
    handleSearch,
    resetSearch,
    refreshSearch: (isOnline && searchState.searchMode === 'online') ? refreshNetworkSearch : null,
    handleKeyDown,
    hasResults: searchState.results && searchState.results.length > 0,
    isEmpty: isSearchActive && !searchState.isLoading && searchState.results.length === 0,
    showNoResults: isSearchActive && !searchState.isLoading && searchState.results.length === 0 && searchText.trim().length > 0,
    documentType,
    pageSlugPrefix,
    minSearchLength,
    isInitialized,
    hasOfflineData: !!(allOfflineDocs && allOfflineDocs.length > 0),
    isLoadingAllOfflineDocs,
    allOfflineDocsBaseError,
    searchMode: searchState.searchMode,
  };
};