// RedisServerMonitor.js - Add this to your parent page to track server-side Redis
"use client";

import { useState, useEffect } from 'react';

export default function RedisServerMonitor({ serverData, params }) {
  const [redisStatus, setRedisStatus] = useState({
    isWorking: false,
    source: 'unknown',
    lastOperation: null,
    visitNumber: 1
  });

  useEffect(() => {
    // Track visit number
    const visits = parseInt(sessionStorage.getItem(`visits_${params.slug}`) || '0') + 1;
    sessionStorage.setItem(`visits_${params.slug}`, visits.toString());

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
      console.log(`🔍 SERVER ANALYSIS - Visit #${visits}:`);
      console.log(`   Source: ${source}`);
      console.log(`   Redis Status: ${isRedisWorking ? '✅ WORKING' : '❌ MISSED'}`);
      console.log(`   Data received: ${serverData ? '✅ YES' : '❌ NO'}`);
      
      // Store in sessionStorage for client monitoring
      const serverLogs = JSON.parse(sessionStorage.getItem('serverOperationLogs') || '[]');
      serverLogs.push({
        slug: params.slug,
        visit: visits,
        source: source,
        redisWorking: isRedisWorking,
        timestamp: new Date().toISOString(),
        hasData: !!serverData
      });
      sessionStorage.setItem('serverOperationLogs', JSON.stringify(serverLogs.slice(-20)));
    }
  }, [serverData, params.slug]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 max-w-xs border dark:border-gray-700">
      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">
        🔧 Redis Server Monitor
      </h4>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            redisStatus.isWorking ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span className="font-medium">
            Visit #{redisStatus.visitNumber}
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
          <div className="font-medium text-gray-700 dark:text-gray-300">
            Server Status:
          </div>
          <div className={`${
            redisStatus.isWorking ? 'text-green-600' : 'text-red-600'
          }`}>
            {redisStatus.lastOperation}
          </div>
          <div className="text-gray-500 mt-1">
            Source: {redisStatus.source}
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
  );
}