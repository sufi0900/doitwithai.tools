// components/StructuredData.js
import React from 'react';
import Head from 'next/head';
import { generateStructuredData } from './seoUtils';

const StructuredData = ({ resources = [] }) => {
  const structuredDataItems = resources
    .filter(resource => resource.structuredData && resource.structuredData !== 'none')
    .map(resource => generateStructuredData(resource));
  
  if (structuredDataItems.length === 0) return null;
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredDataItems.length === 1 
              ? structuredDataItems[0] 
              : {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  "itemListElement": structuredDataItems.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": item
                  }))
                }
          )
        }}
      />
    </Head>
  );
};

export default StructuredData;