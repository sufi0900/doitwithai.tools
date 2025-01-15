// utils/mediaHelpers.ts
import { client } from './client';



export async function getFileUrl(ref: any) {
    if (!ref?.asset?._ref) {
      return null;
    }
    try {
      const file = await client.getDocument(ref.asset._ref);
      
      // Extract file ID from the reference
      const fileId = ref.asset._ref.split('-')[1];
      const fileExtension = file.extension || file.url.split('.').pop();
      
      return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${fileId}.${fileExtension}`;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
  
  