import { validationRules } from '../validation/rule';

export const imageFields = {
  basic: [
    {
      name: "alt",
      title: "Alternative Text",
      type: "string",
      validation: Rule => Rule
        .required()
        .min(validationRules.image.alt.min)
        .max(validationRules.image.alt.max)
        .warning('Alt text is important for accessibility')
    }
  ],
  extended: [
    {
      name: "caption",
      title: "Caption",
      type: "string"
    },
    {
      name: "credit",
      title: "Credit",
      type: "string"
    },
    {
      name: "imageDescription",
      title: "Extended Description",
      type: "array",
      of: [{ type: "block" }]
    }
  ]
};
