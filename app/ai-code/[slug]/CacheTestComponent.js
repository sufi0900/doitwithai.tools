'use client';
import React, { useState, useEffect } from 'react';

export default function CacheStatusTest({ cacheKey, query, params, schemaType }) {
  const [status, setStatus] = useState({
    redis: 'checking...',
    memory: 'checking...',
    indexedDB: 'checking...',
    network: 'checking...'
  });
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runCacheTest = async () => {
    setIsLoading(true);
    const results = [];
    const startTime = Date.now();

    try {
      // Test Redis (via API)
      const redisStart = Date.now();
      const redisResponse = await fetch('/api/unified-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cacheKey, query, params, options: {} })
      });
      const redisData = await redisResponse.json();
      const redisTime = Date.now() - redisStart;
      
      results.push({
        type: 'Redis',
        time: redisTime,
        source: redisData.source,
        success: redisResponse.ok,
        fromCache: redisData.fromCache,
        hasData: !!redisData.data
      });

      // Test Memory Cache - Fix the access pattern
      const memoryStart = Date.now();
      let memoryHit = false;
      let memoryHasData = false;
      
      if (typeof window !== 'undefined' && window.cacheSystem) {
        try {
          // Generate the same cache key that useUnifiedSanityCache would use
          const { cacheSystem } = await import('@/React_Query_Caching/cacheSystem');
          const { CACHE_KEYS } = await import('@/React_Query_Caching/cacheKeys');
          
          // Try to get the main article cache key
          const slug = params.currentSlug || params.slug;
          const articleCacheKey = CACHE_KEYS.ARTICLE.CONTENT(slug, schemaType);
          const fullCacheKey = cacheSystem.generateCacheKey(articleCacheKey, query);
          
          const memoryResult = await cacheSystem.get(fullCacheKey, {
            staleTime: 5 * 60 * 1000,
            maxAge: 30 * 60 * 1000,
            enableOffline: true,
            query: query,
            params: params,
            keyIdentifier: articleCacheKey,
            group: null,
          });
          
          memoryHit = memoryResult && memoryResult.data !== null;
          memoryHasData = memoryHit;
        } catch (error) {
          console.error('Memory cache test error:', error);
        }
      }
      
      const memoryTime = Date.now() - memoryStart;
      results.push({
        type: 'Memory',
        time: memoryTime,
        source: 'memory',
        success: true,
        fromCache: memoryHit,
        hasData: memoryHasData
      });

      // Test IndexedDB - Fix the access pattern
      const idbStart = Date.now();
      let idbHit = false;
      let idbHasData = false;
      
      try {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          const { get } = await import('idb-keyval');
          const { cacheSystem } = await import('@/React_Query_Caching/cacheSystem');
          const { CACHE_KEYS } = await import('@/React_Query_Caching/cacheKeys');
          
          const slug = params.currentSlug || params.slug;
          const articleCacheKey = CACHE_KEYS.ARTICLE.CONTENT(slug, schemaType);
          const fullCacheKey = cacheSystem.generateCacheKey(articleCacheKey, query);
          
          const idbData = await get(fullCacheKey);
          idbHit = !!idbData;
          idbHasData = idbHit;
        }
      } catch (idbError) {
        console.error('IndexedDB test error:', idbError);
      }
      
      const idbTime = Date.now() - idbStart;
      results.push({
        type: 'IndexedDB',
        time: idbTime,
        source: 'indexeddb',
        success: true,
        fromCache: idbHit,
        hasData: idbHasData
      });

      setTestResults(results);

      // Update status
      setStatus({
        redis: redisData.fromCache ? '✅ HIT' : '❌ MISS',
        memory: memoryHit ? '✅ HIT' : '❌ MISS',
        indexedDB: idbHit ? '✅ HIT' : '❌ MISS',
        network: 'Ready'
      });

    } catch (error) {
      console.error('Cache test error:', error);
      setStatus({
        redis: '❌ ERROR',
        memory: '❌ ERROR',
        indexedDB: '❌ ERROR',
        network: '❌ ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cacheKey) {
      // Run test after a small delay to let caches populate
      const timer = setTimeout(() => {
        runCacheTest();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cacheKey]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
      <h3 className="text-lg font-semibold">Cache Status Test</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Redis:</strong> {status.redis}</div>
        <div><strong>Memory:</strong> {status.memory}</div>
        <div><strong>IndexedDB:</strong> {status.indexedDB}</div>
        <div><strong>Network:</strong> {status.network}</div>
      </div>
      <button
        onClick={runCacheTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Run Cache Test'}
      </button>
      {testResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                <span className="font-medium">{result.type}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.fromCache 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.fromCache ? 'CACHE HIT' : 'CACHE MISS'} ({result.time}ms)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}