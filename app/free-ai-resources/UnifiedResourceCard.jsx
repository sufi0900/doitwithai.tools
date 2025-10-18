// UnifiedResourceCard.js - Single card for both grid and carousel
import React, { useRef, useEffect, useState } from 'react';
import ResourceCardBase from './ResourceCardBase';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowForward, PlayArrow, Description, Image as ImageIcon, Psychology } from '@mui/icons-material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Global modal state tracking for carousel compatibility
let activeModalId = null;

export const closeAllModals = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('closeAllResourceModals', { detail: { closeAll: true } }));
  }
  activeModalId = null;
};

export const openModalById = (id) => {
  closeAllModals();
  activeModalId = id;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openResourceModal', { detail: { id } }));
  }
};

const UnifiedResourceCard = ({ resource, wrapperClassName = "", variant = "grid", cardHeight = "auto" }) => {

      const videoRef = useRef(null);

// optional cleanup: pause if component unmounts
useEffect(() => {
  return () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch(e) {}
    }
  };
}, []);
  // Handle resource access with proper URL handling
  const handleResourceAccess = (resource) => {
    if (resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl) {
      window.open(resource.aiToolDetails.toolUrl, '_blank');
    } else if (resource.resourceFormat === 'aitool' && resource.resourceLink) {
      window.open(resource.resourceLink, '_blank');
    } else if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
      // For file downloads - paste your getFileUrl utility logic here
      // const fileUrl = getFileUrl(resource.resourceFile);
      window.open(resource.resourceFile.url, '_blank');
  } else if (resource.resourceLink) {
    window.open(resource.resourceLink, '_blank');
  }
};

  // Get resource type label
  const getResourceTypeLabel = () => {
    if (resource.tags && resource.tags.length > 0) {
      return resource.tags[0];
    }
    return resource.resourceType?.charAt(0).toUpperCase() + resource.resourceType?.slice(1) || 'Resource';
  };

  // Get resource icon based on format
  const getResourceIcon = () => {
    switch (resource.resourceFormat) {
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

  // Dynamic height based on variant
const getCardHeight = () => {
  if (cardHeight !== "auto") return cardHeight;
  
  // Optimized height for carousel - shorter to reduce blank space
  return variant === "carousel" 
    ? "h-[480px] sm:h-[460px] md:h-[480px] lg:h-[500px] xl:h-[480px]" 
    : "h-[27rem]";
};


  // Image Card Layout - Unified for both variants
  const ImageCardLayout = ({ resource, renderPreviewContent, openModal }) => (
    <div 
      className={`relative ${getCardHeight()} overflow-hidden rounded-2xl group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 ${variant === 'carousel' ? 'hover:-translate-y-3 hover:scale-[1.02]' : ''}`}
      onClick={() => openModal(true)}
    >
      {/* Enhanced Shimmer Effect for Carousel */}
      {variant === 'carousel' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" />
      )}
      
      {/* Full Image Background */}
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
        {renderPreviewContent()}
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Resource Type Badge */}
      <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600/90 to-blue-700/90 px-3 py-2 text-xs font-semibold uppercase text-white shadow-lg backdrop-blur-sm border border-white/20">
        {getResourceIcon()}
        {getResourceTypeLabel()}
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{resource.title}</h3>
       <div className="flex gap-2">
  <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 border border-white/30 flex items-center justify-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    Preview
  </button>
  <button 
    onClick={() => handleResourceAccess(resource)} 
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    Explore
  </button>
</div>
      </div>

      {/* Animation Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );

// Optimized VideoCardLayout - Replace your existing VideoCardLayout
const VideoCardLayout = ({ resource, renderPreviewContent, openModal, handleResourceAccess }) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px', // Start loading when 50px away from viewport
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`${getCardHeight()} flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 ${
        variant === 'carousel' ? 'hover:-translate-y-3 hover:scale-[1.02]' : ''
      }`}
    >
      {/* Enhanced Shimmer Effect for Carousel */}
      {variant === 'carousel' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" />
      )}

      {/* Video Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold uppercase text-white shadow-lg">
            {getResourceIcon()}
            {getResourceTypeLabel()}
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h3>
      </div>

      {/* OPTIMIZED Video Preview Area */}
      <div className="relative flex-grow bg-black overflow-hidden">
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Only render preview content when in view */}
          {isInView ? renderPreviewContent() : (
            // Loading placeholder
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Enhanced Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 cursor-pointer border-4 border-white/20">
                <PlayArrow sx={{ fontSize: 28, color: 'white', marginLeft: '3px' }} />
              </div>
            </div>
          </div>

          {/* Video Duration Badge (if available) */}
          {resource.videoMetadata?.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {resource.videoMetadata.duration}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 mt-auto flex gap-2">
        <button
          onClick={() => openModal(true)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Preview
        </button>
        <button
          onClick={() => handleResourceAccess(resource)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg"
        >
          <PlayArrow sx={{ fontSize: 16 }} />
          Watch Now
        </button>
      </div>
    </div>
  );
};
  // Text/Prompt Card Layout - Unified
  const TextCardLayout = ({ resource, openModal }) => (
    <div className={`${getCardHeight()} flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 ${variant === 'carousel' ? 'hover:-translate-y-3 hover:scale-[1.02]' : ''}`}>
      {/* Enhanced Shimmer Effect for Carousel */}
      {variant === 'carousel' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" />
      )}
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold uppercase text-white mb-3 shadow-lg">
          {getResourceIcon()}
          {getResourceTypeLabel()}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h3>
      </div>

      {/* Terminal-like Display */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
           <div className="relative mt-4 h-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 font-mono text-sm leading-relaxed text-green-400 p-3">
                     <div className="absolute top-2 left-2 flex gap-1.5">
                       <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                       <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                       <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                     </div>
                     <div className="mt-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                       {resource.promptContent && resource.promptContent.length > 0 ? (
                         <div className="space-y-3">
                           {resource.promptContent.map((prompt, index) => (
                             <div key={index} className="flex flex-col">
                               <div className="flex items-center">
                                 <span className="text-blue-400 mr-2">$</span>
                                 <h4 className="font-semibold text-gray-100">{prompt.promptTitle}</h4>
                               </div>
                               <p className="text-xs text-gray-400 pl-4 whitespace-pre-wrap">{prompt.promptText}</p>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                           <div className="text-center p-4">
                             <Psychology sx={{ fontSize: 48, marginBottom: 1, color: '#3B82F6' }} />
                             <p className="text-sm">Prompt content not available</p>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {resource.tags?.map((tag, idx) => (
            <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
       <div className="flex flex-col gap-3 mt-auto">
                
                 <button
                   onClick={() => openModal(true)}
                   className="group/button relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden justify-center"
                   aria-label={`View prompt for ${resource.title}`}
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                   <span className="relative z-10 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                       <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                     </svg>
                     View Prompt
                   </span>
                   <ArrowForward className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" sx={{ fontSize: 18 }} />
                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-30 transition-opacity duration-300 blur-sm" />
                 </button>
               </div>
      </div>
    </div>
  );

  // Document Card Layout - Unified
  const DocumentCardLayout = ({ resource, renderPreviewContent, openModal, handleResourceAccess }) => (
    <div className={`${getCardHeight()} flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 ${variant === 'carousel' ? 'hover:-translate-y-3 hover:scale-[1.02]' : ''}`}>
      {/* Enhanced Shimmer Effect for Carousel */}
      {variant === 'carousel' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" />
      )}
      
      {/* Document Preview */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          {renderPreviewContent()}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold uppercase text-white shadow-lg">
          {getResourceIcon()}
          {getResourceTypeLabel()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h3>
        
        {resource.overview && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 flex-1">
            {resource.overview}
          </p>
        )}
        
        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-block bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
                <button onClick={() => openModal(true)} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                  Quick View
                </button>
               <button onClick={() => handleResourceAccess(resource)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-lg">
        <Description sx={{ fontSize: 16 }} />
        Open
      </button>
              </div>
            </div>
          </div>
        );

  // AI Tool Card Layout - Unified
  const AIToolCardLayout = ({ resource, renderPreviewContent, openModal, handleResourceAccess }) => (
    <div className={`${getCardHeight()} flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 ${variant === 'carousel' ? 'hover:-translate-y-3 hover:scale-[1.02]' : ''}`}>
      {/* Enhanced Shimmer Effect for Carousel */}
      {variant === 'carousel' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" />
      )}
      
      {/* AI Tool Header with Gradient */}
     {/* AI Tool Header with Gradient */}
    <div className="relative h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-12 group-hover:skew-y-12 transition-transform duration-700"></div>
      
      {/* Preview content with enhanced overlay */}
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
        {renderPreviewContent()}
      </div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"/>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
      
      {/* AI Tool Badge with glow effect */}
      <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-1.5 text-xs font-semibold uppercase text-white shadow-lg backdrop-blur-sm border border-white/20 group-hover:shadow-purple-500/50 group-hover:shadow-xl transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
          <path d="M12 6a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z"/>
        </svg>
        AI Tool
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse animation-delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse animation-delay-700"></div>
      </div>
    </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {resource.title}
        </h3>
        
        {resource.overview && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 flex-1">
            {resource.overview}
          </p>
        )}
        
        {/* AI Tool Features/Tags */}
        {resource.aiToolDetails?.toolCategory && (
          <div className="mb-3">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300">
              {resource.aiToolDetails.toolCategory}
            </span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => openModal(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
                      Details
          </button>
          <Link
            href={resource.aiToolDetails?.toolUrl || resource.resourceLink || '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group-hover:shadow-purple-500/30"
          >
 <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>            Try Tool
          </Link>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );

  const memoizedCardBase = useMemo(() => (
    <ResourceCardBase
      resource={resource}
      renderUI={({ resource, renderPreviewContent, handleResourceAccess, openModal }) => {
        // 👇 FIX: Create a new handler that uses the correct modal logic based on variant.
        const handleOpenModal = () => {
          if (variant === 'carousel') {
            // For carousel, fire a global event to be caught by a top-level modal.
            openModalById(resource._id);
          } else {
            // For grid, use the local modal from ResourceCardBase.
            openModal(true);
          }
        };
        return (
          <div className={`w-full ${variant === 'grid' ? 'sm:w-1/2 lg:w-1/3 p-3' : ''} ${wrapperClassName}`}>
            <div className={`transition-all duration-300 ${variant === 'grid' ? 'hover:transform hover:scale-[1.02]' : ''}`}>
              <div itemScope itemType={`https://schema.org/${resource.resourceFormat === 'image' ? 'ImageObject' : 'DigitalDocument'}`}>
<meta itemProp="name" content={resource.title} />
        <meta itemProp="description" content={resource.seoDescription || resource.overview} />
        <meta itemProp="datePublished" content={resource.publishedAt} />
        <meta itemProp="keywords" content={(resource.seoKeywords || resource.tags || []).join(',')} />
                        {resource.overview && <meta itemProp="description" content={resource.overview} />}
                {resource.publishedAt && <meta itemProp="datePublished" content={resource.publishedAt} />}
                {resource.tags && <meta itemProp="keywords" content={resource.tags.join(',')} />}
                
                {/* 👇 FIX: Pass the new `handleOpenModal` function to all card layouts instead of the original `openModal` */}
               {/* Format-specific microdata */}
        {resource.resourceFormat === 'image' && resource.imageMetadata?.altText && (
          <meta itemProp="text" content={resource.imageMetadata.altText} />
        )}
        
        {resource.resourceFormat === 'video' && resource.videoMetadata?.duration && (
          <meta itemProp="duration" content={resource.videoMetadata.duration} />
        )}
        
        {resource.resourceFormat === 'document' && resource.documentMetadata?.pageCount && (
          <meta itemProp="numberOfPages" content={resource.documentMetadata.pageCount} />
        )}

        {/* Render the appropriate card layout */}
        {resource.resourceFormat === 'image' && (
          <ImageCardLayout
            resource={resource}
            renderPreviewContent={renderPreviewContent}
            openModal={handleOpenModal}
          />
        )}
        
        {resource.resourceFormat === 'video' && (
          <VideoCardLayout
            resource={resource}
            renderPreviewContent={renderPreviewContent}
            openModal={handleOpenModal}
            handleResourceAccess={handleResourceAccess}
          />
        )}
        
        {resource.resourceFormat === 'text' && (
          <TextCardLayout
            resource={resource}
            openModal={handleOpenModal}
          />
        )}
        
        {resource.resourceFormat === 'document' && (
          <DocumentCardLayout
            resource={resource}
            renderPreviewContent={renderPreviewContent}
            openModal={handleOpenModal}
            handleResourceAccess={handleResourceAccess}
          />
        )}
        
        {resource.resourceFormat === 'aitool' && (
          <AIToolCardLayout
            resource={resource}
            renderPreviewContent={renderPreviewContent}
            openModal={handleOpenModal}
            handleResourceAccess={handleResourceAccess}
          />
        )}
      </div>
    </div>
  </div>

 );
      }}
    />
), [resource._id, variant, wrapperClassName]);

// Replace the final return with the memoized version
return memoizedCardBase;

};
export default UnifiedResourceCard;
