// components/ResourceCard.js
import React from 'react';
import ResourceCardBase from './ResourceCardBase';
import Link from 'next/link';
import { Card } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const ResourceCard = ({ resource }) => {
  return (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
        <div className="w-full sm:w-1/2 lg:w-1/3 p-3">
          <Card
            sx={{
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px) scale(1.02)",
                boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
              },
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              height: "100%",
            }}
            className="group shadow-lg hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
            itemScope
            itemType={`https://schema.org/${
              resource.resourceFormat === 'image' ? 'ImageObject' :
              resource.resourceFormat === 'video' ? 'VideoObject' :
              resource.resourceFormat === 'text' ? 'TextDigitalDocument' :
              resource.resourceFormat === 'aitool' ? 'SoftwareApplication' : 'DigitalDocument'
            }`}
          >
            {/* Add microdata */}
            <meta itemProp="name" content={resource.title} />
            {resource.overview && <meta itemProp="description" content={resource.overview} />}
            {resource.publishedAt && <meta itemProp="datePublished" content={resource.publishedAt} />}
            {resource.tags && <meta itemProp="keywords" content={resource.tags.join(', ')} />}
            
            {/* AI Tool specific microdata */}
            {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
              <>
                <meta itemProp="applicationCategory" content={resource.aiToolDetails.toolCategory} />
                <meta itemProp="operatingSystem" content="Web Browser" />
                {resource.aiToolDetails.pricingModel && (
                  <meta itemProp="offers" content={resource.aiToolDetails.pricingModel} />
                )}
                {resource.aiToolDetails.rating && (
                  <meta itemProp="aggregateRating" content={resource.aiToolDetails.rating} />
                )}
              </>
            )}

            {/* --- Image and Badges Section --- */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 overflow-hidden bg-gray-800 transition-transform duration-500 ease-out group-hover:scale-110">
                {renderPreviewContent()}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-100 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold uppercase text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl backdrop-blur-sm border border-white/20">
                <LocalOfferIcon style={{fontSize:"12px"}} />   
                {resource.resourceFormat === 'aitool' ? 'AI Tool' : resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
              </div>

              {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
                <>
                  {resource.aiToolDetails.pricingModel && (
                    <div className={`absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full text-xs font-medium uppercase text-white shadow-sm transition-colors ${
                      resource.aiToolDetails.pricingModel === 'free' ? 'bg-green-600' :
                      resource.aiToolDetails.pricingModel === 'freemium' ? 'bg-blue-600' :
                      'bg-orange-600'
                    }`}>
                      {resource.aiToolDetails.pricingModel.charAt(0).toUpperCase() + resource.aiToolDetails.pricingModel.slice(1)}
                    </div>
                  )}

                  {resource.aiToolDetails.rating && (
                    <div className="absolute top-12 right-3 z-20 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-500 text-white flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      {resource.aiToolDetails.rating}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* --- Content and Buttons Section --- */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" itemProp="headline">
                  {resource.title}
                </h3>
                {resource.overview && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-3 line-clamp-3">
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

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => openModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  aria-label={`Quick view ${resource.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Quick View
                </button>
                
                {/* Conditional rendering for the main action button */}
                {resource.resourceFormat === 'text' ? (
                  // NEW: Render as a button that opens the modal
                  <button
                    onClick={() => openModal(true)}
                    className="group/button relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                    aria-label={`View prompt for ${resource.title}`}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    {/* Button Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      View Prompt
                    </span>
                    <ArrowForward
                      className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110"
                      sx={{ fontSize: 18 }}
                    />
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-30 transition-opacity duration-300 blur-sm" />
                  </button>
                ) : (
                  // Keep the existing Link for other resource types
                  <Link
                    href={
                      resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl
                        ? resource.aiToolDetails.toolUrl
                        : resource.resourceLinkType === 'external' ? resource.resourceLink : '/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/button relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                    aria-label={
                      resource.resourceFormat === 'aitool' ? `Try ${resource.title}` :
                      resource.resourceLinkType === 'external' ? `Access ${resource.title}` : `Download ${resource.title}`
                    }
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    {/* Button Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      {resource.resourceFormat === 'aitool' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Try AI Tool
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                          Access Resource
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
                )}
              </div>
            </div>
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
          </Card>
        </div>
      )}
    />
  );
};

export default ResourceCard;