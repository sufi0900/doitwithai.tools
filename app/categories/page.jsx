import React from 'react'
import CategoriesPageCode from "./CategoriesPageCode"
import Script from "next/script";

export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "All AI Categories: SEO, Learn, Earn & More | Do it with AI Tools",
  description:
    "Browse all our AI-driven categories designed to help you improve SEO results and boost overall productivity. Discover everything on Do it with AI Tools",
  author: "Sufian Mustafa",
  openGraph: {
    title: "AI Categories - Complete Guide to AI Tools & Resources",
    description: "Explore comprehensive AI categories including SEO optimization, coding assistance, learning resources, productivity tools, and free downloadable content.",
    images: [
      {
        url: 'https://www.doitwithai.tools/categories-og-image.png',
        width: 1200,
        height: 630,
      }
    ],
  },
  keywords: "AI categories, AI tools directory, AI SEO, AI coding, AI learning, AI resources, artificial intelligence tools, AI productivity, AI automation, free AI resources"
};

export default function CategoriesPage() {
  
function categoriesSchema() {
  return {
    __html: `{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "All AI Categories: SEO, Learn, Earn & More | Do it with AI Tools",
      "url": "https://www.doitwithai.tools/categories",
      "description": "Explore AI categories from SEO automation to earning with AI. Discover tools, strategies, and free resources to boost productivity at Do it with AI Tools.",
      "publisher": {
        "@type": "Organization",
        "name": "Do it with AI Tools",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.doitwithai.tools/logoForHeader.png",
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
            "url": "https://www.doitwithai.tools/ai-tools",
            "description": "Explore the best AI tools to streamline SEO, automate tasks, and improve productivity for marketers, entrepreneurs, and content creators."
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI SEO",
            "url": "https://www.doitwithai.tools/ai-seo", 
            "description": "Leverage AI to master SEO. Get strategies for content creation, keyword research, link building, and technical SEO — all powered by AI."
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "AI Learn & Earn",
            "url": "https://www.doitwithai.tools/ai-learn-earn",
            "description": "Learn new skills with AI and discover ways to earn online. Practical guides on making money with automation, content, and digital products."
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Free AI Resources", 
            "url": "https://www.doitwithai.tools/free-ai-resources",
            "description": "Download free AI templates, prompt libraries, video tutorials, and guides. Perfect for getting started or scaling your AI workflows."
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "AI Code",
            "url": "https://www.doitwithai.tools/ai-code",
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
        "name": "Do it with AI Tools", 
        "url": "https://www.doitwithai.tools",
        "logo": "https://www.doitwithai.tools/logoForHeader.png", 
        "description": "doitwithai.tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.", 
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
            "item": "https://www.doitwithai.tools/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Categories",
            "item": "https://www.doitwithai.tools/categories"
          }
        ]
      }`
    };
  }

  return (
    <>
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