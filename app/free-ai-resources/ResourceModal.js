// components/ResourceModal.js
import React, { useState, useEffect } from 'react';
import { urlForImage } from "@/sanity/lib/image";
import { getFileUrl, renderPreviewContent, getResourceAltText } from "./resourceUtils";
import Image from 'next/image';
import PlayArrow from '@mui/icons-material/PlayArrow'; // Add this line


const ResourceModal = ({ resource, isOpen, onClose }) => {
 
    const [copyStates, setCopyStates] = useState({});

    // Helper function to generate the correct article route based on its type
    const getArticleRoute = (relatedArticle) => {
        if (!relatedArticle || !relatedArticle.slug?.current) {
            return '#'; // Fallback
        }

        const routeMap = {
            makemoney: "ai-learn-earn",
            aitool: "ai-tools",
            coding: "ai-code",
            seo: "ai-seo"
        };


        // Get the route prefix, fallback to original behavior if not found
        const routePrefix = routeMap[relatedArticle._type];

        if (routePrefix) {
            return `/${routePrefix}/${relatedArticle.slug.current}`;
        } else {
            // Fallback to original behavior if _type doesn't match our mapping
            console.warn('Unknown _type for related article:', relatedArticle._type);
            return `/${relatedArticle.slug.current}`;
        }
    };

    // Effect to handle body overflow when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Don't render the modal if it's not open or if there's no resource
    if (!isOpen || !resource) return null;

    // Helper function to get the file URL
    const getResourceFileUrl = (fileObj) => {
        if (fileObj && fileObj.url) return fileObj.url;
        return getFileUrl(fileObj);
    };

    // Handler for the copy button
    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStates(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopyStates(prev => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // Handler for accessing the resource (download, link, etc.)
    const handleResourceAccess = () => {
        if (resource.resourceFormat === 'text' && resource.promptContent) {
            // For text, we handle copy separately
            return;
        }

        if (resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl) {
            window.open(resource.aiToolDetails.toolUrl, '_blank');
            return;
        }
  if (resource.resourceFormat === 'video' && resource.resourceFile) {
    const videoUrl = getResourceFileUrl(resource.resourceFile);
    if (videoUrl) {
      window.open(videoUrl, '_blank');
      return;
    }
  }
        if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
            const fileUrl = getResourceFileUrl(resource.resourceFile);
            const fileName = resource.resourceFile.originalFilename || `${resource.title.replace(/\s+/g, '-').toLowerCase()}`;
            if (!fileUrl) {
                return console.error('No file URL for', resource.title);
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

    const altText = getResourceAltText(resource);

    // Helper function to render star rating with animation
    const renderStarRating = (rating) => {
        if (!rating) return null;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${i <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.073 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.073 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.82 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.988 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                </svg>
            );
        }
        return (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                {stars}
                <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300 ml-1 sm:ml-2">{rating}/5</span>
            </div>
        );
    };

    // Enhanced pricing badge with icons
    const renderPricingBadge = (pricingModel) => {
        const pricingConfig = {
            'free': { color: 'bg-gradient-to-r from-green-500 to-emerald-600', icon: '🆓', label: 'Free' },
            'freemium': { color: 'bg-gradient-to-r from-blue-500 to-cyan-600', icon: '⚡', label: 'Freemium' },
            'paid': { color: 'bg-gradient-to-r from-orange-500 to-red-600', icon: '💎', label: 'Paid' },
            'subscription': { color: 'bg-gradient-to-r from-purple-500 to-pink-600', icon: '🔄', label: 'Subscription' }
        };

        const config = pricingConfig[pricingModel] || pricingConfig.paid;

        return (
            <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white font-medium text-xs sm:text-sm shadow-lg ${config.color} transform hover:scale-105 transition-all duration-200`}>
                <span className="mr-1 sm:mr-1.5">{config.icon}</span>
                {config.label}
            </div>
        );
    };

    // Enhanced category badge
    const renderCategoryBadge = (category) => {
        const categoryConfig = {
            'content': { icon: '📝', label: 'Content Creation', color: 'from-blue-500 to-indigo-600' },
            'image-gen': { icon: '🎨', label: 'Image Generation', color: 'from-pink-500 to-rose-600' },
            'seo': { icon: '📈', label: 'SEO Tools', color: 'from-green-500 to-teal-600' },
            'code': { icon: '💻', label: 'Code Assistant', color: 'from-gray-700 to-gray-900' },
            'video': { icon: '🎬', label: 'Video Editing', color: 'from-red-500 to-pink-600' },
            'writing': { icon: '✍️', label: 'Writing Assistant', color: 'from-purple-500 to-violet-600' },
            'research': { icon: '🔍', label: 'Research & Analysis', color: 'from-amber-500 to-orange-600' },
            'design': { icon: '🎯', label: 'Design & Creative', color: 'from-cyan-500 to-blue-600' },
            'productivity': { icon: '⚡', label: 'Productivity', color: 'from-emerald-500 to-green-600' },
            'marketing': { icon: '📊', label: 'Marketing', color: 'from-orange-500 to-red-600' },
            'other': { icon: '🔧', label: 'Other', color: 'from-slate-500 to-gray-600' }
        };

        const config = categoryConfig[category] || categoryConfig.other;

        return (
            <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r ${config.color} text-white font-medium text-xs sm:text-sm shadow-lg transform hover:scale-105 transition-all duration-200`}>
                <span className="mr-1 sm:mr-1.5">{config.icon}</span>
                {config.label}
            </div>
        );
    };

    const isAITool = resource.resourceFormat === 'aitool';

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fadeIn"
            itemScope
            itemType={`https://schema.org/${
                resource.resourceFormat === 'image' ? 'ImageObject' :
                resource.resourceFormat === 'video' ? 'VideoObject' :
                resource.resourceFormat === 'text' ? 'TextDigitalDocument' :
                resource.resourceFormat === 'aitool' ? 'SoftwareApplication' : 'DigitalDocument'
            }`}
            onClick={(e) => e.target === e.currentTarget && onClose(false)}
        >
            <meta itemProp="name" content={resource.title} />
            {resource.overview && <meta itemProp="description" content={resource.overview} />}
<div 
  className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 animate-slideUp mx-2 sm:mx-4"
>                {/* Enhanced Header */}
               <div className={`relative ${
  isAITool 
    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' 
    : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
} px-3 py-3 sm:px-6 sm:py-4`}>
  {isAITool && (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
  )}
  <div className="relative flex justify-between items-start">
    <div className="flex-1 pr-2 sm:pr-4">
      <div className="flex items-center gap-1 mb-1 sm:gap-2 sm:mb-2 flex-wrap">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isAITool 
            ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30' 
            : 'bg-blue-500/20 text-blue-800 dark:bg-blue-500/30 dark:text-blue-300'
        }`}>
          {isAITool && <span className="mr-1">🤖</span>}
          {resource.resourceType}
        </div>
        {isAITool && resource.aiToolDetails?.toolCategory && (
          <div className="hidden sm:block">
            {renderCategoryBadge(resource.aiToolDetails.toolCategory)}
          </div>
        )}
      </div>
      <h3 className={`text-lg sm:text-3xl font-bold mb-2 leading-tight ${
        isAITool ? 'text-white' : 'text-gray-900 dark:text-white'
      }`} itemProp="headline">
        {resource.title}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {isAITool && resource.aiToolDetails?.pricingModel && (
          renderPricingBadge(resource.aiToolDetails.pricingModel)
        )}
        {isAITool && resource.aiToolDetails?.rating && (
          renderStarRating(resource.aiToolDetails.rating)
        )}
      </div>
    </div>
    <button
      onClick={() => onClose(false)}
      className={`p-2 rounded-full transition-all duration-200 hover:rotate-90 flex-shrink-0 ${
        isAITool 
          ? 'text-white/80 hover:text-white hover:bg-white/20' 
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      aria-label="Close modal"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

                {/* Enhanced Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* AI Tool Specific Content */}
                    {isAITool && resource.aiToolDetails ? (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-8">
                            {/* Hero Section with Tool Preview */}
                            <div className="relative">
                                <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl overflow-hidden shadow-inner">
                                    {resource.previewSettings?.previewImage ? (
 <Image
    src={urlForImage(resource.previewSettings.previewImage).url()}
    alt={resource.previewSettings.previewImage?.alt || getEnhancedAltText(resource)}
    fill
    className="object-cover"
    itemProp="image"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
    priority={true} // Since this is likely above the fold
  />
                                    ) : resource.mainImage ? (
                                        <img
                                            src={urlForImage(resource.mainImage).url()}
                                            alt={resource.mainImage?.alt || altText}
                                            className="w-full h-full object-cover"
                                            itemProp="image"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <span className="text-2xl sm:text-3xl">🤖</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium text-base sm:text-lg">AI Tool Preview</p>
                                                <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Experience the power of AI</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gradient Overlay with Tool URL */}
                                    {resource.aiToolDetails.toolUrl && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                                                <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 sm:p-3 border border-white/20">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-white">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.101 1.11" />
                                                        </svg>
                                                        <span className="text-xs sm:text-sm font-medium truncate">{resource.aiToolDetails.toolUrl}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                          
                            {/* Tab Content */}
                            <div className="">
                              {resource.overview && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-6 sm:mb-8">
    <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white flex items-center">
      <span className="mr-1.5 sm:mr-2">📝</span>Overview
    </h4>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-lg" itemProp="description">{resource.overview}</p>
  </div>
)}

{resource.aiToolDetails.features && resource.aiToolDetails.features.length > 0 && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
      <span className="mr-1.5 sm:mr-2">⭐</span>Key Features
    </h4>
    <ul className="grid gap-2 sm:gap-3">
      {resource.aiToolDetails.features.map((feature, index) => (
        <li key={index} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
)}             
                            </div>
                             {/* Key Features Section - Add this */}
 
                        </div>
                    ) : (
                        /* Enhanced content for other resource types */
                        <div className="p-4 sm:p-6">
                            {/* Preview Section */}
                            <div className="mb-6 sm:mb-8">
                                {resource.resourceFormat === 'image' && resource.resourceFile && (
                                    <div className="relative rounded-xl overflow-hidden shadow-lg">
 <img
      src={getFileUrl(resource.resourceFile)}
      alt={resource.imageMetadata?.altText || altText}
      className="w-full h-auto object-contain"
      itemProp="contentUrl"
      loading="lazy"
    />                                   
    
      {resource.imageMetadata?.caption && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white text-sm font-medium text-center">
          {resource.imageMetadata.caption}
        </p>
      </div>
    )}
     </div>
                                )}




{/* New section for video redirection */}
{resource.resourceFormat === 'video' && resource.resourceFile && (
  <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video">
    <div className="w-full h-full flex items-center justify-center relative">
      {resource.previewSettings?.previewImage ? (
        <Image
          src={urlForImage(resource.previewSettings.previewImage).url()}
          alt={resource.previewSettings.previewImage?.alt || altText}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority={true}
        />
      ) : resource.mainImage ? (
        <img
          src={urlForImage(resource.mainImage).url()}
          alt={resource.mainImage?.alt || altText}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM13 9a1 1 0 100-2 1 1 0 000 2zm-3-1a1 1 0 100-2 1 1 0 000 2z" />
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-base sm:text-lg">Video Preview</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Click below to watch the video</p>
          </div>
        </div>
      )}
    </div>
    {/* Overlay with CTA */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
       <button
  onClick={() => handleResourceAccess()}
  className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 cursor-pointer border-4 border-white/20"
  aria-label="Watch video"
>
  <PlayArrow sx={{ fontSize: 40, color: 'white', ml: '3px' }} />
</button>
      </div>
    </div>
  </div>
)}

                                {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && (
                                    <div className="space-y-4 sm:space-y-6">
                                        {resource.promptContent.map((promptItem, index) => (
                                            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <div className="flex justify-between items-center mb-3 sm:mb-4">
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                        <span className="mr-1.5 sm:mr-2">💬</span>{promptItem.promptTitle || `Prompt ${index + 1}`}
                                                    </h4>
                                                    <button onClick={() => handleCopy(promptItem.promptText, `prompt-${index}`)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm">
                                                        {copyStates[`prompt-${index}`] ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                </svg>
                                                                Copy Prompt
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                                                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto" itemProp="text">{promptItem.promptText}</pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Enhanced Document Preview */}
                                {resource.resourceFormat === 'document' && resource.resourceFile && (
                                    <div className="relative">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 sm:p-8 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                                            <div className="text-center">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
</svg>
                                                </div>
                                                <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{resource.resourceFile.originalFilename || resource.title}</h4>
                                               
                                               
                                                <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Document ready for download</p>
                                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.966 16H16a5 5 0 011-9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                    </svg>
                                                    Click download to access this resource
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Enhanced Other Resource Formats */}
                                {!['image', 'video', 'text', 'document', 'aitool'].includes(resource.resourceFormat) && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="text-center">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2-5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Resource Available</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{resource.resourceType} • Ready for access</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Enhanced Overview Section */}
                            {resource.overview && (
                                <div className="mb-6 sm:mb-8">
                                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
                                            <div className="w-7 h-7 sm:w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            Overview
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-lg" itemProp="description">{resource.overview}</p>
                                    </div>
                                </div>
                            )}
                            {/* Enhanced Description Section */}
                            {resource.content && (
                                <div className="mb-6 sm:mb-8">
                                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
                                            <div className="w-7 h-7 sm:w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </div>
                                            Description
                                        </h3>
                                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm sm:prose-lg">
                                            {typeof resource.content === 'string' ? (
                                                <p className="leading-relaxed">{resource.content}</p>
                                            ) : (
                                                <div className="text-gray-500 dark:text-gray-400 italic">Content details available in the resource</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Enhanced Features/Tags Section */}
                            {resource.tags && resource.tags.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 h-6 mr-1.5 sm:mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {resource.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-200">
                                                <span className="mr-0.5 sm:mr-1">#</span>{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Related Article Section */}
                    {resource.relatedArticle && resource.relatedArticle?.title && (
                        <div className="mx-4 mb-4 sm:mx-6 sm:mb-6">
                            <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 p-4 sm:p-6 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white flex items-center">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 sm:w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.101 1.11" />
                                        </svg>
                                    </div>
                                    Related Article
                                </h3>
                                <a href={getArticleRoute(resource.relatedArticle)} className="block p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-teal-100 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 group-hover:scale-[1.02]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-teal-800 dark:text-teal-300 text-base sm:text-lg mb-0.5 sm:mb-1 group-hover:text-teal-900 dark:group-hover:text-teal-200 transition-colors">{resource.relatedArticle.title}</h4>
                                            {resource.relatedArticle.excerpt && (
                                                <p className="text-teal-600 dark:text-teal-400 text-xs sm:text-sm leading-relaxed">{resource.relatedArticle.excerpt}</p>
                                            )}
                                        </div>
                                        <div className="ml-3 sm:ml-4 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    )}
                    {/* SEO Metadata */}
                    {resource.structuredData !== 'none' && (
                        <>
                            <meta itemProp="name" content={resource.seoTitle || resource.title} />
                            <meta itemProp="description" content={resource.seoDescription || resource.overview || ""} />
                            {resource.publishedAt && <meta itemProp="datePublished" content={resource.publishedAt} />}
                            {resource.seoKeywords && <meta itemProp="keywords" content={resource.seoKeywords.join(",")} />}
                        </>
                    )}
                </div>
                {/* Enhanced Footer */}
               <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
  <div className="p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
    {/* Resource Info */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        Added: {new Date(resource.publishedAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short', 
          year: 'numeric'
        })}
      </div>
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.994.994 0 01-1.414 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        {resource.resourceType}
      </div>
    </div>
    
    {/* CTA Buttons - Responsive */}
    <div className="flex gap-2 w-full sm:w-auto">
      {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && resource.promptContent.length > 0 ? (
        <button
          onClick={() => {
            const allPrompts = resource.promptContent
              .map(p => `${p.promptTitle ? `${p.promptTitle}:\n` : ''}${p.promptText}`)
              .join('\n\n');
            handleCopy(allPrompts, 'copy-all-prompts');
          }}
          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
        >
          {copyStates['copy-all-prompts'] ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <span className="hidden sm:inline">All Copied!</span>
              <span className="sm:hidden">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              <span className="hidden sm:inline">Copy All Prompts</span>
              <span className="sm:hidden">Copy All</span>
            </>
          )}
        </button>
      ) : resource.resourceFormat === 'aitool' ? (
        <button
          onClick={handleResourceAccess}
          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-3 px-4 sm:px-8 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group text-sm"
          aria-label={`Launch ${resource.title} AI tool`}
        >
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <span className="text-sm">🚀</span>
          </div>
          <span className="hidden sm:inline">Launch AI Tool</span>
          <span className="sm:hidden">Launch</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={handleResourceAccess}
          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 sm:px-8 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group text-sm"
          aria-label={`Access ${resource.title}`}
        >
         <svg 
  xmlns="http://www.w3.org/2000/svg" 
  className="w-4 h-4" 
  fill="none" 
  viewBox="0 0 24 24" 
  stroke="currentColor" 
  strokeWidth={2}
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
  />
</svg>
          <span className="hidden sm:inline">Access Resource</span>
          <span className="sm:hidden">Access</span>
        </button>
      )}
    </div>
  </div>
</div>
            </div>
        </div>
    );
};

export default ResourceModal;
