// components/Search/SearchResults.js - Reusable search results component
'use client';
import React from 'react';
import { urlForImage } from '@/sanity/lib/image';
import CardComponent from '@/components/Card/Page';

const SearchResults = ({ 
  searchResults = [], 
  isLoading = false, 
  error = null,
  isSearchActive = false,
  searchText = '',
  pageSlugPrefix = '',
  showNoResults = false,
  cacheSource = null,
  isStale = false,
  onResetSearch,
  onRefreshSearch,
  className = '',
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-gray-500 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  // Error state
 // Error state
if (error) {
  const isOfflineError = error.message?.includes('offline') || error.message?.includes('fetch');
  
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-red-500 dark:text-red-400 mb-4">
        {isOfflineError 
          ? `Search unavailable offline${searchText ? ` for "${searchText}"` : ''}. Try again when connected.`
          : (error.message || 'An error occurred while searching.')
        }
      </p>
      <div className="flex justify-center space-x-2">
        {onRefreshSearch && !isOfflineError && (
          <button
            onClick={onRefreshSearch}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry Search
          </button>
        )}
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
}

  // No results state
  if (showNoResults) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No search results found for "{searchText}".
        </p>
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  // Results state
  if (isSearchActive && searchResults.length > 0) {
    return (
      <div className={className}>
        {/* Cache status indicator */}
        {(cacheSource || isStale) && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>
              Search results from {cacheSource || 'cache'}
              {isStale && ' (refreshing in background)'}
            </span>
            {onRefreshSearch && isStale && (
              <button
                onClick={onRefreshSearch}
                className="text-primary hover:underline text-xs"
              >
                Refresh Now
              </button>
            )}
          </div>
        )}
        
        {/* Results count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchText}"
        </div>

        {/* Results grid */}
        <div className="-mx-4 flex flex-wrap justify-center">
          {searchResults.map((post) => (
            <CardComponent
              key={post._id}
              tags={post.tags}
              ReadTime={post.readTime?.minutes}
              overview={post.overview}
              title={post.title}
              mainImage={post.mainImage ? urlForImage(post.mainImage).url() : null}
              slug={`/${pageSlugPrefix}/${post.slug?.current}`}
              publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default: return nothing if search is not active
  return null;
};

export default SearchResults;