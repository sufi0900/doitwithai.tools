// components/ResourceModalsProvider.js
import React, { useState, useEffect } from 'react';
import ResourceModal from '@/app/free-resources/ResourceModal';
import { createPortal } from 'react-dom';

const ResourceModalsProvider = ({ resources }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Mount only on client-side
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // We need client-side rendering for portals
  if (!isBrowser || !resources || !Array.isArray(resources) || resources.length === 0) {
    return null;
  }
  
  // Create a portal to render all possible modals at the document root level
  return createPortal(
    <>
      {resources.map(resource => (
        <ResourceModalContainer 
          key={`modal-${resource._id}`} 
          resource={resource} 
        />
      ))}
    </>,
    document.body
  );
};

const ResourceModalContainer = ({ resource }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Listen for modal open events
    const handleModalEvent = (e) => {
      if (e.detail && e.detail.id === resource._id) {
        setIsOpen(true);
      } else if (e.detail && e.detail.closeAll) {
        setIsOpen(false);
      }
    };
    
    // Register event listeners
    window.addEventListener('openResourceModal', handleModalEvent);
    window.addEventListener('closeAllResourceModals', handleModalEvent);
    
    return () => {
      window.removeEventListener('openResourceModal', handleModalEvent);
      window.removeEventListener('closeAllResourceModals', handleModalEvent);
    };
  }, [resource._id]);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  return (
    <ResourceModal 
      resource={resource}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};

export default ResourceModalsProvider;