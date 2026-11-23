// app/navigation/page.js (Server Component)
import React from 'react';
import Script from "next/script";
import NavigationClient from './NavigationClient';

// Enhanced utility functions
function getBaseUrl() {
  // For production, always use your custom domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';  // Remove trailing slash
  }
  
  // For development
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}

function generateOGImageURL(params) {
  const baseURL = `${getBaseUrl()}/api/og`;
  const searchParams = new URLSearchParams(params);
  return `${baseURL}?${searchParams.toString()}`;
}
export const metadata = {
  title: "Site Navigation | All Pages & Resources - doitwithai.tools",
  description: "Explore the complete sitemap of doitwithai.tools to easily find all our AI guides, free resources, SEO tools, and other essential pages in one place.",
  keywords: "AI tools navigation, artificial intelligence resources, AI coding guides, AI SEO tools, free AI resources, doitwithai.tools sitemap, website navigation",
  authors: [{ name: "Sufian Mustafa" }],
  creator: "Sufian Mustafa",
  publisher: "doitwithai.tools",
  openGraph: {
    title: "Navigate All Sections of doitwithai.tools",
    description: "Explore our complete sitemap to easily find all of our AI guides, free tools, and core pages in one place.",
    url: `${getBaseUrl()}/navigation`,
    siteName: "doitwithai.tools",
    locale: "en_US",
    type: "website",
    images: [{
      url: generateOGImageURL({
        title: 'The complete sitemap to easily find all our AI guides, tools, and pages.',
        // description field is removed
        category: 'Site Navigation',
        ctaText: 'Discover All Sections',
        features: 'Full Sitemap,Easy Access,All Pages',
      }),
      width: 1200,
      height: 630,
      alt: 'Site Navigation - doitwithai.tools'
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Navigation | All Pages & Resources - doitwithai.tools",
    description: "Explore the complete sitemap of doitwithai.tools to easily navigate all pages, including our AI guides, free resources, SEO tools, About, and Contact.",
    creator: "@doitwithai",
    site: "@doitwithai",
    domain: "doitwithai.tools",
    images: [generateOGImageURL({
      title: 'The complete sitemap to easily find all our AI guides, tools, and pages.',
      // description field is removed
      category: 'Site Navigation',
      ctaText: 'Discover All Sections',
      features: 'Full Sitemap,Easy Access,All Pages',
    })],
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
    },
  },
  alternates: {
    canonical: `${getBaseUrl()}/navigation`,
  },
};

export default function NavigationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Site Navigation - doitwithai.tools",
    "description": "Navigate through our comprehensive AI resource hub with tools, guides, and resources for AI implementation.",
    "url": `${getBaseUrl()}/navigation`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "doitwithai.tools",
      "url": `${getBaseUrl()}`
    },
    "mainEntity": {
      "@type": "SiteNavigationElement",
      "name": "AI Tools Navigation",
      "url": `${getBaseUrl()}/navigation`
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${getBaseUrl()}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Navigation",
          "item": `${getBaseUrl()}/navigation`
        }
      ]
    }
  };

  return (
    <>
      <Script
        id="navigation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        key="navigation-jsonld"
      />
      <NavigationClient />
    </>
  );
}