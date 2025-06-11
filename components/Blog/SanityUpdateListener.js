"use client";
import { useEffect, useRef } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

export const SanityUpdateListener = ({ pageType = 'default' }) => {
  const { notifyUpdatesAvailable } = usePageRefresh();
  const pollingRef = useRef(null);
  const lastCheckRef = useRef(Date.now());

  useEffect(() => {
    // Function to poll for updates from your webhook endpoint
    const pollForUpdates = async () => {
      try {
        // Check if there have been any webhook calls since our last check
        const response = await fetch('/api/check-updates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastCheck: lastCheckRef.current,
            pageType
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasUpdates) {
            console.log('Updates detected for', pageType, ':', data);
            
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
            
            // Update our last check time
            lastCheckRef.current = Date.now();
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    // Function to simulate webhook reception on client side
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

    // Start polling every 30 seconds
    const startPolling = () => {
      pollingRef.current = setInterval(pollForUpdates, 30000);
      // Also check immediately
      pollForUpdates();
    };

    // Start polling when component mounts
    startPolling();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sanity-update', handleSanityUpdate);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
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