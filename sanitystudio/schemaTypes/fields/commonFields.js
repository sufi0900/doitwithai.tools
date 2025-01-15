// schemas/fields/commonFields.js
import { defineField } from 'sanity';

export const metaField = (name, title) => defineField({
  name,
  title,
  type: 'string',
  validation: Rule => Rule.max(160).warning('Should be under 160 characters')
});

export const booleanField = (name, title) => defineField({
  name,
  title,
  type: 'boolean',
  initialValue: false,
  group: 'visibility'
});

export const imageFields = [
  defineField({
    name: "alt",
    title: "Alternative Text",
    type: "string",
    validation: Rule => Rule.required().max(125),
    description: "Required for accessibility. Keep it under 125 characters."
  }),
  defineField({
    name: "imageDescription",
    title: "Image Description",
    type: "array",
    of: [{ type: "block", styles: [], lists: [] }],
    description: "Extended image description with basic formatting."
  })
];