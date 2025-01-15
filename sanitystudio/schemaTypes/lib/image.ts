// lib/media.ts
import createImageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from '../env';
import { client } from './client';

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
});



export const urlForImage = (source: any) => {
  if (!source?.asset?._ref) return null;
  return imageBuilder.image(source);
};

// lib/media.ts


export async function getFileUrl(ref: { asset: { _ref: string; }; }) {
  if (!ref?.asset?._ref) return null;
  
  try {
    const file = await client.getDocument(ref.asset._ref);
    const fileId = ref.asset._ref.split('-')[1];
    const baseUrl = `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${fileId}`;
    
    return {
      '1080p': `${baseUrl}_1080p.mp4`,
      '720p': `${baseUrl}_720p.mp4`,
      '480p': `${baseUrl}_480p.mp4`,
      original: `${baseUrl}.mp4`
    };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
}