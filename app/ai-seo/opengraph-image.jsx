// app/ai-seo/opengraph-image.jsx
import { ImageResponse } from 'next/og';
import OGImageTemplate from '@/app/generateMetadata'; // Adjust the import path

// Set the runtime to edge for better performance
export const runtime = 'edge';

// Image metadata
export const alt = 'AI in SEO & Digital Marketing';
export const size = {
  width: 1200,
  height: 630,
};

// Define the generateImage function
export default function Image() {
  const title = "AI in SEO & Digital Marketing";
  const description = "AI is revolutionizing how we approach SEO and digital marketing, making it smarter, faster, and more effective!";

  return new ImageResponse(
    (
      <OGImageTemplate 
        title={title} 
        description={description} 
      />
    ),
    {
      ...size,
    }
  );
}