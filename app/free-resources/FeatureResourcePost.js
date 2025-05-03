// components/Blog/FeatureResourcePost.js
import React from 'react';
import { Grid, Paper, Box, Typography, Button } from "@mui/material";
import ResourceCardBase from './ResourceCardBase';
import { urlForImage } from "@/sanity/lib/image";

const VerticalFeaturePost = ({ resource }) => {
  return (
    <ResourceCardBase
  resource={resource}
  renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
<div className="w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform-gpu mb-8">
<div className="grid grid-cols-1 md:grid-cols-2 min-h-[24rem] relative">
{/* Left side: Preview */}
<div className="relative h-96 md:h-auto overflow-hidden">
      <div className="absolute inset-0 z-0 transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-1">
        {renderPreviewContent()}
      </div>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 z-10 pointer-events-none" />

      {/* Resource Type Badge */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-sm font-bold uppercase bg-primary text-white shadow-md">
        {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
      </div>

      {/* Resource Format Badge */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-medium uppercase bg-white/90 text-gray-800 dark:bg-gray-700 dark:text-gray-200 shadow">
        {resource.resourceFormat}
      </div>
      </div>

        {/* Right side: Content */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">
              {resource.title}
            </h2>
            {resource.overview && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {resource.overview}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Added: {new Date(resource.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openModal()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Quick View
              </button>

              <button
                onClick={handleResourceAccess}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {resource.resourceFormat === 'text' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    View Prompt
                  </>
                ) : resource.resourceLinkType === 'external' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Access Resource
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
/>


  );
};

export default VerticalFeaturePost;