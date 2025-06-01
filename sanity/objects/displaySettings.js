export const displaySettings = {
    name: "displaySettings",
    title: "Display Settings",
    type: "object",
    groups: [
      { name: 'homepage', title: 'Homepage Settings' },
      { name: 'layout', title: 'Layout Settings' }
    ],
    fields: [
      {
        name: "homepageSettings",
        type: "object",
        group: 'homepage',
        fields: [
          {
            name: "isHomePageTrendBig",
            title: "Show as Big Trend",
            type: "boolean",
            description: "Display as a featured trend on homepage"
          },
          {
            name: "isHomePageFeatureBig",
            title: "Show as Big Feature",
            type: "boolean",
            description: "Display as a featured article on homepage"
          },
          {
            name: "isHomePageTrendRelated",
            title: "Show in Related Trends",
            type: "boolean"
          },
          {
            name: "isHomePageFeatureRelated",
            title: "Show in Related Features",
            type: "boolean"
          }
        ]
      },
      {
        name: "seoSettings",
        type: "object",
        group: 'layout',
        fields: [
          {
            name: "isHomePageSeoTrendBig",
            title: "Show as Big SEO Trend",
            type: "boolean"
          },
          {
            name: "isHomePageSeoTrendRelated",
            title: "Show in Related SEO Trends",
            type: "boolean"
          },
          {
            name: "isOwnPageFeature",
            title: "Feature on Own Page",
            type: "boolean"
          }
        ]
      }
    ]
  };