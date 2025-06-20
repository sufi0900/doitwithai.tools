"use client";

import { useEffect } from 'react';
import cacheManager from './cacheManager'; // Adjust path as needed

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 * @typedef {import('../types/cacheTypes').ComponentStat} ComponentStat
 */

/**
 * Hook to track a component's cache status and report it to the global cache manager.
 * @param {string} componentId - Unique ID for the component (e.g., 'main-content', 'related-posts').
 * @param {object} stats - Object containing the current status and other relevant stats for this component.
 * @param {CacheStatus} stats.status - Current cache status.
 * @param {boolean} stats.isFromCache - True if data is from cache.
 * @param {string} stats.source - Source of data ('api' or 'cache').
 * @param {boolean} [stats.hasUpdatesAvailable=false] - True if updates are available for this component's data.
 * @param {string} stats.schemaType - Sanity schema type.
 * @param {string} [stats.cacheKey] - The cache key used.
 * @param {number} [stats.itemCount] - Number of items in the component (e.g., related posts count).
 */
export function useComponentTracking(componentId, stats) {
    useEffect(() => {
        if (!componentId || !stats || !stats.status || !stats.schemaType) {
            console.warn("useComponentTracking: Missing required props (componentId, status, schemaType).");
            return;
        }

        // Update component statistics in cacheManager
        cacheManager.updateComponentStat(componentId, {
            ...stats,
            timestamp: Date.now(), // Ensure timestamp is current when updated
        });

        // Cleanup: remove stat when component unmounts
        // Note: For article pages, components typically don't unmount until navigating away.
        // But it's good practice.
        return () => {
            // cacheManager.removeComponentStat(componentId); // Need to add this method to cacheManager
            // For now, we'll keep the stat, but it will be overwritten on next mount or cleaned by cleanup interval.
        };
    }, [componentId, stats.status, stats.isFromCache, stats.source, stats.hasUpdatesAvailable, stats.schemaType, stats.cacheKey, stats.itemCount]);
}
