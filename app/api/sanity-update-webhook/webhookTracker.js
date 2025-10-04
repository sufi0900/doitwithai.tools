//app/api/sanity-update-webhook/webhookTracker.js

// In-memory store for webhook updates (in production, use Redis or database)
let lastWebhookUpdate = 0;
let webhookUpdates = [];
let pageSpecificUpdates = {}; // Track updates per page type

// This will be called by your main webhook to record updates
export function recordWebhookUpdate(documentType, timestamp) {
  lastWebhookUpdate = Math.max(lastWebhookUpdate, timestamp);
  
  webhookUpdates.push({
    documentType,
    timestamp,
    id: Date.now() + Math.random() // Simple unique ID
  });

  // Record page-specific updates
  const pageTypes = getPageTypesForDocument(documentType);
  pageTypes.forEach(pageType => {
    if (!pageSpecificUpdates[pageType]) {
      pageSpecificUpdates[pageType] = [];
    }
    pageSpecificUpdates[pageType].push({
      documentType,
      timestamp,
      id: Date.now() + Math.random()
    });
  });

  // Keep only last 100 updates to prevent memory issues
  if (webhookUpdates.length > 100) {
    webhookUpdates = webhookUpdates.slice(-100);
  }

  // Clean page-specific updates
  Object.keys(pageSpecificUpdates).forEach(pageType => {
    if (pageSpecificUpdates[pageType].length > 50) {
      pageSpecificUpdates[pageType] = pageSpecificUpdates[pageType].slice(-50);
    }
  });

  // Log for debugging
  console.log('Webhook update recorded:', {
    documentType,
    timestamp: new Date(timestamp).toISOString(),
    totalUpdates: webhookUpdates.length,
    affectedPages: pageTypes
  });
}

// Function to get the latest timestamp for polling
export function getLatestWebhookTimestamp() {
  return lastWebhookUpdate;
}

// Function to get updates since a specific timestamp
export function getFilteredWebhookUpdates(lastCheck) {
  const filtered = webhookUpdates.filter(update => update.timestamp > lastCheck);
  console.log('Filtered webhook updates:', {
    lastCheck: new Date(lastCheck).toISOString(),
    foundUpdates: filtered.length,
    updates: filtered
  });
  return filtered;
}

// NEW: Function to check if a specific page type has updates
export function hasPageUpdates(pageType, lastCheck) {
  const pageUpdates = pageSpecificUpdates[pageType] || [];
  const hasUpdates = pageUpdates.some(update => update.timestamp > lastCheck);
  
  console.log('Page update check:', {
    pageType,
    lastCheck: new Date(lastCheck).toISOString(),
    hasUpdates,
    updateCount: pageUpdates.length
  });
  
  return hasUpdates;
}

// NEW: Function to get the latest update timestamp for a specific page
export function getPageSpecificUpdate(pageType) {
  const pageUpdates = pageSpecificUpdates[pageType] || [];
  if (pageUpdates.length === 0) return 0;
  
  const latestUpdate = Math.max(...pageUpdates.map(update => update.timestamp));
  console.log('Page specific update:', {
    pageType,
    latestUpdate: latestUpdate ? new Date(latestUpdate).toISOString() : 'None',
    totalUpdates: pageUpdates.length
  });
  
  return latestUpdate;
}

// Function to get all recent updates (for debugging)
export function getAllRecentUpdates(limit = 10) {
  return webhookUpdates.slice(-limit);
}

// Function to clear old updates (cleanup)
export function clearOldUpdates(olderThanTimestamp) {
  const originalLength = webhookUpdates.length;
  webhookUpdates = webhookUpdates.filter(update => update.timestamp > olderThanTimestamp);
  
  // Clean page-specific updates too
  Object.keys(pageSpecificUpdates).forEach(pageType => {
    pageSpecificUpdates[pageType] = pageSpecificUpdates[pageType].filter(
      update => update.timestamp > olderThanTimestamp
    );
  });
  
  console.log(`Cleared ${originalLength - webhookUpdates.length} old webhook updates`);
}

// Helper function to determine which page types are affected by a document type
function getPageTypesForDocument(documentType) {
  const documentToPageMap = {
    'seo': ['seo', 'default'],
    'aitool': ['ai-tools', 'default'],
    'coding': ['coding', 'default'],
    'makemoney': ['makemoney', 'default'],
    'seoSubcategory': ['seo', 'default'],
    'freeResources': ['default'],
    'news': ['default']
  };
  
  return documentToPageMap[documentType] || ['default'];
}