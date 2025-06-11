// components/Blog/SanityUpdateListener.js
"use client";
import { useEffect, useRef } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

export const SanityUpdateListener = ({ pageType = 'default' }) => {
  const { notifyUpdatesAvailable } = usePageRefresh();
  const eventSourceRef = useRef(null);
  const pollingRef = useRef(null);
  const lastCheckRef = useRef(Date.now());

  useEffect(() => {
    // Function to handle updates
    const handleUpdate = (documentType, timestamp) => {
      console.log('CMS update detected:', { documentType, timestamp, pageType });
      
      // Set the update flag in localStorage
      const timestampStr = timestamp.toString();
      localStorage.setItem(`${pageType}_last_cms_update`, timestampStr);
      localStorage.setItem('global_last_cms_update', timestampStr);
      
      // Notify the context about available updates
      notifyUpdatesAvailable();
      
      // Show a toast notification (optional)
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.info('New content available! Click refresh to update.');
      }
    };

    // Method 1: Server-Sent Events (Primary method for real-time updates)
    const initSSE = () => {
      try {
        eventSourceRef.current = new EventSource(`/api/sse?pageType=${pageType}`);
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'cms-update') {
              handleUpdate(data.documentType, data.timestamp);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error('SSE connection error:', error);
          // Fallback to polling if SSE fails
          startPolling();
        };

        eventSourceRef.current.onopen = () => {
          console.log('SSE connection opened for', pageType);
        };

      } catch (error) {
        console.error('Failed to initialize SSE:', error);
        // Fallback to polling
        startPolling();
      }
    };

    // Method 2: Polling (Fallback method)
    const pollForUpdates = async () => {
      try {
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
            handleUpdate('unknown', data.lastWebhookUpdate);
            lastCheckRef.current = Date.now();
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    const startPolling = () => {
      if (pollingRef.current) return; // Already polling
      
      console.log('Starting polling for', pageType);
      pollingRef.current = setInterval(pollForUpdates, 15000); // Poll every 15 seconds
      // Also check immediately
      pollForUpdates();
    };

    // Method 3: localStorage events (for cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === `${pageType}_last_cms_update` || e.key === 'global_last_cms_update') {
        console.log('Storage change detected:', e.key, e.newValue);
        notifyUpdatesAvailable();
      }
    };

    // Method 4: Custom events (for programmatic triggers)
    const handleCustomUpdate = (event) => {
      if (event.detail && (event.detail.pageType === pageType || event.detail.pageType === 'global')) {
        handleUpdate(event.detail.documentType, event.detail.timestamp);
      }
    };

    // Initialize all methods
    if (typeof window !== 'undefined') {
      // Start with SSE (most reliable for real-time updates)
      initSSE();
      
      // Listen for storage changes (cross-tab sync)
      window.addEventListener('storage', handleStorageChange);
      
      // Listen for custom events
      window.addEventListener('sanity-update', handleCustomUpdate);
    }

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('sanity-update', handleCustomUpdate);
      }
    };
  }, [pageType, notifyUpdatesAvailable]);

  return null; // This component doesn't render anything
};

// Utility function to trigger updates from anywhere in your app
export const triggerSanityUpdate = (documentType, pageType = 'global') => {
  const timestamp = Date.now();
  
  if (typeof window !== 'undefined') {
    // Set update flags
    const timestampStr = timestamp.toString();
    localStorage.setItem(`${pageType}_last_cms_update`, timestampStr);
    localStorage.setItem('global_last_cms_update', timestampStr);
    
    // Dispatch custom event
    const event = new CustomEvent('sanity-update', {
      detail: { documentType, pageType, timestamp }
    });
    window.dispatchEvent(event);
  }
};