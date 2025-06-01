// app/faq/page.tsx
import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import FAQComponent from './FAQClient';
import { faqsData } from './faqs'; // Import the centralized data

export const metadata = {
  title: "Frequently Asked Questions - Do it with AI tools",
  description:
    "Get answers to your frequently asked questions about doitwithai.tools. Discover how our AI tools boost productivity & improve your SEO & digital presence",
  author: "Sufian Mustafa",
  openGraph: {
    images: '',
  },
  keywords:
    "AI FAQ, AI tools FAQ, artificial intelligence questions, AI SEO questions, AI resources FAQ, AI monetization FAQ"
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
    __html: JSON.stringify({ // Use JSON.stringify for cleaner generation
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    }, null, 2) // Pretty print for readability
  };
}

export default function FAQPage() {
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.author} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta name="keywords" content={metadata.keywords} />
        <link rel="canonical" href="https://www.doitwithai.tools/faq" />
      </Head>

      {/* JSON-LD Schema */}
       <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchemaMarkup()}
        strategy="afterInteractive"
      />

      {/* Client Component with all interactivity */}
      <FAQComponent />
    </>
  );
}
