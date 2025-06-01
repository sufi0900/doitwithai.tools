// components/ResourceSkeleton.js
import React from 'react';

const ResourceSkeleton = () => {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-3">
      <div className="relative h-80 rounded-lg shadow-md overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full w-16 h-5 bg-gray-300 dark:bg-gray-600"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSkeleton;