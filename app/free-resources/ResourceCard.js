// components/ResourceCard.js
import React from 'react';
import ResourceCardBase from './ResourceCardBase';
import { getResourceAlt } from "./resourceUtils";

const ResourceCard = ({ resource }) => {
  return (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
        <div className="w-full sm:w-1/2 lg:w-1/3 p-3">
          <div 
            className="relative h-80 rounded-lg shadow-md overflow-hidden group"
            itemScope={resource.structuredData !== 'none'} 
            itemType={resource.structuredData !== 'none' ? `https://schema.org/${resource.structuredData}` : undefined}
          >
            {/* Main Resource Preview */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
            
            <div className="absolute inset-0 overflow-hidden bg-gray-800">
              {renderPreviewContent()}
            </div>
            
            {/* Your existing card UI */}
            {/* ... */}
            
            {/* Resource Type Badge */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-primary text-white">
              {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
            </div>
            {resource.structuredData !== 'none' && (
              <>
                <meta itemProp="name" content={resource.seoTitle || resource.title} />
                <meta itemProp="description" content={resource.seoDescription || resource.overview || ""} />
                {resource.publishedAt && <meta itemProp="datePublished" content={resource.publishedAt} />}
                {resource.seoKeywords && <meta itemProp="keywords" content={resource.seoKeywords.join(", ")} />}
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white transition-all duration-300">
<h3 className="text-lg font-bold mb-1 line-clamp-1">
  {resource.title}
</h3>

{/* Subtle display of the publishing date */}
<div className="text-xs text-gray-300 opacity-60">
  {new Date(resource.publishedAt).toLocaleDateString('en-US', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  })}
</div>
</div>

{/* Enhanced Hover Overlay with Info and Buttons */}
<div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/70 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
  {/* Top content with full title and overview */}
  <div className="overflow-hidden">
    <h3 className="text-lg font-bold text-white mb-2">
      {resource.title}
    </h3>
    {resource.overview && (
      <p className="text-sm text-gray-200 mb-3 line-clamp-3">
        {resource.overview}
      </p>
    )}
  </div>

  {/* Bottom content with buttons */}
  <div className="flex flex-col items-center gap-3">
    <button 
      onClick={() => openModal(true)}
      className="w-full bg-white/90 text-gray-900 font-medium px-4 py-2 rounded-md hover:bg-white transition-colors flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      Quick View
    </button>
    
    <button
      onClick={handleResourceAccess}
      className="w-full bg-primary text-white font-medium px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
    >
      {resource.resourceType === 'prompt' ? (
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
      )}
    />
  );
};

export default ResourceCard;