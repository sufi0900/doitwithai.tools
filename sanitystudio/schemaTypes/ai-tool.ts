import { metaValidation, titleValidation, commonImageFields } from './objects/commonFields';
import {
  EditAttributes,
  Edit as EditIcon,
  Image as ImageIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

// Enhanced styling configurations
const STYLE_CONFIGS = {
  text: {
    rows: 3,
    styles: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      padding: '8px'
    }
  },
  groups: {
    content: { icon: EditIcon, color: '#3b82f6', hoverEffect: 'brightness(0.9)' },
    meta: { icon: ListIcon, color: '#10b981', hoverEffect: 'brightness(0.9)' },
    schema: { icon: SettingsIcon, color: '#6366f1', hoverEffect: 'brightness(0.9)' },
    display: { icon: ImageIcon, color: '#f59e0b', hoverEffect: 'brightness(0.9)' },
    others: { icon: TagIcon, color: '#8b5cf6', hoverEffect: 'brightness(0.9)' },
  },
};

// Enhanced validation messages
const VALIDATION_MESSAGES = {
  required: 'This field is required',
  url: 'Please enter a valid URL',
  maxLength: (length: number) => `Maximum length is ${length} characters`,
  minValue: (min: number) => `Minimum value is ${min}`,
  maxValue: (max: number) => `Maximum value is ${max}`
};

// Enhanced URL schemes with descriptions
const URL_SCHEMES = {
  http: { title: 'HTTP', description: 'Standard web protocol' },
  https: { title: 'HTTPS', description: 'Secure web protocol' },
  mailto: { title: 'Email', description: 'Email links' },
  tel: { title: 'Telephone', description: 'Phone number links' }
};

// Enhanced validation rules with better error messages
const createUrlValidation = (requiredField = false) => (Rule: { uri: (arg0: { scheme: string[]; }) => any; }) => {
  const baseRule = Rule.uri({
    scheme: Object.keys(URL_SCHEMES),
  }).error(VALIDATION_MESSAGES.url);
  return requiredField ? baseRule.required().error(VALIDATION_MESSAGES.required) : baseRule;
};

const createMaxLengthValidation = (maxLength: number, warningFn: (length: any) => string) => (Rule: { max: (arg0: any) => { warning: (arg0: any) => any; }; }) => 
  Rule.max(maxLength).warning(warningFn);

// Enhanced content blocks with additional styling
const contentBlocks = {
  block: {
    type: "block",
   
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong', icon: () => 'B' },
        { title: 'Emphasis', value: 'em', icon: () => 'I' },
        { title: 'Code', value: 'code', icon: () => '</>' },
        { title: 'Underline', value: 'underline', icon: () => 'U' },
        { title: 'Strike', value: 'strike-through', icon: () => 'S' }
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: createUrlValidation(true)
            },
            {
              name: 'blank',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: true
            }
          ]
        }
      ]
    }
  }
};

// Main SEO Schema with enhanced styling and organization
export const aitool = {
  name: "aitool",
  title: "AI Tools",
  type: "document",
  groups: [
    { name: 'content', default: true, title: 'Content', icon: STYLE_CONFIGS.groups.content.icon, description: 'Manage content fields' },
  { name: 'meta', title: 'SEO & Meta', icon: STYLE_CONFIGS.groups.meta.icon, description: 'Configure meta fields' },
  { name: 'schema', title: 'Schema Data', icon: STYLE_CONFIGS.groups.schema.icon, description: 'Edit schema markup' },
  { name: 'display', title: 'Display Settings', icon: STYLE_CONFIGS.groups.display.icon, description: 'Adjust display options' },
  { name: 'others', title: 'Others', icon: STYLE_CONFIGS.groups.others.icon, description: 'Miscellaneous settings' }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'metatitle',
      media: 'mainImage',
      status: 'status'
    },
    prepare({ title, subtitle, media, status }) {
      return {
        title: title || 'Untitled',
        subtitle: subtitle || 'No meta title set',
        media,
        description: status ? `Status: ${status}` : undefined
      };
    }
  },
  fields: [
    // Content Fields with enhanced styling
    {
      name: "title",
      title: "Title",
      type: "text",
      group: 'content',
      // validation: createMaxLengthValidation(titleValidation.max, titleValidation.warning),
      options: {
        ...STYLE_CONFIGS.text,
      }
    },
    {
      name: 'subcategory',
      title: 'Subcategory',
      type: 'reference',
      to: [{ type: 'seoSubcategory' }],
      group: 'display',
      validation: (Rule: { required: () => any; }) => Rule.required(),
      description: 'Select a subcategory for better organization',
      options: {
        disableNew: true
      }
    },
    {
      name: "slug",
      type: "slug",
      title: "URL Slug",
      group: 'content',
      options: {
        source: "title",
        maxLength: 196,
        slugify: (input: string) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .slice(0, 196),
    
      },
      validation: (Rule: { required: () => any; }) => Rule.required(),
      description: 'Unique URL-friendly slug'
    },
    {
      name: "overview",
      title: "Overview",
      type: "text",
      group: 'display',
      options: {
        ...STYLE_CONFIGS.text,
      },
      description: "Brief introduction to the article"
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "image",
      group: 'content',
      options: {
        hotspot: true,
        storeOriginalFilename: false,
        metadata: ['palette', 'dimensions'],
        accept: 'image/jpeg,image/png,image/webp',
        sources: ['webcam', 'upload', 'url'],
      },
      fields: [
        ...commonImageFields.filter((field) => field.name !== 'alt'), // Remove duplicate "alt" if it exists
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Alternative text for accessibility',
          validation: (Rule) => Rule.required()
        }
      ],
      validation: (Rule) => Rule.required(),
      preview: {
        select: {
          imageUrl: 'asset.url',
          title: 'caption',
        },
      },
    },
    
    // Enhanced Meta Fields
    {
      name: "metatitle",
      title: "Meta Title",
      type: "string",
      group: 'meta',
      // validation: createMaxLengthValidation(titleValidation.max, titleValidation.warning),
      description: "SEO title for search engines (max 70 characters)",
      options: {
        ...STYLE_CONFIGS.text,
      }
    },
    {
      name: "metadesc",
      title: "Meta Description",
      type: "text",
      group: 'meta',
      options: {
        ...STYLE_CONFIGS.text,
      },
      validation: createMaxLengthValidation(metaValidation.max, metaValidation.warning),
      description: "SEO description for search engines (max 160 characters)"
    },

    // Enhanced Schema Fields
    {
      name: "schematitle",
      title: "Schema Title",
      type: "string",
      group: 'schema',
      // validation: (Rule: { max: (arg0: number) => any; }) => Rule.max(titleValidation.max),
      options: {
        ...STYLE_CONFIGS.text,
      }
    },
    {
      name: "schemadesc",
      title: "Schema Description",
      type: "text",
      group: 'schema',
      options: {
        ...STYLE_CONFIGS.text,
      },
      // validation: (Rule: { max: (arg0: number) => any; }) => Rule.max(metaValidation.max)
    },

    // Enhanced Table of Contents
    {
      name: "tableOfContents",
      title: "Table of Contents",
      type: "array",
      group: 'display',
      of: [{
        type: "object",
        preview: {
          select: {
            title: 'heading',
            subtitle: 'subheadings'
          },
          prepare({ title, subtitle }) {
            return {
              title: title || 'No heading',
              subtitle: subtitle ? `${subtitle.length} subheadings` : 'No subheadings'
            };
          }
        },
        fields: [
          {
            name: "heading",
            title: "Heading",
            type: "string",
            validation: (Rule) => Rule.required(),
            options: {
              ...STYLE_CONFIGS.text,
            }
          },
          {
            name: "subheadings",
            title: "Subheadings",
            type: "array",
            of: [{
              type: "object",
              preview: {
                select: {
                  title: 'subheading',
                },
                prepare({ title }) {
                  return {
                    title: title || 'No subheading',
                  };
                }
              },
              fields: [
                {
                  name: "subheading",
                  title: "Subheading",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }
              ]
            }],
            options: {
              sortable: true
            }
          }
        ]
      }],
    
      options: {
        sortable: true
      }
    },

    // Enhanced Main Content
    {
      name: "content",
      type: "array",
      title: "Content",
      group: 'content',
      options: {
        editModal: 'fullscreen',
        layout: 'custom'
      },
      of: [
        contentBlocks.block,
        {
          type: "table",
          options: {
            backgroundColor: '#f9fafb'
          }
        },
        {
          name: "button",
          type: "object",
          title: "Button",
          preview: {
            select: {
              title: 'text',
              subtitle: 'link'
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'No text',
                subtitle: subtitle || 'No link set'
              };
            }
          },
          fields: [
            {
              name: "text",
              type: "string",
              title: "Button Text",
              validation: (Rule: { required: () => any; }) => Rule.required(),
              options: {
                ...STYLE_CONFIGS.text,
              }
            },
            {
              name: "link",
              type: "url",
              title: "Button Link",
              validation: (Rule: { required: () => { (): any; new(): any; uri: { (arg0: { scheme: string[]; }): any; new(): any; }; }; }) => 
                Rule.required().uri({ scheme: Object.keys(URL_SCHEMES) })
            },
            {
              name: "style",
              type: "string",
              title: "Button Style",
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' },
                  { title: 'Outline', value: 'outline' }
                ],
                layout: 'radio'
              }
            }
          ]
        },
        {
          type: "image",
          fields: [
            ...commonImageFields,
            {
              name: "url",
              title: "Custom URL",
              type: "url",
              description: "Optional link for the image",
              validation: createUrlValidation()
            }
          ],
          options: {
            hotspot: true,
            metadata: ['palette']
          }
        }
      ]
    },

    // Enhanced FAQs
    {
      name: "faqs",
      title: "FAQ's",
      type: "array",
      group: 'display',
      of: [{
        type: "object",
        preview: {
          select: {
            title: 'question',
            subtitle: 'answer'
          },
          prepare({ title, subtitle }) {
            return {
              title: title || 'No question',
              subtitle: subtitle || 'No answer provided'
            };
          }
        },
        fields: [
          {
            name: "question",
            title: "Question",
            type: "string",
            validation: (Rule: { required: () => any; }) => Rule.required(),
            options: {
              ...STYLE_CONFIGS.text,
            }
          },
          {
            name: "answer",
            title: "Answer",
            type: "text",
            options: {
              ...STYLE_CONFIGS.text,
            },
            validation: (Rule: { required: () => any; }) => Rule.required()
          }
        ]
      }],
      options: {
        sortable: true
      }
    },

    // Enhanced Display Settings
    {
      name: "displaySettings",
      title: "Display Settings",
      type: "object",
      group: 'display',
      options: {
        collapsible: true,
        collapsed: false,
        columns: 2
      },
      fields: [
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
          name: "isSeoPageFeature",
          title: "Enable for SEO Page",
          type: "boolean",
          description: "Toggle to enable this AI tool blog for SEO page display.",
        }
    ,    
    
        {
          name: "isOwnPageFeature",
          title: "isOwnPageFeature",
          type: "boolean",
        },
      ]
    },

    // Tags
    {
      name: "tags",
      title: "Tags",
      type: "array",
      group: 'others',
      of: [{
        type: "object",
        preview: {
          select: { title: 'name' }
        },
        fields: [
          {
            name: "name",
            title: "Tag Name",
            type: "string",
            validation: (Rule: { required: () => any; }) => Rule.required()
          },
          {
            name: "link",
            title: "Custom Link",
            type: "url",
            validation: createUrlValidation()
          }
        ]
      }]
    },

    // Article Metadata
    {
      name: "readTime",
      title: "Read Time",
      type: "object",
      group: 'others',
      fields: [
        {
          name: "minutes",
          title: "Minutes",
          type: "number",
          validation: (Rule: { required: () => { (): any; new(): any; min: { (arg0: number): { (): any; new(): any; max: { (arg0: number): any; new(): any; }; }; new(): any; }; }; }) => Rule.required().min(1).max(60),
          initialValue: 5
        }
      ]
    },
    {
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      group: 'others',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15
      },
      validation: (Rule: { required: () => any; }) => Rule.required(),
      initialValue: () => new Date().toISOString()
    }
  ],
  orderings: [
    {
      title: 'Publication Date, New',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
}



  
