// utils/cacheStorage.js

/**
 * Enhanced cache storage with compression and better error handling
 */

const STORAGE_PREFIX = 'advanced_cache_';
const COMPRESSION_THRESHOLD = 1024; // Compress if data > 1KB

class CacheStorage {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.fallbackCache = new Map(); // In-memory fallback
    }

    checkStorageAvailability() {
        try {
            if (typeof window === 'undefined') return false;
            const testKey = '__cache_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not available, using in-memory cache');
            return false;
        }
    }

    compressData(data) {
        try {
            const jsonString = JSON.stringify(data);
            if (jsonString.length < COMPRESSION_THRESHOLD) {
                return { data: jsonString, compressed: false };
            }
            // Simple compression using JSON.stringify with replacer
            return { data: jsonString, compressed: false }; // Keep simple for now
        } catch (e) {
            console.error('Compression failed:', e);
            return { data: JSON.stringify(data), compressed: false };
        }
    }

    decompressData(compressedData, compressed) {
        try {
            if (!compressed) {
                return JSON.parse(compressedData);
            }
            // Add decompression logic here if implementing compression
            return JSON.parse(compressedData);
        } catch (e) {
            console.error('Decompression failed:', e);
            return null;
        }
    }

    setItem(key, data, options = {}) {
        const now = Date.now();
        const ttl = options.ttl || (5 * 60 * 1000); // 5 minutes default
        
        const cacheItem = {
            data,
            timestamp: now,
            expires: now + ttl,
            version: '1.0',
            source: options.source || 'api',
            compressed: false,
            schemaType: options.schemaType,
            componentId: options.componentId
        };

        const { data: processedData, compressed } = this.compressData(cacheItem);
        cacheItem.compressed = compressed;

        const storageKey = STORAGE_PREFIX + key;

        if (this.isAvailable) {
            try {
                localStorage.setItem(storageKey, processedData);
                return true;
            } catch (e) {
                console.warn('localStorage setItem failed, using fallback:', e);
                this.fallbackCache.set(key, cacheItem);
                return true;
            }
        } else {
            this.fallbackCache.set(key, cacheItem);
            return true;
        }
    }

    getItem(key) {
        const storageKey = STORAGE_PREFIX + key;
        let cacheItem = null;

        if (this.isAvailable) {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    cacheItem = {
                        ...parsed,
                        data: this.decompressData(parsed.data, parsed.compressed)
                    };
                }
            } catch (e) {
                console.warn('localStorage getItem failed, checking fallback:', e);
            }
        }

        // Check fallback cache if localStorage failed or item not found
        if (!cacheItem && this.fallbackCache.has(key)) {
            cacheItem = this.fallbackCache.get(key);
        }

        if (!cacheItem) {
            return null;
        }

        // Check if expired
        if (Date.now() > cacheItem.expires) {
            this.removeItem(key); // Clean up expired item
            return null;
        }

        return cacheItem;
    }

    removeItem(key) {
        const storageKey = STORAGE_PREFIX + key;
        
        if (this.isAvailable) {
            try {
                localStorage.removeItem(storageKey);
            } catch (e) {
                console.warn('localStorage removeItem failed:', e);
            }
        }
        
        this.fallbackCache.delete(key);
    }

    clear() {
        if (this.isAvailable) {
            try {
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith(STORAGE_PREFIX)
                );
                keys.forEach(key => localStorage.removeItem(key));
            } catch (e) {
                console.warn('localStorage clear failed:', e);
            }
        }
        
        this.fallbackCache.clear();
    }

    cleanup() {
        const now = Date.now();
        
        // Clean up localStorage
        if (this.isAvailable) {
            try {
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith(STORAGE_PREFIX)
                );
                
                keys.forEach(key => {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (item && now > item.expires) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Remove corrupted items
                        localStorage.removeItem(key);
                    }
                });
            } catch (e) {
                console.warn('localStorage cleanup failed:', e);
            }
        }

        // Clean up fallback cache
        for (const [key, item] of this.fallbackCache.entries()) {
            if (now > item.expires) {
                this.fallbackCache.delete(key);
            }
        }
    }

    // Get storage info for debugging
    getStorageInfo() {
        const info = {
            isLocalStorageAvailable: this.isAvailable,
            fallbackCacheSize: this.fallbackCache.size,
            localStorageKeys: 0
        };

        if (this.isAvailable) {
            try {
                info.localStorageKeys = Object.keys(localStorage)
                    .filter(key => key.startsWith(STORAGE_PREFIX)).length;
            } catch (e) {
                info.localStorageKeys = 'unavailable';
            }
        }

        return info;
    }
}

const cacheStorage = new CacheStorage();
export default cacheStorage;