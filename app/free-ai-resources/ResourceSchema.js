// components/ResourceSchema.js
import React from 'react';
import { getFileUrl } from './resourceUtils';

const ResourceSchema = ({ resource }) => {
  if (!resource) return null;
  
  // Base schema that applies to all resource types
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": resource.title,
    "description": resource.overview || `${resource.resourceType} resource for AI usage`,
    "datePublished": resource.publishedAt || new Date().toISOString().split('T')[0],
    "keywords": resource.tags ? resource.tags.join(', ') : "AI resources",
    "author": {
      "@type": "Organization",
      "name": "DoItWithAI.tools"
    }
  };
  
  // Add specific schema based on resource format
  let specificSchema = {};
  
  switch (resource.resourceFormat) {
    case 'image':
      specificSchema = {
        "@type": "ImageObject",
        "contentUrl": resource.resourceFile ? getFileUrl(resource.resourceFile) : '',
        "encodingFormat": resource.resourceFile ? getFileUrl(resource.resourceFile).split('.').pop() : 'image',
      };
      break;
      
    case 'video':
      specificSchema = {
        "@type": "VideoObject",
        "contentUrl": resource.resourceFile ? getFileUrl(resource.resourceFile) : resource.resourceLink,
        "thumbnailUrl": resource.mainImage ? resource.mainImage.asset.url : '',
        "uploadDate": resource.publishedAt || new Date().toISOString().split('T')[0],
        "duration": "PT1M" // Placeholder duration, ideally would be dynamic
      };
      break;
      
    case 'text':
      specificSchema = {
        "@type": "TextDigitalDocument",
        "text": resource.promptContent ? 
          resource.promptContent.map(p => p.promptText).join('\n\n') : 
          "Text resource content"
      };
      break;
      
    case 'document':
      specificSchema = {
        "@type": "DigitalDocument",
        "encodingFormat": resource.resourceFile ? 
          getFileUrl(resource.resourceFile).split('.').pop() : 'document',
        "contentUrl": resource.resourceFile ? getFileUrl(resource.resourceFile) : ''
      };
      break;
      
    default:
      specificSchema = {};
  }
  
  // Add related article if available
  if (resource.relatedArticle) {
    baseSchema.isPartOf = {
      "@type": "Article",
      "name": resource.relatedArticle.title,
      "url": `https://www.doitwithai.tools/${resource.relatedArticle.slug?.current}`
    };
  }

  // Merge schemas
  const finalSchema = { ...baseSchema, ...specificSchema };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalSchema) }}
    />
  );
};

export default ResourceSchema;