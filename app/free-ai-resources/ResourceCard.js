// Corrected code for ResourceCard.jsx

/* eslint-disable @next/next/no-img-element */
import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@mui/material';
import { ArrowForward, LocalOfferOutlined, PlayCircleOutline, DescriptionOutlined, CodeOutlined, TextFieldsOutlined, SmartToyOutlined, StarOutlined } from '@mui/icons-material';
import ResourceCardBase from './ResourceCardBase';
import { urlForImage } from "@/sanity/lib/image";

// Helper function to get the correct tag label
const getTagLabel = (resource) => {
  if (resource.tags && resource.tags.length > 0) {
    // Return the name of the first tag if it exists
    return resource.tags[0]?.name;
  }
  // Fallback to a formatted resource type if no tags are present
  const formatMap = {
    'aitool': 'AI Tool',
    'image': 'Image',
    'video': 'Video',
    'document': 'Document',
    'text': 'Prompt',
  };
  return formatMap[resource.resourceFormat] || 'Resource';
};

const ResourceCard = ({ resource }) => {
  const imageUrl = resource.mainImage ? urlForImage(resource.mainImage).url() : "https://placehold.co/400x200/e5e7eb/6b7280?text=No+Preview";

  // Memoize the icon to prevent re-renders
  const cardIcon = useMemo(() => {
    switch (resource.resourceFormat) {
      case 'image': return <PlayCircleOutline sx={{ fontSize: 24 }} />;
      case 'video': return <PlayCircleOutline sx={{ fontSize: 24 }} />;
      case 'document': return <DescriptionOutlined sx={{ fontSize: 24 }} />;
      case 'text': return <TextFieldsOutlined sx={{ fontSize: 24 }} />;
      case 'aitool': return <SmartToyOutlined sx={{ fontSize: 24 }} />;
      default: return <LocalOfferOutlined sx={{ fontSize: 24 }} />;
    }
  }, [resource.resourceFormat]);

  const renderContent = (renderPreviewContent, openModal) => {
    switch (resource.resourceFormat) {
      case 'image':
      case 'video':
        return (
          <div className="relative w-full h-full flex flex-col justify-end">
            {/* Background Image / Video Preview */}
            <div className="absolute inset-0 z-0">
              <img
                src={imageUrl}
                alt={resource.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                itemProp="image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content and Buttons - Hidden until hover */}
            <div className="relative z-20 p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <h3 className="text-xl font-bold line-clamp-2 text-white mb-2" itemProp="headline">
                {resource.title}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => openModal(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                  aria-label={`Quickview ${resource.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg>
                  Quick View
                </button>
                <Link
                  href={resource.resourceLinkType === 'external' ? resource.resourceLink : resource.slug?.current ? `/${resource.slug.current}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/button relative inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden"
                  aria-label={`Access ${resource.title}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {resource.resourceFormat === 'video' ? 'Watch Video' : 'View Image'}
                  </span>
                  <ArrowForward className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" sx={{ fontSize: 18 }} />
                </Link>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col flex-grow p-4">
            <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto my-4">
              <TextFieldsOutlined sx={{ fontSize: 60 }} />
            </div>
            <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 mb-2" itemProp="headline">
              {resource.title}
            </h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 text-sm text-gray-600 dark:text-gray-300">
              {resource.promptContent || resource.overview}
            </div>
            <div className="flex flex-col gap-3 mt-auto pt-4">
              <button
                onClick={() => openModal(true)}
                className="group/button relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                aria-label={`View prompt for ${resource.title}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2h3a3 3 0 003 3h2a3 3 0 013 3v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
                  View Prompt
                </span>
                <ArrowForward className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        );

      case 'aitool':
        return (
          <>
            {/* Header with image and badges */}
            <div className="relative h-32 overflow-hidden rounded-t-2xl">
              <img
                src={imageUrl}
                alt={resource.title}
                className="w-full h-full object-cover"
                itemProp="image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold uppercase text-white shadow-lg backdrop-blur-sm border border-white/20">
                  <SmartToyOutlined style={{ fontSize: "12px" }} />
                  {getTagLabel(resource)}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-20">
                {resource.aiToolDetails?.pricingModel && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase text-white shadow-sm transition-colors ${
                    resource.aiToolDetails.pricingModel === 'free' ? 'bg-green-600' :
                    resource.aiToolDetails.pricingModel === 'freemium' ? 'bg-blue-600' :
                    'bg-orange-600'
                  }`}>
                    {resource.aiToolDetails.pricingModel.charAt(0).toUpperCase() + resource.aiToolDetails.pricingModel.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Content and Buttons */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 mb-2" itemProp="headline">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
                  {resource.overview}
                </p>
                {resource.aiToolDetails?.rating && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
                    <StarOutlined sx={{ fontSize: 16 }} />
                    {resource.aiToolDetails.rating}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 mt-auto pt-4">
                <button
                  onClick={() => openModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  aria-label={`Quickview ${resource.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg>
                  Quick View
                </button>
                <Link
                  href={resource.aiToolDetails?.toolUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/button relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden"
                  aria-label={`Try ${resource.title}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.11.1"/></svg>
                    Try AI Tool
                  </span>
                  <ArrowForward className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" sx={{ fontSize: 18 }} />
                </Link>
              </div>
            </div>
          </>
        );

      case 'document':
      default:
        // Default / Document layout
        return (
          <>
            {/* Header with image and badges */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img
                src={imageUrl}
                alt={resource.title}
                className="w-full h-full object-cover"
                itemProp="image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold uppercase text-white shadow-lg backdrop-blur-sm border border-white/20">
                  <DescriptionOutlined style={{ fontSize: "12px" }} />
                  {getTagLabel(resource)}
                </span>
              </div>
            </div>

            {/* Content and Buttons */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 mb-2" itemProp="headline">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
                  {resource.overview}
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-auto pt-4">
                <button
                  onClick={() => openModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  aria-label={`Quickview ${resource.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg>
                  Quick View
                </button>
                <Link
                  href={resource.resourceLinkType === 'external' ? resource.resourceLink : resource.slug?.current ? `/${resource.slug.current}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/button relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden"
                  aria-label={`Access ${resource.title}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
                    Access Resource
                  </span>
                  <ArrowForward className="relative z-10 transition-allduration-300group-hover/button:translate-x-1group-hover/button:scale-110" sx={{ fontSize: 18 }} />
                </Link>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <ResourceCardBase resource={resource} renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => (
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
            height: "500px", // Fixed height for consistent layout
          }}
          className="group shadow-lg hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
          itemScope
          itemType={`https://schema.org/${
            resource.resourceFormat === 'image' ? 'ImageObject' :
            resource.resourceFormat === 'video' ? 'VideoObject' :
            resource.resourceFormat === 'text' ? 'TextDigitalDocument' :
            resource.resourceFormat === 'aitool' ? 'SoftwareApplication' :
            'DigitalDocument'
          }`}
        >
          {/* Add microdata */}
          <meta itemProp="name" content={resource.title} />
          {resource.overview && <meta itemProp="description" content={resource.overview} />}
          {resource.publishedAt && <meta itemProp="datePublished" content={resource.publishedAt} />}
          {resource.tags && <meta itemProp="keywords" content={resource.tags.map(tag => tag.name).join(',')} />}
          
          {/* AI Tool specific microdata */}
          {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
            <>
              <meta itemProp="applicationCategory" content={resource.aiToolDetails.toolCategory} />
              <meta itemProp="operatingSystem" content="WebBrowser" />
              {resource.aiToolDetails.pricingModel && (
                <meta itemProp="offers" content={resource.aiToolDetails.pricingModel} />
              )}
              {resource.aiToolDetails.rating && (
                <meta itemProp="aggregateRating" content={resource.aiToolDetails.rating} />
              )}
            </>
          )}

          {renderContent(renderPreviewContent, openModal)}
        </Card>
      </div>
    )} />
  );
};

export default ResourceCard;