"use client";
import React, { useState } from 'react';

const ArticleCacheStatusIndicator = ({ 
  isFromCache, 
  onRefresh, 
  isLoading = false,
  dataSource = null,
  componentCount = 0,
  className = ""
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (componentCount === 0) return null;

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        text: 'Loading...',
        bgClass: 'bg-blue-500',
        icon: '⟳',
        animate: 'animate-spin'
      };
    }

    if (dataSource === 'offline') {
      return {
        text: 'Offline',
        bgClass: 'bg-orange-500',
        icon: '📶',
        animate: ''
      };
    }

    if (dataSource === 'error') {
      return {
        text: 'Error',
        bgClass: 'bg-red-500',
        icon: '⚠',
        animate: ''
      };
    }

    if (isFromCache) {
      return {
        text: 'Cached',
        bgClass: 'bg-yellow-500',
        icon: '📦',
        animate: ''
      };
    }

    return {
      text: 'Fresh',
      bgClass: 'bg-green-500',
      icon: '✓',
      animate: ''
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onRefresh}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm font-medium
          transition-all duration-200 hover:shadow-lg active:scale-95
          ${statusInfo.bgClass}
          ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:opacity-90'}
        `}
      >
        <span className={`text-lg ${statusInfo.animate}`}>
          {statusInfo.icon}
        </span>
        <span>{statusInfo.text}</span>
        {componentCount > 0 && (
          <span className="bg-black bg-opacity-20 px-2 py-1 rounded text-xs">
            {componentCount}
          </span>
        )}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          <div className="text-center">
            <div className="font-semibold">Article Data Status</div>
            <div className="mt-1">
              Status: {statusInfo.text} | Components: {componentCount}
            </div>
            <div className="mt-1 text-gray-300">
              Click to refresh all article data
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default ArticleCacheStatusIndicator;