// components/ResourceCard.js - FIXED VERSION FOR CAROUSEL
import React from 'react';
import { getFileUrl, renderPreviewContent,  } from "@/app/free-ai-resources/resourceUtils";
import ResourceModal from '@/app/free-ai-resources/ResourceModal';
import Link from 'next/link';

// Global modal state tracking
// In a production app, this could be moved to React Context
let activeModalId = null;

export const closeAllModals = () => {
  // Dispatch a custom event to close all modals
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('closeAllResourceModals', {
      detail: { closeAll: true }
    }));
  }
  activeModalId = null;
};

export const openModalById = (id) => {
  // Close any open modal first
  closeAllModals();
  
  // Then open the requested one
  activeModalId = id;
  
  // Dispatch a custom event to open the specific modal
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openResourceModal', {
      detail: { id }
    }));
  }
};

const ResourceCard = ({ resource, wrapperClassName = "" }) => {

  const handleResourceAccess = () => {
    // For prompt resources, open the modal
    if (resource.resourceFormat === 'text' && resource.promptContent) {
      // Use the global modal opener to ensure only one modal is open
      openModalById(resource._id);
      return;
    }
    
    // Handle downloads and external links
    if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
      const fileUrl = getFileUrl(resource.resourceFile);
      const fileName = resource.resourceFile.originalFilename || 
        `${resource.title.replace(/\s+/g, '-').toLowerCase()}`;
      
      if (!fileUrl) {
        console.error('Could not determine file URL for', resource.title);
        return;
      }
      
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (resource.resourceLink) {
      window.open(resource.resourceLink, '_blank');
    }
  };

  // Custom prompt preview rendering
  const renderPromptCard = () => {
    if (!resource.promptContent || !Array.isArray(resource.promptContent) || resource.promptContent.length === 0) {
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 h-full rounded-lg flex flex-col">
          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
            No prompt content available
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 h-full rounded-lg flex flex-col overflow-hidden">
        {/* Terminal-style header */}
        <div className="h-8 bg-gray-800 dark:bg-black flex items-center px-3 border-b border-white/10 mb-3 rounded-t-lg">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-400 ml-auto">
            prompt.txt
          </div>
        </div>
  
        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
          <span className="text-teal-600 dark:text-teal-400">$</span> cat prompt.txt
        </div>
  
        {/* Prompt List Scroll Area */}
        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 flex-1 overflow-y-auto space-y-2 pr-1">
          {resource.promptContent.map((prompt, idx) => (
            <div key={idx} className="relative">
              <span className="text-purple-500">➤</span>{" "}
              {prompt.promptText?.length > 180
                ? `${prompt.promptText.slice(0, 180)}...`
                : prompt.promptText}
            </div>
          ))}
        </div>
  
       
      </div>
    );
  };
  
  return (
    <>
      <div className={`${wrapperClassName} group w-full h-full`}>
      <div className="h-full min-h-[450px] max-h-[450px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 flex flex-col">
      {/* Resource Preview */}
          <div className="relative h-56">
            {resource.resourceFormat === 'text' ? (
              <div className="h-full">
                {renderPromptCard()}
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
                <div className="absolute inset-0 bg-gray-800">
                  {renderPreviewContent(resource)}
                </div>
                <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary text-white">
                  {resource.resourceFormat}
                </div>
              </>
            )}
          </div>

          {/* Resource Details */}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-1">
              {resource.title}
            </h3>
            
            {resource.overview && (
              <p className="text-gray-600 dark:text-gray-300  text-base mb-4 line-clamp-2 flex-grow">
                {resource.overview}
              </p>
            )}
            
            <div className="mt-auto flex flex-col space-y-2">
              {resource.publishedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(resource.publishedAt).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openModalById(resource._id)}
                  className="py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors text-sm"
                >
                  Quick View
                </button>
                
                <button
   onClick={handleResourceAccess}
   className="w-full bg-primary text-white font-medium px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
   aria-label={
     resource.resourceFormat === 'text' ? `View prompt ${resource.title}` :
     resource.resourceLinkType === 'external' ? `Access resource ${resource.title}` :
     `Download ${resource.title}`
   }
    >
 {resource.resourceFormat === 'text' ? (
          <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Prompt
        </>
      ) : resource.resourceLinkType === 'external' ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Access Resource
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

      {/* Modals are now rendered by the ResourceModalsProvider component */}
    </>
  );
};

export default ResourceCard;