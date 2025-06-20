// context/ArticleCacheContext.js
"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import cacheManager from './cacheManager';
import updatePollingManager, { createPoller, stopPoller, pauseAllPolling, resumeAllPolling } from './updatePolling';

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 * @typedef {import('../types/cacheTypes').ComponentStat} ComponentStat
 * @typedef {import('../types/cacheTypes').GlobalCacheStats} GlobalCacheStats
 * @typedef {import('../types/cacheTypes').RefreshFunction} RefreshFunction
 * @typedef {import('../types/cacheTypes').ArticleCacheContextType} ArticleCacheContextType
 */

/** @type {React.Context<ArticleCacheContextType | undefined>} */
const ArticleCacheContext = createContext(undefined);

/**
 * Custom hook to consume the ArticleCacheContext.
 * @returns {ArticleCacheContextType}
 */
export function useArticleCache() {
    const context = useContext(ArticleCacheContext);
    if (context === undefined) {
        throw new Error('useArticleCache must be used within an ArticleCacheProvider');
    }
    return context;
}

/**
 * Provider component for the Article Cache Context.
 * Manages global cache state, polling, and provides refresh functions.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider.
 * @param {string} props.schemaType - The Sanity schema type for the current article (e.g., 'aitool').
 */
export function ArticleCacheProvider({ children, schemaType }) {
    const [componentStats, setComponentStats] = useState(new Map());
    const [globalStats, setGlobalStats] = useState(cacheManager.getGlobalCacheStats());
    const [isRefreshingAnyComponent, setIsRefreshingAnyComponent] = useState(false);
    const [isPollingActive, setIsPollingActive] = useState(false);
    const [hasUpdatesAvailableGlobally, setHasUpdatesAvailableGlobally] = useState(false);

    // Refs to store individual component refresh functions
    const refreshFunctions = useRef(new Map());
    const pollingSchemaTypes = useRef(new Set()); // To track which schema types are being polled

    // Register refresh functions from useAdvancedPageCache
    const registerRefreshFunction = useCallback((componentId, refreshFn) => {
        refreshFunctions.current.set(componentId, refreshFn);
    }, []);

    const unregisterRefreshFunction = useCallback((componentId) => {
        refreshFunctions.current.delete(componentId);
    }, []);

    // Effect to set up and manage polling for the current schema type
    useEffect(() => {
        if (!schemaType || pollingSchemaTypes.current.has(schemaType)) {
            return; // Only set up one poller per schema type
        }

        // Initialize polling for the article's schema type
        const pollerId = createPoller(schemaType, {
            onUpdate: (updatedSchemaType, updatesDetected) => {
                // This callback is triggered by updatePollingManager.checkForUpdates
                // It indicates if *any* update was found for this schemaType globally.
                console.log(`Polling callback: Updates detected for ${updatedSchemaType}: ${updatesDetected}`);
                setHasUpdatesAvailableGlobally(prev => prev || updatesDetected); // Set to true if any schema update is detected
            },
            onError: (error) => {
                console.error(`Polling error for ${schemaType}:`, error);
                // Handle error state, perhaps notify components
            }
        });
        pollingSchemaTypes.current.add(schemaType);
        setIsPollingActive(true);

        // Periodically update global stats and component stats
        // --- IMPORTANT CHANGE HERE ---
        const updateStatusInterval = setInterval(() => {
            // Only update if document is visible to prevent unnecessary work
            if (!document.hidden) {
                const newComponentStats = new Map(cacheManager.getAllComponentStats());
                const newGlobalStats = cacheManager.getGlobalCacheStats();

                // Perform a shallow comparison to avoid re-rendering if stats haven't meaningfully changed
                // Convert Map to a JSON string for comparison
                const currentComponentStatsString = JSON.stringify(Array.from(componentStats));
                const newComponentStatsString = JSON.stringify(Array.from(newComponentStats));
                const currentGlobalStatsString = JSON.stringify(globalStats);
                const newGlobalStatsString = JSON.stringify(newGlobalStats);

                if (newComponentStatsString !== currentComponentStatsString) {
                    setComponentStats(newComponentStats);
                }
                if (newGlobalStatsString !== currentGlobalStatsString) {
                    setGlobalStats(newGlobalStats);
                }

                let refreshing = false;
                newComponentStats.forEach(stat => { // Use newComponentStats for current check
                    if (stat.status === 'refreshing') {
                        refreshing = true;
                    }
                });
                setIsRefreshingAnyComponent(refreshing);
            }
        }, 2000); // Increased interval to 2 seconds (adjust as needed: 1000ms, 3000ms)

        return () => {
            stopPoller(pollerId);
            pollingSchemaTypes.current.delete(schemaType);
            clearInterval(updateStatusInterval);
        };
    }, [schemaType, componentStats, globalStats]); // Added componentStats and globalStats to deps for comparison for effect re-evaluation

    // Listen to visibility changes to pause/resume global polling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                pauseAllPolling();
            } else {
                resumeAllPolling();
                // When tab becomes visible again, trigger an immediate status check
                if (schemaType) {
                    updatePollingManager.checkForUpdates(schemaType);
                }
            }
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [schemaType]); // Added schemaType to dependencies

    // Function to refresh all components being tracked
    const refreshAllComponents = useCallback(async () => {
        setIsRefreshingAnyComponent(true);
        setHasUpdatesAvailableGlobally(false); // Reset global updates flag when refreshing
        const refreshPromises = [];
        refreshFunctions.current.forEach(refreshFn => {
            refreshPromises.push(refreshFn());
        });
        try {
            await Promise.all(refreshPromises);
        } catch (error) {
            console.error("Error refreshing all components:", error);
        } finally {
            setIsRefreshingAnyComponent(false);
            // After refresh, immediately check for updates again to update status
            if (schemaType) { // Ensure schemaType exists before calling checkForUpdates
                updatePollingManager.checkForUpdates(schemaType);
            }
        }
    }, [schemaType]); // Added schemaType to dependencies

    // Expose specific refresh functions if they exist (These should be fine as they use refs)
    const refreshArticleContent = refreshFunctions.current.get('main-content') || null;
    const refreshRelatedPosts = refreshFunctions.current.get('related-posts') || null;
    const refreshRelatedResources = refreshFunctions.current.get('related-resources') || null;

    const contextValue = {
        componentStats,
        globalStats,
        refreshAllComponents,
        refreshArticleContent,
        refreshRelatedPosts,
        refreshRelatedResources,
        isRefreshingAnyComponent,
        isPollingActive,
        hasUpdatesAvailableGlobally,
        _registerRefreshFunction: registerRefreshFunction, // Internal use by hooks
        _unregisterRefreshFunction: unregisterRefreshFunction // Internal use by hooks
    };

    return (
        <ArticleCacheContext.Provider value={contextValue}>
            {children}
        </ArticleCacheContext.Provider>
    );
}