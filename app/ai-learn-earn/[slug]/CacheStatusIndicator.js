"use client";

import React from 'react';
import { useArticleCache } from './ArticleCacheContext'; // Adjust path as needed
import { WifiIcon, CloudArrowUpIcon, CheckCircleIcon, CubeTransparentIcon } from '@heroicons/react/24/solid'; // Example icons, install @heroicons/react

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 */

/**
 * A small indicator component to show current cache status.
 * @param {object} props
 * @param {string} props.componentId - The ID of the component to track (e.g., 'main-content', 'related-posts').
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.showTooltip=false] - Whether to show a detailed tooltip on hover.
 */
const CacheStatusIndicator = ({ componentId, className = '', showTooltip = false }) => {
    const { componentStats } = useArticleCache();
    const stat = componentStats.get(componentId);

    if (!stat) {
        return null; // Don't render if component not tracked yet
    }

    const { status, isFromCache, source, hasUpdatesAvailable } = stat;

    let icon = null;
    let colorClass = 'text-gray-500';
    let tooltipText = '';

    switch (status) {
        case 'fresh':
            icon = <CheckCircleIcon className="h-4 w-4" />;
            colorClass = 'text-green-500';
            tooltipText = 'Data is fresh from API.';
            break;
        case 'cached':
            icon = <CubeTransparentIcon className="h-4 w-4" />;
            colorClass = 'text-purple-500';
            tooltipText = `Using cached data. Last fetched: ${new Date(stat.timestamp).toLocaleTimeString()}.`;
            break;
        case 'updates-available':
            icon = <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />;
            colorClass = 'text-blue-500';
            tooltipText = 'Updates available on server. Click refresh to get new content.';
            break;
        case 'offline':
            icon = <WifiIcon className="h-4 w-4" />;
            colorClass = 'text-red-500';
            tooltipText = 'You are offline. Showing cached content.';
            break;
        case 'refreshing':
            icon = (
                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
            colorClass = 'text-blue-500';
            tooltipText = 'Refreshing data...';
            break;
        default:
            icon = <CubeTransparentIcon className="h-4 w-4" />;
            colorClass = 'text-gray-500';
            tooltipText = 'Unknown cache status.';
            break;
    }

    return (
        <div className={`relative inline-flex items-center space-x-1 ${className}`}>
            <div className={`flex items-center justify-center rounded-full p-0.5 ${colorClass}`}>
                {icon}
            </div>
            {showTooltip && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tooltipText}
                </span>
            )}
        </div>
    );
};

export default CacheStatusIndicator;
