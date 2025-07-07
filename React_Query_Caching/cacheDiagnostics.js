// Enhanced cacheDiagnostics.js
import React, { useState, useEffect, useRef } from 'react';

// Enhanced logging function that captures server data source
export const logCacheOperation = (operation, source, key, data = null, serverInfo = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    source,
    key,
    hasData: !!data,
    dataSize: data ? JSON.stringify(data).length : 0,
    serverInfo: serverInfo || null, // NEW: Track server-side info
    userAgent: navigator.userAgent,
  };

  console.log(`[CACHE-${operation.toUpperCase()}] ${source} | ${key} | ${timestamp}`);
  
  // Store in sessionStorage for analysis
  const logs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
  logs.push(logEntry);
  sessionStorage.setItem('cacheOperationLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
};

// NEW: Enhanced Cache Performance Monitor
export const CachePerformanceMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState('');
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Track current page for context
    setCurrentPage(window.location.pathname);
    
    const interval = setInterval(() => {
      const cacheLogs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
      setLogs(cacheLogs);

      // Calculate enhanced performance stats
      const recent = cacheLogs.slice(-30); // Look at more recent activity
      const currentPageLogs = recent.filter(log => 
        log.key.includes(window.location.pathname.split('/').pop())
      );

      // Count different sources
      const serverRedisHits = recent.filter(log => 
        log.source === 'server-redis' && log.operation === 'HIT'
      ).length;
      
      const serverNetworkMisses = recent.filter(log => 
        log.source === 'server-network' && log.operation === 'MISS'
      ).length;
      
      const indexedDBHits = recent.filter(log => 
        (log.source.includes('indexeddb') || log.source === 'client-indexeddb-fresh') && 
        log.operation === 'HIT'
      ).length;
      
      const networkMisses = recent.filter(log => 
        log.source === 'network' && log.operation === 'MISS'
      ).length;

      // NEW: Track server data usage
      const serverDataUsage = recent.filter(log => 
        log.source.startsWith('server-') && log.hasData
      ).length;

      // NEW: Track data flow pattern
      const dataFlowPattern = currentPageLogs.map(log => ({
        source: log.source,
        operation: log.operation,
        timestamp: log.timestamp
      })).slice(-5); // Last 5 operations for current page

      const totalOperations = recent.length;

      setStats({
        serverRedisHits,
        serverNetworkMisses,
        indexedDBHits,
        networkMisses,
        serverDataUsage,
        dataFlowPattern,
        total: totalOperations,
        serverRedisPercentage: totalOperations > 0 ? ((serverRedisHits / totalOperations) * 100).toFixed(1) : 0,
        indexedDBPercentage: totalOperations > 0 ? ((indexedDBHits / totalOperations) * 100).toFixed(1) : 0,
        currentPageLogs: currentPageLogs.length,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // NEW: Visit counter
  useEffect(() => {
    const visits = parseInt(sessionStorage.getItem('pageVisits') || '0') + 1;
    setVisitCount(visits);
    sessionStorage.setItem('pageVisits', visits.toString());
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md border dark:border-gray-700">
      <h3 className="font-bold mb-2 text-lg text-gray-900 dark:text-gray-100">
        Cache Performance Monitor
      </h3>
      
      {/* NEW: Current Session Info */}
      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm">
        <div className="font-medium text-blue-700 dark:text-blue-300">
          Current Session
        </div>
        <div className="text-blue-600 dark:text-blue-400">
          Visit #{visitCount} | Page: {currentPage.split('/').pop()}
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <div className="font-medium text-green-600 dark:text-green-400">
          🟢 Server (Redis) Hits: {stats.serverRedisHits || 0} ({stats.serverRedisPercentage || 0}%)
        </div>
        <div className="font-medium text-blue-600 dark:text-blue-400">
          🔵 Client (IndexedDB) Hits: {stats.indexedDBHits || 0} ({stats.indexedDBPercentage || 0}%)
        </div>
        <div className="font-medium text-orange-600 dark:text-orange-400">
          🟡 Server Network Fetches: {stats.serverNetworkMisses || 0}
        </div>
        <div className="font-medium text-red-600 dark:text-red-400">
          🔴 Client Network Misses: {stats.networkMisses || 0}
        </div>
        <div className="font-medium text-purple-600 dark:text-purple-400">
          📊 Server Data Usage: {stats.serverDataUsage || 0}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Total Ops: {stats.total || 0} | Page Ops: {stats.currentPageLogs || 0}
        </div>
      </div>

      {/* NEW: Data Flow Pattern */}
      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
          🔄 Data Flow Pattern (Last 5 operations)
        </p>
        {stats.dataFlowPattern && stats.dataFlowPattern.length > 0 ? (
          stats.dataFlowPattern.map((flow, i) => (
            <div key={i} className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {flow.operation}
              </span>
              {' from '}
              <span className={`font-medium ${
                flow.source.includes('server-redis') ? 'text-green-500' :
                flow.source.includes('indexeddb') ? 'text-blue-500' :
                flow.source.includes('network') ? 'text-red-500' :
                'text-purple-500'
              }`}>
                {flow.source.replace('client-indexeddb-', 'IDB-').replace('server-redis', 'Redis')}
              </span>
              <span className="text-gray-400 ml-1">
                {new Date(flow.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-400">No operations yet</div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="mt-3   h-32 overflow-y-auto border-t pt-2 border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
          Recent Logs (Last 10)
        </p>
        {logs.slice(-10).reverse().map((log, i) => (
          <div key={i} className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
            <span className={`font-medium ${
              log.operation === 'HIT' ? 'text-green-500' : 
              log.operation === 'MISS' ? 'text-red-500' : 
              'text-blue-500'
            }`}>
              {log.operation.toUpperCase()}
            </span>
            {' from '}
            <span className={`font-medium ${
              log.source.includes('server-redis') ? 'text-green-500' :
              log.source.includes('indexeddb') ? 'text-blue-500' :
              log.source.includes('network') ? 'text-red-500' :
              'text-purple-500'
            }`}>
              {log.source.replace('client-indexeddb-', 'IDB-').replace('server-redis', 'Redis')}
            </span>
            : <span className="text-gray-600 dark:text-gray-300">
              {log.key.split(':').pop()}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-xs text-gray-400">No cache operations yet.</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            sessionStorage.removeItem('cacheOperationLogs');
            sessionStorage.removeItem('pageVisits');
            setVisitCount(0);
          }}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Clear Logs
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Test Reload
        </button>
      </div>
    </div>
  );
};

// NEW: Enhanced Cache Test Suite with better Redis visibility
export const CacheTestSuite = {
  // Test to verify IndexedDB is working on second visit
  async testIndexedDBSecondVisit(articleSlug, schemaType) {
    console.log('🧪 Testing IndexedDB Second Visit...');
    
    // Clear logs to start fresh
    sessionStorage.removeItem('cacheOperationLogs');
    
    console.log('1. Perform a FIRST visit/refresh (this should hit server/Redis)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const firstVisitLogs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
    const hasServerHit = firstVisitLogs.some(log => 
      log.source.includes('server-') && log.operation === 'HIT'
    );
    
    console.log('2. Now perform a SECOND visit/refresh (this should hit IndexedDB)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const secondVisitLogs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
    const hasIndexedDBHit = secondVisitLogs.some(log => 
      log.source.includes('indexeddb') && log.operation === 'HIT'
    );
    
    const passed = hasServerHit && hasIndexedDBHit;
    console.log(`✅ IndexedDB Second Visit Test: ${passed ? 'PASSED' : 'FAILED'}`);
    
    return passed;
  },

  // Test to verify Redis is working on server-side
  async testRedisServerSide(articleSlug, schemaType) {
    console.log('🧪 Testing Redis Server-Side...');
    
    // This test relies on server logs, but we can verify client receives server data
    const logs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
    const serverDataLogs = logs.filter(log => 
      log.source.includes('server-') && log.hasData
    );
    
    const passed = serverDataLogs.length > 0;
    console.log(`✅ Redis Server-Side Test: ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (!passed) {
      console.log('❌ No server data detected. Check server logs for Redis operations.');
    } else {
      console.log('✅ Server data detected. Check VS Code console for Redis logs.');
    }
    
    return passed;
  },

  // Test complete flow
  async testCompleteFlow(articleSlug, schemaType) {
    console.log('🧪 Testing Complete Cache Flow...');
    
    const testResults = {
      serverRedisWorking: false,
      indexedDBWorking: false,
      dataFlowCorrect: false
    };
    
    // Check for server data
    const logs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
    testResults.serverRedisWorking = logs.some(log => 
      log.source.includes('server-') && log.hasData
    );
    
    // Check for IndexedDB hits
    testResults.indexedDBWorking = logs.some(log => 
      log.source.includes('indexeddb') && log.operation === 'HIT'
    );
    
    // Check data flow pattern
    const recentLogs = logs.slice(-10);
    const hasServerToClient = recentLogs.some(log => log.source.includes('server-'));
    const hasClientCache = recentLogs.some(log => log.source.includes('indexeddb'));
    testResults.dataFlowCorrect = hasServerToClient && hasClientCache;
    
    console.log('📊 Test Results:', testResults);
    
    return testResults;
  }
};

// Export default for backward compatibility
export default CachePerformanceMonitor;