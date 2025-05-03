// components/ResourceModal.js
import React from 'react';
import { urlForImage } from "@/sanity/lib/image";
import { getFileUrl, renderPreviewContent, getResourceAlt } from "./resourceUtils";

const ResourceModal = ({ resource, isOpen, onClose }) => {
  if (!isOpen || !resource) return null;

  const getResourceFileUrl = (fileObj) => {
    if (fileObj && fileObj.url) return fileObj.url;
    return getFileUrl(fileObj);
  };

  const handleResourceAccess = () => {
    if (resource.resourceFormat === 'text' && resource.promptContent) return;
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

  const altText = getResourceAlt?.(resource) || resource.title;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      aria-labelledby="resource-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        itemScope={resource.structuredData !== 'none'}
        itemType={resource.structuredData !== 'none' ? `https://schema.org/${resource.structuredData}` : undefined}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 id="resource-modal-title" className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4" itemProp="headline">
            {resource.title}
          </h3>
          <button 
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary dark:bg-primary/30 mb-4">
            {resource.resourceType}
          </div>

          {/* SEO-optimized Preview */}
          <div className="mb-6">
            {resource.resourceFormat === 'image' && resource.resourceFile && (
              <img 
                src={getFileUrl(resource.resourceFile)} 
                alt={altText}
                className="w-full h-auto rounded-md object-contain"
                itemProp="contentUrl"
                loading="lazy"
              />
            )}

            {resource.resourceFormat === 'video' && resource.resourceFile && (
              <video 
                src={getFileUrl(resource.resourceFile)} 
                controls
                className="w-full h-auto rounded-md object-contain"
                itemProp="contentUrl"
                preload="metadata"
                title={resource.title}
              />
            )}

            {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && (
              <div className="mb-4">
                {resource.promptContent.map((promptItem, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {promptItem.promptTitle || `Prompt ${index + 1}`}
                      </h4>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(promptItem.promptText);
                          const copyBtn = document.getElementById(`copy-btn-${resource._id}-${index}`);
                          if (copyBtn) {
                            const originalText = copyBtn.innerText;
                            copyBtn.innerText = 'Copied!';
                            setTimeout(() => {
                              copyBtn.innerText = originalText;
                            }, 2000);
                          }
                        }}
                        id={`copy-btn-${resource._id}-${index}`}
                        className="bg-primary hover:bg-primary-dark text-white py-1 px-2 rounded-md transition-colors flex items-center"
                    >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
                        
                        Copy Prompt
                      </button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600" itemProp="text">
                      {promptItem.promptText}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          {resource.overview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Overview</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed" itemProp="description">
                {resource.overview}
              </p>
            </div>
          )}

          {/* Description */}
          {resource.content && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {typeof resource.content === 'string' ? resource.content : 'Content block goes here'}
              </div>
            </div>
          )}

          {/* Related Article */}
          {resource.relatedArticle && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Related Article</h3>
              <a 
                href={`/insights/${resource.relatedArticle.slug?.current}`}
                className="text-primary hover:underline flex items-center gap-2 group"
              >
                <span>{resource.relatedArticle.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
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

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Added: {new Date(resource.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>

          {/* CTA */}
          {resource.resourceFormat === 'text' && Array.isArray(resource.promptContent) && resource.promptContent.length > 0 ? (
            <button 
              onClick={() => {
                const allPrompts = resource.promptContent.map(p => 
                  `${p.promptTitle ? `${p.promptTitle}:\n` : ''}${p.promptText}`
                ).join('\n\n');
                navigator.clipboard.writeText(allPrompts);
                const copyBtn = document.getElementById(`copy-all-${resource._id}`);
                if (copyBtn) {
                  const originalText = copyBtn.innerText;
                  copyBtn.innerText = 'All Copied!';
                  setTimeout(() => {
                    copyBtn.innerText = originalText;
                  }, 2000);
                }
              }}
              id={`copy-all-${resource._id}`}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md transition-colors"
            >
              Copy All Prompts
            </button>
          ) : (
            <button 
              onClick={handleResourceAccess}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md transition-colors"
              aria-label={`Download or access ${resource.title}`}
            >
              {resource.resourceLinkType === 'external' ? 'Access Resource' : 'Download Resource'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
