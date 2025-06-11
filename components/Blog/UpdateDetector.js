// components/Blog/UpdateDetector.js
import { client } from "@/sanity/lib/client";
import groq from "groq";

export class UpdateDetector {
  static checkInterval = 30000; // Check every 30 seconds
  static lastCheckTimes = new Map(); // Store last check times per document type
  
  /**
   * Check if there are updates for a specific document type
   * @param {string} documentType - The Sanity document type (e.g., 'seo', 'aitool')
   * @param {Function} onUpdateDetected - Callback when updates are found
   */
  static async startPolling(documentType, onUpdateDetected) {
    const checkForUpdates = async () => {
      try {
        // Get the last time we checked for this document type
        const lastCheckTime = this.lastCheckTimes.get(documentType) || Date.now() - 60000; // Default to 1 minute ago
        
        // Query for documents updated since last check
        const updatedDocs = await client.fetch(
          groq`*[_type == $docType && _updatedAt > $lastCheck] | order(_updatedAt desc) [0...1] {_id, _updatedAt}`,
          { 
            docType: documentType, 
            lastCheck: new Date(lastCheckTime).toISOString() 
          }
        );
        
        if (updatedDocs && updatedDocs.length > 0) {
          console.log(`✅ Updates detected for ${documentType}:`, updatedDocs);
          
          // Update our last check time to now
          this.lastCheckTimes.set(documentType, Date.now());
          
          // Notify that updates are available
          if (onUpdateDetected) {
            onUpdateDetected(updatedDocs);
          }
          
          return true; // Updates found
        } else {
          // Update last check time even if no updates (to prevent checking same timeframe)
          this.lastCheckTimes.set(documentType, Date.now());
          return false; // No updates
        }
      } catch (error) {
        console.error(`Error checking for ${documentType} updates:`, error);
        return false;
      }
    };
    
    // Check immediately
    await checkForUpdates();
    
    // Then check every 30 seconds
    const intervalId = setInterval(checkForUpdates, this.checkInterval);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      this.lastCheckTimes.delete(documentType);
    };
  }
  
  /**
   * Check for updates across multiple document types
   * @param {string[]} documentTypes - Array of document types to check
   * @param {Function} onUpdateDetected - Callback when updates are found
   */
  static async startMultiPolling(documentTypes, onUpdateDetected) {
    const cleanupFunctions = [];
    
    for (const docType of documentTypes) {
      const cleanup = await this.startPolling(docType, (updates) => {
        onUpdateDetected(docType, updates);
      });
      cleanupFunctions.push(cleanup);
    }
    
    // Return function to cleanup all polling
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }
  
  /**
   * One-time check for updates (useful for manual refresh)
   * @param {string} documentType 
   * @param {number} sinceTimestamp - Check for updates since this timestamp
   */
  static async checkOnce(documentType, sinceTimestamp = Date.now() - 300000) { // Default: 5 minutes ago
    try {
      const updatedDocs = await client.fetch(
        groq`*[_type == $docType && _updatedAt > $since] | order(_updatedAt desc) {_id, _updatedAt}`,
        { 
          docType: documentType, 
          since: new Date(sinceTimestamp).toISOString() 
        }
      );
      
      return updatedDocs && updatedDocs.length > 0;
    } catch (error) {
      console.error(`Error in one-time check for ${documentType}:`, error);
      return false;
    }
  }
}