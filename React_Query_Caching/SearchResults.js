'use client';
import React from 'react';
// import { urlForImage } from '@/sanity/lib/image';
import CardComponent from '@/components/Card/Page';
import SidebarSearchCard from '@/app/ai-tools/[slug]/SidebarSearchCard';

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
  isSidebarView = false,
}) => {
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

  if (isSearchActive && searchResults.length > 0) {
    const CardToRender = isSidebarView ? SidebarSearchCard : CardComponent;
    
    // Conditional rendering for the grid based on view
    const gridClassName = isSidebarView ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";

    return (
      <div className={className}>
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
        
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchText}"
        </div>


<div className={gridClassName}>
  {searchResults.map((post) => {
    // Create dynamic route based on post type
    const getPostRoute = (post) => {
      const schemaSlugMap = {
        makemoney: "ai-learn-earn",
        aitool: "ai-tools", 
        coding: "ai-code",
        seo: "ai-seo"
      };
      
      const routePrefix = schemaSlugMap[post._type];
      return routePrefix ? `/${routePrefix}/${post.slug?.current}` : `/${post.slug?.current}`;
    };

    return (
      <CardToRender
        key={post._id}
        tags={post.tags}
        readTime={post.readTime?.minutes}
        overview={post.overview}
        title={post.title}
        mainImage={post.mainImage}
        slug={getPostRoute(post)} // Use dynamic route instead of fixed pageSlugPrefix
        publishedAt={new Date(post.publishedAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short', 
          year: 'numeric'
        })}
      />
    );
  })}
</div>
      </div>
    );
  }

  return null;
};

export default SearchResults;
