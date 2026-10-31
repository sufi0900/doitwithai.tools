// components/SidebarResourceCard.js
import React from 'react';
// Import ResourceCardBase to leverage its shared logic for modal and resource access
import ResourceCardBase from './ResourceCardBase'; 
// Note: getFileUrl and renderPreviewContent are assumed to be in a shared utility file
// and are used within the renderCompactPreview function.
// If they are not globally available or passed down, you might need to adjust their import path.
import { getFileUrl, renderPreviewContent } from "@/app/free-ai-resources/resourceUtils";


const SidebarResourceCard = ({ resource }) => {

  // Compact preview rendering for sidebar
  // This function remains largely the same, but it now receives the resource directly
  // and uses the renderPreviewContent from resourceUtils.
  const renderCompactPreview = (resourceToRender) => {
    if (resourceToRender.resourceFormat === 'text') {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-800 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      );
    }

    return (
      <div className="relative w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
        <div className="absolute inset-0">
          {renderPreviewContent(resourceToRender)}
        </div>
        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold uppercase bg-primary text-white text-[8px]">
          {resourceToRender.resourceFormat}
        </div>
      </div>
    );
  };

  return (
    // Wrap the SidebarResourceCard content with ResourceCardBase
    // This allows it to inherit the modal and resource access logic
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource: baseResource, renderPreviewContent: baseRenderPreviewContent, handleResourceAccess, openModal }) => (
        // The main container for the sidebar card
        // The onClick for the entire card now uses openModal for a quick view
        <div className="flex gap-3 group/card cursor-pointer" onClick={() => openModal(true)}>
          {/* Render the compact preview using the local function */}
          {renderCompactPreview(baseResource)}
          
          <div className="flex-1 min-w-0">
            {/* Resource title */}
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
              {baseResource.title}
            </h4>
            
            {/* Resource overview/description */}
            {baseResource.overview && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {baseResource.overview}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {/* Published date */}
              {baseResource.publishedAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(baseResource.publishedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-1">
                {/* View button - opens the modal for quick view */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the card's onClick from firing
                    openModal(true); // Open the modal
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  View
                </button>
                
                {/* Get/Go/Download button - handles resource access */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the card's onClick from firing
                    handleResourceAccess(); // Use the handleResourceAccess from ResourceCardBase
                  }}
                  className="text-xs px-2 py-1 bg-primary hover:bg-primary-dark text-white rounded transition-colors"
                >
                  {baseResource.resourceFormat === 'text' ? 'Get' : 
                   baseResource.resourceLinkType === 'external' ? 'Go' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default SidebarResourceCard;