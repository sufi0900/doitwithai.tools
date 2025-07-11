"use client";
import { useEffect, useState, useCallback } from 'react';

export default function ServiceWorkerRegistration() {
    const [mounted, setMounted] = useState(false);
    const [swStatus, setSwStatus] = useState('checking');

    // State for initial mount/hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Helper to send messages to Service Worker ---
    const sendSWMessage = useCallback((type, payload) => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type, ...payload });
        }
    }, []);

    // --- Initial Service Worker Registration and Setup ---
    useEffect(() => {
        if (!mounted) return;

        const registerSW = async () => {
            if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
                console.log('Service Worker not supported in this environment.');
                setSwStatus('unsupported');
                return;
            }

            try {
                // Ensure the DOM is fully loaded and React is likely hydrated
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        setTimeout(resolve, 500); // Small delay to ensure React takes over
                    } else {
                        window.addEventListener('load', () => setTimeout(resolve, 500), { once: true });
                    }
                });

                // Check for existing registration and update if present
                const existingRegistration = await navigator.serviceWorker.getRegistration();
                if (existingRegistration) {
                    console.log('SW: Existing registration found. Attempting update...');
                    await existingRegistration.update();
                    setSwStatus('updated');
                }

                // Register the service worker
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none' // Important for controlling updates via SW activation
                });

                console.log('✅ Service Worker registered:', registration);
                setSwStatus('registered');

                // Listen for updatefound event on the registration
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('SW: New version available and installed.');
                                setSwStatus('update-available');
                                // Prompt user to reload if a new SW is waiting
                                if (window.confirm('A new version of the app is available! Reload to get the latest features?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    }
                });

                // Handle controller change (e.g., after a new SW activates)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('SW: Controller changed. Reloading page...');
                    window.location.reload();
                });

                // Listen for messages from the service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('SW Message from worker:', event.data);
                    if (event.data.type === 'CACHE_UPDATED') {
                        console.log('Client: Cache updated for:', event.data.url);
                    }
                });

                // --- Initial precaching of important pages ---
                // Send messages to the SW to precache these URLs
                const importantPages = [
                    '/', '/offline.html', // Ensure offline.html is precached
                    '/ai-tools', '/ai-seo', '/ai-code', '/ai-learn-earn',
                    '/free-ai-resources', '/ai-news', '/about', '/faq',
                    '/contact', '/privacy', '/terms'
                ];

                const currentPath = window.location.pathname;
                if (!importantPages.includes(currentPath)) {
                    importantPages.push(currentPath);
                }

                importantPages.forEach(page => {
                    sendSWMessage('PRECACHE_PAGE', { path: page });
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
                setSwStatus('failed');
            }
        };

        registerSW();
    }, [mounted, sendSWMessage]); // Depend on mounted and sendSWMessage

    // --- Handle Client-Side Navigation Caching ---
    useEffect(() => {
        if (!mounted) return;

        let lastPath = window.location.pathname;

        const handleNavigationChange = () => {
            const newPath = window.location.pathname;
            if (newPath !== lastPath) {
                console.log('Client: Navigation detected to:', newPath);
                // Send message to SW to precache the new page
                sendSWMessage('PRECACHE_PAGE', { path: newPath });
                lastPath = newPath;
            }
        };

        // Observe DOM for changes (often triggered by Next.js client-side routing)
        const observer = new MutationObserver(handleNavigationChange);
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for browser's back/forward buttons
        window.addEventListener('popstate', handleNavigationChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('popstate', handleNavigationChange);
        };
    }, [mounted, sendSWMessage]); // Depend on mounted and sendSWMessage

    // --- Global Cache Update Function (if needed by other components) ---
    useEffect(() => {
        if (mounted) {
            window.updateSWCache = (url, data) => sendSWMessage('CACHE_UPDATE', { url, data });
        }
        // Cleanup global function on unmount (though usually not necessary for SW registration)
        return () => {
            if (mounted) {
                delete window.updateSWCache;
            }
        };
    }, [mounted, sendSWMessage]);


    // Don't render anything during SSR or if not mounted
    if (!mounted) return null;

    // Optional: Show SW status indicator in development
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: getStatusColor(swStatus),
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 9999
            }}>
                SW: {swStatus}
            </div>
        );
    }

    return null;
}

