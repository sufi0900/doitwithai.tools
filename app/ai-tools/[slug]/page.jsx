//slug page 

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import AiToolSlugPageCode from "./code";
import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { urlForImage } from "@/sanity/lib/image";
import { GlobalArticleCacheProvider } from './GlobalArticleCacheContext';

export const revalidate = false;
export const dynamic = "force-dynamic";

async function getData(slug) {
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]{
    ...,
    "estimatedReadingTime": length(pt::text(content)) / 250,
    "wordCount": length(pt::text(content)),
    "headings": content[_type == "block" && style in ["h1", "h2", "h3", "h4", "h5", "h6"]]{
      "text": pt::text(@),
      "level": style,
      "anchor": lower(pt::text(@))
    }
  }`;
   const data = await client.fetch(query, {}, { 
    cache: 'force-cache', // Changed from 'no-store' to enable caching
    next: { 
      tags: ['aitool', slug],
      revalidate: 300 // Revalidate every 5 minutes
    } 
  });
  return data;
}
export async function generateMetadata({ params }) {
  const data = await getData(params.slug);
  
  if (!data) {
    return {
      title: 'Page Not Found | DoItWithAI.tools',
      description: 'The requested AI tool page was not found.',
    };
  }

  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  
  return {
    title: `${data.metatitle}`,
    description: data.metadesc,
    keywords: data.tags?.map(tag => tag.name).join(', ') || '',
    authors: [{ name: "Sufian Mustafa", url: "https://www.doitwithai.tools/author/sufian-mustafa" }],
    creator: "Sufian Mustafa",
    publisher: "DoItWithAI.tools",
    category: 'AI Tools',
    classification: 'Technology',
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: data.metatitle,
      description: data.metadesc,
      url: canonicalUrl,
      siteName: 'DoItWithAI.tools',
      locale: 'en_US',
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: data.mainImage?.alt || data.metatitle,
        type: 'image/jpeg',
      }] : [],
      publishedTime: data.publishedAt,
      modifiedTime: data._updatedAt,
      section: 'AI Tools',
      tags: data.tags?.map(tag => tag.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@doitwithai',
      creator: '@sufianmustafa',
      title: data.metatitle,
      description: data.metadesc,
      images: imageUrl ? [imageUrl] : [],
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

export default async function ParentPage({ params }) {
  const data = await getData(params.slug);
  
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600">The AI tool you're looking for doesn't exist.</p>
      </div>
    );
  }

  const metadata = await generateMetadata({ params });
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const readingTime = Math.ceil((data.wordCount || 1000) / 250);

  // Enhanced Schema Markup Functions
 // Enhanced Schema Markup Functions
function generateArticleSchema() {
  const headingStructure = data.headings?.map((heading, index) => ({
    "@type": "WebPageElement",
    "@id": `${canonicalUrl}#heading-${index + 1}`,
    "name": heading.text,
    "cssSelector": heading.level // More robust
  })) || [];

  // Flatten content blocks and truncate for schema
  const articleContentText = data.content ? 
    data.content.map(block => 
      block._type === 'block' ? block.children?.map(child => child.text).join(' ') : ''
    ).join(' ') : '';

  // Truncate to desired length (e.g., ~750 characters) for schema
  const truncatedArticleBody = articleContentText.length > 750 ? 
    articleContentText.substring(0, 750) + '...' : 
    articleContentText;

  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["Article", "TechArticle"], // TechArticle is good for AI tools
      "@id": `${canonicalUrl}#article`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl,
        "url": canonicalUrl
      },
      "headline": data.metatitle, // Use headline as primary title
      "name": data.schematitle || data.metatitle, // Redundant if same as headline, but harmless
      "description": data.schemadesc || data.metadesc,
      "abstract": data.overview, // Good to include if you have an abstract
      "articleSection": "AI Tools", // Consistent with your category
      "articleBody": truncatedArticleBody, // Use the truncated version
      "wordCount": data.wordCount || Math.round((data.estimatedReadingTime || 0) * 250),
      "datePublished": data.publishedAt,
      "dateModified": data._updatedAt || data.publishedAt,
      "dateCreated": data._createdAt || data.publishedAt,
      "author": {
        "@type": "Person",
        "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person",
        "name": "Sufian Mustafa",
        "url": "https://www.doitwithai.tools/author/sufian-mustafa",
        "jobTitle": "AI Technology Expert",
        "knowsAbout": ["Artificial Intelligence", "AI Tools", "SEO", "Content Marketing", "Digital Marketing"], // Expanded
        "sameAs": [
          "https://twitter.com/sufianmustafa",
          "https://linkedin.com/in/sufianmustafa"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.doitwithai.tools#organization",
        "name": "Do It With AI Tools", // Consistent brand name
        "url": "https://www.doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.doitwithai.tools/logoForHeader.png", // Ensure this is 512x512
          "width": 512,
          "height": 512
        },
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        }
      },
      "image": imageUrl ? {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630,
        "caption": data.mainImage?.alt || data.metatitle,
        "contentUrl": imageUrl,
        "thumbnailUrl": imageUrl
      } : undefined,
      "url": canonicalUrl,
      "mainEntity": { // This part might be slightly redundant with Article as main entity, but harmless
        "@type": "Thing",
        "name": data.title,
        "description": data.overview
      },
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.doitwithai.tools#website"
      },
      "hasPart": headingStructure,
      "keywords": data.tags?.map(tag => tag.name).join(", ") || "",
      "about": {
        "@type": "Thing",
        "name": "Artificial Intelligence Tools",
        "sameAs": "https://en.wikipedia.org/wiki/Artificial_intelligence"
      },
      "mentions": data.tags?.map(tag => ({
        "@type": "Thing",
        "name": tag.name
      })) || [],
      "inLanguage": "en-US",
      "copyrightYear": new Date().getFullYear(),
      "copyrightHolder": {
        "@type": "Organization",
        "@id": "https://www.doitwithai.tools#organization"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "accessibilityFeature": [
        "alternativeText",
        "readingOrder",
        "structuralNavigation",
        "tableOfContents"
      ],
      "accessibilityHazard": "none",
      "accessibilityControl": [
        "fullKeyboardControl",
        "fullMouseControl"
      ],
      "educationalLevel": "beginner",
      "learningResourceType": "article",
      "potentialAction": [
        {
          "@type": "ReadAction",
          "target": [canonicalUrl]
        },
        {
          "@type": "ShareAction",
          "target": [canonicalUrl]
        }
      ]
    })
  };
}
  function generateCorrectTableOfContentsSchema() {
    if (!data.tableOfContents || data.tableOfContents.length === 0) {
      return null;
    }

    const tocItems = [];
    let position = 1;

    data.tableOfContents.forEach((item) => {
      // Add main heading
      tocItems.push({
        "@type": "ListItem",
        "position": position++,
        "name": item.heading,
        "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
        "item": {
          "@type": "WebPageElement",
          "name": item.heading,
          "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
        }
      });

      // Add subheadings if they exist
      if (item.subheadings && item.subheadings.length > 0) {
        item.subheadings.forEach((sub) => {
          tocItems.push({
            "@type": "ListItem",
            "position": position++,
            "name": sub.subheading,
            "url": `${canonicalUrl}#${sub.subheading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
            "item": {
              "@type": "WebPageElement",
              "name": sub.subheading,
              "url": `${canonicalUrl}#${sub.subheading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
            }
          });
        });
      }
    });

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${canonicalUrl}#table-of-contents`,
        "name": "Table of Contents",
        "description": `Table of contents for ${data.metatitle}`,
        "numberOfItems": tocItems.length,
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": tocItems
      })
    };
  }

  function generateBreadcrumbSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": {
              "@type": "WebPage",
              "@id": "https://www.doitwithai.tools/",
              "url": "https://www.doitwithai.tools/"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI Tools",
            "item": {
              "@type": "WebPage",
              "@id": "https://www.doitwithai.tools/ai-tools",
              "url": "https://www.doitwithai.tools/ai-tools"
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.schematitle || data.metatitle,
            "item": {
              "@type": "WebPage",
              "@id": canonicalUrl,
              "url": canonicalUrl
            }
          }
        ]
      })
    };
  }

  function generateFAQSchema() {
    if (!data.faqs || data.faqs.length === 0) {
      return null;
    }

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": data.faqs.map((faq, index) => ({
          "@type": "Question",
          "@id": `${canonicalUrl}#faq-${index + 1}`,
          "name": faq.question,
          "text": faq.question,
          "answerCount": 1,
          "acceptedAnswer": {
            "@type": "Answer",
            "@id": `${canonicalUrl}#faq-answer-${index + 1}`,
            "text": faq.answer,
            "dateCreated": data.publishedAt,
            "upvoteCount": 0,
            "url": `${canonicalUrl}#faq-${index + 1}`,
            "author": {
              "@type": "Person",
              "name": "Sufian Mustafa"
            }
          }
        }))
      })
    };
  }

  function generateWebPageSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": canonicalUrl,
        "url": canonicalUrl,
        "name": data.metatitle,
        "description": data.metadesc,
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.doitwithai.tools#website"
        },
        "primaryImageOfPage": imageUrl ? {
          "@type": "ImageObject",
          "url": imageUrl
        } : undefined,
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "author": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization"
        },
        "mainContentOfPage": {
          "@type": "WebPageElement",
          "cssSelector": "main"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", "h2", ".overview"]
        }
      })
    };
  }

  function generateWebSiteSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://www.doitwithai.tools#website",
        "url": "https://www.doitwithai.tools",
        "name": "Do It With AI Tools",
        "alternateName": ["DoItWithAI.tools", "DIWAI Tools"],
        "description": "Do It With AI Tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.",
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.doitwithai.tools#website"
        },
        "about": {
          "@type": "Thing",
          "name": "Artificial Intelligence",
          "description": "AI tools, resources, and educational content"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "AI enthusiasts, developers, marketers, entrepreneurs"
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.doitwithai.tools/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "sameAs": [
          "https://twitter.com/doitwithai",
          "https://facebook.com/doitwithai",
          "https://linkedin.com/company/doitwithai"
        ]
      })
    };
  }
  function generateOrganizationSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://www.doitwithai.tools#organization",
        "name": "Do It With AI Tools",
        "legalName": "Do It With AI Tools",
        "alternateName": ["DoItWithAI.tools", "DIWAI Tools"],
        "url": "https://www.doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.doitwithai.tools/logoForHeader.png",
          "width": 512,
          "height": 512,
          "caption": "Do It With AI Tools Logo"
        },
        "image": {
          "@type": "ImageObject",
          "url": "https://www.doitwithai.tools/logoForHeader.png"
        },
        "description": "Do it with AI Tools is your central platform to master SEO using cutting-edge AI insights and discover how artificial intelligence can revolutionize your daily tasks. We empower businesses, creators, and marketers double SEO performance and boost overall productivity by strategically automating repetitive tasks using our free AI resources. Explore our in-depth strategies and tools, designed for anyone looking to unlock the full potential of AI in real-world workflows.",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person",
          "name": "Sufian Mustafa"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "PK",
          "addressRegion": "Khyber Pakhtunkhwa"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "contact@doitwithai.tools",
            "availableLanguage": "English"
          }
        ],
        "sameAs": [
          "https://twitter.com/doitwithai",
          "https://facebook.com/doitwithai",
          "https://linkedin.com/company/doitwithai"
        ],
        "knowsAbout": [
          "Artificial Intelligence",
          "AI Tools",
          "Machine Learning",
          "Productivity Software",
          "SEO Optimization",
          "Content Creation",
          "Automation"
        ]
      })
    };
  }

 // New: How-to Schema for instructional content
 function generateHowToSchema() {
  // Only generate HowTo schema for how-to guides and tutorials
  if (!data.articleType || !['howto', 'tutorial'].includes(data.articleType)) {
    return null;
  }
  
  if (!data.tableOfContents || data.tableOfContents.length === 0) {
    return null;
  }

  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${canonicalUrl}#howto`,
      "name": `How to use ${data.title}`,
      "description": data.metadesc,
      "image": imageUrl ? {
        "@type": "ImageObject",
        "url": imageUrl
      } : undefined,
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Computer or mobile device"
        },
        {
          "@type": "HowToSupply", 
          "name": "Internet connection"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": data.title
        }
      ],
      "step": data.tableOfContents.map((item, index) => ({
        "@type": "HowToStep",
        "name": item.heading,
        "text": item.heading,
        "position": index + 1,
        "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      })),
      "totalTime": `PT${readingTime}M`,
      "author": {
        "@type": "Person",
        "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person"
      }
    })
  };
}

  // New: Software Application Schema for AI tools
  function generateSoftwareApplicationSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${canonicalUrl}#software`,
        "name": data.title,
        "description": data.metadesc,
        "url": canonicalUrl,
        "applicationCategory": "AI Tool",
        "applicationSubCategory": "Productivity Software",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "countriesSupported": "Worldwide",
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "creator": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization"
        },
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "screenshot": imageUrl ? {
          "@type": "ImageObject",
          "url": imageUrl
        } : undefined,
        "featureList": data.tags?.map(tag => tag.name) || ["AI Tools", "Productivity", "Automation"],
        "softwareRequirements": "Web Browser",
        "memoryRequirements": "1GB RAM",
        "processorRequirements": "Any modern processor",
        "storageRequirements": "No local storage required"
      })
    };
  }
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Enhanced Basic Meta Tags */}
        <title>{data.metatitle} | DoItWithAI.tools</title>
        <meta name="description" content={data.metadesc} />
        <meta name="keywords" content={data.tags?.map(tag => tag.name).join(', ') || ''} />
        <meta name="author" content="Sufian Mustafa" />
        <meta name="creator" content="Sufian Mustafa" />
        <meta name="publisher" content="DoItWithAI.tools" />
        
        {/* Enhanced Robots Meta */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Article-Specific Meta Tags */}
        <meta name="article:published_time" content={data.publishedAt} />
        <meta name="article:modified_time" content={data._updatedAt || data.publishedAt} />
        <meta name="article:author" content="Sufian Mustafa" />
        <meta name="article:section" content="AI Tools" />
        <meta name="article:tag" content={data.tags?.map(tag => tag.name).join(', ') || ''} />
        
        {/* Content Classification */}
        <meta name="classification" content="Technology" />
        <meta name="category" content="AI Tools" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="subject" content="Artificial Intelligence Tools" />
        <meta name="topic" content="AI Technology" />
        
        {/* Reading Time and Content Info */}
        <meta name="reading-time" content={`${Math.ceil(data.estimatedReadingTime || 1)} minutes`} />
        <meta name="word-count" content={data.wordCount || Math.round((data.estimatedReadingTime || 0) * 250)} />
        
        {/* Enhanced Open Graph Meta Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="DoItWithAI.tools" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={data.metatitle} />
        <meta property="og:description" content={data.metadesc} />
        <meta property="og:url" content={canonicalUrl} />
        {imageUrl && (
          <>
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:secure_url" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={data.mainImage?.alt || data.metatitle} />
            <meta property="og:image:type" content="image/jpeg" />
          </>
        )}
        <meta property="article:published_time" content={data.publishedAt} />
        <meta property="article:modified_time" content={data._updatedAt || data.publishedAt} />
        <meta property="article:author" content="Sufian Mustafa" />
        <meta property="article:section" content="AI Tools" />
        {data.tags?.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag.name} />
        ))}

        {/* Enhanced Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@doitwithai" />
        <meta name="twitter:creator" content="@sufianmustafa" />
        <meta name="twitter:title" content={data.metatitle} />
        <meta name="twitter:description" content={data.metadesc} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${Math.ceil(data.estimatedReadingTime || 1)} minutes`} />
        <meta name="twitter:label2" content="Written by" />
        <meta name="twitter:data2" content="Sufian Mustafa" />

        {/* Canonical and Alternate Links */}
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" type="application/rss+xml" title="DoItWithAI.tools RSS Feed" href="https://www.doitwithai.tools/rss.xml" />
        
        {/* Theme and Performance */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Content Security and Cache Control */}
        <meta httpEquiv="cache-control" content="public, max-age=31536000, immutable" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* NextSeo Component */}
      <NextSeo
        title={`${data.metatitle} | DoItWithAI.tools`}
        description={data.metadesc}
        canonical={canonicalUrl}
        openGraph={metadata.openGraph}
        twitter={metadata.twitter}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: data.tags?.map(tag => tag.name).join(', ') || ''
          },
          {
            name: 'author',
            content: 'Sufian Mustafa'
          }
        ]}
      />
      </Head>

      

      {/* Enhanced Schema Markup Scripts - Prioritizing Article Elements */}
     
      <Script
        id="WebSiteSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateWebSiteSchema()}
        strategy="beforeInteractive"
      />

      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateOrganizationSchema()}
        strategy="beforeInteractive"
      />

      <Script
        id="WebPageSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateWebPageSchema()}
        strategy="beforeInteractive"
      />

      <Script
        id="ArticleSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateArticleSchema()}
        strategy="afterInteractive"
      />

      <Script
        id="BreadcrumbListSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateBreadcrumbSchema()}
        strategy="afterInteractive"
      />

      {generateCorrectTableOfContentsSchema() && (
        <Script
          id="TableOfContentsSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={generateCorrectTableOfContentsSchema()}
          strategy="afterInteractive"
        />
      )}
{/* Replace the duplicate script section with this */}
{generateHowToSchema() && (
  <Script
    id="HowToSchema"
    type="application/ld+json"
    dangerouslySetInnerHTML={generateHowToSchema()}
    strategy="afterInteractive"
  />
)}

{data.displaySettings?.isSoftwareReview && (
  <Script
    id="SoftwareApplicationSchema"
    type="application/ld+json"
    dangerouslySetInnerHTML={generateSoftwareApplicationSchema()}
    strategy="afterInteractive"
  />
)}
      {generateFAQSchema() && (
        <Script
          id="FAQSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={generateFAQSchema()}
          strategy="afterInteractive"
        />
      )}

      {/* Main Content with Enhanced Semantic Structure */}
      <main role="main" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content={data.metatitle} />
        <meta itemProp="description" content={data.metadesc} />
        <meta itemProp="datePublished" content={data.publishedAt} />
        <meta itemProp="dateModified" content={data._updatedAt || data.publishedAt} />
        <div itemProp="author" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content="Sufian Mustafa" />
        </div>
        <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
          <meta itemProp="name" content="DoItWithAI.tools" />
          <meta itemProp="url" content="https://www.doitwithai.tools" />
        </div>
        {imageUrl && (
          <div itemProp="image" itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={imageUrl} />
            <meta itemProp="width" content="1200" />
            <meta itemProp="height" content="630" />
          </div>
        )}
        
        <AiToolSlugPageCode data={data} params={params} />
      </main>
    </>
  );
}