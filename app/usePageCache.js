import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export const usePageCache = () => {
    const router = useRouter();
    const previousPath = useRef('');
    
    useEffect(() => {
        const cacheCurrentPage = async () => {
            if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
                return;
            }
            
            try {
                const currentPath = window.location.pathname;
                
                // Don't cache the same page twice in a row
                if (currentPath === previousPath.current) {
                    return;
                }
                
                previousPath.current = currentPath;
                
                // Wait a bit for the page to fully load
                setTimeout(async () => {
                    try {
                        // Get the current page HTML
                        const response = await fetch(currentPath, {
                            method: 'GET',
                            headers: {
                                'Accept': 'text/html',
                            },
                        });
                        
                        if (response.ok) {
                            const htmlContent = await response.text();
                            
                            // Try to get API data if it's a dynamic page
                            let apiData = null;
                            try {
                                apiData = await getCurrentPageData(currentPath);
                            } catch (e) {
                                console.log('No API data found for:', currentPath);
                            }
                            
                            // Send to service worker for caching
                            if (navigator.serviceWorker.controller) {
                                navigator.serviceWorker.controller.postMessage({
                                    type: 'CACHE_PAGE',
                                    url: currentPath,
                                    htmlContent,
                                    apiData
                                });
                                
                                console.log('Cached page via navigation:', currentPath);
                            }
                        }
                    } catch (error) {
                        console.log('Failed to cache page on navigation:', error);
                    }
                }, 2000); // Wait 2 seconds for page to fully load
                
            } catch (error) {
                console.log('Page caching error:', error);
            }
        };
        
        // Cache on route change
        router.events.on('routeChangeComplete', cacheCurrentPage);
        
        // Also cache on initial load
        cacheCurrentPage();
        
        return () => {
            router.events.off('routeChangeComplete', cacheCurrentPage);
        };
    }, [router]);
};

// Helper function to get current page data
const getCurrentPageData = async (pathname) => {
    // Define API endpoints for different pages
    const pageDataMap = {
        '/ai-tools': () => fetch('/api/posts?category=aitool').then(r => r.json()),
        '/ai-seo': () => fetch('/api/posts?category=SEO').then(r => r.json()),
        '/ai-code': () => fetch('/api/posts?category=coding').then(r => r.json()),
        '/ai-learn-earn': () => fetch('/api/posts?category=makemoney').then(r => r.json()),
    };
    
    // Check if it's a dynamic route
    if (pathname.includes('/ai-tools/') || pathname.includes('/ai-seo/') || 
        pathname.includes('/ai-code/') || pathname.includes('/ai-learn-earn/')) {
        const slug = pathname.split('/').pop();
        if (slug) {
            return await fetch(`/api/posts/${slug}`).then(r => r.json());
        }
    }
    
    // Check if it's a category page
    const dataFetcher = pageDataMap[pathname];
    if (dataFetcher) {
        return await dataFetcher();
    }
    
    return null;
};