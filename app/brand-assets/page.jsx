// /app/brand-assets/page.js
// SERVER COMPONENT - Handles metadata, SEO, and schema

import BrandAssetsClient from './BrandAssetsClient';
import Script from 'next/script';
import { brandImages } from './brandImagesData'; // ← ADD IMPORT

// Enhanced utility function
function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

// METADATA - Server Component Only
export const metadata = {
  title: "Brand Assets & Official Logos | Do It With AI Tools",
  description: "Download official Do It With AI Tools brand assets, logos, screenshots, and images. High-quality Do It With AI Tools branding materials for media coverage, partnerships, and reference.",
  
  keywords: "do it with ai tools logo, do it with ai tools brand, doitwithai.tools assets, do it with ai brand images, ai tools branding, do it with ai screenshots",
  
  authors: [{ 
    name: "Sufian Mustafa",
    url: `${getBaseUrl()}/about`
  }],
  
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  
  openGraph: {
    title: "Do It With AI Tools - Official Brand Assets & Logos",
    description: "Download official Do It With AI Tools logos, screenshots, and brand images for media coverage and partnerships",
    url: `${getBaseUrl()}/brand-assets`,
    type: "website",
    siteName: "Do It With AI Tools",
    locale: "en_US",
    images: [
      {
        url: `${getBaseUrl()}/doitwithai-tools-logo-full.png`,
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Official Brand Assets and Logos",
      },
      {
        url: `${getBaseUrl()}/logoForHeader.png`,
        width: 600,
        height: 60,
        alt: "Do It With AI Tools Header Logo",
      }
    ]
  },
  
  twitter: {
    card: "summary_large_image",
    site: "@doitwithai",
    creator: "@doitwithai",
    title: "Do It With AI Tools - Official Brand Assets",
    description: "Download official Do It With AI Tools logos and brand images",
    images: [`${getBaseUrl()}/doitwithai-tools-logo-full.png`]
  },
  
  alternates: {
    canonical: `${getBaseUrl()}/brand-assets`,
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

// STRUCTURED DATA SCHEMAS
function brandAssetsPageSchema() {
  const baseUrl = getBaseUrl();
  
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Do It With AI Tools - Official Brand Assets",
      "description": "Official brand assets, logos, and images for Do It With AI Tools platform",
      "url": "${baseUrl}/brand-assets",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Do It With AI Tools",
        "url": "${baseUrl}"
      },
      "about": {
        "@type": "Brand",
        "name": "Do It With AI Tools",
        "alternateName": ["do it with ai", "do it with ai tools", "doitwithai.tools"]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "logo": {
          "@type": "ImageObject",
          "url": "${baseUrl}/logoForHeader.png"
        }
      },
      "author": {
        "@type": "Person",
        "name": "Sufian Mustafa",
        "jobTitle": "Founder & AI Content Strategist",
        "worksFor": {
          "@type": "Organization",
          "name": "Do It With AI Tools"
        }
      }
    }`
  };
}

function imageGallerySchema() {
 const baseUrl = getBaseUrl();
  
  // DYNAMICALLY GENERATE from brandImagesData ✅
  const imagesJson = brandImages.map(img => ({
    "@type": "ImageObject",
    "contentUrl": `${baseUrl}${img.src}`,
    "name": img.title,
    "description": img.description,
    "width": String(img.width),
    "height": String(img.height),
    "encodingFormat": `image/${img.format.toLowerCase()}`,
    "caption": img.description,
    "keywords": img.keywords,
    "copyrightHolder": {
      "@type": "Organization",
      "name": img.copyrightHolder
    },
    "creator": {
      "@type": "Person",
      "name": img.creator
    }
  }));
  
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Do It With AI Tools - Official Brand Image Gallery",
      "description": "Complete collection of official Do It With AI Tools brand images",
      "url": `${baseUrl}/brand-assets`,
      "about": {
        "@type": "Brand",
        "name": "Do It With AI Tools"
      },
      "image": imagesJson, // ← AUTO-GENERATED ✅
      "publisher": {
        "@type": "Organization",
        "name": "Do It With AI Tools",
        "logo": `${baseUrl}/logoForHeader.png`
      }
    })
  };
}


function breadcrumbSchema() {
  const baseUrl = getBaseUrl();
  
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${baseUrl}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Brand Assets",
          "item": "${baseUrl}/brand-assets"
        }
      ]
    }`
  };
}

// SERVER COMPONENT - Main Export
export default function BrandAssetsPage() {
  return (
    <>
      {/* Structured Data Schemas */}
      <Script
        id="brand-assets-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={brandAssetsPageSchema()}
        strategy="beforeInteractive"
      />
      
      <Script
        id="image-gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={imageGallerySchema()}
        strategy="beforeInteractive"
      />
      
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        strategy="beforeInteractive"
      />
      
      {/* Client Component - All interactive UI */}
      <BrandAssetsClient />
    </>
  );
}