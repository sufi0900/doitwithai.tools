export const blog = {
  name: "blog",
  title: "Blog",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "title of blog",
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
      name: "isAiImageGen",
      title: "isAiImageGen",
      type: "boolean",
    },
    {
      name: "isAiVideoGen",
      title: "isAiVideoGen",
      type: "boolean",
    },
    {
      name: "isAiExtension",
      title: "isAiExtension",
      type: "boolean",
    },
    {
      name: "isAiEarn",
      title: "isAiEarn",
      type: "boolean",
    },
    {
      name: "isAiBlog",
      title: "isAiBlog",
      type: "boolean",
    },
    {
      name: "isAiBlogGen",
      title: "isAiLogoGen",
      type: "boolean",
    },
    {
      name: "isAiWebsiteBuilder",
      title: "isAiWebsiteBuilder",
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
