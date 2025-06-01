// components/ResourceListSchema.jsx
import React from 'react';

const ResourceListSchema = ({ resources, baseUrl }) => {
  if (!resources || resources.length === 0) return null;
  
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": resources.map((resource, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": resource.resourceFormat === 'image' ? 'ImageObject' :
                resource.resourceFormat === 'video' ? 'VideoObject' :
                resource.resourceFormat === 'text' ? 'TextDigitalDocument' : 'DigitalDocument',
        "name": resource.title,
        "description": resource.overview || `${resource.resourceType} resource`,
        "url": baseUrl || "https://www.doitwithai.tools/free-ai-resources"
      }
    }))
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
    />
  );
};

export default ResourceListSchema;