import React from 'react';
import Script from 'next/script';
import { NextSeo } from "next-seo";
import FAQComponent from './FAQClient';
import { faqsData } from './faqs'; // Import the centralized data
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
  title: "Frequently Asked Questions about Our AI Platform | doitwithai.tools",
  description: "Find quick and clear answers to frequently asked questions about our AI tools, resources, and platform. Your AI inquiries, solved.",
  author: "Sufian Mustafa",
  keywords: "AI FAQ, AI tools FAQ, artificial intelligence questions, AI SEO questions, AI resources FAQ, AI monetization FAQ",
  openGraph: {
    title: "Frequently Asked Questions about Our AI Platform | doitwithai.tools",
    description: "Find clear and concise answers to the most common questions about our platform and AI tools.",
    images: [{
      url: generateOGImageURL({
        title: 'Find quick, clear answers to your most common questions about our AI platform and tools.',
        // description field is removed
        category: 'FAQ',
        ctaText: 'Explore the Answers',
        features: 'Quick Answers,AI Tools,SEO,Resources',
      }),
      width: 1200,
      height: 630,
      alt: 'FAQ page with questions and answers',
    }],
    url: `${getBaseUrl()}/faq`,
    type: 'website',
    siteName: 'doitwithai.tools',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Frequently Asked Questions about Our AI Platform | doitwithai.tools",
    description: "Find quick and clear answers to frequently asked questions about our AI tools, resources, and platform.",
    image: generateOGImageURL({
      title: 'Find quick, clear answers to your most common questions about our AI platform and tools.',
      // description field is removed
      category: 'FAQ',
      ctaText: 'Explore the Answers',
      features: 'Quick Answers,AI Tools,SEO,Resources',
    }),
  },
  robots: "index, follow",
  alternates: {
    canonical: `${getBaseUrl()}/faq`,
  },
};

// Schema JSON-LD
function faqSchemaMarkup() {
  const mainEntity = faqsData.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    }, null, 2)
  };
}

function breadcrumbSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${getBaseUrl()}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "FAQ",
          "item": `${getBaseUrl()}/faq`
        }
      ]
    }, null, 2)
  };
}

export default function FAQPage() {
  return (
    <>
    <Head>
      <NextSeo
        title={metadata.title}
        description={metadata.description}
        canonical={metadata.alternates.canonical}
        openGraph={{
          title: metadata.openGraph.title,
          description: metadata.openGraph.description,
          url: metadata.openGraph.url,
          type: metadata.openGraph.type,
          siteName: metadata.openGraph.siteName,
          locale: metadata.openGraph.locale,
          images: metadata.openGraph.images,
        }}
        twitter={{
          card: metadata.twitter.card,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.image,
        }}
        additionalMetaTags={[
          { name: 'keywords', content: metadata.keywords },
          { name: 'author', content: metadata.author },
          { name: 'robots', content: metadata.robots },
        ]}
      />
</Head>
      {/* JSON-LD Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchemaMarkup()}
        strategy="afterInteractive"
      />

      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        strategy="afterInteractive"
      />

      {/* Client Component with all interactivity */}
      <FAQComponent />
    </>
  );
}