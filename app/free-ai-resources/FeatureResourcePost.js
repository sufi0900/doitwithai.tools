// components/Blog/FeatureResourcePost.js
"use client";
import React from 'react';
import ResourceCardBase from './ResourceCardBase';
import Link from 'next/link';
import { Card } from '@mui/material';
import { ArrowForward, PlayArrow, Description, Image as ImageIcon, Psychology } from '@mui/icons-material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Helper function to handle resource access
const handleResourceAccess = (resource) => {
  let url = '';
  if (resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl) {
    url = resource.aiToolDetails.toolUrl;
  } else if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
    url = resource.resourceFile.url;
  } else if (resource.resourceLink) {
    url = resource.resourceLink;
  }

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Get the proper resource type label from tags or fallback to resourceType
const getResourceTypeLabel = (resource) => {
  if (resource.tags && resource.tags.length > 0) {
    return resource.tags[0];
  }
  return resource.resourceType?.charAt(0).toUpperCase() + resource.resourceType?.slice(1) || 'Resource';
};

// Get icon based on resource format
const getResourceIcon = (resourceFormat) => {
  switch (resourceFormat) {
    case 'image':
      return <ImageIcon style={{ fontSize: '12px' }} />;
    case 'video':
      return <PlayArrow style={{ fontSize: '12px' }} />;
    case 'text':
      return <Psychology style={{ fontSize: '12px' }} />;
    case 'document':
      return <Description style={{ fontSize: '12px' }} />;
    case 'aitool':
      return <LocalOfferIcon style={{ fontSize: '12px' }} />;
    default:
      return <LocalOfferIcon style={{ fontSize: '12px' }} />;
  }
};

const getResourceActionButton = (resource) => {
  const { resourceFormat, resourceLinkType } = resource;
  
  // Base button text and icon
  let buttonText = "Access Resource";
  let buttonIcon = <LocalOfferIcon style={{ fontSize: '16px' }} />;

  if (resourceFormat === 'text') {
    buttonText = "View Prompt";
    buttonIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    );
  } else if (resourceFormat === 'video') {
    buttonText = "Watch Now";
    buttonIcon = <PlayArrow sx={{ fontSize: 16 }} />;
  } else if (resourceFormat === 'document') {
    buttonText = "Open Document";
    buttonIcon = <Description sx={{ fontSize: 16 }} />;
  } else if (resourceLinkType === 'direct') {
    buttonText = "Download";
    buttonIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {buttonIcon}
        {buttonText}
      </span>
      <ArrowForward
        className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110"
        sx={{ fontSize: 18 }}
      />
    </>
  );
};

const ResourceFeaturePost = ({ resource }) => {
  return (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, openModal }) => (
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
            display: "flex",
            flexDirection: "column",
          }}
          className="group shadow-lg hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {/* Main Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 relative">
            {/* Left side: Preview */}
            <div className="relative h-96 md:h-auto overflow-hidden">
              <div className="absolute inset-0 z-0 transition-transform duration-500 ease-out group-hover:scale-110">
                {renderPreviewContent()}
              </div>

              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Reading Progress Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Resource Type Badge (Dynamic and Enhanced) */}
              <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold uppercase text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl backdrop-blur-sm border border-white/20">
                {getResourceIcon(resource.resourceFormat)}
                {getResourceTypeLabel(resource)}
              </div>

              {/* Resource Format Badge (Subtle enhancement) - Removed since the main badge is now dynamic */}
            </div>

            {/* Right side: Content */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
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
                  {/* Quick View Button */}
                  <button
                    onClick={() => openModal()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Quick View
                  </button>

                  {/* Main Action Button (Dynamic and Enhanced) */}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResourceAccess(resource);
                    }}
                    className="group/button flex-1 relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    {/* Button Content */}
                    {getResourceActionButton(resource)}

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