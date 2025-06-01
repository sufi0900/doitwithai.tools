// app/navigation/page.js (Server Component)
import NavigationClient from './NavigationClient';

export const metadata = {
  title: "Site Navigation | DoItWithAI.tools - Explore AI Resources & Tools",
  description: "Navigate through our comprehensive AI resource hub. Discover AI tools, coding guides, SEO strategies, learning resources, and free downloadable assets to accelerate your AI journey.",
  keywords: "AI tools navigation, artificial intelligence resources, AI coding guides, AI SEO tools, free AI resources, AI learning platform",
  authors: [{ name: "DoItWithAI.tools" }],
  creator: "DoItWithAI.tools",
  publisher: "DoItWithAI.tools",
  openGraph: {
    title: "Site Navigation | DoItWithAI.tools - Explore AI Resources & Tools",
    description: "Navigate through our comprehensive AI resource hub. Discover AI tools, coding guides, SEO strategies, learning resources, and free downloadable assets.",
    url: "https://doitwithai.tools/navigation",
    siteName: "DoItWithAI.tools",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Navigation | DoItWithAI.tools",
    description: "Navigate through our comprehensive AI resource hub. Discover AI tools, coding guides, SEO strategies, and more.",
    creator: "@doitwithaitools",
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
    canonical: "https://doitwithai.tools/navigation",
  },
};

export default function NavigationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Site Navigation - DoItWithAI.tools",
    "description": "Navigate through our comprehensive AI resource hub with tools, guides, and resources for AI implementation.",
    "url": "https://doitwithai.tools/navigation",
    "isPartOf": {
      "@type": "WebSite",
      "name": "DoItWithAI.tools",
      "url": "https://doitwithai.tools"
    },
    "mainEntity": {
      "@type": "SiteNavigationElement",
      "name": "AI Tools Navigation",
      "url": "https://doitwithai.tools/navigation"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://doitwithai.tools"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Navigation",
          "item": "https://doitwithai.tools/navigation"
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavigationClient />
    </>
  );
}