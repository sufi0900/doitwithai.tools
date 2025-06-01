// components/ResourceModal.js
import React, { useState, useEffect } from 'react';
import { urlForImage } from "@/sanity/lib/image";
import { getFileUrl, renderPreviewContent, getResourceAltText } from "./resourceUtils";

const ResourceModal = ({ resource, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copyStates, setCopyStates] = useState({});

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

  if (!isOpen || !resource) return null;

  const getResourceFileUrl = (fileObj) => {
    if (fileObj && fileObj.url) return fileObj.url;
    return getFileUrl(fileObj);
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleResourceAccess = () => {
    if (resource.resourceFormat === 'text' && resource.promptContent) return;
    if (resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl) {
      window.open(resource.aiToolDetails.toolUrl, '_blank');
      return;
    }
    if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
      const fileUrl = getResourceFileUrl(resource.resourceFile);
      const fileName = resource.resourceFile.originalFilename || 
        `${resource.title.replace(/\s+/g, '-').toLowerCase()}`;
      if (!fileUrl) return console.error('No file URL for', resource.title);
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
          className={`w-5 h-5 transition-all duration-300 ${
            i <= rating 
              ? 'text-yellow-400 scale-110' 
              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
        {stars}
        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 ml-2">
          {rating}/5
        </span>
      </div>
    );
  };

  // Enhanced pricing badge with icons
  const renderPricingBadge = (pricingModel) => {
    const pricingConfig = {
      'free': {
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        icon: '🆓',
        label: 'Free'
      },
      'freemium': {
        color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        icon: '⚡',
        label: 'Freemium'
      },
      'paid': {
        color: 'bg-gradient-to-r from-orange-500 to-red-600',
        icon: '💎',
        label: 'Paid'
      },
      'subscription': {
        color: 'bg-gradient-to-r from-purple-500 to-pink-600',
        icon: '🔄',
        label: 'Subscription'
      }
    };

    const config = pricingConfig[pricingModel] || pricingConfig.paid;
    
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-white font-medium text-sm shadow-lg ${config.color} transform hover:scale-105 transition-all duration-200`}>
        <span className="mr-1.5">{config.icon}</span>
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
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.color} text-white font-medium text-sm shadow-lg transform hover:scale-105 transition-all duration-200`}>
        <span className="mr-1.5">{config.icon}</span>
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 animate-slideUp"
      >
        {/* Enhanced Header */}
        <div className={`relative ${isAITool ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600' : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'} p-6`}>
          {isAITool && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          )}
          
          <div className="relative flex justify-between items-start">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  isAITool 
                    ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30' 
                    : 'bg-primary/20 text-primary dark:bg-primary/30'
                }`}>
                  {isAITool && <span className="mr-1.5">🤖</span>}
                  {resource.resourceType}
                </div>
                {isAITool && resource.aiToolDetails?.toolCategory && (
                  renderCategoryBadge(resource.aiToolDetails.toolCategory)
                )}
              </div>
              
              <h3 className={`text-3xl font-bold mb-4 ${isAITool ? 'text-white' : 'text-gray-900 dark:text-white'}`} itemProp="headline">
                {resource.title}
              </h3>
              
              <div className="flex items-center gap-4 flex-wrap">
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
              className={`p-2 rounded-full transition-all duration-200 hover:rotate-90 ${
                isAITool 
                  ? 'text-white/80 hover:text-white hover:bg-white/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Tool Specific Content */}
          {isAITool && resource.aiToolDetails ? (
            <div className="p-6 space-y-8">
              {/* Hero Section with Tool Preview */}
              <div className="relative">
                <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl overflow-hidden shadow-inner">
                  {resource.previewSettings?.previewImage ? (
                    <img 
                      src={urlForImage(resource.previewSettings.previewImage).url()} 
                      alt={resource.previewSettings.previewImage?.alt || altText}
                      className="w-full h-full object-cover"
                      itemProp="image"
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
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-3xl">🤖</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">AI Tool Preview</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Experience the power of AI</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient Overlay with Tool URL */}
                  {resource.aiToolDetails.toolUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                          <div className="flex items-center gap-2 text-white">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-sm font-medium truncate">{resource.aiToolDetails.toolUrl}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Navigation for AI Tools */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📋' },
                    { id: 'features', label: 'Features', icon: '⭐' },
                    { id: 'pros-cons', label: 'Pros & Cons', icon: '⚖️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {resource.overview && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                          <span className="mr-2">📝</span>
                          Overview
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg" itemProp="description">
                          {resource.overview}
                        </p>
                      </div>
                    )}

                    {resource.aiToolDetails.functionality && resource.aiToolDetails.functionality.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                          <span className="mr-2">⚡</span>
                          Key Functionality
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {resource.aiToolDetails.functionality.map((func, index) => (
                            <div 
                              key={index}
                              className="group bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                  <span className="text-white text-sm">✨</span>
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                  {func}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'features' && resource.aiToolDetails.features && resource.aiToolDetails.features.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {resource.aiToolDetails.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-white font-bold">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                              {feature.feature}
                            </h5>
                            {feature.description && (
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'pros-cons' && resource.aiToolDetails.prosAndCons && (
                  resource.aiToolDetails.prosAndCons.pros?.length > 0 || 
                  resource.aiToolDetails.prosAndCons.cons?.length > 0
                ) && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Enhanced Pros */}
                    {resource.aiToolDetails.prosAndCons.pros?.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                        <h5 className="font-bold text-green-800 dark:text-green-400 mb-4 flex items-center text-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          Advantages
                        </h5>
                        <ul className="space-y-3">
                          {resource.aiToolDetails.prosAndCons.pros.map((pro, index) => (
                            <li key={index} className="flex items-start group">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-green-700 dark:text-green-300 leading-relaxed">
                                {pro}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Enhanced Cons */}
                    {resource.aiToolDetails.prosAndCons.cons?.length > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
                        <h5 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center text-lg">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          Limitations
                        </h5>
                        <ul className="space-y-3">
                          {resource.aiToolDetails.prosAndCons.cons.map((con, index) => (
                            <li key={index} className="flex items-start group">
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-red-700 dark:text-red-300 leading-relaxed">
                                {con}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Enhanced content for other resource types */
            <div className="p-6">
              {/* Preview Section */}
              <div className="mb-8">
                {resource.resourceFormat === 'image' && resource.resourceFile && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={getFileUrl(resource.resourceFile)} 
                      alt={altText}
                      className="w-full h-auto object-contain"
                      itemProp="contentUrl"
                      loading="lazy"
                    />
                  </div>
                )}

                {resource.resourceFormat === 'video' && resource.resourceFile && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <video 
                      src={getFileUrl(resource.resourceFile)} 
                      controls
                      className="w-full h-auto object-contain"
                      itemProp="contentUrl"
                      preload="metadata"
                      title={resource.title}
                    />
                  </div>
                )}

                {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && (
                  <div className="space-y-6">
                    {resource.promptContent.map((promptItem, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <span className="mr-2">💬</span>
                            {promptItem.promptTitle || `Prompt ${index + 1}`}
                          </h4>
                          <button 
                            onClick={() => handleCopy(promptItem.promptText, `prompt-${index}`)}
                            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            {copyStates[`prompt-${index}`] ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Prompt
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto" itemProp="text">
                            {promptItem.promptText}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced Document Preview */}
                {resource.resourceFormat === 'document' && resource.resourceFile && (
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {resource.resourceFile.originalFilename || resource.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Document ready for download
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Click download to access this resource
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Other Resource Formats */}
                {!['image', 'video', 'text', 'document', 'aitool'].includes(resource.resourceFormat) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Resource Available
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {resource.resourceType} • Ready for access
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Overview Section */}
              {resource.overview && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Overview
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg" itemProp="description">
                      {resource.overview}
                    </p>
                  </div>
                </div>
              )}

              {/* Enhanced Description Section */}
              {resource.content && (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                      Description
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 prose-lg">
                      {typeof resource.content === 'string' ? (
                        <p className="leading-relaxed">{resource.content}</p>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                          Content details available in the resource
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Features/Tags Section */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:scale-105 transition-transform duration-200"
                      >
                        <span className="mr-1">#</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Related Article Section */}
          {resource.relatedArticle && resource.relatedArticle?.title && (
            <div className="mx-6 mb-6">
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all duration-300 group">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  Related Article
                </h3>
                <a
                  href={`/insights/${resource.relatedArticle.slug?.current}`}
                  className="block p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-emerald-100 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 group-hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-lg mb-1 group-hover:text-emerald-900 dark:group-hover:text-emerald-200 transition-colors">
                        {resource.relatedArticle.title}
                      </h4>
                      {resource.relatedArticle.excerpt && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm leading-relaxed">
                          {resource.relatedArticle.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {resource.seoKeywords && <meta itemProp="keywords" content={resource.seoKeywords.join(", ")} />}
            </>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Enhanced Resource Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m6 0v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6m6 0V3" />
                </svg>
                Added: {new Date(resource.publishedAt).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {resource.resourceType}
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex gap-3">
              {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && resource.promptContent.length > 0 ? (
                <button 
                  onClick={() => {
                    const allPrompts = resource.promptContent.map(p => 
                      `${p.promptTitle ? `${p.promptTitle}:\n` : ''}${p.promptText}`
                    ).join('\n\n');
                    handleCopy(allPrompts, 'copy-all-prompts');
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {copyStates['copy-all-prompts'] ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy All Prompts
                    </>
                  )}
                </button>
              ) : resource.resourceFormat === 'aitool' ? (
                <button 
                  onClick={handleResourceAccess}
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 px-8 rounded-xl transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
                  aria-label={`Launch ${resource.title} AI tool`}
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-sm">🚀</span>
                  </div>
                  Launch AI Tool
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleResourceAccess}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  aria-label={`${resource.resourceLinkType === 'external' ? 'Access' : 'Download'} ${resource.title}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      resource.resourceLinkType === 'external' 
                        ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        : "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    } />
                  </svg>
                  {resource.resourceLinkType === 'external' ? 'Access Resource' : 'Download Resource'}
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