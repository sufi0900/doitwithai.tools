import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPDATES_FILE = path.join(process.cwd(), 'tmp', 'webhook-updates.json');

const getUpdates = () => {
  try {
    if (!fs.existsSync(UPDATES_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(UPDATES_FILE, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read updates:', error);
    return [];
  }
};

const getPageTypesForDocument = (documentType) => {
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
};

export async function POST(request) {
  try {
    const { lastCheck, pageType } = await request.json();
    
    const allUpdates = getUpdates();
    const lastCheckTime = lastCheck || 0;
    
    // Filter updates since last check
    const recentUpdates = allUpdates.filter(update => 
      update.timestamp > lastCheckTime
    );
    
    // Check if any updates are relevant to this page type
    const relevantUpdates = recentUpdates.filter(update => {
      const affectedPages = getPageTypesForDocument(update.documentType);
      return affectedPages.includes(pageType) || affectedPages.includes('default');
    });
    
    const hasUpdates = relevantUpdates.length > 0;
    const latestTimestamp = allUpdates.length > 0 
      ? Math.max(...allUpdates.map(u => u.timestamp))
      : 0;
    
    console.log('Update check:', {
      pageType,
      lastCheck: new Date(lastCheckTime).toISOString(),
      hasUpdates,
      relevantUpdates: relevantUpdates.length,
      latestTimestamp: new Date(latestTimestamp).toISOString()
    });
    
    return NextResponse.json({
      hasUpdates,
      updates: relevantUpdates,
      lastWebhookUpdate: latestTimestamp,
      totalUpdates: allUpdates.length
    });
    
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allUpdates = getUpdates();
    const latestTimestamp = allUpdates.length > 0 
      ? Math.max(...allUpdates.map(u => u.timestamp))
      : 0;
    
    return NextResponse.json({
      status: 'Check updates endpoint is working',
      lastWebhookUpdate: latestTimestamp,
      lastWebhookUpdateFormatted: latestTimestamp 
        ? new Date(latestTimestamp).toISOString() 
        : 'None',
      totalRecentUpdates: allUpdates.length,
      recentUpdates: allUpdates.slice(-5),
      usage: {
        method: 'POST',
        body: {
          lastCheck: 'timestamp',
          pageType: 'string (e.g., "seo", "ai-tools")'
        }
      }
    });
    
  } catch (error) {
    console.error('Check updates GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' }, 
      { status: 500 }
    );
  }
}
