// components/SeoAndSchemaWrapper.jsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client"; 

import React, { useMemo } from 'react';
import Script from 'next/script';
import { urlForImage } from '@/sanity/lib/image'; // Assuming this path is correct

/**
 * Reusable component for all SEO meta tags and Schema.org JSON-LD markup.
 *
 * @param {object} props - Component props.
 * @param {object} props.data - The article/page data fetched from Sanity.
 * @param {object} props.params - Next.js route parameters (e.g., { slug: '...' }).
 * @param {string} props.schemaType - The Sanity schema type (e.g., 'seo', 'coding', 'aitool', 'makemoney').
 * @param {string} props.basePath - The base URL path for this schema type (e.g., 'ai-seo', 'ai-code').
 * @param {string} props.articleSection - The specific article section for OpenGraph/Schema (e.g., 'AI in SEO & Digital Marketing').
 * @param {string} props.category - The specific category for meta tags (e.g., 'AI in SEO & Digital Marketing').
 */
export default function SeoAndSchemaWrapper({
  data,
  params,
  schemaType,
  basePath, // e.g., 'ai-seo', 'ai-code'
  articleSection, // e.g., 'AI in SEO & Digital Marketing'
  category // e.g., 'AI in SEO & Digital Marketing'
}) {
  const currentSlug = params.slug;
  const canonicalUrl = `https://doitwithai.tools/${basePath}/${currentSlug}`;
  const imageUrl = data?.mainImage?.localUrl
    ? (data.mainImage.localUrl.startsWith("http") ? data.mainImage.localUrl : `https://doitwithai.tools${data.mainImage.localUrl}`)
    : (data?.mainImage?.asset ? urlForImage(data.mainImage).url() : null);
  const readingTime = data ? Math.ceil((data.wordCount || 1000) / 250) : null;

  // Memoize schema generation to prevent recalculations on every render
  const articleSchema = useMemo(() => generateArticleSchema(data, canonicalUrl, imageUrl, readingTime, articleSection), [data, canonicalUrl, imageUrl, readingTime, articleSection]);
  const tocSchema = useMemo(() => generateCorrectTableOfContentsSchema(data, canonicalUrl), [data, canonicalUrl]);
  const breadcrumbSchema = useMemo(() => generateBreadcrumbSchema(data, canonicalUrl, basePath, schemaType), [data, canonicalUrl, basePath, schemaType]);
  const faqSchema = useMemo(() => generateFAQSchema(data, canonicalUrl), [data, canonicalUrl]);
  const webPageSchema = useMemo(() => generateWebPageSchema(data, canonicalUrl, imageUrl), [data, canonicalUrl, imageUrl]);
  const webSiteSchema = useMemo(() => generateWebSiteSchema(), []); // Does not depend on 'data' or 'params'
  const organizationSchema = useMemo(() => generateOrganizationSchema(), []); // Does not depend on 'data' or 'params'
  const howToSchema = useMemo(() => generateHowToSchema(data, canonicalUrl, imageUrl, readingTime), [data, canonicalUrl, imageUrl, readingTime]);
  const softwareApplicationSchema = useMemo(() => generateSoftwareApplicationSchema(data, canonicalUrl, imageUrl), [data, canonicalUrl, imageUrl]);


  // --- Schema Markup Functions (now internal to the component) ---
  // These functions are pure and rely only on their arguments
  // Ensure they return null if data is null, or if the specific schema is not applicable

  function generateArticleSchema(data, canonicalUrl, imageUrl, readingTime, articleSection) {
    if (!data) return null;

    const headingStructure = data.headings?.map((heading, index) => ({
      "@type": "WebPageElement",
      "@id": `${canonicalUrl}#heading-${index + 1}`,
      "name": heading.text,
      "cssSelector": heading.level // More robust
    })) || [];

    const articleContentText = data.content ? data.content.map(block => block._type === 'block' ? block.children?.map(child => child.text).join('') : '').join('') : '';
    const truncatedArticleBody = articleContentText.length > 750 ? articleContentText.substring(0, 750) + '...' : articleContentText;

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["Article", "TechArticle", "BlogPosting"], // TechArticle is good for SEO articles
        "@id": `${canonicalUrl}#article`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl,
          "url": canonicalUrl
        },
        "headline": data.title || data.metatitle, // Align JSON-LD headline with visible H1
        "name": data.schematitle || data.metatitle, // Redundant if same as headline, but harmless
        "description": data.metadesc,
        "abstract": data.overview, // Good to include if you have an abstract
        "articleSection": articleSection, // Consistent with your category
        "articleBody": truncatedArticleBody, // Use the truncated version
        "wordCount": data.wordCount || Math.round((readingTime || 0) * 250),
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "dateCreated": data._createdAt || data.publishedAt,
        "author": {
          "@type": "Person",
          "@id": "https://doitwithai.tools/author/sufian-mustafa#person",
          "name": "Sufian Mustafa",
          "url": "https://doitwithai.tools/author/sufian-mustafa",
          "jobTitle": "AI Technology Expert",
          "knowsAbout": ["Artificial Intelligence", "AI Tools", "SEO", "Content Marketing", "Digital Marketing"], // Expanded
          "sameAs": [
            "https://twitter.com/sufianmustafa", // Replace with actual Twitter
            "https://linkedin.com/in/sufianmustafa" // Replace with actual LinkedIn
          ]
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://doitwithai.tools#organization",
          "name": "DoItWithAI.tools", // Consistent brand name
          "url": "https://doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": "https://doitwithai.tools/logoForHeader.png", // Ensure this is 512x512
            "width": 512,
            "height": 512
          },
          "foundingDate": "2024",
          "founder": { "@type": "Person", "name": "Sufian Mustafa" }
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
        "mainEntity": {
          // This part might be slightly redundant with Article as main entity, but harmless
          "@type": "Thing",
          "name": data.title,
          "description": data.overview
        },
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://doitwithai.tools#website"
        },
        "hasPart": headingStructure,
        "keywords": data.tags?.map(tag => tag?.name).join(",") || "",
        "about": {
          "@type": "Thing",
          "name": articleSection,
          "sameAs": "https://en.wikipedia.org/wiki/Search_engine_optimization" // Link to SEO Wikipedia
        },
        "mentions": data.tags?.map(tag => ({ "@type": "Thing", "name": tag?.name })) || [],
        "inLanguage": "en-US",
        "copyrightYear": new Date().getFullYear(),
        "copyrightHolder": {
          "@type": "Organization",
          "@id": "https://doitwithai.tools#organization"
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "accessibilityFeature": ["alternativeText", "readingOrder", "structuralNavigation", "tableOfContents"],
        "accessibilityHazard": "none",
        "accessibilityControl": ["fullKeyboardControl", "fullMouseControl"],
        "educationalLevel": "intermediate", // Changed for SEO audience
        "learningResourceType": "article,guide,tutorial", // More specific
        "potentialAction": [
          { "@type": "ReadAction", "target": [canonicalUrl] },
          { "@type": "ShareAction", "target": [canonicalUrl] }
        ]
      })
    };
  }

  function generateCorrectTableOfContentsSchema(data, canonicalUrl) {
    if (!data || !data.tableOfContents || data.tableOfContents.length === 0) {
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

  function generateBreadcrumbSchema(data, canonicalUrl, basePath, schemaType) {
    if (!data) return null;

    const breadcrumbNameMap = {
      seo: "AI in SEO",
      coding: "AI in Coding",
      aitool: "AI Tools",
      makemoney: "AI Learn & Earn",
      news: "AI News",
      freeairesources: "Free AI Resources",
      // Add other schema types as needed
    };

    const breadcrumbPathMap = {
      seo: "/ai-seo",
      coding: "/ai-code",
      aitool: "/ai-tools",
      makemoney: "/ai-learn-earn",
      news: "/ai-news",
      freeairesources: "/free-ai-resources",
      // Add other schema types as needed
    };

    const specificBreadcrumbName = breadcrumbNameMap[schemaType] || 'Category';
    const specificBreadcrumbUrl = breadcrumbPathMap[schemaType] || `/${basePath}`;


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
            "item": { "@type": "WebPage", "@id": "https://doitwithai.tools/", "url": "https://doitwithai.tools/" }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": specificBreadcrumbName, // Specific breadcrumb name
            "item": { "@type": "WebPage", "@id": `https://doitwithai.tools${specificBreadcrumbUrl}`, "url": `https://doitwithai.tools${specificBreadcrumbUrl}` } // Specific breadcrumb URL
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.schematitle || data.metatitle,
            "item": { "@type": "WebPage", "@id": canonicalUrl, "url": canonicalUrl }
          }
        ]
      })
    };
  }

  function generateFAQSchema(data, canonicalUrl) {
    if (!data || !data.faqs || data.faqs.length === 0) {
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
            "author": { "@type": "Person", "name": "Sufian Mustafa" }
          }
        }))
      })
    };
  }

  function generateWebPageSchema(data, canonicalUrl, imageUrl) {
    if (!data) return null;

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
          "@id": "https://doitwithai.tools#website"
        },
        "primaryImageOfPage": imageUrl ? { "@type": "ImageObject", "url": imageUrl } : undefined,
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "author": { "@type": "Person", "name": "Sufian Mustafa" },
        "publisher": { "@type": "Organization", "@id": "https://doitwithai.tools#organization" },
        "mainContentOfPage": { "@type": "WebPageElement", "cssSelector": "main" },
        "breadcrumb": { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb` },
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2", ".overview"] }
      })
    };
  }

  function generateWebSiteSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://doitwithai.tools#website",
        "url": "https://doitwithai.tools",
        "name": "DoItWithAITools",
        "alternateName": ["DoItWithAI.tools", "DIWAITools"],
        "description": "DoItWithAITools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.",
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://doitwithai.tools#website"
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
          "@id": "https://doitwithai.tools#organization"
        },
        "potentialAction": [{
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": "https://doitwithai.tools/search?q={search_term_string}" },
          "query-input": "required name=search_term_string"
        }],
        "sameAs": [
          "https://twitter.com/doitwithai", // Replace with actual Twitter
          "https://facebook.com/doitwithai", // Replace with actual Facebook
          "https://linkedin.com/company/doitwithai" // Replace with actual LinkedIn
        ]
      })
    };
  }

  function generateOrganizationSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://doitwithai.tools#organization",
        "name": "DoItWithAITools",
        "legalName": "DoItWithAITools",
        "alternateName": ["DoItWithAI.tools", "DIWAITools"],
        "url": "https://doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": "https://doitwithai.tools/logoForHeader.png",
          "width": 512,
          "height": 512,
          "caption": "DoItWithAITools Logo"
        },
        "image": {
          "@type": "ImageObject",
          "url": "https://doitwithai.tools/logoForHeader.png"
        },
        "description": "DoitwithAITools is your central platform to master SEO using cutting-edge AI insights and discover how artificial intelligence can revolutionize your daily tasks. We empower businesses, creators, and marketers double SEO performance and boost overall productivity by strategically automating repetitive tasks using our free AI resources. Explore our in-depth strategies and tools, designed for anyone looking to unlock the full potential of AI in real-world workflows.",
        "foundingDate": "2024",
        "founder": { "@type": "Person", "@id": "https://doitwithai.tools/author/sufian-mustafa#person", "name": "Sufian Mustafa" },
        "address": { "@type": "PostalAddress", "addressCountry": "PK", "addressRegion": "Khyber Pakhtunkhwa" },
        "contactPoint": [{
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "contact@doitwithai.tools",
          "availableLanguage": "English"
        }],
        "sameAs": [
          "https://twitter.com/doitwithai", // Replace with actual Twitter
          "https://facebook.com/doitwithai", // Replace with actual Facebook
          "https://linkedin.com/company/doitwithai" // Replace with actual LinkedIn
        ],
        "knowsAbout": ["Artificial Intelligence", "AI Tools", "Machine Learning", "Productivity Software", "SEO Optimization", "Content Creation", "Automation"]
      })
    };
  }

  function generateHowToSchema(data, canonicalUrl, imageUrl, readingTime) {
    if (!data) return null;

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
        "image": imageUrl ? { "@type": "ImageObject", "url": imageUrl } : undefined,
        "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
        "supply": [
          { "@type": "HowToSupply", "name": "Computer or mobile device" },
          { "@type": "HowToSupply", "name": "Internet connection" }
        ],
        "tool": [{ "@type": "HowToTool", "name": data.title }],
        "step": data.tableOfContents.map((item, index) => ({
          "@type": "HowToStep",
          "name": item.heading,
          "text": item.heading,
          "position": index + 1,
          "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
        })),
        "totalTime": `PT${readingTime}M`,
        "author": { "@type": "Person", "@id": "https://doitwithai.tools/author/sufian-mustafa#person" }
      })
    };
  }

  function generateSoftwareApplicationSchema(data, canonicalUrl, imageUrl) {
    if (!data) return null;
    if (!data.displaySettings?.isSoftwareReview) { // Assuming your Sanity schema for `seo` has a `displaySettings.isSoftwareReview` field
      return null;
    }

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${canonicalUrl}#software`,
        "name": data.title,
        "description": data.metadesc,
        "url": canonicalUrl,
        "applicationCategory": "SEO Software", // Specific category
        "applicationSubCategory": "Digital Marketing Tool", // Specific subcategory
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "countriesSupported": "Worldwide",
        "inLanguage": "en-US",
        "isAccessibleForFree": true, // Adjust based on your tool's pricing
        "creator": { "@type": "Organization", "@id": "https://doitwithai.tools#organization" },
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "screenshot": imageUrl ? { "@type": "ImageObject", "url": imageUrl } : undefined,
        "featureList": data.tags?.map(tag => tag?.name) || ["SEO", "Content Optimization", "Keyword Research"],
        "softwareRequirements": "Web Browser",
        "memoryRequirements": "1GB RAM",
        "processorRequirements": "Any modern processor",
        "storageRequirements": "No local storage required"
      })
    };
  }

  // --- End Schema Markup Functions ---


  return (
    <>

      {/* Enhanced Schema Markup Scripts - Prioritizing Article Elements */}
      {webSiteSchema && <Script id="WebSiteSchema" type="application/ld+json" dangerouslySetInnerHTML={webSiteSchema} strategy="beforeInteractive" />}
      {organizationSchema && <Script id="OrganizationSchema" type="application/ld+json" dangerouslySetInnerHTML={organizationSchema} strategy="beforeInteractive" />}
      {webPageSchema && <Script id="WebPageSchema" type="application/ld+json" dangerouslySetInnerHTML={webPageSchema} strategy="beforeInteractive" />}
      {articleSchema && <Script id="ArticleSchema" type="application/ld+json" dangerouslySetInnerHTML={articleSchema} strategy="afterInteractive" />}
      {breadcrumbSchema && <Script id="BreadcrumbListSchema" type="application/ld+json" dangerouslySetInnerHTML={breadcrumbSchema} strategy="afterInteractive" />}
      {tocSchema && (<Script id="TableOfContentsSchema" type="application/ld+json" dangerouslySetInnerHTML={tocSchema} strategy="afterInteractive" />)}
      {howToSchema && (<Script id="HowToSchema" type="application/ld+json" dangerouslySetInnerHTML={howToSchema} strategy="afterInteractive" />)}
      {softwareApplicationSchema && (<Script id="SoftwareApplicationSchema" type="application/ld+json" dangerouslySetInnerHTML={softwareApplicationSchema} strategy="afterInteractive" />)}
      {faqSchema && (<Script id="FAQSchema" type="application/ld+json" dangerouslySetInnerHTML={faqSchema} strategy="afterInteractive" />)}
    </>
  );
}
