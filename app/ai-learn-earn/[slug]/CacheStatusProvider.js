"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {object} CacheStatusContextType
 * @property {boolean} isBrowserOnline - Current online status of the browser.
 */

/** @type {React.Context<CacheStatusContextType | undefined>} */
const CacheStatusContext = createContext(undefined);

/**
 * Custom hook to consume the CacheStatusContext.
 * @returns {CacheStatusContextType}
 */
export function useCacheStatus() {
    const context = useContext(CacheStatusContext);
    if (context === undefined) {
        throw new Error('useCacheStatus must be used within a CacheStatusProvider');
    }
    return context;
}

/**
 * Provider component for global cache status, mainly network connectivity.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 */
export function CacheStatusProvider({ children }) {
    const [isBrowserOnline, setIsBrowserOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => setIsBrowserOnline(true);
        const handleOffline = () => setIsBrowserOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const contextValue = {
        isBrowserOnline,
    };

    return (
        <CacheStatusContext.Provider value={contextValue}>
            {children}
        </CacheStatusContext.Provider>
    );
}
