export const seo = {
    name: "seo",
    title: "SEO",
    type: "document",
    fields: [
      {
        name: "title",
        title: "Title",
        type: "string",
        description: "title of makemoney",
      },
      {
        name: "dataTables",
        title: "Data Tables",
        type: "table", // This refers to the table type provided by @sanity/table
        options: {
          // Options if any
        },
      },
      {
        name: "overview",
        title: "overview",
        type: "string",
      },
      {
        name: "slug",
        type: "slug",
        title: "Slug",
        options: {
          source: "title",
        },
      },
  
      {
        name: "content",
        type: "array",
        title: "Content",
        of: [
          {
            type: "block",
          },
          {
            type: "table", //
          },
          {
            name: "button",
            type: "object",
            title: "Button",
            fields: [
              {
                name: "text",
                type: "string",
                title: "Text",
              },
              {
                name: "link",
                type: "url",
                title: "Link",
              },
            ],
          },
          {
            type: "image",
            fields: [
              {
                type: "text",
                name: "alt",
                title: "Alternative Text",
              },
            ],
          },
        ],
      },
      {
        name: "mainImage",
        title: "Main Image",
        type: "image",
        options: {
          hotspot: true,
        },
      },
      
  
      {
        name: "isHomePageTrendBig",
        title: "isHomePageTrendBig",
        type: "boolean",
      },
      {
        name: "isHomePageFeatureBig",
        title: "isHomePageFeatureBig",
        type: "boolean",
      },
      {
        name: "isHomePageTrendRelated",
        title: "isHomePageTrendRelated",
        type: "boolean",
      },
      {
        name: "isHomePageFeatureRelated",
        title: "isHomePageFeatureRelated",
        type: "boolean",
      },
      {
        name: "isHomePageSeoTrendBig",
        title: "isHomePageSeoTrendBig",
        type: "boolean",
      },
      {
        name: "isHomePageSeoTrendRelated",
        title: "isHomePageSeoTrendRelated",
        type: "boolean",
      },
      {
        name: "isOwnPageFeature",
        title: "isOwnPageFeature",
        type: "boolean",
      },
      {
        name: "isRecent",
        title: "isRecent",
        type: "boolean",
      },
     
      {
        name: "isAllBlog",
        title: "isAllBlog",
        type: "boolean",
      },
     
      
    
      
      {
        name: "isAiEarn",
        title: "isAiEarn",
        type: "boolean",
      },
     
     
      
      {
        name: "publishedAt",
        title: "Published at",
        type: "datetime",
      },
      {
        name: "tableOfContents",
        title: "Table of Contents",
        type: "array",
        of: [{ type: "string" }],
      },
    ],
  };
  