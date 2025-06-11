// app/api/sanity-update-webhook/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPDATES_FILE = path.join(process.cwd(), 'tmp', 'webhook-updates.json');

// Ensure tmp directory exists
const ensureTmpDir = () => {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
};

// Store update in persistent storage
const recordWebhookUpdate = (documentType, timestamp) => {
  try {
    ensureTmpDir();
    let updates = [];
    
    if (fs.existsSync(UPDATES_FILE)) {
      const fileContent = fs.readFileSync(UPDATES_FILE, 'utf8');
      updates = JSON.parse(fileContent);
    }
    
    updates.push({
      documentType,
      timestamp,
      id: Date.now() + Math.random()
    });
    
    // Keep only last 100 updates
    if (updates.length > 100) {
      updates = updates.slice(-100);
    }
    
    fs.writeFileSync(UPDATES_FILE, JSON.stringify(updates, null, 2));
    
    console.log('Webhook update recorded:', {
      documentType,
      timestamp: new Date(timestamp).toISOString(),
      totalUpdates: updates.length
    });
    
    // IMPORTANT: Broadcast to all SSE clients
    broadcastToSSEClients({
      type: 'cms_update',
      documentType,
      timestamp,
      message: 'Fresh content has been published. Click refresh to get the latest updates.'
    });
    
  } catch (error) {
    console.error('Failed to record webhook update:', error);
  }
};

// Function to broadcast to SSE clients
const broadcastToSSEClients = (data) => {
  if (global.sseClients && global.sseClients.size > 0) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    // Create a copy of clients to iterate over
    const clients = Array.from(global.sseClients);
    
    clients.forEach(client => {
      try {
        client.write(message);
        console.log(`Broadcasted update to SSE client for page: ${client.pageType}`);
      } catch (error) {
        console.error('Failed to broadcast to SSE client:', error);
        // Remove failed client
        global.sseClients.delete(client);
      }
    });
    
    console.log(`Broadcasted to ${clients.length} SSE clients`);
  } else {
    console.log('No SSE clients connected');
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check webhook secret
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = process.env.SANITY_WEBHOOK_SECRET || 'US3PE3jFjvyQ9Z6Y';
    
    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { _type: documentType, _id, _rev } = body;
    
    console.log('Sanity webhook received:', {
      documentType,
      _id,
      _rev,
      timestamp: new Date().toISOString()
    });
    
    const timestamp = Date.now();
    
    // Record the update
    recordWebhookUpdate(documentType, timestamp);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      documentType,
      timestamp,
      broadcastSent: true
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    sseClientsConnected: global.sseClients ? global.sseClients.size : 0
  });
}