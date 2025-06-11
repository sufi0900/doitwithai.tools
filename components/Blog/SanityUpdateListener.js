// components/Blog/SanityUpdateListener.js
"use client";
import { useEffect, useRef } from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

export const SanityUpdateListener = ({ pageType = 'default' }) => {
  const { notifyUpdatesAvailable } = usePageRefresh();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);

  // Function to determine if update is relevant to current page
  const isUpdateRelevantToPage = (documentType, currentPageType) => {
    const documentToPageMap = {
      'seo': ['seo', 'default'],
      'aitool': ['ai-tools', 'default'],
      'coding': ['coding', 'default'],
      'makemoney': ['makemoney', 'default'],
      'seoSubcategory': ['seo', 'default'],
      'freeResources': ['default'],
      'news': ['default']
    };
    
    const affectedPages = documentToPageMap[documentType] || ['default'];
    return affectedPages.includes(currentPageType) || affectedPages.includes('default');
  };

  const connectToSSE = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log(`Connecting to SSE for page type: ${pageType}`);
      
      // Create new EventSource connection
      const eventSource = new EventSource(`/api/sse?pageType=${pageType}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log(`SSE connected for page: ${pageType}`);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          if (data.type === 'cms_update') {
            // Check if this update is relevant to the current page
            if (isUpdateRelevantToPage(data.documentType, pageType)) {
              console.log(`Relevant update received for ${pageType} page:`, {
                documentType: data.documentType,
                timestamp: new Date(data.timestamp).toISOString()
              });
              
              // Notify the page refresh context about the update
              notifyUpdatesAvailable();
              
              // Also show browser notification if supported
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Content Updated', {
                  body: data.message || 'Fresh content has been published. Click refresh to get the latest updates.',
                  icon: '/favicon.ico',
                  tag: 'content-update'
                });
              }
            } else {
              console.log(`Update not relevant for ${pageType} page:`, data.documentType);
            }
          } else if (data.type === 'connected') {
            console.log(`SSE connection established for ${pageType}`);
          } else if (data.type === 'ping') {
            // Keep-alive ping, no action needed
            console.log('SSE ping received');
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error, event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000); // Exponential backoff, max 30s
          
          console.log(`SSE reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToSSE();
          }, delay);
        } else {
          console.error('Max SSE reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  };

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Connect to SSE
    connectToSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [pageType]); // Re-connect if pageType changes

  // This component doesn't render anything visible
  return null;
};

