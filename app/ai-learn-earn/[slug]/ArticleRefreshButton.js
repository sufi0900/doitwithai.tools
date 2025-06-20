// components/ArticleRefreshButton.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useArticleCache } from './ArticleCacheContext';
import cacheManager from './cacheManager'; // For utility functions// components/ArticleRefreshButton.js


import { RefreshIcon, CloudArrowUpIcon, CheckCircleIcon, CubeTransparentIcon, WifiIcon } from '@heroicons/react/24/solid'; // Using Heroicons for now

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 * @typedef {import('../types/cacheTypes').GlobalCacheStats} GlobalCacheStats
 * @typedef {import('../types/cacheTypes').ComponentStat} ComponentStat
 */

/**
 * The main refresh button component for article pages.
 * Displays different statuses (Fresh, Cached, Updates Available, Offline) and provides tooltips.
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes for the button container.
 */
const ArticleRefreshButton = ({ className = '' }) => {
    const {
        globalStats,
        isRefreshingAnyComponent,
        refreshAllComponents,
        hasUpdatesAvailableGlobally,
        componentStats
    } = useArticleCache();

    const [showTooltip, setShowTooltip] = useState(false);
    const [isOfflineRetrying, setIsOfflineRetrying] = useState(false);

    // Determine button state and styling based on priority
    const getButtonState = () => {
        const { isCompletelyOffline, hasRecentlyFreshData, isBrowserOnline, total } = globalStats;
        const hasOfflineComponents = globalStats.offline > 0;
        const hasCachedComponents = globalStats.cached > 0;

        // Priority 1: Offline state (browser or any component)
        if (isCompletelyOffline || hasOfflineComponents) {
            return {
                status: 'offline',
                bgClass: 'bg-red-500',
                textClass: 'text-white',
                icon: <WifiIcon className="h-5 w-5" />,
                statusText: 'Offline',
                tooltipMessage: 'You are offline. Using cached content. Click to retry.',
                needsAttention: true,
                action: 'retry',
            };
        }

        // Priority 2: Updates available from CMS
        if (hasUpdatesAvailableGlobally) {
            return {
                status: 'updates-available',
                bgClass: 'bg-blue-500',
                textClass: 'text-white',
                icon: <CloudArrowUpIcon className="h-5 w-5 animate-pulse" />,
                statusText: 'Updates Available',
                tooltipMessage: 'New content updates are available from the server. Click to refresh.',
                needsAttention: true,
                action: 'refresh',
                pulse: true,
            };
        }

        // Priority 3: Recently refreshed (truly fresh data from API)
        if (hasRecentlyFreshData) {
            return {
                status: 'fresh',
                bgClass: 'bg-green-500',
                textClass: 'text-white',
                icon: <CheckCircleIcon className="h-5 w-5" />,
                statusText: 'Fresh',
                tooltipMessage: 'All data is fresh and up-to-date. No refresh needed.',
                needsAttention: false,
                action: 'refresh',
            };
        }

        // Priority 4: Cached data (default state for returning users)
        if (hasCachedComponents) {
            return {
                status: 'cached',
                bgClass: 'bg-purple-500',
                textClass: 'text-white',
                icon: <CubeTransparentIcon className="h-5 w-5" />,
                statusText: 'Cached',
                tooltipMessage: 'Showing cached content. No recent updates detected.',
                needsAttention: false,
                action: 'refresh',
            };
        }

        // Default: If no components or fresh data yet
        return {
            status: 'loading',
            bgClass: 'bg-gray-400',
            textClass: 'text-white',
            icon: (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ),
            statusText: 'Loading',
            tooltipMessage: 'Initializing caching system.',
            needsAttention: false,
            action: 'none',
        };
    };

    const buttonState = getButtonState();
    const isCurrentlyRefreshing = isRefreshingAnyComponent || isOfflineRetrying;

    const handleButtonClick = async () => {
        if (isCurrentlyRefreshing) return; // Prevent multiple clicks

        if (buttonState.action === 'retry') {
            setIsOfflineRetrying(true);
            try {
                // Try to refresh all components to get online status and fresh data
                await refreshAllComponents();
            } finally {
                setIsOfflineRetrying(false);
            }
        } else if (buttonState.action === 'refresh') {
            await refreshAllComponents();
        }
    };

    // Do not render if no components are being tracked yet
    if (globalStats.total === 0) {
        return null;
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
            <div className="relative">
                {/* Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-3 w-80 rounded-lg bg-gray-800 text-white p-4 text-sm shadow-lg">
                        <p className="font-semibold mb-2">{buttonState.tooltipMessage}</p>
                        <p className="mb-1"><strong>Status:</strong> {buttonState.statusText}</p>
                        <p className="mb-1"><strong>Browser Online:</strong> {globalStats.isBrowserOnline ? 'Yes' : 'No'}</p>
                        <p className="mb-1"><strong>Total Components Tracked:</strong> {globalStats.total}</p>
                        <p className="mb-1"><strong>Fresh:</strong> {globalStats.fresh}</p>
                        <p className="mb-1"><strong>Cached:</strong> {globalStats.cached}</p>
                        <p className="mb-1"><strong>Updates Available:</strong> {globalStats.updatesAvailable}</p>
                        <p className="mb-1"><strong>Offline Components:</strong> {globalStats.offline}</p>

                        <div className="mt-3 border-t border-gray-700 pt-2">
                            <p className="font-semibold text-xs text-gray-400 mb-1">Component Details:</p>
                            <ul className="text-xs max-h-24 overflow-y-auto">
                                {Array.from(componentStats.entries()).map(([id, stat]) => (
                                    <li key={id} className="mb-0.5">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-1
                                            ${stat.status === 'fresh' ? 'bg-green-500' : ''}
                                            ${stat.status === 'cached' ? 'bg-purple-500' : ''}
                                            ${stat.status === 'updates-available' ? 'bg-blue-500 animate-pulse' : ''}
                                            ${stat.status === 'offline' ? 'bg-red-500' : ''}
                                            ${stat.status === 'refreshing' ? 'bg-blue-300' : ''}
                                        `}></span>
                                        {id}: <span className="font-medium">{stat.status}</span> ({stat.source})
                                        {stat.itemCount !== undefined && ` (${stat.itemCount} items)`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Main button */}
                <button
                    onClick={handleButtonClick}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    disabled={isCurrentlyRefreshing && buttonState.action !== 'retry'} // Allow retry button to be clicked when refreshing if it's offline retry
                    className={`
                        relative flex items-center justify-center px-4 py-2 rounded-full
                        text-sm font-semibold shadow-lg transition-all duration-300
                        ${buttonState.bgClass} ${buttonState.textClass}
                        ${isCurrentlyRefreshing ? 'cursor-wait opacity-80' : 'cursor-pointer hover:scale-105 active:scale-95'}
                        ${buttonState.pulse && !isCurrentlyRefreshing ? 'animate-pulse' : ''}
                        ${className}
                    `}
                >
                    {isCurrentlyRefreshing ? (
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <span className="mr-2">{buttonState.icon}</span>
                    )}
                    <span>{buttonState.statusText}</span>
                </button>
            </div>
        </div>
    );
};

export default ArticleRefreshButton;
