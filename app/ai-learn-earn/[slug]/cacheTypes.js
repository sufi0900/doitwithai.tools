/**
 * @typedef {'fresh' | 'cached' | 'updates-available' | 'offline'} CacheStatus
 */

/**
 * @typedef {object} CacheItemMetadata
 * @property {number} timestamp - When the item was cached.
 * @property {number} expires - When the cache item expires.
 * @property {string} version - Version of the cache item.
 * @property {'api' | 'cache'} source - Where the data came from (API or cache).
 * @property {boolean} compressed - Whether the data is compressed.
 * @property {string} [schemaType] - Sanity schema type (e.g., 'aitool').
 * @property {string} [componentId] - ID of the component that requested this cache (e.g., 'main-content', 'related-posts').
 */

/**
 * @typedef {object} ComponentStat
 * @property {CacheStatus} status - Current cache status of the component.
 * @property {number} timestamp - Last time this component's data was updated/checked.
 * @property {boolean} isFromCache - True if data is currently served from cache.
 * @property {string} source - Source of the data ('api' or 'cache').
 * @property {string} [cacheKey] - The cache key used for this component.
 * @property {boolean} hasUpdatesAvailable - Whether updates are detected for this component's data.
 * @property {string} schemaType - The Sanity schema type associated with this component's data.
 * @property {number} [itemCount] - Number of items in the component's data (e.g., number of related posts).
 */

/**
 * @typedef {object} GlobalCacheStats
 * @property {number} total - Total number of tracked components.
 * @property {number} fresh - Number of components with 'fresh' status.
 * @property {number} cached - Number of components with 'cached' status.
 * @property {number} updatesAvailable - Number of components with 'updates-available' status.
 * @property {number} offline - Number of components with 'offline' status.
 * @property {boolean} isCompletelyOffline - True if browser is offline or any component is offline.
 * @property {boolean} hasRecentlyFreshData - True if any component's data was recently fetched from API.
 * @property {boolean} isBrowserOnline - Current browser online status.
 */

/**
 * @callback RefreshFunction
 * @returns {Promise<void>}
 */

/**
 * @typedef {object} ArticleCacheContextType
 * @property {Map<string, ComponentStat>} componentStats - Map of all tracked component statistics.
 * @property {GlobalCacheStats} globalStats - Summary statistics of all components.
 * @property {RefreshFunction} refreshAllComponents - Function to trigger refresh for all components.
 * @property {RefreshFunction | null} refreshArticleContent - Function to refresh main article content.
 * @property {RefreshFunction | null} refreshRelatedPosts - Function to refresh related posts.
 * @property {RefreshFunction | null} refreshRelatedResources - Function to refresh related resources.
 * @property {boolean} isRefreshingAnyComponent - True if any component is currently refreshing.
 * @property {boolean} isPollingActive - True if polling for updates is active.
 * @property {boolean} hasUpdatesAvailableGlobally - True if any schema type has detected updates.
 */

// We don't export anything from here as these are just JSDoc types.
// They are used by other files for type hinting.
