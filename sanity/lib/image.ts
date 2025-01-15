// lib/media.ts
import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";
import { client } from "./client";

// Image Builder
const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

export const urlForImage = (source: any) => {
  return imageBuilder?.image(source);
};

// lib/asset.ts
export const urlForGif = (source: any) => {
  return imageBuilder.image(source);
};

export const urlForVideo = async (source) => {
  if (!source?.asset?._ref) {
    return null;
  }
  
  const video = await client.getDocument(source.asset._ref);
  if (!video?.url) return null;
  return video.url;
};

// lib/fileUtils.ts

export async function getFileUrl(ref: { asset: { _ref: string; }; }, quality = 'auto') {
  if (!ref?.asset?._ref) return null;
  try {
    const file = await client.getDocument(ref.asset._ref);
    const fileId = ref.asset._ref.split('-')[1];
    const fileExtension = file?.extension || file?.url.split('.').pop();
    
    // If quality variants exist and a specific quality is requested
    if (file.quality && quality !== 'auto') {
      const qualityVariant = file.quality.find(q => q.label.toLowerCase() === quality);
      if (qualityVariant) return qualityVariant.url;
    }
    
    return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${fileId}.${fileExtension}`;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
}