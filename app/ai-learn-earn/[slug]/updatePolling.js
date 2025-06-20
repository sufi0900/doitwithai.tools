/*** Smart polling system for detecting Sanity CMS updates */
import { client } from "@/sanity/lib/client"; // Ensure this path is correct for your Sanity client
import cacheManager from './cacheManager'; // Import cacheManager to trigger updates

const POLLING_INTERVAL = 15 * 1000; // 15 seconds
const MAX_BACKOFF = 5 * 60 * 1000; // 5 minutes max backoff
const INITIAL_BACKOFF = 1000; // 1 second initial backoff

class UpdatePollingManager {
    constructor() {
        this.pollers = new Map();
        this.lastKnownCounts = new Map();
        this.lastKnownTimestamps = new Map(); // Store last known _updatedAt timestamps
        this.backoffDelays = new Map();
        this.errorCounts = new Map();
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        if (typeof window === 'undefined') return;
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Network back online - resuming polling');
            this.resumeAllPolling();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Network offline - pausing polling');
            this.pauseAllPolling();
        });
        // Pause polling when page is hidden to save resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllPolling();
            } else {
                this.resumeAllPolling();
            }
        });
    }

    /**
     * Creates a unique poller for a schema type.
     * @param {string} schemaType - The Sanity schema type to poll (e.g., 'aitool').
     * @param {object} [options={}] - Poller configuration options.
     * @param {number} [options.interval] - Custom polling interval.
     * @param {Function} [options.onUpdate] - Callback when an update is detected.
     * @param {Function} [options.onError] - Callback on polling error.
     * @param {string[]} [options.includeFields] - Fields to include in the latest document query.
     * @param {object} [options.filters] - Additional GROQ filters.
     * @returns {string} The poller ID.
     */
    createPoller(schemaType, options = {}) {
        // Use schemaType as the pollerId for simplicity as we only need one poller per schemaType
        const pollerId = schemaType;
        if (this.pollers.has(pollerId)) {
            console.warn(`Poller for schemaType ${schemaType} already exists. Returning existing poller ID.`);
            return pollerId;
        }

        const pollerConfig = {
            schemaType,
            interval: options.interval || POLLING_INTERVAL,
            onUpdate: options.onUpdate || (() => {}),
            onError: options.onError || ((error) => console.error('Polling error:', error)),
            includeFields: options.includeFields || ['_id', '_updatedAt', '_createdAt'],
            filters: options.filters || {},
            active: true,
            intervalId: null,
        };
        this.pollers.set(pollerId, pollerConfig);
        this.initializePoller(pollerId);
        return pollerId;
    }

    /**
     * Initializes poller with first count/timestamp check.
     * @param {string} pollerId - The ID of the poller.
     */
    async initializePoller(pollerId) {
        const poller = this.pollers.get(pollerId);
        if (!poller) return;
        try {
            const [initialCount, latestDoc] = await Promise.all([
                this.getSchemaCount(poller.schemaType, poller.filters),
                this.getLatestDocument(poller.schemaType, poller.filters)
            ]);
            this.lastKnownCounts.set(pollerId, initialCount);
            if (latestDoc && latestDoc._updatedAt) {
                this.lastKnownTimestamps.set(pollerId, new Date(latestDoc._updatedAt).getTime());
            } else {
                this.lastKnownTimestamps.set(pollerId, 0); // No documents or no _updatedAt
            }
            this.startPolling(pollerId);
        } catch (error) {
            console.error(`Failed to initialize poller for ${poller.schemaType}:`, error);
            poller.onError(error);
        }
    }

    /**
     * Starts polling for a specific poller.
     * @param {string} pollerId - The ID of the poller.
     */
    startPolling(pollerId) {
        const poller = this.pollers.get(pollerId);
        if (!poller || !poller.active) return;

        // Clear any existing interval
        if (poller.intervalId) {
            clearInterval(poller.intervalId);
        }

        const currentBackoff = this.backoffDelays.get(pollerId) || poller.interval;
        poller.intervalId = setInterval(async () => {
            if (!this.isOnline || document.hidden) {
                return; // Skip polling when offline or page hidden
            }
            await this.checkForUpdates(pollerId);
        }, currentBackoff);
        this.pollers.set(pollerId, poller);
    }

    /**
     * Pauses all active pollers.
     */
    pauseAllPolling() {
        this.pollers.forEach(poller => {
            if (poller.intervalId) {
                clearInterval(poller.intervalId);
                poller.intervalId = null;
            }
        });
    }

    /**
     * Resumes all paused pollers.
     */
    resumeAllPolling() {
        this.pollers.forEach((poller, pollerId) => {
            if (!poller.intervalId) { // Only resume if not already active
                this.startPolling(pollerId);
                // Reset backoff on resume if coming from offline/hidden state
                this.backoffDelays.delete(pollerId);
                this.errorCounts.delete(pollerId);
            }
        });
    }

    /**
     * Stops a specific poller.
     * @param {string} pollerId - The ID of the poller to stop.
     */
    stopPoller(pollerId) {
        const poller = this.pollers.get(pollerId);
        if (poller && poller.intervalId) {
            clearInterval(poller.intervalId);
            poller.intervalId = null;
            poller.active = false;
        }
        this.pollers.delete(pollerId);
        this.lastKnownCounts.delete(pollerId);
        this.lastKnownTimestamps.delete(pollerId);
        this.backoffDelays.delete(pollerId);
        this.errorCounts.delete(pollerId);
    }

    /**
     * Gets the document count for a given schema type with optional filters.
     * @param {string} schemaType - The Sanity schema type.
     * @param {object} [filters={}] - Additional GROQ filters.
     * @returns {Promise<number>} The count of documents.
     */
    async getSchemaCount(schemaType, filters = {}) {
        const filterQuery = Object.keys(filters).map(key => `${key} == "${filters[key]}"`).join(' && ');
        const query = `count(*[_type == "${schemaType}"${filterQuery ? ` && ${filterQuery}` : ''}])`;
        try {
            const count = await client.fetch(query, {}, { cache: 'no-store' });
            return count;
        } catch (error) {
            console.error(`Error fetching count for ${schemaType}:`, error);
            throw error;
        }
    }

    /**
     * Gets the latest document for a given schema type based on _updatedAt, with optional filters.
     * @param {string} schemaType - The Sanity schema type.
     * @param {object} [filters={}] - Additional GROQ filters.
     * @returns {Promise<object | null>} The latest document or null.
     */
    async getLatestDocument(schemaType, filters = {}) {
        const filterQuery = Object.keys(filters).map(key => `${key} == "${filters[key]}"`).join(' && ');
        const query = `*[_type == "${schemaType}"${filterQuery ? ` && ${filterQuery}` : ''}] | order(_updatedAt desc)[0]{_id, _updatedAt}`;
        try {
            const doc = await client.fetch(query, {}, { cache: 'no-store' });
            return doc;
        } catch (error) {
            console.error(`Error fetching latest document for ${schemaType}:`, error);
            throw error;
        }
    }

    /**
     * Checks for updates by comparing document counts and timestamps.
     * @param {string} pollerId - The ID of the poller.
     * @returns {Promise<boolean>} True if updates are detected.
     */
    async checkForUpdates(pollerId) {
        const poller = this.pollers.get(pollerId);
        if (!poller) return false;

        try {
            // Get current count and latest document timestamp
            const [currentCount, latestDoc] = await Promise.all([
                this.getSchemaCount(poller.schemaType, poller.filters),
                this.getLatestDocument(poller.schemaType, poller.filters)
            ]);

            const lastKnownCount = this.lastKnownCounts.get(pollerId) || 0;
            const lastKnownTimestamp = this.lastKnownTimestamps.get(pollerId) || 0;

            const hasCountChanged = currentCount !== lastKnownCount;
            let hasTimestampChanged = false;

            if (latestDoc && latestDoc._updatedAt) {
                const currentLatestTimestamp = new Date(latestDoc._updatedAt).getTime();
                hasTimestampChanged = currentLatestTimestamp > lastKnownTimestamp;
            } else if (currentCount > 0 && lastKnownCount === 0) {
                 // If documents appeared where there were none, and no _updatedAt, consider it an update
                hasTimestampChanged = true;
            }


            const hasUpdates = hasCountChanged || hasTimestampChanged;

            if (hasUpdates) {
                console.log(`Updates detected for ${poller.schemaType}:`, {
                    countChanged: hasCountChanged,
                    oldCount: lastKnownCount,
                    currentCount: currentCount,
                    timestampChanged: hasTimestampChanged,
                    oldTimestamp: lastKnownTimestamp ? new Date(lastKnownTimestamp).toISOString() : 'N/A',
                    currentTimestamp: latestDoc?._updatedAt ? new Date(new Date(latestDoc._updatedAt).getTime()).toISOString() : 'N/A'
                });
                poller.onUpdate(poller.schemaType, true); // Notify update for this schema type
                // Update last known values ONLY after successful notification
                this.lastKnownCounts.set(pollerId, currentCount);
                if (latestDoc && latestDoc._updatedAt) {
                    this.lastKnownTimestamps.set(pollerId, new Date(latestDoc._updatedAt).getTime());
                } else if (currentCount === 0) {
                    this.lastKnownTimestamps.set(pollerId, 0); // No documents, reset timestamp
                }
                this.errorCounts.delete(pollerId); // Reset error count on success
                this.backoffDelays.delete(pollerId); // Reset backoff on success
                // Restart polling with normal interval if backoff was applied
                if (poller.intervalId) {
                    clearInterval(poller.intervalId);
                    this.startPolling(pollerId);
                }
            } else {
                poller.onUpdate(poller.schemaType, false); // Notify no updates
            }

            return hasUpdates;
        } catch (error) {
            console.error(`Polling check failed for ${poller.schemaType}:`, error);
            poller.onError(error);
            this.handlePollingError(pollerId);
            return false;
        }
    }

    /**
     * Handles polling errors by applying exponential backoff.
     * @param {string} pollerId - The ID of the poller that errored.
     */
    handlePollingError(pollerId) {
        const poller = this.pollers.get(pollerId);
        if (!poller) return;

        let currentErrorCount = (this.errorCounts.get(pollerId) || 0) + 1;
        this.errorCounts.set(pollerId, currentErrorCount);

        let newBackoff = INITIAL_BACKOFF * Math.pow(2, currentErrorCount - 1);
        newBackoff = Math.min(newBackoff, MAX_BACKOFF);

        this.backoffDelays.set(pollerId, newBackoff);
        console.warn(`Polling for ${poller.schemaType} failed. Retrying in ${newBackoff / 1000}s. Error count: ${currentErrorCount}`);

        // Restart polling with the new backoff
        if (poller.intervalId) {
            clearInterval(poller.intervalId);
            this.startPolling(pollerId);
        }
    }
}

// Singleton instance
const updatePollingManager = new UpdatePollingManager();
export default updatePollingManager;

// Export individual methods for convenience
export const createPoller = updatePollingManager.createPoller.bind(updatePollingManager);
export const stopPoller = updatePollingManager.stopPoller.bind(updatePollingManager);
export const pauseAllPolling = updatePollingManager.pauseAllPolling.bind(updatePollingManager);
export const resumeAllPolling = updatePollingManager.resumeAllPolling.bind(updatePollingManager);
export const getSchemaCount = updatePollingManager.getSchemaCount.bind(updatePollingManager);
export const getLatestDocument = updatePollingManager.getLatestDocument.bind(updatePollingManager);
export const checkForUpdates = updatePollingManager.checkForUpdates.bind(updatePollingManager);