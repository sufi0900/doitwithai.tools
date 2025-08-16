import React from 'react'
import CategoriesPageCode from "./CategoriesPageCode"
import Script from "next/script";
import { NextSeo } from "next-seo";
import Head from 'next/head';

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
  title: "All AI Categories: SEO, Learn, Earn & More | doitwithai.tools",
  description: "Browse all our AI-driven categories designed to help you improve SEO results and boost overall productivity. Discover everything on doitwithai.tools",
  author: "Sufian Mustafa",
  openGraph: {
    title: "AI Categories - Complete Guide to AI Tools & Resources",
    description: "Explore comprehensive AI categories including SEO optimization, coding assistance, learning resources, productivity tools, and free downloadable content.",
    images: [{
      url: generateOGImageURL({
        title: 'Browse all our AI-driven categories to improve SEO results and boost productivity.',
        // description field is removed
        category: 'doitwithai.tools',
        ctaText: 'Discover All Categories',
        features: 'AI Tools,SEO,Coding,Resources',
      }),
      width: 1200,
      height: 630,
      alt: 'Explore AI categories for SEO, coding, learning, and earning at doitwithai.tools'
    }],
    url: `${getBaseUrl()}/categories`,
    type: 'website',
    siteName: 'doitwithai.tools',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Categories - Complete Guide to AI Tools & Resources",
    description: "Explore comprehensive AI categories including SEO optimization, coding assistance, learning resources, productivity tools, and free downloadable content.",
    image: generateOGImageURL({
      title: 'Browse all our AI-driven categories to improve SEO results and boost productivity.',
      // description field is removed
      category: 'doitwithai.tools',
      ctaText: 'Discover All Categories',
      features: 'AI Tools,SEO,Coding,Resources',
    }),
    site: '@doitwithai',
    creator: '@doitwithai',
  },
  keywords: "AI categories, AI tools directory, AI SEO, AI coding, AI learning, AI resources, artificial intelligence tools, AI productivity, AI automation, free AI resources",
  robots: "index, follow",
  canonical: `${getBaseUrl()}/categories`,
};

export default function CategoriesPage() {
  
  function categoriesSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "All AI Categories: SEO, Learn, Earn & More | doitwithai.tools",
        "url": "${getBaseUrl()}/categories",
        "description": "Explore AI categories from SEO automation to earning with AI. Discover tools, strategies, and free resources to boost productivity at doitwithai.tools.",
        "publisher": {
          "@type": "Organization",
          "name": "doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": "${getBaseUrl()}/logoForHeader.png",
            "width": 600,
            "height": 60
          }
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "AI Categories",
          "description": "Explore top AI-powered categories designed to improve SEO, automate workflows, learn new skills, and increase online earnings.",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Tools",
              "url": "${getBaseUrl()}/ai-tools",
              "description": "Explore the best AI tools to streamline SEO, automate tasks, and improve productivity for marketers, entrepreneurs, and content creators."
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "AI SEO",
              "url": "${getBaseUrl()}/ai-seo",
              "description": "Leverage AI to master SEO. Get strategies for content creation, keyword research, link building, and technical SEO — all powered by AI."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Learn & Earn",
              "url": "${getBaseUrl()}/ai-learn-earn",
              "description": "Learn new skills with AI and discover ways to earn online. Practical guides on making money with automation, content, and digital products."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Free AI Resources",
              "url": "${getBaseUrl()}/free-ai-resources",
              "description": "Download free AI templates, prompt libraries, video tutorials, and guides. Perfect for getting started or scaling your AI workflows."
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "AI Code",
              "url": "${getBaseUrl()}/ai-code",
              "description": "Speed up development with AI. Get help with code generation, debugging, and building smart applications using AI tools."
            }
          ]
        }
      }`
    };
  }

  function organizationSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "doitwithai.tools",
        "url": "${getBaseUrl()}",
        "logo": "${getBaseUrl()}/logoForHeader.png",
        "description": "doitwithai.tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.",
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
      ]
      }`
    };
  }

  function breadcrumbSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
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
            "name": "Categories",
            "item": "${getBaseUrl()}/categories"
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
          images: metadata.openGraph.images,
          type: 'website',
          siteName: metadata.openGraph.siteName,
          locale: metadata.openGraph.locale,
        }}
        twitter={{
          card: metadata.twitter.card,
          site: metadata.twitter.site,
          creator: metadata.twitter.creator,
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
            content: 'index, follow'
          },
        ]}
      />
         </Head>
      <CategoriesPageCode />
      
      {/* Schema Markup */}
      <Script
        id="categories-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={categoriesSchema()}
      />
      
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={organizationSchema()}
      />
      
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
      />
    </>
  )
}