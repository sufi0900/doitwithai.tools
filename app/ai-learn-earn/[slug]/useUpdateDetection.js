"use client";

import { useState, useEffect } from 'react';
import { useArticleCache } from './ArticleCacheContext'; // Adjust path as needed

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 */

/**
 * Hook to get update detection status for a specific component.
 * This hook consumes data from the ArticleCacheContext.
 * @param {string} componentId - The ID of the component (e.g., 'main-content', 'related-posts').
 * @returns {{ hasUpdatesAvailable: boolean, status: CacheStatus, isRefreshing: boolean }}
 */
export function useUpdateDetection(componentId) {
    const { componentStats, isRefreshingAnyComponent, hasUpdatesAvailableGlobally } = useArticleCache();
    const [hasUpdatesAvailable, setHasUpdatesAvailable] = useState(false);
    const [status, setStatus] = useState('cached');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const stat = componentStats.get(componentId);
        if (stat) {
            setHasUpdatesAvailable(stat.hasUpdatesAvailable);
            setStatus(stat.status);
            // This needs to be set by the actual useAdvancedPageCache for its own refreshing state
            // For now, we'll assume isRefreshingAnyComponent covers it.
            setIsRefreshing(isRefreshingAnyComponent);
        } else {
            // If component not yet tracked, default to 'cached' and no updates
            setHasUpdatesAvailable(false);
            setStatus('cached');
            setIsRefreshing(false);
        }
    }, [componentStats, componentId, isRefreshingAnyComponent]);

    // For schema-wide updates, the global button will use `hasUpdatesAvailableGlobally`.
    // This hook is for individual component status.
    return { hasUpdatesAvailable, status, isRefreshing };
}