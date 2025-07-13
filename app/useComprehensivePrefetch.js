import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '@/sanity/lib/client';
import { cacheSystem } from '@/React_Query_Caching/cacheSystem';

export const useComprehensivePrefetch = () => {
  const [prefetchStatus, setPrefetchStatus] = useState({
    isActive: false,
    progress: 0,
    totalPages: 0,
    currentPage: '',
    errors: [],
    completed: false
  });

  const abortControllerRef = useRef(null);
  const prefetchedPagesRef = useRef(new Set());

  // Prefetch all static pages
  const prefetchStaticPages = useCallback(async (pages, onProgress) => {
    const results = [];
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      try {
        onProgress?.(page.url, i + 1, pages.length);
        
        // Prefetch page HTML
        const response = await fetch(page.url, {
          mode: 'same-origin',
          credentials: 'same-origin',
          headers: { 'X-Prefetch': 'true' }
        });
        
        if (response.ok) {
          // Also prefetch Next.js data if not homepage
          if (page.url !== '/') {
            try {
              await fetch(`/_next/data/${process.env.NEXT_PUBLIC_BUILD_ID || 'build'}${page.url === '/' ? '/index' : page.url}.json`, {
                mode: 'same-origin',
                credentials: 'same-origin'
              });
            } catch (dataError) {
              console.warn('Failed to prefetch data for:', page.url);
            }
          }
          
          prefetchedPagesRef.current.add(page.url);
          results.push({ url: page.url, status: 'success' });
        } else {
          results.push({ url: page.url, status: 'failed', error: 'HTTP ' + response.status });
        }
      } catch (error) {
        results.push({ url: page.url, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }, []);

  // Prefetch all posts for each category
  const prefetchCategoryContent = useCallback(async (categories, onProgress) => {
    const results = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      try {
        onProgress?.(category, i + 1, categories.length);
        
        // Fetch all posts for this category
        const query = `*[_type == "${category}"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          author,
          tags,
          category,
          content,
          image,
          "imageUrl": image.asset->url
        }`;
        
        const posts = await client.fetch(query);
        
        // Store in cache system
        const cacheKey = cacheSystem.generateCacheKey(`posts-${category}`, query);
        await cacheSystem.set(cacheKey, posts, {
          keyIdentifier: `posts-${category}`,
          staleTime: 1000 * 60 * 30, // 30 minutes
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          enableOffline: true,
          group: 'posts'
        });
        
        // Prefetch individual post pages
        for (const post of posts.slice(0, 20)) { // Limit to first 20 posts
          const postUrl = `/${getCategoryPath(category)}/${post.slug.current}`;
          
          try {
            await fetch(postUrl, {
              mode: 'same-origin',
              credentials: 'same-origin',
              headers: { 'X-Prefetch': 'true' }
            });
            
            // Cache individual post data
            const postCacheKey = cacheSystem.generateCacheKey(`post-${post.slug.current}`, post._id);
            await cacheSystem.set(postCacheKey, post, {
              keyIdentifier: `post-${post.slug.current}`,
              staleTime: 1000 * 60 * 60, // 1 hour
              maxAge: 1000 * 60 * 60 * 24, // 24 hours
              enableOffline: true,
              group: 'individual-posts'
            });
            
            prefetchedPagesRef.current.add(postUrl);
          } catch (error) {
            console.warn('Failed to prefetch post:', postUrl, error);
          }
        }
        
        results.push({ category, status: 'success', postsCount: posts.length });
      } catch (error) {
        results.push({ category, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }, []);

  // Helper function to get category path
  const getCategoryPath = (category) => {
    const categoryPaths = {
      'aitool': 'ai-tools',
      'SEO': 'ai-seo',
      'coding': 'ai-code',
      'makemoney': 'ai-learn-earn'
    };
    return categoryPaths[category] || category;
  };

  // Main prefetch function
  const startComprehensivePrefetch = useCallback(async () => {
    if (prefetchStatus.isActive) return;
    
    setPrefetchStatus(prev => ({ ...prev, isActive: true, progress: 0, errors: [], completed: false }));
    
    try {
      // Fetch pages manifest
      const manifestResponse = await fetch('/pages-manifest.json');
      const manifest = await manifestResponse.json();
      
      const allPages = [...manifest.static_pages, ...manifest.dynamic_pages];
      const categories = ['makemoney', 'aitool', 'coding', 'SEO'];
      
      const totalSteps = allPages.length + categories.length;
      let currentStep = 0;
      
      setPrefetchStatus(prev => ({ ...prev, totalPages: totalSteps }));
      
      // Prefetch static pages
      await prefetchStaticPages(allPages, (currentPage, step, total) => {
        currentStep++;
        setPrefetchStatus(prev => ({
          ...prev,
          currentPage,
          progress: (currentStep / totalSteps) * 100
        }));
      });
      
      // Prefetch category content
      await prefetchCategoryContent(categories, (currentCategory, step, total) => {
        currentStep++;
        setPrefetchStatus(prev => ({
          ...prev,
          currentPage: `Category: ${currentCategory}`,
          progress: (currentStep / totalSteps) * 100
        }));
      });
      
      // Notify service worker about completion
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_COMPLETED',
          prefetchedPages: Array.from(prefetchedPagesRef.current)
        });
      }
      
      setPrefetchStatus(prev => ({
        ...prev,
        isActive: false,
        progress: 100,
        completed: true,
        currentPage: 'Completed'
      }));
      
    } catch (error) {
      setPrefetchStatus(prev => ({
        ...prev,
        isActive: false,
        errors: [...prev.errors, error.message]
      }));
    }
  }, [prefetchStatus.isActive, prefetchStaticPages, prefetchCategoryContent]);

  // Auto-start prefetch on component mount (with delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.onLine && !prefetchStatus.completed) {
        startComprehensivePrefetch();
      }
    }, 5000); // Start after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Stop prefetch
  const stopPrefetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPrefetchStatus(prev => ({ ...prev, isActive: false }));
  }, []);

  return {
    prefetchStatus,
    startComprehensivePrefetch,
    stopPrefetch,
    prefetchedPages: Array.from(prefetchedPagesRef.current)
  };
};