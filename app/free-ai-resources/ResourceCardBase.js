// components/ResourceCardBase.js
import React, { useState } from 'react';
import { getFileUrl, renderPreviewContent } from "./resourceUtils";
import ResourceModal from './ResourceModal';
import ResourceSchema from './ResourceSchema';

const ResourceCardBase = ({ resource, renderUI }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getResourceFileUrl = (fileObj) => {
    if (fileObj && fileObj.url) return fileObj.url;
    return getFileUrl(fileObj);
  };
  // Handle download or resource access (your existing code)
  const handleResourceAccess = () => {
    // For prompt resources, open the modal
    if (resource.resourceFormat === 'text' && resource.promptContent) {
      setIsModalOpen(true);
      return;
    }
    
    if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
      // For direct download from Sanity
      const fileUrl = getResourceFileUrl(resource.resourceFile);
      const fileName = resource.resourceFile.originalFilename || 
        `${resource.title.replace(/\s+/g, '-').toLowerCase()}${getFileExtension(fileUrl)}`;
      
      if (!fileUrl) {
        console.error('Could not determine file URL for', resource.title);
        return;
      }
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (resource.resourceLink) {
      // For external links
      window.open(resource.resourceLink, '_blank');
    }
  };

  return (
    <>
          <ResourceSchema resource={resource} />

      {renderUI({ 
        resource, 
        renderPreviewContent: () => renderPreviewContent(resource),
        handleResourceAccess,
        openModal: () => setIsModalOpen(true)
      })}
      
      <ResourceModal
        resource={resource}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ResourceCardBase;