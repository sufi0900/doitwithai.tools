import React from 'react';
import SidebarResourceCard from './SidebarResourceCard';
import ResourceModalsProvider from './ResourceModalsProvider';
import Link from 'next/link';

// New Icon Import
import { ArrowRightCircle } from 'lucide-react';

const SidebarRelatedResources = ({ resources, isLoading = false, maxItems = 3 }) => {
  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="p-6 space-y-4">
            {Array.from({ length: maxItems }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!resources || resources.length === 0) {
    return null;
  }

  const displayResources = resources.slice(0, maxItems);

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <ul className="p-6 space-y-4">
            {displayResources.map((resource, index) => (
              <li key={resource._id} className="group/item relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
                <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
                  <SidebarResourceCard resource={resource} />
                </div>
                {index < displayResources.length - 1 && (
                  <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                )}
              </li>
            ))}
            
            {/* View All Resources Link */}
            <li className="pt-4">
              <Link 
                href="/free-ai-resources" 
                className="block group/link relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-indigo-700 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <ArrowRightCircle className="h-4 w-4" />
                  View All Resources
                  <span className="group-hover/link:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <ResourceModalsProvider resources={resources} />
    </>
  );
};

export default SidebarRelatedResources;