// utils/resourceUtils.js
import { urlForImage } from "@/sanity/lib/image";
 
// Function to get file URL from Sanity file reference

export const getResourceAltText = (resource) => {
  if (!resource) return '';
  
  // Check for explicit alt text in different places
  if (resource.mainImage && resource.mainImage.alt) {
    return resource.mainImage.alt;
  }
  
  if (resource.previewSettings && 
      resource.previewSettings.previewImage && 
      resource.previewSettings.previewImage.alt) {
    return resource.previewSettings.previewImage.alt;
  }
  
  // Create descriptive alt text based on resource details
  let altText = resource.title || '';
  
  if (resource.resourceType) {
    altText += ` - ${resource.resourceType}`;
  }
  
  if (resource.tags && resource.tags.length > 0) {
    altText += ` related to ${resource.tags.slice(0, 3).join(', ')}`;
  }
  
  return altText;
};



export const getFileUrl = (resourceFile) => {
    if (!resourceFile) return null;
    
    // If it's already a url string, return it
    if (typeof resourceFile === 'string') return resourceFile;
    
    // If we have a direct url in the object
    if (resourceFile.url) return resourceFile.url;
    
    // Handle asset reference
    let ref;
    if (resourceFile.asset && resourceFile.asset._ref) {
      ref = resourceFile.asset._ref;
    } else if (resourceFile._ref) {
      ref = resourceFile._ref;
    } else {
      return null;
    }
    
    // Make sure it's a file reference
    if (!ref.startsWith('file-')) {
      return null;
    }
    
    const fileExtensions = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'mp3', 
      'wav', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'gif', 'svg'
    ];
    
    // Extract the base part of the reference
    const basePart = ref.replace('file-', '');
    
    // Find which extension it matches
    let finalPart = basePart;
    for (const ext of fileExtensions) {
      if (basePart.endsWith(`-${ext}`)) {
        finalPart = basePart.replace(`-${ext}`, `.${ext}`);
        break;
      }
    }
    
    return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${finalPart}`;
  };



// Enhanced renderDocumentPreview function with realistic document appearance
export const renderDocumentPreview = (resourceType, resource, fileExt) => {
  const colorSchemes = {
    'pdf': {
      bg: 'from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40',
      accent: 'bg-red-600',
      icon: 'text-red-700 dark:text-red-400',
      shadow: 'shadow-red-200/50 dark:shadow-red-900/50'
    },
    'ebook': {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40',
      accent: 'bg-blue-600',
      icon: 'text-blue-700 dark:text-blue-400',
      shadow: 'shadow-blue-200/50 dark:shadow-blue-900/50'
    },
    'template': {
      bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40',
      accent: 'bg-indigo-600',
      icon: 'text-indigo-700 dark:text-indigo-400',
      shadow: 'shadow-indigo-200/50 dark:shadow-indigo-900/50'
    },
    'guide': {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40',
      accent: 'bg-amber-600',
      icon: 'text-amber-700 dark:text-amber-400',
      shadow: 'shadow-amber-200/50 dark:shadow-amber-900/50'
    },
    'doc': {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40',
      accent: 'bg-blue-600',
      icon: 'text-blue-700 dark:text-blue-400',
      shadow: 'shadow-blue-200/50 dark:shadow-blue-900/50'
    },
    'xls': {
      bg: 'from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40',
      accent: 'bg-green-600',
      icon: 'text-green-700 dark:text-green-400',
      shadow: 'shadow-green-200/50 dark:shadow-green-900/50'
    },
    'default': {
      bg: 'from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-700/60',
      accent: 'bg-gray-600',
      icon: 'text-gray-700 dark:text-gray-400',
      shadow: 'shadow-gray-200/50 dark:shadow-gray-700/50'
    }
  };

  if (resource && resource.resourceFile && getFileUrl(resource.resourceFile)) {
    const fileUrl = getFileUrl(resource.resourceFile);
    fileExt = fileUrl.match(/\.([^.]+)$/)?.[1] || '';
  }

  const scheme = colorSchemes[fileExt] || colorSchemes.default;
  const docTitle = resource && resource.resourceType || 'Document';
  const fileTitle = fileExt ? fileExt.toUpperCase() : 'DOC';

return (
  <div
    className={`relative w-full h-full rounded-md shadow-lg overflow-hidden
      bg-gradient-to-b
      from-white dark:from-gray-800
      to-gray-50 dark:to-gray-900
      border border-gray-200 dark:border-gray-700
      flex flex-col
      transition-colors duration-300
      `}
  >
    {/* Folded corner */}
    <div className="absolute top-0 right-0 w-12 h-12
      bg-gradient-to-tr
      from-transparent
      to-gray-300 dark:to-gray-600
      clip-path-[polygon(100%_0,100%_100%,0_100%)]"
      style={{ filter: 'drop-shadow(-1px 1px 1px rgba(0,0,0,0.1))' }}
    />

    {/* Header bar with macOS style buttons */}
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
      <div className="flex space-x-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
        <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></span>
        <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
      </div>
      <div className="ml-auto text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
        {fileExt ? `${fileExt.toUpperCase()} Document` : docTitle}
      </div>
    </div>

    {/* Document content lines simulation */}
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="h-2 rounded-full bg-gray-300 dark:bg-gray-700"
          style={{ width: `${90 - i * 10}%`, opacity: 1 - i * 0.1 }}
        />
      ))}

      {/* Image/chart placeholder */}
      <div className="mt-4 h-20 rounded border-2 border-dashed border-gray-400 dark:border-gray-600
        flex items-center justify-center text-gray-500 dark:text-gray-400 select-none
        bg-gray-100 dark:bg-gray-800"
      >
        IMAGE
      </div>

      {[...Array(4)].map((_, i) => (
        <div
          key={`bottom-${i}`}
          className="h-2 rounded-full bg-gray-300 dark:bg-gray-700"
          style={{ width: `${80 - i * 15}%`, opacity: 0.7 - i * 0.1 }}
        />
      ))}
    </div>

    {/* Footer bar */}
    <div className={`p-2 text-white text-xs font-medium
      bg-gradient-to-r
      from-blue-600 dark:from-blue-700
      to-blue-700 dark:to-blue-900
      shadow-inner select-none
      flex justify-between`}
    >
      <span>{docTitle} {fileExt ? `(${fileExt.toUpperCase()})` : ''}</span>
      <span>Page 1</span>
    </div>

    {/* Paper grain texture overlay */}
    <div className="pointer-events-none absolute inset-0 bg-[url('/paper-texture.png')] opacity-5 mix-blend-overlay" />
  </div>
);

};
  
// Helper function to create paper effects
const createPaperEffect = (resourceFile ) => {
    // Function to enhance document cards with paper-like effects
    return (
      <>
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        
        {/* Subtle shadow at page edges */}
        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.15)] pointer-events-none"></div>
        
        {/* Subtle grain texture */}
        <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none"></div>
        
        {/* Page bend effect */}
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent to-black/10 dark:to-black/20 rounded-tl-lg transform rotate-3 origin-bottom-right pointer-events-none"></div>
      </>
    );
  };

// Helper function to render resource icons
const renderResourceIcon = (type, large = false) => {
    const iconClasses = large 
      ? "absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700"
      : "h-5 w-5 mr-2";
    
    const iconSize = large ? "h-24 w-24" : "h-full w-full";
    
    switch (type) {
      case 'image':
        return (
          <div className={iconClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'video':
        return (
          <div className={iconClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'text':
        return (
          <div className={iconClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-teal-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
        case 'document':
          return (
            <div className={iconClasses}>
              {/* Document icon */}
            </div>
          );
      case 'other':
      default:
        return (
          <div className={iconClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

// Function to get file extension
export const getFileExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\.([^.]+)$/);
  return match ? match[0] : '';
};

// Helper function to render preview content
export const renderPreviewContent = (resource) => {
  if (!resource || typeof resource !== 'object') {
    return null;
  }
  const altText = getResourceAltText(resource);
  
  // Check if we have custom preview settings
 if (resource.previewSettings?.previewImage) {
    return (
      <img
        src={urlForImage(resource.previewSettings.previewImage).url()}
        alt={resource.previewSettings.previewImage?.alt || altText}
        className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        itemProp="contentUrl"
        loading="lazy"
        width="400"
        height="300"
      />
    );
  }

  
      // Enhanced preview content based on resource format
      switch (resource.resourceFormat) {
        case 'image':
          if (resource.resourceFile && getFileUrl(resource.resourceFile) &&
              getFileUrl(resource.resourceFile).match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                const imageUrl = getFileUrl(resource.resourceFile);

            return (
              <>
              <img 
                src={getFileUrl(resource.resourceFile)} 
                alt={altText}
                className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                loading="lazy"
                width="400" 
                height="300"
              />
              <meta itemProp="encodingFormat" content={imageUrl.split('.').pop()} />
              </>
            );
          } else if (resource.mainImage) {
            return (
          
              <img 
                src={urlForImage(resource.mainImage).url()} 
                alt={resource.mainImage?.alt || altText}
                className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                loading="lazy"
                width="400"
                height="300"
                       itemProp="contentUrl"
          
              />
             
            );
          }
          return renderResourceIcon('image', true);
          
        case 'video':
  // First check for custom preview image (your previewSettings)
  if (resource.previewSettings?.previewImage) {
    return (
      <img
        src={urlForImage(resource.previewSettings.previewImage).url()}
        alt={resource.previewSettings.previewImage?.alt || altText}
        className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        loading="lazy"
        width="400"
        height="300"
      />
    );
  }
  
  // If mainImage exists, use it as poster
  if (resource.mainImage) {
    return (
      <img
        src={urlForImage(resource.mainImage).url()}
        alt={resource.mainImage?.alt || altText}
        className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        loading="lazy"
        width="400"
        height="300"
      />
    );
  }
  
  // REMOVE THE AUTOPLAY VIDEO - This was causing the performance issues
  // Instead return a video placeholder with play icon
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="text-white text-sm font-medium">Video Preview</p>
      </div>
    </div>
  );

          case 'text': // For prompt resources
          if (resource.promptContent && Array.isArray(resource.promptContent)) {
            return (
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 overflow-hidden">
                {/* Terminal-style header */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gray-800 dark:bg-black flex items-center px-3 border-b border-white/10">
                  <div className="text-xs text-gray-400 ml-auto">prompt.txt</div>
                </div>
        
                <div className="absolute top-12 left-4 font-mono text-sm text-purple-600 dark:text-purple-400">
                  <span className="opacity-70">$</span> <span className="text-teal-600 dark:text-teal-400">cat</span> prompt.txt
                </div>
        
                <div className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-16 overflow-y-auto max-h-[calc(100%-4rem)] pr-2 space-y-2">
                  {resource.promptContent.slice(0, 5).map((prompt, idx) => (
                    <div key={idx} className="relative">
                      <span className="text-purple-500">➤</span>{" "}
                      {prompt.promptText?.substring(0, 160) || "No prompt text"}
                    </div>
                  ))}
                  <span className="inline-block w-2 h-4 bg-gray-700 dark:bg-gray-300 ml-1 opacity-70 animate-pulse absolute bottom-1 left-1" />
                </div>
              </div>
            );
          }
          return renderResourceIcon('text', true);
        
        case 'document':
          // For document files (PDF, DOC, etc.)
          if (resource.resourceFile) {
            const fileUrl = getFileUrl(resource.resourceFile);
            if (fileUrl) {
              if (fileUrl.match(/\.pdf$/i)) {
                return renderDocumentPreview('pdf');
              } else if (fileUrl.match(/\.(doc|docx)$/i)) {
                return renderDocumentPreview('doc');
              } else if (fileUrl.match(/\.(xls|xlsx)$/i)) {
                return renderDocumentPreview('xls');
              }
              // Default document preview
              return renderDocumentPreview('default');
            }
          }
          
          // Default to main image if available
          if (resource.mainImage) {
            return (
              <img 
                src={urlForImage(resource.mainImage).url()} 
                alt={resource.mainImage?.alt || resource.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              />
            );
          }
          
          // Final fallback
          return renderResourceIcon('document', true);
          
        default:
          // Default to main image if available
          if (resource.mainImage) {
            return (
              <img 
            src={urlForImage(resource.mainImage).url()} 
            alt={resource.mainImage?.alt || altText}
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
            width="400"
            height="300"
          />
            );
          }
          
          // Final fallback
          return renderResourceIcon('other', true);
      }
    };
    
