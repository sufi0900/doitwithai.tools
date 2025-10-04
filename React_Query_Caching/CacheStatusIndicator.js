// React_Query_Caching/CacheStatusIndicator.js
import React from 'react';
import { useSanityCache } from './useSanityCache'; // Assuming this is the correct path

// A simple utility to render a badge
const Badge = ({ children, color, title }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '0.3em 0.6em',
      borderRadius: '0.25em',
      fontSize: '0.75em',
      fontWeight: 'bold',
      lineHeight: '1',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      color: 'white',
      backgroundColor: color,
      marginRight: '5px',
      opacity: 0.9,
      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    }}
    title={title}
  >
    {children}
  </span>
);

export const CacheStatusIndicator = ({
  isLoading,
  isStale,
  cacheSource,
  lastUpdated,
  error,
  componentName,
  refresh, // Pass the refresh function if you want a button
}) => {
  const formatTime = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  let statusText = '';
  let statusColor = '#6c757d'; // Grey
  let statusTitle = '';

  if (isLoading) {
    statusText = 'Loading...';
    statusColor = '#007bff'; // Blue
    statusTitle = 'Data is currently being fetched.';
  } else if (error) {
    statusText = 'Error!';
    statusColor = '#dc3545'; // Red
    statusTitle = `Error fetching data: ${error.message}`;
  } else if (isStale) {
    statusText = `Stale (${cacheSource})`;
    statusColor = '#ffc107'; // Yellow/Orange
    statusTitle = `Data is stale. Last updated: ${formatTime(lastUpdated)}. Will attempt background refresh.`;
  } else if (cacheSource === 'network') {
    statusText = 'Live (Network)';
    statusColor = '#28a745'; // Green
    statusTitle = `Data is fresh from network. Last updated: ${formatTime(lastUpdated)}.`;
  } else if (cacheSource && cacheSource.startsWith('cache')) {
    statusText = `Cached (${cacheSource.replace('cache-', '')})`;
    statusColor = '#17a2b8'; // Teal
    statusTitle = `Data served from cache. Last updated: ${formatTime(lastUpdated)}.`;
  } else if (cacheSource === 'offline-cache') {
    statusText = 'Offline (Cache)';
    statusColor = '#6f42c1'; // Purple
    statusTitle = `You are offline, serving from cache. Last updated: ${formatTime(lastUpdated)}.`;
  } else if (cacheSource === 'initial-server-data') {
    statusText = 'SSR/Initial';
    statusColor = '#6c757d'; // Grey
    statusTitle = `Data provided initially (SSR or initial data prop).`;
  } else {
    statusText = 'No Data/Unknown';
    statusColor = '#f8f9fa'; // Light grey/white (might need text color)
    statusTitle = `Cache status unknown or no data available.`;
  }

  return (
    <div
      style={{
        position: 'absolute', // Or relative, fixed, depending on your layout
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '5px 10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '0.8em',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <Badge color={statusColor} title={statusTitle}>
        {statusText}
      </Badge>
      {componentName && <span>{componentName}</span>}
      {lastUpdated && <span>(Updated: {formatTime(lastUpdated)})</span>}
      {error && <span style={{ color: '#dc3545' }} title={error.message}>!</span>}
      {refresh && (
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            marginLeft: '10px',
            padding: '3px 8px',
            fontSize: '0.7em',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
          }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};