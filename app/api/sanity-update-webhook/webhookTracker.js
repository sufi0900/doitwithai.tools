// lib/webhookTracker.js

// In-memory store for webhook updates (in production, use Redis or database)
let lastWebhookUpdate = 0;
let webhookUpdates = [];

// This will be called by your main webhook to record updates
export function recordWebhookUpdate(documentType, timestamp) {
  lastWebhookUpdate = Math.max(lastWebhookUpdate, timestamp);
  webhookUpdates.push({
    documentType,
    timestamp,
    id: Date.now() + Math.random() // Simple unique ID
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

// Function to get updates since a specific timestamp
export function getFilteredWebhookUpdates(lastCheck) {
  return webhookUpdates.filter(update => update.timestamp > lastCheck);
}

// NOTE FOR PRODUCTION:
// In a production environment with serverless functions (like Vercel),
// these in-memory variables (`lastWebhookUpdate`, `webhookUpdates`) will
// reset with every new function invocation. You MUST replace this with
// a persistent storage solution (e.g., Redis, a simple database table,
// Vercel KV, or a cloud-based key-value store) for reliable update tracking.