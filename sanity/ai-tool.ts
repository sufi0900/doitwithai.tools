export const aitool = {
    name: "aitool",
    title: "AiTool",
    type: "document",
    fields: [
      {
        name: "title",
        title: "Title",
        type: "string",
        description: "title of aitool",
      },
      {
        name: "tag",
        title: "Tag",
        type: "string",
        description: "tag of aitool",
      },
      {
        name: "dataTables",
        title: "Data Tables",
        type: "table", 
        options: {
         
        },
      },
      {
        name: "readTime",
        title: "Read Time",
        type: "object",
        fields: [
          {
            name: "hours",
            title: "Hours",
            type: "number",
          },
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
        name: "publishedAt",
        title: "Published at",
        type: "datetime",
      },
      {
        name: "category",
        title: "Category",
        type: "string",
        options
      : {
            list: [
             {title: "AI Image Generator", value: "ai-image-gen"},
             {title: "AI Video Generator", value: "ai-video-gen"},
         
            ]
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
        name: "metadesc",
        title: "Meta Description",
        type: "string",
        
      },
      {
        name: "schemadesc",
        title: "Schema Description",
        type: "string",
        
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
        name: "isHomePageAIToolTrendBig",
        title: "isHomePageAIToolTrendBig",
        type: "boolean",
      },
      {
        name: "isHomePageAIToolTrendRelated",
        title: "isHomePageAIToolTrendRelated",
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
        name: "isAiImageGen",
        title: "isAiImageGen",
        type: "boolean",
      },
      {
        name: "isAiImageGenBig",
        title: "isAiImageGenBig",
        type: "boolean",
      },
      {
        name: "isAiVideoGen",
        title: "isAiVideoGen",
        type: "boolean",
      },
      {
        name: "isAiVideoGenBig",
        title: "isAiVideoGenBig",
        type: "boolean",
      },
      {
        name: "isAiExtension",
        title: "isAiExtension",
        type: "boolean",
      },
  
      {
        name: "isAiExtensionBig",
        title: "isAiExtensionBig",
        type: "boolean",
      },

    
      {
        name: "isAiArticleGen",
        title: "isAiArticleGen",
        type: "boolean",
      },
      {
        name: "isAiArticleGenBig",
        title: "isAiArticleGenBig",
        type: "boolean",
      },
      {
        name: "isAiLogoGen",
        title: "isAiLogoGen",
        type: "boolean",
      },
      {
        name: "isAiLogoGenBig",
        title: "isAiLogoGenBig",
        type: "boolean",
      },
     
      {
        name: "isAiWebsiteBuilder",
        title: "isAiWebsiteBuilder",
        type: "boolean",
      },
      {
        name: "isAiWebsiteBuilderBig",
        title: "isAiWebsiteBuilderBig",
        type: "boolean",
      },

      {
        name: "tableOfContents",
        title: "Table of Contents",
        type: "array",
        of: [{ type: "string" }],
      },
    ],
  };
  