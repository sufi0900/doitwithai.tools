// components/Blog/SanityUpdateListener.js
"use client";

import { useEffect } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

export const SanityUpdateListener = ({ pageType = 'default' }) => {
  const { notifyUpdatesAvailable } = usePageRefresh();

  useEffect(() => {
    // Function to simulate webhook reception on client side
    // This would be called when your webhook endpoint processes an update
    const handleSanityUpdate = (event) => {
      if (event.data && event.data.type === 'sanity-update') {
        console.log('Sanity update received:', event.data);
        
        // Set the update flag in localStorage
        const timestamp = Date.now().toString();
        localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
        localStorage.setItem('global_last_cms_update', timestamp);
        
        // Notify the context about available updates
        notifyUpdatesAvailable();
        
        // Show a toast notification (optional)
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.info('New content available! Click refresh to update.');
        }
      }
    };

    // Listen for custom events (you can dispatch these from your webhook endpoint)
    if (typeof window !== 'undefined') {
      window.addEventListener('sanity-update', handleSanityUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sanity-update', handleSanityUpdate);
      }
    };
  }, [pageType, notifyUpdatesAvailable]);

  return null; // This component doesn't render anything
};

// Utility function to trigger updates from anywhere in your app
export const triggerSanityUpdate = (documentType, pageType = 'global') => {
  const timestamp = Date.now().toString();
  
  if (typeof window !== 'undefined') {
    // Set update flags
    localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
    localStorage.setItem('global_last_cms_update', timestamp);
    
    // Dispatch custom event
    const event = new CustomEvent('sanity-update', {
      detail: { documentType, pageType, timestamp }
    });
    window.dispatchEvent(event);
  }
};