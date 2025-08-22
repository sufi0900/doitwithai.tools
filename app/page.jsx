import React from 'react'
import Script from "next/script";
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
const page = () => {
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
        }
      ]
    })
  };
}

function faqSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is doitwithai.tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "doitwithai.tools is your go-to resource hub for mastering AI tools that boost SEO performance, enhance productivity, and provide free AI resources for creators, marketers, and developers."
          }
        },
        {
          "@type": "Question",
          "name": "Are the AI resources really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We offer 50+ completely free AI resources including templates, prompts, guides, and tools to help you get started with AI without any cost."
          }
        },
        {
          "@type": "Question",
          "name": "How can AI improve my SEO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI can revolutionize your SEO through automated keyword research, content optimization, technical SEO analysis, and data-driven insights that help you achieve better rankings with less manual effort."
          }
        }
      ]
    })
  };
}
  return (
    <div>


        
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        key="breadcrumb-jsonld"
        strategy="beforeInteractive"
      />

      <Script
        id="FAQSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema()}
        key="faq-jsonld"
        strategy="beforeInteractive"
      />
    </div>
  )
}

export default page