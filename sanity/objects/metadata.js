export const metadata = {
    name: "metadata",
    title: "Metadata",
    type: "object",
    fields: [
      {
        name: "readTime",
        title: "Read Time",
        type: "object",
        fields: [
          {
            name: "minutes",
            title: "Minutes",
            type: "number",
            validation: Rule => Rule.required().min(1).max(60)
          }
        ]
      },
      {
        name: "publishedAt",
        title: "Published Date",
        type: "datetime",
        options: {
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm',
          timeStep: 15,
          calendarTodayLabel: 'Today'
        }
      },
      {
        name: "tags",
        title: "Tags",
        type: "array",
        of: [{
          type: "object",
          fields: [
            {
              name: "name",
              title: "Tag Name",
              type: "string",
              validation: Rule => Rule.required()
            },
            {
              name: "link",
              title: "Custom Link",
              type: "url"
            }
          ]
        }]
      }
    ]
  };
  