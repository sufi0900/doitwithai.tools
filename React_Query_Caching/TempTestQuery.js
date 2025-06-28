// components/DebugTestComponent.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DebugTestComponent = () => {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // Simple test query that doesn't depend on Sanity
  const { data, isLoading, error, isSuccess } = useQuery({
    queryKey: ['debug-test'],
    queryFn: async () => {
      console.log('🚀 Fetching debug test data...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network
      const result = { message: 'Hello from React Query!', timestamp: Date.now() };
      console.log('✅ Debug test data fetched:', result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: Infinity, // Never remove from cache
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cache debugging
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      console.log('📊 CACHE DEBUG:');
      
      // Check specific query
      const debugData = queryClient.getQueryData(['debug-test']);
      console.log('- debug-test query data:', debugData);
      
      // Check all queries
      const allQueries = queryClient.getQueryCache().getAll();
      console.log('- Total queries in cache:', allQueries.length);
      
      allQueries.forEach((query, index) => {
        console.log(`  ${index + 1}. Key: ${JSON.stringify(query.queryKey)}, Has Data: ${!!query.state.data}`);
      });
      
      // Check QueryClient instance
      console.log('- QueryClient instance ID:', queryClient);
      
    }, 3000);

    return () => clearInterval(interval);
  }, [queryClient, mounted]);

  if (!mounted) {
    return <div>Mounting...</div>;
  }

  return (
    <div style={{ 
      border: '2px solid blue', 
      padding: '20px', 
      margin: '20px',
      background: '#f0f8ff'
    }}>
      <h2>🔧 Debug Test Component</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {isLoading ? 'Loading...' : isSuccess ? 'Success' : 'Unknown'}
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
      
      {data && (
        <div style={{ background: '#e8f5e8', padding: '10px', marginBottom: '10px' }}>
          <strong>Data:</strong>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        Check console for detailed cache debugging info every 3 seconds
      </div>
      
      <button 
        onClick={() => queryClient.invalidateQueries({ queryKey: ['debug-test'] })}
        style={{ 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px',
          margin: '5px'
        }}
      >
        Refetch Data
      </button>
      
      <button 
        onClick={() => {
          queryClient.clear();
          console.log('🗑️ All cache cleared');
        }}
        style={{ 
          background: '#dc3545', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px',
          margin: '5px'
        }}
      >
        Clear All Cache
      </button>
    </div>
  );
};

export default DebugTestComponent;