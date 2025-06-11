// lib/webhookTracker.js
// In-memory store for webhook updates (in production, use Redis or database)
let lastWebhookUpdate = 0;
let webhookUpdates = [];
let pageSpecificUpdates = new Map(); // NEW: Track page-specific updates

// This will be called by your main webhook to record updates
export function recordWebhookUpdate(documentType, timestamp) {
  lastWebhookUpdate = Math.max(lastWebhookUpdate, timestamp);
  
  const updateRecord = {
    documentType,
    timestamp,
    id: Date.now() + Math.random() // Simple unique ID
  };
  
  webhookUpdates.push(updateRecord);

  // NEW: Track page-specific updates
  const pageTypeMapping = {
    'seo': ['seo', 'global'],
    'aitool': ['ai-tools', 'global'],
    'coding': ['coding', 'global'],
    'makemoney': ['makemoney', 'global'],
    'seoSubcategory': ['seo', 'global'],
    'freeResources': ['global'],
    'news': ['global']
  };

  const affectedPages = pageTypeMapping[documentType] || ['global'];
  
  affectedPages.forEach(pageType => {
    pageSpecificUpdates.set(pageType, timestamp);
    console.log(`Recorded update for page type: ${pageType} at ${timestamp}`);
  });

  // Keep only last 100 updates to prevent memory issues
  if (webhookUpdates.length > 100) {
    webhookUpdates = webhookUpdates.slice(-100);
  }
}

// Function to get the latest timestamp for polling
export function getLatestWebhookTimestamp() {
  return lastWebhookUpdate;
}

// NEW: Get page-specific update timestamp
export function getPageSpecificUpdate(pageType) {
  return pageSpecificUpdates.get(pageType) || 0;
}

// Function to get updates since a specific timestamp
export function getFilteredWebhookUpdates(lastCheck) {
  return webhookUpdates.filter(update => update.timestamp > lastCheck);
}

// NEW: Check if page has updates
export function hasPageUpdates(pageType, lastCheck) {
  const pageUpdate = pageSpecificUpdates.get(pageType) || 0;
  const globalUpdate = pageSpecificUpdates.get('global') || 0;
  const mostRecentUpdate = Math.max(pageUpdate, globalUpdate);
  
  return mostRecentUpdate > lastCheck;
}