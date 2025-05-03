// utils/seoUtils.js

// Generate structured data JSON-LD based on resource type
export const generateStructuredData = (resource) => {
  if (!resource || !resource.structuredData || resource.structuredData === 'none') {
    return null;
  }

  // Base schema for all types
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": resource.structuredData,
    "name": resource.seoTitle || resource.title,
    "description": resource.seoDescription || resource.overview || "",
  };

  // Add additional properties based on structured data type
  switch (resource.structuredData) {
    case 'DigitalDocument':
      return {
        ...baseSchema,
        "encodingFormat": getFileUrl(resource.resourceFile)?.split('.').pop() || "application/octet-stream",
        "datePublished": resource.publishedAt || new Date().toISOString(),
      };

    case 'ImageObject':
      return {
        ...baseSchema,
        "contentUrl": getFileUrl(resource.resourceFile) || 
                     (resource.mainImage ? urlForImage(resource.mainImage).url() : ""),
        "encodingFormat": "image/jpeg", // Adjust based on actual format if needed
        "caption": resource.previewSettings?.previewImage?.caption || resource.overview || "",
      };

    case 'VideoObject':
      return {
        ...baseSchema,
        "contentUrl": getFileUrl(resource.resourceFile) || resource.resourceLink || "",
        "thumbnailUrl": resource.mainImage ? urlForImage(resource.mainImage).url() : "",
        "uploadDate": resource.publishedAt || new Date().toISOString(),
        "duration": "PT2M", // Placeholder - ideally you'd have actual duration data
      };

    case 'CreativeWork':
      return {
        ...baseSchema,
        "author": {
          "@type": "Organization",
          "name": "Your Website Name" // Replace with dynamic site name if available
        },
        "datePublished": resource.publishedAt || new Date().toISOString(),
        "keywords": resource.seoKeywords?.join(", ") || resource.tags?.join(", ") || "",
      };

    default:
      return baseSchema;
  }
};

// Helper to generate meta tags for resource
export const generateResourceMeta = (resource) => {
  if (!resource) return [];
  
  const title = resource.seoTitle || resource.title || "Resource";
  const description = resource.seoDescription || resource.overview || `${resource.resourceType} resource`;
  const keywords = resource.seoKeywords?.join(", ") || resource.tags?.join(", ") || "";
  
  return [
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    
    // Open Graph meta tags for social sharing
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    // Add og:image if we have one
    ...(resource.mainImage ? [{ 
      property: "og:image", 
      content: urlForImage(resource.mainImage).url() 
    }] : []),
    
    // Twitter card meta tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(resource.mainImage ? [{ 
      name: "twitter:image", 
      content: urlForImage(resource.mainImage).url() 
    }] : []),
  ];
};