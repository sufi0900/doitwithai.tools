//Fully SEO-Optimized Parent Page for AiToolSlugPage component
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import AiToolSlugPageCode from "./code";
import { client } from "@/sanity/lib/client";
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = false;
export const dynamic = "force-dynamic";

async function getData(slug) {
  const query = `*[_type == "aitool" && slug.current == "${slug}"][0]{
    ...,
    "estimatedReadingTime": length(pt::text(content)) / 250
  }`;
  const data = await client.fetch(query, {}, { 
    cache: 'no-store', 
    next: { tags: ['makemoney', slug] } 
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
  
  return {
    title: `${data.metatitle} | DoItWithAI.tools`,
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
      canonical: `https://www.doitwithai.tools/ai-tools/${params.slug}`,
    },
    openGraph: {
      type: 'article',
      title: data.metatitle,
      description: data.metadesc,
      url: `https://www.doitwithai.tools/ai-tools/${params.slug}`,
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

  // Enhanced Schema Markup Functions
  function generateBlogPostingSchema() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#blogposting`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "headline": data.metatitle,
        "name": data.schematitle || data.metatitle,
        "description": data.schemadesc || data.metadesc,
        "datePublished": data.publishedAt,
        "dateModified": data._updatedAt || data.publishedAt,
        "author": {
          "@type": "Person",
          "@id": "https://www.doitwithai.tools/author/sufian-mustafa#person",
          "name": "Sufian Mustafa",
          "url": "https://www.doitwithai.tools/author/sufian-mustafa",
          "sameAs": [
            "https://twitter.com/sufianmustafa",
            "https://linkedin.com/in/sufianmustafa"
          ]
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.doitwithai.tools#organization",
          "name": "DoItWithAI.tools",
          "url": "https://www.doitwithai.tools",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.doitwithai.tools/logo.png",
            "width": 512,
            "height": 512
          }
        },
        "image": imageUrl ? {
          "@type": "ImageObject",
          "url": imageUrl,
          "width": 1200,
          "height": 630,
          "caption": data.mainImage?.alt || data.metatitle
        } : undefined,
        "url": canonicalUrl,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.doitwithai.tools#website"
        },
        "wordCount": data.estimatedReadingTime ? Math.round(data.estimatedReadingTime * 250) : undefined,
        "keywords": data.tags?.map(tag => tag.name).join(", ") || "",
        "articleSection": "AI Tools",
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "ReadAction",
          "target": [canonicalUrl]
        }
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
          "acceptedAnswer": {
            "@type": "Answer",
            "@id": `${canonicalUrl}#faq-answer-${index + 1}`,
            "text": faq.answer
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
        "name": "DoItWithAI.tools",
        "alternateName": "Do It With AI Tools",
        "description": "Discover AI tools, learn AI coding, master AI SEO, and access free AI resources to boost productivity and profitability with artificial intelligence.",
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
        "name": "DoItWithAI.tools",
        "alternateName": "Do It With AI Tools",
        "url": "https://www.doitwithai.tools",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.doitwithai.tools/logo.png",
          "width": 512,
          "height": 512
        },
        "description": "Leading platform for AI tools, tutorials, and resources to help individuals and businesses leverage artificial intelligence effectively.",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Sufian Mustafa"
        },
        "sameAs": [
          "https://twitter.com/doitwithai",
          "https://facebook.com/doitwithai",
          "https://linkedin.com/company/doitwithai"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "contact@doitwithai.tools"
        }
      })
    };
  }

  function generateTableOfContentsSchema() {
    if (!data.tableOfContents || data.tableOfContents.length === 0) {
      return null;
    }

    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "headline": data.metatitle,
        "hasPart": data.tableOfContents.map((item, index) => ({
          "@type": "WebPageElement",
          "@id": `${canonicalUrl}#section-${index + 1}`,
          "name": item.heading,
          "url": `${canonicalUrl}#${item.heading.toLowerCase().replace(/\s+/g, '-')}`,
          "position": index + 1
        }))
      })
    };
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Basic Meta Tags */}
        <title>{data.metatitle} | DoItWithAI.tools</title>
        <meta name="description" content={data.metadesc} />
        <meta name="keywords" content={data.tags?.map(tag => tag.name).join(', ') || ''} />
        <meta name="author" content="Sufian Mustafa" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Content Classification */}
        <meta name="classification" content="Technology" />
        <meta name="category" content="AI Tools" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="DoItWithAI.tools" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={data.metatitle} />
        <meta property="og:description" content={data.metadesc} />
        <meta property="og:url" content={canonicalUrl} />
        {imageUrl && (
          <>
            <meta property="og:image" content={imageUrl} />
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

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@doitwithai" />
        <meta name="twitter:creator" content="@sufianmustafa" />
        <meta name="twitter:title" content={data.metatitle} />
        <meta name="twitter:description" content={data.metadesc} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content={canonicalUrl} />

        {/* Additional Meta Tags */}
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" type="application/rss+xml" title="DoItWithAI.tools RSS Feed" href="https://www.doitwithai.tools/rss.xml" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>

      {/* NextSeo Component */}
     

      {/* Enhanced Schema Markup Scripts */}
      <Script
        id="WebSiteSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateWebSiteSchema()}
        strategy="afterInteractive"
      />

      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateOrganizationSchema()}
        strategy="afterInteractive"
      />

      <Script
        id="BreadcrumbListSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateBreadcrumbSchema()}
        strategy="afterInteractive"
      />

      <Script
        id="BlogPostingSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={generateBlogPostingSchema()}
        strategy="afterInteractive"
      />

      {generateTableOfContentsSchema() && (
        <Script
          id="TableOfContentsSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={generateTableOfContentsSchema()}
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

      {/* Main Content */}
      <main role="main">
        <AiToolSlugPageCode data={data} params={params} />
      </main>
    </>
  );
}
