export const complexTable = {
    title: "Complex Table",
    name: "complexTable",
    type: "object",
    fields: [
      {
        name: "rows",
        title: "Rows",
        type: "array",
        of: [
          {type: "table"}
        ],
      }
    ]
  };
  
  export const tableRow = {
    title: "Table Row",
    name: "tableRow",
    type: "object",
    fields: [
      {
        name: "cells",
        title: "Cells",
        type: "array",
        of: [
          {
            type: "block",
            styles: [],  // Customize based on needs
            marks: {
              decorators: [{title: "Strong", value: "strong"}, {title: "Emphasis", value: "em"}],
              annotations: [
                {
                  name: 'Link',
                  type: 'object',
                  title: 'URL',
                  fields: [
                    {
                      name: 'href',
                      type: 'url',
                      title: 'URL'
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  };
  