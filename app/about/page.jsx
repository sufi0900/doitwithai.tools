import React from 'react'
import AboutPageClient from './AboutPageClient'
import Script from "next/script";
import { NextSeo } from 'next-seo';
import Head from 'next/head';

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
  title: "About Do It With AI Tools – Our Story, Mission, and Vision",
  description: "Learn about Do It With AI Tools, our mission to empower creators & businesses with AI insights, & the story behind building this smart AI-powered platform.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "About Do It With AI Tools – Our Story, Mission, and Vision",
    description: "Learn about Do It With AI Tools, our mission to empower creators & businesses with AI insights, & the story behind building this smart AI-powered platform.",
    images: [{
      url: generateOGImageURL({
        title: 'The Story of Do It With AI Tools — Our Mission to Empower Creators & Businesses with AI Insights',
        // description: 'Learn about the vision and mission behind doitwithai.tools, a platform dedicated to making powerful AI tools accessible to everyone.',
        category: 'Our Mission',
        ctaText: 'Discover Our Story',
        features: 'Our Story,Our Vision,Our Values',
      }),
      width: 1200,
      height: 630,
      alt: 'About Do It With AI Tools – Our Story, Mission, and Vision'
    }],
    url: `${getBaseUrl()}/about`,
    type: 'website',
    siteName: 'doitwithai.tools'
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Do It With AI Tools – Our Story, Mission, and Vision",
    description: "Learn about Do It With AI Tools, our mission to empower creators & businesses with AI insights, & the story behind building this smart AI-powered platform.",
    image: generateOGImageURL({
      title: 'The Story of Do It With AI Tools — Our Mission to Empower Creators & Businesses with AI Insights',
      // description: 'Learn about the vision and mission behind doitwithai.tools, a platform dedicated to making powerful AI tools accessible to everyone.',
      category: 'Our Mission',
      ctaText: 'Discover Our Story',
        features: 'Our Story,Our Vision,Our Values',
    }),
  },
  keywords: "about AI tools, AI SEO platform, artificial intelligence productivity, AI-powered SEO, AI coding resources, AI learning platform, free AI resources, AI automation tools, SEO with AI, AI for business",
  robots: "index, follow",
  canonical: `${getBaseUrl()}/about`
};

export default function AboutPage() {
  
  function aboutPageSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About doitwithai.tools",
        "url": "${getBaseUrl()}/about",
        "description": "Learn about Do It With AI Tools, our mission to empower creators & businesses with AI insights, & the story behind building this smart AI-powered platform.",
        "mainEntity": {
          "@type": "Organization",
          "name": "doitwithai.tools",
          "url": "${getBaseUrl()}",
          "logo": "${getBaseUrl()}/logoForHeader.png",
          "description": "doitwithai.tools is a comprehensive platform that empowers businesses, creators, and marketers to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and resources.",
          "founder": {
            "@type": "Person",
            "name": "Sufian Mustafa",
            "jobTitle": "AI Strategist & Web Developer"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "sufianmustafa0900@gmail.com",
            "url": "${getBaseUrl()}/contact",
            "areaServed": "Worldwide",
            "availableLanguage": ["en"]
          },
        "sameAs": [
        "https://x.com/doitwithaitools",
        "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://www.pinterest.com/doitwithai/",
        "https://www.tiktok.com/@doitwithai.tools",
        "https://www.youtube.com/@doitwithaitools"
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
              "item": "${getBaseUrl()}/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About",
              "item": "${getBaseUrl()}/about"
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
            "name": "What is doitwithai.tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "doitwithai.tools is a comprehensive platform that empowers businesses, creators, and marketers to double their SEO performance and boost productivity using cutting-edge AI strategies, tools, and resources across 5 dynamic categories: AI Tools, AI SEO, AI Code, AI Learn & Earn, and Free AI Resources."
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
    <Head>
      <NextSeo
        title={metadata.title}
        description={metadata.description}
        canonical={metadata.canonical}
        openGraph={{
          title: metadata.openGraph.title,
          description: metadata.openGraph.description,
          url: metadata.openGraph.url,
          type: metadata.openGraph.type,
          siteName: metadata.openGraph.siteName,
          images: metadata.openGraph.images,
        }}
        twitter={{
          card: metadata.twitter.card,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.image,
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: metadata.keywords
          },
          {
            name: 'author',
            content: metadata.author
          },
          {
            name: 'robots',
            content: metadata.robots
          }
        ]}
      />
      </Head>
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