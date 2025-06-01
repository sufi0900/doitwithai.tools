// utils/testSchema.js
export const validateSchema = (resource) => {
    // Create the schema for this specific resource
    const schema = createResourceSchema(resource);
    
    // Log to console for debugging
    console.log(`Testing schema for resource: ${resource.title}`);
    console.log(schema);
    
    // Return schema
    return schema;
  };
  
  const createResourceSchema = (resource) => {
    // Create appropriate schema based on resource type
    const baseSchema = {
      "@context": "https://schema.org",
      "name": resource.title,
      "description": resource.seoDescription || resource.overview || `${resource.resourceType} resource`,
      "keywords": resource.seoKeywords || resource.tags || []
    };
    
    let specificSchema = {};
    
    switch (resource.resourceFormat) {
      case 'image':
        specificSchema = {
          "@type": "ImageObject",
          "contentUrl": resource.resourceFile ? getFileUrl(resource.resourceFile) : '',
        };
        break;
      case 'video':
        specificSchema = {
          "@type": "VideoObject",
          "contentUrl": resource.resourceFile ? getFileUrl(resource.resourceFile) : '',
        };
        break;
      case 'text':
        specificSchema = {
          "@type": "TextDigitalDocument"
        };
        break;
      case 'document':
        specificSchema = {
          "@type": "DigitalDocument"
        };
        break;
      default:
        specificSchema = {
          "@type": "LearningResource"
        };
    }
    
    return { ...baseSchema, ...specificSchema };
  };