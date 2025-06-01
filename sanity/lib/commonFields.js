// schemas/objects/commonFields.js

export const metaValidation = {
  max: 160,
  warning: length => `Should be under 160 characters for SEO (current: ${length})`
};

export const titleValidation = {
  max: 70,
  warning: length => `Should be under 70 characters for optimal display (current: ${length})`
};

export const commonImageFields = [
  {
    name: "alt",
    title: "Alternative Text",
    type: "text",
    rows: 3,
    description: "Brief, descriptive text for accessibility (max 125 characters)",
    validation: Rule => Rule.max(125).warning('Alt text should be concise')
  },
  {
    name: "imageDescription",
    title: "Image Description",
    type: "array",
    of: [{ type: "block" }],
    description: "Extended description for complex images"
  }
];