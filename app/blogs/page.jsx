import React from 'react';
import AllPosts from './AllPosts'; 
import Script from "next/script";

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Blog Library: Latest Insights on SEO & More | Do it with AI Tools",
  description: "Explore our comprehensive AI blog collection featuring cutting-edge insights on AI tools, SEO strategies, coding techniques, & monetization opportunities",
  author: "Sufian Mustafa",
  keywords: "AI blog, AI tools, AI SEO, AI coding, AI monetization, artificial intelligence articles, AI tutorials, AI strategies, AI resources, machine learning blog, AI insights, AI productivity, AI for business, AI automation, AI learning",
  openGraph: {
    title: "AI Blog Hub - Latest AI Insights & Expert Strategies",
    description: "Discover cutting-edge AI content covering tools, SEO, coding, and monetization. Your complete resource for mastering artificial intelligence in business and daily life.",
    type: "website",
    url: "https://www.doitwithai.tools/blogs",
    siteName: "Do it with AI Tools",
    images: [
      {
        url: "https://www.doitwithai.tools/images/blogs-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Blog Hub - Latest Insights and Strategies"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Blog Hub - Latest AI Insights & Expert Strategies",
    description: "Discover cutting-edge AI content covering tools, SEO, coding, and monetization strategies.",
    images: ["https://www.doitwithai.tools/images/blogs-twitter-card.jpg"],
    creator: "@doitwithai"
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
    canonical: "https://www.doitwithai.tools/blogs"
  },
  other: {
    'article:author': 'Sufian Mustafa',
    'article:publisher': 'Do it with AI Tools',
    'og:locale': 'en_US',
    'og:site_name': 'Do it with AI Tools'
  }
};

export default function BlogsPage() {
  
  function blogCollectionSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Do it with AI Tools Blog",
        "url": "https://www.doitwithai.tools/blogs",
        "description": "Comprehensive AI blog featuring expert insights on AI tools, SEO strategies, coding techniques, and monetization opportunities. Your go-to resource for mastering artificial intelligence in business and daily workflows.",
        "publisher": {
          "@type": "Organization",
          "name": "Do it with AI Tools",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.doitwithai.tools/logoForHeader.png",
            "width": 600,
            "height": 60
          },
          "url": "https://www.doitwithai.tools",
          "sameAs": [
            "https://twitter.com/doitwithai",
            "https://www.facebook.com/doitwithai",
            "https://www.linkedin.com/company/doitwithai"
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "AI Blog Categories",
          "description": "Explore our comprehensive AI blog categories",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Tools Blog",
              "url": "https://www.doitwithai.tools/ai-tools",
              "description": "Latest reviews, tutorials, and insights on cutting-edge AI tools for productivity, SEO, and business automation."
            },
            {
              "@type": "ListItem", 
              "position": 2,
              "name": "AI SEO Blog",
              "url": "https://www.doitwithai.tools/ai-seo",
              "description": "Expert strategies for leveraging artificial intelligence to revolutionize your SEO performance and search rankings."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Code Blog", 
              "url": "https://www.doitwithai.tools/ai-code",
              "description": "Programming tutorials and development insights using AI to accelerate coding, solve problems, and build better applications."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "AI Learn & Earn Blog",
              "url": "https://www.doitwithai.tools/ai-learn-earn", 
              "description": "Practical guides for acquiring AI skills and unlocking income opportunities through artificial intelligence."
            }
          ]
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.doitwithai.tools/blogs?search={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "about": [
          {
            "@type": "Thing",
            "name": "Artificial Intelligence",
            "description": "Machine learning, AI tools, and automation technologies"
          },
          {
            "@type": "Thing", 
            "name": "Search Engine Optimization",
            "description": "SEO strategies, techniques, and AI-powered optimization methods"
          },
          {
            "@type": "Thing",
            "name": "Programming",
            "description": "Coding tutorials, development practices, and AI-assisted programming"
          },
          {
            "@type": "Thing",
            "name": "Online Monetization", 
            "description": "Digital income strategies and AI-powered earning opportunities"
          }
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
            "name": "Blogs",
            "item": "https://www.doitwithai.tools/blogs"
          }
        ]
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
            "name": "What topics does the Do it with AI Tools blog cover?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our blog covers four main categories: AI Tools (reviews and tutorials), AI SEO (search optimization strategies), AI Code (programming with AI assistance), and AI Learn & Earn (skill development and monetization opportunities)."
            }
          },
          {
            "@type": "Question",
            "name": "How often is new content published?",
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "We publish new AI-focused content regularly, with multiple articles per week covering the latest trends, tools, and strategies in artificial intelligence, SEO, and digital marketing."
            }
          },
          {
            "@type": "Question",
            "name": "Are the AI tools and strategies mentioned in the blog suitable for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our content is designed for all skill levels. We provide step-by-step tutorials for beginners while also offering advanced strategies for experienced users looking to leverage AI more effectively."
            }
          },
          {
            "@type": "Question",
            "name": "Can I filter blog posts by specific categories or topics?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Our blog page features advanced filtering options that allow you to sort by categories (AI Tools, AI SEO, AI Code, AI Learn & Earn), publication date, and search for specific topics or keywords."
            }
          }
        ]
      }`
    };
  }

  function websiteSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Do it with AI Tools - Blog Section",
        "url": "https://www.doitwithai.tools/blogs",
        "description": "Explore a full collection of AI-focused blog articles including SEO strategies, skill development, and income generation guides.",
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Do it with AI Tools",
          "url": "https://www.doitwithai.tools"
        },
        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa",
          "url": "https://www.doitwithai.tools/about"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Do it with AI Tools",
          "logo": "https://www.doitwithai.tools/logoForHeader.png"
        }
      }`
    };
  }

  return (
    <>
      {/* Structured Data Scripts */}
      <Script
        id="blog-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={blogCollectionSchema()}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema()}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={websiteSchema()}
      />

      {/* Main Content */}
      <AllPosts />
    </>
  );
}