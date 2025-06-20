// app/article-cache/ArticleCacheInvalidation.js
"use client";

import { ARTICLE_CACHE_KEYS, ARTICLE_CACHE_GROUPS } from './articleCacheKeys';

class ArticleCacheInvalidationService {
  constructor() {
    this.listeners = new Map();
    this.setupGlobalEventListeners();
  }

  setupGlobalEventListeners() {
    if (typeof window !== 'undefined') {
      // Listen for Sanity webhook updates (if you have webhooks set up)
      window.addEventListener('sanity-document-update', this.handleSanityUpdate.bind(this));
      
      // Listen for manual invalidation events
      window.addEventListener('manual-cache-invalidation', this.handleManualInvalidation.bind(this));
    }
  }

  // Invalidate entire article cache
  invalidateArticle(type, slug) {
    console.log(`🗑️ Invalidating entire article cache: ${type}/${slug}`);
    
    const allKeys = ARTICLE_CACHE_GROUPS.FULL_ARTICLE(type, slug);
    allKeys.forEach(key => {
      localStorage.removeItem(`article_cache_${key}`);
    });

    // Dispatch invalidation event
    this.dispatchInvalidationEvent('article', { type, slug, keys: allKeys });
    
    return allKeys.length;
  }

  // Invalidate specific article component
  invalidateArticleComponent(type, slug, component) {
    console.log(`🗑️ Invalidating article component: ${component} for ${type}/${slug}`);
    
    let cacheKey;
    switch (component) {
      case 'related-posts':
        cacheKey = ARTICLE_CACHE_KEYS.RELATED_POSTS(type, slug);
        break;
      case 'related-resources':
        cacheKey = ARTICLE_CACHE_KEYS.RELATED_RESOURCES(type, slug);
        break;
      case 'content':
        cacheKey = ARTICLE_CACHE_KEYS.ARTICLE_CONTENT(type, slug);
        break;
      case 'comments':
        cacheKey = ARTICLE_CACHE_KEYS.ARTICLE_COMMENTS(type, slug);
        break;
      default:
        console.warn(`Unknown component: ${component}`);
        return false;
    }

    localStorage.removeItem(`article_cache_${cacheKey}`);
    
    // Dispatch component-specific invalidation
    this.dispatchInvalidationEvent('component', { 
      type, 
      slug, 
      component, 
      cacheKey 
    });
    
    return true;
  }

  // Invalidate related content across multiple articles
  invalidateRelatedContent(type, slug) {
    console.log(`🗑️ Invalidating related content for: ${type}/${slug}`);
    
    const relatedKeys = ARTICLE_CACHE_GROUPS.RELATED_CONTENT(type, slug);
    relatedKeys.forEach(key => {
      localStorage.removeItem(`article_cache_${key}`);
    });

    this.dispatchInvalidationEvent('related-content', { type, slug, keys: relatedKeys });
    
    return relatedKeys.length;
  }

  // Invalidate by article type (all articles of same type)
  invalidateByType(type) {
    console.log(`🗑️ Invalidating all articles of type: ${type}`);
    
    const allKeys = Object.keys(localStorage);
    const typeKeys = allKeys.filter(key => 
      key.startsWith('article_cache_') && key.includes(`_${type}_`)
    );
    
    typeKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    this.dispatchInvalidationEvent('type', { type, count: typeKeys.length });
    
    return typeKeys.length;
  }

  // Smart invalidation based on update detection
  async smartInvalidate(type, slug, lastModified) {
    console.log(`🧠 Smart invalidation check for: ${type}/${slug}`);
    
    const contentKey = ARTICLE_CACHE_KEYS.ARTICLE_CONTENT(type, slug);
    const cached = this.getCachedItem(contentKey);
    
    if (!cached) {
      console.log('No cached content found, no invalidation needed');
      return false;
    }

    const cacheTime = new Date(cached.timestamp);
    const updateTime = new Date(lastModified);
    
    if (updateTime > cacheTime) {
      console.log('Update detected, invalidating article cache');
      return this.invalidateArticle(type, slug);
    }
    
    console.log('Cache is up to date');
    return false;
  }

  // Bulk invalidation for multiple articles
  bulkInvalidate(articles) {
    console.log(`🔄 Bulk invalidating ${articles.length} articles`);
    
    let totalInvalidated = 0;
    articles.forEach(({ type, slug }) => {
      totalInvalidated += this.invalidateArticle(type, slug);
    });
    
    this.dispatchInvalidationEvent('bulk', { 
      articles, 
      totalInvalidated 
    });
    
    return totalInvalidated;
  }

  // Get cached item helper
  getCachedItem(key) {
    try {
      const cached = localStorage.getItem(`article_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  // Dispatch custom invalidation events
  dispatchInvalidationEvent(type, data) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('cache-invalidated', {
        detail: { type, data, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    }
  }

  // Handle Sanity document updates
  handleSanityUpdate(event) {
    const { documentType, slug, _updatedAt } = event.detail || {};
    
    if (documentType && slug) {
      console.log(`📰 Sanity update received: ${documentType}/${slug}`);
      this.smartInvalidate(documentType, slug, _updatedAt);
    }
  }

  // Handle manual invalidation requests
  handleManualInvalidation(event) {
    const { type, slug, component } = event.detail || {};
    
    if (component) {
      this.invalidateArticleComponent(type, slug, component);
    } else {
      this.invalidateArticle(type, slug);
    }
  }

  // Register invalidation listener
  onInvalidation(callback) {
    const id = Math.random().toString(36).substr(2, 9);
    this.listeners.set(id, callback);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('cache-invalidated', callback);
    }
    
    return () => {
      this.listeners.delete(id);
      if (typeof window !== 'undefined') {
        window.removeEventListener('cache-invalidated', callback);
      }
    };
  }

  // Get cache statistics
  getInvalidationStats() {
    if (typeof window === 'undefined') return { totalKeys: 0, articleKeys: 0 };
    
    const allKeys = Object.keys(localStorage);
    const articleKeys = allKeys.filter(key => key.startsWith('article_cache_'));
    
    return {
      totalKeys: allKeys.length,
      articleKeys: articleKeys.length,
      articleCacheSize: articleKeys.reduce((size, key) => {
        return size + (localStorage.getItem(key)?.length || 0);
      }, 0)
    };
  }

  // Clear all article caches
  clearAllArticleCaches() {
    if (typeof window === 'undefined') return 0;
    
    const allKeys = Object.keys(localStorage);
    const articleKeys = allKeys.filter(key => key.startsWith('article_cache_'));
    
    articleKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.dispatchInvalidationEvent('clear-all', { 
      clearedKeys: articleKeys.length 
    });
    
    console.log(`🧹 Cleared ${articleKeys.length} article cache entries`);
    return articleKeys.length;
  }
}

// Create singleton instance
const articleCacheInvalidation = new ArticleCacheInvalidationService();

export default articleCacheInvalidation;

// Named exports for convenience
export const {
  invalidateArticle,
  invalidateArticleComponent,
  invalidateRelatedContent,
  invalidateByType,
  smartInvalidate,
  bulkInvalidate,
  clearAllArticleCaches,
  onInvalidation
} = articleCacheInvalidation;