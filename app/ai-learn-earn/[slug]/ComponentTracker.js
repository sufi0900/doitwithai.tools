// components/ComponentTracker.js
"use client";


import React from 'react';
import { useComponentTracking } from './useComponentTracking'; // Adjust path as needed

/**
 * @typedef {import('../types/cacheTypes').CacheStatus} CacheStatus
 * @typedef {import('../types/cacheTypes').ComponentStat} ComponentStat
 */

/**
 * An invisible component to track and report component statistics to the cache manager.
 * Place this component around the content you want to track (e.g., main article body, related posts section).
 * It uses the `useComponentTracking` hook internally.
 * @param {object} props
 * @param {string} props.componentId - A unique identifier for this section/component (e.g., 'main-content', 'related-posts-section', 'related-resources-sidebar').
 * @param {string} props.schemaType - The Sanity schema type relevant to this component's data.
 * @param {CacheStatus} props.status - The current cache status of the data within this component.
 * @param {boolean} props.isFromCache - True if the data inside this component is from cache.
 * @param {string} props.source - The source of the data ('api' or 'cache').
 * @param {boolean} [props.hasUpdatesAvailable=false] - True if updates are detected for this component's data.
 * @param {string} [props.cacheKey] - The cache key used for this component's data.
 * @param {number} [props.itemCount] - Number of items in the component (e.g., number of related posts).
 * @param {React.ReactNode} props.children - The content to be wrapped and tracked.
 */
const ComponentTracker = ({
    children,
    componentId,
    schemaType,
    status,
    isFromCache,
    source,
    hasUpdatesAvailable = false,
    cacheKey,
    itemCount
}) => {
    // Pass all relevant stats to the tracking hook
    useComponentTracking(componentId, {
        status,
        isFromCache,
        source,
        hasUpdatesAvailable,
        schemaType,
        cacheKey,
        itemCount
    });

    return <>{children}</>;
};

export default ComponentTracker;
