import {
  Edit as EditIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

export const freeResources = {
  name: "freeResources",
  title: "Free Resources",
  type: "document",
  groups: [
    { name: 'content', default: true, title: 'Content', icon: EditIcon },
    { name: 'schema', title: 'Schema Data', icon: SettingsIcon },
    { name: 'display', title: 'Display Settings', icon: ImageIcon },
    { name: 'seo', title: 'SEO', icon: TagIcon }, // New SEO group

    { name: 'others', title: 'Others', icon: TagIcon },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'resourceType',
      media: 'mainImage'
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled',
        subtitle: subtitle ? `Type: ${subtitle}` : 'No type set',
        media
      };
    }
  },
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      description: "Add keywords that describe this resource (for search engines)"
    },
    {
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      group: "seo",
      description: "Optional SEO-specific description (defaults to overview if empty)"
    },
    {
      name: "accessibility",
      title: "Accessibility Information",
      type: "object",
      group: "seo",
      fields: [
        {
          name: "altText",
          title: "Default Alt Text",
          type: "text",
          description: "Descriptive text for screen readers"
        },
        {
          name: "transcript",
          title: "Transcript",
          type: "text",
         

          description: "For audio/video content, provide a transcript",
          hidden: ({ document }) => document?.resourceFormat !== 'video'
        }
      ]
    },
    {
      name: "overview",
      title: "Overview",
      type: "text",
      group: "content",
      description: "Short description of the resource",
    },
   // Updated Sanity schema fields for resources
{
  name: "resourceLinkType",
  title: "Resource Access Type",
  type: "string",
  group: "content",
  options: {
    list: [
      { title: "Direct Upload", value: "direct" },
      { title: "External Link", value: "external" },
    ],
  },
  initialValue: "direct",
  validation: (Rule) => Rule.required(),
},
{
  name: "resourceFormat",
  title: "Resource Format",
  type: "string",
  group: "content",
  options: {
    list: [
      { title: "Image", value: "image" },
      { title: "Video", value: "video" },
      { title: "Text/Prompts", value: "text" },
      { title: "Documents", value: "document" },
    ],
  },
  description: "Select the format of your resource",
  hidden: ({ document }) => document?.resourceLinkType === 'external',
  validation: (Rule) => Rule.required().error("Please select a resource format"),
},
{
  name: "resourceType",
  title: "Resource Type Label",
  type: "string",
  group: "content",
  description: "Enter a custom label for this resource (e.g., 'eBook', 'Template', 'Cheatsheet', etc.)",
  validation: (Rule) => Rule.required(),
},
{
  name: "resourceFile",
  title: "Resource File",
  type: "file",
  group: "content",
  options: {
    storeOriginalFilename: true,
  },
  description: "Upload your resource file based on the selected format",
  hidden: ({ document }) =>
    document?.resourceLinkType === 'external' || document?.resourceFormat === 'text',
  validation: (Rule) =>
    Rule.custom((file, context) => {
      const format = context?.document?.resourceFormat;

      if (!file) return true; // Handled by required rule elsewhere

      const filename = file?.asset?._ref || '';
      const ext = filename.split('.').pop();

      const allowedExtensions = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
        video: ['mp4', 'webm', 'mov', 'avi'],
        document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
      };

      if (format && allowedExtensions[format]) {
        const isValid = allowedExtensions[format].some((allowed) =>
          filename.toLowerCase().includes(allowed)
        );
        return isValid ? true : `File format does not match selected resource format (${format})`;
      }

      return true;
    }),
},

{
  name: "promptContent",
  title: "Prompt Content",
  type: "array",
  group: "content",
  of: [
    {
      type: "object",
      name: "promptItem",
      fields: [
        {
          name: "promptTitle",
          title: "Prompt Title",
          type: "string",
        },
        {
          name: "promptText",
          title: "Prompt Text",
          type: "text",
          rows: 10,
        }
      ]
    }
  ],
  description: "Add one or more prompts with titles",
  hidden: ({ document }) => document?.resourceFormat !== 'text',
},
{
  name: "resourceLink",
  title: "External Resource Link",
  type: "url",
  group: "content",
  validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
  description: "Link to download or access external resource if not uploaded directly.",
  hidden: ({ document }) => document?.resourceLinkType === 'direct',
},
{
  name: "previewSettings",
  title: "Preview Settings",
  group: "content",
  type: "object",
  description: "How the resource should be displayed in the preview card",
  fields: [
    {
      name: "useCustomPreview",
      title: "Use Custom Preview",
      type: "boolean",
      initialValue: false,
      description: "If enabled, you can use a custom image for preview",
    },
    {
      name: "previewImage",
      title: "Custom Preview Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Alternative text for accessibility and SEO',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption that can appear with the image',
        },
      ],
      description: "Use this to display a custom image instead of showing the file content directly.",
      hidden: ({ parent }) => !parent?.useCustomPreview,
    }
  ],
},   
   
    {
      name: "isHomePageFeature",
      title: "Feature on Homepage",
      type: "boolean",
      group: "display",
      initialValue: false,
    },
    {
      name: "isOwnPageFeature",
      title: "Feature on Free Resources Page",
      type: "boolean",
      group: "display",
      initialValue: false,
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      group: "others",
      of: [{ type: "string" }],
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "others",
    },
    {

      name: "relatedArticle",
    
      title: "Related Article",
    
      type: "reference",
    
      group: "content",
    
      to: [
    
        { type: "blog" },
    
        { type: "aitool" },
    
        { type: "seo" },
    
        { type: "coding" },
    
        { type: "makemoney" },
    
        // Add other content types as needed
    
      ],
    
      description: "Link to the article this resource is related to (if any)",
    
    },
    
  ]
};