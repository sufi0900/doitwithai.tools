export const news = {
    name: "news",
    title: "News",
    type: "document",
    fields: [
      {
        name: "title",
        title: "Title",
        type: "string",
        description: "title of news",
      },
      {
        name: "metatitle",
        title: "Meta Title",
        type: "string",
      
        },
          {
          name: "metadesc",
          title: "Meta Description",
          type: "string",
          
        },
        {
          name: "schematitle",
          title: "Schema Title",
          type: "string",
          
        },
        {
          name: "schemadesc",
          title: "Schema Description",
          type: "string",
          
        },
      {
        name: "tags",
        title: "Tags",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "name",
                title: "Tag Name",
                type: "string",
              },
              {
                name: "link",
                title: "Custom Link",
                type: "url", 
              },
            ],
          },
        ],
      },
      
      {
        name: "readTime",
        title: "Read Time",
        type: "object",
        fields: [
         
          {
            name: "minutes",
            title: "Minutes",
            type: "number",
          },
         
        ],
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
        name: "tableOfContents",
        title: "Table of Contents",
        type: "array",
        
        of: [{ type: "string" }],
      },
      {
        name: "mainImage",
        title: "Main Image",
        type: "image",
        options: {
          hotspot: true,
        },
        fields: [
          {
            name: "alt",
            title: "Alternative Text",
            type: "string", 
            description: "Short alt text for the image, for accessibility."
          },
          {
            name: "imageDescription",
            title: "Image Description",
            type: "array", // Rich text array for detailed description
            of: [
              {
                type: "block",
             
                
              }
            ],
            description: "Extended image description that can include links and formatted text."
          }
        ]
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
            type: "table", 
          
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
              {
                name: "imageDescriptionOfBlockImg",
                title: "Image Description",
                type: "array", 
                of: [
                  {
                    type: "block",
                 
                    
                  }
                ],
                description: "Extended image description that can include links and formatted text."
              },
              {
                name: "url",
                title: "URL",
                type: "url",
                description: "Custom link for the image"
              },
            ],
          },
        ],
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
        name: "isHomePageNewsTrendBig",
        title: "isHomePageNewsTrendBig",
        type: "boolean",
      },
      {
        name: "isHomePageNewsTrendRelated",
        title: "isHomePageNewsTrendRelated",
        type: "boolean",
      },
      {
        name: "isOwnPageFeature",
        title: "isOwnPageFeature",
        type: "boolean",
      },
      
     
      {
        name: "publishedAt",
        title: "Published at",
        type: "datetime",
      },
      
    ],
  };
  