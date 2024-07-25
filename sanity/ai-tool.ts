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
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
      },
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
        name: "overview",
        title: "overview",
        type: "string",
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
          type: "array", 
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
      name: "tableOfContents",
      title: "Table of Contents",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "heading",
              title: "Heading",
              type: "string",
            },
            {
              name: "subheadings",
              title: "Subheadings",
              type: "array",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
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
      name: "faqs",
      title: "FAQ's",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
            },
            {
              name: "answer",
              title: "Answer",
              type: "string",
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
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    },
    
  ],
};
