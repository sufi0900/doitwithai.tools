import React, { useState, useEffect } from 'react';

const CacheStatusIndicator = ({ isFromCache, onRefresh }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isFromCache) {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isFromCache]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-sm font-medium">Loaded from cache</span>
      <button
        onClick={onRefresh}
        className="ml-2 text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded transition-colors"
      >
        Refresh
      </button>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-1 text-green-600 hover:text-green-800"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default CacheStatusIndicator;