import React from 'react'
import AboutPageClient from './AboutPageClient'
import Script from "next/script";

export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Do it with AI Tools – Your AI-Powered SEO & Productivity Hub",
  description: "Discover how Do it with AI Tools empowers businesses and individuals to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and free resources.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "About Do it with AI Tools – Your AI-Powered SEO & Productivity Hub",
    description: "Discover how Do it with AI Tools empowers businesses and individuals to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and free resources.",
    images: [
      {
        url: 'https://www.doitwithai.tools/about-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About Do it with AI Tools - AI-Powered SEO and Productivity Platform'
      }
    ],
    url: 'https://www.doitwithai.tools/about',
    type: 'website',
    siteName: 'Do it with AI Tools'
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Do it with AI Tools – Your AI-Powered SEO & Productivity Hub",
    description: "Discover how Do it with AI Tools empowers businesses and individuals to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and free resources.",
    images: ['https://www.doitwithai.tools/about-twitter-image.jpg']
  },
  keywords: "about AI tools, AI SEO platform, artificial intelligence productivity, AI-powered SEO, AI coding resources, AI learning platform, free AI resources, AI automation tools, SEO with AI, AI for business",
  robots: "index, follow",
  canonical: "https://www.doitwithai.tools/about"
};

export default function AboutPage() {
  
  function aboutPageSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Do it with AI Tools",
        "url": "https://www.doitwithai.tools/about",
        "description": "Learn about Do it with AI Tools - your comprehensive platform for mastering SEO with AI, exploring cutting-edge AI tools, learning AI coding, discovering monetization opportunities, and accessing free AI resources.",
        "mainEntity": {
          "@type": "Organization",
          "name": "Do it with AI Tools",
          "url": "https://www.doitwithai.tools",
          "logo": "https://www.doitwithai.tools/logoForHeader.png",
          "description": "Do it with AI Tools is a comprehensive platform that empowers businesses, creators, and marketers to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and resources.",
          "founder": {
            "@type": "Person",
            "name": "Sufian Mustafa",
            "jobTitle": "AI Strategist & Web Developer"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "sufianmustafa0900@gmail.com",
            "url": "https://www.doitwithai.tools/contact",
            "areaServed": "Worldwide",
            "availableLanguage": ["en"]
          },
          "sameAs": [
            "https://twitter.com/doitwithai",
            "https://www.facebook.com/doitwithai",
            "https://www.linkedin.com/company/doitwithai"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "AI Tools and Resources",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "AI SEO Strategies",
                  "description": "Comprehensive AI-powered SEO strategies and tools"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "AI Coding Resources",
                  "description": "AI-assisted coding tutorials and tools"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Free AI Resources",
                  "description": "Downloadable AI templates, prompts, and tools"
                }
              }
            ]
          }
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.doitwithai.tools/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About",
              "item": "https://www.doitwithai.tools/about"
            }
          ]
        }
      }`
    };
  }

  function faqSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Do it with AI Tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Do it with AI Tools is a comprehensive platform that empowers businesses, creators, and marketers to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and resources across 5 dynamic categories: AI Tools, AI SEO, AI Code, AI Learn & Earn, and Free AI Resources."
            }
          },
          {
            "@type": "Question",
            "name": "How can AI help improve my SEO performance?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AI can revolutionize your SEO through automated keyword research, content optimization, technical SEO analysis, link building strategies, and performance monitoring. Our AI SEO section provides comprehensive guides and tools to help you implement these strategies effectively."
            }
          },
          {
            "@type": "Question",
            "name": "Are the AI resources really free to download?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Our Free AI Resources section offers a growing library of downloadable assets including templates, prompts, guides, images, videos, and documents - all completely free to help kickstart your AI journey."
            }
          }
        ]
      }`
    };
  }

  return (
    <>
      <AboutPageClient />
      
      <Script
        id="about-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={aboutPageSchema()}
      />
      
      <Script
        id="about-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema()}
      />
    </>
  );
}