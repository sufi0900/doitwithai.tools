// React_Query_Caching/RealTimePerformanceMonitor.js
import React, { useState, useEffect, useRef } from 'react';

// Performance measurement utility
export const PerformanceTracker = { // Correct: This is the primary named export
  measurements: new Map(),
  baselines: {
    redis: 50,     // Expected Redis response time (ms)
    indexeddb: 5,   // Expected IndexedDB response time (ms)
    network: 1500, // Expected network/Sanity response time (ms)
    offline: 10     // Expected offline cache response time (ms)
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

// Enhanced logging function that includes performance tracking
export const logCacheOperationWithPerf = (operation, source, key, data = null, serverInfo = null) => {
  const perfKey = `${operation}_${key}`;

  if (operation === 'START') {
    PerformanceTracker.startMeasurement(perfKey);
  } else if (operation === 'HIT' || operation === 'MISS' || operation === 'UPDATE') {
    const dataSize = data ? JSON.stringify(data).length : 0;
    const cleanSource = source.replace('client-indexeddb-', '').replace('server-', '');
    PerformanceTracker.endMeasurement(perfKey, dataSize, cleanSource);
  }

  // Call original logging function
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

const RealTimePerformanceMonitor = () => {
  const [perfData, setPerfData] = useState({
    currentScore: 0,
    averageScore: 0,
    totalRequests: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    speedImprovement: 0,
    recentMeasurements: []
  });

  const [liveStats, setLiveStats] = useState({
    redis: { count: 0, avgTime: 0, totalTime: 0 },
    indexeddb: { count: 0, avgTime: 0, totalTime: 0 },
    network: { count: 0, avgTime: 0, totalTime: 0 },
    offline: { count: 0, avgTime: 0, totalTime: 0 }
  });

  const [isRecording, setIsRecording] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        const perfLogs = JSON.parse(sessionStorage.getItem('performanceLogs') || '[]');
        const cacheLogs = JSON.parse(sessionStorage.getItem('cacheOperationLogs') || '[]');

        if (perfLogs.length > 0) {
          const recent = perfLogs.slice(-10);
          const validMeasurements = recent.filter(m => m.duration && m.source);

          if (validMeasurements.length > 0) {
            // Calculate current performance metrics
            const latestMeasurement = validMeasurements[validMeasurements.length - 1];
            const currentScore = PerformanceTracker.calculatePerformanceScore(
              latestMeasurement.duration,
              latestMeasurement.source
            );

            // Calculate average score
            const scores = validMeasurements.map(m =>
              PerformanceTracker.calculatePerformanceScore(m.duration, m.source)
            );
            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

            // Calculate average response time
            const avgResponseTime = validMeasurements.reduce((sum, m) => sum + m.duration, 0) / validMeasurements.length;

            // Calculate speed improvement
            const speedImprovement = PerformanceTracker.getSpeedImprovement(
              latestMeasurement.duration,
              latestMeasurement.source
            );

            // Calculate cache hit rate
            const recentCacheLogs = cacheLogs.slice(-20);
            const hits = recentCacheLogs.filter(log => log.operation === 'HIT').length;
            const total = recentCacheLogs.filter(log => ['HIT', 'MISS'].includes(log.operation)).length;
            const cacheHitRate = total > 0 ? (hits / total) * 100 : 0;

            // Update live stats by source
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
      }, 100); // Update every 100ms for real-time feel
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

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

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-sm border dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          ⚡ Real-Time Performance
        </h3>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-2 py-1 rounded text-xs ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {isRecording ? '⏸️ Pause' : '▶️ Record'}
        </button>
      </div>

      {/* Main Performance Score */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Current Score</div>
            <div className={`text-3xl font-bold ${getScoreColor(perfData.currentScore)}`}>
              {perfData.currentScore}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400">Speed Boost</div>
            <div className="text-2xl font-bold text-green-600">
              +{perfData.speedImprovement}%
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-gray-600 dark:text-gray-400">Avg Score</div>
          <div className={`font-bold ${getScoreColor(perfData.averageScore)}`}>
            {perfData.averageScore}%
          </div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-gray-600 dark:text-gray-400">Hit Rate</div>
          <div className="font-bold text-blue-600">
            {perfData.cacheHitRate}%
          </div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-gray-600 dark:text-gray-400">Avg Time</div>
          <div className="font-bold text-purple-600">
            {perfData.avgResponseTime}ms
          </div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-gray-600 dark:text-gray-400">Requests</div>
          <div className="font-bold text-gray-700 dark:text-gray-300">
            {perfData.totalRequests}
          </div>
        </div>
      </div>

      {/* Live Source Performance */}
      <div className="mb-3">
        <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
          📊 Live Source Performance
        </div>
        {Object.entries(liveStats).map(([source, stats]) => (
          stats.count > 0 && (
            <div key={source} className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center">
                {getSourceIcon(source)}
                <span className="ml-1 capitalize">{source}</span>
                <span className="ml-1 text-gray-500">({stats.count})</span>
              </span>
              <span className="font-mono font-bold">
                {Math.round(stats.avgTime)}ms
              </span>
            </div>
          )
        ))}
      </div>

      {/* Recent Measurements */}
      <div className="mb-3">
        <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
          🔄 Recent Measurements
        </div>
        <div className="max-h-20 overflow-y-auto">
          {perfData.recentMeasurements.map((measurement, i) => (
            <div key={i} className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              <span className="font-mono font-bold text-blue-600">
                {Math.round(measurement.duration)}ms
              </span>
              <span className="ml-1">
                {getSourceIcon(measurement.source)} {measurement.source}
              </span>
              <span className="ml-1 text-gray-400">
                {new Date(measurement.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            sessionStorage.removeItem('performanceLogs');
            sessionStorage.removeItem('cacheOperationLogs');
            setPerfData({
              currentScore: 0,
              averageScore: 0,
              totalRequests: 0,
              cacheHitRate: 0,
              avgResponseTime: 0,
              speedImprovement: 0,
              recentMeasurements: []
            });
          }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Clear Data
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Test Reload
        </button>
      </div>
    </div>
  );
};

export default RealTimePerformanceMonitor;
// REMOVED: export { PerformanceTracker }; // This line was causing the duplicate export error