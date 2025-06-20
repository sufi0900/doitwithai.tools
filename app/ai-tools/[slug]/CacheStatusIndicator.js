// CacheStatusIndicator.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { articleCacheUtils } from './articleCacheUtils';
import { useArticleRefresh } from './ArticleRefreshContext';

const CacheStatusIndicator = ({
  isFromCache = false,
  onRefresh = null,
  articleType = null,
  articleSlug = null,
  componentName = "Article",
  status = "loading",
  showRefreshButton = true,
  className = ""
}) => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(useState(false)); // Corrected initialization
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const tooltipRef = useRef(null);
  const indicatorRef = useRef(null);

  // CORRECTED: Call useArticleRefresh unconditionally
  const articleRefreshContext = useArticleRefresh(); // This must be called every render

  // Update cache info when component mounts or props change
  useEffect(() => {
    if (articleType && articleSlug) {
      const info = articleCacheUtils.getArticleCacheInfo(articleType, articleSlug);
      setCacheInfo(info);
    }
  }, [articleType, articleSlug, status, isFromCache]);

  // Handle refresh action
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setLastRefreshTime(Date.now());

    try {
      // Now you can safely check if articleRefreshContext is available (i.e., not null/undefined)
      if (articleRefreshContext && articleRefreshContext.refreshAllComponents) {
        await articleRefreshContext.refreshAllComponents(true);
      } else if (onRefresh) {
        await onRefresh();
      }

      // Update cache info after refresh
      if (articleType && articleSlug) {
        const info = articleCacheUtils.getArticleCacheInfo(articleType, articleSlug);
        setCacheInfo(info);
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get current status info
  const getStatusInfo = () => {
    const statusColor = articleCacheUtils.getStatusColor(status);
    const statusIcon = articleCacheUtils.getStatusIcon(status);
    const statusText = articleCacheUtils.getStatusText(status);

    return { statusColor, statusIcon, statusText };
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTooltipVisible && tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          indicatorRef.current && !indicatorRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTooltipVisible]);

  const { statusColor, statusIcon, statusText } = getStatusInfo();

  // Create tooltip content
  const renderTooltipContent = () => {
    if (!cacheInfo) {
      return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border text-sm">
          <div className="font-semibold mb-2">Cache Status: {statusText}</div>
          <div className="text-gray-600 dark:text-gray-400">Component: {componentName}</div>
        </div>
      );
    }

    const { components, summary } = cacheInfo;

    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Cache Status</div>
          <div className={`px-2 py-1 rounded text-xs ${statusColor}`}>
            {statusIcon} {statusText}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>Components: {summary.cachedComponents}/{summary.totalComponents}</div>
            <div>Size: {summary.formattedTotalSize}</div>
            <div>Health: {summary.overallHealth}</div>
            <div>Last Refresh: {articleCacheUtils.formatDuration(lastRefreshTime)}</div>
          </div>
        </div>

        {/* Component Details */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Components:</div>
          {components.slice(0, 5).map((component, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="truncate flex-1">{component.componentName}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-1 py-0.5 rounded ${articleCacheUtils.getStatusColor(component.health)}`}>
                  {articleCacheUtils.getStatusIcon(component.health)}
                </span>
                <span className="text-gray-500">{component.formattedSize}</span>
              </div>
            </div>
          ))}
          {components.length > 5 && (
            <div className="text-xs text-gray-500">+{components.length - 5} more...</div>
          )}
        </div>

        {/* Actions */}
        {showRefreshButton && (
          <div className="mt-3 pt-3 border-t">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors"
            >
              {isRefreshing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                '🔄 Refresh All'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Main Status Indicator */}
      <div
        ref={indicatorRef}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:shadow-md ${statusColor}`}
        onClick={() => setIsTooltipVisible(!isTooltipVisible)}
      >
        <span>{statusIcon}</span>
        <span>{statusText}</span>

        {/* Component count badge */}
        {cacheInfo && (
          <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
            {cacheInfo.summary.cachedComponents}/{cacheInfo.summary.totalComponents}
          </span>
        )}

        {/* Refresh button */}
        {showRefreshButton && onRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing}
            className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Refresh data"
          >
            {isRefreshing ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              '🔄'
            )}
          </button>
        )}
      </div>

      {/* Tooltip */}
      {isTooltipVisible && (
        <div
          ref={tooltipRef}
          className="absolute top-full left-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200"
        >
          {renderTooltipContent()}
        </div>
      )}

      {/* Backdrop for mobile */}
      {isTooltipVisible && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10 md:hidden"
          onClick={() => setIsTooltipVisible(false)}
        />
      )}
    </div>
  );
};

export default CacheStatusIndicator;