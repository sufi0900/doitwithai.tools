// components/Blog/FeatureResourcePost.js
import React from 'react';
import ResourceCardBase from './ResourceCardBase';
import Link from 'next/link';
import { Card } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const ResourceFeaturePost = ({ resource }) => {
  return (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
        <Card
          sx={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px) scale(1.01)",
              boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
            },
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid #e2e8f0",
            display: "flex", // Added to make the Card a flex container
            flexDirection: "column",
          }}
          className="group shadow-lg hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {/* Main Card Grid */}
          {/* Removed min-h-[24rem] to allow height to be dynamic */}
          <div className="grid grid-cols-1 md:grid-cols-2 relative">
            {/* Left side: Preview */}
            {/* Height is now responsive to mobile and auto on desktop */}
            <div className="relative h-96 md:h-auto overflow-hidden">
              <div className="absolute inset-0 z-0 transition-transform duration-500 ease-out group-hover:scale-110">
                {renderPreviewContent()}
              </div>

              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Reading Progress Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Resource Type Badge (Enhanced) */}
              <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold uppercase text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl backdrop-blur-sm border border-white/20">
                <LocalOfferIcon style={{fontSize:"12px"}} />   
                {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
              </div>

              {/* Resource Format Badge (Subtle enhancement) */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-medium uppercase bg-white/90 text-gray-800 dark:bg-gray-700 dark:text-gray-200 shadow backdrop-blur-sm border border-gray-100 dark:border-gray-600">
                {resource.resourceFormat}
              </div>
            </div>

            {/* Right side: Content */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-3"> {/* Added a gap for better spacing */}
                <h2 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {resource.title}
                </h2>
                {resource.overview && (
                  <p className="line-clamp-3 text-base leading-relaxed text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {resource.overview}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
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
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  Added: {new Date(resource.publishedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {/* Quick View Button (Subtle styling) */}
                  <button
                    onClick={() => openModal()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Quick View
                  </button>

                  {/* Main Action Button (Enhanced) */}
                  <Link
                    href="#"
                    onClick={handleResourceAccess}
                    className="group/button flex-1 relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl  focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    {/* Button Content */}
                    <span className="relative z-10 flex items-center gap-2">
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
                    </span>
                    <ArrowForward
                      className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110"
                      sx={{ fontSize: 18 }}
                    />
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-30 transition-opacity duration-300 blur-sm" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
        </Card>
      )}
    />
  );
};

export default ResourceFeaturePost;