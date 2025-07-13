// 2. Create: components/StaticContentPrefetcher.js
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useCacheContext } from '@/React_Query_Caching/CacheProvider';

export default function StaticContentPrefetcher() {
  const { isOnline } = useCacheContext();
  const [prefetchStatus, setPrefetchStatus] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
    lastRun: null
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefetchStaticContent = useCallback(async () => {
    if (!mounted || !isOnline) return;

    setPrefetchStatus(prev => ({ ...prev, inProgress: true }));
    
    try {
      // Fetch pages manifest
      const manifestResponse = await fetch('/pages-manifest.json');
      const manifest = await manifestResponse.json();
      
      const { static_pages } = manifest;
      setPrefetchStatus(prev => ({ ...prev, total: static_pages.length }));

      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const sortedPages = static_pages.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      let completed = 0;
      let failed = 0;

      // Prefetch pages with controlled concurrency
      const prefetchBatch = async (pages, batchSize = 3) => {
        for (let i = 0; i < pages.length; i += batchSize) {
          const batch = pages.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (page) => {
            try {
              // Prefetch HTML page
              const htmlResponse = await fetch(page.url, {
                mode: 'same-origin',
                credentials: 'same-origin',
                headers: {
                  'X-Purpose': 'prefetch-static-content'
                }
              });

              if (htmlResponse.ok) {
                console.log(`✅ Prefetched: ${page.url}`);
                
                // Also prefetch Next.js data if not homepage
                if (page.url !== '/') {
                  try {
                    await fetch(`/_next/data/${process.env.NEXT_PUBLIC_BUILD_ID || 'build'}${page.url === '/' ? '/index' : page.url}.json`, {
                      mode: 'same-origin',
                      credentials: 'same-origin'
                    });
                  } catch (dataError) {
                    console.log(`Data prefetch failed for ${page.url}:`, dataError);
                  }
                }
                
                return { success: true, page };
              } else {
                throw new Error(`HTTP ${htmlResponse.status}`);
              }
            } catch (error) {
              console.warn(`❌ Failed to prefetch ${page.url}:`, error);
              return { success: false, page, error };
            }
          });

          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach(result => {
            if (result.status === 'fulfilled') {
              if (result.value.success) {
                completed++;
              } else {
                failed++;
              }
            } else {
              failed++;
            }
          });

          setPrefetchStatus(prev => ({
            ...prev,
            completed,
            failed
          }));

          // Small delay between batches to avoid overwhelming the server
          if (i + batchSize < pages.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      };

      await prefetchBatch(sortedPages);

      // Notify service worker about prefetch completion
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_COMPLETED',
          stats: { completed, failed, total: static_pages.length }
        });
      }

      setPrefetchStatus(prev => ({
        ...prev,
        inProgress: false,
        lastRun: new Date().toISOString()
      }));

      console.log(`🎉 Static content prefetch completed: ${completed} success, ${failed} failed`);
      
    } catch (error) {
      console.error('❌ Static content prefetch failed:', error);
      setPrefetchStatus(prev => ({
        ...prev,
        inProgress: false,
        failed: prev.failed + 1
      }));
    }
  }, [mounted, isOnline]);

  // Auto-start prefetch when component mounts and user is online
  useEffect(() => {
    if (!mounted || !isOnline) return;

    // Check if prefetch was already done recently
    const lastPrefetch = localStorage.getItem('staticContentPrefetch');
    const shouldPrefetch = !lastPrefetch || 
      (Date.now() - parseInt(lastPrefetch)) > 24 * 60 * 60 * 1000; // 24 hours

    if (shouldPrefetch) {
      // Delay prefetch to avoid interfering with initial page load
      const timeout = setTimeout(() => {
        prefetchStaticContent();
        localStorage.setItem('staticContentPrefetch', Date.now().toString());
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [mounted, isOnline, prefetchStaticContent]);

  if (!mounted) return null;

  // Development status indicator
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '60px',
        right: '10px',
        background: prefetchStatus.inProgress ? '#2196F3' : '#4CAF50',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        zIndex: 9999,
        cursor: 'pointer'
      }} onClick={prefetchStaticContent}>
        {prefetchStatus.inProgress ? 
          `Prefetching: ${prefetchStatus.completed}/${prefetchStatus.total}` :
          `Prefetch: ${prefetchStatus.completed} cached`
        }
      </div>
    );
  }

  return null;
}