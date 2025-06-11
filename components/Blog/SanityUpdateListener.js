"use client";
import { useEffect, useRef } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

export const SanityUpdateListener = ({ pageType = 'default' }) => {
  const { notifyUpdatesAvailable } = usePageRefresh();
  const pollingRef = useRef(null);
  const lastCheckRef = useRef(Date.now());
  const sseRef = useRef(null);

  useEffect(() => {
    // Function to poll for updates from your webhook endpoint
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
            lastCheckRef.current = Math.max(data.lastWebhookUpdate, data.pageSpecificUpdate);
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    // Setup Server-Sent Events for real-time updates
    const setupSSE = () => {
      try {
        const eventSource = new EventSource(`/api/sse?pageType=${pageType}`);
        sseRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'cms-update') {
              console.log('Real-time update received:', data);
              
              // Set the update flag in localStorage
              const timestamp = Date.now().toString();
              localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
              localStorage.setItem('global_last_cms_update', timestamp);
              
              // Notify the context about available updates
              notifyUpdatesAvailable();
              
              // Show a toast notification
              if (typeof window !== 'undefined' && window.toast) {
                window.toast.info('Fresh content has been published. Click refresh to get the latest updates.');
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          // Fallback to polling if SSE fails
          if (!pollingRef.current) {
            startPolling();
          }
        };

        eventSource.onopen = () => {
          console.log(`SSE connection opened for ${pageType}`);
        };

      } catch (error) {
        console.error('Failed to setup SSE:', error);
        // Fallback to polling
        startPolling();
      }
    };

    // Function to handle Sanity updates via custom events
    const handleSanityUpdate = (event) => {
      if (event.data && event.data.type === 'sanity-update') {
        console.log('Sanity update received:', event.data);
        
        // Set the update flag in localStorage
        const timestamp = Date.now().toString();
        localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
        localStorage.setItem('global_last_cms_update', timestamp);
        
        // Notify the context about available updates
        notifyUpdatesAvailable();
        
        // Show a toast notification
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.info('Fresh content has been published. Click refresh to get the latest updates.');
        }
      }
    };

    // Listen for custom events
    if (typeof window !== 'undefined') {
      window.addEventListener('sanity-update', handleSanityUpdate);
    }

    // Start polling function
    const startPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = setInterval(pollForUpdates, 30000); // Poll every 30 seconds
      // Also check immediately
      pollForUpdates();
    };

    // Try SSE first, fallback to polling
    setupSSE();
    
    // Also start polling as backup
    setTimeout(startPolling, 2000); // Start polling after 2 seconds

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sanity-update', handleSanityUpdate);
      }
      
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [pageType, notifyUpdatesAvailable]);

  return null; // This component doesn't render anything
};

// Utility function to trigger updates from anywhere in your app
export const triggerSanityUpdate = (documentType, pageType = 'global') => {
  const timestamp = Date.now().toString();
  
  if (typeof window !== 'undefined') {
    // Setup update flags
    localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
    localStorage.setItem('global_last_cms_update', timestamp);
    
    // Dispatch custom event
    const event = new CustomEvent('sanity-update', {
      detail: { documentType, pageType, timestamp }
    });
    window.dispatchEvent(event);
  }
};