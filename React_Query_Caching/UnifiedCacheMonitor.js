"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useCacheContext } from './CacheProvider';
import { cacheSystem } from './cacheSystem';

// Performance measurement utility
export const PerformanceTracker = {
  measurements: new Map(),
  baselines: {
    redis: 50,
    indexeddb: 5,
    network: 1500,
    offline: 10
  },
  
  startMeasurement: (key) => {
    const startTime = performance.now();
    PerformanceTracker.measurements.set(key, { startTime, endTime: null });
    return startTime;
  },
  
  endMeasurement: (key, dataSize = 0, source = 'unknown') => {
    const endTime = performance.now();
    const measurement = PerformanceTracker.measurements.get(key);
    
    if (measurement) {
      const duration = endTime - measurement.startTime;
      const result = {
        ...measurement,
        endTime,
        duration,
        dataSize,
        source,
        timestamp: new Date().toISOString()
      };
      
      PerformanceTracker.measurements.set(key, result);
      
      // Store in session storage for persistence
      const perfLogs = JSON.parse(sessionStorage.getItem('performanceLogs') || '[]');
      perfLogs.push(result);
      sessionStorage.setItem('performanceLogs', JSON.stringify(perfLogs.slice(-50)));
      
      return result;
    }
    return null;
  },
  
  calculatePerformanceScore: (duration, source) => {
    const baseline = PerformanceTracker.baselines[source] || PerformanceTracker.baselines.network;
    const score = Math.max(0, Math.min(100, ((baseline - duration) / baseline) * 100 + 50));
    return Math.round(score);
  },
  
  getSpeedImprovement: (duration, source) => {
    const networkBaseline = PerformanceTracker.baselines.network;
    const improvement = ((networkBaseline - duration) / networkBaseline) * 100;
    return Math.max(0, Math.round(improvement));
  }
};

// Enhanced logging function
export const logCacheOperationWithPerf = (operation, source, key, data = null, serverInfo = null) => {
  const perfKey = `${operation}_${key}`;
  
  if (operation === 'START') {
    PerformanceTracker.startMeasurement(perfKey);
  } else if (operation === 'HIT' || operation === 'MISS' || operation === 'UPDATE') {
    const dataSize = data ? JSON.stringify(data).length : 0;
    const cleanSource = source.replace('client-indexeddb-', '').replace('server-', '');
    PerformanceTracker.endMeasurement(perfKey, dataSize, cleanSource);
  }
  
  // Store cache operation logs
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    source,
    key,
    hasData: !!data,
    dataSize: data ? JSON.stringify(data).length : 0,
    serverInfo: serverInfo || null,
    userAgent: navigator.userAgent,
  };
  
  console.log(`[CACHE-${operation.toUpperCase()}] ${source} | ${key} | ${timestamp}`);
  
  const logs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
  logs.push(logEntry);
  sessionStorage.setItem('cacheOperationLogs', JSON.stringify(logs.slice(-100)));
};

const UnifiedCacheMonitor = ({ 
  position = 'fixed', 
  className = '', 
  showStats = true, 
  compact = false ,
   serverData = null,    // NEW: Add this prop
  params = null  
}) => {
  const { cacheStats, isOnline, refreshPageCache, getCacheKeys } = useCacheContext();
  
  // Main state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Cache status state
  const [keyStatuses, setKeyStatuses] = useState({});
  
  // Performance state
  const [perfData, setPerfData] = useState({
    currentScore: 0,
    averageScore: 0,
    totalRequests: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    speedImprovement: 0,
    recentMeasurements: []
  });
  
  // Diagnostics state
  const [logs, setLogs] = useState([]);
  const [diagnosticStats, setDiagnosticStats] = useState({});
  const [currentPage, setCurrentPage] = useState('');
  const [visitCount, setVisitCount] = useState(0);
  
  // Live stats
  const [liveStats, setLiveStats] = useState({
    redis: { count: 0, avgTime: 0, totalTime: 0 },
    indexeddb: { count: 0, avgTime: 0, totalTime: 0 },
    network: { count: 0, avgTime: 0, totalTime: 0 },
    offline: { count: 0, avgTime: 0, totalTime: 0 }
  });
  // 2. Add this new state for Redis monitoring (add to your existing useState declarations)
const [redisStatus, setRedisStatus] = useState({
  isWorking: false,
  source: 'unknown',
  lastOperation: null,
  visitNumber: 1,
  timestamp: null
});
  const [isRecording, setIsRecording] = useState(true);
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize page tracking
  useEffect(() => {
    setCurrentPage(window.location.pathname);
    const visits = parseInt(sessionStorage.getItem('pageVisits') || '0') + 1;
    setVisitCount(visits);
    sessionStorage.setItem('pageVisits', visits.toString());
  }, []);

  // Cache status monitoring
  useEffect(() => {
    if (!getCacheKeys) return;
    
    const cacheKeys = getCacheKeys();
    const unsubscribers = [];
    
    const initializeAndSubscribe = async () => {
      const initialStatuses = {};
      const fetchPromises = cacheKeys.map(async ({ key, query, label }) => {
        const stringKey = String(key);
        const fullCacheKey = cacheSystem.generateCacheKey(stringKey, query || '');
        const displayLabel = label || stringKey;
        
        initialStatuses[fullCacheKey] = {
          key: displayLabel,
          status: 'loading',
          lastUpdated: null,
          source: 'none',
          age: 0
        };
        
        try {
          const result = await cacheSystem.get(fullCacheKey, { query, params: {} });
          return { fullCacheKey, data: result, label: displayLabel };
        } catch (error) {
          console.error(`Error getting initial status for ${displayLabel}:`, error);
          return { fullCacheKey, data: null, label: displayLabel };
        }
      });
      
      setKeyStatuses(initialStatuses);
      
      const results = await Promise.all(fetchPromises);
      const finalStatuses = {};
      
      results.forEach(({ fullCacheKey, data, label }) => {
        finalStatuses[fullCacheKey] = {
          key: String(label),
          status: data ? (data.isStale ? 'stale' : 'fresh') : 'empty',
          lastUpdated: data ? new Date(Date.now() - data.age) : null,
          source: data?.source || 'none',
          age: data?.age || 0
        };
      });
      
      setKeyStatuses(finalStatuses);
      
      // Setup subscriptions
      cacheKeys.forEach(({ key, query, label }) => {
        const stringKey = String(key);
        const fullCacheKey = cacheSystem.generateCacheKey(stringKey, query || '');
        const displayLabel = String(label || stringKey);
        
        const unsubscribe = cacheSystem.subscribe(fullCacheKey, (data) => {
          setKeyStatuses(prev => ({
            ...prev,
            [fullCacheKey]: {
              key: displayLabel,
              status: data === null ? 'empty' : (data.isStale ? 'stale' : 'fresh'),
              lastUpdated: data ? new Date(Date.now() - (data.age || 0)) : null,
              source: data?.source || 'none',
              age: data?.age || 0
            }
          }));
        });
        
        unsubscribers.push(unsubscribe);
      });
    };
    
    initializeAndSubscribe();
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [getCacheKeys]);

  // Performance and diagnostics monitoring
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        const perfLogs = JSON.parse(sessionStorage.getItem('performanceLogs') || '[]');
        const cacheLogs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');
        
        setLogs(cacheLogs);
        
        // Performance calculations
        if (perfLogs.length > 0) {
          const recent = perfLogs.slice(-10);
          const validMeasurements = recent.filter(m => m.duration && m.source);
          
          if (validMeasurements.length > 0) {
            const latestMeasurement = validMeasurements[validMeasurements.length - 1];
            const currentScore = PerformanceTracker.calculatePerformanceScore(
              latestMeasurement.duration, 
              latestMeasurement.source
            );
            
            const scores = validMeasurements.map(m => 
              PerformanceTracker.calculatePerformanceScore(m.duration, m.source)
            );
            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            const avgResponseTime = validMeasurements.reduce((sum, m) => sum + m.duration, 0) / validMeasurements.length;
            const speedImprovement = PerformanceTracker.getSpeedImprovement(
              latestMeasurement.duration, 
              latestMeasurement.source
            );
            
            const recentCacheLogs = cacheLogs.slice(-20);
            const hits = recentCacheLogs.filter(log => log.operation === 'HIT').length;
            const total = recentCacheLogs.filter(log => ['HIT', 'MISS'].includes(log.operation)).length;
            const cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
            
            const newLiveStats = {
              redis: { count: 0, avgTime: 0, totalTime: 0 },
              indexeddb: { count: 0, avgTime: 0, totalTime: 0 },
              network: { count: 0, avgTime: 0, totalTime: 0 },
              offline: { count: 0, avgTime: 0, totalTime: 0 }
            };
            
            validMeasurements.forEach(m => {
              const source = m.source === 'redis' ? 'redis' : 
                           m.source.includes('indexeddb') ? 'indexeddb' : 
                           m.source === 'network' ? 'network' : 'offline';
              
              if (newLiveStats[source]) {
                newLiveStats[source].count++;
                newLiveStats[source].totalTime += m.duration;
                newLiveStats[source].avgTime = newLiveStats[source].totalTime / newLiveStats[source].count;
              }
            });
            
            setPerfData({
              currentScore: Math.round(currentScore),
              averageScore: Math.round(averageScore),
              totalRequests: validMeasurements.length,
              cacheHitRate: Math.round(cacheHitRate),
              avgResponseTime: Math.round(avgResponseTime),
              speedImprovement: Math.round(speedImprovement),
              recentMeasurements: validMeasurements.slice(-5)
            });
            
            setLiveStats(newLiveStats);
          }
        }
        
        // Diagnostics calculations
        const recent = cacheLogs.slice(-30);
        const currentPageLogs = recent.filter(log => 
          log.key.includes(window.location.pathname.split('/').pop())
        );
        
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
        
        const serverDataUsage = recent.filter(log => 
          log.source.startsWith('server-') && log.hasData
        ).length;
        
        const dataFlowPattern = currentPageLogs.map(log => ({
          source: log.source,
          operation: log.operation,
          timestamp: log.timestamp
        })).slice(-5);
        
        const totalOperations = recent.length;
        
        setDiagnosticStats({
          serverRedisHits,
          serverNetworkMisses,
          indexedDBHits,
          networkMisses,
          serverDataUsage,
          dataFlowPattern,
          total: totalOperations,
          serverRedisPercentage: totalOperations > 0 ? 
            ((serverRedisHits / totalOperations) * 100).toFixed(1) : 0,
          indexedDBPercentage: totalOperations > 0 ? 
            ((indexedDBHits / totalOperations) * 100).toFixed(1) : 0,
          currentPageLogs: currentPageLogs.length,
        });
        
      }, 100);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isOpen && autoScroll && scrollContainerRef.current && activeTab === 'components') {
      const container = scrollContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      if (scrollHeight > clientHeight) {
        let scrollTop = 0;
        const scrollStep = 1;
        const scrollDelay = 50;
        
        autoScrollIntervalRef.current = setInterval(() => {
          scrollTop += scrollStep;
          container.scrollTop = scrollTop;
          
          if (scrollTop >= scrollHeight - clientHeight) {
            setTimeout(() => {
              scrollTop = 0;
              container.scrollTop = 0;
            }, 1000);
          }
        }, scrollDelay);
      }
    }
    
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isOpen, autoScroll, keyStatuses, activeTab]);


// 3. Add this new useEffect for Redis monitoring (add alongside your existing useEffects)
useEffect(() => {
  // Only run if we have serverData and params (server-side context)
  if (!serverData || !params) return;

  // Handle both article pages and listing pages
  const slugKey = params.slug || 'unknown';
  const isListingPage = params.pageType === 'listing' || slugKey.includes('-listing');
  
  // Track visit number (use different key for listing pages)
  const visitKey = isListingPage ? `visits_listing_${slugKey}` : `visits_${slugKey}`;
  const visits = parseInt(sessionStorage.getItem(visitKey) || '0') + 1;
  sessionStorage.setItem(visitKey, visits.toString());

  // Analyze server data source
  if (serverData && serverData.__source) {
    const source = serverData.__source;
    const isRedisWorking = source === 'server-redis';
    
    setRedisStatus({
      isWorking: isRedisWorking,
      source: source,
      lastOperation: isRedisWorking ? 'Redis HIT' : 'Redis MISS → Sanity Fetch',
      visitNumber: visits,
      timestamp: new Date().toISOString()
    });

    // Log server-side operation for monitoring
    const pageType = isListingPage ? 'LISTING PAGE' : 'ARTICLE PAGE';
    console.log(`🔍 SERVER ANALYSIS (${pageType}) - Visit #${visits}:`);
    console.log(`Slug: ${slugKey}`);
    console.log(`Source: ${source}`);
    console.log(`Redis Status: ${isRedisWorking ? '✅ WORKING' : '❌ MISSED'}`);
    console.log(`Data received: ${serverData ? '✅ YES' : '❌ NO'}`);

    // Store in sessionStorage for client monitoring
    const serverLogs = JSON.parse(sessionStorage.getItem('serverOperationLogs') || '[]');
    serverLogs.push({
      slug: slugKey,
      pageType: isListingPage ? 'listing' : 'article',
      visit: visits,
      source: source,
      redisWorking: isRedisWorking,
      timestamp: new Date().toISOString(),
      hasData: !!serverData
    });
    sessionStorage.setItem('serverOperationLogs', JSON.stringify(serverLogs.slice(-20)));
  }
}, [serverData, params?.slug, params?.pageType]);

  // Utility functions
  const getOverallStatus = () => {
    const statuses = Object.values(keyStatuses);
    if (statuses.length === 0) return 'unknown';
    if (statuses.some(s => s.status === 'empty' || s.status === 'loading')) return 'empty';
    if (statuses.some(s => s.status === 'stale')) return 'stale';
    if (statuses.every(s => s.status === 'fresh')) return 'fresh';
    return 'mixed';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshPageCache) {
        await refreshPageCache();
      }
    } catch (error) {
      console.error('Page cache refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      setAutoScroll(false);
    }
  };

  const clearAllData = () => {
    sessionStorage.removeItem('performanceLogs');
    sessionStorage.removeItem('cacheOperationLogs');
    sessionStorage.removeItem('pageVisits');
    setVisitCount(0);
    setPerfData({
      currentScore: 0,
      averageScore: 0,
      totalRequests: 0,
      cacheHitRate: 0,
      avgResponseTime: 0,
      speedImprovement: 0,
      recentMeasurements: []
    });
    setLogs([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fresh': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20';
      case 'stale': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-amber-500/20';
      case 'empty': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20';
      case 'loading': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/20';
      case 'mixed': return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fresh': return '✨';
      case 'stale': return '⚠️';
      case 'empty': return '❌';
      case 'loading': return '⏳';
      case 'mixed': return '🔄';
      default: return '❓';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'redis': return '🟢';
      case 'indexeddb': return '🔵';
      case 'network': return '🔴';
      case 'offline': return '🟡';
      default: return '⚪';
    }
  };

  const overallStatus = getOverallStatus();
  const totalComponents = Object.keys(keyStatuses).length;

  // Compact view
  if (compact) {
    return (
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(overallStatus)} ${className} transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm`}
        title={`Page Cache Status: ${overallStatus} | Click to refresh`}
      >
        <span className="mr-1.5">
          {isRefreshing ? '⟳' : getStatusIcon(overallStatus)}
        </span>
        {!isRefreshing && (
          <span>{overallStatus} ({totalComponents})</span>
        )}
      </button>
    );
  }

  // Hide in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className={`${position === 'fixed' ? 'fixed bottom-6 right-6 z-[9999]' : 'relative'} ${className}`}>
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl ${getStatusColor(overallStatus)} hover:shadow-3xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10`}
        title="Unified Cache Monitor"
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getStatusIcon(overallStatus)}</span>
          <div className="hidden sm:block">
            <div className="font-medium text-sm">Cache Monitor</div>
            <div className="text-xs opacity-80">
              {perfData.currentScore}% • {totalComponents} components
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ⌃
          </span>
        </div>
      </button>

      {/* Enhanced Modal Panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-[28rem] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-out transform origin-bottom-right animate-in slide-in-from-bottom-2 fade-in">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    Unified Cache Monitor
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visit #{visitCount} • {currentPage.split('/').pop()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'bg-green-500 text-white shadow-sm'
                  }`}
                >
                  {isRecording ? '⏸️ Pause' : '▶️ Record'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'components', label: 'Components', icon: '🔧' },
                { id: 'performance', label: 'Performance', icon: '⚡' },
                { id: 'diagnostics', label: 'Diagnostics', icon: '🔍' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto" style={{height:"300px"}}>
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Performance Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4">                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Performance Score</div>
                      <div className={`text-2xl font-bold ${getScoreColor(perfData.currentScore)}`}>
                        {perfData.currentScore}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Speed Boost</div>
                      <div className="text-xl font-bold text-green-600">+{perfData.speedImprovement}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">Hit Rate</div>
                      <div className="font-bold text-blue-600">{perfData.cacheHitRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">Avg Time</div>
                      <div className="font-bold text-purple-600">{perfData.avgResponseTime}ms</div>
                    </div>
                  </div>
                </div>

                {/* Cache Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wide">Memory</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{cacheStats.memoryEntries}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">items cached</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-purple-600 dark:text-purple-400 text-xs font-medium uppercase tracking-wide">Size</div>
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{Math.round(cacheStats.memorySize / 1024)}KB</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">memory used</div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">System Status</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Components</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{totalComponents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Overall Status</span>
                      <span className={`font-medium capitalize ${
                        overallStatus === 'fresh' ? 'text-green-600' :
                        overallStatus === 'stale' ? 'text-yellow-600' :
                        overallStatus === 'empty' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {overallStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Connection</span>
                      <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Components</span>
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`px-2 py-1 rounded text-xs ${
                      autoScroll ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } transition-all duration-200`}
                  >
                    {autoScroll ? '⏸️ Auto' : '▶️ Manual'}
                  </button>
                </div>
                
                <div 
                  ref={scrollContainerRef}
                  className="space-y-2 max-h-64 overflow-y-auto"
                  onScroll={handleManualScroll}
                >
                  {Object.entries(keyStatuses).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="text-sm">No components to monitor</div>
                    </div>
                  ) : (
                    Object.entries(keyStatuses).map(([cacheKey, status]) => (
                      <div
                        key={cacheKey}
                        className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{getStatusIcon(status.status)}</span>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {status.key}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{getSourceIcon(status.source)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Source:</span> {status.source || 'none'}
                          </div>
                          <div>
                            <span className="font-medium">Age:</span> {
                              status.age ? `${Math.round(status.age / 1000)}s` : 'N/A'
                            }
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Updated:</span> {
                              status.lastUpdated 
                                ? status.lastUpdated.toLocaleTimeString() 
                                : 'Never'
                            }
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Refresh All Components Button */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isRefreshing
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isRefreshing ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⟳</span>
                        Refreshing...
                      </span>
                    ) : (
                      '🔄 Refresh All Components'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-4"> {/* MODIFIED CLASS HERE */}
  <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Live Performance</div>
  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Current Score</div>
                      <div className={`text-xl font-bold ${getScoreColor(perfData.currentScore)}`}>
                        {perfData.currentScore}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Average Score</div>
                      <div className={`text-xl font-bold ${getScoreColor(perfData.averageScore)}`}>
                        {perfData.averageScore}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hit Rate</div>
                      <div className="text-lg font-bold text-blue-600">{perfData.cacheHitRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
                      <div className="text-lg font-bold text-purple-600">{perfData.avgResponseTime}ms</div>
                    </div>
                  </div>
                </div>

                {/* Source Performance Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Source Performance</div>
                  <div className="space-y-2">
                    {Object.entries(liveStats).map(([source, stats]) => (
                      <div key={source} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span>{getSourceIcon(source)}</span>
                          <span className="font-medium text-sm capitalize text-gray-900 dark:text-gray-100">
                            {source}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {stats.count} requests
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {stats.count > 0 ? `${Math.round(stats.avgTime)}ms` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Measurements */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Recent Measurements</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {perfData.recentMeasurements.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <div className="text-lg mb-1">📊</div>
                        <div className="text-xs">No recent measurements</div>
                      </div>
                    ) : (
                      perfData.recentMeasurements.map((measurement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{getSourceIcon(measurement.source)}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {measurement.source}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {Math.round(measurement.duration)}ms
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {new Date(measurement.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostics Tab */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-4">
                {/* Diagnostics Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">System Diagnostics</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">Redis Hits</div>
                      <div className="text-lg font-bold text-green-600">{diagnosticStats.serverRedisHits}</div>
                      <div className="text-gray-500 dark:text-gray-400">({diagnosticStats.serverRedisPercentage}%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">IndexedDB Hits</div>
                      <div className="text-lg font-bold text-blue-600">{diagnosticStats.indexedDBHits}</div>
                      <div className="text-gray-500 dark:text-gray-400">({diagnosticStats.indexedDBPercentage}%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">Network Misses</div>
                      <div className="text-lg font-bold text-red-600">{diagnosticStats.networkMisses}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400">Current Page</div>
                      <div className="text-lg font-bold text-purple-600">{diagnosticStats.currentPageLogs}</div>
                    </div>
                  </div>
                </div>

                {/* Data Flow Pattern */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Recent Data Flow</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {diagnosticStats.dataFlowPattern && diagnosticStats.dataFlowPattern.length > 0 ? (
                      diagnosticStats.dataFlowPattern.map((flow, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{getSourceIcon(flow.source.replace('server-', '').replace('client-indexeddb-', 'indexeddb'))}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {flow.source}
                            </span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              flow.operation === 'HIT' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              flow.operation === 'MISS' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {flow.operation}
                            </span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {new Date(flow.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <div className="text-lg mb-1">🔍</div>
                        <div className="text-xs">No recent data flow</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operation Logs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Operation Logs</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last {Math.min(logs.length, 10)} operations
                    </div>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {logs.slice(-10).reverse().map((log, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                            log.operation === 'HIT' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            log.operation === 'MISS' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            log.operation === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {log.operation}
                          </span>
                          <span
  className="text-gray-900dark:text-gray-100font-mediumtruncate"
  title={log.key.split('|')[0]} // Add this line for the tooltip
>
  {log.key.split('|')[0]}
</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {log.source}
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs ml-2">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Data Button */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={clearAllData}
                    className="w-full px-4 py-2 rounded-lg font-medium text-sm bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    🗑️ Clear All Diagnostic Data
                  </button>
                </div>
              </div>
            )}


{(serverData && params) && (
  <div className="border-t pt-3 mt-3">
    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">
      🔧 Redis Server Monitor
    </h4>
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${redisStatus.isWorking ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="font-medium">
          Visit #{redisStatus.visitNumber} 
          {params.pageType === 'listing' && ' (Listing)'}
        </span>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300">Server Status:</div>
        <div className={`${redisStatus.isWorking ? 'text-green-600' : 'text-red-600'}`}>
          {redisStatus.lastOperation}
        </div>
        <div className="text-gray-500 mt-1">Source: {redisStatus.source}</div>
        <div className="text-gray-500 text-xs">
          Page: {params.slug || 'unknown'}
        </div>
      </div>
      <div className="text-gray-500 text-xs">
        Expected behavior:
        <ul className="ml-2 mt-1 space-y-1">
          <li>• Visit #1: Redis MISS → Sanity</li>
          <li>• Visit #2+: Redis HIT</li>
        </ul>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCacheMonitor;