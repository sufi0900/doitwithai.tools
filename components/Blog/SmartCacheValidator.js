// components/Blog/SmartCacheValidator.js
"use client";
import { client } from "@/sanity/lib/client";
import { cacheService } from './useCache';

export class SmartCacheValidator {
    static async hasNewContent(cacheKey, documentType, lastRefreshTime) {
        try {
            // Get the timestamp of the most recent document of this type
            const query = `*[_type == "${documentType}"] | order(_updatedAt desc)[0] {
                _updatedAt,
                _createdAt
            }`;
            
            const latestDoc = await client.fetch(query);
            
            if (!latestDoc) return false;
            
            const latestUpdateTime = new Date(Math.max(
                new Date(latestDoc._updatedAt).getTime(),
                new Date(latestDoc._createdAt).getTime()
            )).getTime();
            
            // Compare with last refresh time
            return latestUpdateTime > lastRefreshTime;
            
        } catch (error) {
            console.error('Error checking for new content:', error);
            return false;
        }
    }
    
    static async validateCacheForUpdates(cacheKey, documentType) {
        const cachedData = cacheService.get(cacheKey);
        if (!cachedData) return true; // No cache, needs refresh
        
        const cacheTimestamp = cachedData.timestamp || 0;
        return await this.hasNewContent(cacheKey, documentType, cacheTimestamp);
    }
}
