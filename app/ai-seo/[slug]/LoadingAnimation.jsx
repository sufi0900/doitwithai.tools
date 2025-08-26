// components/LoadingAnimation.jsx
import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Your spinner SVG and text */}
        <div className="relative flex items-center justify-center mb-2 sm:mb-4 md:mb-6">
          <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
            <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200/60 dark:text-gray-700/60" />
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out" strokeDasharray="263.9" strokeDashoffset="131.95" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400/80 dark:text-gray-500/80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center space-y-1 sm:space-y-2 max-w-xs">
          <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Loading...</div>
          <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-all duration-500 shadow-lg backdrop-blur-sm border-2 bg-blue-50/90 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50">
            <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50"></div>
            <span className="font-semibold tracking-wide hidden xs:inline">Loading</span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-1"></div>
              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-2"></div>
              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;