// app/ai-tools/[slug]/page.jsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { client } from "@/sanity/lib/client";
import { PageCacheProvider } from '@/React_Query_Caching/CacheProvider'; // Re-added!
import PageCacheStatusButton from "@/React_Query_Caching/PageCacheStatusButton"; // Re-added!
import ArticleChildComp from "@/app/ai-code/[slug]/code"; // Import the new reusable component
import { urlForImage } from "@/sanity/lib/image"; // For image URLs in metadata/schema
import Script from "next/script"; // For JSON-LD schema scripts
import Head from "next/head"; // For additional meta tags not covered by `metadata` export
import { NextSeo } from "next-seo"; // For NextSeo component (if still desired, though `metadata` is preferred in App Router)
import { redisHelpers } from '@/app/lib/redis'; // <--- UPDATED IMPORT: Use the helpers

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Revalidate every 1 hour

async function getData(slug) {
  const cacheKey = `article:aitool:${slug}`;
  
  try {
    // Use the helper function instead of manual JSON.parse
    const cachedData = await redisHelpers.get(cacheKey);
    if (cachedData) {
      return cachedData; // Already parsed by Upstash
    }
  } catch (redisError) {
    console.error(`Error accessing Redis for ${cacheKey}:`, redisError);
  }

  console.log(`[Sanity Fetch] for ${cacheKey}`);
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]{
    _id,
    title,
    slug,
    mainImage{
      asset->{
        _id,
        url
      },
      alt
    },
    publishedAt,
    _updatedAt,
    _createdAt,
    _type,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    overview,
    content[]{
      ...,
      _type == "image" => {
        asset->{
          _id,
          url
        },
        alt,
        caption,
        imageDescription[]{
          ...
        }
      },
      _type == "gif" => {
        asset->{
          _id,
          url
        },
        alt,
        caption
      },
      _type == "video" => {
        asset->{
          _id,
          url
        },
        alt,
        caption
      },
    },
    "wordCount": length(pt::text(content)),
    "estimatedReadingTime": round(length(pt::text(content)) / 250),
    "headings": content[_type == "block" && style in ["h1", "h2", "h3", "h4", "h5", "h6"]]{
      "text": pt::text(@),
      "level": style,
      "anchor": lower(pt::text(@))
    },
    faqs[]{
      question,
      answer
    },
    articleType,
    displaySettings
  }`;

  try {
    const data = await client.fetch(query, {}, { next: { tags: ['aitool', slug] } });
    
    if (data) {
      try {
        // Use the helper function instead of manual JSON.stringify
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
      } catch (redisSetError) {
        console.error(`Error setting Redis cache for ${cacheKey}:`, redisSetError);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Server-side fetch for slug ${slug} failed:`, error.message);
    return null;
  }
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
    keywords: data.tags?.map(tag => tag.name).join(',') || '',
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
  
  const canonicalUrl = `https://www.doitwithai.tools/ai-tools/${params.slug}`;
  const imageUrl = data.mainImage ? urlForImage(data.mainImage).url() : null;
  const readingTime = Math.ceil((data.wordCount || 1000) / 250);
  // Enhanced Schema Markup Functions
  function generateArticleSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "headline": data.metatitle,
        "name": data.schematitle || data.metatitle,
        "description": data.schemadesc || data.metadesc,
        "image": imageUrl ? {
          "@type": "ImageObject",
          "@id": `${canonicalUrl}#primaryimage`,
          "url": imageUrl,
          "contentUrl": imageUrl,
          "width": 1200,
          "height": 630,
          "caption": data.mainImage?.alt || data.metatitle
        } : undefined,
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "dateCreated": data.publishedAt,
        "author": {
          "@type": "Person",
          "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person",
          "name": "Sufian Mustafa",
          "url": "https://www.doitwithai.tools/author/sufian-mustafa",
          "image": {
            "@type": "ImageObject",
            "url": "https://www.doitwithai.tools/author-image.jpg",
            "width": 400,
            "height": 400
          },
          "sameAs": [
            "https://twitter.com/sufianmustafa",
            "https://linkedin.com/in/sufianmustafa"
          ],
          "jobTitle": "AI Tools Expert",
          "worksFor": {
            "@type": "Organization",
            "@id": "https://www.doitwithai.tools#organization"
          }
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization",
          "name": "Do It With AI Tools",
          "url": "https://www.doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.doitwithai.tools/logoForHeader.png",
            "width": 512,
            "height": 512
          }
        },
        "url": canonicalUrl,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.doitwithai.tools#website"
        },
        "wordCount": data.wordCount || Math.round(readingTime * 250),
        "keywords": data.tags?.map(tag => tag.name).join(", ") || "AI tools, artificial intelligence, productivity",
        "articleSection": "AI Tools",
        "articleBody": data.overview || data.metadesc,
        "inLanguage": "en-US",
        "copyrightYear": new Date(data.publishedAt).getFullYear(),
        "copyrightHolder": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization"
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "acquireLicensePage": "https://www.doitwithai.tools/license",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": [canonicalUrl]
          },
          {
            "@type": "ShareAction",
            "target": [canonicalUrl]
          }
        ],
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".overview", ".content"]
        },
        "about": {
          "@type": "Thing",
          "name": "Artificial Intelligence Tools",
          "description": "AI tools and resources for productivity and automation"
        },
        "mentions": data.tags?.map(tag => ({
          "@type": "Thing",
          "name": tag.name
        })) || []
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
              "@type": "CollectionPage",
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

  // FIXED: Table of Contents Schema
  function generateTableOfContentsSchema() {
    if (!data.tableOfContents || data.tableOfContents.length === 0) {
      return null;
    }

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonicalUrl}#tableofcontents`,
        "headline": data.metatitle,
        "hasPart": data.tableOfContents.map((item, index) => ({
          "@type": "WebPageElement",
          "@id": `${canonicalUrl}#section-${index + 1}`,
          "name": item.heading,
          "description": `Section ${index + 1}: ${item.heading}`,
          "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
          "position": index + 1,
          "isPartOf": {
            "@type": "Article",
            "@id": `${canonicalUrl}#article`
          }
        }))
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
            "author": {
              "@type": "Person",
              "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person"
            },
            "dateCreated": data.publishedAt,
            "upvoteCount": 0,
            "url": `${canonicalUrl}#faq-${index + 1}`
          },
          "dateCreated": data.publishedAt,
          "author": {
            "@type": "Person",
            "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person"
          }
        }))
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
        "description": "Do It With AI Tools is an AI-focused content hub empowering creators, developers, marketers, and entrepreneurs with accessible, actionable AI knowledge and resources to boost productivity and SEO.",
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
      <PageCacheProvider>
        <main>
                  <PageCacheStatusButton />
          
          <ArticleChildComp serverData={data} params={params} schemaType="aitool" />
        </main>
      </PageCacheProvider>
    </>
  );
}