// components/ResourceCard.js
import React from 'react';
import ResourceCardBase from './ResourceCardBase';

const ResourceCard = ({ resource }) => {
  
  return (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
        <div className="w-full sm:w-1/2 lg:w-1/3 p-3">
          <article 
            className="relative h-80 rounded-lg shadow-md overflow-hidden group"
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

            <div className="relative h-80 rounded-lg shadow-md overflow-hidden group">
              {/* Main Resource Preview */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
              
              <div className="absolute inset-0 overflow-hidden bg-gray-800">
                {renderPreviewContent()}
              </div>
              
              {/* Resource Type Badge */}
              <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-xs font-bold uppercase text-white ${
                resource.resourceFormat === 'aitool' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-primary'
              }`}>
                {resource.resourceFormat === 'aitool' ? 'AI Tool' : resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
              </div>

              {/* AI Tool specific badges */}
              {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
                <>
                  {/* Pricing Badge */}
                  {resource.aiToolDetails.pricingModel && (
                    <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-medium ${
                      resource.aiToolDetails.pricingModel === 'free' ? 'bg-green-500 text-white' :
                      resource.aiToolDetails.pricingModel === 'freemium' ? 'bg-blue-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {resource.aiToolDetails.pricingModel.charAt(0).toUpperCase() + resource.aiToolDetails.pricingModel.slice(1)}
                    </div>
                  )}

                  {/* Rating Badge */}
                  {resource.aiToolDetails.rating && (
                    <div className="absolute top-12 right-3 z-20 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white flex items-center gap-1">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      {resource.aiToolDetails.rating}
                    </div>
                  )}
                </>
              )}
            
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white transition-all duration-300">
                <h3 className="text-lg font-bold mb-1 line-clamp-1" itemProp="headline">
                  {resource.title}
                </h3>

                {/* AI Tool Category Display */}
                {resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolCategory && (
                  <div className="text-xs text-gray-300 opacity-80 mb-1">
                    {resource.aiToolDetails.toolCategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/-/g, ' & ')}
                  </div>
                )}

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

                  {/* AI Tool specific preview info */}
                  {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
                    <div className="mb-3 space-y-1">
                      {resource.aiToolDetails.functionality && resource.aiToolDetails.functionality.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.aiToolDetails.functionality.slice(0, 3).map((func, idx) => (
                            <span key={idx} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                              {func}
                            </span>
                          ))}
                          {resource.aiToolDetails.functionality.length > 3 && (
                            <span className="text-xs text-gray-300">+{resource.aiToolDetails.functionality.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom content with buttons */}
                <div className="flex flex-col items-center gap-3">
                  <button 
                    onClick={() => openModal(true)}
                    className="w-full bg-white/90 text-gray-900 font-medium px-4 py-2 rounded-md hover:bg-white transition-colors flex items-center justify-center gap-2"
                    aria-label={`Quick view ${resource.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Quick View
                  </button>
                  
                  <button
                    onClick={handleResourceAccess}
                    className={`w-full font-medium px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      resource.resourceFormat === 'aitool' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                    aria-label={
                      resource.resourceFormat === 'aitool' ? `Access AI tool ${resource.title}` :
                      resource.resourceFormat === 'text' ? `View prompt ${resource.title}` :
                      resource.resourceLinkType === 'external' ? `Access resource ${resource.title}` :
                      `Download ${resource.title}`
                    }
                  >
                    {resource.resourceFormat === 'aitool' ? (
                      <>
                      <a
                      href={resource.aiToolDetails?.toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                      aria-label={`Access AI tool ${resource.title}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Try AI Tool
</a>
                      </>
                    ) : resource.resourceFormat === 'text' ? (
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
          </article>
        </div>
      )}
    />
  );
};

export default ResourceCard;