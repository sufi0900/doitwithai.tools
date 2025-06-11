import React, { useState, useEffect } from 'react';

const WebhookDebugger = () => {
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageType, setPageType] = useState('seo');
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Test webhook endpoint
  const testWebhookEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sanity-update-webhook');
      const data = await response.json();
      setWebhookStatus({ success: response.ok, data });
    } catch (error) {
      setWebhookStatus({ success: false, error: error.message });
    }
    setIsLoading(false);
  };

  // Test update checking
  const testUpdateCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastCheck, pageType })
      });
      const data = await response.json();
      setUpdateStatus({ success: response.ok, data });
    } catch (error) {
      setUpdateStatus({ success: false, error: error.message });
    }
    setIsLoading(false);
  };

  // Test CMS status endpoint
  const testCMSStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms-status?pageType=${pageType}&lastCheck=${lastCheck}`);
      const data = await response.json();
      setTestResult({ success: response.ok, data, type: 'CMS Status' });
    } catch (error) {
      setTestResult({ success: false, error: error.message, type: 'CMS Status' });
    }
    setIsLoading(false);
  };

  // Simulate webhook call
  const simulateWebhook = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: pageType, action: 'update' })
      });
      const data = await response.json();
      setTestResult({ success: response.ok, data, type: 'Webhook Simulation' });
    } catch (error) {
      setTestResult({ success: false, error: error.message, type: 'Webhook Simulation' });
    }
    setIsLoading(false);
  };

  // Real-time update listener
  useEffect(() => {
    const eventSource = new EventSource(`/api/sse?pageType=${pageType}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE Message received:', data);
        
        if (data.type === 'cms-update') {
          setTestResult({ 
            success: true, 
            data: { ...data, receivedAt: new Date().toLocaleTimeString() }, 
            type: 'Real-time Update' 
          });
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [pageType]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Webhook System Debugger
      </h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Type
          </label>
          <select 
            value={pageType} 
            onChange={(e) => setPageType(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="seo">SEO</option>
            <option value="aitool">AI Tools</option>
            <option value="coding">Coding</option>
            <option value="makemoney">Make Money</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Check Timestamp
          </label>
          <input 
            type="number" 
            value={lastCheck}
            onChange={(e) => setLastCheck(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button 
          onClick={testWebhookEndpoint}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          Test Webhook
        </button>
        
        <button 
          onClick={testUpdateCheck}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          Check Updates
        </button>
        
        <button 
          onClick={testCMSStatus}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          CMS Status
        </button>
        
        <button 
          onClick={simulateWebhook}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          Simulate Update
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Testing...</span>
        </div>
      )}

      {/* Results Display */}
      <div className="space-y-4">
        {webhookStatus && (
          <div className={`p-4 rounded-md ${webhookStatus.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <h3 className={`font-semibold ${webhookStatus.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
              Webhook Endpoint Test
            </h3>
            <pre className="mt-2 text-sm overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(webhookStatus, null, 2)}
            </pre>
          </div>
        )}

        {updateStatus && (
          <div className={`p-4 rounded-md ${updateStatus.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <h3 className={`font-semibold ${updateStatus.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
              Update Check Test
            </h3>
            <pre className="mt-2 text-sm overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(updateStatus, null, 2)}
            </pre>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-md ${testResult.success ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <h3 className={`font-semibold ${testResult.success ? 'text-blue-800 dark:text-blue-400' : 'text-red-800 dark:text-red-400'}`}>
              {testResult.type} Result
            </h3>
            <pre className="mt-2 text-sm overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Click "Test Webhook" to verify the endpoint is working</li>
          <li>Click "Simulate Update" to trigger a fake webhook event</li>
          <li>Click "Check Updates" to see if updates are detected</li>
          <li>Make actual changes in Sanity CMS and watch for real-time updates</li>
          <li>Check the browser console for additional debug information</li>
        </ol>
      </div>

      {/* Current Status */}
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Current Status:</h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <div>Page Type: <span className="font-mono">{pageType}</span></div>
          <div>Last Check: <span className="font-mono">{new Date(lastCheck).toLocaleString()}</span></div>
          <div>Current Time: <span className="font-mono">{new Date().toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
};

export default WebhookDebugger;