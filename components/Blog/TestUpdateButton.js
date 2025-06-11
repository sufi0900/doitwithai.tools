// components/TestUpdateButton.js - For testing the update notification system

import React from 'react';
import { usePageRefresh } from './PageScopedRefreshContext';

const TestUpdateButton = () => {
  const { simulateContentUpdate, hasUpdatesAvailable, pageType } = usePageRefresh();

  const handleTestUpdate = () => {
    console.log('Testing content update notification...');
    simulateContentUpdate();
  };

  const handleManualTrigger = () => {
    // Trigger via localStorage (simulates external update)
    localStorage.setItem(`${pageType}_last_cms_update`, Date.now().toString());
    
    // Dispatch custom event to notify context
    window.dispatchEvent(new CustomEvent('sanity-content-update', {
      detail: { 
        type: 'sanity-update', 
        pageType,
        timestamp: Date.now()
      }
    }));
  };

  const handleWebhookSimulation = async () => {
    // Simulate a webhook call
    try {
      const response = await fetch('/api/sanity-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _type: 'post', // or whatever document type maps to your pageType
          _rev: 'updated-rev-id',
          title: 'Test Update'
        })
      });
      
      if (response.ok) {
        console.log('Webhook simulation successful');
      }
    } catch (error) {
      console.error('Webhook simulation failed:', error);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold mb-2">Update Testing ({pageType})</h3>
      <div className="space-y-2">
        <button
          onClick={handleTestUpdate}
          className="block w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Context Update
        </button>
        <button
          onClick={handleManualTrigger}
          className="block w-full px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Manual Trigger
        </button>
        <button
          onClick={handleWebhookSimulation}
          className="block w-full px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Webhook
        </button>
        <div className="text-xs mt-2">
          Status: <span className={hasUpdatesAvailable ? 'text-green-600' : 'text-gray-500'}>
            {hasUpdatesAvailable ? 'Updates Available' : 'No Updates'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TestUpdateButton;