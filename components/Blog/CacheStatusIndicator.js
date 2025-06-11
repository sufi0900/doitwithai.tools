import React from 'react';
import { useCache } from './CacheContext';

const CacheStatusIndicator = ({ cacheKey, className = "" }) => {
  const { cacheStatus, isOnline } = useCache();
  const status = cacheStatus[cacheKey];

  const getStatusInfo = () => {
    if (!isOnline) {
      return { color: 'bg-orange-500', text: 'Offline', icon: '📱' };
    }
    
    switch (status) {
      case 'fresh':
        return { color: 'bg-green-500', text: 'Live', icon: '🟢' };
      case 'stale':
        return { color: 'bg-yellow-500', text: 'Cached', icon: '🟡' };
      case 'stale-error':
        return { color: 'bg-orange-500', text: 'Cached (Offline)', icon: '🟠' };
      case 'error':
        return { color: 'bg-red-500', text: 'Error', icon: '🔴' };
      case 'offline':
        return { color: 'bg-gray-500', text: 'Offline Cache', icon: '⚫' };
      default:
        return { color: 'bg-blue-500', text: 'Loading', icon: '🔵' };
    }
  };

  const { color, text, icon } = getStatusInfo();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${color} ${className}`}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default CacheStatusIndicator;