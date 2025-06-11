// components/Blog/PageRefreshButton.js
import React, { useState } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';
import { useGlobalOfflineStatus } from './GlobalOfflineStatusContext';

const PageRefreshButton = ({ className = "" }) => {
  const { 
    isRefreshing, 
    refreshAll, 
    refreshCount, 
    getDataSourceStats, 
    pageType, 
    hasUpdatesAvailable, 
    hasRecentlyFreshData 
  } = usePageRefresh();
  const { isAnyComponentCurrentlyOffline, isAnyComponentCurrentlyCached, isBrowserOnline } = useGlobalOfflineStatus();
  const [showDetails, setShowDetails] = useState(false);
  const [isOfflineRetrying, setIsOfflineRetrying] = useState(false);

  if (refreshCount === 0) return null;

  const stats = getDataSourceStats();
  const hasOfflineComponents = isAnyComponentCurrentlyOffline;
  const hasCachedComponents = isAnyComponentCurrentlyCached;
  const isCompletelyOffline = !isBrowserOnline;

  // Handle offline retry
  const handleOfflineRetry = async () => {
    setIsOfflineRetrying(true);
    try {
      await refreshAll();
    } finally {
      setIsOfflineRetrying(false);
    }
  };

  // Determine button state and styling based on priority
  const getButtonState = () => {
    // Priority 1: Offline state
    if (isCompletelyOffline || hasOfflineComponents) {
      return {
        status: 'offline',
        bgClass: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 dark:from-orange-600 dark:via-red-600 dark:to-pink-600 dark:hover:from-orange-700 dark:hover:via-red-700 dark:hover:to-pink-700',
        textClass: 'text-white',
        borderClass: 'border-orange-300 dark:border-orange-500',
        glowClass: 'shadow-orange-500/25 hover:shadow-orange-500/40',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        ),
        statusText: 'Offline',
        needsAttention: true,
        tooltipMessage: 'You are offline. Using cached content.'
      };
    }

    // Priority 2: Updates available from CMS (NEW PRO STATUS)
    if (hasUpdatesAvailable) {
      return {
        status: 'updates-available',
        bgClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 dark:hover:from-emerald-700 dark:hover:via-teal-700 dark:hover:to-cyan-700',
        textClass: 'text-white',
        borderClass: 'border-emerald-300 dark:border-emerald-500',
        glowClass: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        ),
        statusText: 'Updates Available',
        needsAttention: true,
        tooltipMessage: 'New content updates are available from the server. Click to refresh.',
        pulse: true
      };
    }

    // Priority 3: Recently refreshed (truly fresh data)
    if (hasRecentlyFreshData()) {
      return {
        status: 'fresh',
        bgClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800',
        textClass: 'text-white',
        borderClass: 'border-green-300 dark:border-green-500',
        glowClass: 'shadow-green-500/25 hover:shadow-green-500/40',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        statusText: 'Fresh',
        needsAttention: false,
        tooltipMessage: 'All data is fresh and up-to-date. No refresh needed.'
      };
    }

    // Priority 4: Cached data (default state for returning users)
    return {
      status: 'cached',
      bgClass: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600 dark:hover:from-purple-700 dark:hover:via-indigo-700 dark:hover:to-blue-700',
      textClass: 'text-white',
      borderClass: 'border-purple-300 dark:border-purple-500',
      glowClass: 'shadow-purple-500/25 hover:shadow-purple-500/40',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      statusText: 'Cached',
      needsAttention: false,
      tooltipMessage: 'Showing cached content. No recent updates detected.'
    };
  };

  const buttonState = getButtonState();
  const isCurrentlyRefreshing = isRefreshing || isOfflineRetrying;

  // Choose the appropriate action based on state
  const handleButtonClick = () => {
    if (isCompletelyOffline || hasOfflineComponents) {
      handleOfflineRetry();
    } else {
      refreshAll();
    }
  };

  // Render offline indicator
  if (isCompletelyOffline || hasOfflineComponents) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full mx-4">
        <div className="relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-[2px]">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-75 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-2">
                    <svg className="h-5 w-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-gray-100">
                  <p className="font-bold text-base leading-tight">🔌 You're Offline</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {refreshCount} components • Using cached content
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleOfflineRetry}
                  disabled={isOfflineRetrying}
                  className={`relative overflow-hidden px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 ${
                    isOfflineRetrying
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isOfflineRetrying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  
                  <div className={`flex items-center space-x-2 ${isOfflineRetrying ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular button for online states
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Enhanced Details Tooltip */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-3 w-80 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-5 text-sm animate-fadeInUp backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${
              buttonState.status === 'updates-available' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              buttonState.status === 'fresh' ? 'bg-green-100 dark:bg-green-900/30' :
              buttonState.status === 'cached' ? 'bg-purple-100 dark:bg-purple-900/30' : 
              'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {buttonState.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white">{pageType} Page Status</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{refreshCount} components active</p>
            </div>
            {/* Status Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              buttonState.status === 'updates-available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
              buttonState.status === 'fresh' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              buttonState.status === 'cached' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {buttonState.statusText}
            </div>
          </div>

          {/* Special message for updates available */}
          {hasUpdatesAvailable && (
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="font-semibold text-emerald-800 dark:text-emerald-400">New Updates Available!</span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Fresh content has been published. Click refresh to get the latest updates.
              </p>
            </div>
          )}

          {/* Connection Status */}
          <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Connection</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
          </div>

          {/* Data Sources Breakdown */}
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Data Sources</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">Fresh Data</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs">{stats.fresh}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cached Data</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded text-xs">{stats.cache}</span>
              </div>
              {stats.error > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Errors</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-xs">{stats.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Info */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {buttonState.tooltipMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main Button with enhanced visual states */}
      <button
        onClick={handleButtonClick}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        disabled={isCurrentlyRefreshing}
        className={`group relative flex items-center space-x-3 rounded-2xl px-6 py-4 shadow-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 border backdrop-blur-lg ${buttonState.bgClass} ${buttonState.textClass} ${buttonState.borderClass} ${buttonState.glowClass} hover:shadow-3xl hover:scale-105 active:scale-95 transform ${className} ${
          buttonState.pulse ? 'animate-pulse' : ''
        }`}
        title={`${buttonState.statusText} - ${buttonState.tooltipMessage}`}
      >
        {/* Notification dot for updates available */}
        {hasUpdatesAvailable && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
          </div>
        )}

        {/* Status Section */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            {buttonState.icon}
            {/* Connection indicator dot */}
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white ${
              buttonState.status === 'updates-available' ? 'bg-yellow-400 animate-bounce' :
              buttonState.status === 'fresh' ? 'bg-green-400 animate-pulse' :
              'bg-blue-400 animate-pulse'
            }`}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-none">{buttonState.statusText}</span>
            <span className="text-xs opacity-90 leading-none">{refreshCount} Active</span>
          </div>
        </div>

        {/* Refresh Icon */}
        <div className="relative">
          <svg
            className={`h-5 w-5 transition-transform duration-500 ${
              isCurrentlyRefreshing ? 'animate-spin' : 'group-hover:rotate-180 group-hover:scale-110'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        {/* Action Text */}
        <span className="font-bold text-sm">
          {isCurrentlyRefreshing ? 'Refreshing...' : 
           hasUpdatesAvailable ? 'Update Now' : 'Refresh'}
        </span>
      </button>
    </div>
  );
};

export default PageRefreshButton;