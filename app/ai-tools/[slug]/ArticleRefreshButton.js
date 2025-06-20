"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useArticleRefresh } from './ArticleRefreshContext';
import { useGlobalArticleCache } from './GlobalArticleCacheContext';
import { articleCacheUtils } from './articleCacheUtils';

const ArticleRefreshButton = ({ 
  articleType, 
  articleSlug, 
  className = "",
  showTooltip = true,
  variant = "default" // default, compact, minimal
}) => {
  const {
    refreshAllComponents,
    forceRefreshAll,
    isRefreshing,
    getRefreshStats,
    componentStats
  } = useArticleRefresh();

  const {
    globalCacheStats,
    updateGlobalStats
  } = useGlobalArticleCache();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const [lastRefreshResult, setLastRefreshResult] = useState(null);
  
  const dropdownRef = useRef(null);
  const tooltipRef = useRef(null);

  // Get current cache info
  const cacheInfo = articleCacheUtils.getArticleCacheInfo(articleType, articleSlug);
  const refreshStats = getRefreshStats();

  // Handle refresh with animation
  const handleRefresh = useCallback(async (forceRefresh = false) => {
    setRefreshAnimation(true);
    setShowDropdown(false);
    
    try {
      const result = forceRefresh 
        ? await forceRefreshAll() 
        : await refreshAllComponents();
      
      setLastRefreshResult(result);
      updateGlobalStats();
      
      // Show success animation
      setTimeout(() => setRefreshAnimation(false), 1000);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      setLastRefreshResult({ error: error.message });
      setRefreshAnimation(false);
    }
  }, [forceRefreshAll, refreshAllComponents, updateGlobalStats]);

  // Get overall status
  const getOverallStatus = useCallback(() => {
    const { summary } = cacheInfo;
    if (isRefreshing) return 'loading';
    if (summary.healthCounts.corrupted > 0) return 'error';
    if (summary.healthCounts.expired > 0) return 'expired';
    if (summary.healthCounts.stale > 0) return 'stale';
    if (summary.healthCounts.aging > 0) return 'aging';
    if (summary.cachedComponents > 0) return 'cached';
    return 'fresh';
  }, [cacheInfo, isRefreshing]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltipContent(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overallStatus = getOverallStatus();
  const statusColor = articleCacheUtils.getStatusColor(overallStatus);
  const statusIcon = articleCacheUtils.getStatusIcon(overallStatus);
  const statusText = articleCacheUtils.getStatusText(overallStatus);

  // Render variants
  if (variant === "minimal") {
    return (
      <div className="relative">
        <button
          onClick={() => handleRefresh(false)}
          disabled={isRefreshing}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${statusColor} ${className}`}
          title={`${statusText} - Click to refresh`}
        >
          <span className={`text-sm ${refreshAnimation ? 'animate-spin' : ''}`}>
            {isRefreshing ? '⏳' : statusIcon}
          </span>
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={() => handleRefresh(false)}
          disabled={isRefreshing}
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${statusColor} ${className}`}
        >
          <span className={refreshAnimation ? 'animate-spin' : ''}>
            {isRefreshing ? '⏳' : statusIcon}
          </span>
          <span>{statusText}</span>
        </button>
      </div>
    );
  }

  // Default variant - full featured
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Main refresh button */}
        <button
          onClick={() => handleRefresh(false)}
          disabled={isRefreshing}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 ${statusColor} ${className}`}
        >
          <span className={refreshAnimation ? 'animate-spin' : ''}>
            {isRefreshing ? '⏳' : statusIcon}
          </span>
          <span>{isRefreshing ? 'Refreshing...' : statusText}</span>
          {cacheInfo.summary.cachedComponents > 0 && (
            <span className="text-xs opacity-75 ml-1">
              ({cacheInfo.summary.cachedComponents})
            </span>
          )}
        </button>

        {/* Dropdown menu button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-2 rounded-lg transition-all duration-200 hover:shadow-md ${statusColor}`}
          title="More options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Info tooltip button */}
        {showTooltip && (
          <button
            onMouseEnter={() => setShowTooltipContent(true)}
            onMouseLeave={() => setShowTooltipContent(false)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            title="Cache information"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Cache Actions</h3>
            <p className="text-xs text-gray-500 mt-1">
              {cacheInfo.summary.cachedComponents} components cached
            </p>
          </div>

          <div className="p-2">
            <button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50"
            >
              🔄 Quick Refresh
            </button>
            
            <button
              onClick={() => handleRefresh(true)}
              disabled={isRefreshing}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50"
            >
              💪 Force Refresh (Clear Cache)
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            <div className="px-3 py-2">
              <div className="text-xs text-gray-500 mb-2">Component Status:</div>
              <div className="space-y-1">
                {Object.entries(componentStats).map(([name, stats]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="truncate">{name}</span>
                    <span className={`px-2 py-1 rounded-full ${articleCacheUtils.getStatusColor(stats.status)}`}>
                      {articleCacheUtils.getStatusIcon(stats.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {refreshStats.totalRefreshes > 0 && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="px-3 py-2 text-xs text-gray-500">
                  <div>Total Refreshes: {refreshStats.totalRefreshes}</div>
                  {refreshStats.lastRefreshTime && (
                    <div>Last: {articleCacheUtils.formatDuration(refreshStats.lastRefreshTime)}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div 
          ref={tooltipRef}
          className="absolute top-full right-0 mt-2 w-80 bg-gray-900 text-white rounded-lg shadow-lg z-50 p-4"
        >
          <div className="text-sm">
            <div className="font-medium mb-2">Cache Information</div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Article:</span>
                <span className="font-mono text-xs">{articleType}/{articleSlug}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Components:</span>
                <span>{cacheInfo.summary.cachedComponents}/{cacheInfo.summary.totalComponents}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Total Size:</span>
                <span>{cacheInfo.summary.formattedTotalSize}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Overall Health:</span>
                <span className="flex items-center space-x-1">
                  <span>{articleCacheUtils.getStatusIcon(cacheInfo.summary.overallHealth)}</span>
                  <span>{articleCacheUtils.getStatusText(cacheInfo.summary.overallHealth)}</span>
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs opacity-75">
                {Object.entries(cacheInfo.summary.healthCounts).map(([health, count]) => (
                  <div key={health} className="flex justify-between">
                    <span>{health}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {lastRefreshResult && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs opacity-75">
                  <div>Last Refresh:</div>
                  {lastRefreshResult.error ? (
                    <div className="text-red-400">Error: {lastRefreshResult.error}</div>
                  ) : (
                    <div className="text-green-400">
                      ✅ {lastRefreshResult.successful}/{lastRefreshResult.total} components
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleRefreshButton;